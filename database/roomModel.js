const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  memberCount: Number,
  roomname: String,
  profileUrl: String,
  lastMessage: {},
  members: []
});

const roomModal = mongoose.model('rooms', roomSchema);

module.exports = roomModal;