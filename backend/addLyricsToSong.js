// addLyricsToSong.js - Script to add lyrics to songs
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

// Sample/placeholder lyrics structure
// IMPORTANT: Replace with licensed lyrics for production use
const songsWithLyrics = [
  {
    title: "Apna Bana Le",
    sampleLyrics: `[Verse 1]
Tu Mera Koyi Na
Hoke Bhi Kuchh Laage

[Chorus]
Apna Bana Le Piya
Apna Bana Le Mujhe
Dil Ke Nagar Mein
Shehar Tu Basa Le Piya

[Note: This is a sample. Use licensed lyrics for production.]`
  },
  {
    title: "Kal Ho Naa Ho",
    sampleLyrics: `[Verse 1]
Har ghadi badal rahi hai roop zindagi
Chaav hai kabhi, kabhi hai dhoop zindagi

[Chorus]
Har pal yahan jee bhar jiyo
Jo hai sama, kal ho na ho

[Note: This is a sample. Use licensed lyrics for production.]`
  },
  {
    title: "DJ Waley Babu",
    sampleLyrics: `[Chorus]
DJ wale babu mera gaana chala do
Gaana chala do, gaana chala do

[Verse]
Thodi volume unchi kar de
Thoda bass tu badha de

[Note: This is a sample. Use licensed lyrics for production.]`
  },
  {
    title: "Tera Hone Laga Hoon",
    sampleLyrics: `[Verse 1]  
Hua jo tubhi mera mera
Tera jo ikraar hua

[Chorus]
Tera hone laga hoon
Khone laga hoon
Jab se mila hoon

[Note: This is a sample. Use licensed lyrics for production.]`
  },
  {
    title: "Powerhouse",
    sampleLyrics: `[Chorus]
Coo Coo Coo Coolie Power House
Epudaina Thaggadheedi Range

[Verse]
Manassunaththukune Craze Raa
Gen Z Aina Pogide Boss'u Raa

[Note: This is a sample. Use licensed lyrics for production.]`
  },
  {
    title: "Monica",
    sampleLyrics: `[Chorus]
Monica Bellucci
Egire Vochindi

My Dear Monica
Love You Monica
Baby Maa Monica

[Note: This is a sample. Use licensed lyrics for production.]`
  }
];

async function addLyrics() {
  try {
    console.log('🎵 Adding sample lyrics to songs...\n');
    
    for (let songLyric of songsWithLyrics) {
      const song = await Song.findOne({ title: songLyric.title });
      
      if (song) {
        song.lyrics = songLyric.sampleLyrics;
        await song.save();
        console.log(`✅ Added sample lyrics to "${song.title}"`);
      } else {
        console.log(`❌ Song "${songLyric.title}" not found`);
      }
    }
    
    console.log('\n📝 Important Notes:');
    console.log('- These are sample/placeholder lyrics');
    console.log('- For production, use licensed lyrics from:');
    console.log('  • Musixmatch API');
    console.log('  • Genius API');
    console.log('  • Licensed content providers');
    console.log('- Never use copyrighted lyrics without permission');
    
  } catch (error) {
    console.error('Error adding lyrics:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the function
addLyrics();
