function handleLiveSearch() {
	document.getElementById('friendsSearchResults').innerHTML = '';
	const searchQuery = document.getElementById('searchInput').value.trim();
	if (searchQuery === '')
		return;
	performSearch(searchQuery);
	// Clear the debounce timeout to avoid multiple requests
	// clearResults();  // Clear results if search is empty
}

// Function to actually perform the search (e.g., making an API call)
function performSearch(query) {
	console.log('Searching for:', query);
	fetch(`http://127.0.0.1:8000/search_friends/?q=${query}`)
		.then(response => {
			console.log('Response:', response);
			if (!response.ok)
				throw new Error('Search failed:', response.statusText);
			return response.json();
		})
		.then(data => {
			console.log('Search results:', data);
			data.forEach(item => {
				console.log('User:', item);
				var newElement = `<li class="userResult">
					<img src="${item.profile_pic}" width="50" height="50" class="rounded-circle" onerror="this.onerror=null; this.src='/media/profile_pics/default.jpg';">
					<p>${item.username}</p>
					</li>`;
				document.getElementById('friendsSearchResults').innerHTML += newElement;
			});
		})
		.catch(error => {
			console.error('Error during search:', error);
		});

	// fetch('http://127.0.0.1:8000/search_friends/', {
	// 	method: 'GET',
	// 	headers: {
	// 		'Content-Type': 'application/json'
	// 	},
	// 	body: JSON.stringify({ query: query })
	// })
	// .then(response => {
	// 	if (!response.ok)
	// 		throw new Error('Search failed:', response.statusText);
	// })
	// .then(data => {
	// 	console.log('Search results:', data);
	// })
	// .catch(error => {
	// 	console.error('Error searching:', error);
	// });
}

// Function to display results in the searchResults div
// function displayResults(data) {
// 	const resultsDiv = document.getElementById('searchResults');
// 	resultsDiv.innerHTML = '';  // Clear previous results

// 	// Iterate over the search results and display them
// 	data.results.forEach(item => {
// 		const resultItem = document.createElement('div');
// 		resultItem.textContent = item.name;  // Example: show the result name
// 		resultsDiv.appendChild(resultItem);
// 	});
// }

// // Optional: Clear search results when the input is empty
// function clearResults() {
//     const resultsDiv = document.getElementById('searchResults');
//     resultsDiv.innerHTML = '';  // Clear results
// }
