// Onboarding & Offer Service — Clean Live Architecture (No Dummy Data)
// Enterprise HRMS Pipeline for DS PROJECTS connected to Supabase

import { MASTER_TEMPLATES, interpolateVariables, formatINR } from './templateService';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { liveDataService } from './liveDataService';

// In-memory state initialized empty (zero dummy records)
let _employees = [];
let _offers = [];
let _emailLogs = [];

function _delay(ms = 200) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const onboardingService = {
  /** Get overview metrics for Onboarding KPI cards from live data */
  async getKPIs() {
    await _delay(100);
    const empList = await liveDataService.getEmployees();
    const offerList = await offerService.getOffers();

    const total = empList.length;
    const pending = empList.filter(e => e.onboarding_status === 'Pending Offer' || e.status === 'Onboarding').length;
    const drafted = offerList.filter(o => o.status === 'Offer Draft').length;
    const sent = offerList.filter(o => o.status === 'Offer Sent').length;
    const accepted = offerList.filter(o => o.status === 'Offer Accepted').length;
    const completed = empList.filter(e => e.onboarding_status === 'Onboarding Completed' || e.onboarding_status === 'Completed').length;
    const failed = 0;

    return {
      total,
      pending,
      drafted,
      sent,
      accepted,
      completed,
      failed,
    };
  },

  /** Get all employees who are pending an offer */
  async getPendingEmployees(search = '', district = '') {
    const list = await liveDataService.getEmployees();
    return list.filter(e => {
      const name = e.full_name || e.fullName || '';
      const empId = e.employee_id || e.employeeId || '';
      const email = e.email || '';
      const matchSearch =
        !search ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        empId.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase());
      const matchDistrict = !district || e.district === district;
      const isPending = e.onboarding_status === 'Pending Offer' || e.status === 'Draft' || e.status === 'Onboarding';
      return matchSearch && matchDistrict && isPending;
    });
  },

  /** Get single employee by ID or employeeId */
  async getEmployeeById(idOrEmpId) {
    const list = await liveDataService.getEmployees();
    return list.find(e => e.id === idOrEmpId || e.employee_id === idOrEmpId || e.employeeId === idOrEmpId) || null;
  },

  /** Get all employees */
  async getAllEmployees() {
    const list = await liveDataService.getEmployees();
    return list.map(e => ({
      id: e.id || e.employee_id,
      employeeId: e.employee_id || e.employeeId,
      fullName: e.full_name || e.fullName,
      email: e.email,
      phone: e.phone,
      gender: e.gender || 'Male',
      district: e.district,
      mandal: e.mandal,
      qualification: e.qualification || 'Graduate',
      status: e.status,
      onboardingStatus: e.onboarding_status || 'Pending Offer',
      hasOffer: !!e.hasOffer
    }));
  },

  /** Check if employee already has an active offer */
  async checkExistingOffer(employeeId) {
    const offers = await offerService.getOffers();
    const existing = offers.find(o => (o.employee_id === employeeId || o.employeeId === employeeId) && o.status !== 'Offer Rejected');
    return existing || null;
  },

  /** Get full email logs audit trail */
  async getEmailLogs() {
    return [..._emailLogs];
  },

  /** Get dynamic activity timeline for an employee's onboarding lifecycle */
  async getTimeline(employeeId) {
    const emp = await this.getEmployeeById(employeeId);
    const offer = await this.checkExistingOffer(employeeId);

    return [
      {
        title: 'Employee Profile Registered',
        date: emp?.created_at ? new Date(emp.created_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        completed: !!emp,
        description: `Employee profile recorded with ID ${employeeId}.`,
      },
      {
        title: 'Job Position & Location Allocated',
        date: offer?.created_at ? new Date(offer.created_at).toISOString().slice(0, 10) : null,
        completed: !!offer,
        description: offer ? `Assigned ${offer.position} at ${offer.district}, ${offer.mandal}.` : 'Pending role allocation.',
      },
      {
        title: 'Offer Letter Generated',
        date: offer?.created_at ? new Date(offer.created_at).toISOString().slice(0, 10) : null,
        completed: !!offer,
        description: offer ? `Offer document ${offer.offer_number || offer.offerNumber} created.` : 'Pending generation.',
      },
      {
        title: 'Offer Sent via Email',
        date: offer?.sent_at || null,
        completed: offer?.status === 'Offer Sent' || offer?.status === 'Offer Accepted' || offer?.status === 'Onboarding Completed',
        description: offer?.sent_at ? `Dispatched to ${offer.email}.` : 'Waiting for HR dispatch.',
      },
      {
        title: 'Offer Accepted & Account Active',
        date: emp?.status === 'Active' ? new Date().toISOString().slice(0, 10) : null,
        completed: emp?.status === 'Active',
        description: 'Employee active in system.',
      }
    ];
  },
};

export const offerService = {
  /** Get all offer letters with search & filter */
  async getOffers(filters = {}) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('job_offers').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          _offers = data;
        }
      } catch (err) {
        console.warn('Supabase getOffers error:', err);
      }
    }

    const { search = '', position = '', district = '', status = '' } = filters;

    return _offers.filter(o => {
      const empName = o.employee_name || o.employeeName || '';
      const empId = o.employee_id || o.employeeId || '';
      const offNum = o.offer_number || o.offerNumber || '';
      const email = o.email || '';

      const matchSearch =
        !search ||
        empName.toLowerCase().includes(search.toLowerCase()) ||
        empId.toLowerCase().includes(search.toLowerCase()) ||
        offNum.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase());

      const matchPosition = !position || o.position === position;
      const matchDistrict = !district || o.district === district;
      const matchStatus = !status || o.status === status;

      return matchSearch && matchPosition && matchDistrict && matchStatus;
    });
  },

  /** Get single offer by offerId */
  async getOfferById(offerId) {
    const list = await this.getOffers();
    return list.find(o => o.id === offerId || o.offer_number === offerId || o.offerNumber === offerId) || null;
  },

  /** Create and dispatch a new offer letter */
  async createOffer(payload) {
    const offerNum = `DS/OFF/${new Date().getFullYear()}/${String(_offers.length + 1).padStart(3, '0')}`;
    const generatedPassword = `DS@${(payload.employeeId || 'DS001').replace(/[^a-zA-Z0-9]/g, '')}!2026`;
    
    const newOffer = {
      offer_number: offerNum,
      employee_id: payload.employeeId,
      employee_name: payload.employeeName,
      email: payload.email,
      phone: payload.phone,
      position: payload.position,
      department: payload.department || 'Field Operations',
      district: payload.district,
      mandal: payload.mandal,
      employment_type: payload.employmentType || 'Full Time',
      work_location: payload.workLocation || 'Field',
      joining_date: payload.joiningDate,
      reporting_manager: payload.reportingManager,
      probation: payload.probation || '3 Months',
      notice_period: payload.noticePeriod || '30 Days',
      basic_salary: payload.salary?.basic || 16000,
      travel_allowance: payload.salary?.travel || 3000,
      incentive: payload.salary?.incentive || 3500,
      other_allowance: payload.salary?.other || 1500,
      monthly_total: payload.salary?.monthlyTotal || 24000,
      annual_ctc: payload.salary?.annualCtc || 288000,
      status: payload.action === 'send' ? 'Offer Sent' : 'Offer Draft',
      sent_at: payload.action === 'send' ? new Date().toISOString() : null,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('job_offers').insert([newOffer]).select();
        if (!error && data) {
          _offers.unshift(data[0]);

          // Update employee status to Active & Onboarding Completed
          await supabase.from('employees').update({
            status: 'Active',
            onboarding_status: 'Onboarding Completed',
            designation: payload.position,
            district: payload.district,
            mandal: payload.mandal
          }).eq('employee_id', payload.employeeId);

          // Dispatch Onboarding & Credentials Email (Email 2)
          this.sendOnboardingEmail({
            ...payload,
            password: generatedPassword
          }).catch(e => console.warn('Onboarding email dispatch warning:', e));

          return { success: true, data: data[0] };
        }
      } catch (err) {
        console.warn('Supabase createOffer error:', err);
      }
    }

    _offers.unshift(newOffer);
    
    // Dispatch Onboarding & Credentials Email (Email 2)
    this.sendOnboardingEmail({
      ...payload,
      password: generatedPassword
    }).catch(e => console.warn('Onboarding email dispatch warning:', e));

    return { success: true, data: newOffer };
  },

  /** Dispatch Onboarding Completion & System Credentials Email (Email 2) */
  async sendOnboardingEmail(payload) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');
      const res = await fetch(`${apiUrl}/api/admin/send-onboarding-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: payload.employeeId,
          fullName: payload.employeeName,
          email: payload.email,
          position: payload.position,
          district: payload.district,
          mandal: payload.mandal,
          joiningDate: payload.joiningDate,
          salary: payload.salary,
          username: payload.employeeId,
          password: payload.password,
        }),
      });
      return await res.json();
    } catch (e) {
      console.warn('Onboarding email API error:', e);
      return { success: false, error: e.message };
    }
  },

  /** Resend offer letter email */
  async resendOffer(offerId) {
    const offer = await this.getOfferById(offerId);
    if (!offer) throw new Error('Offer not found');

    const now = new Date().toISOString();
    const generatedPassword = `DS@${(offer.employee_id || offer.employeeId || 'DS001').replace(/[^a-zA-Z0-9]/g, '')}!2026`;

    if (isSupabaseConfigured) {
      try {
        await supabase.from('job_offers').update({ sent_at: now, email_status: 'Delivered' }).eq('id', offer.id);
      } catch (e) {
        console.warn('Supabase resendOffer error:', e);
      }
    }

    // Re-dispatch Onboarding & Credentials Email
    this.sendOnboardingEmail({
      employeeId: offer.employee_id || offer.employeeId,
      employeeName: offer.employee_name || offer.employeeName,
      email: offer.email,
      position: offer.position,
      district: offer.district,
      mandal: offer.mandal,
      joiningDate: offer.joining_date || offer.joiningDate,
      salary: {
        basic: offer.basic_salary,
        travel: offer.travel_allowance,
        incentive: offer.incentive,
        other: offer.other_allowance,
        monthlyTotal: offer.monthly_total,
        annualCtc: offer.annual_ctc,
      },
      password: generatedPassword,
    }).catch(e => console.warn('Resend onboarding email warning:', e));

    return { success: true, sentAt: now };
  }
};
