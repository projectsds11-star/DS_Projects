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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: number * 0.04, ease: 'easeOut' }}
      className={cn(
        'bg-white rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm',
        className
      )}
    >
      {/* Section Header */}
      <div className="px-6 py-4 border-b border-[var(--color-border)] bg-gray-50/60 flex items-start gap-4">
        <div className="w-9 h-9 rounded-lg bg-[var(--color-lavender)] flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-[var(--color-primary)]">
            {String(number).padStart(2, '0')}
          </span>
        </div>
        <div className="pt-0.5">
          <h3 className="text-sm font-semibold text-[var(--color-navy)] leading-tight">{title}</h3>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
      </div>

      {/* Section Body */}
      <div className="p-6">{children}</div>
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
      className="block text-sm font-medium text-gray-700 mb-1.5"
    >
      {children}
      {required && <span className="text-[var(--color-error)] ml-1">*</span>}
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
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-[var(--color-error)] ml-1">*</span>}
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
