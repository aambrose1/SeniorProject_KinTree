const express = require('express');
const router = express.Router();

const {
    addContact,
    addMultipleContacts,
    getContactsByUser,
    getContactById,
    updateContact,
    deleteContact,
    deleteByUser
} = require('../controllers/contactController');

router.post('/add', addContact);

router.post('/add-multiple', addMultipleContacts);

router.get('/user/:userId', getContactsByUser);

router.get('/:id', getContactById);

router.put('/:id', updateContact);

router.delete('/:id', deleteContact);

router.delete('/user/:userId', deleteByUser);

module.exports = router;