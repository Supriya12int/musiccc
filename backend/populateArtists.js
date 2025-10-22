const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/musiccc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Create Artist schema and model
const artistSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  genres: [String],
  songCount: { type: Number, default: 0 },
  totalPlays: { type: Number, default: 0 },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bio: String,
  imageUrl: String,
  isPopular: { type: Boolean, default: false }
}, {
  timestamps: true
});

const Artist = mongoose.model('Artist', artistSchema);

// Sample artists data
const sampleArtists = [
  {
    name: "Arijit Singh",
    genres: ["Bollywood", "Romantic", "Pop"],
    songCount: 2,
    totalPlays: 125000,
    bio: "One of the most popular playback singers in Indian cinema",
    isPopular: true
  },
  {
    name: "Sid Sriram", 
    genres: ["Telugu", "Tamil", "Soul"],
    songCount: 1,
    totalPlays: 89000,
    bio: "American-Indian musician known for his soulful voice",
    isPopular: true
  },
  {
    name: "Anurag Kulkarni",
    genres: ["Telugu", "Folk", "Pop"],
    songCount: 1,
    totalPlays: 67000,
    bio: "Popular Telugu playback singer",
    isPopular: true
  },
  {
    name: "Aditya Rikhari",
    genres: ["Hindi", "Folk", "Indie"],
    songCount: 1,
    totalPlays: 45000,
    bio: "Versatile playback singer and music composer",
    isPopular: false
  },
  {
    name: "Jubin Nautiyal",
    genres: ["Bollywood", "Romantic", "Pop"],
    songCount: 1,
    totalPlays: 98000,
    bio: "Popular Bollywood playback singer",
    isPopular: true
  },
  {
    name: "Asees Kaur",
    genres: ["Bollywood", "Punjabi", "Pop"],
    songCount: 1,
    totalPlays: 78000,
    bio: "Talented female playback singer",
    isPopular: true
  },
  {
    name: "Shreya Ghoshal",
    genres: ["Bollywood", "Classical", "Regional"],
    songCount: 0,
    totalPlays: 250000,
    bio: "Legendary playback singer with multiple awards",
    isPopular: true
  },
  {
    name: "Armaan Malik",
    genres: ["Bollywood", "Pop", "R&B"],
    songCount: 0,
    totalPlays: 180000,
    bio: "Young and versatile playback singer",
    isPopular: true
  },
  {
    name: "Rahat Fateh Ali Khan",
    genres: ["Qawwali", "Sufi", "Bollywood"],
    songCount: 0,
    totalPlays: 200000,
    bio: "Renowned qawwali and sufi singer",
    isPopular: true
  },
  {
    name: "Atif Aslam",
    genres: ["Pop", "Rock", "Bollywood"],
    songCount: 0,
    totalPlays: 195000,
    bio: "Pakistani singer popular in Bollywood",
    isPopular: true
  }
];

async function populateArtists() {
  try {
    console.log('🎤 Populating artists database...\n');

    // Clear existing artists
    await Artist.deleteMany({});
    console.log('🗑️  Cleared existing artists');

    // Add sample artists
    for (const artistData of sampleArtists) {
      const artist = new Artist(artistData);
      await artist.save();
      console.log(`✅ Added: ${artistData.name} (${artistData.genres.join(', ')})`);
    }

    // Display final artists list
    const allArtists = await Artist.find({}).sort({ totalPlays: -1 });
    
    console.log('\n🎵 ARTISTS DATABASE');
    console.log('═'.repeat(60));
    
    allArtists.forEach((artist, index) => {
      console.log(`\n${index + 1}. 🎤 ${artist.name}`);
      console.log(`   🎼 Genres: ${artist.genres.join(', ')}`);
      console.log(`   🎵 Songs: ${artist.songCount}`);
      console.log(`   📊 Plays: ${artist.totalPlays.toLocaleString()}`);
      console.log(`   ⭐ Popular: ${artist.isPopular ? 'Yes' : 'No'}`);
    });

    console.log(`\n📊 Total artists: ${allArtists.length}`);
    console.log('✅ Artists database populated successfully!');
    console.log('🎯 You can now browse artists in your app!');

  } catch (error) {
    console.error('❌ Error populating artists:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n📡 Database connection closed.');
  }
}

populateArtists();