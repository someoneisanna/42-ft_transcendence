var profileUsername = '';

function initializeJS() {
	const url = new URL(window.location.href);
	profileUsername = url.searchParams.get('u');
	getStatsAndCreateCharts(profileUsername);
	getComments(profileUsername);
}

function postComment() {
	const message = document.getElementById('commentInput').value;
	fetch('/api/post_profile_comment/', {
		method: 'POST',
		headers: {
			'X-csrftoken': csrftoken_var,
			'Content-Type': 'application/json'
	},
	body: JSON.stringify({recipient: profileUsername, message: message}),
	credentials: 'same-origin'
	})
	.then(response => {
		if (response.status === 401 || response.status === 403)
			window.location.href = '/';
		else if (!response.ok)
			throw new Error(response.statusText);
		return response.json();
	})
	.then(data => {
		console.log('Comment posted:', data);
		addComment(profileUsername, data, 'start');
		document.getElementById('commentInput').value = '';
	})
	.catch(error => {
		console.error('Error sending friend request:', error);
	});
}
