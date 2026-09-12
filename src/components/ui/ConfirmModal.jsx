import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  X, 
  RotateCw, 
  Send, 
  CheckCircle2, 
  Info, 
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { Button } from './Button';

const VARIANT_CONFIGS = {
  danger: {
    icon: AlertTriangle,
    iconBg: 'bg-rose-50 border border-rose-200 text-rose-600',
    headerGlow: 'from-rose-500/10 via-rose-500/5',
    confirmBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
    topBar: 'bg-gradient-to-r from-rose-500 to-red-600',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-50 border border-amber-200 text-amber-600',
    headerGlow: 'from-amber-500/10 via-amber-500/5',
    confirmBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20',
    topBar: 'bg-gradient-to-r from-amber-400 to-amber-600',
  },
  primary: {
    icon: Send,
    iconBg: 'bg-blue-50 border border-blue-200 text-[var(--color-primary)]',
    headerGlow: 'from-blue-500/10 via-blue-500/5',
    confirmBg: 'bg-[#E63946] hover:bg-[#d62839] text-white shadow-red-500/20',
    topBar: 'bg-gradient-to-r from-[#E63946] to-[#00B4D8]',
  },
  info: {
    icon: Info,
    iconBg: 'bg-indigo-50 border border-indigo-200 text-indigo-600',
    headerGlow: 'from-indigo-500/10 via-indigo-500/5',
    confirmBg: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20',
    topBar: 'bg-gradient-to-r from-indigo-500 to-blue-600',
  },
  success: {
    icon: CheckCircle2,
    iconBg: 'bg-emerald-50 border border-emerald-200 text-emerald-600',
    headerGlow: 'from-emerald-500/10 via-emerald-500/5',
    confirmBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
    topBar: 'bg-gradient-to-r from-emerald-500 to-teal-600',
  },
};

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message, 
  details = null,
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  icon: CustomIcon = null,
  isLoading = false,
}) {
  const config = VARIANT_CONFIGS[confirmVariant] || VARIANT_CONFIGS.primary;
  const IconComponent = CustomIcon || config.icon;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={!isLoading ? onClose : undefined}
          />

          {/* Modal Container */}
          <motion.div
            key="confirm-modal-content"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden text-center z-10"
            role="dialog"
            aria-modal="true"
          >
            {/* Top Accent Bar */}
            <div className={`h-2 w-full ${config.topBar}`} />

            {/* Close button */}
            <button 
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 sm:p-7 space-y-4">
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl ${config.iconBg} flex items-center justify-center mx-auto shadow-xs`}>
                <IconComponent className="h-7 w-7" />
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5 px-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {title}
                </h3>
                {message && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {message}
                  </p>
                )}
              </div>

              {/* Optional details box */}
              {details && (
                <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-3.5 text-left text-xs text-slate-700 space-y-1.5">
                  {details}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2">
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full sm:flex-1 justify-center rounded-xl text-xs h-10 font-semibold" 
                  disabled={isLoading}
                  onClick={onClose}
                >
                  {cancelText}
                </Button>
                <Button 
                  type="button"
                  className={`w-full sm:flex-1 justify-center rounded-xl text-xs h-10 font-bold shadow-sm ${config.confirmBg}`}
                  disabled={isLoading}
                  isLoading={isLoading}
                  onClick={async () => {
                    await onConfirm();
                  }}
                >
                  {confirmText}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmModal;
