const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  album: {
    type: String,
    trim: true
  },
  genre: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  releaseYear: {
    type: Number
  },
  audioUrl: {
    type: String,
    required: true
  },
  // Spotify integration fields
  spotifyId: {
    type: String,
    sparse: true,
    unique: true
  },
  spotifyUri: {
    type: String
  },
  previewUrl: {
    type: String
  },
  spotifyUrl: {
    type: String
  },
  popularity: {
    type: Number,
    min: 0,
    max: 100
  },
  albumImageUrl: {
    type: String
  },
  coverImage: {
    type: String,
    default: ''
  },
  lyrics: {
    type: String,
    default: ''
  },
  playCount: {
    type: Number,
    default: 0
  },
  tags: [String],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for search functionality
songSchema.index({ title: 'text', artist: 'text', album: 'text' });

module.exports = mongoose.model('Song', songSchema);