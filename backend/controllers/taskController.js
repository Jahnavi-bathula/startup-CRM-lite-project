import { Task } from '../models/Task.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Retrieve all tasks belonging to the authenticated user.
 */
export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ owner: req.user._id })
      .populate('lead', 'name company email')
      .sort({ deadline: 1 });
    return successResponse(res, tasks, 'Tasks retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task.
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, deadline, priority, lead } = req.body;
    const task = await Task.create({
      title,
      description,
      deadline,
      priority: priority || 'Medium',
      lead: lead || null,
      owner: req.user._id
    });
    
    const populated = await task.populate('lead', 'name company email');
    return successResponse(res, populated, 'Task created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing task.
 */
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, priority, status, lead } = req.body;
    
    const task = await Task.findOne({ _id: id, owner: req.user._id });
    if (!task) {
      return errorResponse(res, 'Task not found or unauthorized access', 404);
    }
    
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (deadline !== undefined) task.deadline = deadline;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (lead !== undefined) task.lead = lead || null;
    
    await task.save();
    const populated = await task.populate('lead', 'name company email');
    return successResponse(res, populated, 'Task updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task.
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, owner: req.user._id });
    if (!task) {
      return errorResponse(res, 'Task not found or unauthorized access', 404);
    }
    return successResponse(res, null, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};
