const express = require('express');
const calculationController = require('../controllers/calculationController');
const router = express.Router();

// POST /api/calculate
// Handles requests coming from the frontend to calculate system size
router.post('/', calculationController.calculateSystemSize);

module.exports = router; 