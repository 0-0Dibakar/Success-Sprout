require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();

// =====================
// MIDDLEWARE SETUP
// =====================

// CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true); // Allow in development
  },
  credentials: true
}));

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static file serving
app.use(express.static('public'));

// =====================
// DATABASE CONNECTION
// =====================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/successSprout';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`📚 Database: ${MONGODB_URI.split('/').pop()}`);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('📝 Ensure MongoDB is running and MONGODB_URI is correct in .env');
  });

// =====================
// API ROUTES
// =====================

// Import route handlers
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const courseRoutes = require('./routes/courses');
const scholarshipRoutes = require('./routes/scholarships');

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/scholarships', scholarshipRoutes);

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});


// =====================
// STATIC FILE SERVING
// =====================

// Serve React client build if available (production)
const clientDist = path.join(__dirname, 'client', 'dist');

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    // Let API routes fall through
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
  console.log('📦 Serving React client from /client/dist');
} else {
  console.log('📝 React client build not found - development mode');
  // Serve legacy HTML files if no React build
  app.get(['/Index.html', '/index.html', '/'], (req, res) => {
    res.sendFile(path.join(__dirname, 'Index.html'));
  });
}

// =====================
// ERROR HANDLERS
// =====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Server error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// =====================
// SERVER STARTUP
// =====================

const PORT = process.env.PORT || 3000;
const BIND_HOST = process.env.BIND_HOST || '0.0.0.0';

const server = app.listen(PORT, BIND_HOST, () => {
  const addr = server.address();
  console.log('\n' + '='.repeat(50));
  console.log('🚀 SUCCESS SPROUT SERVER STARTED');
  console.log('='.repeat(50));
  console.log(`📍 Server running on http://${addr.address}:${addr.port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50) + '\n');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close();
    process.exit(0);
  });
});

module.exports = app;