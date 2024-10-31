function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

var current_user = '';

const csrftoken_var = getCookie('csrftoken');

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
