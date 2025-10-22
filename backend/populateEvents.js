const mongoose = require('mongoose');
const Event = require('./models/Event');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/musiccc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Sample events data
const sampleEvents = [
  {
    title: "Arijit Singh Live in Concert",
    artist: "Arijit Singh",
    description: "Experience the magical voice of Arijit Singh live in an unforgettable concert featuring his greatest hits including Apna Bana Le, Tum Hi Ho, and many more.",
    eventType: "concert",
    date: new Date('2025-11-15T19:00:00Z'),
    venue: {
      name: "Jawaharlal Nehru Stadium",
      address: "Lodhi Road",
      city: "New Delhi",
      country: "India"
    },
    isOnline: false,
    ticketPrice: { min: 1500, max: 8000, currency: "INR" },
    ticketUrl: "https://example.com/tickets/arijit-singh",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop",
    capacity: 50000,
    tags: ["bollywood", "romantic", "live"],
    isPopular: true
  },
  {
    title: "Sid Sriram Virtual Concert",
    artist: "Sid Sriram",
    description: "Join Sid Sriram for an intimate virtual concert featuring his soulful Telugu and Tamil hits, including Samajavaragamana.",
    eventType: "virtual-concert",
    date: new Date('2025-10-28T20:00:00Z'),
    venue: {},
    isOnline: true,
    onlineLink: "https://example.com/virtual/sid-sriram",
    ticketPrice: { min: 299, max: 999, currency: "INR" },
    ticketUrl: "https://example.com/tickets/sid-sriram-virtual",
    imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&h=300&fit=crop",
    capacity: 10000,
    tags: ["telugu", "tamil", "soul", "virtual"],
    isPopular: true
  },
  {
    title: "Shreya Ghoshal Album Launch",
    artist: "Shreya Ghoshal",
    description: "Celebrate the launch of Shreya Ghoshal's new album with an exclusive event featuring live performances and meet & greet sessions.",
    eventType: "album-release",
    date: new Date('2025-11-02T18:00:00Z'),
    venue: {
      name: "Phoenix Marketcity",
      address: "LBS Marg, Kurla",
      city: "Mumbai",
      country: "India"
    },
    isOnline: false,
    ticketPrice: { min: 800, max: 3000, currency: "INR" },
    ticketUrl: "https://example.com/tickets/shreya-album",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&h=300&fit=crop",
    capacity: 2000,
    tags: ["bollywood", "classical", "album-launch"],
    isPopular: true
  },
  {
    title: "Music Festival Feat. Armaan Malik",
    artist: "Armaan Malik",
    description: "A grand music festival featuring Armaan Malik along with other popular artists. Experience a night of non-stop entertainment.",
    eventType: "festival",
    date: new Date('2025-12-10T17:00:00Z'),
    endDate: new Date('2025-12-11T23:00:00Z'),
    venue: {
      name: "Mahalaxmi Race Course",
      address: "Mahalaxmi",
      city: "Mumbai",
      country: "India"
    },
    isOnline: false,
    ticketPrice: { min: 2000, max: 15000, currency: "INR" },
    ticketUrl: "https://example.com/tickets/music-festival",
    imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500&h=300&fit=crop",
    capacity: 25000,
    tags: ["festival", "bollywood", "multi-artist"],
    isPopular: true
  },
  {
    title: "Jubin Nautiyal Meet & Greet",
    artist: "Jubin Nautiyal",
    description: "An exclusive meet and greet session with Jubin Nautiyal. Limited seats available for an intimate experience with the star.",
    eventType: "meet-greet",
    date: new Date('2025-10-25T16:00:00Z'),
    venue: {
      name: "Hotel Taj Palace",
      address: "Sardar Patel Marg",
      city: "New Delhi",
      country: "India"
    },
    isOnline: false,
    ticketPrice: { min: 5000, max: 10000, currency: "INR" },
    ticketUrl: "https://example.com/tickets/jubin-meet",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop",
    capacity: 100,
    tags: ["meet-greet", "exclusive", "limited"],
    isPopular: false
  },
  {
    title: "Atif Aslam Live Online",
    artist: "Atif Aslam",
    description: "Atif Aslam brings his magical voice to your homes with an exclusive online live performance featuring his greatest hits.",
    eventType: "online-live",
    date: new Date('2025-11-20T21:00:00Z'),
    venue: {},
    isOnline: true,
    onlineLink: "https://example.com/live/atif-aslam",
    ticketPrice: { min: 199, max: 599, currency: "INR" },
    ticketUrl: "https://example.com/tickets/atif-online",
    imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&h=300&fit=crop",
    capacity: 50000,
    tags: ["online", "live", "rock", "pop"],
    isPopular: true
  },
  {
    title: "Anurag Kulkarni Telugu Concert",
    artist: "Anurag Kulkarni",
    description: "Celebrate Telugu music with Anurag Kulkarni live in concert, featuring Ramuloo Ramulaa and other popular Telugu hits.",
    eventType: "concert",
    date: new Date('2025-11-30T19:30:00Z'),
    venue: {
      name: "HITEX Exhibition Centre",
      address: "Madhapur",
      city: "Hyderabad",
      country: "India"
    },
    isOnline: false,
    ticketPrice: { min: 1000, max: 5000, currency: "INR" },
    ticketUrl: "https://example.com/tickets/anurag-telugu",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&h=300&fit=crop",
    capacity: 8000,
    tags: ["telugu", "folk", "regional"],
    isPopular: false
  }
];

async function populateEvents() {
  try {
    console.log('🎪 Populating events database...\n');

    // Clear existing events
    await Event.deleteMany({});
    console.log('🗑️  Cleared existing events');

    // Add sample events
    for (const eventData of sampleEvents) {
      const event = new Event(eventData);
      await event.save();
      
      const dateStr = eventData.date.toLocaleDateString('en-IN');
      const eventTypeIcon = {
        'concert': '🎤',
        'virtual-concert': '💻',
        'album-release': '💿',
        'festival': '🎪',
        'meet-greet': '🤝',
        'online-live': '📺'
      };
      
      console.log(`✅ Added: ${eventTypeIcon[eventData.eventType]} ${eventData.title}`);
      console.log(`   📅 Date: ${dateStr}`);
      console.log(`   🎤 Artist: ${eventData.artist}`);
      console.log(`   📍 ${eventData.isOnline ? 'Online Event' : eventData.venue.city}`);
      console.log(`   💰 ₹${eventData.ticketPrice.min} - ₹${eventData.ticketPrice.max}`);
      console.log('');
    }

    // Display final events list
    const allEvents = await Event.find({}).sort({ date: 1 });
    
    console.log('🎵 EVENTS DATABASE');
    console.log('═'.repeat(60));
    
    allEvents.forEach((event, index) => {
      const eventTypeIcon = {
        'concert': '🎤',
        'virtual-concert': '💻',
        'album-release': '💿',
        'festival': '🎪',
        'meet-greet': '🤝',
        'online-live': '📺'
      };
      
      console.log(`\n${index + 1}. ${eventTypeIcon[event.eventType]} ${event.title}`);
      console.log(`   🎤 Artist: ${event.artist}`);
      console.log(`   📅 Date: ${event.date.toLocaleDateString('en-IN')}`);
      console.log(`   📍 Location: ${event.isOnline ? 'Online' : event.venue.city}`);
      console.log(`   🎫 Price: ₹${event.ticketPrice.min} - ₹${event.ticketPrice.max}`);
      console.log(`   👥 Capacity: ${event.capacity.toLocaleString()}`);
    });

    console.log(`\n📊 Total events: ${allEvents.length}`);
    console.log('✅ Events database populated successfully!');
    console.log('🎯 Users will now get notifications about their favorite artists\' events!');

  } catch (error) {
    console.error('❌ Error populating events:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📡 Database connection closed.');
  }
}

populateEvents();