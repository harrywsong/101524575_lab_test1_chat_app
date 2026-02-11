// Connect to socket
const socket = io();

// Get username from localStorage
const username = localStorage.getItem('username');

// Check if user is logged in, if not redirect to login
if (!username) {
    window.location.href = '/login.html';
}

// Show username on page load
document.getElementById('username').textContent = username;

// Tell server user is online on page load
socket.emit('user-online', username);

// Logout button
document.getElementById('logoutBtn').addEventListener('click', function() {
    // Remove username and userId from localStorage and redirect to login
    localStorage.clear();
    window.location.href = '/login.html';
});

// Room buttons
const roomButtons = document.querySelectorAll('.room-btn');
// Add click event listener to each room button
for (let i = 0; i < roomButtons.length; i++) {
    roomButtons[i].addEventListener('click', function() {
        // Get room name from data attribute
        const room = this.getAttribute('data-room');
        // Set room name in localStorage and redirect to room
        localStorage.setItem('currentRoom', room);
        window.location.href = '/room.html';
    });
}

// User buttons (for private chat)
document.addEventListener('click', function(e) {
    // Check if user button was clicked
    if (e.target.classList.contains('user-btn')) {
        // Get target user from data attribute
        const targetUser = e.target.getAttribute('data-user');
        // Set target user in localStorage and redirect to private chat
        localStorage.setItem('targetUser', targetUser);
        window.location.href = '/private.html';
    }
});

// Listen for online users from server
socket.on('online-users', function(users) {
    // Clear user list
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    // Add online users to user list
    for (let i = 0; i < users.length; i++) {
        // Omit the current user from being displayed in the list
        if (users[i] !== username) {
            // Create the button
            const button = document.createElement('button');
            // Set classes to the button so the css can be applied
            button.className = 'list-group-item list-group-item-action user-btn';
            // Set the data-user attribute to the user's name and text content to the user's name
            button.setAttribute('data-user', users[i]);
            button.textContent = users[i];
            // Append the button to the user list
            userList.appendChild(button);
        }
    }
});
