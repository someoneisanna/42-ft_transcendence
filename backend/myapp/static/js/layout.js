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


var current_user = '';
var lastActiveButton = null;

function openChat(roomName, buttonRef) {
	
	const chatContent = document.querySelector('.chatContent');
	const chatWindow = document.querySelector('.chatWindow');
	const textsContainer = document.getElementById('textsContainer');

	if (lastActiveButton && lastActiveButton !== buttonRef) {
		lastActiveButton.classList.remove('setDarkerBackground');
		chatContent.classList.remove('showFriendsOnly');
		chatWindow.classList.remove('noChatClicked');
	}
	if (lastActiveButton && lastActiveButton === buttonRef) {
		buttonRef.classList.toggle('setDarkerBackground');
		chatContent.classList.toggle('showFriendsOnly');
		chatWindow.classList.toggle('noChatClicked');
	}
	else {
		buttonRef.classList.add('setDarkerBackground');
		chatContent.classList.remove('showFriendsOnly');
		chatWindow.classList.remove('noChatClicked');
	}

	textsContainer.innerHTML = '';
	lastActiveButton = buttonRef;
	
	// Connect to the chat room
	chatSocket.send(JSON.stringify({
		'type': 'join_room',
		'room_name': roomName,
		'username': current_user
	}));

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
				
				const users = [item.username, data.current_user].sort();
				const roomName = 'chatRoom_' + users[0] + '-' + users[1];

				chatSocket.send(JSON.stringify({
					'type': 'get_last_messages',
					'room_name': roomName,
					'username': current_user
				}));

				var newElement = document.createElement('li');
				newElement.className = 'chatFriendListContent p-2 border-bottom';
				newElement.innerHTML = `
						<a href="#" class="d-flex justify-content-between">
							<div class="d-flex flex-row">
								<img src="${item.profile_pic}" width="50" height="50" class="d-flex align-self-center me-3 rounded-circle" onerror="this.onerror=null; this.src='/media/default.jpg';">
								<div class="pt-1">
									<p class="fw-bold mb-0">${item.username}</p>
									<p id="lastMsg_${roomName}" class="small text-muted"></p>
								</div>
							</div>
							<div class="pt-1">
								<p id="timeLastMsg_${roomName}" class="small text-muted mb-1">-</p>
								<span class="badge bg-danger rounded-pill float-end">3</span> 
							</div>
						</a>
					</li>`;
				newElement.onclick = (function() {
					openChat(roomName, newElement);
				});
				listContainer.appendChild(newElement);
			});
			current_user = data.current_user;
		})
		.catch(error => {
			console.error('Error during search:', error);
		});
}

function toggleChatWindow() {
	lastActiveButton = null;
	document.querySelector('.chatContent').classList.toggle('showChat');
	document.querySelector('.chatContent').classList.add('showFriendsOnly');
	document.querySelector('.chatWindow').classList.add('noChatClicked');
	buildChatFriendsList();
}

function formatDate(isoDate, type) {
	
	const date = new Date(isoDate);

	const options1 = { month: 'short', day: 'numeric' };
	const formattedDate = date.toLocaleDateString('en-US', options1);

	const options2 = { hour: '2-digit', minute: '2-digit'};
	const formattedTime = date.toLocaleTimeString('en-US', options2);

	if (type === 'time')
		return formattedTime;
	else if (type === 'date')
		return formattedDate + ' ' + formattedTime;
}

function initializeJS() {
	chatSocket.onmessage = function (e) {
		var textsContainer = document.getElementById('textsContainer');

		const data = JSON.parse(e.data);
		const room_name = data.room_name;
		const username = data.username;
		const message = data.message;
		const timestamp = formatDate(data.sent_at, 'date');
		
		if (username === current_user)
			var newElement = `
				<div class="d-flex flex-row justify-content-end pt-1">
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
						<p class="small ms-3 mb-3 rounded-3 text-muted float-end smallerText">${timestamp}</p>
					</div>
				</div>`;
		textsContainer.innerHTML += newElement;

		if (data.sent_at)
			document.getElementById(`timeLastMsg_${room_name}`).innerHTML = formatDate(data.sent_at, 'time');
		document.getElementById(`lastMsg_${room_name}`).innerHTML = message;
	};
}
