// Fetch tasks from the API
fetch('http://localhost:8000/api/tasks/')
.then(response => response.json())
.then(data => console.log(data));

// Send a new task to the API
fetch('http://localhost:8000/api/tasks/', {
method: 'POST',
headers: {
	'Content-Type': 'application/json',
},
body: JSON.stringify({
	title: 'New Task',
	completed: false,
}),
})
.then(response => response.json())
.then(data => console.log(data));
