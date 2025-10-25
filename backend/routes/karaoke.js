const express = require('express');
const router = express.Router();
const Recording = require('../models/Recording');
const Song = require('../models/Song');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../frontend/public/recordings');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'recording-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    console.log('File filter - MIME type:', file.mimetype);
    console.log('File filter - Original name:', file.originalname);
    
    const allowedTypes = /audio\/webm|audio\/wav|audio\/mp3|audio\/mpeg|audio\/ogg|audio\/mp4/;
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype) {
      console.log('File type accepted');
      return cb(null, true);
    }
    
    console.log('File type rejected:', file.mimetype);
    cb(new Error(`Invalid file type: ${file.mimetype}. Only audio files are allowed.`));
  }
});

// Middleware to handle multer errors
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File too large. Maximum size is 50MB.',
        error: 'FILE_TOO_LARGE'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: err.message
    });
  } else if (err) {
    console.error('Upload error:', err);
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed',
      error: 'UPLOAD_ERROR'
    });
  }
  next();
};

// Test endpoint to verify karaoke API is working
router.get('/test', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Karaoke API is working!',
    user: {
      id: req.user.userId,
      username: req.user.username
    },
    timestamp: new Date().toISOString()
  });
});

// Get lyrics for a song
router.get('/lyrics/:songId', auth, async (req, res) => {
  try {
    const song = await Song.findById(req.params.songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    res.json({
      lyrics: song.lyrics || 'No lyrics available for this song.',
      song: {
        title: song.title,
        artist: song.artist,
        albumImageUrl: song.albumImageUrl || song.coverImage
      }
    });
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload a new recording
router.post('/recordings', auth, upload.single('audio'), handleUploadErrors, async (req, res) => {
  try {
    console.log('=== Karaoke Recording Upload Request ===');
    console.log('Headers:', req.headers);
    console.log('User:', req.user);
    console.log('File:', req.file);
    console.log('Body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);

    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ 
        message: 'No audio file uploaded',
        details: 'Please ensure you are sending an audio file with your request'
      });
    }

    const { songId, title, duration, isPublic } = req.body;

    if (!songId) {
      console.error('Song ID missing');
      return res.status(400).json({ 
        message: 'Song ID is required',
        details: 'songId parameter is missing from the request'
      });
    }

    // Validate song exists
    console.log('Looking up song:', songId);
    const song = await Song.findById(songId);
    if (!song) {
      console.error('Song not found:', songId);
      return res.status(404).json({ 
        message: 'Song not found',
        details: `No song found with ID: ${songId}`
      });
    }
    console.log('Song found:', song.title, 'by', song.artist);

    // Validate duration
    const parsedDuration = parseInt(duration) || 0;
    if (parsedDuration <= 0) {
      console.warn('Invalid duration:', duration, 'Using default 0');
    }

    const audioUrl = `/recordings/${req.file.filename}`;
    console.log('Audio URL:', audioUrl);

    // Create recording record
    const recording = new Recording({
      title: title || `${song.title} - ${req.user.username || 'User'}'s Cover`,
      song: songId,
      user: req.user.userId,
      audioUrl,
      duration: parsedDuration,
      isPublic: isPublic === 'true' || isPublic === true
    });

    console.log('Saving recording:', recording);
    await recording.save();
    console.log('Recording saved with ID:', recording._id);

    // Populate and return the recording
    const populatedRecording = await Recording.findById(recording._id)
      .populate('song', 'title artist albumImageUrl coverImage')
      .populate('user', 'username email firstName lastName');

    console.log('Recording upload successful');
    res.status(201).json({
      success: true,
      message: 'Recording uploaded successfully',
      recording: populatedRecording
    });
  } catch (error) {
    console.error('Error uploading recording:', error);
    
    // Clean up uploaded file if database operation failed
    if (req.file) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log('Cleaned up uploaded file after error:', filePath);
        } catch (cleanupError) {
          console.error('Failed to clean up file:', cleanupError);
        }
      }
    }

    res.status(500).json({ 
      success: false,
      message: 'Server error while uploading recording',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get user's recordings
router.get('/my-recordings', auth, async (req, res) => {
  try {
    const recordings = await Recording.find({ user: req.user.userId })
      .populate('song', 'title artist albumImageUrl coverImage')
      .sort({ createdAt: -1 });

    res.json(recordings);
  } catch (error) {
    console.error('Error fetching recordings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get public recordings (community feed)
router.get('/recordings/public', auth, async (req, res) => {
  try {
    const recordings = await Recording.find({ isPublic: true })
      .populate('song', 'title artist albumImageUrl coverImage')
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(recordings);
  } catch (error) {
    console.error('Error fetching public recordings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recordings for a specific song
router.get('/recordings/song/:songId', auth, async (req, res) => {
  try {
    const recordings = await Recording.find({
      song: req.params.songId,
      isPublic: true
    })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    res.json(recordings);
  } catch (error) {
    console.error('Error fetching song recordings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like/unlike a recording
router.post('/recordings/:id/like', auth, async (req, res) => {
  try {
    const recording = await Recording.findById(req.params.id);
    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    const userLiked = recording.likes.includes(req.user.userId);

    if (userLiked) {
      recording.likes = recording.likes.filter(
        id => id.toString() !== req.user.userId
      );
    } else {
      recording.likes.push(req.user.userId);
    }

    await recording.save();

    res.json({
      likes: recording.likes.length,
      isLiked: !userLiked
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a recording
router.delete('/recordings/:id', auth, async (req, res) => {
  try {
    const recording = await Recording.findById(req.params.id);
    
    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    // Check if user owns the recording
    if (recording.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this recording' });
    }

    // Delete the audio file
    const filePath = path.join(__dirname, '../../frontend/public', recording.audioUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Recording.findByIdAndDelete(req.params.id);

    res.json({ message: 'Recording deleted successfully' });
  } catch (error) {
    console.error('Error deleting recording:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Increment play count
router.post('/recordings/:id/play', auth, async (req, res) => {
  try {
    const recording = await Recording.findByIdAndUpdate(
      req.params.id,
      { $inc: { playCount: 1 } },
      { new: true }
    );

    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    res.json({ playCount: recording.playCount });
  } catch (error) {
    console.error('Error updating play count:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
