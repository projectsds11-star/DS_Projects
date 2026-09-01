import React, { useRef } from 'react';
import { 
  FileText, 
  Upload, 
  FileCheck, 
  Sparkles, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';

export default function OfferDocumentSelectorCard({
  documentMode = 'generate', // 'generate' | 'upload'
  setDocumentMode,
  manualPdf = null,
  setManualPdf,
  selectedEmployee = null
}) {
  const fileInputRef = useRef(null);

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
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-slate-900">
          <FileText className="h-4 w-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Offer Letter Document Mode & Manual Upload
          </h3>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Select whether to auto-generate the official letterhead or upload a manual/signed offer letter for{' '}
          <span className="font-semibold text-slate-700">{selectedEmployee?.fullName || 'this candidate'}</span>.
        </p>
      </div>

      {/* Mode Selection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option 1: Auto-Generate Official Letterhead */}
        <div
          onClick={() => setDocumentMode('generate')}
          className={cn(
            'relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 text-left',
            documentMode === 'generate'
              ? 'border-blue-600 bg-blue-50/40 shadow-xs'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center font-bold',
                documentMode === 'generate' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              )}>
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Auto-Generate Letterhead</p>
                <p className="text-[10px] text-slate-500">Official DS PROJECTS A4 Template</p>
              </div>
            </div>
            {documentMode === 'generate' && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            Automatically compiles compensation structure, mandal jurisdiction, terms & conditions, and authorized seal into an A4 PDF.
          </p>

          <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-[10px] font-semibold text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            Live Preview Available in Step 3
          </div>
        </div>

        {/* Option 2: Upload Manual Offer Letter */}
        <div
          onClick={() => {
            setDocumentMode('upload');
            if (!manualPdf && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          className={cn(
            'relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 text-left',
            documentMode === 'upload'
              ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center font-bold',
                documentMode === 'upload' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              )}>
                <Upload className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Upload Manual Offer Letter</p>
                <p className="text-[10px] text-slate-500">Attach Custom / Signed PDF</p>
              </div>
            </div>
            {documentMode === 'upload' && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            Upload an existing scanned, signed, or customized offer letter document. This document will be attached to the candidate's onboarding email.
          </p>

          <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-[10px] font-semibold text-indigo-700">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            {manualPdf ? '1 File Attached' : 'Click to Browse File (.pdf, .doc)'}
          </div>
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

      {/* Manual Upload Dropzone / File Card Area (When upload mode is active) */}
      {documentMode === 'upload' && (
        <div className="pt-2 animate-in fade-in duration-200">
          {manualPdf ? (
            <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs text-slate-900 truncate">{manualPdf.name}</p>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Ready to Dispatch
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {(manualPdf.size / 1024).toFixed(1)} KB · Attached for Onboarding Email
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Change File
                </button>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 text-rose-600 hover:bg-rose-100/80 rounded-lg transition-colors cursor-pointer"
                  title="Remove File"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/20 hover:bg-indigo-50/50 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-slate-900 mb-1">
                Click to browse or drag & drop manual offer letter
              </p>
              <p className="text-[11px] text-slate-500">
                Supports PDF, DOC, DOCX files up to 15MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
