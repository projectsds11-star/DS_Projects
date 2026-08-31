// Template Service — Job Positions, Master Templates & Variable Interpolator
// Enterprise HRMS Module for DS PROJECTS

export const JOB_POSITIONS = [
  'Z-Assencer',
  'Facilator',
  'Mandal Co-ordinator',
  'District Co-ordinator',
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
  { id: 15, title: 'Jurisdiction', text: 'Any disputes arising out of this employment contract shall be subject to the exclusive jurisdiction of courts in Nellore, Andhra Pradesh.' },
];

export const DEFAULT_TERMS = DEFAULT_TERMS_AND_CONDITIONS;

export const MASTER_TEMPLATES = {
  'Mandal Co-ordinator': {
    jobPosition: 'Mandal Co-ordinator',
    department: 'Field Operations',
    defaultSalary: { basic: 16000, travel: 3000, incentive: 3500, other: 1500 },
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
    defaultSalary: { basic: 18000, travel: 4000, incentive: 4000, other: 2000 },
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
    defaultSalary: { basic: 12000, travel: 2500, incentive: 2500, other: 1000 },
    probation: '3 Months',
    noticePeriod: '15 Days',
    jobDescription: `As a Facilitator, you will be in direct contact with community members and households in {{mandal}} mandal, facilitating registrations, conducting surveys, distributing project materials, and assisting citizens with program access.`,
    responsibilities: [
      'Visit designated village clusters daily and engage households in project programs.',
      'Accurately fill citizen questionnaires and upload data using the mobile application.',
      'Assist Mandal Co-ordinators in community awareness sessions and camps.',
      'Submit daily work completion counts before 6:00 PM.',
    ],
    emailSubject: `Employment Offer — Facilitator — DS PROJECTS ({{employee_name}})`,
    emailBody: `Dear {{employee_name}},

Congratulations! Welcome to DS PROJECTS.

We are happy to offer you the position of Facilitator assigned to {{mandal}} Mandal, {{district}} District.

Please check the attached offer document and activate your employee portal credentials using this link: {{activation_link}}.

Warm regards,
HR Team, DS PROJECTS`,
  },
  'District Co-ordinator': {
    jobPosition: 'District Co-ordinator',
    department: 'Project Coordination',
    defaultSalary: { basic: 26000, travel: 6000, incentive: 5000, other: 3000 },
    probation: '6 Months',
    noticePeriod: '60 Days',
    jobDescription: `The District Co-ordinator heads project implementation for the entire {{district}} district. You will manage all Mandal Co-ordinators, oversee field logistics, interface with district authorities, and ensure target achievement.`,
    responsibilities: [
      'Manage end-to-end project operations and team performance across all mandals in {{district}}.',
      'Serve as key liaison between Head Office leadership and district administration.',
      'Monitor district-wide KPIs, budgets, attendance, and data submission velocity.',
      'Organize district review meetings and address operational escalations promptly.',
    ],
    emailSubject: `Employment Offer — District Co-ordinator — DS PROJECTS ({{employee_name}})`,
    emailBody: `Dear {{employee_name}},

Congratulations!

On behalf of the leadership team at DS PROJECTS, we take pleasure in offering you the strategic position of District Co-ordinator for {{district}} District.

Please find your official appointment offer attached. Complete your account activation via {{activation_link}}.

Sincerely,
Managing Director & HR Directorate
DS PROJECTS`,
  },
  'Office Staff': {
    jobPosition: 'Office Staff',
    department: 'Administration & HR',
    defaultSalary: { basic: 14000, travel: 1000, incentive: 2000, other: 1000 },
    probation: '3 Months',
    noticePeriod: '30 Days',
    jobDescription: `Office Staff support district headquarters administrative workflows, record keeping, documentation verification, employee query resolution, and logistical coordination.`,
    responsibilities: [
      'Manage office registers, documentation archives, and employee physical dossiers.',
      'Assist the HR and accounts team in payroll data collation and document audits.',
      'Coordinate office procurement, incoming correspondence, and staff supplies.',
    ],
    emailSubject: `Employment Offer — Office Staff — DS PROJECTS ({{employee_name}})`,
    emailBody: `Dear {{employee_name}},

Congratulations! We are glad to extend an offer for the position of Office Staff at our {{district}} Office.

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
