// routes/mitarbeiter.js

const express = require('express');
const router = express.Router();
const MitarbeiterController = require('../controllers/mitarbeiter');

// Define endpoint handlers
router.get('/', MitarbeiterController.list);
router.post('/', MitarbeiterController.create);
router.get('/:mitarbeiterId', MitarbeiterController.read);
router.put('/:mitarbeiterId', MitarbeiterController.update);
router.delete('/:mitarbeiterId', MitarbeiterController.delete);

module.exports = router;