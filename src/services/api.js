import axios from 'axios';
import toast from 'react-hot-toast';

// ---------------------------------------------------------------------------
// DEPLOYMENT GUARD — catches misconfigured VITE_API_URL at startup
//
// VITE_API_URL must be set in your hosting dashboard (Vercel), NOT in .env,
// because .env is gitignored and never reaches the cloud build environment.
//
// Correct value for Vercel dashboard:
//   VITE_API_URL = https://<your-service-name>.up.railway.app
//
// If this warning fires in production, open your Vercel project settings →
// Environment Variables → add VITE_API_URL → Redeploy.
// ---------------------------------------------------------------------------
const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  console.error(
    '[CRM] CRITICAL: VITE_API_URL is not defined.\n' +
    '  In production: add VITE_API_URL in the Vercel dashboard and redeploy.\n' +
    '  In development: add VITE_API_URL=http://localhost:5000 to your root .env file.'
  );
} else if (
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  API_BASE_URL.includes('localhost')
) {
  console.warn(
    '[CRM] WARNING: VITE_API_URL is pointing to localhost in a non-local environment.\n' +
    '  Current value: ' + API_BASE_URL + '\n' +
    '  This will cause ALL API requests to fail in production.\n' +
    '  Fix: Set VITE_API_URL=https://<your-railway-domain>.up.railway.app in Vercel dashboard and redeploy.'
  );
}

// Create an Axios instance using the validated environment variable
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Auth endpoint paths that should NOT trigger a redirect on 401
// (because a 401 on login just means wrong credentials, not a session expiry)
const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/register', '/api/auth/google'];

// Add a request interceptor that automatically adds the Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crm-token')
    if (token) config.headers.Authorization = 'Bearer ' + token
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for global auth/connection error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const requestUrl = error.config?.url || '';
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => requestUrl.includes(path));

    // On 401 for PROTECTED routes only: clear token and redirect to login.
    // Do NOT redirect on 401 responses from auth endpoints (login/register/google) —
    // those 401s mean "wrong credentials", not "session expired", so we let the
    // component handle the error and display the message to the user.
    if (error.response && error.response.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('crm-token');
      window.location.href = '/login';
    } 
    // On network error (no response received): shows a toast
    else if (!error.response) {
      toast.error('Cannot connect to server. Check your connection.');
    }
    return Promise.reject(error);
  }
);

export default api;
