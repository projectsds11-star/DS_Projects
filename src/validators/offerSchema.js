import * as z from 'zod';

export const offerSchema = z.object({
  // Step 01: Employee
  employeeId: z.string().min(1, 'Please select an employee.'),
  employeeName: z.string().min(1, 'Employee name is required.'),
  email: z.string().email('Valid employee email is required.'),
  phone: z.string().min(10, 'Valid phone number is required.'),

  // Step 02: Job
  position: z.string().min(1, 'Please select a job position.'),
  department: z.string().min(1, 'Please select a department.'),

  // Step 03: Location
  district: z.string().min(1, 'Please select a district.'),
  mandal: z.string().min(1, 'Please select a mandal.'),

  // Step 04: Employment Details
  joiningDate: z.string().min(1, 'Please select a proposed joining date.'),
  employmentType: z.string().default('Full Time'),
  workLocation: z.string().default('Field'),
  reportingManager: z.string().min(1, 'Reporting manager is required.'),
  probation: z.string().default('3 Months'),
  noticePeriod: z.string().default('30 Days'),

  // Step 05: Salary Structure
  salary: z.object({
    basic: z.number().min(1, 'Basic salary must be greater than 0.').or(z.string().transform(v => Number(v) || 0)),
    travel: z.number().min(0).default(0).or(z.string().transform(v => Number(v) || 0)),
    incentive: z.number().min(0).default(0).or(z.string().transform(v => Number(v) || 0)),
    other: z.number().min(0).default(0).or(z.string().transform(v => Number(v) || 0)),
    frequency: z.enum(['Monthly', 'Annual']).default('Monthly'),
  }),

  // Step 06: Content
  jobDescription: z.string().min(10, 'Job description must be at least 10 characters.'),
  responsibilities: z.array(z.string()).min(1, 'At least one key responsibility is required.'),
  termsAndConditions: z.array(z.object({
    id: z.number(),
    title: z.string(),
    text: z.string(),
  })).optional(),

  // Step 07: Email
  emailSubject: z.string().min(5, 'Email subject is required.'),
  emailBody: z.string().min(10, 'Email body is required.'),
});
