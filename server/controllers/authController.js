// authController.js - the main backend file for user registration, signin, etc
const User = require('../models/userModel');  // delete once done repalcing with supabase

const deleteByUser = async (req,res) => {
  const { id } = req.params;

  try{
    await User.deleteUser(id);

    res.json({ 
      message: "User deleted successfullyS"
    })

  }
  catch (error){
    console.error(error);
    res.status(500).json({error:"Error deleting user"})
  }
}

const findById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching user' });
    }
}

const findByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching user' });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching users' });
    }
}

module.exports = { deleteByUser, findById, findByEmail, getAllUsers };
