function showCookieConsent() {
	var cookieConsentModal = new bootstrap.Modal(document.getElementById('cookieconsent'));
	cookieConsentModal.show();
	getLanguage();
	translateElement("cookieconsentLabel");
	translateElement("tlCookieModal");
	const acceptButton = document.getElementById('acceptCookiesButton');
	if (acceptButton) {
		acceptButton.addEventListener('click', function() {
			localStorage.setItem('cookieConsent_transcendence', 'accepted');
			cookieConsentModal.hide();
		});
	}
}

function loadScript(url) {
	const script = document.createElement('script');
	script.src = url;
	script.onload = () => {
		initializeJS();
	};
	document.body.appendChild(script);
}

var prevURL = '';
var currURL = window.location.href;

document.addEventListener('DOMContentLoaded', () => {

	const contentDiv = document.getElementById('content');
	const layoutDiv = document.getElementById('layout');
	const chatDiv = document.getElementById('chat');
	
	window.loadPage = (url, addHistory=true, signOut=false) => {
		gameOngoing = false;
		canvasExit = true;
		prevURL = currURL;
		currURL = url;
		if (prevURL === '/pong_matchmaking/') {
			pongSocket.send(JSON.stringify({
				'type': 'leave_matchmaking_room',
				'username': current_user
			}));
		}
		if (prevURL === '/pong_remoteTournament/') {
			pongSocket.send(JSON.stringify({
				'type': 'leave_tournament_matchmaking_room',
				'username': current_user
			}));
		}
		if (prevURL === '/pong_game/') {
			if (gameSettings.connectionType === "remote") {
				pongSocket.send(JSON.stringify({
					'type': 'leave_pong_room',
					'username': current_user
				}));
				pongIsRemote = false;
			}
		}
		fetch(url)
			.then(response => {
			if (response.status === 401)
				closeWebSockets();
			if (!response.ok && url !== '/landing/') {
				loadPage('/landing/', false);
					history.replaceState({ url: '/landing/' }, '', '/landing/');
					return Promise.reject('Unauthorized');
				}
				if (response.ok)
					return response.text();
				throw new Error('Page not found');
			})
			.then(html => {
				if (localStorage.getItem('cookieConsent_transcendence') !== 'accepted')
					showCookieConsent();

				if (url === '/layout/') {
					layoutDiv.innerHTML = html;
					loadPage('/game_choice/', true);
					loadScript('/static/js/layout.js');
					if (chatBuilt === false)
						buildChat();
				}
				else
					contentDiv.innerHTML = html;

				if (url === '/landing/') {
					layoutDiv.innerHTML = '';
					chatDiv.classList.add('hiddenChat');
					loadScript('/static/js/landing_page.js');
				}
				else {
					chatDiv.classList.remove('hiddenChat');
					if (url === '/game_choice/')
						loadScript('/static/js/game_choice.js');
					else if (url === '/dropdown_profile/')
						loadScript('/static/js/dropdown_profile.js');
					else if (url === '/dropdown_settings/')
						loadScript('/static/js/dropdown_settings.js');
					else if (url === '/pong_menu/')
						loadScript('/static/js/pong/pong_menu.js');
					else if (url === '/dropdown_friends/')
						loadScript('/static/js/dropdown_friends.js');
					else if (url === '/pong_menu/')
						loadScript('/static/js/pong/pong_menu.js');
					else if (url === '/pong_quickplay/')
						loadScript('/static/js/pong/pong_quickplay.js');
					else if (url === '/pong_tournament/')
						loadScript('/static/js/pong/pong_tournament.js');
					else if (url === '/pong_game/')
						loadScript('/static/js/pong/pong_game.js');
					else if (url === '/pong_matchmaking/')
						loadScript('/static/js/pong/pong_matchmaking.js');
					else if (url === '/pong_localTournament/')
						loadScript('/static/js/pong/pong_localTournament.js');
					else if (url === '/pong_remoteTournament/')
						loadScript('/static/js/pong/pong_remoteTournament.js');
					else if (url === '/pong_customGame/')
						loadScript('/static/js/pong/pong_customGame.js');
					else if (url.startsWith("/user_profile/"))
						loadScript('/static/js/user_profile.js');
				}

				if (addHistory && url !== '/game_choice/' && (url !== '/landing/' || signOut == true)) {
					history.pushState({ url: url }, '', url);
				}
			})
			.catch(error => {
				console.error('Error loading page:', error);
				contentDiv.innerHTML = '<p>Page could not be loaded.</p>';
			});
	};
	
	// Automatically load the landing page when the site is visited at root
	if (window.location.pathname === '/' || window.location.pathname === '') {
		loadPage('/landing/', false);
		history.replaceState({ url: '/landing/' }, '', '/landing/');
	}
	else
		loadPage(window.location.pathname, true);
	
	// Handle back/forward button
	window.addEventListener('popstate', (event) => {
		if (event.state && event.state.url) {
			loadPage(event.state.url, false);
		}
	});
});
