const mongoose = require('mongoose');
const Song = require('./models/Song');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/musiccc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Correct image paths based on actual filenames
const correctImagePaths = [
  {
    title: "Apna Bana Le",
    artist: "Arijit Singh",
    imageUrl: "/images/apna bana le.png"
  },
  {
    title: "Raataan Lambiyan", 
    artist: "Jubin Nautiyal",
    imageUrl: "/images/raatan lambiyan.png"
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
    imageUrl: "/images/ramulo ramulaa.png"
  }
];

async function fixImagePaths() {
  try {
    console.log('🔧 Fixing image paths to match actual filenames...\n');

    for (const songData of correctImagePaths) {
      console.log(`🖼️  Fixing: ${songData.title} by ${songData.artist}`);
      
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
        console.log(`✅ Fixed "${updatedSong.title}" with: ${songData.imageUrl}`);
      } else {
        console.log(`❌ Song not found: ${songData.title}`);
      }
    }

    // Verify the updates
    const allSongs = await Song.find({}).sort({ title: 1 });
    
    console.log('\n🎵 FINAL IMAGE PATHS');
    console.log('═'.repeat(60));
    
    allSongs.forEach((song, index) => {
      console.log(`\n${index + 1}. 🎶 ${song.title}`);
      console.log(`   🖼️  Cover: ${song.albumImageUrl || song.coverImage || 'No cover'}`);
    });

    console.log('\n✅ Image paths fixed!');
    console.log('🔄 Try refreshing your app now!');

  } catch (error) {
    console.error('❌ Error fixing image paths:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📡 Database connection closed.');
  }
}

fixImagePaths();