const express = require('express');
const router = express.Router();
const controller = require('../controllers/apiController');
const { verifyToken } = require('../middleware/auth');

// Health Check
router.get('/health', controller.getHealth);

// Public Auth Endpoints
router.post('/auth/register', controller.registerUser);
router.post('/auth/login', controller.loginUser);

// Protected Auth & Member Profile Endpoints
router.get('/auth/me', verifyToken, controller.getCurrentUser);
router.put('/auth/profile', verifyToken, controller.updateProfile);

// Classes & Booking Endpoints
router.get('/classes', controller.getClasses);
router.post('/classes/book', verifyToken, controller.bookClass);
router.get('/members/bookings', verifyToken, controller.getUserBookings);
router.delete('/members/bookings/:bookingId', verifyToken, controller.cancelBooking);

// Digital QR Pass & Turnstile Simulator Endpoints
router.get('/members/qr-pass', verifyToken, controller.getDigitalPass);
router.post('/members/qr-pass/tap', verifyToken, controller.getDigitalPass);

// Public Gym Data Endpoints
router.get('/memberships', controller.getMemberships);
router.get('/facilities', controller.getFacilities);
router.get('/blog', controller.getBlogPosts);

// Lead Submissions
router.post('/contact', controller.submitContact);
router.post('/trial-pass', controller.submitTrialPass);

// Admin & Member QR Management Endpoints
router.post('/admin/verify-qr', controller.verifyQR);
router.get('/admin/attendance', controller.getAttendanceLogs);
router.get('/admin/analytics', controller.getAdminAnalytics);
router.get('/admin/members', controller.getAdminMembers);
router.delete('/admin/members/:id', controller.deleteAdminMember);
router.post('/admin/generate-qr', controller.generateQRToken);
router.post('/admin/send-expiry-notice', controller.sendExpiryNotice);
// Real-Time Push Events Stream & Customer Notifications
router.get('/events', controller.subscribeEvents);
router.get('/user/notifications', verifyToken, controller.getUserNotifications);
router.post('/user/renew-subscription', controller.renewSubscription);

// CMS Dynamic Endpoints
router.get('/cms/content', controller.getCmsContent);
router.put('/cms/homepage', controller.updateHomepageContent);
router.post('/cms/services', controller.saveService);
router.put('/cms/services/:id', controller.saveService);
router.delete('/cms/services/:id', controller.deleteService);
router.post('/cms/memberships', controller.saveMembership);
router.put('/cms/memberships/:id', controller.saveMembership);
router.delete('/cms/memberships/:id', controller.deleteMembership);

module.exports = router;
