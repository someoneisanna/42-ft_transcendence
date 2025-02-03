// GOTO FUNCTIONS -------------------------------------------------------------------------------------------------------------------------

function initializeJS() {
	searchPendingInvitations();
	game_choice(false);
}

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
	// loadPage('/game_choice/', true);
	loadPage('/layout/', true);
}

function changeSmallProfilePic(path) {
	const profilePic = document.getElementById('smallProfilePicture');
	if (profilePic)
		profilePic.src = path;
}

function changeNotificationBellToBlack() {
	const notificationBell = document.getElementById('notificationBell');
	if (notificationBell) {
		notificationBell.style.color = 'black';
		document.getElementById('notificationList').innerHTML = '<li id="tlNoPendingInvitations" class="dropdown-item text-white">No pending invitations</li>';
		getLanguage();
		translateElement('tlNoPendingInvitations');
	}
}

function searchPendingInvitations() {
	console.log('Searching for pending invitations...');
	fetch('/api/search_pending/')
		.then(response => {
			if (response.status === 401)
				closeWebSockets();
			if (!response.ok)
				throw new Error('Search failed:', response.statusText);
			return response.json();
		})
		.then(data => {
			if (data.length === 0)
				changeNotificationBellToBlack();
			data.forEach(item => {
				var newElement = `
				<li class="dropdown-item text-white d-flex justify-content-between align-items-center notificationElement">
					<p class="m-0 me-2">${item.username}</p>
					<div class="d-flex justify-content-end">
						<p class="btn notificationButton m-0 me-1" onclick="notificationAcceptInvitation(this, '${item.username}')" style="padding: 0px;">
							<i class="fa fa-check-square icon-confirm" style="font-size:25px;"></i>
						</p>
						<p class="btn notificationButton m-0" onclick="notificationRejectInvitation(this, '${item.username}')" style="padding: 0px;">
							<i class="fa fa-window-close icon-deny" style="font-size:25px;"></i>
						</p>
					</div>
				</li>`;
				document.getElementById('notificationList').innerHTML += newElement;
				document.getElementById('notificationBell').style.color = 'red';
			});
		})
		.catch(error => {
			console.error('Error during search:', error);
		});
}

function notificationAcceptInvitation(buttonRef, username) {
	fetch('/api/accept_invitation/', {
		method: 'POST',
		headers: {
			'X-csrftoken': csrftoken_var,
			'Content-Type': 'application/json'
	},
	body: JSON.stringify({ username: username }),
	credentials: 'same-origin'
	})
	.then(response => {
		if (response.status === 401 || response.status === 403)
			userCannotPost();
		else if (!response.ok)
			throw new Error('Invitation acceptance failed:', response.statusText);
		return response.json();
	})
	.then(data => {
		console.log('Invitation accepted:', data);
		buttonRef.parentElement.parentElement.remove();
		if (document.querySelector('.notificationElement') === null)
			changeNotificationBellToBlack();
		notifyUser(username, 'friendship_changed', 'friends');
		updateListsandChat('friends');
	})
	.catch(error => {
		console.error('Error accepting invitation:', error);
		buttonRef.parentElement.parentElement.remove();
		if (document.querySelector('.notificationElement') === null)
			changeNotificationBellToBlack();
	});
}

function notificationRejectInvitation(buttonRef, username) {
	fetch('/api/reject_invitation/', {
		method: 'POST',
		headers: {
			'X-csrftoken': csrftoken_var,
			'Content-Type': 'application/json'
	},
	body: JSON.stringify({ username: username }),
	credentials: 'same-origin'
	})
	.then(response => {
		if (response.status === 401 || response.status === 403)
			userCannotPost();
		else if (!response.ok)
			throw new Error('Invitation rejection failed:', response.statusText);
		return response.json();
	})
	.then(data => {
		console.log('Invitation rejected:', data);
		buttonRef.parentElement.parentElement.remove();
		if (document.querySelector('.notificationElement') === null)
			changeNotificationBellToBlack();
	})
	.catch(error => {
		console.error('Error rejecting invitation:', error);
		buttonRef.parentElement.parentElement.remove();
		if (document.querySelector('.notificationElement') === null)
			changeNotificationBellToBlack();
	});
}
