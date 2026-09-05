import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

/**
 * FormSection — Reusable section card for the Add Employee form.
 * Renders a numbered badge, title, description, and children.
 */
export default function FormSection({ number, title, description, children, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: number * 0.05, ease: 'easeOut' }}
      className={cn(
        'bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative',
        className
      )}
    >
      {/* Decorative Gradient Line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-400 to-teal-400" />

      {/* Section Header */}
      <div className="px-6 py-5 bg-gradient-to-b from-slate-50/80 to-white/20 border-b border-slate-100/60 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100/50">
          <span className="text-sm font-black text-indigo-600">
            {String(number).padStart(2, '0')}
          </span>
        </div>
        <div className="pt-0.5">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
          {description && (
            <p className="text-sm text-slate-500 mt-1 font-medium">{description}</p>
          )}
        </div>
      </div>

      {/* Section Body */}
      <div className="p-6 sm:p-8 bg-white/40">{children}</div>
    </motion.div>
  );
}

/**
 * FieldError — Reusable inline error message.
 */
export function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-[var(--color-error)] flex items-center gap-1" role="alert">
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {message}
    </p>
  );
}

/**
 * FieldLabel — Consistent label with optional required marker.
 */
export function FieldLabel({ htmlFor, required, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-bold tracking-wide text-slate-700 mb-2 uppercase text-[11px]"
    >
      {children}
      {required && <span className="text-red-500 ml-1 font-black">*</span>}
    </label>
  );
}

/**
 * FormGrid — Responsive 2-col grid that collapses to 1-col on mobile.
 */
export function FormGrid({ children, cols = 2 }) {
  return (
    <div className={cn(
      'grid gap-5',
      cols === 2 && 'grid-cols-1 sm:grid-cols-2',
      cols === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      cols === 1 && 'grid-cols-1',
    )}>
      {children}
    </div>
  );
}

/**
 * FormField — Label + input + error wrapper.
 */
export function FormField({ label, required, error, helper, children, className, colSpan }) {
  return (
    <div className={cn('flex flex-col', colSpan === 2 && 'sm:col-span-2', className)}>
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1 font-black">*</span>}
        </label>
      )}
      {children}
      {helper && !error && (
        <p className="mt-1.5 text-xs text-gray-400">{helper}</p>
      )}
      {error && <FieldError message={error} />}
    </div>
  );
}
