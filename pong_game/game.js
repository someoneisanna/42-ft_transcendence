class Pad
{
	constructor(x, y, color, width, height, playerType)
	{
		this.score = 0;

		this.playerType = playerType;
		this.cpuBlindnessCooldown = 0;
		this.cpuPerceivedBallPosX = 0;
		this.cpuPerceivedBallPosY = 0;
		this.cpuPerceivedBallMoveDirX = 1;
		this.cpuPerceivedBallMoveDirY = 0;
		this.cpuPredictedBallPosY = 0;

		this.posX = x;
		this.posY = y;

		this.color = color;
		this.width = width;
		this.height = height;

		this.maxSpeed = 20;
		this.acceleration = 3;
		this.currentSpeed = 0;
		this.targetSpeed = 0;

		this.requestUp = false;
		this.requestDown = false;

		this.modifierList = [];
	}

	getEffectiveHeight()
	{
		var effectiveHeight = this.height;

		this.modifierList.forEach(mod => {
			if (mod.type === "height")
				effectiveHeight += this.height * mod.strength;
		});
		return effectiveHeight;
	}

	getEffectiveMaxSpeed()
	{
		var effectiveMaxSpeed = this.maxSpeed;

		this.modifierList.forEach(mod => {
			if (mod.type === "speed")
				effectiveMaxSpeed += this.maxSpeed * mod.strength;
		});
		return effectiveMaxSpeed;
	}

	updateModifiers()
	{
		for (let i = 0; i < this.modifierList.length; i++)
		{
			this.modifierList[i].duration -= (timeCurrent - timePrevious) / 1000;
			if (this.modifierList[i].duration <= 0)
				this.modifierList.splice(i, 1);
		}
	}

	draw()
	{
		ctx.fillStyle = this.color;
		ctx.fillRect(this.posX * scaleFactor, this.posY * scaleFactor, this.width * scaleFactor, this.getEffectiveHeight() * scaleFactor);
	}

	move()
	{
		if (countdown >= 1)
			return;

		this.targetSpeed = 0;
		if (this.requestUp)
			this.targetSpeed = -this.getEffectiveMaxSpeed();
		if (this.requestDown)
			this.targetSpeed = this.getEffectiveMaxSpeed();
		
		if (this.currentSpeed > 0 && this.requestUp || this.currentSpeed < 0 && this.requestDown)	// have more acceleration if changing directions
			this.currentSpeed = MoveTowards(this.currentSpeed, this.targetSpeed, this.acceleration * 2);
		else
			this.currentSpeed = MoveTowards(this.currentSpeed, this.targetSpeed, this.acceleration);
		this.posY += this.currentSpeed;

		if (this.posY < 0)
		{
			this.posY = 0;
			this.currentSpeed = 0;
		}
		else if (this.posY + this.getEffectiveHeight() > fieldHeight)
		{
			this.posY = fieldHeight - this.getEffectiveHeight();
			this.currentSpeed = 0;
		}
	}

	decideMovement()
	{
		var side = (this.posX < fieldWidth / 2) ? "left" : "right";
		var padCenterPos = this.posY + this.getEffectiveHeight() / 2;
		
		// the ai can only see the ball once every second
		if (this.cpuBlindnessCooldown > 0)
			this.cpuBlindnessCooldown -= (timeCurrent - timePrevious) / 1000;
		else
		{
			this.cpuBlindnessCooldown = 1;
			this.cpuPerceivedBallPosX = ball.posX;
			this.cpuPerceivedBallPosY = ball.posY;
			this.cpuPerceivedBallMoveDirX = ball.moveDirX;
		}
		// if the ball is moving away
		if ((side === "left" && this.cpuPerceivedBallMoveDirX > 0) || (side === "right" && this.cpuPerceivedBallMoveDirX < 0))
		{
			if (Math.abs(padCenterPos - fieldHeight / 2) < 50)
				return;
			// move to middle of the field
			if (padCenterPos < fieldHeight / 2)
				this.requestDown = true;
			else if (padCenterPos > fieldHeight / 2)
				this.requestUp = true;
		}
		else // if the ball is moving towards the player
		{
			// Calculate the time it will take for the ball to reach the AI's x-position
			var distanceToAi = Math.abs(this.posX - ball.posX);
			var timeToReachAi = distanceToAi / Math.abs(ball.moveDirX);
		
			// Predict the y-position based on current y-velocity
			this.cpuPredictedBallPosY = ball.posY + ball.moveDirY * timeToReachAi;
		
			// Handle bounces off the top and bottom boundaries
			while (this.cpuPredictedBallPosY < 0 || this.cpuPredictedBallPosY > fieldHeight)
			{
				if (this.cpuPredictedBallPosY < 0)
					this.cpuPredictedBallPosY = -this.cpuPredictedBallPosY;
				else if (this.cpuPredictedBallPosY > fieldHeight)
					this.cpuPredictedBallPosY = 2 * fieldHeight - this.cpuPredictedBallPosY;
			}

			// Try to align paddle center with the predicted ball position
			if (Math.abs(padCenterPos - this.cpuPredictedBallPosY) < 100)
				return;
			
			if (padCenterPos < this.cpuPredictedBallPosY)
				this.requestDown = true;
			else if (padCenterPos > this.cpuPredictedBallPosY)
				this.requestUp = true;
		}
	}
}

class Ball
{
	constructor(x, y, color, radius)
	{
		this.posX = x;
		this.posY = y;
		this.color = color;
		this.radius = radius;
		this.moveSpeed = 0.0;
		this.moveDirX = 0.0;
		this.moveDirY = 0.0;
	}

	draw()
	{
		if (countdown >= 1)
			return;
		
		ctx.beginPath();
		ctx.arc(this.posX * scaleFactor, this.posY * scaleFactor, this.radius * scaleFactor, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.closePath();
	}

	move()
	{
		if (countdown >= 1)
			return;

		this.posX += this.moveDirX * this.moveSpeed;
		this.posY += this.moveDirY * this.moveSpeed;
		new CollisionEffect(this.posX, this.posY, "#ffffff", 1, 0, this.radius, this.radius / 2, 0.3);

		// check collision with paddles
		if (this.moveDirX < 0 && isCircleAABBOverlap(this.posX, this.posY, this.radius, pad1.posX, pad1.posY, pad1.posX + pad1.width, pad1.posY + pad1.getEffectiveHeight()))
		{
			new CollisionEffect(this.posX, this.posY, "#ffffff", 1, 0, this.radius, this.radius + this.radius * (this.moveSpeed - 10) / 2, 0.4);
			var relativeImpactPoint = (this.posY - pad1.posY) / pad1.getEffectiveHeight();
			var newDirX, newDirY;

			if (relativeImpactPoint <= 0.5)
			{
				const t = relativeImpactPoint / 0.5; // Normalize relativeImpactPoint to range [0, 1] for this segment
				newDirX = (1 - t) * 0.5 + t * 1;      // Interpolates X from 0.5 to 1
				newDirY = (1 - t) * -0.5 + t * 0;     // Interpolates Y from -0.5 to 0
			}
			else
			{
				const t = (relativeImpactPoint - 0.5) / 0.5; // Normalize relativeImpactPoint to range [0, 1] for this segment
				newDirX = (1 - t) * 1 + t * 0.5;      // Interpolates X from 1 to 0.5
				newDirY = (1 - t) * 0 + t * 0.5;      // Interpolates Y from 0 to 0.5
			}

			// Normalize the resulting direction vector
			const magnitude = Math.sqrt(newDirX ** 2 + newDirY ** 2);
			
			this.moveDirX = newDirX;
			this.moveDirY = newDirY;
			this.moveSpeed += speedIncrease;

			return;
		}
		if (this.moveDirX > 0 && isCircleAABBOverlap(this.posX, this.posY, this.radius, pad2.posX, pad2.posY, pad2.posX + pad2.width, pad2.posY + pad2.getEffectiveHeight()))
		{
			new CollisionEffect(this.posX, this.posY, "#ffffff", 1, 0, this.radius, this.radius + this.radius * (this.moveSpeed - 10) / 2, 0.4);
			var relativeImpactPoint = (this.posY - pad2.posY) / pad2.getEffectiveHeight();
			var newDirX, newDirY;

			if (relativeImpactPoint <= 0.5)
			{
				const t = relativeImpactPoint / 0.5; // Normalize relativeImpactPoint to range [0, 1] for this segment
				newDirX = Interpolate(-0.5, -1, t);
				newDirY = Interpolate(-0.5, 0, t);
			}
			else
			{
				const t = (relativeImpactPoint - 0.5) / 0.5; // Normalize relativeImpactPoint to range [0, 1] for this segment
				newDirX = Interpolate(-1, -0.5, t);
				newDirY = Interpolate(0, 0.5, t);
			}

			// Normalize the resulting direction vector
			const magnitude = Math.sqrt(newDirX ** 2 + newDirY ** 2);
			
			this.moveDirX = newDirX;
			this.moveDirY = newDirY;
			this.moveSpeed += speedIncrease;

			return;
		}

		if (this.posX + this.radius >= fieldWidth)	// ball hits right wall
		{
			new CollisionEffect(fieldWidth, fieldHeight / 2, "#ffffff", 1, 0, this.radius, this.radius * 20, 1);
			// this.x -= (this.x + this.radius - fieldWidth);
			// this.speedX *= -1;
			score(pad1);
		}
		if (this.posX - this.radius <= 0)	// ball hits left wall
		{
			new CollisionEffect(0, fieldHeight / 2, "#ffffff", 1, 0, this.radius, this.radius * 20, 1);
			// this.x -= (this.x - this.radius);
			// this.speedX *= -1;
			score(pad2);
		}
		if (this.posY + this.radius >= fieldHeight)	// ball hits top wall
		{
			new CollisionEffect(this.posX, this.posY + this.radius, "#ffffff", 1, 0, this.radius, this.radius + this.radius * (this.moveSpeed - 10) / 2, 0.4);
			this.posY -= (this.posY + this.radius - fieldHeight);
			this.moveDirY *= -1;
		}
		if (this.posY - this.radius <= 0)	// ball hits bottom wall
		{
			new CollisionEffect(this.posX, this.posY - this.radius, "#ffffff", 1, 0, this.radius, this.radius + this.radius * (this.moveSpeed - 10) / 2, 0.4);
			this.posY -= (this.posY - this.radius);
			this.moveDirY *= -1;
		}
	}
}

class CollisionEffect
{
	constructor(x, y, color, opacityStart, opacityEnd, radiusStart, radiusEnd, duration)
	{
		this.posX = x;
		this.posY = y;
		this.color = color;
		this.opacityStart = opacityStart;
		this.opacityEnd = opacityEnd;
		this.radiusStart = radiusStart;
		this.radiusEnd = radiusEnd;
		this.duration = duration;
		this.durationCurrent = 0;

		listTemps.push(this);
	}

	draw()
	{
		if (countdown >= 1)
			return;

		const currentRadius = Interpolate(this.radiusStart, this.radiusEnd, this.durationCurrent / this.duration);
		const currentOpacity = Interpolate(this.opacityStart, this.opacityEnd, this.durationCurrent / this.duration);
		
		ctx.globalAlpha = currentOpacity;

		ctx.beginPath();
		ctx.arc(this.posX * scaleFactor, this.posY * scaleFactor, currentRadius * scaleFactor, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.closePath();
		ctx.globalAlpha = 1;
	}

	tickTime()
	{
		this.durationCurrent += (timeCurrent - timePrevious) / 1000;
		if (this.durationCurrent > this.duration)
		{
			const index = listTemps.findIndex(obj => obj === this)
			listTemps.splice(index, 1);
		}
	}
}

class Modifier
{
	constructor(x, y, radius, type, strength, color, duration)
	{
		this.posX = x;
		this.posY = y;
		this.radius = radius;
		this.type = type;
		this.strength = strength;
		this.color = color;
		this.duration = duration;
		this.durationCurrent = 0;

		listMods.push(this);
		listTemps.push(this);
	}

	draw()
	{
		if (countdown >= 1)
			return;

		ctx.beginPath();
		ctx.arc(this.posX * scaleFactor, this.posY * scaleFactor, this.radius * scaleFactor, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.closePath();
	}

	tickTime()
	{
		this.durationCurrent += (timeCurrent - timePrevious) / 1000;
		if (this.durationCurrent > this.duration)
		{
			let index = listMods.findIndex(obj => obj === this)
			listMods.splice(index, 1);

			index = listTemps.findIndex(obj => obj === this)
			listTemps.splice(index, 1);
		}
	}

	checkCollision()
	{
		if (!isCircleCircleOverlap(this.posX, this.posY, this.radius, ball.posX, ball.posY, ball.radius))
			return;

		let affectedPlayer = ball.moveDirX > 0 ? pad1 : pad2;
		affectedPlayer.modifierList.push({
			type: this.type,
			strength: this.strength,
			duration: this.duration
		})
		let index = listMods.findIndex(obj => obj === this)
		listMods.splice(index, 1);
		index = listTemps.findIndex(obj => obj === this)
		listTemps.splice(index, 1);
	}
}

var canvasContainer = document.getElementById("canvasContainer");
var canvasElement = document.getElementById("gameCanvas");
var ctx = canvasElement.getContext("2d");
var scoreText = document.getElementById("tally");

// DEBUG /////////////////////////////
var debugPlayer1AI = document.getElementById("player1AI");
var debugPlayer2AI = document.getElementById("player2AI");
var debugGameResetButton = document.getElementById("gameResetButton");
var debugColorPickerBackground = document.getElementById("colorPickerBackground");
var debugColorPickerPlayer1 = document.getElementById("colorPickerPlayer1");
var debugColorPickerPlayer2 = document.getElementById("colorPickerPlayer2");
var debugColorPickerBall = document.getElementById("colorPickerBall");
var debugSpeedModButton = document.getElementById("speedModButton");
var debugHeightModButton = document.getElementById("heightModButton");
var debugTargetScore = document.getElementById("targetScore");
var debugInitialSpeed = document.getElementById("initialSpeed");
var debugSpeedIncrease = document.getElementById("speedIncrease");

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
//////////////////////////////////////

var initialSpeed = 10.0;
var speedIncrease = 1;
var targetScore = 20;
var gameOngoing = false;


var countdown = 0.0;
var timeCurrent;
var timePrevious;

var fieldWidth = 1920;
var fieldHeight = 1080;
canvasElement.width = canvasContainer.clientWidth;
canvasElement.height = canvasContainer.clientHeight;

var scaleFactor = canvasContainer.clientWidth / 1920;

window.addEventListener("resize", function(event)
{
	canvasElement.width = canvasContainer.clientWidth;
	canvasElement.height = canvasContainer.clientHeight;
	scaleFactor = canvasContainer.clientWidth / 1920;
});

var pressW = false;
var pressS = false;
var pressUp = false;
var pressDown = false;

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

	pad1.posY = fieldHeight / 2 - pad1.getEffectiveHeight() / 2;
	pad2.posY = fieldHeight / 2 - pad2.getEffectiveHeight() / 2;

	ball.moveDirX *= -1;
	
	ball.posX = fieldWidth / 2;
	ball.posY = fieldHeight / 2;
	ball.moveSpeed = initialSpeed;
	countdown = 4;
}

// values
var padHeight = 200;
var padWidth = 40;
var ballRadius = 35;
var backgroundColor = "#f7ffbd"

// objects
var pad1 = new Pad(10, fieldHeight / 2 - padHeight / 2, "#ff0000", padWidth, padHeight, debugPlayer1AI.value);
var pad2 = new Pad(fieldWidth - padWidth - 10, fieldHeight / 2 - padHeight / 2, "#0000ff", padWidth, padHeight, debugPlayer2AI.value);
var ball = new Ball(fieldWidth / 2, fieldHeight / 2, "#00ff00", ballRadius);

// lists
var listDrawables = [];
var listMovables = [];
var listTemps = [];
var listMods = [];

listDrawables.push(pad1);
listDrawables.push(pad2);
listDrawables.push(ball);
listMovables.push(pad1);
listMovables.push(pad2);
listMovables.push(ball);

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
	if (!gameOngoing)
		return;
	timePrevious = timeCurrent;
	timeCurrent = Date.now();
	gameUpdate();
	requestAnimationFrame(gameLoop)
}

init();
gameLoop();
