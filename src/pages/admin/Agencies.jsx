import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Power,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Globe,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { agencyService } from '../../services/agencyService';
import { locationService } from '../../services/locationService';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export default function Agencies() {
  const navigate = useNavigate();

  const [agencies, setAgencies] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Status toggle loading state
  const [togglingId, setTogglingId] = useState(null);

  // Load agencies & districts
  const loadData = async () => {
    setLoading(true);
    try {
      const [agencyList, districtList] = await Promise.all([
        agencyService.getAgencies(),
        locationService.getDistrictsSync()
      ]);
      setAgencies(agencyList || []);
      setDistricts(districtList || []);
    } catch (err) {
      console.error('Failed to load agency data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered agencies
  const filteredAgencies = useMemo(() => {
    return agencies.filter((item) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (item.name || '').toLowerCase().includes(q) ||
        (item.agency_code || '').toLowerCase().includes(q) ||
        (item.contact_person || '').toLowerCase().includes(q) ||
        (item.phone || '').includes(q) ||
        (item.email || '').toLowerCase().includes(q) ||
        (item.district_name || '').toLowerCase().includes(q) ||
        (item.mandal_name || '').toLowerCase().includes(q);

      // District
      const matchDistrict =
        selectedDistrict === 'ALL' ||
        (item.district_name || '').toLowerCase() === selectedDistrict.toLowerCase() ||
        (item.district_id || '') === selectedDistrict;

      // Status
      const matchStatus =
        selectedStatus === 'ALL' ||
        (item.status || 'active').toLowerCase() === selectedStatus.toLowerCase();

      return matchSearch && matchDistrict && matchStatus;
    });
  }, [agencies, searchQuery, selectedDistrict, selectedStatus]);

  // Metrics
  const totalCount = agencies.length;
  const activeCount = agencies.filter((a) => (a.status || 'active') === 'active').length;
  const inactiveCount = totalCount - activeCount;
  const coveredDistrictsCount = new Set(
    agencies.map((a) => a.district_name).filter(Boolean)
  ).size;

  // Toggle status
  const handleToggleStatus = async (agency) => {
    setTogglingId(agency.id);
    try {
      const res = await agencyService.toggleStatus(agency.id, agency.status);
      if (res.success) {
        setAgencies((prev) =>
          prev.map((a) =>
            a.id === agency.id
              ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' }
              : a
          )
        );
      }
    } catch (e) {
      console.error('Error toggling status:', e);
    } finally {
      setTogglingId(null);
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await agencyService.deleteAgency(deleteTarget.id);
      setAgencies((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      console.error('Error deleting agency:', e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 pb-14">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-rose-500/10 to-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-50 border border-rose-100 text-[#E63946] text-xs font-bold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>PARTNER ECOSYSTEM & NODES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Agency Management
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Coordinate certified operational agencies, district vendor nodes, and external partner organizations.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/agencies/add')}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white font-bold text-sm shadow-md shadow-[#E63946]/25 hover:shadow-lg hover:shadow-[#E63946]/35 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Agency</span>
        </button>
      </div>

      {/* ── Stats Metric Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Agencies */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Agencies</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalCount}</p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            Registered network nodes
          </p>
        </div>

        {/* Active Agencies */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Deployed</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{activeCount}</p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Operational & verified
          </p>
        </div>

        {/* Inactive Agencies */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Suspended / Inactive</span>
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-700">{inactiveCount}</p>
          <p className="text-xs text-slate-500 mt-1">Pending review or paused</p>
        </div>

        {/* Districts Covered */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Districts Covered</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E63946]">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#E63946]">{coveredDistrictsCount}</p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-[#E63946]" />
            Andhra Pradesh districts
          </p>
        </div>
      </div>

      {/* ── Search & Filter Controls ───────────────────────────── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by agency name, code, contact, phone, or location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] transition-all"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* District Filter */}
          <div className="flex items-center gap-2 min-w-[170px] flex-1 sm:flex-none">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] cursor-pointer transition-all"
            >
              <option value="ALL">All Districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 min-w-[140px] flex-1 sm:flex-none">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] cursor-pointer transition-all"
            >
              <option value="ALL">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedDistrict !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDistrict('ALL');
                setSelectedStatus('ALL');
              }}
              className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Agency Cards / Directory Grid ──────────────────────── */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#E63946] flex items-center justify-center mx-auto mb-4 animate-spin">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Loading Agencies Directory...</h3>
          <p className="text-xs text-slate-400 mt-1">Synchronizing partner nodes and district records</p>
        </div>
      ) : filteredAgencies.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 sm:p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 text-[#E63946] flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Agencies Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            {searchQuery || selectedDistrict !== 'ALL' || selectedStatus !== 'ALL'
              ? 'No partner agency matches your current filter criteria. Try adjusting or clearing your filters.'
              : 'You have not added any partner agencies yet. Create your first operational partner agency to get started.'}
          </p>
          {searchQuery || selectedDistrict !== 'ALL' || selectedStatus !== 'ALL' ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDistrict('ALL');
                setSelectedStatus('ALL');
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          ) : (
            <button
              onClick={() => navigate('/admin/agencies/add')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add First Agency</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAgencies.map((agency) => {
            const isActive = (agency.status || 'active') === 'active';
            const isToggling = togglingId === agency.id;

            return (
              <div
                key={agency.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group hover:border-[#E63946]/40"
              >
                {/* Card Top Banner */}
                <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3 bg-gradient-to-r from-slate-50/70 to-white">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                      {agency.name ? agency.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/60">
                          {agency.agency_code || 'AG-000'}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base truncate mt-1 group-hover:text-[#E63946] transition-colors">
                        {agency.name}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 flex-1 text-xs">
                  {/* Contact Person */}
                  <div className="flex items-center gap-2.5 text-slate-700">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-900">
                      {agency.contact_person || 'Not Specified'}
                    </span>
                    <span className="text-slate-400">• Contact Lead</span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    {agency.phone ? (
                      <a
                        href={`tel:${agency.phone}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {agency.phone}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">No phone provided</span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    {agency.email ? (
                      <a
                        href={`mailto:${agency.email}`}
                        className="font-medium text-slate-700 hover:text-[#E63946] truncate"
                      >
                        {agency.email}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">No email provided</span>
                    )}
                  </div>

                  {/* Jurisdiction Badge */}
                  <div className="pt-2 border-t border-slate-100 flex items-start gap-2.5 text-slate-600">
                    <MapPin className="w-4 h-4 text-[#E63946] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800">
                        {agency.district_name || 'District N/A'}
                        {agency.mandal_name && (
                          <span className="text-slate-500 font-normal">
                            {' '}
                            • {agency.mandal_name}
                          </span>
                        )}
                      </p>
                      {agency.address && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {agency.address}
                          {agency.pincode && ` - ${agency.pincode}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Notes / Description */}
                  {agency.notes && (
                    <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-600 line-clamp-2 border border-slate-100">
                      {agency.notes}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                  {/* Status Toggle Button */}
                  <button
                    onClick={() => handleToggleStatus(agency)}
                    disabled={isToggling}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200'
                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <Power className={`w-3.5 h-3.5 ${isToggling ? 'animate-spin' : ''}`} />
                    <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Edit Button */}
                    <button
                      onClick={() => navigate(`/admin/agencies/edit/${agency.id}`)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                      title="Edit Agency"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setDeleteTarget(agency)}
                      className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete Agency"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Confirm Delete Modal ──────────────────────────────── */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={Boolean(deleteTarget)}
          title="Delete Agency Node?"
          message={`Are you sure you want to remove "${deleteTarget.name}" (${deleteTarget.agency_code}) from the active agency network? This action will archive this partner agency.`}
          confirmText="Yes, Delete Agency"
          cancelText="Keep Agency"
          variant="danger"
          isLoading={deleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
