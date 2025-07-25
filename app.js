const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path'); // ✅ Add this

const authRoutes = require('./routes/auth.routes');
const bookingRoutes = require('./routes/booking.routes');
const ownerRoutes = require('./routes/owner.routes');
const restaurantRoutes = require('./routes/restaurant.routes');
const slotRoutes = require('./routes/slot.routes');

const app = express();

let ioInstance = null;
app.use((req, res, next) => {
  if (ioInstance) {
    req.io = ioInstance;
  }
  next();
});

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ✅ Serve static files from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/slots', slotRoutes);

module.exports = {
  app,
  setSocketIO: (io) => { ioInstance = io; }
};
