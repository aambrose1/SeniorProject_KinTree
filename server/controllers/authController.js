// authController.js
const bcrypt = require('bcryptjs');
const User = require('../models/userModel'); 

const register = async (req, res) => {
    console.log('Regiater function called');
  try {
    const { username, email, password } = req.body;

    if (!email || !password || !username) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) return res.status(400).json({
      error: 'Email already in use'
    });

    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [newUser] = await User.register({
      username,  
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: 'User registered successfully', user: newUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Registration failed'
    });
  }
};

const login = async(req,res) => {
  try{
    const { email, password } = req.body;
    if(!email || !password){
      return res.status(400).json({
        message: 'Missing an email or password'
      });
    }
    const existingUser = await User.findByEmail(email);
    if(!existingUser){
      return res.status(401).json({
        message: 'User is not found. Please register!'
      });
    }
    const passwordCompare = await bcrypt.compare(password, existingUser.password)
    if(!passwordCompare){
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    res.status(200).json({
      message: "You are logged in!"
    });
  }
  catch (error){
    console.error(error);
    res.status(500).json({
      error: 'Registration failed'
    });

  }
}

module.exports = { register,login };
