import React, { useState, useRef, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Briefcase,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  FileText,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building2,
  Trash2,
  Plus,
  Eraser,
  PenTool,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { jobApplicationSchema } from '../../validators/applicationSchema';
import { applicationService } from '../../services/applicationService';
import { COMPANY_INFO } from '../../data/companyInfo';
import { Button } from '../../components/ui/Button';

const DEFAULT_QUALIFICATIONS = [
  { qualification: 'SSC / 10th', school: '', stream: 'General', year: '', score: '' },
  { qualification: 'Intermediate / Diploma', school: '', stream: '', year: '', score: '' },
  { qualification: 'Graduation (Degree)', school: '', stream: '', year: '', score: '' },
  { qualification: 'Post-Graduation / Other', school: '', stream: '', year: '', score: '' },
];

export default function JobApplication() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [errorBanner, setErrorBanner] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [signatureData, setSignatureData] = useState('');
  const [sameAsPresent, setSameAsPresent] = useState(false);
  const [signatureMode, setSignatureMode] = useState('draw'); // 'draw' | 'upload'
  const [isDrawing, setIsDrawing] = useState(false);

  const fileInputRef = useRef(null);
  const sigFileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: {
      positionAppliedFor: searchParams.get('position') || 'MSME ZED Certification Field Work',
      applicationDate: new Date().toISOString().split('T')[0],
      fullName: '',
      fatherName: '',
      dateOfBirth: '',
      gender: 'Male',
      mobileNumber: '',
      alternateMobile: '',
      emailAddress: '',
      maritalStatus: 'Single',
      aadhaarNumber: '',
      twoWheelerAndLicense: true,
      presentAddress: '',
      permanentAddress: '',
      candidatePhotoUrl: '',
      qualifications: DEFAULT_QUALIFICATIONS,
      isFresher: false,
      workExperience: [
        { company: '', designation: '', duration: '', responsibilities: '' },
      ],
      languagesKnown: ['Telugu', 'English'],
      languagesOther: '',
      willingToTravel: true,
      preferredArea: '',
      place: 'Ongole',
      declarationAccepted: true,
      signatureUrl: '',
    },
  });

  const watchPresentAddress = watch('presentAddress');
  const watchIsFresher = watch('isFresher');
  const watchPosition = watch('positionAppliedFor');
  const watchLanguages = watch('languagesKnown') || [];

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control,
    name: 'workExperience',
  });

  // Handle "Same as Present Address"
  useEffect(() => {
    if (sameAsPresent) {
      setValue('permanentAddress', watchPresentAddress, { shouldValidate: true });
    }
  }, [sameAsPresent, watchPresentAddress, setValue]);

  // Handle Signature Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [signatureMode]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setSignatureData(dataUrl);
      setValue('signatureUrl', dataUrl, { shouldValidate: true });
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignatureData('');
    setValue('signatureUrl', '');
  };

  // Photo upload handler
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG)');
      return;
    }

    try {
      const preview = URL.createObjectURL(file);
      setPhotoPreview(preview);
      const uploadedUrl = await applicationService.uploadPhoto(file);
      setValue('candidatePhotoUrl', uploadedUrl || preview);
    } catch (err) {
      console.warn('Photo processing warning:', err);
    }
  };

  // Signature file upload handler
  const handleSignatureFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSignatureData(reader.result);
      setValue('signatureUrl', reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Language checkbox toggler
  const handleLanguageToggle = (lang) => {
    const current = [...watchLanguages];
    const index = current.indexOf(lang);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(lang);
    }
    setValue('languagesKnown', current, { shouldValidate: true });
  };

  // Form submission
  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    setErrorBanner('');

    try {
      // Ensure signature was captured
      const submissionPayload = {
        ...formData,
        signatureUrl: signatureData || formData.signatureUrl,
        candidatePhotoUrl: photoPreview || formData.candidatePhotoUrl,
      };

      const result = await applicationService.submitApplication(submissionPayload);

      setSubmissionSuccess({
        applicationNo: result.applicationNo || result.application?.application_no || 'APP-2026-CONFIRMED',
        application: result.application || submissionPayload,
      });

      // Trigger celebratory confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submission failed:', err);
      setErrorBanner(err.message || 'Failed to submit application. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 py-6 sm:py-10 px-3 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Top Navigation & Back ───────────────────────────────────── */}
        <div className="flex items-center justify-between no-print">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition bg-white px-3.5 py-2 rounded-xl shadow-xs border border-slate-200"
          >
            <ArrowLeft size={14} />
            <span>Admin Portal</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/employee/login"
              className="text-xs font-bold text-[#E63946] hover:underline px-2"
            >
              Employee Login
            </Link>
            {submissionSuccess && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrint}
                className="gap-2 text-xs font-semibold h-9"
              >
                <Printer size={14} />
                <span>Print Application</span>
              </Button>
            )}
          </div>
        </div>

        {/* ── Error Banner ───────────────────────────────────────────── */}
        {errorBanner && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 animate-in fade-in no-print">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <p className="font-medium">{errorBanner}</p>
          </div>
        )}

        {/* ── Success Card (Shown after successful submission) ────────── */}
        {submissionSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 sm:p-8 text-center space-y-2">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto shadow-inner mb-3">
                <CheckCircle2 size={32} className="text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-wide">
                Application Submitted Successfully!
              </h2>
              <p className="text-emerald-100 text-xs sm:text-sm max-w-lg mx-auto">
                Thank you for applying to DS PROJECTS PRIVATE LIMITED. Your application credentials have been registered in our system.
              </p>
              <div className="inline-block mt-3 px-5 py-2 bg-white text-emerald-900 rounded-full font-mono text-sm sm:text-base font-black shadow-md tracking-wider">
                Application No: {submissionSuccess.applicationNo}
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-xs text-emerald-950 space-y-3">
                <p className="font-extrabold text-emerald-900 text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Confirmation Email Sent &bull; Next Steps (4 to 5 Days Window):</span>
                </p>
                <ul className="list-disc pl-5 space-y-2 text-emerald-900 leading-relaxed font-medium">
                  <li>
                    A formal confirmation email with your <strong>Application Number ({submissionSuccess.applicationNo})</strong> has been dispatched to your registered email address.
                  </li>
                  <li>
                    <strong>Our recruitment and field operations team will connect with you within 4 to 5 working days</strong> via phone call or email regarding the interview schedule, mandal allocation, and field orientation.
                  </li>
                  <li>Please keep your Application Number safe for future correspondence.</li>
                  <li>Bring your original educational certificates, Aadhaar card, and driving license at the time of field verification.</li>
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 no-print pt-2">
                <Button
                  type="button"
                  onClick={handlePrint}
                  className="bg-[#1e3a8a] hover:bg-[#1e293b] text-white gap-2 font-bold px-6 h-11 rounded-xl shadow-md"
                >
                  <Printer size={16} />
                  <span>Download / Print Application Copy</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSubmissionSuccess(null);
                    window.location.reload();
                  }}
                  className="gap-2 font-semibold h-11 rounded-xl"
                >
                  <span>Submit Another Application</span>
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* ── Official A4 Document Application Form ──────────────────── */}
        <div className={`bg-white rounded-2xl shadow-xl border border-slate-300 p-6 sm:p-10 ${submissionSuccess ? 'print:block mt-6' : 'block'}`}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            {/* ── 1. HEADER BRANDING & PHOTO (Matching Image 1) ────────── */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b-2 border-slate-800">
              {/* Left Branding */}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#1e3a8a] tracking-tight">
                    DSPROJECTS
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-700">
                  Corporate Office: {COMPANY_INFO.addressLine1} {COMPANY_INFO.addressLine2}
                </p>
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <p>
                    <span className="font-semibold text-slate-800">Phone:</span> {COMPANY_INFO.phone} &nbsp;|&nbsp;
                    <span className="font-semibold text-slate-800">Email:</span> {COMPANY_INFO.email}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-800">Website:</span> {COMPANY_INFO.website} &nbsp;|&nbsp;
                    <span className="font-semibold text-slate-800">UDYAM:</span> {COMPANY_INFO.udyamNumber}
                  </p>
                </div>
              </div>

              {/* Right: Passport Photo Box */}
              <div className="w-32 h-40 border-2 border-dashed border-slate-400 bg-slate-50 rounded-lg flex flex-col items-center justify-center p-2 text-center relative overflow-hidden shrink-0 group">
                {photoPreview ? (
                  <>
                    <img
                      src={photoPreview}
                      alt="Passport Photo"
                      className="w-full h-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview('');
                        setValue('candidatePhotoUrl', '');
                      }}
                      className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full shadow-md hover:bg-rose-700 no-print"
                      title="Remove photo"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer space-y-1 text-slate-500 hover:text-slate-800 transition"
                  >
                    <Camera size={24} className="mx-auto text-slate-400" />
                    <p className="text-[10px] font-medium leading-tight">
                      Affix Recent Passport Size Photograph
                    </p>
                    <span className="text-[9px] text-[#1e3a8a] font-bold block no-print hover:underline">
                      Click to Upload
                    </span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </div>
            </div>

            {/* ── 2. BLUE BANNER TITLE BAR (Matching Image 1) ─────────── */}
            <div className="bg-[#1e3a8a] text-white px-4 py-2.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
              <span className="font-black text-sm tracking-wider uppercase">
                JOB APPLICATION FORM
              </span>
              <span className="text-xs font-semibold bg-white/15 px-3 py-1 rounded-md text-sky-100 border border-white/20">
                Post: {watchPosition}
              </span>
            </div>

            {/* ── 3. SUBHEADER METADATA (Position, Date, App No) ──────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Position Applied For:
                </label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 font-semibold text-slate-800 text-xs"
                  {...register('positionAppliedFor')}
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Date:</label>
                <input
                  type="date"
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 font-semibold text-slate-800 text-xs"
                  {...register('applicationDate')}
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">App. No.:</label>
                <input
                  type="text"
                  readOnly
                  placeholder="(Auto-generated upon submission)"
                  className="w-full bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-500 font-mono text-xs cursor-not-allowed"
                />
              </div>
            </div>

            {/* ── 4. SECTION 1: PERSONAL DETAILS ──────────────────────── */}
            <div className="space-y-4">
              <div className="border-b border-slate-300 pb-1.5">
                <h3 className="font-black text-slate-900 text-sm tracking-wide uppercase flex items-center gap-2">
                  <span className="bg-[#1e3a8a] text-white w-5 h-5 rounded-full inline-flex items-center justify-center text-xs">1</span>
                  PERSONAL DETAILS
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Full Name (Block Letters) *
                  </label>
                  <input
                    type="text"
                    placeholder="ENTER FULL NAME AS PER AADHAAR / CERTIFICATES"
                    className="w-full uppercase font-medium bg-slate-50 focus:bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#1e3a8a] transition"
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Father's / Guardian's Name */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Father's / Guardian's Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Father or Guardian Name"
                    className="w-full font-medium bg-slate-50 focus:bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#1e3a8a] transition"
                    {...register('fatherName')}
                  />
                  {errors.fatherName && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.fatherName.message}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    className="w-full font-medium bg-slate-50 focus:bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#1e3a8a] transition"
                    {...register('dateOfBirth')}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Gender *
                  </label>
                  <div className="flex items-center gap-4 pt-1.5">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <label key={g} className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input
                          type="radio"
                          value={g}
                          className="text-[#1e3a8a] focus:ring-[#1e3a8a]"
                          {...register('gender')}
                        />
                        <span>{g}</span>
                      </label>
                    ))}
                  </div>
                  {errors.gender && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.gender.message}</p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-3 py-2 font-medium bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#1e3a8a] transition"
                      {...register('mobileNumber')}
                    />
                  </div>
                  {errors.mobileNumber && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.mobileNumber.message}</p>
                  )}
                </div>

                {/* Alternate No. */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Alternate No.
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="Optional alternate contact"
                      className="w-full pl-12 pr-3 py-2 font-medium bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#1e3a8a] transition"
                      {...register('alternateMobile')}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="candidate@example.com"
                    className="w-full font-medium bg-slate-50 focus:bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#1e3a8a] transition"
                    {...register('emailAddress')}
                  />
                  {errors.emailAddress && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.emailAddress.message}</p>
                  )}
                </div>

                {/* Marital Status */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Marital Status *
                  </label>
                  <div className="flex items-center gap-4 pt-1.5">
                    {['Single', 'Married'].map((m) => (
                      <label key={m} className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input
                          type="radio"
                          value={m}
                          className="text-[#1e3a8a] focus:ring-[#1e3a8a]"
                          {...register('maritalStatus')}
                        />
                        <span>{m}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Aadhaar / ID Proof No. */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Aadhaar / ID Proof No.
                  </label>
                  <input
                    type="text"
                    maxLength={14}
                    placeholder="12-digit Aadhaar or Voter ID"
                    className="w-full font-medium bg-slate-50 focus:bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#1e3a8a] transition"
                    {...register('aadhaarNumber')}
                  />
                </div>

                {/* Two-Wheeler & License */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Two-Wheeler & License *
                  </label>
                  <div className="flex items-center gap-4 pt-1.5">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                      <input
                        type="radio"
                        name="twoWheeler"
                        checked={watch('twoWheelerAndLicense') === true}
                        onChange={() => setValue('twoWheelerAndLicense', true)}
                        className="text-[#1e3a8a] focus:ring-[#1e3a8a]"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                      <input
                        type="radio"
                        name="twoWheeler"
                        checked={watch('twoWheelerAndLicense') === false}
                        onChange={() => setValue('twoWheelerAndLicense', false)}
                        className="text-[#1e3a8a] focus:ring-[#1e3a8a]"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                {/* Present Address */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Present Address *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="House/Door No, Street/Colony, Village/Mandal, District, Pincode"
                    className="w-full font-medium bg-slate-50 focus:bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#1e3a8a] transition"
                    {...register('presentAddress')}
                  />
                  {errors.presentAddress && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.presentAddress.message}</p>
                  )}
                </div>

                {/* Permanent Address */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">
                      Permanent Address *
                    </label>
                    <label className="inline-flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer no-print">
                      <input
                        type="checkbox"
                        checked={sameAsPresent}
                        onChange={(e) => setSameAsPresent(e.target.checked)}
                        className="rounded text-[#1e3a8a] focus:ring-[#1e3a8a]"
                      />
                      <span>Same as Present Address</span>
                    </label>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Permanent Residence Address"
                    disabled={sameAsPresent}
                    className={`w-full font-medium border border-slate-300 rounded-lg px-3 py-2 text-xs transition ${
                      sameAsPresent ? 'bg-slate-100 text-slate-500' : 'bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#1e3a8a]'
                    }`}
                    {...register('permanentAddress')}
                  />
                  {errors.permanentAddress && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.permanentAddress.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── 5. SECTION 2: EDUCATIONAL QUALIFICATIONS (Table) ────── */}
            <div className="space-y-3">
              <div className="border-b border-slate-300 pb-1.5">
                <h3 className="font-black text-slate-900 text-sm tracking-wide uppercase flex items-center gap-2">
                  <span className="bg-[#1e3a8a] text-white w-5 h-5 rounded-full inline-flex items-center justify-center text-xs">2</span>
                  EDUCATIONAL QUALIFICATIONS
                </h3>
              </div>

              <div className="overflow-x-auto border border-slate-300 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                      <th className="p-2.5 w-1/4 border-r border-slate-300">Qualification</th>
                      <th className="p-2.5 w-1/3 border-r border-slate-300">School / College / University</th>
                      <th className="p-2.5 w-1/5 border-r border-slate-300">Specialization / Stream</th>
                      <th className="p-2.5 w-20 border-r border-slate-300 text-center">Year</th>
                      <th className="p-2.5 w-24 text-center">% / CGPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEFAULT_QUALIFICATIONS.map((item, idx) => (
                      <tr key={item.qualification} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold text-slate-800 border-r border-slate-300 bg-slate-50/40">
                          {item.qualification}
                          <input
                            type="hidden"
                            value={item.qualification}
                            {...register(`qualifications.${idx}.qualification`)}
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="Institution / Board"
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-[#1e3a8a]"
                            {...register(`qualifications.${idx}.school`)}
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="e.g. MPC / B.Tech / B.Com"
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-[#1e3a8a]"
                            {...register(`qualifications.${idx}.stream`)}
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-300">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="YYYY"
                            className="w-full text-center bg-white border border-slate-200 rounded px-1.5 py-1 text-xs focus:ring-1 focus:ring-[#1e3a8a]"
                            {...register(`qualifications.${idx}.year`)}
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="e.g. 78%"
                            className="w-full text-center bg-white border border-slate-200 rounded px-1.5 py-1 text-xs focus:ring-1 focus:ring-[#1e3a8a]"
                            {...register(`qualifications.${idx}.score`)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Page 1 Document Footer (matching image) */}
              <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200">
                <span>DSPROJECTS — Ongole | www.dsprojectss.com | +91 9701529191</span>
                <span>Page 1 of 2</span>
              </div>
            </div>

            {/* ── 6. SECTION 3: WORK EXPERIENCE & FIELD READINESS (Image 2) ─ */}
            <div className="space-y-4 pt-4 border-t-2 border-slate-800">
              <div className="border-b border-slate-300 pb-1.5 flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-sm tracking-wide uppercase flex items-center gap-2">
                  <span className="bg-[#1e3a8a] text-white w-5 h-5 rounded-full inline-flex items-center justify-center text-xs">3</span>
                  WORK EXPERIENCE & FIELD READINESS
                </h3>

                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer no-print">
                  <input
                    type="checkbox"
                    checked={watchIsFresher}
                    onChange={(e) => setValue('isFresher', e.target.checked)}
                    className="rounded text-[#1e3a8a] focus:ring-[#1e3a8a]"
                  />
                  <span>I am a Fresher (No Experience)</span>
                </label>
              </div>

              {/* Work Experience Table */}
              {!watchIsFresher && (
                <div className="space-y-2">
                  <div className="overflow-x-auto border border-slate-300 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                          <th className="p-2.5 w-1/3 border-r border-slate-300">Organization / Company Name</th>
                          <th className="p-2.5 w-1/4 border-r border-slate-300">Designation / Role</th>
                          <th className="p-2.5 w-1/5 border-r border-slate-300">Duration (From – To)</th>
                          <th className="p-2.5 border-r border-slate-300">Key Responsibilities</th>
                          <th className="p-2.5 w-12 text-center no-print">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expFields.map((field, idx) => (
                          <tr key={field.id} className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50/50">
                            <td className="p-1.5 border-r border-slate-300">
                              <input
                                type="text"
                                placeholder="Previous Employer / Firm"
                                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                                {...register(`workExperience.${idx}.company`)}
                              />
                            </td>
                            <td className="p-1.5 border-r border-slate-300">
                              <input
                                type="text"
                                placeholder="Role / Position"
                                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                                {...register(`workExperience.${idx}.designation`)}
                              />
                            </td>
                            <td className="p-1.5 border-r border-slate-300">
                              <input
                                type="text"
                                placeholder="e.g. 2022 - 2024"
                                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                                {...register(`workExperience.${idx}.duration`)}
                              />
                            </td>
                            <td className="p-1.5 border-r border-slate-300">
                              <input
                                type="text"
                                placeholder="Brief summary of duties"
                                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                                {...register(`workExperience.${idx}.responsibilities`)}
                              />
                            </td>
                            <td className="p-1.5 text-center no-print">
                              {expFields.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeExp(idx)}
                                  className="text-rose-500 hover:text-rose-700 p-1"
                                  title="Remove row"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end no-print">
                    <button
                      type="button"
                      onClick={() => appendExp({ company: '', designation: '', duration: '', responsibilities: '' })}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1e3a8a] hover:underline"
                    >
                      <Plus size={14} />
                      <span>Add Another Company</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Languages Known */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-2">
                <label className="font-bold text-slate-800 block">
                  Languages Known:
                </label>
                <div className="flex flex-wrap items-center gap-5">
                  {['Telugu', 'English', 'Hindi'].map((lang) => (
                    <label key={lang} className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={watchLanguages.includes(lang)}
                        onChange={() => handleLanguageToggle(lang)}
                        className="rounded text-[#1e3a8a] focus:ring-[#1e3a8a]"
                      />
                      <span>{lang}</span>
                    </label>
                  ))}

                  <div className="inline-flex items-center gap-2">
                    <span className="font-medium text-slate-600">Other:</span>
                    <input
                      type="text"
                      placeholder="Specify other language"
                      className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs w-44"
                      {...register('languagesOther')}
                    />
                  </div>
                </div>
              </div>

              {/* Field Work Readiness */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-slate-800">
                    Willing to travel locally for MSME unit visits &amp; ZED documentation? *
                  </span>
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                      <input
                        type="radio"
                        name="travel"
                        checked={watch('willingToTravel') === true}
                        onChange={() => setValue('willingToTravel', true)}
                        className="text-[#1e3a8a] focus:ring-[#1e3a8a]"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                      <input
                        type="radio"
                        name="travel"
                        checked={watch('willingToTravel') === false}
                        onChange={() => setValue('willingToTravel', false)}
                        className="text-[#1e3a8a] focus:ring-[#1e3a8a]"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Preferred Area / Mandals / District *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ongole / Prakasam / Guntur"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium"
                      {...register('preferredArea')}
                    />
                    {errors.preferredArea && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.preferredArea.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── 7. SECTION 4: DECLARATION (Matching Image 2) ─────────── */}
            <div className="space-y-4">
              <div className="border-b border-slate-300 pb-1.5">
                <h3 className="font-black text-slate-900 text-sm tracking-wide uppercase flex items-center gap-2">
                  <span className="bg-[#1e3a8a] text-white w-5 h-5 rounded-full inline-flex items-center justify-center text-xs">4</span>
                  DECLARATION
                </h3>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-4 text-[11px] text-slate-700 leading-relaxed space-y-2">
                <p className="italic">
                  "I hereby declare that all the information furnished above is true, complete, and correct to the best of my knowledge and belief. I understand that any false information or suppression of facts may lead to disqualification or termination of my candidature/appointment at DSPROJECTS."
                </p>
                <label className="flex items-center gap-2 font-bold text-slate-900 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    className="rounded text-[#1e3a8a] focus:ring-[#1e3a8a]"
                    {...register('declarationAccepted')}
                  />
                  <span>I agree and confirm the declaration *</span>
                </label>
                {errors.declarationAccepted && (
                  <p className="text-[11px] text-rose-600">{errors.declarationAccepted.message}</p>
                )}
              </div>

              {/* Sign-off Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Place *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ongole"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium"
                    {...register('place')}
                  />
                  {errors.place && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.place.message}</p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 focus:bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium"
                    {...register('applicationDate')}
                  />
                </div>

                {/* Signature Block */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">
                      Signature of Applicant *
                    </label>
                    <div className="flex gap-2 text-[10px] no-print">
                      <button
                        type="button"
                        onClick={() => setSignatureMode('draw')}
                        className={`font-semibold ${signatureMode === 'draw' ? 'text-[#1e3a8a] underline' : 'text-slate-500'}`}
                      >
                        Draw
                      </button>
                      <span>|</span>
                      <button
                        type="button"
                        onClick={() => setSignatureMode('upload')}
                        className={`font-semibold ${signatureMode === 'upload' ? 'text-[#1e3a8a] underline' : 'text-slate-500'}`}
                      >
                        Upload
                      </button>
                    </div>
                  </div>

                  {signatureMode === 'draw' ? (
                    <div className="border border-slate-300 bg-slate-50 rounded-lg p-1.5 relative">
                      <canvas
                        ref={canvasRef}
                        width={240}
                        height={70}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-18 bg-white border border-dashed border-slate-300 rounded cursor-crosshair touch-none"
                      />
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="absolute bottom-2 right-2 text-[10px] bg-slate-200 hover:bg-slate-300 px-2 py-0.5 rounded text-slate-700 no-print flex items-center gap-1"
                      >
                        <Eraser size={10} />
                        Clear
                      </button>
                    </div>
                  ) : (
                    <div className="border border-slate-300 bg-slate-50 rounded-lg p-2 text-center">
                      {signatureData ? (
                        <div className="relative">
                          <img src={signatureData} alt="Signature" className="h-16 mx-auto object-contain" />
                          <button
                            type="button"
                            onClick={() => setSignatureData('')}
                            className="text-[10px] text-rose-600 font-bold block mx-auto mt-1 no-print"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => sigFileInputRef.current?.click()}
                          className="cursor-pointer py-3 text-slate-500 hover:text-slate-800"
                        >
                          <Upload size={16} className="mx-auto text-slate-400 mb-1" />
                          <span className="text-[11px] font-semibold text-[#1e3a8a]">Click to upload signature</span>
                          <input
                            ref={sigFileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleSignatureFile}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── 8. SECTION 5: FOR OFFICE USE ONLY (Matching Image 2) ─── */}
            <div className="bg-slate-50/80 border-2 border-dashed border-slate-300 rounded-xl p-4 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-black text-slate-800 tracking-wider text-[11px] uppercase">
                  FOR OFFICE USE ONLY (DSPROJECTS, ONGOLE)
                </span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                  Official Verification Section
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-600 block mb-1">Interview Date:</label>
                  <div className="border-b border-slate-400 py-1 font-mono text-slate-500">
                    _________________________
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 block mb-1">Status:</label>
                  <div className="flex items-center gap-3 pt-1 text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-3.5 h-3.5 border border-slate-400 inline-block rounded-xs"></span> Selected
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-3.5 h-3.5 border border-slate-400 inline-block rounded-xs"></span> Hold
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-3.5 h-3.5 border border-slate-400 inline-block rounded-xs"></span> Rejected
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 block mb-1">Authorized Signatory:</label>
                  <div className="border-b border-slate-400 py-1 font-mono text-slate-500">
                    _________________________
                  </div>
                </div>
              </div>
            </div>

            {/* Page 2 Document Footer (matching image) */}
            <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200">
              <span>DSPROJECTS — Ongole | www.dsprojectss.com | +91 9701529191</span>
              <span>Page 2 of 2</span>
            </div>

            {/* ── 9. SUBMIT BUTTON (no-print) ─────────────────────────── */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 no-print">
              <p className="text-xs text-slate-500">
                Please double-check all details before final submission.
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full sm:w-auto bg-[#E63946] hover:bg-[#FF6B6B] text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-[#E63946]/20 text-sm"
                >
                  <Briefcase size={16} className="mr-2" />
                  <span>Submit Application</span>
                </Button>
              </div>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
