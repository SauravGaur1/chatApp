let messageBox = document.getElementById('messageBox');
let chatSection = document.getElementById('chatSection');
let leftList = document.getElementById('leftList');
let newChat = document.getElementById('newChat');
let chatUserName = document.getElementById('chatUserName');
let mainRight = document.getElementById('mainRight');
let mainLeft = document.getElementById('mainLeft');
let userIndicator = document.getElementById('userIndicator');
let moreOptions = document.getElementById('moreOptions');
let closeDialog = document.getElementById('closeDialog');
let dialogBox = document.getElementById('dialogBox');
let groupFriendCont = document.querySelector('.centerPart');
let dialogContinue = document.getElementById('dialogContinue');
let groupName = document.getElementById('groupName');
let logout = document.getElementById('logout');
let activeRoomIcon = document.getElementById('activeRoomIcon');
let activeLocalName = localStorage.getItem('userName');;
let activeUserId = localStorage.getItem('userId');
let profileUrl = localStorage.getItem('profileUrl');
let indicator = document.getElementById('indicator');
let selectImage = document.getElementById('selectImage');
let activeUserImage = document.getElementById('activeUserImage');
let activeName = document.getElementById('activeName');
let emojiList = document.getElementById('emojiList');
let emojiIconPicker = document.getElementById('emojiIconPicker');
let toggleEmoji = document.getElementById('toggleEmoji');
let selectChatImage = document.getElementById('selectChatImage');
let tingSound = new Audio('ting.mp3');

let activeUser = null;

let EMOJI_API_URL = 'https://emoji-api.com/emojis?access_key=93b19c83bb3c0b059b1ef1c84c41397b49aff942';
let emojiData;

if (localStorage.getItem('emojis')) {
    emojiData = JSON.parse(localStorage.getItem('emojis'));
    emojiData.forEach(emoji => {
        let li = document.createElement('li');
        li.setAttribute('emoji-name', emoji.slug);
        li.textContent = emoji.character;
        emojiList.append(li);
    })
} else {
    fetchEmojis();
}

let checkBoxes;
let activeRoom;
let socket = io();

socket.emit('joinAllFriends', localStorage.getItem('userId'));

let user = {
    profileUrl,
    activeLocalName
}
socket.emit('getActiveUser', activeUserId);
// initilizeUser(user);
getAllFriends();

messageBox.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        
        let prevRoom;
        if (sessionStorage.getItem('activeRoom')) {
            prevRoom = JSON.parse(sessionStorage.getItem('activeRoom'));
            activeRoom = prevRoom.activeRoom;
        }
        console.log(emojiIconPicker.classList);
        if (emojiIconPicker.classList[0] == 'active' || emojiIconPicker.classList[1] == 'active')
            emojiIconPicker.classList.toggle('active');
        currentUserID = localStorage.getItem('userId');
        sendername = localStorage.getItem('userName');
        const message = formatMessage(currentUserID, messageBox.value, activeRoom, sendername);
        if (sessionStorage.getItem('activeRoom')) {
            addMessage(message, 'sent');
            socket.emit('message', message);
            let roomMembers = prevRoom.members;
            let toEmitFriend = activeRoom;
            let data = {
                message,
                toEmitFriend
            }
            socket.emit('joinWithFriend', data);
        }
        let room = document.getElementById(activeRoom);
        let lastMessage = (message.text).substring(0, 25) + '...' + message.time;
        if ((activeRoom != message.roomid && room) || !activeRoom) {
            room.children[2].children[0].style = 'display:inline';
        }
        if (room)
            room.children[1].children[1].innerText = lastMessage;
      
    }
})

newChat.addEventListener('click', (event) => {
    let request = new XMLHttpRequest();
    request.open('get', '/users');
    request.addEventListener('load', () => {
        // console.log(request.responseText);
        let list = JSON.parse(request.responseText);
        list.forEach(element => {
            // console.log(element._id != localStorage.getItem('userId'))
            if (element._id != localStorage.getItem('userId'))
                addUser(element, 'newChat');
        });
    });
    let currentStatus = newChat.getAttribute('src');
    if (currentStatus == '/images/chat_active.png') {
        //to get all rooms in which the users are connected
        leftList.innerHTML = '';
        indicator.innerText = 'Chats';
        getAllFriends();
        mainRight.style.display = 'flex !important';
        newChat.setAttribute('src', '/images/chat.png');
    } else {
        leftList.innerHTML = '';
        indicator.innerText = 'Add Friends';
        request.send();
        newChat.setAttribute('src', '/images/chat_active.png');
    }
});

leftList.addEventListener('click', (event) => {

    let id = event.target.id;
    if (event.target.getAttribute('class') == 'userModel') {
        let request = new XMLHttpRequest();
        request.open('get', `/users/${id}`);
        request.addEventListener('load', () => {
            let chatUser = JSON.parse(request.responseText);
            //work here!
            event.target.style.display = 'none';
            // chatUserName.innerText = chatUser.username;
        });
        request.send();
    } else {
        socket.emit('joinRoom', id);
        let request = new XMLHttpRequest();
        request.open('post', `/users/${id}`);
        request.addEventListener('load', () => {
            let response = JSON.parse(request.responseText);
            // console.log(response);
            let roomName = response.user.roomname;
            let memberCount = response.user.memberCount;
            let members = response.user.members;
            let profileUrl = response.user.profileUrl;
            getRoomChat(activeRoom, roomName, memberCount, profileUrl);
            sessionStorage.setItem('activeRoom', JSON.stringify({ activeRoom, roomName, memberCount, members, profileUrl }));
        });
        if (activeRoom != id) {
            request.send();
            activeRoom = id;
        }
        let room = document.getElementById(id);
        room.children[2].children[0].style = 'display:none';
    }
});

moreOptions.addEventListener('click', getFriendsForGroupSelection)
closeDialog.addEventListener('click', closeTheDialog)

dialogContinue.addEventListener('click', (event) => {

    if (!checkBoxes || !groupName.value) return;
    let groupMembers = [];
    checkBoxes.forEach((box) => {
        // console.log(box.checked);
        if (box.checked) {
            groupMembers.push(box.id);
        }
    });
    groupMembers.push(localStorage.getItem('userId'));
    let groupInfo = {
        members: groupMembers,
        roomname: groupName.value
    }
    socket.emit('createGroup', groupInfo);
    closeTheDialog();
});

logout.addEventListener('click', () => {
    activeRoom = '';
    if (localStorage.getItem('userId')) {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
    }
    if (sessionStorage.getItem('activeRoom')) {
        sessionStorage.removeItem('activeRoom');
    }
    document.cookie = 'jwt = ; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    window.location.reload();
})

selectImage.addEventListener('change', (event) => {
    // console.log(event.target.files);
    const files = event.target.files;
    const formData = new FormData();
    formData.append("file", files[0]);
    fetch("/uploadProfilePic", {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            document.getElementById('activeUserImage').setAttribute('src', data.data);
            socket.emit('updateProfile', { activeUserId, url: data.data });
        })
        .catch((error) => {
            console.error(error);
        });
});

selectChatImage.addEventListener('change', (event) => {

    console.log(event.target.files);
    const files = event.target.files;
    const formData = new FormData();
    formData.append("file", files[0]);
    let activeRoom = JSON.parse(sessionStorage.getItem('activeRoom'));
    // formData.append("message", message);
    fetch("/addChatImage", {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            let message = formatMessage(activeUserId, '', activeRoom.activeRoom, activeLocalName);
            message.imageUrl = data.data;
            socket.emit('addImageToRoom', message);

            if (sessionStorage.getItem('activeRoom')) {
                prevRoom = JSON.parse(sessionStorage.getItem('activeRoom'));
                currentRoom = prevRoom.activeRoom;
            }
        
            let toEmitFriend = currentRoom;
            let msgData = {
                message,
                toEmitFriend
            }
            socket.emit('joinWithFriend', msgData);
            socket.emit('message', message);
        })
        .catch((error) => {
            console.error(error);
        });
});

toggleEmoji.addEventListener('click', () => {
    emojiIconPicker.classList.toggle('active');
})

emojiList.addEventListener('click', (event) => {
    console.log('clicked', event.target.innerText);
    messageBox.value = messageBox.value + event.target.innerText;
})

function closeTheDialog() {
    dialogBox.style.display = 'none';
}

function openTheDialog() {
    dialogBox.style.display = 'flex';
}

function getFriendsForGroupSelection() {
    openTheDialog();
    if (localStorage.getItem('userId'))
        socket.emit('getFriendsForGroupSelection', localStorage.getItem('userId'));
}

function addUser(Modal, where) {
    let mainDiv = document.createElement('div');
    mainDiv.classList.add('userModel')
    mainDiv.setAttribute('id', Modal._id);

    if (where === 'newChat') {
        mainDiv.innerHTML = `<img class="userImage" src="/images/user.png" alt="">  
        <div class="userRightCont">
            <p>${Modal.username}</p>
            <p class="fadeText" >Start Conversation...</p>
        </div>`
        leftList.append(mainDiv);
    }
    else {
        mainDiv.innerHTML = `
        <div class="userInfo">
            <img class="userImage" src="/images/user.png" alt="">  
            <div class="userRightCont">
                <p>${Modal.username}</p>
                <p class="fadeText">Add to group...</p>
            </div>
        </div>
        <div class="action">
            <input id='${Modal._id}' class='checkBoxes' type="checkbox">
        </div>`
        groupFriendCont.append(mainDiv);
    }
}

function addRoom(Modal) {
    let mainDiv = document.createElement('div');
    mainDiv.classList.add('roomModel')
    mainDiv.setAttribute('id', Modal._id);
    let lastMessage = 'Start Conversation';
    if (Modal.lastMessage) {
        lastMessage = (Modal.lastMessage.text).substring(0, 25) + '...' + Modal.lastMessage.time;
    }
    let src = '/images/user.png';
    if (Modal.memberCount > 2) {
        src = '/images/group_icon.png'
    }
    if (Modal.profileUrl)
        src = Modal.profileUrl;
    mainDiv.innerHTML = `<img class="userImage" src=${src} alt="">  
    <div class="userRightCont">
        <p>${Modal.roomname}</p>
        <p class="fadeText" >${lastMessage}</p>
    </div>
    <div>
        <img style='display:none' src="images/notification.png" class="icons">
    </div>`
    leftList.append(mainDiv);
}

function getAllFriends() {
    let request = new XMLHttpRequest();
    request.open('get', '/users/friends');
    request.addEventListener('load', () => {
        let list = JSON.parse(request.responseText);
        let req = new XMLHttpRequest();
        req.open('post', '/users/getRooms');
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load', () => {
            // console.log(req.responseText);
            list = JSON.parse(req.responseText);
            // console.log(list);
            list.forEach(element => {
                addRoom(element);
            });
        });
        if (list.length > 0) {
            req.send(JSON.stringify(list));
            // console.log(list);
        }
        if (sessionStorage.getItem('activeRoom')) {
            let { activeRoom, roomName, memberCount, profileUrl } = JSON.parse(sessionStorage.getItem('activeRoom'));
            socket.emit('joinRoom', activeRoom);
            getRoomChat(activeRoom, roomName, memberCount, profileUrl);
        }
    });
    request.send();
}

function formatMessage(sentby, text, roomid, sendername) {
    let currentDate = new Date();
    let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
    formatedData = {
        sentby,
        text,
        roomid,
        time,
        sendername
    }
    return formatedData;
}

function addMessage(messageModal, type) {
    //here type means sent or recieved!
    let outerDiv = document.createElement('div');
    outerDiv.classList.add('chatContainer');
    if (messageModal.text != '') {
        let userName = document.createElement('p')
        if (type == 'sent') {
            outerDiv.classList.add('sentCont');
        } else {
            userName.innerText = messageModal.sendername;
            userName.style = "margin: 0; color: #009698; font-weight: bold;"
        }
        let chatMessage = document.createElement('div');
        chatMessage.classList.add('chatMessage');
        chatMessage.classList.add(type);
        let chatData = document.createElement('p');
        chatData.innerText = messageModal.text;
        chatData.classList.add('mssgData');
        let chatTime = document.createElement('p');
        chatTime.innerText = messageModal.time;
        chatTime.classList.add('mssgTime');
        chatMessage.append(chatData, chatTime);
        outerDiv.append(userName, chatMessage);
        chatSection.appendChild(outerDiv);
        messageBox.value = '';
    } else {
        let contClass = '';
        let sendername = '';
        if (type == 'sent') {
            contClass = 'sentCont';
            outerDiv.classList.add(contClass);
        } else {
            sendername = `<p style="margin: 0px; color: rgb(0, 150, 152); font-weight: bold;">${messageModal.sendername}</p>`
        }
        outerDiv.innerHTML = `
            ${sendername}
            <div class="chatMessage ${contClass ? 'sent' : ''}">
                <img src=${messageModal.imageUrl} class="mssgImage">
                <p class="mssgTime">${messageModal.time}</p>
            </div>
        `
        console.log('good');
        chatSection.appendChild(outerDiv);
    }
    chatSection.scrollTop = chatSection.scrollHeight;
}

function getRoomChat(roomId, roomName, memberCount, profileUrl) {
    chatSection.innerHTML = '';
    chatUserName.innerText = roomName;
    if (memberCount > 2) {
        activeRoomIcon.setAttribute('src', '/images/group_icon.png');
    } else {
        console.log(profileUrl);
        if (profileUrl != undefined) {
            activeRoomIcon.setAttribute('src', profileUrl);
        } else
            activeRoomIcon.setAttribute('src', '/images/user.png');
    }
    let currentUserID = localStorage.getItem('userId');
    let request = new XMLHttpRequest();
    request.open('post', '/users/chat');
    request.setRequestHeader('Content-Type', 'application/json');
    request.addEventListener('load', () => {
        let list = JSON.parse(request.responseText);
        list.forEach((message) => {
            if (message.sentby == currentUserID)
                addMessage(message, 'sent');
            else
                addMessage(message, 'recieved');
        });
    });
    request.send(JSON.stringify({ roomId }));
}

function initilizeUser(user) {
    activeUser = user;
    if (user.profileUrl != undefined) {
        activeUserImage.setAttribute('src', user.profileUrl);
    }
    activeName.innerText = activeLocalName;
}

function fetchEmojis() {
    fetch('https://emoji-api.com/emojis?access_key=93b19c83bb3c0b059b1ef1c84c41397b49aff942')
        .then(response => response.json())
        .then(data => {
            emojiData = data;
            localStorage.setItem('emojis', JSON.stringify(data));
            emojiData.forEach(emoji => {
                let li = document.createElement('li');
                li.setAttribute('emoji-name', emoji.slug);
                li.textContent = emoji.character;
                emojiList.append(li);
            })
        }).catch(error => {
            console.log(error);
        })
}

socket.on('message', (msg) => {
    let activeRoom;
    if (sessionStorage.getItem('activeRoom')) {
        activeRoom = JSON.parse(sessionStorage.getItem('activeRoom'));
    }
    // console.log(msg.roomid == activeRoom.activeRoom);
    if (activeRoom && msg.roomid == activeRoom.activeRoom) {
        // console.log('in');
        addMessage(msg, 'recieved');
    }
    // tingSound.play();
    // console.log(msg);
});

socket.on('indicate', data => {
    userIndicator.innerText = data;
});

socket.on('friends', data => {
    // console.log(data);
    if (!data) return;

    groupFriendCont.innerHTML = '';
    data.forEach((user) => {
        addUser(user, 'group');
    })

    checkBoxes = document.querySelectorAll('.checkBoxes');
    checkBoxes.forEach((box) => {
        // console.log(box);
        box.addEventListener('click', (event) => {
            // console.log(box.id, box.checked);
        });
    })

});

socket.on('notify', message => {
    let lastMessage = (message.text).substring(0, 25) + '...' + message.time;
    let room = document.getElementById(message.roomid);
    let activeRoom;
    if (sessionStorage.getItem('activeRoom')) {
        activeRoom = JSON.parse(sessionStorage.getItem('activeRoom'));
    }
    // console.log(message);
    if ((activeRoom && activeRoom.activeRoom != message.roomid && room) || !activeRoom) {
        room.children[2].children[0].style = 'display:inline';
    }
    if (room)
        room.children[1].children[1].innerText = lastMessage;
})

socket.on('initilizeUser', user => {
    initilizeUser(user);
});

socket.on('newRoomAdded', (newRoom) => {
    console.log(newRoom);
    addRoom(newRoom);
});

socket.on('mediaMessage', (message) => {
    console.log('message sent');
    if (message.sentby == activeUserId) {
        addMessage(message, 'sent');
    } else {
        addMessage(message, 'recieved');
    }
});

//if both the users got connected once then they get the soket emission in their common groups
//message recieved to user work after that line 336 replace test channel
// ** Both done :) **


// **tasks**
// add user name on top left  :) DONE :) + some bugs fixed!
// emoji Pack added ! :) 😀😃
// add group on socket listen (live) :) DONE :)
// send images in chat (Media Files)

// tasks

// getRooms mai dikkt h :(
