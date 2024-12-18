function initializeJS() {

	getStatsAndCreateCharts();
	getComments();
}

function getDateAndTime(isoDate, dateOrTime) {
	const date = new Date(isoDate);
	if (dateOrTime === 'date') {
		const options1 = { year: 'numeric', month: 'short', day: 'numeric' };
		const formattedDate = date.toLocaleDateString('en-US', options1);
		return formattedDate;
	}
	else if (dateOrTime === 'time') {
		const options2 = { hour: '2-digit', minute: '2-digit'};
		const formattedTime = date.toLocaleTimeString('en-US', options2);
		return formattedTime;
	}
}

function getStatsAndCreateCharts() {
	// Get stats from backend
	fetch('/api/pong_get_stats/?q=' + current_user)
		.then(response => {
			if (!response.ok)
				throw new Error('Stats request failed:', response.statusText);
			return response.json();
		})
		.then(data => {
			let game_wins = data.game_wins;
			let game_losses = data.game_losses;
			let tournament_wins = data.tournament_wins;
			let tournament_losses = data.tournament_losses;
			let game_labels = ["Local", "Online", "vs. AI", "Custom"];
			let tournament_labels = ["Local", "Online", "Custom"];
			let games = data.games;
			games.slice(0, 15).forEach(element => {
				let date = getDateAndTime(element.created_at, 'date');
				let time = getDateAndTime(element.created_at, 'time');
				let result = element.user_score + " VS " + element.opponent_score;
				let newElement = `<tr">
					<td>${date}</td>
					<td>${time}</td>
					<td>${element.game_type}</td>
					<td>${element.user}</td>
					<td>${result}</td>
					<td>${element.opponent}</td>
				</tr>`;
				document.getElementById('pongTableContent').innerHTML += newElement;
			});
			createChart("chart1", game_labels, 'Single Game', game_wins, game_losses);
			createChart("chart2", tournament_labels, 'Tournament', tournament_wins, tournament_losses);
		})
		.catch(error => {
			console.error('Error getting stats:', error);
		});
}

function createChart(chart, labels, text, game_wins, game_losses)
{
	var ctx = document.getElementById(chart).getContext('2d');
	var chart = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: labels,
			datasets: [
				{
					label: 'Wins',
					backgroundColor: "#b3d6ff",
					data: game_wins,
				},
				{
					label: 'Losses',
					backgroundColor: "#0C70A0",
					data: game_losses,
				}
			],
		},
	options: {
		tooltips: {
			displayColors: true,
			callbacks: { mode: 'x'},
		},
		scales: {
			xAxes: [{
				stacked: true,
				gridLines: { display: false }
			}],
			yAxes: [{
				stacked: true,
				ticks: { beginAtZero: true },
				type: 'linear',
			}]
		},
		title: {
			display: true,
			text: text,
			fontSize: 16,
		},
		responsive: true,
		maintainAspectRatio: false,
		legend: { position: 'bottom' },
		}
	});
}

function getComments() {
	fetch('/api/get_profile_comments/?q=' + current_user)
		.then(response => {
			if (!response.ok)
				throw new Error('Comments request failed:', response.statusText);
			return response.json();
		})
		.then(data => {
			data.comments.forEach(element => {
				timestamp = getDateAndTime(element.created_at, 'date') + " | " + getDateAndTime(element.created_at, 'time');
				let newElement = `<li id="${element.id}" class="comment">
					<div class="profile-pic-container">
						<img id="smallProfilePicture" src="${element.profile_pic}" width="50" height="50" class="rounded-circle" onerror="this.onerror=null; this.src='/media/default.jpg';">
					</div>
					<div class="comment-content">
						<div class="comment-header">
							<div class="comment-author">${element.author}</div>
							<div class="comment-timestamp">${timestamp}</div>
						</div>
						<div class="comment-text">${element.message}</div>
						<div class="comment-footer">
							<button class="delete-button" onclick="deleteComment(this)">Delete</button>
						</div>
					</div>
				</li>`;
				document.getElementById('commentsBlock').innerHTML += newElement;
			});
		})
		.catch(error => {
			console.error('Error getting comments:', error);
		});
}

function deleteComment(element) {
	try {
		const comment = element.parentElement.parentElement.parentElement;
		const commentID = comment.id;
		const commentAuthor = comment.querySelector('.comment-author').textContent;
		fetch('/api/delete_profile_comment/', {
			method: 'DELETE',
			headers: {
				'X-csrftoken': csrftoken_var,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({id: commentID, author: commentAuthor, recipient: current_user}),
			credentials: 'same-origin',
		})
		.then(response => {
			if (response.status === 401 || response.status === 403)
				window.location.href = '/';
			else if (!response.ok)
				throw new Error(response.statusText);
			return response.json();
		})
		.then(data => {
			console.log('Comment deleted:', data);
			comment.remove();
		});
	}
	catch (error) {
		console.error('Error deleting comment:', error);
	}
}

function postComment() {
	message = "HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!HELLO!";
	fetch('/api/post_profile_comment/', {
		method: 'POST',
		headers: {
			'X-csrftoken': csrftoken_var,
			'Content-Type': 'application/json'
	},
	body: JSON.stringify({recipient: current_user, message: message}),
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
		let newElement = `<li class="comment">
			<!-- Profile picture -->
			<div class="profile-pic-container">
				<img id="smallProfilePicture" src="${data.profile_pic}" width="50" height="50" class="rounded-circle" onerror="this.onerror=null; this.src='/media/default.jpg';">
			</div>
			<!-- Comment text -->
			<div class="comment-content">
				<div class="comment-author">${data.author}</div>
				<div class="comment-text">${data.message}</div>
			</div>
		</li>`;
		document.getElementById('commentsBlock').innerHTML += newElement;
	})
	.catch(error => {
		console.error('Error sending friend request:', error);
	});
}
