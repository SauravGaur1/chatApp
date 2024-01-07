let userModal = require('../database/userModal');


const homeFun = async (req,res)=>{
    console.log(req.url);
    res.render('home');
}

const somethingfun = (req,res)=>{
    res.end("something fucntion")
}

module.exports = {homeFun,somethingfun};

