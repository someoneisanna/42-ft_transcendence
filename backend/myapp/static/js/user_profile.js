var profileUsername = '';

function initializeJS() {
	const url = new URL(window.location.href);
	profileUsername = url.searchParams.get('u');
	getStatsAndCreateCharts(profileUsername);
	getComments(profileUsername);
	dropdown_profile(false);
}

function postComment(profile) {
	const rawMessage = document.getElementById('commentInput').value;
	const message = sanitizeInput(rawMessage);
	if (message.length <= 0)
		return;
	if (profile == 'own_profile')
		recipient = current_user;
	else
		recipient = profileUsername;
	fetch('/api/post_profile_comment/', {
		method: 'POST',
		headers: {
			'X-csrftoken': csrftoken_var,
			'Content-Type': 'application/json'
	},
	body: JSON.stringify({recipient: recipient, message: message}),
	credentials: 'same-origin'
	})
	.then(response => {
		if (response.status === 401 || response.status === 403)
			userCannotPost();
		else if (!response.ok)
			throw new Error(response.statusText);
		return response.json();
	})
	.then(data => {
		console.log('Comment posted:', data);
		addComment(recipient, data, 'start');
		document.getElementById('commentInput').value = '';
	})
	.catch(error => {
		console.error('Error sending friend request:', error);
	});
}
