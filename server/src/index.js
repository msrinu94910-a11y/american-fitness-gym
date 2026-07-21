const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS & Body Parsing Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Root Health Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to American Fitness Gym REST API',
    endpoints: '/api/health, /api/auth/login, /api/auth/register, /api/memberships, /api/facilities, /api/blog',
    status: 'Running'
  });
});

// 404 and Error Middleware
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` 🔥 American Fitness Gym API Server running on port ${PORT}`);
  console.log(` 🌐 Health Endpoint: http://localhost:${PORT}/api/health`);
  console.log(`==================================================`);
});
