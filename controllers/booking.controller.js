const Booking = require('../models/booking.model');
const Slot = require('../models/slot.model');
const { sendBookingEmail } = require('../utils/email');
exports.createBooking = async (req, res) => {
  try {
    const { name, email, phone, date, time, people, message, restaurantId } = req.body;

    if (!name || !email || !phone || !date || !time || !people || !restaurantId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Format time (12hr format)
    function formatTimeTo12Hour(t) {
      if (!t) return '';
      t = String(t).trim();
      if (/am|pm/i.test(t)) return t.toUpperCase();
      let [h, m] = t.split(':');
      h = parseInt(h, 10);
      m = m ? m.padStart(2, '0') : '00';
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      return `${hour12.toString().padStart(2, '0')}:${m} ${period}`;
    }

    const formattedTime = formatTimeTo12Hour(time);

    // ✅ Find the corresponding slot
    const slot = await Slot.findOne({ restaurantId, date, time: formattedTime });
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    // ✅ Sum total people already booked for that slot
    const existingBookings = await Booking.find({ restaurantId, date, time: formattedTime });
    const totalPeopleBooked = existingBookings.reduce((sum, b) => sum + b.people, 0);

    const totalSlotCapacity = slot.totalTables * slot.tableCapacity;

    if (totalPeopleBooked + people > totalSlotCapacity) {
      return res.status(400).json({ message: 'Not enough capacity in this slot' });
    }

    // ✅ Proceed with booking
    const booking = new Booking({
      name,
      email,
      phone,
      date,
      time: formattedTime,
      people,
      message,
      restaurantId
    });

    await booking.save();

    // ✅ Update slot status only if fully booked
    if (totalPeopleBooked + people >= totalSlotCapacity) {
      slot.status = 'booked';
      await slot.save();
    }

    // ✅ Emit real-time event
    req.io.to(restaurantId).emit('new-booking', booking);

    // ✅ Send confirmation email
    await sendBookingEmail(email, booking);

    res.status(201).json({
      success: true,
      message: 'Table booked successfully',
      booking
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.getBookingsForOwner = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId; // comes from JWT token

    // Query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'date';
    const order = req.query.order === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Booking.find({ restaurantId })
        .sort({ [sortBy]: order, time: order }) // Secondary sort on time
        .skip(skip)
        .limit(limit),
      Booking.countDocuments({ restaurantId })
    ]);


    // const data = await Booking.find({ restaurantId }).sort({ date: 1, time: 1 });

    res.status(200).json({
      success: true,
      message: 'Bookings for your restaurant',
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Owner bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json(
        {
          success: false,
          message: 'Bookings not found',
          data
        }
      );
    }

    await Booking.findByIdAndDelete(id);
    // Step 3: Emit to Socket.io
    req.io?.to(booking.restaurantId).emit('booking-deleted', id);

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully',
      bookingId: id
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};