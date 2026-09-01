import React, { useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  Calendar, 
  IndianRupee, 
  Briefcase, 
  Clock, 
  FileCheck, 
  Trash2, 
  Mail, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../utils/cn';

const INPUT_CLASS = 'flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition shadow-2xs placeholder:text-slate-400';

export default function SimpleStep2OfferDetails({
  register,
  watch,
  setValue,
  errors,
  documentMode = 'generate',
  setDocumentMode,
  manualPdf,
  setManualPdf,
  selectedEmployee
}) {
  const fileInputRef = useRef(null);
  const employeeName = watch('employeeName') || selectedEmployee?.fullName || 'Candidate';
  const employeeEmail = watch('email') || selectedEmployee?.email || 'email@example.com';
  const monthlySalary = watch('salary.basic') || 24000;
  const annualCtc = (Number(monthlySalary) || 0) * 12;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setManualPdf(file);
      setDocumentMode('upload');
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setManualPdf(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── 1. Document Mode Selector ──────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            1. Offer Letter Preparation Method
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Choose whether to auto-generate the official letterhead or upload your own signed PDF.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Mode 1: Auto-Generate */}
          <div
            onClick={() => setDocumentMode('generate')}
            className={cn(
              'p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3',
              documentMode === 'generate'
                ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0',
              documentMode === 'generate' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
            )}>
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-slate-900">Auto-Generate Letterhead</p>
              <p className="text-[11px] text-slate-500">Official DS PROJECTS A4 Template</p>
            </div>
            {documentMode === 'generate' && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                ✓
              </span>
            )}
          </div>

          {/* Mode 2: Upload Manual PDF */}
          <div
            onClick={() => {
              setDocumentMode('upload');
              if (!manualPdf && fileInputRef.current) fileInputRef.current.click();
            }}
            className={cn(
              'p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3',
              documentMode === 'upload'
                ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0',
              documentMode === 'upload' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
            )}>
              <Upload className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-slate-900">Upload Manual Offer Letter</p>
              <p className="text-[11px] text-slate-500">Attach Custom / Signed PDF</p>
            </div>
            {documentMode === 'upload' && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                ✓
              </span>
            )}
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Upload Dropzone / File Badge when Upload is Active */}
        {documentMode === 'upload' && (
          <div className="pt-2">
            {manualPdf ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 truncate">{manualPdf.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {(manualPdf.size / 1024).toFixed(1)} KB · Ready to dispatch with Onboarding Email
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/30 hover:bg-indigo-50/60 rounded-xl p-5 text-center cursor-pointer transition-all duration-200"
              >
                <Upload className="h-6 w-6 text-indigo-600 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-900">Click to select or drop manual offer letter PDF</p>
                <p className="text-[11px] text-slate-400 mt-0.5">PDF or Word document (Max 15MB)</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 2. Simple Terms & Compensation Form ─────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-emerald-600" />
            2. Appointment Terms & Monthly Compensation
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Specify joining date and monthly remuneration for {employeeName}.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Joining Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Official Joining Date *
            </label>
            <div className="relative">
              <input
                type="date"
                {...register('joiningDate')}
                className={cn(INPUT_CLASS, errors?.joiningDate && 'border-rose-500')}
              />
            </div>
            {errors?.joiningDate && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.joiningDate.message}</p>
            )}
          </div>

          {/* Monthly Gross Remuneration */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Monthly Remuneration / Salary (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₹</span>
              <input
                type="number"
                placeholder="24000"
                {...register('salary.basic', { valueAsNumber: true })}
                className={cn(INPUT_CLASS, 'pl-8 font-semibold text-slate-900')}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              Annual CTC: <span className="font-bold text-emerald-700">₹{(Number(monthlySalary) * 12 || 0).toLocaleString('en-IN')} / year</span>
            </p>
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Employment Type
            </label>
            <select {...register('employmentType')} className={INPUT_CLASS}>
              <option value="Full Time">Full Time Permanent</option>
              <option value="Contract">Contractual (1 Year)</option>
              <option value="Probationary">Probationary (3 Months)</option>
            </select>
          </div>

          {/* Probation Period */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Probation Period
            </label>
            <select {...register('probation')} className={INPUT_CLASS}>
              <option value="3 Months">3 Months</option>
              <option value="6 Months">6 Months</option>
              <option value="Direct Confirmation">Direct Confirmation (No Probation)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 3. Onboarding Dispatch & Portal Access Summary ───── */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50 rounded-2xl border border-blue-200/80 p-5 shadow-xs flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <Mail className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Automated Onboarding Email & Credentials (Email 2)
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            When dispatched in Step 3, <strong className="text-slate-900">{employeeName}</strong> will automatically receive the appointment confirmation at <span className="font-mono font-semibold text-blue-700">{employeeEmail}</span> with their <strong>Official CTC breakdown</strong> and <strong>Employee Portal Login Credentials</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
