import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Send, 
  Download, 
  Printer, 
  Check, 
  RotateCw,
  ArrowLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import StatusBadge from '../../components/onboarding/StatusBadge';
import OfferDocumentPreview from '../../components/onboarding/OfferDocumentPreview';
import { offerService } from '../../services/onboardingService';
import { formatINR, JOB_POSITIONS } from '../../services/templateService';

export default function OfferLetters() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Quick Preview Drawer / Modal
  const [previewOffer, setPreviewOffer] = useState(null);
  const [resendingId, setResendingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const loadOffers = async () => {
    setLoading(true);
    try {
      const list = await offerService.getOffers({
        search,
        position: positionFilter,
        district: districtFilter,
        status: statusFilter,
      });
      setOffers(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, [search, positionFilter, districtFilter, statusFilter]);

  const handleResend = async (offerId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to resend the offer letter email to this candidate?')) return;
    setResendingId(offerId);
    try {
      await offerService.resendOffer(offerId);
      setToastMessage('Offer letter email resent successfully.');
      setTimeout(() => setToastMessage(''), 3000);
      loadOffers();
    } catch (err) {
      alert('Failed to resend: ' + err.message);
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{toastMessage}</span>
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
              <span className="text-gray-600 font-medium">Offer Letters</span>
            </nav>
            <h1 className="text-xl font-bold text-[var(--color-navy)]">Offer Letters Repository</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Review generated appointment letters, track dispatch delivery, and manage candidate offers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            icon={Plus}
            onClick={() => navigate('/admin/onboarding/create')}
          >
            Create New Offer
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, ID, offer no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full pl-9 pr-3 text-xs rounded-lg border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="h-9 px-3 text-xs rounded-lg border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">All Job Positions</option>
              {JOB_POSITIONS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="h-9 px-3 text-xs rounded-lg border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">All Districts</option>
              <option value="Nellore">Nellore</option>
              <option value="Guntur">Guntur</option>
              <option value="Krishna">Krishna</option>
              <option value="Prakasam">Prakasam</option>
              <option value="Chittoor">Chittoor</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 text-xs rounded-lg border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="">All Statuses</option>
              <option value="Offer Draft">Offer Draft</option>
              <option value="Offer Generated">Offer Generated</option>
              <option value="Offer Sent">Offer Sent</option>
              <option value="Offer Accepted">Offer Accepted</option>
              <option value="Onboarding Completed">Onboarding Completed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Offers Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-gray-500 uppercase bg-gray-50/80 border-b border-[var(--color-border)] font-semibold text-[10px]">
              <tr>
                <th className="px-4 py-3">Offer Ref & Candidate</th>
                <th className="px-4 py-3">Role & Jurisdiction</th>
                <th className="px-4 py-3">Joining Date</th>
                <th className="px-4 py-3">Compensation</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Sent Timestamp</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {offers.map((offer) => (
                <tr
                  key={offer.id}
                  className="hover:bg-[#D8F5FA]/20 transition-colors cursor-pointer"
                  onClick={() => setPreviewOffer(offer)}
                >
                  <td className="px-4 py-3.5">
                    <div>
                      <span className="font-mono font-bold text-[var(--color-primary)] text-xs">{offer.offerNumber}</span>
                      <p className="font-bold text-gray-900 text-sm mt-0.5">{offer.employeeName}</p>
                      <p className="text-[11px] font-mono text-gray-400">{offer.employeeId} · {offer.email}</p>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="font-bold text-gray-800">{offer.position}</p>
                    <p className="text-[11px] text-gray-500">{offer.district}, {offer.mandal}</p>
                  </td>

                  <td className="px-4 py-3.5 text-gray-700 font-medium">
                    {offer.joiningDate}
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="font-mono font-bold text-green-700">{formatINR(offer.salary?.monthlyTotal || 0)} / mo</p>
                    <p className="text-[10px] font-mono text-gray-400">{formatINR(offer.salary?.annualCtc || 0)} CTC</p>
                  </td>

                  <td className="px-4 py-3.5">
                    <StatusBadge status={offer.status} />
                  </td>

                  <td className="px-4 py-3.5 text-gray-500 font-mono text-[11px]">
                    {offer.sentAt || 'Draft'}
                  </td>

                  <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-gray-500 hover:text-[var(--color-primary)]"
                        title="Preview Document"
                        onClick={() => setPreviewOffer(offer)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-gray-500 hover:text-[#E63946]"
                        title="Resend Offer Email"
                        isLoading={resendingId === offer.id}
                        onClick={(e) => handleResend(offer.id, e)}
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px] px-2.5"
                        onClick={() => navigate(`/admin/offers/${offer.id}`)}
                      >
                        Details
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {offers.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="font-medium text-sm">No offer letters match your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Document Preview Modal ────────────────────────────── */}
      {previewOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-[var(--color-border)]">
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--color-primary)]" />
                <span className="font-bold text-sm text-[var(--color-navy)]">
                  Offer Letter Preview — {previewOffer.employeeName} ({previewOffer.offerNumber})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOffer(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-gray-100/70">
              <OfferDocumentPreview offerData={previewOffer} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
