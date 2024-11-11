var current_user = '';

const chatSocket = new WebSocket("wss://" + window.location.host + "/ws/chat/");
const pongSocket = new WebSocket("wss://" + window.location.host + "/ws/pong/");

chatSocket.onopen = function (e){
	console.log("The connection to the chatSocket was setup successfully!");
};

chatSocket.onclose = function (e) {
	console.log("The connection to the chatSocket was closed unexpectedly!");
};

chatSocket.onerror = function (error) {
	console.error("chatSocket error:", error);
};

window.onbeforeunload = function () {
	chatSocket.close();
};

chatSocket.onmessage = function (e) {
	var textsContainer = document.getElementById('textsContainer');

	const data = JSON.parse(e.data);
	const type = data.type;
	const action = data.action;
	const room_name = data.room_name;
	const username = data.username;
	const message = data.message;
	const timestamp = formatDate(data.sent_at, 'date');

	if (action === 'remove_chat_room') {
		lastActiveButton = null;
		document.querySelector('.chatContent').classList.add('showFriendsOnly');
		document.querySelector('.chatWindow').classList.add('noChatClicked');
		buildChatFriendsList();
		if (document.querySelector('.friendsList'))
			buildFriendsList();
		return;
	}

	if (action === 'add_chat_room') {
		buildChatFriendsList();
		if (document.querySelector('.friendsList'))
			buildFriendsList();
		return;
	}

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

	if (type !== 'add_stored_message') {
		if (data.sent_at)
			document.getElementById(`timeLastMsg_${room_name}`).innerHTML = formatDate(data.sent_at, 'time');
		document.getElementById(`lastMsg_${room_name}`).innerHTML = message;
	}
};

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
		return;
	}
	else {
		buttonRef.classList.add('setDarkerBackground');
		chatContent.classList.remove('showFriendsOnly');
		chatWindow.classList.remove('noChatClicked');
	}

	lastActiveButton = buttonRef;
	textsContainer.innerHTML = '';

	console.log('WS: get stored messages:', roomName);
	chatSocket.send(JSON.stringify({
		'type': 'get_stored_messages',
		'room_name': roomName,
		'username': current_user
	}));

	document.querySelector(".sendMessageButton").onclick = function() {
		const messageInput = document.querySelector("#sendMessageInput").value;
		if (messageInput == '')
			return;
		console.log('WS: sending message from ' + current_user + ' to ' + roomName + ': ' + messageInput);
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

function getChannelRoomName(username) {
	const users = [username, current_user].sort();
	const roomName = 'chatRoom_' + users[0] + '-' + users[1];
	return roomName;
}

function addFriendToLists(username) {
	const roomName = getChannelRoomName(username);
	console.log('WS: adding chat room: ' + roomName);
	chatSocket.send(JSON.stringify({
		'type': 'update_html',
		'room_name': roomName,
		'username': current_user,
		'action': 'add_chat_room',
	}));
}

function removeChatRoom(username) {
	const roomName = getChannelRoomName(username);
	console.log('WS: removing chat room: ' + roomName);
	chatSocket.send(JSON.stringify({
		'type': 'update_html',
		'room_name': roomName,
		'username': current_user,
		'action': 'remove_chat_room',
	}));
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
			data.friends.forEach(item => {
				
				const roomName = getChannelRoomName(item.username)
				
				console.log('WS: opening chat room:', roomName);
				chatSocket.send(JSON.stringify({
					'type': 'join_room',
					'room_name': roomName,
					'username': current_user
				}));

				console.log('WS: getting last message for room:', roomName);
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
					document.querySelector('.blockButtonClass').onclick = function() {
						blockUser(item.username, data.current_user);
					}
				});
				listContainer.appendChild(newElement);
			});
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
		return formattedDate + ' | ' + formattedTime;
}

function blockUser(friend, current_user) {
	fetch('/api/block_user/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken_var
		},
		body: JSON.stringify({'target': friend, 'current_user': current_user})
		})
		.then(response => {
			console.log('current user:', current_user);
			console.log('Block user:', friend);
			console.log('Block user response:', response);
			if (!response.ok)
				throw new Error('Block user request failed:' + response.statusText);
			return response.json();
		})
		.then(data => {
			console.log('Block user response:' + data);
			lastActiveButton = null;
			document.querySelector('.chatContent').classList.add('showFriendsOnly');
			document.querySelector('.chatWindow').classList.add('noChatClicked');
			removeChatRoom(friend);
		})
		.catch(error => {
			console.error('Error during block user:' + error);
		});
}

var chatBuilt = false;

function buildChat() {
	buildChatFriendsList();
	chatBuilt = true;
}
