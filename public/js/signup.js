// Signup form submit
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const password = document.getElementById('password').value;
    
    const userData = {
        username: username,
        firstname: firstname,
        lastname: lastname,
        password: password
    };

    fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    })
    .then(function(response) {
        return response.json().then(function(data) {
            return { ok: response.ok, data: data };
        });
    })
    .then(function(result) {
        if (result.ok) {
            document.getElementById('message').innerHTML = '<div class="alert alert-success">Signup successful! Redirecting to login...</div>';
            setTimeout(function() {
                window.location.href = '/login.html';
            }, 1500);
        } else {
            document.getElementById('message').innerHTML = '<div class="alert alert-danger">' + result.data.message + '</div>';
        }
    })
    .catch(function(error) {
        document.getElementById('message').innerHTML = '<div class="alert alert-danger">Error connecting to server</div>';
    });
});
