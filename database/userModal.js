const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String ,
  password: String,
  profileUrl: String,
  rooms: [],
  friends: []
});

const userModal = mongoose.model('users', userSchema);

module.exports = userModal;