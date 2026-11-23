/**
 * src/services/workReportService.js
 * Frontend service for Daily Field Work Excel Report submission & admin verification.
 */
import { supabase, isSupabaseConfigured, STORAGE_BUCKETS } from './supabaseClient';
import { downloadWorkSheetTemplate, parseWorkSheetFile } from '../utils/workSheetExcel';
import { liveDataService } from './liveDataService';

function getApiBase() {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }
  return import.meta.env.VITE_API_URL || '';
}

export const workReportService = {
  /**
   * Download the official Excel template (.xlsx) with exact 11 columns
   */
  downloadExcelTemplate() {
    downloadWorkSheetTemplate(true);
  },

  /**
   * Parse uploaded Excel (.xlsx, .xls) or CSV
   */
  async parseExcelFile(file) {
    return await parseWorkSheetFile(file);
  },

  /**
   * Upload completed Excel sheet to Supabase Storage
   */
  async uploadExcelFile(file, employeeId, dateStr) {
    if (!file) return '';

    if (isSupabaseConfigured) {
      try {
        const cleanEmp = (employeeId || 'staff').replace(/[^a-zA-Z0-9_-]/g, '_');
        const cleanDate = (dateStr || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
        const ext = file.name?.split('.').pop() || 'xlsx';
        const storagePath = `daily-reports/${cleanEmp}_${cleanDate}_${Date.now()}.${ext}`;

        const { error } = await supabase.storage
          .from(STORAGE_BUCKETS.EMPLOYEE_DOCUMENTS || 'employee-documents')
          .upload(storagePath, file, {
            upsert: true,
            contentType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });

        if (!error) {
          const { data: pUrl } = supabase.storage
            .from(STORAGE_BUCKETS.EMPLOYEE_DOCUMENTS || 'employee-documents')
            .getPublicUrl(storagePath);
          return pUrl?.publicUrl || '';
        } else {
          console.warn('Supabase storage upload error:', error.message);
        }
      } catch (e) {
        console.warn('Failed to upload daily report file to storage:', e);
      }
    }

    // Fallback: blob URL for local testing
    return URL.createObjectURL(file);
  },

  /**
   * Submit Daily Work Report
   * Calls /api/work-reports/submit which triggers notification email to Admin
   */
  async submitDailyWorkReport(payload) {
    const apiBase = getApiBase();

    // 1. Try backend API call (sends email to admin & stores in DB)
    let apiSuccess = false;
    let savedReport = null;

    try {
      const res = await fetch(`${apiBase}/api/work-reports/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          apiSuccess = true;
          savedReport = json.data;
        }
      }
    } catch (apiErr) {
      console.warn('Backend /api/work-reports/submit unavailable, falling back to client storage:', apiErr);
    }

    // 2. Client fallback / sync to local storage & Supabase client directly
    if (!savedReport) {
      const code = `DWR-${(payload.workDate || '').replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
      savedReport = {
        id: `dwr_${Date.now()}`,
        report_code: code,
        employee_id: payload.employeeId,
        employee_name: payload.employeeName,
        work_date: payload.workDate,
        district: payload.district || '',
        mandal: payload.mandal || '',
        total_enterprises: payload.totalEnterprises || 0,
        records: payload.records || [],
        summary_notes: payload.summaryNotes || '',
        file_url: payload.fileUrl || '',
        file_name: payload.fileName || 'DAILY_WORK_SHEET.xlsx',
        file_size: payload.fileSize || '',
        status: 'Submitted',
        created_at: new Date().toISOString(),
      };
    }

    // Save in local storage for instant offline resilience
    try {
      const existing = JSON.parse(localStorage.getItem('ds_daily_work_reports') || '[]');
      existing.unshift(savedReport);
      localStorage.setItem('ds_daily_work_reports', JSON.stringify(existing));
    } catch (e) {
      console.warn('Could not update localStorage for daily work reports:', e);
    }

    return { success: true, data: savedReport, apiSuccess };
  },

  /**
   * Admin verifies and accepts candidate's submitted daily Excel sheet.
   * Calls /api/work-reports/accept which triggers acceptance email to Candidate
   */
  async acceptDailyWorkReport(payload) {
    const apiBase = getApiBase();

    let apiSuccess = false;

    try {
      const res = await fetch(`${apiBase}/api/work-reports/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          apiSuccess = true;
        }
      }
    } catch (apiErr) {
      console.warn('Backend /api/work-reports/accept unavailable:', apiErr);
    }

    // Update local state in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('ds_daily_work_reports') || '[]');
      const updated = existing.map(item => {
        if (
          item.id === payload.reportId ||
          item.report_code === payload.reportCode ||
          (item.employee_id === payload.employeeId && item.work_date === payload.workDate)
        ) {
          return {
            ...item,
            status: 'Accepted',
            admin_remarks: payload.adminRemarks || 'Verified and approved.',
            verified_by: 'DS Projects Administration',
            verified_at: new Date().toISOString(),
          };
        }
        return item;
      });
      localStorage.setItem('ds_daily_work_reports', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not update localStorage accept status:', e);
    }

    return { success: true, apiSuccess };
  },

  /**
   * Fetch submitted daily work reports
   */
  async getDailyWorkReports(employeeId = null) {
    const apiBase = getApiBase();

    // 1. Try backend
    try {
      const url = employeeId
        ? `${apiBase}/api/work-reports?employeeId=${encodeURIComponent(employeeId)}`
        : `${apiBase}/api/work-reports`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (e) {
      // ignore
    }

    // 2. Try Supabase direct
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('daily_work_reports')
          .select('*')
          .order('created_at', { ascending: false });

        if (employeeId) {
          query = query.eq('employee_id', employeeId);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data) && data.length > 0) {
          return data;
        }
      } catch (err) {
        // ignore
      }
    }

    // 3. Fallback to localStorage
    try {
      const local = JSON.parse(localStorage.getItem('ds_daily_work_reports') || '[]');
      if (employeeId) {
        return local.filter(r => r.employee_id === employeeId);
      }
      return local;
    } catch (e) {
      return [];
    }
  },
};
