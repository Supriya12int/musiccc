const express = require('express');
const router = express.Router();
const spotifyService = require('../services/spotifyService');
const Song = require('../models/Song');
const { artistAuth } = require('../middleware/auth');

// @route   GET /api/spotify/search
// @desc    Search Spotify for tracks
// @access  Private
router.get('/search', artistAuth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const token = await spotifyService.getAccessToken();
    
    const response = await require('axios').get('https://api.spotify.com/v1/search', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        q: q,
        type: 'track',
        limit: 20
      }
    });

    const tracks = response.data.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name || 'Unknown Artist',
      album: track.album.name,
      duration: Math.round(track.duration_ms / 1000),
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls.spotify,
      albumImageUrl: track.album.images?.[0]?.url,
      popularity: track.popularity,
      explicit: track.explicit,
      spotifyUri: track.uri
    }));

    res.json({ tracks });
  } catch (error) {
    console.error('Spotify search error:', error);
    res.status(500).json({ 
      message: 'Failed to search Spotify',
      error: error.message 
    });
  }
});

// @route   POST /api/spotify/import
// @desc    Import a song from Spotify to the database
// @access  Private/Artist
router.post('/import', artistAuth, async (req, res) => {
  try {
    const { spotifyTrack, lyrics } = req.body;

    if (!spotifyTrack || !spotifyTrack.id) {
      return res.status(400).json({ message: 'Spotify track data is required' });
    }

    // Check if song already exists
    const existingSong = await Song.findOne({ spotifyId: spotifyTrack.id });
    if (existingSong) {
      return res.status(409).json({ 
        message: 'This song is already in the database',
        song: existingSong
      });
    }

    // Create new song from Spotify data
    const songData = {
      title: spotifyTrack.name,
      artist: spotifyTrack.artist,
      album: spotifyTrack.album || '',
      genre: 'Pop', // Default genre, can be updated later
      duration: spotifyTrack.duration,
      audioUrl: spotifyTrack.previewUrl || '', // Spotify preview URL (30 second clip)
      spotifyId: spotifyTrack.id,
      spotifyUri: spotifyTrack.spotifyUri,
      previewUrl: spotifyTrack.previewUrl,
      spotifyUrl: spotifyTrack.spotifyUrl,
      popularity: spotifyTrack.popularity,
      albumImageUrl: spotifyTrack.albumImageUrl,
      coverImage: spotifyTrack.albumImageUrl,
      lyrics: lyrics || '',
      uploadedBy: req.user._id
    };

    const song = new Song(songData);
    await song.save();

    res.status(201).json({
      message: 'Song imported from Spotify successfully',
      song
    });
  } catch (error) {
    console.error('Spotify import error:', error);
    res.status(500).json({ 
      message: 'Failed to import from Spotify',
      error: error.message 
    });
  }
});

// @route   GET /api/spotify/track/:id
// @desc    Get Spotify track details
// @access  Private
router.get('/track/:id', artistAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const track = await spotifyService.getTrack(id);
    
    if (!track) {
      return res.status(404).json({ message: 'Track not found on Spotify' });
    }

    const formattedTrack = {
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name || 'Unknown Artist',
      album: track.album.name,
      duration: Math.round(track.duration_ms / 1000),
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls.spotify,
      albumImageUrl: track.album.images?.[0]?.url,
      popularity: track.popularity,
      explicit: track.explicit,
      spotifyUri: track.uri
    };

    res.json(formattedTrack);
  } catch (error) {
    console.error('Get Spotify track error:', error);
    res.status(500).json({ 
      message: 'Failed to get track from Spotify',
      error: error.message 
    });
  }
});

module.exports = router;