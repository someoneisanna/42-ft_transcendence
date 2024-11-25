var gameSettings = {
	initialSpeed: 10.0,
	speedIncrease: 1,
	targetScore: 20,
	typePlayer1: "human",
	typePlayer2: "cpu",
	modifiers: true,
	modifierCooldown: 3
};

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
	scoreText.innerText = pad1.score + " - " + pad2.score;

	if (scorer.score >= targetScore)
		endGame();
	else
		newPlay();
}

function endGame()
{
	gameOngoing = false;
	ctx.textAlign = "center";
	ctx.font = 200 * scaleFactor +'px Sans-serif';
	ctx.strokeStyle = "red";
	ctx.lineWidth = 25 * scaleFactor;
	ctx.strokeText("Game Over", canvasElement.width / 2, canvasElement.height / 2 + 100 * scaleFactor);
	ctx.fillStyle = "white";
	ctx.fillText("Game Over", canvasElement.width / 2, canvasElement.height / 2 + 100 * scaleFactor);
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
	// DEBUG
	debugColorPickerBackground.value = backgroundColor;
	debugColorPickerPlayer1.value = pad1.color;
	debugColorPickerPlayer2.value = pad2.color;
	debugColorPickerBall.value = ball.color;
	debugTargetScore.value = targetScore;
	debugInitialSpeed.value = initialSpeed;
	debugSpeedIncrease.value = speedIncrease;
	////////

	pad1.score = 0;
	pad2.score = 0;
	ball.moveDirX = 1;
	ball.moveSpeed = initialSpeed;
	gameOngoing = true;
	timeCurrent = Date.now();
	newPlay()
}

function handleInputs()
{
	pad1.requestUp = false;
	pad1.requestDown = false;
	pad2.requestUp = false;
	pad2.requestDown = false;

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

function updateCountdown()
{	
	if (countdown >= 1)
	{
		countdown -= (timeCurrent - timePrevious) / 1000 * 3;
	}
}


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
	console.log(gameOngoing);
	if (!gameOngoing)
		return;
	timePrevious = timeCurrent;
	timeCurrent = Date.now();
	gameUpdate();
	requestAnimationFrame(gameLoop)
}

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

// lists
var listDrawables;
var listMovables;
var listTemps;
var listMods;


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
		scoreText.innerText = "0 - 0";
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

	
	initialSpeed = 10.0;
	speedIncrease = 1;
	targetScore = 20;
	gameOngoing = false;


	countdown = 0.0;
	timeCurrent;
	timePrevious;

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
		if (event.key === "w")
			pressW = true;
		else if (event.key === "s")
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

	// objects
	pad1 = new Pad(10, fieldHeight / 2, "#ff0000", padWidth, padHeight, debugPlayer1AI.value);
	pad2 = new Pad(fieldWidth - padWidth - 10, fieldHeight / 2, "#0000ff", padWidth, padHeight, debugPlayer2AI.value);
	ball = new Ball(fieldWidth / 2, fieldHeight / 2, "#00ff00", ballRadius);

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
