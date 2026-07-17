import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  CheckSquare, 
  Plus, 
  Clock, 
  Mail, 
  Phone, 
  DollarSign, 
  Tag, 
  Sparkles, 
  TrendingUp,
  FileText 
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useMeetings } from '../../context/MeetingContext';
import toast from 'react-hot-toast';

export default function LeadDetailsDrawer({ lead, isOpen, onClose, onUpdateLead }) {
  const { addTask } = useTasks();
  const { addMeeting } = useMeetings();

  // Quick Action Toggles
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'action'
  const [actionType, setActionType] = useState('task'); // 'task' | 'meeting' | 'note'

  // Quick Form States
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [meetTitle, setMeetTitle] = useState('');
  const [meetDate, setMeetDate] = useState('');
  const [meetTime, setMeetTime] = useState('');
  const [noteContent, setNoteContent] = useState('');

  if (!isOpen || !lead) return null;

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !taskDeadline) return;
    try {
      await addTask({
        title: taskTitle,
        deadline: taskDeadline,
        priority: lead.priority || 'Medium',
        lead: lead._id || lead.id,
        description: 'Created from lead details side-panel.'
      });
      
      // Auto push activity log
      const updatedActivities = [
        ...(lead.activities || []),
        {
          type: 'Updated',
          note: `Logged pending task: "${taskTitle}"`,
          timestamp: new Date()
        }
      ];
      await onUpdateLead(lead._id || lead.id, { activities: updatedActivities });

      setTaskTitle('');
      setTaskDeadline('');
      setActiveTab('timeline');
      toast.success('Task scheduled and logged to timeline');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!meetTitle || !meetDate || !meetTime) return;
    try {
      await addMeeting({
        title: meetTitle,
        date: meetDate,
        time: meetTime,
        lead: lead._id || lead.id,
        notes: 'Scheduled from lead details side-panel.'
      });

      setMeetTitle('');
      setMeetDate('');
      setMeetTime('');
      setActiveTab('timeline');
      toast.success('Meeting scheduled successfully');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogNote = async (e) => {
    e.preventDefault();
    if (!noteContent) return;
    try {
      const updatedActivities = [
        ...(lead.activities || []),
        {
          type: 'Updated',
          note: `Sales Note: "${noteContent}"`,
          timestamp: new Date()
        }
      ];
      await onUpdateLead(lead._id || lead.id, { activities: updatedActivities });
      setNoteContent('');
      setActiveTab('timeline');
      toast.success('Sales note appended to timeline');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 z-40"
      />

      {/* Slide-out Drawer Panel */}
      <aside className="fixed top-0 bottom-0 right-0 w-full sm:w-[460px] bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 z-50 flex flex-col p-6 transition-transform duration-300 ease-out transform shadow-2xl text-xs overflow-hidden">
        
        {/* Header Drawer Actions */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Lead Details View</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-6">
          
          {/* Card Info Box */}
          <div className="p-4 bg-slate-50/50 dark:bg-zinc-900/30 border border-slate-200/50 dark:border-zinc-800/80 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
            {/* AI Score Glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl"></div>
            
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-base font-extrabold shadow-sm">
                  {lead.name.substring(0,2).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-50 truncate">{lead.name}</h3>
                  <span className="text-[10px] text-slate-400 font-semibold truncate">{lead.company}</span>
                </div>
              </div>

              {/* AI Score Indicator Badge */}
              <div className="text-right flex flex-col items-end">
                <span className="text-[8px] text-blue-500 uppercase font-black tracking-widest flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI Score
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-zinc-50">{lead.leadScore || 30}/100</span>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                  lead.priority === 'High' 
                    ? 'badge-priority-high' 
                    : lead.priority === 'Medium'
                      ? 'badge-priority-medium'
                      : 'badge-priority-low'
                }`}>
                  {lead.priority || 'Medium'}
                </span>
              </div>
            </div>

            {/* Separator */}
            <div className="h-px bg-slate-200/50 dark:border-zinc-850"></div>

            {/* Contact details */}
            <div className="grid grid-cols-2 gap-3 text-slate-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5 min-w-0">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a href={`mailto:${lead.email}`} className="truncate hover:text-blue-500 hover:underline">{lead.email}</a>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{lead.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-bold text-slate-700 dark:text-zinc-300">${(lead.value || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Source: {lead.source || 'Website'}</span>
              </div>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex border-b border-slate-100 dark:border-zinc-900 text-[11px] font-bold">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 pb-2 border-b-2 text-center cursor-pointer transition-colors ${
                activeTab === 'timeline' 
                  ? 'border-blue-500 text-blue-500' 
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300'
              }`}
            >
              Timeline History
            </button>
            <button
              onClick={() => setActiveTab('action')}
              className={`flex-1 pb-2 border-b-2 text-center cursor-pointer transition-colors ${
                activeTab === 'action' 
                  ? 'border-blue-500 text-blue-500' 
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-zinc-300'
              }`}
            >
              Quick Logging Actions
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1">
            {activeTab === 'timeline' ? (
              /* Chronological timeline rendering */
              <div className="flex flex-col gap-4">
                {(lead.activities || []).length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No logged activity found. Status changes are automatically logged.
                  </div>
                ) : (
                  [...(lead.activities || [])]
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((act, index) => (
                      <div key={index} className="flex gap-3 text-xs">
                        <div className="flex flex-col items-center shrink-0">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 shadow-sm"></div>
                          {index !== lead.activities.length - 1 && (
                            <div className="w-px flex-1 bg-slate-200 dark:bg-zinc-800 my-1"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 bg-slate-50/30 dark:bg-zinc-900/10 p-2.5 border border-slate-200/40 dark:border-zinc-900 rounded-xl">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-800 dark:text-zinc-200">{act.type}</span>
                            <span className="text-[9px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(act.timestamp).toLocaleDateString()} at {new Date(act.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">{act.note || `Stage converted to ${act.type}.`}</p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            ) : (
              /* Quick logging forms */
              <div className="flex flex-col gap-4">
                {/* Form selector buttons */}
                <div className="border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 p-0.5 rounded-lg flex text-[10px] font-bold">
                  <button
                    onClick={() => setActionType('task')}
                    className={`flex-1 py-1.5 rounded-md cursor-pointer ${actionType === 'task' ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500'}`}
                  >
                    Task
                  </button>
                  <button
                    onClick={() => setActionType('meeting')}
                    className={`flex-1 py-1.5 rounded-md cursor-pointer ${actionType === 'meeting' ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500'}`}
                  >
                    Meeting
                  </button>
                  <button
                    onClick={() => setActionType('note')}
                    className={`flex-1 py-1.5 rounded-md cursor-pointer ${actionType === 'note' ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500'}`}
                  >
                    Sales Note
                  </button>
                </div>

                {/* Sub Forms */}
                {actionType === 'task' && (
                  <form onSubmit={handleCreateTask} className="flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 dark:text-zinc-300">Task Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Contract finalization check"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        className="px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 dark:text-zinc-300">Deadline</label>
                      <input
                        type="datetime-local"
                        required
                        value={taskDeadline}
                        onChange={(e) => setTaskDeadline(e.target.value)}
                        className="px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-zinc-200"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer shadow-md font-semibold mt-2"
                    >
                      Log Task Checklist
                    </button>
                  </form>
                )}

                {actionType === 'meeting' && (
                  <form onSubmit={handleCreateMeeting} className="flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 dark:text-zinc-300">Meeting Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Discovery demo call"
                        value={meetTitle}
                        onChange={(e) => setMeetTitle(e.target.value)}
                        className="px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-700 dark:text-zinc-300">Date</label>
                        <input
                          type="date"
                          required
                          value={meetDate}
                          onChange={(e) => setMeetDate(e.target.value)}
                          className="px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-zinc-200"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-700 dark:text-zinc-300">Time</label>
                        <input
                          type="text"
                          required
                          placeholder="14:00"
                          value={meetTime}
                          onChange={(e) => setMeetTime(e.target.value)}
                          className="px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer shadow-md font-semibold mt-2"
                    >
                      Schedule Meeting Action
                    </button>
                  </form>
                )}

                {actionType === 'note' && (
                  <form onSubmit={handleLogNote} className="flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-slate-700 dark:text-zinc-300">Appended Note Content</label>
                      <textarea
                        required
                        placeholder="Write down notes from discovery or phone calls..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        rows={4}
                        className="px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer shadow-md font-semibold mt-2"
                    >
                      Save & Append Note
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

        </div>

      </aside>
    </>
  );
}
