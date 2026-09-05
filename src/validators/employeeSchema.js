/**
 * src/validators/employeeSchema.js
 * Production validation schema for the Add/Edit Employee form.
 * Only validates the 18 required fields — no extras.
 */
import { z } from 'zod';

// ── Phone: Indian 10-digit mobile ────────────────────────────────────────────
const phoneSchema = z
  .string()
  .min(1, 'Phone number is required.')
  .transform(v => v.replace(/\s/g, ''))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number.'));

// ── PAN: ABCDE1234F format ────────────────────────────────────────────────────
const panSchema = z
  .string()
  .min(1, 'PAN number is required.')
  .transform(v => v.toUpperCase().trim())
  .pipe(z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Enter a valid PAN (e.g. ABCDE1234F).'));

// ── IFSC: SBIN0001234 format ──────────────────────────────────────────────────
const ifscSchema = z
  .string()
  .min(1, 'IFSC code is required.')
  .transform(v => v.toUpperCase().trim())
  .pipe(z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid IFSC code (e.g. SBIN0001234).'));

// ── Aadhaar: 12 digits (formatted as XXXX-XXXX-XXXX in UI) ──────────────────
const aadhaarSchema = z
  .string()
  .min(1, 'Aadhaar number is required.')
  .transform(v => v.replace(/-/g, '').trim())
  .pipe(z.string().regex(/^\d{12}$/, 'Enter a valid 12-digit Aadhaar number.'));

// ── Account number ────────────────────────────────────────────────────────────
const accountSchema = z
  .string()
  .min(1, 'Account number is required.')
  .transform(v => v.trim())
  .pipe(z.string().regex(/^\d{9,18}$/, 'Enter a valid bank account number (9–18 digits).'));

// ── Main employee schema ──────────────────────────────────────────────────────
export const employeeSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required.')
      .transform(v => v.trim())
      .pipe(z.string().min(2, 'Name must be at least 2 characters.')),

    address: z
      .string()
      .min(1, 'Address is required.')
      .transform(v => v.trim())
      .pipe(z.string().min(5, 'Please enter a complete address.')),

    phone: phoneSchema,

    email: z
      .string()
      .min(1, 'Email is required.')
      .transform(v => v.trim().toLowerCase())
      .pipe(z.string().email('Enter a valid email address.')),

    qualification: z
      .string()
      .min(1, 'Qualification is required.')
      .transform(v => v.trim()),

    course: z
      .string()
      .min(1, 'Course is required.')
      .transform(v => v.trim()),

    university: z
      .string()
      .min(1, 'University/Board is required.')
      .transform(v => v.trim()),

    year_of_passing: z
      .string()
      .min(4, 'Year is required.')
      .transform(v => v.trim()),

    // Photo: required File object from PhotoUploader
    photo: z
      .any()
      .refine(v => v?.file instanceof File, 'Candidate photo is required.'),

    aadhaar: aadhaarSchema,

    aadhaarDocument: z
      .any()
      .refine(v => v?.file instanceof File, 'Aadhaar document is required.'),

    pan: panSchema,

    panDocument: z
      .any()
      .refine(v => v?.file instanceof File, 'PAN document is required.'),

    // Passbook: required File object from DocumentUploader
    passbook: z
      .any()
      .refine(v => v?.file instanceof File, 'Bank passbook is required.'),

    accountHolderName: z
      .string()
      .min(1, 'Account holder name is required.')
      .transform(v => v.trim()),

    bankName: z
      .string()
      .min(1, 'Bank name is required.')
      .transform(v => v.trim()),

    accountNumber: accountSchema,

    reEnterAccountNumber: z
      .string()
      .min(1, 'Please re-enter the account number.'),

    ifsc: ifscSchema,

    branchName: z
      .string()
      .min(1, 'Branch name is required.')
      .transform(v => v.trim()),

    referenceMobile: phoneSchema,

    referenceName: z
      .string()
      .min(1, 'Reference person name is required.')
      .transform(v => v.trim()),

    relationship: z
      .string()
      .min(1, 'Relationship is required.'),

    stateId: z
      .string()
      .min(1, 'Please select a state.'),

    districtId: z
      .string()
      .min(1, 'Please select a district.'),

    mandalId: z
      .string()
      .min(1, 'Please select a mandal.'),
  })
  .refine(
    data => {
      const a = (data.accountNumber || '').replace(/\s/g, '');
      const b = (data.reEnterAccountNumber || '').replace(/\s/g, '');
      return a === b;
    },
    {
      message: 'Account numbers do not match.',
      path: ['reEnterAccountNumber'],
    }
  );

// Schema used for edit mode (photo/passbook optional — kept if not replaced)
export const employeeEditSchema = z
  .object({
    name: z.string().min(1, 'Name is required.').transform(v => v.trim()),
    address: z.string().min(1, 'Address is required.').transform(v => v.trim()),
    phone: phoneSchema,
    email: z.string().min(1, 'Email is required.').transform(v => v.trim().toLowerCase()).pipe(z.string().email('Enter a valid email address.')),
    qualification: z.string().min(1, 'Qualification is required.').transform(v => v.trim()),
    course: z.string().min(1, 'Course is required.').transform(v => v.trim()),
    university: z.string().min(1, 'University/Board is required.').transform(v => v.trim()),
    year_of_passing: z.string().min(4, 'Year is required.').transform(v => v.trim()),
    photo: z.any().optional().nullable(),
    aadhaar: aadhaarSchema,
    aadhaarDocument: z.any().optional().nullable(),
    pan: panSchema,
    panDocument: z.any().optional().nullable(),
    passbook: z.any().optional().nullable(),
    accountHolderName: z.string().min(1, 'Account holder name is required.').transform(v => v.trim()),
    bankName: z.string().min(1, 'Bank name is required.').transform(v => v.trim()),
    accountNumber: accountSchema,
    reEnterAccountNumber: z.string().min(1, 'Please re-enter the account number.'),
    ifsc: ifscSchema,
    branchName: z.string().min(1, 'Branch name is required.').transform(v => v.trim()),
    referenceMobile: phoneSchema,
    referenceName: z.string().min(1, 'Reference person name is required.').transform(v => v.trim()),
    relationship: z.string().min(1, 'Relationship is required.'),
    stateId: z.string().min(1, 'Please select a state.'),
    districtId: z.string().min(1, 'Please select a district.'),
    mandalId: z.string().min(1, 'Please select a mandal.'),
  })
  .refine(
    data => {
      const a = (data.accountNumber || '').replace(/\s/g, '');
      const b = (data.reEnterAccountNumber || '').replace(/\s/g, '');
      return a === b;
    },
    { message: 'Account numbers do not match.', path: ['reEnterAccountNumber'] }
  );
