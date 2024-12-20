// SIGN OUT FUNCTION -----------------------------------------------------------------------------------------------------------------------

function signOut() {
	if (confirm("Are you sure you want to quit?") == false)
		return;
	fetch('/api/logout/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': csrftoken_var,
			'Content-Type': 'application/json'
		},
		credentials: 'same-origin'
	})
	.then(response => {
		if (response.status === 401 || response.status === 403)
			window.location.href = '/';
		else if (!response.ok)
			throw new Error("Failed to post content.");
		return response.json();
	})
	.then(data => {
		console.log('Logout Success:', data);
		loadPage('/landing/', true, true);
	})
	.catch((error) => {
		console.error('Logout failed:', error);
	});
}

// RUN THE SCRIPT WHEN THE PAGE IS FULLY LOADED -------------------------------------------------------------------------------------------

function initializeJS() {

// IF USER IS ALREADY LOGGED IN -----------------------------------------------------------------------------------------------------------

// If the user is already logged in, and chooses to sign out
const confirmSignOut = document.getElementById('confirmSignOut');
if (confirmSignOut) {
	confirmSignOut.addEventListener('click', function() {
		signOut();
	});
}

// If the user is already logged in, and chooses to continue as this user
const confirmYes = document.getElementById('confirmYes');
if (confirmYes) {
	confirmYes.addEventListener('click', function() {
		loadPage('/layout/', true);
	});
}

// PAGE ANIMATION -------------------------------------------------------------------------------------------------------------------------

// Handling the login button click - landing page animation 
const loginButton = document.getElementById('loginButton');
if (loginButton) {
	loginButton.addEventListener('click', function() {
		document.getElementById('title-container').classList.toggle('shrink');
		loginButton.classList.toggle('hide');
		document.querySelector('.backgroundGIF-container').classList.toggle('blur');
	});
}

// 2FA CODE INPUT -------------------------------------------------------------------------------------------------------------------------

// Effects for the 2FA code input in the login form
const codeInputs = document.querySelectorAll('.code-input');

codeInputs.forEach((input, index) => {
	input.addEventListener('input', () => {
		if (input.value.length === 1 && index < codeInputs.length - 1) {
			codeInputs[index + 1].focus();
		}
	});

	input.addEventListener('keydown', (event) => {
		if (event.key === 'Backspace' && index > 0 && !input.value) {
			codeInputs[index - 1].focus();
		}
		else if (event.key !== 'Backspace' && event.key.length === 1) {
			event.preventDefault();
			input.value = event.key;
			if (index < codeInputs.length - 1) {
				codeInputs[index + 1].focus();
			}
		}
	});
});

// LOGIN FUNCTION -------------------------------------------------------------------------------------------------------------------------

const loginForm = document.getElementById('loginForm');
if (loginForm) {

loginForm.addEventListener('submit', function(event) {
	
	// Prevent the default form submission (page refresh)
	event.preventDefault();

	// Get the values from the input fields
	const username_input = document.getElementById('inputLoginUsername').value;
	const password_input = CryptoJS.SHA256(document.getElementById('inputLoginPassword').value).toString();
	const codeInputs = document.querySelectorAll('.code-input');
	let totp_2FA_input = "";
	codeInputs.forEach(input => {
		totp_2FA_input += input.value;
	});

	// Create the data object
	const user_data = {
		username: username_input,
		password: password_input,
		totp_2FA: totp_2FA_input
	};

	// Send POST request to your API
	fetch('/api/login/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': csrftoken_var,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(user_data),
		credentials: 'same-origin'
	})
	.then(response => {
		if (response.status === 401 || response.status === 403) {
			window.location.href = '/';
		} else if (!response.ok && response.status !== 422) {
			return response.json().then(err => {
				document.getElementById('loginError').innerText = err.error;
				throw new Error(err.error);
			});
		}
		return response.json();
	})
	.then(data => {
		document.getElementById('loginError').innerText = '';
		if (data.message === '2FA required') {
			document.getElementById('totpContainer').classList.remove('hide');
		}
		else {
			console.log('Login Success:', data);
			document.getElementsByClassName("modal-backdrop")[0].remove();
			loadPage('/layout/', true);
		}
	})
	.catch((error) => {
		console.error('Login Error:', error);
	});
});
}

// REGISTER FUNCTION ----------------------------------------------------------------------------------------------------------------------

let isRegistered = false;

function continueToLayout() {
	document.getElementsByClassName("modal-backdrop")[0].remove();
	loadPage('/layout/', true);
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {

registerForm.addEventListener('submit', function(event) {
	
	// Prevent the default form submission (page refresh)
	event.preventDefault();

	// Check if the button is the "continue" after 2FA setup
	if (isRegistered) {
		continueToLayout();
		return;
	}

	// Get the values from the input fields
	const username_input = document.getElementById('inputRegisterUsername').value;
	const password_input = CryptoJS.SHA256(document.getElementById('inputRegisterPassword').value).toString();
	const confirmPassword_input = CryptoJS.SHA256(document.getElementById('inputRegisterConfirmPassword').value).toString();
	const checkbox_input = document.getElementById('inputRegisterCheckbox').checked;
	
	// Validate username length (max 20 characters)
	if (username_input.length > 20) {
		document.getElementById('registerError').innerText = 'Username must be 20 characters or less!';
		return;
	}

	// Validate passwords match
	if (password_input !== confirmPassword_input) {
		document.getElementById('registerError').innerText = 'Passwords do not match!';
		return;
	}

	// Create the data object
	const user_data = {
		username: username_input,
		password: password_input,
		checkbox: checkbox_input
	};

	// Send POST request to your API
	fetch('/api/register/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': csrftoken_var,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(user_data),
		credentials: 'same-origin'
	})
	.then(response => {
		if (response.status === 401 || response.status === 403) {
			window.location.href = '/';
		} else if (!response.ok) {
			return response.json().then(err => {
				document.getElementById('registerError').innerText = err.error;
				throw new Error(err.error);
			});
		}
		return response.json();
	})
	.then(data => {
		console.log('Registration Success:', data.username);
		document.getElementById('registerError').innerText = '';
		if (checkbox_input === true) {
			alert('Registration successful! Please scan the QR code for 2FA setup.');
			document.getElementById('registerButton').innerText = 'Continue';
			document.getElementById('checkboxContainer').classList.toggle('hide');
			document.getElementById('qrCodeText').innerText = 'Scan the QR code below to get the 2FA code:';
			qrCodeId = document.getElementById('qrCodeContainer');
			qrCodeId.innerHTML = `<img src="data:image/png;base64,${data.qr_code}" alt="QR Code for 2FA" style="width: 200px; height: 200px;">`;
			qrCodeId.classList.toggle('mt-2');
			isRegistered = true;
		}
		else
			continueToLayout();
	})
	.catch((error) => {
		console.error('Registration Error:', error);
	});
});
}

}
