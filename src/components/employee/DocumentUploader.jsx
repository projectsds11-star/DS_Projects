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
        <p className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-[var(--color-error)] ml-1">*</span>}
        </p>
      )}

      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-3 p-3 border border-green-200 bg-green-50 rounded-lg"
          >
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0', fileInfo?.color || 'bg-gray-100 text-gray-500')}>
              {fileInfo?.label || 'FILE'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{value.name}</p>
              <p className="text-xs text-gray-400">{formatBytes(value.size)}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Check className="h-4 w-4 text-green-500" />
              {value.preview && (
                <a href={value.preview} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 text-gray-400 hover:text-[var(--color-primary)] rounded transition-colors"
                  title="Preview">
                  <Eye className="h-4 w-4" />
                </a>
              )}
              <button type="button" onClick={() => inputRef.current?.click()}
                className="p-1.5 text-gray-400 hover:text-[var(--color-primary)] rounded transition-colors" title="Replace">
                <UploadCloud className="h-4 w-4" />
              </button>
              <button type="button" onClick={handleRemove}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors" title="Remove">
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
              'flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed rounded-lg cursor-pointer transition-all text-center',
              dragging
                ? 'border-[var(--color-primary)] bg-blue-50'
                : 'border-gray-200 hover:border-[var(--color-primary)] hover:bg-blue-50/30',
              displayError && 'border-[var(--color-error)] bg-red-50/20'
            )}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', dragging ? 'bg-blue-100' : 'bg-gray-100')}>
              <UploadCloud className={cn('h-5 w-5', dragging ? 'text-[var(--color-primary)]' : 'text-gray-400')} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Drag & drop or <span className="text-[var(--color-primary)]">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{acceptedLabel} · Max {MAX_SIZE_MB}MB</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {displayError && (
        <p className="text-xs text-[var(--color-error)] flex items-center gap-1 mt-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
