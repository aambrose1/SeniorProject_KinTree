const express = require('express');
const router = express.Router();

const {backupUser, restoreUser} = require('../controllers/backupController');

router.post('backupUser')