
// authController.js - the main backend file for user registration, signin, etc
const User = require('../models/userModel');  // now backed by Supabase

// authController.js
const bcrypt = require('bcryptjs');
const User = require('../models/userModel'); 
const FamilyMember = require('../models/familyMemberModel');


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
    res.status(500);json({error:"Error deleting user"})


    res.status(500).json({
      error: 'Registration failed'
    });

  }
};

const editByUser = async (req, res) => {
  try {
    const { id } = req.params;  
    const { name, relation, age, phone, email } = req.body;

    
    const member = await FamilyMember.findById(id);
    if (!member) {
      return res.status(404).json({ error: "Family member not found" });
    }

    const updatedFields = {};

    if (name) updatedFields.name = name;
    if (relation) updatedFields.relation = relation;
    if (age) updatedFields.age = age;
    if (phone) updatedFields.phone = phone;
    if (email) {
      const emailOwner = await FamilyMember.findByEmail(email);
      if (emailOwner && emailOwner.id != id) {
        return res.status(400).json({ error: "Email already used by another member" });
      }
      updatedFields.email = email;
    }

    if (Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ error: "No valid fields provided to update" });
    }

    const updatedMember = await FamilyMember.updateFamilyMember(id, updatedFields);

    res.status(200).json({
      message: "Family member updated successfully",
      familyMember: updatedMember
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating family member" });
  }
};

async function deleteByUser(req, res) {
  const { id } = req.params;

  try {
    await User.deleteUser(id);

    res.json({
      message: "User deleted successfullyS"
    });

  }
  catch (error) {
    console.error(error);

    res.status(500); json({ error: "Error deleting user" });

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
module.exports = { register, login, editByUser, deleteByUser, findById, findByEmail, getAllUsers };

