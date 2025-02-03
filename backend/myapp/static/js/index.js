var current_user = '';
var chatSocket = null;
var pongSocket = null;

var pongMatchModal;
var lastActiveButton = null;
var sentInvitationToPongMatch = "";
var receivedInvitationsToPongMatch = [];
var acceptedPongMatchInvitation = "";

function closeWaitingForPlayer(friend, role) {
	if (confirm('Do you want to cancel the match?') == false)
		return;
	pongMatchModal.hide();
	if (role == 'invitee') {
		acceptedPongMatchInvitation = "";
		receivedInvitationsToPongMatch = receivedInvitationsToPongMatch.filter(item => item !== String(friend));
	}
	else if (role == 'inviter') {
		sentInvitationToPongMatch = "";
	}
	chat_users_ready = 0;
	chatSocket.send(JSON.stringify({
		'type': 'cancel_start_pong_match',
		'room_name': '',
		'username': current_user,
		'friend': friend,
		'role': role
	}));
}

function showStartMatchModal(friend, role) {
	getLanguage();
	document.getElementById('pongStartMatchModalLongTitle1').innerHTML = getTranslation("Would you like to start your Pong Match with ") + `<strong>${friend}</strong>?`;
	pongMatchModal = new bootstrap.Modal(document.getElementById('pongStartMatchModal'));
	pongMatchModal.show();
	document.getElementById('pongStartMatchModalBody').classList.remove('hide');
	document.getElementById('pongMatchChatStartedBody').classList.add('hide');
	document.getElementById('cancelPongMatchXButton').classList.add('hide');
	document.getElementById('startPongMatchChat').onclick = function() {
		chatSocket.send(JSON.stringify({
			'type': 'start_pong_match',
			'room_name': getChannelRoomName(friend),
			'username': current_user,
			'friend': friend,
			'role': role
		}));
		document.getElementById('pongStartMatchModalBody').classList.add('hide');
		document.getElementById('pongMatchChatStartedBody').classList.remove('hide');
		setTimeout(function() {
			closeModalButton = document.getElementById('cancelPongMatchXButton');
			closeModalButton.classList.remove('hide');
			closeModalButton.onclick = function() {
				closeWaitingForPlayer(friend, role);
			}
		}, 15000);
	};
	document.getElementById('cancelPongMatchChat').onclick = function() {
		chat_users_ready = 0;
		if (role == 'invitee') {
			acceptedPongMatchInvitation = "";
			receivedInvitationsToPongMatch = receivedInvitationsToPongMatch.filter(item => item !== String(friend));
		}
		else if (role == 'inviter') {
			sentInvitationToPongMatch = "";
		}
		chat_users_ready = 0;
		pongMatchModal.hide();
		chatSocket.send(JSON.stringify({
			'type': 'cancel_start_pong_match',
			'room_name': '',
			'username': current_user,
			'friend': friend,
			'role': role
		}));
	}
}

function userAcceptedMatchInvitation(friend) {
	console.log('User accepted match invitation:', friend);
	showStartMatchModal(friend, 'inviter');
	document.getElementById('cancelInviteToMatchButton').classList.add('hide');
	document.getElementById('inviteToMatchButton').classList.remove('hide');
}

function inviterDeclinedStartPongMatch(friend) {
	const container = document.getElementById('matchInvitationTextContainer');
		getLanguage();
		var alertMessage = `<strong>${friend}</strong>` + getTranslation(' has cancelled the Pong Match.');
		var newElement = `
		<div class="mt-2 alert alert-danger alert-dismissible fade show" role="alert" id="alertContainer">
			${alertMessage}
			<span id="matchInvitationText"></span>
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
		</div>`;
	container.innerHTML += newElement;
}

function userDeclinedMatchInvitation(friend) {
	console.log('User declined match invitation:', friend);
	const container = document.getElementById('matchInvitationTextContainer');
		getLanguage();
		var alertMessage = `<strong>${friend}</strong>` + getTranslation(' has declined your invitation to a Pong Match.');
		var newElement = `
		<div class="mt-2 alert alert-danger alert-dismissible fade show" role="alert" id="alertContainer">
			${alertMessage}
			<span id="matchInvitationText"></span>
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
		</div>`;
	container.innerHTML += newElement;
	sentInvitationToPongMatch = "";
	document.getElementById('cancelInviteToMatchButton').classList.add('hide');
	document.getElementById('inviteToMatchButton').classList.remove('hide');
}

function acceptMatchInvitation(friend) {
	if (receivedInvitationsToPongMatch.includes(String(friend))) {
		console.log('Accepting match invitation:', friend, current_user, receivedInvitationsToPongMatch);
		showStartMatchModal(friend, 'invitee');
		chatSocket.send(JSON.stringify({
			'type': 'invite_to_match_answer',
			'room_name': "",
			'username': current_user,
			'friend': friend,
			'answer': 'accepted'
		}));
		const container = document.getElementById('matchInvitationTextContainer');
		container.innerHTML = '';
		acceptedPongMatchInvitation = friend;
		if (sentInvitationToPongMatch !== "")
			cancelInviteToMatch(getChannelRoomName(sentInvitationToPongMatch), sentInvitationToPongMatch);
	}
	else
	{
		const container = document.getElementById('matchInvitationTextContainer');
		getLanguage();
		var alertMessage = getTranslation("s invitation ") + `<strong>${friend}</strong>` + getTranslation("has expired. Open the chat again to refresh.");
		var newElement = `
		<div class="mt-2 alert alert-warning alert-dismissible fade show" role="alert" id="alertContainer">
			${alertMessage}
			<span id="matchInvitationText"></span>
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
		</div>`;
		container.innerHTML += newElement;
	}
}

function rejectMatchInvitation(friend) {
	console.log('Rejecting match invitation:', friend, current_user);
	chatSocket.send(JSON.stringify({
		'type': 'invite_to_match_answer',
		'room_name': "",
		'username': current_user,
		'friend': friend,
		'answer': 'declined'
	}));
	const container = document.getElementById('matchInvitationTextContainer');
	container.innerHTML = '';
	receivedInvitationsToPongMatch = receivedInvitationsToPongMatch.filter(item => item !== String(friend));
	matchButton = document.querySelector('.matchButtonClass')
	matchButton.title = `Invite ${friend} to a match`;
	matchButton.onclick = function() {
		inviteUserToMatch(friend, current_user, getChannelRoomName(friend));
	}
}

function addChatButtons(roomName, friend) {
	profileButton = document.querySelector('.profileButtonClass');
	getLanguage();
	profileButton.title = tlIndex == 0 ? `Go to ${friend}s profile` : getTranslation("Go to") + friend;
	profileButton.onclick = function() {
		goToFriendProfile(friend);
	}
	if (receivedInvitationsToPongMatch.includes(friend)) {
		matchButton = document.querySelector('.matchButtonClass')
		matchButton.title = getTranslation('You were invited to a match by ') + `${friend}` + getTranslation('. Click to accept.');
		matchButton.onclick = function() {
			acceptMatchInvitation(friend);
		}
	}
	else {
		matchButton = document.querySelector('.matchButtonClass')
		matchButton.title = getTranslation('Invite ') + `${friend}` + getTranslation(' to a match');
		matchButton.onclick = function() {
			inviteUserToMatch(friend, current_user, roomName);
		}
	}
	blockButton = document.querySelector('.blockButtonClass');
	blockButton.title = getTranslation('Block ') + `${friend}`;
	blockButton.onclick = function() {
		blockUser(friend, current_user);
	}
}

function checkForMatchInvitation(from) {
	console.log('Checking for match invitation:', 'received:', receivedInvitationsToPongMatch, 'sent:', sentInvitationToPongMatch);
	const container = document.getElementById('matchInvitationTextContainer');
	if (receivedInvitationsToPongMatch.includes(from)) {
		getLanguage();
		var alertMessage = `<strong>${from}</strong>` + getTranslation(' has invited you to a Pong Match.');
		var newElement = `
			<div class="mt-2 alert alert-info fade show d-flex align-items-center justify-content-between" role="alert" id="alertContainer">
				<div class="alert-text">
					${alertMessage}
				</div>
				<div class="alert-buttons">
					<button type="button" class="btn btn-success btn-sm" onclick="acceptMatchInvitation('${from}')"><i class="fa-solid fa-check"></i></button>
					<button type="button" class="btn btn-danger btn-sm" onclick="rejectMatchInvitation('${from}')"><i class="fa-solid fa-xmark"></i></button>
				</div>
			</div>`
		container.innerHTML += newElement;
		const inviteToMatchButton = document.getElementById('inviteToMatchButton');
		if (inviteToMatchButton.title === `Invite ${from} to a match`)
			inviteToMatchButton.title = `You were invited to a match by ${from}. Click to accept.`;
		inviteToMatchButton.onclick = function() {
			acceptMatchInvitation(from);
		};
	}
	else
		container.innerHTML = '';
}

function sanitizeInput(input) {
	const tempDiv = document.createElement('div');
	tempDiv.textContent = input;
	return tempDiv.innerHTML;
}

function openChat(roomName, friend, buttonRef) {

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

	addChatButtons(roomName, friend);
	checkForMatchInvitation(friend);

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

		const rawmessageInput = document.querySelector("#sendMessageInput").value;
		const messageInput = sanitizeInput(rawmessageInput);

		if (messageInput == '')
			return;
		if (messageInput.toLowerCase().search("merry christmas") != -1) {
			document.getElementById("santaHat").classList.remove("hide");
		}
		chatSocket.send(JSON.stringify({
			'type': 'chat_message',
			'room_name': roomName,
			'username': current_user,
			'friend': friend,
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
	loadPage('/user_profile/?u=' + username);
}

function buildChatFriendsList() {
	var listContainer = document.getElementById('chatFriendsListContent');
	listContainer.innerHTML = '';
	fetch('/api/get_friends/')
		.then(response => {
			if (response.status === 401)
				closeWebSockets();
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
					openChat(roomName, item.username, newElement);
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

function inviteUserToMatch(friend, current_user, roomName) {
	console.log('Inviting user to match:', friend);
	fetch('/api/get_game_invitation_settings/?u=' + friend)
		.then(response => {
			if (response.status === 401)
				closeWebSockets();
			if (!response.ok)
				throw new Error('Game invitation failed:', response.statusText);
			return response.json();
		})
		.then(data => {
			console.log('Game invitation settings:', data);
			if (data.allow_game_invitations == true) {
				chatSocket.send(JSON.stringify({
					'type': 'invite_to_match',
					'action': 'invite_user',
					'room_name': roomName,
					'username': current_user,
					'friend': friend
				}));
			}
			else {
				var container = document.getElementById('matchInvitationTextContainer');
				getLanguage();
				var alertMessage = `<strong>${friend}</strong>` + getTranslation(' does not accept game invitations.');
				var newElement = `
					<div class="mt-2 alert alert-danger alert-dismissible fade show" role="alert" id="alertContainer">
						${alertMessage}
						<span id="matchInvitationText"></span>
						<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
					</div>`;
				container.innerHTML += newElement;
			}
		})
		.catch(error => {
			console.error('Error during game invitation:', error);
		});
}

function cancelInviteToMatch(roomName, friend) {
	console.log('Cancelling invite to match:', sentInvitationToPongMatch);
	sentInvitationToPongMatch = "";
	document.getElementById('inviteToMatchButton').classList.remove('hide');
	document.getElementById('cancelInviteToMatchButton').classList.add('hide');
	var container = document.getElementById('matchInvitationTextContainer');
	getLanguage();
	var alertMessage = getTranslation('Your invitation to a Pong Match was cancelled.');
	var newElement = `
		<div class="mt-2 alert alert-danger alert-dismissible fade show" role="alert" id="alertContainer">
			<strong>${alertMessage}</strong>
			<span id="matchInvitationText"></span>
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
		</div>`;
	container.innerHTML += newElement;
	chatSocket.send(JSON.stringify({
		'type': 'invite_to_match',
		'action': 'cancel_invite',
		'room_name': roomName,
		'username': current_user,
		'friend': friend
	}));
}

function removeInviteToMatch(friend) {
	console.log('Removing invite to match:', friend);
	const inviteToMatchButton = document.getElementById('inviteToMatchButton');
	inviteToMatchButton.classList.remove('hide');
	const cancelInviteToMatchButton = document.getElementById('cancelInviteToMatchButton');
	cancelInviteToMatchButton.classList.add('hide');
	var container = document.getElementById('matchInvitationTextContainer');
	getLanguage();
	var alertMessage = getTranslation('Your invitation to a Pong Match has expired because ') + `<strong>${friend}</strong>` + getTranslation(' is now offline.');
	var newElement = `
		<div class="mt-2 alert alert-warning alert-dismissible fade show" role="alert" id="alertContainer">
			${alertMessage}
			<span id="matchInvitationText"></span>
			<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
		</div>`;
	container.innerHTML += newElement;
}

function changeInviteMatchButton(room_name, friend) {
	document.getElementById('inviteToMatchButton').classList.add('hide');
	const cancelInviteToMatchButton = document.getElementById('cancelInviteToMatchButton');
	cancelInviteToMatchButton.classList.remove('hide');
	getLanguage();
	cancelInviteToMatchButton.title = getTranslation('You invited ') + friend + getTranslation(' to a match. Click to cancel.');
	cancelInviteToMatchButton.onclick = function() {
		cancelInviteToMatch(room_name, friend);
	};
}

function cancelInvitesandInvitationstoMatch(friend) {
	if (sentInvitationToPongMatch === friend) {
		cancelInviteToMatch(getChannelRoomName(friend), friend);
	}
	if (receivedInvitationsToPongMatch.includes(friend)) {
		receivedInvitationsToPongMatch = receivedInvitationsToPongMatch.filter(item => item !== String(friend));
	}
}

function userCannotPost() {
	window.location.href = '/';
	closeWebSockets();
}

function closeWebSockets() {
	if (chatSocket && chatSocket.readyState === WebSocket.OPEN)
		chatSocket.close();
	if (pongSocket && pongSocket.readyState === WebSocket.OPEN)
		pongSocket.close();	
}

function blockUser(friend, current_user) {
	getLanguage();
	if (confirm(getTranslation("Are you sure you want to block ") + friend + "?") == false)
		return;
	fetch('/api/block_user/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrftoken_var
		},
		body: JSON.stringify({'target': friend, 'current_user': current_user})
		})
		.then(response => {
			if (response.status === 401 || response.status === 403)
				userCannotPost();
			if (!response.ok)
				throw new Error('Block user request failed:' + response.statusText);
			return response.json();
		})
		.then(data => {
			console.log('User blocked:' + friend);
			cancelInvitesandInvitationstoMatch(friend);
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
