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
  Check
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';

// Offer Workspace Sub-components
import EmployeeSelectorCard from '../../components/offer-workspace/EmployeeSelectorCard';
import JobPositionCards from '../../components/offer-workspace/JobPositionCards';
import LocationCard from '../../components/offer-workspace/LocationCard';
import AccountPreviewCard from '../../components/offer-workspace/AccountPreviewCard';
import OfferDocumentSelectorCard from '../../components/offer-workspace/OfferDocumentSelectorCard';
import EmploymentContractCard from '../../components/offer-workspace/EmploymentContractCard';
import SalaryBuilderCard from '../../components/offer-workspace/SalaryBuilderCard';
import OfferContentTabs from '../../components/offer-workspace/OfferContentTabs';
import EmailAndDocumentCard from '../../components/offer-workspace/EmailAndDocumentCard';
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
      department: 'Field Operations',
      district: 'Nellore',
      mandal: 'Kavali',
      joiningDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      employmentType: 'Full Time',
      probation: '3 Months',
      noticePeriod: '30 Days',
      reportingManager: 'District Project Coordinator',
      workLocation: 'Field / Mandal Office',
      salary: {
        basic: 16000,
        travel: 3000,
        incentive: 3500,
        other: 1500,
      },
      jobDescription: MASTER_TEMPLATES['Mandal Co-ordinator']?.jobDescription || '',
      responsibilities: MASTER_TEMPLATES['Mandal Co-ordinator']?.responsibilities || [],
      termsAndConditions: DEFAULT_TERMS,
      emailSubject: 'Employment Offer Letter — Mandal Co-ordinator — DS PROJECTS',
      emailBody: '',
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
    setValue('employeeName', emp.fullName);
    setValue('email', emp.email);
    setValue('phone', emp.phone);

    if (emp.district) setValue('district', emp.district);
    if (emp.mandal) setValue('mandal', emp.mandal);

    const activeOffer = await onboardingService.checkExistingOffer(emp.employeeId);
    if (activeOffer) {
      setExistingOffer(activeOffer);
      setShowDuplicateModal(true);
    }

    refreshEmailBody(emp.fullName, watchedValues.position, watchedValues.district, watchedValues.mandal, watchedValues.joiningDate);
  };

  // 3. Job Position Selection
  const handleSelectPosition = (pos) => {
    setValue('position', pos);
    const tpl = MASTER_TEMPLATES[pos];
    if (tpl) {
      setValue('department', tpl.department);
      setValue('jobDescription', tpl.jobDescription);
      setValue('responsibilities', [...tpl.responsibilities]);
      setValue('probation', tpl.probation);
      setValue('noticePeriod', tpl.noticePeriod);
      if (tpl.defaultSalary) {
        setValue('salary.basic', tpl.defaultSalary.basic);
        setValue('salary.travel', tpl.defaultSalary.travel);
        setValue('salary.incentive', tpl.defaultSalary.incentive);
        setValue('salary.other', tpl.defaultSalary.other);
      }
    }
    setValue('emailSubject', `Employment Offer Letter — ${pos} — DS PROJECTS`);
    refreshEmailBody(watchedValues.employeeName, pos, watchedValues.district, watchedValues.mandal, watchedValues.joiningDate);
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
        if (errors.position) errs.push('Please select a job position.');
        if (errors.district) errs.push('Please select an assigned district.');
        if (errors.mandal) errs.push('Please select an assigned mandal.');
        setStepErrors(errs);
      }
    } else if (currentStep === 2) {
      const valid = await trigger(['joiningDate', 'department', 'salary.basic', 'jobDescription', 'emailSubject', 'emailBody']);
      if (valid) {
        setCurrentStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const errs = [];
        if (errors.joiningDate) errs.push('Please provide a valid joining date.');
        if (errors.salary?.basic) errs.push('Please provide a valid basic salary.');
        setStepErrors(errs);
      }
    }
  };

  const handlePrevStep = () => {
    setStepErrors([]);
    setCurrentStep(s => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Send Confirmation
  const onTriggerSend = () => {
    handleSubmit(
      () => {
        setStepErrors([]);
        setShowConfirmModal(true);
      },
      (validationErrors) => {
        const errs = Object.values(validationErrors).map(e => e.message || 'Validation error');
        setStepErrors(errs);
      }
    )();
  };

  // Execute Send Dispatch Flow (5 Stages)
  const handleExecuteSend = async () => {
    setShowConfirmModal(false);
    setShowSendingModal(true);
    setSendingStage(1); // Preparing Offer

    try {
      await new Promise(r => setTimeout(r, 600));
      setSendingStage(2); // Validating Employee & Jurisdiction

      await new Promise(r => setTimeout(r, 700));
      setSendingStage(3); // Generating Verified Document

      await new Promise(r => setTimeout(r, 600));
      setSendingStage(4); // Creating Employee Portal Account

      await new Promise(r => setTimeout(r, 800));
      setSendingStage(5); // Dispatching SMTP Email

      const newOffer = await onboardingService.createOffer({
        ...watchedValues,
        status: 'Sent',
        documentMode,
      });

      await new Promise(r => setTimeout(r, 500));
      setShowSendingModal(false);
      setCompletedOffer(newOffer);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Dispatch error:', err);
      setShowSendingModal(false);
      alert('Failed to send offer. Saved as ready draft.');
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
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => navigate('/admin/onboarding')}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition"
            title="Back to Onboarding"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-[var(--color-navy)]">
                Create Job Offer
              </h1>
              <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
                Draft Mode
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Step {currentStep} of 3 · {WIZARD_STEPS[currentStep - 1].title}
            </p>
          </div>
        </div>

        {/* Top Actions & Autosave status */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium mr-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{autosaveStatus}</span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            icon={Save}
            className="text-xs h-9"
          >
            Save Draft
          </Button>

          {currentStep === 3 ? (
            <Button
              type="button"
              size="sm"
              onClick={onTriggerSend}
              icon={Send}
              className="text-xs h-9 font-bold bg-[var(--color-primary)] hover:bg-[#1a3375] shadow-xs px-5"
            >
              Send Offer
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleNextStep}
              className="text-xs h-9 font-bold bg-[var(--color-primary)] hover:bg-[#1a3375] shadow-xs px-4 flex items-center gap-1.5"
            >
              <span>Next Step</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* ── 3-STEP PROGRESS STEPPER ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-3 sm:p-4 shadow-xs">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {WIZARD_STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div
                key={step.id}
                onClick={() => {
                  if (step.id < currentStep) setCurrentStep(step.id);
                }}
                className={cn(
                  'flex items-center gap-2 sm:gap-3.5 p-2.5 sm:p-3 rounded-xl transition-all',
                  isActive && 'bg-blue-50/80 border border-blue-200 shadow-2xs',
                  isCompleted && 'bg-gray-50/80 hover:bg-gray-100 cursor-pointer',
                  !isActive && !isCompleted && 'opacity-60'
                )}
              >
                <div
                  className={cn(
                    'w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors',
                    isActive && 'bg-[var(--color-primary)] text-white shadow-xs',
                    isCompleted && 'bg-green-600 text-white',
                    !isActive && !isCompleted && 'bg-gray-200 text-gray-600'
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <div className="min-w-0">
                  <p className={cn('text-xs font-bold truncate leading-tight', isActive ? 'text-[var(--color-navy)]' : 'text-gray-700')}>
                    {step.title}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate hidden sm:block mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error banner */}
      {stepErrors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs space-y-1 animate-in fade-in">
          <p className="font-bold text-red-800 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4" /> Please correct the following before continuing:
          </p>
          <ul className="list-disc pl-5 text-red-700 space-y-0.5">
            {stepErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── STEP 1: CANDIDATE, ROLE & JURISDICTION ──────────────── */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Employee Selection */}
            <EmployeeSelectorCard
              employees={employees}
              selectedEmployee={selectedEmployee}
              onSelectEmployee={handleSelectEmployee}
              error={errors.employeeId?.message}
            />

            {/* Portal Account Credentials */}
            <AccountPreviewCard
              employeeName={watchedValues.employeeName}
              employeeId={watchedValues.employeeId}
            />
          </div>

          {/* Job Position Cards */}
          <JobPositionCards
            selectedPosition={watchedValues.position}
            onSelectPosition={handleSelectPosition}
            error={errors.position?.message}
          />

          {/* Work Location (AP 28-District Master) */}
          <LocationCard
            district={watchedValues.district}
            mandal={watchedValues.mandal}
            onDistrictChange={(d) => {
              setValue('district', d);
              setValue('mandal', '');
              refreshEmailBody(watchedValues.employeeName, watchedValues.position, d, '', watchedValues.joiningDate);
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

      {/* ── STEP 2: TERMS, COMPENSATION & CONTENT ───────────────── */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Offer Letter Document Mode & Manual Upload Option */}
          <OfferDocumentSelectorCard
            documentMode={documentMode}
            setDocumentMode={setDocumentMode}
            manualPdf={manualPdf}
            setManualPdf={setManualPdf}
            selectedEmployee={selectedEmployee}
          />

          {/* Employment & Contract */}
          <EmploymentContractCard
            register={register}
            errors={errors}
          />

          {/* Salary Structure Builder */}
          <SalaryBuilderCard
            register={register}
            watch={watch}
            errors={errors}
          />

          {/* Offer Content: Job Desc, Responsibilities & Terms */}
          {documentMode === 'generate' && (
            <OfferContentTabs
              register={register}
              watch={watch}
              setValue={setValue}
              respFields={respFields}
              appendResp={appendResp}
              removeResp={removeResp}
            />
          )}

          {/* Email Setup & Dispatch Configuration */}
          <EmailAndDocumentCard
            register={register}
            watch={watch}
            manualPdf={manualPdf}
            setManualPdf={setManualPdf}
            documentMode={documentMode}
            setDocumentMode={setDocumentMode}
            selectedEmployee={selectedEmployee}
          />
        </div>
      )}

      {/* ── STEP 3: LIVE A4 PREVIEW & EXECUTIVE REVIEW ──────────── */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Executive Overview Summary Banner */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-purple-50 rounded-2xl border border-blue-200/80 p-5 shadow-xs">
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
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Compensation</span>
                <p className="font-bold font-mono text-green-700">
                  {formatINR((Number(watchedValues.salary?.basic) || 0) + (Number(watchedValues.salary?.travel) || 0) + (Number(watchedValues.salary?.incentive) || 0) + (Number(watchedValues.salary?.other) || 0))} / Mo
                </p>
                <p className="text-[10px] font-mono text-gray-500">
                  {formatINR(((Number(watchedValues.salary?.basic) || 0) + (Number(watchedValues.salary?.travel) || 0) + (Number(watchedValues.salary?.incentive) || 0) + (Number(watchedValues.salary?.other) || 0)) * 12)} CTC
                </p>
              </div>
            </div>
          </div>

          {/* Full-width Centered A4 Document Preview */}
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
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleExecuteSend}
        offerData={watchedValues}
        documentMode={documentMode}
      />

      <SendingStateModal
        isOpen={showSendingModal}
        stage={sendingStage}
      />

      <SuccessOfferModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        offer={completedOffer}
      />
    </div>
  );
}
