import React, { useState } from 'react';
import { 
  Mail, 
  Paperclip, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Sparkles, 
  Trash2, 
  Eye, 
  FileCheck 
} from 'lucide-react';
import { cn } from '../../utils/cn';

const INPUT_CLASS = 'flex h-11 w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition shadow-2xs';

export default function EmailAndDocumentCard({
  register,
  watch,
  manualPdf,
  setManualPdf,
  documentMode = 'generate', // 'generate' | 'upload'
  setDocumentMode,
  selectedEmployee,
}) {
  const employeeName = watch('employeeName') || selectedEmployee?.fullName || 'Candidate';
  const email = watch('email') || selectedEmployee?.email || 'candidate@example.com';

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setManualPdf(file);
      setDocumentMode('upload');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-navy)] flex items-center gap-2">
            <Mail className="h-4 w-4 text-[var(--color-primary)]" />
            Offer Document Mode & Email Dispatch Configuration
          </span>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Choose whether to auto-generate the official letterhead PDF or upload an external contract.
          </p>
        </div>

        {/* Generated vs Uploaded Switch */}
        <div className="flex bg-gray-100 p-1 rounded-xl text-xs self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setDocumentMode('generate')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
              documentMode === 'generate' ? 'bg-white text-[var(--color-primary)] shadow-xs' : 'text-gray-500 hover:text-gray-800'
            )}
          >
            Auto-Generate PDF
          </button>
          <button
            type="button"
            onClick={() => setDocumentMode('upload')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
              documentMode === 'upload' ? 'bg-white text-[var(--color-primary)] shadow-xs' : 'text-gray-500 hover:text-gray-800'
            )}
          >
            Upload Custom PDF
          </button>
        </div>
      </div>

      {/* Document Status Banner */}
      {documentMode === 'generate' ? (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-blue-950 font-bold">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center">
              <FileCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--color-navy)]">Official DS PROJECTS A4 Letterhead Document</p>
              <p className="text-[10px] text-gray-500 font-normal">Dynamic render with authorized seal & signature block</p>
            </div>
          </div>
          <span className="text-[11px] text-blue-800 bg-blue-100 px-3 py-1 rounded-full font-bold">
            Auto-Compiled PDF
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {manualPdf ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-bold text-gray-900">{manualPdf.name}</p>
                  <p className="text-[10px] text-gray-500 font-mono">{(manualPdf.size / 1024).toFixed(1)} KB · Ready to dispatch</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setManualPdf(null)}
                className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                title="Remove File"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition text-center">
              <Upload className="h-7 w-7 text-gray-400 mb-2" />
              <p className="text-xs font-bold text-gray-800">Upload External Offer Letter PDF</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Drag and drop or click to browse (up to 10MB)</p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}

      {/* Email Subject & Body Form */}
      <div className="space-y-4 pt-2 text-xs">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
              Email Subject Line *
            </label>
            <span className="text-[11px] text-gray-400 font-mono">Delivery to: {email}</span>
          </div>
          <input
            type="text"
            {...register('emailSubject')}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Email Welcome Message Body *
          </label>
          <textarea
            rows={5}
            {...register('emailBody')}
            className={cn(INPUT_CLASS, 'h-auto py-3 leading-relaxed resize-none')}
          />
        </div>

        {/* Attachment summary checklist */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
            Dispatched Email Package Includes:
          </span>
          <div className="flex flex-wrap gap-2.5 text-xs">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-xs font-medium">
              <Paperclip className="h-3.5 w-3.5 text-gray-400" />
              Offer_Letter_{employeeName.replace(/\s+/g, '_')}.pdf
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-xs font-medium">
              <Paperclip className="h-3.5 w-3.5 text-gray-400" />
              Job_Schedule_Terms.pdf
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-[var(--color-primary)] font-bold text-xs">
              <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
              Single-Use Account Activation Link
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
