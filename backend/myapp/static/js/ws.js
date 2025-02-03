chatSocket = new WebSocket("wss://" + window.location.host + "/ws/chat/");
pongSocket = new WebSocket("wss://" + window.location.host + "/ws/pong/");

chatSocket.onopen = function (e){
	console.info("The connection to the chatSocket was setup successfully!");
};

chatSocket.onclose = function (e) {
	console.info("The connection to the chatSocket was closed!");
};

chatSocket.onerror = function (error) {
	console.error("chatSocket error:", error);
};

window.onbeforeunload = function () {
	chatSocket.close();
};

var chat_users_ready = 0;

chatSocket.onmessage = function (e) {
	const data = JSON.parse(e.data);
	const type = data.type;
	const action = data.action;
	const new_relationship = data.new_relationship;
	const notification = data.notification;
	const room_name = data.room_name;
	const username = data.username;
	const message = data.message;
	const timestamp = formatDate(data.sent_at);

	if (type === 'check_if_user_is_logged_in') {
		if (data.logged_in) {
			alert('You are already logged in on another device. You will be logged out from this device.');
			signOut(true);
		}
		else {
			loadPage('/layout/', true);
		}
	}

	if (type === 'receive_notification') {
		if (notification === 'friendship_changed') {
			if (new_relationship === 'none' && sentInvitationToPongMatch == data.from) {
				sentInvitationToPongMatch = "";
				document.getElementById('inviteToMatchButton').classList.remove('hide');
				document.getElementById('cancelInviteToMatchButton').classList.add('hide');
			}
			updateListsandChat(new_relationship);
		}
		if (notification === 'invitation_changed') {
			document.getElementById('notificationList').innerHTML = `<h6 id="tlPendingInvitations" class="text-white ms-3 me-3">Pending Invitations</h6> <li><hr class="dropdown-divider"></li>`;
			searchPendingInvitations();
		}
		if (notification === 'user_is_online') {
			console.info('WS: ' + data.from + ' is now online.');
			document.getElementById(`onlineStatus_${data.from}`).style.backgroundColor = '#28a745';
		}
		if (notification === 'user_is_offline') {
			console.info('WS: ' + data.from + ' is now offline.', sentInvitationToPongMatch);
			document.getElementById(`onlineStatus_${data.from}`).style.backgroundColor = 'rgb(110, 110, 110)';
			if (receivedInvitationsToPongMatch.includes(data.from)) {
				receivedInvitationsToPongMatch = receivedInvitationsToPongMatch.filter(item => item !== data.from);
				checkForMatchInvitation(data.from);
				if (acceptedPongMatchInvitation == data.from) {
					inviterDeclinedStartPongMatch(data.from);
					pongMatchModal.hide();
				}
				chat_users_ready = 0;
				acceptedPongMatchInvitation = "";
			}
			if (data.from == sentInvitationToPongMatch)
			{
				sentInvitationToPongMatch = "";
				removeInviteToMatch(data.from);
				if (pongMatchModal)
					pongMatchModal.hide();
				chat_users_ready = 0;
			}
		}
		if (notification === 'user_deleted_account') {
			updateListsandChat('none');
			if (receivedInvitationsToPongMatch.includes(data.from))
				receivedInvitationsToPongMatch = receivedInvitationsToPongMatch.filter(item => item !== data.from);
			if (sentInvitationToPongMatch == data.from) {
				sentInvitationToPongMatch = "";
				document.getElementById('inviteToMatchButton').classList.remove('hide');
				document.getElementById('cancelInviteToMatchButton').classList.add('hide');
			}
		}
	}

	if (type === 'match_invitation' && action === 'invite_user') {
		if (data.to === current_user) {
			console.debug('WS: received match invitation from ' + data.from, data, receivedInvitationsToPongMatch);
			if (receivedInvitationsToPongMatch.includes(data.from))
				return;
			receivedInvitationsToPongMatch.push(data.from);
			checkForMatchInvitation(data.from);
		}
		else if (data.from === current_user) {
			console.debug('WS: sent match invitation to ' + data.to, data);
			if (data.status === 'online') {
				getLanguage();
				var alertMessage = getTranslation("You have invited ") + ` <strong>${data.to}</strong> ` + getTranslation("to a Pong Match");
				var newElement = `
					<div class="mt-2 alert alert-success alert-dismissible fade show" role="alert" id="alertContainer">
						${alertMessage}
						<span id="matchInvitationText"></span>
						<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
					</div>`;
				document.getElementById('matchInvitationTextContainer').innerHTML += newElement;
				changeInviteMatchButton(room_name, data.to);
				sentInvitationToPongMatch = `${data.to}`;
			}
			else {
				getLanguage();
				var alertMessage = `<strong>${data.to}</strong> ` + getTranslation("is offline. Try again when they are online.");
				var newElement = `
					<div class="mt-2 alert alert-warning alert-dismissible fade show" role="alert" id="alertContainer">
						${alertMessage}
						<span id="matchInvitationText"></span>
						<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
					</div>`;
				document.getElementById('matchInvitationTextContainer').innerHTML += newElement;
			}
		}
	}

	if (type === 'match_invitation' && action === 'cancel_invite') {
		console.debug('WS: received cancel match invitation from ' + data.from, data);
		if (data.to === current_user) {
			if (receivedInvitationsToPongMatch.includes(data.from)) {
				receivedInvitationsToPongMatch = receivedInvitationsToPongMatch.filter(item => item !== data.from);
				checkForMatchInvitation(data.from);
			}
		}
	}

	if (type === 'invite_to_match_answer') {
		if (data.answer === 'accepted')
				userAcceptedMatchInvitation(data.from);
		else if (data.answer === 'declined')
			userDeclinedMatchInvitation(data.from);
	}

	if (type === 'start_pong_match') {
		console.log('WS: start_pong_match', data);
		chat_users_ready++;
		if (chat_users_ready == 2) {
			console.log('WS: both users are ready to start the pong match');
			chat_users_ready = 0;
			pongSocket.send(JSON.stringify({
				'type': 'join_pong_room',
				'room_name': data.room_name,
				'username': current_user
			}));
			pongIsRemote = true;
			pongRoomName = data.room_name;
			pongMatchModal.hide();
			if (data.role == 'inviter')
			{
				console.log('WS: inviter starting pong match');
				sentInvitationToPongMatch = "";
			}
			if (data.role == 'invitee')
			{
				console.log('WS: invitee starting pong match');
				receivedInvitationsToPongMatch = receivedInvitationsToPongMatch.filter(item => item !== String(data.from));
				acceptedPongMatchInvitation = "";
			}
			loadPage('/pong_game/', false);
		}
	}

	if (type === 'cancel_start_pong_match') {
		console.log('WS: cancel_start_pong_match', data);
		chat_users_ready = 0;
		if (data.role == 'invitee') {
			acceptedPongMatchInvitation = "";
		}
		if (data.role == 'inviter') {
			receivedInvitationsToPongMatch = receivedInvitationsToPongMatch.filter(item => item !== String(data.from));
		}
		if (pongMatchModal)
			pongMatchModal.hide();
		document.getElementById('pongStartMatchModal').addEventListener('hidden.bs.modal', function () {
			document.getElementById('pongStartMatchModalBody').classList.remove('hide');
			document.getElementById('pongMatchChatStartedBody').classList.add('hide');
			document.getElementById('cancelPongMatchXButton').classList.add('hide');
		});
		inviterDeclinedStartPongMatch(data.from);
	}

	if (type === 'chat_message' || type === 'add_stored_message')
	{
		if (username === current_user) {
			var newElement = `
				<div class="d-flex flex-row justify-content-end pt-1">
					<div>
						<p class="messageText small p-2 me-3 mb-1 text-white rounded-3" style="background-color:#449397;">${message}</p>
						<p class="small me-3 mb-1 text-white float-end smallerText">${timestamp}</p>
					</div>
				</div>`;
		}
		else {
			var newElement = `
				<div class="d-flex flex-row justify-content-start">
					<div>
						<p class="messageText small p-2 ms-3 mb-1 text-black rounded-3" style="background-color:#b9b8b6;">${message}</p>
						<p class="small ms-3 mb-3 text-white smallerText">${timestamp}</p>
					</div>
				</div>`;
		}
		var textsContainer = document.getElementById('textsContainer');
		textsContainer.innerHTML += newElement;
		var scrollableTexts = document.querySelector('.scrollableTexts');
		scrollableTexts.scrollTop = scrollableTexts.scrollHeight;
	}

	if (type === 'chat_message') {
		if (data.sent_at)
			document.getElementById(`timeLastMsg_${room_name}`).innerHTML = formatDate(data.sent_at);
		document.getElementById(`lastMsg_${room_name}`).innerHTML = message;
	}

	if (type === 'online_status') {
		// console.debug('WS: online status of ' + username + ': ' + data.online);
		document.getElementById(`onlineStatus_${username}`).style.backgroundColor = '#28a745';
	}
};

pongSocket.onopen = function (e){
	console.info("The connection to the pongSocket was setup successfully!");
};

pongSocket.onclose = function (e) {
	console.info("The connection to the pongSocket was closed!");
};

pongSocket.onerror = function (error) {
	console.error("pongSocket error:", error);
};

var users_ready = 0;

var tournament_player3;
var tournament_player4;

pongSocket.onmessage = function (e) {

	const data = JSON.parse(e.data);
	const type = data.type;
	const action = data.action;

	// console.debug('WS: Received message:', data);

	if (type == 'receive_notification')
	{
		// console.debug('WS: receive_notification:', data);
		if (action == 'Create a new game') {
			startPongRemoteGame(data);
		}
		else if (action == 'Create a new tournament game')
			startPongRemoteTournamentGame(data);
		else if (action == 'User is ready')
		{
			users_ready++;
			if (users_ready == 2)
			{
				startGameWithSettings(getRemoteSettings(data.player1, data.player2));
				users_ready = 0;
			}
		}
		else if (action == 'User is ready for tournament')
		{
			users_ready++;
			if (users_ready == 4)
			{
				tournament_player3 = data.player3;
				tournament_player4 = data.player4;
				tournamentPlayerNames = [data.player1, data.player2, data.player3, data.player4];
				// tournamentPlayerNames = ["1", "2"];
				startGameWithSettings(getRemoteTournamentSettings());
				users_ready = 0;
			}
		}
		else if (action == 'User left')
			remoteOpponentLeft(data.player1);
	}
	if (type == 'receive_pad_state')
		updateRemotePad(data);
	else if (type == 'receive_ball_state')
		updateRemoteBall(data);
	else if (type == 'receive_score_notification')
		updateRemoteScore(data);
	else if (type == 'receive_mod_spawn')
		updateRemoteModifierSpawn(data);
};
