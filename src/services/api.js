import axios from 'axios';
import toast from 'react-hot-toast';

// Create an Axios instance using the Vite environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

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
    // On 401 response: clears token from localStorage, redirects to /login
    if (error.response && error.response.status === 401) {
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
