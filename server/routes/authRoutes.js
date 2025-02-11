// authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController'); // Assuming you have a controller for your registration logic
console.log('Register function:', register);

// Define routes
router.post('/register', register); // Ensure register is a function that handles the route
router.post('/login', login);


module.exports = router;
