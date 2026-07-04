import { errorResponse } from '../utils/apiResponse.js';

/**
 * Global Express Error Handler middleware.
 * Catches various database, authentication, and internal server errors,
 * formats them, and returns a consistent API response.
 * 
 * @param {Object} err - The error object.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';
  let errors = null;

  // 1. Mongoose ValidationError -> 400 with field-by-field error messages
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = {};
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
    // Although code 11000 can be triggered by other fields, our primary unique index is Email
    message = 'Email already exists';
    // Optionally extract the duplicate key details
    if (err.keyValue) {
      errors = err.keyValue;
    }
  }
  // 4. JWT errors (JsonWebTokenError, TokenExpiredError) -> 401
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please authenticate again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired. Please authenticate again.';
  }
  // 5. Everything else -> 500 "Server error" (if not already set to custom status)
  else {
    if (statusCode === 500) {
      message = 'Server error';
    }
  }

  // Log error details for development troubleshooting
  if (process.env.NODE_ENV === 'development') {
    console.error('Error caught in global handler:', err);
  }

  // In development, include err.stack in the response
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      stack: err.stack
    });
  }

  // In production, never send stack traces
  return errorResponse(res, message, statusCode, errors);
};

export default errorHandler;
