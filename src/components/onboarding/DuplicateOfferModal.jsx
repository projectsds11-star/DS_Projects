import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, FileText, ArrowRight, X } from 'lucide-react';
import { Button } from '../ui/Button';

export default function DuplicateOfferModal({ open, existingOffer, onProceedNew, onViewExisting, onClose }) {
  if (!open || !existingOffer) return null;

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
          key="duplicate-modal"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-amber-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-[var(--color-navy)]">
              Active Offer Found
            </h3>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              This employee already has an active offer letter record in the system.
            </p>

            <div className="my-4 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Candidate:</span>
                <span className="font-bold text-gray-900">{existingOffer.employeeName} ({existingOffer.employeeId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Existing Position:</span>
                <span className="font-bold text-[var(--color-primary)]">{existingOffer.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Offer Ref:</span>
                <span className="font-mono text-gray-800">{existingOffer.offerNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Current Status:</span>
                <span className="font-semibold text-amber-800">{existingOffer.status}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-6">
              You can view and manage the existing offer, or proceed to create a revised new offer for this candidate.
            </p>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-center"
                icon={FileText}
                onClick={onViewExisting}
              >
                View Existing Offer
              </Button>
              <Button
                className="w-full justify-center"
                icon={ArrowRight}
                onClick={onProceedNew}
              >
                Create New / Revised Offer
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
