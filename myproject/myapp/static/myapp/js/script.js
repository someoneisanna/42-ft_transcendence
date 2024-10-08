// PAGE ANIMATION -------------------------------------------------------------------------------------------------------------------------

// JavaScript code for handling the login button click event
document.getElementById('myButton').addEventListener('click', function() {
	const titleContainer = document.getElementById('title-container');
	titleContainer.classList.toggle('shrink');
	const imgContainer = document.querySelector('.backgroundGIF-container');
	imgContainer.classList.toggle('blur');
});

// LOGIN FUNCTION -------------------------------------------------------------------------------------------------------------------------

document.getElementById('loginForm').addEventListener('submit', function(event) {
	
	// Prevent the default form submission (page refresh)
	event.preventDefault();

	// Get the values from the input fields
	const username_input = document.getElementById('inputLoginUsername').value;
	const password_input = CryptoJS.SHA256(document.getElementById('inputLoginPassword').value).toString();

	// Create the data object
	const user_data = {
		username: username_input,
		password: password_input
	};

	// Send GET request to your API
	fetch('http://127.0.0.1:8000/login/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(user_data)
	})
	.then(response => {
		if (!response.ok) {
			return response.json().then(err => {
				document.getElementById('loginError').innerText = err.error;
				throw new Error(err.error);
			});
		}
		return response.json();
	})
	.then(data => {
		console.log('Login Success:', data);
		alert('Login successful!');
	})
	.catch((error) => {
		console.error('Login Error:', error);
	});
});

// REGISTER FUNCTION ----------------------------------------------------------------------------------------------------------------------

document.getElementById('registerForm').addEventListener('submit', function(event) {
	
	// Prevent the default form submission (page refresh)
	event.preventDefault();

	// Get the values from the input fields
	const username_input = document.getElementById('inputRegisterUsername').value;
	const password_input = CryptoJS.SHA256(document.getElementById('inputRegisterPassword').value).toString();
	const confirmPassword_input = CryptoJS.SHA256(document.getElementById('inputRegisterConfirmPassword').value).toString();

	// Validate passwords match
	if (password_input !== confirmPassword_input) {
		document.getElementById('registerError').innerText = 'Passwords do not match!';
		return;
	}

	// Create the data object
	const user_data = {
		username: username_input,
		password: password_input
	};

	// Send POST request to your API
	fetch('http://127.0.0.1:8000/register/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(user_data)
	})
	.then(response => {
		if (!response.ok) {
			return response.json().then(err => {
				document.getElementById('registerError').innerText = err.error;
				throw new Error(err.error);
			});
		}
		return response.json();
	})
	.then(data => {
		console.log('Registration Success:', data);
		alert('Registration successful!');
	})
	.catch((error) => {
		console.error('Registration Error:', error);
	});
});

