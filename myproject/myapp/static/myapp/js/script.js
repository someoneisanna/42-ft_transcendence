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
    // const videoContainer = document.querySelector('.backgroundVideo-container');
    // videoContainer.classList.toggle('blur');
    // const button = document.getElementById('myButton');
    // button.classList.toggle('hide');
});

function simpleHash(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = (hash << 5) - hash + input.charCodeAt(i); // hash * 31 + charCode
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
}

document.getElementById('loginForm').addEventListener('submit', function(event) {   
    event.preventDefault(); // Prevent the default form submission

    // Get the values from the input fields
    const username_input = document.getElementById('inputLoginUsername').value;
    const password_input = CryptoJS.SHA256(document.getElementById('inputLoginPassword').value).toString();

    // Create the data object
    const user_data = {
        username: username_input,
        password: password_input
    };

    // Send GET request to your API
    fetch('http://127.0.0.1:8000/users/', {  // Replace with your actual API URL
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user_data)  // Convert data object to JSON
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {  // Parse the error message
                document.getElementById('loginError').innerText = err.error;  // Display the error message
                throw new Error(err.error);  // Throw an error with the message from the server
            });
        }
        return response.json();  // Parse the success response
    })
    .then(data => {
        console.log('Success:', data);
        // You can display a success message or redirect the user here
    })
    .catch((error) => {
        console.error('Error:', error);
        //alert(`Registration failed: ${error.message}`);  // Show the error message in an alert
    });
});

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

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
    fetch('http://127.0.0.1:8000/users/', {  // Replace with your actual API URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user_data)  // Convert data object to JSON
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {  // Parse the error message
                document.getElementById('registerError').innerText = err.error;  // Display the error message
                throw new Error(err.error);  // Throw an error with the message from the server
            });
        }
        return response.json();  // Parse the success response
    })
    .then(data => {
        console.log('Success:', data);
        // You can display a success message or redirect the user here
    })
    .catch((error) => {
        console.error('Error:', error);
        //alert(`Registration failed: ${error.message}`);  // Show the error message in an alert
    });
});

