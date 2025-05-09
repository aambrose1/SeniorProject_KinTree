// authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, findByEmail, findById, getAllUsers } = require('../controllers/authController'); // Assuming you have a controller for your registration logic
console.log('Register function:', register);

router.post('/register', register);
router.post('/login', login);
router.get('/user/:id', findById);
router.get('/user/email/:email', findByEmail);
router.get('/users', getAllUsers);

module.exports = router;
