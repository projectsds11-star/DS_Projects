import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Search, RotateCw, CheckCircle2, AlertCircle, ArrowLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { onboardingService, offerService } from '../../services/onboardingService';

export default function EmailHistory() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [resendingId, setResendingId] = useState(null);
  const [toast, setToast] = useState('');

  const loadLogs = async () => {
    const list = await onboardingService.getEmailLogs();
    setLogs(list);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleResend = async (log) => {
    setResendingId(log.id);
    try {
      // Find offer by employeeId or mock resend
      const offers = await offerService.getOffers({ search: log.employeeId });
      if (offers.length > 0) {
        await offerService.resendOffer(offers[0].id);
      }
      setToast('Email re-dispatched to SMTP server.');
      setTimeout(() => setToast(''), 3000);
      loadLogs();
    } finally {
      setResendingId(null);
    }
  };

  const filteredLogs = logs.filter(l =>
    !search ||
    l.recipientName?.toLowerCase().includes(search.toLowerCase()) ||
    l.recipientEmail?.toLowerCase().includes(search.toLowerCase()) ||
    l.subject?.toLowerCase().includes(search.toLowerCase()) ||
    l.employeeId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
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
              <span className="text-gray-600 font-medium">Email History</span>
            </nav>
            <h1 className="text-xl font-bold text-[var(--color-navy)]">Email Dispatch History & Audit Trail</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live delivery log of offer letters, welcome emails, and credential notifications.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative w-full sm:w-80">
            <Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by recipient name, email, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full pl-9 pr-3 text-xs rounded-lg border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Log list */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-gray-500 uppercase bg-gray-50/80 border-b border-[var(--color-border)] font-semibold text-[10px]">
              <tr>
                <th className="px-4 py-3">Recipient & ID</th>
                <th className="px-4 py-3">Subject & Type</th>
                <th className="px-4 py-3">Attachments</th>
                <th className="px-4 py-3">Sent Timestamp</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-gray-900">{log.recipientName}</p>
                      <p className="text-[11px] font-mono text-[var(--color-primary)]">{log.employeeId}</p>
                      <p className="text-[11px] text-gray-500">{log.recipientEmail}</p>
                    </td>

                    <td className="px-4 py-3.5 max-w-xs">
                      <p className="font-semibold text-gray-900 truncate">{log.subject}</p>
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        {log.type}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-gray-600">
                      <div className="flex flex-col gap-0.5 text-[11px]">
                        {log.attachments?.map((att, i) => (
                          <span key={i} className="truncate max-w-[160px] text-gray-700">📎 {att}</span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-gray-500 text-[11px]">
                      {log.sentAt}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[10px] ${
                        log.status === 'Delivered' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        <CheckCircle2 className="h-3 w-3 text-teal-600" />
                        {log.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px]"
                        icon={RotateCw}
                        isLoading={resendingId === log.id}
                        onClick={() => handleResend(log)}
                      >
                        Resend
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    No email dispatches recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
