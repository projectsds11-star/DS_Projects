import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, User, FileText } from 'lucide-react';
import { Button } from '../ui/Button';

export default function SuccessModal({ open, employee, onViewEmployee, onCreateOffer, onClose }) {
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
        />

        {/* Modal */}
        <motion.div
          key="success-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
        >
          {/* Green top accent */}
          <div className="h-2 bg-gradient-to-r from-green-400 to-green-600" />

          <div className="px-6 py-8 space-y-5">
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
              className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto border-4 border-green-100"
            >
              <CheckCircle className="h-8 w-8 text-green-500" />
            </motion.div>

            <div>
              <h2 id="success-title" className="text-xl font-bold text-[var(--color-navy)]">
                Employee Created!
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                The employee record has been successfully created.
              </p>
            </div>

            {/* Employee Info Card */}
            <div className="bg-gray-50 rounded-xl p-4 border border-[var(--color-border)] text-left space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--color-border)]">
                <div className="w-10 h-10 rounded-full bg-[var(--color-lavender)] flex items-center justify-center text-[var(--color-navy)] font-bold text-base">
                  {employee?.fullName?.charAt(0)?.toUpperCase() || 'E'}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{employee?.fullName || 'Employee'}</p>
                  <p className="text-xs text-gray-500">{employee?.email}</p>
                </div>
              </div>
              <InfoLine label="Employee ID" value={employee?.employeeId} mono />
              <InfoLine label="Username" value={employee?.username} mono />
              <InfoLine label="Status" value={employee?.status || 'Draft'} />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5 pt-1">
              <Button onClick={onViewEmployee} className="w-full" icon={User}>
                View Employee
              </Button>
              <Button variant="outline" onClick={onCreateOffer} className="w-full" icon={FileText}>
                Create Job Offer
              </Button>
              <button
                onClick={onClose}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors pt-1"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function InfoLine({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium text-gray-800 ${mono ? 'font-mono text-xs' : ''}`}>{value || '—'}</span>
    </div>
  );
}
