import mongoose from 'mongoose';
import dns from 'dns';
import { createRequire } from 'module';

// Load environment variables from .env file using require("dotenv").config() for ES Modules compatibility
const require = createRequire(import.meta.url);
try {
  require('dotenv').config();
  console.log('Safe Debug: Environment variables loaded successfully.');
} catch (envError) {
  console.error('Safe Debug: Failed to load environment variables via dotenv:', envError.message);
}

// Configure Node.js to use Google and Cloudflare DNS servers for name resolution.
// This prevents querySrv ECONNREFUSED errors for MongoDB SRV records in environments with restrictive/misconfigured DNS.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsError) {
  console.warn('Unable to set custom DNS servers for name resolution:', dnsError.message);
}

/**
 * Connects to MongoDB Atlas using the URI configured in environment variables.
 * 
 * - Normalizes MONGO_URI and MONGODB_URI environment variables.
 * - Validates presence and scheme of the connection string.
 * - Removes deprecated Mongoose connection options for compatibility with newer Mongoose versions.
 * - Safely logs connection status without exposing sensitive credentials.
 * 
 * @returns {Promise<void>} Resolves when connection is successfully established.
 */
export const connectDB = async () => {
  // Harmonize environment variable names
  if (process.env.MONGO_URI && !process.env.MONGODB_URI) {
    process.env.MONGODB_URI = process.env.MONGO_URI;
  } else if (process.env.MONGODB_URI && !process.env.MONGO_URI) {
    process.env.MONGO_URI = process.env.MONGODB_URI;
  }

  let mongoURI = process.env.MONGODB_URI;

  // Print specific error message if MONGODB_URI is missing instead of crashing silently
  if (!mongoURI) {
    console.error('ERROR: MONGODB_URI environment variable is missing.');
    process.exit(1);
  }

  // Sanitize connection string (trim whitespace and strip outer quotes)
  mongoURI = mongoURI.trim();
  if (
    (mongoURI.startsWith('"') && mongoURI.endsWith('"')) ||
    (mongoURI.startsWith("'") && mongoURI.endsWith("'"))
  ) {
    mongoURI = mongoURI.slice(1, -1).trim();
  }

  // Validate the MongoDB connection string scheme
  if (!mongoURI.startsWith('mongodb://') && !mongoURI.startsWith('mongodb+srv://')) {
    console.error('Database connection failure: Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"');
    process.exit(1);
  }

  // Create a masked version of the URI for safe debugging output
  let maskedURI = mongoURI;
  try {
    const scheme = mongoURI.startsWith('mongodb+srv://') ? 'mongodb+srv://' : 'mongodb://';
    const remaining = mongoURI.slice(scheme.length);
    const atIndex = remaining.indexOf('@');
    if (atIndex !== -1) {
      maskedURI = `${scheme}****:****${remaining.slice(atIndex)}`;
    } else {
      maskedURI = `${scheme}****`;
    }
  } catch (maskError) {
    maskedURI = 'mongodb+srv://****:****@...';
  }

  try {
    console.log(`Safe Debug: Attempting MongoDB connection to ${maskedURI}`);
    
    // Connect to MongoDB using mongoose without the legacy deprecated options
    const conn = await mongoose.connect(mongoURI);

    // On success: log connected host safely
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    // On error: log error details and exit with failure code (1)
    console.error(`Database connection failure: ${error.message}`);
    process.exit(1);
  }
};
