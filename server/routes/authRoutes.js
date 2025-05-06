// authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, findByEmail, findById, getAllUsers } = require('../controllers/authController'); // Assuming you have a controller for your registration logic
console.log('Register function:', register);

// Define routes
router.post('/register', register); // Ensure register is a function that handles the route
router.post('/login', login);
router.get('/user/:id', findById);
router.get('/user/email/:email', findByEmail);
router.get('/users', getAllUsers);

module.exports = router;
