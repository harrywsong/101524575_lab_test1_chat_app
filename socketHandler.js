const GroupMessage = require('./models/GroupMessage');
const PrivateMessage = require('./models/PrivateMessage');

// Track online users and their socket IDs
const onlineUsers = new Map(); // username -> socketId

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // User comes online
        socket.on('user-online', (username) => {
            socket.username = username;
            onlineUsers.set(username, socket.id);
            
            // Broadcast updated user list
            io.emit('online-users', Array.from(onlineUsers.keys()));
        });

        // Join room
        socket.on('join-room', async ({ room, username }) => {
            socket.join(room);
            socket.currentRoom = room;
            socket.username = username;
            
            console.log(`${username} joined room: ${room}`);
            
            // Load previous messages
            const messages = await GroupMessage.find({ room }).sort({ date_sent: 1 }).limit(50);
            socket.emit('previous-messages', messages);
            
            // Notify room
            socket.to(room).emit('user-joined', { username, message: `${username} joined the room` });
        });

        // Leave room
        socket.on('leave-room', ({ room, username }) => {
            socket.leave(room);
            socket.to(room).emit('user-left', { username, message: `${username} left the room` });
            console.log(`${username} left room: ${room}`);
        });

        // Group message
        socket.on('group-message', async (data) => {
            const { room, username, message } = data;
            
            const groupMessage = new GroupMessage({
                from_user: username,
                room,
                message
            });
            await groupMessage.save();
            
            io.to(room).emit('group-message', {
                from_user: username,
                message,
                date_sent: groupMessage.date_sent
            });
        });

        // Load private messages
        socket.on('load-private-messages', async ({ from, to }) => {
            const messages = await PrivateMessage.find({
                $or: [
                    { from_user: from, to_user: to },
                    { from_user: to, to_user: from }
                ]
            }).sort({ date_sent: 1 }).limit(50);
            
            socket.emit('previous-private-messages', messages);
        });

        // Private message
        socket.on('private-message', async (data) => {
            const { from_user, to_user, message } = data;
            
            const privateMessage = new PrivateMessage({
                from_user,
                to_user,
                message
            });
            await privateMessage.save();
            
            // Send to both users
            const recipientSocketId = onlineUsers.get(to_user);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('private-message', {
                    from_user,
                    to_user,
                    message,
                    date_sent: privateMessage.date_sent
                });
            }
            
            // Send back to sender
            socket.emit('private-message', {
                from_user,
                to_user,
                message,
                date_sent: privateMessage.date_sent
            });
        });

        // Typing indicator (room)
        socket.on('typing', ({ room, username }) => {
            socket.to(room).emit('user-typing', { username });
        });

        socket.on('stop-typing', ({ room }) => {
            socket.to(room).emit('user-stop-typing');
        });

        // Typing indicator (private)
        socket.on('typing-private', ({ from_user, to_user }) => {
            const recipientSocketId = onlineUsers.get(to_user);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('user-typing-private', { from_user });
            }
        });

        socket.on('stop-typing-private', ({ to_user }) => {
            const recipientSocketId = onlineUsers.get(to_user);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('user-stop-typing-private');
            }
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
            
            // Remove from online users
            if (socket.username) {
                onlineUsers.delete(socket.username);
                io.emit('online-users', Array.from(onlineUsers.keys()));
            }
            
            if (socket.currentRoom && socket.username) {
                socket.to(socket.currentRoom).emit('user-left', { 
                    username: socket.username, 
                    message: `${socket.username} disconnected` 
                });
            }
        });
    });
};
