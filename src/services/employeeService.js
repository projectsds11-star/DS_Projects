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
  return localStorage.getItem('ds_admin_token') || '';
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getAdminToken()}`,
  };
}

// ── READ OPERATIONS (Supabase client — RLS protected) ────────────────────────

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

  /** Preview of next employee ID — UI only, NOT used for actual creation */
  async getNextEmployeeIdPreview() {
    if (!isSupabaseConfigured) return 'DS-001';
    try {
      const { data, error } = await supabase.rpc('peek_next_employee_id');
      if (!error && data) return data;
    } catch {}
    // Fallback: count based
    try {
      const { count } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);
      const n = (count || 0) + 1;
      return `DS-${n < 1000 ? String(n).padStart(3, '0') : n}`;
    } catch {}
    return 'DS-???';
  },

  // ── WRITE OPERATIONS (Express backend) ──────────────────────────────────────

  /**
   * Create a new employee.
   * Sends multipart/form-data with files to backend.
   * Backend handles: atomic ID, file upload, DB insert, welcome email.
   */
  async createEmployee(formData) {
    // formData: plain JS object with files as File instances
    const body = new FormData();

    // Text fields
    const textFields = [
      'name', 'address', 'phone', 'email', 'qualification',
      'course', 'university', 'year_of_passing',
      'aadhaar_number', 'pan_number', 'account_holder_name', 'bank_name', 'account_number', 'ifsc_code', 'branch_name',
      'reference_mobile', 'reference_person_name', 'reference_relationship',
      'state_id', 'district_id', 'mandal_id',
    ];
    textFields.forEach(field => {
      if (formData[field] != null) body.append(field, formData[field]);
    });

    // Files
    if (formData.photo instanceof File) body.append('photo', formData.photo);
    if (formData.passbook instanceof File) body.append('passbook', formData.passbook);
    if (formData.aadhaarDocument instanceof File) body.append('aadhaarDocument', formData.aadhaarDocument);
    if (formData.panDocument instanceof File) body.append('panDocument', formData.panDocument);

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: authHeaders(),
      body,
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to create employee.');
    }
    return json;
  },

  /**
   * Update an existing employee.
   */
  async updateEmployee(employeeId, formData) {
    const body = new FormData();
    const textFields = [
      'name', 'address', 'phone', 'email', 'qualification',
      'course', 'university', 'year_of_passing',
      'aadhaar_number', 'pan_number', 'account_holder_name', 'bank_name', 'account_number', 'ifsc_code', 'branch_name',
      'reference_mobile', 'reference_person_name', 'reference_relationship',
      'state_id', 'district_id', 'mandal_id',
    ];
    textFields.forEach(field => {
      if (formData[field] != null) body.append(field, formData[field]);
    });
    if (formData.photo instanceof File) body.append('photo', formData.photo);
    if (formData.passbook instanceof File) body.append('passbook', formData.passbook);
    if (formData.aadhaarDocument instanceof File) body.append('aadhaarDocument', formData.aadhaarDocument);
    if (formData.panDocument instanceof File) body.append('panDocument', formData.panDocument);

    const res = await fetch(`${API_BASE}/${employeeId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body,
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update employee.');
    return json;
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
    const json = await res.json();
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
    const json = await res.json();
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

// ── Row mapper (DB → camelCase) ───────────────────────────────────────────────
function mapRow(e) {
  return {
    id: e.id,
    employeeId: e.employee_id,
    name: e.name || e.full_name || '',
    address: e.address || '',
    phone: e.phone || '',
    email: e.email || '',
    photoPath: e.candidate_photo_path || null,
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
    status: e.status || 'active',
    createdAt: e.created_at,
    updatedAt: e.updated_at,
  };
}

// Export DISTRICT_MANDAL_MAP for form use
export const DISTRICT_MANDAL_MAP = AP_DISTRICT_MANDAL_MAP;
