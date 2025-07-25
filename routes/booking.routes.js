// Booking routes placeholder
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { verifyOwnerToken } = require('../middleware/auth.middleware'); 

router.post('/',  bookingController.createBooking);
router.get('/owner', verifyOwnerToken, bookingController.getBookingsForOwner);
router.delete('/:id',verifyOwnerToken,  bookingController.deleteBooking);


module.exports = router;
