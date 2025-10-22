const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');

// Load environment variables
dotenv.config();

const clearAllSongs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc');
    console.log('Connected to MongoDB');

    // Get current count
    const currentCount = await Song.countDocuments();
    console.log(`Current songs in database: ${currentCount}`);

    // Clear all existing songs
    const result = await Song.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} songs from the database`);

    // Verify deletion
    const remainingCount = await Song.countDocuments();
    console.log(`Remaining songs: ${remainingCount}`);

    console.log('\n🗑️ Database cleared successfully!');
    console.log('You can now add your curated song list.');

  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the clearing script
clearAllSongs();