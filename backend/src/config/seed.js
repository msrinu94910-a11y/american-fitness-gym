const User = require('../models/User');
const Membership = require('../models/Membership');
const Facility = require('../models/Facility');
const BlogPost = require('../models/BlogPost');
const Booking = require('../models/Booking');
const Attendance = require('../models/Attendance');
const CMSContent = require('../models/CMSContent');
const Notification = require('../models/Notification');
const store = require('../data/store');
const cmsData = require('../data/cms.json');

const seedDatabase = async () => {
  try {
    // 1. Seed & Sync Users
    if (store.users && store.users.length > 0) {
      for (const u of store.users) {
        await User.findOneAndUpdate({ email: u.email.toLowerCase() }, u, { upsert: true, returnDocument: 'after' });
      }
      console.log(`🌱 Seeded & synced ${store.users.length} users (including expired members) into MongoDB Atlas.`);
    }

    // 2. Seed Memberships
    const membershipCount = await Membership.countDocuments();
    if (membershipCount === 0 && store.membershipPlans && store.membershipPlans.length > 0) {
      await Membership.insertMany(store.membershipPlans);
      console.log(`🌱 Seeded ${store.membershipPlans.length} initial membership plans into MongoDB.`);
    }

    // 3. Seed Facilities
    const facilityCount = await Facility.countDocuments();
    if (facilityCount === 0 && store.facilities && store.facilities.length > 0) {
      await Facility.insertMany(store.facilities);
      console.log(`🌱 Seeded ${store.facilities.length} initial facilities into MongoDB.`);
    }

    // 4. Seed Blog Posts
    const blogCount = await BlogPost.countDocuments();
    if (blogCount === 0 && store.blogPosts && store.blogPosts.length > 0) {
      await BlogPost.insertMany(store.blogPosts);
      console.log(`🌱 Seeded ${store.blogPosts.length} initial blog posts into MongoDB.`);
    }

    // 5. Seed Bookings
    const bookingCount = await Booking.countDocuments();
    if (bookingCount === 0 && store.bookings && store.bookings.length > 0) {
      await Booking.insertMany(store.bookings);
      console.log(`🌱 Seeded ${store.bookings.length} initial bookings into MongoDB.`);
    }

    // 6. Seed Attendance Logs
    const attendanceCount = await Attendance.countDocuments();
    if (attendanceCount === 0 && store.attendanceLogs && store.attendanceLogs.length > 0) {
      await Attendance.insertMany(store.attendanceLogs);
      console.log(`🌱 Seeded ${store.attendanceLogs.length} initial attendance records into MongoDB.`);
    }

    // 7. Seed Notifications
    const notificationCount = await Notification.countDocuments();
    if (notificationCount === 0 && store.notifications && store.notifications.length > 0) {
      await Notification.insertMany(store.notifications);
      console.log(`🌱 Seeded ${store.notifications.length} initial notifications into MongoDB.`);
    }

    // 8. Seed & Sync CMS Content
    if (cmsData) {
      await CMSContent.findOneAndUpdate({ key: 'main' }, { key: 'main', data: cmsData }, { upsert: true, returnDocument: 'after' });
      console.log('🌱 Seeded & synced CMS content into MongoDB Atlas.');
    }

  } catch (error) {
    console.error('❌ Database Seeding Error:', error.message);
  }
};

module.exports = seedDatabase;
