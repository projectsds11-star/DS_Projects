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
import EmployeeAvatar from '../../components/common/EmployeeAvatar';
import { onboardingService, offerService } from '../../services/onboardingService';
import { cn } from '../../utils/cn';

export default function Onboarding() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState({
    total: 0,
    pending: 0,
    drafted: 0,
    sent: 0,
    accepted: 0,
    completed: 0,
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
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={FileText}
            onClick={() => navigate('/admin/offers')}
            className="whitespace-nowrap"
          >
            Offer Letters List
          </Button>
          <Button
            size="sm"
            icon={Plus}
            onClick={() => navigate('/admin/onboarding/create')}
            className="whitespace-nowrap"
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

      {/* ── KPI Metrics Bar ───────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Total In Pipeline', val: kpis.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Offer', val: kpis.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Offer Drafts', val: kpis.drafted, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Offers Sent', val: kpis.sent, icon: Send, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Offers Accepted', val: kpis.accepted, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Completed', val: kpis.completed, icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i} className="border border-[var(--color-border)] shadow-xs">
              <CardContent className="p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-500">{kpi.label}</span>
                  <div className={`p-1.5 rounded-md ${kpi.bg} ${kpi.color}`}>
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

              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto whitespace-nowrap">
                {['all', 'pending', 'sent', 'accepted', 'completed'].map(t => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg capitalize font-bold transition-all text-xs cursor-pointer whitespace-nowrap',
                      activeTab === t ? 'bg-white shadow-xs text-[#E63946]' : 'text-slate-600 hover:text-slate-900'
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
            <thead className="text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200 font-bold text-[11px] whitespace-nowrap">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">ID & Location</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Registered Date</th>
                <th className="px-4 py-3">Onboarding Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => (
                <tr key={emp.employeeId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <EmployeeAvatar emp={emp} size="sm" shape="circle" />
                      <div>
                        <p className="font-bold text-slate-900">{emp.fullName}</p>
                        <p className="text-[11px] text-slate-400">{emp.qualification || 'Graduate'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="font-mono font-bold text-[#E63946]">{emp.employeeId}</p>
                    <p className="text-[11px] text-slate-500">{emp.district}{emp.mandal ? ` · ${emp.mandal}` : ''}</p>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="text-slate-800 font-medium">{emp.email}</p>
                    <p className="text-[11px] text-slate-400 font-mono">+91 {emp.phone}</p>
                  </td>

                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                    {emp.createdDate}
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StatusBadge status={emp.onboardingStatus || 'Pending Offer'} />
                  </td>

                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    {emp.hasOffer ? (
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs font-bold px-3 rounded-xl border-slate-300 hover:bg-slate-100 text-slate-700 shadow-2xs whitespace-nowrap"
                          onClick={() => navigate(`/admin/onboarding/${emp.employeeId}`)}
                        >
                          Timeline
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 text-xs font-bold px-3 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white shadow-xs whitespace-nowrap"
                          onClick={() => navigate(`/admin/offers/${emp.offerId}`)}
                        >
                          View Offer
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="h-8 text-xs font-bold px-3.5 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white shadow-xs whitespace-nowrap"
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
