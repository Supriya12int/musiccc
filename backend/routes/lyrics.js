const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const lyricsService = require('../services/lyricsService');
const { auth } = require('../middleware/auth');

// Get lyrics for a song
router.get('/song/:songId', auth, async (req, res) => {
  try {
    const song = await Song.findById(req.params.songId);
    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    // If song already has lyrics, return them
    if (song.lyrics && song.lyrics.trim() !== '') {
      return res.json({
        success: true,
        lyrics: song.lyrics,
        source: 'database'
      });
    }

    // Try to get lyrics info from Genius API
    const lyricsInfo = await lyricsService.getLyricsInfo(song.artist, song.title);
    
    if (lyricsInfo) {
      return res.json({
        success: true,
        lyricsInfo,
        source: 'genius',
        message: 'Visit the Genius URL to view full lyrics'
      });
    }

    // Fallback: return sample structure
    const sampleLyrics = lyricsService.generateSampleLyrics(song.title);
    return res.json({
      success: true,
      lyrics: sampleLyrics,
      source: 'sample',
      message: 'Sample lyrics structure - add your own lyrics'
    });

  } catch (error) {
    console.error('Error getting lyrics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update lyrics for a song (admin only)
router.put('/song/:songId', auth, async (req, res) => {
  try {
    const { lyrics } = req.body;
    
    // You might want to add admin check here
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ success: false, message: 'Admin access required' });
    // }

    const song = await Song.findByIdAndUpdate(
      req.params.songId,
      { lyrics },
      { new: true }
    );

    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    res.json({
      success: true,
      message: 'Lyrics updated successfully',
      song
    });

  } catch (error) {
    console.error('Error updating lyrics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Search lyrics across all songs
router.get('/search/:query', auth, async (req, res) => {
  try {
    const { query } = req.params;
    
    const songs = await Song.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { artist: { $regex: query, $options: 'i' } },
        { lyrics: { $regex: query, $options: 'i' } }
      ]
    }).select('title artist lyrics');

    res.json({
      success: true,
      songs,
      count: songs.length
    });

  } catch (error) {
    console.error('Error searching lyrics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;