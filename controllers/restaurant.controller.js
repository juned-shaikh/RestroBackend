const Restaurant = require('../models/restaurant.model');

exports.getAllRestaurants = async (req, res) => {
  try {
    const data = await Restaurant.find().sort({ createdAt: -1 });
     res.status(200).json({
      success: true,
      data:data
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch restaurants' });
  }
};
