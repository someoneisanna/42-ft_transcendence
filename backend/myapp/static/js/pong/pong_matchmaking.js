function initializeJS() {
	// alert('pong_matchmaking.js loaded');
	pongSocket.send(JSON.stringify({
		'type': 'matchmaking',
		'username': current_user
	}));
}

function startPongRemoteGame(data) {
	pongSocket.send(JSON.stringify({
		'type': 'join_pong_room',
		'room_name': data.room_name,
		'username': current_user
	}));
	pongRoomName = data.room_name;
	loadPage('/pong_game/', true);
}
