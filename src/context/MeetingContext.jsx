import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import meetingService from '../services/meetingService';
import { useLeads } from './LeadContext';

const MeetingContext = createContext(undefined);

export function MeetingProvider({ children }) {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { fetchLeads } = useLeads(); // To refresh timeline after booking

  const fetchMeetings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await meetingService.getMeetings();
      setMeetings(response.data || []);
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const token = localStorage.getItem('crm-token');
  useEffect(() => {
    if (token) {
      fetchMeetings();
    } else {
      setMeetings([]);
    }
  }, [token, fetchMeetings]);

  const addMeeting = useCallback(async (meetingData) => {
    setIsLoading(true);
    try {
      const response = await meetingService.createMeeting(meetingData);
      const created = response.data;
      setMeetings((prev) => [created, ...prev]);
      toast.success('Meeting scheduled successfully');
      // Refresh leads to fetch new activity logs
      fetchLeads();
      return created;
    } catch (error) {
      toast.error('Failed to schedule meeting');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchLeads]);

  const updateMeeting = useCallback(async (id, meetingData) => {
    setIsLoading(true);
    try {
      const response = await meetingService.updateMeeting(id, meetingData);
      const updated = response.data;
      setMeetings((prev) => prev.map((m) => (m._id === id || m.id === id ? updated : m)));
      toast.success('Meeting details updated');
      fetchLeads();
      return updated;
    } catch (error) {
      toast.error('Failed to update meeting');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchLeads]);

  const deleteMeeting = useCallback(async (id) => {
    setIsLoading(true);
    try {
      await meetingService.deleteMeeting(id);
      setMeetings((prev) => prev.filter((m) => m._id !== id && m.id !== id));
      toast.success('Meeting cancelled');
      fetchLeads();
    } catch (error) {
      toast.error('Failed to cancel meeting');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchLeads]);

  const contextValue = useMemo(() => ({
    meetings,
    isLoading,
    fetchMeetings,
    addMeeting,
    updateMeeting,
    deleteMeeting
  }), [meetings, isLoading, fetchMeetings, addMeeting, updateMeeting, deleteMeeting]);

  return (
    <MeetingContext.Provider value={contextValue}>
      {children}
    </MeetingContext.Provider>
  );
}

export function useMeetings() {
  const context = useContext(MeetingContext);
  if (context === undefined) {
    throw new Error('useMeetings must be used within a MeetingProvider');
  }
  return context;
}
export default MeetingContext;
