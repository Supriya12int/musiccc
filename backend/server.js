const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static assets (audio, images, recordings)
const backendPublicDir = path.join(__dirname, 'public');
const frontendPublicDir = path.join(__dirname, '../frontend/public');

// Serve static files from backend/public directory (includes HTML test files)
app.use(express.static(backendPublicDir));
// Serve audio files from backend/public/audio (where our music files are stored)
app.use('/audio', express.static(path.join(backendPublicDir, 'audio')));
// Serve images and recordings from frontend/public (for user uploads)
app.use('/images', express.static(path.join(frontendPublicDir, 'images')));
app.use('/recordings', express.static(path.join(frontendPublicDir, 'recordings')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/music', require('./routes/music'));
app.use('/api/playlists', require('./routes/playlists'));
app.use('/api/artists', require('./routes/artists'));
app.use('/api/events', require('./routes/events'));
app.use('/api/library', require('./routes/library'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/karaoke', require('./routes/karaoke'));
app.use('/api/download', require('./routes/download'));
app.use('/api/spotify', require('./routes/spotify'));
app.use('/api/lyrics', require('./routes/lyrics'));
app.use('/api/podcasts', require('./routes/podcasts'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musiccc', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Music App Backend API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});