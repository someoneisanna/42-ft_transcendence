function initializeJS() {
	pongSocket.send(JSON.stringify({
		'type': 'join_tournament_matchmaking_room',
		'username': current_user
	}));
	pong_remoteTournament();
}

function startPongRemoteTournamentGame(data) {
	console.debug('WS: start_pong_tournament_match', data);
	pongSocket.send(JSON.stringify({
		'type': 'join_tournament_pong_room',
		'room_name': data.room_name,
		'username': current_user
	}));
	pongIsRemote = true;
	pongIsTournament = true;
	tournamentRoomName = data.room_name;
	loadPage('/pong_game/', false);
}
