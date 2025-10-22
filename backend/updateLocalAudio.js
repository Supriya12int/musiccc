const mongoose = require('mongoose');
const Song = require('./models/Song');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/musiccc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Update songs with local audio files
const songsWithLocalAudio = [
  {
    title: "Apna Bana Le",
    artist: "Arijit Singh",
    audioUrl: "/audio/apna-bana-le.mp3"  // Make sure your file is named this in frontend/public/audio/
  },
  {
    title: "Raataan Lambiyan",
    artist: "Jubin Nautiyal, Asees Kaur", 
    audioUrl: "/audio/raataan-lambiyan.mp3"
  },
  {
    title: "Samajavaragamana",
    artist: "Sid Sriram",
    audioUrl: "/audio/samajavaragamana.mp3"
  },
  {
    title: "Sahiba",
    artist: "Aditya Rikhari",
    audioUrl: "/audio/sahiba.mp3"
  },
  {
    title: "Ramuloo Ramulaa",
    artist: "Anurag Kulkarni",
    audioUrl: "/audio/ramuloo-ramulaa.mp3"
  }
];

async function updateSongsWithLocalAudio() {
  try {
    console.log('🎵 Updating songs with local audio files...\n');

    for (const songData of songsWithLocalAudio) {
      console.log(`🔄 Updating: ${songData.title} by ${songData.artist}`);
      
      const updatedSong = await Song.findOneAndUpdate(
        { 
          title: { $regex: songData.title, $options: 'i' },
          artist: { $regex: songData.artist.split(',')[0], $options: 'i' } // Match first artist
        },
        {
          $set: {
            audioUrl: songData.audioUrl
          }
        },
        { new: true }
      );

      if (updatedSong) {
        console.log(`✅ Updated "${updatedSong.title}" with audio: ${songData.audioUrl}`);
      } else {
        console.log(`❌ Song not found: ${songData.title}`);
      }
    }

    // Display updated songs
    const allSongs = await Song.find({}).sort({ playCount: -1 });
    
    console.log('\n🎵 UPDATED SONG LIBRARY WITH AUDIO');
    console.log('═'.repeat(60));
    
    allSongs.forEach((song, index) => {
      console.log(`\n${index + 1}. 🎶 ${song.title}`);
      console.log(`   👨‍🎤 Artist: ${song.artist}`);
      console.log(`   🎧 Audio URL: ${song.audioUrl}`);
      console.log(`   ⏱️  Duration: ${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}`);
    });

    console.log('\n✅ Audio files updated!');
    console.log('📁 Make sure to add your MP3 files to: frontend/public/audio/');
    console.log('🎧 Users can now play real music!');

  } catch (error) {
    console.error('❌ Error updating songs with audio:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📡 Database connection closed.');
  }
}

updateSongsWithLocalAudio();