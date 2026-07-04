import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Ensure environment variables are loaded
dotenv.config();

// Configure Node.js to use Google and Cloudflare DNS servers for name resolution.
// This prevents querySrv ECONNREFUSED errors for MongoDB SRV records in environments with restrictive or misconfigured local DNS.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsError) {
  console.warn('Unable to set custom DNS servers:', dnsError.message);
}

/**
 * Establishes a connection to the MongoDB Atlas database using Mongoose.
 * Configured with the MONGODB_URI environment variable.
 * Logs success on a successful connection, otherwise logs the error and terminates the process.
 * 
 * NOTE: Modern versions of Mongoose (v6+) enable useNewUrlParser and useUnifiedTopology by default 
 * and Mongoose v9+ throws an error if they are passed. We attempt to pass them as requested, 
 * but fall back to a standard connection if the library rejects them.
 */
export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined.');
    }

    let conn;
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    try {
      // Attempt connection with the requested Mongoose options
      conn = await mongoose.connect(mongoURI, options);
    } catch (optionError) {
      // If modern Mongoose throws because these deprecated options are unsupported, retry without them
      if (
        optionError.message.toLowerCase().includes('usenewurlparser') || 
        optionError.message.toLowerCase().includes('useunifiedtopology')
      ) {
        console.warn('Mongoose options useNewUrlParser/useUnifiedTopology not supported in this version. Connecting without options...');
        conn = await mongoose.connect(mongoURI);
      } else {
        throw optionError;
      }
    }

    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    // Exit application process with failure code 1
    process.exit(1);
  }
};
