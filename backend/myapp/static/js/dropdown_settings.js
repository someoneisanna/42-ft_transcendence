// RUN THE SCRIPT WHEN THE PAGE IS FULLY LOADED -------------------------------------------------------------------------------------------

function initializeJS() {

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
					window.location.href = '/';
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
				window.location.href = '/';
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

function updateMottoCharCount() {
	const mottoInput = document.getElementById('motto');
	const charCount = document.getElementById('motto-char-count');

	charCount.innerText = `${mottoInput.value.length} / 100`;
}

function updateMotto() {
	const mottoInput = document.getElementById('motto');
	const motto = mottoInput.value;

	if (motto.length > 100) {
		console.error('Motto cannot exceed 100 characters!');
		return;
	}

	// const motto_data = {
	// 	motto: motto
	// };

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
			window.location.href = '/';
		if (response.ok) {
			console.log('Motto updated successfully.');
		}
		else
			console.error('Failed to update motto:', response.statusText);
	});
}

function updatePassword(event) {
	console.log('Updating password...');
	event.preventDefault();

	const oldPassword = CryptoJS.SHA256(document.getElementById('old-password').value).toString();
	const newPassword = CryptoJS.SHA256(document.getElementById('new-password').value).toString();
	const confirmPassword = CryptoJS.SHA256(document.getElementById('new-password-confirmation').value).toString();

	if (oldPassword === '' || newPassword === '' || confirmPassword === '') {
		document.getElementById('changePasswordError').innerText = 'All fields are required!';
		return;
	}

	if (oldPassword === newPassword) {
		document.getElementById('changePasswordError').innerText = 'New password must be different from the old password!';
		return;
	}

	if (newPassword !== confirmPassword) {
		document.getElementById('changePasswordError').innerText = 'Passwords do not match!';
		return;
	}

	// Create the data object
	const password_data = {
		old_password: oldPassword,
		new_password: newPassword
	};

	// Send POST request to your API
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
			window.location.href = '/';
		} else if (!response.ok) {
			return response.json().then(err => {
				document.getElementById('changePasswordError').innerText = err.error;
				throw new Error(err.error);
			});
		}
		return response.json();
	})
	.then(data => {
		console.log('Password change was a success:', data.username);
		document.getElementById('changePasswordError').innerText = 'Password was changed successfully!';
	})
	.catch((error) => {
		console.error('Update password error:', error);
	});
}

function update2FAcheck(checkbox) {
	// Send POST request to your API
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
			window.location.href = '/';
		} else if (!response.ok) {
			return response.json().then(err => {
				// document.getElementById('2faError').innerText = err.error;
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
			document.getElementById('qrCodeSettingsText').innerText = 'Scan the QR code below to get the 2FA code:';
			document.getElementById('qrCodeSettingsContainer').innerHTML = `<img src="data:image/png;base64,${data.qr_code}" alt="QR Code for 2FA" style="width: 200px; height: 200px;">`;
		}
		// document.getElementById('2faError').innerText = '2FA was updated successfully!';
	})
	.catch((error) => {
		console.error('Update 2FA error:', error);
	});
}

function updateCommentsPolicy(event) {
	event.preventDefault();

	const commentsPolicy = document.querySelector('input[name="commentPolicy"]:checked').value;

	// Send POST request to your API
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
			window.location.href = '/';
		} else if (!response.ok) {
			return response.json().then(err => {
				// document.getElementById('commentsPolicyError').innerText = err.error;
				throw new Error(err.error);
			});
		}
		return response.json();
	})
	.then(data => {
		console.log('Comments policy update was a success:', data.message);
		// document.getElementById('commentsPolicyError').innerText = 'Comments policy was updated successfully!';
	})
	.catch((error) => {
		console.error('Update comments policy error:', error);
	});
}

function updateGameInvitationsPolicy(checkbox) {
	// Send POST request to your API
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
			window.location.href = '/';
		} else if (!response.ok) {
			return response.json().then(err => {
				// document.getElementById('gameInvitationsPolicyError').innerText = err.error;
				throw new Error(err.error);
			});
		}
		return response.json();
	})
	.then(data => {
		console.log('Game invitations policy update was a success:', data.message);
		// document.getElementById('gameInvitationsPolicyError').innerText = 'Game invitations policy was updated successfully!';
	})
	.catch((error) => {
		console.error('Update game invitation error:', error);
	});
}

function deleteAccount() {
	// Send POST request to your API
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
			window.location.href = '/';
		} else if (!response.ok) {
			return response.json().then(err => {
				// document.getElementById('deleteAccountError').innerText = err.error;
				throw new Error(err.error);
			});
		}
		return response.json();
	})
	.then(data => {
		console.log('Account deletion was a success:', data.message);
		// document.getElementById('deleteAccountError').innerText = 'Account was deleted successfully!';
	})
	.catch((error) => {
		console.error('Delete account error:', error);
	});
}
