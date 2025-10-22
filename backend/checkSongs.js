const mongoose = require('mongoose');
const Song = require('./models/Song');
const dotenv = require('dotenv');

dotenv.config();

const checkSongs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc');
    console.log('Connected to MongoDB');
    
    const songs = await Song.find();
    console.log('\n📀 All songs in database:\n');
    
    songs.forEach((song, index) => {
      console.log(`${index + 1}. ${song.title} by ${song.artist}`);
      console.log(`   Audio URL: ${song.audioUrl}`);
      console.log(`   Genre: ${song.genre}`);
      console.log(`   Duration: ${song.duration}s`);
      console.log('');
    });
    
    console.log(`Total songs: ${songs.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

checkSongs();