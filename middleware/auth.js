const jwt = require('jsonwebtoken');

// Middleware function to verify a jwt token in a request
module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // verify token
  try {
    // used to decode the token and store that info in decoded
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // add user onto request
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
