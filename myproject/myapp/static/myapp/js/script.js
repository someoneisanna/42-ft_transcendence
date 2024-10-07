// document.addEventListener('DOMContentLoaded', function() {
//     // Add the 'active' class to the .backgroundVideo-container after 2 seconds (example)
//     setTimeout(function() {
//         // Select the element(s) you want to make visible
//         const videoContainer = document.querySelector('.backgroundVideo-container');
        
//         // Add the active class to show the video container
//         videoContainer.classList.add('active');
        
//         // If you want to show any other element, just add active class to that as well
//         // For example:
//         // const otherContent = document.querySelector('.other-content');
//         // otherContent.classList.add('active');
//     }, 2000); // Adjust timing or event trigger as needed

// });


// JavaScript code for handling the button click event
document.getElementById('myButton').addEventListener('click', function() {
    const titleContainer = document.getElementById('title-container');
    titleContainer.classList.toggle('shrink');
    const videoContainer = document.querySelector('.backgroundVideo-container');
    videoContainer.classList.toggle('blur');
    // const button = document.getElementById('myButton');
    // button.classList.toggle('hide');
});

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the values from the input fields
    const username_input = document.getElementById('inputRegisterUsername').value;
    const password_input = document.getElementById('inputRegisterPassword').value;
    const confirmPassword_input = document.getElementById('inputRegisterConfirmPassword').value;

    // Validate passwords match
    if (password_input !== confirmPassword_input) {
        alert('Passwords do not match!');
        return;
    }

    // Create the data object
    const data = {
        username: username_input,
        password: password_input
    };

    // Send POST request to your API
    fetch('http://127.0.0.1:8000/users/', {  // Replace with your actual API URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)  // Convert data object to JSON
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        // You can display a success message or redirect the user here
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Registration failed!');
    });
});

