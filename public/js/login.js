// Login form submit
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const credentials = {
        username: username,
        password: password
    };

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    })
    .then(function(response) {
        return response.json().then(function(data) {
            return { ok: response.ok, data: data };
        });
    })
    .then(function(result) {
        if (result.ok) {
            localStorage.setItem('username', result.data.username);
            localStorage.setItem('userId', result.data.userId);
            document.getElementById('message').innerHTML = '<div class="alert alert-success">Login successful! Redirecting...</div>';
            setTimeout(function() {
                window.location.href = '/lobby.html';
            }, 1500);
        } else {
            document.getElementById('message').innerHTML = '<div class="alert alert-danger">' + result.data.message + '</div>';
        }
    })
    .catch(function(error) {
        document.getElementById('message').innerHTML = '<div class="alert alert-danger">Error connecting to server</div>';
    });
});
