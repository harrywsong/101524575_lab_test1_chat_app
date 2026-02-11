// Connect to socket
const socket = io();

// Get username and target user from storage
const username = localStorage.getItem('username');
const targetUser = localStorage.getItem('targetUser');

// Check if logged in and make sure target user is selected. if not, redirect to lobby
if (!username || !targetUser) {
    window.location.href = '/lobby.html';
}

// Show targeted user's name
document.getElementById('targetUser').textContent = targetUser;

// Tell server user is online so they can be displayed in the user list
socket.emit('user-online', username);

// Load previous messages between users if they exist
socket.emit('load-private-messages', { from: username, to: targetUser });

// Exit chat button so user can return to lobby
document.getElementById('exitChatBtn').addEventListener('click', function() {
    localStorage.removeItem('targetUser');
    window.location.href = '/lobby.html';
});

// Send message button so user can send a message to the target user
document.getElementById('sendBtn').addEventListener('click', function() {
    const messageInput = document.getElementById('messageInput');
    // Trim any whitespace from the message
    const message = messageInput.value.trim();
    
    if (message) {
        // Emit the message to the server and clear the input field
        socket.emit('private-message', { from_user: username, to_user: targetUser, message: message });
        messageInput.value = '';
        // Because the user has sent the message that was being typed, we can stop the typing indicator
        socket.emit('stop-typing-private', { to_user: targetUser });
    }
});

// Send message when Enter key is pressed
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const message = this.value.trim();
        if (message) {
            socket.emit('private-message', { from_user: username, to_user: targetUser, message: message });
            this.value = '';
            socket.emit('stop-typing-private', { to_user: targetUser });
        }
    }
});

// Typing indicator activation
document.getElementById('messageInput').addEventListener('input', function() {
    // If the input field is not empty, emit the typing indicator
    if (this.value) {
        socket.emit('typing-private', { from_user: username, to_user: targetUser });
    }
});

// Function to format timestamp to HH:MM AM/PM
function formatTime(dateString) {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
    return displayHours + ':' + displayMinutes + ' ' + ampm;
}

// Listen for previous messages between users
socket.on('previous-private-messages', function(messages) {
    const messageArea = document.getElementById('messageArea');
    
    // Loop through each message and display it
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        
        // Create a new div for every new message (for formatting reasons)
        const messageDiv = document.createElement('div');
        
        // Format the timestamp
        const timestamp = formatTime(msg.date_sent);
        
        // Check if this message was sent by the current user or the target user
        if (msg.from_user === username) {
            // If the message was sent by the current user, use the "own" class
            messageDiv.className = 'message own';
            // Edited to show "You:" + message + timestamp
            messageDiv.innerHTML = '<strong>You:</strong> ' + msg.message + ' <span class="timestamp">' + timestamp + '</span>';
        } else {
            // If the message was sent by the target user, use the "other" class
            messageDiv.className = 'message other';
            // Edited to show username + message + timestamp
            messageDiv.innerHTML = '<strong>' + msg.from_user + ':</strong> ' + msg.message + ' <span class="timestamp">' + timestamp + '</span>';
        }
        
        // Append the message to end of the chat area
        messageArea.appendChild(messageDiv);
    }
});

// Listening for newly sent messages
socket.on('private-message', function(data) {
    // Only show messages between self and the target user
    if (data.from_user === targetUser || data.to_user === targetUser) {
        // define the message area
        const messageArea = document.getElementById('messageArea');
        
        // Create a new div for each new message
        const messageDiv = document.createElement('div');
        
        // Format the timestamp using the formatTime function
        const timestamp = formatTime(data.date_sent);
        
        // Check if this message was sent by the current user or the target user
        if (data.from_user === username) {
            // If the message was sent by the current user, use the "own" class
            messageDiv.className = 'message own';
            // Edited to show "You:" + message + timestamp
            messageDiv.innerHTML = '<strong>You:</strong> ' + data.message + ' <span class="timestamp">' + timestamp + '</span>';
        } else {
            // If the message was sent by the target user, use the "other" class
            messageDiv.className = 'message other';
            // Edited to show username + message + timestamp
            messageDiv.innerHTML = '<strong>' + data.from_user + ':</strong> ' + data.message + ' <span class="timestamp">' + timestamp + '</span>';
        }
        
        // Add the message to the end of the chat area
        messageArea.appendChild(messageDiv);
        
        // Scroll to the bottom to show the new message by default
        messageArea.scrollTop = messageArea.scrollHeight;
    }
});

// Listening for the typing indicator
socket.on('user-typing-private', function(data) {
    // Only show the typing indicator if the message was sent by the target user
    if (data.from_user === targetUser) {
        // Show the typing indicator as "username is typing..."
        document.getElementById('typingIndicator').textContent = data.from_user + ' is typing...';
    }
});

// Listen for when to stop the typing indicator
socket.on('user-stop-typing-private', function() {
    // Clear the typing indicator when the target user's textcontent is empty
    document.getElementById('typingIndicator').textContent = '';
});
