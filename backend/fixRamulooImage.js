const mongoose = require('mongoose');
const Song = require('./models/Song');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/musiccc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

async function fixRamulooImage() {
  try {
    console.log('🔧 Fixing Ramuloo Ramulaa image path...\n');

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
      console.log(`✅ Fixed "Ramuloo Ramulaa" image path`);
      console.log(`   🖼️  New path: /images/ramuloo-ramulaa.png`);
    } else {
      console.log(`❌ Song "Ramuloo Ramulaa" not found`);
    }

    // Verify the fix
    const song = await Song.findOne({ title: { $regex: "Ramuloo Ramulaa", $options: 'i' } });
    if (song) {
      console.log('\n📋 Current Ramuloo Ramulaa details:');
      console.log(`   Title: ${song.title}`);
      console.log(`   Artist: ${song.artist}`);
      console.log(`   Album Image: ${song.albumImageUrl}`);
      console.log(`   Cover Image: ${song.coverImage}`);
    }

    console.log('\n✅ Ramuloo Ramulaa image fixed!');
    console.log('🔄 Refresh your app to see the change!');

  } catch (error) {
    console.error('❌ Error fixing image:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📡 Database connection closed.');
  }
}

fixRamulooImage();