const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Owner = require('../models/restaurantOwner.model');
const Restaurant = require('../models/restaurant.model');

exports.registerOwnerWithRestaurant = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const restaurant = JSON.parse(req.body.restaurant); // assuming it's sent as JSON string

    const existingOwner = await Owner.findOne({ email });
    if (existingOwner) {
      return res.status(409).json({success:false, message: 'Owner already exists' });
    }

    const restaurantDoc = await Restaurant.create({
      name: restaurant.name,
      address: restaurant.address,
      contact: restaurant.contact,
      image: req.file?.filename // save image file name (optional: full path or URL)
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const owner = await Owner.create({
      name,
      email,
      phone,
      password: hashedPassword,
      restaurantId: restaurantDoc._id
    });

    res.status(201).json({
      success:true,
      message: 'Restaurant and owner registered successfully',
      owner,
      restaurant: restaurantDoc
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering owner & restaurant' });
  }
};


exports.loginOwner = async (req, res) => {
  try {
    const { email, password } = req.body;
    const owner = await Owner.findOne({ email });
    if (!owner) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { ownerId: owner._id, restaurantId: owner.restaurantId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
         success: true,
      message: 'Login successful',
      token,
      owner: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        restaurantId: owner.restaurantId
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
};
