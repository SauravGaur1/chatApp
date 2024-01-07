const moment = require('moment');
module.exports = function(sentby,text,roomid){
    // formatedData = {
    //     sentby,
    //     text,
    //     roomid,
    //     time: moment().format('h:mm a')
    // }
    formatedData = {
        sentby,
        text,
        roomid,
        time: Date.now()
    }
    return formatedData;
}