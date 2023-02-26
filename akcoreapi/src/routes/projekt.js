// routes/projekt.js

const express = require('express');
const router = express.Router();
const ProjektController = require('../controllers/projekt');

// Define endpoint handlers
// router.get('/:organisationId', ProjektController.list);
router.post('/', ProjektController.create);
router.get('/:projektId', ProjektController.read);
router.put('/:projektId', ProjektController.update);
router.delete('/:projektId', ProjektController.delete);

module.exports = router;