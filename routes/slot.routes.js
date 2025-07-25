const express = require('express');
const router = express.Router();
const controller = require('../controllers/slot.controller');
const { verifyOwnerToken } = require('../middleware/auth.middleware');

router.post('/', verifyOwnerToken, controller.createSlot);
router.post('/weekly', verifyOwnerToken, controller.generateWeeklySlots);
router.get('/all', controller.getAllSlots); // For owners
router.get('/available', controller.getAvailableSlotsByDate); // For users
router.put('/:id', verifyOwnerToken, controller.updateSlot);
router.delete('/:id', verifyOwnerToken, controller.deleteSlot);

module.exports = router;
