const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');

dotenv.config();

const fixTeluguSongUrls = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc');
    console.log('Connected to MongoDB');

    // Update the new Telugu songs to use relative URLs like the existing songs
    await Song.updateOne(
      { title: 'Kathyayini' },
      { audioUrl: '/audio/Khathyayini.mp3' }
    );

    await Song.updateOne(
      { title: 'Mallika Gandha' },
      { audioUrl: '/audio/mallika-gandha.mp3' }
    );

    console.log('✅ Updated Telugu song URLs to match existing format');

    // Verify the changes
    const teluguSongs = await Song.find({ 
      title: { $in: ['Kathyayini', 'Mallika Gandha'] }
    });
    
    console.log('\n🎵 Updated Telugu Songs:');
    teluguSongs.forEach(song => {
      console.log(`- "${song.title}": ${song.audioUrl}`);
    });

  } catch (error) {
    console.error('Error fixing URLs:', error);
  } finally {
    await mongoose.connection.close();
  }
};

fixTeluguSongUrls();