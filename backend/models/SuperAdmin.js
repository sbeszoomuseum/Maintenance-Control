/**
 * SuperAdmin Model
 * Stores super admin user credentials with hashed passwords
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const superAdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      description: 'Email address for super admin login',
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      description: 'Hashed password',
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: 'super_admin',
      enum: ['super_admin'],
    },
    lastLogin: {
      type: Date,
      description: 'Timestamp of last successful login',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    loginAttempts: {
      type: Number,
      default: 0,
      description: 'Failed login attempts counter',
    },
    lockUntil: {
      type: Date,
      description: 'Account locked until this date (after too many attempts)',
    },
  },
  {
    timestamps: true,
    collection: 'super_admins',
  }
);

// Hash password before saving
superAdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
superAdminSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

// Method to check if account is locked
superAdminSchema.methods.isLocked = function () {
  return this.lockUntil && new Date() < this.lockUntil;
};

module.exports = mongoose.model('SuperAdmin', superAdminSchema);
