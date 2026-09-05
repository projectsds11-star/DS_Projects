/**
 * src/pages/admin/EmployeeDetail.jsx
 * Full read-only view of an employee record.
 * Uses signed URLs for private document access.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Edit2, User, ShieldCheck, Landmark, Users, MapPin,
  FileText, RefreshCw, AlertCircle, Eye, Download, CheckCircle, XCircle
} from 'lucide-react';
import { employeeService } from '../../services/employeeService';
import { Button } from '../../components/ui/Button';

const cn = (...cls) => cls.filter(Boolean).join(' ');

function DetailRow({ label, value, mono, masked }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 shrink-0 w-40">{label}</span>
      <span className={cn('text-sm font-medium text-gray-800 text-right break-all', mono && 'font-mono')}>
        {masked || value || '—'}
      </span>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
    >
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-gray-50/80 border-b border-gray-200">
        <div className="w-7 h-7 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-[var(--color-primary)]" />
        </div>
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="px-5 py-1">{children}</div>
    </motion.div>
  );
}

export default function EmployeeDetail() {
  const { id } = useParams(); // employee_id (DS-001)
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [photoUrl, setPhotoUrl] = useState(null);
  const [passbookUrl, setPassbookUrl] = useState(null);
  const [aadhaarDocUrl, setAadhaarDocUrl] = useState(null);
  const [panDocUrl, setPanDocUrl] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState({ photo: false, passbook: false, aadhaar: false, pan: false });
  const [statusLoading, setStatusLoading] = useState(false);

  // ── Fetch employee ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      const emp = await employeeService.getEmployeeById(id);
      if (!emp) {
        setError('Employee not found.');
        setLoading(false);
        return;
      }
      setEmployee(emp);
      setLoading(false);

      // Preload photo signed URL
      if (emp.photoPath) {
        try {
          setLoadingDoc(p => ({ ...p, photo: true }));
          const url = await employeeService.getSignedUrl('employee-photos', emp.photoPath);
          setPhotoUrl(url);
        } catch { /* no photo preview */ }
        finally { setLoadingDoc(p => ({ ...p, photo: false })); }
      }
    })();
  }, [id]);

  const loadPassbook = async () => {
    if (!employee?.passbookPath || passbookUrl) return;
    try {
      setLoadingDoc(p => ({ ...p, passbook: true }));
      const url = await employeeService.getSignedUrl('employee-documents', employee.passbookPath);
      setPassbookUrl(url);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      alert('Could not load document: ' + e.message);
    } finally {
      setLoadingDoc(p => ({ ...p, passbook: false }));
    }
  };

  const loadAadhaarDoc = async () => {
    if (!employee?.aadhaarDocumentPath || aadhaarDocUrl) return;
    try {
      setLoadingDoc(p => ({ ...p, aadhaar: true }));
      const url = await employeeService.getSignedUrl('employee-documents', employee.aadhaarDocumentPath);
      setAadhaarDocUrl(url);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      alert('Could not load document: ' + e.message);
    } finally {
      setLoadingDoc(p => ({ ...p, aadhaar: false }));
    }
  };

  const loadPanDoc = async () => {
    if (!employee?.panDocumentPath || panDocUrl) return;
    try {
      setLoadingDoc(p => ({ ...p, pan: true }));
      const url = await employeeService.getSignedUrl('employee-documents', employee.panDocumentPath);
      setPanDocUrl(url);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      alert('Could not load document: ' + e.message);
    } finally {
      setLoadingDoc(p => ({ ...p, pan: false }));
    }
  };

  const handleToggleStatus = async () => {
    if (!employee) return;
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    const confirmMsg = newStatus === 'inactive'
      ? `Deactivate ${employee.name}? They will no longer appear as active.`
      : `Activate ${employee.name}?`;
    if (!window.confirm(confirmMsg)) return;

    setStatusLoading(true);
    try {
      await employeeService.updateStatus(employee.employeeId, newStatus);
      setEmployee(prev => ({ ...prev, status: newStatus }));
    } catch (e) {
      alert(e.message);
    }
    setStatusLoading(false);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading employee…</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-gray-600">{error || 'Employee not found.'}</p>
        <Button variant="outline" onClick={() => navigate('/admin/employees')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to List
        </Button>
      </div>
    );
  }

  const isActive = employee.status === 'active';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate('/admin/employees')}
          className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition mt-0.5"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900 truncate">{employee.name}</h1>
            <span className={cn(
              'text-xs font-semibold px-2.5 py-0.5 rounded-full border',
              isActive
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-gray-100 text-gray-500 border-gray-200'
            )}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-xs text-gray-500 font-mono mt-0.5">{employee.employeeId}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleStatus}
            isLoading={statusLoading}
          >
            {isActive ? <XCircle className="h-3.5 w-3.5 mr-1" /> : <CheckCircle className="h-3.5 w-3.5 mr-1" />}
            {isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(`/admin/employees/edit/${employee.employeeId}`)}
          >
            <Edit2 className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
        </div>
      </div>

      {/* Photo + basic info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-start gap-5">
        {loadingDoc.photo ? (
          <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : photoUrl ? (
          <img
            src={photoUrl}
            alt={employee.name}
            className="w-20 h-20 rounded-xl object-cover border-2 border-[var(--color-primary)] shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center shrink-0">
            <User className="h-9 w-9 text-[var(--color-primary)]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-gray-900">{employee.name}</p>
          <p className="text-sm text-gray-500 mt-0.5">{employee.email}</p>
          <p className="text-sm text-gray-500">+91 {employee.phone}</p>
          <p className="text-xs text-gray-400 mt-1.5 font-mono">{employee.employeeId}</p>
        </div>
      </div>

      {/* Sections */}
      <Section title="Employee Information" icon={User}>
        <DetailRow label="Full Name" value={employee.name} />
        <DetailRow label="Address" value={employee.address} />
        <DetailRow label="Phone" value={`+91 ${employee.phone}`} />
        <DetailRow label="Email" value={employee.email} />
      </Section>

      <Section title="Qualification Details" icon={FileText}>
        <DetailRow label="Qualification" value={employee.qualification} />
        <DetailRow label="Course / Degree" value={employee.course} />
        <DetailRow label="University / Board" value={employee.university} />
        <DetailRow label="Year of Passing" value={employee.yearOfPassing} />
      </Section>

      <Section title="Identity Information" icon={ShieldCheck}>
        <DetailRow
          label="Aadhaar"
          masked={employee.aadhaar ? `${employee.aadhaar.slice(0,4)}-****-${employee.aadhaar.slice(-4)}` : '—'}
          mono
        />
        <div className="py-2.5 flex items-center justify-between border-b border-gray-100">
          <span className="text-xs text-gray-500 w-40 shrink-0">Aadhaar Document</span>
          {employee.aadhaarDocumentPath ? (
            <button
              onClick={loadAadhaarDoc}
              disabled={loadingDoc.aadhaar}
              className="flex items-center gap-1.5 text-xs text-[var(--color-primary)] hover:underline font-medium disabled:opacity-50"
            >
              {loadingDoc.aadhaar
                ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Loading…</>
                : <><Eye className="h-3.5 w-3.5" /> View Document</>
              }
            </button>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>
        <DetailRow label="PAN" value={employee.pan} mono />
        <div className="py-2.5 flex items-center justify-between border-b border-gray-100">
          <span className="text-xs text-gray-500 w-40 shrink-0">PAN Document</span>
          {employee.panDocumentPath ? (
            <button
              onClick={loadPanDoc}
              disabled={loadingDoc.pan}
              className="flex items-center gap-1.5 text-xs text-[var(--color-primary)] hover:underline font-medium disabled:opacity-50"
            >
              {loadingDoc.pan
                ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Loading…</>
                : <><Eye className="h-3.5 w-3.5" /> View Document</>
              }
            </button>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>
      </Section>

      <Section title="Bank Information" icon={Landmark}>
        <DetailRow label="Account Holder" value={employee.accountHolderName} />
        <DetailRow label="Bank Name" value={employee.bankName} />
        <DetailRow
          label="Account Number"
          masked={employee.accountNumber ? `${'•'.repeat(Math.max(0, employee.accountNumber.length - 4))}${employee.accountNumber.slice(-4)}` : '—'}
          mono
        />
        <DetailRow label="IFSC Code" value={employee.ifsc} mono />
        <DetailRow label="Branch Name" value={employee.branchName} />
        <div className="py-2.5 flex items-center justify-between border-b border-gray-100">
          <span className="text-xs text-gray-500 w-40 shrink-0">Bank Passbook</span>
          {employee.passbookPath ? (
            <button
              onClick={loadPassbook}
              disabled={loadingDoc.passbook}
              className="flex items-center gap-1.5 text-xs text-[var(--color-primary)] hover:underline font-medium disabled:opacity-50"
            >
              {loadingDoc.passbook
                ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Loading…</>
                : <><Eye className="h-3.5 w-3.5" /> View Document</>
              }
            </button>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>
      </Section>

      <Section title="Reference Information" icon={Users}>
        <DetailRow label="Reference Person" value={employee.referenceName} />
        <DetailRow label="Reference Mobile" value={`+91 ${employee.referenceMobile}`} />
        <DetailRow label="Relationship" value={employee.relationship} />
      </Section>

      <Section title="Location" icon={MapPin}>
        <DetailRow label="State" value="Andhra Pradesh" />
        <DetailRow label="District" value={employee.districtId} />
        <DetailRow label="Mandal" value={employee.mandalId} />
      </Section>

      {/* Footer */}
      <div className="text-xs text-gray-400 text-center pb-6">
        Created: {new Date(employee.createdAt).toLocaleString('en-IN')}
        {employee.updatedAt && employee.updatedAt !== employee.createdAt &&
          ` · Updated: ${new Date(employee.updatedAt).toLocaleString('en-IN')}`
        }
      </div>
    </div>
  );
}
