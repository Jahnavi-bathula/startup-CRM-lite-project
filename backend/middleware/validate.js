import { validationResult } from 'express-validator';

/**
 * Middleware runner for express-validator validation chains.
 * Runs specified rules sequentially, captures formatting/validation failures,
 * and sends a 400 response with detailed field-by-field messages if failures exist.
 * 
 * @param {Array} validations - Array of validation chains (e.g. body('email').isEmail()).
 * @returns {Function} Express middleware handler.
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validation checks asynchronously
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    
    // If no validation errors occurred, proceed to the next handler
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors to return a structured list of { field, message }
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    // Send a 400 response with structured validation errors
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
    });
  };
};
