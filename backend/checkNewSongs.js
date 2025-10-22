const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');

dotenv.config();

const checkNewSongs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc');
    console.log('Connected to MongoDB');

    // Find all Telugu songs
    const teluguSongs = await Song.find({ genre: 'Telugu' });
    console.log('\n🎵 Telugu Songs in Database:');
    teluguSongs.forEach(song => {
      console.log(`- "${song.title}" by ${song.artist}`);
      console.log(`  Audio URL: ${song.audioUrl}`);
      console.log(`  Audio File: ${song.audioFile || 'Not set'}`);
      console.log('');
    });

    // Check all songs
    const allSongs = await Song.find({});
    console.log(`📊 Total songs: ${allSongs.length}`);
    
    console.log('\n📋 All Songs:');
    allSongs.forEach(song => {
      console.log(`- "${song.title}" (${song.genre}) - ${song.audioUrl}`);
    });

  } catch (error) {
    console.error('Error checking songs:', error);
  } finally {
    await mongoose.connection.close();
  }
};

checkNewSongs();