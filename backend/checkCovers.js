const mongoose = require('mongoose');
const Song = require('./models/Song');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/musiccc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

async function checkSongCovers() {
  try {
    const songs = await Song.find({}).sort({ title: 1 });
    
    console.log('🎵 CURRENT SONG LIBRARY WITH COVERS');
    console.log('═'.repeat(60));
    
    songs.forEach((song, index) => {
      console.log(`\n${index + 1}. 🎶 ${song.title}`);
      console.log(`   👨‍🎤 Artist: ${song.artist}`);
      console.log(`   🖼️  Cover: ${song.albumImageUrl || song.coverImage || 'No cover'}`);
      console.log(`   🎧 Audio: ${song.audioUrl || 'No audio'}`);
    });

    console.log(`\n📊 Total songs: ${songs.length}`);

  } catch (error) {
    console.error('❌ Error checking songs:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📡 Database connection closed.');
  }
}

checkSongCovers();