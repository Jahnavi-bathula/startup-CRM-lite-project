import api from './api';

/**
 * Fetch all scheduled meetings from backend.
 */
export const getMeetings = async () => {
  const response = await api.get('/api/meetings');
  return response.data;
};

/**
 * Schedule a new meeting in backend.
 */
export const createMeeting = async (meetingData) => {
  const response = await api.post('/api/meetings', meetingData);
  return response.data;
};

/**
 * Update an existing meeting.
 */
export const updateMeeting = async (id, meetingData) => {
  const response = await api.put(`/api/meetings/${id}`, meetingData);
  return response.data;
};

/**
 * Cancel/delete a scheduled meeting.
 */
export const deleteMeeting = async (id) => {
  const response = await api.delete(`/api/meetings/${id}`);
  return response.data;
};

export default {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting
};
