import { z } from 'zod';

export const jobApplicationSchema = z.object({
  positionAppliedFor: z.string().default('MSME ZED Certification Field Work'),
  applicationDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  
  // 1. Personal Details
  fullName: z.string().min(2, 'Full Name is required (as per Govt ID)'),
  fatherName: z.string().min(2, "Father's / Guardian's Name is required"),
  dateOfBirth: z.string().min(1, 'Date of Birth is required'),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Please select gender' }),
  mobileNumber: z.string()
    .min(10, 'Mobile number must be at least 10 digits')
    .regex(/^[0-9+\s-]{10,15}$/, 'Please enter a valid contact phone number'),
  alternateMobile: z.string().optional().or(z.literal('')),
  emailAddress: z.string().email('Please enter a valid email address'),
  maritalStatus: z.enum(['Single', 'Married'], { required_error: 'Please select marital status' }),
  aadhaarNumber: z.string().optional().or(z.literal('')),
  twoWheelerAndLicense: z.boolean().default(false),
  presentAddress: z.string().min(5, 'Present address is required'),
  permanentAddress: z.string().min(5, 'Permanent address is required'),
  candidatePhotoUrl: z.string().optional().or(z.literal('')),

  // 2. Educational Qualifications
  qualifications: z.array(
    z.object({
      qualification: z.string(),
      school: z.string().optional().or(z.literal('')),
      stream: z.string().optional().or(z.literal('')),
      year: z.string().optional().or(z.literal('')),
      score: z.string().optional().or(z.literal('')),
    })
  ).default([
    { qualification: 'SSC / 10th', school: '', stream: 'General', year: '', score: '' },
    { qualification: 'Intermediate / Diploma', school: '', stream: '', year: '', score: '' },
    { qualification: 'Graduation (Degree)', school: '', stream: '', year: '', score: '' },
    { qualification: 'Post-Graduation / Other', school: '', stream: '', year: '', score: '' },
  ]),

  // 3. Work Experience & Field Readiness
  isFresher: z.boolean().default(false),
  workExperience: z.array(
    z.object({
      company: z.string().optional().or(z.literal('')),
      designation: z.string().optional().or(z.literal('')),
      duration: z.string().optional().or(z.literal('')),
      responsibilities: z.string().optional().or(z.literal('')),
    })
  ).default([]),
  languagesKnown: z.array(z.string()).min(1, 'Please select at least one language'),
  languagesOther: z.string().optional().or(z.literal('')),
  willingToTravel: z.boolean().default(true),
  preferredArea: z.string().min(2, 'Please enter preferred work area / mandal'),

  // 4. Declaration & Signature
  place: z.string().min(2, 'Please specify submission location/place'),
  declarationAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm and accept the declaration' }),
  }),
  signatureUrl: z.string().optional().or(z.literal('')),
});
