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

// Function to format timestamp
function formatTime(dateString) {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
    return displayHours + ':' + displayMinutes + ' ' + ampm;
}

// Leave room button
document.getElementById('leaveRoomBtn').addEventListener('click', function() {
    socket.emit('leave-room', { room: room, username: username });
    // Remove room from localStorage and redirect to lobby
    localStorage.removeItem('currentRoom');
    window.location.href = '/lobby.html';
});

// Send message button
document.getElementById('sendBtn').addEventListener('click', function() {
    // Set the input in the message field to variable "message" and trim any whitespace at the start and end
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    // Check if message is not empty
    if (message) {
        // if message is not empty, emit the message to the server with the room, username and message, then clear the message input field
        socket.emit('group-message', { room: room, username: username, message: message });
        messageInput.value = '';
        // Stop the typing indicator since the message was sent
        socket.emit('stop-typing', { room: room, username: username });
    }
});

// Typing indicator
document.getElementById('messageInput').addEventListener('input', function() {
    // If the input field is not empty, emit the typing indicator
    if (this.value) {
        // Emit typing indicator to server
        socket.emit('typing', { room: room, username: username });
    }
});

// Listen for previous messages
socket.on('previous-messages', function(messages) {
    // define message area
    const messageArea = document.getElementById('messageArea');
    
    // Loop through each message and display it
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        
        // Create a new div for each message
        const messageDiv = document.createElement('div');
        
        // Format the timestamp using the formatTime function
        const timestamp = formatTime(msg.date_sent);
        
        // Check if this message was sent by the current user
        if (msg.from_user === username) {
            // If the message was sent by the current user, use the "own" class
            messageDiv.className = 'message own';
            // Edited to show "You:" + message + timestamp
            messageDiv.innerHTML = '<strong>' + msg.from_user + ':</strong> ' + msg.message + ' <span class="timestamp">' + timestamp + '</span>';
        } else {
            // If the message was sent by the target user, use the "other" class
            messageDiv.className = 'message other';
            // Edited to show username + message + timestamp
            messageDiv.innerHTML = '<strong>' + msg.from_user + ':</strong> ' + msg.message + ' <span class="timestamp">' + timestamp + '</span>';
        }
        
        // Add the message to the chat area
        messageArea.appendChild(messageDiv);
    }
});

// Listen for new messages
socket.on('group-message', function(data) {
    // Define the message area
    const messageArea = document.getElementById('messageArea');
    
    // Create a new div for each message
    const messageDiv = document.createElement('div');
    
    // Format the timestamp using the formatTime function
    const timestamp = formatTime(data.date_sent);
    
    // Check if this message was sent by the current user
    if (data.from_user === username) {
        // If the message was sent by the current user, use the "own" class
        messageDiv.className = 'message own';
        // Edited to show "You:" + message + timestamp
        messageDiv.innerHTML = '<strong>' + data.from_user + ':</strong> ' + data.message + ' <span class="timestamp">' + timestamp + '</span>';
    } else {
        // If the message was sent by the target user, use the "other" class
        messageDiv.className = 'message other';
        // Edited to show username + message + timestamp
        messageDiv.innerHTML = '<strong>' + data.from_user + ':</strong> ' + data.message + ' <span class="timestamp">' + timestamp + '</span>';
    }
    
    // Add the message to the chat area
    messageArea.appendChild(messageDiv);
    
    // Scroll to the bottom to show the new message by default
    messageArea.scrollTop = messageArea.scrollHeight;
});

// Listen for when a user joins
socket.on('user-joined', function(data) {
    // Define the message area
    const messageArea = document.getElementById('messageArea');
    
    // Create a new div for each message
    const messageDiv = document.createElement('div');
    
    // Add the appropriate classes to the message div so it can be styled properly
    messageDiv.className = 'text-center text-muted small';
    
    // Add the message to the chat area
    messageDiv.textContent = data.message;
    messageArea.appendChild(messageDiv);
});

// Listen for when a user leaves
socket.on('user-left', function(data) {
    // Define the message area
    const messageArea = document.getElementById('messageArea');
    
    // Create a new div for each message
    const messageDiv = document.createElement('div');
    
    // Add the appropriate classes to the message div so it can be styled properly
    messageDiv.className = 'text-center text-muted small';
    
    // Add the message to the chat area
    messageDiv.textContent = data.message;
    messageArea.appendChild(messageDiv);
});

// Listen for typing indicator
socket.on('user-typing', function(data) {
    // Show the typing indicator as "username is typing..."
    document.getElementById('typingIndicator').textContent = data.username + ' is typing...';
});

// Listen for stop typing
socket.on('user-stop-typing', function() {
    // Clear the typing indicator when the target user's textcontent is empty
    document.getElementById('typingIndicator').textContent = '';
});
