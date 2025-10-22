const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');

// Load environment variables
dotenv.config();

const verifyCloudinarySetup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc');
    console.log('Connected to MongoDB\n');

    const songs = await Song.find({});
    
    console.log('🎵 CLOUDINARY VERIFICATION REPORT\n');
    console.log('=================================\n');

    if (songs.length === 0) {
      console.log('❌ No songs found in database');
      return;
    }

    songs.forEach((song, index) => {
      console.log(`${index + 1}. ${song.title} - ${song.artist}`);
      console.log(`   Audio URL: ${song.audioUrl}`);
      
      // Check if URL is from Cloudinary
      const isCloudinary = song.audioUrl.includes('cloudinary.com');
      const status = isCloudinary ? '✅ CLOUDINARY' : '❌ LOCAL/OTHER';
      console.log(`   Status: ${status}`);
      
      if (isCloudinary) {
        console.log(`   📂 File Path: ${song.audioUrl.split('/').slice(-2).join('/')}`);
        console.log(`   🔗 Test Link: ${song.audioUrl}`);
      }
      console.log('');
    });

    // Summary
    const cloudinaryCount = songs.filter(s => s.audioUrl.includes('cloudinary.com')).length;
    const totalCount = songs.length;
    
    console.log('📊 SUMMARY:');
    console.log(`Total Songs: ${totalCount}`);
    console.log(`Cloudinary: ${cloudinaryCount}`);
    console.log(`Local: ${totalCount - cloudinaryCount}`);
    
    if (cloudinaryCount === totalCount) {
      console.log('\n🎉 SUCCESS! All songs are on Cloudinary!');
      console.log('✅ Ready for production deployment');
      console.log('✅ Users can now play songs from cloud');
    } else {
      console.log('\n⚠️ Some songs still use local storage');
      console.log('Run uploadToCloudinary.js to fix this');
    }

    console.log('\n🔧 STORAGE MODE:');
    console.log(`Current Mode: ${process.env.STORAGE_MODE}`);
    
    if (process.env.STORAGE_MODE === 'cloud' && cloudinaryCount === totalCount) {
      console.log('✅ Perfect! Cloud mode + Cloudinary files = Ready!');
    } else if (process.env.STORAGE_MODE === 'local') {
      console.log('⚠️ Set STORAGE_MODE=cloud in .env for production');
    }

  } catch (error) {
    console.error('Error verifying setup:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

verifyCloudinarySetup();