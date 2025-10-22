// bulkAddLyrics.js - Add lyrics to multiple songs at once
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Define your songs with lyrics
// IMPORTANT: Only use original lyrics or public domain content
const songsWithLyrics = [
  {
    title: 'Apna Banale',
    lyrics: `[Verse 1]
Write your original lyrics here
Or use lyrics you have permission to use
Line by line format
Easy to read

[Chorus]
Main hook of the song
Repeated section
Catchy and memorable

[Verse 2]
Second verse continues
Tell your story
Express emotions

[Bridge]
Bridge section
Different melody
Builds anticipation

[Chorus]
Repeat the main hook
Sing along section
Everyone knows this part

[Outro]
Ending the song
Fade out gently
Final words`
  },
  {
    title: 'Another Song Title',
    lyrics: `[Intro]
Opening lines...

[Verse 1]
First verse lyrics...

[Chorus]
Chorus lyrics...`
  }
  // Add more songs here
];

async function bulkAddLyrics() {
  try {
    console.log('🎵 Starting bulk lyrics update...\n');
    
    for (const songData of songsWithLyrics) {
      const song = await Song.findOne({ title: songData.title });
      
      if (song) {
        song.lyrics = songData.lyrics;
        await song.save();
        console.log(`✅ Updated lyrics for: ${song.title}`);
      } else {
        console.log(`❌ Song not found: ${songData.title}`);
      }
    }
    
    console.log('\n🎉 Bulk lyrics update completed!');
    
  } catch (error) {
    console.error('Error in bulk update:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the bulk update
bulkAddLyrics();
