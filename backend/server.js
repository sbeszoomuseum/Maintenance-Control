/**
 * Super Admin Maintenance Control Panel
 * Express Server Setup
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { API_BASE } = require('./config/constants');

// Route imports
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const maintenanceRoutes = require('./routes/maintenance');
const analyticsRoutes = require('./routes/analytics');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// ============================================
// Middleware
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: [
      process.env.CLIENT_APP_BASE_URL || 'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:8080',
    ],
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// Routes
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Super Admin Panel is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use(`${API_BASE}/auth`, authRoutes);
app.use(`${API_BASE}/clients`, clientRoutes);
app.use(`${API_BASE}/maintenance`, maintenanceRoutes);
app.use(`${API_BASE}/analytics`, analyticsRoutes);

// Serve static files (frontend)
app.use(express.static('frontend'));

// Frontend fallback - serve dashboard
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../frontend/index.html');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    code: 'NOT_FOUND',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// ============================================
// Server Setup
// ============================================

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║  Super Admin Maintenance Control Panel Running ║
╚════════════════════════════════════════════════╝

  🌐 Server: http://localhost:${PORT}
  📝 API Base: ${API_BASE}
  🔧 Environment: ${NODE_ENV}
  ⏰ Started: ${new Date().toISOString()}

Ready to manage college subscriptions and maintenance! 🚀
  `);
});

module.exports = app;
