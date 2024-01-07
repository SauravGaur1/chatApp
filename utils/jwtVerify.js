const jwt = require('jsonwebtoken');
const SECRETKEY = 'thisisasecretkey_itmustbein_DOT_ENV_file';
module.exports = async (req,res,next)=>{
    const token = req.cookies.jwt;
    // console.log(token);
    if(token != undefined || token == ''){
        req.token = token;
        // const user = await jwt.verify(token,SECRETKEY);
        // req.user = user;
        try {
            const user = await jwt.verify(token,SECRETKEY);
            req.user = user;
            next();
        } catch (error) {
            console.log(error);
        }
    }else{
        res.render('login');
        // res.redirect('/login');
    }
};