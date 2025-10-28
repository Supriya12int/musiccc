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

// Get events for followed artists with enhanced filtering
router.get('/following', auth, async (req, res) => {
  try {
    const { timeframe = 'upcoming', eventType } = req.query;
    
    // Get user's followed artists
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const artistNames = user.followedArtists.map(artist => artist.name);
    
    if (artistNames.length === 0) {
      return res.json({ events: [] });
    }
    
    // Build filter based on timeframe
    let dateFilter = {};
    const now = new Date();
    
    switch (timeframe) {
      case 'today':
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        dateFilter = { 
          date: { 
            $gte: now, 
            $lte: endOfDay 
          }
        };
        break;
      case 'this_week':
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + 7);
        dateFilter = { 
          date: { 
            $gte: now, 
            $lte: endOfWeek 
          }
        };
        break;
      case 'this_month':
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        dateFilter = { 
          date: { 
            $gte: now, 
            $lte: endOfMonth 
          }
        };
        break;
      case 'upcoming':
      default:
        dateFilter = { date: { $gte: now } };
        break;
    }
    
    // Build complete filter
    const filter = {
      artist: { $in: artistNames },
      status: 'upcoming',
      ...dateFilter
    };
    
    if (eventType) {
      filter.isOnline = eventType === 'online';
    }
    
    // Get events for followed artists
    const events = await Event.find(filter)
      .sort({ date: 1 })
      .limit(50);
    
    // Group events by type
    const groupedEvents = {
      online: events.filter(event => event.isOnline),
      offline: events.filter(event => !event.isOnline),
      all: events
    };
    
    res.json({ 
      events: groupedEvents,
      followedArtists: artistNames,
      totalEvents: events.length
    });
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
    const userId = req.user._id;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user already marked interest
    const existingInterest = event.attendees.find(
      attendee => attendee.user.toString() === userId.toString()
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
    const userId = req.user._id;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Remove user from attendees
    event.attendees = event.attendees.filter(
      attendee => attendee.user.toString() !== userId.toString()
    );
    await event.save();
    
    res.json({ message: 'Interest removed', attendeeCount: event.attendees.length });
  } catch (error) {
    console.error('Error removing interest:', error);
    res.status(500).json({ error: 'Failed to remove interest' });
  }
});

// Create a new event (for testing/admin purposes)
router.post('/create', auth, async (req, res) => {
  try {
    const {
      title,
      artist,
      description,
      eventType,
      date,
      endDate,
      venue,
      isOnline,
      onlineLink,
      ticketPrice,
      ticketUrl,
      imageUrl,
      capacity,
      tags
    } = req.body;

    // Validate required fields
    if (!title || !artist || !description || !eventType || !date) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, artist, description, eventType, date' 
      });
    }

    // Create event
    const event = new Event({
      title,
      artist,
      description,
      eventType,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      venue,
      isOnline: isOnline || false,
      onlineLink,
      ticketPrice,
      ticketUrl,
      imageUrl,
      capacity,
      tags: tags || [],
      status: 'upcoming'
    });

    await event.save();
    res.status(201).json({ 
      message: 'Event created successfully', 
      event 
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
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