const store = require('../data/store');

/**
 * Express middleware to verify Bearer Token in Authorization header
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  // Validate token format afg_token_<base64_email>_<timestamp> or demo token
  if (!token || !token.startsWith('afg_token_')) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token.'
    });
  }

  try {
    const parts = token.split('_');
    const emailBase64 = parts[2];
    const email = Buffer.from(emailBase64, 'base64').toString('ascii').toLowerCase();

    const user = store.users.find(u => u.email.toLowerCase() === email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User associated with this token no longer exists.'
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    req.rawUser = user;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token parsing failed.'
    });
  }
};

module.exports = {
  verifyToken
};
