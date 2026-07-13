import { useState, useEffect } from 'react'; // Import state hooks
import { STATUS_OPTIONS, SOURCE_OPTIONS } from '../../constants'; // Import options constants

/**
 * LeadForm Component
 * Renders a dialog form to create a new lead or edit an existing lead.
 * Includes layout validations, error feedback, and accessibility attributes.
 * 
 * @param {Object} props - Component properties
 * @param {Object} [props.initialData] - Existing lead data parameters to prefill during Edit mode
 * @param {Function} props.onSubmit - Submission callback returning completed lead data object
 * @param {Function} props.onCancel - Callback to close the form window
 * @returns {React.ReactElement} The form element structure
 */
export default function LeadForm({ initialData, onSubmit, onCancel }) {
  // Check if form is operating in edit mode
  const isEditMode = !!initialData;

  // Local Form state fields
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    stage: 'New',
    source: 'Website'
  });

  // Local Validation error state tracking
  const [errors, setErrors] = useState({});

  // Effect to prefill inputs if initialData is provided
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        company: initialData.company || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        stage: initialData.status || initialData.stage || 'New',
        source: initialData.source || 'Website'
      });
    }
  }, [initialData]);

  // Handle input field text adjustments
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error when user begins typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Perform form constraints check before submit
  const validateForm = () => {
    const validationErrors = {};
    if (!formData.name.trim()) validationErrors.name = 'Full name is required';
    if (!formData.company.trim()) validationErrors.company = 'Company name is required';
    if (!formData.email.trim()) {
      validationErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = 'Please enter a valid email format';
    }
    
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0; // Return true if validation is clean
  };

  // Process form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData); // Call parent submit with formatted lead details
    }
  };


  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm md:text-xs" noValidate>
      
      {/* Name Field */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="lead-name" className="font-semibold text-slate-700 dark:text-zinc-300 text-xs md:text-[11px]">
          Full Name <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input 
          id="lead-name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleInputChange}
          aria-required="true"
          aria-invalid={!!errors.name}
          placeholder="e.g. John Connor"
          className={`px-3.5 py-3 md:py-2 text-sm md:text-xs bg-slate-50 dark:bg-zinc-950 border rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors min-h-[44px] md:min-h-[36px]
            ${errors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-zinc-800'}`}
        />
        {errors.name && (
          <span className="text-red-500 font-medium text-[11px] md:text-[10px] mt-0.5" role="alert">{errors.name}</span>
        )}
      </div>

      {/* Company Field */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="lead-company" className="font-semibold text-slate-700 dark:text-zinc-300 text-xs md:text-[11px]">
          Company Name <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input 
          id="lead-company"
          name="company"
          type="text"
          value={formData.company}
          onChange={handleInputChange}
          aria-required="true"
          aria-invalid={!!errors.company}
          placeholder="e.g. Cyberdyne Systems"
          className={`px-3.5 py-3 md:py-2 text-sm md:text-xs bg-slate-50 dark:bg-zinc-950 border rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors min-h-[44px] md:min-h-[36px]
            ${errors.company ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-zinc-800'}`}
        />
        {errors.company && (
          <span className="text-red-500 font-medium text-[11px] md:text-[10px] mt-0.5" role="alert">{errors.company}</span>
        )}
      </div>

      {/* Email Field */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="lead-email" className="font-semibold text-slate-700 dark:text-zinc-300 text-xs md:text-[11px]">
          Email Address <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input 
          id="lead-email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          aria-required="true"
          aria-invalid={!!errors.email}
          placeholder="sconnor@cyberdyne.io"
          className={`px-3.5 py-3 md:py-2 text-sm md:text-xs bg-slate-50 dark:bg-zinc-950 border rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors min-h-[44px] md:min-h-[36px]
            ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-zinc-800'}`}
        />
        {errors.email && (
          <span className="text-red-500 font-medium text-[11px] md:text-[10px] mt-0.5" role="alert">{errors.email}</span>
        )}
      </div>

      {/* Phone Field */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="lead-phone" className="font-semibold text-slate-700 dark:text-zinc-300 text-xs md:text-[11px]">
          Phone Number
        </label>
        <input 
          id="lead-phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="e.g. +1 555-0199"
          className="px-3.5 py-3 md:py-2 text-sm md:text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors min-h-[44px] md:min-h-[36px]"
        />
      </div>

      {/* Dropdown selectors (Status & Source) */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Status Stage select */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lead-status" className="font-semibold text-slate-700 dark:text-zinc-300 text-xs md:text-[11px]">
            Pipeline Stage
          </label>
          <select 
            id="lead-status"
            name="stage"
            value={formData.stage}
            onChange={handleInputChange}
            className="px-3 py-3 md:py-2 text-sm md:text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-blue-500 text-slate-800 dark:text-zinc-300 cursor-pointer min-h-[44px] md:min-h-[36px]"
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Traffic Source select */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lead-source" className="font-semibold text-slate-700 dark:text-zinc-300 text-xs md:text-[11px]">
            Lead Source
          </label>
          <select 
            id="lead-source"
            name="source"
            value={formData.source}
            onChange={handleInputChange}
            className="px-3 py-3 md:py-2 text-sm md:text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-blue-500 text-slate-800 dark:text-zinc-300 cursor-pointer min-h-[44px] md:min-h-[36px]"
          >
            {SOURCE_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Form Action CTAs */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800/80 flex justify-end gap-2 shrink-0">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-5 py-3 md:px-4 md:py-2 border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 font-semibold cursor-pointer text-sm md:text-xs min-h-[44px] md:min-h-[36px]"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="px-5 py-3 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold rounded-lg shadow-md shadow-blue-500/10 transition-all cursor-pointer text-sm md:text-xs min-h-[44px] md:min-h-[36px]"
        >
          {isEditMode ? 'Save Changes' : 'Create Lead'}
        </button>
      </div>

    </form>
  );
}
