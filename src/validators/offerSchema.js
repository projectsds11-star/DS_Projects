import * as z from 'zod';

export const offerSchema = z.object({
  // Step 01: Employee
  employeeId: z.string().min(1, 'Please select an employee.'),
  employeeName: z.string().min(1, 'Employee name is required.'),
  email: z.string().min(1, 'Valid employee email is required.'),
  phone: z.string().optional().default(''),

  // Step 02: Job
  position: z.string().min(1, 'Please select a job position.'),
  department: z.string().optional().default('Field Operations'),

  // Step 03: Location
  district: z.string().min(1, 'Please select a district.'),
  mandal: z.string().min(1, 'Please select a mandal.'),

  // Step 04: Employment Details
  joiningDate: z.string().min(1, 'Please select a proposed joining date.'),
  employmentType: z.string().default('Full Time'),
  workLocation: z.string().default('Field / Mandal Office'),
  reportingManager: z.string().optional().default('District Project Coordinator'),
  probation: z.string().default('3 Months'),
  noticePeriod: z.string().default('30 Days'),

  // Step 05: Salary Structure
  salary: z.object({
    basic: z.number().min(0).default(25000).or(z.string().transform(v => Number(v) || 0)),
    travel: z.number().min(0).default(5000).or(z.string().transform(v => Number(v) || 0)),
    incentive: z.number().min(0).default(0).or(z.string().transform(v => Number(v) || 0)),
    other: z.number().min(0).default(0).or(z.string().transform(v => Number(v) || 0)),
    frequency: z.enum(['Monthly', 'Annual']).default('Monthly'),
  }).optional(),

  // Step 06: Content
  jobDescription: z.string().optional().default(''),
  responsibilities: z.array(z.string()).optional().default([]),
  termsAndConditions: z.any().optional(),

  // Step 07: Email
  emailSubject: z.string().min(1, 'Email subject is required.').default('Employment Offer Letter — DS PROJECTS'),
  emailBody: z.string().min(1, 'Email body is required.').default(''),
});
