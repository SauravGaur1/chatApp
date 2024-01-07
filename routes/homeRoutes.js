const express = require('express');
const router = express.Router();
const {homeFun,somethingfun} = require('../controllers/homeControllers');
const { upload } = require('../database/awsbucket');
const jwtVerify = require('../utils/jwtVerify');

router.get('/',jwtVerify,homeFun);
// router.get('/',homeFun);

router.get('/something',somethingfun);

router.post('/uploadProfilePic', upload.single('file'), async function (req, res, next) {
    
    res.json({ data: req.file.location})
    // console.log(req.file,".........");

})

router.post('/addChatImage', upload.single('file'), async function (req, res, next) {
    
    if(req.file)
        res.json({ data: req.file.location});
    else
        res.json({data:'/images/user.png'});
})

module.exports = router;