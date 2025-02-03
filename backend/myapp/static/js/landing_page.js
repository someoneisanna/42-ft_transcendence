// SIGN OUT FUNCTION -----------------------------------------------------------------------------------------------------------------------

function signOut(already_logged_in = false) {
	if (already_logged_in === false) {
		getLanguage();
		if (confirm(getTranslation("quitMessage")) == false)
			return;
	}
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
			userCannotPost();
		else if (!response.ok)
			throw new Error("Failed to post content.");
		return response.json();
	})
	.then(data => {
		console.log('Logout Success:', data);
		chatBuilt = false;
		loadPage('/landing/', true, true);
		if (chatSocket && chatSocket.readyState === WebSocket.OPEN)
			chatSocket.close();
		if (pongSocket && pongSocket.readyState === WebSocket.OPEN)
			pongSocket.close();	
	})
	.catch((error) => {
		console.error('Logout failed:', error);
	});
}

function openLoginModal() {
	document.getElementById('title-container').classList.add('shrink');
	document.querySelector('.backgroundGIF-container').classList.add('blur');
	document.getElementById('openLoginMessage').classList.add('hide');
}

// RUN THE SCRIPT WHEN THE PAGE IS FULLY LOADED -------------------------------------------------------------------------------------------

function initializeJS() {
	getLanguage();
	landing(false);

	// IF USER IS ALREADY LOGGED IN -------------------------------------------------------------------------------------------------------

	function userLoggedIn() {
		const loginModal = document.getElementById('loginModal');
		if (loginModal)
			bootstrap.Modal.getInstance(loginModal).hide();
		loadScript('/static/js/ws.js');
	}

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
			userLoggedIn();
		});
		if (!current_user)
			fetch('/api/get_current_user/')
			.then(response => {
				if (response.status === 401)
					closeWebSockets();
				if (!response.ok)
					throw new Error('Friend list request failed:', response.statusText);
				return response.json();
			})
			.then(data => {
				current_user = data.username;
			})
			.catch(error => {
				console.error('Error during search:', error);
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
		console.info('Logging in:', user_data);
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
				userCannotPost();
			} else if (!response.ok && response.status !== 422) {
				return response.json().then(err => {
					getLanguage();
					document.getElementById('loginError').innerText = getTranslation(err.error);
					throw new Error(err.error);
				});
			}
			return response.json();
		})
		.then(data => {
			document.getElementById('loginError').innerText = '';
			if (data.message === '2FA required') {
				document.getElementById('totpContainer').classList.remove('hide');
				document.querySelector('.forgotPasswordLink').classList.add('hide');
			}
			else {
				console.log('Login Success:', data);
				current_user = data.username;
				changeLanguage(data.language);
				userLoggedIn();
			}
		})
		.catch((error) => {
			console.error('Login Error:', error);
		});
	});
	}

	// REGISTER FUNCTION ----------------------------------------------------------------------------------------------------------------------

	let isRegistered = false;

	const registerForm = document.getElementById('registerForm');
	if (registerForm) {
		registerForm.addEventListener('submit', function(event) {
			
			// Prevent the default form submission (page refresh)
			event.preventDefault();

			// Check if the button is the "continue" after 2FA setup
			if (isRegistered) {
				userLoggedIn();
				return;
			}

			// Get the values from the input fields
			const username_input = document.getElementById('inputRegisterUsername').value;
			const email_input = document.getElementById('inputRegisterEmail').value;
			const password_input = CryptoJS.SHA256(document.getElementById('inputRegisterPassword').value).toString();
			const confirmPassword_input = CryptoJS.SHA256(document.getElementById('inputRegisterConfirmPassword').value).toString();
			const checkbox_input = document.getElementById('inputRegisterCheckbox').checked;
			
			// Validate USERNAME
			if (username_input.length > 20) {
				document.getElementById('registerError').innerText = 'Username must be 20 characters or less!';
				return;
			}
			// Validate username has only alphanumeric characters
			if (!username_input.match(/^[0-9a-zA-Z_]+$/)) {
				document.getElementById('registerError').innerText = 'Username must contain only alphanumeric characters!';
				return;
			}
			// Validate username is not a reserved word
			const reservedWords = ['guest', 'ai'];
			if (reservedWords.includes(username_input.toLowerCase())) {
				document.getElementById('registerError').innerText = "Username cannot be a reserved word.";
				return false;
			}
			// Validate username has no spaces
			if (username_input.includes(' ')) {
				document.getElementById('registerError').innerText = 'Username cannot contain spaces!';
				return
			}

			// Validate PASSWORD
			if (password_input.length < 1) {
				document.getElementById('registerError').innerText = 'Password must be at least 1 character!';
				return;
			}

			// Validate passwords match
			if (password_input !== confirmPassword_input) {
				getLanguage();
				document.getElementById('registerError').innerText = getTranslation('tlPasswordsDoNotMatch');
				return;
			}

			// Create the data object
			const user_data = {
				username: username_input,
				email: email_input,
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
					userCannotPost();
				} else if (!response.ok) {
					return response.json().then(err => {
						getLanguage();
						document.getElementById('registerError').innerText = getTranslation(err.error);
						throw new Error(err.error);
					});
				}
				return response.json();
			})
			.then(data => {
				console.log('Registration Success:', data.username);
				current_user = data.username;
				document.getElementById('registerError').innerText = '';
				if (checkbox_input === true) {
					alert('Registration successful! Please scan the QR code for 2FA setup.');
					document.getElementById('registerButton').innerText = 'Continue';
					document.getElementById('checkboxContainer').classList.toggle('hide');
					document.getElementById('qrCodeText').innerText = 'Scan the QR code below to get the 2FA code:';
					let qrCodeId = document.getElementById('qrCodeContainer');
					qrCodeId.innerHTML = `<img src="data:image/png;base64,${data.qr_code}" alt="QR Code for 2FA" style="width: 200px; height: 200px;">`;
					qrCodeId.classList.toggle('mt-2');
					isRegistered = true;
				}
				else
					userLoggedIn();
			})
			.catch((error) => {
				console.error('Registration Error:', error);
			});
		});
	}

	let email;

	const forgotPasswordForm = document.getElementById("forgotPasswordForm");
	if (forgotPasswordForm) {
		forgotPasswordForm.addEventListener("submit", function(event) {
			event.preventDefault();
			email = document.getElementById("inputForgotPasswordEmail").value.toLowerCase();
			const submitButton = document.querySelector("#sendEmailButton");
			getLanguage();
			translateElement("sendEmailButton");
			submitButton.disabled = true;
			submitButton.innerText = getTranslation("Sending...");
			sendResetPasswordEmail(email);
		});
	}

	const forgotPasswordCodeForm = document.getElementById("forgotPasswordCodeForm");
	if (forgotPasswordCodeForm) {
		forgotPasswordCodeForm.addEventListener("submit", function(event) {
			event.preventDefault();
			let codeInputs = document.querySelectorAll('.code-input');
			let code = "";
			codeInputs.forEach(input => {
				code += input.value;
			});
			let password = CryptoJS.SHA256(document.getElementById('inputForgotPasswordPassword').value).toString();
			let confirmPassword = CryptoJS.SHA256(document.getElementById('inputForgotPasswordConfirmPassword').value).toString();
			if (password !== confirmPassword) {
				getLanguage();
				document.getElementById('forgotPasswordCodeError').innerText = getTranslation('tlPasswordsDoNotMatch');
				return;
			}
			verifyResetPasswordCode(code, email, password);
		});
	}
}

function verifyResetPasswordCode(code, email, password) {
	fetch('/api/verify_password_code/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': csrftoken_var,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({email: email, code: code, password: password}),
		credentials: 'same-origin'
	})
	.then(response => {
		if (response.status === 401 || response.status === 403)
			userCannotPost();
		else if (!response.ok) {
			return response.json().then(err => {
				getLanguage();
				document.getElementById('forgotPasswordCodeError').innerText = getTranslation(err.error);
				throw new Error(err.error);
			});
		}
		return response.json();
	})
	.then(data => {
		console.log('Reset Password Success:', data);
		document.getElementById('forgotPasswordCodeError').innerText = '';
		document.querySelector(".forgotPasswordEmailInput").classList.remove('hide');
		document.getElementById('inputForgotPasswordEmail').value = '';
		document.querySelector(".forgotPasswordCodeInput").classList.add('hide');
		document.querySelectorAll('.code-input').forEach(input => {
			input.value = '';
		});
		document.getElementById('inputForgotPasswordPassword').value = '';
		document.getElementById('inputForgotPasswordConfirmPassword').value = '';
		const submitButton = document.querySelector("#sendEmailButton");
		submitButton.disabled = false;
		submitButton.innerText = "Send Email";
		bootstrap.Modal.getInstance(forgotPasswordModal).hide();
		bootstrap.Modal.getInstance(loginModal).show();
	})
	.catch((error) => {
		console.error('Reset Password failed:' + error);
	});
}

function sendResetPasswordEmail(email) {
	console.log('Sending email to:', email);
	fetch('/api/send_email/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': csrftoken_var,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({email: email}),
		credentials: 'same-origin'
	})
	.then(response => {
		if (response.status === 401 || response.status === 403)
			userCannotPost();
		else if (!response.ok) {
			return response.json().then(err => {
				document.getElementById('forgotPasswordEmailError').innerText = err.error;
				const submitButton = document.querySelector("#sendEmailButton");
				submitButton.disabled = false;
				submitButton.innerText = "Send Email";
				throw new Error(err.error);
			});
		}
		return response.json();
	})
	.then(data => {
		console.log('Forgot Password Success:', data);
		document.getElementById('forgotPasswordEmailError').innerText = '';
		document.querySelector(".forgotPasswordEmailInput").classList.add('hide');
		getLanguage();
		translateElement('forgotPasswordCodeHeader1');
		document.getElementById('forgotPasswordCodeHeader2').innerText = data.email;
		translateElement('forgotPasswordCodeHeader3');
		document.querySelector(".forgotPasswordCodeInput").classList.remove('hide');
	})
	.catch((error) => {
		console.error('Forgot Password failed');
	});
}

function goBackToLanding() {
	bootstrap.Modal.getInstance(forgotPasswordModal).hide();
	bootstrap.Modal.getInstance(loginModal).show();
}

function goBackToEmailInput() {
	document.querySelector(".forgotPasswordCodeInput").classList.add('hide');
	document.querySelector(".forgotPasswordEmailInput").classList.remove('hide');
	const submitButton = document.querySelector("#sendEmailButton");
	submitButton.disabled = false;
	submitButton.innerText = "Send Email";
}
