const express = require('express');
const { body, validationResult } = require('express-validator');
const Podcast = require('../models/Podcast');
const { artistAuth, auth } = require('../middleware/auth');
const { createUpload, getFileUrl, deleteFile } = require('../services/storageService');

const router = express.Router();

// Upload middleware
const uploadAudio = createUpload('audio');

// @route GET /api/podcasts
// @desc  List podcasts (with optional pagination)
// @access Public
router.get('/', async (req, res) => {
	try {
		const { page = 1, limit = 20 } = req.query;
		const podcasts = await Podcast.find()
			.populate('uploadedBy', 'username')
			.sort({ createdAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit);

		const total = await Podcast.countDocuments();

		res.json({ podcasts, totalPages: Math.ceil(total / limit), currentPage: page, total });
	} catch (error) {
		console.error('Get podcasts error:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

// @route GET /api/podcasts/:id
// @desc  Get single podcast
// @access Public
router.get('/:id', async (req, res) => {
	try {
		const podcast = await Podcast.findById(req.params.id).populate('uploadedBy', 'username');
		if (!podcast) return res.status(404).json({ message: 'Podcast not found' });
		res.json(podcast);
	} catch (error) {
		console.error('Get podcast error:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

// @route POST /api/podcasts/upload-audio
// @desc  Upload podcast audio and return URL
// @access Private/Artist
router.post('/upload-audio', artistAuth, uploadAudio.single('audio'), async (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ message: 'No audio file uploaded' });
		const url = getFileUrl(req.file, req);
		return res.status(201).json({ url });
	} catch (error) {
		console.error('Upload podcast audio error:', error);
		return res.status(500).json({ message: 'Server error' });
	}
});

// @route POST /api/podcasts
// @desc  Create a new podcast entry
// @access Private/Artist
router.post('/', artistAuth, [
	body('title').trim().notEmpty().withMessage('Title is required'),
	body('host').trim().notEmpty().withMessage('Host is required'),
	body('duration').isNumeric().withMessage('Duration must be a number'),
	body('audioUrl').trim().notEmpty().withMessage('Audio URL is required')
], async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

		const podcastData = { ...req.body, uploadedBy: req.user._id };
		const podcast = new Podcast(podcastData);
		await podcast.save();

		res.status(201).json({ message: 'Podcast added successfully', podcast });
	} catch (error) {
		console.error('Add podcast error:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

// @route DELETE /api/podcasts/:id
// @desc  Delete a podcast (uploader or admin)
// @access Private/Artist
router.delete('/:id', artistAuth, async (req, res) => {
	try {
		const podcast = await Podcast.findById(req.params.id);
		if (!podcast) return res.status(404).json({ message: 'Podcast not found' });

		const isOwner = podcast.uploadedBy && podcast.uploadedBy.toString() === req.user._id.toString();
		const isAdmin = req.user.role === 'admin';
		if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not authorized' });

		if (podcast.audioUrl) await deleteFile(podcast.audioUrl);
		if (podcast.coverImage) await deleteFile(podcast.coverImage);

		await podcast.deleteOne();
		res.json({ message: 'Podcast deleted successfully' });
	} catch (error) {
		console.error('Delete podcast error:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

module.exports = router;
