const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');

// Load environment variables
dotenv.config();

// 🔧 MANUAL CLOUDINARY URLs
// After uploading to Cloudinary manually, paste the URLs here
const cloudinaryUrls = [
  {
    title: "Mallika Gandha",
    // Paste your Cloudinary URL here after manual upload
    cloudinaryUrl: "PASTE_MALLIKA_GANDHA_CLOUDINARY_URL_HERE"
  },
  {
    title: "Khathyayini",
    // Paste your Cloudinary URL here after manual upload  
    cloudinaryUrl: "PASTE_KHATHYAYINI_CLOUDINARY_URL_HERE"
  }
];

const updateWithCloudinaryUrls = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc');
    console.log('Connected to MongoDB');

    console.log('🔄 Updating songs with Cloudinary URLs...\n');

    for (let urlData of cloudinaryUrls) {
      if (urlData.cloudinaryUrl === `PASTE_${urlData.title.toUpperCase().replace(' ', '_')}_CLOUDINARY_URL_HERE`) {
        console.log(`⚠️ Skipping ${urlData.title} - URL not provided`);
        console.log(`   Please update the cloudinaryUrl in this script\n`);
        continue;
      }

      const song = await Song.findOne({ title: urlData.title });
      
      if (!song) {
        console.log(`❌ Song not found: ${urlData.title}\n`);
        continue;
      }

      await Song.findByIdAndUpdate(song._id, {
        audioUrl: urlData.cloudinaryUrl
      });

      console.log(`✅ Updated: ${urlData.title}`);
      console.log(`   Old URL: ${song.audioUrl}`);
      console.log(`   New URL: ${urlData.cloudinaryUrl}\n`);
    }

    console.log('🎉 Manual URL update completed!');
    
    // Show current status
    const allSongs = await Song.find({});
    console.log('📊 Current Status:');
    allSongs.forEach((song, index) => {
      const isCloudinary = song.audioUrl.includes('cloudinary.com');
      const status = isCloudinary ? '☁️ Cloudinary' : '💻 Local';
      console.log(`${index + 1}. ${song.title} - ${status}`);
    });

  } catch (error) {
    console.error('Error updating URLs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

updateWithCloudinaryUrls();