const mongoose = require('mongoose');
const Song = require('./models/Song');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/musiccc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Update songs with cover images
const songCoverUpdates = [
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

async function updateSongCovers() {
  try {
    console.log('🎨 Updating song covers...\n');

    for (const songData of songCoverUpdates) {
      console.log(`🖼️  Updating cover for: ${songData.title} by ${songData.artist}`);
      
      const updatedSong = await Song.findOneAndUpdate(
        { 
          title: { $regex: songData.title, $options: 'i' },
          artist: { $regex: songData.artist.split(',')[0], $options: 'i' } // Match first artist
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
        console.log(`✅ Updated "${updatedSong.title}" with cover: ${songData.imageUrl}`);
      } else {
        console.log(`❌ Song not found: ${songData.title}`);
      }
    }

    // Display updated songs with covers
    const allSongs = await Song.find({}).sort({ title: 1 });
    
    console.log('\n🎵 UPDATED SONG LIBRARY WITH COVERS');
    console.log('═'.repeat(60));
    
    allSongs.forEach((song, index) => {
      console.log(`\n${index + 1}. 🎶 ${song.title}`);
      console.log(`   👨‍🎤 Artist: ${song.artist}`);
      console.log(`   💿 Album: ${song.album}`);
      console.log(`   🖼️  Cover: ${song.albumImageUrl || song.coverImage || 'No cover'}`);
      console.log(`   🎧 Audio: ${song.audioUrl}`);
      console.log(`   ⏱️  Duration: ${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}`);
    });

    console.log('\n✅ Song covers updated successfully!');
    console.log('📁 Make sure your image files are in: frontend/public/images/');
    console.log('🖼️  Expected image files:');
    songCoverUpdates.forEach(song => {
      console.log(`   - ${song.imageUrl.split('/').pop()}`);
    });

  } catch (error) {
    console.error('❌ Error updating song covers:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📡 Database connection closed.');
  }
}

updateSongCovers();