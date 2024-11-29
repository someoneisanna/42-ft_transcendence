// import { GameSettings, Pad, Ball, CollisionEffect, Modifier } from './pong_init.js';

class GameSettings
{
	constructor()
	{
		this.gameType = "";
		this.initialSpeed = 0.0;
		this.speedIncrease = 0;
		this.targetScore = 0;
		this.typePlayer1 = "";
		this.typePlayer2 = "";
		this.namePlayer1 = "";
		this.namePlayer2 = "";
		this.modifiers = false;
		this.modifierCooldown = 0;
	}
}

class Pad
{
	constructor(x, y, color, width, height, playerType)
	{
		this.playerName = "";
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
		ctx.fillRect(this.posX * scaleFactor, (this.posY - this.getEffectiveHeight() / 2) * scaleFactor, this.width * scaleFactor, this.getEffectiveHeight() * scaleFactor);
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

		if (this.posY - this.getEffectiveHeight() / 2 < 0)
		{
			this.posY = this.getEffectiveHeight() / 2;
			this.currentSpeed = 0;
		}
		else if (this.posY + this.getEffectiveHeight() / 2 > fieldHeight)
		{
			this.posY = fieldHeight - this.getEffectiveHeight() / 2;
			this.currentSpeed = 0;
		}
	}

	decideMovement()
	{
		var side = (this.posX < fieldWidth / 2) ? "left" : "right";
		var padCenterPos = this.posY;
		
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
			if (Math.abs(padCenterPos - fieldHeight / 2) < this.getEffectiveHeight() / 2)
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
		if (this.moveDirX < 0 && isCircleAABBOverlap(this.posX, this.posY, this.radius, pad1.posX, pad1.posY - pad1.getEffectiveHeight() / 2, pad1.posX + pad1.width, pad1.posY + pad1.getEffectiveHeight() / 2))
		{
			if (gameSettings.gameType === "remote" && current_user !== pad1.playerName)
				return;

			new CollisionEffect(this.posX, this.posY, "#ffffff", 1, 0, this.radius, this.radius + this.radius * (this.moveSpeed - 10) / 2, 0.4);
			var relativeImpactPoint = (this.posY - (pad1.posY - pad1.getEffectiveHeight() / 2)) / pad1.getEffectiveHeight();
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
			this.moveSpeed += gameSettings.speedIncrease;

			if (gameSettings.gameType === "remote")
			{
				pongSocket.send(JSON.stringify({
					'type': 'send_ball_state',
					'pos_x': this.posX,
					'pos_y': this.posY,
					'move_dir_x': this.moveDirX,
					'move_dir_y': this.moveDirY,
					'move_speed': this.moveSpeed
				}));
			}

			return;
		}
		if (this.moveDirX > 0 && isCircleAABBOverlap(this.posX, this.posY, this.radius, pad2.posX, pad2.posY - pad2.getEffectiveHeight() / 2, pad2.posX + pad2.width, pad2.posY + pad2.getEffectiveHeight() / 2))
		{
			if (gameSettings.gameType === "remote" && current_user !== pad2.playerName)
				return;

			new CollisionEffect(this.posX, this.posY, "#ffffff", 1, 0, this.radius, this.radius + this.radius * (this.moveSpeed - 10) / 2, 0.4);
			var relativeImpactPoint = (this.posY - (pad2.posY - pad2.getEffectiveHeight() / 2)) / pad2.getEffectiveHeight();
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
			this.moveSpeed += gameSettings.speedIncrease;

			if (gameSettings.gameType === "remote")
			{
				pongSocket.send(JSON.stringify({
					'type': 'send_ball_state',
					'pos_x': this.posX,
					'pos_y': this.posY,
					'move_dir_x': this.moveDirX,
					'move_dir_y': this.moveDirY,
					'move_speed': this.moveSpeed
				}));
			}

			return;
		}

		if (this.posX + this.radius >= fieldWidth)	// ball hits right wall
		{
			new CollisionEffect(fieldWidth, fieldHeight / 2, "#ffffff", 1, 0, this.radius, this.radius * 20, 1);
			
			if (gameSettings.gameType === "remote" && current_user === pad1.playerName)
				return;

			if (gameSettings.gameType === "remote")
			{
				pongSocket.send(JSON.stringify({
					'type': 'notify_score',
					'scorer': pad1.playerName
				}));
			}

			score(pad1);
		}
		if (this.posX - this.radius <= 0)	// ball hits left wall
		{
			new CollisionEffect(0, fieldHeight / 2, "#ffffff", 1, 0, this.radius, this.radius * 20, 1);
			
			if (gameSettings.gameType === "remote" && current_user === pad2.playerName)
				return;
			
			if (gameSettings.gameType === "remote")
			{
				pongSocket.send(JSON.stringify({
					'type': 'notify_score',
					'scorer': pad2.playerName
				}));
			}

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

var gameSettings = {
	initialSpeed: 10.0,
	speedIncrease: 1,
	targetScore: 3,
	typePlayer1: "human",
	typePlayer2: "cpu",
	namePlayer1: "Player 1",
	namePlayer2: "Player 2",
	modifiers: true,
	modifierCooldown: 3
};

function getDefaultSettings()
{
	let settings = new GameSettings();
	settings.gameType = "local";
	settings.initialSpeed = 10.0;
	settings.speedIncrease = 1;
	settings.targetScore = 3;
	settings.typePlayer1 = "human";
	settings.typePlayer2 = "cpu";
	settings.namePlayer1 = "Player 1";
	settings.namePlayer2 = "Player 2";
	settings.modifiers = true;
	settings.modifierCooldown = 3;
	return settings;
}

function getRemoteSettings(player1name, player2name)
{
	let settings = getDefaultSettings();
	settings.gameType = "remote";
	settings.namePlayer1 = player1name;
	settings.namePlayer2 = player2name;
	settings.typePlayer2 = "human";
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
	scoreText.innerText = pad1.playerName + " " + pad1.score + " - " + pad2.score + " " + pad2.playerName;
	ball.moveDirX = 1;
	ball.moveSpeed = gameSettings.initialSpeed;
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

	if (gameSettings.gameType === "local")
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
	//console.log(data);
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
	//console.log(data);
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
	console.log("updateRemoteScore", data);
	if (data.scorer !== current_user)
		return;
	let otherPad;
	if (data.scorer === pad1.playerName)
		otherPad = pad1;
	else if (data.scorer === pad2.playerName)
		otherPad = pad2;
	score(otherPad);
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




function startGameWithSettings(settings)
{
	gameSettings = settings;

	initialSpeed = gameSettings.initialSpeed;
	speedIncrease = gameSettings.speedIncrease;
	targetScore = gameSettings.targetScore;
	pad1 = new Pad(10, fieldHeight / 2, "#ff0000", padWidth, padHeight, gameSettings.typePlayer1);
	pad2 = new Pad(fieldWidth - padWidth - 10, fieldHeight / 2, "#0000ff", padWidth, padHeight, gameSettings.typePlayer2);
	ball = new Ball(fieldWidth / 2, fieldHeight / 2, "#00ff00", 35);
	
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

	pad1.playerType = gameSettings.typePlayer1;
	pad2.playerType = gameSettings.typePlayer2;
	pad1.playerName = gameSettings.namePlayer1;
	pad2.playerName = gameSettings.namePlayer2;

	init();
	gameLoop();
}

function initializeJS() {
	// if its a remote game
	// wait for both players to be ready
	// flood the room with ready messages until the other player is also ready

	// figure out whih side you play on, and the initial direction of the ball

	// then start the game

	// the players will periodically send the position and move direction of their pads to each other
	// the ball position and move direction will be updated by by whichever player will catch it next

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

	// // objects
	
	// // lists
	// listDrawables = [];
	// listMovables = [];
	// listTemps = [];
	// listMods = [];

	// listDrawables.push(pad1);
	// listDrawables.push(pad2);
	// listDrawables.push(ball);
	// listMovables.push(pad1);
	// listMovables.push(pad2);
	// listMovables.push(ball);

	//startGameWithSettings(getDefaultSettings());
	pongSocket.send(JSON.stringify({
		'type': 'start_game',
		'username': current_user,
	}));
	// alert('The game is starting!');

	
}
