const mongoose = require('mongoose');
const Song = require('./models/Song');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/musiccc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Update songs with online audio URLs
// REPLACE THESE URLs WITH YOUR ACTUAL AUDIO FILE URLs
const songsWithOnlineAudio = [
  {
    title: "Tera Yaar Hoon Main",
    artist: "Arijit Singh",
    audioUrl: "https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav", // REPLACE with your URL
    coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop"
  },
  {
    title: "Raataan Lambiyan",
    artist: "Jubin Nautiyal, Asees Kaur", 
    audioUrl: "https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav", // REPLACE with your URL
    coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop"
  },
  {
    title: "Apna Bana Le",
    artist: "Arijit Singh",
    audioUrl: "https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav", // REPLACE with your URL
    coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop"
  }
];

// INSTRUCTIONS:
// 1. Upload your MP3 files to Google Drive, Dropbox, or any file hosting service
// 2. Get the direct download URLs
// 3. Replace the URLs above with your actual audio file URLs
// 4. Run this script: node updateOnlineAudio.js

async function updateSongsWithOnlineAudio() {
  try {
    console.log('🎵 Updating songs with online audio URLs...\n');

    for (const songData of songsWithOnlineAudio) {
      console.log(`🔄 Updating: ${songData.title} by ${songData.artist}`);
      
      const updatedSong = await Song.findOneAndUpdate(
        { 
          title: { $regex: songData.title, $options: 'i' },
          artist: { $regex: songData.artist.split(',')[0], $options: 'i' }
        },
        {
          $set: {
            audioUrl: songData.audioUrl
          }
        },
        { new: true }
      );

      if (updatedSong) {
        console.log(`✅ Updated "${updatedSong.title}" with audio: ${songData.audioUrl}`);
      } else {
        console.log(`❌ Song not found: ${songData.title}`);
      }
    }

    console.log('\n✅ Online audio URLs updated!');
    console.log('🌐 Make sure your audio URLs are publicly accessible');
    console.log('🎧 Users can now stream music from your audio host!');

  } catch (error) {
    console.error('❌ Error updating songs with audio:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📡 Database connection closed.');
  }
}

updateSongsWithOnlineAudio();