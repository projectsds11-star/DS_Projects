import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  FileText, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  ArrowRight, 
  Download, 
  Mail, 
  Layers,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import StatusBadge from '../../components/onboarding/StatusBadge';
import { onboardingService, offerService } from '../../services/onboardingService';
import { cn } from '../../utils/cn';

export default function Onboarding() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState({
    total: 6,
    pending: 3,
    drafted: 0,
    sent: 1,
    accepted: 1,
    completed: 1,
    failed: 0,
  });

  const [employees, setEmployees] = useState([]);
  const [offers, setOffers] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [kpiData, empList, offerList] = await Promise.all([
          onboardingService.getKPIs(),
          onboardingService.getAllEmployees(),
          offerService.getOffers(),
        ]);
        setKpis(kpiData);
        setEmployees(empList);
        setOffers(offerList);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      !search ||
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchDistrict = !districtFilter || emp.district === districtFilter;
    const matchTab =
      activeTab === 'all' ||
      (activeTab === 'pending' && (!emp.hasOffer || emp.onboardingStatus === 'Pending Offer')) ||
      (activeTab === 'sent' && emp.onboardingStatus === 'Offer Sent') ||
      (activeTab === 'accepted' && emp.onboardingStatus === 'Offer Accepted') ||
      (activeTab === 'completed' && emp.onboardingStatus === 'Onboarding Completed');

    return matchSearch && matchDistrict && matchTab;
  });

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-navy)]">Employee Onboarding Hub</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage end-to-end employee onboarding, job offer letters, email dispatches, and account activation.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={FileText}
            onClick={() => navigate('/admin/offers')}
          >
            Offer Letters List
          </Button>
          <Button
            size="sm"
            icon={Plus}
            onClick={() => navigate('/admin/onboarding/create')}
          >
            Create Job Offer
          </Button>
        </div>
      </div>

      {/* ── Sub-Navigation Tabs ──────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Onboarding Overview', path: '/admin/onboarding' },
          { id: 'pending', label: `Pending Offers (${kpis.pending})`, path: '/admin/onboarding/pending' },
          { id: 'offers', label: 'All Offer Letters', path: '/admin/offers' },
          { id: 'templates', label: 'Offer Templates', path: '/admin/onboarding/templates' },
          { id: 'emails', label: 'Email History', path: '/admin/onboarding/email-history' },
        ].map(tab => (
          <Link
            key={tab.id}
            to={tab.path}
            className={cn(
              'px-3.5 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-all',
              tab.id === 'overview'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* ── KPI Metric Cards ─────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {[
          { label: 'Total In Pipeline', val: kpis.total, icon: Users, color: 'blue' },
          { label: 'Pending Offers', val: kpis.pending, icon: Clock, color: 'amber' },
          { label: 'Offers Sent', val: kpis.sent, icon: Send, color: 'sky' },
          { label: 'Offers Accepted', val: kpis.accepted, icon: CheckCircle2, color: 'emerald' },
          { label: 'Completed', val: kpis.completed, icon: Layers, color: 'green' },
          { label: 'Email Failed', val: kpis.failed, icon: AlertCircle, color: 'rose' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border border-[var(--color-border)] shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-500">{kpi.label}</span>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-${kpi.color}-50 text-${kpi.color}-600`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <p className="text-2xl font-bold font-mono text-[var(--color-navy)] mt-2">{kpi.val}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Pipeline Quick Action Tracker ────────────────────── */}
      <Card>
        <CardHeader className="border-b border-[var(--color-border)] bg-gray-50/50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-sm">Onboarding Pipeline Candidates</CardTitle>
            
            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search candidate..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-8 pr-3 text-xs rounded-lg border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] w-40 sm:w-48"
                />
              </div>

              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="h-8 px-2 text-xs rounded-lg border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">All Districts</option>
                <option value="Nellore">Nellore</option>
                <option value="Guntur">Guntur</option>
                <option value="Krishna">Krishna</option>
                <option value="Prakasam">Prakasam</option>
                <option value="Chittoor">Chittoor</option>
              </select>

              <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs">
                {['all', 'pending', 'sent', 'accepted', 'completed'].map(t => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={cn(
                      'px-2.5 py-1 rounded capitalize font-medium transition-all text-[11px]',
                      activeTab === t ? 'bg-white shadow-xs text-[var(--color-primary)] font-bold' : 'text-gray-500 hover:text-gray-800'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Table / Responsive Cards */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-gray-500 uppercase bg-gray-50/80 border-b border-[var(--color-border)] font-semibold text-[10px]">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">ID & Location</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Registered Date</th>
                <th className="px-4 py-3">Onboarding Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredEmployees.map((emp) => (
                <tr key={emp.employeeId} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-lavender)] flex items-center justify-center font-bold text-xs text-[var(--color-navy)] shrink-0">
                        {emp.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{emp.fullName}</p>
                        <p className="text-[11px] text-gray-400">{emp.qualification || 'Graduate'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="font-mono font-bold text-[var(--color-primary)]">{emp.employeeId}</p>
                    <p className="text-[11px] text-gray-500">{emp.district}{emp.mandal ? ` · ${emp.mandal}` : ''}</p>
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="text-gray-800">{emp.email}</p>
                    <p className="text-[11px] text-gray-400 font-mono">+91 {emp.phone}</p>
                  </td>

                  <td className="px-4 py-3.5 text-gray-500">
                    {emp.createdDate}
                  </td>

                  <td className="px-4 py-3.5">
                    <StatusBadge status={emp.onboardingStatus || 'Pending Offer'} />
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    {emp.hasOffer ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] px-2.5"
                          onClick={() => navigate(`/admin/onboarding/${emp.employeeId}`)}
                        >
                          Timeline
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-[11px] px-2.5"
                          onClick={() => navigate(`/admin/offers/${emp.offerId}`)}
                        >
                          View Offer
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="h-7 text-[11px] px-3 bg-[var(--color-primary)]"
                        icon={ArrowRight}
                        onClick={() => navigate(`/admin/onboarding/create?employeeId=${emp.employeeId}`)}
                      >
                        Create Offer
                      </Button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="font-medium text-sm">No employees match this filter</p>
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
