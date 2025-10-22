const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// YouTube URLs for your songs (you'll need to find these)
const songUrls = [
  {
    title: "Mallika Gandha",
    youtubeUrl: "PASTE_YOUTUBE_URL_FOR_MALLIKA_GANDHA_HERE", // Replace with actual YouTube URL
    filename: "mallika-gandha.mp3"
  },
  {
    title: "Khathyayini", 
    youtubeUrl: "PASTE_YOUTUBE_URL_FOR_KHATHYAYINI_HERE", // Replace with actual YouTube URL
    filename: "khathyayini.mp3"
  }
];

const downloadSongsFromYouTube = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc');
    console.log('Connected to MongoDB');

    console.log('🎬 Downloading songs from YouTube...\n');

    for (let songData of songUrls) {
      if (songData.youtubeUrl.includes('PASTE_YOUTUBE_URL')) {
        console.log(`⚠️ Skipping ${songData.title} - YouTube URL not provided`);
        console.log(`   Please find the YouTube URL and update this script\n`);
        continue;
      }

      console.log(`📥 Downloading: ${songData.title}`);
      console.log(`   URL: ${songData.youtubeUrl}`);
      
      const outputPath = path.join(__dirname, 'public', 'audio', songData.filename);
      
      try {
        // Use youtube-dl to download audio
        await downloadAudio(songData.youtubeUrl, outputPath);
        console.log(`✅ Downloaded: ${songData.filename}\n`);
      } catch (error) {
        console.log(`❌ Failed to download ${songData.title}: ${error.message}\n`);
      }
    }

    console.log('🎉 Download process completed!');
    console.log('\n📁 Now you can run: node uploadToCloudinary.js');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

const downloadAudio = (url, outputPath) => {
  return new Promise((resolve, reject) => {
    const process = spawn('youtube-dl', [
      '-x', '--audio-format', 'mp3',
      '--audio-quality', '0',
      '-o', outputPath.replace('.mp3', '.%(ext)s'),
      url
    ]);

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`youtube-dl exited with code ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
};

downloadSongsFromYouTube();