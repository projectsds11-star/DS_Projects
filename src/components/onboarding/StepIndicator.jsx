import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export const WIZARD_STEPS = [
  { id: 1, name: 'Employee', desc: 'Select candidate' },
  { id: 2, name: 'Job Position', desc: 'Role & department' },
  { id: 3, name: 'Location', desc: 'District & mandal' },
  { id: 4, name: 'Salary & Terms', desc: 'CTC & employment' },
  { id: 5, name: 'Offer Content', desc: 'Terms & conditions' },
  { id: 6, name: 'Email Setup', desc: 'Subject & body' },
  { id: 7, name: 'Review & Send', desc: 'A4 Preview' },
];

export default function StepIndicator({ currentStep = 1, onStepClick, completedSteps = [] }) {
  return (
    <div className="w-full bg-white rounded-xl border border-[var(--color-border)] p-3 sm:p-4 shadow-xs overflow-x-auto">
      <div className="flex items-center justify-between min-w-[640px] md:min-w-0">
        {WIZARD_STEPS.map((step, index) => {
          const isCurrent = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id) || currentStep > step.id;
          const isClickable = onStepClick && (isCompleted || isCurrent);

          return (
            <React.Fragment key={step.id}>
              {/* Step item */}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step.id)}
                className={cn(
                  'flex items-center gap-2.5 text-left group focus:outline-none transition-all',
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                )}
              >
                {/* Step circle */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0',
                    isCurrent && 'bg-[var(--color-primary)] text-white ring-4 ring-blue-100 shadow-sm',
                    isCompleted && !isCurrent && 'bg-green-600 text-white',
                    !isCurrent && !isCompleted && 'bg-gray-100 text-gray-400 border border-gray-200'
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{String(step.id).padStart(2, '0')}</span>
                  )}
                </div>

                {/* Step labels */}
                <div className="hidden lg:block">
                  <p
                    className={cn(
                      'text-xs font-semibold leading-tight transition-colors',
                      isCurrent && 'text-[var(--color-navy)]',
                      isCompleted && !isCurrent && 'text-gray-700',
                      !isCurrent && !isCompleted && 'text-gray-400'
                    )}
                  >
                    {step.name}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-none mt-0.5">{step.desc}</p>
                </div>
              </button>

              {/* Connecting line */}
              {index < WIZARD_STEPS.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-3 h-[2px] rounded-full bg-gray-200 overflow-hidden shrink-0">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      currentStep > step.id ? 'w-full bg-green-500' : 'w-0 bg-transparent'
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
