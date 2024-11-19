class Node
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

	printTreeHTML()
	{
		let list = this.reverseLevelOrderTraversalSort(root);
		let html = ``
		var roundSize = nPlayers;
		while (list.length > 0)
		{
			html += `<div class="tournamentRound">`
			for (let i = 0; i < roundSize; i++)
			{
				html += `<div class="tournamentNode" onclick="()=>{}">`
				html += `${list.pop().playerName || 'TBD'}`
				html += `</div>`
			}
			html += `</div>`
			roundSize /= 2;
		}
		html += `</div>`
		return html;
	}

	printTree(depth = 0)
	{
		console.log('\t'.repeat(depth * 2) + (this.playerName || "Match"));
		if (this.branchLeft)
			this.branchLeft.printTree(depth + 1);
		if (this.branchRight)
			this.branchRight.printTree(depth + 1);
	}
}



const nPlayers = 8;
var playerNames = [];
var prevNodes = []
var currentNodes = []

for (let i = 0; i < nPlayers; i++)
{
	playerNames.push("player" + (i+1));
	currentNodes.push(new Node("player" + (i+1), null, null, null))
}

while (currentNodes.length > 1)
{
	prevNodes = currentNodes;
	currentNodes = [];

	for (let i = 0; i < prevNodes.length / 2; i++)
	{
		newNode = new Node("", prevNodes[i * 2 + 0], prevNodes[i * 2 + 1], null);
		prevNodes[i * 2 + 0].parent = newNode;
		prevNodes[i * 2 + 1].parent = newNode;
		currentNodes.push(newNode)
	}
}

const root = currentNodes[0];

// console.log(root);
// root.printTree();

// document.getElementById("tournamentMap").innerHTML = root.printTreeHTML();
root.generateTreeHTML();
