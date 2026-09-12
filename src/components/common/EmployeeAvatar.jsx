import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { employeeService } from '../../services/employeeService';

/**
 * Enterprise Employee Avatar Component
 * Automatically resolves and displays candidate profile photo using Supabase storage URLs,
 * with graceful fallback to candidate initials if no photo is uploaded.
 */
export default function EmployeeAvatar({
  emp,
  name,
  photoPath,
  size = 'md',
  shape = 'rounded',
  className = '',
}) {
  const [imgUrl, setImgUrl] = useState(null);
  const [imgError, setImgError] = useState(false);

  // Extract photo path and candidate name from props or emp object
  const rawPhoto = photoPath || emp?.photoUrl || emp?.photo_url || emp?.photoPath || emp?.candidate_photo_path || emp?.photo_path || emp?.photo || null;
  const displayName = name || emp?.fullName || emp?.name || emp?.full_name || 'Employee';
  const initial = displayName.trim().charAt(0).toUpperCase() || 'E';

  useEffect(() => {
    let isMounted = true;
    setImgError(false);

    if (rawPhoto) {
      // If photo is already a data URI, blob URL, or full https URL
      if (typeof rawPhoto === 'string' && (rawPhoto.startsWith('http') || rawPhoto.startsWith('blob:') || rawPhoto.startsWith('data:'))) {
        setImgUrl(rawPhoto);
      } else if (typeof rawPhoto === 'string') {
        // Try public storage URL first
        try {
          const { data } = supabase.storage.from('employee-photos').getPublicUrl(rawPhoto);
          if (data?.publicUrl) {
            setImgUrl(data.publicUrl);
          }
        } catch {
          // Fetch signed URL fallback
          employeeService.getSignedUrl('employee-photos', rawPhoto)
            .then(url => {
              if (isMounted && url) setImgUrl(url);
            })
            .catch(() => {
              if (isMounted) setImgError(true);
            });
        }
      }
    } else {
      setImgUrl(null);
    }

    return () => {
      isMounted = false;
    };
  }, [rawPhoto]);

  // Size dimensions
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-bold',
    lg: 'w-12 h-12 text-base font-bold',
    xl: 'w-16 h-16 text-lg font-bold',
    '2xl': 'w-20 h-20 text-xl font-bold',
  }[size] || 'w-10 h-10 text-sm font-bold';

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';

  if (imgUrl && !imgError) {
    return (
      <img
        src={imgUrl}
        alt={displayName}
        onError={() => setImgError(true)}
        className={`${sizeClasses} ${shapeClass} object-cover shrink-0 shadow-xs border border-slate-200 bg-slate-100 ${className}`}
      />
    );
  }

  // Fallback initial avatar with premium DS Projects gradient
  return (
    <div
      className={`${sizeClasses} ${shapeClass} flex items-center justify-center font-bold text-white shrink-0 shadow-xs bg-gradient-to-tr from-[#E63946] to-[#FF6B6B] select-none ${className}`}
    >
      {initial}
    </div>
  );
}
