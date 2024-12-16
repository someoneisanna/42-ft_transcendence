function getDefaultSettings()
{
	let settings = new GameSettings();
	settings.gameType = "local";
	settings.initialSpeed = 10.0;
	settings.speedIncrease = 1;
	settings.targetScore = 1;
	settings.typePlayer1 = "human";
	settings.typePlayer2 = "human";
	settings.namePlayer1 = "";
	settings.namePlayer2 = "";
	settings.playerNames = [];
	settings.modifiers = true;
	settings.modifierCooldown = 3;
	return settings;
}

function getLocalSettings(player1name, player2name)
{
	let settings = getDefaultSettings();
	settings.namePlayer1 = player1name;
	settings.namePlayer2 = player2name;
	
	settings.gameType = "local";
	if (settings.namePlayer1 === "")
	{
		settings.typePlayer1 = "cpu";
		settings.namePlayer1 = "Bot #1";
	}
	if (settings.namePlayer2 === "")
	{
		settings.typePlayer2 = "cpu";
		settings.namePlayer2 = "Bot #2";
	}

	return settings;
}

function getLocalTournamentSettings()
{
	console.log("getLocalTournamentSettings");
	gameSettings = getDefaultSettings();
	gameSettings.gameType = "localTournament";
	// gameSettings.typePlayer1 = "human";
	gameSettings.playerNames = tournamentPlayerNames;

	tournamentRoot = generateTournamentTree();

	return gameSettings;
}

function getRemoteSettings(player1name, player2name)
{
	let settings = getDefaultSettings();
	settings.gameType = "remote";
	settings.namePlayer1 = player1name;
	settings.namePlayer2 = player2name;
	return settings;
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
	scorer.score++;
	scoreText.innerText = pad1.playerName + " " + pad1.score + " - " + pad2.score + " " + pad2.playerName;

	if (scorer.score >= gameSettings.targetScore)
	{
		if (gameSettings.gameType !== "localTournament")
			endGame("Game Over");
		else
		{
			let match = tournamentRoot.findNextEmptyNode();
			//console.log("matchnode", match);
			if (match === null)
				endGame("Game Over");
			else
			{
				let winnerNode;
				if (scorer.playerName === match.branchLeft.playerName)
					winnerNode = match.branchLeft;
				else if (scorer.playerName === match.branchRight.playerName)
					winnerNode = match.branchRight;
				winnerNode.toggleWinner();
				init();
			}
		}
	}
	else
		newPlay();
}

function endGame(gameEndMessage)
{
	gameOngoing = false;
	ctx.textAlign = "center";
	ctx.font = 200 * scaleFactor +'px Sans-serif';
	ctx.strokeStyle = "red";
	ctx.lineWidth = 25 * scaleFactor;
	ctx.strokeText(gameEndMessage, canvasElement.width / 2, canvasElement.height / 2 + 100 * scaleFactor);
	ctx.fillStyle = "white";
	ctx.fillText(gameEndMessage, canvasElement.width / 2, canvasElement.height / 2 + 100 * scaleFactor);
	
	if (pongRoomName === undefined)
		pongRoomName = '';
	let game_data = {
		game_type: gameSettings.gameType,
		room_name: pongRoomName,
		player1: gameSettings.namePlayer1,
		player2: gameSettings.namePlayer2,
		player1_score: pad1.score,
		player2_score: pad2.score
	};
	if (gameSettings.typePlayer1 === "cpu" || gameSettings.typePlayer2 === "cpu")
		game_data.game_type = "ai_match";
	// aaaaaaaaaaaaaaaaaaaaaaaaaaaaa
	if (gameSettings.gameType != 'localTournament')
	{
		console.log('Game data:', game_data);
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
				window.location.href = '/';
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
	countdown = 4;
}

function init()
{
	console.log("init");
	// DEBUG
	debugColorPickerBackground.value = backgroundColor;
	debugColorPickerPlayer1.value = pad1.color;
	debugColorPickerPlayer2.value = pad2.color;
	debugColorPickerBall.value = ball.color;
	debugTargetScore.value = targetScore;
	debugInitialSpeed.value = initialSpeed;
	debugSpeedIncrease.value = speedIncrease;
	////////

	if (gameSettings.gameType === "localTournament")
	{
		tournamentRoot.generateTreeHTML();
		let nextMatch = tournamentRoot.findNextEmptyNode();
		if (nextMatch === null)
			return;
		console.log("nextMatch", nextMatch);
		pad1.playerName = nextMatch.branchLeft.playerName;
		pad2.playerName = nextMatch.branchRight.playerName;
		console.log("pad1.playerName", pad1.playerName, "pad2.playerName", pad2.playerName);
	}

	pad1.score = 0;
	pad2.score = 0;
	scoreText.innerText = pad1.playerName + " " + pad1.score + " - " + pad2.score + " " + pad2.playerName;
	ball.moveDirX = 1;
	ball.moveSpeed = gameSettings.initialSpeed;
	gameOngoing = true;
	timeCurrent = Date.now();
	newPlay()
}

function generateTournamentTree()
{
	let currNodes = [];
	let prevNodes = [];

	for (let i = 0; i < gameSettings.playerNames.length; i++)
	{
		currNodes.push(new TournamentNode(gameSettings.playerNames[i], null, null, null));
	}
	
	while (currNodes.length > 1)
	{
		prevNodes = currNodes;
		currNodes = [];
	
		for (let i = 0; i < prevNodes.length / 2; i++)
		{
			newNode = new TournamentNode("", prevNodes[i * 2 + 0], prevNodes[i * 2 + 1], null);
			prevNodes[i * 2 + 0].parent = newNode;
			prevNodes[i * 2 + 1].parent = newNode;
			currNodes.push(newNode)
		}
	}

	return currNodes[0];
}

function handleInputs()
{
	pad1.requestUp = false;
	pad1.requestDown = false;
	pad2.requestUp = false;
	pad2.requestDown = false;

	if (gameSettings.gameType === "local" || gameSettings.gameType === "localTournament")
	{
		if (pad1.playerType === "human")
		{
			pad1.requestUp = pressW;
			pad1.requestDown = pressS;
		}
		else if (pad1.playerType === "cpu")
			pad1.decideMovement();
		
		if (pad2.playerType === "human")
		{
			pad2.requestUp = pressUp;
			pad2.requestDown = pressDown;
		}
		else if (pad2.playerType === "cpu")
			pad2.decideMovement();
	}
	else if (gameSettings.gameType === "remote")
	{
		let myPad;
		if (current_user === gameSettings.namePlayer1)
			myPad = pad1;
		else if (current_user === gameSettings.namePlayer2)
			myPad = pad2;
		myPad.requestUp = pressW || pressUp;
		myPad.requestDown = pressS || pressDown;
		pongSocket.send(JSON.stringify({
			'type': 'send_pad_state',
			'pad_name': myPad.playerName,
			'pos_x': myPad.posX,
			'pos_y': myPad.posY,
			'request_up': myPad.requestUp,
			'request_down': myPad.requestDown
		}));
	}
}

function updateRemotePad(data)
{
	if (data.pad_name === current_user)
		return;
	let otherPad;
	if (data.pad_name === pad1.playerName)
		otherPad = pad1;
	else if (data.pad_name === pad2.playerName)
		otherPad = pad2;
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
}

function updateRemoteScore(data)
{
	if (data.scorer !== current_user)
		return;
	let otherPad;
	if (data.scorer === pad1.playerName)
		otherPad = pad1;
	else if (data.scorer === pad2.playerName)
		otherPad = pad2;
	score(otherPad);
}

function remoteOpponentLeft()
{
	if (gameOngoing && gameSettings.gameType === "remote")
		endGame("Opponent Left");
}

function updateCountdown()
{	
	if (countdown >= 1)
	{
		countdown -= (timeCurrent - timePrevious) / 1000 * 3;
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
	
}

function drawObjects()
{
	if (!gameOngoing)
		return;

	// draw background
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
	
	// draw temporary effects
	listTemps.forEach(obj => {
		obj.draw();
	});

	// draw each object
	listDrawables.forEach(obj => {
		obj.draw();
	});

	// draw countdown if needed
	if (countdown >= 1)
	{
		ctx.textAlign = "center";
		ctx.font = 200 * scaleFactor + 'px Sans-serif';
		ctx.strokeStyle = "red";
		ctx.lineWidth = 25 * scaleFactor;
		ctx.strokeText(Math.floor(countdown), canvasElement.width / 2, canvasElement.height / 2 + 100 * scaleFactor);
		ctx.fillStyle = "white";
		ctx.fillText(Math.floor(countdown), canvasElement.width / 2, canvasElement.height / 2 + 100 * scaleFactor);
	}
}

function tickTemps()
{
	listTemps.forEach(obj => {
		obj.tickTime();
	});
}

function gameUpdate()
{
	handleInputs();
	updateCountdown();
	moveObjects();
	pad1.updateModifiers();
	pad2.updateModifiers();
	tickTemps();
	drawObjects();
}

function gameLoop()
{
	if (!gameOngoing)
		return;
	timePrevious = timeCurrent;
	timeCurrent = Date.now();
	gameUpdate();
	requestAnimationFrame(gameLoop)
}

//    _____ _      ____  ____          _       _____ 
//   / ____| |    / __ \|  _ \   /\   | |     / ____|
//  | |  __| |   | |  | | |_) | /  \  | |    | (___  
//  | | |_ | |   | |  | |  _ < / /\ \ | |     \___ \ 
//  | |__| | |___| |__| | |_) / ____ \| |____ ____) |
//   \_____|______\____/|____/_/    \_\______|_____/ 

var gameSettings;
var pongIsCpu;
var pongIsRemote;
var pongIsTournament;
var tournamentPlayerNames;
var pongRoomName;

var canvasContainer;
var canvasElement;
var ctx;
var scoreText;

// DEBUG /////////////////////////////
var debugPlayer1AI;
var debugPlayer2AI;
var debugGameResetButton;
var debugColorPickerBackground;
var debugColorPickerPlayer1;
var debugColorPickerPlayer2;
var debugColorPickerBall;
var debugSpeedModButton;
var debugHeightModButton;
var debugTargetScore;
var debugInitialSpeed;
var debugSpeedIncrease;

//////////////////////////////////////

var initialSpeed;
var speedIncrease;
var targetScore;
var gameOngoing;


var countdown;
var timeCurrent;
var timePrevious;

var fieldWidth;
var fieldHeight;

var scaleFactor;


var pressW;
var pressS;
var pressUp;
var pressDown;


// values
var padHeight;
var padWidth;
var ballRadius;
var backgroundColor;

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
	
	pad1 = new Pad(10, fieldHeight / 2, "#ff0000", padWidth, padHeight, gameSettings.typePlayer1);
	pad2 = new Pad(fieldWidth - padWidth - 10, fieldHeight / 2, "#0000ff", padWidth, padHeight, gameSettings.typePlayer2);
	ball = new Ball(fieldWidth / 2, fieldHeight / 2, "#00ff00", 35);
	
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

function initializeJS() {
	canvasContainer = document.getElementById("canvasContainer");
	canvasElement = document.getElementById("gameCanvas");
	ctx = canvasElement.getContext("2d");
	scoreText = document.getElementById("tally");

	debugPlayer1AI = document.getElementById("player1AI");
	debugPlayer2AI = document.getElementById("player2AI");
	debugGameResetButton = document.getElementById("gameResetButton");
	debugColorPickerBackground = document.getElementById("colorPickerBackground");
	debugColorPickerPlayer1 = document.getElementById("colorPickerPlayer1");
	debugColorPickerPlayer2 = document.getElementById("colorPickerPlayer2");
	debugColorPickerBall = document.getElementById("colorPickerBall");
	debugSpeedModButton = document.getElementById("speedModButton");
	debugHeightModButton = document.getElementById("heightModButton");
	debugTargetScore = document.getElementById("targetScore");
	debugInitialSpeed = document.getElementById("initialSpeed");
	debugSpeedIncrease = document.getElementById("speedIncrease");

	debugGameResetButton.addEventListener('click', function() {
		scoreText.innerText = pad1.playerName + " " + pad1.score + " - " + pad2.score + " " + pad2.playerName;
		if (gameOngoing)
			init();
		else
		{
			init();
			gameLoop();
		}
	});
	debugPlayer1AI.addEventListener('change', function() {
		pad1.playerType = debugPlayer1AI.value;
	});
	debugPlayer2AI.addEventListener('change', function() {
		pad2.playerType = debugPlayer2AI.value;
	});
	debugColorPickerBackground.addEventListener('input', function() {
		backgroundColor = debugColorPickerBackground.value;
	});
	debugColorPickerPlayer1.addEventListener('input', function() {
		pad1.color = debugColorPickerPlayer1.value;
	});
	debugColorPickerPlayer2.addEventListener('input', function() {
		pad2.color = debugColorPickerPlayer2.value;
	});
	debugColorPickerBall.addEventListener('input', function() {
		ball.color = debugColorPickerBall.value;
	});
	debugSpeedModButton.addEventListener('click', function() {
		var posX = Math.random() * fieldWidth;
		var posY = Math.random() * fieldHeight;
		new Modifier(posX, posY, 100, "speed", 1, "#0000ff", 5);
		// new Modifier(fieldWidth / 2, fieldHeight / 2, 100, "speed", 1, "#0000ff", 5);
	});
	debugHeightModButton.addEventListener('click', function() {
		var posX = Math.random() * fieldWidth;
		var posY = Math.random() * fieldHeight;
		new Modifier(posX, posY, 100, "height", 1, "#555555", 5);
		// new Modifier(fieldWidth / 2, fieldHeight / 2, 100, "height", 1, "#555555", 5);
	});
	debugTargetScore.addEventListener('input', function() {
		targetScore = debugTargetScore.value;
	});
	debugInitialSpeed.addEventListener('input', function() {
		initialSpeed = debugInitialSpeed.value;
	});
	debugSpeedIncrease.addEventListener('input', function() {
		speedIncrease = debugSpeedIncrease.value;
	});


	// initialSpeed = 10.0;
	// speedIncrease = 1;
	// targetScore = 20;

	gameOngoing = false;


	countdown = 0.0;

	fieldWidth = 1920;
	fieldHeight = 1080;
	canvasElement.width = canvasContainer.clientWidth;
	canvasElement.height = canvasContainer.clientHeight;

	scaleFactor = canvasContainer.clientWidth / 1920;

	window.addEventListener("resize", function(event)
	{
		canvasElement.width = canvasContainer.clientWidth;
		canvasElement.height = canvasContainer.clientHeight;
		scaleFactor = canvasContainer.clientWidth / 1920;
	});

	pressW = false;
	pressS = false;
	pressUp = false;
	pressDown = false;

	document.addEventListener('keydown', function(event)
	{
		if (event.key === "w" || event.key === "W")
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
		if (event.key === "w")
			pressW = false;
		else if (event.key === "s")
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
	backgroundColor = "#f7ffbd";

	if (pongIsRemote)
	{
		pongSocket.send(JSON.stringify({
			'type': 'start_game',
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
	pongIsTournament = false;
	pongIsRemote = false;
}
