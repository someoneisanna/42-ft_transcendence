function initializeJS() {
	getStatsAndCreateCharts(current_user);
	getComments(current_user);
	dropdown_profile(false);
}

function getDateAndTime(isoDate, dateOrTime) {
	getLanguage();
	const date = new Date(isoDate);
	if (dateOrTime === 'date') {
		const options1 = { year: 'numeric', month: 'short', day: 'numeric' };
		const formattedDate = date.toLocaleDateString(getTranslation('en-US'), options1);
		return formattedDate;
	}
	else if (dateOrTime === 'time') {
		const options2 = { hour: '2-digit', minute: '2-digit'};
		const formattedTime = date.toLocaleTimeString(getTranslation('en-US'), options2);
		return formattedTime;
	}
}

function getStatsAndCreateCharts(username) {
	// Get stats from backend
	fetch('/api/pong_get_stats/?q=' + username)
		.then(response => {
			if (response.status === 401)
				closeWebSockets();
			if (!response.ok)
				throw new Error('Stats request failed:', response.statusText);
			return response.json();
		})
		.then(data => {
			getLanguage();
			let game_wins = data.game_wins;
			let game_losses = data.game_losses;
			let tournament_wins = data.tournament_wins;
			let tournament_losses = data.tournament_losses;
			let game_labels = [getTranslation("Local"), getTranslation("Online"), getTranslation("vs. AI"), getTranslation("Custom")];
			let tournament_labels = [getTranslation("Local"), getTranslation("Online")];
			data.games.forEach(element => {
				let date = getDateAndTime(element.created_at, 'date');
				let time = getDateAndTime(element.created_at, 'time');
				let result;
				if (element.user_score < 0)
					result = getTranslation("User Left");
				else if (element.opponent_score < 0)
					result = getTranslation("Opponent Left");
				else
					result = element.user_score + " VS " + element.opponent_score;
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
			createChart("chart1", game_labels, getTranslation('Single Game'), game_wins, game_losses);
			createChart("chart2", tournament_labels, getTranslation('Tournament'), tournament_wins, tournament_losses);
			if (data.total < 15)
				document.getElementById('nextPage').disabled = true;
		})
		.catch(error => {
			console.error('Error getting stats:', error);
		});
}

var getStatsFrom = 0;

function getGameHistory(button) {
	if (button == 'prev') {
		getStatsFrom -= 15;
		if (getStatsFrom <= 0) {
			getStatsFrom = 0;
			document.getElementById('previousPage').disabled = true;
		}
	}
	else {
		getStatsFrom += 15;
		document.getElementById('previousPage').disabled = false;
	}
	fetch('/api/pong_get_history_stats/?q=' + current_user + '&start=' + getStatsFrom)
		.then(response => {
			if (response.status === 401)
				closeWebSockets();
			if (!response.ok)
				throw new Error('Stats request failed:', response.statusText);
			return response.json();
		})
		.then(data => {
			document.getElementById('pongTableContent').innerHTML = "";
			data.games.forEach(element => {
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
			if (button == 'next' && data.total < getStatsFrom + 15)
				document.getElementById('nextPage').disabled = true;
			else
				document.getElementById('nextPage').disabled = false;
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

function addComment(username, element, position='end') {
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
			<div class="comment-text">${element.message}</div>`;
	if (username === current_user)
	{
		newElement += `
			<div class="comment-footer">
				<button id="tlDeleteButton" class="delete-button" onclick="deleteComment(this)">` + getTranslation("Delete") + `</button>`;
	}
	newElement += `</div> </li>`;
	if (position === 'start')
		document.getElementById('commentsBlock').insertAdjacentHTML('afterbegin', newElement);
	else
		document.getElementById('commentsBlock').innerHTML += newElement;
}

function getComments(username) {
	fetch('/api/get_profile_comments/?q=' + username)
		.then(response => {
			if (response.status === 401)
				closeWebSockets();
			if (!response.ok)
				throw new Error('Comments request failed:', response.statusText);
			return response.json();
		})
		.then(data => {
			data.comments.forEach(element => {
				addComment(username, element);
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
				userCannotPost();
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
