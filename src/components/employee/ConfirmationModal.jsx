import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X } from 'lucide-react';
import { Button } from '../ui/Button';

export default function ConfirmationModal({ open, onClose, onConfirm, isSubmitting, employee, title, message, confirmText = "Confirm & Create" }) {
  return (
    <AnimatePresence>
      {open && (
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
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-primary-light)] rounded-full flex items-center justify-center shadow-sm">
                  <UserPlus className="h-5 w-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h2 id="confirm-title" className="text-lg font-bold text-gray-900 leading-tight">
                    {title || 'Create Employee?'}
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">{employee?.employeeId}</p>
                </div>
              </div>
              <button onClick={onClose} disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-200"
                aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body (Scrollable) */}
            <div className="px-6 py-5 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              <p className="text-sm text-gray-600 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                {message || 'You are about to create a new employee record. Please review the details below before confirming.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Personal & Contact */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">Personal & Contact</h3>
                  <div className="space-y-2.5">
                    <InfoRow label="Full Name" value={employee?.fullName} />
                    <InfoRow label="Phone" value={employee?.phone ? `+91 ${employee.phone}` : '—'} />
                    <InfoRow label="Email" value={employee?.email || '—'} />
                    <InfoRow label="Gender" value={employee?.gender || '—'} />
                    <InfoRow label="Date of Birth" value={employee?.dob || employee?.dateOfBirth || '—'} />
                  </div>
                </div>

                {/* Employment */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">Employment</h3>
                  <div className="space-y-2.5">
                    <InfoRow label="Designation" value={employee?.designation || '—'} />
                    <InfoRow label="Department" value={employee?.department || '—'} />
                    <InfoRow label="Joining Date" value={employee?.joiningDate || '—'} />
                    <InfoRow label="Status" value={employee?.status || 'Onboarding'} />
                    <InfoRow label="Location" value={employee?.mandal ? `${employee.mandal}, ${employee.district}` : '—'} />
                  </div>
                </div>

                {/* Identity & Bank */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">Identity & Bank</h3>
                  <div className="space-y-2.5">
                    <InfoRow label="Aadhaar" value={employee?.aadhaar ? `XXXX XXXX ${employee.aadhaar.slice(-4)}` : '—'} mono />
                    <InfoRow label="PAN" value={employee?.pan || '—'} mono />
                    <InfoRow label="Bank Name" value={employee?.bankName || '—'} />
                    <InfoRow label="Account No." value={employee?.accountNumber ? `XXXX${employee.accountNumber.slice(-4)}` : '—'} mono />
                  </div>
                </div>

                {/* Emergency & Edu */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">Emergency & Education</h3>
                  <div className="space-y-2.5">
                    <InfoRow label="Emergency Contact" value={employee?.referenceName || '—'} />
                    <InfoRow label="Emergency Phone" value={employee?.referenceMobile || '—'} />
                    <InfoRow label="Highest Qual." value={employee?.highestQualification || employee?.qualification || '—'} />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 shrink-0">
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="min-w-[100px]">
                  Cancel
                </Button>
                <Button onClick={onConfirm} isLoading={isSubmitting} className="min-w-[140px]">
                  {isSubmitting ? 'Processing…' : confirmText}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
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
