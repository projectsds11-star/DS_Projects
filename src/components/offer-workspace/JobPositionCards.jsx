import React from 'react';
import { Briefcase, Check, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';
import { JOB_POSITIONS, MASTER_TEMPLATES, formatINR } from '../../services/templateService';

export default function JobPositionCards({
  selectedPosition = '',
  onSelectPosition,
  error = '',
}) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-navy)] flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-[var(--color-primary)]" />
            Job Position & Role Designation *
          </span>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Select the organizational appointment role for this candidate.
          </p>
        </div>
        {selectedPosition && (
          <span className="text-xs font-bold text-[var(--color-primary)] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            ✓ {selectedPosition} Selected
          </span>
        )}
      </div>

      {/* Spacious 3-Column Position Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {JOB_POSITIONS.map((pos) => {
          const isSelected = selectedPosition === pos;
          const tpl = MASTER_TEMPLATES[pos];
          const monthlyEst = (tpl?.defaultSalary?.basic || 0) + (tpl?.defaultSalary?.travel || 0) + (tpl?.defaultSalary?.incentive || 0) + (tpl?.defaultSalary?.other || 0);

          return (
            <div
              key={pos}
              onClick={() => onSelectPosition(pos)}
              className={cn(
                'p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between text-left space-y-3',
                isSelected
                  ? 'border-[var(--color-primary)] bg-blue-50/90 shadow-md ring-2 ring-blue-200'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50/70 shadow-xs'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className={cn('text-sm font-bold', isSelected ? 'text-[var(--color-navy)]' : 'text-gray-800')}>
                    {pos}
                  </h4>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {tpl?.department || 'Field Operations'}
                  </span>
                </div>
                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0 mt-0.5" />
                )}
              </div>

              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                {tpl?.jobDescription}
              </p>

              <div className="pt-2.5 border-t border-gray-200/80 flex items-center justify-between text-xs">
                <span className="text-gray-400 font-mono text-[11px]">Probation: {tpl?.probation || '3M'}</span>
                <span className="font-mono font-bold text-green-700">
                  {formatINR(monthlyEst * 12)} CTC
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
