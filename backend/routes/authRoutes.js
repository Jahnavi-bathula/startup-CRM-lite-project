import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getProfile,
  updateProfile,
  logout
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

/**
 * PRODUCTION SECURITY NOTE:
 * - To prevent brute-force attacks and resource exhaustion, integrate the 'express-rate-limit' package.
 * - In production, apply the rate limiter to registration, login, and update-profile endpoints:
 *   
 *   import rateLimit from 'express-rate-limit';
 *   const authRateLimiter = rateLimit({
 *     windowMs: 15 * 60 * 1000, // 15 minutes
 *     max: 10, // Limit each IP to 10 requests per window
 *     message: 'Too many authentication attempts. Please try again after 15 minutes.'
 *   });
 *   
 *   router.use('/login', authRateLimiter);
 *   router.use('/register', authRateLimiter);
 */

// 1. User Registration Route (POST /api/auth/register)
router.post(
  '/register',
  validate([
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Email must be a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ]),
  register
);

// 2. User Login Route (POST /api/auth/login)
router.post(
  '/login',
  validate([
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Email must be a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ]),
  login
);

// 3. Retrieve User Profile Route (GET /api/auth/profile)
router.get('/profile', protect, getProfile);

// 4. Update User Profile Route (PUT /api/auth/profile)
router.put(
  '/profile',
  protect,
  validate([
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('newPassword')
      .optional()
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
  ]),
  updateProfile
);

// 5. User Logout Route (POST /api/auth/logout)
router.post('/logout', protect, logout);

export default router;
