import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronRight, 
  Send, 
  RotateCw, 
  Download, 
  CheckCircle2, 
  FileText, 
  Mail, 
  ShieldCheck, 
  User, 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  Clock, 
  KeyRound, 
  Copy, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import StatusBadge from '../../components/onboarding/StatusBadge';
import OnboardingTimeline from '../../components/onboarding/OnboardingTimeline';
import OfferDocumentPreview from '../../components/onboarding/OfferDocumentPreview';
import { onboardingService, offerService } from '../../services/onboardingService';
import { formatINR } from '../../services/templateService';

export default function OnboardingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [employee, setEmployee] = useState(null);
  const [offer, setOffer] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Try finding by employee or offer
        let emp = await onboardingService.getEmployeeById(id);
        let off = await offerService.getOfferById(id);

        if (!off && emp?.hasOffer) {
          off = await offerService.getOfferById(emp.offerId);
        }
        if (!emp && off?.employeeId) {
          emp = await onboardingService.getEmployeeById(off.employeeId);
        }

        setEmployee(emp);
        setOffer(off);

        const targetEmpId = emp?.employeeId || off?.employeeId || id;
        const [tl, logs] = await Promise.all([
          onboardingService.getTimeline(targetEmpId),
          onboardingService.getEmailLogs(),
        ]);

        setTimeline(tl);
        setEmailLogs(logs.filter(l => l.employeeId === targetEmpId || l.recipientEmail === emp?.email));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleResend = async () => {
    if (!offer?.id) return;
    setIsResending(true);
    try {
      await offerService.resendOffer(offer.id);
      setToast('Offer letter email resent successfully.');
      setTimeout(() => setToast(''), 3000);
      const logs = await onboardingService.getEmailLogs();
      setEmailLogs(logs.filter(l => l.employeeId === employee?.employeeId));
    } finally {
      setIsResending(false);
    }
  };

  const handleCopyActivationLink = () => {
    const link = `http://localhost:5175/activate-account?token=${offer?.activationToken || 'demo_token'}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-gray-400">
        <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-[var(--color-primary)]" />
        Loading onboarding dossier...
      </div>
    );
  }

  const candidateName = employee?.fullName || offer?.employeeName || 'Candidate';
  const candidateId = employee?.employeeId || offer?.employeeId || id;
  const positionName = offer?.position || 'Mandal Co-ordinator';
  const statusVal = offer?.status || employee?.onboardingStatus || 'Pending Offer';

  return (
    <div className="space-y-6 pb-20">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/admin/onboarding')}
            className="mt-1 p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <nav className="flex items-center gap-1 text-xs text-gray-400 mb-1">
              <Link to="/admin/onboarding" className="hover:text-[var(--color-primary)] transition-colors">Onboarding</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-600 font-medium">{candidateId}</span>
            </nav>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[var(--color-navy)]">{candidateName}</h1>
              <StatusBadge status={statusVal} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Employee ID: <span className="font-mono font-bold text-[var(--color-primary)]">{candidateId}</span> · Role: <strong className="text-gray-800">{positionName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={copiedLink ? Check : Copy}
            onClick={handleCopyActivationLink}
          >
            {copiedLink ? 'Link Copied' : 'Activation Link'}
          </Button>

          {offer && (
            <Button
              size="sm"
              icon={RotateCw}
              isLoading={isResending}
              onClick={handleResend}
            >
              Resend Offer Email
            </Button>
          )}
        </div>
      </div>

      {/* 7 Tabs Header */}
      <div className="flex border-b border-[var(--color-border)] overflow-x-auto gap-2 bg-white px-4 pt-2 rounded-t-xl">
        {[
          { id: 'overview', label: 'Overview & Timeline', icon: Clock },
          { id: 'job', label: 'Job & Location', icon: Briefcase },
          { id: 'offer', label: 'Offer Document', icon: FileText },
          { id: 'documents', label: 'Documents & Verification', icon: ShieldCheck },
          { id: 'email', label: `Email History (${emailLogs.length})`, icon: Mail },
          { id: 'account', label: 'Portal Account', icon: KeyRound },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                activeTab === t.id
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-blue-50/40 rounded-t-lg'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: OVERVIEW & TIMELINE ─────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Candidate Card */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-lavender)] flex items-center justify-center font-bold text-lg text-[var(--color-navy)]">
                    {candidateName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">{candidateName}</h3>
                    <p className="text-xs font-mono font-bold text-[var(--color-primary)]">{candidateId}</p>
                    <p className="text-xs text-gray-500">{employee?.email || offer?.email}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Position:</span>
                    <span className="font-bold text-gray-800">{positionName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">District / Mandal:</span>
                    <span className="text-gray-800">{offer?.district || employee?.district}, {offer?.mandal || employee?.mandal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monthly CTC:</span>
                    <span className="font-bold font-mono text-green-700">{formatINR(offer?.salary?.monthlyTotal || 24000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Annual CTC:</span>
                    <span className="font-bold font-mono text-[var(--color-navy)]">{formatINR(offer?.salary?.annualCtc || 288000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Joining Date:</span>
                    <span className="font-semibold text-gray-800">{offer?.joiningDate || 'Pending'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 border-b border-[var(--color-border)]">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  icon={ExternalLink}
                  onClick={() => window.open(`http://localhost:5175/activate-account?token=${offer?.activationToken || 'demo_token'}`, '_blank')}
                >
                  Open Candidate Activation Page
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  icon={FileText}
                  onClick={() => setActiveTab('offer')}
                >
                  View Official Offer Letter
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Column */}
          <div className="lg:col-span-2">
            <OnboardingTimeline events={timeline} />
          </div>
        </div>
      )}

      {/* ── TAB 2: JOB & LOCATION ──────────────────────────────── */}
      {activeTab === 'job' && (
        <Card>
          <CardHeader className="border-b border-[var(--color-border)] p-5">
            <CardTitle className="text-sm">Job Assignment & Jurisdiction</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="text-gray-400 uppercase tracking-wider font-semibold">Official Designation</span>
                <p className="font-bold text-sm text-[var(--color-navy)]">{positionName}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="text-gray-400 uppercase tracking-wider font-semibold">Department</span>
                <p className="font-bold text-sm text-gray-800">{offer?.department || 'Field Operations'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="text-gray-400 uppercase tracking-wider font-semibold">Assigned District</span>
                <p className="font-bold text-sm text-gray-800">{offer?.district || employee?.district}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="text-gray-400 uppercase tracking-wider font-semibold">Assigned Mandal</span>
                <p className="font-bold text-sm text-gray-800">{offer?.mandal || employee?.mandal}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="text-gray-400 uppercase tracking-wider font-semibold">Reporting Officer</span>
                <p className="font-bold text-sm text-gray-800">{offer?.reportingManager || 'District Lead'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="text-gray-400 uppercase tracking-wider font-semibold">Probation / Notice</span>
                <p className="font-bold text-sm text-gray-800">{offer?.probation || '3 Months'} · {offer?.noticePeriod || '30 Days'}</p>
              </div>
            </div>

            {/* Compensation Table */}
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                Remuneration Schedule
              </h4>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs grid sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-gray-400">Basic Pay:</span>
                  <p className="font-mono font-bold text-gray-900 text-sm mt-0.5">{formatINR(offer?.salary?.basic || 16000)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Travel Allowance:</span>
                  <p className="font-mono font-bold text-gray-900 text-sm mt-0.5">{formatINR(offer?.salary?.travel || 3000)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Performance Incentive:</span>
                  <p className="font-mono font-bold text-gray-900 text-sm mt-0.5">{formatINR(offer?.salary?.incentive || 3500)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Monthly Gross:</span>
                  <p className="font-mono font-bold text-green-700 text-base mt-0.5">{formatINR(offer?.salary?.monthlyTotal || 24000)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 3: OFFER LETTER DOCUMENT ───────────────────────── */}
      {activeTab === 'offer' && (
        <OfferDocumentPreview offerData={offer || { employeeName: candidateName, employeeId: candidateId }} />
      )}

      {/* ── TAB 4: DOCUMENTS ───────────────────────────────────── */}
      {activeTab === 'documents' && (
        <Card>
          <CardHeader className="border-b border-[var(--color-border)] p-5">
            <CardTitle className="text-sm">Candidate Submitted Verification Documents</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {[
              { name: 'Aadhaar Card Proof', status: 'Verified', date: '2026-08-28', type: 'PDF' },
              { name: 'PAN Card Proof', status: 'Verified', date: '2026-08-28', type: 'PDF' },
              { name: 'Bank Account Passbook / Cancelled Cheque', status: 'Verified', date: '2026-08-28', type: 'PDF' },
              { name: 'Highest Degree Certificate', status: 'Verified', date: '2026-08-28', type: 'PDF' },
              { name: 'Signed Appointment Offer Acceptance Copy', status: offer?.status === 'Offer Accepted' ? 'Verified' : 'Pending Upload', date: 'Pending', type: 'PDF' },
            ].map(doc => (
              <div key={doc.name} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-bold text-gray-900">{doc.name}</p>
                    <p className="text-gray-400 text-[11px]">{doc.type} · Submitted: {doc.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] ${
                    doc.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {doc.status}
                  </span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">View</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── TAB 5: EMAIL HISTORY ───────────────────────────────── */}
      {activeTab === 'email' && (
        <Card>
          <CardHeader className="border-b border-[var(--color-border)] p-5">
            <CardTitle className="text-sm">Email Delivery Audit Trail</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-[var(--color-border)]">
            {emailLogs.map(log => (
              <div key={log.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">{log.subject}</span>
                    <span className="bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-semibold text-[10px]">
                      {log.status}
                    </span>
                  </div>
                  <p className="text-gray-500">Delivered to: <strong className="text-gray-800">{log.recipientEmail}</strong> at {log.sentAt}</p>
                  <p className="text-gray-400 text-[11px]">Attachments: {log.attachments?.join(', ')}</p>
                </div>
                <Button variant="outline" size="sm" icon={RotateCw} onClick={handleResend}>
                  Resend
                </Button>
              </div>
            ))}

            {emailLogs.length === 0 && (
              <div className="p-12 text-center text-gray-400 text-xs">
                <Mail className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                No emails dispatched to this candidate yet.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── TAB 6: PORTAL ACCOUNT ──────────────────────────────── */}
      {activeTab === 'account' && (
        <Card>
          <CardHeader className="border-b border-[var(--color-border)] p-5">
            <CardTitle className="text-sm">Employee Portal Authentication & Access</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-5 text-xs">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="text-gray-400 uppercase tracking-wider font-semibold">Auto-Generated Username</span>
                <p className="font-mono font-bold text-sm text-[var(--color-primary)]">
                  {offer?.username || `${candidateName.toLowerCase().replace(/\s+/g, '')}${candidateId.replace('DS-', '')}@dsprojects`}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="text-gray-400 uppercase tracking-wider font-semibold">Account Status</span>
                <p className="font-bold text-sm text-green-700">
                  {employee?.status === 'Active' ? 'Activated & Live' : 'Pending Password Setup'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs">
              <h4 className="font-bold text-[var(--color-navy)] flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-[var(--color-primary)]" />
                Candidate Activation URL
              </h4>
              <p className="text-gray-600">
                The employee can set their password and activate their portal account using this single-use link:
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  readOnly
                  value={`http://localhost:5175/activate-account?token=${offer?.activationToken || 'demo_token'}`}
                  className="h-8 flex-1 px-3 bg-white border border-blue-200 rounded-lg font-mono text-[11px] text-gray-700"
                />
                <Button size="sm" className="h-8" icon={copiedLink ? Check : Copy} onClick={handleCopyActivationLink}>
                  {copiedLink ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
