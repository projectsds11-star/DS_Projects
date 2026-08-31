import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, FileText, UserCheck, ShieldCheck, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatINR } from '../../services/templateService';

export default function SendOfferConfirmModal({
  open,
  offerData = {},
  onConfirm,
  onClose,
  isSending = false,
}) {
  if (!open) return null;

  const {
    employeeName = '',
    employeeId = '',
    email = '',
    position = '',
    district = '',
    mandal = '',
    joiningDate = '',
    salary = {},
  } = offerData;

  const monthly = salary.monthlyTotal || ((salary.basic || 0) + (salary.travel || 0) + (salary.incentive || 0) + (salary.other || 0));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          key="send-confirm-modal"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[var(--color-border)]"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)] bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[var(--color-primary)]">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--color-navy)]">
                  Send Formal Job Offer?
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Confirm dispatch of appointment package to candidate.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-blue-100">
                <span className="text-gray-500 font-medium">Candidate:</span>
                <span className="font-bold text-gray-900 text-sm">{employeeName} ({employeeId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Email Address:</span>
                <span className="font-semibold text-[var(--color-primary)]">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Designation:</span>
                <span className="font-semibold text-gray-900">{position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Location:</span>
                <span className="font-semibold text-gray-800">{district}, {mandal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Monthly CTC:</span>
                <span className="font-bold text-green-700">{formatINR(monthly)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Proposed Joining:</span>
                <span className="font-semibold text-gray-800">{joiningDate}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                What the candidate will receive:
              </p>
              <ul className="space-y-1.5 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  <span>Official Signed Offer Letter PDF (with full salary schedule)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  <span>Job Description & Responsibilities schedule</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  <span>Secure One-Time Account Activation Link to set portal password</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  <span>Onboarding documentation checklist and joining guidelines</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 justify-center"
                disabled={isSending}
                onClick={onClose}
              >
                Cancel / Edit
              </Button>
              <Button
                className="flex-1 justify-center"
                icon={Send}
                isLoading={isSending}
                onClick={onConfirm}
              >
                Confirm & Send Offer
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
