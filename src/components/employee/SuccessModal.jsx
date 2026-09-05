/**
 * src/components/employee/SuccessModal.jsx
 * Success screen shown after employee creation or update.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, User, ArrowLeft, Check } from 'lucide-react';
import { Button } from '../ui/Button';

export default function SuccessModal({ open, employee, onViewEmployee, onClose, isEdit }) {
  if (!open) return null;

  const emailSent = employee?.emailStatus === 'SENT';
  const emailFailed = employee?.emailStatus === 'FAILED';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100"
          >
            {/* Top accent */}
            <div className="h-1.5 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600" />

            <div className="px-6 py-8 space-y-5 text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.15 }}
                className="w-16 h-16 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center mx-auto relative"
              >
                <motion.div
                  initial={{ opacity: 0.5, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.6 }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut', delay: 0.8 }}
                  className="absolute inset-0 rounded-full bg-green-300"
                />
                <CheckCircle className="h-8 w-8 text-green-500 relative z-10" />
              </motion.div>

              {/* Title */}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isEdit ? 'Employee Updated!' : 'Employee Created!'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isEdit
                    ? 'The employee record has been successfully updated.'
                    : 'The employee has been successfully registered in DS Projects.'}
                </p>
              </div>

              {/* Employee ID badge */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-left">
                <p className="text-xs text-blue-600 font-medium mb-1">Employee ID</p>
                <p className="text-2xl font-bold text-blue-800 font-mono tracking-wider">
                  {employee?.employeeId || '—'}
                </p>
                <p className="text-xs text-blue-500 mt-1 truncate">{employee?.name}</p>
              </div>

              {/* Email status (only for new employees) */}
              {!isEdit && (
                <div className={`flex items-center gap-3 rounded-xl p-3 text-left border ${
                  emailSent
                    ? 'bg-emerald-50 border-emerald-200'
                    : emailFailed
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    emailSent ? 'bg-emerald-100' : emailFailed ? 'bg-amber-100' : 'bg-gray-100'
                  }`}>
                    {emailSent
                      ? <Check className="h-4 w-4 text-emerald-600" />
                      : emailFailed
                      ? <AlertTriangle className="h-4 w-4 text-amber-600" />
                      : <Check className="h-4 w-4 text-gray-400" />
                    }
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${emailSent ? 'text-emerald-900' : emailFailed ? 'text-amber-800' : 'text-gray-600'}`}>
                      Welcome Email {emailSent ? 'Sent' : emailFailed ? 'Failed to Send' : '—'}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${emailSent ? 'text-emerald-700' : emailFailed ? 'text-amber-600' : 'text-gray-400'}`}>
                      {emailSent
                        ? `Sent to ${employee?.email}`
                        : emailFailed
                        ? 'Email delivery failed. Employee record is saved.'
                        : employee?.email || ''}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2.5 pt-1">
                <Button type="button" onClick={onViewEmployee} className="w-full" icon={User}>
                  View Employee Profile
                </Button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition py-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Employees List
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
