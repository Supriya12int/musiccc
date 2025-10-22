const express = require('express');
const { body, validationResult } = require('express-validator');
const Playlist = require('../models/Playlist');
const Song = require('../models/Song');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/playlists
// @desc    Get user's playlists
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user._id })
      .populate('songs', 'title artist duration coverImage')
      .sort({ createdAt: -1 });

    res.json(playlists);
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/playlists/public
// @desc    Get public playlists
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const playlists = await Playlist.find({ isPublic: true })
      .populate('owner', 'username')
      .populate('songs', 'title artist duration coverImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Playlist.countDocuments({ isPublic: true });

    res.json({
      playlists,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get public playlists error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/playlists/:id
// @desc    Get single playlist
// @access  Public/Private
router.get('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('owner', 'username')
      .populate('songs', 'title artist duration coverImage album genre');

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if playlist is public or user owns it
    if (!playlist.isPublic && (!req.user || playlist.owner._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(playlist);
  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/playlists
// @desc    Create new playlist
// @access  Private
router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('Playlist name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, isPublic = false } = req.body;

    const playlist = new Playlist({
      name,
      description,
      owner: req.user._id,
      isPublic
    });

    await playlist.save();

    res.status(201).json({
      message: 'Playlist created successfully',
      playlist
    });
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/playlists/:id
// @desc    Update playlist
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, description, isPublic } = req.body;
    
    const updateFields = {};
    if (name) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (isPublic !== undefined) updateFields.isPublic = isPublic;

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).populate('songs', 'title artist duration coverImage');

    res.json({
      message: 'Playlist updated successfully',
      playlist: updatedPlaylist
    });
  } catch (error) {
    console.error('Update playlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/playlists/:id/songs
// @desc    Add song to playlist
// @access  Private
router.post('/:id/songs', auth, [
  body('songId').notEmpty().withMessage('Song ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { songId } = req.body;

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Check if song is already in playlist
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({ message: 'Song already in playlist' });
    }

    playlist.songs.push(songId);
    await playlist.save();

    res.json({
      message: 'Song added to playlist successfully',
      playlist
    });
  } catch (error) {
    console.error('Add song to playlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/playlists/:id/songs/:songId
// @desc    Remove song from playlist
// @access  Private
router.delete('/:id/songs/:songId', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    playlist.songs = playlist.songs.filter(
      songId => songId.toString() !== req.params.songId
    );

    await playlist.save();

    res.json({
      message: 'Song removed from playlist successfully',
      playlist
    });
  } catch (error) {
    console.error('Remove song from playlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/playlists/:id
// @desc    Delete playlist
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Playlist.findByIdAndDelete(req.params.id);

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;