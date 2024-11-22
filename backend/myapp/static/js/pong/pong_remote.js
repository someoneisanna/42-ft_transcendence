function startPongRemoteGame(data) {
	pongSocket.send(JSON.stringify({
		'type': 'join_pong_room',
		'room_name': data.room_name,
		'username': current_user
	}));
	loadPage('/pong_game/', true);
}
