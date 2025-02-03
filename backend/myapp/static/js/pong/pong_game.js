function getDefaultSettings()
{
	let settings = new GameSettings();

	settings.gameType = "duel";
	settings.connectionType = "local";
	settings.targetScore = 2;
	settings.paddleSpeed = 1200;
	settings.initialSpeed = 600.0;
	settings.speedIncrease = 60;
	settings.typePlayer1 = "human";
	settings.typePlayer2 = "human";
	settings.namePlayer1 = "";
	settings.namePlayer2 = "";
	settings.playerNames = [];
	settings.modifiers = ["speed", "height"];
	settings.modifierCooldown = 3;
	settings.modifierStrength = 1;
	settings.modifierDuration = 5;
	settings.colorBackground = new Color(67, 85, 112).toHex();
	settings.colorPaddleLeft = new Color(255, 0, 0).toHex();
	settings.colorPaddleRight = new Color(0, 0, 255).toHex();
	settings.colorBall = new Color(0, 255, 0).toHex();
	settings.colorTrail = new Color(255, 255, 255).toHex();

	return settings;
}

function getLocalSettings(player1name, player2name)
{
	gameSettings = getDefaultSettings();
	if (pongIsCustom)
		applyCustomSettings();

	gameSettings.namePlayer1 = player1name;
	gameSettings.namePlayer2 = player2name;
	
	if (gameSettings.namePlayer1 === "")
	{
		gameSettings.typePlayer1 = "cpu";
		gameSettings.namePlayer1 = "AI";
	}
	if (gameSettings.namePlayer2 === "")
	{
		gameSettings.typePlayer2 = "cpu";
		gameSettings.namePlayer2 = "AI";
	}
	return gameSettings;
}

function getLocalTournamentSettings()
{
	gameSettings = getDefaultSettings();
	if (pongIsCustom)
		applyCustomSettings();
	gameSettings.gameType = "tournament";
	gameSettings.playerNames = tournamentPlayerNames;

	tournamentRoot = generateTournamentTree();

	return gameSettings;
}

function getRemoteTournamentSettings()
{
	gameSettings = getDefaultSettings();
	if (pongIsCustom)
		applyCustomSettings();
	gameSettings.gameType = "tournament";
	gameSettings.connectionType = "remote"
	gameSettings.playerNames = tournamentPlayerNames;

	tournamentRoot = generateTournamentTree();

	return gameSettings;
}

function getRemoteSettings(player1name, player2name)
{
	let settings = getDefaultSettings();
	if (pongIsCustom)
		applyCustomSettings();
	settings.gameType = "duel";
	settings.connectionType = "remote";
	settings.namePlayer1 = player1name;
	settings.namePlayer2 = player2name;
	settings.playerNames = [player1name, player2name];
	return settings;
}

function applyCustomSettings()
{
	gameSettings.customSettings = true;
	gameSettings.targetScore = customSettings.targetScore;
	gameSettings.paddleSpeed = customSettings.paddleSpeed;
	gameSettings.initialSpeed = customSettings.initialSpeed;
	gameSettings.speedIncrease = customSettings.speedIncrease;
	gameSettings.modifiers = customSettings.modifiers;
	gameSettings.modifierCooldown = customSettings.modifierCooldown;
	gameSettings.modifierStrength = customSettings.modifierStrength;
	gameSettings.modifierDuration = customSettings.modifierDuration;
	gameSettings.colorBackground = customSettings.colorBackground;
	gameSettings.colorPaddleLeft = customSettings.colorPaddleLeft;
	gameSettings.colorPaddleRight = customSettings.colorPaddleRight
	gameSettings.colorBall = customSettings.colorBall;
	gameSettings.colorTrail = customSettings.colorTrail;
}

function MoveTowards(from, target, delta)
{
	if (Math.abs(target - from) <= delta)
	{
		return target;
	}
	return from + Math.sign(target - from) * delta;
}

function Interpolate(v1, v2, t)
{
	return (1 - t) * v1 + t * v2;
}

// Function to clamp a value between min and max
function clamp(value, min, max)
{
	return Math.max(min, Math.min(value, max));
}

// Function to check if circle and AABB overlap
function isCircleAABBOverlap(cx, cy, radius, xMin, yMin, xMax, yMax)
{
	// Find the closest point on the AABB to the circle's center
	let closestX = clamp(cx, xMin, xMax);
	let closestY = clamp(cy, yMin, yMax);

	// Calculate the distance between the circle's center and this closest point
	let distanceX = cx - closestX;
	let distanceY = cy - closestY;

	// Calculate squared distance (to avoid sqrt for performance reasons)
	let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

	// Check if the distance is less than or equal to the radius squared
	return distanceSquared <= (radius * radius);
}

// Function to check if circle and circle overlap
function isCircleCircleOverlap(x1, y1, r1, x2, y2, r2)
{
	// Calculate the distance between the centers of the two circles
	let distanceX = x2 - x1;
	let distanceY = y2 - y1;

	// Calculate squared distance (to avoid sqrt for performance reasons)
	let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

	// Calculate the sum of the radii squared
	let radiiSum = r1 + r2;
	let radiiSumSquared = radiiSum * radiiSum;

	// Check if the distance is less than or equal to the sum of the radii squared
	return distanceSquared <= radiiSumSquared;
}

function score(scorer)
{
	if (hasScored)
		return;
	hasScored = true;
	scorer.score++;
	// scoreText.innerText = pad1.playerName + " " + pad1.score + " - " + pad2.score + " " + pad2.playerName;

	lastScorer = scorer;
	countdownGlobal = 5;
	countdownType = "score";
	
	// explosion
	for (let i = 0; i < 100; i++)
	{
		let randomAngle = Math.random() * Math.PI * 2;
		let randomSpeed = Math.random() * 900;
		let randomSize = Math.random() * 10 + 25;
		new ParticleEffect(ball.posX, ball.posY, lastScorer.color, randomSize, Math.sin(randomAngle), Math.cos(randomAngle), randomSpeed, countdownGlobal / 3);
	}

	ball.posX = fieldWidth / 2;
	ball.posY = fieldHeight / 2;
}

function endGame(gameEndMessage)
{
	gameOngoing = false;

	screenMessage = gameEndMessage;
	
	if (gameSettings.connectionType == "local")
		pongRoomName = Date.now();
	let gameType = gameSettings.gameType;
	if (gameSettings.customSettings)
	{
		if (gameSettings.connectionType === "local" && gameSettings.gameType === "duel")
			gameType = "custom_local";
		else if (gameSettings.connectionType === "remote" && gameSettings.gameType === "duel")
			gameType = "custom_remote";
		else if (gameSettings.connectionType === "local" && gameSettings.gameType === "tournament")
			gameType = "custom_localTournament";
		else if (gameSettings.connectionType === "remote" && gameSettings.gameType === "tournament")
			gameType = "custom_remoteTournament";
	}
	let game_data = {
		game_type: gameType,
		room_name: pongRoomName,
		player1: pad1.playerName,
		player2: pad2.playerName,
		player1_score: pad1.score,
		player2_score: pad2.score
	};
	
	if (gameSettings.typePlayer1 === "cpu" || gameSettings.typePlayer2 === "cpu")
		game_data.game_type = "ai_match";
	if (gameSettings.gameType === "duel" && gameSettings.connectionType === "remote")
		game_data.game_type = "remote";

	if (gameSettings.gameType === 'tournament') {
		if (game_data.player1 === current_user && game_data.player1_score > game_data.player2_score ||
			game_data.player2 === current_user && game_data.player2_score > game_data.player1_score) {
			fetch ('/api/pong_log_tournament_win/', {
				method: 'POST',
			headers: {
				'X-csrftoken': csrftoken_var,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({username: current_user}),
			credentials: 'same-origin'
			})
			.then(response => {
				if (response.status === 401 || response.status === 403)
					userCannotPost();
				else if (!response.ok)
					throw new Error('Tournament win logging failed:', response.statusText);
				return response.json();
			})
			.then(data => {
				console.log('Tournament win logged:', data);
			})
			.catch(error => {
				console.error('Error logging tournament win:', error);
			});
		}
	}
	else
	{
		fetch('/api/pong_log_stats/', {
			method: 'POST',
			headers: {
				'X-csrftoken': csrftoken_var,
				'Content-Type': 'application/json'
		},
		body: JSON.stringify(game_data),
		credentials: 'same-origin'
		})
		.then(response => {
			if (response.status === 401 || response.status === 403)
				userCannotPost();
			else if (!response.ok)
				throw new Error('Game stats logging failed:', response.statusText);
			return response.json();
		})
		.then(data => {
			console.log('Game stats logged:', data);
		})
		.catch(error => {
			console.error('Error logging stats:', error);
		});
	}
	pongRoomName = '';
}

function newPlay()
{
	pad1.modifierList = [];
	pad2.modifierList = [];

	pad1.posY = fieldHeight / 2;
	pad2.posY = fieldHeight / 2;

	ball.moveDirX *= -1;
	
	ball.posX = fieldWidth / 2;
	ball.posY = fieldHeight / 2;
	ball.moveSpeed = initialSpeed;
	countdownGlobal = 4;
	countdownType = "newPlay"
	screenMessage = "";
	hasScored = false;
}

function init()
{
	playerQuit = false;
	if (gameSettings.gameType === "tournament")
	{
		tournamentRoot.generateTreeHTML();
		let nextMatch = tournamentRoot.findNextEmptyNode2();
		if (nextMatch === null)
			return;

		pad1.playerName = nextMatch.branchRight.playerName;
		pad2.playerName = nextMatch.branchLeft.playerName;

		if (pad1.playerName === current_user || pad2.playerName === current_user)
			document.getElementById('tournamentAlert').classList.remove('hide');
	}

	pad1.score = 0;
	pad2.score = 0;
	ball.moveDirX = Math.cos(0.174533);
	ball.moveDirY = Math.sin(0.174533);
	ball.moveSpeed = gameSettings.initialSpeed;
	gameOngoing = true;
	timeCurrent = Date.now();
	newPlay();
}

function generateTournamentTree()
{
	let currNodes = [];
	let prevNodes = [];

	// Calculate the next power of 2 greater than or equal to the number of participants
	let playerCount = gameSettings.playerNames.length;
	let nextPowerOf2 = 1;
	while (nextPowerOf2 < playerCount) {
		nextPowerOf2 *= 2;
	}

	// Number of filler nodes needed
	let fillerCount = nextPowerOf2 - playerCount;

	// Create nodes for participants, placing filler nodes strategically
	let playersWithFillers = [];
	for (let i = 0; i < playerCount; i++) {
		playersWithFillers.push(new TournamentNode(gameSettings.playerNames[i], null, null, null));
	}
	
	// Distribute fillers at the bottom of the initial matchups
	let fillerName = null;
	for (let i = 0; i < fillerCount; i++) {
		playersWithFillers.push(new TournamentNode(fillerName, null, null, null));
	}

	// Shuffle or rearrange `playersWithFillers` to ensure fillers only wait 1 match
	// Example rearrangement: keep fillers at the second position of pairings
	let shuffledNodes = [];
	for (let i = 0; i < nextPowerOf2 / 2; i++) {
		shuffledNodes.push(playersWithFillers[i]);
		if (i + nextPowerOf2 / 2 < playersWithFillers.length) {
			shuffledNodes.push(playersWithFillers[i + nextPowerOf2 / 2]);
		}
	}

	// Initialize `currNodes` with the shuffled or rearranged players
	currNodes = shuffledNodes;

	// Build the tournament tree
	while (currNodes.length > 1) {
		prevNodes = currNodes;
		currNodes = [];

		for (let i = 0; i < prevNodes.length / 2; i++) {
			let child1 = prevNodes[i * 2];
			let child2 = prevNodes[i * 2 + 1];
			let newNode = new TournamentNode("", child1, child2, null);
			child1.parent = newNode;
			child2.parent = newNode;
			currNodes.push(newNode);

			// stuff to skip matches with filler nodes
			if (child1.isFiller())
			{
				newNode.playerName = child2.playerName;
				child2.playerName = null;
				child2.winner = true;
			}
			else if (child2.isFiller())
			{
				newNode.playerName = child1.playerName;
				child1.playerName = null;
				child1.winner = true;
			}
		}
	}

	return currNodes[0]; // Return the root of the tree
}


function keyPress(key)
{
	return !prevPresses[key] && currentPresses[key];
}

function keyHold(key)
{
	return currentPresses[key];
}

function keyRelease(key)
{
	return prevPresses[key] && !currentPresses[key];
}

function handleInputs()
{
	prevPresses = { ...currentPresses };
	currentPresses[GameInputs.KEY_ESC] = pressEsc;
	currentPresses[GameInputs.KEY_UP] = pressUp;
	currentPresses[GameInputs.KEY_DOWN] = pressDown;
	currentPresses[GameInputs.KEY_W] = pressW;
	currentPresses[GameInputs.KEY_S] = pressS;

	pad1.requestUp = false;
	pad1.requestDown = false;
	pad2.requestUp = false;
	pad2.requestDown = false;

	if (gameSettings.connectionType !== "remote")
		requestPause = keyPress(GameInputs.KEY_ESC);

	if (gameSettings.connectionType === "local")
	{
		if (pad1.playerType === "human")
		{
			pad1.requestUp = keyHold(GameInputs.KEY_W);
			pad1.requestDown = keyHold(GameInputs.KEY_S);
		}
		else if (pad1.playerType === "cpu")
			pad1.decideMovement();
		
		if (pad2.playerType === "human")
		{
			pad2.requestUp = keyHold(GameInputs.KEY_UP);
			pad2.requestDown = keyHold(GameInputs.KEY_DOWN);
		}
		else if (pad2.playerType === "cpu")
			pad2.decideMovement();
	}
	else if (gameSettings.connectionType === "remote")
	{
		let myPad = null;
		if (current_user === pad1.playerName)
			myPad = pad1;
		else if (current_user === pad2.playerName)
			myPad = pad2;
		if (myPad == null)
			return;

		myPad.requestUp = keyHold(GameInputs.KEY_W) || keyHold(GameInputs.KEY_UP);
		myPad.requestDown = keyHold(GameInputs.KEY_S) || keyHold(GameInputs.KEY_DOWN);
		pongSocket.send(JSON.stringify({
			'type': 'send_pad_state',
			'pad_name': myPad.playerName,
			'pad_side': myPad === pad1 ? "left" : "right",
			'pos_x': myPad.posX,
			'pos_y': myPad.posY,
			'request_up': myPad.requestUp,
			'request_down': myPad.requestDown
		}));
	}
}

function handlePause()
{
	if (countdownGlobal >= 1)
		return;

	if (requestPause)
		isPaused = !isPaused;
}

function updateRemotePad(data)
{
	if (countdownGlobal >= 1)
		return;
	if (data.pad_name === current_user)
		return;

	let otherPad = null;
	if (data.pad_side === "left")
		otherPad = pad1;
	else if (data.pad_side === "right")
		otherPad = pad2;

	if (otherPad == null)
		return;

	otherPad.posX = data.pos_x;
	otherPad.posY = data.pos_y;
	otherPad.requestUp = data.request_up;
	otherPad.requestDown = data.request_down;
}

function updateRemoteBall(data)
{
	if (data.pad_name === current_user)
		return;
	ball.posX = data.pos_x;
	ball.posY = data.pos_y;
	ball.moveDirX = data.move_dir_x;
	ball.moveDirY = data.move_dir_y;
	ball.moveSpeed = data.move_speed;
	new CollisionEffect(ball.posX, ball.posY, "#ffffff", 1, 0, ball.radius, ball.radius + ball.radius * (ball.moveSpeed - 600) / 120, 0.4);
}

function updateRemoteScore(data)
{
	if ((data.scorer === pad1.playerName && current_user === pad2.playerName) ||
		(data.scorer === pad2.playerName && current_user === pad1.playerName))
		return;
	let otherPad;
	if (data.scorer === pad1.playerName)
		otherPad = pad1;
	else if (data.scorer === pad2.playerName)
		otherPad = pad2;
	else
		console.error("bad remote scorer:", data.scorer);
	score(otherPad);
}

function updateRemoteModifierSpawn(data)
{
	// console.log("updateRemoteModifierSpawn", data)
	if (current_user === pad1.playerName)
		return;
	new Modifier(data.pos_x, data.pos_y, data.radius, data.mod_type, data.strength, data.color, data.duration);
}

function remoteOpponentLeft(quitter_name)
{
	if (gameSettings.connectionType !== "remote")
		return;

	if (!gameOngoing)
		return;

	let quitter_pad = null;
	if (pad1.playerName == quitter_name)
	{
		quitter_pad = pad1;
		lastScorer = pad2;
	}
	else if (pad2.playerName == quitter_name)
	{
		quitter_pad = pad2;
		lastScorer = pad1;
	}

	if (gameSettings.gameType === "tournament")
	{
		tournamentRoot.toggleQuit(quitter_name);
		if (quitter_pad !== null)
		{
			quitter_pad.score = -1;
			screenMessage = quitter_name + getTranslation(" Left");
			countdownGlobal = 4;
			countdownType = "score";
			playerQuit = true;
		}
	}
	else
	{
		quitter_pad.score = -1;
		endGame(quitter_name + getTranslation(" Left"));
	}
}

function modifierSpawner()
{
	if (gameSettings.modifiers.length == 0 || countdownNextModifier >= 0 || (gameSettings.connectionType === "remote" && current_user !== pad1.playerName))
		return;

	countdownNextModifier = gameSettings.modifierCooldown;

	let posX = Math.random() * fieldWidth;
	let posY = Math.random() * fieldHeight;
	let modTypeIndex = Math.floor((Math.random() * gameSettings.modifiers.length));
	let color;
	if (gameSettings.modifiers[modTypeIndex] === "speed")
		color = "#24b2ff";
	else if (gameSettings.modifiers[modTypeIndex] === "height")
		color = "#eb9b34";
	new Modifier(posX, posY, 50, gameSettings.modifiers[modTypeIndex], gameSettings.modifierStrength, color, gameSettings.modifierDuration);
	
	if (gameSettings.connectionType === "remote")
	{
		pongSocket.send(JSON.stringify({
			'type': 'send_mod_spawn',
			'pos_x': posX,
			'pos_y': posY,
			'radius': 50,
			'mod_type': gameSettings.modifiers[modTypeIndex],
			'strength': gameSettings.modifierStrength,
			'color': color,
			'duration': gameSettings.modifierDuration
		}));
	}
}

function handleCountdown()
{
	if (countdownGlobal >= 1)
		countdownGlobal -= deltaTime * 2;
	
	if (countdownGlobal < 1 && countdownNextModifier >= 0 && !isPaused)
		countdownNextModifier -= deltaTime;

	if (countdownGlobal < 1 && countdownType === "score")
	{
		// check for end game
		if (lastScorer.score >= targetScore || playerQuit)
		{
			if (gameSettings.gameType !== "tournament")
				endGame(getTranslation("Game Over"));
			else
			{
				let tournamentAlert = document.getElementById('tournamentAlert');
				if (tournamentAlert && !tournamentAlert.classList.contains('hide'))
					tournamentAlert.classList.add('hide');
				let match2 = tournamentRoot.findNextEmptyNode2();
				let match = tournamentRoot.findNextEmptyNode();
				if (match === null)
					endGame(getTranslation("Game Over"));
				else // set last scoring player's node as the winner and start the next match
				{
					let winnerNode;
					if (lastScorer.playerName === match2.branchLeft.playerName)
						winnerNode = match2.branchLeft;
					else if (lastScorer.playerName === match2.branchRight.playerName)
						winnerNode = match2.branchRight;
					winnerNode.toggleWinner();

					if ((gameSettings.connectionType === "remote" && winnerNode.playerName === current_user)
						|| (gameSettings.connectionType === "local" && (pad1.playerName === current_user || pad2.playerName === current_user)))
					{
						let roomname = current_user + "_" + Date.now();
						let gameType;
						if (gameSettings.connectionType === "local")
							gameType = "local_tournament";
						else if (gameSettings.connectionType === "remote")
							gameType = "remote_tournament";
						let player1name;
						let player2name;
						if (gameSettings.connectionType === "remote")
						{
							player1name = pad1.playerName;
							player2name = pad2.playerName;
						}
						else if (gameSettings.connectionType === "local")
						{
							if (pad1.playerName === current_user)
							{
								player1name = pad1.playerName;
								player2name = "Guest";
							}
							else
							{
								player1name = "Guest";
								player2name = pad2.playerName;
							}
						}
						let game_data = {
							game_type: gameType,
							room_name: roomname,
							player1: player1name,
							player2: player2name,
							player1_score: pad1.score,
							player2_score: pad2.score
						};
						fetch('/api/pong_log_stats/', {
							method: 'POST',
							headers: {
								'X-csrftoken': csrftoken_var,
								'Content-Type': 'application/json'
						},
						body: JSON.stringify(game_data),
						credentials: 'same-origin'
						})
						.then(response => {
							if (response.status === 401 || response.status === 403)
								userCannotPost();
							else if (!response.ok)
								throw new Error('Game stats logging failed:', response.statusText);
							return response.json();
						})
						.then(data => {
							console.log('Game stats logged:', data);
						})
						.catch(error => {
							console.error('Error logging stats:', error);
						});
					}
					init();
				}
			}
		}
		else
			newPlay();
	}
}

// lists
var listDrawables;
var listMovables;
var listTemps;
var listMods;


function moveObjects()
{
	listMovables.forEach(obj => {
		obj.move();
	});
	listMods.forEach(obj => {
		obj.checkCollision();
	});
	listTemps.forEach(obj => {
		obj.move();
	});
}

function drawObjects()
{
	// draw background
	ctx.fillStyle = gameSettings.colorBackground;
	ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

	// draw line in the middle
	ctx.fillStyle = "#ffffff44";
	ctx.fillRect(canvasElement.width/2 - 8 * scaleFactor, 0, 16 * scaleFactor, canvasElement.height);

	// draw temporary effects
	listTemps.forEach(obj => {
		obj.draw();
	});

	// draw each object
	listDrawables.forEach(obj => {
		obj.draw();
	});

	// draw ui header
	const uiBorderSize = pongHeaderHeight / 12 * scaleFactor;
	ctx.fillStyle = "#0a1d40";
	ctx.fillRect(0, 0, canvasElement.width, pongHeaderHeight * scaleFactor);
	ctx.fillStyle = "#16397a";
	ctx.fillRect(uiBorderSize, uiBorderSize, (canvasElement.width - uiBorderSize * 2) / 2 - uiBorderSize / 2, pongHeaderHeight * scaleFactor - uiBorderSize * 2);
	ctx.fillRect(uiBorderSize/2 + canvasElement.width/2, uiBorderSize, (canvasElement.width - uiBorderSize * 2) / 2 - uiBorderSize / 2, pongHeaderHeight * scaleFactor - uiBorderSize * 2);

	// draw scores
	let scoreToPrint = pad1.score < 0 ? "-" : pad1.score;
	ctx.textAlign = "left";
	ctx.font = pongHeaderHeight * 0.95 * scaleFactor + 'px monospace';
	ctx.strokeStyle = "grey";
	ctx.lineWidth = 10 * scaleFactor;
	ctx.strokeText(scoreToPrint, canvasElement.width * 0.5 * 0.85, pongHeaderHeight * 0.85 * scaleFactor);
	if (countdownGlobal >= 1 && countdownType === "score" && lastScorer == pad1 && Math.floor(countdownGlobal * 4) % 2)
		ctx.fillStyle = "gold";
	else
		ctx.fillStyle = "#f8f8f8";
	ctx.fillText(scoreToPrint, canvasElement.width * 0.5 * 0.85, pongHeaderHeight * 0.85 * scaleFactor);

	scoreToPrint = pad2.score < 0 ? "-" : pad2.score;
	ctx.textAlign = "right";
	ctx.font = pongHeaderHeight * 0.95 * scaleFactor + 'px monospace';
	ctx.strokeStyle = "grey";
	ctx.lineWidth = 10 * scaleFactor;
	ctx.strokeText(scoreToPrint, canvasElement.width * 0.5 + canvasElement.width * 0.5 * 0.15, pongHeaderHeight * 0.85 * scaleFactor);
	if (countdownGlobal >= 1 && countdownType === "score" && lastScorer == pad2 && Math.floor(countdownGlobal * 4) % 2)
		ctx.fillStyle = "gold";
	else
		ctx.fillStyle = "#f8f8f8";
	ctx.fillText(scoreToPrint, canvasElement.width * 0.5 + canvasElement.width * 0.5 * 0.15, pongHeaderHeight * 0.85 * scaleFactor);

	// draw usernames
	ctx.textAlign = "left";
	ctx.font = pongHeaderHeight * 0.6 * scaleFactor + 'px monospace';
	ctx.strokeStyle = "grey";
	ctx.lineWidth = 10 * scaleFactor;
	ctx.strokeText(pad1.playerName, canvasElement.width * 0.5 * 0.03, pongHeaderHeight * 0.7 * scaleFactor);
	ctx.fillStyle = "#f8f8f8";
	ctx.fillText(pad1.playerName, canvasElement.width * 0.5 * 0.03, pongHeaderHeight * 0.7 * scaleFactor);

	ctx.textAlign = "right";
	ctx.font = pongHeaderHeight * 0.6 * scaleFactor + 'px monospace';
	ctx.strokeStyle = "grey";
	ctx.lineWidth = 10 * scaleFactor;
	ctx.strokeText(pad2.playerName, canvasElement.width * 0.5 + canvasElement.width * 0.5 * 0.97, pongHeaderHeight * 0.7 * scaleFactor);
	ctx.fillStyle = "#f8f8f8";
	ctx.fillText(pad2.playerName, canvasElement.width * 0.5 + canvasElement.width * 0.5 * 0.97, pongHeaderHeight * 0.7 * scaleFactor);

	// draw countdown if needed
	if (countdownGlobal >= 1 && countdownType === "newPlay")
	{
		// draw user1 VS user2
		ctx.textAlign = "center";
		ctx.font = 97 * scaleFactor + 'px Sans-serif';
		ctx.strokeStyle = "#264a78";
		ctx.lineWidth = 10 * scaleFactor;
		ctx.fillStyle = "white";
		ctx.strokeText(pad1.playerName, canvasElement.width / 2, canvasElement.height * 0.18);
		ctx.fillText(pad1.playerName, canvasElement.width / 2, canvasElement.height * 0.18);
		ctx.strokeText("VS", canvasElement.width / 2, canvasElement.height * 0.28);
		ctx.fillText("VS", canvasElement.width / 2, canvasElement.height * 0.28);
		ctx.strokeText(pad2.playerName, canvasElement.width / 2, canvasElement.height * 0.38);
		ctx.fillText(pad2.playerName, canvasElement.width / 2, canvasElement.height * 0.38);
			

		// draw countdown
		ctx.textAlign = "center";
		ctx.font = 200 * scaleFactor + 'px Sans-serif';
		ctx.strokeStyle = "#264a78";
		ctx.lineWidth = 25 * scaleFactor;
		ctx.strokeText(Math.floor(countdownGlobal), canvasElement.width / 2, canvasElement.height / 2 + 100 * scaleFactor);
		ctx.fillStyle = "white";
		ctx.fillText(Math.floor(countdownGlobal), canvasElement.width / 2, canvasElement.height / 2 + 100 * scaleFactor);
	}

	// draw on screen message
	ctx.textAlign = "center";
	ctx.font = 200 * scaleFactor +'px Sans-serif';
	ctx.strokeStyle = "red";
	ctx.lineWidth = 25 * scaleFactor;
	ctx.strokeText(screenMessage, canvasElement.width / 2, canvasElement.height / 2 + 100 * scaleFactor);
	ctx.fillStyle = "white";
	ctx.fillText(screenMessage, canvasElement.width / 2, canvasElement.height / 2 + 100 * scaleFactor);

	if (isPaused)
	{
		ctx.fillStyle = "#00000066";
		ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
	}
}

function tickTemps()
{
	if (isPaused)
		return;

	listTemps.forEach(obj => {
		obj.tickTime();
	});
}

function gameUpdate()
{
	if (gameOngoing)
	{
		handleInputs();
		handlePause();
		handleCountdown();
		modifierSpawner();
		moveObjects();
		pad1.updateModifiers();
		pad2.updateModifiers();
		tickTemps();
	}
	drawObjects();
}

function gameLoop()
{
	if (canvasExit)
		return;
	timePrevious = timeCurrent;
	timeCurrent = Date.now();
	deltaTime = (timeCurrent - timePrevious) / 1000;
	gameUpdate();
	requestAnimationFrame(gameLoop)
}

//   .oooooo.    ooooo          .oooooo.   oooooooooo.        .o.       ooooo         .oooooo..o 
//  d8P'  `Y8b   `888'         d8P'  `Y8b  `888'   `Y8b      .888.      `888'        d8P'    `Y8 
// 888            888         888      888  888     888     .8"888.      888         Y88bo.      
// 888            888         888      888  888oooo888'    .8' `888.     888          `"Y8888o.  
// 888     ooooo  888         888      888  888    `88b   .88ooo8888.    888              `"Y88b 
// `88.    .88'   888       o `88b    d88'  888    .88P  .8'     `888.   888       o oo     .d8P 
//  `Y8bood8P'   o888ooooood8  `Y8bood8P'  o888bood8P'  o88o     o8888o o888ooooood8 8""88888P'  

var gameSettings;
var pongIsCpu;
var pongIsRemote;
var pongIsTournament;
var pongIsCustom;
var tournamentPlayerNames;
var pongRoomName;
var tournamentRoomName;
var requestPause;
var isPaused;
var pongHeaderHeight = 100;
var lastScorer;
var hasScored;
var playerQuit;

var canvasContainer;
var canvasElement;
var ctx;


var initialSpeed;
var speedIncrease;
var targetScore;
var gameOngoing;
var canvasExit;
var screenMessage;

var countdownGlobal;
var countdownNextModifier;
var countdownType;
var timeCurrent;
var timePrevious;
var deltaTime;

var fieldWidth;
var fieldHeight;

var scaleFactor;

var pressEsc;
var pressW;
var pressS;
var pressUp;
var pressDown;
var currentPresses;
var prevPresses;


// values
var padHeight;
var padWidth;
var ballRadius;

// objects
var pad1;
var pad2;
var ball;
var tournamentRoot;

function startGameWithSettings(settings)
{
	gameSettings = settings;

	initialSpeed = gameSettings.initialSpeed;
	speedIncrease = gameSettings.speedIncrease;
	targetScore = gameSettings.targetScore;
	countdownNextModifier = gameSettings.modifierCooldown;
	
	pad1 = new Pad(10, fieldHeight / 2, gameSettings.colorPaddleLeft, padWidth, padHeight, gameSettings.paddleSpeed, gameSettings.typePlayer1);
	pad2 = new Pad(fieldWidth - padWidth - 10, fieldHeight / 2, gameSettings.colorPaddleRight, padWidth, padHeight, gameSettings.paddleSpeed, gameSettings.typePlayer2);
	ball = new Ball(fieldWidth / 2, fieldHeight / 2, gameSettings.colorBall, 35);
	
	pad1.playerType = gameSettings.typePlayer1;
	pad2.playerType = gameSettings.typePlayer2;
	pad1.playerName = gameSettings.namePlayer1;
	pad2.playerName = gameSettings.namePlayer2;

	// lists
	listDrawables = [];
	listMovables = [];
	listTemps = [];
	listMods = [];

	listDrawables.push(pad1);
	listDrawables.push(pad2);
	listDrawables.push(ball);
	listMovables.push(pad1);
	listMovables.push(pad2);
	listMovables.push(ball);


	init();
	gameLoop();
}

function tournamentMapToggle()
{
	const canvas = document.getElementById("canvasContainer");
	const panel = document.getElementById("tournamentMap");
	if (panel.style.right === "0px")
	{
		canvas.style.marginLeft = "20%";
		panel.style.right = "-38%";
	}
	else
	{
		canvas.style.marginLeft = "1%";
		panel.style.right = "0px";
	}
}

function initializeJS() {
	pong_game(false);

	requestPause = false;
	isPaused = false;

	canvasContainer = document.getElementById("canvasContainer");
	canvasElement = document.getElementById("gameCanvas");
	ctx = canvasElement.getContext("2d");

	gameOngoing = false;
	canvasExit = false;

	screenMessage = "";
	countdownGlobal = 0.0;
	countdownType = "";

	fieldWidth = 1920;
	fieldHeight = 1080 - pongHeaderHeight;
	canvasElement.width = canvasContainer.clientWidth;
	canvasElement.height = canvasContainer.clientHeight;

	scaleFactor = canvasContainer.clientWidth / 1920;

	window.addEventListener("resize", function(event)
	{
		canvasElement.width = canvasContainer.clientWidth;
		canvasElement.height = canvasContainer.clientHeight;
		scaleFactor = canvasContainer.clientWidth / 1920;
	});

	pressEsc = false;
	pressW = false;
	pressS = false;
	pressUp = false;
	pressDown = false;
	currentPresses = [false, false, false, false, false];
	prevPresses = [false, false, false, false, false];

	document.addEventListener('keydown', function(event)
	{
		if (event.key === "Escape")
			pressEsc = true;
		else if (event.key === "w" || event.key === "W")
			pressW = true;
		else if (event.key === "s" || event.key === "S")
			pressS = true;
		else if (event.key === "ArrowUp")
			pressUp = true;
		else if (event.key === "ArrowDown")
			pressDown = true;
	});

	document.addEventListener('keyup', function(event)
	{
		if (event.key === "Escape")
			pressEsc = false;
		else if (event.key === "w" || event.key === "W")
			pressW = false;
		else if (event.key === "s" || event.key === "S")
			pressS = false;
		else if (event.key === "ArrowUp")
			pressUp = false;
		else if (event.key === "ArrowDown")
			pressDown = false;
	});

	// values
	padHeight = 200;
	padWidth = 40;
	ballRadius = 35;

	if (pongIsTournament)
		document.getElementById("tournamentMapToggleButton").classList.remove("hide");

	if (pongIsRemote && !pongIsTournament)
	{
		pongSocket.send(JSON.stringify({
			'type': 'start_game',
			'username': current_user,
		}));
	}
	else if (pongIsRemote && pongIsTournament)
	{
		// Show message showing who is to play next
		pongSocket.send(JSON.stringify({
			'type': 'start_tournament_game',
			'username': current_user,
		}));
	}
	else if (pongIsTournament && !pongIsRemote)
		startGameWithSettings(getLocalTournamentSettings());
	else if (pongIsCpu)
		startGameWithSettings(getLocalSettings(current_user, ""));
	else
		startGameWithSettings(getLocalSettings(current_user, "Guest"));
	pongIsCpu = false;
	pongIsRemote = false;
	pongIsTournament = false;
	pongIsCustom = false;
}
