document.addEventListener('DOMContentLoaded', () => {
	const contentDiv = document.getElementById('content');
	const layoutDiv = document.getElementById('layout');

	function loadScript(url) {
		const script = document.createElement('script');
		script.src = url;
		script.onload = () => {
			initializeJS();
		};
		document.body.appendChild(script);
	}

	window.loadPage = (url, addHistory, signOut) => {
		fetch(url)
			.then(response => {
				if (!response.ok && url !== '/landing/') {
					loadPage('/landing/', false);
					history.replaceState({ url: '/landing/' }, '', '/landing/');
					return Promise.reject('Unauthorized');
				}
				if (response.ok) {
					return response.text();
				}
				throw new Error('Page not found');
			})
			.then(html => {
				if (localStorage.getItem('cookieConsent_transcendence') !== 'accepted') {
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
				if (url === '/layout/') {
					layoutDiv.innerHTML = html;
					loadPage('/game_choice/', true);
				}
				else
					contentDiv.innerHTML = html;

				if (url === '/landing/') {
					layoutDiv.innerHTML = '';
					loadScript('/static/js/landing_page.js');
				}
				else if (url === '/layout/')
					loadScript('/static/js/layout.js');
				else if (url === '/game_choice/')
					loadScript('/static/js/game_choice.js');
				else if (url === '/dropdown_profile/')
					loadScript('/static/js/dropdown_profile.js');
				else if (url === '/menu_pong/')
					loadScript('/static/js/menu_pong.js');
				else if (url === '/dropdown_friends/')
					buildFriendsList();

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
