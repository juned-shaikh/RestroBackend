const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  time: {
    type: String,
    required: true
  },
   date: String,
   status: {
    type: String,
    default: 'open',
    enum: ['open', 'booked']
  },
   totalTables: { type: Number, required: true },      // ✅ Total tables available
  tableCapacity: { type: Number, required: true },  
  available: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Slot', slotSchema);
