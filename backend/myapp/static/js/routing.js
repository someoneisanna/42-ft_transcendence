function showCookieConsent() {
	var cookieConsentModal = new bootstrap.Modal(document.getElementById('cookieconsent'));
	cookieConsentModal.show();
	const acceptButton = document.getElementById('acceptCookiesButton');
	if (acceptButton) {
		acceptButton.addEventListener('click', function() {
			localStorage.setItem('cookieConsent_transcendence', 'accepted');
			cookieConsentModal.hide();
		});
	}
}

function loadScript(url) {
	// console.debug('Loading script:', url);
	const script = document.createElement('script');
	script.src = url;
	// if (url === '/static/js/pong/pong_game.js')
		// script.type = 'module';
	script.onload = () => {
		// console.log(initializeJS.toString());
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
	
	window.loadPage = (url, addHistory, signOut) => {
		gameOngoing = false;
		prevURL = currURL;
		currURL = url;
		if (prevURL === '/pong_matchmaking/') {
			pongSocket.send(JSON.stringify({
				'type': 'leave_matchmaking_room',
				'username': current_user
			}));
		}
		if (prevURL === '/pong_game/') {
			pongSocket.send(JSON.stringify({
				'type': 'leave_pong_room',
				'username': current_user
			}));
		}
		fetch(url)
			.then(response => {
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
					// loadScript('/static/js/layout.js');
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
						buildFriendsList();
					else if (url === '/pong_game/')
						loadScript('/static/js/pong/pong_game.js');
					else if (url === '/pong_matchmaking/')
					{
						pongIsRemote = true;
						loadScript('/static/js/pong/pong_matchmaking.js');
					}
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
