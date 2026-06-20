const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  // Token usually comes as: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      token = authHeader.split(' ')[1];

      // Verify token is valid and not expired
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user id to request so later code knows WHO is making this request
      req.userId = decoded.id;

      next(); // move to the actual route logic
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = protect;