// routes/tasks.js
const express = require('express');
const router = express.Router();
const taskController = require('../Controllers/taskController');
const authenticate = require('../Controllers/userController');

// Task routes
router.post('/', authenticate.authenticateUser, taskController.createTask);
router.post('/subtask', authenticate.authenticateUser, taskController.createSubtask);
router.get('/', authenticate.authenticateUser, taskController.getAllUserTasks);
router.get('/subtask', authenticate.authenticateUser, taskController.getAllUserSubTasks);
router.put('/:id', authenticate.authenticateUser, taskController.updateTask);
router.put('/subtask/:id', authenticate.authenticateUser, taskController.updateSubTask);
router.delete('/:id', authenticate.authenticateUser, taskController.deleteTask);
router.delete('/subtask/:id', authenticate.authenticateUser, taskController.deleteSubTask);

module.exports = router;
