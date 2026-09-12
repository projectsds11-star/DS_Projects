import React, { useState, useRef, useEffect } from 'react';
import { Briefcase, Check, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { JOB_POSITIONS, MASTER_TEMPLATES, formatINR } from '../../services/templateService';

export default function JobPositionCards({
  selectedPosition = '',
  onSelectPosition,
  error = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedTemplate = selectedPosition ? MASTER_TEMPLATES[selectedPosition] : null;
  const selectedMonthlyEst = selectedTemplate
    ? (selectedTemplate.defaultSalary?.basic || 0) +
    (selectedTemplate.defaultSalary?.travel || 0) +
    (selectedTemplate.defaultSalary?.incentive || 0) +
    (selectedTemplate.defaultSalary?.other || 0)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 sm:p-6 shadow-xs space-y-4" ref={dropdownRef}>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-navy)] flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
            Job Position & Role Designation *
          </span>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Select the organizational appointment role for this candidate.
          </p>
        </div>
        {selectedPosition && (
          <span className="text-xs font-bold text-[var(--color-primary)] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 animate-in fade-in whitespace-nowrap shrink-0 self-start sm:self-auto">
            ✓ {selectedPosition} Selected
          </span>
        )}
      </div>

      {/* Modern Compact Dropdown Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center justify-between w-full h-12 px-3.5 sm:px-4 rounded-xl border bg-gray-50/80 hover:bg-white text-xs cursor-pointer transition shadow-2xs min-w-0',
            error ? 'border-red-500 ring-1 ring-red-500' : 'border-[var(--color-border)] hover:border-blue-400',
            isOpen && 'bg-white ring-2 ring-[var(--color-primary)] border-transparent'
          )}
        >
          <div className="flex items-center gap-3 truncate min-w-0 flex-1">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
              selectedPosition ? 'bg-blue-100 text-[var(--color-primary)]' : 'bg-gray-200 text-gray-500'
            )}>
              <Briefcase className="h-4 w-4" />
            </div>

            {selectedPosition ? (
              <div className="text-left truncate min-w-0 flex-1">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-gray-900 text-xs sm:text-sm truncate">{selectedPosition}</span>
                  <span className="text-[10px] font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded shrink-0 hidden sm:inline-block">
                    {selectedTemplate?.department || 'Field Operations'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 truncate mt-0.5">
                  Probation: {selectedTemplate?.probation || '3 Months'} · CTC: {formatINR(selectedMonthlyEst * 12)}
                </p>
              </div>
            ) : (
              <span className="text-gray-400 text-xs font-medium truncate">
                Click to select job role / designation...
              </span>
            )}
          </div>

          <ChevronDown
            className={cn(
              'h-4 w-4 text-gray-400 shrink-0 ml-2 transition-transform duration-200',
              isOpen && 'rotate-180 text-[var(--color-primary)]'
            )}
          />
        </button>

        {/* Dropdown Menu Options */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-72 overflow-y-auto divide-y divide-gray-100 p-1.5">
            {JOB_POSITIONS.map((pos) => {
              const isSelected = selectedPosition === pos;
              const tpl = MASTER_TEMPLATES[pos];
              const monthlyEst =
                (tpl?.defaultSalary?.basic || 0) +
                (tpl?.defaultSalary?.travel || 0) +
                (tpl?.defaultSalary?.incentive || 0) +
                (tpl?.defaultSalary?.other || 0);

              return (
                <div
                  key={pos}
                  onClick={() => {
                    onSelectPosition(pos);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 text-xs',
                    isSelected
                      ? 'bg-blue-50/90 text-[var(--color-primary)] border border-blue-200 shadow-2xs font-semibold'
                      : 'hover:bg-gray-50 text-gray-800'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      isSelected ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-600'
                    )}>
                      <Briefcase className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-xs leading-tight">{pos}</span>
                        <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {tpl?.department || 'Field Operations'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {tpl?.jobDescription?.slice(0, 80)}...
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <span className="font-mono font-bold text-green-700 block text-xs">
                        {formatINR(monthlyEst * 12)}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        Prob: {tpl?.probation || '3M'}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Role Summary Preview Box */}
      {selectedPosition && selectedTemplate && (
        <div className="bg-slate-50/90 rounded-xl p-4 border border-slate-200/80 space-y-2.5 text-xs animate-in fade-in">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Role Description</span>
              <p className="text-slate-700 leading-relaxed mt-0.5">
                {selectedTemplate.jobDescription}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
            <span>
              <strong>Department:</strong> {selectedTemplate.department || 'Field Operations'}
            </span>
            <span>
              <strong>Probation:</strong> {selectedTemplate.probation || '3 Months'}
            </span>
            <span>
              <strong>Notice Period:</strong> {selectedTemplate.noticePeriod || '30 Days'}
            </span>
            <span className="font-mono font-bold text-emerald-700">
              Estimated Annual CTC: {formatINR(selectedMonthlyEst * 12)}
            </span>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
