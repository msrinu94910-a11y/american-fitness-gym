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

    let user = store.users.find(u => u.email.toLowerCase() === email);

    if (!user) {
      // Auto-restore session for registered member across server restarts
      const rawName = email.split('@')[0];
      const fullName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      const isStaffAdmin = email.includes('admin');

      user = {
        id: 'usr_' + Buffer.from(email).toString('hex').slice(0, 10),
        fullName: fullName || 'Gym Member',
        email: email,
        password: 'password123',
        phone: '(555) 234-5678',
        membershipPlan: isStaffAdmin ? 'Staff Admin' : 'Pro Athlete VIP',
        role: isStaffAdmin ? 'admin' : 'user',
        status: 'ACTIVE_MEMBER',
        joinedDate: new Date().toISOString().split('T')[0],
        qrCode: 'AFG-QR-' + Math.floor(100000 + Math.random() * 900000) + '-' + fullName.toUpperCase(),
        emergencyContact: 'Not provided',
        fitnessGoal: 'General Health & Fitness',
        totalCheckIns: 5,
        rewardPoints: 250,
        workoutStreakDays: 3
      };
      store.users.push(user);
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
