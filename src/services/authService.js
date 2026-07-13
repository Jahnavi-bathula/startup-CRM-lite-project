import api from './api';

/**
 * Register a new user account.
 * 
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @param {string} password - User's password (min 6 characters)
 * @returns {Promise<Object>} The response payload containing token and user profile
 */
export const register = async (name, email, password) => {
  const response = await api.post('/api/auth/register', { name, email, password });
  return response.data;
};

/**
 * Authenticate a user with email and password.
 * 
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} The response payload containing token and user profile
 */
export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

/**
 * Log out user client-side.
 * Since the API authentication is stateless, we simply remove the token from localStorage.
 */
export const logout = () => {
  localStorage.removeItem('crm-token');
};

/**
 * Retrieve the currently logged-in user profile details.
 * 
 * @returns {Promise<Object>} The response payload containing user profile details
 */
export const getProfile = async () => {
  const response = await api.get('/api/auth/profile');
  return response.data;
};

/**
 * Update the user's profile details.
 * 
 * @param {Object} data - Updated profile fields (e.g. name, oldPassword, newPassword)
 * @returns {Promise<Object>} The response payload containing the updated user profile
 */
export const updateProfile = async (data) => {
  const response = await api.put('/api/auth/profile', data);
  return response.data;
};

export default {
  register,
  login,
  logout,
  getProfile,
  updateProfile
};
