// routes/auth.js
const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');

// Authentication routes
router.post('/register', userController.createUser);
// router.post('/login', authController.login);

module.exports = router;
