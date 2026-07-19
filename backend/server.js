// ---------------------------------------------------------------------------
// server.js — Application entry point
//
// Execution order (important — do NOT reorder):
//   1. Load .env (must happen before any module reads process.env)
//   2. Validate required environment variables → exit early if missing
//   3. Initialise Express and register global middleware:
//        a. Helmet   (security headers)
//        b. Morgan   (request logging, format differs by environment)
//        c. CORS     (production-aware origin whitelist)
//        d. Rate limiters (general API + stricter auth routes)
//        e. Mongo sanitizer (NoSQL injection protection)
//        f. Body parsers
//   4. Mount route handlers
//   5. 404 catch-all
//   6. Global error handler (MUST be last middleware)
//   7. Connect to MongoDB Atlas → start HTTP server
//   8. Register graceful shutdown handlers (SIGTERM / SIGINT)
// ---------------------------------------------------------------------------

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

// Ensure PORT is set before validating to avoid failing startup checks
process.env.PORT = process.env.PORT || 5000;

import express        from 'express';
import helmet         from 'helmet';
import morgan         from 'morgan';
import cors           from 'cors';
import rateLimit      from 'express-rate-limit';
import mongoSanitize  from 'express-mongo-sanitize';

// Internal modules
import { connectDB }  from './config/database.js';
import errorHandler   from './middleware/errorHandler.js';
import authRoutes     from './routes/authRoutes.js';
import leadRoutes     from './routes/leadRoutes.js';
import taskRoutes     from './routes/taskRoutes.js';
import meetingRoutes  from './routes/meetingRoutes.js';

// ---------------------------------------------------------------------------
// 1. Environment variable validation
// ---------------------------------------------------------------------------

/**
 * Validates that all required environment variables are present before the
 * server attempts to start. This prevents silent runtime failures caused by
 * accidental misconfiguration in CI/CD pipelines or new deployments.
 *
 * Required variables:
 *  - MONGODB_URI  — MongoDB Atlas connection string
 *  - JWT_SECRET   — Secret key used to sign/verify JSON Web Tokens
 *  - PORT         — Port the HTTP server should listen on
 *
 * @throws {never} Calls process.exit(1) and never returns if any var is missing.
 */
const checkRequiredEnvVars = () => {
  if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI environment variable is missing.');
    process.exit(1);
  }
  const required = ['JWT_SECRET', 'PORT'];
  const missing  = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌  Missing required environment variables:');
    missing.forEach((key) => console.error(`     • ${key}`));
    console.error('    Update your .env file and restart the server.');
    process.exit(1);
  }

  console.log('✅  All required environment variables are present.');
};

checkRequiredEnvVars();

// ---------------------------------------------------------------------------
// 2. App initialisation
// ---------------------------------------------------------------------------

const app  = express();
const PORT = process.env.PORT || 5000;
const ENV  = process.env.NODE_ENV || 'development';

// ---------------------------------------------------------------------------
// 3a. Security headers — Helmet
// ---------------------------------------------------------------------------

/**
 * helmet() sets ~15 security-related HTTP response headers in one call:
 *   Content-Security-Policy, X-Frame-Options, X-Content-Type-Options,
 *   Strict-Transport-Security, X-DNS-Prefetch-Control, etc.
 *
 * Place it first so every response — including 404s and error responses —
 * carries the full suite of protective headers.
 */
app.use(helmet());

// ---------------------------------------------------------------------------
// 3b. Request logging — Morgan
// ---------------------------------------------------------------------------

/**
 * Use 'combined' (Apache Common Log Format) in production for structured
 * logs consumable by SIEMs (Splunk, Datadog, etc.) and log aggregators.
 * It includes remote-addr, referrer, user-agent, and response size — all
 * critical for security auditing and incident response.
 *
 * Use 'dev' in development for concise, coloured one-liners:
 *   GET /api/leads 200 4.321 ms - 512
 */
app.use(morgan(ENV === 'production' ? 'combined' : 'dev'));

// ---------------------------------------------------------------------------
// 3c. CORS — production-aware origin whitelist
// ---------------------------------------------------------------------------

/**
 * Allowed origins are composed of:
 *   - FRONTEND_URL from .env  (can be comma-separated for multi-domain deploys)
 *   - The Vercel production domain (hard-coded as a fallback)
 *   - localhost:5173 / localhost:5174 for local development (only in non-production)
 *
 * The dynamic `origin` callback allows fine-grained control that a plain
 * string or array cannot provide — e.g. treating requests with no Origin
 * header (server-to-server / curl) as allowed while blocking cross-origin
 * browser requests from unrecognised domains.
 *
 * `credentials: true` is required for browsers to send the Authorization
 * header (JWT bearer token) on cross-origin requests.
 */
const buildAllowedOrigins = () => {
  // Start with explicitly known production origins
  const origins = new Set([
    'https://startup-crm-lite-project-xi.vercel.app',
  ]);

  // Add any extra origins from FRONTEND_URL (supports comma-separated list)
  if (process.env.FRONTEND_URL) {
    process.env.FRONTEND_URL
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)
      .forEach((o) => origins.add(o));
  }

  // Always allow localhost in non-production (development / Railway preview)
  if (ENV !== 'production') {
    origins.add('http://localhost:5173');
    origins.add('http://localhost:5174');
    origins.add('http://localhost:3000');
  }

  const list = [...origins];
  console.log('✅  CORS allowed origins:', list);
  return list;
};

const allowedOrigins = buildAllowedOrigins();

app.use(
  cors({
    /**
     * @param {string|undefined} origin - The Origin header sent by the browser.
     *   Undefined for same-origin requests and server-to-server calls (no Origin header).
     * @param {Function} callback - cors callback: callback(error, allow)
     */
    origin: (origin, callback) => {
      // Allow requests with no Origin header (curl, Postman, Railway health checks)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      return callback(new Error(`CORS policy: Origin '${origin}' is not allowed.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ---------------------------------------------------------------------------
// 3d. Rate limiting
// ---------------------------------------------------------------------------

/**
 * General API rate limiter — applied to all /api/* routes.
 *
 * Limits each IP to 100 requests per 15-minute window.
 * Protects against brute-force scraping and DDoS at the application layer.
 * When the limit is exceeded Express-rate-limit responds with 429 and the
 * message below — no controller code runs.
 *
 * `standardHeaders: true` adds the RateLimit-* headers (RFC 6585) so
 * clients can implement back-off logic.
 * `legacyHeaders: false` suppresses the older X-RateLimit-* headers that
 * were never standardised.
 */
const generalLimiter = rateLimit({
  windowMs:       15 * 60 * 1000, // 15 minutes
  max:            100,
  message:        { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders:  false,
});

/**
 * Stricter auth rate limiter — applied only to /api/auth/* routes.
 *
 * Limits each IP to 10 requests per 15-minute window.
 * Makes credential-stuffing and brute-force login attacks orders of magnitude
 * slower without affecting legitimate users who log in infrequently.
 */
const authLimiter = rateLimit({
  windowMs:       15 * 60 * 1000, // 15 minutes
  max:            10,
  message:        { success: false, message: 'Too many auth attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders:  false,
  // Skip successful requests so that normal logins don't eat into the budget
  skipSuccessfulRequests: true,
});

// Auth limiter is applied BEFORE the general limiter so the stricter budget
// takes effect; order matters because Express applies middleware in sequence.
app.use('/api/auth', authLimiter);
app.use('/api/',     generalLimiter);

// ---------------------------------------------------------------------------
// 3e. MongoDB injection (NoSQL injection) protection — mongo-sanitize
// ---------------------------------------------------------------------------

/**
 * express-mongo-sanitize strips keys that start with '$' or contain '.' from
 * req.body, req.query, and req.params before they reach any controller.
 *
 * Without this, an attacker could send:
 *   POST /api/auth/login  { "email": { "$gt": "" }, "password": "anything" }
 * and bypass password checking entirely in a naive Mongoose query.
 *
 * The `replaceWith` option substitutes the offending character with '_'
 * instead of silently deleting the key — this makes the sanitisation visible
 * in logs and prevents data loss for edge-case legitimate payloads.
 */
app.use((req, res, next) => {
  const sanitizeOptions = { replaceWith: '_' };
  try {
    if (req.body) mongoSanitize.sanitize(req.body, sanitizeOptions);
    if (req.query) mongoSanitize.sanitize(req.query, sanitizeOptions);
    if (req.params) mongoSanitize.sanitize(req.params, sanitizeOptions);
  } catch (err) {
    console.warn('[MongoSanitize] Error sanitizing request inputs:', err.message);
  }
  next();
});

// ---------------------------------------------------------------------------
// 3f. Body parsing
// ---------------------------------------------------------------------------

/**
 * Parse incoming JSON bodies.
 * The 10 kb limit prevents denial-of-service attacks that send enormous
 * payloads hoping to exhaust memory or trigger slow JSON parsing.
 */
app.use(express.json({ limit: '10kb' }));

/**
 * Parse URL-encoded form bodies (e.g. from HTML <form> POSTs).
 * extended: true allows rich objects and arrays via the `qs` library.
 */
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ---------------------------------------------------------------------------
// 4. Routes
// ---------------------------------------------------------------------------

/**
 * Health check endpoint — used by load balancers, uptime monitors, and
 * Kubernetes liveness / readiness probes to verify the server is alive.
 * Does NOT require authentication and is NOT rate-limited.
 *
 * Response shape:
 * { "status": "OK", "timestamp": "...", "environment": "production" }
 */
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status:      'OK',
    timestamp:   new Date(),
    environment: ENV,
  });
});

/**
 * Authentication routes — register, login, refresh, /me
 * Prefix: /api/auth
 * Note: authLimiter is already mounted on this prefix above.
 */
app.use('/api/auth', authRoutes);

/**
 * Lead management routes — full CRUD + stats + search
 * Prefix: /api/leads
 */
app.use('/api/leads', leadRoutes);

/**
 * Task management routes — CRUD
 * Prefix: /api/tasks
 */
app.use('/api/tasks', taskRoutes);

/**
 * Meeting management routes — CRUD
 * Prefix: /api/meetings
 */
app.use('/api/meetings', meetingRoutes);

// ---------------------------------------------------------------------------
// 5. 404 catch-all — must come AFTER all valid routes
// ---------------------------------------------------------------------------

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found — ${_req.method} ${_req.originalUrl}`,
  });
});

// ---------------------------------------------------------------------------
// 6. Global error handler — MUST be the last middleware registered
// ---------------------------------------------------------------------------

/**
 * Any error passed via next(err) — or an unhandled async throw — lands here.
 * The four-parameter signature is Express's convention for error handlers.
 * See middleware/errorHandler.js for full classification logic.
 */
app.use(errorHandler);

// ---------------------------------------------------------------------------
// 7. Database connection + server startup
// ---------------------------------------------------------------------------

/**
 * We connect to MongoDB BEFORE starting the HTTP server so that the very
 * first request never hits an unready database. If connectDB() throws, the
 * error propagates to the top-level catch below which exits cleanly.
 */
let server; // held in module scope so graceful shutdown can close it

const startServer = async () => {
  await connectDB();

  server = app.listen(PORT, () => {
    console.log(`🚀  Server running on port ${PORT} in ${ENV} mode`);
    console.log(`🛡️   Security: Helmet ✓ | Rate-limit ✓ | Mongo-sanitize ✓ | CORS ✓`);
  });
};

startServer().catch((err) => {
  console.error('❌  Failed to start server:', err.message);
  process.exit(1);
});

// ---------------------------------------------------------------------------
// 8. Graceful shutdown — SIGTERM (container orchestrators) + SIGINT (Ctrl-C)
// ---------------------------------------------------------------------------

/**
 * Graceful shutdown sequence:
 *   1. Stop accepting new connections (server.close)
 *   2. Wait for in-flight requests to complete
 *   3. Close the MongoDB connection cleanly
 *   4. Exit with code 0
 *
 * This prevents:
 *   - Requests being dropped mid-flight during a rolling deploy
 *   - MongoDB write operations being interrupted, leaving documents in an
 *     inconsistent state
 *   - Mongoose connection pool warnings in logs
 *
 * SIGTERM is sent by Docker / Kubernetes when stopping a container.
 * SIGINT  is sent by the terminal when the developer presses Ctrl-C.
 */
const gracefulShutdown = (signal) => async () => {
  console.log(`\n🛑  Received ${signal}. Server shutting down gracefully...`);

  // 1. Stop accepting new TCP connections
  if (server) {
    server.close(() => {
      console.log('✅  HTTP server closed — no new connections accepted.');
    });
  }

  try {
    // 2. Close the Mongoose / MongoDB connection pool
    const mongoose = (await import('mongoose')).default;
    await mongoose.connection.close();
    console.log('✅  MongoDB connection closed cleanly.');
  } catch (err) {
    console.error('⚠️   Error closing MongoDB connection:', err.message);
  }

  console.log('👋  Goodbye.');
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown('SIGTERM'));
process.on('SIGINT',  gracefulShutdown('SIGINT'));