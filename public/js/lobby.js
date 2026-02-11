// Connect to socket
const socket = io();

// Get username from storage
const username = localStorage.getItem('username');

// Check if user is logged in
if (!username) {
    window.location.href = '/login.html';
}

// Show username on page
document.getElementById('username').textContent = username;

// Tell server user is online
socket.emit('user-online', username);

// Logout button
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.clear();
    window.location.href = '/login.html';
});

// Room buttons
const roomButtons = document.querySelectorAll('.room-btn');
for (let i = 0; i < roomButtons.length; i++) {
    roomButtons[i].addEventListener('click', function() {
        const room = this.getAttribute('data-room');
        localStorage.setItem('currentRoom', room);
        window.location.href = '/room.html';
    });
}

// User buttons (for private chat)
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('user-btn')) {
        const targetUser = e.target.getAttribute('data-user');
        localStorage.setItem('targetUser', targetUser);
        window.location.href = '/private.html';
    }
});

// Listen for online users from server
socket.on('online-users', function(users) {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    
    for (let i = 0; i < users.length; i++) {
        if (users[i] !== username) {
            const button = document.createElement('button');
            button.className = 'list-group-item list-group-item-action user-btn';
            button.setAttribute('data-user', users[i]);
            button.textContent = users[i];
            userList.appendChild(button);
        }
    }
});
