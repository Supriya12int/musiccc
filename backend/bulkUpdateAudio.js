const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');
const axios = require('axios');

// Load environment variables
dotenv.config();

const bulkUpdateAudioUrls = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc');
    console.log('Connected to MongoDB');

    console.log('\n🔄 BULK UPDATE SONG AUDIO URLS');
    console.log('===============================\n');

    // Example: Update popular songs with sample working audio URLs
    // You can replace these with actual YouTube-downloaded URLs
    const songsToUpdate = [
      {
        title: "Kesariya",
        // Replace this with actual downloaded audio URL from YouTube
        newAudioUrl: "http://localhost:5000/audio/kesariya.mp3"
      },
      {
        title: "Butta Bomma", 
        newAudioUrl: "http://localhost:5000/audio/butta-bomma.mp3"
      },
      {
        title: "Tum Hi Ho",
        newAudioUrl: "http://localhost:5000/audio/tum-hi-ho.mp3"
      },
      {
        title: "Srivalli",
        newAudioUrl: "http://localhost:5000/audio/srivalli.mp3"
      },
      {
        title: "Apna Bana Le",
        newAudioUrl: "http://localhost:5000/audio/apna-bana-le.mp3"
      }
    ];

    console.log('📝 Updating sample songs with local audio URLs...\n');

    for (const songUpdate of songsToUpdate) {
      try {
        const song = await Song.findOneAndUpdate(
          { title: songUpdate.title },
          { audioUrl: songUpdate.newAudioUrl },
          { new: true }
        );

        if (song) {
          console.log(`✅ Updated: "${song.title}" by ${song.artist}`);
          console.log(`   New URL: ${songUpdate.newAudioUrl}`);
        } else {
          console.log(`❌ Not found: "${songUpdate.title}"`);
        }
      } catch (error) {
        console.log(`❌ Error updating "${songUpdate.title}": ${error.message}`);
      }
    }

    console.log('\n📊 SUMMARY');
    console.log('─'.repeat(50));
    console.log('✅ Updated audio URLs for sample songs');
    console.log('🎵 Songs now point to local audio files');
    console.log('📁 Place actual MP3 files in: backend/public/audio/');
    
    console.log('\n📂 REQUIRED AUDIO FILES');
    console.log('─'.repeat(50));
    console.log('To make these songs playable, add these MP3 files to backend/public/audio/:');
    songsToUpdate.forEach(song => {
      const filename = song.newAudioUrl.split('/').pop();
      console.log(`• ${filename}`);
    });

    console.log('\n🚀 NEXT STEPS');
    console.log('─'.repeat(50));
    console.log('1. Use Artist Dashboard → YouTube Download to get real audio files');
    console.log('2. Or manually place MP3 files in backend/public/audio/');
    console.log('3. Test playback in user dashboard');
    
    console.log('\n💡 TIP: Use the YouTube download feature in Artist Dashboard');
    console.log('   It automatically downloads, converts, and saves audio files!');

  } catch (error) {
    console.error('Error updating songs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Function to get all songs with placeholder URLs
const getPlaceholderSongs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc');
    
    const placeholderSongs = await Song.find({ 
      audioUrl: { $regex: /^https:\/\/example\.com/ } 
    });

    console.log('\n📋 SONGS WITH PLACEHOLDER AUDIO URLS');
    console.log('====================================\n');
    
    placeholderSongs.forEach((song, index) => {
      console.log(`${index + 1}. "${song.title}" by ${song.artist}`);
      console.log(`   Current URL: ${song.audioUrl}`);
      console.log(`   Genre: ${song.genre} | Duration: ${Math.floor(song.duration/60)}:${(song.duration%60).toString().padStart(2,'0')}`);
      console.log();
    });

    console.log(`Total songs needing real audio: ${placeholderSongs.length}`);

  } catch (error) {
    console.error('Error fetching songs:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run the script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'list') {
    getPlaceholderSongs();
  } else {
    bulkUpdateAudioUrls();
  }
}

module.exports = { bulkUpdateAudioUrls, getPlaceholderSongs };