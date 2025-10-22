const mongoose = require('mongoose');
const Song = require('./models/Song');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/musiccc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Define the 3 songs to keep
const songsToKeep = [
  {
    title: "Tera Yaar Hoon Main",
    artist: "Arijit Singh",
    album: "Sonu Ke Titu Ki Sweety",
    duration: 252, // 4:12 in seconds
    genre: "Bollywood",
    releaseYear: 2018,
    audioUrl: "https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav",
    coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    playCount: Math.floor(Math.random() * 50000) + 10000,
    tags: ["Hindi", "Bollywood", "Romance"],
  },
  {
    title: "Raataan Lambiyan",
    artist: "Jubin Nautiyal, Asees Kaur",
    album: "Shershaah",
    duration: 278, // 4:38 in seconds
    genre: "Bollywood",
    releaseYear: 2021,
    audioUrl: "https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav",
    coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    playCount: Math.floor(Math.random() * 50000) + 10000,
    tags: ["Hindi", "Bollywood", "Romance"],
  },
  {
    title: "Apna Bana Le",
    artist: "Arijit Singh",
    album: "Bhediya",
    duration: 265, // 4:25 in seconds
    genre: "Bollywood",
    releaseYear: 2022,
    audioUrl: "https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav",
    coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    playCount: Math.floor(Math.random() * 50000) + 10000,
    tags: ["Hindi", "Bollywood", "Romance"],
  }
];

async function resetDatabase() {
  try {
    console.log('🗑️  Deleting all existing songs...');
    
    // Delete all existing songs
    const deleteResult = await Song.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} songs from database`);
    
    console.log('\n🎵 Adding your 3 selected songs...');
    
    // Add the 3 new songs
    const createdSongs = await Song.insertMany(songsToKeep);
    
    console.log('\n✅ DATABASE UPDATED SUCCESSFULLY!');
    console.log('══════════════════════════════════════════════');
    console.log('🎶 YOUR NEW MUSIC LIBRARY (3 SONGS)');
    console.log('══════════════════════════════════════════════');
    
    createdSongs.forEach((song, index) => {
      const minutes = Math.floor(song.duration / 60);
      const seconds = song.duration % 60;
      const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      console.log(`${index + 1}. ${song.title} - ${song.artist}`);
      console.log(`   Album: ${song.album} (${song.releaseYear})`);
      console.log(`   Duration: ${formattedDuration} | Plays: ${song.playCount.toLocaleString()}`);
      console.log('');
    });
    
    console.log('🎧 Your music app now has only these 3 songs!');
    console.log('🔄 Refresh your app to see the changes.');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('\n📡 Database connection closed.');
  }
}

// Run the script
resetDatabase();