// models/SubTask.js
const mongoose = require('mongoose');

const subTaskSchema = new mongoose.Schema({
  task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task', // Reference to the Task model
    required: true
  },
  status: {
    type: Number,
    enum: [0, 1], // 0 - incomplete, 1 - complete
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  deleted_at: {
    type: Date,
    default: null
  },
});

module.exports = mongoose.model('SubTask', subTaskSchema);
