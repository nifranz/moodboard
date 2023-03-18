// routes/user.js

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');

// Define endpoint handlers for User CRUD
router.get('/', UserController.list);
router.post('/', UserController.create);
router.get('/:userId', UserController.read);
router.put('/:userId', UserController.update);
router.delete('/:userId', UserController.delete);

module.exports = router;