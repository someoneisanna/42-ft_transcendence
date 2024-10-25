// RUN THE SCRIPT WHEN THE PAGE IS FULLY LOADED -------------------------------------------------------------------------------------------

function initializeJS() {

// HANDLE PROFILE PICTURE UPLOAD ---------------------------------------------------------------------------------------------------------- 

const profileForm = document.getElementById('profile-form');
if (profileForm) {
	profileForm.addEventListener('submit', async function(event) {
		event.preventDefault();
		
		const errorMessage = document.getElementById('uploadError');
		const fileInput = document.getElementById('profile-picture');

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
				body: formData,
			});
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
		})
		.then(response => {
			if (response.ok) {
				console.log('Profile picture removed.');
				document.getElementById('uploadError').innerHTML = '';
				document.getElementById('bigProfilePicture').src = '/media/profile_pics/default.jpg';
				changeSmallProfilePic('/media/profile_pics/default.jpg');
			}
			else
				console.error('Failed to remove profile picture:', response.statusText);
		});
	}
	catch (error) {
		console.error('Error removing profile picture:', error);
	}
}
