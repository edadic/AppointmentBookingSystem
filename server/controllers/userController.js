const { Op } = require('sequelize');
const User = require('../models/User');

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { full_name, email } = req.body;
    
    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      where: { 
        email,
        id: { [Op.ne]: req.user.userId }
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ full_name, email });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        is_store_owner: user.is_store_owner
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};