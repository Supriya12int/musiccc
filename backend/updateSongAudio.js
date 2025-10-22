const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');
const axios = require('axios');

// Load environment variables
dotenv.config();

const updateSongAudio = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc');
    console.log('Connected to MongoDB');

    console.log('\n🎵 ADD REAL AUDIO TO YOUR SONGS');
    console.log('===============================\n');

    console.log('You have 3 methods to add real audio to your songs:\n');

    console.log('📝 METHOD 1: Use Artist Dashboard (Recommended)');
    console.log('─'.repeat(50));
    console.log('1. Open your browser: http://localhost:3000');
    console.log('2. Login as artist: admin@musiccc.com / admin123');
    console.log('3. Go to Artist Dashboard → Upload tab');
    console.log('4. For each song, paste YouTube URL and click Download');
    console.log('5. Fill in song details and upload');
    console.log('\n💡 This method automatically downloads and converts audio!\n');

    console.log('🔗 METHOD 2: Update Individual Songs via API');
    console.log('─'.repeat(50));
    console.log('Use the YouTube download endpoint for existing songs:');
    console.log('POST http://localhost:5000/api/download/youtube');
    console.log('Body: { "url": "https://youtube.com/watch?v=..." }');
    console.log('\n💡 This returns a working audio URL you can use!\n');

    console.log('📁 METHOD 3: Manual File Upload');
    console.log('─'.repeat(50));
    console.log('1. Put your MP3 files in backend/public/audio/');
    console.log('2. Update database with local URLs');
    console.log('3. Files will be served at http://localhost:5000/audio/filename.mp3');
    console.log('\n💡 Good for files you already have!\n');

    // Show some popular YouTube URLs for quick testing
    console.log('🎬 SAMPLE YOUTUBE URLS FOR TESTING');
    console.log('─'.repeat(50));
    console.log('Here are some sample URLs you can use to test the download feature:');
    console.log('(Note: Use these for testing, replace with actual song URLs)');
    console.log('• https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    console.log('• https://www.youtube.com/watch?v=kJQP7kiw5Fk');
    console.log('• https://www.youtube.com/watch?v=9bZkp7q19f0');
    console.log('\n💡 Paste any of these in Artist Dashboard → YouTube Download\n');

    // Create audio directory if it doesn't exist
    const fs = require('fs');
    const path = require('path');
    const audioDir = path.join(__dirname, 'public', 'audio');
    
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
      console.log('📁 Created audio directory: ' + audioDir);
    }

    console.log('🚀 QUICK START INSTRUCTIONS');
    console.log('─'.repeat(50));
    console.log('1. Make sure your servers are running:');
    console.log('   Backend: npm start (in backend folder)');
    console.log('   Frontend: npm start (in frontend folder)');
    console.log('2. Open http://localhost:3000');
    console.log('3. Login as admin@musiccc.com / admin123');
    console.log('4. Go to Artist Dashboard');
    console.log('5. Use YouTube Download to add real audio!');

    console.log('\n✨ Your music library is ready for real audio files!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Helper function to update a specific song with new audio URL
const updateSpecificSong = async (songTitle, newAudioUrl) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc');
    
    const song = await Song.findOneAndUpdate(
      { title: songTitle },
      { audioUrl: newAudioUrl },
      { new: true }
    );

    if (song) {
      console.log(`✅ Updated "${songTitle}" with new audio URL`);
    } else {
      console.log(`❌ Song "${songTitle}" not found`);
    }

  } catch (error) {
    console.error('Error updating song:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run the script
if (require.main === module) {
  updateSongAudio();
}

module.exports = { updateSongAudio, updateSpecificSong };