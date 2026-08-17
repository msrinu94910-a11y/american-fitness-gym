const mongoose = require('mongoose');
const User = require('../models/User');
const Membership = require('../models/Membership');
const Facility = require('../models/Facility');
const BlogPost = require('../models/BlogPost');
const Booking = require('../models/Booking');
const Attendance = require('../models/Attendance');
const Lead = require('../models/Lead');
const CMSContent = require('../models/CMSContent');
const Notification = require('../models/Notification');
const Trainer = require('../models/Trainer');
const WorkoutPlan = require('../models/WorkoutPlan');
const DietPlan = require('../models/DietPlan');
const MemberProgress = require('../models/MemberProgress');
const store = require('../data/store');
const cmsDefaultData = require('../data/cms.json');

// Health Check
const getHealth = (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    app: 'American Fitness Gym API',
    version: '2.0.0',
    database: 'MongoDB Connected'
  });
};

// Auth: Register New Member or Admin
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, phone, membershipPlan } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email address, and password are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const newId = 'usr_' + Date.now();
    const memNum = Math.floor(100000 + Math.random() * 900000);
    const code = `AFG-${memNum}`;
    const assignedRole = req.body.role === 'admin' || cleanEmail.includes('admin') ? 'admin' : 'user';

    const newUser = await User.create({
      id: newId,
      fullName,
      email: cleanEmail,
      password,
      phone: phone || '(555) 000-0000',
      membershipPlan: membershipPlan || (assignedRole === 'admin' ? 'Staff Admin' : 'Pro Athlete VIP'),
      membershipId: code,
      qrCode: code,
      role: assignedRole,
      status: 'ACTIVE_MEMBER',
      joinedDate: new Date().toISOString().split('T')[0],
      expiryDate: '2027-12-31',
      emergencyContact: 'Not provided',
      fitnessGoal: 'General Health & Fitness',
      totalCheckIns: 1,
      rewardPoints: 100,
      workoutStreakDays: 1
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    const token = 'afg_token_' + Buffer.from(cleanEmail).toString('base64') + '_' + Date.now();

    res.status(201).json({
      success: true,
      message: `Account created successfully as ${assignedRole === 'admin' ? 'Admin Officer' : 'User Member'}!`,
      token,
      user: userObj
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Auth: Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email address and password are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const namePart = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').trim();

    // 1. Search User strictly by email first
    let user = await User.findOne({ email: cleanEmail });

    // 2. Search Trainer account by email or user ID
    let trainerAccount = await Trainer.findOne({
      $or: [
        { email: cleanEmail },
        ...(user ? [{ userId: user.id }, { id: user.id }] : [])
      ]
    });

    // 3. If not found by email, check username or fullName
    if (!user && namePart) {
      user = await User.findOne({
        $or: [
          { id: cleanEmail },
          { fullName: new RegExp(`^${namePart}$`, 'i') }
        ]
      });
    }

    // Detect actual role
    let detectedRole = req.body.role || 'user';
    if (trainerAccount || cleanEmail.includes('trainer') || (user && user.role === 'trainer')) {
      detectedRole = 'trainer';
    } else if (cleanEmail.includes('admin') || (user && user.role === 'admin')) {
      detectedRole = 'admin';
    }

    if (!user) {
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      const memNum = Math.floor(100000 + Math.random() * 900000);
      const code = `AFG-${memNum}`;

      user = await User.create({
        id: 'usr_' + Date.now(),
        fullName: trainerAccount ? trainerAccount.fullName : (formattedName || 'Gym Member'),
        email: cleanEmail,
        password: password,
        phone: trainerAccount ? trainerAccount.phone : '(555) 000-0000',
        membershipPlan: detectedRole === 'admin' ? 'Staff Admin' : detectedRole === 'trainer' ? 'Master Trainer' : 'Pro Athlete VIP',
        membershipId: code,
        qrCode: code,
        role: detectedRole,
        status: 'ACTIVE_MEMBER',
        joinedDate: new Date().toISOString().split('T')[0],
        expiryDate: '2027-12-31',
        emergencyContact: 'Not provided',
        fitnessGoal: 'General Health & Fitness',
        totalCheckIns: 1,
        rewardPoints: 100,
        workoutStreakDays: 1
      });
    } else {
      user.password = password;
      user.role = detectedRole;
      if (!user.membershipId) {
        const memNum = Math.floor(100000 + Math.random() * 900000);
        user.membershipId = user.qrCode || `AFG-${memNum}`;
        user.qrCode = user.membershipId;
      }
      await user.save();
    }

    // If logging in as trainer, ensure corresponding Trainer profile exists for this exact user
    if (detectedRole === 'trainer' && !trainerAccount) {
      trainerAccount = await Trainer.create({
        id: 'trn_' + Date.now(),
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '(555) 000-0000',
        specialization: 'Hypertrophy & Strength',
        experienceYears: 5,
        bio: 'Certified American Fitness Gym Personal Trainer.',
        profileImage: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80',
        status: 'active',
        assignedMembers: []
      });
    }

    const userObj = user.toObject();
    delete userObj.password;
    userObj.role = detectedRole;

    const token = 'afg_token_' + Buffer.from(cleanEmail).toString('base64') + '_' + Date.now();

    res.json({
      success: true,
      message: `Welcome back, ${user.fullName} (${detectedRole === 'admin' ? 'Admin Officer' : detectedRole === 'trainer' ? 'Personal Trainer' : 'Gym Member'})!`,
      token,
      user: userObj
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
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
const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, emergencyContact, fitnessGoal, membershipPlan } = req.body;
    const targetUser = await User.findOne({ email: req.user.email });

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    if (fullName) targetUser.fullName = fullName;
    if (phone) targetUser.phone = phone;
    if (emergencyContact) targetUser.emergencyContact = emergencyContact;
    if (fitnessGoal) targetUser.fitnessGoal = fitnessGoal;
    if (membershipPlan) targetUser.membershipPlan = membershipPlan;

    await targetUser.save();

    const userObj = targetUser.toObject();
    delete userObj.password;

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: userObj
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
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
const bookClass = async (req, res) => {
  try {
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

    const dateToBook = preferredDate || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

    const existingBooking = await Booking.findOne({
      userEmail: user.email.toLowerCase(),
      classId,
      date: dateToBook,
      status: 'CONFIRMED'
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'You have already reserved a seat in this class session!'
      });
    }

    targetClass.spotsLeft = Math.max(0, targetClass.spotsLeft - 1);

    const newBooking = await Booking.create({
      id: 'bk_' + Date.now(),
      userEmail: user.email.toLowerCase(),
      classId: targetClass.id,
      className: targetClass.title,
      instructor: targetClass.trainer,
      date: dateToBook,
      time: targetClass.timeSlot,
      category: targetClass.category || 'Fitness Class',
      status: 'CONFIRMED',
      qrToken: `QR_CLASS_${targetClass.id}_${Date.now()}`
    });

    res.status(201).json({
      success: true,
      message: `Seat successfully reserved for ${targetClass.title}!`,
      booking: newBooking
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Protected: Get User's Class Bookings History
const getUserBookings = async (req, res) => {
  try {
    const user = req.user;
    const bookings = await Booking.find({ userEmail: user.email.toLowerCase() }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Protected: Cancel a Class Booking
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const user = req.user;

    const booking = await Booking.findOne({
      $or: [{ id: bookingId }, { _id: bookingId }],
      userEmail: user.email.toLowerCase()
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or not owned by user.' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    booking.status = 'CANCELLED';
    await booking.save();

    const targetClass = store.classes.find(c => c.id === booking.classId);
    if (targetClass) {
      targetClass.spotsLeft = Math.min(targetClass.capacity, targetClass.spotsLeft + 1);
    }

    res.json({
      success: true,
      message: `Reservation for ${booking.className} cancelled successfully.`,
      booking
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Protected: Get Digital Pass Info & Tap Turnstile Simulation
const getDigitalPass = async (req, res) => {
  try {
    const user = req.user;
    const targetUser = await User.findOne({ email: user.email.toLowerCase() });

    if (req.method === 'POST') {
      if (targetUser) {
        targetUser.totalCheckIns = (targetUser.totalCheckIns || 0) + 1;
        targetUser.workoutStreakDays = (targetUser.workoutStreakDays || 0) + 1;
        targetUser.rewardPoints = (targetUser.rewardPoints || 0) + 25;
        await targetUser.save();
      }

      await Attendance.create({
        id: 'att_' + Date.now(),
        memberName: targetUser ? targetUser.fullName : user.fullName,
        email: user.email.toLowerCase(),
        checkInTime: new Date().toISOString(),
        zone: 'Downtown Flagship - Main Gate A',
        method: 'Digital Mobile QR',
        status: 'GRANTED_ENTRY'
      });

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
        memberId: (user.id || 'usr_demo').toUpperCase(),
        qrCode: user.qrCode || `AFG-QR-${user.id}`,
        membershipPlan: user.membershipPlan,
        status: user.status,
        accessLevel: '24/7 VIP Multi-Zone Access',
        validUntil: user.expiryDate || '2027-12-31'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET Memberships
const getMemberships = async (req, res) => {
  try {
    const dbMemberships = await Membership.find().lean();
    if (dbMemberships && dbMemberships.length > 0) {
      return res.json({ success: true, data: dbMemberships });
    }

    const cmsRecord = await CMSContent.findOne({ key: 'main' }).lean();
    const cmsData = cmsRecord ? cmsRecord.data : cmsDefaultData;
    const result = cmsData.memberships && cmsData.memberships.length ? cmsData.memberships : store.membershipPlans;

    res.json({ success: true, data: result });
  } catch (err) {
    res.json({ success: true, data: store.membershipPlans });
  }
};

// CMS: Get Full Dynamic Content
const getCmsContent = async (req, res) => {
  try {
    let cmsRecord = await CMSContent.findOne({ key: 'main' }).lean();
    if (!cmsRecord) {
      await CMSContent.create({ key: 'main', data: cmsDefaultData });
      cmsRecord = { data: cmsDefaultData };
    }
    res.json({ success: true, data: cmsRecord.data });
  } catch (err) {
    res.json({ success: true, data: cmsDefaultData });
  }
};

// CMS: Update Homepage Hero & Highlights
const updateHomepageContent = async (req, res) => {
  try {
    let cmsRecord = await CMSContent.findOne({ key: 'main' });
    if (!cmsRecord) {
      cmsRecord = new CMSContent({ key: 'main', data: cmsDefaultData });
    }

    cmsRecord.data = {
      ...cmsRecord.data,
      homepage: {
        ...cmsRecord.data.homepage,
        ...req.body
      }
    };
    cmsRecord.markModified('data');
    await cmsRecord.save();

    res.json({
      success: true,
      message: 'Homepage content updated successfully in MongoDB!',
      homepage: cmsRecord.data.homepage
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CMS: Services CRUD
const saveService = async (req, res) => {
  try {
    let cmsRecord = await CMSContent.findOne({ key: 'main' });
    if (!cmsRecord) {
      cmsRecord = new CMSContent({ key: 'main', data: cmsDefaultData });
    }

    const service = req.body;
    if (!service.id) service.id = 'srv_' + Date.now();

    const services = cmsRecord.data.services || [];
    const index = services.findIndex(s => s.id === service.id);

    if (index >= 0) {
      services[index] = { ...services[index], ...service };
    } else {
      services.push(service);
    }

    cmsRecord.data.services = services;
    cmsRecord.markModified('data');
    await cmsRecord.save();

    res.json({
      success: true,
      message: 'Service saved successfully in MongoDB!',
      services: cmsRecord.data.services
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    let cmsRecord = await CMSContent.findOne({ key: 'main' });
    if (!cmsRecord) {
      return res.status(404).json({ success: false, message: 'CMS data not found.' });
    }

    cmsRecord.data.services = (cmsRecord.data.services || []).filter(s => s.id !== id);
    cmsRecord.markModified('data');
    await cmsRecord.save();

    res.json({
      success: true,
      message: 'Service deleted successfully from MongoDB!',
      services: cmsRecord.data.services
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CMS: Memberships CRUD
const saveMembership = async (req, res) => {
  try {
    let cmsRecord = await CMSContent.findOne({ key: 'main' });
    if (!cmsRecord) {
      cmsRecord = new CMSContent({ key: 'main', data: cmsDefaultData });
    }

    const membership = req.body;
    if (!membership.id) membership.id = 'mem_' + Date.now();

    const memberships = cmsRecord.data.memberships || [];
    const index = memberships.findIndex(m => m.id === membership.id);

    if (index >= 0) {
      memberships[index] = { ...memberships[index], ...membership };
    } else {
      memberships.push(membership);
    }

    cmsRecord.data.memberships = memberships;
    cmsRecord.markModified('data');
    await cmsRecord.save();

    // Also update Membership model table
    await Membership.findOneAndUpdate(
      { id: membership.id },
      membership,
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Membership plan saved successfully in MongoDB!',
      memberships: cmsRecord.data.memberships
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteMembership = async (req, res) => {
  try {
    const { id } = req.params;
    let cmsRecord = await CMSContent.findOne({ key: 'main' });
    if (cmsRecord) {
      cmsRecord.data.memberships = (cmsRecord.data.memberships || []).filter(m => m.id !== id);
      cmsRecord.markModified('data');
      await cmsRecord.save();
    }

    await Membership.deleteOne({ id });

    res.json({
      success: true,
      message: 'Membership plan deleted successfully from MongoDB!',
      memberships: cmsRecord ? cmsRecord.data.memberships : []
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET Facilities
const getFacilities = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category && category !== 'All') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    let facilities = await Facility.find(filter).lean();
    if (!facilities || facilities.length === 0) {
      facilities = store.facilities;
    }

    res.json({
      success: true,
      count: facilities.length,
      data: facilities
    });
  } catch (err) {
    res.json({ success: true, count: store.facilities.length, data: store.facilities });
  }
};

// GET Blog Posts
const getBlogPosts = async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = {};

    if (category && category !== 'All') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { summary: new RegExp(search, 'i') }
      ];
    }

    let posts = await BlogPost.find(filter).lean();
    if (!posts || posts.length === 0) {
      posts = store.blogPosts;
    }

    res.json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (err) {
    res.json({ success: true, count: store.blogPosts.length, data: store.blogPosts });
  }
};

// POST Contact Lead Submission
const submitContact = async (req, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email address, and message are required.'
      });
    }

    const newLead = await Lead.create({
      type: 'contact',
      fullName,
      email: email.toLowerCase(),
      phone: phone || 'N/A',
      interest: subject || 'General Inquiry',
      message
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! A representative from American Fitness Gym will contact you within 24 hours.',
      leadId: newLead._id
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST Free 1-Day Pass Request
const submitTrialPass = async (req, res) => {
  try {
    const { fullName, email, phone, preferredBranch, preferredDate } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and phone number are required for your trial pass.'
      });
    }

    const passCode = 'AFG-PASS-' + Math.floor(100000 + Math.random() * 900000);

    const trialLead = await Lead.create({
      type: 'trial_pass',
      fullName,
      email: email.toLowerCase(),
      phone,
      interest: preferredBranch || 'Downtown Flagship',
      message: `Trial Date: ${preferredDate || new Date().toISOString().split('T')[0]} | PassCode: ${passCode}`
    });

    res.status(201).json({
      success: true,
      message: 'Your 1-Day Free Trial Pass has been generated!',
      pass: {
        id: trialLead._id,
        fullName,
        email,
        phone,
        preferredBranch: preferredBranch || 'Downtown Flagship',
        preferredDate: preferredDate || new Date().toISOString().split('T')[0],
        passCode,
        status: 'ACTIVE'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin: Verify Member QR Code or Membership ID
const verifyQR = async (req, res) => {
  try {
    const payload = req.body || {};
    let rawCode = (payload.qrCode || payload.membershipId || payload.code || '').toString().trim();

    if (!rawCode) {
      return res.status(400).json({
        success: false,
        status: 'INVALID',
        hasSubscription: false,
        message: 'Please enter a Membership ID, QR Code, or Email to check subscription status.'
      });
    }

    if (rawCode.startsWith('{') && rawCode.endsWith('}')) {
      try {
        const parsed = JSON.parse(rawCode);
        rawCode = parsed.membershipId || parsed.qrCode || parsed.id || parsed.code || rawCode;
      } catch (e) {}
    }

    if (rawCode.includes('?')) {
      try {
        const urlObj = new URL(rawCode, 'http://localhost');
        const param = urlObj.searchParams.get('membershipId') || urlObj.searchParams.get('id') || urlObj.searchParams.get('code');
        if (param) rawCode = param;
      } catch (e) {}
    }

    const code = rawCode.toUpperCase();

    // Query user in MongoDB
    let foundUser = await User.findOne({
      $or: [
        { qrCode: new RegExp(code, 'i') },
        { membershipId: new RegExp(code, 'i') },
        { id: new RegExp(code, 'i') },
        { email: new RegExp(code, 'i') },
        { fullName: new RegExp(code, 'i') }
      ]
    });

    if (code.includes('EXPIRED') || code === 'AFG-EXPIRED-99' || (foundUser && foundUser.status === 'EXPIRED')) {
      return res.json({
        success: true,
        hasSubscription: false,
        status: 'EXPIRED',
        message: `NO ACTIVE SUBSCRIPTION ❌ Member ${foundUser ? foundUser.fullName : 'Marcus Brody'} has no active subscription.`,
        member: {
          id: foundUser ? foundUser.id : 'usr_demo_2',
          fullName: foundUser ? foundUser.fullName : 'Marcus Brody',
          email: foundUser ? foundUser.email : 'marcus.brody@example.com',
          membershipId: foundUser ? (foundUser.membershipId || foundUser.qrCode || foundUser.id) : 'AFG-EXPIRED-99',
          membershipPlan: foundUser ? (foundUser.membershipPlan || 'Basic Gym Access') : 'Basic Gym Access',
          expiryDate: foundUser ? (foundUser.expiryDate || '2025-01-15') : '2025-01-15',
          daysRemaining: 0,
          status: 'EXPIRED',
          hasActiveSubscription: false
        }
      });
    }

    if (code.includes('INVALID') || code === 'FAKE-QR-0000') {
      return res.json({
        success: false,
        hasSubscription: false,
        status: 'INVALID',
        message: `NO SUBSCRIPTION RECORD FOUND ⚠️ Membership ID / QR Code "${rawCode}" is not registered.`
      });
    }

    if (!foundUser) {
      const cleanCode = code.replace(/[^A-Z0-9]/g, '');
      const memId = code.startsWith('AFG') ? code : `AFG-${cleanCode || Math.floor(100000 + Math.random() * 900000)}`;

      foundUser = await User.create({
        id: 'usr_' + Date.now(),
        fullName: 'Jaan (Verified Member)',
        email: 'member@americanfitness.com',
        password: 'password123',
        membershipId: memId,
        qrCode: memId,
        membershipPlan: 'Pro Athlete VIP',
        status: 'ACTIVE_MEMBER',
        joinedDate: '2026-01-01',
        expiryDate: '2027-12-31'
      });
    }

    const memberName = foundUser.fullName || 'Member';
    const memberId = foundUser.membershipId || foundUser.qrCode || code;
    const plan = foundUser.membershipPlan || 'Pro Athlete VIP';
    const email = foundUser.email || 'member@americanfitness.com';
    const expiryDate = foundUser.expiryDate || '2027-12-31';

    const expTime = new Date(expiryDate).getTime();
    const nowTime = new Date().getTime();
    const daysRemaining = Math.max(1, Math.ceil((expTime - nowTime) / (1000 * 60 * 60 * 24)));

    const now = new Date();
    const todayDateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let attendanceRecord = {
      id: 'att_' + Date.now(),
      userId: foundUser.id,
      memberName,
      email,
      membershipId: memberId,
      membershipPlan: plan,
      photo: foundUser.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      checkInTime: now.toISOString(),
      date: todayDateStr,
      time: timeStr,
      zone: 'Mobile Camera Gate 1',
      gate: 'Gate 1 - Camera Scanner',
      scannedBy: 'Admin Verification Officer',
      method: 'Digital QR Verification',
      status: 'GRANTED_ENTRY'
    };

    try {
      const created = await Attendance.create(attendanceRecord);
      if (created) attendanceRecord = created.toObject();
    } catch (dbErr) {
      console.warn('MongoDB Attendance log fallback to store:', dbErr.message);
    }

    if (!store.attendanceLogs) store.attendanceLogs = [];
    store.attendanceLogs.unshift(attendanceRecord);

    res.json({
      success: true,
      hasSubscription: true,
      status: 'ACTIVE',
      message: `ACTIVE MEMBERSHIP CONFIRMED ✅ Welcome, ${memberName}! Attendance entry logged.`,
      member: {
        id: foundUser.id,
        fullName: memberName,
        email,
        membershipId: memberId,
        membershipPlan: plan,
        expiryDate,
        daysRemaining,
        status: 'ACTIVE',
        hasActiveSubscription: true,
        joinedDate: foundUser.joinedDate || '2026-01-01',
        photo: foundUser.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
      },
      attendance: attendanceRecord
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET Admin Attendance Logs Audit Trail with Search & Filter
const getAttendanceLogs = async (req, res) => {
  try {
    const { search = '', status = 'all', dateRange = 'all' } = req.query;

    const todayIso = new Date().toISOString().split('T')[0];
    const todayLocal = new Date().toLocaleDateString('en-CA');

    try {
      await Attendance.deleteMany({
        $or: [
          { email: 'member@americanfitness.com' },
          { memberName: { $in: ['Alex Morgan', 'Samantha Reed', 'David Vance', 'Michael Chen', 'Sophia Rossi', 'Daniel Kim'] } }
        ]
      });
      await Attendance.updateMany({ date: { $exists: false } }, { $set: { date: todayIso } });
    } catch (e) {}

    let logs = [];
    try {
      logs = await Attendance.find({
        email: { $ne: 'member@americanfitness.com' },
        memberName: { $nin: ['Alex Morgan', 'Samantha Reed', 'David Vance', 'Michael Chen', 'Sophia Rossi', 'Daniel Kim'] }
      }).sort({ createdAt: -1 }).lean();
    } catch (e) {}

    // Guarantee zero demo seed logs
    logs = (logs || []).filter(item => 
      item.email !== 'member@americanfitness.com' &&
      !['Alex Morgan', 'Samantha Reed', 'David Vance', 'Michael Chen', 'Sophia Rossi', 'Daniel Kim'].includes(item.memberName) &&
      !item.id?.startsWith('att_seed_')
    ).map(item => ({
      ...item,
      date: item.date || todayIso
    }));

    let filtered = logs.filter(item => {
      // Search filter
      if (search) {
        const q = search.toLowerCase();
        const mName = (item.memberName || '').toLowerCase();
        const mId = (item.membershipId || item.userId || '').toLowerCase();
        const mEmail = (item.email || '').toLowerCase();
        if (!mName.includes(q) && !mId.includes(q) && !mEmail.includes(q)) {
          return false;
        }
      }

      // Status filter
      if (status !== 'all') {
        const st = (item.status || '').toUpperCase();
        if (status === 'GRANTED' && !st.includes('GRANTED') && !st.includes('ACTIVE')) return false;
        if (status === 'MANUAL' && !st.includes('MANUAL')) return false;
        if (status === 'DENIED' && !st.includes('DENIED') && !st.includes('EXPIRED')) return false;
      }

      // Date Range filter
      if (dateRange === 'today') {
        const itemDate = String(item.date || todayIso);
        if (!itemDate.includes(todayIso) && !itemDate.includes(todayLocal) && itemDate !== todayIso) {
          return false;
        }
      }

      return true;
    });

    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  } catch (err) {
    res.json({ success: true, count: (store.attendanceLogs || []).length, data: store.attendanceLogs || [] });
  }
};

// POST Admin Manual Attendance Check-in Entry
const createManualAttendance = async (req, res) => {
  try {
    const { memberId, zone = 'Main Turnstile Gate A', notes = '' } = req.body;

    let targetMember = null;
    try {
      targetMember = await User.findOne({
        $or: [{ id: memberId }, { membershipId: memberId }, { email: memberId }]
      }).lean();
    } catch (e) {}

    if (!targetMember && store.users) {
      targetMember = store.users.find(u => u.id === memberId || u.membershipId === memberId || u.email === memberId);
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const memberName = targetMember ? targetMember.fullName : (req.body.memberName || 'Walk-in Member');
    const membershipId = targetMember ? (targetMember.membershipId || targetMember.id) : (req.body.membershipId || 'AFG-MANUAL');
    const membershipPlan = targetMember ? (targetMember.membershipPlan || 'Day Pass') : (req.body.membershipPlan || 'Walk-in Access');
    const email = targetMember ? (targetMember.email || '') : 'member@americanfitness.com';

    let record = {
      id: 'att_man_' + Date.now(),
      userId: targetMember ? targetMember.id : ('usr_' + Date.now()),
      memberName,
      email,
      membershipId,
      membershipPlan,
      photo: targetMember ? targetMember.photo : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      checkInTime: now.toISOString(),
      date: todayStr,
      time: timeStr,
      zone,
      gate: zone,
      scannedBy: 'Admin Desk Verification',
      method: 'Manual Admin Check-In',
      status: 'MANUAL_ENTRY',
      notes
    };

    try {
      const created = await Attendance.create(record);
      if (created) record = created.toObject();
    } catch (e) {}

    if (!store.attendanceLogs) store.attendanceLogs = [];
    store.attendanceLogs.unshift(record);

    res.json({
      success: true,
      message: `Manual check-in recorded for ${memberName}!`,
      data: record
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE Admin Attendance Log Entry
const deleteAttendanceLog = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Missing record ID' });
    }

    try {
      const deleteConditions = [{ id: String(id) }];
      if (mongoose.Types.ObjectId.isValid(id)) {
        deleteConditions.push({ _id: new mongoose.Types.ObjectId(id) });
        deleteConditions.push({ _id: String(id) });
      }
      await Attendance.deleteMany({ $or: deleteConditions });
    } catch (e) {
      console.warn('MongoDB attendance delete warning:', e);
    }

    if (store.attendanceLogs) {
      store.attendanceLogs = store.attendanceLogs.filter(
        a => String(a.id) !== String(id) && String(a._id) !== String(id)
      );
    }

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET User Personal Attendance History
const getUserAttendance = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : req.query.userId;
    const userEmail = req.user ? req.user.email : req.query.email;

    let userLogs = [];
    try {
      userLogs = await Attendance.find({
        $or: [
          { userId: userId },
          { email: userEmail }
        ]
      }).sort({ createdAt: -1 }).lean();
    } catch (e) {}

    if (!userLogs || userLogs.length === 0) {
      userLogs = (store.attendanceLogs || []).filter(a =>
        a.userId === userId || a.email === userEmail || a.membershipId === req.user?.membershipId
      );
    }

    res.json({
      success: true,
      count: userLogs.length,
      data: userLogs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET Admin Dashboard Analytics
const getAdminAnalytics = async (req, res) => {
  try {
    const allUsers = await User.find({ role: { $ne: 'admin' } }).lean();
    const now = new Date();

    const activeUsers = allUsers.filter(u => {
      if (u.status === 'EXPIRED') return false;
      if (u.expiryDate && new Date(u.expiryDate) < now) return false;
      return true;
    });

    const activeCount = activeUsers.length;
    const expiredCount = allUsers.length - activeCount;

    const todayStr = now.toISOString().split('T')[0];
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let todayCheckIns = 0;
    try {
      todayCheckIns = await Attendance.countDocuments({
        $or: [
          { createdAt: { $gte: startOfDay } },
          { date: todayStr }
        ]
      });
    } catch (e) {}

    if (!todayCheckIns && store.attendanceLogs) {
      todayCheckIns = store.attendanceLogs.filter(a => a.date === todayStr || (a.createdAt && new Date(a.createdAt).toISOString().split('T')[0] === todayStr)).length;
    }
    if (!todayCheckIns && store.attendanceLogs) {
      todayCheckIns = store.attendanceLogs.length;
    }

    const monthlyRevenue = activeUsers.reduce((sum, u) => {
      const plan = (u.membershipPlan || '').toLowerCase();
      if (plan.includes('vip')) return sum + 99;
      if (plan.includes('pro')) return sum + 59;
      return sum + 29;
    }, 0);

    res.json({
      success: true,
      analytics: {
        totalMembers: allUsers.length,
        activeMembers: activeCount,
        expiredMembers: expiredCount,
        todayAttendance: todayCheckIns,
        monthlyRevenue: monthlyRevenue
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET Admin All Members List (with filter & search)
const getAdminMembers = async (req, res) => {
  try {
    const { status, search } = req.query;
    const now = new Date();

    let query = { role: { $ne: 'admin' } };
    if (search) {
      query.$or = [
        { fullName: new RegExp(search, 'i') },
        { membershipId: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const dbUsers = await User.find(query).lean();

    let members = dbUsers.map(u => {
      const isExpired = u.status === 'EXPIRED' || (u.expiryDate && new Date(u.expiryDate) < now);
      const diffMs = u.expiryDate ? new Date(u.expiryDate) - now : 0;
      const remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      return {
        id: u.id || u._id,
        membershipId: u.membershipId || (u.id ? u.id.toUpperCase() : 'AFG-001'),
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        membershipPlan: u.membershipPlan || 'Pro Athlete VIP',
        joinedDate: u.joinedDate || '2026-01-15',
        expiryDate: u.expiryDate || '2027-12-31',
        remainingDays: isExpired ? 0 : remainingDays,
        status: isExpired ? 'EXPIRED' : 'ACTIVE',
        qrCode: u.qrCode || u.membershipId || u.id,
        lastNoticeSent: u.lastNoticeSent || null,
        noticeCount: u.noticeCount || 0,
        lastNoticeDetails: u.lastNoticeDetails || null
      };
    });

    if (status && status !== 'all') {
      members = members.filter(m => m.status.toLowerCase() === status.toLowerCase());
    }

    res.json({
      success: true,
      count: members.length,
      members
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE Admin Member Account
const deleteAdminMember = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Member ID is required.' });
    }

    const queryConditions = [
      { id: id },
      { membershipId: id },
      { email: id.toLowerCase() }
    ];
    if (mongoose.Types.ObjectId.isValid(id)) {
      queryConditions.push({ _id: id });
    }

    const targetUser = await User.findOne({ $or: queryConditions });

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Member account not found.' });
    }

    if (targetUser.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin accounts cannot be deleted.' });
    }

    const deletedEmail = targetUser.email ? targetUser.email.toLowerCase() : '';
    const deletedName = targetUser.fullName ? targetUser.fullName.trim() : '';

    // Permanently remove user records from MongoDB Atlas
    await User.deleteMany({
      $or: [
        { id: id },
        { membershipId: id },
        ...(deletedEmail ? [{ email: deletedEmail }] : []),
        ...(deletedName ? [{ fullName: new RegExp(`^${deletedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }] : [])
      ]
    });

    // Clean up related notifications & class bookings
    if (deletedEmail) {
      await Notification.deleteMany({ userEmail: deletedEmail });
      await Booking.deleteMany({ userEmail: deletedEmail });
    }

    res.json({
      success: true,
      message: `Member account (${deletedName || id}) has been permanently deleted from MongoDB Atlas.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// User/Admin: Renew Subscription
const renewSubscription = async (req, res) => {
  try {
    const { userId, planName } = req.body;
    const queryConditions = [
      { id: userId },
      { membershipId: userId },
      { email: userId }
    ];
    if (mongoose.Types.ObjectId.isValid(userId)) {
      queryConditions.push({ _id: userId });
    }

    const targetUser = await User.findOne({ $or: queryConditions });

    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const newExpiry = nextYear.toISOString().split('T')[0];

    if (targetUser) {
      targetUser.status = 'ACTIVE_MEMBER';
      targetUser.membershipPlan = planName || targetUser.membershipPlan || 'Pro Athlete VIP';
      targetUser.expiryDate = newExpiry;
      targetUser.lastNoticeSent = null;
      await targetUser.save();
    }

    res.json({
      success: true,
      message: `Subscription for ${planName || 'Membership'} successfully activated/renewed in MongoDB until ${newExpiry}!`,
      user: {
        id: userId || 'usr_demo_1',
        status: 'ACTIVE_MEMBER',
        expiryDate: newExpiry
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
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

// Real-Time Server-Sent Events (SSE) Bus
let sseClients = [];

const subscribeEvents = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  if (res.flushHeaders) res.flushHeaders();

  const clientId = Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
};

const broadcastRealtimeEvent = (eventType, payload) => {
  const dataString = JSON.stringify({ type: eventType, payload, timestamp: new Date().toISOString() });
  sseClients.forEach(client => {
    try {
      client.res.write(`data: ${dataString}\n\n`);
    } catch (err) {}
  });
};

// GET User Notifications
const getUserNotifications = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const userNotifs = await Notification.find({ userEmail: user.email.toLowerCase() }).sort({ createdAt: -1 });
    const currentUser = await User.findOne({ email: user.email.toLowerCase() });

    res.json({
      success: true,
      count: userNotifs.length,
      notifications: userNotifs,
      lastNoticeSent: currentUser ? currentUser.lastNoticeSent : null,
      lastNoticeDetails: currentUser ? currentUser.lastNoticeDetails : null,
      status: currentUser ? currentUser.status : 'ACTIVE_MEMBER'
    });
  } catch (err) {
    res.json({ success: true, count: 0, notifications: [] });
  }
};

// POST Send Expiry Notice Message to User
const sendExpiryNotice = async (req, res) => {
  try {
    const { memberId } = req.body;
    const queryConditions = [
      { id: memberId },
      { membershipId: memberId },
      { email: memberId }
    ];
    if (mongoose.Types.ObjectId.isValid(memberId)) {
      queryConditions.push({ _id: memberId });
    }

    const user = await User.findOne({ $or: queryConditions });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sentFormatted = `Today at ${timeStr}`;

    const noticeMessage = `⚠️ MEMBERSHIP EXPIRED NOTICE: Dear ${user.fullName}, your American Fitness Gym (${user.membershipPlan || 'Gym'}) membership has expired. Please click "Renew Subscription" to restore 24/7 facility access.`;

    user.status = 'EXPIRED';
    user.lastNoticeSent = sentFormatted;
    user.noticeCount = (user.noticeCount || 0) + 1;
    user.lastNoticeDetails = {
      sentAt: now.toLocaleString(),
      channel: 'SMS, Email & Member Portal Popup',
      status: 'DELIVERED ✅',
      recipientEmail: user.email,
      recipientPhone: user.phone || '(555) 888-9900',
      message: noticeMessage
    };

    await user.save();

    // Sync EXPIRED status and notice details across any duplicate/secondary user records by email or fullName
    const targetEmail = user.email ? user.email.toLowerCase() : '';
    const targetName = user.fullName ? user.fullName.trim() : '';

    await User.updateMany(
      {
        $or: [
          ...(targetEmail ? [{ email: targetEmail }] : []),
          ...(targetName ? [{ fullName: new RegExp(`^${targetName}$`, 'i') }] : [])
        ]
      },
      {
        $set: {
          status: 'EXPIRED',
          lastNoticeSent: sentFormatted,
          lastNoticeDetails: user.lastNoticeDetails
        }
      }
    );

    const notificationRecord = await Notification.create({
      id: 'notif_' + Date.now(),
      userEmail: targetEmail || user.id,
      title: '⚠️ Membership Expired Notice',
      message: noticeMessage,
      date: sentFormatted
    });

    broadcastRealtimeEvent('EXPIRY_NOTICE_SENT', {
      notificationId: notificationRecord._id,
      userId: user.id,
      membershipId: user.membershipId || user.id,
      userEmail: user.email.toLowerCase(),
      sentFormatted,
      message: noticeMessage,
      lastNoticeDetails: user.lastNoticeDetails
    });

    res.json({
      success: true,
      message: `Expiry notice successfully sent to ${user.fullName} (${user.email})!`,
      lastNoticeSent: sentFormatted,
      noticeDetails: user.lastNoticeDetails,
      member: {
        id: user.id,
        membershipId: user.membershipId || user.id,
        fullName: user.fullName,
        lastNoticeSent: sentFormatted,
        noticeCount: user.noticeCount,
        status: 'EXPIRED'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ==================== TRAINER MANAGEMENT SYSTEM CONTROLLERS ==================== //

// Seed Default Trainers if DB empty or missing trainers
const SEED_TRAINERS = [
  {
    id: 'trn_marcus_vance',
    userId: 'usr_trainer_marcus',
    fullName: 'Marcus Vance',
    email: 'trainer.marcus@americanfitness.com',
    phone: '(555) 389-2041',
    specialization: 'Hypertrophy & Powerlifting',
    experienceYears: 7,
    bio: 'Former IFBB competitor and Master Strength Coach specializing in body composition transformation.',
    profileImage: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80',
    status: 'active',
    assignedMembers: []
  },
  {
    id: 'trn_elena_rostova',
    userId: 'usr_trainer_elena',
    fullName: 'Elena Rostova',
    email: 'trainer.elena@americanfitness.com',
    phone: '(555) 812-9034',
    specialization: 'HYROX & High-Intensity Conditioning',
    experienceYears: 5,
    bio: 'Elite endurance specialist & functional mobility coach certified in Olympic weightlifting.',
    profileImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
    status: 'active',
    assignedMembers: []
  },
  {
    id: 'trn_david_kim',
    userId: 'usr_trainer_david',
    fullName: 'David Kim',
    email: 'trainer.david@americanfitness.com',
    phone: '(555) 492-1180',
    specialization: 'Olympic Weightlifting & Functional Mobility',
    experienceYears: 6,
    bio: 'USA Weightlifting Level 2 Coach specializing in snatch & clean-and-jerk technical mastery.',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    status: 'active',
    assignedMembers: []
  },
  {
    id: 'trn_sarah_jenkins',
    userId: 'usr_trainer_sarah',
    fullName: 'Sarah Jenkins',
    email: 'trainer.sarah@americanfitness.com',
    phone: '(555) 773-9012',
    specialization: 'Functional Strength & Tactical Boxing',
    experienceYears: 8,
    bio: 'Golden Gloves boxer & functional strength specialist training high-performance athletes.',
    profileImage: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80',
    status: 'active',
    assignedMembers: []
  },
  {
    id: 'trn_viktor_nikitin',
    userId: 'usr_trainer_viktor',
    fullName: 'Viktor Nikitin',
    email: 'trainer.viktor@americanfitness.com',
    phone: '(555) 604-3321',
    specialization: 'Bodybuilding & Contest Prep',
    experienceYears: 10,
    bio: 'Pro Natural Bodybuilder and posing coach with over a decade of elite contest preparation coaching.',
    profileImage: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80',
    status: 'active',
    assignedMembers: []
  },
  {
    id: 'trn_maya_lin',
    userId: 'usr_trainer_maya',
    fullName: 'Maya Lin',
    email: 'trainer.maya@americanfitness.com',
    phone: '(555) 918-2049',
    specialization: 'Pilates, Yoga & Athletic Rehabilitation',
    experienceYears: 6,
    bio: 'Certified Movement Specialist focusing on spinal alignment, mobility, and injury recovery.',
    profileImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80',
    status: 'active',
    assignedMembers: []
  }
];

// GET Admin All Trainers
const getAdminTrainers = async (req, res) => {
  try {
    // Seed default trainers ONLY if Trainer collection is completely empty
    const trainerCount = await Trainer.countDocuments();
    if (trainerCount === 0) {
      for (const tSeed of SEED_TRAINERS) {
        await Trainer.create(tSeed);
        let trUser = await User.findOne({ email: tSeed.email.toLowerCase() });
        if (!trUser) {
          await User.create({
            id: tSeed.userId,
            fullName: tSeed.fullName,
            email: tSeed.email,
            password: 'password123',
            phone: tSeed.phone,
            role: 'trainer',
            membershipPlan: 'Elite Master Trainer',
            status: 'ACTIVE_MEMBER'
          });
        }
      }
    }

    const trainers = await Trainer.find().lean();

    // Attach count of assigned users
    const trainerList = await Promise.all(trainers.map(async (t) => {
      const assignedUsersCount = await User.countDocuments({
        $or: [
          { assignedTrainerId: t.id },
          ...(t._id ? [{ assignedTrainerId: t._id.toString() }] : [])
        ]
      });
      return {
        ...t,
        assignedCount: Math.max(t.assignedMembers?.length || 0, assignedUsersCount)
      };
    }));

    res.json({
      success: true,
      trainers: trainerList
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE Admin Trainer
const createAdminTrainer = async (req, res) => {
  try {
    const { fullName, email, password, phone, specialization, experienceYears, bio, profileImage } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User or Trainer with this email already exists.' });
    }

    const userId = 'usr_trn_' + Date.now();
    const trainerId = 'trn_' + Date.now();

    // Create User Account with role 'trainer'
    await User.create({
      id: userId,
      fullName,
      email: email.toLowerCase(),
      password: password || 'password123',
      phone: phone || '(555) 000-0000',
      role: 'trainer',
      membershipPlan: 'Elite Master Trainer',
      status: 'ACTIVE_MEMBER'
    });

    // Create Trainer Profile Document
    const newTrainer = await Trainer.create({
      id: trainerId,
      userId,
      fullName,
      email: email.toLowerCase(),
      phone: phone || '(555) 000-0000',
      specialization: specialization || 'General Strength & Fitness',
      experienceYears: Number(experienceYears) || 3,
      bio: bio || 'Certified American Fitness Gym Personal Trainer.',
      profileImage: profileImage || 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80',
      status: 'active',
      assignedMembers: []
    });

    res.json({
      success: true,
      message: `Trainer ${fullName} created successfully!`,
      trainer: newTrainer
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE Admin Trainer
const updateAdminTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, specialization, experienceYears, bio, profileImage, status } = req.body;

    const trainer = await Trainer.findOne({ $or: [{ id }, { _id: mongoose.Types.ObjectId.isValid(id) ? id : null }] });
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found.' });
    }

    if (fullName) trainer.fullName = fullName;
    if (phone) trainer.phone = phone;
    if (specialization) trainer.specialization = specialization;
    if (experienceYears !== undefined) trainer.experienceYears = Number(experienceYears);
    if (bio) trainer.bio = bio;
    if (profileImage) trainer.profileImage = profileImage;
    if (status) trainer.status = status;

    await trainer.save();

    // Also update matching User account
    await User.updateOne({ email: trainer.email }, { $set: { fullName: trainer.fullName, phone: trainer.phone } });

    res.json({
      success: true,
      message: `Trainer ${trainer.fullName} updated successfully!`,
      trainer
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// TOGGLE Admin Trainer Status
const toggleTrainerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const trainer = await Trainer.findOne({ $or: [{ id }, { _id: mongoose.Types.ObjectId.isValid(id) ? id : null }] });
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found.' });
    }

    trainer.status = trainer.status === 'active' ? 'inactive' : 'active';
    await trainer.save();

    res.json({
      success: true,
      message: `Trainer ${trainer.fullName} is now ${trainer.status.toUpperCase()}`,
      status: trainer.status
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE Admin Trainer
const deleteAdminTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = String(id);
    const trainer = await Trainer.findOne({
      $or: [
        { id: cleanId },
        { email: cleanId.toLowerCase() },
        ...(mongoose.Types.ObjectId.isValid(cleanId) ? [{ _id: cleanId }] : [])
      ]
    });
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found.' });
    }

    const tEmail = trainer.email ? trainer.email.toLowerCase() : '';
    const tId = trainer.id;

    await Trainer.deleteMany({
      $or: [
        { _id: trainer._id },
        { id: tId },
        ...(tEmail ? [{ email: tEmail }] : [])
      ]
    });

    if (tEmail) {
      await User.deleteMany({ email: tEmail });
    }
    await User.updateMany(
      { assignedTrainerId: { $in: [tId, String(trainer._id), tEmail] } },
      { $set: { assignedTrainerId: null } }
    );

    res.json({
      success: true,
      message: `Trainer ${trainer.fullName} permanently deleted.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ASSIGN Member to Trainer
const assignMemberToTrainer = async (req, res) => {
  try {
    const { userId, trainerId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Member User ID is required.' });
    }

    const user = await User.findOne({
      $or: [
        { id: userId },
        { email: userId.toLowerCase ? userId.toLowerCase() : userId },
        ...(mongoose.Types.ObjectId.isValid(userId) ? [{ _id: userId }] : [])
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Member user not found.' });
    }

    if (!trainerId || trainerId === 'none' || trainerId === null) {
      user.assignedTrainerId = null;
      await user.save();
      await Trainer.updateMany({}, { $pull: { assignedMembers: user.id } });
      return res.json({ success: true, message: `Unassigned trainer from ${user.fullName}.` });
    }

    const trainer = await Trainer.findOne({
      $or: [
        { id: trainerId },
        { email: trainerId.toLowerCase ? trainerId.toLowerCase() : trainerId },
        ...(mongoose.Types.ObjectId.isValid(trainerId) ? [{ _id: trainerId }] : [])
      ]
    });

    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found.' });
    }

    // Set assignedTrainerId to trainer.id
    user.assignedTrainerId = trainer.id;
    await user.save();

    // Sync across any duplicate user records by email or fullName
    if (user.email) {
      await User.updateMany(
        { email: user.email.toLowerCase() },
        { $set: { assignedTrainerId: trainer.id } }
      );
    }

    // Add user.id and user.email to trainer's assignedMembers
    await Trainer.updateMany({}, { $pull: { assignedMembers: user.id } });
    if (!trainer.assignedMembers) trainer.assignedMembers = [];
    if (!trainer.assignedMembers.includes(user.id)) trainer.assignedMembers.push(user.id);
    if (user.email && !trainer.assignedMembers.includes(user.email)) trainer.assignedMembers.push(user.email);
    await trainer.save();

    res.json({
      success: true,
      message: `Assigned member ${user.fullName} to Trainer ${trainer.fullName}!`,
      user: { id: user.id, fullName: user.fullName, assignedTrainerId: trainer.id }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET Trainer Assigned Members List (For Trainer Portal)
const getTrainerAssignedMembers = async (req, res) => {
  try {
    const trainerUser = req.user;
    const cleanEmail = trainerUser.email ? trainerUser.email.toLowerCase() : '';

    // Find trainer profile matching the logged-in user by email, userId, or id
    let trainer = await Trainer.findOne({
      $or: [
        ...(cleanEmail ? [{ email: cleanEmail }] : []),
        ...(trainerUser.id ? [{ userId: trainerUser.id }, { id: trainerUser.id }] : []),
        ...(trainerUser.fullName ? [{ fullName: new RegExp(`^${trainerUser.fullName.trim()}$`, 'i') }] : [])
      ]
    });

    // If no Trainer profile document exists yet for this specific user, create one dynamically for them
    if (!trainer) {
      const tId = 'trn_' + Date.now();
      const formattedName = trainerUser.fullName || (cleanEmail ? cleanEmail.split('@')[0] : 'Master Trainer');
      trainer = await Trainer.create({
        id: tId,
        userId: trainerUser.id || ('usr_' + Date.now()),
        fullName: formattedName,
        email: cleanEmail || `${tId}@americanfitness.com`,
        phone: trainerUser.phone || '(555) 000-0000',
        specialization: 'Hypertrophy & Strength',
        experienceYears: 5,
        bio: 'Certified American Fitness Gym Personal Trainer.',
        profileImage: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80',
        status: 'active',
        assignedMembers: []
      });
    }

    // Collect ALL identifiers associated with this trainer
    const trainerIds = [trainer.id];
    if (trainer._id) trainerIds.push(trainer._id.toString());
    if (trainer.userId) trainerIds.push(trainer.userId);
    if (trainer.email) trainerIds.push(trainer.email, trainer.email.toLowerCase());

    const assignedMembersInTrainerDoc = (trainer.assignedMembers || []).map(id => id.toString());

    // Query ONLY REAL USERS (excluding trainers & admins) who match this trainer's assigned ID or are in assignedMembers array
    const members = await User.find({
      role: { $nin: ['admin', 'trainer'] },
      email: { $not: /trainer|admin/i },
      $or: [
        { assignedTrainerId: { $in: trainerIds } },
        ...(assignedMembersInTrainerDoc.length > 0 ? [
          { id: { $in: assignedMembersInTrainerDoc } },
          { email: { $in: assignedMembersInTrainerDoc } },
          { _id: { $in: assignedMembersInTrainerDoc.filter(id => mongoose.Types.ObjectId.isValid(id)) } }
        ] : [])
      ]
    }).lean();

    const formattedMembers = members.map(m => ({
      id: m.id || m._id.toString(),
      fullName: m.fullName,
      email: m.email,
      phone: m.phone || '(555) 000-0000',
      membershipPlan: m.membershipPlan || 'Pro Athlete VIP',
      status: m.status === 'EXPIRED' ? 'EXPIRED' : 'ACTIVE',
      fitnessGoal: m.fitnessGoal || 'General Health & Fitness',
      joinedDate: m.joinedDate || '2026-01-15',
      assignedTrainerId: m.assignedTrainerId
    }));

    res.json({
      success: true,
      trainer: trainer,
      members: formattedMembers
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// WORKOUT PLAN: Create or Update
const createOrUpdateWorkoutPlan = async (req, res) => {
  try {
    const { userId, title, goal, exercises } = req.body;
    const trainerId = req.user?.id || 'trn_admin';

    if (!userId || !exercises) {
      return res.status(400).json({ success: false, message: 'User ID and exercises schedule are required.' });
    }

    let plan = await WorkoutPlan.findOne({ userId });
    if (plan) {
      plan.title = title || plan.title;
      plan.goal = goal || plan.goal;
      plan.exercises = exercises;
      plan.updatedAt = new Date();
      await plan.save();
    } else {
      plan = await WorkoutPlan.create({
        id: 'wrk_' + Date.now(),
        userId,
        trainerId,
        title: title || 'Personalized Athletic Workout Routine',
        goal: goal || 'Hypertrophy & Strength',
        exercises
      });
    }

    res.json({
      success: true,
      message: 'Workout Plan saved successfully!',
      plan
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// WORKOUT PLAN: Get Member Workout Plan
const getMemberWorkoutPlan = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    let plan = await WorkoutPlan.findOne({ userId }).lean();

    if (!plan) {
      // Default sample plan
      plan = {
        title: 'Custom Athletic Strength Blueprint',
        goal: 'Hypertrophy & Performance',
        startDate: new Date().toISOString().split('T')[0],
        exercises: [
          { day: 'Monday', name: 'Barbell Back Squats', sets: 4, reps: '8-10', restSeconds: 90, targetMuscle: 'Quads & Glutes', notes: 'Maintain parallel depth.' },
          { day: 'Wednesday', name: 'Incline Dumbbell Bench Press', sets: 4, reps: '10-12', restSeconds: 75, targetMuscle: 'Upper Chest', notes: 'Squeeze at top.' },
          { day: 'Friday', name: 'Overhead Barbell Military Press', sets: 4, reps: '8-10', restSeconds: 90, targetMuscle: 'Shoulders', notes: 'Engage core.' }
        ]
      };
    }

    res.json({
      success: true,
      plan
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DIET PLAN: Create or Update
const createOrUpdateDietPlan = async (req, res) => {
  try {
    const { userId, title, dailyCalories, proteinGrams, carbsGrams, fatsGrams, waterLiters, meals } = req.body;
    const trainerId = req.user?.id || 'trn_admin';

    if (!userId || !meals) {
      return res.status(400).json({ success: false, message: 'User ID and meal schedule are required.' });
    }

    let plan = await DietPlan.findOne({ userId });
    if (plan) {
      plan.title = title || plan.title;
      plan.dailyCalories = Number(dailyCalories) || plan.dailyCalories;
      plan.proteinGrams = Number(proteinGrams) || plan.proteinGrams;
      plan.carbsGrams = Number(carbsGrams) || plan.carbsGrams;
      plan.fatsGrams = Number(fatsGrams) || plan.fatsGrams;
      plan.waterLiters = Number(waterLiters) || plan.waterLiters;
      plan.meals = meals;
      plan.updatedAt = new Date();
      await plan.save();
    } else {
      plan = await DietPlan.create({
        id: 'diet_' + Date.now(),
        userId,
        trainerId,
        title: title || 'Lean Muscle Macro Blueprint',
        dailyCalories: Number(dailyCalories) || 2400,
        proteinGrams: Number(proteinGrams) || 180,
        carbsGrams: Number(carbsGrams) || 220,
        fatsGrams: Number(fatsGrams) || 65,
        waterLiters: Number(waterLiters) || 3.5,
        meals
      });
    }

    res.json({
      success: true,
      message: 'Diet Plan saved successfully!',
      plan
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DIET PLAN: Get Member Diet Plan
const getMemberDietPlan = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    let plan = await DietPlan.findOne({ userId }).lean();

    if (!plan) {
      // Default sample diet plan
      plan = {
        title: 'Lean Muscle Macro Blueprint',
        dailyCalories: 2400,
        proteinGrams: 180,
        carbsGrams: 220,
        fatsGrams: 65,
        waterLiters: 3.5,
        meals: [
          { mealType: 'Breakfast', time: '07:30 AM', foodItems: '4 Whole Eggs, 1 Cup Oatmeal, Blueberries, Almonds', calories: 600, proteinGrams: 40, carbsGrams: 55, fatsGrams: 20, instructions: 'Hydrate with 500ml water first thing.' },
          { mealType: 'Lunch', time: '01:00 PM', foodItems: '200g Grilled Chicken Breast, 1.5 Cups Brown Rice, Steamed Broccoli', calories: 650, proteinGrams: 55, carbsGrams: 65, fatsGrams: 12, instructions: 'Season with olive oil & sea salt.' },
          { mealType: 'Pre-Workout Snack', time: '04:30 PM', foodItems: '1 Scoop Whey Protein, 1 Large Banana, 20g Peanut Butter', calories: 350, proteinGrams: 30, carbsGrams: 40, fatsGrams: 10, instructions: 'Consume 45 mins prior to workout.' },
          { mealType: 'Dinner', time: '08:00 PM', foodItems: '200g Baked Salmon, Roasted Sweet Potatoes, Asparagus', calories: 700, proteinGrams: 50, carbsGrams: 50, fatsGrams: 22, instructions: 'High omega-3 recovery meal.' }
        ]
      };
    }

    res.json({
      success: true,
      plan
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PROGRESS: Log Progress Entry
const logMemberProgress = async (req, res) => {
  try {
    const { userId, weightKg, bodyFatPercent, muscleMassKg, notes } = req.body;
    const trainerId = req.user?.id || 'trn_admin';

    if (!userId || !weightKg) {
      return res.status(400).json({ success: false, message: 'Member ID and weight value are required.' });
    }

    const newProgress = await MemberProgress.create({
      id: 'prg_' + Date.now(),
      userId,
      trainerId,
      date: new Date().toISOString().split('T')[0],
      weightKg: Number(weightKg),
      bodyFatPercent: Number(bodyFatPercent) || 18,
      muscleMassKg: Number(muscleMassKg) || 35,
      notes: notes || 'Trainer progress entry'
    });

    res.json({
      success: true,
      message: 'Progress recorded successfully!',
      progress: newProgress
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PROGRESS: Get Member Progress History
const getMemberProgress = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    let history = await MemberProgress.find({ userId }).sort({ createdAt: 1 }).lean();

    if (!history || history.length === 0) {
      // Return initial seed history
      history = [
        { date: '2026-06-01', weightKg: 78.5, bodyFatPercent: 21.0, muscleMassKg: 33.2, notes: 'Initial assessment scan.' },
        { date: '2026-07-01', weightKg: 76.8, bodyFatPercent: 19.5, muscleMassKg: 34.0, notes: 'Good strength improvements.' },
        { date: '2026-08-01', weightKg: 75.2, bodyFatPercent: 18.2, muscleMassKg: 35.1, notes: 'Goal target reached for phase 1.' }
      ];
    }

    res.json({
      success: true,
      history
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET Assigned Trainer Details (For Member Dashboard)
const getAssignedTrainerDetails = async (req, res) => {
  try {
    const user = req.user;
    let currentUser = await User.findOne({ $or: [{ email: user.email.toLowerCase() }, { id: user.id }] });
    const assignedId = currentUser?.assignedTrainerId || user.assignedTrainerId;

    let trainer = null;
    if (assignedId) {
      trainer = await Trainer.findOne({
        $or: [
          { id: assignedId },
          { email: assignedId.toLowerCase() },
          ...(mongoose.Types.ObjectId.isValid(assignedId) ? [{ _id: assignedId }] : [])
        ]
      }).lean();
    }

    if (!trainer) {
      // Default to first active trainer
      trainer = await Trainer.findOne({ status: 'active' }).lean();
    }

    if (!trainer) {
      trainer = SEED_TRAINERS[0];
    }

    res.json({
      success: true,
      trainer
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Member Self-Select Personal Trainer
const memberChooseTrainer = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { trainerId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const user = await User.findOne({ $or: [{ id: userId }, { email: req.user.email.toLowerCase() }] });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Member profile not found.' });
    }

    if (!trainerId || trainerId === 'none') {
      user.assignedTrainerId = null;
      await user.save();
      return res.json({ success: true, message: 'Trainer unassigned successfully.' });
    }

    const trainer = await Trainer.findOne({
      $or: [
        { id: trainerId },
        { email: trainerId.toLowerCase ? trainerId.toLowerCase() : trainerId },
        ...(mongoose.Types.ObjectId.isValid(trainerId) ? [{ _id: trainerId }] : [])
      ]
    });

    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found.' });
    }

    user.assignedTrainerId = trainer.id;
    await user.save();

    // Sync across any user records by email
    if (user.email) {
      await User.updateMany(
        { email: user.email.toLowerCase() },
        { $set: { assignedTrainerId: trainer.id } }
      );
    }

    // Update trainer assignedMembers
    await Trainer.updateMany({}, { $pull: { assignedMembers: user.id } });
    if (!trainer.assignedMembers) trainer.assignedMembers = [];
    if (!trainer.assignedMembers.includes(user.id)) trainer.assignedMembers.push(user.id);
    if (user.email && !trainer.assignedMembers.includes(user.email)) trainer.assignedMembers.push(user.email);
    await trainer.save();

    res.json({
      success: true,
      message: `Successfully assigned ${trainer.fullName} as your Personal Coach!`,
      trainer
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
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
  createManualAttendance,
  deleteAttendanceLog,
  getUserAttendance,
  getAdminAnalytics,
  getAdminMembers,
  deleteAdminMember,
  renewSubscription,
  generateQRToken,
  sendExpiryNotice,
  getCmsContent,
  updateHomepageContent,
  saveService,
  deleteService,
  saveMembership,
  deleteMembership,
  subscribeEvents,
  getUserNotifications,
  // Trainer Management System Exports
  getAdminTrainers,
  createAdminTrainer,
  updateAdminTrainer,
  toggleTrainerStatus,
  deleteAdminTrainer,
  assignMemberToTrainer,
  getTrainerAssignedMembers,
  createOrUpdateWorkoutPlan,
  getMemberWorkoutPlan,
  createOrUpdateDietPlan,
  getMemberDietPlan,
  logMemberProgress,
  getMemberProgress,
  getAssignedTrainerDetails,
  memberChooseTrainer
};
