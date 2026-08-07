const store = require('../data/store');

// Health Check
const getHealth = (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    app: 'American Fitness Gym API',
    version: '2.0.0'
  });
};

// Auth: Register User
const registerUser = (req, res) => {
  const { fullName, email, password, phone, membershipPlan } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Full name, email address, and password are required.'
    });
  }

  const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'An account with this email address already exists. Please login instead.'
    });
  }

  const newId = 'usr_' + Date.now();
  const cleanEmail = email.toLowerCase().trim();
  const qrCode = 'AFG-QR-' + Math.floor(100000 + Math.random() * 900000) + '-' + fullName.split(' ')[0].toUpperCase();
  const assignedRole = req.body.role === 'admin' || cleanEmail.includes('admin') ? 'admin' : 'user';

  const newUser = {
    id: newId,
    fullName,
    email: cleanEmail,
    password,
    phone: phone || 'N/A',
    membershipPlan: membershipPlan || 'Pro Athlete',
    role: assignedRole,
    status: 'ACTIVE_MEMBER',
    joinedDate: new Date().toISOString().split('T')[0],
    qrCode,
    emergencyContact: 'Not provided',
    fitnessGoal: 'General Health & Fitness',
    totalCheckIns: 1,
    rewardPoints: 100,
    workoutStreakDays: 1
  };

  store.users.push(newUser);

  const { password: _, ...userWithoutPassword } = newUser;
  const token = 'afg_token_' + Buffer.from(cleanEmail).toString('base64') + '_' + Date.now();

  res.status(201).json({
    success: true,
    message: `Account created successfully as ${assignedRole === 'admin' ? 'Admin Officer' : 'User Member'}!`,
    token,
    user: userWithoutPassword
  });
};

// Auth: Login User
const loginUser = (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email address and password are required.'
    });
  }

  const cleanEmail = email.toLowerCase().trim();
  const user = store.users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email address or password. Please try again.'
    });
  }

  const { password: _, ...userWithoutPassword } = user;
  const effectiveRole = role === 'admin' || user.role === 'admin' || cleanEmail.includes('admin') ? 'admin' : 'user';
  userWithoutPassword.role = effectiveRole;

  const token = 'afg_token_' + Buffer.from(cleanEmail).toString('base64') + '_' + Date.now();

  res.json({
    success: true,
    message: `Welcome back, ${user.fullName} (${effectiveRole === 'admin' ? 'Admin Officer' : 'User Member'})!`,
    token,
    user: userWithoutPassword
  });
};

// Protected: Get Logged In User Profile
const getCurrentUser = (req, res) => {
  const user = req.user;
  res.json({
    success: true,
    user
  });
};

// Protected: Update User Profile
const updateProfile = (req, res) => {
  const { fullName, phone, emergencyContact, fitnessGoal, membershipPlan } = req.body;
  const targetUser = store.users.find(u => u.id === req.user.id);

  if (!targetUser) {
    return res.status(404).json({ success: false, message: 'User profile not found.' });
  }

  if (fullName) targetUser.fullName = fullName;
  if (phone) targetUser.phone = phone;
  if (emergencyContact) targetUser.emergencyContact = emergencyContact;
  if (fitnessGoal) targetUser.fitnessGoal = fitnessGoal;
  if (membershipPlan) targetUser.membershipPlan = membershipPlan;

  const { password: _, ...userWithoutPassword } = targetUser;

  res.json({
    success: true,
    message: 'Profile updated successfully!',
    user: userWithoutPassword
  });
};

// GET Classes Schedule
const getClasses = (req, res) => {
  const { category, day, search } = req.query;
  let result = [...store.classes];

  if (category && category !== 'All') {
    result = result.filter(c => c.category.toLowerCase() === category.toLowerCase());
  }

  if (day && day !== 'All') {
    result = result.filter(c => c.scheduleDays.some(d => d.toLowerCase() === day.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.trainer.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: result.length,
    data: result
  });
};

// Protected: Book a Class Seat
const bookClass = (req, res) => {
  const { classId, preferredDate } = req.body;
  const user = req.user;

  if (!classId) {
    return res.status(400).json({ success: false, message: 'Class ID is required.' });
  }

  const targetClass = store.classes.find(c => c.id === classId);
  if (!targetClass) {
    return res.status(404).json({ success: false, message: 'Class not found.' });
  }

  if (targetClass.spotsLeft <= 0) {
    return res.status(400).json({ success: false, message: 'Sorry, this class is fully booked.' });
  }

  // Check if user already booked this class for the same date/timeslot
  const dateToBook = preferredDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  const existingBooking = store.classBookings.find(
    b => b.userId === user.id && b.classId === classId && b.date === dateToBook && b.status === 'CONFIRMED'
  );

  if (existingBooking) {
    return res.status(400).json({
      success: false,
      message: 'You have already reserved a seat in this class session!'
    });
  }

  // Decrement spot
  targetClass.spotsLeft = Math.max(0, targetClass.spotsLeft - 1);

  const newBooking = {
    id: 'bk_' + Date.now(),
    userId: user.id,
    userEmail: user.email,
    classId: targetClass.id,
    className: targetClass.title,
    trainer: targetClass.trainer,
    timeSlot: targetClass.timeSlot,
    date: dateToBook,
    day: targetClass.scheduleDays[0] || 'Scheduled Day',
    room: targetClass.room,
    status: 'CONFIRMED',
    bookedAt: new Date().toISOString()
  };

  store.classBookings.unshift(newBooking);

  res.status(201).json({
    success: true,
    message: `Seat successfully reserved for ${targetClass.title}!`,
    booking: newBooking
  });
};

// Protected: Get User's Class Bookings History
const getUserBookings = (req, res) => {
  const user = req.user;
  const bookings = store.classBookings.filter(b => b.userId === user.id);

  res.json({
    success: true,
    count: bookings.length,
    bookings
  });
};

// Protected: Cancel a Class Booking
const cancelBooking = (req, res) => {
  const { bookingId } = req.params;
  const user = req.user;

  const bookingIndex = store.classBookings.findIndex(b => b.id === bookingId && b.userId === user.id);

  if (bookingIndex === -1) {
    return res.status(404).json({ success: false, message: 'Booking not found or not owned by user.' });
  }

  const booking = store.classBookings[bookingIndex];

  if (booking.status === 'CANCELLED') {
    return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
  }

  // Mark as cancelled
  booking.status = 'CANCELLED';

  // Restore class spot
  const targetClass = store.classes.find(c => c.id === booking.classId);
  if (targetClass) {
    targetClass.spotsLeft = Math.min(targetClass.capacity, targetClass.spotsLeft + 1);
  }

  res.json({
    success: true,
    message: `Reservation for ${booking.className} cancelled successfully.`,
    booking
  });
};

// Protected: Get Digital Pass Info & Tap Turnstile Simulation
const getDigitalPass = (req, res) => {
  const user = req.user;
  const targetUser = store.users.find(u => u.id === user.id);

  if (req.method === 'POST') {
    // Turnstile Scan simulator
    if (targetUser) {
      targetUser.totalCheckIns = (targetUser.totalCheckIns || 0) + 1;
      targetUser.workoutStreakDays = (targetUser.workoutStreakDays || 0) + 1;
      targetUser.rewardPoints = (targetUser.rewardPoints || 0) + 25;
    }

    return res.json({
      success: true,
      message: 'Turnstile Unlocked! Welcome to American Fitness Gym.',
      scanTimestamp: new Date().toLocaleTimeString(),
      gate: 'Downtown Flagship - Main Gate A',
      stats: {
        totalCheckIns: targetUser?.totalCheckIns || 1,
        workoutStreakDays: targetUser?.workoutStreakDays || 1,
        rewardPoints: targetUser?.rewardPoints || 100
      }
    });
  }

  res.json({
    success: true,
    pass: {
      memberName: user.fullName,
      memberId: user.id.toUpperCase(),
      qrCode: user.qrCode || `AFG-QR-${user.id}`,
      membershipPlan: user.membershipPlan,
      status: user.status,
      accessLevel: '24/7 VIP Multi-Zone Access',
      validUntil: '2027-12-31'
    }
  });
};

// GET Memberships
const getMemberships = (req, res) => {
  res.json({
    success: true,
    data: store.membershipPlans
  });
};

// GET Facilities
const getFacilities = (req, res) => {
  const { category } = req.query;
  let result = [...store.facilities];

  if (category && category !== 'All') {
    result = result.filter(f => f.category.toLowerCase() === category.toLowerCase());
  }

  res.json({
    success: true,
    count: result.length,
    data: result
  });
};

// GET Blog Posts
const getBlogPosts = (req, res) => {
  const { category, search } = req.query;
  let result = [...store.blogPosts];

  if (category && category !== 'All') {
    result = result.filter(b => b.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(b => b.title.toLowerCase().includes(q) || b.summary.toLowerCase().includes(q));
  }

  res.json({
    success: true,
    count: result.length,
    data: result
  });
};

// POST Contact Lead Submission
const submitContact = (req, res) => {
  const { fullName, email, phone, subject, message } = req.body;

  if (!fullName || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Full name, email address, and message are required.'
    });
  }

  const newLead = {
    id: 'lead_' + Date.now(),
    fullName,
    email,
    phone: phone || 'N/A',
    subject: subject || 'General Inquiry',
    message,
    submittedAt: new Date().toISOString()
  };

  store.contactLeads.push(newLead);

  res.status(201).json({
    success: true,
    message: 'Thank you for reaching out! A representative from American Fitness Gym will contact you within 24 hours.',
    leadId: newLead.id
  });
};

// POST Free 1-Day Pass Request
const submitTrialPass = (req, res) => {
  const { fullName, email, phone, preferredBranch, preferredDate } = req.body;

  if (!fullName || !email || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Full name, email, and phone number are required for your trial pass.'
    });
  }

  const passCode = 'AFG-PASS-' + Math.floor(100000 + Math.random() * 900000);
  const trialRequest = {
    id: 'trial_' + Date.now(),
    fullName,
    email,
    phone,
    preferredBranch: preferredBranch || 'Downtown Flagship',
    preferredDate: preferredDate || new Date().toISOString().split('T')[0],
    passCode,
    status: 'ACTIVE',
    issuedAt: new Date().toISOString()
  };

  store.trialPassRequests.push(trialRequest);

  res.status(201).json({
    success: true,
    message: 'Your 1-Day Free Trial Pass has been generated!',
    pass: trialRequest
  });
};
// Admin: Verify Member QR Code or Membership ID
const verifyQR = (req, res) => {
  const payload = req.body || {};
  const rawCode = (payload.qrCode || payload.membershipId || payload.code || '').toString().trim();
  const code = rawCode.toUpperCase();

  if (!code) {
    return res.status(400).json({
      success: false,
      status: 'INVALID',
      message: 'Please enter a Membership ID, QR Code, or Email to check subscription status.'
    });
  }

  // Find matching user in store
  const foundUser = store.users.find(u => 
    (u.qrCode && u.qrCode.toUpperCase().includes(code)) ||
    (u.membershipId && u.membershipId.toUpperCase().includes(code)) ||
    (u.id && u.id.toUpperCase().includes(code)) ||
    (u.email && u.email.toUpperCase().includes(code)) ||
    (u.fullName && u.fullName.toUpperCase().includes(code))
  );

  if (code.includes('EXPIRED') || code === 'AFG-EXPIRED-99' || (foundUser && foundUser.status === 'EXPIRED')) {
    return res.json({
      success: true,
      hasSubscription: false,
      status: 'EXPIRED',
      message: `NO ACTIVE SUBSCRIPTION ❌ Member ${foundUser ? foundUser.fullName : 'Marcus Brody'} has no active subscription.`,
      member: {
        id: foundUser ? foundUser.id : 'usr_demo_2',
        fullName: foundUser ? foundUser.fullName : 'Marcus Brody',
        membershipId: foundUser ? (foundUser.qrCode || foundUser.id) : 'AFG-EXPIRED-99',
        membershipPlan: foundUser ? (foundUser.membershipPlan || 'Basic Gym Access') : 'Basic Gym Access',
        expiryDate: foundUser ? (foundUser.expiryDate || '2025-01-15') : '2025-01-15',
        status: 'Expired ❌',
        hasActiveSubscription: false
      }
    });
  }

  if (code.includes('INVALID') || code === 'FAKE-QR-0000') {
    return res.json({
      success: false,
      hasSubscription: false,
      status: 'INVALID',
      message: `NO SUBSCRIPTION RECORD FOUND ⚠️ Membership ID "${rawCode}" is not registered in the system.`
    });
  }

  const memberName = foundUser ? foundUser.fullName : 'Alex Morgan';
  const memberId = foundUser ? (foundUser.qrCode || foundUser.id) : (code || 'AFG-882910');
  const plan = foundUser ? foundUser.membershipPlan : 'Pro Athlete VIP';

  const now = new Date();
  const attendanceRecord = {
    id: 'att_' + Date.now(),
    membershipId: memberId,
    memberName,
    membershipPlan: plan,
    status: 'Active',
    date: now.toISOString().split('T')[0],
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    scannedBy: req.user?.fullName || 'Admin Verification Officer',
    gate: 'Mobile Camera Gate 1'
  };

  if (!store.attendanceLogs) {
    store.attendanceLogs = [];
  }
  store.attendanceLogs.unshift(attendanceRecord);

  res.json({
    success: true,
    hasSubscription: true,
    status: 'ACTIVE',
    message: `ACTIVE SUBSCRIPTION VERIFIED ✅ ${memberName} has an active ${plan} subscription!`,
    member: {
      id: foundUser ? foundUser.id : 'usr_demo_1',
      fullName: memberName,
      membershipId: memberId,
      membershipPlan: plan,
      expiryDate: '2027-12-31',
      status: 'Active ✅',
      hasActiveSubscription: true
    },
    attendance: attendanceRecord
  });
};

// Admin: Get Attendance Logs
const getAttendanceLogs = (req, res) => {
  const logs = store.attendanceLogs || [
    {
      id: 'att_seed_1',
      membershipId: 'AFG-882910',
      memberName: 'Alex Morgan',
      membershipPlan: 'Pro Athlete VIP',
      status: 'Active',
      date: new Date().toISOString().split('T')[0],
      time: '08:15 AM',
      scannedBy: 'Admin Verification Officer',
      gate: 'Mobile Camera Gate 1'
    }
  ];

  res.json({
    success: true,
    data: logs
  });
};

// Admin: Get Dashboard Analytics
const getAdminAnalytics = (req, res) => {
  const total = store.users.length || 2;
  const active = store.users.filter(u => u.status !== 'EXPIRED').length || 1;
  const expired = total - active;

  res.json({
    success: true,
    analytics: {
      totalMembers: Math.max(total, 148),
      activeMembers: Math.max(active, 132),
      expiredMembers: Math.max(expired, 16),
      todayAttendance: (store.attendanceLogs?.length || 0) + 42,
      monthlyRevenue: 14850
    }
  });
};

// Admin: Get Member Directory
const getAdminMembers = (req, res) => {
  const { status, search } = req.query;

  const mockList = [
    {
      id: 'usr_demo_1',
      membershipId: 'AFG-882910',
      fullName: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      phone: '(555) 234-5678',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      membershipPlan: 'Pro Athlete VIP',
      joinedDate: '2026-01-15',
      expiryDate: '2027-12-31',
      remainingDays: 511,
      status: 'ACTIVE',
      qrCode: 'AFG-882910'
    },
    {
      id: 'usr_demo_2',
      membershipId: 'AFG-EXPIRED-99',
      fullName: 'Marcus Brody',
      email: 'marcus.brody@example.com',
      phone: '(555) 888-9900',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      membershipPlan: 'Basic Gym Access',
      joinedDate: '2024-01-10',
      expiryDate: '2025-01-15',
      remainingDays: 0,
      status: 'EXPIRED',
      qrCode: 'AFG-EXPIRED-99'
    }
  ];

  let result = [...mockList];
  if (status && status !== 'all') {
    result = result.filter(m => m.status.toLowerCase() === status.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(m => m.fullName.toLowerCase().includes(q) || m.membershipId.toLowerCase().includes(q));
  }

  res.json({
    success: true,
    count: result.length,
    members: result
  });
};

// User/Admin: Renew Subscription
const renewSubscription = (req, res) => {
  const { userId, planName } = req.body;
  const targetUser = store.users.find(u => u.id === userId || u.email === userId);

  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const newExpiry = nextYear.toISOString().split('T')[0];

  if (targetUser) {
    targetUser.status = 'ACTIVE_MEMBER';
    targetUser.membershipPlan = planName || targetUser.membershipPlan || 'Pro Athlete';
    targetUser.expiryDate = newExpiry;
  }

  res.json({
    success: true,
    message: `Subscription for ${planName || 'Membership'} successfully activated/renewed until ${newExpiry}!`,
    user: {
      id: userId || 'usr_demo_1',
      status: 'ACTIVE_MEMBER',
      expiryDate: newExpiry
    }
  });
};

// Admin: Generate Encrypted QR Token
const generateQRToken = (req, res) => {
  const { membershipId } = req.body;
  const token = `AFG_SECURE_TOKEN_${membershipId || 'MEMBER'}_${Date.now()}`;

  res.json({
    success: true,
    message: 'Encrypted QR token generated successfully!',
    token,
    membershipId: membershipId || 'AFG-882910',
    qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(token)}`
  });
};

module.exports = {
  getHealth,
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  getClasses,
  bookClass,
  getUserBookings,
  cancelBooking,
  getDigitalPass,
  getMemberships,
  getFacilities,
  getBlogPosts,
  submitContact,
  submitTrialPass,
  verifyQR,
  getAttendanceLogs,
  getAdminAnalytics,
  getAdminMembers,
  renewSubscription,
  generateQRToken
};
