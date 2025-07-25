const Slot = require('../models/slot.model');
const Booking = require('../models/booking.model'); // <-- Add this line

// Create Slot
exports.createSlot = async (req, res) => {
  try {
    const { restaurantId, time, date, totalTables, tableCapacity } = req.body;

    // Validate inputs
    if (!restaurantId || !time || !date || !totalTables || !tableCapacity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if slot already exists for same time/date
    const existing = await Slot.findOne({ restaurantId, time, date });
    if (existing) {
      return res.status(409).json({ message: 'Slot already exists' });
    }

    // Create new slot
    const slot = new Slot({
      restaurantId,
      time,
      date,
      totalTables,
      tableCapacity
    });

    await slot.save();

    res.status(201).json({ success: true, message: 'Slot created successfully', slot });
  } catch (error) {
    console.error('Create Slot Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Get Slots by Restaurant
// GET /api/slots?restaurantId=RESTAURANT_ID
exports.getAllSlots = async (req, res) => {
  try {

    const { restaurantId, page = 1, limit = 10, sortField = 'date', sortDirection = 'asc' } = req.query;
    if (!restaurantId) {
      return res.status(400).json({ message: 'Missing restaurantId' });
    }

    const skip = (page - 1) * limit;
    const sort = { [sortField]: sortDirection === 'asc' ? 1 : -1 };

    const [slots, total] = await Promise.all([
      Slot.find({ restaurantId }).sort(sort).skip(skip).limit(Number(limit)),
      Slot.countDocuments({ restaurantId })
    ]);

    res.status(200).json({ success: true, data:slots, total });
  } catch (error) {
    console.error('Get all slots error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/slots/available?restaurantId=RESTAURANT_ID&date=YYYY-MM-DD
exports.getAvailableSlotsByDate = async (req, res) => {
  try {
    const { restaurantId, date } = req.query;

    if (!restaurantId || !date) {
      return res.status(400).json({ message: 'Missing restaurantId or date' });
    }

    const normalizedDate = new Date(date).toISOString().slice(0, 10);

    const slots = await Slot.find({ restaurantId, date: normalizedDate });
    const bookings = await Booking.find({ restaurantId, date: normalizedDate });

    const availableSlots = slots.filter(slot => {
      const bookedPeople = bookings
        .filter(b => b.time === slot.time)
        .reduce((sum, b) => sum + b.people, 0);

      const maxCapacity = slot.totalTables * slot.tableCapacity;
      return bookedPeople < maxCapacity;
    });

    res.status(200).json({
      success: true,
      data: availableSlots,
      total: availableSlots.length,
      message: availableSlots.length === 0 ? 'Slot not available' : 'Slot available'
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};





// Update Slot
exports.updateSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { time, available } = req.body;

    const updated = await Slot.findByIdAndUpdate(id, { time, available }, { new: true });

    if (!updated) return res.status(404).json({ message: 'Slot not found' });

    res.status(200).json({ success: true, message: 'Slot updated', slot: updated });
  } catch (error) {
    console.error('Update Slot Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete Slot
exports.deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Slot.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ message: 'Slot not found' });

    res.status(200).json({ success: true, message: 'Slot deleted' });
  } catch (error) {
    console.error('Delete Slot Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.generateWeeklySlots = async (req, res) => {
  try {
    const {
      restaurantId,
      startDate,
      openTime,
      closeTime,
      intervalMinutes,
      totalTables,
      tableCapacity
    } = req.body;

    if (!restaurantId || !startDate || !openTime || !closeTime || !intervalMinutes || !totalTables || !tableCapacity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const days = 7; // 1 week
    const startDateObj = new Date(startDate);

    // Helper function to convert "10:00 AM" to Date object with same day
    const parseTime = (baseDate, timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const d = new Date(baseDate);
      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    const allSlots = [];

    for (let i = 0; i < days; i++) {
      const currentDay = new Date(startDateObj);
      currentDay.setDate(startDateObj.getDate() + i);

      const dayStr = currentDay.toISOString().slice(0, 10);
      const open = parseTime(currentDay, openTime);
      const close = parseTime(currentDay, closeTime);

      let currentTime = new Date(open);

      while (currentTime < close) {
        const slotTime = currentTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        const exists = await Slot.findOne({ restaurantId, date: dayStr, time: slotTime });
        if (!exists) {
          allSlots.push({
            restaurantId,
            date: dayStr,
            time: slotTime,
            totalTables,
            tableCapacity
          });
        }

        currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
      }
    }

    if (allSlots.length > 0) {
      await Slot.insertMany(allSlots);
    }

    res.status(201).json({
      success: true,
      message: `${allSlots.length} slots created successfully.`,
      slotsCreated: allSlots.length
    });

  } catch (error) {
    console.error("Generate Weekly Slots Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
