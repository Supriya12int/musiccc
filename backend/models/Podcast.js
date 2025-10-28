const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true
	},
	host: {
		type: String,
		required: true,
		trim: true
	},
	description: {
		type: String,
		trim: true,
		default: ''
	},
	duration: {
		type: Number, // seconds
		required: true
	},
	audioUrl: {
		type: String,
		required: true
	},
	coverImage: {
		type: String,
		default: ''
	},
	tags: [String],
	playCount: {
		type: Number,
		default: 0
	},
	uploadedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}
}, {
	timestamps: true
});

podcastSchema.index({ title: 'text', host: 'text' });

module.exports = mongoose.model('Podcast', podcastSchema);
