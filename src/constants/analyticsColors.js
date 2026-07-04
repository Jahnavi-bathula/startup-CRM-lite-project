/**
 * Analytics color constants mapping lead stages to specific hex values.
 * Handled with mapping variations to support both short status codes and full database descriptions.
 */
export const STATUS_COLORS = {
  'New': '#94A3B8',               // Slate 400
  'Contacted': '#2563EB',         // Blue 600
  'Meeting': '#F59E0B',           // Amber 500
  'Meeting Scheduled': '#F59E0B', // Amber 500 (Full stage name compatibility)
  'Proposal': '#7C3AED',          // Violet 600
  'Proposal Sent': '#7C3AED',     // Violet 600 (Full stage name compatibility)
  'Won': '#22C55E',               // Green 500
  'Lost': '#EF4444',              // Red 500
};

/**
 * Palette mapping for lead source representation.
 */
export const SOURCE_COLORS = {
  'Website': '#3B82F6',        // Blue 500
  'Referral': '#10B981',       // Emerald 500
  'LinkedIn': '#0A66C2',       // LinkedIn Blue
  'Instagram': '#E1306C',      // Instagram Pink
  'Ads': '#F59E0B',            // Amber 500
  'Cold Email': '#8B5CF6',     // Purple 500
  'Cold Call': '#6366F1',      // Indigo 500
  'Email Campaign': '#EC4899', // Pink 500
  'Other': '#6B7280',          // Gray 500
};

/**
 * Standard dashboard chart defaults.
 */
export const CHART_DEFAULTS = {
  primary: '#2563EB',    // Blue 600
  success: '#22C55E',    // Green 500
  warning: '#F59E0B',    // Amber 500
  danger: '#EF4444',     // Red 500
  neutral: '#64748B',    // Slate 500
  gridLine: '#E2E8F0',   // Slate 200
  gridLineDark: '#334155' // Slate 700
};
