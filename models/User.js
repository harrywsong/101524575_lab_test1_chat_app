const mongoose = require('mongoose');

// schema for users
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  firstname: {
    type: String,
    required: true,
    trim: true
  },
  lastname: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minLength: 6
  },
  createon: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", UserSchema);
module.exports = User;