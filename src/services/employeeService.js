// Employee Service — API-ready architecture
// Connect each function to Node.js + Express + Supabase when backend is ready

// The mock counter represents the LAST used ID number.
// 0 means no employees yet → next ID = DS-001
let _lastId = 0;

/** Zero-pad to at least 3 digits: 1→"001", 99→"099", 100→"100", 1000→"1000" */
function formatId(n) {
  return n < 1000 ? String(n).padStart(3, '0') : String(n);
}

export const employeeService = {
  /**
   * Returns the next Employee ID WITHOUT consuming it.
   * The ID is only reserved when createEmployee() or saveEmployeeDraft() is called.
   * TODO: GET /api/employees/next-id  (backend returns next available ID)
   */
  async getNextEmployeeId() {
    return `DS-${formatId(_lastId + 1)}`;
  },

  /** Create a fully validated employee record — reserves the ID. */
  async createEmployee(payload) {
    // TODO: POST /api/employees
    await _delay(1500);
    _lastId++; // only increment when actually persisting
    const employeeId = `DS-${formatId(_lastId)}`;
    return { success: true, data: { employeeId, ...payload } };
  },

  /** Save an incomplete employee as Draft. */
  async saveEmployeeDraft(payload) {
    // TODO: POST /api/employees/draft
    await _delay(800);
    return { success: true, data: { ...payload, status: 'Draft' } };
  },

  /** Upload candidate photo to Supabase Storage. */
  async uploadEmployeePhoto(file) {
    // TODO: POST /api/employees/upload/photo
    await _delay(600);
    return { success: true, url: URL.createObjectURL(file), path: `photos/${file.name}` };
  },

  /** Upload any employee document to Supabase Storage. */
  async uploadEmployeeDocument(file, type) {
    // TODO: POST /api/employees/upload/document
    await _delay(700);
    return { success: true, url: URL.createObjectURL(file), type, path: `documents/${type}/${file.name}` };
  },

  /** Check if an email is already registered. */
  async checkEmailAvailability(email) {
    // TODO: GET /api/employees/check?field=email&value=...
    await _delay(400);
    return { available: true };
  },

  /** Check if a phone number is already registered. */
  async checkPhoneAvailability(phone) {
    // TODO: GET /api/employees/check?field=phone&value=...
    await _delay(400);
    return { available: true };
  },

  /**
   * Generate employee username from full name + employee ID.
   * rahulkumar127@dsprojects
   */
  generateUsername(fullName, employeeId) {
    const number = employeeId.replace('DS-', '');
    const normalized = (fullName || '')
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z]/g, '');
    return `${normalized}${number}@dsprojects`;
  },

  /** Strip Aadhaar hyphens for backend storage. */
  normalizeAadhaar(formatted) {
    return formatted.replace(/-/g, '');
  },
};

function _delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Andhra Pradesh 28 Districts & Mandals Master Data ---
import { AP_DISTRICT_MANDAL_MAP } from '../data/andhraPradeshMasterData';
export const DISTRICT_MANDAL_MAP = AP_DISTRICT_MANDAL_MAP;
