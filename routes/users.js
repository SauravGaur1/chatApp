const express = require('express');
const router = express.Router();
const {getAllUsers,createRoom,getAllRoomsIds,getSingleRoom,getAllRooms,getRoomChat} = require('../controllers/users');
const userModal = require('../database/userModal');
const jwtVerify = require('../utils/jwtVerify');

router.get('/',jwtVerify,getAllUsers);

router.get('/friends',jwtVerify,getAllRoomsIds);

router.post('/getRooms',jwtVerify,getAllRooms);

router.post('/chat',jwtVerify,getRoomChat);

router.post('/getUserDetails',async (req,res)=>{
    let id = req.body.id;
    let user = await userModal.findOne({_id:id});
    res.json(user);
})

//room creation
router.get('/:id',jwtVerify,(req,res,next)=>{
    req.requestedId = req.params.id;
    next();
},createRoom);

//chatOpening room
router.post('/:id',jwtVerify,(req,res,next)=>{
    req.requestedId = req.params.id;
    next();
},getSingleRoom);




module.exports = router;