// RUN THE SCRIPT WHEN THE PAGE IS FULLY LOADED --------------------------------------------------------------------------------------------

function initializeJS() {

// IMAGE CLICK ------------------------------------------------------------------------------------------------------------------------------

const game1 = document.getElementById('buttonGame1');
if (game1) {
	game1.addEventListener('click', function() {
	loadPage('/menu_pong/', true);
});

}

const game2 = document.getElementById('buttonGame2');
if (game1) {
	game2.addEventListener('click', function() {
	alert('You clicked the image2!');
});

}

}
