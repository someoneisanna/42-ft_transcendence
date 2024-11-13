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

	console.info('WS: Received message:', data);

	if (type === 'authenticated')
		console.debug('WS: ' + username + ' is now connected to the ws.');
	
	if (type === 'receive_notification') {
		console.debug('WS: receive_notification:', data);
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
};
