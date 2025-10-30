// authRoutes.js
const express = require('express');
const router = express.Router();

const { deleteByUser, findByEmail, findById, getAllUsers } = require('../controllers/authController'); 

router.delete('/remove/:id', deleteByUser);
router.get('/user/:id', findById);
router.get('/user/email/:email', findByEmail);
router.get('/users', getAllUsers);


module.exports = router;
