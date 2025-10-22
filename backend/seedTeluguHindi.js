const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Song = require('./models/Song');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Telugu and Hindi songs data (without copyrighted lyrics)
const teluguhindisongs = [
  // Telugu Songs
  {
    title: "Butta Bomma",
    artist: "Armaan Malik",
    album: "Ala Vaikunthapurramuloo",
    genre: "Telugu",
    duration: 245,
    releaseYear: 2020,
    audioUrl: "https://example.com/songs/butta-bomma.mp3",
    coverImage: "https://picsum.photos/300/300?random=101",
    lyrics: "",
    tags: ["telugu", "romantic", "melody"]
  },
  {
    title: "Ramuloo Ramulaa",
    artist: "Anurag Kulkarni, Mangli",
    album: "Ala Vaikunthapurramuloo",
    genre: "Telugu",
    duration: 265,
    releaseYear: 2020,
    audioUrl: "https://example.com/songs/ramuloo-ramulaa.mp3",
    coverImage: "https://picsum.photos/300/300?random=102",
    lyrics: "",
    tags: ["telugu", "energetic", "dance"]
  },
  {
    title: "Samajavaragamana",
    artist: "Sid Sriram",
    album: "Ala Vaikunthapurramuloo",
    genre: "Telugu",
    duration: 280,
    releaseYear: 2020,
    audioUrl: "https://example.com/songs/samajavaragamana.mp3",
    coverImage: "https://picsum.photos/300/300?random=103",
    lyrics: "",
    tags: ["telugu", "classical", "melody"]
  },
  {
    title: "Inkem Inkem Inkem Kaavaale",
    artist: "Sid Sriram",
    album: "Geetha Govindam",
    genre: "Telugu",
    duration: 230,
    releaseYear: 2018,
    audioUrl: "https://example.com/songs/inkem-inkem.mp3",
    coverImage: "https://picsum.photos/300/300?random=104",
    lyrics: "",
    tags: ["telugu", "romantic", "popular"]
  },
  {
    title: "Mind Block",
    artist: "Blaaze, Ranina Reddy",
    album: "Sarileru Neekevvaru",
    genre: "Telugu",
    duration: 255,
    releaseYear: 2020,
    audioUrl: "https://example.com/songs/mind-block.mp3",
    coverImage: "https://picsum.photos/300/300?random=105",
    lyrics: "",
    tags: ["telugu", "energetic", "mass"]
  },
  {
    title: "Nee Kannu Neeli Samudram",
    artist: "Sid Sriram",
    album: "Uppena",
    genre: "Telugu",
    duration: 270,
    releaseYear: 2021,
    audioUrl: "https://example.com/songs/nee-kannu.mp3",
    coverImage: "https://picsum.photos/300/300?random=106",
    lyrics: "",
    tags: ["telugu", "romantic", "emotional"]
  },
  {
    title: "Kanti Papa",
    artist: "Shreya Ghosal, Nakash Aziz",
    album: "Uppena",
    genre: "Telugu",
    duration: 240,
    releaseYear: 2021,
    audioUrl: "https://example.com/songs/kanti-papa.mp3",
    coverImage: "https://picsum.photos/300/300?random=107",
    lyrics: "",
    tags: ["telugu", "duet", "melodious"]
  },
  {
    title: "Vachindamma",
    artist: "Sid Sriram, Shreya Ghosal",
    album: "Geetha Govindam",
    genre: "Telugu",
    duration: 235,
    releaseYear: 2018,
    audioUrl: "https://example.com/songs/vachindamma.mp3",
    coverImage: "https://picsum.photos/300/300?random=108",
    lyrics: "",
    tags: ["telugu", "duet", "romantic"]
  },
  {
    title: "Suryudivo Chandrudivo",
    artist: "Shreya Ghosal",
    album: "Sarileru Neekevvaru",
    genre: "Telugu",
    duration: 225,
    releaseYear: 2020,
    audioUrl: "https://example.com/songs/suryudivo.mp3",
    coverImage: "https://picsum.photos/300/300?random=109",
    lyrics: "",
    tags: ["telugu", "classical", "traditional"]
  },
  {
    title: "Seeti Maar",
    artist: "Jaspreet Jasz, Rita",
    album: "Radhe Shyam",
    genre: "Telugu",
    duration: 250,
    releaseYear: 2022,
    audioUrl: "https://example.com/songs/seeti-maar.mp3",
    coverImage: "https://picsum.photos/300/300?random=110",
    lyrics: "",
    tags: ["telugu", "energetic", "dance"]
  },
  {
    title: "Ala Vaikunthapurramuloo Title Track",
    artist: "Thaman S",
    album: "Ala Vaikunthapurramuloo",
    genre: "Telugu",
    duration: 275,
    releaseYear: 2020,
    audioUrl: "https://example.com/songs/ala-vaikunthapurramuloo.mp3",
    coverImage: "https://picsum.photos/300/300?random=111",
    lyrics: "",
    tags: ["telugu", "theme", "powerful"]
  },
  {
    title: "Srivalli",
    artist: "Sid Sriram",
    album: "Pushpa",
    genre: "Telugu",
    duration: 260,
    releaseYear: 2021,
    audioUrl: "https://example.com/songs/srivalli.mp3",
    coverImage: "https://picsum.photos/300/300?random=112",
    lyrics: "",
    tags: ["telugu", "romantic", "trending"]
  },
  {
    title: "Butta Bomma (Female Version)",
    artist: "Madhu Priya",
    album: "Ala Vaikunthapurramuloo",
    genre: "Telugu",
    duration: 245,
    releaseYear: 2020,
    audioUrl: "https://example.com/songs/butta-bomma-female.mp3",
    coverImage: "https://picsum.photos/300/300?random=113",
    lyrics: "",
    tags: ["telugu", "female", "romantic"]
  },
  {
    title: "Nuvve Nuvve",
    artist: "Hariharan",
    album: "Classic Telugu",
    genre: "Telugu",
    duration: 300,
    releaseYear: 2019,
    audioUrl: "https://example.com/songs/nuvve-nuvve.mp3",
    coverImage: "https://picsum.photos/300/300?random=114",
    lyrics: "",
    tags: ["telugu", "classic", "melody"]
  },
  {
    title: "Ee Vasthavam",
    artist: "Armaan Malik",
    album: "Modern Telugu",
    genre: "Telugu",
    duration: 220,
    releaseYear: 2021,
    audioUrl: "https://example.com/songs/ee-vasthavam.mp3",
    coverImage: "https://picsum.photos/300/300?random=115",
    lyrics: "",
    tags: ["telugu", "contemporary", "smooth"]
  },
  {
    title: "Hello Guru Prema Kosame",
    artist: "Anurag Kulkarni",
    album: "Hello Guru Prema Kosame",
    genre: "Telugu",
    duration: 240,
    releaseYear: 2018,
    audioUrl: "https://example.com/songs/hello-guru.mp3",
    coverImage: "https://picsum.photos/300/300?random=116",
    lyrics: "",
    tags: ["telugu", "romantic", "modern"]
  },
  {
    title: "Jala Jala Jalapaatham Nuvvu",
    artist: "Haricharan",
    album: "Telugu Hits",
    genre: "Telugu",
    duration: 285,
    releaseYear: 2020,
    audioUrl: "https://example.com/songs/jala-jala.mp3",
    coverImage: "https://picsum.photos/300/300?random=117",
    lyrics: "",
    tags: ["telugu", "melodious", "emotional"]
  },
  {
    title: "Choosi Chudangane",
    artist: "Armaan Malik",
    album: "Chalo",
    genre: "Telugu",
    duration: 235,
    releaseYear: 2018,
    audioUrl: "https://example.com/songs/choosi-chudangane.mp3",
    coverImage: "https://picsum.photos/300/300?random=118",
    lyrics: "",
    tags: ["telugu", "romantic", "youthful"]
  },
  {
    title: "Oohalu Oorege Gaalanthaa",
    artist: "Karthik",
    album: "Telugu Classics",
    genre: "Telugu",
    duration: 295,
    releaseYear: 2019,
    audioUrl: "https://example.com/songs/oohalu-oorege.mp3",
    coverImage: "https://picsum.photos/300/300?random=119",
    lyrics: "",
    tags: ["telugu", "nostalgic", "beautiful"]
  },
  {
    title: "Maro Prapancham",
    artist: "Sid Sriram",
    album: "Modern Telugu",
    genre: "Telugu",
    duration: 250,
    releaseYear: 2021,
    audioUrl: "https://example.com/songs/maro-prapancham.mp3",
    coverImage: "https://picsum.photos/300/300?random=120",
    lyrics: "",
    tags: ["telugu", "contemporary", "soulful"]
  },

  // Hindi Songs
  {
    title: "Kesariya",
    artist: "Arijit Singh",
    album: "Brahmastra",
    genre: "Hindi",
    duration: 280,
    releaseYear: 2022,
    audioUrl: "https://example.com/songs/kesariya.mp3",
    coverImage: "https://picsum.photos/300/300?random=201",
    lyrics: "",
    tags: ["hindi", "romantic", "trending"]
  },
  {
    title: "Tum Hi Ho",
    artist: "Arijit Singh",
    album: "Aashiqui 2",
    genre: "Hindi",
    duration: 265,
    releaseYear: 2013,
    audioUrl: "https://example.com/songs/tum-hi-ho.mp3",
    coverImage: "https://picsum.photos/300/300?random=202",
    lyrics: "",
    tags: ["hindi", "romantic", "classic"]
  },
  {
    title: "Ghungroo",
    artist: "Arijit Singh, Shilpa Rao",
    album: "War",
    genre: "Hindi",
    duration: 295,
    releaseYear: 2019,
    audioUrl: "https://example.com/songs/ghungroo.mp3",
    coverImage: "https://picsum.photos/300/300?random=203",
    lyrics: "",
    tags: ["hindi", "duet", "energetic"]
  },
  {
    title: "Apna Bana Le",
    artist: "Arijit Singh",
    album: "Bhediya",
    genre: "Hindi",
    duration: 240,
    releaseYear: 2022,
    audioUrl: "https://example.com/songs/apna-bana-le.mp3",
    coverImage: "https://picsum.photos/300/300?random=204",
    lyrics: "",
    tags: ["hindi", "romantic", "modern"]
  },
  {
    title: "Tera Ban Jaunga",
    artist: "Akhil Sachdeva, Tulsi Kumar",
    album: "Kabir Singh",
    genre: "Hindi",
    duration: 275,
    releaseYear: 2019,
    audioUrl: "https://example.com/songs/tera-ban-jaunga.mp3",
    coverImage: "https://picsum.photos/300/300?random=205",
    lyrics: "",
    tags: ["hindi", "romantic", "emotional"]
  },
  {
    title: "Raataan Lambiyan",
    artist: "Jubin Nautiyal, Asees Kaur",
    album: "Shershaah",
    genre: "Hindi",
    duration: 255,
    releaseYear: 2021,
    audioUrl: "https://example.com/songs/raataan-lambiyan.mp3",
    coverImage: "https://picsum.photos/300/300?random=206",
    lyrics: "",
    tags: ["hindi", "duet", "melodious"]
  },
  {
    title: "Dil Diyan Gallan",
    artist: "Atif Aslam",
    album: "Tiger Zinda Hai",
    genre: "Hindi",
    duration: 245,
    releaseYear: 2017,
    audioUrl: "https://example.com/songs/dil-diyan-gallan.mp3",
    coverImage: "https://picsum.photos/300/300?random=207",
    lyrics: "",
    tags: ["hindi", "romantic", "soothing"]
  },
  {
    title: "Tujh Mein Rab Dikhta Hai",
    artist: "Roop Kumar Rathod",
    album: "Rab Ne Bana Di Jodi",
    genre: "Hindi",
    duration: 290,
    releaseYear: 2008,
    audioUrl: "https://example.com/songs/tujh-mein-rab.mp3",
    coverImage: "https://picsum.photos/300/300?random=208",
    lyrics: "",
    tags: ["hindi", "spiritual", "romantic"]
  },
  {
    title: "Kabira",
    artist: "Arijit Singh, Harshdeep Kaur",
    album: "Yeh Jawaani Hai Deewani",
    genre: "Hindi",
    duration: 260,
    releaseYear: 2013,
    audioUrl: "https://example.com/songs/kabira.mp3",
    coverImage: "https://picsum.photos/300/300?random=209",
    lyrics: "",
    tags: ["hindi", "sufi", "spiritual"]
  },
  {
    title: "Pal",
    artist: "Arijit Singh, Shreya Ghosal",
    album: "Jalebi",
    genre: "Hindi",
    duration: 235,
    releaseYear: 2018,
    audioUrl: "https://example.com/songs/pal.mp3",
    coverImage: "https://picsum.photos/300/300?random=210",
    lyrics: "",
    tags: ["hindi", "duet", "emotional"]
  },
  {
    title: "Tum Se Hi",
    artist: "Mohit Chauhan",
    album: "Jab We Met",
    genre: "Hindi",
    duration: 270,
    releaseYear: 2007,
    audioUrl: "https://example.com/songs/tum-se-hi.mp3",
    coverImage: "https://picsum.photos/300/300?random=211",
    lyrics: "",
    tags: ["hindi", "classic", "romantic"]
  },
  {
    title: "Channa Mereya",
    artist: "Arijit Singh",
    album: "Ae Dil Hai Mushkil",
    genre: "Hindi",
    duration: 285,
    releaseYear: 2016,
    audioUrl: "https://example.com/songs/channa-mereya.mp3",
    coverImage: "https://picsum.photos/300/300?random=212",
    lyrics: "",
    tags: ["hindi", "sad", "emotional"]
  },
  {
    title: "Humnava Mere",
    artist: "Jubin Nautiyal",
    album: "Hamari Adhuri Kahani",
    genre: "Hindi",
    duration: 250,
    releaseYear: 2015,
    audioUrl: "https://example.com/songs/humnava-mere.mp3",
    coverImage: "https://picsum.photos/300/300?random=213",
    lyrics: "",
    tags: ["hindi", "romantic", "soulful"]
  },
  {
    title: "Shayad",
    artist: "Arijit Singh",
    album: "Love Aaj Kal",
    genre: "Hindi",
    duration: 225,
    releaseYear: 2020,
    audioUrl: "https://example.com/songs/shayad.mp3",
    coverImage: "https://picsum.photos/300/300?random=214",
    lyrics: "",
    tags: ["hindi", "romantic", "contemporary"]
  },
  {
    title: "Bekhayali",
    artist: "Sachet Tandon",
    album: "Kabir Singh",
    genre: "Hindi",
    duration: 305,
    releaseYear: 2019,
    audioUrl: "https://example.com/songs/bekhayali.mp3",
    coverImage: "https://picsum.photos/300/300?random=215",
    lyrics: "",
    tags: ["hindi", "sad", "intense"]
  },
  {
    title: "Dil Bechara Title Track",
    artist: "A.R. Rahman",
    album: "Dil Bechara",
    genre: "Hindi",
    duration: 240,
    releaseYear: 2020,
    audioUrl: "https://example.com/songs/dil-bechara.mp3",
    coverImage: "https://picsum.photos/300/300?random=216",
    lyrics: "",
    tags: ["hindi", "inspiring", "emotional"]
  },
  {
    title: "Kaun Tujhe",
    artist: "Palak Muchhal",
    album: "M.S. Dhoni",
    genre: "Hindi",
    duration: 230,
    releaseYear: 2016,
    audioUrl: "https://example.com/songs/kaun-tujhe.mp3",
    coverImage: "https://picsum.photos/300/300?random=217",
    lyrics: "",
    tags: ["hindi", "romantic", "female"]
  },
  {
    title: "Tera Yaar Hoon Main",
    artist: "Arijit Singh",
    album: "Sonu Ke Titu Ki Sweety",
    genre: "Hindi",
    duration: 265,
    releaseYear: 2018,
    audioUrl: "https://example.com/songs/tera-yaar-hoon.mp3",
    coverImage: "https://picsum.photos/300/300?random=218",
    lyrics: "",
    tags: ["hindi", "friendship", "emotional"]
  },
  {
    title: "Khairiyat",
    artist: "Arijit Singh",
    album: "Chhichhore",
    genre: "Hindi",
    duration: 275,
    releaseYear: 2019,
    audioUrl: "https://example.com/songs/khairiyat.mp3",
    coverImage: "https://picsum.photos/300/300?random=219",
    lyrics: "",
    tags: ["hindi", "emotional", "nostalgic"]
  },
  {
    title: "Roke Na Ruke Naina",
    artist: "Arijit Singh",
    album: "Badrinath Ki Dulhania",
    genre: "Hindi",
    duration: 255,
    releaseYear: 2017,
    audioUrl: "https://example.com/songs/roke-na-ruke.mp3",
    coverImage: "https://picsum.photos/300/300?random=220",
    lyrics: "",
    tags: ["hindi", "romantic", "melodious"]
  }
];

const seedTeluguHindiSongs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc');
    console.log('Connected to MongoDB');

    // Clear existing songs
    await Song.deleteMany({});
    console.log('Cleared existing songs');

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

    // Add uploadedBy field and random play counts
    const songsWithMetadata = teluguhindisongs.map(song => ({
      ...song,
      uploadedBy: adminUser._id,
      playCount: Math.floor(Math.random() * 50000) // Random play counts up to 50k
    }));

    // Insert songs
    const insertedSongs = await Song.insertMany(songsWithMetadata);
    console.log(`✅ Successfully added ${insertedSongs.length} Telugu and Hindi songs`);

    // Display summary
    console.log('\n📊 Database Summary:');
    console.log(`Total Songs: ${await Song.countDocuments()}`);
    console.log(`Total Users: ${await User.countDocuments()}`);
    
    const teluguCount = await Song.countDocuments({ genre: 'Telugu' });
    const hindiCount = await Song.countDocuments({ genre: 'Hindi' });
    console.log(`Telugu Songs: ${teluguCount}`);
    console.log(`Hindi Songs: ${hindiCount}`);

    console.log('\n🎵 Popular Telugu Artists:');
    const teluguArtists = [...new Set(teluguhindisongs.filter(s => s.genre === 'Telugu').map(s => s.artist))];
    teluguArtists.slice(0, 10).forEach(artist => console.log(`- ${artist}`));

    console.log('\n🎵 Popular Hindi Artists:');
    const hindiArtists = [...new Set(teluguhindisongs.filter(s => s.genre === 'Hindi').map(s => s.artist))];
    hindiArtists.slice(0, 10).forEach(artist => console.log(`- ${artist}`));

    console.log('\n🔐 Admin Login Credentials:');
    console.log('Email: admin@musiccc.com');
    console.log('Password: admin123');

    console.log('\n✨ Telugu and Hindi songs database ready!');
    console.log('You can now enjoy your favorite regional music!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeding script
seedTeluguHindiSongs();