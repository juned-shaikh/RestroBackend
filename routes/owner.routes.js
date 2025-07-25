const express = require('express');
const router = express.Router();
const controller = require('../controllers/owner.controller');
const { verifyOwnerToken } = require('../middleware/auth.middleware'); 
const upload = require('../middleware/upload');
// router.post('/register', controller.registerOwnerWithRestaurant);
router.post('/login', controller.loginOwner);
router.post('/register',upload.single('image'), controller.registerOwnerWithRestaurant);

module.exports = router;
