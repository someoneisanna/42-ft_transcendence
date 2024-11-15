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

function changeSmallProfilePic(path) {
	const profilePic = document.getElementById('smallProfilePicture');
	if (profilePic)
		profilePic.src = path;
}

function searchPendingInvitations() {
	fetch('/api/search_pending/')
		.then(response => {
			if (!response.ok)
				throw new Error('Search failed:', response.statusText);
			return response.json();
		})
		.then(data => {
			const notificationBell = document.getElementById('notificationBell');
			if (data.length === 0 && notificationBell ) {
				notificationBell.style.color = 'black';
				document.getElementById('notificationList').innerHTML = '<li class="dropdown-item text-white">No pending invitations</li>';
			}
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
			window.location.href = '/';
		else if (!response.ok)
			throw new Error('Invitation acceptance failed:', response.statusText);
		return response.json();
	})
	.then(data => {
		console.log('Invitation accepted:', data);
		buttonRef.parentElement.parentElement.remove();
		if (document.querySelector('.notificationElement') === null) {
			document.getElementById('notificationBell').style.color = 'black';
			document.getElementById('notificationList').innerHTML = '<li class="dropdown-item text-white">No pending invitations</li>';
		}
		notifyUser(username, 'friendship_changed', 'friends');
		updateListsandChat('friends');
	})
	.catch(error => {
		console.error('Error accepting invitation:', error);
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
			window.location.href = '/';
		else if (!response.ok)
			throw new Error('Invitation rejection failed:', response.statusText);
		return response.json();
	})
	.then(data => {
		console.log('Invitation rejected:', data);
		buttonRef.parentElement.parentElement.remove();
		if (document.querySelector('.notificationElement') === null) {
			document.getElementById('notificationBell').style.color = 'black';
			document.getElementById('notificationList').innerHTML = '<li class="dropdown-item text-white">No pending invitations</li>';
		}
	})
	.catch(error => {
		console.error('Error rejecting invitation:', error);
	});
}
