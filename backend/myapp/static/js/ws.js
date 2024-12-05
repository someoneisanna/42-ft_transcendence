chatSocket = new WebSocket("wss://" + window.location.host + "/ws/chat/");
pongSocket = new WebSocket("wss://" + window.location.host + "/ws/pong/");

chatSocket.onopen = function (e){
	console.info("The connection to the chatSocket was setup successfully!");
};

chatSocket.onclose = function (e) {
	console.info("The connection to the chatSocket was closed unexpectedly!");
};

chatSocket.onerror = function (error) {
	console.error("chatSocket error:", error);
};

window.onbeforeunload = function () {
	chatSocket.close();
};

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

	// if (type === 'online_users')
	// 	console.debug('WS: Received message:', data);

	if (type === 'authenticated')
		console.info('WS: ' + username + ' is now connected to the chat ws.');

	if (type === 'receive_notification') {
		// console.debug('WS: receive_notification:', data);
		if (notification === 'friendship_changed')
			updateListsandChat(new_relationship);
		if (notification === 'invitation_changed') {
			document.getElementById('notificationList').innerHTML = `<h6 class="text-white ms-3 me-3">Pending Invitations</h6> <li><hr class="dropdown-divider"></li>`;
			searchPendingInvitations();
		}
	}

	if (type === 'chat_message' || type === 'add_stored_message')
	{
		if (username === current_user)
			var newElement = `
				<div class="d-flex flex-row justify-content-end pt-1">
					<div>
						<p class="messageText small p-2 me-3 mb-1 text-white rounded-3" style="background-color:#449397;">${message}</p>
						<p class="small me-3 mb-1 text-white smallerText">${timestamp}</p>
					</div>
				</div>`;
		else
			var newElement = `
				<div class="d-flex flex-row justify-content-start">
					<div>
						<p class="messageText small p-2 ms-3 mb-1 text-black rounded-3" style="background-color:#b9b8b6;">${message}</p>
						<p class="small ms-3 mb-3 text-white float-end smallerText">${timestamp}</p>
					</div>
				</div>`;
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

	if (type === 'online_status')
		document.getElementById(`onlineStatus_${username}`).style.backgroundColor = '#28a745';
};

pongSocket.onopen = function (e){
	console.info("The connection to the pongSocket was setup successfully!");
};

pongSocket.onclose = function (e) {
	console.info("The connection to the pongSocket was closed unexpectedly!");
};

pongSocket.onerror = function (error) {
	console.error("pongSocket error:", error);
};

var users_ready = 0;

pongSocket.onmessage = function (e) {

	const data = JSON.parse(e.data);
	const type = data.type;
	const action = data.action;

	// console.debug('WS: Received message:', data);

	if (type == 'receive_notification')
	{
		console.debug('WS: receive_notification:', data);
		if (action == 'Create a new game') {
			startPongRemoteGame(data);
		}
		else if (action == 'User is ready')
		{
			users_ready++;
			console.debug('userisready', users_ready);
			if (users_ready == 2)
			{
				console.debug('gggggggggggggggggggggggggggggggggggggg');
				startGameWithSettings(getRemoteSettings(data.player1, data.player2));
				users_ready = 0;
			}
		}
		else if (action == 'User left')
		{
			remoteOpponentLeft();
		}
	}
	if (type == 'receive_pad_state')
		updateRemotePad(data);
	else if (type == 'receive_ball_state')
		updateRemoteBall(data);
	else if (type == 'receive_score_notification')
		updateRemoteScore(data);
};
