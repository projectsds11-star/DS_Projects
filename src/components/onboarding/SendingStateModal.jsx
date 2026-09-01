import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, FileText, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

const SEND_STAGES = [
  { id: 1, label: 'Generating official offer letter PDF document', icon: FileText },
  { id: 2, label: 'Provisioning secure account activation token', icon: KeyRound },
  { id: 3, label: 'Initializing employee portal credentials', icon: ShieldCheck },
  { id: 4, label: 'Connecting to SMTP mail server & dispatching email', icon: Mail },
];

export default function SendingStateModal({ open, isOpen, onComplete }) {
  const isModalOpen = open ?? isOpen;
  const [currentStage, setCurrentStage] = useState(1);

  useEffect(() => {
    if (!isModalOpen) {
      setCurrentStage(1);
      return;
    }

    const t1 = setTimeout(() => setCurrentStage(2), 500);
    const t2 = setTimeout(() => setCurrentStage(3), 1000);
    const t3 = setTimeout(() => setCurrentStage(4), 1500);
    const t4 = setTimeout(() => {
      setCurrentStage(5);
      if (onComplete) onComplete();
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isModalOpen, onComplete]);

  if (!isModalOpen) return null;

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
          key="sending-modal"
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 sm:p-8 text-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-14 h-14 rounded-full bg-blue-50 border-4 border-blue-100 flex items-center justify-center mx-auto mb-4 text-[var(--color-primary)]">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>

          <h3 className="text-lg font-bold text-[var(--color-navy)] mb-1">
            Dispatching Job Offer
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            Please wait while the system completes the automated onboarding pipeline...
          </p>

          <div className="space-y-3 text-left">
            {SEND_STAGES.map((stage) => {
              const isDone = currentStage > stage.id;
              const isRunning = currentStage === stage.id;
              const isPending = currentStage < stage.id;
              const Icon = stage.icon;

              return (
                <div
                  key={stage.id}
                  className={cn(
                    'flex items-center gap-3 p-2.5 rounded-lg border text-xs transition-all',
                    isDone && 'bg-green-50/70 border-green-200 text-green-800',
                    isRunning && 'bg-blue-50 border-blue-200 text-blue-900 font-medium',
                    isPending && 'bg-gray-50 border-gray-100 text-gray-400'
                  )}
                >
                  <div className="shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : isRunning ? (
                      <Loader2 className="h-4 w-4 text-[var(--color-primary)] animate-spin" />
                    ) : (
                      <Icon className="h-4 w-4 text-gray-300" />
                    )}
                  </div>
                  <span className="flex-1 leading-snug">{stage.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
