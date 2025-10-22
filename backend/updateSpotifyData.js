const mongoose = require('mongoose');
const Song = require('./models/Song');
const spotifyService = require('./services/spotifyService');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Song data to search for on Spotify
const songsToUpdate = [
  {
    title: "Tera Yaar Hoon Main",
    artist: "Arijit Singh"
  },
  {
    title: "Raataan Lambiyan", 
    artist: "Jubin Nautiyal"
  },
  {
    title: "Apna Bana Le",
    artist: "Arijit Singh"
  }
];

async function updateSongsWithSpotifyData() {
  try {
    console.log('🎵 Updating songs with Spotify data...\n');

    for (const songData of songsToUpdate) {
      console.log(`🔍 Searching for: ${songData.title} by ${songData.artist}`);
      
      // Search for track on Spotify
      const spotifyTrack = await spotifyService.searchTrack(songData.artist, songData.title);
      
      if (spotifyTrack) {
        console.log(`✅ Found on Spotify: ${spotifyTrack.name} by ${spotifyTrack.artists[0].name}`);
        
        // Format Spotify data
        const spotifyData = spotifyService.formatTrackData(spotifyTrack);
        
        // Update song in database
        const updatedSong = await Song.findOneAndUpdate(
          { 
            title: { $regex: songData.title, $options: 'i' },
            artist: { $regex: songData.artist, $options: 'i' }
          },
          {
            $set: {
              spotifyId: spotifyData.spotifyId,
              spotifyUri: spotifyData.spotifyUri,
              previewUrl: spotifyData.previewUrl,
              spotifyUrl: spotifyData.spotifyUrl,
              popularity: spotifyData.popularity,
              albumImageUrl: spotifyData.albumImageUrl,
              coverImage: spotifyData.albumImageUrl || '', // Use Spotify album art as cover
              duration: Math.floor(spotifyData.durationMs / 1000), // Convert to seconds
              album: spotifyData.albumName,
              releaseYear: new Date(spotifyData.releaseDate).getFullYear()
            }
          },
          { new: true }
        );

        if (updatedSong) {
          console.log(`✅ Updated "${updatedSong.title}" with Spotify data`);
          console.log(`   - Spotify ID: ${spotifyData.spotifyId}`);
          console.log(`   - Preview URL: ${spotifyData.previewUrl ? 'Available' : 'Not available'}`);
          console.log(`   - Album Image: ${spotifyData.albumImageUrl ? 'Available' : 'Not available'}`);
          console.log(`   - Spotify URL: ${spotifyData.spotifyUrl}\n`);
        } else {
          console.log(`❌ Song not found in database: ${songData.title}`);
        }
      } else {
        console.log(`❌ Not found on Spotify: ${songData.title} by ${songData.artist}\n`);
      }
    }

    // Display updated songs
    const allSongs = await Song.find({}).sort({ playCount: -1 });
    
    console.log('\n🎵 UPDATED SONG LIBRARY');
    console.log('═'.repeat(60));
    
    allSongs.forEach((song, index) => {
      console.log(`\n${index + 1}. 🎶 ${song.title}`);
      console.log(`   👨‍🎤 Artist: ${song.artist}`);
      console.log(`   🎵 Spotify ID: ${song.spotifyId || 'Not available'}`);
      console.log(`   🎧 Preview: ${song.previewUrl ? 'Available' : 'Not available'}`);
      console.log(`   🖼️  Album Art: ${song.albumImageUrl ? 'Available' : 'Not available'}`);
      console.log(`   🔗 Spotify URL: ${song.spotifyUrl || 'Not available'}`);
    });

    console.log('\n✅ Spotify integration complete!');
    console.log('🎧 Users can now listen to 30-second previews and open full songs in Spotify!');

  } catch (error) {
    console.error('❌ Error updating songs with Spotify data:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📡 Database connection closed.');
  }
}

// Check if Spotify credentials are configured
if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
  console.log('❌ Spotify credentials not configured!');
  console.log('\n📝 To set up Spotify integration:');
  console.log('1. Go to https://developer.spotify.com/dashboard/');
  console.log('2. Create a new app');
  console.log('3. Copy Client ID and Client Secret');
  console.log('4. Update the .env file with:');
  console.log('   SPOTIFY_CLIENT_ID=your_client_id_here');
  console.log('   SPOTIFY_CLIENT_SECRET=your_client_secret_here');
  console.log('\nThen run this script again.');
  process.exit(1);
}

// Run the update
updateSongsWithSpotifyData();