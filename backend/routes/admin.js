const express = require('express');
const Song = require('../models/Song');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Add new song (admin only)
router.post('/add-song', auth, async (req, res) => {
  try {
    const {
      title,
      artist,
      album,
      genre,
      duration, // in seconds
      audioUrl, // URL to the audio file
      coverImage,
      releaseYear,
      tags
    } = req.body;

    // Validate required fields
    if (!title || !artist || !audioUrl || !duration || !genre) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, artist, audioUrl, duration, genre' 
      });
    }

    // Create new song
    const newSong = new Song({
      title,
      artist,
      album: album || 'Unknown Album',
      genre,
      duration: parseInt(duration),
      audioUrl,
      coverImage: coverImage || '',
      releaseYear: releaseYear || new Date().getFullYear(),
      tags: tags || [],
      playCount: 0
    });

    const savedSong = await newSong.save();

    res.status(201).json({
      message: 'Song added successfully',
      song: savedSong
    });

  } catch (error) {
    console.error('Error adding song:', error);
    res.status(500).json({ error: 'Failed to add song' });
  }
});

// Get all songs for admin
router.get('/songs', auth, async (req, res) => {
  try {
    const songs = await Song.find({}).sort({ createdAt: -1 });
    res.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

// Update song
router.put('/songs/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedSong = await Song.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedSong) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json({
      message: 'Song updated successfully',
      song: updatedSong
    });

  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({ error: 'Failed to update song' });
  }
});

// Delete song
router.delete('/songs/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSong = await Song.findByIdAndDelete(id);

    if (!deletedSong) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json({
      message: 'Song deleted successfully',
      song: deletedSong
    });

  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ error: 'Failed to delete song' });
  }
});

module.exports = router;