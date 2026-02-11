const mongoose = require('mongoose');

// schema for private messages between users
const PrivateMessageSchema = new mongoose.Schema({
  from_user: {
    type: String,
    required: true,
    trim: true
  },
  to_user: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  date_sent: {
    type: Date,
    default: Date.now
  }
});

const PrivateMessage = mongoose.model("PrivateMessage", PrivateMessageSchema);
module.exports = PrivateMessage;