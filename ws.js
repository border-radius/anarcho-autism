var WebSocket = require('ws');

function Socket (address, onmessage) {

	console.log('Connecting to', address, new Date());

	var E = function (e) {
		console.log(e);

		setTimeout(function () {
			Socket(address, onmessage);
		}, 1000);
	}

	var ws = new WebSocket(address);

	ws.on('message', onmessage);
	
	ws.on('close', E);
	ws.on('error', E);
};

module.exports = Socket;