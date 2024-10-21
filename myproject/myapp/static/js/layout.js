// GOTO FUNCTIONS -------------------------------------------------------------------------------------------------------------------------

function goToProfile() {
	loadPage('/dropdown_profile/', true);
}

function goToSettings() {
	loadPage('/dropdown_settings/', true);
}

function goToFriends() {
	loadPage('/dropdown_friends/', true);
}

function goHome() {
	loadPage('/layout/', true);
}

function changeProfilePic(path) {
	const profilePic = document.getElementById('smallProfilePicture');
	if (profilePic) {
		profilePic.src = path;
	}
}
