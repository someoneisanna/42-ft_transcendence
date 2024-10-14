document.addEventListener('DOMContentLoaded', () => {
	const contentDiv = document.getElementById('content');

	window.loadPage = (url, addHistory) => {
		fetch(url)
			.then(response => {
				if (response.ok) {
					return response.text();
				}
				throw new Error('Page not found');
			})
			.then(html => {
				contentDiv.innerHTML = html;
				if (addHistory) {
					history.pushState({ url: url }, '', url);
				}
			})
			.catch(error => {
				console.error('Error loading page:', error);
				contentDiv.innerHTML = '<p>Page could not be loaded.</p>';
			});
	};

	function loadScript(url) {
		const script = document.createElement('script');
		script.src = url;
		script.onload = () => {
			initializeJS(); // Call any functions that need to run after the script is loaded
		};
		document.body.appendChild(script);
	}

	const loadLandingPage = () => {
		fetch('/landing/')
			.then(response => {
				if (response.ok) {
					return response.text();
				}
				throw new Error('Failed to load the landing page.');
			})
			.then(html => {
				contentDiv.innerHTML = html;
				loadScript('/static/js/landing_page.js');
			})
			.catch(error => {
				console.error('Error loading landing page:', error);
				contentDiv.innerHTML = '<p>Failed to load the landing page content.</p>';
			});
	};

	// Automatically load the landing page when the site is visited at root
	if (window.location.pathname === '/' || window.location.pathname === '') {
		loadLandingPage();
	} else {
		loadPage(window.location.pathname, false);
	}

	// Event listeners for navigation links
	document.querySelectorAll('.nav-link').forEach(link => {
		link.addEventListener('click', (event) => {
			event.preventDefault(); // Prevent default link behavior
			const url = link.dataset.url;
			loadPage(url, true); // Load the page when a navigation link is clicked
		});
	});

	// Handle back/forward button
	window.addEventListener('popstate', (event) => {
		if (event.state && event.state.url) {
			loadPage(event.state.url, false); // Load the page for the URL in history state
		}
	});
});
