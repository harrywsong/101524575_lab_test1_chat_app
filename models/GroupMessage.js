const mongoose = require('mongoose');

// schema for group messages
const GroupMessageSchema = new mongoose.Schema({
  from_user: {
    type: String,
    required: true,
    trim: true
  },
  room: {
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

const GroupMessage = mongoose.model("GroupMessage", GroupMessageSchema);
module.exports = GroupMessage;
