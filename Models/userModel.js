const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone_number: {
    type: Number,
    required: true,
    unique: true
  },
  priority: {
    type: Number,
    enum: [0, 1, 2], // Priority levels for Twilio calling
    default: 0
  },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task'}],
});

module.exports = mongoose.model('User', userSchema);
