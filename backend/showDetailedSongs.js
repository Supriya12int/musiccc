const mongoose = require('mongoose');
const Song = require('./models/Song');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/musiccc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

async function showSongs() {
  try {
    const songs = await Song.find({}).sort({ playCount: -1 });
    
    console.log('\n🎵 YOUR MUSIC LIBRARY (DETAILED VIEW)');
    console.log('═'.repeat(60));
    
    if (songs.length === 0) {
      console.log('❌ No songs found in database');
    } else {
      songs.forEach((song, index) => {
        const minutes = Math.floor(song.duration / 60);
        const seconds = song.duration % 60;
        const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        console.log(`\n${index + 1}. 🎶 ${song.title}`);
        console.log(`   👨‍🎤 Artist: ${song.artist}`);
        console.log(`   💿 Album: ${song.album}`);
        console.log(`   🎭 Genre: ${song.genre}`);
        console.log(`   ⏱️  Duration: ${formattedDuration}`);
        console.log(`   📅 Year: ${song.releaseYear}`);
        console.log(`   ▶️  Plays: ${song.playCount.toLocaleString()}`);
        console.log(`   🏷️  Tags: ${song.tags.join(', ')}`);
        console.log(`   🆔 ID: ${song._id}`);
      });
      
      console.log(`\n📊 Total Songs: ${songs.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error fetching songs:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📡 Database connection closed.');
  }
}

showSongs();