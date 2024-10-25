function handleLiveSearch() {
	document.getElementById('friendsSearchResults').innerHTML = '';
	const searchQuery = document.getElementById('searchInput').value.trim();
	if (searchQuery === '')
		return;
	performSearch(searchQuery);
}

function getRelationship(username) {
	console.log('Getting relationship with:', username);
	return fetch(`/api/get_relationship/?username=${username}`)
		.then(response => {
			// console.log('Response:', response);
			if (!response.ok)
				throw new Error('Relationship failed:', response.statusText);
			return response.json();
		})
		.then(data => {
			// console.log('Relationship:', data);
			return data;
		})
		.catch(error => {
			// console.error('Error during relationship:', error);
			return null;
		});
}

function changeButton(username, relationship) {
	if (relationship === 'none')
		newElement = `<button class="btn friendsElementButton" onclick="sendInvitation('${username}')"><i class="fa fa-home"></i> +</button>`;
	else if (relationship === 'friends')
		newElement = `<button class="btn friendsElementButton" onclick="removeFriend('${username}')"><i class="fa fa-home"></i> -</button>`;
	else if (relationship === 'invitation_sent')
		newElement = `<button class="btn friendsElementButton" onclick="cancelInvitation('${username}')"><i class="fa fa-home"></i> cancel</button>`;
	else if (relationship === 'invitation_received')
		newElement = `
			<div>
				<button class="btn friendsElementButton" onclick="rejectInvitation('${username}')"><i class="fa fa-home"></i> reject</button>
				<button class="btn friendsElementButton" onclick="acceptInvitation('${username}')"><i class="fa fa-home"></i> accept</button>
			</div>`;
	else
		console.log('Unknown relationship:', relationship);
	return newElement;
}

// Function to actually perform the search (e.g., making an API call)
function performSearch(query) {
	console.log('Searching for:', query);
	fetch(`/api/search_friends/?q=${query}`)
		.then(response => {
			// console.log('Response:', response);
			if (!response.ok)
				throw new Error('Search failed:', response.statusText);
			return response.json();
		})
		.then(data => {
			// console.log('Search results:', data);
			data.forEach(item => {
				// console.log('User:', item);
				const rl = getRelationship(item.username)
					.then(rl => {
						console.log('Relationship:', rl.relationship);
						var newElement = `
						<li class="userResult">
						<div class="userInfo">
						<img src="${item.profile_pic}" width="50" height="50" class="rounded-circle" onerror="this.onerror=null; this.src='/media/profile_pics/default.jpg';">
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

function sendInvitation(username) {
	console.log('Sending friend request to:', username);
	fetch('/api/send_friend_request/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': csrftoken,
			'Content-Type': 'application/json'
	},
	body: JSON.stringify({ username: username }),
	credentials: 'same-origin'
	})
	.then(response => {
		console.log('Response:', response);
		if (!response.ok)
			throw new Error('Friend request failed:', response.statusText);
		return response.json();
	})
	.then(data => {
		console.log('Friend request sent:', data);
		// button changes to "Request Sent"
	})
	.catch(error => {
		console.error('Error sending friend request:', error);
	});
}

function removeFriend(username) {
	console.log('Removing friend:', username);
	fetch('/api/remove_friend/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': csrftoken,
			'Content-Type': 'application/json'
	},
	body: JSON.stringify({ username: username }),
	credentials: 'same-origin'
	})
	.then(response => {
		console.log('Response:', response);
		if (!response.ok)
			throw new Error('Friend removal failed:', response.statusText);
		return response.json();
	})
	.then(data => {
		console.log('Friend removed:', data);
		// button changes to "add friend"
	})
	.catch(error => {
		console.error('Error removing friend:', error);
	});
}

function cancelInvitation(username) {
	console.log('Cancelling invitation:', username);
	fetch('/api/cancel_invitation/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': csrftoken,
			'Content-Type': 'application/json'
	},
	body: JSON.stringify({ username: username }),
	credentials: 'same-origin'
	})
	.then(response => {
		console.log('Response:', response);
		if (!response.ok)
			throw new Error('Invitation cancellation failed:', response.statusText);
		return response.json();
	})
	.then(data => {
		console.log('Invitation cancelled:', data);
		// button changes to "add friend"
	})
	.catch(error => {
		console.error('Error cancelling invitation:', error);
	});
}

function acceptInvitation(username) {
	console.log('Accepting invitation:', username);
	fetch('/api/accept_invitation/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': csrftoken,
			'Content-Type': 'application/json'
	},
	body: JSON.stringify({ username: username }),
	credentials: 'same-origin'
	})
	.then(response => {
		console.log('Response:', response);
		if (!response.ok)
			throw new Error('Invitation acceptance failed:', response.statusText);
		return response.json();
	})
	.then(data => {
		console.log('Invitation accepted:', data);
		// button changes to "add friend"
	})
	.catch(error => {
		console.error('Error accepting invitation:', error);
	});
}

function rejectInvitation(username) {
	console.log('Rejecting invitation:', username);
	fetch('/api/reject_invitation/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': csrftoken,
			'Content-Type': 'application/json'
	},
	body: JSON.stringify({ username: username }),
	credentials: 'same-origin'
	})
	.then(response => {
		console.log('Response:', response);
		if (!response.ok)
			throw new Error('Invitation rejectance failed:', response.statusText);
		return response.json();
	})
	.then(data => {
		console.log('Invitation rejected:', data);
		// button changes to "add friend"
	})
	.catch(error => {
		console.error('Error rejecting invitation:', error);
	});
}
