// routes/abteilung.js

const express = require('express');
const router = express.Router();
const AbteilungController = require('../controllers/abteilung');

// Define endpoint handlers
router.get('/', AbteilungController.list);
router.post('/', AbteilungController.create);
router.delete('/:abteilungId', AbteilungController.delete);

module.exports = router;