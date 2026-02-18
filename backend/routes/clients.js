/**
 * Client Management Routes
 * GET /clients - List all clients
 * GET /clients/:id - Get specific client
 * POST /clients - Create new client
 * PUT /clients/:id - Update client
 */

const express = require('express');
const MaintenanceControl = require('../models/MaintenanceControl');
const authenticateToken = require('../middleware/auth');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHelper');

const router = express.Router();

// All routes protected with JWT
router.use(authenticateToken);

/**
 * GET /clients
 * List all clients with optional pagination, search, and filters
 * Query params: page, limit, status, search
 */
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status; // Filter by status
    const search = req.query.search; // Search by client id

    // Build filter
    const filter = {};
    if (status && ['active', 'due', 'suspended'].includes(status)) {
      filter.status = status;
    }
    if (search) {
      filter.client_id = { $regex: search, $options: 'i' };
    }

    const total = await MaintenanceControl.countDocuments(filter);
    const clients = await MaintenanceControl.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    paginatedResponse(res, clients, total, page, limit, 'Clients retrieved successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /clients/:id
 * Get detailed information about a specific client by ID or client_id
 */
router.get('/:id', async (req, res, next) => {
  try {
    // Try finding by MongoDB ID first, then by client_id
    let client = await MaintenanceControl.findById(req.params.id);
    
    if (!client) {
      client = await MaintenanceControl.findOne({ client_id: req.params.id });
    }

    if (!client) {
      return errorResponse(res, 'Client not found', 404, 'NOT_FOUND');
    }

    successResponse(res, client, 'Client retrieved successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /clients
 * Create a new client record
 */
router.post('/', async (req, res, next) => {
  try {
    const { client_id, message, next_billing_date } = req.body;

    // Validation
    if (!client_id) {
      return errorResponse(res, 'client_id is required', 400, 'MISSING_FIELDS');
    }

    // Check for duplicate
    const existing = await MaintenanceControl.findOne({ client_id });
    if (existing) {
      return errorResponse(res, 'Client ID already exists', 409, 'DUPLICATE_KEY');
    }

    const newClient = new MaintenanceControl({
      client_id: client_id.toLowerCase().trim(),
      status: 'active',
      message: message || 'Welcome',
      next_billing_date: next_billing_date ? new Date(next_billing_date) : null,
      payment_status: 'unpaid',
    });

    await newClient.save();
    successResponse(res, newClient, 'Client created successfully', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /clients/:id
 * Update client information (message, status, dates, payment_status)
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { message, status, next_billing_date, last_paid_date, payment_status } = req.body;

    let client = await MaintenanceControl.findById(req.params.id);
    
    if (!client) {
      client = await MaintenanceControl.findOne({ client_id: req.params.id });
    }

    if (!client) {
      return errorResponse(res, 'Client not found', 404, 'NOT_FOUND');
    }

    // Update fields if provided
    if (message !== undefined) client.message = message;
    if (status && ['active', 'due', 'suspended'].includes(status)) {
      client.status = status;
    }
    if (next_billing_date) {
      client.next_billing_date = new Date(next_billing_date);
    }
    if (last_paid_date) {
      client.last_paid_date = new Date(last_paid_date);
    }
    if (payment_status && ['paid', 'unpaid', 'pending'].includes(payment_status)) {
      client.payment_status = payment_status;
    }

    await client.save();
    successResponse(res, client, 'Client updated successfully');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
