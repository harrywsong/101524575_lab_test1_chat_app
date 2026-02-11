// Login form submit
document.getElementById('loginForm').addEventListener('submit', function(e) {
    // Prevent default form submission
    e.preventDefault();
    
    // Get username and password
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Create credentials object
    const credentials = {
        username: username,
        password: password
    };

    // Send credentials to server for login
    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    })
    .then(function(response) {
        return response.json().then(function(data) {
            // if response is ok return data
            return { ok: response.ok, data: data };
        });
    })
    .then(function(result) {
        // if response is ok
        if (result.ok) {
            // Set username and userId in localStorage and redirect to main lobby with room/user selection
            localStorage.setItem('username', result.data.username);
            localStorage.setItem('userId', result.data.userId);
            window.location.href = '/lobby.html';
        } else {
            // Show error message if login fails
            document.getElementById('message').innerHTML = '<div class="alert alert-danger">' + result.data.message + '</div>';
        }
    })
    // in case of error about connecting to server
    .catch(function(error) {
        document.getElementById('message').innerHTML = '<div class="alert alert-danger">Error connecting to server</div>';
    });
});
