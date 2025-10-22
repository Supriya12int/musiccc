const mongoose = require('mongoose');
const Song = require('./models/Song');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/musiccc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// New songs to add
const newSongs = [
  {
    title: "Samajavaragamana",
    artist: "Sid Sriram",
    album: "Ala Vaikunthapurramuloo",
    duration: 255, // 4:15 in seconds
    genre: "Telugu",
    year: 2020,
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=face",
    audioUrl: "/audio/samajavaragamana.mp3",
    playCount: 0
  },
  {
    title: "Sahiba",
    artist: "Aditya Rikhari",
    album: "Phillauri",
    duration: 225, // 3:45 in seconds
    genre: "Hindi",
    year: 2017,
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=face",
    audioUrl: "/audio/sahiba.mp3",
    playCount: 0
  },
  {
    title: "Ramuloo Ramulaa",
    artist: "Anurag Kulkarni",
    album: "Ala Vaikunthapurramuloo",
    duration: 242, // 4:02 in seconds
    genre: "Telugu",
    year: 2020,
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=face",
    audioUrl: "/audio/ramuloo-ramulaa.mp3",
    playCount: 0
  }
];

async function updateSongLibrary() {
  try {
    console.log('🎵 Updating song library...\n');

    // First, remove "Tera Yaar Hoon Main"
    console.log('🗑️  Removing "Tera Yaar Hoon Main"...');
    const deletedSong = await Song.findOneAndDelete({
      title: { $regex: "Tera Yaar Hoon Main", $options: 'i' }
    });
    
    if (deletedSong) {
      console.log('✅ Removed "Tera Yaar Hoon Main" from library');
    } else {
      console.log('❌ "Tera Yaar Hoon Main" not found in library');
    }

    // Add new songs
    console.log('\n➕ Adding new songs...');
    for (const songData of newSongs) {
      // Check if song already exists
      const existingSong = await Song.findOne({
        title: { $regex: songData.title, $options: 'i' },
        artist: { $regex: songData.artist, $options: 'i' }
      });

      if (existingSong) {
        console.log(`⚠️  "${songData.title}" already exists, skipping...`);
        continue;
      }

      const newSong = new Song(songData);
      await newSong.save();
      console.log(`✅ Added "${songData.title}" by ${songData.artist}`);
    }

    // Display updated library
    const allSongs = await Song.find({}).sort({ title: 1 });
    
    console.log('\n🎵 UPDATED SONG LIBRARY');
    console.log('═'.repeat(60));
    
    allSongs.forEach((song, index) => {
      console.log(`\n${index + 1}. 🎶 ${song.title}`);
      console.log(`   👨‍🎤 Artist: ${song.artist}`);
      console.log(`   💿 Album: ${song.album}`);
      console.log(`   🎧 Audio URL: ${song.audioUrl}`);
      console.log(`   ⏱️  Duration: ${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}`);
      console.log(`   📅 Year: ${song.year}`);
    });

    console.log(`\n📊 Total songs in library: ${allSongs.length}`);
    console.log('\n✅ Song library updated successfully!');
    console.log('📁 Make sure to add your MP3 files to: frontend/public/audio/');
    console.log('🎧 Required audio files:');
    allSongs.forEach(song => {
      console.log(`   - ${song.audioUrl.split('/').pop()}`);
    });

  } catch (error) {
    console.error('❌ Error updating song library:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📡 Database connection closed.');
  }
}

updateSongLibrary();