const userModal = require('../database/userModal');
const roomModal = require('../database/roomModel');
const messageModal = require('../database/messageModal');

const getAllUsers = async (req,res)=>{
    let currentUser = await userModal.findOne({_id:req.user._id});
    let allUsers = await userModal.find({});
    let filteredUsers = allUsers.filter((user,i)=>{
        // console.log(user);
        return currentUser.friends.indexOf(user._id) < 0;
    });
    res.json(filteredUsers);
}

const createRoom = async (req,res)=>{
    //requestedId is friendID with which the form is being created
    let user = await userModal.findOne({_id:req.requestedId});
    let currentUser = await userModal.findOne({_id:req.user._id});
    if(!user) return res.send({status:'fail'});
    
    await userModal.updateOne({_id:req.user._id},{ $push: {friends: req.requestedId} });
    await userModal.updateOne({_id:req.requestedId},{ $push: {friends: req.user._id} });
    
    const newRoom = {
        memberCount: 2,
        roomname: `${currentUser.username},${user.username}`,
        members: [req.user._id,req.requestedId]
    };
 
    let room = await roomModal.create(newRoom);
    if(!room) return res.send({status:'fail'});

    room.members.forEach((memberId)=>{
        userModal.updateOne({_id:memberId},{ $push: {rooms: room._id } },(err,result)=>{
            if(result){
                console.log("updated");
            }
        });
    });

    res.json(user);
}

const getAllRoomsIds = async (req,res)=>{
    let currentUser = await userModal.findOne({_id:req.user._id});
    if(!currentUser) return res.end('no user found');
    res.json(currentUser.rooms);
};

const getSingleRoom = async (req,res)=>{
    console.log(req.requestedId);
    let chatUser = await roomModal.findOne({_id: req.requestedId});
    // console.log(chatUser)
    if(!chatUser) return res.json({status:'fail'});
    let nameList = chatUser.roomname.split(',');
        if(nameList[0] == req.user.username){
            chatUser.roomname = nameList[1];
            let user = await userModal.findOne({_id:chatUser.members[1]})
            chatUser.profileUrl = user.profileUrl;
        }else{
            chatUser.roomname = nameList[0];
            let user = await userModal.findOne({_id:chatUser.members[0]})
            chatUser.profileUrl = user.profileUrl;
        }
    res.json({status:'success',user:chatUser});
}

const getAllRooms = async (req,res)=>{
    let roomsList = req.body;
    console.log('roomsList',roomsList);
     let list= [];
     for(let key of roomsList){
        let currRoom = await roomModal.findOne({_id:key});
        let nameList = currRoom.roomname.split(',');
        // console.log(nameList);
        if(nameList.length > 1){ // for non groups
            if(nameList[0] == req.user.username){
                currRoom.roomname = nameList[1];
                let user = await userModal.findOne({_id:currRoom.members[1]})
                currRoom.profileUrl = user.profileUrl;
            }else{
                currRoom.roomname = nameList[0];
                let user = await userModal.findOne({_id:currRoom.members[0]})
                currRoom.profileUrl = user.profileUrl;
                // console.log(currRoom);
            }
        }
        list.push(currRoom);
     }
    //  console.log(list);
     res.json(list);
     res.end();
}

const getRoomChat = async (req,res)=>{
    let {roomId} = req.body;
    let chatMessages = await messageModal.find({roomid:roomId});
    res.json(chatMessages);
}

module.exports = {getAllUsers,createRoom,getAllRoomsIds,getSingleRoom,getAllRooms,getRoomChat};

