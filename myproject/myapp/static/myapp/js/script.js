// PAGE ANIMATION -------------------------------------------------------------------------------------------------------------------------

// JavaScript code for handling the login button click event
document.getElementById('loginButton').addEventListener('click', function() {
	document.getElementById('title-container').classList.toggle('shrink');
	document.getElementById('loginButton').classList.toggle('hide');
	document.querySelector('.backgroundGIF-container').classList.toggle('blur');
});

// 2FA CODE INPUT -------------------------------------------------------------------------------------------------------------------------
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
	});
});

// LOGIN FUNCTION -------------------------------------------------------------------------------------------------------------------------

document.getElementById('loginForm').addEventListener('submit', function(event) {
	
	// Prevent the default form submission (page refresh)
	event.preventDefault();

	// Get the values from the input fields
	const username_input = document.getElementById('inputLoginUsername').value;
	const password_input = CryptoJS.SHA256(document.getElementById('inputLoginPassword').value).toString();
	const codeInputs = document.querySelectorAll('.code-input');
	let totp_2FA_input = '';
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
		alert('Registration successful! Please scan the QR code for 2FA setup.');
		document.getElementById('qrCodeText').innerText = 'Scan the QR code below to get the 2FA code:';
		qrCodeId = document.getElementById('qrCodeContainer');
		qrCodeId.innerHTML = `<img src="data:image/png;base64,${data.qr_code}" alt="QR Code for 2FA" style="width: 200px; height: 200px;">`;
		qrCodeId.classList.toggle('mt-2');
	})
	.catch((error) => {
		console.error('Registration Error:', error);
	});
});
