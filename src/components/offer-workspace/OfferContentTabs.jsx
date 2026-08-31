import React, { useState } from 'react';
import { 
  FileText, 
  ListChecks, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Code, 
  ChevronDown, 
  Check, 
  ChevronRight, 
  Sparkles 
} from 'lucide-react';
import { cn } from '../../utils/cn';

const TEMPLATE_VARIABLES = [
  { label: 'Candidate Name', tag: '{{employee_name}}' },
  { label: 'Employee ID', tag: '{{employee_id}}' },
  { label: 'Job Designation', tag: '{{designation}}' },
  { label: 'Assigned District', tag: '{{district}}' },
  { label: 'Assigned Mandal', tag: '{{mandal}}' },
  { label: 'Proposed Joining Date', tag: '{{joining_date}}' },
  { label: 'Monthly Gross Salary', tag: '{{monthly_salary}}' },
  { label: 'Annual CTC', tag: '{{annual_ctc}}' },
  { label: 'Probation Period', tag: '{{probation_period}}' },
  { label: 'Notice Period', tag: '{{notice_period}}' },
  { label: 'Reporting Manager', tag: '{{reporting_manager}}' },
  { label: 'Company Name', tag: '{{company_name}}' },
];

export default function OfferContentTabs({
  register,
  watch,
  setValue,
  respFields,
  appendResp,
  removeResp,
}) {
  const [activeTab, setActiveTab] = useState('desc');
  const [showVarDropdown, setShowVarDropdown] = useState(false);
  const [expandedTerm, setExpandedTerm] = useState(null);

  const terms = watch('termsAndConditions') || [];

  const handleInsertVariable = (tag) => {
    if (activeTab === 'desc') {
      const current = watch('jobDescription') || '';
      setValue('jobDescription', `${current} ${tag}`);
    } else if (activeTab === 'email') {
      const current = watch('emailBody') || '';
      setValue('emailBody', `${current} ${tag}`);
    }
    setShowVarDropdown(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-xs overflow-hidden space-y-0">
      {/* Header & Tabs */}
      <div className="border-b border-[var(--color-border)] bg-gray-50/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'desc', label: 'Job Description', icon: FileText },
            { id: 'resp', label: `Responsibilities (${respFields.length})`, icon: ListChecks },
            { id: 'terms', label: `Terms & Conditions (${terms.length})`, icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all',
                  activeTab === tab.id
                    ? 'bg-white text-[var(--color-primary)] shadow-xs border border-gray-200'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Variable Insertion Dropdown */}
        <div className="relative self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setShowVarDropdown(!showVarDropdown)}
            className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)] bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl border border-blue-200 transition shadow-2xs"
          >
            <Code className="h-4 w-4" />
            <span>Insert Dynamic Variable</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {showVarDropdown && (
            <div className="absolute right-0 top-full mt-1.5 z-40 bg-white border border-[var(--color-border)] rounded-2xl shadow-xl w-60 p-2 text-xs animate-in fade-in zoom-in-95 duration-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2.5 py-1">
                Template Placeholders
              </p>
              <div className="max-h-56 overflow-y-auto divide-y divide-gray-50 p-1">
                {TEMPLATE_VARIABLES.map((v) => (
                  <div
                    key={v.tag}
                    onClick={() => handleInsertVariable(v.tag)}
                    className="p-2 hover:bg-blue-50 rounded-lg cursor-pointer flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-800">{v.label}</span>
                    <span className="font-mono text-[9px] text-[var(--color-primary)] bg-blue-50 px-1.5 py-0.5 rounded">
                      {v.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── TAB 1: JOB DESCRIPTION ───────────────────────────── */}
      {activeTab === 'desc' && (
        <div className="p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Role Overview & Responsibilities Scope
            </label>
            <span className="text-[11px] text-gray-400">Customized specifically for this appointment</span>
          </div>
          <textarea
            rows={5}
            {...register('jobDescription')}
            placeholder="Enter detailed role overview and summary of assignments..."
            className="flex w-full rounded-xl border border-[var(--color-border)] bg-white p-4 text-xs leading-relaxed text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition resize-none shadow-2xs"
          />
        </div>
      )}

      {/* ── TAB 2: RESPONSIBILITIES ──────────────────────────── */}
      {activeTab === 'resp' && (
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Key Roles & Deliverables Checklist
            </label>
            <button
              type="button"
              onClick={() => appendResp('')}
              className="text-xs font-bold text-[var(--color-primary)] flex items-center gap-1.5 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
            >
              <Plus className="h-4 w-4" /> Add Deliverable
            </button>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {respFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-gray-400 w-6 text-right shrink-0">
                  {index + 1}.
                </span>
                <input
                  {...register(`responsibilities.${index}`)}
                  placeholder="Enter key operational deliverable or target metric..."
                  className="flex h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => removeResp(index)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: TERMS & CONDITIONS ────────────────────────── */}
      {activeTab === 'terms' && (
        <div className="p-5 sm:p-6 space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {terms.map((term, index) => {
            const isExpanded = expandedTerm === term.id;
            return (
              <div key={term.id} className="border border-gray-200 rounded-xl overflow-hidden transition-all bg-gray-50/60">
                <div
                  onClick={() => setExpandedTerm(isExpanded ? null : term.id)}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-100"
                >
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-2.5">
                    <span className="text-[var(--color-primary)] font-mono font-bold">Clause #{term.id}</span>
                    <span>{term.title}</span>
                  </span>
                  <ChevronRight className={cn('h-4 w-4 text-gray-400 transition-transform', isExpanded && 'rotate-90')} />
                </div>

                {isExpanded && (
                  <div className="p-4 bg-white border-t border-gray-200 space-y-2 text-xs">
                    <textarea
                      rows={3}
                      {...register(`termsAndConditions.${index}.text`)}
                      defaultValue={term.text}
                      className="w-full p-3 border border-gray-200 rounded-xl text-xs leading-relaxed text-gray-800 focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none resize-none shadow-2xs"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
