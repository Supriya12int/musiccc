const mongoose = require('mongoose');
const Song = require('./models/Song');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/musiccc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

async function fixRamulooFinal() {
  try {
    console.log('🔧 Final fix for Ramuloo Ramulaa (no spaces)...\n');

    // Update with filename without spaces
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
      console.log(`✅ FINAL FIX: "Ramuloo Ramulaa" updated`);
      console.log(`   🖼️  Clean path: /images/ramuloo-ramulaa.png`);
    } else {
      console.log(`❌ Song "Ramuloo Ramulaa" not found`);
    }

    // Test URL accessibility
    console.log('\n🔗 URL to test: http://localhost:3000/images/ramuloo-ramulaa.png');

    // Verify all songs now
    const allSongs = await Song.find({}).sort({ title: 1 });
    
    console.log('\n🎵 ALL SONG COVERS:');
    console.log('═'.repeat(50));
    
    allSongs.forEach((song, index) => {
      const cover = song.albumImageUrl || song.coverImage || 'No cover';
      console.log(`${index + 1}. ${song.title}`);
      console.log(`   🖼️  ${cover}`);
    });

    console.log('\n✅ All images should now work!');
    console.log('🔄 Hard refresh your browser (Ctrl+F5)!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📡 Database connection closed.');
  }
}

fixRamulooFinal();