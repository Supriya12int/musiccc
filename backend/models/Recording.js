const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  playCount: {
    type: Number,
    default: 0
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
recordingSchema.index({ user: 1, createdAt: -1 });
recordingSchema.index({ song: 1 });
recordingSchema.index({ isPublic: 1, createdAt: -1 });

module.exports = mongoose.model('Recording', recordingSchema);
