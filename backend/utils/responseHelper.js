/**
 * Utility Functions for API responses
 */

// Successful response
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Error response
const errorResponse = (res, message = 'Error', statusCode = 500, code = 'ERROR') => {
  res.status(statusCode).json({
    success: false,
    message,
    code,
  });
};

// Paginated response
const paginatedResponse = (res, data, total, page, limit, message = 'Success') => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};
