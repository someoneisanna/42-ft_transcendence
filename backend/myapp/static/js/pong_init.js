class Pad
{
	constructor(x, y, color, width, height)
	{
		this.score = 0;
		this.x = x;
		this.y = y;
		
		this.color = color;
		this.width = width;
		this.height = height;

		this.maxSpeed = 20;
		this.acceleration = 3;
		this.currentSpeed = 0;
		this.targetSpeed = 0;
	
		this.requestUp = false;
		this.requestDown = false;
	}

	draw()
	{
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x * scaleFactor, this.y * scaleFactor, this.width * scaleFactor, this.height * scaleFactor);
	}

	move()
	{
		if (countdown >= 1)
			return;

		this.targetSpeed = 0;
		if (this.requestUp)
			this.targetSpeed += -this.maxSpeed;
		if (this.requestDown)
			this.targetSpeed += this.maxSpeed;
		
		this.currentSpeed = MoveTowards(this.currentSpeed, this.targetSpeed, this.acceleration);
		this.y += this.currentSpeed;

		if (this.y < 0)
		{
			this.y = 0;
			this.currentSpeed = 0;
		}
		else if (this.y + this.height > fieldHeight)
		{
			this.y = fieldHeight - this.height;
			this.currentSpeed = 0;
		}
	}
}

class Ball
{
	constructor(x, y, color, radius)
	{
		this.x = x;
		this.y = y;
		this.color = color;
		this.radius = radius;
		this.speedX = 0;
		this.speedY = 5;
		this.moveDir = 1;
	}

	draw()
	{
		if (countdown >= 1)
			return;
		
		ctx.beginPath();
		ctx.arc(this.x * scaleFactor, this.y * scaleFactor, this.radius * scaleFactor, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.closePath();
	}

	move()
	{
		if (countdown >= 1)
			return;

		this.x += this.speedX * this.moveDir;
		this.y += this.speedY;

		// check collision with paddles
		if (this.speedX * this.moveDir < 0 && isCircleAABBOverlap(this.x, this.y, this.radius, pad1.x, pad1.y, pad1.x + pad1.width, pad1.y + pad1.height))
		{
			this.moveDir *= -1;
			this.speedX += speedIncrease;
			return;
		}
		if (this.speedX * this.moveDir > 0 && isCircleAABBOverlap(this.x, this.y, this.radius, pad2.x, pad2.y, pad2.x + pad2.width, pad2.y + pad2.height))
		{
			this.moveDir *= -1;
			this.speedX += speedIncrease;
			return;
		}

		if (this.x + this.radius >= fieldWidth)	// ball hits right wall
		{
			// this.x -= (this.x + this.radius - fieldWidth);
			// this.speedX *= -1;
			score(pad1);
		}
		if (this.x - this.radius <= 0)	// ball hits left wall
		{
			// this.x -= (this.x - this.radius);
			// this.speedX *= -1;
			score(pad2);
		}
		if (this.y + this.radius >= fieldHeight)	// ball hits top wall
		{
			this.y -= (this.y + this.radius - fieldHeight);
			this.speedY *= -1;
		}
		if (this.y - this.radius <= 0)	// ball hits bottom wall
		{
			this.y -= (this.y - this.radius);
			this.speedY *= -1;
		}
	}
}
