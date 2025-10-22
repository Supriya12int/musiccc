const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');

// Load environment variables
dotenv.config();

const listAllSongs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc');
    console.log('Connected to MongoDB');

    // Get all songs grouped by genre
    const songs = await Song.find().sort({ genre: 1, artist: 1 });
    
    console.log('\n🎵 YOUR MUSIC LIBRARY');
    console.log('====================\n');

    // Group songs by genre
    const songsByGenre = songs.reduce((acc, song) => {
      if (!acc[song.genre]) acc[song.genre] = [];
      acc[song.genre].push(song);
      return acc;
    }, {});

    // Display Telugu songs
    if (songsByGenre.Telugu) {
      console.log('🇮🇳 TELUGU SONGS (' + songsByGenre.Telugu.length + ')');
      console.log('─'.repeat(50));
      songsByGenre.Telugu.forEach((song, index) => {
        console.log(`${(index + 1).toString().padStart(2)}. ${song.title.padEnd(35)} - ${song.artist}`);
      });
      console.log();
    }

    // Display Hindi songs
    if (songsByGenre.Hindi) {
      console.log('🇮🇳 HINDI SONGS (' + songsByGenre.Hindi.length + ')');
      console.log('─'.repeat(50));
      songsByGenre.Hindi.forEach((song, index) => {
        console.log(`${(index + 1).toString().padStart(2)}. ${song.title.padEnd(35)} - ${song.artist}`);
      });
      console.log();
    }

    // Show top played songs
    const topSongs = await Song.find().sort({ playCount: -1 }).limit(5);
    console.log('🔥 TOP 5 MOST PLAYED');
    console.log('─'.repeat(50));
    topSongs.forEach((song, index) => {
      console.log(`${index + 1}. ${song.title} - ${song.artist} (${song.playCount.toLocaleString()} plays)`);
    });

    console.log('\n📱 Your music app is ready with all your favorite songs!');
    console.log('🎧 Login to your app and start listening!');

  } catch (error) {
    console.error('Error listing songs:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run the script
listAllSongs();