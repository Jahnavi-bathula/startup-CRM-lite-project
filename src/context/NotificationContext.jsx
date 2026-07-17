import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useLeads } from './LeadContext';
import { useTasks } from './TaskContext';
import { useMeetings } from './MeetingContext';

const NotificationContext = createContext(undefined);

export function NotificationProvider({ children }) {
  const { leads } = useLeads();
  const { tasks } = useTasks();
  const { meetings } = useMeetings();

  // Store read notification IDs in localStorage
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem('crm-read-notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync read list to storage
  useEffect(() => {
    localStorage.setItem('crm-read-notifications', JSON.stringify(readIds));
  }, [readIds]);

  // Compute active notification cards from dynamic CRM data
  const notifications = useMemo(() => {
    const items = [];
    const now = new Date();

    // 1. Scan Upcoming Meetings (within next 24 hours)
    meetings.forEach((meeting) => {
      const meetingTime = new Date(meeting.date);
      const diffMs = meetingTime.getTime() - now.getTime();
      const diffHrs = diffMs / (1000 * 60 * 60);

      if (diffHrs >= -2 && diffHrs <= 24) {
        const isUpcoming = diffHrs >= 0;
        items.push({
          id: `meeting-${meeting._id || meeting.id}`,
          type: 'meeting',
          title: isUpcoming ? 'Upcoming Meeting Scheduled' : 'Past Scheduled Meeting',
          message: `"${meeting.title}" is ${isUpcoming ? 'upcoming' : 'missed'} on ${meetingTime.toLocaleDateString()} at ${meeting.time}.`,
          lead: meeting.lead?.name || null,
          time: meetingTime,
          urgency: isUpcoming ? 'warning' : 'danger'
        });
      }
    });

    // 2. Scan Overdue Pending Tasks
    tasks.forEach((task) => {
      if (task.status === 'Pending') {
        const taskDeadline = new Date(task.deadline);
        if (taskDeadline < now) {
          items.push({
            id: `task-overdue-${task._id || task.id}`,
            type: 'task',
            title: 'Task Overdue Reminder',
            message: `Pending task "${task.title}" is past its deadline of ${taskDeadline.toLocaleDateString()}.`,
            time: taskDeadline,
            urgency: 'danger'
          });
        }
      }
    });

    // 3. Scan High-Priority Leads
    leads.forEach((lead) => {
      if (lead.priority === 'High' && lead.status !== 'Won' && lead.status !== 'Lost') {
        items.push({
          id: `lead-high-${lead._id || lead.id}`,
          type: 'lead',
          title: 'High Priority Lead Attention',
          message: `Lead "${lead.name}" (${lead.company}) has a high AI score of ${lead.leadScore || 80}. Please contact.`,
          time: new Date(lead.updatedAt || lead.createdAt),
          urgency: 'warning'
        });
      }
    });

    // 4. Scan Successful Lead Conversions (Won in the last 5 days)
    leads.forEach((lead) => {
      if (lead.status === 'Won') {
        const wonTime = new Date(lead.updatedAt || lead.createdAt);
        const diffMs = now.getTime() - wonTime.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffDays <= 5) {
          items.push({
            id: `lead-won-${lead._id || lead.id}`,
            type: 'conversion',
            title: 'Lead Won Deal Converted!',
            message: `Congratulations! "${lead.name}" is marked Won with a deal value of $${(lead.value || 0).toLocaleString()}.`,
            time: wonTime,
            urgency: 'success'
          });
        }
      }
    });

    // Sort notifications chronologically (most recent first)
    return items.sort((a, b) => b.time - a.time);
  }, [leads, tasks, meetings]);

  // Filter unread notifications
  const unreadNotifications = useMemo(() => {
    return notifications.filter((item) => !readIds.includes(item.id));
  }, [notifications, readIds]);

  const unreadCount = unreadNotifications.length;

  const markAsRead = useCallback((id) => {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map((item) => item.id);
    setReadIds(allIds);
  }, [notifications]);

  const clearAllNotifications = useCallback(() => {
    const allIds = notifications.map((item) => item.id);
    setReadIds(allIds);
  }, [notifications]);

  const contextValue = useMemo(() => ({
    notifications,
    unreadNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAllNotifications
  }), [notifications, unreadNotifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
export default NotificationContext;
