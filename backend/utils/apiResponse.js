/**
 * Consistent success response helper.
 * Returns formatted JSON payload with a success status, message, and data.
 * 
 * @param {Object} res - Express response object.
 * @param {any} data - Content payload returned to the client.
 * @param {string} message - Descriptive message about the operation outcome.
 * @param {number} [statusCode=200] - HTTP status code (defaults to 200).
 * @returns {Object} Express JSON response.
 */
export const successResponse = (res, data, message, statusCode = 200) => {
  // Use dynamic statusCode so we can return custom success codes like 201 (Created) or 202 (Accepted)
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Consistent error response helper.
 * Returns formatted JSON payload with success: false, message, and optional error details.
 * 
 * @param {Object} res - Express response object.
 * @param {string} message - Descriptive error message.
 * @param {number} [statusCode=500] - HTTP status code (defaults to 500).
 * @param {any} [errors=null] - Additional validation or structured errors.
 * @returns {Object} Express JSON response.
 */
export const errorResponse = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

/**
 * Consistent paginated response helper.
 * Wraps list data with standard metadata indicating total records, limit, and current page.
 * 
 * @param {Object} res - Express response object.
 * @param {Array} data - Array of paginated records.
 * @param {number} total - Total number of documents matching the search filters.
 * @param {number} page - Current active page index (1-based).
 * @param {number} limit - Maximum number of items requested per page.
 * @returns {Object} Express JSON response with data and pagination metadata.
 */
export const paginatedResponse = (res, data, total, page, limit) => {
  const pagesCount = Math.ceil(total / limit);
  const hasNext = page < pagesCount;
  const hasPrev = page > 1;
  
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: pagesCount,
      hasNext,
      hasPrev
    }
  });
};
