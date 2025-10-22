const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// 🎵 YOUR CURATED SONG LIST
// Add only the songs you want users to see
// Put your downloaded audio files in: backend/public/audio/
const mySongs = [
  // Hindi Songs
  {
    title: "Tera Hone Laga Hoon",
    artist: "Atif Aslam",
    album: "Ajab Prem Ki Ghazab Kahani",
    genre: "Hindi",
    duration: 285,
    releaseYear: 2009,
    audioFile: "tera-hone-laga-hoon.mp3", // Put this file in backend/public/audio/tera-hone-laga-hoon.mp3
    coverImage: "https://picsum.photos/300/300?random=3",
    lyrics: "",
    tags: ["hindi", "romantic", "atif aslam"]
  },
  {
    title: "DJ Waley Babu",
    artist: "Badshah",
    album: "Single",
    genre: "Hindi",
    duration: 200,
    releaseYear: 2015,
    audioFile: "dj-waley-babu.mp3", // Put this file in backend/public/audio/dj-waley-babu.mp3
    coverImage: "https://picsum.photos/300/300?random=4",
    lyrics: "",
    tags: ["hindi", "rap", "badshah", "party"]
  },
  {
    title: "Kal Ho Naa Ho",
    artist: "Sonu Nigam",
    album: "Kal Ho Naa Ho",
    genre: "Hindi",
    duration: 330,
    releaseYear: 2003,
    audioFile: "kal-ho-naa-ho.mp3", // Put this file in backend/public/audio/kal-ho-naa-ho.mp3
    coverImage: "https://picsum.photos/300/300?random=5",
    lyrics: "",
    tags: ["hindi", "emotional", "sonu nigam", "classic"]
  },
  {
    title: "Apna Bana Le",
    artist: "Arijit Singh",
    album: "Bhediya",
    genre: "Hindi",
    duration: 240,
    releaseYear: 2022,
    audioFile: "apna-bana-le.mp3", // Put this file in backend/public/audio/apna-bana-le.mp3
    coverImage: "https://picsum.photos/300/300?random=6",
    lyrics: "[Verse 1]\nTu Mera Koyi Na...\n[Chorus]\nApna Bana Le Piya...\n\n(Add full lyrics from licensed source)",
    tags: ["hindi", "romantic", "arijit singh", "modern"]
  },

  // Telugu Songs  
  {
    title: "Monica",
    artist: "Monica Denise",
    album: "Single",
    genre: "Telugu",
    duration: 250,
    releaseYear: 2023,
    audioFile: "monica.mp3", // Put this file in backend/public/audio/monica.mp3
    coverImage: "https://picsum.photos/300/300?random=7",
    lyrics: "",
    tags: ["telugu", "modern", "monica denise"]
  },
  {
    title: "Powerhouse",
    artist: "Anirudh",
    album: "Single",
    genre: "Telugu",
    duration: 220,
    releaseYear: 2024,
    audioFile: "powerhouse.mp3", // Put this file in backend/public/audio/powerhouse.mp3
    coverImage: "https://picsum.photos/300/300?random=8",
    lyrics: "",
    tags: ["telugu", "energetic", "anirudh", "mass"]
  }
  // 📝 ADD MORE SONGS HERE - Just copy the format above
  // Remember to download the audio files and put them in backend/public/audio/
];

const addMySongs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc');
    console.log('Connected to MongoDB');

    // Find or create admin user
    let adminUser = await User.findOne({ email: 'admin@musiccc.com' });
    if (!adminUser) {
      adminUser = new User({
        username: 'admin',
        email: 'admin@musiccc.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      });
      await adminUser.save();
      console.log('Created admin user');
    }

    console.log('\n🎵 Adding your curated songs...\n');

    // Process each song
    const songsToAdd = [];
    for (const song of mySongs) {
      // Create audio URL based on your storage mode
      const audioUrl = process.env.STORAGE_MODE === 'cloud' 
        ? `https://example.com/songs/${song.audioFile}` // You'll upload to Cloudinary later
        : `/audio/${song.audioFile}`; // Local file serving (relative path)

      const songData = {
        title: song.title,
        artist: song.artist,
        album: song.album,
        genre: song.genre,
        duration: song.duration,
        releaseYear: song.releaseYear,
        audioUrl: audioUrl,
        coverImage: song.coverImage,
        lyrics: song.lyrics,
        tags: song.tags,
        uploadedBy: adminUser._id,
        playCount: Math.floor(Math.random() * 1000) // Random play counts for testing
      };

      songsToAdd.push(songData);
      console.log(`✓ Prepared: ${song.title} by ${song.artist}`);
      console.log(`  Audio URL: ${audioUrl}`);
      console.log(`  Expected file: backend/public/audio/${song.audioFile}\n`);
    }

    // Insert all songs
    const insertedSongs = await Song.insertMany(songsToAdd);
    console.log(`🎉 Successfully added ${insertedSongs.length} songs to your database!`);

    console.log('\n📋 Summary:');
    console.log(`Total Songs: ${await Song.countDocuments()}`);
    console.log(`Total Users: ${await User.countDocuments()}`);

    console.log('\n📁 Next Steps:');
    console.log('1. Download your audio files and put them in: backend/public/audio/');
    console.log('2. Make sure file names match exactly (e.g., kesariya.mp3)');
    console.log('3. Your backend server will serve these files automatically');
    console.log('4. Users will be able to play these songs in their dashboard');

    console.log('\n🎧 Songs in your list:');
    insertedSongs.forEach((song, index) => {
      console.log(`${index + 1}. ${song.title} - ${song.artist} (${song.genre})`);
    });

  } catch (error) {
    console.error('Error adding songs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the script
addMySongs();