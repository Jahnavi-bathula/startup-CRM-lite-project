import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Helper function to generate a signed JSON Web Token (JWT).
 * 
 * @param {string} userId - The unique identifier of the user.
 * @returns {string} The signed JWT token.
 */
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Register a new user in the system.
 * Checks if the email is already in use, creates the user, hashes password via mongoose hooks,
 * and returns the user object (without password) and signed token.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if a user with the given email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'Email already exists', 409);
    }

    // Create and save the new user document
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate JWT token
    const token = generateToken(user._id);

    // Return the response; toJSON() override on User model automatically strips the password field
    return successResponse(
      res,
      { token, user: user.toJSON() },
      'User registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticates an existing user.
 * PRODUCTION SECURITY NOTE: 
 * - In production, express-rate-limit middleware should be attached to this endpoint
 *   to prevent brute-force attacks on user credentials.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find the user and explicitly fetch the password field (+password) for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return errorResponse(res, 'User Not Found. Please check your email or register.', 401);
    }

    // Verify password match using bcrypt
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return errorResponse(res, 'Invalid Password. Please try again.', 401);
    }

    // Check if the user account is active
    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated. Please contact support.', 403);
    }

    // Generate JWT token
    let token;
    try {
      token = generateToken(user._id);
    } catch (tokenError) {
      return errorResponse(res, 'Token Generation Failed. Please try again.', 500);
    }

    // Remove the password field from the user representation
    const userWithoutPassword = user.toJSON();

    return successResponse(
      res,
      { token, user: userWithoutPassword },
      'Login successful',
      200
    );
  } catch (error) {
    next(error);
  }
};


/**
 * Fetches the profile of the currently logged-in user.
 * The user object is already attached to 'req.user' by the 'protect' middleware.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const getProfile = async (req, res, next) => {
  try {
    return successResponse(
      res,
      req.user,
      'Profile retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Updates the user's profile information.
 * - Allows updating the 'name' field only (email edits require a separate verification route).
 * - If changing the password, requires and validates the 'oldPassword' first before hashing the 'newPassword'.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, oldPassword, newPassword } = req.body;

    // Fetch user details from database with password select enabled for verification
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return errorResponse(
        res,
        'User belonging to this token no longer exists',
        401
      );
    }

    // Allow updating name only (email changes need a verification flow)
    if (name) {
      user.name = name;
    }

    // If new password is provided, validate old password first
    if (newPassword) {
      if (!oldPassword) {
        return errorResponse(
          res,
          'Current password is required to set a new password',
          400
        );
      }

      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        return errorResponse(res, 'Invalid current password', 400);
      }

      // Set the new password. The pre-save mongoose hook will auto-hash this.
      user.password = newPassword;
    }

    // Save updates
    await user.save();

    // Convert updated document to JSON (toJSON automatically strips the password field)
    const updatedUser = user.toJSON();

    return successResponse(
      res,
      updatedUser,
      'Profile updated successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Logs out the authenticated user.
 * In a standard stateless JWT setup, this client-side token discard is reported as successful,
 * or token blacklisting would be integrated here if a cache layer was configured.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const logout = async (req, res, next) => {
  try {
    return successResponse(res, null, 'Logged out successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Google ID token and log in / auto-register the user.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return errorResponse(res, 'Google ID token is required', 400);
    }

    // Verify token by calling Google's API endpoint using global fetch
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!response.ok) {
      return errorResponse(res, 'Invalid Google ID token', 401);
    }

    const payload = await response.json();
    const { sub: googleId, email, name } = payload;

    if (!email) {
      return errorResponse(res, 'Google account has no email address associated', 400);
    }

    // 1. Check if user already exists by googleId
    let user = await User.findOne({ googleId });

    // 2. If not found, check if a user with same email exists
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        // Associate googleId with existing email/password account
        user.googleId = googleId;
        await user.save();
      }
    }

    // 3. If still not found, create a new user (social registration)
    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email,
        googleId: googleId,
        isActive: true,
        role: 'user'
      });
    }

    // 4. Generate JWT token
    const token = generateToken(user._id);

    return successResponse(
      res,
      { token, user: user.toJSON() },
      'Logged in with Google successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset link.
 * Skeleton implementation.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 'Email address is required', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal that the user does not exist.
      // Simply return a success response saying the reset email was sent.
      return successResponse(res, null, 'If that email exists, we sent a password reset link.', 200);
    }

    // In a real application, you would generate a reset token and email it.
    console.log(`[Forgot Password Request] Reset link generated for user: ${email}`);

    return successResponse(
      res,
      null,
      'If that email exists, we sent a password reset link.',
      200
    );
  } catch (error) {
    next(error);
  }
};
