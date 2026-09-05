/**
 * src/components/employee/SuccessModal.jsx
 * Success screen shown after employee creation or update.
 */
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, User, ArrowLeft, Check, PartyPopper, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../ui/Button';

const playSuccessSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Play a cheerful two-tone chime
    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
      
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    playTone(523.25, 0, 0.4); // C5
    playTone(659.25, 0.1, 0.6); // E5
    playTone(783.99, 0.2, 0.8); // G5
    playTone(1046.50, 0.3, 1.2); // C6
  } catch (e) {
    // Ignore audio context errors (e.g. browser policy)
  }
};

export default function SuccessModal({ open, employee, onViewEmployee, onClose, isEdit }) {
  useEffect(() => {
    if (open) {
      playSuccessSound();
      
      // Fire confetti
      const duration = 2500;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 40 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
      
      const autoCloseTimer = setTimeout(() => {
        if (onClose) onClose();
      }, 5000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(autoCloseTimer);
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  const emailSent = employee?.emailStatus === 'SENT';
  const emailFailed = employee?.emailStatus === 'FAILED';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] w-full max-w-sm overflow-hidden border border-white/60 relative"
          >
            {/* Top gradient glow */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-500/20 to-transparent pointer-events-none" />
            
            {/* Top accent */}
            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
            
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors z-20"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="px-6 py-8 space-y-5 text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.15 }}
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-100 to-blue-50 border-[6px] border-white shadow-xl flex items-center justify-center mx-auto relative z-10"
              >
                <motion.div
                  initial={{ opacity: 0.5, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.6 }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut', delay: 0.8 }}
                  className="absolute inset-0 rounded-full bg-indigo-400/40"
                />
                <CheckCircle className="h-10 w-10 text-indigo-600 relative z-10" />
              </motion.div>

              {/* Title */}
              <div className="relative z-10">
                <h2 className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {isEdit ? 'Employee Updated!' : 'Employee Created!'}
                </h2>
                <p className="text-sm text-slate-500 mt-2 font-medium">
                  {isEdit
                    ? 'The employee record has been successfully updated.'
                    : 'The employee has been successfully registered in DS Projects.'}
                </p>
              </div>

              {/* Employee ID badge & Details */}
              <div className="relative bg-gradient-to-br from-indigo-50/80 to-blue-50/80 border border-indigo-100/60 rounded-2xl p-5 text-center shadow-inner overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <User className="w-24 h-24" />
                </div>
                <div className="relative z-10 space-y-3">
                  <div>
                    <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-0.5">Employee ID</p>
                    <p className="text-3xl font-black text-indigo-900 font-mono tracking-tight drop-shadow-sm">
                      {employee?.employeeId || '—'}
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t border-indigo-200/50">
                    <p className="text-lg font-bold text-slate-800 tracking-tight leading-tight">
                      {employee?.name || 'Unknown Name'}
                    </p>
                    {employee?.email && (
                      <p className="text-sm font-semibold text-indigo-600 mt-0.5 bg-indigo-100/50 inline-block px-2 py-0.5 rounded-md">
                        {employee.email}
                      </p>
                    )}
                  </div>
                </div>
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
              <div className="flex flex-col gap-3 pt-2 relative z-10">
                <button
                  type="button"
                  onClick={onViewEmployee}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 font-bold transition-all"
                >
                  <User className="h-5 w-5" />
                  View Employee Profile
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold shadow-sm transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
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
