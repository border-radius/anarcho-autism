var WebSocket = require('ws');
var Reply = require('./reply');
var express = require('express');

var err = function (e) {
	if (e) console.log(e);
};

var initWS = function () {
	var ws = new WebSocket('wss://bnw.im/comments/ws');

	ws.on('message', function (message, flags) {
		var reply = new Reply(JSON.parse(message));
		reply.save(err);
	});
	
	ws.on('close', function () {
		setTimeout(initWS, 1000);
	});
};
initWS();

var app = express();

app.use(express.static(__dirname + '/app'));

app.get('/for/:user', function (req, res) {
  res.sendfile(__dirname + '/app/index.html');
});

(function (ctrl) {
	app.get('/comments', ctrl);
	app.get('/comments/:user', ctrl);
})(function (req, res) {
	((req.params.user) ? Reply.find({
		mentions: req.params.user
	}) : Reply.find()).
	sort({date: -1}).
	limit(20).
	skip(req.param('skip')|0).
	exec(function (e, replies) {
		if (e) return res.status(500).send();
		res.json(replies);
	});
});

app.listen(8000);

console.log('Listening ', 8000, ' launched at ', new Date());
