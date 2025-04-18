const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); 
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error); 
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.restrictTo = (role) => {
  return (req, res, next) => {
    if (role === 'store_owner' && !req.user.isStoreOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};