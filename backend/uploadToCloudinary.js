const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadAudioToCloudinary = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc');
    console.log('Connected to MongoDB');

    // Get all songs from database
    const songs = await Song.find({});
    console.log(`Found ${songs.length} songs to upload to Cloudinary\n`);

    if (songs.length === 0) {
      console.log('No songs found in database. Please add songs first.');
      return;
    }

    for (let song of songs) {
      try {
        // Extract filename from current audio URL
        const filename = song.audioUrl.replace('/audio/', '');
        const localFilePath = path.join(__dirname, 'public', 'audio', filename);
        
        console.log(`Processing: ${song.title} - ${song.artist}`);
        console.log(`Looking for file: ${localFilePath}`);

        // Check if local file exists
        if (!fs.existsSync(localFilePath)) {
          console.log(`❌ File not found: ${filename}`);
          console.log(`   Please download and place the file at: ${localFilePath}\n`);
          continue;
        }

        console.log(`✓ File found, uploading to Cloudinary...`);

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
          resource_type: 'auto', // Automatically detect file type
          public_id: `music/${filename.replace('.mp3', '')}`, // Organize in music folder
          folder: 'musiccc-audio',
          overwrite: true
        });

        console.log(`✅ Uploaded successfully!`);
        console.log(`   Cloudinary URL: ${uploadResult.secure_url}`);

        // Update database with Cloudinary URL
        await Song.findByIdAndUpdate(song._id, {
          audioUrl: uploadResult.secure_url
        });

        console.log(`✓ Database updated with Cloudinary URL\n`);

      } catch (uploadError) {
        console.error(`❌ Error uploading ${song.title}:`, uploadError.message);
        console.log(`   Skipping this song and continuing...\n`);
      }
    }

    console.log('🎉 Cloudinary upload process completed!');
    
    // Show final status
    const updatedSongs = await Song.find({});
    console.log('\n📊 Final Status:');
    updatedSongs.forEach((song, index) => {
      const isCloudinary = song.audioUrl.includes('cloudinary.com');
      const status = isCloudinary ? '☁️ Cloudinary' : '💻 Local';
      console.log(`${index + 1}. ${song.title} - ${status}`);
    });

    console.log('\n🔧 Next Steps:');
    console.log('1. Update your .env file: STORAGE_MODE=cloud');
    console.log('2. Your app will now serve audio from Cloudinary');
    console.log('3. Ready for production deployment!');

  } catch (error) {
    console.error('Error in upload process:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the upload script
uploadAudioToCloudinary();