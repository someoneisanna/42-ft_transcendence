// RUN THE SCRIPT WHEN THE PAGE IS FULLY LOADED --------------------------------------------------------------------------------------------

function initializeJS() {

// IMAGE CLICK ------------------------------------------------------------------------------------------------------------------------------

document.getElementById('buttonGame1').addEventListener('click', function() {
	loadPage('/menu_pong/', true);
});

document.getElementById('buttonGame2').addEventListener('click', function() {
	alert('You clicked the image2!');
});

}

function signOut() {
	if (confirm("Are you sure you want to quit?") == false) 
		return;
	fetch('http://127.0.0.1:8000/logout/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
	})
	.then(response => {
		if (!response.ok) {
			return response.json().then(err => {
				throw new Error(err.error);
			});
		}
		return response.json();
	})
	.then(data => {
		console.log('Logout Success:', data);
		loadPage('/landing/', true);
	})
	.catch((error) => {
		console.error('Logout failed:', error);
	});
}
