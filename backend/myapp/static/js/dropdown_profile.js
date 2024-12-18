function initializeJS() {

	getStatsAndCreateCharts();
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
			console.error('Error during search:', error);
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
