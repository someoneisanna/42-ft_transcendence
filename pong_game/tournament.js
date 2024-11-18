class Node
{
    constructor(playerName, branchLeft, branchRight)
    {
        this.playerName = playerName;
        this.branchLeft = branchLeft;
        this.branchRight = branchRight;
        this.winner = false;
    }

    printTree(depth = 0)
    {
        console.log('\t'.repeat(depth * 2) + (this.playerName || "Match"));
        if (this.branchLeft)
            this.branchLeft.printTree(depth + 1);
        if (this.branchRight)
            this.branchRight.printTree(depth + 1);
    }

    printTreeHTML()
    {
        if (this.branchLeft)
            this.branchLeft.printTreeHTML();
        if (this.branchRight)
            this.branchRight.printTreeHTML();
        return `
        <ul>
          <li>
            <div class="node">${node.playerName || 'Match'}</div>
            <div class="branch">
              ${createTreeHTML(node.branchLeft)}
              ${createTreeHTML(node.branchRight)}
            </div>
          </li>
        </ul>
      `;

    }
}

const nPlayers = 8;
var playerNames = [];
var prevNodes = []
var currentNodes = []

for (let i = 0; i < nPlayers; i++)
{
    playerNames.push("player" + (i+1));
    currentNodes.push(new Node("player" + (i+1), null, null))
}

console.log(playerNames);


while (currentNodes.length > 1)
{
    prevNodes = currentNodes;
    currentNodes = [];

    for (let i = 0; i < prevNodes.length / 2; i++)
    {
        currentNodes.push(new Node("", prevNodes[i * 2 + 0], prevNodes[i * 2 + 1]))
    }
}

console.log(currentNodes);



currentNodes[0].printTree();
