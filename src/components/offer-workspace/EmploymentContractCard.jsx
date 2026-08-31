import React from 'react';
import { Calendar, Building, UserCheck, Clock, ShieldCheck, FileCheck } from 'lucide-react';
import { cn } from '../../utils/cn';
import { DEPARTMENTS, EMPLOYMENT_TYPES, WORK_LOCATIONS } from '../../services/templateService';

const INPUT_CLASS = 'flex h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition shadow-2xs';
const SELECT_CLASS = `${INPUT_CLASS} cursor-pointer`;

export default function EmploymentContractCard({
  register,
  errors = {},
}) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-navy)] flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-[var(--color-primary)]" />
            Employment & Contract Governance
          </span>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Configure joining dates, reporting authorities, and contract terms.
          </p>
        </div>
        <span className="text-[10px] text-gray-400 font-medium">Terms Configuration</span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {/* Joining Date */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Proposed Joining Date *
          </label>
          <input
            type="date"
            {...register('joiningDate')}
            className={cn(INPUT_CLASS, errors.joiningDate && 'border-red-500')}
          />
          {errors.joiningDate && <p className="text-[10px] text-red-500 mt-1">{errors.joiningDate.message}</p>}
        </div>

        {/* Employment Type */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Employment Type
          </label>
          <select {...register('employmentType')} className={SELECT_CLASS}>
            {EMPLOYMENT_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Department / Division *
          </label>
          <select {...register('department')} className={SELECT_CLASS}>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Reporting Manager */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Reporting Manager / Authority
          </label>
          <input
            type="text"
            placeholder="e.g. District Project Coordinator"
            {...register('reportingManager')}
            className={INPUT_CLASS}
          />
        </div>

        {/* Work Mode */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Work Mode / Execution
          </label>
          <select {...register('workLocation')} className={SELECT_CLASS}>
            {WORK_LOCATIONS.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        {/* Probation Period */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Probation Period
          </label>
          <select {...register('probation')} className={SELECT_CLASS}>
            <option value="1 Month">1 Month</option>
            <option value="3 Months">3 Months</option>
            <option value="6 Months">6 Months</option>
            <option value="None">None</option>
          </select>
        </div>
      </div>

      {/* Contract Settings row */}
      <div className="grid sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Notice Period Post-Probation
          </label>
          <select {...register('noticePeriod')} className={SELECT_CLASS}>
            <option value="15 Days">15 Days</option>
            <option value="30 Days">30 Days</option>
            <option value="60 Days">60 Days</option>
            <option value="90 Days">90 Days</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Standard Working Schedule
          </label>
          <input
            type="text"
            readOnly
            value="9:00 AM – 6:00 PM (Mon - Sat / Field Operations)"
            className="flex h-11 w-full rounded-xl border border-[var(--color-border)] bg-gray-50/80 px-3.5 py-2.5 text-xs text-gray-700 font-medium"
          />
        </div>
      </div>
    </div>
  );
}
