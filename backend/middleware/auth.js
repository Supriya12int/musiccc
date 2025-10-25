const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('Auth middleware - Token present:', !!token);
    
    if (!token) {
      console.log('Auth middleware - No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Token decoded:', decoded);
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('Auth middleware - User not found for ID:', decoded.userId);
      return res.status(401).json({ message: 'Token is not valid' });
    }

    console.log('Auth middleware - User found:', user.username);
    req.user = { 
      ...user.toObject(), 
      userId: user._id.toString() 
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid', error: error.message });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Access denied' });
  }
};

const artistAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'artist' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Artist only.' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Access denied' });
  }
};

module.exports = { auth, adminAuth, artistAuth };