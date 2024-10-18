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

	window.loadPage = (url, addHistory) => {
		fetch(url)
			.then(response => {
				if (response.ok) {
					return response.text();
				}
				throw new Error('Page not found');
			})
			.then(html => {
				if (url === '/layout/') {
					layoutDiv.innerHTML = html;
					loadPage('/game_choice/', true);
				}
				else
					contentDiv.innerHTML = html;

				if (url === '/landing/')
					loadScript('/static/js/landing_page.js');
				else if (url === '/layout/')
					loadScript('/static/js/layout.js');
				else if (url === '/game_choice/')
					loadScript('/static/js/game_choice.js');

				if (addHistory) {
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
		loadPage('/landing/', true);
	} else {
		loadPage(window.location.pathname, true);
	}
	
	// Handle back/forward button
	window.addEventListener('popstate', (event) => {
		if (event.state && event.state.url) {
			loadPage(event.state.url, false);
		}
	});
});
