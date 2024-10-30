// GOTO FUNCTIONS -------------------------------------------------------------------------------------------------------------------------

function goToProfile() {
	loadPage('/dropdown_profile/', true);
}

function goToSettings() {
	loadPage('/dropdown_settings/', true);
}

function goToFriends() {
	loadPage('/dropdown_friends/', true);
}

function goHome() {
	loadPage('/layout/', true);
}

function changeSmallProfilePic(path) {
	const profilePic = document.getElementById('smallProfilePicture');
	if (profilePic)
		profilePic.src = path;
}

function openChat(friend, current_user, buttonRef) {
	
	document.querySelector('.chatContent').classList.toggle('showFriendsOnly');
	document.querySelector('.chatWindow').classList.toggle('noChatClicked');
	document.querySelector('.chatFriendListContent').classList.toggle('setDarkerBackground');

	// Create a chat room name
	const users = [friend, current_user].sort();
	const roomName = 'chatRoom_' + users[0] + '-' + users[1];
	
	// Connect to the chat room
	chatSocket.send(JSON.stringify({
		'type': 'join_room',
		'room_name': roomName,
		'username': current_user
	}));

	console.log('Chat room' + roomName + ' created');

	document.querySelector(".sendMessageButton").onclick = function() {
		const messageInput = document.querySelector("#sendMessageInput").value;
		if (messageInput == '')
			return;
		console.log('Sending message:', messageInput);
		chatSocket.send(JSON.stringify({
			'type': 'chat_message',
			'room_name': roomName,
			'username': current_user,
			'message': messageInput,
			'sent_at': new Date().toISOString()
		}));
		document.querySelector("#sendMessageInput").value = '';
	};

	document.querySelector("#sendMessageInput").addEventListener('keydown', function (event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			document.querySelector(".sendMessageButton").click();
		}
	});
}

var current_user = '';

function buildChatFriendsList() {
	var listContainer = document.getElementById('chatFriendsListContent');
	listContainer.innerHTML = '';
	fetch('/api/get_friends/')
		.then(response => {
			if (!response.ok)
				throw new Error('Friend list request failed:', response.statusText);
			return response.json();
		})
		.then(data => {
			console.log('Search results:', data);
			data.friends.forEach(item => {
				var newElement = `
					<li class="chatFriendListContent p-2 border-bottom">
						<a href="#" class="d-flex justify-content-between" onclick="openChat('${item.username}', '${data.current_user}');">
							<div class="d-flex flex-row">
								<img src="${item.profile_pic}" width="50" height="50" class="d-flex align-self-center me-3 rounded-circle" onerror="this.onerror=null; this.src='/media/default.jpg';">
								<div class="pt-1">
									<p class="fw-bold mb-0">${item.username}</p>
									<p class="small text-muted">Hello, Are you there?</p> <!-- Last message -->
								</div>
							</div>
							<div class="pt-1">
								<p class="small text-muted mb-1">21:30</p> <!-- Time -->
								<span class="badge bg-danger rounded-pill float-end">3</span> <!-- Unread messages -->
							</div>
						</a>
					</li>`;
				listContainer.innerHTML += newElement;
			});
			current_user = data.current_user;
		})
		.catch(error => {
			console.error('Error during search:', error);
		});
}

function toggleChatWindow() {
	document.querySelector('.chatContent').classList.toggle('showChat');
	buildChatFriendsList();
}

function formatDate(isoDate) {
	
	const date = new Date(isoDate);

	const options1 = { month: 'short', day: 'numeric' };
	const formattedDate = date.toLocaleDateString('en-US', options1);

	const options2 = { hour: '2-digit', minute: '2-digit'};
	const formattedTime = date.toLocaleTimeString('en-US', options2);

	return formattedTime + ' | ' + formattedDate;
}

function initializeJS() {
	chatSocket.onmessage = function (e) {
		var textsContainer = document.getElementById('textsContainer');

		const data = JSON.parse(e.data);
		const message = data.message;
		const username = data.username;
		const timestamp = formatDate(data.sent_at);
		
		if (username === current_user)
			var newElement = `
				<div class="d-flex flex-row justify-content-end">
					<div>
						<p class="small p-2 me-3 mb-1 text-white rounded-3 bg-primary">${message}</p>
						<p class="small me-3 mb-1 rounded-3 text-muted smallerText">${timestamp}</p>
					</div>
				</div>`;
		else
			var newElement = `
				<div class="d-flex flex-row justify-content-start">
					<div>
						<p class="small p-2 ms-3 mb-1 rounded-3 bg-body-tertiary">${message}</p>
						<p class="small ms-3 mb-3 rounded-3 text-muted float-end smallerText">12:00 PM | Aug 13</p>
					</div>
				</div>`;
		textsContainer.innerHTML += newElement;
	};
}
