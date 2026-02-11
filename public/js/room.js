// Connect to socket
const socket = io();

// Get username and room from storage
const username = localStorage.getItem('username');
const room = localStorage.getItem('currentRoom');

// Check if logged in and room selected
if (!username || !room) {
    window.location.href = '/lobby.html';
}

// Show room name
document.getElementById('roomName').textContent = room;

// Join the room
socket.emit('join-room', { room: room, username: username });

// Leave room button
document.getElementById('leaveRoomBtn').addEventListener('click', function() {
    socket.emit('leave-room', { room: room, username: username });
    localStorage.removeItem('currentRoom');
    window.location.href = '/lobby.html';
});

// Send message button
document.getElementById('sendBtn').addEventListener('click', function() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (message) {
        socket.emit('group-message', { room: room, username: username, message: message });
        messageInput.value = '';
    }
});

// Send message when Enter key pressed
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.keyCode === 13) {
        const message = this.value.trim();
        if (message) {
            socket.emit('group-message', { room: room, username: username, message: message });
            this.value = '';
        }
    }
});

// Typing indicator
document.getElementById('messageInput').addEventListener('input', function() {
    if (this.value) {
        socket.emit('typing', { room: room, username: username });
    }
});

// Listen for previous messages
socket.on('previous-messages', function(messages) {
    const messageArea = document.getElementById('messageArea');
    
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const messageClass = msg.from_user === username ? 'own' : 'other';
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ' + messageClass;
        messageDiv.innerHTML = '<strong>' + msg.from_user + ':</strong> ' + msg.message;
        messageArea.appendChild(messageDiv);
    }
});

// Listen for new messages
socket.on('group-message', function(data) {
    const messageArea = document.getElementById('messageArea');
    const messageClass = data.from_user === username ? 'own' : 'other';
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ' + messageClass;
    messageDiv.innerHTML = '<strong>' + data.from_user + ':</strong> ' + data.message;
    messageArea.appendChild(messageDiv);
    messageArea.scrollTop = messageArea.scrollHeight;
});

// Listen for user joined
socket.on('user-joined', function(data) {
    const messageArea = document.getElementById('messageArea');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'text-center text-muted small';
    messageDiv.textContent = data.message;
    messageArea.appendChild(messageDiv);
});

// Listen for user left
socket.on('user-left', function(data) {
    const messageArea = document.getElementById('messageArea');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'text-center text-muted small';
    messageDiv.textContent = data.message;
    messageArea.appendChild(messageDiv);
});

// Listen for typing indicator
socket.on('user-typing', function(data) {
    document.getElementById('typingIndicator').textContent = data.username + ' is typing...';
    setTimeout(function() {
        document.getElementById('typingIndicator').textContent = '';
    }, 2000);
});
