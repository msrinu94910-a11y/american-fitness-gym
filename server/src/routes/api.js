const express = require('express');
const router = express.Router();
const controller = require('../controllers/apiController');

// Health Check
router.get('/health', controller.getHealth);

// Auth Endpoints
router.post('/auth/register', controller.registerUser);
router.post('/auth/login', controller.loginUser);

// Data Endpoints
router.get('/memberships', controller.getMemberships);
router.get('/facilities', controller.getFacilities);
router.get('/blog', controller.getBlogPosts);

// Lead Submissions
router.post('/contact', controller.submitContact);
router.post('/trial-pass', controller.submitTrialPass);

module.exports = router;
