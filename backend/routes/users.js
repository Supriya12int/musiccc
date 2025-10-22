const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, preferences } = req.body;
    
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (email) updateFields.email = email;
    if (preferences) updateFields.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/favorites/:songId
// @desc    Add song to favorites
// @access  Private
router.post('/favorites/:songId', auth, async (req, res) => {
  try {
    const { songId } = req.params;
    const user = await User.findById(req.user._id);

    // Check if song is already in favorites
    const isAlreadyFavorite = user.favoriteSongs.some(
      fav => fav.songId.toString() === songId
    );

    if (isAlreadyFavorite) {
      return res.status(400).json({ message: 'Song already in favorites' });
    }

    // Add to favorites
    user.favoriteSongs.push({ songId });
    await user.save();

    res.json({ message: 'Song added to favorites', favoriteSongs: user.favoriteSongs });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/favorites/:songId
// @desc    Remove song from favorites
// @access  Private
router.delete('/favorites/:songId', auth, async (req, res) => {
  try {
    const { songId } = req.params;
    const user = await User.findById(req.user._id);

    // Remove from favorites
    user.favoriteSongs = user.favoriteSongs.filter(
      fav => fav.songId.toString() !== songId
    );
    await user.save();

    res.json({ message: 'Song removed from favorites', favoriteSongs: user.favoriteSongs });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/favorites
// @desc    Get user's favorite songs
// @access  Private
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favoriteSongs.songId');
    res.json(user.favoriteSongs);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;