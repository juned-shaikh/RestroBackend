const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: String,
  address: String,
  contact: String,
  image: String, // ✅ This must exist
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
