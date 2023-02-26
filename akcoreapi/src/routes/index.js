// routes/index.js

const express = require('express');
const router = express.Router();

// Import route modules
const mitarbeiterRouter = require('./mitarbeiter');
const projektRouter = require('./projekt');

// Mount route modules onto the router
router.use('/mitarbeiter', mitarbeiterRouter);
router.use('/projekt', projektRouter);

module.exports = router;