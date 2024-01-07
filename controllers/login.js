const userModal = require('../database/userModal');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRETKEY = 'thisisasecretkey_itmustbein_DOT_ENV_file';
const saltRounds = 10;

const loginFunction = (req,res)=>{
    if(!req.token)  return res.render('login');
    res.redirect('/');
}

const loginPostFunction = async (req,res)=>{
    console.log(req.url);
    console.log(req.body);
    let {username,password} = req.body;

    const user = await userModal.findOne({username});
    console.log('user =>', username);
    if(!user){
        //register part
        bcrypt.hash(password,saltRounds,async (err,hash)=>{

            password = hash;
            let userData = {
                username,
                password,
                rooms: []
            }
            let user = await userModal.create(userData);

            jwt.sign({_id: user._id, username: user.username},SECRETKEY,(err,token)=>{
                if(!token)  return res.json({status: 'error'});
                res.cookie('jwt',token);
                res.send({status: 'success', token, userId: user._id, username: user.username});
            });
            console.log("user logged in");
        });

    }else{
        //login part
        console.log('trying to login')
        bcrypt.compare(password,user.password,(err, result)=>{
            if(!result) return res.send({status: 'fail'}) 

            jwt.sign({_id: user._id, username: user.username},SECRETKEY,(err,token)=>{
                if(!token)  return res.json({status: 'error'});
                res.cookie('jwt',token);
                res.send({status: 'success', token, userId: user._id, username: user.username,profileUrl:user.profileUrl});
            });
            console.log("user logged in");
        });
    }
}

module.exports = {loginFunction,loginPostFunction};