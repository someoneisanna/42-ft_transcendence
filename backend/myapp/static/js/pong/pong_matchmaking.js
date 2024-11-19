function initializeJS() {
	// alert('pong_matchmaking.js loaded');
	pongSocket.send(JSON.stringify({
		'type': 'matchmaking',
		'username': current_user
	}));
}
