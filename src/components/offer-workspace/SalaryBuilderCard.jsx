import React from 'react';
import { IndianRupee, Calculator, TrendingUp, ShieldAlert } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatINR } from '../../services/templateService';

const INPUT_CLASS = 'flex h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition shadow-2xs';

export default function SalaryBuilderCard({
  register,
  watch,
  errors = {},
}) {
  const watchedSalary = watch('salary');

  const basic = Math.max(0, Number(watchedSalary?.basic) || 0);
  const travel = Math.max(0, Number(watchedSalary?.travel) || 0);
  const incentive = Math.max(0, Number(watchedSalary?.incentive) || 0);
  const other = Math.max(0, Number(watchedSalary?.other) || 0);

  const monthlyGross = basic + travel + incentive + other;
  const annualCtc = monthlyGross * 12;

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-navy)] flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-green-600" />
            Salary Structure & Compensation Schedule
          </span>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Configure monthly allowances and view real-time deterministic Gross & Annual CTC calculations.
          </p>
        </div>
        <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
          Monthly Disbursal
        </span>
      </div>

      {/* Salary Breakdown Fields */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Basic Pay (₹ / Mo) *
          </label>
          <input
            type="number"
            min="0"
            step="500"
            placeholder="15000"
            {...register('salary.basic')}
            className={cn(INPUT_CLASS, errors?.salary?.basic && 'border-red-500')}
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Travel Allowance (₹ / Mo)
          </label>
          <input
            type="number"
            min="0"
            step="500"
            placeholder="2000"
            {...register('salary.travel')}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Performance Incentive (₹ / Mo)
          </label>
          <input
            type="number"
            min="0"
            step="500"
            placeholder="3000"
            {...register('salary.incentive')}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Other Allowances (₹ / Mo)
          </label>
          <input
            type="number"
            min="0"
            step="500"
            placeholder="0"
            {...register('salary.other')}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {/* Auto-Calculated Totals Banner */}
      <div className="p-5 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50 rounded-2xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Total Monthly Gross Remuneration
          </span>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-[var(--color-primary)] mt-1">
            {formatINR(monthlyGross)} <span className="text-xs font-sans font-normal text-gray-500">/ month</span>
          </p>
        </div>

        <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-blue-200 pt-3 sm:pt-0 sm:pl-8">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Total Annual Cost to Company (CTC)
          </span>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-[var(--color-navy)] mt-1">
            {formatINR(annualCtc)} <span className="text-xs font-sans font-normal text-gray-500">/ year</span>
          </p>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 italic">
        * Statutory deductions, applicable TDS, and insurance will be deducted as per company governance & government regulations.
      </p>
    </div>
  );
}
