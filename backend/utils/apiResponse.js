/**
 * Sends a consistent success API response.
 * 
 * @param {Object} res - Express response object.
 * @param {any} data - The data payload to be returned.
 * @param {string} message - Success description message.
 * @param {number} [statusCode=200] - HTTP status code.
 * @returns {Object} Express response JSON.
 */
export const successResponse = (res, data, message, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Sends a consistent error API response.
 * 
 * @param {Object} res - Express response object.
 * @param {string} message - Error description message.
 * @param {number} [statusCode=500] - HTTP status code.
 * @param {any} [errors=null] - Detailed errors array or validation errors object.
 * @returns {Object} Express response JSON.
 */
export const errorResponse = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

/**
 * Sends a consistent paginated API response.
 * 
 * @param {Object} res - Express response object.
 * @param {Array} data - The paginated subset of data.
 * @param {number} total - The total number of items available.
 * @param {number} page - The current page number.
 * @param {number} limit - The number of items per page.
 * @returns {Object} Express response JSON.
 */
export const paginatedResponse = (res, data, total, page, limit) => {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
};
