import { createContext, useContext, useCallback, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { sampleLeads } from '../data/sampleLeads';

/**
 * TypeScript-style shape of the Lead object:
 * 
 * {
 *   id: string,
 *   name: string,
 *   company: string,
 *   email: string,
 *   phone: string,
 *   status: 'New' | 'Contacted' | 'Meeting Scheduled' | 'Proposal Sent' | 'Won' | 'Lost',
 *   source: 'Website' | 'Referral' | 'LinkedIn' | 'Cold Call' | 'Email Campaign' | 'Other',
 *   createdAt: string (ISO date)
 * }
 */

// Create the Lead Context with a default value of undefined
const LeadContext = createContext(undefined);

/**
 * LeadProvider Component
 * Seeds in-memory or persisted CRM leads data, exposing mutations.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements to wrap
 * @returns {React.ReactElement} The Lead Context Provider
 */
export function LeadProvider({ children }) {
  // Initialize state from localStorage using useLocalStorage hook, fallback to sampleLeads
  const [leads, setLeads] = useLocalStorage('startup-crm-leads', sampleLeads);

  /**
   * Adds a new lead to the directory.
   * Automatically generates a unique string ID and a createdAt ISO date string.
   */
  const addLead = useCallback((newLeadData) => {
    const createdAt = new Date().toISOString();
    const status = newLeadData.status || newLeadData.stage || 'New';
    
    const lead = {
      ...newLeadData,
      id: crypto.randomUUID(),
      createdAt,
      status,
      // Compatibility attributes
      stage: status,
      date: createdAt.split('T')[0]
    };
    
    setLeads((prev) => [...prev, lead]);
  }, [setLeads]);

  /**
   * Updates an existing lead's properties.
   */
  const updateLead = useCallback((id, updatedFields) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === id) {
          const status = updatedFields.status || updatedFields.stage || lead.status;
          return {
            ...lead,
            ...updatedFields,
            status,
            stage: status // Ensure compatibility sync
          };
        }
        return lead;
      })
    );
  }, [setLeads]);

  /**
   * Deletes a lead by its unique identifier.
   */
  const deleteLead = useCallback((id) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  }, [setLeads]);

  /**
   * Retrieves a single lead object by its ID.
   */
  const getLeadById = useCallback((id) => {
    return leads.find((lead) => lead.id === id);
  }, [leads]);

  // Memoize the context value structure to prevent redundant consumer re-renders
  const contextValue = useMemo(() => ({
    leads,
    addLead,
    updateLead,
    deleteLead,
    getLeadById
  }), [leads, addLead, updateLead, deleteLead, getLeadById]);

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
 * 
 * @returns {Object} Context CRUD attributes and state functions
 */
export function useLeads() {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
}

export { LeadContext };
