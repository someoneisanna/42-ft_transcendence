function createChat(friend, current_user) {

	// Create a chat room name
	const users = [friend, current_user].sort();
	const roomName = 'chatRoom_' + users[0] + '-' + users[1];
	alert('Chat between ' + friend + ' and ' + current_user + ': ' + roomName);
	
	// Connect to the chat room
	chatSocket.send(JSON.stringify({
		'type': 'join_room',
		'room_name': roomName,
		'username': current_user
	}));

	//console.log('Chat room created:', roomName);

	// Set up message sending
	document.querySelector("#id_message_send_button").onclick = function() {
		var messageInput = document.querySelector("#id_message_send_input").value;
		if (messageInput == '')
			return;
		chatSocket.send(JSON.stringify({ 
			'type': 'chat_message',
			'room_name': roomName,
			'username': current_user,
			'message': messageInput
		}));
		document.querySelector("#id_message_send_input").value = '';
	};
}

function buildChatFriendsList() {
	var listContainer = document.getElementById('friendsListContent');
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
				var newElement = `<li class="friendUser">
						<img src="${item.profile_pic}" width="50" height="50" class="rounded-circle" onerror="this.onerror=null; this.src='/media/default.jpg';">
						<p>${item.username}</p>
						<button class="btn btn-primary" onclick="createChat('${item.username}', '${data.current_user}')">Chat</button>
					</li>`;
				listContainer.innerHTML += newElement;
			});
		})
		.catch(error => {
			console.error('Error during search:', error);
		});
}

function initializeJS() {

	chatSocket.onmessage = function (e) {
		
		const data = JSON.parse(e.data);
		var div = document.createElement("div");
		div.innerHTML = data.user + " : " + data.message;
		document.querySelector("#id_message_send_input").value = "";
		document.querySelector("#id_chat_item_container").appendChild(div);
	};

}
