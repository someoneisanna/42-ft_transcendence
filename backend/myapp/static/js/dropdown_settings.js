// RUN THE SCRIPT WHEN THE PAGE IS FULLY LOADED -------------------------------------------------------------------------------------------

function initializeJS() {
	dropdown_settings(false);

	const profileForm = document.getElementById('changeProfilePictureForm');
	if (profileForm) {
		profileForm.addEventListener('submit', async function(event) {
			event.preventDefault();
			
			const errorMessage = document.getElementById('uploadError');
			const fileInput = document.getElementById('browseForProfilePicture');
	
			if (fileInput.files.length === 0) {
				console.error('No file selected.');
				return;
			}
	
			const file = fileInput.files[0];
			const allowedExtensions = ['image/png', 'image/jpeg', 'image/gif'];
			const maxSize = 5 * 1024 * 1024;
	
			if (!allowedExtensions.includes(file.type)) {
				console.error('Invalid file type. Only PNG, JPG, and GIF are allowed.');
				errorMessage.innerHTML = 'Invalid file type. Only PNG, JPG, and GIF are allowed.';
				return;
			}
	
			if (file.size > maxSize) {
				console.error('File size exceeds the 5MB limit.');
				errorMessage.innerHTML = 'File size exceeds the 5MB limit.';
				return;
			}
	
			const formData = new FormData();
			formData.append('profile_pic', file);
			try {
				const response = await fetch('/api/change_pic/', {
					method: 'POST',
					headers: {
						'X-csrftoken': csrftoken_var,
					},
					body: formData,
					credentials: 'same-origin',
				});
				if (response.status === 401 || response.status === 403)
					userCannotPost();
				if (response.ok) {
					const result = await response.json();
					console.log('Upload successful:', result);
					errorMessage.innerHTML = 'Upload successful.';
					document.getElementById('bigProfilePicture').src = result.path;
					changeSmallProfilePic(result.path);
				}
				else
					console.error('Upload failed:', response.statusText);
			} 
			catch (error) {
				console.error('Error uploading file:', error);
			}
		});
	}
}

// FUNCTION TO REMOVE THE PROFILE PICTURE -------------------------------------------------------------------------------------------------

function removeProfilePic() {
	try {
		fetch('/api/change_pic/', {
			method: 'DELETE',
			headers: {
				'X-csrftoken': csrftoken_var,
				'Content-Type': 'application/json',
			},
			credentials: 'same-origin',
		})
		.then(response => {
			if (response.status === 401 || response.status === 403)
				userCannotPost();
			if (response.ok) {
				console.log('Profile picture removed.');
				document.getElementById('uploadError').innerHTML = '';
				document.getElementById('bigProfilePicture').src = '/media/default.jpg';
				changeSmallProfilePic('/media/default.jpg');
			}
			else
			console.error('Failed to remove profile picture:', response.statusText);
		});
	}
	catch (error) {
		console.error('Error removing profile picture:', error);
	}
}

function applyErrorMessage(id, text) {
	errorMessage = document.getElementById(id);
	errorMessage.classList.remove('fade-out');
	getLanguage();
	errorMessage.innerText = getTranslation(text);
	void errorMessage.offsetWidth;
	errorMessage.classList.add('fade-out');
}

function updateMottoCharCount() {
	const mottoInput = document.getElementById('motto');
	const charCount = document.getElementById('motto-char-count');

	charCount.innerText = `${mottoInput.value.length} / 100`;
}

function updateMotto() {
	const mottoInput = document.getElementById('motto');
	const motto = mottoInput.value;

	if (motto.length > 100) {
		applyErrorMessage('updateMottoError', 'Motto cannot exceed 100 characters!');
		return;
	}

	fetch('/api/update_motto/', {
		method: 'POST',
		headers: {
			'X-csrftoken': csrftoken_var,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(motto),
		credentials: 'same-origin',
	})
	.then(response => {
		if (response.status === 401 || response.status === 403)
			userCannotPost();
		else if (!response.ok) {
			return response.json().then(err => {
				throw new Error(err.error);
			});
		}
		return response.json();
	})
	.then(data => {
		console.log('Motto update was a success:', data.message);
		applyErrorMessage('updateMottoError', data.message);
	})
	.catch((error) => {
		console.error('Failed to update motto:', response.statusText);
	});
}

function updateEmail(event) {
	event.preventDefault();

	const email = document.getElementById('new-email').value;
	const password = CryptoJS.SHA256(document.getElementById('current-password').value).toString();

	if (email === '' || password === '') {
		applyErrorMessage('updateEmailError', 'All fields are required!');
		return;
	}

	const email_data = {
		email: email,
		password: password
	};

	fetch('/api/update_email/', {
		method: 'POST',
		headers: {
			'X-csrftoken': csrftoken_var,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(email_data),
		credentials: 'same-origin',
	})
	.then(response => {
		if (response.status === 401 || response.status === 403)
			userCannotPost();
		else if (!response.ok) {
			return response.json().then(err => {
				applyErrorMessage('updateEmailError', err.error);
				throw new Error(err.error);
			});
		}
		return response.json();
	})
	.then(data => {
		console.log('Email update was a success:', data.message);
		applyErrorMessage('updateEmailError', data.message);
	})
	.catch((error) => {
		console.error('Failed to update email:', error);
	});
}

function updatePassword(event) {
	event.preventDefault();

	const oldPassword = CryptoJS.SHA256(document.getElementById('old-password').value).toString();
	const newPassword = CryptoJS.SHA256(document.getElementById('new-password').value).toString();
	const confirmPassword = CryptoJS.SHA256(document.getElementById('new-password-confirmation').value).toString();

	if (oldPassword === '' || newPassword === '' || confirmPassword === '') {
		applyErrorMessage('updatePasswordError', 'All fields are required!');
		return;
	}

	if (oldPassword === newPassword) {
		applyErrorMessage('updatePasswordError', 'New password must be different from the old password!');
		return;
	}

	if (newPassword !== confirmPassword) {
		applyErrorMessage('updatePasswordError', 'Passwords do not match!');
		return;
	}

	const password_data = {
		old_password: oldPassword,
		new_password: newPassword
	};

	fetch('/api/update_password/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': csrftoken_var,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(password_data),
		credentials: 'same-origin'
	})
	.then(response => {
		if (response.status === 401 || response.status === 403) {
			userCannotPost();
		} else if (!response.ok) {
			return response.json().then(err => {
				applyErrorMessage('updatePasswordError', err.error);
				throw new Error(err.error);
			});
		}
		return response.json();
	})
	.then(data => {
		console.log('Password change was a success:', data.username);
		applyErrorMessage('updatePasswordError', 'Password was changed successfully!');
	})
	.catch((error) => {
		console.error('Update password error:', error);
	});
}

function updateLanguage() {
	var selectedLanguage = document.getElementById('languageDropdown').value;
	fetch ('/api/update_default_language/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': csrftoken_var,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({language: selectedLanguage}),
		credentials: 'same-origin'
	})
	.then(response => {
		if (response.status === 401 || response.status === 403) {
			userCannotPost();
		} else if (!response.ok) {
			return response.json().then(err => {
				throw new Error(err.error);
			});
		}
		return response.json();
	})
	.then(data => {
		console.log('Language update was a success:', data.message);
		changeLanguage(selectedLanguage);
		getLanguage();
		applyErrorMessage('changeLanguageError', 'Language was updated successfully!');
	})
	.catch((error) => {
		console.error('Update language error:', error);
		applyErrorMessage('changeLanguageError', 'Invalid language selected!');
	});
}

function update2FAcheck(checkbox) {
	fetch('/api/update2FAcheck/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': csrftoken_var,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(checkbox.checked),
		credentials: 'same-origin'
	})
	.then(response => {
		if (response.status === 401 || response.status === 403) {
			userCannotPost();
		} else if (!response.ok) {
			return response.json().then(err => {
				throw new Error(err.error);
			});
		}
		return response.json();
	})
	.then(data => {
		console.log('2FA update was a success:', data.message);
		if (checkbox.checked === false) {
			document.getElementById('qrCodeSettingsText').innerText = '';
			document.getElementById('qrCodeSettingsContainer').innerHTML = '';
		}
		else {
			getLanguage();
			translateElement("qrCodeSettingsText");
			document.getElementById('qrCodeSettingsContainer').innerHTML = `<img src="data:image/png;base64,${data.qr_code}" alt="QR Code for 2FA" style="width: 200px; height: 200px;">`;
		}
	})
	.catch((error) => {
		console.error('Update 2FA error:', error);
	});
}

function updateCommentsPolicy(event) {
	event.preventDefault();

	const commentsPolicy = document.querySelector('input[name="commentPolicy"]:checked').value;

	fetch('/api/update_comments_policy/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': csrftoken_var,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(commentsPolicy),
		credentials: 'same-origin'
	})
	.then(response => {
		if (response.status === 401 || response.status === 403) {
			userCannotPost();
		} else if (!response.ok) {
			return response.json().then(err => {
				throw new Error(err.error);
			});
		}
		return response.json();
	})
	.then(data => {
		console.log('Comments policy update was a success:', data.message);
		getLanguage();
		applyErrorMessage('updateCommentsPolicyError', 'Comments policy was updated successfully!');
	})
	.catch((error) => {
		console.error('Update comments policy error:', error);
	});
}

function updateGameInvitationsPolicy(checkbox) {
	fetch('/api/update_game_invitations_policy/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': csrftoken_var,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(checkbox.checked),
		credentials: 'same-origin'
	})
	.then(response => {
		if (response.status === 401 || response.status === 403) {
			userCannotPost();
		} else if (!response.ok) {
			return response.json().then(err => {
				throw new Error(err.error);
			});
		}
		return response.json();
	})
	.then(data => {
		console.log('Game invitations policy update was a success:', data.message);
	})
	.catch((error) => {
		console.error('Update game invitation error:', error);
	});
}

function notifyFriendsofAccountDeletion(step) {
	chatSocket.send(JSON.stringify({
		'type': 'account_deletion',
		'room_name': '',
		'username': current_user,
		'step': step
	}));
}

function deleteAccount() {
	getLanguage();
	if (confirm(getTranslation("Are you sure you want to delete your account?")) == false)
		return;
	notifyFriendsofAccountDeletion(1);
	fetch('/api/delete_user/', {
		method: 'DELETE',
		headers: {
			'X-CSRFToken': csrftoken_var,
			'Content-Type': 'application/json'
		},
		credentials: 'same-origin'
	})
	.then(response => {
		if (response.status === 401 || response.status === 403) {
			userCannotPost();
		} else if (!response.ok) {
			return response.json().then(err => {
				throw new Error(err.error);
			});
		}
		return response.json();
	})
	.then(data => {
		console.log('Account deletion was a success:', data.message);
		notifyFriendsofAccountDeletion(2);
		sentInvitationToPongMatch = "";
		receivedInvitationsToPongMatch = [];
		document.getElementById('inviteToMatchButton').classList.remove('hide');
		document.getElementById('cancelInviteToMatchButton').classList.add('hide');
		acceptedPongMatchInvitation = "";
		chatBuilt = false;
		loadPage('/landing/', true, true);
		if (chatSocket && chatSocket.readyState === WebSocket.OPEN)
			chatSocket.close();
	})
	.catch((error) => {
		console.error('Delete account error:', error);
	});
}

function resetStats() {
	if (confirm('Are you sure you want to reset your stats?') == false)
		return;
	fetch('/api/reset_stats/', {
		method: 'POST',
		headers: {
			'X-CSRFToken': csrftoken_var,
			'Content-Type': 'application/json'
		},
		credentials: 'same-origin'
	})
	.then(response => {
		if (response.status === 401 || response.status === 403) {
			userCannotPost();
		} else if (!response.ok) {
			return response.json().then(err => {
				throw new Error(err.error);
			});
		}
		return response.json();
	})
	.then(data => {
		console.log('Stats reset was a success:', data.message);
	})
	.catch((error) => {
		console.error('Reset stats error:', error);
	});
}
