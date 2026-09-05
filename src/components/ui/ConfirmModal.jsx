import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  confirmVariant = 'danger' 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] w-full max-w-sm overflow-hidden relative"
          >
            {/* Top gradient glow */}
            <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${confirmVariant === 'danger' ? 'from-rose-500/10' : 'from-indigo-500/10'} to-transparent pointer-events-none`} />
            
            <div className="p-6 relative z-10">
              <button 
                onClick={onClose}
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex flex-col items-center text-center space-y-4 pt-4">
                <div className={`p-4 rounded-full ${confirmVariant === 'danger' ? 'bg-rose-100/80 text-rose-600' : 'bg-indigo-100/80 text-indigo-600'} shadow-inner`}>
                  <AlertTriangle className="h-8 w-8" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
                
                <div className="flex gap-3 w-full pt-4">
                  <Button variant="outline" className="flex-1 rounded-xl bg-white/50" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    variant={confirmVariant} 
                    className="flex-1 rounded-xl"
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                  >
                    {confirmText}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
