const express = require('express');
const User = require('../models/User');
const Song = require('../models/Song');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Add song to user's library
router.post('/add/:songId', auth, async (req, res) => {
  try {
    const { songId } = req.params;
    const userId = req.user._id;

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Check if song is already in library
    const user = await User.findById(userId);
    const existingEntry = user.library.find(entry => entry.songId.toString() === songId);
    
    if (existingEntry) {
      return res.status(400).json({ error: 'Song already in library' });
    }

    // Add song to library
    await User.findByIdAndUpdate(
      userId,
      { 
        $push: { 
          library: { 
            songId: songId,
            addedAt: new Date()
          } 
        } 
      },
      { new: true }
    );

    res.json({ message: 'Song added to library successfully' });
  } catch (error) {
    console.error('Error adding song to library:', error);
    res.status(500).json({ error: 'Failed to add song to library' });
  }
});

// Remove song from user's library
router.delete('/remove/:songId', auth, async (req, res) => {
  try {
    const { songId } = req.params;
    const userId = req.user._id;

    await User.findByIdAndUpdate(
      userId,
      { 
        $pull: { 
          library: { songId: songId } 
        } 
      }
    );

    res.json({ message: 'Song removed from library successfully' });
  } catch (error) {
    console.error('Error removing song from library:', error);
    res.status(500).json({ error: 'Failed to remove song from library' });
  }
});

// Get user's library
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).populate({
      path: 'library.songId',
      select: 'title artist album duration genre releaseYear coverImage playCount tags'
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Format the response
    const librarySongs = user.library
      .filter(entry => entry.songId) // Filter out any null/deleted songs
      .map(entry => ({
        ...entry.songId.toObject(),
        addedAt: entry.addedAt
      }))
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)); // Sort by most recently added

    res.json(librarySongs);
  } catch (error) {
    console.error('Error fetching user library:', error);
    res.status(500).json({ error: 'Failed to fetch library' });
  }
});

// Check if song is in user's library
router.get('/check/:songId', auth, async (req, res) => {
  try {
    const { songId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const isInLibrary = user.library.some(entry => entry.songId.toString() === songId);

    res.json({ isInLibrary });
  } catch (error) {
    console.error('Error checking library status:', error);
    res.status(500).json({ error: 'Failed to check library status' });
  }
});

module.exports = router;