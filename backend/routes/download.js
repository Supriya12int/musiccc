const express = require('express');
const router = express.Router();
const youtubedl = require('youtube-dl-exec');
const path = require('path');
const fs = require('fs');
const { artistAuth } = require('../middleware/auth');

// @route   POST /api/download/youtube
// @desc    Download audio from YouTube URL and save to public/audio
// @access  Private/Artist
router.post('/youtube', artistAuth, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'YouTube URL is required' });
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|m\.youtube\.com\/watch\?v=)/;
    if (!youtubeRegex.test(url)) {
      return res.status(400).json({ message: 'Invalid YouTube URL' });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const outputDir = path.join(__dirname, '../../frontend/public/audio');
    
    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Get video info first
    console.log('Getting video info...');
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: ['referer:youtube.com', 'user-agent:googlebot']
    });

    const title = info.title ? info.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') : 'video';
    const filename = `${title}_${uniqueSuffix}.mp3`;
    const outputPath = path.join(outputDir, filename);

    console.log('Downloading audio...');
    
    // Download and extract audio
    await youtubedl(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      audioQuality: '192K',
      output: outputPath.replace('.mp3', '.%(ext)s'),
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: ['referer:youtube.com', 'user-agent:googlebot']
    });

    // Check if file was created
    if (fs.existsSync(outputPath)) {
      console.log('Download completed:', filename);
      return res.status(201).json({
        url: `/audio/${filename}`,
        title: info.title || 'Downloaded Song',
        duration: parseInt(info.duration) || 180,
        thumbnail: info.thumbnail || ''
      });
    } else {
      throw new Error('File was not created');
    }

  } catch (error) {
    console.error('YouTube download error:', error);
    return res.status(500).json({ 
      message: 'Failed to download from YouTube. The video might be restricted or unavailable.',
      error: error.message 
    });
  }
});

// @route   POST /api/download/url
// @desc    Download audio from any URL and save to public/audio
// @access  Private/Artist
router.post('/url', artistAuth, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'Audio URL is required' });
    }

    // Validate URL format
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(url)) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    const axios = require('axios');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(url).split('?')[0] || '.mp3';
    const filename = `downloaded-${uniqueSuffix}${ext}`;
    const outputDir = path.join(__dirname, '../../frontend/public/audio');
    const outputPath = path.join(outputDir, filename);

    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Download the file
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 60000, // 60 seconds
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      return res.status(201).json({
        url: `/audio/${filename}`,
        message: 'Audio downloaded successfully'
      });
    });

    writer.on('error', (err) => {
      console.error('File write error:', err);
      return res.status(500).json({ message: 'Failed to save audio file' });
    });

  } catch (error) {
    console.error('URL download error:', error);
    return res.status(500).json({ 
      message: 'Failed to download from URL', 
      error: error.message 
    });
  }
});

module.exports = router;
