function initializeJS() {
	// alert('pong_matchmaking.js loaded');
	pongSocket.send(JSON.stringify({
		'type': 'join_matchmaking_room',
		'username': current_user
	}));
	pong_matchmaking(false);
}

function startPongRemoteGame(data) {
	pongSocket.send(JSON.stringify({
		'type': 'join_pong_room',
		'room_name': data.room_name,
		'username': current_user
	}));
	pongIsRemote = true;
	pongRoomName = data.room_name;
	loadPage('/pong_game/', false);
}
