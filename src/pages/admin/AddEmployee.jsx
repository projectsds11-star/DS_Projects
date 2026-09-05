/**
 * src/pages/admin/AddEmployee.jsx
 * Add / Edit Employee — Production-grade form with 5 sections + Preview flow.
 *
 * Flow: Form → Preview → Create → Success
 * Edit mode: loads real DB data, submits to PUT endpoint.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Eye, UserPlus, CheckCircle, AlertCircle,
  RefreshCw, MapPin, User, ShieldCheck, Landmark, Users, X
} from 'lucide-react';

import { employeeSchema, employeeEditSchema } from '../../validators/employeeSchema';
import { employeeService } from '../../services/employeeService';
import { locationService } from '../../services/locationService';

import FormSection, { FormField, FormGrid } from '../../components/employee/FormSection';
import PhotoUploader from '../../components/employee/PhotoUploader';
import DocumentUploader from '../../components/employee/DocumentUploader';
import { Button } from '../../components/ui/Button';
import SuccessModal from '../../components/employee/SuccessModal';

// ─── Helper ────────────────────────────────────────────────────────────────────
const cn = (...cls) => cls.filter(Boolean).join(' ');

function inputCls(hasError) {
  return cn(
    'w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400',
    'focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]',
    hasError
      ? 'border-[var(--color-error)] bg-red-50/30'
      : 'border-gray-300 bg-white hover:border-gray-400'
  );
}

// ─── Aadhaar auto-format ───────────────────────────────────────────────────────
function formatAadhaar(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 12);
  const parts = [digits.slice(0, 4), digits.slice(4, 8), digits.slice(8, 12)].filter(Boolean);
  return parts.join('-');
}

// ─── Preview card ──────────────────────────────────────────────────────────────
function PreviewRow({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 shrink-0 w-36">{label}</span>
      <span className={cn('text-sm font-medium text-gray-800 text-right break-all', mono && 'font-mono')}>{value || '—'}</span>
    </div>
  );
}

function PreviewSection({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <Icon className="h-4 w-4 text-[var(--color-primary)]" />
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function AddEmployee() {
  const navigate = useNavigate();
  const { id: editId } = useParams(); // employee_id when editing (DS-001)
  const isEdit = Boolean(editId);

  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState('form'); // 'form' | 'preview' | 'submitting' | 'success'
  const [previewId, setPreviewId] = useState('DS-...');
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingMandals, setLoadingMandals] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState(null);
  const [serverError, setServerError] = useState('');
  const [loadingEdit, setLoadingEdit] = useState(isEdit);

  // File state (managed outside RHF because File objects are not serializable)
  const [photo, setPhoto] = useState(null);     // { file, preview } | null
  const [passbook, setPassbook] = useState(null); // { file, preview, name, size, type } | null
  const [aadhaarDocument, setAadhaarDocument] = useState(null);
  const [panDocument, setPanDocument] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [passbookError, setPassbookError] = useState('');
  const [aadhaarDocumentError, setAadhaarDocumentError] = useState('');
  const [panDocumentError, setPanDocumentError] = useState('');

  // ── React Hook Form ────────────────────────────────────────────────────────
  const schema = isEdit ? employeeEditSchema : employeeSchema;
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    trigger,
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', address: '', phone: '', email: '', qualification: '',
      course: '', university: '', year_of_passing: '',
      photo: null, aadhaar: '', aadhaarDocument: null, pan: '', panDocument: null,
      passbook: null, accountHolderName: '', bankName: '', accountNumber: '', reEnterAccountNumber: '', ifsc: '', branchName: '',
      referenceMobile: '', referenceName: '', relationship: '',
      stateId: '', districtId: '', mandalId: '',
    },
  });

  const watchDistrict = watch('districtId');
  const watchAccountNumber = watch('accountNumber');
  const watchReEnter = watch('reEnterAccountNumber');

  // ── Account match indicator ─────────────────────────────────────────────────
  const accountsMatch =
    watchAccountNumber && watchReEnter &&
    watchAccountNumber.trim() === watchReEnter.trim();
  const accountsMismatch =
    watchAccountNumber && watchReEnter &&
    watchAccountNumber.trim() !== watchReEnter.trim();

  // ── Load districts on mount ────────────────────────────────────────────────
  useEffect(() => {
    setLoadingDistricts(true);
    locationService.getDistricts().then(list => {
      setDistricts(list);
      setLoadingDistricts(false);
    });
  }, []);

  // ── Load preview ID ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isEdit) {
      employeeService.getNextEmployeeIdPreview().then(id => setPreviewId(id));
    }
  }, [isEdit]);

  // ── Load mandals when district changes ─────────────────────────────────────
  useEffect(() => {
    if (!watchDistrict) { setMandals([]); return; }
    setLoadingMandals(true);
    locationService.getMandalsByDistrict(watchDistrict).then(list => {
      setMandals(list);
      setLoadingMandals(false);
    });
  }, [watchDistrict]);

  // ── Load employee for edit mode ────────────────────────────────────────────
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setLoadingEdit(true);
      const emp = await employeeService.getEmployeeById(editId);
      if (!emp) { navigate('/admin/employees'); return; }

      setPreviewId(emp.employeeId);

      // Load district's mandals before resetting form
      if (emp.districtId) {
        const mList = await locationService.getMandalsByDistrict(emp.districtId);
        setMandals(mList);
      }

      reset({
        name: emp.name,
        address: emp.address,
        phone: emp.phone,
        email: emp.email,
        qualification: emp.qualification,
        course: emp.course,
        university: emp.university,
        year_of_passing: emp.yearOfPassing,
        photo: null,
        aadhaar: formatAadhaar(emp.aadhaar || ''),
        aadhaarDocument: null,
        pan: emp.pan,
        panDocument: null,
        passbook: null,
        accountHolderName: emp.accountHolderName,
        bankName: emp.bankName,
        accountNumber: emp.accountNumber,
        reEnterAccountNumber: emp.accountNumber,
        ifsc: emp.ifsc,
        branchName: emp.branchName,
        referenceMobile: emp.referenceMobile,
        referenceName: emp.referenceName,
        relationship: emp.relationship,
        stateId: emp.stateId,
        districtId: emp.districtId,
        mandalId: emp.mandalId,
      });

      // Existing files shown as "already uploaded" — not re-required
      if (emp.photoPath) setPhoto({ preview: null, file: null, existingPath: emp.photoPath });
      if (emp.passbookPath) setPassbook({ preview: null, file: null, existingPath: emp.passbookPath, name: 'Existing passbook' });

      setLoadingEdit(false);
    })();
  }, [isEdit, editId]);

  // ── Sync file state into RHF values (for validation) ──────────────────────
  useEffect(() => {
    setValue('photo', photo, { shouldValidate: false });
    if (photo) setPhotoError('');
  }, [photo, setValue]);

  useEffect(() => {
    setValue('passbook', passbook, { shouldValidate: false });
    if (passbook) setPassbookError('');
  }, [passbook, setValue]);

  useEffect(() => {
    setValue('aadhaarDocument', aadhaarDocument, { shouldValidate: false });
    if (aadhaarDocument) setAadhaarDocumentError('');
  }, [aadhaarDocument, setValue]);

  useEffect(() => {
    setValue('panDocument', panDocument, { shouldValidate: false });
    if (panDocument) setPanDocumentError('');
  }, [panDocument, setValue]);

  // ── Aadhaar formatter ──────────────────────────────────────────────────────
  const handleAadhaarChange = useCallback((e) => {
    const formatted = formatAadhaar(e.target.value);
    setValue('aadhaar', formatted, { shouldValidate: true });
    e.target.value = formatted;
  }, [setValue]);

  // ── PREVIEW click — validate all fields first ──────────────────────────────
  const handlePreview = async () => {
    setServerError('');

    // Validate files manually for visual state
    let validFiles = true;
    if (!isEdit && !photo?.file) {
      setPhotoError('Candidate photo is required.');
      validFiles = false;
    }
    if (!isEdit && !passbook?.file) {
      setPassbookError('Bank passbook is required.');
      validFiles = false;
    }
    if (!isEdit && !aadhaarDocument?.file) {
      setAadhaarDocumentError('Aadhaar document is required.');
      validFiles = false;
    }
    if (!isEdit && !panDocument?.file) {
      setPanDocumentError('PAN document is required.');
      validFiles = false;
    }

    // Trigger full RHF validation
    const isFormValid = await trigger();

    if (!isFormValid || !validFiles) {
      // Small delay to allow DOM to update with error states
      setTimeout(() => {
        const firstErr = document.querySelector('[data-error="true"]');
        if (firstErr) {
          firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstErr.focus?.();
        } else if (!validFiles) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    setStep('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── SUBMIT — actual employee creation / update ─────────────────────────────
  const handleSubmit_ = async () => {
    setStep('submitting');
    setServerError('');

    const values = getValues();

    const payload = {
      name: values.name.trim(),
      address: values.address.trim(),
      phone: values.phone.replace(/\s/g, ''),
      email: values.email.trim().toLowerCase(),
      qualification: values.qualification.trim(),
      course: values.course.trim(),
      university: values.university.trim(),
      year_of_passing: values.year_of_passing.trim(),
      aadhaar_number: values.aadhaar.replace(/-/g, ''),
      pan_number: values.pan.toUpperCase(),
      account_holder_name: values.accountHolderName.trim(),
      bank_name: values.bankName.trim(),
      account_number: values.accountNumber.trim(),
      ifsc_code: values.ifsc.toUpperCase(),
      branch_name: values.branchName.trim(),
      reference_mobile: values.referenceMobile.trim(),
      reference_person_name: values.referenceName.trim(),
      reference_relationship: values.relationship.trim(),
      state_id: values.stateId,
      district_id: values.districtId,
      mandal_id: values.mandalId,
    };

    // Attach files
    if (photo?.file) payload.photo = photo.file;
    if (passbook?.file) payload.passbook = passbook.file;
    if (aadhaarDocument?.file) payload.aadhaarDocument = aadhaarDocument.file;
    if (panDocument?.file) payload.panDocument = panDocument.file;

    try {
      let result;
      if (isEdit) {
        result = await employeeService.updateEmployee(editId, payload);
        setCreatedEmployee({ employeeId: editId, name: payload.name, email: payload.email, emailStatus: 'N/A' });
      } else {
        result = await employeeService.createEmployee(payload);
        setCreatedEmployee({
          employeeId: result.data?.employee_id,
          name: result.data?.name,
          email: result.data?.email,
          emailStatus: result.emailStatus,
        });
      }
      setStep('success');
    } catch (err) {
      setServerError(err.message || 'An unexpected error occurred. Please try again.');
      setStep('preview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loadingEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading employee data…</p>
        </div>
      </div>
    );
  }

  const values = getValues();

  // ── PREVIEW SCREEN ──────────────────────────────────────────────────────────
  if (step === 'preview') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setStep('form'); window.scrollTo({ top: 0 }); }}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Review Employee Details</h1>
              <p className="text-xs text-gray-500 mt-0.5">Please verify all information before creating.</p>
            </div>
          </div>
          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-medium">
            Expected ID: {previewId}
          </span>
        </div>

        {/* Server error */}
        <AnimatePresence>
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4"
            >
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{serverError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Sections */}
        <div className="space-y-4">
          <PreviewSection title="Employee Information" icon={User}>
            <div className="flex items-start gap-4 py-3">
              {photo?.preview ? (
                <img src={photo.preview} alt="Photo" className="w-16 h-16 rounded-xl object-cover border-2 border-[var(--color-primary)] shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center shrink-0">
                  <User className="h-7 w-7 text-[var(--color-primary)]" />
                </div>
              )}
              <div className="flex-1">
                <PreviewRow label="Full Name" value={values.name} />
                <PreviewRow label="Address" value={values.address} />
                <PreviewRow label="Phone" value={`+91 ${values.phone}`} />
                <PreviewRow label="Email" value={values.email} />
                <PreviewRow label="Qualification" value={values.qualification} />
              </div>
            </div>
          </PreviewSection>

          <PreviewSection title="Identity Information" icon={ShieldCheck}>
            <PreviewRow label="Aadhaar" value={`${values.aadhaar?.slice(0,4)}-****-${values.aadhaar?.slice(-4)}`} mono />
            <PreviewRow label="PAN" value={values.pan} mono />
          </PreviewSection>

          <PreviewSection title="Bank Information" icon={Landmark}>
            <PreviewRow
              label="Bank Passbook"
              value={passbook?.name || (passbook?.existingPath ? 'Existing document' : '—')}
            />
            <PreviewRow label="Account Number" value={`${'•'.repeat(Math.max(0, (values.accountNumber?.length || 0) - 4))}${values.accountNumber?.slice(-4)}`} mono />
            <PreviewRow label="IFSC Code" value={values.ifsc} mono />
          </PreviewSection>

          <PreviewSection title="Reference Information" icon={Users}>
            <PreviewRow label="Reference Mobile" value={`+91 ${values.referenceMobile}`} />
            <PreviewRow label="Reference Person" value={values.referenceName} />
            <PreviewRow label="Relationship" value={values.relationship} />
          </PreviewSection>

          <PreviewSection title="Location" icon={MapPin}>
            <PreviewRow label="State" value="Andhra Pradesh" />
            <PreviewRow label="District" value={values.districtId} />
            <PreviewRow label="Mandal" value={values.mandalId} />
          </PreviewSection>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => { setStep('form'); window.scrollTo({ top: 0 }); }}
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Edit
          </Button>
          <Button
            type="button"
            onClick={handleSubmit_}
            className="flex-1"
          >
            <UserPlus className="h-4 w-4 mr-1.5" />
            {isEdit ? 'Save Changes' : 'Create Employee'}
          </Button>
        </div>
      </div>
    );
  }

  // ── SUBMITTING SCREEN ──────────────────────────────────────────────────────
  if (step === 'submitting') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-14 h-14 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
        <p className="text-base font-semibold text-gray-700">
          {isEdit ? 'Saving changes…' : 'Creating Employee…'}
        </p>
        <p className="text-xs text-gray-400">Please wait. Do not close or refresh this page.</p>
      </div>
    );
  }

  // ── SUCCESS SCREEN ─────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <SuccessModal
        open
        isEdit={isEdit}
        employee={createdEmployee}
        onViewEmployee={() => navigate(`/admin/employees/${createdEmployee?.employeeId}`)}
        onClose={() => navigate('/admin/employees')}
      />
    );
  }

  // ── FORM SCREEN ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/employees')}
          className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? `Edit Employee — ${editId}` : 'Add New Employee'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEdit ? 'Update employee information below.' : 'Fill in all required fields. Review before submitting.'}
          </p>
        </div>
        {!isEdit && (
          <span className="ml-auto text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-medium whitespace-nowrap">
            Expected ID: {previewId}
          </span>
        )}
      </div>

      {/* ── SECTION 1: Employee Information ────────────────────────────────── */}
      <FormSection number={1} title="Employee Information" description="Basic identity and contact details.">
        {/* Photo */}
        <div className="mb-6">
          <PhotoUploader
            value={photo}
            onChange={setPhoto}
            error={photoError}
          />
        </div>

        <FormGrid cols={2}>
          <FormField label="Full Name" required error={errors.name?.message}>
            <input
              {...register('name')}
              className={inputCls(!!errors.name)}
              placeholder="e.g. Ravi Kumar"
              data-error={!!errors.name}
              autoComplete="off"
            />
          </FormField>

          <FormField label="Phone Number" required error={errors.phone?.message}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">+91</span>
              <input
                {...register('phone')}
                className={cn(inputCls(!!errors.phone), 'pl-11')}
                placeholder="9876543210"
                maxLength={10}
                data-error={!!errors.phone}
              />
            </div>
          </FormField>

          <FormField label="Email Address" required error={errors.email?.message} colSpan={2}>
            <input
              {...register('email')}
              type="email"
              className={inputCls(!!errors.email)}
              placeholder="employee@example.com"
              data-error={!!errors.email}
            />
          </FormField>
          
          <FormField label="Address" required error={errors.address?.message} colSpan={2}>
            <textarea
              {...register('address')}
              className={cn(inputCls(!!errors.address), 'min-h-[80px] py-3')}
              placeholder="Full residential address"
              data-error={!!errors.address}
            />
          </FormField>
        </FormGrid>
      </FormSection>

      {/* ── SECTION 2: Qualification Details ────────────────────────────────── */}
      <FormSection number={2} title="Qualification Details" description="Educational background details.">
        <FormGrid cols={2}>
          <FormField label="Highest Qualification" required error={errors.qualification?.message} colSpan={2}>
            <input
              {...register('qualification')}
              className={inputCls(!!errors.qualification)}
              placeholder="e.g. Graduation, Post Graduation"
              data-error={!!errors.qualification}
            />
          </FormField>
          <FormField label="Course / Degree" required error={errors.course?.message}>
            <input
              {...register('course')}
              className={inputCls(!!errors.course)}
              placeholder="e.g. B.Com"
              data-error={!!errors.course}
            />
          </FormField>
          <FormField label="University / Board" required error={errors.university?.message}>
            <input
              {...register('university')}
              className={inputCls(!!errors.university)}
              placeholder="e.g. Sri Venkateswara University"
              data-error={!!errors.university}
            />
          </FormField>
          <FormField label="Year of Passing" required error={errors.year_of_passing?.message}>
            <input
              {...register('year_of_passing')}
              className={inputCls(!!errors.year_of_passing)}
              placeholder="e.g. 2024"
              maxLength={4}
              inputMode="numeric"
              data-error={!!errors.year_of_passing}
            />
          </FormField>
        </FormGrid>
      </FormSection>

      {/* ── SECTION 3: Identity Information ────────────────────────────────── */}
      <FormSection number={3} title="Identity Information" description="Government-issued identity documents.">
        <FormGrid cols={2}>
          <FormField
            label="Aadhaar Number"
            required
            error={errors.aadhaar?.message}
            helper="Formatted automatically: 1234-5678-9012"
          >
            <input
              {...register('aadhaar')}
              className={inputCls(!!errors.aadhaar)}
              placeholder="1234-5678-9012"
              maxLength={14}
              inputMode="numeric"
              onChange={handleAadhaarChange}
              data-error={!!errors.aadhaar}
            />
          </FormField>

          <div className="mb-5">
            <DocumentUploader
              label="Aadhaar Document"
              required
              value={aadhaarDocument}
              onChange={setAadhaarDocument}
              error={aadhaarDocumentError}
              accepted={['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
              acceptedLabel="PDF, JPG, PNG"
            />
          </div>

          <FormField
            label="PAN Number"
            required
            error={errors.pan?.message}
            helper="10-character PAN e.g. ABCDE1234F"
          >
            <input
              {...register('pan')}
              className={inputCls(!!errors.pan)}
              placeholder="ABCDE1234F"
              maxLength={10}
              onChange={e => { e.target.value = e.target.value.toUpperCase(); register('pan').onChange(e); }}
              data-error={!!errors.pan}
            />
          </FormField>

          <div className="mb-5">
            <DocumentUploader
              label="PAN Document"
              required
              value={panDocument}
              onChange={setPanDocument}
              error={panDocumentError}
              accepted={['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
              acceptedLabel="PDF, JPG, PNG"
            />
          </div>
        </FormGrid>
      </FormSection>

      {/* ── SECTION 4: Bank Information ─────────────────────────────────────── */}
      <FormSection number={4} title="Bank Information" description="Bank account details for salary processing.">
        {/* Passbook */}
        <div className="mb-5">
          <DocumentUploader
            label="Bank Passbook / Statement"
            required
            value={passbook}
            onChange={setPassbook}
            error={passbookError}
            accepted={['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
            acceptedLabel="PDF, JPG, PNG, WEBP"
          />
        </div>

        <FormGrid cols={2}>
          <FormField label="Account Holder Name" required error={errors.accountHolderName?.message}>
            <input
              {...register('accountHolderName')}
              className={inputCls(!!errors.accountHolderName)}
              placeholder="Enter account holder name"
              data-error={!!errors.accountHolderName}
            />
          </FormField>

          <FormField label="Bank Name" required error={errors.bankName?.message}>
            <input
              {...register('bankName')}
              className={inputCls(!!errors.bankName)}
              placeholder="e.g. SBI"
              data-error={!!errors.bankName}
            />
          </FormField>

          <FormField label="Account Number" required error={errors.accountNumber?.message}>
            <input
              {...register('accountNumber')}
              className={inputCls(!!errors.accountNumber)}
              placeholder="Enter account number"
              inputMode="numeric"
              maxLength={18}
              data-error={!!errors.accountNumber}
            />
          </FormField>

          <FormField label="Re-enter Account Number" required error={errors.reEnterAccountNumber?.message}>
            <div className="relative">
              <input
                {...register('reEnterAccountNumber')}
                className={cn(
                  inputCls(!!errors.reEnterAccountNumber || accountsMismatch),
                  accountsMatch && !errors.reEnterAccountNumber && 'border-green-400 bg-green-50/20',
                )}
                placeholder="Confirm account number"
                inputMode="numeric"
                maxLength={18}
                data-error={!!errors.reEnterAccountNumber}
                onPaste={e => e.preventDefault()}
              />
              {accountsMatch && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
              {accountsMismatch && (
                <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
              )}
            </div>
            {accountsMatch && !errors.reEnterAccountNumber && (
              <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Account numbers match
              </p>
            )}
            {accountsMismatch && !errors.reEnterAccountNumber && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <X className="h-3 w-3" /> Account numbers do not match
              </p>
            )}
          </FormField>

          <FormField
            label="IFSC Code"
            required
            error={errors.ifsc?.message}
            helper="e.g. SBIN0001234"
          >
            <input
              {...register('ifsc')}
              className={inputCls(!!errors.ifsc)}
              placeholder="SBIN0001234"
              maxLength={11}
              onChange={e => { e.target.value = e.target.value.toUpperCase(); register('ifsc').onChange(e); }}
              data-error={!!errors.ifsc}
            />
          </FormField>
          
          <FormField label="Branch Name" required error={errors.branchName?.message}>
            <input
              {...register('branchName')}
              className={inputCls(!!errors.branchName)}
              placeholder="e.g. Main Branch"
              data-error={!!errors.branchName}
            />
          </FormField>
        </FormGrid>
      </FormSection>

      {/* ── SECTION 4: Reference Information ───────────────────────────────── */}
      <FormSection number={4} title="Reference Information" description="Emergency contact and guarantor details.">
        <FormGrid cols={2}>
          <FormField label="Reference Person Name" required error={errors.referenceName?.message}>
            <input
              {...register('referenceName')}
              className={inputCls(!!errors.referenceName)}
              placeholder="e.g. Suresh Kumar"
              data-error={!!errors.referenceName}
            />
          </FormField>

          <FormField label="Reference Mobile" required error={errors.referenceMobile?.message}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">+91</span>
              <input
                {...register('referenceMobile')}
                className={cn(inputCls(!!errors.referenceMobile), 'pl-11')}
                placeholder="9876543210"
                maxLength={10}
                data-error={!!errors.referenceMobile}
              />
            </div>
          </FormField>

          <FormField label="Relationship" required error={errors.relationship?.message} colSpan={2}>
            <select
              {...register('relationship')}
              className={inputCls(!!errors.relationship)}
              data-error={!!errors.relationship}
            >
              <option value="">Select relationship</option>
              {['Father','Mother','Brother','Sister','Spouse','Son','Daughter','Friend','Colleague','Uncle','Aunt','Guardian'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </FormField>
        </FormGrid>
      </FormSection>

      {/* ── SECTION 5: Location ─────────────────────────────────────────────── */}
      <FormSection number={5} title="Location" description="Deployment location in Andhra Pradesh.">
        <FormGrid cols={2}>
          {/* State — fixed */}
          <FormField label="State" required>
            <input
              value="Andhra Pradesh"
              readOnly
              className={cn(inputCls(false), 'bg-gray-50 cursor-not-allowed text-gray-600')}
            />
            <input type="hidden" {...register('stateId')} value="AP-STATE-01" />
          </FormField>

          {/* District */}
          <FormField label="District" required error={errors.districtId?.message}>
            <select
              {...register('districtId')}
              className={inputCls(!!errors.districtId)}
              onChange={e => {
                setValue('districtId', e.target.value, { shouldValidate: true });
                setValue('mandalId', '', { shouldValidate: false });
                setMandals([]);
              }}
              data-error={!!errors.districtId}
              disabled={loadingDistricts}
            >
              <option value="">{loadingDistricts ? 'Loading…' : 'Select district'}</option>
              {districts.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </FormField>

          {/* Mandal */}
          <FormField label="Mandal" required error={errors.mandalId?.message} colSpan={2}>
            <select
              {...register('mandalId')}
              className={inputCls(!!errors.mandalId)}
              disabled={!watchDistrict || loadingMandals}
              data-error={!!errors.mandalId}
            >
              <option value="">
                {!watchDistrict ? 'Select a district first' : loadingMandals ? 'Loading…' : 'Select mandal'}
              </option>
              {mandals.map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </FormField>
        </FormGrid>
      </FormSection>

      {/* ── Footer Buttons ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-200 pb-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/admin/employees')}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handlePreview}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-1.5" />
          Preview &amp; Review
        </Button>
      </div>
    </div>
  );
}
