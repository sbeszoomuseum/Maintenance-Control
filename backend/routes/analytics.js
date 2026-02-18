/**
 * Analytics Routes
 * GET /analytics/summary - Get overall system summary
 * GET /analytics/status-breakdown - Get client status breakdown
 */

const express = require('express');
const MaintenanceControl = require('../models/MaintenanceControl');
const authenticateToken = require('../middleware/auth');
const { successResponse } = require('../utils/responseHelper');

const router = express.Router();

// All routes protected with JWT
router.use(authenticateToken);

/**
 * GET /analytics/summary
 * Get summary statistics
 */
router.get('/summary', async (req, res, next) => {
  try {
    const totalClients = await MaintenanceControl.countDocuments();
    const activeClients = await MaintenanceControl.countDocuments({
      status: 'active',
    });
    const dueClients = await MaintenanceControl.countDocuments({
      status: 'due',
    });
    const suspendedClients = await MaintenanceControl.countDocuments({
      status: 'suspended',
    });

    // Calculate total revenue (sum of all payments)
    const result = await MaintenanceControl.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $sum: '$billing_history.amount',
            },
          },
        },
      },
    ]);

    const totalRevenue = result[0]?.totalRevenue || 0;

    const summary = {
      totalClients,
      activeClients,
      dueClients,
      suspendedClients,
      totalRevenue,
      healthPercentage: totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0,
    };

    successResponse(res, summary, 'Analytics summary retrieved successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /analytics/status-breakdown
 * Get breakdown of clients by status
 */
router.get('/status-breakdown', async (req, res, next) => {
  try {
    const breakdown = await MaintenanceControl.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formatted = {
      active: 0,
      due: 0,
      suspended: 0,
    };

    breakdown.forEach((item) => {
      if (formatted.hasOwnProperty(item._id)) {
        formatted[item._id] = item.count;
      }
    });

    successResponse(res, formatted, 'Status breakdown retrieved successfully');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
