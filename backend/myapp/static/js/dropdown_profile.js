function initializeJS() {

	game_wins = [12, 59, 185, 56];
	game_losses = [12, 50, 53, 56];
	tournament_wins = [12, 59, 5];
	tournament_losses = [12, 59, 5];

	var ctx1 = document.getElementById("chart1").getContext('2d');
	var chart1 = new Chart(ctx1, {
		type: 'bar',
		data: {
			labels: ["Local", "Online", "vs. AI", "Custom"],
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
			text: 'Single Game',
			fontSize: 16,
		},
		responsive: true,
		maintainAspectRatio: false,
		legend: { position: 'bottom' },
		}
	});

	var ctx2 = document.getElementById("chart2").getContext('2d');
	var chart2 = new Chart(ctx2, {
		type: 'bar',
		data: {
			labels: ["Local", "Online", "Custom"],
			datasets: [
				{
					label: 'Wins',
					backgroundColor: "#b3d6ff",
					data: tournament_wins,
				},
				{
					label: 'Losses',
					backgroundColor: "#0C70A0",
					data: tournament_losses,
				}
			],
		},
	options: {
		tooltips: {
			displayColors: true,
			callbacks:{ mode: 'x' },
		},
		scales: {
			xAxes: [{
				stacked: true,
				gridLines: { display: false}
			}],
			yAxes: [{
				stacked: true,
				ticks: { beginAtZero: true},
				type: 'linear',
			}]
		},
		title: {
			display: true,
			text: 'Tournament',
			fontSize: 16,
		},
		responsive: true,
		maintainAspectRatio: false,
		legend: { position: 'bottom' },
		}
	});
}
