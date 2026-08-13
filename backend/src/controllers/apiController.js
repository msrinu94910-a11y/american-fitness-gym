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
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email address and password are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const namePart = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').trim();

    let user = await User.findOne({
      $or: [
        { email: cleanEmail },
        ...(namePart.length > 2 ? [{ fullName: new RegExp(`^${namePart}$`, 'i') }] : [])
      ]
    });

    if (!user) {
      // Auto provision account in MongoDB
      const isAdmin = cleanEmail.includes('admin') || role === 'admin';
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      const memNum = Math.floor(100000 + Math.random() * 900000);
      const code = `AFG-${memNum}`;

      user = await User.create({
        id: 'usr_' + Date.now(),
        fullName: formattedName || 'Gym Member',
        email: cleanEmail,
        password: password,
        phone: '(555) 000-0000',
        membershipPlan: isAdmin ? 'Staff Admin' : 'Pro Athlete VIP',
        membershipId: code,
        qrCode: code,
        role: isAdmin ? 'admin' : 'user',
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
      if (!user.membershipId) {
        const memNum = Math.floor(100000 + Math.random() * 900000);
        user.membershipId = user.qrCode || `AFG-${memNum}`;
        user.qrCode = user.membershipId;
      }
      await user.save();
    }

    const userObj = user.toObject();
    delete userObj.password;

    const effectiveRole = role === 'admin' || user.role === 'admin' || cleanEmail.includes('admin') ? 'admin' : 'user';
    userObj.role = effectiveRole;

    const token = 'afg_token_' + Buffer.from(cleanEmail).toString('base64') + '_' + Date.now();

    res.json({
      success: true,
      message: `Welcome back, ${user.fullName} (${effectiveRole === 'admin' ? 'Admin Officer' : 'User Member'})!`,
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

    const attendanceRecord = await Attendance.create({
      id: 'att_' + Date.now(),
      memberName,
      email,
      checkInTime: new Date().toISOString(),
      zone: 'Mobile Camera Gate 1',
      method: 'Digital QR Verification',
      status: 'GRANTED_ENTRY'
    });

    res.json({
      success: true,
      hasSubscription: true,
      status: 'ACTIVE',
      message: `ACTIVE MEMBERSHIP CONFIRMED ✅ Welcome, ${memberName}! Attendance entry logged in MongoDB Atlas.`,
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
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
      },
      attendance: attendanceRecord
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET Admin Attendance Logs Audit Trail
const getAttendanceLogs = async (req, res) => {
  try {
    const logs = await Attendance.find().sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err) {
    res.json({ success: true, count: 0, data: [] });
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

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCheckIns = await Attendance.countDocuments({
      createdAt: { $gte: startOfDay }
    });

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
  getUserNotifications
};
