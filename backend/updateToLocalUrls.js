const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');

dotenv.config();

const updateAudioUrls = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc');
    console.log('Connected to MongoDB');

    const songs = await Song.find({});
    console.log(`Found ${songs.length} songs to update\n`);

    for (let song of songs) {
      // Extract filename from current URL
      const filename = song.audioUrl.split('/').pop();
      
      // Update to local serving URL
      const newAudioUrl = `/audio/${filename}`;
      
      await Song.findByIdAndUpdate(song._id, { audioUrl: newAudioUrl });
      
      console.log(`✓ Updated: ${song.title} - ${song.artist}`);
      console.log(`  Old URL: ${song.audioUrl}`);
      console.log(`  New URL: ${newAudioUrl}`);
      console.log(`  File needed: backend/public/audio/${filename}\n`);
    }

    console.log('🎉 All songs updated for local storage!');
    console.log('\n📁 Download these audio files and put them in backend/public/audio/:');
    
    const updatedSongs = await Song.find({});
    updatedSongs.forEach((song, index) => {
      const filename = song.audioUrl.replace('/audio/', '');
      console.log(`${index + 1}. ${filename} (${song.title} - ${song.artist})`);
    });

  } catch (error) {
    console.error('Error updating URLs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

updateAudioUrls();