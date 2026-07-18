import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

// Import module to create require for ES Modules compatibility
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load environment variables from the .env file as the very first step
try {
  require('dotenv').config();
  console.log('Safe Debug: Environment variables loaded successfully in server.js.');
} catch (envError) {
  console.error('Safe Debug: Failed to load environment variables via dotenv in server.js:', envError.message);
}

// Harmonize environment variable names (MONGODB_URI and MONGO_URI)
if (process.env.MONGO_URI && !process.env.MONGODB_URI) {
  process.env.MONGODB_URI = process.env.MONGO_URI;
} else if (process.env.MONGODB_URI && !process.env.MONGO_URI) {
  process.env.MONGO_URI = process.env.MONGODB_URI;
}

// Ensure PORT is set before validating to avoid failing startup checks on Railway
process.env.PORT = process.env.PORT || 5000;

// Import database connection configuration
import { connectDB } from './config/database.js';

// Import router modules
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';

// Import global error handling middleware
import errorHandler from './middleware/errorHandler.js';

/**
 * Validate that all required configuration environment variables are present.
 * Prevents server from starting with missing credentials or ports.
 */
const checkRequiredEnvVars = () => {
  if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI environment variable is missing.');
    process.exit(1);
  }
  const required = ['JWT_SECRET', 'PORT'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error(`FATAL: Startup configuration error. Missing required environment variable(s): ${missing.join(', ')}`);
    process.exit(1);
  }
};

// Validate variables before establishing any connections
checkRequiredEnvVars();

// Initialize the Express application
const app = express();

/* ==========================================================================
   GLOBAL SECURITY & OPTIMIZATION MIDDLEWARE
   ========================================================================== */

// 1. Prevent NoSQL Injection attacks by sanitizing request bodies, queries, and parameters
// app.use(mongoSanitize());

// 2. Multi-tiered Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  message: 'Too many requests, please try again later.',
  standardHeaders: true, // Return rate limit info in standard headers
  legacyHeaders: false, // Disable older X-RateLimit headers
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per 15 minutes for auth endpoints
  message: 'Too many auth attempts.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply limiters to relevant route segments
app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// 3. Secure HTTP headers with Helmet
app.use(helmet());

// 4. Adaptive request logging based on environment
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// 5. Production-grade CORS configuration
const allowedOrigins = [process.env.FRONTEND_URL, 'https://your-app.vercel.app'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or local/server utility scripts)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// 6. Request payload body parsing security options (limit payload size to prevent DoS)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/* ==========================================================================
   ROUTING SETUP
   ========================================================================== */

// Health check endpoint to monitor application and API availability status
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date()
  });
});

// Authentication and Leads route mappings
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/meetings', meetingRoutes);

// The global error handler must be registered last, after all routing paths
app.use(errorHandler);

/* ==========================================================================
   SERVER INITIALIZATION & GRACEFUL SHUTDOWN
   ========================================================================== */

let server;

// Connect to database first, then listen
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    const NODE_ENV = process.env.NODE_ENV || 'development';

    // Start listening on the specified port
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server due to database connection issue:', error.message);
    process.exit(1);
  });

/**
 * Handle graceful termination signals SIGINT and SIGTERM.
 * Closes the HTTP listener first, then terminates the Mongoose database connection.
 * 
 * @param {string} signal - The OS signal received (SIGINT, SIGTERM)
 */
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
      
      mongoose.connection.close(false)
        .then(() => {
          console.log('MongoDB connection closed cleanly.');
          console.log('Server shutting down gracefully');
          process.exit(0);
        })
        .catch((err) => {
          console.error('Error during MongoDB connection shutdown:', err.message);
          process.exit(1);
        });
    });
  } else {
    mongoose.connection.close(false)
      .then(() => {
        console.log('Server shutting down gracefully');
        process.exit(0);
      })
      .catch(() => process.exit(1));
  }
};

// Register handlers for SIGINT (e.g., Ctrl+C) and SIGTERM (e.g., Heroku/Docker termination)
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Support testing graceful shutdown programmatically on Windows/restricted environments
if (process.env.TEST_SHUTDOWN === 'true') {
  console.log('Programmatic shutdown test mode active...');
  // Wait a moment for server to initialize, then emit SIGINT
  setTimeout(() => {
    console.log('Emitting SIGINT programmatically for test verification...');
    process.emit('SIGINT');
  }, 5000);
}
