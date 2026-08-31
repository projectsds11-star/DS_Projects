import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Save, Check, ArrowLeft, Eye, EyeOff, User, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { employeeSchema } from '../../validators/employeeSchema';
import { employeeService, DISTRICT_MANDAL_MAP } from '../../services/employeeService';
import { Button } from '../../components/ui/Button';
import FormSection, { FormField, FormGrid } from '../../components/employee/FormSection';
import PhotoUploader from '../../components/employee/PhotoUploader';
import DocumentUploader from '../../components/employee/DocumentUploader';
import ConfirmationModal from '../../components/employee/ConfirmationModal';
import SuccessModal from '../../components/employee/SuccessModal';

// ─── Shared input class ────────────────────────────────────────────
const INPUT_BASE = 'flex h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition disabled:bg-gray-50 disabled:cursor-not-allowed';
const INPUT_ERROR = 'border-[var(--color-error)] focus:ring-[var(--color-error)]';
const SELECT_BASE = `${INPUT_BASE} cursor-pointer`;

// ─── Toast ────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      className={cn(
        'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white',
        type === 'success' ? 'bg-green-600' : type === 'draft' ? 'bg-[var(--color-primary)]' : 'bg-red-600'
      )}
    >
      {type === 'success' && <Check className="h-4 w-4" />}
      {message}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function AddEmployee() {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState('DS-001'); // placeholder, overwritten by service
  const idFetched = useRef(false); // guard against React StrictMode double-invoke
  const [photo, setPhoto] = useState(null);
  const [documents, setDocuments] = useState({
    aadhaarDoc: null, panDoc: null, passbook: null,
    qualCert: null, resume: null, otherDoc: null,
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState(null);
  const [toast, setToast] = useState(null);
  const [showAccNo, setShowAccNo] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: { status: 'Draft' },
  });

  const watchedAccountNo = watch('accountNumber', '');
  const watchedReEnter = watch('reEnterAccountNumber', '');
  const watchedName = watch('fullName', '');
  const accountsMatch = watchedAccountNo && watchedReEnter && watchedAccountNo === watchedReEnter;
  const accountsMismatch = watchedAccountNo && watchedReEnter && watchedAccountNo !== watchedReEnter;

  // Load next employee ID on mount — useRef guard prevents React StrictMode double-call
  useEffect(() => {
    if (idFetched.current) return;
    idFetched.current = true;
    employeeService.getNextEmployeeId().then(setEmployeeId);
  }, []);

  // Warn on unsaved changes
  useEffect(() => {
    const handleUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [isDirty]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // ── Aadhaar auto-format ────────────────────────────────────────
  const handleAadhaarChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    setValue('aadhaar', raw, { shouldValidate: true });
    e.target.value = raw.replace(/(\d{4})(?=\d)/g, '$1-');
  };

  const formatAadhaarDisplay = (raw = '') =>
    raw.replace(/(\d{4})(?=\d)/g, '$1-');

  // ── PAN auto-uppercase ─────────────────────────────────────────
  const handlePanChange = (e) => {
    const upper = e.target.value.toUpperCase().slice(0, 10);
    e.target.value = upper;
    setValue('pan', upper, { shouldValidate: true });
  };

  // ── IFSC auto-uppercase ────────────────────────────────────────
  const handleIfscChange = (e) => {
    const upper = e.target.value.toUpperCase().slice(0, 11);
    e.target.value = upper;
    setValue('ifsc', upper, { shouldValidate: true });
  };

  // ── Save Draft ─────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const values = getValues();
      await employeeService.saveEmployeeDraft({ ...values, employeeId, status: 'Draft' });
      showToast('Employee draft saved.', 'draft');
    } catch {
      showToast('Could not save draft. Please try again.', 'error');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // ── Submit (validate + show confirm) ──────────────────────────
  const onSubmit = () => {
    setShowConfirm(true);
  };

  // ── Confirm & Create ───────────────────────────────────────────
  const handleConfirmCreate = async () => {
    setIsSubmitting(true);
    try {
      const values = getValues();
      const username = employeeService.generateUsername(values.fullName, employeeId);
      const result = await employeeService.createEmployee({ ...values, employeeId, username });
      const emp = { ...result.data, employeeId, username };
      setCreatedEmployee(emp);
      setShowConfirm(false);
      setShowSuccess(true);
    } catch {
      showToast('Unable to create employee. Please try again.', 'error');
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const username = employeeService.generateUsername(watchedName, employeeId);

  const mandals = selectedDistrict ? (DISTRICT_MANDAL_MAP[selectedDistrict] || []) : [];

  // ── Reusable input builder ─────────────────────────────────────
  const field = (name, placeholder, type = 'text', extra = {}) => (
    <input
      id={name}
      type={type}
      placeholder={placeholder}
      className={cn(INPUT_BASE, errors[name] && INPUT_ERROR)}
      autoComplete={extra.autoComplete}
      maxLength={extra.maxLength}
      disabled={extra.disabled}
      {...register(name)}
      {...(extra.onChange ? { onChange: extra.onChange } : {})}
    />
  );

  const selectField = (name, options, placeholder = 'Select…', extra = {}) => (
    <select
      id={name}
      className={cn(SELECT_BASE, errors[name] && INPUT_ERROR)}
      disabled={extra.disabled}
      {...register(name)}
      {...(extra.onChange ? { onChange: extra.onChange } : {})}
    >
      <option value="">{placeholder}</option>
      {options.map(opt =>
        typeof opt === 'string'
          ? <option key={opt} value={opt}>{opt}</option>
          : <option key={opt.value} value={opt.value}>{opt.label}</option>
      )}
    </select>
  );

  return (
    <div className="space-y-6 pb-32">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate('/admin/employees')}
          className="mt-1 p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 shrink-0" aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <nav className="flex items-center gap-1 text-xs text-gray-400 mb-1">
            <Link to="/admin/employees" className="hover:text-[var(--color-primary)] transition-colors">Employees</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-600 font-medium">Add Employee</span>
          </nav>
          <h1 className="text-xl font-bold text-[var(--color-navy)]">Add New Employee</h1>
          <p className="text-sm text-gray-500 mt-0.5">Register a new employee and maintain their complete information.</p>
        </div>
      </div>

      {/* ── ID Banner ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-navy)] text-white rounded-xl px-6 py-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <User className="h-6 w-6 text-white/80" />
          </div>
          <div>
            <p className="text-xs text-blue-300 font-medium uppercase tracking-wider">New Employee</p>
            <p className="text-white font-semibold text-lg mt-0.5">Register Employee Record</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-blue-300">Employee ID</p>
          <p className="text-2xl font-mono font-bold text-white">{employeeId}</p>
          <p className="text-xs text-blue-300/70 mt-0.5">Auto-generated by system</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* ── SECTION 01 – IDENTIFICATION ─────────────────── */}
        <FormSection number={1} title="Employee Identification" description="System-assigned ID and employment status.">
          <FormGrid>
            <FormField label="Employee ID" helper="Automatically generated — cannot be changed.">
              <div className="relative">
                <input readOnly value={employeeId}
                  className="flex h-11 w-full rounded-lg border border-[var(--color-border)] bg-gray-50 px-3 py-2 text-sm font-mono font-semibold text-[var(--color-primary)] cursor-not-allowed" />
              </div>
            </FormField>
            <FormField label="Employee Status" error={errors.status?.message}>
              {selectField('status', ['Draft', 'Onboarding', 'Active', 'Inactive'])}
            </FormField>
          </FormGrid>
        </FormSection>

        {/* ── SECTION 02 – PERSONAL INFORMATION ───────────── */}
        <div className="mt-5">
          <FormSection number={2} title="Personal Information" description="Candidate's basic personal and contact details.">
            <div className="space-y-6">
              {/* Photo */}
              <PhotoUploader value={photo} onChange={setPhoto} />

              <div className="border-t border-gray-100" />

              <FormGrid>
                <FormField label="Full Name" required error={errors.fullName?.message} colSpan={2}>
                  {field('fullName', 'Enter candidate full name')}
                </FormField>

                <FormField label="Date of Birth" error={errors.dateOfBirth?.message}>
                  <input type="date" id="dateOfBirth"
                    className={cn(INPUT_BASE, errors.dateOfBirth && INPUT_ERROR)}
                    {...register('dateOfBirth')} />
                </FormField>

                <FormField label="Gender" error={errors.gender?.message}>
                  {selectField('gender', ['Male', 'Female', 'Other', 'Prefer not to say'])}
                </FormField>

                <FormField label="Phone Number" required error={errors.phone?.message}
                  helper="10-digit Indian mobile number without country code.">
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[var(--color-border)] bg-gray-50 text-gray-500 text-sm font-medium">+91</span>
                    <input id="phone" type="tel" maxLength={10} placeholder="9876543210"
                      className={cn(INPUT_BASE, 'rounded-l-none', errors.phone && INPUT_ERROR)}
                      {...register('phone')} />
                  </div>
                </FormField>

                <FormField label="Email Address" required error={errors.email?.message}>
                  {field('email', 'candidate@example.com', 'email', { autoComplete: 'email' })}
                </FormField>
              </FormGrid>
            </div>
          </FormSection>
        </div>

        {/* ── SECTION 03 – ADDRESS ────────────────────────── */}
        <div className="mt-5">
          <FormSection number={3} title="Address Details" description="Candidate's residential address information.">
            <FormGrid>
              <FormField label="House / Door No." error={errors.houseNo?.message}>
                {field('houseNo', 'e.g. 12-4/A')}
              </FormField>

              <FormField label="Street / Village" error={errors.street?.message}>
                {field('street', 'e.g. Gandhi Nagar')}
              </FormField>

              <FormField label="State" error={errors.state?.message}>
                {selectField('state', ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Other'])}
              </FormField>

              <FormField label="District" error={errors.district?.message}>
                {selectField(
                  'district',
                  Object.keys(DISTRICT_MANDAL_MAP),
                  'Select District',
                  {
                    onChange: (e) => {
                      setSelectedDistrict(e.target.value);
                      setValue('mandal', '');
                      setValue('district', e.target.value);
                    }
                  }
                )}
              </FormField>

              <FormField label="Mandal" error={errors.mandal?.message}
                helper={!selectedDistrict ? 'Please select a district first.' : undefined}>
                <select id="mandal"
                  className={cn(SELECT_BASE, errors.mandal && INPUT_ERROR, !selectedDistrict && 'text-gray-300')}
                  disabled={!selectedDistrict}
                  {...register('mandal')}
                >
                  <option value="">{selectedDistrict ? 'Select Mandal' : 'Select district first'}</option>
                  {mandals.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </FormField>

              <FormField label="Pincode" error={errors.pincode?.message}
                helper="Enter 6-digit pincode.">
                {field('pincode', '524001', 'text', { maxLength: 6 })}
              </FormField>
            </FormGrid>
          </FormSection>
        </div>

        {/* ── SECTION 04 – QUALIFICATION ──────────────────── */}
        <div className="mt-5">
          <FormSection number={4} title="Qualification Details" description="Educational background of the candidate.">
            <FormGrid>
              <FormField label="Highest Qualification" required error={errors.highestQualification?.message}>
                {selectField('highestQualification',
                  ['10th', 'Intermediate', 'ITI', 'Diploma', 'B.Tech / B.E', 'Degree', 'Post Graduation', 'MBA', 'MCA', 'Other'],
                  'Select Qualification'
                )}
              </FormField>

              <FormField label="Course / Degree" error={errors.course?.message}>
                {field('course', 'e.g. B.Sc Agriculture')}
              </FormField>

              <FormField label="Institution / College" error={errors.institution?.message}>
                {field('institution', 'e.g. ANGRAU Hyderabad')}
              </FormField>

              <FormField label="Year of Passing" error={errors.yearOfPassing?.message}>
                <input id="yearOfPassing" type="number" min="1990" max={new Date().getFullYear()}
                  placeholder={String(new Date().getFullYear())}
                  className={cn(INPUT_BASE, errors.yearOfPassing && INPUT_ERROR)}
                  {...register('yearOfPassing')} />
              </FormField>

              <FormField label="Qualification Certificate" colSpan={2}>
                <DocumentUploader label=""
                  value={documents.qualCert}
                  onChange={v => setDocuments(d => ({ ...d, qualCert: v }))}
                />
              </FormField>
            </FormGrid>
          </FormSection>
        </div>

        {/* ── SECTION 05 – GOVERNMENT IDs ──────────────────── */}
        <div className="mt-5">
          <FormSection number={5} title="Government ID Details" description="Aadhaar and PAN information for compliance.">
            <div className="space-y-6">
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <ShieldAlert className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">Aadhaar and PAN information is securely stored and encrypted. This data is used only for compliance and verification purposes.</p>
              </div>

              <FormGrid>
                {/* Aadhaar */}
                <FormField label="Aadhaar Number" required error={errors.aadhaar?.message}
                  helper="Enter 12-digit Aadhaar number. Hyphens are added automatically.">
                  <input id="aadhaar" type="text" inputMode="numeric" maxLength={14}
                    placeholder="1234-5678-9012"
                    defaultValue={formatAadhaarDisplay(getValues('aadhaar'))}
                    onChange={handleAadhaarChange}
                    className={cn(INPUT_BASE, 'font-mono tracking-widest', errors.aadhaar && INPUT_ERROR)} />
                </FormField>

                {/* PAN */}
                <FormField label="PAN Number" required error={errors.pan?.message}
                  helper="Auto-formatted to uppercase. e.g. ABCDE1234F">
                  <input id="pan" type="text" maxLength={10} placeholder="ABCDE1234F"
                    onChange={handlePanChange}
                    className={cn(INPUT_BASE, 'font-mono uppercase tracking-widest', errors.pan && INPUT_ERROR)}
                    {...register('pan')} />
                </FormField>

                {/* Aadhaar Document */}
                <FormField label="Aadhaar Document" colSpan={1}>
                  <DocumentUploader label=""
                    value={documents.aadhaarDoc}
                    onChange={v => setDocuments(d => ({ ...d, aadhaarDoc: v }))}
                  />
                </FormField>

                {/* PAN Document */}
                <FormField label="PAN Document" colSpan={1}>
                  <DocumentUploader label=""
                    value={documents.panDoc}
                    onChange={v => setDocuments(d => ({ ...d, panDoc: v }))}
                  />
                </FormField>
              </FormGrid>
            </div>
          </FormSection>
        </div>

        {/* ── SECTION 06 – BANK DETAILS ──────────────────── */}
        <div className="mt-5">
          <FormSection number={6} title="Bank Details" description="Salary disbursement account information.">
            <FormGrid>
              <FormField label="Account Holder Name" required error={errors.accountHolderName?.message}>
                {field('accountHolderName', 'As per bank records')}
              </FormField>

              <FormField label="Bank Name" required error={errors.bankName?.message}>
                {field('bankName', 'e.g. State Bank of India')}
              </FormField>

              {/* Account Number */}
              <FormField label="Account Number" required error={errors.accountNumber?.message}>
                <div className="relative">
                  <input id="accountNumber"
                    type={showAccNo ? 'text' : 'password'}
                    placeholder="Enter account number"
                    className={cn(INPUT_BASE, 'pr-10', errors.accountNumber && INPUT_ERROR)}
                    {...register('accountNumber')} />
                  <button type="button" tabIndex={-1}
                    onClick={() => setShowAccNo(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showAccNo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormField>

              {/* Re-enter Account Number */}
              <FormField label="Re-enter Account Number" required error={errors.reEnterAccountNumber?.message}>
                <div className="relative">
                  <input id="reEnterAccountNumber"
                    type="text"
                    placeholder="Re-enter to verify"
                    className={cn(INPUT_BASE, 'pr-10',
                      errors.reEnterAccountNumber && INPUT_ERROR,
                      accountsMatch && 'border-green-400 focus:ring-green-400'
                    )}
                    {...register('reEnterAccountNumber')} />
                  {accountsMatch && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {accountsMatch && (
                  <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Account numbers match
                  </p>
                )}
              </FormField>

              {/* IFSC */}
              <FormField label="IFSC Code" required error={errors.ifsc?.message}
                helper="e.g. SBIN0001234 — auto-formatted to uppercase.">
                <input id="ifsc" type="text" maxLength={11} placeholder="SBIN0001234"
                  onChange={handleIfscChange}
                  className={cn(INPUT_BASE, 'font-mono uppercase tracking-wider', errors.ifsc && INPUT_ERROR)}
                  {...register('ifsc')} />
              </FormField>

              <FormField label="Branch Name" error={errors.branchName?.message}>
                {field('branchName', 'e.g. Nellore Main Branch')}
              </FormField>

              {/* Passbook Upload */}
              <FormField label="Bank Passbook" required colSpan={2}>
                <DocumentUploader label=""
                  value={documents.passbook}
                  onChange={v => setDocuments(d => ({ ...d, passbook: v }))}
                  required
                />
              </FormField>
            </FormGrid>
          </FormSection>
        </div>

        {/* ── SECTION 07 – REFERENCE / EMERGENCY ──────────── */}
        <div className="mt-5">
          <FormSection number={7} title="Reference / Emergency Contact" description="A trusted contact for emergencies and reference.">
            <FormGrid>
              <FormField label="Reference Name" required error={errors.referenceName?.message}>
                {field('referenceName', 'Enter reference person name')}
              </FormField>

              <FormField label="Reference Mobile" required error={errors.referenceMobile?.message}>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[var(--color-border)] bg-gray-50 text-gray-500 text-sm font-medium">+91</span>
                  <input id="referenceMobile" type="tel" maxLength={10} placeholder="9876543210"
                    className={cn(INPUT_BASE, 'rounded-l-none', errors.referenceMobile && INPUT_ERROR)}
                    {...register('referenceMobile')} />
                </div>
              </FormField>

              <FormField label="Relationship" required error={errors.relationship?.message}>
                {selectField('relationship',
                  ['Father', 'Mother', 'Brother', 'Sister', 'Spouse', 'Relative', 'Friend', 'Guardian', 'Other'],
                  'Select Relationship'
                )}
              </FormField>

              <FormField label="Reference Address" error={errors.referenceAddress?.message} colSpan={2}>
                <textarea id="referenceAddress" rows={3} placeholder="Enter reference person's full address"
                  className={cn('flex w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition resize-none', errors.referenceAddress && INPUT_ERROR)}
                  {...register('referenceAddress')} />
              </FormField>
            </FormGrid>
          </FormSection>
        </div>

        {/* ── SECTION 08 – DOCUMENTS ──────────────────────── */}
        <div className="mt-5">
          <FormSection number={8} title="Employee Documents" description="Upload all required documents for onboarding.">
            <div className="grid gap-5 sm:grid-cols-2">
              <DocumentUploader label="Resume / CV" value={documents.resume}
                onChange={v => setDocuments(d => ({ ...d, resume: v }))} />
              <DocumentUploader label="Other Documents" value={documents.otherDoc}
                onChange={v => setDocuments(d => ({ ...d, otherDoc: v }))} />
            </div>
          </FormSection>
        </div>

        {/* ── SECTION 09 – ACCOUNT PREVIEW ───────────────── */}
        <div className="mt-5">
          <FormSection number={9} title="Account Preview" description="Auto-generated employee login credentials.">
            <div className="bg-gray-50 rounded-xl border border-[var(--color-border)] p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Employee Account</p>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <PreviewItem label="Employee ID" value={employeeId} mono />
                <PreviewItem label="Employee Name" value={watchedName || '—'} />
                <PreviewItem label="Email" value={watch('email') || '—'} />
                <PreviewItem label="Username" value={watchedName ? username : '—'} mono />
              </div>
              <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                Username is automatically generated from the employee's name and ID. The employee will receive an activation email to set their password.
              </p>
            </div>
          </FormSection>
        </div>
      </form>

      {/* ── FLOATING FOOTER ─────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-[var(--color-border)] shadow-[0_-2px_16px_rgba(0,0,0,0.07)] z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/employees')}>Cancel</Button>
          <Button type="button" variant="outline" icon={Save} isLoading={isSavingDraft} onClick={handleSaveDraft}>Save as Draft</Button>
          <Button type="button" onClick={handleSubmit(onSubmit)}>Create Employee</Button>
        </div>
      </div>

      {/* ── MODALS ──────────────────────────────────────── */}
      <ConfirmationModal
        open={showConfirm}
        onClose={() => !isSubmitting && setShowConfirm(false)}
        onConfirm={handleConfirmCreate}
        isSubmitting={isSubmitting}
        employee={{ fullName: watchedName, employeeId, email: watch('email'), phone: watch('phone'), status: watch('status') }}
      />
      <SuccessModal
        open={showSuccess}
        employee={createdEmployee}
        onViewEmployee={() => navigate('/admin/employees')}
        onCreateOffer={() => navigate('/admin/offers')}
        onClose={() => { setShowSuccess(false); navigate('/admin/employees'); }}
      />

      {/* ── TOAST ───────────────────────────────────────── */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
      )}
    </div>
  );
}

function PreviewItem({ label, value, mono }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className={cn('text-gray-800 font-medium', mono && 'font-mono text-[var(--color-primary)]')}>{value}</p>
    </div>
  );
}
