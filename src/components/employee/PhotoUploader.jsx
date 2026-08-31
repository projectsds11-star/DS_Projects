import React, { useRef, useState } from 'react';
import { UploadCloud, X, RefreshCw, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

export default function PhotoUploader({ value, onChange, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState('');

  const validate = (file) => {
    if (!ACCEPTED.includes(file.type)) {
      return 'Only JPG, PNG, or WEBP images are allowed.';
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File size must be less than ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFile = (file) => {
    if (!file) return;
    const err = validate(file);
    if (err) {
      setLocalError(err);
      return;
    }
    setLocalError('');
    const preview = URL.createObjectURL(file);
    onChange({ file, preview });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleRemove = () => {
    if (value?.preview) URL.revokeObjectURL(value.preview);
    onChange(null);
    setLocalError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const displayError = error || localError;

  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start">
      {/* Preview or Upload Area */}
      <AnimatePresence mode="wait">
        {value?.preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative shrink-0"
          >
            <img
              src={value.preview}
              alt="Employee photo"
              className="w-28 h-28 rounded-xl object-cover border-2 border-[var(--color-primary)] shadow-sm"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600 transition-colors"
              aria-label="Remove photo"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              'w-28 h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all shrink-0',
              dragging
                ? 'border-[var(--color-primary)] bg-blue-50'
                : 'border-gray-300 bg-gray-50 hover:border-[var(--color-primary)] hover:bg-blue-50/40',
              displayError && 'border-[var(--color-error)]'
            )}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <User className="h-7 w-7 text-gray-300 mb-1" />
            <span className="text-xs text-gray-400 text-center px-2">Upload Photo</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions & Actions */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-gray-700">Candidate Photo</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          JPG, PNG or WEBP · Maximum {MAX_SIZE_MB}MB
          <br />Drag & drop or click the box to upload.
        </p>
        <div className="flex gap-2 flex-wrap mt-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary)] hover:underline transition"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            {value ? 'Replace Photo' : 'Browse Files'}
          </button>
          {value && (
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-500 transition"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
        {displayError && (
          <p className="text-xs text-[var(--color-error)]">{displayError}</p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
        aria-label="Upload candidate photo"
      />
    </div>
  );
}
