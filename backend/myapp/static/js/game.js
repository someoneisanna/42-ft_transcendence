var canvasContainer;
var canvasElement;
var ctx;
var scoreText;

// DEBUG /////////////////////////////
var debugGameResetButton;
var debugColorPickerBackground;
var debugColorPickerPlayer1;
var debugColorPickerPlayer2;
var debugColorPickerBall;
var debugTargetScore;
var debugInitialSpeed;
var debugSpeedIncrease;

//////////////////////////////////////

var initialSpeed = 14.0;
var speedIncrease = 7;
var targetScore = 200;
var gameOngoing = false;


var countdown = 0.0;
var timeCurrent;
var timePrevious;

var fieldWidth = 1920;
var fieldHeight = 1080;

var pressW = false;
var pressS = false;
var pressUp = false;
var pressDown = false;


function MoveTowards(from, target, delta)
{
	if (Math.abs(target - from) <= delta)
	{
		return target;
	}
	return from + Math.sign(target - from) * delta;
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
	ctx.font = '100px Sans-serif';
	ctx.strokeStyle = "red";
	ctx.lineWidth = 8;
	ctx.strokeText("Game Over", canvasElement.width / 2, canvasElement.height / 2 + 50);
	ctx.fillStyle = "white";
	ctx.fillText("Game Over", canvasElement.width / 2, canvasElement.height / 2 + 50);
}

function newPlay()
{
	pad1.y = fieldHeight / 2 - pad1.height / 2;
	pad2.y = fieldHeight / 2 - pad2.height / 2;

	ball.moveDir *= -1;
	ball.x = fieldWidth / 2;
	ball.y = fieldHeight / 2;
	ball.speedX = initialSpeed;
	countdown = 4;
}

// values
var padHeight = 200;
var padWidth = 40;
var ballRadius = 35;
var backgroundColor = "#f7ffbd"

// objects
var pad1 = new Pad(10, fieldHeight / 2 - padHeight / 2, "#ff0000", padWidth, padHeight);
var pad2 = new Pad(fieldWidth - padWidth - 10, fieldHeight / 2 - padHeight / 2, "#0000ff", padWidth, padHeight);
var ball = new Ball(fieldWidth / 2, fieldHeight / 2, "#00ff00", ballRadius);

// lists
var listDrawables = [];
var listMovables = [];

listDrawables.push(this.pad1);
listDrawables.push(this.pad2);
listDrawables.push(this.ball);
listMovables.push(this.pad1);
listMovables.push(this.pad2);
listMovables.push(this.ball);

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
	ball.speedX = initialSpeed;	
	gameOngoing = true;
	timeCurrent = Date.now();
	newPlay()
}

function handleInputs()
{
	pad1.requestUp = pressW;
	pad1.requestDown = pressS;
	
	pad2.requestUp = pressUp;
	pad2.requestDown = pressDown;
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
}

function drawObjects()
{
	if (!gameOngoing)
		return;

	// draw background
	ctx.fillStyle = backgroundColor;
	ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
	
	// draw each object
	listDrawables.forEach(obj => {
		obj.draw();
	});

	// draw countdown if needed
	if (countdown >= 1)
	{
		ctx.textAlign = "center";
		ctx.font = '100px Sans-serif';
		ctx.strokeStyle = "red";
		ctx.lineWidth = 8;
		ctx.strokeText(Math.floor(countdown), canvasElement.width / 2, canvasElement.height / 2 + 50);
		ctx.fillStyle = "white";
		ctx.fillText(Math.floor(countdown), canvasElement.width / 2, canvasElement.height / 2 + 50);
	}
}

function gameUpdate()
{
	handleInputs();
	updateCountdown();
	moveObjects();
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

function initializeJS() {
	canvasContainer = document.getElementById("canvasContainer");
	canvasElement = document.getElementById("gameCanvas");
	ctx = canvasElement.getContext("2d");
	scoreText = document.getElementById("tally");

// DEBUG /////////////////////////////
	debugGameResetButton = document.getElementById("gameResetButton");
	debugColorPickerBackground = document.getElementById("colorPickerBackground");
	debugColorPickerPlayer1 = document.getElementById("colorPickerPlayer1");
	debugColorPickerPlayer2 = document.getElementById("colorPickerPlayer2");
	debugColorPickerBall = document.getElementById("colorPickerBall");
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
	debugTargetScore.addEventListener('input', function() {
		targetScore = debugTargetScore.value;
	});
	debugInitialSpeed.addEventListener('input', function() {
		initialSpeed = debugInitialSpeed.value;
	});
	debugSpeedIncrease.addEventListener('input', function() {
		speedIncrease = debugSpeedIncrease.value;
	});

	canvasElement.width = canvasContainer.clientWidth;
	canvasElement.height = canvasContainer.clientHeight;

	scaleFactor = canvasContainer.clientWidth / 1920;

	window.addEventListener("resize", function(event)
	{
		canvasElement.width = canvasContainer.clientWidth;
		canvasElement.height = canvasContainer.clientHeight;
		scaleFactor = canvasContainer.clientWidth / 1920;
	});

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


	init();
	gameLoop();
}
