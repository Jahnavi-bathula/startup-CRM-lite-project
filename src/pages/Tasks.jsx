import React, { useState, useMemo, useCallback } from 'react';
import { useTasks } from '../context/TaskContext';
import { useLeads } from '../context/LeadContext';
import { 
  Plus, 
  Search, 
  Calendar, 
  CheckCircle, 
  Circle, 
  Trash2, 
  Pencil, 
  AlertTriangle,
  User,
  Link
} from 'lucide-react';
import Modal from '../components/common/Modal';

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskStatus } = useTasks();
  const { leads } = useLeads();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Pending');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'Medium',
    lead: ''
  });

  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      deadline: '',
      priority: 'Medium',
      lead: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      deadline: task.deadline ? new Date(task.deadline).toISOString().substring(0, 16) : '',
      priority: task.priority || 'Medium',
      lead: task.lead?._id || task.lead?.id || task.lead || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await updateTask(editingTask._id || editingTask.id, formData);
      } else {
        await addTask(formData);
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
        (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      const matchesStatus = task.status === statusFilter;
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [tasks, search, priorityFilter, statusFilter]);

  const isOverdue = (task) => {
    if (task.status === 'Completed') return false;
    return new Date(task.deadline) < new Date();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-zinc-950 overflow-hidden transition-colors duration-200">
      
      {/* Header */}
      <header className="p-6 md:p-8 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-50 tracking-tight">Task Manager</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-500">Track milestones and checklists associated with your sales pipelines.</p>
        </div>

        <button 
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-xs rounded-lg shadow-md shadow-blue-500/10 transition-all cursor-pointer min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </header>

      {/* Control Panel */}
      <section className="px-6 md:px-8 mb-4 shrink-0 flex flex-col sm:flex-row gap-4 justify-between items-center">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Status filter toggles */}
          <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0.5 rounded-lg flex text-[10px] font-bold">
            <button
              onClick={() => setStatusFilter('Pending')}
              className={`px-3 py-1.5 rounded-md cursor-pointer ${statusFilter === 'Pending' ? 'bg-slate-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('Completed')}
              className={`px-3 py-1.5 rounded-md cursor-pointer ${statusFilter === 'Completed' ? 'bg-slate-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}
            >
              Completed
            </button>
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-[11px] font-semibold text-slate-500"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </section>

      {/* Task List Grid/Panel */}
      <section className="flex-1 overflow-y-auto px-6 md:px-8 pb-6">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center glass-panel border border-slate-200 dark:border-zinc-800 rounded-2xl">
            <CheckCircle className="w-12 h-12 text-slate-300 dark:text-zinc-700 mb-3" />
            <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">All clear!</h3>
            <p className="text-xs text-slate-400 mt-1">No tasks matching search filters found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 animate-fade-in-up">
            {filteredTasks.map((task) => {
              const overdue = isOverdue(task);
              return (
                <div
                  key={task._id || task.id}
                  className={`p-4 glass-card rounded-xl border flex items-start gap-3 transition-all ${
                    overdue 
                      ? 'border-red-500/20 bg-red-500/5' 
                      : 'border-slate-200/60 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50'
                  }`}
                >
                  {/* Task completion toggle status check */}
                  <button
                    onClick={() => toggleTaskStatus(task._id || task.id, task.status)}
                    className="mt-0.5 text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                  >
                    {task.status === 'Completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-[13px] font-semibold leading-tight ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-zinc-100'}`}>
                        {task.title}
                      </span>
                      
                      {/* Priority Badges */}
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        task.priority === 'High' 
                          ? 'badge-priority-high' 
                          : task.priority === 'Medium'
                            ? 'badge-priority-medium'
                            : 'badge-priority-low'
                      }`}>
                        {task.priority}
                      </span>

                      {overdue && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Overdue
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-snug mb-3">
                      {task.description || 'No additional details provided.'}
                    </p>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Deadline: {new Date(task.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      {task.lead && (
                        <span className="flex items-center gap-1.5 text-blue-500 dark:text-blue-400">
                          <Link className="w-3.5 h-3.5" />
                          Lead: {task.lead.name || leads.find(l => l._id === task.lead || l.id === task.lead)?.name || 'Associated Lead'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => handleOpenEdit(task)}
                      className="p-1.5 border border-slate-200/50 dark:border-zinc-800 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Edit task"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTask(task._id || task.id)}
                      className="p-1.5 border border-slate-200/50 dark:border-zinc-800 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Create / Edit Modal Form Overlay */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTask ? 'Edit Task Milestones' : 'Create Task Checklist'}
      >
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700 dark:text-zinc-300">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Call lead back to finalize contract"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700 dark:text-zinc-300">Details / Description</label>
            <textarea
              placeholder="Enter task details..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700 dark:text-zinc-300">Deadline</label>
              <input
                type="datetime-local"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                className="px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700 dark:text-zinc-300">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-zinc-200"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700 dark:text-zinc-300">Associate Lead (Optional)</label>
            <select
              value={formData.lead}
              onChange={(e) => setFormData({...formData, lead: e.target.value})}
              className="px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-zinc-200"
            >
              <option value="">No Associated Lead</option>
              {leads.map((l) => (
                <option key={l._id || l.id} value={l._id || l.id}>
                  {l.name} ({l.company})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 dark:border-zinc-900 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer shadow-md font-semibold"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
