function createChat(friend, current_user) {
	alert('Chat between ' + friend + ' and ' + current_user);
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


document.querySelector("#id_message_send_input").focus();

document.querySelector("#id_message_send_input").onkeyup = function (e) {
	if (e.keyCode == 13) {
		document.querySelector("#id_message_send_button").click();
	}
};

document.querySelector("#id_message_send_button").onclick = function (e) {
	var messageInput = document.querySelector(
		"#id_message_send_input"
	).value;
	chatSocket.send(JSON.stringify({ message: messageInput, username : "{{request.user.username}}"}));
};

chatSocket.onmessage = function (e) {
	const data = JSON.parse(e.data);
	var div = document.createElement("div");
	div.innerHTML = data.username + " : " + data.message;
	document.querySelector("#id_message_send_input").value = "";
	document.querySelector("#id_chat_item_container").appendChild(div);
};

}
