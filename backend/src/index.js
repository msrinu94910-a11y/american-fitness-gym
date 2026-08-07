const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS & Body Parsing Middleware - Allow all origins (Local, Vercel, Staging)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman) or any web origin
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
