const express = require('express');
const router = express.Router();
const controller = require('../controllers/restaurant.controller');

// Public route
router.get('/', controller.getAllRestaurants);

module.exports = router;
