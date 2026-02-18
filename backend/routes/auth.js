/**
 * Authentication Routes
 * POST /login - Super admin login
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/SuperAdmin');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { JWT_EXPIRY } = require('../config/constants');

const router = express.Router();

/**
 * POST /login
 * Super admin login with email and password
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400, 'MISSING_FIELDS');
    }

    // Find admin
    const admin = await SuperAdmin.findOne({ email: email.toLowerCase() });
    if (!admin || !admin.isActive) {
      return errorResponse(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Check if account is locked
    if (admin.isLocked()) {
      return errorResponse(res, 'Account is locked. Try again later.', 429, 'ACCOUNT_LOCKED');
    }

    // Verify password
    const passwordMatch = await admin.comparePassword(password);
    if (!passwordMatch) {
      admin.loginAttempts += 1;

      // Lock account after 5 failed attempts
      if (admin.loginAttempts >= 5) {
        admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        console.warn(`⚠ Account locked for ${admin.email} after 5 failed login attempts`);
      }

      await admin.save();
      return errorResponse(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Reset login attempts on successful login
    admin.loginAttempts = 0;
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return successResponse(
      res,
      {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          fullName: admin.fullName,
          role: admin.role,
        },
      },
      'Login successful',
      200
    );
  } catch (error) {
    next(error);
  }
});

/**
 * POST /logout
 * Logout endpoint (client-side JWT removal recommended)
 */
router.post('/logout', (req, res) => {
  // JWT is stateless, logout happens on client by removing token
  successResponse(res, null, 'Logged out successfully', 200);
});

/**
 * POST /setup-admin
 * Create the first super admin account (for initial setup only)
 */
router.post('/setup-admin', async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return errorResponse(res, 'Email, password, and full name are required', 400, 'MISSING_FIELDS');
    }

    // Check if admin already exists
    const existingAdmin = await SuperAdmin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return errorResponse(res, 'Admin account already exists', 409, 'ADMIN_EXISTS');
    }

    // Create new admin with Mongoose (will trigger pre-save hashing)
    const newAdmin = new SuperAdmin({
      email: email.toLowerCase(),
      password: password, // Will be hashed by Mongoose pre-save hook
      fullName: fullName.trim(),
      role: 'super_admin',
      isActive: true,
    });

    await newAdmin.save();

    return successResponse(
      res,
      {
        admin: {
          id: newAdmin._id,
          email: newAdmin.email,
          fullName: newAdmin.fullName,
          role: newAdmin.role,
        },
      },
      'Admin account created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
