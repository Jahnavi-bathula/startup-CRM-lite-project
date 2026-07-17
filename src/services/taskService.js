import api from './api';

/**
 * Fetch all tasks from backend.
 */
export const getTasks = async () => {
  const response = await api.get('/api/tasks');
  return response.data;
};

/**
 * Create a new task in backend.
 */
export const createTask = async (taskData) => {
  const response = await api.post('/api/tasks', taskData);
  return response.data;
};

/**
 * Update an existing task.
 */
export const updateTask = async (id, taskData) => {
  const response = await api.put(`/api/tasks/${id}`, taskData);
  return response.data;
};

/**
 * Delete a task.
 */
export const deleteTask = async (id) => {
  const response = await api.delete(`/api/tasks/${id}`);
  return response.data;
};

export default {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
