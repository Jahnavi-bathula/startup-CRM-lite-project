import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Middleware to protect routes by validating JSON Web Tokens (JWT).
 * Extracts the token from the 'Authorization' header ('Bearer <token>').
 * Verifies authenticity, checks if the associated user still exists, 
 * and attaches the authenticated user record to 'req.user'.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Extract token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. If token is missing
  if (!token) {
    return errorResponse(res, 'No token provided, access denied', 401);
  }

  try {
    // 3. Verify the token with JWT Secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find the user in the database, excluding the password field
    const user = await User.findById(decoded.id).select('-password');
    
    // 5. If user no longer exists in database
    if (!user) {
      return errorResponse(
        res,
        'User belonging to this token no longer exists',
        401
      );
    }

    // 6. Attach user to request object and proceed
    req.user = user;
    next();
  } catch (error) {
    // 7. If token is expired
    if (error.name === 'TokenExpiredError') {
      return errorResponse(
        res,
        'Token has expired, please login again',
        401
      );
    }
    
    // 8. If token is invalid (generic validation catch)
    return errorResponse(res, 'Token is invalid', 401);
  }
};
