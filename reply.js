var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/bnw-talks');

module.exports = mongoose.model('Reply', {
	anonymous: Boolean,
	date: Number,
	id: {
    type: String,
    index: {
      unique: true
    }
  },
	message: String,
	num: Number,
	replyto: String,
	replytotext: String,
	text: String,
	user: String
});
