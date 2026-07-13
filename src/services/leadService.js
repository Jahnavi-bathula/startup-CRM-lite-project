import api from './api';

/**
 * Fetch leads list with optional filters and pagination.
 * 
 * @param {Object} params - Query params (e.g. status, search, page)
 * @returns {Promise<Object>} The response payload containing leads array and pagination data
 */
export const getLeads = async (params) => {
  const response = await api.get('/api/leads', { params });
  return response.data;
};

/**
 * Create a new lead record in the database.
 * 
 * @param {Object} leadData - Lead fields (name, company, email, phone, status, source, value, notes)
 * @returns {Promise<Object>} The response payload containing the created lead details
 */
export const createLead = async (leadData) => {
  const response = await api.post('/api/leads', leadData);
  return response.data;
};

/**
 * Update all attributes of an existing lead.
 * 
 * @param {string} id - The ID of the lead document
 * @param {Object} leadData - Updated fields for the lead
 * @returns {Promise<Object>} The response payload containing the updated lead details
 */
export const updateLead = async (id, leadData) => {
  const response = await api.put(`/api/leads/${id}`, leadData);
  return response.data;
};

/**
 * Update only the status/stage of a lead.
 * 
 * @param {string} id - The ID of the lead document
 * @param {string} status - The new status (e.g. 'Contacted', 'Won')
 * @returns {Promise<Object>} The response payload containing the updated lead details
 */
export const updateLeadStatus = async (id, status) => {
  const response = await api.patch(`/api/leads/${id}/status`, { status });
  return response.data;
};

/**
 * Delete a lead record by ID.
 * 
 * @param {string} id - The ID of the lead document
 * @returns {Promise<Object>} The response payload
 */
export const deleteLead = async (id) => {
  const response = await api.delete(`/api/leads/${id}`);
  return response.data;
};

/**
 * Retrieve statistical summary details (Pipeline, active counts, etc.)
 * 
 * @returns {Promise<Object>} The response payload containing stats
 */
export const getLeadStats = async () => {
  const response = await api.get('/api/leads/stats/summary');
  return response.data;
};

/**
 * Retrieve 6-month historical leads monthly breakdown data.
 * 
 * @returns {Promise<Object>} The response payload containing month-by-month stats
 */
export const getMonthlyStats = async () => {
  const response = await api.get('/api/leads/stats/monthly');
  return response.data;
};

export default {
  getLeads,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
  getLeadStats,
  getMonthlyStats
};
