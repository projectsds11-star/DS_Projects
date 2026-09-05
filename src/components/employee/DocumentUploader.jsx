import React, { useRef, useState } from 'react';
import { UploadCloud, X, FileText, Eye, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const DEFAULT_ACCEPTED = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const DEFAULT_ACCEPTED_LABEL = 'PDF, JPG, PNG';
const MAX_SIZE_MB = 5;

const FILE_ICONS = {
  'application/pdf': { label: 'PDF', color: 'bg-red-100 text-red-600' },
  'image/jpeg': { label: 'IMG', color: 'bg-blue-100 text-blue-600' },
  'image/jpg': { label: 'IMG', color: 'bg-blue-100 text-blue-600' },
  'image/png': { label: 'IMG', color: 'bg-blue-100 text-blue-600' },
};

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function DocumentUploader({
  label,
  value,
  onChange,
  error,
  accepted = DEFAULT_ACCEPTED,
  acceptedLabel = DEFAULT_ACCEPTED_LABEL,
  required = false,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState('');

  const validate = (file) => {
    if (!accepted.includes(file.type)) {
      return `Unsupported file type. Please upload ${acceptedLabel}.`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File must be less than ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFile = (file) => {
    if (!file) return;
    const err = validate(file);
    if (err) { setLocalError(err); return; }
    setLocalError('');
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    onChange({ file, preview, name: file.name, size: file.size, type: file.type });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleRemove = () => {
    if (value?.preview) URL.revokeObjectURL(value.preview);
    onChange(null);
    setLocalError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const fileInfo = value ? FILE_ICONS[value.type] : null;
  const displayError = error || localError;

  return (
    <div className="space-y-1.5">
      {label && (
        <p className="text-sm font-bold text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1 font-black">*</span>}
        </p>
      )}

      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-3 p-3 border border-emerald-200 bg-emerald-50 rounded-xl"
          >
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 shadow-sm', fileInfo?.color || 'bg-slate-100 text-slate-500')}>
              {fileInfo?.label || 'FILE'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{value.name}</p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mt-0.5">{formatBytes(value.size)}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Check className="h-5 w-5 text-emerald-500 mr-2" />
              {value.preview && (
                <a href={value.preview} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                  title="Preview">
                  <Eye className="h-4 w-4" />
                </a>
              )}
              <button type="button" onClick={() => inputRef.current?.click()}
                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded transition-colors" title="Replace">
                <UploadCloud className="h-4 w-4" />
              </button>
              <button type="button" onClick={handleRemove}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded transition-colors" title="Remove">
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              'flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all text-center',
              dragging
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30',
              displayError && 'border-red-400 bg-red-50/20'
            )}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div className={cn('w-12 h-12 rounded-full flex items-center justify-center shadow-sm', dragging ? 'bg-indigo-100' : 'bg-slate-100')}>
              <UploadCloud className={cn('h-6 w-6', dragging ? 'text-indigo-600' : 'text-slate-400')} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-600">
                Drag & drop or <span className="text-indigo-600 hover:underline">browse</span>
              </p>
              <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">{acceptedLabel} · Max {MAX_SIZE_MB}MB</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {displayError && (
        <p className="text-xs font-bold text-red-500 flex items-center gap-1.5 mt-1.5">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {displayError}
        </p>
      )}

      <input ref={inputRef} type="file" accept={accepted.join(',')} className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])} aria-label={`Upload ${label || 'document'}`} />
    </div>
  );
}
