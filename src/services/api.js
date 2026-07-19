import axios from 'axios';
import toast from 'react-hot-toast';

// Create an Axios instance using the Vite environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
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
