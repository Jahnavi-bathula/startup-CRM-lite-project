import React from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Modal component.
 * Renders an overlay dialog that transitions in and is dismissable.
 * Optimized for touch targets on mobile and centering on larger screen sizes.
 */
function Modal({ isOpen, onClose, title, children }) {
  return (
    <div 
      className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-all duration-300 flex items-center justify-center z-50 p-0 md:p-4
        ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={`bg-white dark:bg-zinc-900 border-0 md:border border-slate-200 dark:border-zinc-800 rounded-none md:rounded-xl w-full h-full md:h-auto md:max-w-lg shadow-xl overflow-hidden flex flex-col transform transition-all duration-300
          ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'}`}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-zinc-900/50 shrink-0">
          <h3 id="modal-title" className="font-bold text-slate-900 dark:text-zinc-150 text-sm">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="w-11 h-11 md:w-7 md:h-7 rounded-full border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-400 hover:text-slate-650 cursor-pointer focus:outline-none"
            aria-label="Close modal dialog"
          >
            <X className="w-5 h-5 md:w-4 md:h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default React.memo(Modal);
