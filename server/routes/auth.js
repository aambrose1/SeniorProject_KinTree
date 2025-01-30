const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../db/db')
const {JWT_SECRET} = process.env;

router.post('/register', async(req, res) => {
    const {username, email, password } = req.body;

    if (!username || !email || !password){
        return res.status(400).json({ message: 'All fields are required'});
    }

    try{
        const existingUser = await db('users').where({email }).first();
        if(existingUser) {
            return res.status(400).json({message: 'User already exists' });

        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const[userId] = await db('users').insert({
            username,
            email, 
            password: hashedPassword,

        });
        res.status(201).json({ message: 'User registered sucessfully', id});
    }

    catch(err){
        res.status(500).json({message: 'Server error', error: err.message});
        }
});

router.post('/login', async (req,res) => {
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({ message: 'All fields are required'});

    }

    try{
        const user = await db('users').where({email}).first();
        if(!user) {
            return res.status(401).json({messgae: 'Invalid credentials'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({ messgae: 'Invalid credentials'});
        }


    const token = jwt.sign({userId: user.id}, JWT_SECRET, {expiresIn: '1h'});

    res.status(200).json({messgae: 'Login successful', token });
    }catch (err) {
        res.status(500).json({messgae: 'Server error', error: err.message}); 
    }

});

module.exports = router;