// RUN THE SCRIPT WHEN THE PAGE IS FULLY LOADED -------------------------------------------------------------------------------------------

function initializeJS() {

// HANDLE PROFILE PICTURE UPLOAD ---------------------------------------------------------------------------------------------------------- 

const profileForm = document.getElementById('profile-form');
if (profileForm)
{

profileForm.addEventListener('submit', async function(event) {
event.preventDefault();

const formData = new FormData();
const fileInput = document.getElementById('profile-picture');

if (fileInput.files.length > 0) {
	formData.append('profile_pic', fileInput.files[0]);
}

try {
	const response = await fetch('/upload_pic/', {
		method: 'POST',
		body: formData,
	});

	if (response.ok) {
		const result = await response.json();
		console.log('Upload successful:', result);
	} else {
		console.error('Upload failed:', response.statusText);
	}
} catch (error) {
	console.error('Error uploading file:', error);
}
});

};

}
