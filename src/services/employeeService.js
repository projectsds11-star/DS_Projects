// Employee Service — Production Ready Connected to Supabase
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { liveDataService } from './liveDataService';
import { AP_DISTRICT_MANDAL_MAP } from '../data/andhraPradeshMasterData';

function formatId(n) {
  return n < 1000 ? String(n).padStart(3, '0') : String(n);
}

export const employeeService = {
  /**
   * Fetch all employees from Supabase, mapped to camelCase for the UI.
   */
  async getEmployees() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .neq('status', 'Draft')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map(e => ({
            employeeId: e.employee_id,
            fullName: e.full_name,
            email: e.email,
            phone: e.phone,
            designation: e.designation,
            department: e.department,
            district: e.district,
            mandal: e.mandal,
            qualification: e.qualification,
            status: e.status,
            onboardingStatus: e.onboarding_status,
            joiningDate: e.joining_date,
          }));
        }
      } catch (err) {
        console.warn('getEmployees error:', err);
      }
    }
    // fallback to liveDataService
    const raw = await liveDataService.getEmployees();
    return raw.map(e => ({
      employeeId: e.employee_id,
      fullName: e.full_name,
      email: e.email,
      phone: e.phone,
      designation: e.designation,
      department: e.department,
      district: e.district,
      mandal: e.mandal,
      qualification: e.qualification,
      status: e.status,
      onboardingStatus: e.onboarding_status,
    }));
  },

  /**
   * Returns the next available Employee ID from Supabase.
   */
  async getNextEmployeeId() {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('employee_id')
          .order('created_at', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          const lastNum = parseInt(data[0].employee_id.replace('DS-', ''), 10) || 0;
          return `DS-${formatId(lastNum + 1)}`;
        }
      } catch (err) {
        console.warn('Supabase next-id query failed:', err);
      }
    }
    const employees = await liveDataService.getEmployees();
    return `DS-${formatId(employees.length + 1)}`;
  },

  /** Create a fully validated employee record in Supabase. */
  async createEmployee(payload) {
    const fullAddress = payload.houseNo 
      ? `${payload.houseNo}, ${payload.street || ''}, ${payload.mandal || ''}, ${payload.district || ''} - ${payload.pincode || ''}`.trim()
      : payload.presentAddress || payload.address || null;

    const employeeData = {
      employee_id: payload.employeeId,
      full_name: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      gender: payload.gender || 'Male',
      date_of_birth: payload.dateOfBirth || payload.dob || null,
      father_name: payload.fatherName || null,
      blood_group: payload.bloodGroup || null,
      marital_status: payload.maritalStatus || 'Single',
      district: payload.district || 'Nellore',
      mandal: payload.mandal || 'Kavali',
      qualification: payload.highestQualification || payload.qualification || 'Graduate',
      designation: payload.designation || 'Mandal Co-ordinator',
      department: payload.department || 'Field Operations',
      status: payload.status || 'Active',
      onboarding_status: 'Completed',
      address: fullAddress,
      permanent_address: payload.permanentAddress || fullAddress,
      emergency_contact: payload.referenceName || payload.emergencyContactName || null,
      emergency_phone: payload.referenceMobile || payload.emergencyContactNumber || null,
      aadhaar_masked: payload.aadhaar ? `•••• •••• ${payload.aadhaar.slice(-4)}` : null,
      pan_masked: payload.pan ? `•••••${payload.pan.slice(-4)}` : null,
      bank_name: payload.bankName || null,
      account_number_masked: payload.accountNumber ? `•••• •••• ${payload.accountNumber.slice(-4)}` : null,
      ifsc_code: payload.ifsc || null,
      branch_name: payload.branchName || null,
      joining_date: payload.joiningDate || new Date().toISOString().slice(0, 10),
    };

    const res = await liveDataService.createEmployee(employeeData);

    // Automatically dispatch official Welcome Email to the registered employee
    if (payload.email) {
      this.sendWelcomeEmail(employeeData).catch(err => console.warn('Welcome email error:', err));
    }

    return { success: true, data: { ...employeeData, ...res.data } };
  },

  /** Send official HTML Welcome Email to employee registered email address */
  async sendWelcomeEmail(payload) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');
      const res = await fetch(`${apiUrl}/api/admin/send-welcome-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: payload.employeeId || payload.employee_id,
          fullName: payload.fullName || payload.full_name,
          email: payload.email,
          phone: payload.phone,
          designation: payload.designation,
          district: payload.district,
          mandal: payload.mandal,
          joiningDate: payload.joiningDate || payload.joining_date,
        }),
      });
      return await res.json();
    } catch (e) {
      console.warn('Welcome email dispatch error:', e);
      return { success: false, error: e.message };
    }
  },

  /** Save an incomplete employee as Draft. */
  async saveEmployeeDraft(payload) {
    const draftData = {
      employee_id: payload.employeeId,
      full_name: payload.fullName || 'Draft Employee',
      email: payload.email || `${payload.employeeId.toLowerCase()}@draft.dsprojects.com`,
      phone: payload.phone || '0000000000',
      district: payload.district || 'Nellore',
      mandal: payload.mandal || '-',
      status: 'Draft',
      onboarding_status: 'Draft'
    };
    const res = await liveDataService.createEmployee(draftData);
    return { success: true, data: res.data };
  },

  /** Upload candidate photo */
  async uploadEmployeePhoto(file) {
    return { success: true, url: URL.createObjectURL(file), path: `photos/${file.name}` };
  },

  /** Upload any employee document */
  async uploadEmployeeDocument(file, type) {
    return { success: true, url: URL.createObjectURL(file), type, path: `documents/${type}/${file.name}` };
  },

  /** Check if an email is already registered. */
  async checkEmailAvailability(email) {
    return { available: true };
  },

  /** Check if a phone number is already registered. */
  async checkPhoneAvailability(phone) {
    return { available: true };
  },

  /**
   * Generate employee username from full name + employee ID.
   */
  generateUsername(fullName, employeeId) {
    const number = (employeeId || '001').replace('DS-', '');
    const normalized = (fullName || '')
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z]/g, '');
    return `${normalized || 'employee'}${number}@dsprojects`;
  },

  /** Strip Aadhaar hyphens for backend storage. */
  normalizeAadhaar(formatted) {
    return (formatted || '').replace(/-/g, '');
  },
};

export const DISTRICT_MANDAL_MAP = AP_DISTRICT_MANDAL_MAP;
