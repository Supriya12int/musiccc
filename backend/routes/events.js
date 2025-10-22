const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get all events
router.get('/', async (req, res) => {
  try {
    const { type, artist, status, limit = 20, page = 1 } = req.query;
    
    const filter = {};
    if (type) filter.eventType = type;
    if (artist) filter.artist = { $regex: artist, $options: 'i' };
    if (status) filter.status = status;
    
    const events = await Event.find(filter)
      .sort({ date: 1, isPopular: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Event.countDocuments(filter);
    
    res.json({
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get events for followed artists
router.get('/following', auth, async (req, res) => {
  try {
    // Get user's followed artists
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const artistNames = user.followedArtists.map(artist => artist.name);
    
    if (artistNames.length === 0) {
      return res.json({ events: [] });
    }
    
    // Get events for followed artists
    const events = await Event.find({
      artist: { $in: artistNames },
      status: 'upcoming',
      date: { $gte: new Date() }
    })
    .sort({ date: 1 })
    .limit(20);
    
    res.json({ events });
  } catch (error) {
    console.error('Error fetching events for followed artists:', error);
    res.status(500).json({ error: 'Failed to fetch events for followed artists' });
  }
});

// Get upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const events = await Event.find({
      status: 'upcoming',
      date: { $gte: new Date() }
    })
    .sort({ date: 1, isPopular: -1 })
    .limit(10);
    
    res.json({ events });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
});

// Mark interest in event
router.post('/:eventId/interested', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user already marked interest
    const existingInterest = event.attendees.find(
      attendee => attendee.user.toString() === userId
    );
    
    if (existingInterest) {
      return res.status(400).json({ error: 'Already marked as interested' });
    }
    
    // Add user to attendees
    event.attendees.push({ user: userId });
    await event.save();
    
    res.json({ message: 'Marked as interested', attendeeCount: event.attendees.length });
  } catch (error) {
    console.error('Error marking interest:', error);
    res.status(500).json({ error: 'Failed to mark interest' });
  }
});

// Remove interest in event
router.delete('/:eventId/interested', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Remove user from attendees
    event.attendees = event.attendees.filter(
      attendee => attendee.user.toString() !== userId
    );
    await event.save();
    
    res.json({ message: 'Interest removed', attendeeCount: event.attendees.length });
  } catch (error) {
    console.error('Error removing interest:', error);
    res.status(500).json({ error: 'Failed to remove interest' });
  }
});

// Get event by ID
router.get('/:eventId', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ event });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

module.exports = router;