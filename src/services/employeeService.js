/**
 * src/services/employeeService.js
 * Employee service — reads via Supabase client, writes via Express backend.
 * Sensitive operations (create/update/delete/status) go through /api/admin/employees.
 */
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { AP_DISTRICT_MANDAL_MAP } from '../data/andhraPradeshMasterData';

// ── Backend API URL ───────────────────────────────────────────────────────────
// In dev, Vite proxies /api → http://localhost:5000
// In production (Vercel), /api resolves to the same-domain serverless function
const API_BASE = '/api/admin/employees';

function getAdminToken() {
  return sessionStorage.getItem('ds_admin_token') || '';
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getAdminToken()}`,
  };
}

// ── READ OPERATIONS (Supabase client — RLS protected) ────────────────────────

const EMPLOYEE_TEXT_FIELDS = [
  'name', 'address', 'phone', 'email', 'qualification',
  'course', 'university', 'year_of_passing',
  'aadhaar_number', 'pan_number', 'account_holder_name', 'bank_name', 'account_number', 'ifsc_code', 'branch_name',
  'reference_mobile', 'reference_person_name', 'reference_relationship',
  'state_id', 'district_id', 'mandal_id',
  'agency_id', 'agency_name',
];
const EMPLOYEE_FILE_FIELDS = ['photo', 'passbook', 'aadhaarDocument', 'panDocument'];
const SERVERLESS_FALLBACK_MAX_BYTES = 3.8 * 1024 * 1024;

function getFileExtension(file) {
  const namePart = (file?.name || '').split('.').pop()?.toLowerCase();
  if (namePart && namePart !== (file?.name || '').toLowerCase()) return namePart;
  const mimeMap = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
  };
  return mimeMap[file?.type] || 'bin';
}

export const employeeService = {
  /** Fetch all non-deleted employees */
  async getEmployees() {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map(mapRow);
    } catch {
      return [];
    }
  },

  /** Fetch single employee by employee_id (DS-001) */
  async getEmployeeById(employeeId) {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('employee_id', employeeId)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return mapRow(data);
  },

  /** Fetch single employee by UUID (for detail page) */
  async getEmployeeByUUID(uuid) {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', uuid)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;
    return mapRow(data);
  },

  /** Preview of next employee ID — UI preview dynamically synced with existing database records */
  async getNextEmployeeIdPreview() {
    if (!isSupabaseConfigured) return 'DS-001';
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('employee_id')
        .is('deleted_at', null);

      if (!error && data) {
        let maxNum = 0;
        data.forEach(row => {
          const match = (row.employee_id || '').match(/^DS-(\d+)$/i);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
          }
        });
        const nextNum = maxNum + 1;
        return `DS-${nextNum < 1000 ? String(nextNum).padStart(3, '0') : nextNum}`;
      }
    } catch {}

    // Fallback: peek_next_employee_id
    try {
      const { data, error } = await supabase.rpc('peek_next_employee_id');
      if (!error && data) return data;
    } catch {}
    return 'DS-001';
  },

  // ── WRITE OPERATIONS (Express backend) ──────────────────────────────────────

  /**
   * Safe JSON parse — returns an object even if the response body is not JSON.
   * Prevents "Unexpected token" crashes when the server returns a 413, 502,
   * nginx error page, or any other non-JSON body.
   */
  async _safeJson(res) {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      // Body was HTML / plain-text (e.g. "Request Entity Too Large")
      const status = res.status;
      if (status === 413) {
        return {
          success: false,
          message: 'Upload payload exceeded server limit (4.5 MB). Please re-select your files and try again.',
        };
      }
      if (status === 401) {
        return { success: false, message: 'Session expired. Please log in again.' };
      }
      if (status === 403) {
        return { success: false, message: 'Access denied. Admin privileges required.' };
      }
      return { success: false, message: text.slice(0, 200) || `Server error (${status})` };
    }
  },

  /**
   * Upload files directly to Supabase Storage via backend-issued signed upload URLs.
   * Bypasses Vercel's 4.5 MB serverless request body limit cleanly.
   */
  async _uploadFilesDirectly(formData, employeeId = null) {
    const fileEntries = EMPLOYEE_FILE_FIELDS
      .filter((field) => formData[field] instanceof File)
      .map((field) => [field, formData[field]]);

    if (fileEntries.length === 0) {
      return { uploadedPaths: {} };
    }

    const totalBytes = fileEntries.reduce((sum, [, file]) => sum + (file.size || 0), 0);
    const filesMeta = Object.fromEntries(
      fileEntries.map(([field, file]) => [
        field,
        {
          ext: getFileExtension(file),
          contentType: file.type || 'application/octet-stream',
        },
      ])
    );

    const prepRes = await fetch(`${API_BASE}/upload-urls`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: employeeId || undefined,
        files: filesMeta,
      }),
    });

    if (prepRes.status === 404 && totalBytes <= SERVERLESS_FALLBACK_MAX_BYTES) {
      return { useMultipartFallback: true };
    }

    const prepJson = await this._safeJson(prepRes);
    if (!prepRes.ok) {
      throw new Error(prepJson.message || 'Failed to prepare file uploads.');
    }

    const uploadedPaths = {};
    await Promise.all(
      fileEntries.map(async ([field, file]) => {
        const target = prepJson.uploads?.[field];
        if (!target?.path || !target?.bucket) {
          throw new Error(`Missing upload target for ${field}.`);
        }

        const storageBucket = supabase?.storage?.from(target.bucket);
        if (storageBucket && typeof storageBucket.uploadToSignedUrl === 'function' && target.token) {
          const { error } = await storageBucket.uploadToSignedUrl(target.path, target.token, file, {
            contentType: file.type || 'application/octet-stream',
            cacheControl: '3600',
          });
          if (error) {
            throw new Error(`Failed to upload ${field}: ${error.message}`);
          }
        } else if (target.signedUrl) {
          const putRes = await fetch(target.signedUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
              'x-upsert': 'true',
            },
            body: file,
          });
          if (!putRes.ok) {
            throw new Error(`Failed to upload ${field} (HTTP ${putRes.status}).`);
          }
        } else {
          throw new Error(`Storage client unavailable for ${field}.`);
        }

        uploadedPaths[field] = target.path;
      })
    );

    return { uploadedPaths };
  },

  async _submitEmployee(url, method, formData, employeeId, defaultError) {
    const uploadResult = await this._uploadFilesDirectly(formData, employeeId);

    let res;
    if (uploadResult.useMultipartFallback) {
      const body = new FormData();
      EMPLOYEE_TEXT_FIELDS.forEach((field) => {
        if (formData[field] != null) body.append(field, formData[field]);
      });
      EMPLOYEE_FILE_FIELDS.forEach((field) => {
        if (formData[field] instanceof File) body.append(field, formData[field]);
      });
      res = await fetch(url, { method, headers: authHeaders(), body });
    } else {
      const jsonPayload = {};
      EMPLOYEE_TEXT_FIELDS.forEach((field) => {
        if (formData[field] != null) jsonPayload[field] = formData[field];
      });
      if (uploadResult.uploadedPaths && Object.keys(uploadResult.uploadedPaths).length > 0) {
        jsonPayload.uploadedPaths = uploadResult.uploadedPaths;
      }
      res = await fetch(url, {
        method,
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonPayload),
      });
    }

    const json = await this._safeJson(res);
    if (!res.ok) {
      throw new Error(json.message || defaultError);
    }
    return json;
  },

  /**
   * Create a new employee.
   * Uploads files directly to Supabase Storage, then sends lightweight JSON to backend.
   */
  async createEmployee(formData) {
    return this._submitEmployee(API_BASE, 'POST', formData, null, 'Failed to create employee.');
  },

  /**
   * Update an existing employee.
   */
  async updateEmployee(employeeId, formData) {
    return this._submitEmployee(
      `${API_BASE}/${employeeId}`,
      'PUT',
      formData,
      employeeId,
      'Failed to update employee.'
    );
  },

  /**
   * Toggle employee status.
   */
  async updateStatus(employeeId, status) {
    const res = await fetch(`${API_BASE}/${employeeId}/status`, {
      method: 'PATCH',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const json = await this._safeJson(res);
    if (!res.ok) throw new Error(json.message || 'Failed to update status.');
    return json;
  },

  /**
   * Soft delete employee.
   */
  async deleteEmployee(employeeId) {
    const res = await fetch(`${API_BASE}/${employeeId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const json = await this._safeJson(res);
    if (!res.ok) throw new Error(json.message || 'Failed to delete employee.');
    return json;
  },

  /**
   * Get a signed (private) URL for an employee document.
   */
  async getSignedUrl(bucket, filePath) {
    const params = new URLSearchParams({ bucket, filePath });
    const res = await fetch(`${API_BASE}/signed-url?${params}`, {
      headers: authHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to load document.');
    return json.signedUrl;
  },

  /** Normalize Aadhaar (strip hyphens) before sending to API */
  normalizeAadhaar(formatted) {
    return (formatted || '').replace(/-/g, '');
  },
};

export function getEmployeePhotoUrl(path) {
  if (!path || typeof path !== 'string') return null;
  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  const publicUrl = supabase?.storage?.from('employee-photos')?.getPublicUrl(path)?.data?.publicUrl;
  if (publicUrl) return publicUrl;
  const baseUrl = (import.meta?.env?.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  return baseUrl ? `${baseUrl}/storage/v1/object/public/employee-photos/${path}` : null;
}

// ── Row mapper (DB → camelCase) ───────────────────────────────────────────────
function mapRow(e) {
  const photoUrl = getEmployeePhotoUrl(e.candidate_photo_path);
  return {
    id: e.id,
    employeeId: e.employee_id,
    name: e.name || e.full_name || '',
    fullName: e.name || e.full_name || '',
    address: e.address || '',
    phone: e.phone || '',
    email: e.email || '',
    photoPath: e.candidate_photo_path || null,
    candidate_photo_path: e.candidate_photo_path || null,
    photoUrl,
    photo_url: photoUrl,
    qualification: e.qualification || '',
    course: e.course || '',
    university: e.university || '',
    yearOfPassing: e.year_of_passing || '',
    aadhaar: e.aadhaar_number || '',
    aadhaarDocumentPath: e.aadhaar_document_path || null,
    pan: e.pan_number || '',
    panDocumentPath: e.pan_document_path || null,
    passbookPath: e.bank_passbook_path || null,
    accountHolderName: e.account_holder_name || '',
    bankName: e.bank_name || '',
    accountNumber: e.account_number || '',
    ifsc: e.ifsc_code || '',
    branchName: e.branch_name || '',
    referenceMobile: e.reference_mobile || '',
    referenceName: e.reference_person_name || '',
    relationship: e.reference_relationship || '',
    stateId: e.state_id || '',
    districtId: e.district_id || '',
    mandalId: e.mandal_id || '',
    district: e.district_id || '',
    mandal: e.mandal_id || '',
    agencyId: e.agency_id || '',
    agencyName: e.agency_name || '',
    agency_id: e.agency_id || '',
    agency_name: e.agency_name || '',
    status: e.status || 'active',
    createdAt: e.created_at,
    updatedAt: e.updated_at,
  };
}

// Export DISTRICT_MANDAL_MAP for form use
export const DISTRICT_MANDAL_MAP = AP_DISTRICT_MANDAL_MAP;
