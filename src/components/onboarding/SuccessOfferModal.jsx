import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, FileText, ArrowRight, User, LayoutDashboard, Copy, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import StatusBadge from './StatusBadge';

export default function SuccessOfferModal({
  open,
  isOpen,
  offer = {},
  onViewOffer,
  onViewEmployee,
  onBackToOnboarding,
}) {
  const [copied, setCopied] = React.useState(false);
  const isModalOpen = open ?? isOpen;

  if (!isModalOpen) return null;

  const targetOffer = offer?.data || offer || {};
  const employeeName = targetOffer.employee_name || targetOffer.employeeName || 'Candidate';
  const employeeId = targetOffer.employee_id || targetOffer.employeeId || 'DS-001';
  const email = targetOffer.email || 'employee@dsprojects.in';
  const username = targetOffer.username || targetOffer.employee_id || targetOffer.employeeId || 'portal_user';
  const position = targetOffer.position || 'Mandal Co-ordinator';
  const status = targetOffer.status || 'Offer Sent';
  const offerNumber = targetOffer.offer_number || targetOffer.offerNumber || 'DS/OFF/2026/001';

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(username);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal */}
        <motion.div
          key="success-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-center"
          role="dialog"
          aria-modal="true"
        >
          {/* Top accent banner */}
          <div className="h-2 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600" />

          <div className="p-6 sm:p-8 space-y-5">
            {/* Animated Check Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 18 }}
              className="w-16 h-16 bg-green-50 border-4 border-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 shadow-sm"
            >
              <CheckCircle2 className="h-9 w-9" />
            </motion.div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">
                Offer Letter Dispatched
              </span>
              <h2 className="text-xl font-bold text-[var(--color-navy)] mt-2">
                Offer Sent Successfully!
              </h2>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                The appointment package, official PDF, and account activation link have been emailed to the candidate.
              </p>
            </div>

            {/* Candidate Card */}
            <div className="bg-gray-50/80 rounded-xl p-4 border border-[var(--color-border)] text-left space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <span className="text-gray-500 font-medium">Employee Name:</span>
                <span className="font-bold text-gray-900 text-sm">{employeeName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Employee ID:</span>
                <span className="font-mono font-bold text-[var(--color-primary)]">{employeeId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Offer Ref No:</span>
                <span className="font-mono text-gray-700">{offerNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Designation:</span>
                <span className="font-semibold text-gray-800">{position}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Email Sent To:</span>
                <span className="font-medium text-gray-700">{email}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                <span className="text-gray-500 font-medium">Generated Username:</span>
                <div className="flex items-center gap-1.5 font-mono text-[var(--color-primary)] font-bold">
                  <span>{username}</span>
                  <button
                    type="button"
                    onClick={handleCopyUsername}
                    className="p-1 text-gray-400 hover:text-[var(--color-primary)] rounded"
                    title="Copy username"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Onboarding Status:</span>
                <StatusBadge status={status} size="sm" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <Button
                className="w-full justify-center"
                icon={FileText}
                onClick={onViewOffer}
              >
                View Offer Document
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-center"
                  icon={User}
                  onClick={onViewEmployee}
                >
                  View Employee
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-center"
                  icon={LayoutDashboard}
                  onClick={onBackToOnboarding}
                >
                  Onboarding Hub
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
