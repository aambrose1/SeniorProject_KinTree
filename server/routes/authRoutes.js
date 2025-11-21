// authRoutes.js
const express = require('express');
const router = express.Router();

<<<<<<< Updated upstream
<<<<<<< Updated upstream
const { register, login, deleteByUser, findByEmail, findById, getAllUsers } = require('../controllers/authController'); // Assuming you have a controller for your registration logic
=======
<<<<<<< HEAD
const { register, login, deleteByUser, findByEmail, findById, getAllUsers, } = require('../controllers/authController'); // Assuming you have a controller for your registration logic
=======
const { deleteByUser, findByEmail, findById, getAllUsers, syncAuthUser } = require('../controllers/authController'); 
>>>>>>> 5315e049f5602a4d1eb3fed3abe518fd4b3917f5
>>>>>>> Stashed changes

=======
const { register, login, editByUser, deleteByUser, findByEmail, findById, getAllUsers, } = require('../controllers/authController'); // Assuming you have a controller for your registration logic

console.log('Register function:', register);

router.post('/register', register);
router.post('/login', login);
router.patch('/edit/:id', editByUser);
>>>>>>> Stashed changes
router.delete('/remove/:id', deleteByUser);
router.get('/user/:id', findById);
router.get('/user/email/:email', findByEmail);
router.get('/users', getAllUsers);
router.post('/sync', syncAuthUser);


module.exports = router;
