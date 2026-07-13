import { errorResponse } from '../utils/apiResponse.js';

/**
 * Global Express Error Handling Middleware.
 * 
 * Intercepts all next(err) calls across routers and controllers, structures the response payload
 * according to the environment (dev vs. prod), and maps specific database and auth issues to standard status codes.
 * 
 * @param {Object} err - Error object thrown in application code.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Next middleware trigger function.
 * @returns {Object} Express response.
 */
const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';
  let errors = null;

  // 1. Mongoose ValidationError -> 400 with field-by-field error messages
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = {};
    // Parse each schema validation path error message
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
  }
  // 2. Mongoose CastError (invalid ObjectId) -> 404 "Resource not found"
  else if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }
  // 3. MongoDB duplicate key (code 11000) -> 409 "Email already exists"
  else if (err.code === 11000) {
    statusCode = 409;
    message = 'Email already exists';
    // Capture the duplicate key/value if available for debugging/response
    if (err.keyValue) {
      errors = err.keyValue;
    }
  }
  // 4. JWT errors (JsonWebTokenError, TokenExpiredError) -> 401
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please authenticate again.';
  } 
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired. Please authenticate again.';
  }
  // 5. Everything else -> 500 "Server error"
  else {
    // If it's a general runtime error without a custom status code, default to 500 and mask implementation details.
    if (statusCode === 500) {
      message = 'Server error';
    }
  }

  // Log full error logs to server output during development for debugging ease
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Intercepted by Global Handler:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
  }

  // In development: include err.stack in the response
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      stack: err.stack
    });
  }

  // In production: never send stack traces (delegate to errorResponse helper)
  return errorResponse(res, message, statusCode, errors);
};

export default errorHandler;
