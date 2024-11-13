let debounceTimeout;

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
			if (!response.ok)
				throw new Error('Friend list request failed:', response.statusText);
			return response.json();
		})
		.then(data => {
			data.friends.forEach(item => {
				var newElement = `<li class="friendUser">
						<img src="${item.profile_pic}" width="50" height="50" class="rounded-circle" onerror="this.onerror=null; this.src='/media/default.jpg';">
						<p>${item.username}</p>
					</li>`;
				listContainer.innerHTML += newElement;
			});
		})
		.catch(error => {
			console.error('Error during search:', error);
		});
}

function changeButton(username, relationship) {
	if (relationship === 'none')
		newElement = `<button class="btn friendsElementButton" onclick="sendInvitation(this, '${username}')"><i class="fa fa-home"></i> Add Friend</button>`;
	else if (relationship === 'friends')
		newElement = `<button class="btn friendsElementButton" onclick="removeFriend(this, '${username}')"><i class="fa fa-home"></i> Remove Friend</button>`;
	else if (relationship === 'invitation_sent')
		newElement = `<button class="btn friendsElementButton" onclick="cancelInvitation(this, '${username}')"><i class="fa fa-home"></i> Cancel Invite</button>`;
	else if (relationship === 'invitation_received')
		newElement = `
			<div>
				<button class="btn friendsElementButton" onclick="rejectInvitation(this, '${username}')"><i class="fa fa-home"></i> Reject</button>
				<button class="btn friendsElementButton" onclick="acceptInvitation(this, '${username}')"><i class="fa fa-home"></i> Accept</button>
			</div>`;
	else if (relationship === 'blocked')
		newElement = `<button class="btn friendsElementButton" onclick="unblockUser(this, '${username}')"><i class="fa fa-home"></i> Unblock User</button>`;
	else
		console.log('Unknown relationship:', relationship);
	return newElement;
}

function performSearch(query) {
	console.log('Searching for:', query);
	fetch(`/api/search_friends/?q=${query}`)
		.then(response => {
			if (!response.ok)
				throw new Error('Search failed:', response.statusText);
			return response.json();
		})
		.then(data => {
			data.forEach(item => {
				const rl = getRelationship(item.username)
					.then(rl => {
						var newElement = `
						<li class="userResult">
						<div class="userInfo">
						<img src="${item.profile_pic}" width="50" height="50" class="rounded-circle" onerror="this.onerror=null; this.src='/media/default.jpg';">
						<p>${item.username}</p>
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
			window.location.href = '/';
		else if (!response.ok)
			throw new Error('Friend request failed:', response.statusText);
		return response.json();
	})
	.then(data => {
		console.log('Friend request sent:', data);
		buttonRef.outerHTML = changeButton(username, 'invitation_sent');
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
			window.location.href = '/';
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
			window.location.href = '/';
		else if (!response.ok)
			throw new Error('Invitation cancellation failed:', response.statusText);
		return response.json();
	})
	.then(data => {
		console.log('Invitation cancelled:', data);
		buttonRef.outerHTML = changeButton(username, 'none');
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
			window.location.href = '/';
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
			window.location.href = '/';
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
			window.location.href = '/';
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
	console.debug('TESTS: sending notification to ' + username + ': ' + notification);
	chatSocket.send(JSON.stringify({
		'type': 'send_notification',
		'room_name': username,
		'username': current_user,
		'notification': notification,
		'new_relationship': new_relationship
	}));
}

function notifyUsers(username, action) {
	const roomName = getChannelRoomName(username);
	console.debug('WS: updating message for room:', roomName);
	chatSocket.send(JSON.stringify({
		'type': 'update_html',
		'room_name': roomName,
		'username': current_user,
		'action': action,
	}));
}
