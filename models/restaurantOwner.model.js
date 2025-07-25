const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String },
  password: { type: String, required: true },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  image:{ type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RestaurantOwner', ownerSchema);
