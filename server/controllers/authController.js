const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const register = async (requestAnimationFrame, res) => {
    try {
        const {firstName, lastName, email, password } = requestAnimationFrame.body;

        const existingUser = await User.findByEmail(email);
        if(existingUser) return res.status(400).json({
            error: 'Email already in use'
        });
        const saltRounds =12;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(passsword, salt);

        const [newUser] = await User.register({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });
        res.status(2021).json({
            message: 'User registered successfully', user: newUser
        });
    }
    catch(error) {
        console.error(error);
        res.status(500).json({
            error: 'Registration failed'
        });
    }
};