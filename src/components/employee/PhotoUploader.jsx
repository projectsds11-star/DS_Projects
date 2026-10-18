import React, { useRef, useState } from 'react';
import { UploadCloud, X, Loader2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// ── Auto-compress using Canvas API ───────────────────────────────────────────
// Resizes image to max 800×800 px and compresses to JPEG at quality 0.82.
// Output is always under ~400 KB — safe for Vercel's 4.5 MB serverless limit.
function compressImage(file, { maxWidth = 800, maxHeight = 800, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Calculate new dimensions while keeping aspect ratio
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Compression failed'));
          // Return a File so FormData / multer treat it correctly
          const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        'image/jpeg',
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not load image'));
    };

    img.src = objectUrl;
  });
}

export default function PhotoUploader({ value, onChange, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState('');
  const [compressing, setCompressing] = useState(false);

  const validate = (file) => {
    if (!ACCEPTED.includes(file.type)) {
      return 'Only JPG, PNG, or WEBP images are allowed.';
    }
    return null; // No size check — we compress automatically
  };

  const handleFile = async (file) => {
    if (!file) return;
    const err = validate(file);
    if (err) {
      setLocalError(err);
      return;
    }
    setLocalError('');
    setCompressing(true);

    try {
      const compressed = await compressImage(file);
      const preview = URL.createObjectURL(compressed);
      onChange({ file: compressed, preview });
    } catch (e) {
      setLocalError('Could not process the image. Please try another file.');
    } finally {
      setCompressing(false);
    }
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
      {/* Preview / Upload Box / Compressing Spinner */}
      <AnimatePresence mode="wait">
        {compressing ? (
          <motion.div
            key="compressing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-28 h-28 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 flex flex-col items-center justify-center shrink-0 gap-1"
          >
            <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
            <span className="text-[10px] text-indigo-400 font-bold tracking-wide">Compressing…</span>
          </motion.div>
        ) : value?.preview ? (
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
              className="w-28 h-28 rounded-xl object-cover border-2 border-indigo-400 shadow-sm"
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
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/40',
              displayError && 'border-red-400 bg-red-50/50'
            )}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <User className="h-7 w-7 text-slate-300 mb-1" />
            <span className="text-xs text-slate-400 text-center px-2 font-bold tracking-wide uppercase">Upload</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions & Actions */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold text-slate-700">Candidate Photo</p>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          JPG, PNG or WEBP · Any size
          <br />Auto-compressed before upload.
          <br />Drag &amp; drop or click the box to upload.
        </p>
        <div className="flex gap-2 flex-wrap mt-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={compressing}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition disabled:opacity-50"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            {value ? 'Replace Photo' : 'Browse Files'}
          </button>
          {value && !compressing && (
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
          <p className="text-xs text-red-500 font-bold">{displayError}</p>
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
