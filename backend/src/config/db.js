const mongoose = require('mongoose');
const dns = require('dns');
const seedDatabase = require('./seed');

// Configure Google Public DNS to reliably resolve MongoDB Atlas SRV records on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Fallback to system DNS
}

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.warn('⚠️  MONGODB_URI is not defined in environment variables.');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    await seedDatabase();
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;

