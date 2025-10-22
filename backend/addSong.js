const mongoose = require('mongoose');
const readline = require('readline');
const dotenv = require('dotenv');
const Song = require('./models/Song');
const User = require('./models/User');

// Load environment variables
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const addSongManually = async () => {
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

    console.log('\n🎵 Add a New Song to Your Music Database');
    console.log('========================================');

    const title = await askQuestion('Song Title: ');
    const artist = await askQuestion('Artist Name: ');
    const album = await askQuestion('Album (optional): ');
    const genre = await askQuestion('Genre: ');
    const duration = await askQuestion('Duration in seconds: ');
    const releaseYear = await askQuestion('Release Year: ');
    const audioUrl = await askQuestion('Audio URL (or press enter for placeholder): ');
    const coverImage = await askQuestion('Cover Image URL (or press enter for random): ');
    const lyrics = await askQuestion('Lyrics (optional): ');

    const newSong = new Song({
      title: title || 'Untitled',
      artist: artist || 'Unknown Artist',
      album: album || '',
      genre: genre || 'Unknown',
      duration: parseInt(duration) || 180,
      releaseYear: parseInt(releaseYear) || new Date().getFullYear(),
      audioUrl: audioUrl || `https://example.com/songs/${title.toLowerCase().replace(/\s+/g, '-')}.mp3`,
      coverImage: coverImage || `https://picsum.photos/300/300?random=${Date.now()}`,
      lyrics: lyrics || '',
      uploadedBy: adminUser._id,
      playCount: 0,
      tags: [genre.toLowerCase()]
    });

    await newSong.save();
    console.log('\n✅ Song added successfully!');
    console.log(`Title: ${newSong.title}`);
    console.log(`Artist: ${newSong.artist}`);
    console.log(`Genre: ${newSong.genre}`);
    
  } catch (error) {
    console.error('Error adding song:', error);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the script
addSongManually();