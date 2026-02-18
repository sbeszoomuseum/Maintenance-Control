/**
 * MaintenanceControl Model
 * Stores maintenance status and billing info for each client college
 */

const mongoose = require('mongoose');

const maintenanceControlSchema = new mongoose.Schema(
  {
    // Simple and clean field names
    client_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      description: 'Unique identifier for each college client',
    },
    status: {
      type: String,
      enum: ['active', 'due', 'suspended'],
      default: 'active',
      description: 'Current maintenance status (active=hidden popup, due/suspended=show popup)',
    },
    message: {
      type: String,
      default: '',
      description: 'Message to show in popup on client website',
    },
    last_paid_date: {
      type: Date,
      description: 'Date of last successful payment',
    },
    next_billing_date: {
      type: Date,
      description: 'Date when next billing cycle begins',
    },
    payment_status: {
      type: String,
      enum: ['paid', 'unpaid', 'pending'],
      default: 'unpaid',
      description: 'Payment status',
    },
    billing_history: [
      {
        _id: false,
        payment_date: {
          type: Date,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        method: {
          type: String,
          enum: ['credit_card', 'bank_transfer', 'check'],
        },
        transaction_id: String,
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
    collection: 'maintenance_controls',
  }
);

// Indexes for common queries
maintenanceControlSchema.index({ status: 1, next_billing_date: 1 });
maintenanceControlSchema.index({ created_at: -1 });
maintenanceControlSchema.index({ client_id: 1 });

module.exports = mongoose.model('MaintenanceControl', maintenanceControlSchema);
