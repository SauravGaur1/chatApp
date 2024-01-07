const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const cookieParser = require('cookie-parser');
const cors = require('cors');

const databaseInit = require('./database/init');
const multer = require('multer')
const multerS3 = require('multer-s3');

const meassageModal = require('./database/messageModal');
const roomModal = require('./database/roomModel');
const userModal = require('./database/userModal');

const { getSingleRoom } = require('./controllers/users');

app.set('view engine', 'ejs');
app.use(
    cors({
        credentials: true,
        origin: "http://localhost:3001",
    })
);
app.use(express.static('views'));
app.use(express.static('public'));
app.use(express.static('raw'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const homeRoute = require('./routes/homeRoutes');
const loginRoute = require('./routes/login');
const usersRoute = require('./routes/users');

databaseInit();
app.use(cookieParser());


app.use('/', homeRoute);
app.use('/login', loginRoute);
app.use('/users', usersRoute);

io.on('connection', (socket) => {

    console.log('a user connected');

    socket.on('joinAllFriends', async (data) => {
        // console.log(data,'userId');
        let user = await userModal.findOne({ _id: data });
        let rooms = user.rooms;
        socket.userId = data;
        rooms.forEach(room => {
            socket.join(room.toString());
        })
        console.log('joined with all');
    });

    socket.on('message', async (message) => {
        console.log('vvv', message);
        socket.to(message.roomid).emit('message', message);

        let chatUser = await roomModal.findOne({ _id: message.roomid });
        let nameList = chatUser.roomname.split(',');
        if(nameList.length == 1){
            chatUser.roomname = nameList[0];
        }else{
            if (nameList[0] !== message.sendername) {
                chatUser.roomname = nameList[1];
                let user = await userModal.findOne({ _id: chatUser.members[1] })
                chatUser.profileUrl = user.profileUrl;
            } else {
                chatUser.roomname = nameList[0];
                let user = await userModal.findOne({ _id: chatUser.members[0] })
                chatUser.profileUrl = user.profileUrl;
            }
        }
        
        socket.to(message.roomid).emit('react-notify', chatUser);
        // socket.emit('react-notify',message);
        meassageModal.create(message);
        await roomModal.updateOne({ _id: message.roomid }, { lastMessage: message });
    });

    socket.on('disconnect', () => {
        // console.log('user disconnected');
    });

    socket.on('joinRoom', (roomId) => {
        // console.log(roomId);
        socket.join(roomId);
        socket.to(roomId).emit('indicate', 'Active in chat');
    });

    socket.on('joinWithFriend', async data => {
        // console.log('joind in ',data.toEmitFriend);
        socket.join(data.toEmitFriend);
        socket.to(data.toEmitFriend).emit('notify', data.message);
    });

    socket.on('getFriendsForGroupSelection', async (userid) => {
        let currentUser = await userModal.findOne({ _id: userid });
        let friends = currentUser.friends;
        friends = await userModal.find({ _id: { $in: friends } });
        socket.emit('friends', friends);
    });

    socket.on('createGroup', async (groupInfo) => {
        let newRoom = {
            memberCount: groupInfo.members.length,
            roomname: groupInfo.roomname,
            lastMessage: {},
            members: []
        }
        groupInfo.members.forEach(memberId => {
            newRoom.members.push(memberId);
        });
        newRoom = await roomModal.create(newRoom);
        groupInfo.members.forEach(async (memberId) => {
            await userModal.updateOne({ _id: memberId }, { $push: { rooms: newRoom._id } });
        });
        socket.emit('newRoomAdded', newRoom);
    })

    socket.on('updateProfile', async (data) => {
        // console.log(data);
        await userModal.updateOne({ _id: data.activeUserId }, { profileUrl: data.url });
    })

    socket.on('getActiveUser', async currentUserId => {
        let currentUser = await userModal.findOne({ _id: currentUserId });
        // console.log(currentUser);
        socket.emit('initilizeUser', currentUser);
    })

    socket.on('addImageToRoom', async (recMessage) => {
        // let message = await meassageModal.create(recMessage);
        socket.emit('mediaMessage', recMessage);
    }); 

});

server.listen(3000, () => {
    console.log("listning to port 3000");
})