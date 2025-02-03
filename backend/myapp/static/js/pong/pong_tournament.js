function loadPongTournamentLocal() {
	loadPage('/pong_localTournament/', true);
}

function loadPongTournamentRemote() {
	loadPage('/pong_remoteTournament/', true);
}

function initializeJS() {
	pong_tournament(false);
}
