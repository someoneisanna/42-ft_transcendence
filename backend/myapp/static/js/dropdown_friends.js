var debounceTimeout;

function handleLiveSearch() {
	clearTimeout(debounceTimeout);
	debounceTimeout = setTimeout(() => {
		document.getElementById('friendsSearchResults').innerHTML = '';
		const searchQuery = document.getElementById('searchInput').value.trim();
		if (searchQuery === '')
			return;
		performSearch(searchQuery);
	}, 200);
}

function getRelationship(username) {
	return fetch(`/api/get_relationship/?username=${username}`)
		.then(response => {
			if (response.status === 401)
				closeWebSockets();
			if (!response.ok)
				throw new Error('Relationship failed:', response.statusText);
			return response.json();
		})
		.then(data => {
			return data;
		})
		.catch(error => {
			return null;
		});
}

function buildFriendsList() {
	var listContainer = document.getElementById('friendsListContent');
	listContainer.innerHTML = '';
	fetch('/api/get_friends/')
		.then(response => {
			if (response.status === 401)
				closeWebSockets();
			if (!response.ok)
				throw new Error('Friend list request failed:', response.statusText);
			return response.json();
		})
		.then(data => {
			data.friends.forEach(item => {
				getLanguage();
				var title = tlIndex == 0 ? `Go to ${item.username}s profile` : getTranslation("Go to") + item.username;
				var newElement = `<li class="friendUser d-flex align-items-center">
						<img src="${item.profile_pic}" width="50" height="50" class="rounded-circle" onerror="this.onerror=null; this.src='/media/default.jpg';" title='${title}' onclick="goToFriendProfile('${item.username}')" style="cursor: pointer;">
						<p class="m-0 ms-2">${item.username}</p>
						<button class="btn btn-sm btn-danger ms-auto me-2" title="Remove Friend" onclick="removeFriend(this, '${item.username}')"><i class="fa-solid fa-minus"></i></button>
					</li>`;
				listContainer.innerHTML += newElement;
			});
		})
		.catch(error => {
			console.error('Error during search:', error);
		});
}

function changeButton(username, relationship) {
	getLanguage();
	if (relationship === 'none')
		newElement = `<button class="btn btn-outline-light me-2" onclick="sendInvitation(this, '${username}')"><i class="fa-solid fa-plus"></i> ` + getTranslation("Add Friend") + `</button>`;
	else if (relationship === 'friends')
		newElement = `<button class="btn btn-outline-light me-2" onclick="removeFriend(this, '${username}')"><i class="fa-solid fa-minus"></i> ` + getTranslation("Remove Friend") + `</button>`;
	else if (relationship === 'invitation_sent')
		newElement = `<button class="btn btn-outline-light me-2" onclick="cancelInvitation(this, '${username}')"><i class="fa-solid fa-xmark"></i> ` + getTranslation("Cancel Invite") + `</button>`;
	else if (relationship === 'invitation_received')
		newElement = `
			<div>
				<button class="btn btn-outline-light me-2" onclick="rejectInvitation(this, '${username}')"><i class="fa-solid fa-xmark"></i> ` + getTranslation("Reject") + `</button>
				<button class="btn btn-outline-light me-2" onclick="acceptInvitation(this, '${username}')"><i class="fa-solid fa-check"></i> ` + getTranslation("Accept") + `</button>
			</div>`;
	else if (relationship === 'blocked')
		newElement = `<button class="btn btn-outline-light me-2" onclick="unblockUser(this, '${username}')"><i class="fa-solid fa-unlock"></i> ` + getTranslation("Unblock User") + `</button>`;
	else
		console.log('Unknown relationship:', relationship);
	return newElement;
}

function performSearch(query) {
	fetch(`/api/search_friends/?q=${query}`)
		.then(response => {
			if (response.status === 401)
				closeWebSockets();
			if (!response.ok)
				throw new Error('Search failed:', response.statusText);
			return response.json();
		})
		.then(data => {
			data.forEach(item => {
				const rl = getRelationship(item.username)
					.then(rl => {
						getLanguage();
						var title = tlIndex == 0 ? `Go to ${item.username}s profile` : getTranslation("Go to") + item.username;
						var newElement = `
						<li class="userResult">
							<div class="userInfo" onclick="goToFriendProfile('${item.username}')" style="cursor: pointer;" title='${title}'>
								<img src="${item.profile_pic}" width="50" height="50" class="rounded-circle" onerror="this.onerror=null; this.src='/media/default.jpg';">
								<p class="m-0 ms-2"><strong>${item.username}</strong></p>
							</div>`;
						newElement += changeButton(item.username, rl.relationship);
						newElement += `</li>`;
						document.getElementById('friendsSearchResults').innerHTML += newElement;
					});
			});
		})
		.catch(error => {
			console.error('Error during search:', error);
		});
}

function sendInvitation(buttonRef, username) {
	fetch('/api/send_friend_request/', {
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
			throw new Error('Friend request failed:', response.statusText);
		return response.json();
	})
	.then(data => {
		console.log('Friend request sent:', data);
		buttonRef.outerHTML = changeButton(username, 'invitation_sent');
		notifyUser(username, 'invitation_changed', 'invitation_received');
	})
	.catch(error => {
		console.error('Error sending friend request:', error);
	});
}

function removeFriend(buttonRef, username) {
	fetch('/api/remove_friend/', {
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
			throw new Error('Friend removal failed:', response.statusText);
		return response.json();
	})
	.then(data => {
		console.log('Friend removed:', data);
		buttonRef.outerHTML = changeButton(username, 'none');
		notifyUser(username, 'friendship_changed', 'none');
		updateListsandChat('none');
	})
	.catch(error => {
		console.error('Error removing friend:', error);
	});
}

function cancelInvitation(buttonRef, username) {
	fetch('/api/cancel_invitation/', {
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
			throw new Error('Invitation cancellation failed:', response.statusText);
		return response.json();
	})
	.then(data => {
		console.log('Invitation cancelled:', data);
		buttonRef.outerHTML = changeButton(username, 'none');
		notifyUser(username, 'invitation_changed', 'invitation_was_cancelled');
	})
	.catch(error => {
		console.error('Error cancelling invitation:', error);
	});
}

function acceptInvitation(buttonRef, username) {
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
		buttonRef.parentElement.innerHTML = changeButton(username, 'friends');
		notifyUser(username, 'friendship_changed', 'friends');
		updateListsandChat('none');
	})
	.catch(error => {
		console.error('Error accepting invitation:', error);
	});
}

function rejectInvitation(buttonRef, username) {
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
		if (response.status === 401 || response.status === 403) {
			userCannotPost();
		} else if (!response.ok)
			throw new Error('Invitation rejectance failed:', response.statusText);
		return response.json();
	})
	.then(data => {
		console.log('Invitation rejected:', data);
		buttonRef.parentElement.innerHTML = changeButton(username, 'none');
	})
	.catch(error => {
		console.error('Error rejecting invitation:', error);
	});
}

function unblockUser(buttonRef, username) {
	fetch('/api/unblock_user/', {
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
			throw new Error('User unblocking failed:', response.statusText);
		return response.json();
	})
	.then(data => {
		console.log('User unblocked:', data);
		buttonRef.outerHTML = changeButton(username, 'none');
	})
	.catch(error => {
		console.error('Error unblocking user:', error);
	});
}

function updateListsandChat(relationship) {
	if (relationship === 'none') {
		lastActiveButton = null;
		document.querySelector('.chatContent').classList.add('showFriendsOnly');
		document.querySelector('.chatWindow').classList.add('noChatClicked');
	}
	buildChatFriendsList();
	if (document.querySelector('.friendsList'))
		buildFriendsList();
}

function notifyUser(username, notification, new_relationship) {
	chatSocket.send(JSON.stringify({
		'type': 'send_notification',
		'room_name': username,
		'username': current_user,
		'notification': notification,
		'new_relationship': new_relationship
	}));
}

function initializeJS() {
	buildFriendsList();
	dropdown_friends(false);
}
