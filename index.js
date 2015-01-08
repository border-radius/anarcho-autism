var Reply = require('./reply');
var express = require('express');
var ws = require('./ws');

ws('wss://bnw.im/comments/ws', function (message, flags) {
	var reply = new Reply(JSON.parse(message));
	reply.save(function (e) {
		if (e) console.log(e);
	});
});

var app = express();

app.use(express.static(__dirname + '/app'));

(function (ctrl) {
	app.get('/for/:user', ctrl);
	app.get('/top', ctrl);
})(function (req, res) {
  res.sendfile(__dirname + '/app/index.html');
});

function getComments(query, skip, next) {
	query.sort({ date: -1	}).limit(20).skip(skip|0).exec(next);
}

app.get('/comments', function (req, res) {
	getComments(Reply.find(), req.param('skip'), function (e, replies) {
		if (e) return res.status(500).send();
		res.json(replies);
	});
});

app.get('/comments/:user', function (req, res) {
	getComments(Reply.find({ mentions: req.params.user }), req.param('skip'), function (e, replies) {
		if (e) return res.status(500).send();
		res.json(replies);
	});
});

app.get('/api/top', function (req, res) {
	Reply.aggregate([
		{
			$match: {
				date: {
					$gt: new Date()/1000 - 24 * 3600
				},
				replyto: {
					$ne: null
				}
			}
		},
		{
			$group: {
				_id: "$replyto",
				count: {
					$sum: 1
				}
			}
		},
		{
			$sort: {
				count: -1
			}
		},
		{
			$limit: 10
		}
	], function (e, replyto) {
		if (e) return res.status(500).send(e);
		Reply.find({
			id: {
				$in: replyto.map(function (reply) {
					return reply._id;
				})
			}
		}, function (e, replies) {
			if (e) return res.status(500).send(e);
			res.json(replies);
		})
	});
});

app.listen(8000);

console.log('Listening ', 8000, ' launched at ', new Date());
