const mongoose = require('mongoose');
const Song = require('./models/Song');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/musiccc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Correct image paths based on ACTUAL filenames
const actualImagePaths = [
  {
    title: "Apna Bana Le",
    artist: "Arijit Singh",
    imageUrl: "/images/apna-bana-le.png"
  },
  {
    title: "Raataan Lambiyan", 
    artist: "Jubin Nautiyal",
    imageUrl: "/images/raataan-lambiyan.png"
  },
  {
    title: "Samajavaragamana",
    artist: "Sid Sriram", 
    imageUrl: "/images/samajavaragamana.png"
  },
  {
    title: "Sahiba",
    artist: "Aditya Rikhari",
    imageUrl: "/images/sahiba.png"
  },
  {
    title: "Ramuloo Ramulaa",
    artist: "Anurag Kulkarni",
    imageUrl: "/images/ramuloo-ramulaa.png"
  }
];

async function updateWithActualFilenames() {
  try {
    console.log('🔧 Updating with ACTUAL filenames...\n');

    for (const songData of actualImagePaths) {
      console.log(`🖼️  Updating: ${songData.title} -> ${songData.imageUrl}`);
      
      const updatedSong = await Song.findOneAndUpdate(
        { 
          title: { $regex: songData.title, $options: 'i' },
          artist: { $regex: songData.artist.split(',')[0], $options: 'i' }
        },
        {
          $set: {
            albumImageUrl: songData.imageUrl,
            coverImage: songData.imageUrl
          }
        },
        { new: true }
      );

      if (updatedSong) {
        console.log(`✅ Updated "${updatedSong.title}"`);
      } else {
        console.log(`❌ Song not found: ${songData.title}`);
      }
    }

    // Verify final state
    const allSongs = await Song.find({}).sort({ title: 1 });
    
    console.log('\n🎵 FINAL COVER IMAGES');
    console.log('═'.repeat(60));
    
    allSongs.forEach((song, index) => {
      console.log(`\n${index + 1}. 🎶 ${song.title}`);
      console.log(`   🖼️  Image: ${song.albumImageUrl || song.coverImage || 'No cover'}`);
    });

    console.log('\n✅ All covers should now work!');
    console.log('🔄 Refresh your app to see the changes!');

  } catch (error) {
    console.error('❌ Error updating:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📡 Database connection closed.');
  }
}

updateWithActualFilenames();