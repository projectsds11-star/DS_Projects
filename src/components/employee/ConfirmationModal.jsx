import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/Button';

export default function ConfirmationModal({ open, onClose, onConfirm, isSubmitting, employee }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <h2 id="confirm-title" className="text-lg font-semibold text-[var(--color-navy)]">
                Create Employee?
              </h2>
            </div>
            <button onClick={onClose} disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
              aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 pb-6 space-y-4">
            <p className="text-sm text-gray-500 leading-relaxed">
              You are about to create a new employee record in DS Projects. Please review the details below before confirming.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-[var(--color-border)]">
              <InfoRow label="Employee Name" value={employee?.fullName || '—'} />
              <InfoRow label="Employee ID" value={employee?.employeeId || '—'} mono />
              <InfoRow label="Email Address" value={employee?.email || '—'} />
              <InfoRow label="Phone" value={employee?.phone ? `+91 ${employee.phone}` : '—'} />
              <InfoRow label="Status" value={employee?.status || 'Draft'} />
            </div>

            <p className="text-xs text-gray-400">
              An employee account will be created. The employee can later set their password using the activation link.
            </p>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="flex-1">
                Cancel
              </Button>
              <Button onClick={onConfirm} isLoading={isSubmitting} className="flex-1">
                {isSubmitting ? 'Creating…' : 'Confirm & Create'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className={`font-medium text-gray-800 text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
