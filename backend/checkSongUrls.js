const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');

dotenv.config();

const checkSongs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc');
    console.log('🎵 Songs in database:');
    
    const songs = await Song.find();
    songs.forEach((song, i) => {
      console.log(`${i+1}. "${song.title}" by ${song.artist}`);
      console.log(`   Audio URL: ${song.audioUrl}`);
      console.log(`   Genre: ${song.genre}`);
      console.log('');
    });
    
    console.log(`Total songs: ${songs.length}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
};

checkSongs();