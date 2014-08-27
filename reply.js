var mongoose = require('mongoose');
var request = require('request');

mongoose.connect('mongodb://localhost/bnw-talks');

var Reply = new mongoose.Schema({
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
	user: String,
  mentions: [String]
});

Reply.pre('save', function (next) {
  this.mentions = (this.text.match(/\@([\-0-9A-z]+)/ig) || []).map(function (mention) {
    return mention.replace(/^\@/, '');
  });

  var that = this;

  if (this.replyto) return next();

  request('https://bnw.im/api/show?message=' + this.id.split('/')[0], function (e, res, body) {
    if (!e && res.statusCode !== 200) {
      e = new Error ('BNW returned status code ' + res.statusCode);
      e.res = res;
    }

    if (e) {
      console.log(e);
      return next(e);
    }

    that.mentions.push(JSON.parse(body).messages[0].user);

    next();
  });
});

module.exports = mongoose.model('Reply', Reply);