// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  due_date: {
    type: Date,
    required: true
  },
  priority: {
    type: Number,
    enum: [0, 1, 2, 3],
    default: 3
  },
  status: {
    type: String,
    enum: ['TODO', 'IN_PROGRESS', 'DONE'],
    default: 'DONE'
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subtasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubTask' }],
  deleted_at: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);