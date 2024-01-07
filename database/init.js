const mongoose = require('mongoose');

module.exports = async function init()
{
	await mongoose.connect('mongodb+srv://saurav:saurav88@cluster1.yue1n09.mongodb.net/chatMe');
	console.log("connected to db");
}