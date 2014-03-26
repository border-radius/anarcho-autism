var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/bnw-talks');

module.exports = mongoose.model('Reply', {
	anonymous: Boolean,
	date: Number,
	id: String,
	message: String,
	num: Number,
	replyto: String,
	replytotext: String,
	text: String,
	user: String
});
