const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Song = require('../models/Song');

const router = express.Router();

// @route   GET /api/artists/popular
// @desc    Get popular artists
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const popularArtists = await Song.aggregate([
      {
        $group: {
          _id: '$artist',
          totalPlays: { $sum: '$playCount' },
          songCount: { $sum: 1 },
          genres: { $addToSet: '$genre' },
          latestSong: { $max: '$createdAt' }
        }
      },
      {
        $sort: { totalPlays: -1 }
      },
      {
        $limit: 20
      },
      {
        $project: {
          name: '$_id',
          totalPlays: 1,
          songCount: 1,
          genres: 1,
          latestSong: 1,
          _id: 0
        }
      }
    ]);

    res.json(popularArtists);
  } catch (error) {
    console.error('Get popular artists error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/artists/search
// @desc    Search artists
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const artists = await Song.aggregate([
      {
        $match: {
          artist: { $regex: query, $options: 'i' }
        }
      },
      {
        $group: {
          _id: '$artist',
          totalPlays: { $sum: '$playCount' },
          songCount: { $sum: 1 },
          genres: { $addToSet: '$genre' }
        }
      },
      {
        $project: {
          name: '$_id',
          totalPlays: 1,
          songCount: 1,
          genres: 1,
          _id: 0
        }
      },
      {
        $sort: { totalPlays: -1 }
      }
    ]);

    res.json(artists);
  } catch (error) {
    console.error('Search artists error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/artists/follow
// @desc    Follow an artist
// @access  Private
router.post('/follow', auth, async (req, res) => {
  try {
    const { artistName } = req.body;

    if (!artistName) {
      return res.status(400).json({ message: 'Artist name is required' });
    }

    // Check if artist exists in songs
    const artistExists = await Song.findOne({ artist: artistName });
    if (!artistExists) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    const user = await User.findById(req.user._id);
    
    // Check if already following
    const isAlreadyFollowing = user.followedArtists.some(
      artist => artist.name.toLowerCase() === artistName.toLowerCase()
    );

    if (isAlreadyFollowing) {
      return res.status(400).json({ message: 'Already following this artist' });
    }

    // Add artist to followed list
    user.followedArtists.push({
      name: artistName,
      followedAt: new Date()
    });

    await user.save();

    res.json({
      message: 'Successfully followed artist',
      artist: artistName,
      followedArtists: user.followedArtists
    });
  } catch (error) {
    console.error('Follow artist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/artists/unfollow
// @desc    Unfollow an artist
// @access  Private
router.delete('/unfollow', auth, async (req, res) => {
  try {
    const { artistName } = req.body;

    if (!artistName) {
      return res.status(400).json({ message: 'Artist name is required' });
    }

    const user = await User.findById(req.user._id);
    
    // Remove artist from followed list
    user.followedArtists = user.followedArtists.filter(
      artist => artist.name.toLowerCase() !== artistName.toLowerCase()
    );

    await user.save();

    res.json({
      message: 'Successfully unfollowed artist',
      artist: artistName,
      followedArtists: user.followedArtists
    });
  } catch (error) {
    console.error('Unfollow artist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/artists/followed
// @desc    Get user's followed artists
// @access  Private
router.get('/followed', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('followedArtists');
    
    // Get additional info for each followed artist
    const followedArtistsWithInfo = await Promise.all(
      user.followedArtists.map(async (followedArtist) => {
        const artistInfo = await Song.aggregate([
          {
            $match: { artist: followedArtist.name }
          },
          {
            $group: {
              _id: '$artist',
              totalPlays: { $sum: '$playCount' },
              songCount: { $sum: 1 },
              genres: { $addToSet: '$genre' },
              latestSong: { $max: '$createdAt' }
            }
          }
        ]);

        return {
          name: followedArtist.name,
          followedAt: followedArtist.followedAt,
          ...artistInfo[0] || { totalPlays: 0, songCount: 0, genres: [] }
        };
      })
    );

    res.json(followedArtistsWithInfo);
  } catch (error) {
    console.error('Get followed artists error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/artists/:name/songs
// @desc    Get songs by a specific artist
// @access  Public
router.get('/:name/songs', async (req, res) => {
  try {
    const { name } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const songs = await Song.find({ 
      artist: { $regex: new RegExp('^' + name + '$', 'i') }
    })
      .sort({ playCount: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Song.countDocuments({ 
      artist: { $regex: new RegExp('^' + name + '$', 'i') }
    });

    res.json({
      songs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get artist songs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/artists/check-following
// @desc    Check if user is following specific artists
// @access  Private
router.post('/check-following', auth, async (req, res) => {
  try {
    const { artistNames } = req.body;

    if (!Array.isArray(artistNames)) {
      return res.status(400).json({ message: 'Artist names should be an array' });
    }

    const user = await User.findById(req.user._id).select('followedArtists');
    
    const followingStatus = artistNames.reduce((acc, artistName) => {
      const isFollowing = user.followedArtists.some(
        artist => artist.name.toLowerCase() === artistName.toLowerCase()
      );
      acc[artistName] = isFollowing;
      return acc;
    }, {});

    res.json(followingStatus);
  } catch (error) {
    console.error('Check following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;