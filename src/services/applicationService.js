/**
 * src/services/applicationService.js
 * Frontend service for job applications submission and admin review.
 */
import { supabase, isSupabaseConfigured, STORAGE_BUCKETS } from './supabaseClient';
import { compressImageFile } from '../utils/imageCompression';

function getApiBase() {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }
  return import.meta.env.VITE_API_URL || '';
}

function adminAuthHeaders() {
  const token = typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('ds_admin_token') || '') : '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const applicationService = {
  /**
   * Upload candidate photo to Supabase storage with compression
   */
  async uploadPhoto(file) {
    if (!file) return '';

    try {
      // Compress if larger than 300KB
      let uploadTarget = file;
      if (file.size > 300 * 1024 && file.type.startsWith('image/')) {
        try {
          uploadTarget = await compressImageFile(file, { maxWidth: 800, maxHeight: 800, quality: 0.8 });
        } catch (compErr) {
          console.warn('Image compression skipped:', compErr);
        }
      }

      if (isSupabaseConfigured) {
        const ext = file.name?.split('.').pop() || 'jpg';
        const fileName = `applications/photo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

        const { error } = await supabase.storage
          .from(STORAGE_BUCKETS.EMPLOYEE_PHOTOS)
          .upload(fileName, uploadTarget, { upsert: true, contentType: file.type || 'image/jpeg' });

        if (!error) {
          const { data } = supabase.storage
            .from(STORAGE_BUCKETS.EMPLOYEE_PHOTOS)
            .getPublicUrl(fileName);
          return data?.publicUrl || '';
        }
      }
    } catch (err) {
      console.warn('Supabase storage upload failed, using Data URL fallback:', err);
    }

    // Fallback: Read as base64 Data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  },

  /**
   * Submit job application form (Public)
   */
  async submitApplication(formData) {
    const apiBase = getApiBase();
    const res = await fetch(`${apiBase}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Submission failed with status ${res.status}`);
    }
    return data;
  },

  /**
   * Fetch submitted application by ID or Application Number (Public / Receipt)
   */
  async getPublicApplication(idOrAppNo) {
    const apiBase = getApiBase();
    const res = await fetch(`${apiBase}/api/applications/public/${encodeURIComponent(idOrAppNo)}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Could not find application record');
    }
    return data.application;
  },

  /**
   * List all applications with optional status and search filters (Admin)
   */
  async listAdminApplications({ status = 'all', search = '' } = {}) {
    const apiBase = getApiBase();
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search && search.trim()) params.append('search', search.trim());

    const res = await fetch(`${apiBase}/api/admin/applications?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        ...adminAuthHeaders(),
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to load job applications');
    }
    return data.applications || [];
  },

  /**
   * Update application status and office use details (Admin)
   */
  async updateAdminApplication(id, updates) {
    const apiBase = getApiBase();
    const res = await fetch(`${apiBase}/api/admin/applications/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...adminAuthHeaders(),
      },
      body: JSON.stringify(updates),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update application');
    }
    return data.application;
  },

  /**
   * Delete application record (Admin)
   */
  async deleteAdminApplication(id) {
    const apiBase = getApiBase();
    const res = await fetch(`${apiBase}/api/admin/applications/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...adminAuthHeaders(),
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to delete application');
    }
    return data;
  },
};
