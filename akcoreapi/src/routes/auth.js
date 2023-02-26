// routes/auth.js

const { application } = require('express');
const express = require('express');
let router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.login);

module.exports = router;