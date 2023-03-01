// routes/index.js

const express = require('express');
const router = express.Router();

// Import route modules
const mitarbeiterRouter = require('./mitarbeiter');
const projektRouter = require('./projekt');
const abteilungRouter = require('./abteilung');
// const authRouter = require('./auth');

// Mount route modules onto the router to be imported in server.js
router.use('/mitarbeiter', mitarbeiterRouter);
router.use('/projekt', projektRouter);
router.use('/abteilung', abteilungRouter);
router.use('/auth', authRouter);

module.exports = router;