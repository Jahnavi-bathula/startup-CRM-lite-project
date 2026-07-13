import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Load environment variables from .env file
dotenv.config();

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
 * - Configures mongoose with the specified options { useNewUrlParser: true, useUnifiedTopology: true }.
 * - Handles potential connection issues and terminates the process with exit code 1.
 * - Gracefully handles compatibility issues with modern Mongoose versions which throw on legacy options.
 * 
 * @returns {Promise<void>} Resolves when connection is successfully established.
 */
export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is missing.');
    }

    // Set the requested Mongoose options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    let conn;
    try {
      // Connect to MongoDB Atlas with options
      conn = await mongoose.connect(mongoURI, options);
    } catch (optionError) {
      // Modern versions of Mongoose (v7+) throw an error if legacy connection options are provided.
      // If we catch that specific error, we fall back to connecting without these options.
      const isLegacyOptionErr = 
        optionError.message.toLowerCase().includes('usenewurlparser') || 
        optionError.message.toLowerCase().includes('useunifiedtopology') ||
        optionError.message.toLowerCase().includes('not supported');

      if (isLegacyOptionErr) {
        console.warn('Legacy options (useNewUrlParser, useUnifiedTopology) are not supported by this Mongoose version. Retrying connection without them...');
        conn = await mongoose.connect(mongoURI);
      } else {
        // Rethrow other database connection errors
        throw optionError;
      }
    }

    // On success: log connected host to console
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    // On error: log error details and exit with failure code (1)
    console.error(`Database connection failure: ${error.message}`);
    process.exit(1);
  }
};
