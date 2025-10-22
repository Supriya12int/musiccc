const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');
const User = require('./models/User');

dotenv.config();

// New Telugu (Tollywood) songs to add
const newTeluguSongs = [
  {
    title: "Kathyayini",
    artist: "Various Artists",
    album: "Single",
    genre: "Telugu",
    duration: 210,
    releaseYear: 2023,
    audioFile: "Khathyayini.mp3",
    coverImage: "https://picsum.photos/300/300?random=9",
    lyrics: "",
    tags: ["telugu", "tollywood", "kathyayini", "melodious"]
  },
  {
    title: "Mallika Gandha", 
    artist: "Various Artists",
    album: "Single",
    genre: "Telugu",
    duration: 195,
    releaseYear: 2023,
    audioFile: "mallika-gandha.mp3",
    coverImage: "https://picsum.photos/300/300?random=10",
    lyrics: "",
    tags: ["telugu", "tollywood", "mallika", "gandha", "classical"]
  }
];

const addMoreSongs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc');
    console.log('Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found. Please run seedDatabase.js first.');
      return;
    }

    // Add uploadedBy field to each song and construct audioUrl
    const songsWithUploader = newTeluguSongs.map(song => ({
      ...song,
      audioUrl: `http://localhost:5000/audio/${song.audioFile}`,
      uploadedBy: adminUser._id,
      playCount: Math.floor(Math.random() * 100)
    }));

    // Insert Telugu songs
    const insertedSongs = await Song.insertMany(songsWithUploader);
    console.log(`✅ Successfully added ${insertedSongs.length} Telugu songs to the database`);

    // Display current totals
    const totalSongs = await Song.countDocuments();
    console.log(`📊 Total songs in database: ${totalSongs}`);

    console.log('\n🎵 New Telugu Songs Added:');
    newTeluguSongs.forEach(song => {
      console.log(`- "${song.title}" by ${song.artist} (${song.genre})`);
    });

  } catch (error) {
    console.error('Error adding songs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the script
addMoreSongs();