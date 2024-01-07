const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  text: String,
  time: String,
  sentby: String,
  sendername: String,
  roomid: String,
  imageUrl: String
});

const meassageModal = mongoose.model('messages', messageSchema);

module.exports = meassageModal;