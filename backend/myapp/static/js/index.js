var current_user = '';
var chatSocket = null;
var pongSocket = null;

var lastActiveButton = null;

function openChat(roomName, buttonRef) {

	if (document.querySelector('.hideEmojis') === null)
		document.querySelector('.emojiPicker').classList.add('hideEmojis');
	
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

	// console.debug('WS: get stored messages:', roomName);
	chatSocket.send(JSON.stringify({
		'type': 'get_stored_messages',
		'room_name': roomName,
		'username': current_user
	}));

	document.querySelector(".sendMessageButton").onclick = function() {

		if (document.querySelector('.hideEmojis') === null)
			document.querySelector('.emojiPicker').classList.add('hideEmojis');

		const messageInput = document.querySelector("#sendMessageInput").value;
		if (messageInput == '')
			return;
		// console.debug('WS: sending message from ' + current_user + ' to ' + roomName + ': ' + messageInput);
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

function goToFriendProfile(username) {
	alert('Placeholder: ' + username);
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
				
				// console.debug('WS: opening chat room:', roomName);
				chatSocket.send(JSON.stringify({
					'type': 'join_room',
					'room_name': roomName,
					'username': current_user
				}));

				// console.debug('WS: getting last message for room:', roomName);
				chatSocket.send(JSON.stringify({
					'type': 'get_last_messages',
					'room_name': roomName,
					'username': current_user
				}));

				var newElement = document.createElement('li');
				newElement.className = 'chatFriendListContent p-2 border-bottom';
				newElement.innerHTML = `
						<a class="chatFriendListContent_a d-flex justify-content-between" style="cursor: pointer;">
						<div class="d-flex flex-row position-relative">
							<div class="position-relative">
								<img src="${item.profile_pic}" width="50" height="50" class="rounded-circle" onerror="this.onerror=null; this.src='/media/default.jpg';">
								<span id="onlineStatus_${item.username}" class="online-indicator"></span>
							</div>
							<div class="pt-1 ms-3">
								<p class="fw-bold mb-0">${item.username}</p>
								<p id="lastMsg_${roomName}" class="smallMessage">-</p>
							</div>
						</div>
						<div class="pt-1">
							<p id="timeLastMsg_${roomName}" class="smallTime mb-1">-</p>
						</div>
					</a>`;
				newElement.onclick = (function() {
					openChat(roomName, newElement);
					document.querySelector('.blockButtonClass').onclick = function() {
						blockUser(item.username, data.current_user);
					}
					document.querySelector('.profileButtonClass').onclick = function() {
						goToFriendProfile(item.username);
					}
				});
				listContainer.appendChild(newElement);
				
				chatSocket.send(JSON.stringify({
					'type': 'get_online_status',
					'room_name': roomName,
					'username': item.username
				}));
			});
		})
		.catch(error => {
			console.error('Error during search:', error);
		});
}

function toggleChatWindow() {
	lastActiveButton = null;
	const chatHighlight = document.querySelector('.setDarkerBackground');
	if (chatHighlight !== null)
		chatHighlight.classList.remove('setDarkerBackground');
	document.querySelector('.chatContent').classList.toggle('showChat');
	document.querySelector('.chatContent').classList.add('showFriendsOnly');
	document.querySelector('.chatWindow').classList.add('noChatClicked');
	if (document.querySelector('.hideEmojis') === null)
		document.querySelector('.emojiPicker').classList.add('hideEmojis');
}

function formatDate(isoDate) {
	const date = new Date(isoDate);
	const options1 = { month: 'short', day: 'numeric' };
	const formattedDate = date.toLocaleDateString('en-US', options1);
	const options2 = { hour: '2-digit', minute: '2-digit'};
	const formattedTime = date.toLocaleTimeString('en-US', options2);
	return formattedDate + ', ' + formattedTime;
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
			if (!response.ok)
				throw new Error('Block user request failed:' + response.statusText);
			return response.json();
		})
		.then(data => {
			console.log('User blocked:' + friend);
			notifyUser(friend, 'friendship_changed', 'none');
			updateListsandChat('none');
		})
		.catch(error => {
			console.error('Error during block user:' + error);
		});
}

var chatBuilt = false;

function buildChat() {
	if (document.querySelector('.showChat') !== null)
		document.querySelector('.chatContent').classList.remove('showChat');
	buildChatFriendsList();
	chatBuilt = true;
}

function toggleEmojiPicker() {
	const emojiPicker = document.querySelector('.emojiPicker');
	emojiPicker.classList.toggle('hideEmojis');
}

function insertEmoji(emoji) {
	const messageInput = document.querySelector('#sendMessageInput');
	messageInput.value += emoji;
}
