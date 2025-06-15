const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    req.user = jwt.verify(token, 'your_secret_key'); 
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};