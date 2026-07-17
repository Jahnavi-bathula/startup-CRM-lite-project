import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import taskService from '../services/taskService';

const TaskContext = createContext(undefined);

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await taskService.getTasks();
      setTasks(response.data || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const token = localStorage.getItem('crm-token');
  useEffect(() => {
    if (token) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [token, fetchTasks]);

  const addTask = useCallback(async (taskData) => {
    setIsLoading(true);
    try {
      const response = await taskService.createTask(taskData);
      const created = response.data;
      setTasks((prev) => [created, ...prev]);
      toast.success('Task created successfully');
      return created;
    } catch (error) {
      toast.error('Failed to create task');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (id, taskData) => {
    setIsLoading(true);
    try {
      const response = await taskService.updateTask(id, taskData);
      const updated = response.data;
      setTasks((prev) => prev.map((t) => (t._id === id || t.id === id ? updated : t)));
      toast.success('Task updated successfully');
      return updated;
    } catch (error) {
      toast.error('Failed to update task');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    setIsLoading(true);
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id && t.id !== id));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleTaskStatus = useCallback(async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    return updateTask(id, { status: nextStatus });
  }, [updateTask]);

  const contextValue = useMemo(() => ({
    tasks,
    isLoading,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus
  }), [tasks, isLoading, fetchTasks, addTask, updateTask, deleteTask, toggleTaskStatus]);

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
