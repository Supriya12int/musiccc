const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Local storage configuration (for development)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../frontend/public/audio');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.mp3';
    cb(null, 'song-' + uniqueSuffix + ext);
  }
});

// Cloud storage configuration (for production)
const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'musiccc-audio', // Folder name in Cloudinary
    resource_type: 'video', // Use 'video' for audio files
    allowed_formats: ['mp3', 'wav', 'ogg', 'webm'],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      return `song-${uniqueSuffix}`;
    },
  },
});

// Choose storage based on environment
const getStorage = () => {
  const mode = process.env.STORAGE_MODE || 'local';
  console.log(`Using ${mode} storage mode`);
  return mode === 'cloud' ? cloudStorage : localStorage;
};

// Create multer upload middleware
const createUpload = (fieldName) => {
  return multer({
    storage: getStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
      const allowed = /audio\/(mp3|mpeg|wav|ogg|webm)/;
      if (allowed.test(file.mimetype)) return cb(null, true);
      cb(new Error('Invalid audio type'));
    }
  });
};

// Helper function to get file URL
const getFileUrl = (file, req) => {
  const mode = process.env.STORAGE_MODE || 'local';
  
  if (mode === 'cloud') {
    // Return Cloudinary URL
    return file.path; // Cloudinary provides full URL in file.path
  } else {
    // Return local URL
    return `/audio/${file.filename}`;
  }
};

// Helper function to delete file
const deleteFile = async (fileUrl) => {
  const mode = process.env.STORAGE_MODE || 'local';
  
  if (mode === 'cloud') {
    // Extract public_id from Cloudinary URL and delete
    try {
      const urlParts = fileUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const publicId = `musiccc-audio/${filename.split('.')[0]}`;
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
      console.log('Deleted from Cloudinary:', publicId);
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
    }
  } else {
    // Delete local file
    try {
      if (fileUrl.startsWith('/audio/')) {
        const filePath = path.join(__dirname, '../frontend/public', fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('Deleted local file:', filePath);
        }
      }
    } catch (error) {
      console.error('Error deleting local file:', error);
    }
  }
};

module.exports = {
  cloudinary,
  createUpload,
  getFileUrl,
  deleteFile,
  uploadAudio: createUpload('audio'),
  uploadImage: createUpload('image')
};