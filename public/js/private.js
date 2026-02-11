// Connect to socket
const socket = io();

// Get username and target user from storage
const username = localStorage.getItem('username');
const targetUser = localStorage.getItem('targetUser');

// Check if logged in and target user selected
if (!username || !targetUser) {
    window.location.href = '/lobby.html';
}

// Show target user name
document.getElementById('targetUser').textContent = targetUser;

// Tell server user is online
socket.emit('user-online', username);

// Load previous messages
socket.emit('load-private-messages', { from: username, to: targetUser });

// Exit chat button
document.getElementById('exitChatBtn').addEventListener('click', function() {
    localStorage.removeItem('targetUser');
    window.location.href = '/lobby.html';
});

// Send message button
document.getElementById('sendBtn').addEventListener('click', function() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (message) {
        socket.emit('private-message', { from_user: username, to_user: targetUser, message: message });
        messageInput.value = '';
        socket.emit('stop-typing-private', { to_user: targetUser });
    }
});

// Send message when Enter key pressed
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.keyCode === 13) {
        const message = this.value.trim();
        if (message) {
            socket.emit('private-message', { from_user: username, to_user: targetUser, message: message });
            this.value = '';
            socket.emit('stop-typing-private', { to_user: targetUser });
        }
    }
});

// Typing indicator
document.getElementById('messageInput').addEventListener('input', function() {
    if (this.value) {
        socket.emit('typing-private', { from_user: username, to_user: targetUser });
    }
});

// Listen for previous messages
socket.on('previous-private-messages', function(messages) {
    const messageArea = document.getElementById('messageArea');
    
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const isOwn = msg.from_user === username;
        const messageClass = isOwn ? 'own' : 'other';
        const sender = isOwn ? 'You' : msg.from_user;
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ' + messageClass;
        messageDiv.innerHTML = '<strong>' + sender + ':</strong> ' + msg.message;
        messageArea.appendChild(messageDiv);
    }
});

// Listen for new messages
socket.on('private-message', function(data) {
    if (data.from_user === targetUser || data.to_user === targetUser) {
        const messageArea = document.getElementById('messageArea');
        const isOwn = data.from_user === username;
        const messageClass = isOwn ? 'own' : 'other';
        const sender = isOwn ? 'You' : data.from_user;
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ' + messageClass;
        messageDiv.innerHTML = '<strong>' + sender + ':</strong> ' + data.message;
        messageArea.appendChild(messageDiv);
        messageArea.scrollTop = messageArea.scrollHeight;
    }
});

// Listen for typing indicator
socket.on('user-typing-private', function(data) {
    if (data.from_user === targetUser) {
        document.getElementById('typingIndicator').textContent = data.from_user + ' is typing...';
    }
});

// Listen for stop typing
socket.on('user-stop-typing-private', function() {
    document.getElementById('typingIndicator').textContent = '';
});
