const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

// forcing dns to use google dns because my pi-hole is blocking the connection to mongodb atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Models
const User = require('./models/User');
const GroupMessage = require('./models/GroupMessage');
const PrivateMessage = require('./models/PrivateMessage');

// Server
const app = express();
const SERVER_PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.static('views'));

// MongoDB connection (using MONGODB_URI from .env)
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
// default/login page
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// signup page
app.post('/api/signup', async (req, res) => {
    try {        
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: 'Database not connected. Please ensure MongoDB is running.' });
        }
        
        const { username, firstname, lastname, password } = req.body;
        
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const user = new User({ username, firstname, lastname, password });
        await user.save();
        
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

// login page
app.post('/api/login', async (req, res) => {
    try {
        console.log('Login request received:', req.body);
        
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: 'Database not connected. Please ensure MongoDB is running.' });
        }
        
        const { username, password } = req.body;
        
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({ message: 'Login successful', username: user.username, userId: user._id });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// Test route to view messages per room (replace :room with actual room name)
// example: http://localhost:3000/api/messages/sports
app.get('/api/messages/:room', async (req, res) => {
    try {
        const messages = await GroupMessage.find({ room: req.params.room });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test route to view created users in db
// example: http://localhost:3000/api/users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
const appServer = app.listen(SERVER_PORT, () => {
    console.log(`Server running on http://localhost:${SERVER_PORT}/`);
});

// Socket.io setup
const io = socketio(appServer);
require('./socketHandler')(io);