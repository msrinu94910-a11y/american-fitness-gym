const store = require('../data/store');

// Health Check
const getHealth = (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    app: 'American Fitness Gym API',
    version: '1.0.0'
  });
};

// Auth: Register
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

  const newUser = {
    id: 'usr_' + Date.now(),
    fullName,
    email: email.toLowerCase(),
    password,
    phone: phone || 'N/A',
    membershipPlan: membershipPlan || 'Pro Athlete',
    status: 'ACTIVE_MEMBER',
    joinedDate: new Date().toISOString().split('T')[0]
  };

  store.users.push(newUser);

  const { password: _, ...userWithoutPassword } = newUser;
  const token = 'afg_token_' + Buffer.from(email).toString('base64') + '_' + Date.now();

  res.status(201).json({
    success: true,
    message: 'Account created successfully! Welcome to American Fitness Gym.',
    token,
    user: userWithoutPassword
  });
};

// Auth: Login
const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email address and password are required.'
    });
  }

  const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email address or password. Please try again.'
    });
  }

  const { password: _, ...userWithoutPassword } = user;
  const token = 'afg_token_' + Buffer.from(email).toString('base64') + '_' + Date.now();

  res.json({
    success: true,
    message: 'Welcome back, ' + user.fullName + '!',
    token,
    user: userWithoutPassword
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

module.exports = {
  getHealth,
  registerUser,
  loginUser,
  getMemberships,
  getFacilities,
  getBlogPosts,
  submitContact,
  submitTrialPass
};
