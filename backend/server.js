import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Load environment variables as the very first step
dotenv.config();

// Import database connection configuration
import { connectDB } from './config/database.js';

// Import router modules
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';

// Import global error handling middleware
import errorHandler from './middleware/errorHandler.js';

// Initialize the Express application
const app = express();

/* ==========================================================================
   GLOBAL MIDDLEWARE CONFIGURATIONS
   ========================================================================== */

// Use Helmet to secure HTTP headers (adds various security headers)
app.use(helmet());

// Use Morgan for development-friendly HTTP request logging
app.use(morgan('dev'));

// Enable CORS with dynamic origin from environment variable and credentials support
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Limit incoming request payload size to 10kb to prevent Denial of Service (DoS) attacks
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded bodies (extended: true allows nested objects in query strings)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/* ==========================================================================
   ROUTING SETUP
   ========================================================================== */

// Health check endpoint to monitor application status
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date()
  });
});

// Authentication routes mapping
app.use('/api/auth', authRoutes);

// Leads management routes mapping
app.use('/api/leads', leadRoutes);

/* ==========================================================================
   ERROR HANDLING MIDDLEWARE
   ========================================================================== */

// The global error handler must be registered last (after all routes and middleware)
app.use(errorHandler);

/* ==========================================================================
   SERVER INITIALIZATION & DATABASE CONNECTION
   ========================================================================== */

// Establish database connection first, then start the server listener
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  const NODE_ENV = process.env.NODE_ENV || 'development';

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
  });
}).catch((error) => {
  console.error('Failed to start server due to database connection issue:', error.message);
  process.exit(1);
});
