const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
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
  description: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    enum: ['concert', 'album-release', 'online-live', 'festival', 'meet-greet', 'virtual-concert'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  venue: {
    name: String,
    address: String,
    city: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  onlineLink: {
    type: String
  },
  ticketPrice: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'INR' }
  },
  ticketUrl: {
    type: String
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&h=300&fit=crop'
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  capacity: {
    type: Number
  },
  attendees: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    interestedAt: { type: Date, default: Date.now }
  }],
  tags: [String],
  isPopular: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
eventSchema.index({ artist: 1, date: 1 });
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ eventType: 1 });

module.exports = mongoose.model('Event', eventSchema);