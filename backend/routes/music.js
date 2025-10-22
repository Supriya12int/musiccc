const express = require('express');
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const Song = require('../models/Song');
const Recording = require('../models/Recording');
const Playlist = require('../models/Playlist');
const { auth, adminAuth, artistAuth } = require('../middleware/auth');
const { createUpload, getFileUrl, deleteFile } = require('../services/storageService');

const router = express.Router();

// Create upload middleware using storage service
const uploadAudio = createUpload('audio');
const uploadImage = createUpload('image');

// @route   GET /api/music/songs
// @desc    Get all songs with pagination and filtering
// @access  Public
router.get('/songs', async (req, res) => {
  try {
    const { page = 1, limit = 20, genre, artist, search } = req.query;
    const query = {};

    // Add filters
    if (genre) query.genre = new RegExp(genre, 'i');
    if (artist) query.artist = new RegExp(artist, 'i');
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { artist: new RegExp(search, 'i') },
        { album: new RegExp(search, 'i') }
      ];
    }

    const songs = await Song.find(query)
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Song.countDocuments(query);

    res.json({
      songs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get songs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/music/songs/:id
// @desc    Get single song
// @access  Public
router.get('/songs/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate('uploadedBy', 'username');
    
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    res.json(song);
  } catch (error) {
    console.error('Get song error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/music/songs
// @desc    Add new song (Artist or Admin)
// @access  Private/Artist
router.post('/songs', artistAuth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('artist').trim().notEmpty().withMessage('Artist is required'),
  body('genre').trim().notEmpty().withMessage('Genre is required'),
  body('duration').isNumeric().withMessage('Duration must be a number'),
  body('audioUrl').trim().notEmpty().withMessage('Audio URL is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const songData = {
      ...req.body,
      uploadedBy: req.user._id
    };

    const song = new Song(songData);
    await song.save();

    res.status(201).json({
      message: 'Song added successfully',
      song
    });
  } catch (error) {
    console.error('Add song error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/music/songs/upload-audio
// @desc    Upload audio file for a song and get a URL (local or cloud)
// @access  Private/Artist
router.post('/songs/upload-audio', artistAuth, uploadAudio.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No audio file uploaded' });
    const url = getFileUrl(req.file, req);
    return res.status(201).json({ url });
  } catch (error) {
    console.error('Upload audio error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/music/songs/upload-cover
// @desc    Upload cover image for a song and get a URL (local or cloud)
// @access  Private/Artist
router.post('/songs/upload-cover', artistAuth, uploadImage.single('cover'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file uploaded' });
    const url = getFileUrl(req.file, req);
    return res.status(201).json({ url });
  } catch (error) {
    console.error('Upload cover error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/music/songs/:id/play
// @desc    Increment play count
// @access  Public
router.put('/songs/:id/play', async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { $inc: { playCount: 1 } },
      { new: true }
    );

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    res.json({ message: 'Play count updated', playCount: song.playCount });
  } catch (error) {
    console.error('Update play count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/music/popular
// @desc    Get popular songs
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const songs = await Song.find()
      .populate('uploadedBy', 'username')
      .sort({ playCount: -1 })
      .limit(parseInt(limit));

    res.json(songs);
  } catch (error) {
    console.error('Get popular songs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/music/recommendations
// @desc    Get song recommendations for user
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  try {
    const userPreferences = req.user.preferences;
    const query = {};

    // If user has genre preferences, filter by them
    if (userPreferences.genres && userPreferences.genres.length > 0) {
      query.genre = { $in: userPreferences.genres };
    }

    const recommendations = await Song.find(query)
      .populate('uploadedBy', 'username')
      .sort({ playCount: -1 })
      .limit(20);

    res.json(recommendations);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/music/my-songs
// @desc    Get songs uploaded by current user (artist)
// @access  Private/Artist
router.get('/my-songs', artistAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const songs = await Song.find({ uploadedBy: req.user._id })
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Song.countDocuments({ uploadedBy: req.user._id });

    res.json({
      songs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get my songs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/music/artist-stats
// @desc    Get artist statistics
// @access  Private/Artist
router.get('/artist-stats', artistAuth, async (req, res) => {
  try {
    const totalSongs = await Song.countDocuments({ uploadedBy: req.user._id });
    
    const totalPlaysResult = await Song.aggregate([
      { $match: { uploadedBy: req.user._id } },
      { $group: { _id: null, totalPlays: { $sum: '$playCount' } } }
    ]);
    
    const totalPlays = totalPlaysResult.length > 0 ? totalPlaysResult[0].totalPlays : 0;
    
    // Calculate total duration in hours
    const totalDurationResult = await Song.aggregate([
      { $match: { uploadedBy: req.user._id } },
      { $group: { _id: null, totalDuration: { $sum: '$duration' } } }
    ]);
    
    const totalDurationSeconds = totalDurationResult.length > 0 ? totalDurationResult[0].totalDuration : 0;
    const totalHours = Math.round((totalDurationSeconds / 3600) * 10) / 10;

    res.json({
      totalSongs,
      totalPlays,
      totalHours
    });
  } catch (error) {
    console.error('Get artist stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/music/songs/:id
// @desc    Delete a song (only uploader or admin)
// @access  Private/Artist
router.delete('/songs/:id', artistAuth, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    const isOwner = song.uploadedBy && song.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this song' });
    }

    // Remove from all playlists
    await Playlist.updateMany({}, { $pull: { songs: song._id } });

    // Delete related karaoke recordings and files if any
    const recs = await Recording.find({ song: song._id });
    for (const rec of recs) {
      const recPath = path.join(__dirname, '../../frontend/public', rec.audioUrl || '');
      try {
        if (rec.audioUrl && fs.existsSync(recPath)) fs.unlinkSync(recPath);
      } catch (e) {
        console.warn('Failed to delete recording file:', rec.audioUrl);
      }
    }
    await Recording.deleteMany({ song: song._id });

    // Delete related files using storage service
    if (song.audioUrl) {
      await deleteFile(song.audioUrl);
    }
    if (song.coverImage) {
      await deleteFile(song.coverImage);
    }

    await song.deleteOne();
    return res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Delete song error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/music/songs/:id/delete
// @desc    Delete a song (fallback when DELETE is blocked)
// @access  Private/Artist
router.post('/songs/:id/delete', artistAuth, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });

    const isOwner = song.uploadedBy && song.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this song' });
    }

    await Playlist.updateMany({}, { $pull: { songs: song._id } });

    const recs = await Recording.find({ song: song._id });
    for (const rec of recs) {
      const recPath = path.join(__dirname, '../../frontend/public', rec.audioUrl || '');
      try {
        if (rec.audioUrl && fs.existsSync(recPath)) fs.unlinkSync(recPath);
      } catch {}
    }
    await Recording.deleteMany({ song: song._id });

    // Delete related files using storage service
    if (song.audioUrl) {
      await deleteFile(song.audioUrl);
    }
    if (song.coverImage) {
      await deleteFile(song.coverImage);
    }

    await song.deleteOne();
    return res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Delete song (POST) error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;