// Signup form submit
document.getElementById('signupForm').addEventListener('submit', function(e) {
    // Prevent default form submission
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const password = document.getElementById('password').value;
    
    // Create user data object using the values from the form inputs
    const userData = {
        username: username,
        firstname: firstname,
        lastname: lastname,
        password: password
    };

    // Send user data to server for signup
    fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    })
    // Parse the response as JSON
    .then(function(response) {
        return response.json().then(function(data) {
            // if response is ok return data
            return { ok: response.ok, data: data };
        });
    })
    // Handle the response
    .then(function(result) {
        // if response is ok
        if (result.ok) {
            // Redirect to login page
            window.location.href = '/login.html';
        // if response is not ok
        } else {
            // Display error message
            document.getElementById('message').innerHTML = '<div class="alert alert-danger">' + result.data.message + '</div>';
        }
    })
    // in case of error about the connection to the server
    .catch(function(error) {
        document.getElementById('message').innerHTML = '<div class="alert alert-danger">Error connecting to server</div>';
    });
});
