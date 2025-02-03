function loadLocalPong(){
	loadPage('/pong_game/', false);
}

function loadRemotePong(){
	loadPage('/pong_matchmaking/', true);
}

function loadLocalPongAI(){
	pongIsCpu = true;
	loadPage('/pong_game/', false);
}

function loadCustomPong(){
	loadPage('/pong_customGame/', true);
}

function loadRoomListPong(){
	loadPage('/pong_game/', false);
}

function initializeJS() {
	pong_quickplay(false);
}
