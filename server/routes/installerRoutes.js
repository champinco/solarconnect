const express = require('express');
const installerController = require('../controllers/installerController');
const router = express.Router();

// GET /api/installers - Fetch all (or filtered) installers
router.get('/', installerController.getAllInstallers);

// GET /api/installers/:id - Fetch a single installer by ID (future use)
// router.get('/:id', installerController.getInstallerById);

module.exports = router; 