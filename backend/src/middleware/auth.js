const User = require('../models/User');

/**
 * Express middleware to verify Bearer Token in Authorization header
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

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

    let user = await User.findOne({ email });

    if (!user) {
      // Auto-restore session for registered member in DB
      const rawName = email.split('@')[0];
      const fullName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      const isStaffAdmin = email.includes('admin');
      const isTrainer = email.includes('trainer');
      let role = 'user';
      if (isStaffAdmin) role = 'admin';
      else if (isTrainer) role = 'trainer';

      const newId = 'usr_' + Buffer.from(email).toString('hex').slice(0, 10);
      const code = 'AFG-QR-' + Math.floor(100000 + Math.random() * 900000) + '-' + fullName.toUpperCase();

      user = await User.create({
        id: newId,
        fullName: fullName || (isTrainer ? 'Master Trainer' : 'Gym Member'),
        email: email,
        password: 'password123',
        phone: '(555) 234-5678',
        membershipPlan: isStaffAdmin ? 'Staff Admin' : (isTrainer ? 'Elite Master Trainer' : 'Pro Athlete VIP'),
        membershipId: code,
        qrCode: code,
        role: role,
        status: 'ACTIVE_MEMBER',
        joinedDate: new Date().toISOString().split('T')[0],
        emergencyContact: 'Not provided',
        fitnessGoal: 'General Health & Fitness',
        totalCheckIns: 5,
        rewardPoints: 250,
        workoutStreakDays: 3
      });
    }

    const userObj = user.toObject();
    delete userObj.password;

    req.user = userObj;
    req.rawUser = userObj;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token parsing failed.'
    });
  }
};

/**
 * Role-Based Access Control (RBAC) middleware
 */
const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    const userRole = req.user.role || (req.user.email?.includes('admin') ? 'admin' : (req.user.email?.includes('trainer') ? 'trainer' : 'user'));
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${allowedRoles.join(' or ')} permission required.`
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  verifyRole
};
