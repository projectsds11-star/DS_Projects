import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  Eye,
  Trash2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  Printer,
  Download,
  AlertCircle,
  Building2,
  Briefcase,
  X,
  ExternalLink,
  ChevronRight,
  UserPlus,
} from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import { Button } from '../../components/ui/Button';
import { COMPANY_INFO } from '../../data/companyInfo';

const STATUS_CONFIG = {
  submitted: { label: 'New Submitted', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Clock },
  under_review: { label: 'Under Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: HelpCircle },
  selected: { label: 'Selected / Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
  hold: { label: 'On Hold', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: Clock },
  rejected: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: XCircle },
};

export default function JobApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [officeForm, setOfficeForm] = useState({
    status: 'submitted',
    interviewDate: '',
    authorizedSignatory: '',
    officeNotes: '',
  });

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationService.listAdminApplications({
        status: statusFilter,
        search: searchQuery,
      });
      setApplications(data);
    } catch (err) {
      console.warn('Could not load applications from server:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadApplications();
  };

  const openDetailModal = (app) => {
    setSelectedApp(app);
    setOfficeForm({
      status: app.status || 'submitted',
      interviewDate: app.interview_date || '',
      authorizedSignatory: app.authorized_signatory || 'DS Projects HR Admin',
      officeNotes: app.office_notes || '',
    });
  };

  const handleOfficeSave = async () => {
    if (!selectedApp) return;
    setIsUpdating(true);
    try {
      const updated = await applicationService.updateAdminApplication(selectedApp.id, officeForm);
      setSelectedApp(updated);
      setApplications((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
      alert('Office records updated successfully.');
    } catch (err) {
      alert(err.message || 'Failed to update application');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id, appNo) => {
    if (!window.confirm(`Are you sure you want to remove application ${appNo}?`)) return;
    try {
      await applicationService.deleteAdminApplication(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      if (selectedApp?.id === id) setSelectedApp(null);
    } catch (err) {
      alert(err.message || 'Could not delete application');
    }
  };

  // Convert applicant to Employee / Onboarding
  const handleFastTrackToEmployee = (app) => {
    const prefillData = {
      name: app.full_name,
      email: app.email,
      phone: app.mobile_number,
      address: app.present_address || app.permanent_address,
      aadhaar_number: app.aadhaar_or_id_number,
    };
    sessionStorage.setItem('ds_prefill_employee', JSON.stringify(prefillData));
    navigate('/admin/employees/add');
  };

  // Statistics
  const totalCount = applications.length;
  const newCount = applications.filter((a) => a.status === 'submitted').length;
  const selectedCount = applications.filter((a) => a.status === 'selected').length;
  const holdCount = applications.filter((a) => a.status === 'hold').length;

  return (
    <div className="space-y-6">
      {/* ── Top Header Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="text-[#E63946]" size={26} />
            <span>Job Applications &amp; Field Candidates</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review online job applications for MSME ZED Certification Field Work and manage candidate interview status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.open('/apply', '_blank')}
            className="text-xs font-semibold gap-1.5 h-9"
          >
            <ExternalLink size={14} />
            <span>Public Form URL</span>
          </Button>

          <Button
            type="button"
            onClick={loadApplications}
            className="bg-[#1e3a8a] hover:bg-[#1e293b] text-white text-xs font-semibold gap-1.5 h-9"
          >
            <span>Refresh List</span>
          </Button>
        </div>
      </div>

      {/* ── Stat Metric Pills ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Applications</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{totalCount}</span>
        </div>
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/60 shadow-2xs">
          <span className="text-xs font-semibold text-blue-700 block">New / Submitted</span>
          <span className="text-2xl font-black text-blue-900 mt-1 block">{newCount}</span>
        </div>
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/60 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-700 block">Selected / Approved</span>
          <span className="text-2xl font-black text-emerald-900 mt-1 block">{selectedCount}</span>
        </div>
        <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-200/60 shadow-2xs">
          <span className="text-xs font-semibold text-purple-700 block">On Hold / Interview</span>
          <span className="text-2xl font-black text-purple-900 mt-1 block">{holdCount}</span>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ─────────────────────────────────── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by candidate name, application no, mobile, or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:bg-white transition"
              />
            </div>
            <Button type="submit" variant="outline" className="h-9 text-xs px-4">
              Search
            </Button>
          </form>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {['all', 'submitted', 'under_review', 'selected', 'hold', 'rejected'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium transition capitalize ${
                  statusFilter === st
                    ? 'bg-[#1e3a8a] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Applications Table ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <div className="w-6 h-6 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading submitted applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 space-y-3">
            <FileText size={32} className="mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No job applications found matching filter.</p>
            <p className="text-slate-400">Candidates who submit the online form will appear here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="p-3 w-32">App. No</th>
                  <th className="p-3">Candidate Details</th>
                  <th className="p-3">Position &amp; Preferred Area</th>
                  <th className="p-3">Readiness</th>
                  <th className="p-3">Applied Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => {
                  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.submitted;
                  const StatusIcon = cfg.icon;

                  return (
                    <tr key={app.id || app.application_no} className="hover:bg-slate-50/60 transition">
                      <td className="p-3 font-mono font-bold text-[#1e3a8a]">
                        {app.application_no}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {app.candidate_photo_url ? (
                              <img
                                src={app.candidate_photo_url}
                                alt={app.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-bold text-slate-500 text-xs">
                                {(app.full_name || 'U')[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{app.full_name}</p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone size={11} /> {app.mobile_number}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <p className="font-semibold text-slate-800">{app.position_applied_for}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} /> {app.preferred_area || 'Not specified'}
                        </p>
                      </td>

                      <td className="p-3">
                        <div className="space-y-0.5 text-[11px]">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${app.willing_to_travel ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            Travel: {app.willing_to_travel ? 'Yes' : 'No'}
                          </span>
                          <span className={`inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${app.two_wheeler_and_license ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>
                            Bike: {app.two_wheeler_and_license ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 text-slate-500 text-[11px]">
                        {app.application_date || (app.created_at ? app.created_at.split('T')[0] : '—')}
                      </td>

                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                          <StatusIcon size={12} />
                          <span>{cfg.label}</span>
                        </span>
                      </td>

                      <td className="p-3 text-right space-x-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailModal(app)}
                          className="h-8 px-2.5 text-xs font-semibold gap-1"
                        >
                          <Eye size={13} />
                          <span>Review</span>
                        </Button>

                        <button
                          type="button"
                          onClick={() => handleDelete(app.id, app.application_no)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                          title="Delete application"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Detail Review Modal ─────────────────────────────────────── */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-[#1e3a8a] text-white p-4 sm:p-5 flex items-center justify-between">
              <div>
                <h3 className="font-black text-base sm:text-lg flex items-center gap-2">
                  <span>Application: {selectedApp.application_no}</span>
                </h3>
                <p className="text-xs text-sky-200 mt-0.5">
                  Post: {selectedApp.position_applied_for} • Submitted on {selectedApp.application_date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scroll Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* Candidate Quick Header */}
              <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-20 h-24 rounded-lg bg-white border border-slate-300 overflow-hidden shrink-0 shadow-2xs flex items-center justify-center">
                  {selectedApp.candidate_photo_url ? (
                    <img
                      src={selectedApp.candidate_photo_url}
                      alt={selectedApp.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-slate-400">
                      {(selectedApp.full_name || 'U')[0].toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-base font-black text-slate-900">{selectedApp.full_name}</h4>
                    <span className="text-[11px] font-mono text-slate-500">ID: {selectedApp.application_no}</span>
                  </div>

                  <p className="text-slate-600">
                    <span className="font-bold text-slate-700">Father's Name:</span> {selectedApp.father_or_guardian_name || '—'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                    <p><span className="font-semibold text-slate-700">DOB / Age:</span> {selectedApp.date_of_birth || '—'} ({selectedApp.gender})</p>
                    <p><span className="font-semibold text-slate-700">Marital Status:</span> {selectedApp.marital_status}</p>
                    <p><span className="font-semibold text-slate-700">Phone:</span> {selectedApp.mobile_number} {selectedApp.alternate_mobile ? `| Alt: ${selectedApp.alternate_mobile}` : ''}</p>
                    <p><span className="font-semibold text-slate-700">Email:</span> {selectedApp.email}</p>
                    <p><span className="font-semibold text-slate-700">Aadhaar / ID:</span> {selectedApp.aadhaar_or_id_number || '—'}</p>
                    <p><span className="font-semibold text-slate-700">Two-Wheeler &amp; License:</span> {selectedApp.two_wheeler_and_license ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">Present Address</span>
                  <p className="text-slate-600 leading-relaxed">{selectedApp.present_address || '—'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">Permanent Address</span>
                  <p className="text-slate-600 leading-relaxed">{selectedApp.permanent_address || '—'}</p>
                </div>
              </div>

              {/* Educational Qualifications Table */}
              <div className="space-y-2">
                <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Educational Qualifications
                </h5>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="p-2 border-r border-slate-200">Level</th>
                        <th className="p-2 border-r border-slate-200">Institution / University</th>
                        <th className="p-2 border-r border-slate-200">Stream</th>
                        <th className="p-2 border-r border-slate-200 text-center">Year</th>
                        <th className="p-2 text-center">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedApp.qualifications || []).map((q, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2 font-bold text-slate-800 border-r border-slate-200 bg-slate-50/30">
                            {q.qualification}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-slate-700">{q.school || '—'}</td>
                          <td className="p-2 border-r border-slate-200 text-slate-700">{q.stream || '—'}</td>
                          <td className="p-2 border-r border-slate-200 text-center text-slate-700">{q.year || '—'}</td>
                          <td className="p-2 text-center font-semibold text-slate-800">{q.score || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Work Experience */}
              <div className="space-y-2">
                <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Work Experience
                </h5>
                {selectedApp.work_experience && selectedApp.work_experience.length > 0 && selectedApp.work_experience.some(w => w.company) ? (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                          <th className="p-2 border-r border-slate-200">Company</th>
                          <th className="p-2 border-r border-slate-200">Role</th>
                          <th className="p-2 border-r border-slate-200">Duration</th>
                          <th className="p-2">Responsibilities</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedApp.work_experience.map((w, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-semibold text-slate-800 border-r border-slate-200">{w.company || '—'}</td>
                            <td className="p-2 border-r border-slate-200 text-slate-700">{w.designation || '—'}</td>
                            <td className="p-2 border-r border-slate-200 text-slate-700">{w.duration || '—'}</td>
                            <td className="p-2 text-slate-600">{w.responsibilities || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-500 italic p-2 bg-slate-50 rounded border border-slate-200">
                    Candidate declared as Fresher / No previous commercial work experience recorded.
                  </p>
                )}
              </div>

              {/* Field Readiness & Languages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 block mb-1">Languages Known</span>
                  <div className="flex flex-wrap gap-1">
                    {(selectedApp.languages_known || []).map((l) => (
                      <span key={l} className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-700 font-medium">
                        {l}
                      </span>
                    ))}
                    {selectedApp.languages_other && (
                      <span className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-700 font-medium">
                        Other: {selectedApp.languages_other}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-800 block mb-1">Field Work Preferences</span>
                  <p className="text-slate-700">
                    Willing to travel: <strong>{selectedApp.willing_to_travel ? 'Yes' : 'No'}</strong>
                  </p>
                  <p className="text-slate-700 mt-0.5">
                    Preferred Area: <strong>{selectedApp.preferred_area || 'Not specified'}</strong>
                  </p>
                </div>
              </div>

              {/* Signature Preview */}
              {selectedApp.signature_url && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Applicant Signature</span>
                    <span className="text-[11px] text-slate-500">Place: {selectedApp.place || 'Ongole'} • Date: {selectedApp.application_date}</span>
                  </div>
                  <img src={selectedApp.signature_url} alt="Applicant Signature" className="h-10 object-contain bg-white px-2 py-1 border border-slate-300 rounded" />
                </div>
              )}

              {/* ── FOR OFFICE USE ONLY (Admin Editing Form) ───────────── */}
              <div className="bg-amber-50/60 border-2 border-amber-300/80 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <span className="font-black text-amber-900 uppercase tracking-wide">
                    FOR OFFICE USE ONLY (DSPROJECTS, ONGOLE)
                  </span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                    Admin Verification Panel
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Selection Status *</label>
                    <select
                      value={officeForm.status}
                      onChange={(e) => setOfficeForm({ ...officeForm, status: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-xs"
                    >
                      <option value="submitted">New / Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="selected">Selected / Approved</option>
                      <option value="hold">On Hold</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Interview Date</label>
                    <input
                      type="date"
                      value={officeForm.interviewDate}
                      onChange={(e) => setOfficeForm({ ...officeForm, interviewDate: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Authorized Signatory</label>
                    <input
                      type="text"
                      value={officeForm.authorizedSignatory}
                      onChange={(e) => setOfficeForm({ ...officeForm, authorizedSignatory: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Internal Notes &amp; Remarks</label>
                  <input
                    type="text"
                    placeholder="Candidate qualifications check, interview rating, or jurisdiction assignment..."
                    value={officeForm.officeNotes}
                    onChange={(e) => setOfficeForm({ ...officeForm, officeNotes: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="button"
                    isLoading={isUpdating}
                    onClick={handleOfficeSave}
                    className="bg-[#1e3a8a] hover:bg-[#1e293b] text-white text-xs font-bold h-9 px-4 rounded-lg"
                  >
                    Save Office Updates
                  </Button>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.print()}
                  className="gap-1.5 text-xs h-9"
                >
                  <Printer size={14} />
                  <span>Print Form</span>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={() => handleFastTrackToEmployee(selectedApp)}
                  className="bg-[#E63946] hover:bg-[#FF6B6B] text-white text-xs font-bold gap-1.5 h-9"
                >
                  <UserPlus size={14} />
                  <span>Fast-track to Employee Onboarding</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedApp(null)}
                  className="text-xs h-9"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
