// Onboarding & Offer Service — API Ready Architecture
// Enterprise HRMS Pipeline for DS PROJECTS

import { MASTER_TEMPLATES, interpolateVariables, formatINR } from './templateService';

// In-memory mock database that preserves state within the browser session
const INITIAL_EMPLOYEES = [
  {
    id: 'DS-001',
    employeeId: 'DS-001',
    fullName: 'Rahul Kumar',
    email: 'rahul.kumar@dsprojects.in',
    phone: '9876543210',
    gender: 'Male',
    dateOfBirth: '1995-06-15',
    district: 'Nellore',
    mandal: 'Kavali',
    qualification: 'B.Tech / B.E',
    createdDate: '2026-08-28',
    status: 'Offer Sent',
    photo: null,
    onboardingStatus: 'Offer Sent',
    hasOffer: true,
    offerId: 'OFF-1001',
  },
  {
    id: 'DS-002',
    employeeId: 'DS-002',
    fullName: 'Sneha Reddy',
    email: 'sneha.reddy@dsprojects.in',
    phone: '9848022334',
    gender: 'Female',
    dateOfBirth: '1997-09-21',
    district: 'Guntur',
    mandal: 'Tenali',
    qualification: 'Degree',
    createdDate: '2026-08-29',
    status: 'Onboarding',
    photo: null,
    onboardingStatus: 'Offer Accepted',
    hasOffer: true,
    offerId: 'OFF-1002',
  },
  {
    id: 'DS-003',
    employeeId: 'DS-003',
    fullName: 'Vikram Naidu',
    email: 'vikram.naidu@dsprojects.in',
    phone: '9440156789',
    gender: 'Male',
    dateOfBirth: '1993-03-11',
    district: 'Krishna',
    mandal: 'Vijayawada',
    qualification: 'Post Graduation',
    createdDate: '2026-08-30',
    status: 'Active',
    photo: null,
    onboardingStatus: 'Onboarding Completed',
    hasOffer: true,
    offerId: 'OFF-1003',
  },
  {
    id: 'DS-004',
    employeeId: 'DS-004',
    fullName: 'Ananya Sharma',
    email: 'ananya.sharma@dsprojects.in',
    phone: '9123456780',
    gender: 'Female',
    dateOfBirth: '1996-12-04',
    district: 'Nellore',
    mandal: 'Nellore',
    qualification: 'MBA',
    createdDate: '2026-08-30',
    status: 'Draft',
    photo: null,
    onboardingStatus: 'Pending Offer',
    hasOffer: false,
    offerId: null,
  },
  {
    id: 'DS-005',
    employeeId: 'DS-005',
    fullName: 'Suresh Babu',
    email: 'suresh.babu@dsprojects.in',
    phone: '9701234567',
    gender: 'Male',
    dateOfBirth: '1998-08-19',
    district: 'Prakasam',
    mandal: 'Ongole',
    qualification: 'Diploma',
    createdDate: '2026-08-31',
    status: 'Draft',
    photo: null,
    onboardingStatus: 'Pending Offer',
    hasOffer: false,
    offerId: null,
  },
  {
    id: 'DS-006',
    employeeId: 'DS-006',
    fullName: 'Priya Das',
    email: 'priya.das@dsprojects.in',
    phone: '9550987654',
    gender: 'Female',
    dateOfBirth: '1999-04-25',
    district: 'Chittoor',
    mandal: 'Tirupati',
    qualification: 'Degree',
    createdDate: '2026-08-31',
    status: 'Draft',
    photo: null,
    onboardingStatus: 'Pending Offer',
    hasOffer: false,
    offerId: null,
  },
];

const INITIAL_OFFERS = [
  {
    id: 'OFF-1001',
    offerNumber: 'DS/OFF/2026/001',
    employeeId: 'DS-001',
    employeeName: 'Rahul Kumar',
    email: 'rahul.kumar@dsprojects.in',
    phone: '9876543210',
    position: 'Mandal Co-ordinator',
    department: 'Field Operations',
    district: 'Nellore',
    mandal: 'Kavali',
    employmentType: 'Full Time',
    workLocation: 'Field',
    joiningDate: '2026-09-15',
    reportingManager: 'V. Ramanathan (District Lead)',
    probation: '3 Months',
    noticePeriod: '30 Days',
    salary: {
      basic: 16000,
      travel: 3000,
      incentive: 3500,
      other: 1500,
      monthlyTotal: 24000,
      annualCtc: 288000,
      frequency: 'Monthly',
    },
    status: 'Offer Sent',
    sentAt: '2026-08-28 14:30',
    createdAt: '2026-08-28 14:15',
    emailStatus: 'Delivered',
    activationToken: 'act_tok_9918237192',
    username: 'rahulkumar001@dsprojects',
  },
  {
    id: 'OFF-1002',
    offerNumber: 'DS/OFF/2026/002',
    employeeId: 'DS-002',
    employeeName: 'Sneha Reddy',
    email: 'sneha.reddy@dsprojects.in',
    phone: '9848022334',
    position: 'Facilator',
    department: 'Community Outreach',
    district: 'Guntur',
    mandal: 'Tenali',
    employmentType: 'Full Time',
    workLocation: 'Field',
    joiningDate: '2026-09-10',
    reportingManager: 'M. Sridhar (Coordinator)',
    probation: '3 Months',
    noticePeriod: '15 Days',
    salary: {
      basic: 12000,
      travel: 2500,
      incentive: 2500,
      other: 1000,
      monthlyTotal: 18000,
      annualCtc: 216000,
      frequency: 'Monthly',
    },
    status: 'Offer Accepted',
    sentAt: '2026-08-29 10:15',
    createdAt: '2026-08-29 10:00',
    emailStatus: 'Delivered',
    activationToken: 'act_tok_5518291039',
    username: 'snehareddy002@dsprojects',
  },
  {
    id: 'OFF-1003',
    offerNumber: 'DS/OFF/2026/003',
    employeeId: 'DS-003',
    employeeName: 'Vikram Naidu',
    email: 'vikram.naidu@dsprojects.in',
    phone: '9440156789',
    position: 'Z-Assencer',
    department: 'Quality & Assessment',
    district: 'Krishna',
    mandal: 'Vijayawada',
    employmentType: 'Full Time',
    workLocation: 'Hybrid',
    joiningDate: '2026-09-01',
    reportingManager: 'K. Venkatesh (Zonal Lead)',
    probation: '3 Months',
    noticePeriod: '30 Days',
    salary: {
      basic: 18000,
      travel: 4000,
      incentive: 4000,
      other: 2000,
      monthlyTotal: 28000,
      annualCtc: 336000,
      frequency: 'Monthly',
    },
    status: 'Onboarding Completed',
    sentAt: '2026-08-30 11:45',
    createdAt: '2026-08-30 11:30',
    emailStatus: 'Delivered',
    activationToken: 'act_tok_7729103941',
    username: 'vikramnaidu003@dsprojects',
  },
];

const INITIAL_EMAIL_LOGS = [
  {
    id: 'LOG-501',
    recipientEmail: 'rahul.kumar@dsprojects.in',
    recipientName: 'Rahul Kumar',
    employeeId: 'DS-001',
    type: 'OFFER_LETTER',
    subject: 'Employment Offer — Mandal Co-ordinator — DS PROJECTS (Rahul Kumar)',
    sentAt: '2026-08-28 14:30',
    status: 'Delivered',
    errorReason: null,
    attachments: ['Offer_Letter_Rahul_Kumar.pdf', 'Job_Description.pdf'],
  },
  {
    id: 'LOG-502',
    recipientEmail: 'sneha.reddy@dsprojects.in',
    recipientName: 'Sneha Reddy',
    employeeId: 'DS-002',
    type: 'OFFER_LETTER',
    subject: 'Employment Offer — Facilitator — DS PROJECTS (Sneha Reddy)',
    sentAt: '2026-08-29 10:15',
    status: 'Delivered',
    errorReason: null,
    attachments: ['Offer_Letter_Sneha_Reddy.pdf'],
  },
  {
    id: 'LOG-503',
    recipientEmail: 'vikram.naidu@dsprojects.in',
    recipientName: 'Vikram Naidu',
    employeeId: 'DS-003',
    type: 'OFFER_LETTER',
    subject: 'Employment Offer — Z-Assencer — DS PROJECTS (Vikram Naidu)',
    sentAt: '2026-08-30 11:45',
    status: 'Delivered',
    errorReason: null,
    attachments: ['Offer_Letter_Vikram_Naidu.pdf'],
  },
];

// In-memory state
let _employees = [...INITIAL_EMPLOYEES];
let _offers = [...INITIAL_OFFERS];
let _emailLogs = [...INITIAL_EMAIL_LOGS];

function _delay(ms = 400) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const onboardingService = {
  /** Get overview metrics for Onboarding KPI cards */
  async getKPIs() {
    await _delay(200);
    const total = _employees.length;
    const pending = _employees.filter(e => e.onboardingStatus === 'Pending Offer').length;
    const drafted = _offers.filter(o => o.status === 'Offer Draft').length;
    const sent = _offers.filter(o => o.status === 'Offer Sent').length;
    const accepted = _offers.filter(o => o.status === 'Offer Accepted').length;
    const completed = _employees.filter(e => e.onboardingStatus === 'Onboarding Completed').length;
    const failed = _emailLogs.filter(l => l.status === 'Failed').length;

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
    await _delay(250);
    return _employees.filter(e => {
      const matchSearch =
        !search ||
        e.fullName.toLowerCase().includes(search.toLowerCase()) ||
        e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase());
      const matchDistrict = !district || e.district === district;
      const isPending = e.onboardingStatus === 'Pending Offer' || !e.hasOffer;
      return matchSearch && matchDistrict && isPending;
    });
  },

  /** Get single employee by ID or employeeId */
  async getEmployeeById(idOrEmpId) {
    await _delay(150);
    return _employees.find(e => e.id === idOrEmpId || e.employeeId === idOrEmpId) || null;
  },

  /** Get all employees */
  async getAllEmployees() {
    await _delay(200);
    return [..._employees];
  },

  /** Check if employee already has an active offer */
  async checkExistingOffer(employeeId) {
    await _delay(100);
    const existing = _offers.find(o => o.employeeId === employeeId && o.status !== 'Offer Rejected');
    return existing || null;
  },

  /** Get full email logs audit trail */
  async getEmailLogs() {
    await _delay(200);
    return [..._emailLogs];
  },

  /** Get dynamic activity timeline for an employee's onboarding lifecycle */
  async getTimeline(employeeId) {
    await _delay(200);
    const emp = _employees.find(e => e.employeeId === employeeId);
    const offer = _offers.find(o => o.employeeId === employeeId);

    const events = [
      {
        title: 'Employee Created',
        date: emp ? emp.createdDate : '2026-08-28',
        completed: true,
        description: `Employee profile registered with ID ${employeeId}.`,
      },
      {
        title: 'Job Position & Location Assigned',
        date: offer ? offer.createdAt : null,
        completed: !!offer,
        description: offer ? `Assigned ${offer.position} at ${offer.district}, ${offer.mandal}.` : 'Pending role allocation.',
      },
      {
        title: 'Offer Letter Generated',
        date: offer ? offer.createdAt : null,
        completed: !!offer,
        description: offer ? `Offer document ${offer.offerNumber} created.` : 'Pending generation.',
      },
      {
        title: 'Offer Sent via Email',
        date: offer?.sentAt || null,
        completed: offer?.status === 'Offer Sent' || offer?.status === 'Offer Accepted' || offer?.status === 'Onboarding Completed',
        description: offer?.sentAt ? `Dispatched to ${offer.email}.` : 'Waiting for HR dispatch.',
      },
      {
        title: 'Offer Accepted by Employee',
        date: offer?.status === 'Offer Accepted' || offer?.status === 'Onboarding Completed' ? '2026-08-29' : null,
        completed: offer?.status === 'Offer Accepted' || offer?.status === 'Onboarding Completed',
        description: 'Employee digitally reviewed and accepted terms.',
      },
      {
        title: 'Account Activated',
        date: emp?.status === 'Active' ? '2026-08-30' : null,
        completed: emp?.status === 'Active',
        description: 'Employee completed password setup & logged into portal.',
      },
      {
        title: 'Onboarding Completed',
        date: emp?.onboardingStatus === 'Onboarding Completed' ? '2026-08-30' : null,
        completed: emp?.onboardingStatus === 'Onboarding Completed',
        description: 'All document audits passed. Work assignment ready.',
      },
    ];

    return events;
  },
};

export const offerService = {
  /** Get all offer letters with search & filter */
  async getOffers(filters = {}) {
    await _delay(300);
    const { search = '', position = '', district = '', status = '' } = filters;

    return _offers.filter(o => {
      const matchSearch =
        !search ||
        o.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        o.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        o.offerNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.email.toLowerCase().includes(search.toLowerCase());
      const matchPosition = !position || o.position === position;
      const matchDistrict = !district || o.district === district;
      const matchStatus = !status || o.status === status;

      return matchSearch && matchPosition && matchDistrict && matchStatus;
    });
  },

  /** Get offer by ID */
  async getOfferById(id) {
    await _delay(200);
    return _offers.find(o => o.id === id || o.offerNumber === id) || null;
  },

  /** Create a new offer letter */
  async createOffer(payload) {
    await _delay(800);
    const newId = `OFF-${1000 + _offers.length + 1}`;
    const offerNumber = `DS/OFF/2026/${String(_offers.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const monthlyTotal =
      (Number(payload.salary?.basic) || 0) +
      (Number(payload.salary?.travel) || 0) +
      (Number(payload.salary?.incentive) || 0) +
      (Number(payload.salary?.other) || 0);

    const annualCtc = monthlyTotal * 12;

    const newOffer = {
      id: newId,
      offerNumber,
      employeeId: payload.employeeId,
      employeeName: payload.employeeName,
      email: payload.email,
      phone: payload.phone,
      position: payload.position,
      department: payload.department || 'Field Operations',
      district: payload.district,
      mandal: payload.mandal,
      employmentType: payload.employmentType || 'Full Time',
      workLocation: payload.workLocation || 'Field',
      joiningDate: payload.joiningDate,
      reportingManager: payload.reportingManager || 'District Lead',
      probation: payload.probation || '3 Months',
      noticePeriod: payload.noticePeriod || '30 Days',
      salary: {
        basic: payload.salary?.basic || 0,
        travel: payload.salary?.travel || 0,
        incentive: payload.salary?.incentive || 0,
        other: payload.salary?.other || 0,
        monthlyTotal,
        annualCtc,
        frequency: payload.salary?.frequency || 'Monthly',
      },
      jobDescription: payload.jobDescription,
      responsibilities: payload.responsibilities,
      termsAndConditions: payload.termsAndConditions,
      emailSubject: payload.emailSubject,
      emailBody: payload.emailBody,
      status: payload.isDraft ? 'Offer Draft' : 'Offer Generated',
      createdAt: now,
      sentAt: null,
      emailStatus: payload.isDraft ? 'Pending' : 'Ready to Send',
      activationToken: `act_tok_${Math.random().toString(36).slice(2, 12)}`,
      username: payload.username || `${payload.employeeName.toLowerCase().replace(/\s+/g, '')}${payload.employeeId.replace('DS-', '')}@dsprojects`,
    };

    _offers.unshift(newOffer);

    // Update employee status
    const empIndex = _employees.findIndex(e => e.employeeId === payload.employeeId);
    if (empIndex !== -1) {
      _employees[empIndex] = {
        ..._employees[empIndex],
        hasOffer: true,
        offerId: newId,
        onboardingStatus: payload.isDraft ? 'Offer Draft' : 'Offer Generated',
      };
    }

    return { success: true, data: newOffer };
  },

  /** Send / Dispatch Offer Letter Email & Activate Employee Account */
  async sendOffer(offerId) {
    await _delay(1200); // Simulate network & PDF generation & SMTP dispatch
    const offerIndex = _offers.findIndex(o => o.id === offerId);
    if (offerIndex === -1) throw new Error('Offer not found');

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const offer = _offers[offerIndex];

    _offers[offerIndex] = {
      ...offer,
      status: 'Offer Sent',
      sentAt: now,
      emailStatus: 'Delivered',
    };

    // Update employee record
    const empIndex = _employees.findIndex(e => e.employeeId === offer.employeeId);
    if (empIndex !== -1) {
      _employees[empIndex] = {
        ..._employees[empIndex],
        status: 'Onboarding',
        onboardingStatus: 'Offer Sent',
      };
    }

    // Add to email audit log
    const logId = `LOG-${500 + _emailLogs.length + 1}`;
    _emailLogs.unshift({
      id: logId,
      recipientEmail: offer.email,
      recipientName: offer.employeeName,
      employeeId: offer.employeeId,
      type: 'OFFER_LETTER',
      subject: offer.emailSubject || `Employment Offer — ${offer.position} — DS PROJECTS (${offer.employeeName})`,
      sentAt: now,
      status: 'Delivered',
      errorReason: null,
      attachments: [`Offer_Letter_${offer.employeeName.replace(/\s+/g, '_')}.pdf`, 'Job_Description.pdf'],
    });

    return { success: true, data: _offers[offerIndex] };
  },

  /** Resend Offer Letter email */
  async resendOffer(offerId) {
    await _delay(1000);
    const offer = _offers.find(o => o.id === offerId);
    if (!offer) throw new Error('Offer not found');

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    _emailLogs.unshift({
      id: `LOG-${500 + _emailLogs.length + 1}`,
      recipientEmail: offer.email,
      recipientName: offer.employeeName,
      employeeId: offer.employeeId,
      type: 'OFFER_LETTER',
      subject: `[RESENT] Employment Offer — ${offer.position} — DS PROJECTS (${offer.employeeName})`,
      sentAt: now,
      status: 'Delivered',
      errorReason: null,
      attachments: [`Offer_Letter_${offer.employeeName.replace(/\s+/g, '_')}.pdf`],
    });

    return { success: true, message: 'Offer letter email resent successfully.' };
  },

  /** Employee Portal: Activate Account by Token */
  async activateAccount(token, password) {
    await _delay(1000);
    const offer = _offers.find(o => o.activationToken === token || token === 'demo_token' || !token);
    if (!offer && token !== 'demo_token') {
      return { success: false, message: 'Invalid or expired activation link.' };
    }

    const targetEmpId = offer ? offer.employeeId : 'DS-001';
    const empIndex = _employees.findIndex(e => e.employeeId === targetEmpId);
    if (empIndex !== -1) {
      _employees[empIndex] = {
        ..._employees[empIndex],
        status: 'Active',
        onboardingStatus: 'Account Activated',
      };
    }

    return {
      success: true,
      username: offer?.username || 'employee001@dsprojects',
      message: 'Account activated successfully.',
    };
  },
};
