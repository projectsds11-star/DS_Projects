import * as z from 'zod';

const phoneRegex = /^[6-9]\d{9}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const employeeSchema = z.object({
  // Section 01 – Identification
  status: z.enum(['Draft', 'Onboarding', 'Active', 'Inactive']).default('Active'),

  // Section 02 – Personal Information
  fullName: z.string().min(2, 'Full name must be at least 2 characters.').max(100, 'Full name is too long.'),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().regex(phoneRegex, 'Please enter a valid 10-digit Indian mobile number.'),
  email: z.string().email('Please enter a valid email address.'),

  // Section 03 – Address
  houseNo: z.string().optional(),
  street: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  mandal: z.string().optional(),
  pincode: z.string()
    .optional()
    .refine(val => !val || /^\d{6}$/.test(val), { message: 'Pincode must be exactly 6 digits.' }),

  // Section 04 – Qualification
  highestQualification: z.string().min(1, 'Please select the highest qualification.'),
  course: z.string().optional(),
  institution: z.string().optional(),
  yearOfPassing: z.string().optional(),

  // Section 05 – Government IDs
  aadhaar: z.string().regex(/^\d{12}$/, 'Aadhaar number must contain exactly 12 digits.'),
  pan: z.string().regex(panRegex, 'Please enter a valid PAN number (e.g., ABCDE1234F).'),

  // Section 06 – Bank Details
  accountHolderName: z.string().min(1, 'Account holder name is required.'),
  bankName: z.string().min(1, 'Bank name is required.'),
  accountNumber: z.string().min(8, 'Please enter a valid account number.'),
  reEnterAccountNumber: z.string().min(1, 'Please confirm the account number.'),
  ifsc: z.string().regex(ifscRegex, 'Please enter a valid IFSC code (e.g., SBIN0001234).'),
  branchName: z.string().optional(),

  // Section 07 – Reference / Emergency Contact
  referenceName: z.string().min(1, 'Reference name is required.'),
  referenceMobile: z.string().regex(phoneRegex, 'Please enter a valid 10-digit mobile number.'),
  relationship: z.string().min(1, 'Please select the relationship.'),
  referenceAddress: z.string().optional(),
}).refine(
  data => !data.accountNumber || !data.reEnterAccountNumber || data.accountNumber === data.reEnterAccountNumber,
  { message: 'Account numbers do not match.', path: ['reEnterAccountNumber'] }
);

export const draftSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.').optional().or(z.literal('')),
  email: z.string().email('Please enter a valid email address.').optional().or(z.literal('')),
});
