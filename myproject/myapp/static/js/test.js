// static/js/app.js
document.addEventListener('DOMContentLoaded', () => {
	const contentDiv = document.getElementById('content');

	const loadPage = (url, addHistory) => {
		fetch(url)
			.then(response => {
				if (response.ok) {
					return response.text();
				}
				throw new Error('Page not found');
			})
			.then(html => {
				if (url === '/' || url === '')
				{
					contentDiv.innerHTML = '';
					return ;
				}
				contentDiv.innerHTML = html;
				if (addHistory)
					history.pushState({ url: url }, '', url);
			})
			.catch(error => console.error('Error loading page:', error));
	};

	// Load initial content (home)
	loadPage(window.location.pathname, true);

	// Event listeners for navigation links
	document.querySelectorAll('.nav-link').forEach(link => {
		link.addEventListener('click', (event) => {
			event.preventDefault(); // Prevent default link behavior
			loadPage(link.dataset.url, true); // Load the page
		});
	});

	// Handle back/forward button
	window.addEventListener('popstate', (event) => {
		if (event.state) {
			loadPage(event.state.url, false);
		} else {
			// Load initial content if no state
			loadPage(window.location.pathname, false);
		}
	});
});
