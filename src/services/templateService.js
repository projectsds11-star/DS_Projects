// Template Service — Job Positions, Master Templates & Variable Interpolator
// Enterprise HRMS Module for DS PROJECTS

export const JOB_POSITIONS = [
  'ZED IMPLEMENTATION COORDINATOR',
  'Mandal Co-ordinator',
  'District Co-ordinator',
  'Z-Assencer',
  'Facilator',
  'Office Staff',
];

export const DEPARTMENTS = [
  'Field Operations',
  'Project Coordination',
  'Quality & Assessment',
  'Administration & HR',
  'Community Outreach',
];

export const EMPLOYMENT_TYPES = ['Full Time', 'Part Time', 'Contract', 'Intern'];
export const WORK_LOCATIONS = ['Office', 'Field', 'Hybrid'];

export const DEFAULT_TERMS_AND_CONDITIONS = [
  { id: 1, title: 'Nature of Employment', text: 'This employment is subject to the terms and conditions outlined in this offer letter and standard DS PROJECTS policies.' },
  { id: 2, title: 'Joining Date & Reporting', text: 'You are required to report on or before {{joining_date}} at the assigned district office: {{district}}, Mandal: {{mandal}}.' },
  { id: 3, title: 'Job Responsibilities', text: 'You will diligently perform all assigned duties of {{designation}} as communicated by your reporting manager and district administration.' },
  { id: 4, title: 'Working Hours', text: 'Standard working hours are 9:00 AM to 6:00 PM, Monday through Saturday, or as mandated by field operational requirements.' },
  { id: 5, title: 'Salary & Remuneration', text: 'Your consolidated Monthly Gross Salary will be {{monthly_salary}}, translating to an Annual CTC of {{annual_ctc}}, disbursed monthly via direct bank transfer.' },
  { id: 6, title: 'Probation Period', text: 'You will be on probation for a period of {{probation_period}}, during which your performance and conduct will be formally assessed.' },
  { id: 7, title: 'Daily Attendance & Work Logging', text: 'You must mark daily attendance and submit mandatory daily work accomplishment reports through the DS PROJECTS Mobile/Web Portal.' },
  { id: 8, title: 'Leave Policy', text: 'Leave entitlement will be as per the company standard policy upon successful completion of initial onboarding training.' },
  { id: 9, title: 'Confidentiality & Data Protection', text: 'All project data, citizen records, and operational information remain the strict intellectual property of DS PROJECTS.' },
  { id: 10, title: 'Company Policies & Compliance', text: 'You agree to abide by all regulatory, security, integrity, and anti-harassment policies of DS PROJECTS.' },
  { id: 11, title: 'Code of Conduct', text: 'Professional demeanor and ethical representation of DS PROJECTS during all field interactions and community visits is mandatory.' },
  { id: 12, title: 'Notice Period', text: 'A notice period of {{notice_period}} or salary in lieu thereof is required from either party for separation post-probation.' },
  { id: 13, title: 'Termination', text: 'DS PROJECTS reserves the right to terminate employment without notice in cases of misconduct, data breach, or fraud.' },
  { id: 14, title: 'Document Verification', text: 'This offer is contingent upon successful verification of your Aadhaar, PAN, educational certificates, and background checks.' },
  { id: 15, title: 'Jurisdiction', text: 'Any disputes arising out of this employment contract shall be subject to the exclusive jurisdiction of courts in Ongole / Nellore, Andhra Pradesh.' },
];

export const DEFAULT_TERMS = DEFAULT_TERMS_AND_CONDITIONS;

export const MASTER_TEMPLATES = {
  'ZED IMPLEMENTATION COORDINATOR': {
    jobPosition: 'ZED IMPLEMENTATION COORDINATOR',
    department: 'Quality & Assessment',
    defaultSalary: { basic: 25000, travel: 5000, incentive: 0, other: 0 },
    probation: '3 Months',
    noticePeriod: '30 Days',
    jobDescription: `Responsible for assisting the company in project activities, documentation, quality-related processes, operational improvement and implementation of applicable MSME Sustainable (ZED) practices.`,
    responsibilities: [
      'Maintaining quality and process documentation according to ZED framework standards.',
      'Supporting standard operating procedures and process standardization.',
      'Assisting in reduction of defects, rework, wastage and operational losses.',
      'Supporting energy-efficiency and resource-conservation practices.',
      'Maintaining documents and evidence required for applicable MSME/ZED assessments.',
    ],
    emailSubject: `Offer of Employment – MSME Sustainable (ZED) Implementation & Project Operations — DS PROJECTS`,
    emailBody: `Dear {{employee_name}},

Congratulations!

We are pleased to offer you employment with DS PROJECTS, Ongole, subject to the terms and conditions mentioned in this letter.

You are being appointed to support the company's project operations and its initiatives relating to quality improvement, process standardization, productivity enhancement, environmental responsibility and MSME Sustainable (ZED – Zero Defect Zero Effect) practices.

Key Assignment Details:
• Employee ID: {{employee_id}}
• Designation: ZED IMPLEMENTATION COORDINATOR
• Work Location: {{district}}, Andhra Pradesh
• Proposed Joining Date: {{joining_date}}
• Monthly Gross Remuneration: {{monthly_salary}} (Annual CTC: {{annual_ctc}})

Please find attached your official Appointment Offer Letter.

To activate your secure Employee Portal account, follow the link: {{activation_link}}

Warm Regards,
Human Resources Directorate
DS PROJECTS`,
  },
  'Mandal Co-ordinator': {
    jobPosition: 'Mandal Co-ordinator',
    department: 'Field Operations',
    defaultSalary: { basic: 25000, travel: 5000, incentive: 0, other: 0 },
    probation: '3 Months',
    noticePeriod: '30 Days',
    jobDescription: `As a Mandal Co-ordinator for DS PROJECTS, you will be the key operational driver at the mandal level. You will oversee grassroots team deployment, liaise with local panchayat & mandal administration, coordinate daily surveys, verify data submissions, and ensure timely completion of project deliverables.`,
    responsibilities: [
      'Lead and coordinate field survey teams and facilitators across all assigned panchayats in {{mandal}} mandal.',
      'Supervise daily data collection, resolve field bottlenecks, and ensure 100% compliance with quality benchmarks.',
      'Conduct weekly mandal review meetings and submit consolidated progress reports to the District Co-ordinator.',
      'Act as the primary point of contact for local government stakeholders and community leadership.',
      'Maintain daily attendance logs and field movement records of team members.',
    ],
    emailSubject: `Employment Offer — Mandal Co-ordinator — DS PROJECTS ({{employee_name}})`,
    emailBody: `Dear {{employee_name}},

Congratulations!

We are pleased to extend this formal offer of employment for the position of Mandal Co-ordinator at DS PROJECTS.

Key Assignment Details:
• Employee ID: {{employee_id}}
• Designation: {{designation}}
• Work Location: District {{district}}, Mandal {{mandal}}
• Proposed Joining Date: {{joining_date}}
• Monthly Gross Salary: {{monthly_salary}} (Annual CTC: {{annual_ctc}})

Please find attached your detailed Offer Letter and Job Description document.

Next Steps:
1. Review the attached Offer Letter.
2. Sign in to the DS PROJECTS Employee Portal to activate your account: {{activation_link}}
3. Complete your onboarding document verification.

We look forward to welcoming you to the DS PROJECTS family.

Warm regards,
HR & Operations Team
DS PROJECTS Pvt Ltd`,
  },
  'Z-Assencer': {
    jobPosition: 'Z-Assencer',
    department: 'Quality & Assessment',
    defaultSalary: { basic: 25000, travel: 5000, incentive: 0, other: 0 },
    probation: '3 Months',
    noticePeriod: '30 Days',
    jobDescription: `The Z-Assencer is responsible for independent zonal quality audit, cross-verification of beneficiary assessments, compliance scoring, and quality assurance across multiple mandals in {{district}} district.`,
    responsibilities: [
      'Conduct random sampling and independent ground audits of completed surveys.',
      'Evaluate data integrity and flag discrepancies for corrective administrative action.',
      'Submit weekly zonal quality metrics directly to the Project Monitoring Unit.',
      'Train mandal teams on standard assessment protocols and compliance criteria.',
    ],
    emailSubject: `Employment Offer — Z-Assencer — DS PROJECTS ({{employee_name}})`,
    emailBody: `Dear {{employee_name}},

Congratulations!

We are pleased to offer you the position of Z-Assencer at DS PROJECTS. Your role will be critical in ensuring high-fidelity assessment and quality assurance across {{district}} district.

Please review your attached Offer Letter and complete your employee account setup via {{activation_link}}.

Best regards,
DS PROJECTS HR Team`,
  },
  'Facilator': {
    jobPosition: 'Facilator',
    department: 'Community Outreach',
    defaultSalary: { basic: 20000, travel: 4000, incentive: 0, other: 0 },
    probation: '3 Months',
    noticePeriod: '15 Days',
    jobDescription: `As a Facilitator, you will be in direct contact with community members and households in {{mandal}} mandal, facilitating registrations, conducting surveys, distributing project materials, and assisting citizens with program access.`,
    responsibilities: [
      'Facilitate community registrations and program awareness.',
      'Assist citizens with accessing the project benefits and services.',
    ],
    termsAndConditions: [],
    emailSubject: `Employment Offer — Facilitator — DS PROJECTS ({{employee_name}})`,
    emailBody: `Dear {{employee_name}},

Congratulations! Welcome to DS PROJECTS.

We are happy to offer you the position of Facilitator assigned to {{mandal}} Mandal, {{district}} District.

Please check the attached offer document and activate your employee portal credentials using this link: {{activation_link}}.

Warm regards,
HR Team, DS PROJECTS`,
  },
  'Field Data Executive': {
    jobPosition: 'Field Data Executive',
    department: 'MSME Sustainable (ZED) Certification & Consultancy Division',
    pdfTitle: 'APPOINTMENT LETTER FOR THE POST OF "MSME ZED CERTIFICATION FIELD DATA EXECUTIVE"',
    defaultSalary: { basic: 15000, travel: 5000, incentive: 0, other: 2000 },
    probation: '3 to 6 Months',
    noticePeriod: '30 Days',
    jobDescription: `With reference to your application, interview, and background evaluation, the management at DS Projects is pleased to formally appoint you as MSME ZED Certification Field Data Executive. In this role, you will be responsible for district-level field operations, enterprise data collection, process monitoring, and business growth under the Ministry of MSME's Sustainable (ZED - Zero Defect Zero Effect) Certification Program.`,
    responsibilities: [
      'District Performance & Monitoring: Conduct field visits to micro, small, and medium industrial units across the assigned district to monitor performance, evaluate manufacturing processes, and verify operational setups.',
      'ZED Data Collection & Evidence Upload: Collect authentic process data, quality parameters, safety compliance records, and geo-tagged site photographs required for ZED Bronze, Silver, and Gold level certifications.',
      'MSME Awareness & Business Expansion: Actively engage with industrial units, trade associations, and local enterprise hubs to promote the ZED Scheme benefits, guide units through the ZED Pledge, and grow DS Projects\' client footprint.',
      'Portal Facilitation & Onboarding: Assist MSME unit representatives with Udyam registration validation, document upload, and self-assessment navigation on the official ZED portal (zed.msme.gov.in).',
      'Reporting & Audit Compliance: Maintain daily field activity reports (DAR), track district target progression, and submit verified audit dossiers to the Operations Lead.',
    ],
    termsAndConditions: [
      { id: 1, title: 'MSME ZED COMPLIANCE RULES & OPERATIONAL GUIDELINES', text: 'Authenticity & Zero-Tolerance Policy: All collected field data, photographs, and document uploads must be 100% genuine and captured directly from the registered industrial unit address. Any submission of duplicate, fraudulent, or altered records will result in immediate termination and legal action.' },
      { id: 2, title: '', text: 'Professional Standard & Representation: As a representative of DS Projects working on Ministry of MSME initiatives, you must maintain a professional dress code, display official identification, and follow proper workplace decorum during factory/unit visits.' },
      { id: 3, title: '', text: 'Co-ordination with MSME Representatives: All field assessments and document collection must occur strictly in the presence of the authorized MSME unit representative.' },
      { id: 4, title: '', text: 'Working Hours & Field Reporting: Standard working hours are 9:30 AM to 6:00 PM (Monday to Saturday). Daily movement logs and field assessment sheets must be updated on the corporate portal by 7:00 PM every working day.' },
      { id: 5, title: '', text: 'Confidentiality Agreement: You shall strictly protect the proprietary process data, financial information, and technical documentation of candidate MSMEs. Data leakage to third parties is strictly prohibited.' },
      { id: 6, title: '', text: 'Probation & Notice Period: You will serve a probation period of 3 to 6 months. Resignation or termination requires a 15-day notice period during probation and a 30-day notice period post-confirmation.' },
    ],
    emailSubject: `Employment Offer — Field Data Executive — DS PROJECTS ({{employee_name}})`,
    emailBody: `Dear {{employee_name}},

Congratulations! Welcome to DS PROJECTS.

We are happy to offer you the position of Field Data Executive assigned to {{district}} District.

Please check the attached offer document and activate your employee portal credentials using this link: {{activation_link}}.

Warm regards,
HR Team, DS PROJECTS`,
  },
  'Office Staff': {
    jobPosition: 'Office Staff',
    department: 'UDYAM REGISTRATION NO: UDYAM-AP-13-0077732',
    pdfTitle: 'APPOINTMENT LETTER FOR STAFF POSITION AT DS PROJECTS',
    defaultSalary: { basic: 15000, travel: 0, incentive: 0, other: 2000 },
    probation: '3 to 6 Months',
    noticePeriod: '30 Days',
    jobDescription: `With reference to your application and subsequent employment assessment, management at DS Projects is pleased to offer you employment for the position of {{designation}} at our office in Ongole, Andhra Pradesh. This appointment is subject to your acceptance of the corporate rules, policies, and compensation structure detailed below.`,
    responsibilities: [
      'Working Hours & Punctuality: Regular office working hours are from 9:30 AM to 6:00 PM (Monday through Saturday). Staff members must maintain strict punctuality and record attendance daily via official logs/biometrics.',
      'Supervisor: Responsible for team monitoring, task distribution, operational execution, and reporting to corporate management.',
      'Computer Operator: Responsible for data entry, office documentation, system management, and digital record maintenance.',
      'Telecaller: Responsible for calling clients/enterprises, project communications, lead generation, and follow-ups.',
      'Attender: Responsible for office maintenance, document movement, pantry support, and general routine operational assistance.',
    ],
    termsAndConditions: [
      { id: 1, title: 'CORPORATE RULES & EMPLOYMENT GUIDELINES', text: 'Code of Conduct & Workplace Discipline: You are expected to maintain professional integrity, respectful behavior toward colleagues/clients, and strict compliance with management directives at all times.' },
      { id: 2, title: '', text: 'Confidentiality & Data Protection: You shall maintain total confidentiality regarding company documents, client lists, project credentials, and financial information. Unauthorized sharing of corporate data is strictly prohibited and subject to legal action.' },
      { id: 3, title: '', text: 'Leave Policy: Leaves must be requested and approved in advance by management. Unauthorized absence for more than 3 consecutive days will lead to disciplinary action.' },
      { id: 4, title: '', text: 'Probation & Notice Period: You will be on a probation period of 3 to 6 months. Termination or resignation during probation requires 15 days\' written notice or salary in lieu thereof. Post confirmation, a 30-day notice period is required.' },
    ],
    emailSubject: `Employment Offer — Office Staff — DS PROJECTS ({{employee_name}})`,
    emailBody: `Dear {{employee_name}},

Congratulations! We are glad to extend an offer for the position of {{designation}} at our {{district}} Office.

Please review your offer details attached and complete your employee account onboarding.

Warm regards,
Administration & HR Team
DS PROJECTS`,
  },
};

/**
 * Interpolate dynamic placeholders like {{employee_name}}, {{designation}}, etc.
 */
export function interpolateVariables(templateText = '', variables = {}) {
  if (!templateText) return '';
  return Object.keys(variables).reduce((acc, key) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    return acc.replace(regex, variables[key] ?? '');
  }, templateText);
}

/**
 * Format Indian Currency INR (e.g. 24000 -> ₹24,000)
 */
export function formatINR(amount = 0) {
  const num = Number(amount) || 0;
  return '₹' + num.toLocaleString('en-IN');
}
