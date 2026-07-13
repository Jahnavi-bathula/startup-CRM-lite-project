import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import leadService from '../services/leadService';

// Create the Lead Context with a default value of undefined
const LeadContext = createContext(undefined);

/**
 * LeadProvider Component
 * Manages CRM leads state, calling backend services for synchronization.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements
 * @returns {React.ReactElement} The Lead Context Provider
 */
export function LeadProvider({ children }) {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  /**
   * Fetches the user's leads from the Express API with optional parameters.
   */
  const fetchLeads = useCallback(async (params) => {
    setIsLoading(true);
    try {
      const responseData = await leadService.getLeads(params);
      // Response returns a paginated structure: { success, data, pagination }
      setLeads(responseData.data || []);
      setPagination(responseData.pagination || {});
      toast.success(responseData.message || 'Leads fetched successfully', {
        id: 'leads-fetch-success'
      });
      return responseData;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch leads from server.';
      toast.error(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Monitor authorization token changes to fetch/clear data accordingly
  const token = localStorage.getItem('crm-token');
  useEffect(() => {
    if (token) {
      fetchLeads();
    } else {
      setLeads([]);
      setPagination({});
    }
  }, [token, fetchLeads]);

  /**
   * Creates a new lead document.
   */
  const addLead = useCallback(async (newLeadData) => {
    setIsLoading(true);
    try {
      const responseData = await leadService.createLead(newLeadData);
      const createdLead = responseData.data;

      // Optimistically append new lead to the beginning of local state
      setLeads((prev) => [createdLead, ...prev]);
      toast.success(responseData.message || 'Lead added successfully', {
        id: 'lead-add-success'
      });
      return createdLead;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add lead.';
      toast.error(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Updates an existing lead's properties.
   */
  const updateLead = useCallback(async (id, updatedFields) => {
    setIsLoading(true);
    try {
      const responseData = await leadService.updateLead(id, updatedFields);
      const updatedLead = responseData.data;

      // Update the modified lead in local state array matching by standard MongoDB ID or legacy ID
      setLeads((prev) =>
        prev.map((lead) => (lead.id === id || lead._id === id ? updatedLead : lead))
      );
      toast.success(responseData.message || 'Lead updated successfully', {
        id: 'lead-update-success'
      });
      return updatedLead;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update lead.';
      toast.error(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Deletes a lead by its ID.
   */
  const deleteLead = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const responseData = await leadService.deleteLead(id);

      // Filter out the deleted lead in local state
      setLeads((prev) => prev.filter((lead) => lead.id !== id && lead._id !== id));
      toast.success(responseData.message || 'Lead deleted successfully', {
        id: 'lead-delete-success'
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete lead.';
      toast.error(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Retrieves a single lead object by its ID.
   */
  const getLeadById = useCallback((id) => {
    return leads.find((lead) => lead.id === id || lead._id === id);
  }, [leads]);

  // Memoize the context value to minimize consumer re-renders
  const contextValue = useMemo(() => ({
    leads,
    isLoading,
    pagination,
    fetchLeads,
    addLead,
    updateLead,
    deleteLead,
    getLeadById
  }), [leads, isLoading, pagination, fetchLeads, addLead, updateLead, deleteLead, getLeadById]);

  return (
    <LeadContext.Provider value={contextValue}>
      {children}
    </LeadContext.Provider>
  );
}

/**
 * useLeads Custom Hook
 * Provides a clean interface to access the Leads Context.
 * Throws a descriptive error if accessed outside a LeadProvider tree.
 */
export function useLeads() {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
}

export { LeadContext };
