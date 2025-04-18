const express = require('express');
// This next line assumes the controllers folder is one level UP from routes
const calculationController = require('../controllers/calculationController');
const router = express.Router();

// POST /api/calculate
router.post('/', calculationController.calculateSystemSize);

module.exports = router;