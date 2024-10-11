// static/lazyload.js

function loadPage(page) {
    // Fetch the content from the corresponding page
    fetch(`/${page}/`) // Assuming your URLs follow this pattern
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            // Replace the content of the block with the new content
            document.getElementById('content').innerHTML = data;

            // Update the browser's history state
            window.history.pushState({ page }, '', `/${page}/`);
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

// Handle back/forward browser navigation
window.onpopstate = function(event) {
    if (event.state) {
        loadPage(event.state.page);
    }
};
