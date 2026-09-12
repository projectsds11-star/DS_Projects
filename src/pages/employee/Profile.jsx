import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  Briefcase, 
  GraduationCap,
  Landmark,
  Users,
  Eye,
  Download,
  ExternalLink,
  CheckCircle2, 
  RefreshCw,
  FileCheck,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { liveDataService } from '../../services/liveDataService';
import { supabase } from '../../services/supabaseClient';

export default function EmployeeProfile() {
  const [activeTab, setActiveTab] = useState('personal');
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [imgError, setImgError] = useState(false);

  const currentEmpId = localStorage.getItem('ds_current_employee_id') || 'DS-001';

  const fetchProfile = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const emp = await liveDataService.getEmployeeById(currentEmpId);
      if (emp) {
        setEmployee(emp);
        setImgError(false);
      }
      if (isManualRefresh) {
        showToast('Profile data refreshed from live server!');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      showToast('Could not refresh profile details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [currentEmpId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getPublicUrl = (bucket, path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
      return path;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || null;
  };

  const openDocument = (docPath, docName) => {
    if (!docPath) {
      showToast('Document file is not available.');
      return;
    }
    const url = getPublicUrl('employee-documents', docPath);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      showToast(`Could not open ${docName}.`);
    }
  };

  const formatAadhaarMasked = (raw) => {
    if (!raw) return '•••• •••• ••••';
    const clean = String(raw).replace(/\D/g, '');
    if (clean.length === 12) {
      return `${clean.slice(0, 4)} •••• ${clean.slice(8, 12)}`;
    }
    return clean.length > 4 ? `•••• •••• ${clean.slice(-4)}` : clean;
  };

  const formatAccountMasked = (raw) => {
    if (!raw) return '•••• •••• ••••';
    const str = String(raw).trim();
    if (str.length > 4) {
      return `${'•'.repeat(Math.max(4, str.length - 4))} ${str.slice(-4)}`;
    }
    return str;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] space-y-4">
        <div className="p-4 rounded-2xl bg-rose-50 text-[#E63946] animate-spin">
          <RefreshCw size={28} />
        </div>
        <p className="text-sm font-bold text-slate-600">Loading verified employee profile...</p>
      </div>
    );
  }

  const fullName = employee?.full_name || employee?.name || 'Live Employee';
  const initial = fullName.trim().charAt(0).toUpperCase() || 'E';
  const photoUrl = employee?.candidate_photo_path 
    ? getPublicUrl('employee-photos', employee.candidate_photo_path) 
    : (employee?.photo_url || employee?.photoUrl || null);

  const aadhaarDocUrl = employee?.aadhaar_document_path 
    ? getPublicUrl('employee-documents', employee.aadhaar_document_path) 
    : employee?.aadhaarDocUrl;

  const panDocUrl = employee?.pan_document_path 
    ? getPublicUrl('employee-documents', employee.pan_document_path) 
    : employee?.panDocUrl;

  const passbookDocUrl = employee?.bank_passbook_path 
    ? getPublicUrl('employee-documents', employee.bank_passbook_path) 
    : employee?.passbookUrl;

  const isActive = (employee?.status || 'active').toLowerCase() === 'active';

  const tabs = [
    { id: 'personal', label: 'Personal & Contact', icon: User },
    { id: 'qualification', label: 'Education & Qualification', icon: GraduationCap },
    { id: 'kyc', label: 'Identity & KYC', icon: ShieldCheck },
    { id: 'banking', label: 'Bank & Compensation', icon: Landmark },
    { id: 'reference', label: 'Reference Details', icon: Users },
  ];

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>Employee Portal</span>
            <span>/</span>
            <span className="text-[#E63946]">Official Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            My Employee Profile
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Live official employee record and verified deployment credentials.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fetchProfile(true)} 
            disabled={refreshing}
            className="font-semibold cursor-pointer border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs"
            icon={refreshing ? RefreshCw : RefreshCw}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Record'}
          </Button>
        </div>
      </div>

      {/* Hero Profile Banner Card with Authentic Admin-Uploaded Image */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#E63946] via-[#FF6B6B] to-[#FFDDE0] text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-[#E63946]/40">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-[#00B4D8]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-20 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8 relative z-10">
          {/* Real Uploaded Photo */}
          <div className="relative shrink-0">
            {photoUrl && !imgError ? (
              <img
                src={photoUrl}
                alt={fullName}
                onError={() => setImgError(true)}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-white/40 shadow-2xl bg-white/20"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-4xl sm:text-5xl font-black text-slate-900 shadow-2xl ring-4 ring-white/40">
                {initial}
              </div>
            )}
            <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-md ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
          </div>

          {/* Profile Identity Details */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {fullName}
              </h2>
              <span className="inline-flex items-center text-xs font-mono font-bold bg-[#00B4D8] text-slate-950 px-3 py-1 rounded-full shadow-xs">
                {employee?.employee_id || currentEmpId}
              </span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${isActive ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40' : 'bg-slate-500/20 text-slate-200 border-slate-400/40'}`}>
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-300 animate-ping' : 'bg-slate-300'}`} />
                {isActive ? 'Active Employee' : 'Inactive'}
              </span>
            </div>

            <p className="text-sm sm:text-base text-rose-50 font-semibold flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span>{employee?.designation || employee?.position || 'Mandal Co-ordinator'}</span>
              <span>•</span>
              <span className="text-white/90">{employee?.department || 'Field Operations'}</span>
              {(employee?.mandal || employee?.mandal_id || employee?.district || employee?.district_id) && (
                <span className="bg-black/20 text-white text-xs px-2.5 py-0.5 rounded-lg border border-white/20 font-medium">
                  {employee?.mandal || employee?.mandal_id ? `${employee.mandal || employee.mandal_id}, ` : ''}
                  {employee?.district || employee?.district_id || 'Nellore'}
                </span>
              )}
            </p>

            {/* Quick Contact Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-5 text-xs text-rose-100">
              {employee?.email && (
                <a href={`mailto:${employee.email}`} className="flex items-center gap-1.5 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                  <Mail size={14} className="text-[#00B4D8]" />
                  <span>{employee.email}</span>
                </a>
              )}
              {employee?.phone && (
                <a href={`tel:${employee.phone}`} className="flex items-center gap-1.5 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                  <Phone size={14} className="text-emerald-300" />
                  <span>+91 {employee.phone}</span>
                </a>
              )}
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                <MapPin size={14} className="text-amber-300" />
                <span>Andhra Pradesh, India</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActiveTab = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActiveTab
                  ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/25'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents: Authentic Admin Fields ONLY */}
      <div className="space-y-6">
        {/* Tab 1: Personal & Contact */}
        {activeTab === 'personal' && (
          <Card className="border border-slate-200/80 shadow-sm rounded-3xl bg-white overflow-hidden">
            <CardHeader className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#E63946] flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                Employee Personal & Contact Record
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Full Legal Name</span>
                  <p className="text-sm font-bold text-slate-900">{fullName}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Mobile Number</span>
                  <p className="text-sm font-bold text-slate-900">{employee?.phone ? `+91 ${employee.phone}` : '—'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Official Email</span>
                  <p className="text-sm font-bold text-slate-900 truncate">{employee?.email || '—'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1 md:col-span-2 lg:col-span-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Residential Address</span>
                  <p className="text-sm font-medium text-slate-800">{employee?.address || '—'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">State</span>
                  <p className="text-sm font-bold text-slate-900">Andhra Pradesh</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Assigned District</span>
                  <p className="text-sm font-bold text-slate-900">{employee?.district_id || employee?.district || '—'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Assigned Mandal</span>
                  <p className="text-sm font-bold text-slate-900">{employee?.mandal_id || employee?.mandal || '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 2: Education & Qualification */}
        {activeTab === 'qualification' && (
          <Card className="border border-slate-200/80 shadow-sm rounded-3xl bg-white overflow-hidden">
            <CardHeader className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#00B4D8] flex items-center justify-center">
                  <GraduationCap className="h-4 w-4" />
                </div>
                Academic & Educational Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Highest Qualification</span>
                  <p className="text-sm font-bold text-slate-900">{employee?.qualification || '—'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Course / Specialization</span>
                  <p className="text-sm font-bold text-slate-900">{employee?.course || '—'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">University / Board</span>
                  <p className="text-sm font-bold text-slate-900">{employee?.university || '—'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Year of Passing</span>
                  <p className="text-sm font-bold text-slate-900">{employee?.year_of_passing || '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 3: Identity & KYC Documents */}
        {activeTab === 'kyc' && (
          <Card className="border border-slate-200/80 shadow-sm rounded-3xl bg-white overflow-hidden">
            <CardHeader className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                Identity Verification & Government Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* Aadhaar Card */}
              <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Aadhaar Card</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">Verified</span>
                  </div>
                  <p className="text-base font-mono font-bold text-slate-900">
                    {formatAadhaarMasked(employee?.aadhaar_number)}
                  </p>
                </div>
                <div>
                  {employee?.aadhaar_document_path ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDocument(employee.aadhaar_document_path, 'Aadhaar Document')}
                      className="cursor-pointer border-slate-300 hover:bg-slate-100 font-semibold text-slate-700"
                      icon={Eye}
                    >
                      View Aadhaar Document
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">No document attached</span>
                  )}
                </div>
              </div>

              {/* PAN Card */}
              <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">PAN Card</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">Verified</span>
                  </div>
                  <p className="text-base font-mono font-bold text-slate-900">
                    {employee?.pan_number ? employee.pan_number.toUpperCase() : '—'}
                  </p>
                </div>
                <div>
                  {employee?.pan_document_path ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDocument(employee.pan_document_path, 'PAN Document')}
                      className="cursor-pointer border-slate-300 hover:bg-slate-100 font-semibold text-slate-700"
                      icon={Eye}
                    >
                      View PAN Document
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">No document attached</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 4: Bank & Compensation */}
        {activeTab === 'banking' && (
          <Card className="border border-slate-200/80 shadow-sm rounded-3xl bg-white overflow-hidden">
            <CardHeader className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Landmark className="h-4 w-4" />
                </div>
                Salary Bank Account & Passbook Record
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Account Holder Name</span>
                  <p className="text-sm font-bold text-slate-900">{employee?.account_holder_name || fullName}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Bank Name</span>
                  <p className="text-sm font-bold text-slate-900">{employee?.bank_name || '—'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Account Number</span>
                  <p className="text-sm font-mono font-bold text-slate-900">{formatAccountMasked(employee?.account_number)}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">IFSC Code</span>
                  <p className="text-sm font-mono font-bold text-slate-900">{employee?.ifsc_code ? employee.ifsc_code.toUpperCase() : '—'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Branch Name</span>
                  <p className="text-sm font-bold text-slate-900">{employee?.branch_name || '—'}</p>
                </div>
              </div>

              {/* Bank Passbook Document */}
              <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Bank Passbook Copy</span>
                  <p className="text-xs text-slate-600">Official proof of bank account uploaded during onboarding.</p>
                </div>
                <div>
                  {employee?.bank_passbook_path ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDocument(employee.bank_passbook_path, 'Bank Passbook')}
                      className="cursor-pointer border-slate-300 hover:bg-slate-100 font-semibold text-slate-700"
                      icon={Eye}
                    >
                      View Bank Passbook
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">No passbook document attached</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 5: Reference Details */}
        {activeTab === 'reference' && (
          <Card className="border border-slate-200/80 shadow-sm rounded-3xl bg-white overflow-hidden">
            <CardHeader className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
                Emergency & Reference Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Reference Person Name</span>
                  <p className="text-sm font-bold text-slate-900">{employee?.reference_person_name || '—'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Reference Mobile Number</span>
                  <p className="text-sm font-bold text-slate-900">{employee?.reference_mobile ? `+91 ${employee.reference_mobile}` : '—'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Relationship</span>
                  <p className="text-sm font-bold text-slate-900">{employee?.reference_relationship || '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
