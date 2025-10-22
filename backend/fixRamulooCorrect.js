const mongoose = require('mongoose');
const Song = require('./models/Song');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/musiccc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

async function fixRamulooImageCorrect() {
  try {
    console.log('🔧 Fixing Ramuloo Ramulaa with CORRECT filename...\n');

    // The actual filename has a space: "ramuloo- ramulaa.png"
    const updatedSong = await Song.findOneAndUpdate(
      { 
        title: { $regex: "Ramuloo Ramulaa", $options: 'i' }
      },
      {
        $set: {
          albumImageUrl: "/images/ramuloo-ramulaa.png",
          coverImage: "/images/ramuloo-ramulaa.png"
        }
      },
      { new: true }
    );

    if (updatedSong) {
      console.log(`✅ Fixed "Ramuloo Ramulaa" with correct filename`);
      console.log(`   🖼️  Correct path: /images/ramuloo- ramulaa.png`);
    } else {
      console.log(`❌ Song "Ramuloo Ramulaa" not found`);
    }

    // Verify the fix
    const song = await Song.findOne({ title: { $regex: "Ramuloo Ramulaa", $options: 'i' } });
    if (song) {
      console.log('\n📋 Current Ramuloo Ramulaa details:');
      console.log(`   Title: ${song.title}`);
      console.log(`   Album Image: ${song.albumImageUrl}`);
      console.log(`   Cover Image: ${song.coverImage}`);
    }

    console.log('\n✅ Ramuloo Ramulaa image fixed with correct filename!');
    console.log('🔄 Refresh your app now!');

  } catch (error) {
    console.error('❌ Error fixing image:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📡 Database connection closed.');
  }
}

fixRamulooImageCorrect();