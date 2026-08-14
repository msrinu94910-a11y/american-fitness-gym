const express = require('express');
const router = express.Router();
const controller = require('../controllers/apiController');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Health Check
router.get('/health', controller.getHealth);

// Public Auth Endpoints
router.post('/auth/register', controller.registerUser);
router.post('/auth/login', controller.loginUser);

// Protected Auth & Member Profile Endpoints
router.get('/auth/me', verifyToken, controller.getCurrentUser);
router.put('/auth/profile', verifyToken, controller.updateProfile);

// Trainer Management System Endpoints (Admin Permissions)
router.get('/admin/trainers', verifyToken, controller.getAdminTrainers);
router.post('/admin/trainers', verifyToken, verifyRole('admin'), controller.createAdminTrainer);
router.put('/admin/trainers/:id', verifyToken, verifyRole('admin'), controller.updateAdminTrainer);
router.patch('/admin/trainers/:id/status', verifyToken, verifyRole('admin'), controller.toggleTrainerStatus);
router.delete('/admin/trainers/:id', verifyToken, verifyRole('admin'), controller.deleteAdminTrainer);
router.post('/admin/trainers/assign', verifyToken, verifyRole('admin'), controller.assignMemberToTrainer);

// Trainer Portal Endpoints (Trainer & Admin Permissions)
router.get('/trainer/members', verifyToken, verifyRole('trainer', 'admin'), controller.getTrainerAssignedMembers);
router.post('/trainer/workout-plans', verifyToken, verifyRole('trainer', 'admin'), controller.createOrUpdateWorkoutPlan);
router.post('/trainer/diet-plans', verifyToken, verifyRole('trainer', 'admin'), controller.createOrUpdateDietPlan);
router.post('/trainer/progress', verifyToken, verifyRole('trainer', 'admin'), controller.logMemberProgress);

// Member Dashboard Endpoints (User Permissions)
router.get('/user/trainer', verifyToken, controller.getAssignedTrainerDetails);
router.post('/user/choose-trainer', verifyToken, controller.memberChooseTrainer);
router.get('/user/workout-plan', verifyToken, controller.getMemberWorkoutPlan);
router.get('/user/diet-plan', verifyToken, controller.getMemberDietPlan);
router.get('/user/progress', verifyToken, controller.getMemberProgress);

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

// Admin & Member Attendance Management Endpoints
router.post('/admin/verify-qr', controller.verifyQR);
router.get('/admin/attendance', controller.getAttendanceLogs);
router.post('/admin/attendance', controller.createManualAttendance);
router.delete('/admin/attendance/:id', controller.deleteAttendanceLog);
router.get('/user/attendance', controller.getUserAttendance);
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
