/**
 * Maintenance Control Routes
 * GET /status/:client_id - Get maintenance status for client website (PUBLIC)
 * PUT /clients/:id/update-maintenance - Update maintenance status and message
 * POST /clients/:id/mark-paid - Record payment
 * POST /clients/:id/suspend - Suspend client
 * POST /clients/:id/activate - Reactivate client
 */

const express = require('express');
const MaintenanceControl = require('../models/MaintenanceControl');
const authenticateToken = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const router = express.Router();

/**
 * GET /status/:client_id
 * PUBLIC - Get maintenance status for client website
 * Returns: { status, message, payment_status }
 */
router.get('/status/:client_id', async (req, res, next) => {
  try {
    const client = await MaintenanceControl.findOne({
      client_id: req.params.client_id.toLowerCase().trim(),
    }).select('status message payment_status next_billing_date');

    if (!client) {
      return successResponse(res, {
        status: 'active',
        message: '',
        payment_status: 'paid',
      }, 'Client not found - defaulting to active');
    }

    // Return client status
    successResponse(res, {
      status: client.status,
      message: client.message,
      payment_status: client.payment_status,
      next_billing_date: client.next_billing_date,
    }, 'Status retrieved successfully');
  } catch (error) {
    next(error);
  }
});

// All routes below require JWT
router.use(authenticateToken);

/**
 * PUT /clients/:id/update-maintenance
 * Update maintenance status and message (popup text)
 */
router.put('/:id/update-maintenance', async (req, res, next) => {
  try {
    const { status, message } = req.body;

    let client = await MaintenanceControl.findById(req.params.id);
    if (!client) {
      client = await MaintenanceControl.findOne({ client_id: req.params.id });
    }

    if (!client) {
      return errorResponse(res, 'Client not found', 404, 'NOT_FOUND');
    }

    // Validate status if provided
    if (status && !['active', 'due', 'suspended'].includes(status)) {
      return errorResponse(res, 'Invalid status value', 400, 'INVALID_STATUS');
    }

    // Update fields
    if (status !== undefined) client.status = status;
    if (message !== undefined) client.message = message;

    await client.save();

    return successResponse(res, client, 'Maintenance settings updated successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /clients/:id/mark-paid
 * Record a payment and activate client
 */
router.post('/:id/mark-paid', async (req, res, next) => {
  try {
    const { amount, method, next_billing_date, transaction_id, notes } = req.body;

    let client = await MaintenanceControl.findById(req.params.id);
    if (!client) {
      client = await MaintenanceControl.findOne({ client_id: req.params.id });
    }

    if (!client) {
      return errorResponse(res, 'Client not found', 404, 'NOT_FOUND');
    }

    if (!amount) {
      return errorResponse(res, 'Payment amount is required', 400, 'MISSING_FIELDS');
    }

    // Record payment in billing history
    const paymentRecord = {
      payment_date: new Date(),
      amount: parseFloat(amount),
      method: method || 'credit_card',
      transaction_id: transaction_id || null,
      notes: notes || '',
    };

    client.billing_history.push(paymentRecord);
    client.last_paid_date = new Date();
    client.status = 'active';
    client.payment_status = 'paid';

    // Update next billing date if provided
    if (next_billing_date) {
      client.next_billing_date = new Date(next_billing_date);
    }

    await client.save();

    return successResponse(res, client, 'Payment recorded and client activated successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /clients/:id/suspend
 * Suspend a client subscription
 */
router.post('/:id/suspend', async (req, res, next) => {
  try {
    const { message } = req.body;

    let client = await MaintenanceControl.findById(req.params.id);
    if (!client) {
      client = await MaintenanceControl.findOne({ client_id: req.params.id });
    }

    if (!client) {
      return errorResponse(res, 'Client not found', 404, 'NOT_FOUND');
    }

    client.status = 'suspended';
    client.payment_status = 'unpaid';
    if (message) {
      client.message = message;
    }

    await client.save();

    return successResponse(res, client, 'Client suspended successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /clients/:id/activate
 * Reactivate a suspended client
 */
router.post('/:id/activate', async (req, res, next) => {
  try {
    let client = await MaintenanceControl.findById(req.params.id);
    if (!client) {
      client = await MaintenanceControl.findOne({ client_id: req.params.id });
    }

    if (!client) {
      return errorResponse(res, 'Client not found', 404, 'NOT_FOUND');
    }

    client.status = 'active';
    client.payment_status = 'paid';

    await client.save();

    return successResponse(res, client, 'Client reactivated successfully');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
