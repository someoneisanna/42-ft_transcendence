// RUN THE SCRIPT WHEN THE PAGE IS FULLY LOADED --------------------------------------------------------------------------------------------

function initializeJS() {
	const game1 = document.getElementById('buttonGame1');
	if (game1) {
		game1.addEventListener('click', function() {
			loadPage('/pong_menu/', true);
		});
	}
}
