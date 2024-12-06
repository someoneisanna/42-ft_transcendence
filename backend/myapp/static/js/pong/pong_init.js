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
		this.playerNames = [];
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
		if (currentRadius < 0)
			currentRadius
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

class TournamentNode
{
	constructor(playerName, branchLeft, branchRight, parent)
	{
		this.playerName = playerName;
		this.branchLeft = branchLeft;
		this.branchRight = branchRight;
		this.parent = parent;
		this.winner = false;
	}

	toggleWinner()
	{
		// validate it has branches and a parent
		if (!this.parent || (this.branchLeft && this.branchLeft.winner === false && this.branchRight && this.branchRight.winner === false))
			return;

		// validate it has a competitor
		if (this.parent.branchLeft.playerName === '' || this.parent.branchRight.playerName === '')
			return;

		// toggle the win
		this.winner = !this.winner;

		// reset its opponent
		if (this.parent.branchLeft != this)
			this.parent.branchLeft.winner = false;
		else
			this.parent.branchRight.winner = false;

		// update parent
		if (this.winner)
			this.parent.playerName = this.playerName;
		else
			this.parent.playerName = '';

		// reset affected matches
		let nextNode = this.parent.parent;
		while (nextNode)
		{
			nextNode.winner = false;
			nextNode.playerName = '';
			nextNode.branchLeft.winner = false;
			nextNode.branchRight.winner = false;
			nextNode = nextNode.parent;
		}
		root.generateTreeHTML();
	}

	reverseLevelOrderTraversalSort()
	{
		const queue = []; // Queue for level-order traversal
		const stack = []; // Stack to reverse the order

		queue.push(this);

		while (queue.length > 0)
		{
			const currentNode = queue.shift();

			// Push the current node onto the stack
			stack.push(currentNode);

			// Enqueue right child first, then left child
			// This ensures left is processed first when popped from stack
			if (currentNode.branchRight)
				queue.push(currentNode.branchRight);
			if (currentNode.branchLeft)
				queue.push(currentNode.branchLeft);
		}
		return stack;
	}

	generateTreeHTML()
	{
		let list = this.reverseLevelOrderTraversalSort(root);
		var roundSize = nPlayers;
		const tournamentMapElement = document.getElementById("tournamentMap");
		tournamentMapElement.innerText = '';
		while (list.length > 0)
		{
			const tournamentRoundElement = document.createElement("div");
			tournamentRoundElement.classList.add("tournamentRound");
			for (let i = 0; i < roundSize; i++)
			{
				const node = list.pop();
				const nodeElement = document.createElement("div");
				nodeElement.classList.add("tournamentNode");
				if (node.winner)
					nodeElement.classList.add("winner");
				nodeElement.innerText = node.playerName || "TBD";

				nodeElement.addEventListener("click", () => {
					node.toggleWinner();
				});
				tournamentRoundElement.appendChild(nodeElement);
			}
			tournamentMapElement.appendChild(tournamentRoundElement);
			roundSize /= 2;
		}
	}

	printTree(depth = 0)
	{
		console.log('\t'.repeat(depth * 2) + (this.playerName || "Match"));
		if (this.branchLeft)
			this.branchLeft.printTree(depth + 1);
		if (this.branchRight)
			this.branchRight.printTree(depth + 1);
	}

	findNextEmptyNode()
	{
		let sortedNodes = this.reverseLevelOrderTraversalSort(this);
		for (let i = 0; i < sortedNodes.length; i++)
		{
			if (sortedNodes[i].playerName === '')
				return sortedNodes[i];
		}
	}
}
