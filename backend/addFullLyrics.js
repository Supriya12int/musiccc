const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');

// Load environment variables
dotenv.config();

// Sample structured lyrics for your songs
// Note: These are sample/placeholder lyrics. Replace with licensed content.
const songsWithLyrics = {
  "Tera Hone Laga Hoon": {
    structure: [
      {
        type: 'verse',
        number: 1,
        timestamp: 0,
        lines: [
          { text: "Shining in the setting sun like a pearl upon the ocean", time: 5 },
          { text: "Come and feel me, oh feel me", time: 10 },
          { text: "Shining in the setting sun like a pearl upon the ocean", time: 15 },
          { text: "Come and heal me, oh heal me", time: 20 }
        ]
      },
      {
        type: 'chorus',
        timestamp: 25,
        lines: [
          { text: "Tera hone laga hoon", time: 30 },
          { text: "Khone laga hoon", time: 35 },
          { text: "Jab se mila hoon", time: 40 },
          { text: "Tera hone laga hoon", time: 45 }
        ]
      },
      {
        type: 'verse',
        number: 2,
        timestamp: 50,
        lines: [
          { text: "Waise main hun to", time: 55 },
          { text: "Hamesha se akela", time: 60 },
          { text: "Phir kyun laga hai", time: 65 },
          { text: "Aise jaise mil gaya ho saathi", time: 70 }
        ]
      }
    ],
    note: "Sample lyrics for demonstration. Use licensed lyrics for production."
  },

  "Apna Bana Le": {
    structure: [
      {
        type: 'verse',
        number: 1,
        timestamp: 0,
        lines: [
          { text: "Tu mera koyi na", time: 5 },
          { text: "Hoke bhi kuchh laage", time: 10 },
          { text: "Kyun tera hoya main", time: 15 },
          { text: "Samjhau kaise tujhe", time: 20 }
        ]
      },
      {
        type: 'chorus',
        timestamp: 25,
        lines: [
          { text: "Apna bana le piya", time: 30 },
          { text: "Apna bana le mujhe", time: 35 },
          { text: "Dil ke nagar mein", time: 40 },
          { text: "Shehar tu basa le piya", time: 45 }
        ]
      },
      {
        type: 'bridge',
        timestamp: 50,
        lines: [
          { text: "Main hun yahan", time: 55 },
          { text: "Tu hai wahan", time: 60 },
          { text: "Phir kyun lage", time: 65 },
          { text: "Mann bechain", time: 70 }
        ]
      }
    ],
    note: "Sample lyrics structure. Replace with actual licensed lyrics."
  },

  "DJ Waley Babu": {
    structure: [
      {
        type: 'intro',
        timestamp: 0,
        lines: [
          { text: "DJ wale babu", time: 2 },
          { text: "Mera gana baja do", time: 5 },
          { text: "DJ wale babu", time: 8 },
          { text: "Mera gana baja do", time: 11 }
        ]
      },
      {
        type: 'verse',
        number: 1,
        timestamp: 15,
        lines: [
          { text: "Main hoon hero tera", time: 18 },
          { text: "Tu hai heroine meri", time: 22 },
          { text: "Main hoon hero tera", time: 26 },
          { text: "Tu hai heroine meri", time: 30 }
        ]
      },
      {
        type: 'chorus',
        timestamp: 35,
        lines: [
          { text: "DJ wale babu mera gana baja do", time: 38 },
          { text: "Sare shehar mein dhoom macha do", time: 42 },
          { text: "DJ wale babu mera gana baja do", time: 46 },
          { text: "Sare shehar mein dhoom macha do", time: 50 }
        ]
      }
    ],
    note: "Sample rap lyrics structure. Use licensed content for production."
  }
};

const addLyricsToSongs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc');
    console.log('Connected to MongoDB');

    console.log('\n🎵 Adding structured lyrics to songs...\n');

    let updatedCount = 0;

    for (const [songTitle, lyricsData] of Object.entries(songsWithLyrics)) {
      const song = await Song.findOne({ title: { $regex: new RegExp(songTitle, 'i') } });
      
      if (song) {
        // Create formatted lyrics for both display and karaoke
        const formattedLyrics = {
          structure: lyricsData.structure,
          karaoke: {
            enabled: true,
            synchronized: true,
            totalDuration: song.duration || 200
          },
          displayText: lyricsData.structure
            .map(section => {
              const sectionHeader = section.type === 'verse' ? 
                `[Verse ${section.number || ''}]` : 
                `[${section.type.charAt(0).toUpperCase() + section.type.slice(1)}]`;
              
              const sectionLines = section.lines.map(line => line.text).join('\n');
              return `${sectionHeader}\n${sectionLines}`;
            })
            .join('\n\n'),
          note: lyricsData.note
        };

        await Song.findByIdAndUpdate(song._id, {
          lyrics: JSON.stringify(formattedLyrics),
          hasLyrics: true,
          karaokeEnabled: true
        });

        console.log(`✓ Updated lyrics for: ${song.title}`);
        console.log(`  Sections: ${lyricsData.structure.length}`);
        console.log(`  Total lines: ${lyricsData.structure.reduce((acc, section) => acc + section.lines.length, 0)}\n`);
        
        updatedCount++;
      } else {
        console.log(`⚠ Song not found: ${songTitle}`);
      }
    }

    console.log(`🎉 Successfully updated lyrics for ${updatedCount} songs!`);

    // Show summary
    const songsWithLyricsCount = await Song.countDocuments({ hasLyrics: true });
    const totalSongs = await Song.countDocuments();
    
    console.log('\n📊 Summary:');
    console.log(`Songs with lyrics: ${songsWithLyricsCount}/${totalSongs}`);
    console.log(`Karaoke-enabled songs: ${songsWithLyricsCount}`);

    console.log('\n🎤 Karaoke Features:');
    console.log('✓ Synchronized lyrics with timestamps');
    console.log('✓ Verse/Chorus/Bridge structure');
    console.log('✓ Line-by-line highlighting');
    console.log('✓ Display and karaoke modes');

    console.log('\n⚖️ Legal Note:');
    console.log('These are sample/placeholder lyrics for development.');
    console.log('For production, replace with:');
    console.log('- Licensed lyrics from APIs (Genius, Musixmatch)');
    console.log('- User-contributed lyrics');
    console.log('- Original song lyrics');

  } catch (error) {
    console.error('Error adding lyrics:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the script
addLyricsToSongs();