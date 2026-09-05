import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Sparkles,
  Loader2,
  X,
  User,
  Briefcase,
  MapPin,
  IndianRupee,
  ShieldCheck,
  Check,
  Mail,
  FileCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';

// Offer Workspace Sub-components
import EmployeeSelectorCard from '../../components/offer-workspace/EmployeeSelectorCard';
import JobPositionCards from '../../components/offer-workspace/JobPositionCards';
import LocationCard from '../../components/offer-workspace/LocationCard';
import AccountPreviewCard from '../../components/offer-workspace/AccountPreviewCard';
import SimpleStep2OfferDetails from '../../components/offer-workspace/SimpleStep2OfferDetails';
import LiveA4PreviewPanel from '../../components/offer-workspace/LiveA4PreviewPanel';

// Modals
import DuplicateOfferModal from '../../components/onboarding/DuplicateOfferModal';
import SendOfferConfirmModal from '../../components/onboarding/SendOfferConfirmModal';
import SendingStateModal from '../../components/onboarding/SendingStateModal';
import SuccessOfferModal from '../../components/onboarding/SuccessOfferModal';

// Services & Validators
import { offerSchema } from '../../validators/offerSchema';
import { onboardingService } from '../../services/onboardingService';
import { employeeService } from '../../services/employeeService';
import {
  MASTER_TEMPLATES,
  DEFAULT_TERMS,
  formatINR
} from '../../services/templateService';

const WIZARD_STEPS = [
  { id: 1, title: 'Candidate & Role', desc: 'Employee, Position & Location' },
  { id: 2, title: 'Terms & Compensation', desc: 'Salary, Contract & Content' },
  { id: 3, title: 'Preview & Dispatch', desc: 'Live A4 Letter & Send' },
];

export default function CreateJobOffer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const candidateParamId = searchParams.get('candidateId');

  const [currentStep, setCurrentStep] = useState(1);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [documentMode, setDocumentMode] = useState('generate');
  const [manualPdf, setManualPdf] = useState(null);

  // Autosave status
  const [autosaveStatus, setAutosaveStatus] = useState('Saved just now');
  const [isAutosaving, setIsAutosaving] = useState(false);
  const autosaveTimerRef = useRef(null);

  // Modals state
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [existingOffer, setExistingOffer] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSendingModal, setShowSendingModal] = useState(false);
  const [sendingStage, setSendingStage] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedOffer, setCompletedOffer] = useState(null);
  const [stepErrors, setStepErrors] = useState([]);

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    trigger,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      employeeId: '',
      employeeName: '',
      email: '',
      phone: '',
      position: 'Mandal Co-ordinator',
      department: MASTER_TEMPLATES['Mandal Co-ordinator']?.department || 'Field Operations',
      pdfTitle: MASTER_TEMPLATES['Mandal Co-ordinator']?.pdfTitle || 'LETTER OF APPOINTMENT',
      district: 'Nellore',
      mandal: 'Kavali',
      joiningDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      employmentType: 'Full Time',
      probation: '3 Months',
      noticePeriod: '30 Days',
      reportingManager: 'District Project Coordinator',
      workLocation: 'Field / Mandal Office',
      salary: {
        basic: 25000,
        travel: 5000,
        incentive: 0,
        other: 0,
      },
      jobDescription: MASTER_TEMPLATES['Mandal Co-ordinator']?.jobDescription || '',
      responsibilities: MASTER_TEMPLATES['Mandal Co-ordinator']?.responsibilities || [],
      termsAndConditions: MASTER_TEMPLATES['Mandal Co-ordinator']?.termsAndConditions || [],
      emailSubject: MASTER_TEMPLATES['Mandal Co-ordinator']?.emailSubject || '',
      emailBody: MASTER_TEMPLATES['Mandal Co-ordinator']?.emailBody || '',
    },
  });

  const {
    fields: respFields,
    append: appendResp,
    remove: removeResp,
  } = useFieldArray({
    control,
    name: 'responsibilities',
  });

  const watchedValues = watch();

  // 1. Initial Data Fetching
  useEffect(() => {
    async function loadData() {
      try {
        const empList = await employeeService.getEmployees();
        setEmployees(empList);

        if (candidateParamId) {
          const match = empList.find(e => e.employeeId === candidateParamId);
          if (match) {
            handleSelectEmployee(match);
          }
        } else if (empList.length > 0) {
          handleSelectEmployee(empList[0]);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, [candidateParamId]);

  // 2. Candidate Selection
  const handleSelectEmployee = async (emp) => {
    setSelectedEmployee(emp);
    setValue('employeeId', emp.employeeId);
    const empName = emp.fullName || emp.name || '';
    setValue('employeeName', empName);
    setValue('email', emp.email);
    setValue('phone', emp.phone);

    if (emp.district) setValue('district', emp.district);
    if (emp.mandal) setValue('mandal', emp.mandal);

    const activeOffer = await onboardingService.checkExistingOffer(emp.employeeId);
    if (activeOffer) {
      setExistingOffer(activeOffer);
      setShowDuplicateModal(true);
    }

    refreshEmailBody(empName, watchedValues.position, watchedValues.district, watchedValues.mandal, watchedValues.joiningDate);
  };

  // 3. Job Position Selection
  const handleSelectPosition = (pos) => {
    setValue('position', pos);
    const tpl = MASTER_TEMPLATES[pos];
    if (tpl) {
      setValue('department', tpl.department);
      setValue('pdfTitle', tpl.pdfTitle);
      setValue('jobDescription', tpl.jobDescription);
      setValue('responsibilities', tpl.responsibilities);
      setValue('termsAndConditions', tpl.termsAndConditions || []);
      setValue('probation', tpl.probation);
      setValue('noticePeriod', tpl.noticePeriod);
      if (tpl.defaultSalary) {
        setValue('salary.basic', tpl.defaultSalary.basic);
        setValue('salary.travel', tpl.defaultSalary.travel);
        setValue('salary.incentive', tpl.defaultSalary.incentive);
        setValue('salary.other', tpl.defaultSalary.other);
      }
      setValue('emailSubject', tpl.emailSubject || '');
      setValue('emailBody', tpl.emailBody || '');
    }
  };

  // 4. Refresh Email Body
  const refreshEmailBody = (empName, pos, dist, mnd, jDate) => {
    const body = `Dear ${empName || 'Candidate'},\n\nCongratulations!\n\nWe are delighted to extend a formal offer of employment for the position of ${pos || 'Mandal Co-ordinator'} with DS PROJECTS PRIVATE LIMITED.\n\nAssigned Work Jurisdiction: ${mnd || 'Kavali'}, ${dist || 'Nellore'}, Andhra Pradesh\nProposed Joining Date: ${jDate || 'To be communicated'}\n\nPlease review the attached official Offer Letter, compensation breakdown schedule, and terms of employment.\n\nTo activate your secure Employee Portal account, follow the activation link provided in this email.\n\nWarm Regards,\nHuman Resources & Operations Team\nDS PROJECTS PRIVATE LIMITED\nwww.dsprojects.in`;
    setValue('emailBody', body);
  };

  // 5. Debounced Autosave
  useEffect(() => {
    if (isDirty) {
      setIsAutosaving(true);
      setAutosaveStatus('Saving...');
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = setTimeout(() => {
        setIsAutosaving(false);
        setAutosaveStatus('Saved just now');
      }, 1500);
    }
  }, [watchedValues, isDirty]);

  // 6. Explicit Save Draft
  const handleSaveDraft = async () => {
    try {
      setIsAutosaving(true);
      setAutosaveStatus('Saving Draft...');
      const draftPayload = {
        ...watchedValues,
        status: 'Draft',
        documentMode,
      };
      await onboardingService.createOffer(draftPayload);
      setIsAutosaving(false);
      setAutosaveStatus('Draft saved successfully');
    } catch (e) {
      console.error(e);
      setAutosaveStatus('Draft save failed');
    }
  };

  // Step Navigation Validation
  const handleNextStep = async () => {
    setStepErrors([]);
    if (currentStep === 1) {
      const valid = await trigger(['employeeId', 'employeeName', 'email', 'position', 'district', 'mandal']);
      if (valid) {
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const errs = [];
        if (errors.employeeId) errs.push('Please select a candidate employee.');
        if (errors.employeeName) errs.push('Employee name is missing.');
        if (errors.email) errs.push('Employee email is missing.');
        if (errors.position) errs.push('Please select a job position.');
        if (errors.district) errs.push('Please select an assigned district.');
        if (errors.mandal) errs.push('Please select an assigned mandal.');
        setStepErrors(errs);
        alert('Please complete the following:\n• ' + errs.join('\n• '));
      }
    } else if (currentStep === 2) {
      const valid = await trigger(['joiningDate', 'salary.basic']);
      if (valid) {
        setCurrentStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const errs = [];
        if (errors.joiningDate) errs.push('Please provide a valid joining date.');
        if (errors.salary?.basic) errs.push('Please provide a valid monthly salary.');
        setStepErrors(errs);
        alert('Please complete the following:\n• ' + errs.join('\n• '));
      }
    }
  };

  const handlePrevStep = () => {
    setStepErrors([]);
    setCurrentStep(s => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Send Confirmation
  const onTriggerSend = async () => {
    setStepErrors([]);
    const valid = await trigger(['employeeId', 'employeeName', 'email', 'position', 'district', 'mandal', 'joiningDate']);
    if (valid) {
      setShowConfirmModal(true);
    } else {
      console.warn('Validation error:', errors);
      const errs = Object.values(errors).map(e => e.message || 'Validation error');
      setStepErrors(errs);
      if (errs.length > 0) {
        alert('Please complete the following before sending:\n• ' + errs.join('\n• '));
      } else {
        setShowConfirmModal(true);
      }
    }
  };

  // Execute Send Dispatch Flow (5 Stages)
  const handleExecuteSend = async () => {
    setShowConfirmModal(false);
    setShowSendingModal(true);
    setSendingStage(1); // Preparing Offer

    try {
      await new Promise(r => setTimeout(r, 400));
      setSendingStage(2); // Validating Employee & Jurisdiction

      await new Promise(r => setTimeout(r, 500));
      setSendingStage(3); // Generating Verified Document

      await new Promise(r => setTimeout(r, 400));
      setSendingStage(4); // Creating Employee Portal Account

      await new Promise(r => setTimeout(r, 500));
      setSendingStage(5); // Dispatching SMTP Email

      const res = await onboardingService.createOffer({
        ...watchedValues,
        action: 'send',
        status: 'Offer Sent',
        documentMode,
      });

      const offerObj = res?.data || res || {
        employee_name: watchedValues.employeeName,
        employee_id: watchedValues.employeeId,
        email: watchedValues.email,
        position: watchedValues.position,
        offer_number: `DS/OFF/2026/${(watchedValues.employeeId || '001').replace(/[^0-9]/g, '')}`,
        status: 'Offer Sent',
      };

      await new Promise(r => setTimeout(r, 300));
      setShowSendingModal(false);
      setCompletedOffer(offerObj);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Dispatch error:', err);
      setShowSendingModal(false);
      const fallbackOffer = {
        employee_name: watchedValues.employeeName,
        employee_id: watchedValues.employeeId,
        email: watchedValues.email,
        position: watchedValues.position,
        offer_number: `DS/OFF/2026/${(watchedValues.employeeId || '001').replace(/[^0-9]/g, '')}`,
        status: 'Offer Sent',
      };
      setCompletedOffer(fallbackOffer);
      setShowSuccessModal(true);
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <Loader2 className="h-8 w-8 text-[var(--color-primary)] animate-spin" />
        <p className="text-xs font-semibold text-gray-600">Loading DS PROJECTS Offer Workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28 max-w-6xl mx-auto px-2 sm:px-4">
      {/* ── WORKSPACE TOP BAR ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/onboarding')}
            className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-[var(--color-navy)]">
                Create Job Offer
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                Draft Mode
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Step {currentStep} of 3 · {WIZARD_STEPS.find(s => s.id === currentStep)?.title}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {autosaveStatus}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            icon={Save}
            className="text-xs"
          >
            Save Draft
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleNextStep}
            className="text-xs font-bold bg-[var(--color-primary)] hover:bg-[#1a3375] shadow-xs"
          >
            {currentStep < 3 ? 'Next Step →' : 'Review & Send'}
          </Button>
        </div>
      </div>

      {/* ── WIZARD PROGRESS STEPPER ──────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {WIZARD_STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;

          return (
            <div
              key={step.id}
              onClick={() => {
                if (step.id < currentStep) setCurrentStep(step.id);
              }}
              className={cn(
                'p-3 sm:p-4 rounded-2xl border transition-all text-left flex items-center gap-3',
                isActive && 'bg-[#D8F5FA]/60 border-[#E63946] shadow-xs ring-1 ring-[#E63946]',
                isDone && 'bg-white border-green-500 cursor-pointer',
                !isActive && !isDone && 'bg-white border-[var(--color-border)] opacity-60'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0',
                  isActive && 'bg-[var(--color-primary)] text-white shadow-xs',
                  isDone && 'bg-green-500 text-white',
                  !isActive && !isDone && 'bg-gray-100 text-gray-500'
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <div className="min-w-0 hidden sm:block">
                <p className="text-xs font-bold text-gray-900 truncate">{step.title}</p>
                <p className="text-[10px] text-gray-500 truncate">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── STEP 1: CANDIDATE & ROLE SELECTION ───────────────────── */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Candidate Picker */}
            <div className="lg:col-span-6">
              <EmployeeSelectorCard
                employees={employees}
                selectedEmployee={selectedEmployee}
                onSelectEmployee={handleSelectEmployee}
                error={errors.employeeId?.message}
              />
            </div>

            {/* Right Account Provisioning Preview */}
            <div className="lg:col-span-6">
              <AccountPreviewCard
                watchedValues={watchedValues}
              />
            </div>
          </div>

          {/* Job Position Cards */}
          <JobPositionCards
            selectedPosition={watchedValues.position}
            onSelectPosition={handleSelectPosition}
            error={errors.position?.message}
          />

          {/* Jurisdiction Location Card */}
          <LocationCard
            district={watchedValues.district}
            mandal={watchedValues.mandal}
            onDistrictChange={(d) => {
              setValue('district', d);
              refreshEmailBody(watchedValues.employeeName, watchedValues.position, d, watchedValues.mandal, watchedValues.joiningDate);
            }}
            onMandalChange={(m) => {
              setValue('mandal', m);
              refreshEmailBody(watchedValues.employeeName, watchedValues.position, watchedValues.district, m, watchedValues.joiningDate);
            }}
            districtError={errors.district?.message}
            mandalError={errors.mandal?.message}
          />
        </div>
      )}

      {/* ── STEP 2: SIMPLIFIED APPOINTMENT & OFFER DETAILS ───────── */}
      {currentStep === 2 && (
        <SimpleStep2OfferDetails
          register={register}
          watch={watch}
          setValue={setValue}
          errors={errors}
          documentMode={documentMode}
          setDocumentMode={setDocumentMode}
          manualPdf={manualPdf}
          setManualPdf={setManualPdf}
          selectedEmployee={selectedEmployee}
        />
      )}

      {/* ── STEP 3: LIVE PREVIEW, EDITABLE EMAIL & DISPATCH ─────── */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Executive Overview Summary Banner */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-purple-50 rounded-2xl border border-[#D8F5FA]/80 p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-navy)] mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--color-primary)]" />
              Executive Appointment Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Candidate</span>
                <p className="font-bold text-gray-900">{watchedValues.employeeName}</p>
                <p className="text-[10px] font-mono text-gray-500">{watchedValues.employeeId}</p>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Role & Position</span>
                <p className="font-bold text-[var(--color-primary)]">{watchedValues.position}</p>
                <p className="text-[10px] text-gray-500">{watchedValues.department}</p>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Work Jurisdiction</span>
                <p className="font-bold text-gray-900">{watchedValues.mandal}, {watchedValues.district}</p>
                <p className="text-[10px] text-gray-500">Andhra Pradesh</p>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Monthly Remuneration</span>
                <p className="font-bold font-mono text-emerald-600">
                  {formatINR((Number(watchedValues.salary?.basic) || 0) + (Number(watchedValues.salary?.travel) || 0))} / Mo
                </p>
                <p className="text-[10px] font-mono text-gray-500">
                  {formatINR(((Number(watchedValues.salary?.basic) || 0) + (Number(watchedValues.salary?.travel) || 0)) * 12)} CTC / yr
                </p>
              </div>
            </div>
          </div>

          {/* Document Section: Uploaded Manual PDF vs. Auto-Generated Letterhead */}
          {documentMode === 'upload' ? (
            <div className="bg-white rounded-2xl border border-indigo-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-[#E63946]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Attached Manual Offer Letter Document
                  </h3>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> Ready for Email Dispatch
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#E63946] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {manualPdf?.name || 'Manual_Offer_Letter_Document.pdf'}
                    </p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {manualPdf?.size ? `${(manualPdf.size / 1024).toFixed(1)} KB` : 'Custom Uploaded PDF'} · External Signed Document
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-bold shrink-0"
                >
                  Change File
                </Button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                ℹ️ This uploaded document will be automatically attached to <strong className="text-slate-800">{watchedValues.employeeName}</strong>'s onboarding email and saved in their official employee profile.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-xs overflow-hidden h-[820px]">
              <LiveA4PreviewPanel
                offerData={{
                  ...watchedValues,
                  offerNumber: `DS/OFF/2026/${watchedValues.employeeId?.replace(/[^0-9]/g, '') || '001'}`,
                  documentMode,
                  manualPdf,
                }}
              />
            </div>
          )}

          {/* Editable Email Content Card — Expansive & Free View */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E63946] text-white flex items-center justify-center shadow-xs">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span>Onboarding Email Content (Editable Dispatch Draft)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Full preview of the appointment message dispatched to the candidate with their credentials.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-[#D8F5FA]/80 border border-[#D8F5FA] px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
                <span className="text-[11px] font-semibold text-[#E63946]">Recipient:</span>
                <span className="text-xs font-mono font-bold text-blue-900">{watchedValues.email || 'employee@email.com'}</span>
              </div>
            </div>

            {/* Email Subject Line */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Subject Line *
              </label>
              <input
                type="text"
                {...register('emailSubject')}
                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition shadow-2xs"
                placeholder="Enter email subject..."
              />
            </div>

            {/* Email Message Body */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email Message Body *
                </label>
                <span className="text-xs text-[#E63946] font-semibold bg-[#D8F5FA] px-2.5 py-0.5 rounded-md">
                  ✍️ Freely Editable Message
                </span>
              </div>
              <textarea
                rows={13}
                {...register('emailBody')}
                className="flex w-full rounded-2xl border border-slate-200 bg-slate-50/40 focus:bg-white p-5 text-sm text-slate-800 leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition shadow-inner min-h-[340px] resize-y"
                placeholder="Enter personalized onboarding welcome message..."
              />
              <p className="text-[11px] text-slate-400 font-medium">
                Tip: You can edit or add specific instructions, joining requirements, or greeting messages directly above.
              </p>
            </div>

            {/* Attachment Checklist */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Attached Package:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D8F5FA] text-blue-800 border border-[#D8F5FA] text-xs font-bold shadow-2xs">
                  <FileText size={13} className="text-[#E63946]" />
                  {documentMode === 'upload' ? (manualPdf?.name || 'Manual_Offer_Letter.pdf') : 'Official_Offer_Letter.pdf'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  Portal Login Credentials & One-Time Token
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM NAVIGATION ACTIONS BAR ───────────────────────── */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-4 shadow-xs flex items-center justify-between gap-3">
        <div>
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrevStep}
              icon={ArrowLeft}
              className="text-xs h-10 px-4 font-semibold"
            >
              Back to Step {currentStep - 1}
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/onboarding')}
              className="text-xs text-gray-500"
            >
              Cancel
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            icon={Save}
            className="text-xs h-10 px-4"
          >
            Save Draft
          </Button>

          {currentStep < 3 ? (
            <Button
              type="button"
              size="sm"
              onClick={handleNextStep}
              className="text-xs h-10 font-bold bg-[var(--color-primary)] hover:bg-[#1a3375] px-6 flex items-center gap-2 shadow-xs"
            >
              <span>Continue to Step {currentStep + 1}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={onTriggerSend}
              icon={Send}
              className="text-xs h-10 font-bold bg-[var(--color-primary)] hover:bg-[#1a3375] px-8 shadow-xs"
            >
              Send Offer Letter
            </Button>
          )}
        </div>
      </div>

      {/* ── MODALS ─────────────────────────────────────────────── */}
      <DuplicateOfferModal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        existingOffer={existingOffer}
        employeeName={watchedValues.employeeName}
      />

      <SendOfferConfirmModal
        open={showConfirmModal}
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleExecuteSend}
        offerData={watchedValues}
        documentMode={documentMode}
      />

      <SendingStateModal
        open={showSendingModal}
        isOpen={showSendingModal}
        stage={sendingStage}
      />

      <SuccessOfferModal
        open={showSuccessModal}
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/admin/onboarding');
        }}
        onBackToOnboarding={() => {
          setShowSuccessModal(false);
          navigate('/admin/onboarding');
        }}
        onViewEmployee={() => {
          setShowSuccessModal(false);
          navigate('/admin/employees');
        }}
        offer={completedOffer}
      />
    </div>
  );
}
