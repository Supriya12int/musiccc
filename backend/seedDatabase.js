const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Sample songs data
const sampleSongs = [
  {
    title: "Midnight Dreams",
    artist: "Luna Rodriguez",
    album: "Nocturnal Vibes",
    genre: "Pop",
    duration: 240,
    releaseYear: 2023,
    audioUrl: "https://example.com/songs/midnight-dreams.mp3",
    coverImage: "https://picsum.photos/300/300?random=1",
    lyrics: "Verse 1: In the midnight hour, when the world is still...",
    tags: ["dreamy", "chill", "pop"]
  },
  {
    title: "Electric Pulse",
    artist: "Neon Nights",
    album: "Synthwave Collection",
    genre: "Electronic",
    duration: 195,
    releaseYear: 2024,
    audioUrl: "https://example.com/songs/electric-pulse.mp3",
    coverImage: "https://picsum.photos/300/300?random=2",
    lyrics: "The city lights are calling out my name...",
    tags: ["electronic", "upbeat", "synthwave"]
  },
  {
    title: "Coffee Shop Blues",
    artist: "Jazz Corner",
    album: "Urban Melodies",
    genre: "Jazz",
    duration: 320,
    releaseYear: 2023,
    audioUrl: "https://example.com/songs/coffee-shop-blues.mp3",
    coverImage: "https://picsum.photos/300/300?random=3",
    lyrics: "Sitting in this corner booth, watching rain...",
    tags: ["jazz", "blues", "relaxing"]
  },
  {
    title: "Mountain High",
    artist: "Acoustic Souls",
    album: "Nature's Call",
    genre: "Folk",
    duration: 280,
    releaseYear: 2024,
    audioUrl: "https://example.com/songs/mountain-high.mp3",
    coverImage: "https://picsum.photos/300/300?random=4",
    lyrics: "Up on the mountain high, where eagles fly...",
    tags: ["folk", "acoustic", "nature"]
  },
  {
    title: "Neon Lights",
    artist: "City Runners",
    album: "Urban Rush",
    genre: "Rock",
    duration: 210,
    releaseYear: 2023,
    audioUrl: "https://example.com/songs/neon-lights.mp3",
    coverImage: "https://picsum.photos/300/300?random=5",
    lyrics: "Running through the neon lights tonight...",
    tags: ["rock", "energetic", "urban"]
  },
  {
    title: "Ocean Waves",
    artist: "Serenity Sound",
    album: "Peaceful Moments",
    genre: "Ambient",
    duration: 360,
    releaseYear: 2024,
    audioUrl: "https://example.com/songs/ocean-waves.mp3",
    coverImage: "https://picsum.photos/300/300?random=6",
    lyrics: "Listen to the ocean waves, feel the peace...",
    tags: ["ambient", "peaceful", "meditation"]
  },
  {
    title: "Dancing Queen",
    artist: "Disco Revolution",
    album: "Retro Hits",
    genre: "Disco",
    duration: 225,
    releaseYear: 2023,
    audioUrl: "https://example.com/songs/dancing-queen.mp3",
    coverImage: "https://picsum.photos/300/300?random=7",
    lyrics: "You are the dancing queen, young and sweet...",
    tags: ["disco", "dance", "retro"]
  },
  {
    title: "Digital Dreams",
    artist: "Cyber Symphony",
    album: "Future Sounds",
    genre: "Electronic",
    duration: 255,
    releaseYear: 2024,
    audioUrl: "https://example.com/songs/digital-dreams.mp3",
    coverImage: "https://picsum.photos/300/300?random=8",
    lyrics: "In the digital world where dreams come true...",
    tags: ["electronic", "futuristic", "digital"]
  },
  {
    title: "Sunset Boulevard",
    artist: "California Vibes",
    album: "West Coast",
    genre: "Pop",
    duration: 200,
    releaseYear: 2023,
    audioUrl: "https://example.com/songs/sunset-boulevard.mp3",
    coverImage: "https://picsum.photos/300/300?random=9",
    lyrics: "Driving down the sunset boulevard...",
    tags: ["pop", "california", "sunset"]
  },
  {
    title: "Thunder Storm",
    artist: "Heavy Metal Lords",
    album: "Lightning Strikes",
    genre: "Metal",
    duration: 290,
    releaseYear: 2024,
    audioUrl: "https://example.com/songs/thunder-storm.mp3",
    coverImage: "https://picsum.photos/300/300?random=10",
    lyrics: "When the thunder roars and lightning strikes...",
    tags: ["metal", "heavy", "intense"]
  },
  {
    title: "Smooth Jazz Night",
    artist: "Midnight Saxophone",
    album: "Late Night Sessions",
    genre: "Jazz",
    duration: 310,
    releaseYear: 2023,
    audioUrl: "https://example.com/songs/smooth-jazz-night.mp3",
    coverImage: "https://picsum.photos/300/300?random=11",
    lyrics: "The saxophone plays through the night...",
    tags: ["jazz", "smooth", "saxophone"]
  },
  {
    title: "Country Roads",
    artist: "Southern Harmony",
    album: "Home Sweet Home",
    genre: "Country",
    duration: 270,
    releaseYear: 2024,
    audioUrl: "https://example.com/songs/country-roads.mp3",
    coverImage: "https://picsum.photos/300/300?random=12",
    lyrics: "Take me home, country roads...",
    tags: ["country", "home", "roads"]
  },
  {
    title: "Starlight Serenade",
    artist: "Romantic Strings",
    album: "Love Songs",
    genre: "Classical",
    duration: 340,
    releaseYear: 2023,
    audioUrl: "https://example.com/songs/starlight-serenade.mp3",
    coverImage: "https://picsum.photos/300/300?random=13",
    lyrics: "Under the starlight, a serenade for you...",
    tags: ["classical", "romantic", "strings"]
  },
  {
    title: "Hip Hop Revolution",
    artist: "Urban Poets",
    album: "Street Wisdom",
    genre: "Hip Hop",
    duration: 185,
    releaseYear: 2024,
    audioUrl: "https://example.com/songs/hip-hop-revolution.mp3",
    coverImage: "https://picsum.photos/300/300?random=14",
    lyrics: "Listen to the revolution in the streets...",
    tags: ["hip hop", "urban", "revolution"]
  },
  {
    title: "Reggae Sunshine",
    artist: "Island Vibes",
    album: "Tropical Dreams",
    genre: "Reggae",
    duration: 245,
    releaseYear: 2023,
    audioUrl: "https://example.com/songs/reggae-sunshine.mp3",
    coverImage: "https://picsum.photos/300/300?random=15",
    lyrics: "Feel the sunshine on your face...",
    tags: ["reggae", "sunshine", "tropical"]
  },
  {
    title: "Techno Beat",
    artist: "Club Masters",
    album: "Dance Floor",
    genre: "Electronic",
    duration: 220,
    releaseYear: 2024,
    audioUrl: "https://example.com/songs/techno-beat.mp3",
    coverImage: "https://picsum.photos/300/300?random=16",
    lyrics: "Feel the beat, move your feet...",
    tags: ["techno", "dance", "club"]
  },
  {
    title: "Acoustic Dreams",
    artist: "Gentle Strings",
    album: "Unplugged Sessions",
    genre: "Acoustic",
    duration: 260,
    releaseYear: 2023,
    audioUrl: "https://example.com/songs/acoustic-dreams.mp3",
    coverImage: "https://picsum.photos/300/300?random=17",
    lyrics: "Just me and my guitar, dreaming...",
    tags: ["acoustic", "gentle", "unplugged"]
  },
  {
    title: "Funky Town",
    artist: "Groove Machine",
    album: "Funk Collection",
    genre: "Funk",
    duration: 235,
    releaseYear: 2024,
    audioUrl: "https://example.com/songs/funky-town.mp3",
    coverImage: "https://picsum.photos/300/300?random=18",
    lyrics: "Welcome to funky town where the groove never stops...",
    tags: ["funk", "groove", "town"]
  },
  {
    title: "Blues Highway",
    artist: "Mississippi Delta",
    album: "Delta Blues",
    genre: "Blues",
    duration: 295,
    releaseYear: 2023,
    audioUrl: "https://example.com/songs/blues-highway.mp3",
    coverImage: "https://picsum.photos/300/300?random=19",
    lyrics: "Driving down the blues highway...",
    tags: ["blues", "highway", "delta"]
  },
  {
    title: "Indie Spirit",
    artist: "Alternative Youth",
    album: "Independent",
    genre: "Indie",
    duration: 205,
    releaseYear: 2024,
    audioUrl: "https://example.com/songs/indie-spirit.mp3",
    coverImage: "https://picsum.photos/300/300?random=20",
    lyrics: "Free spirit, indie heart...",
    tags: ["indie", "alternative", "spirit"]
  }
  ,
  // User requested songs
  {
    title: "Powerhouse",
    artist: "Various Artists",
    album: "Powerhouse Singles",
    genre: "Popular",
    duration: 215,
    releaseYear: 2022,
    audioUrl: "/audio/popular/powerhouse.mp3",
    coverImage: "https://picsum.photos/300/300?random=21",
    lyrics: "",
    tags: ["powerhouse", "energetic"],
    playCount: 9000
  },
  {
    title: "Kathyayini",
    artist: "Various Artists",
    album: "Kathyayini Collection",
    genre: "Popular",
    duration: 198,
    releaseYear: 2021,
    audioUrl: "/audio/popular/kathyayini.mp3",
    coverImage: "https://picsum.photos/300/300?random=22",
    lyrics: "",
    tags: ["kathyayini", "hit"],
    playCount: 8500
  },
  {
    title: "Kal Ho Naa Ho",
    artist: "Various Artists",
    album: "Bollywood Classics",
    genre: "Romance",
    duration: 315,
    releaseYear: 2003,
    audioUrl: "/audio/romance/kal-ho-naa-ho.mp3",
    coverImage: "https://picsum.photos/300/300?random=23",
    lyrics: "",
    tags: ["romance", "bollywood"],
    playCount: 5000
  },
  {
    title: "Tera Hone Laga Hoon",
    artist: "Various Artists",
    album: "Romantic Hits",
    genre: "Romance",
    duration: 260,
    releaseYear: 2004,
    audioUrl: "/audio/romance/tera-hone-laga-hoon.mp3",
    coverImage: "https://picsum.photos/300/300?random=24",
    lyrics: "",
    tags: ["romance", "slow"],
    playCount: 4800
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc');
    console.log('Connected to MongoDB');

    // Clear existing songs (optional)
    await Song.deleteMany({});
    console.log('Cleared existing songs');

    // Create admin user if doesn't exist
    let adminUser = await User.findOne({ email: 'admin@musiccc.com' });
    if (!adminUser) {
      adminUser = new User({
        username: 'admin',
        email: 'admin@musiccc.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      });
      await adminUser.save();
      console.log('Created admin user');
    }

    // Add uploadedBy field to each song
    // Preserve any explicit playCount set in the sample data (so popular songs remain popular)
    const songsWithUploader = sampleSongs.map(song => ({
      ...song,
      uploadedBy: adminUser._id,
      playCount: typeof song.playCount !== 'undefined' ? song.playCount : Math.floor(Math.random() * 10000) // Random play counts when not provided
    }));

    // Insert sample songs
    const insertedSongs = await Song.insertMany(songsWithUploader);
    console.log(`✅ Successfully added ${insertedSongs.length} songs to the database`);

    // Display summary
    console.log('\n📊 Database Summary:');
    console.log(`Songs: ${await Song.countDocuments()}`);
    console.log(`Users: ${await User.countDocuments()}`);
    
    console.log('\n🎵 Sample Artists Added:');
    const artists = [...new Set(sampleSongs.map(song => song.artist))];
    artists.forEach(artist => console.log(`- ${artist}`));

    console.log('\n🎼 Sample Genres:');
    const genres = [...new Set(sampleSongs.map(song => song.genre))];
    genres.forEach(genre => console.log(`- ${genre}`));

    console.log('\n🔐 Admin Login:');
    console.log('Email: admin@musiccc.com');
    console.log('Password: admin123');

    console.log('\n✨ Database seeding completed successfully!');
    console.log('You can now login to your app and see the songs.');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeding script
seedDatabase();