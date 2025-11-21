// authController.js - the main backend file for user registration, signin, etc
const User = require('../models/userModel');  // now backed by Supabase

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
<<<<<<< Updated upstream
    res.status(500);json({error:"Error deleting user"})
=======
<<<<<<< HEAD
    res.status(500); json({ error: "Error deleting user" });
=======
    res.status(500).json({error:"Error deleting user"})
>>>>>>> 5315e049f5602a4d1eb3fed3abe518fd4b3917f5
>>>>>>> Stashed changes
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
 
// Add a sync endpoint: POST /api/auth/sync
// Body: { auth_uid, email, username, firstName, lastName, phoneNumber, birthDate }
const syncAuthUser = async (req, res) => {
  try {
    const { auth_uid, email, username, firstName, lastName, phoneNumber, birthDate } = req.body || {};
    if (!auth_uid || !email) {
      return res.status(400).json({ error: 'auth_uid and email are required' });
    }
    const user = await User.upsertByAuthUser({ auth_uid, email, username, firstName, lastName, phoneNumber, birthDate });
    res.status(200).json(user);
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ 
      error: 'Error syncing auth user',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports.syncAuthUser = syncAuthUser;
