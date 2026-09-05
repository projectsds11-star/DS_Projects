import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  MoreVertical,
  Users,
  MapPin,
  Phone,
  Mail,
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Send,
  Trash2,
  Edit,
  Power,
  UserCheck,
  UserX,
  ChevronDown,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { employeeService } from '../../services/employeeService';

function EmployeeAvatar({ emp }) {
  const [imgUrl, setImgUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (emp.photoPath) {
      employeeService.getSignedUrl('employee-photos', emp.photoPath)
        .then(url => {
          if (isMounted) setImgUrl(url);
        })
        .catch(() => {});
    }
    return () => { isMounted = false; };
  }, [emp.photoPath]);

  if (imgUrl) {
    return (
      <img 
        src={imgUrl} 
        alt={emp.name} 
        className={`w-10 h-10 rounded-xl object-cover shrink-0 shadow-xs border border-slate-200 ${emp.displayStatus === 'Inactive' ? 'opacity-70 grayscale' : ''}`}
      />
    );
  }

  return (
    <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${emp.displayStatus === 'Inactive'
        ? 'bg-gradient-to-tr from-slate-500 to-slate-400 opacity-70'
        : 'bg-gradient-to-tr from-[#E63946] to-[#FF6B6B]'
      }`}>
      {(emp.name || 'E').charAt(0).toUpperCase()}
    </div>
  );
}

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null); // { type: 'action'|'status', emp: object, top: number, right?: number, left?: number }
  const [toastMessage, setToastMessage] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, emp: null });

  useEffect(() => {
    async function fetchEmployees() {
      setLoading(true);
      try {
        const list = await employeeService.getEmployees();
        const normalized = (list || []).map(emp => ({
          ...emp,
          displayStatus: emp.status
            ? emp.status.charAt(0).toUpperCase() + emp.status.slice(1).toLowerCase()
            : 'Active',
        }));
        setEmployees(normalized);
      } catch (err) {
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEmployees();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateStatus = async (emp, newStatus) => {
    const empId = emp.employeeId;
    setUpdatingId(empId);
    setActiveMenu(null);
    try {
      await employeeService.updateStatus(empId, newStatus.toLowerCase());
      setEmployees(prev => prev.map(e =>
        e.employeeId === empId
          ? { ...e, status: newStatus.toLowerCase(), displayStatus: newStatus }
          : e
      ));
      showToast(`${emp.name} marked as ${newStatus}!`);
    } catch (err) {
      showToast(err.message || 'Failed to update employee status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = (emp) => {
    setActiveMenu(null);
    setConfirmModal({ isOpen: true, emp });
  };

  const executeDelete = async () => {
    const emp = confirmModal.emp;
    if (!emp) return;
    try {
      await employeeService.deleteEmployee(emp.employeeId);
      setEmployees(prev => prev.filter(e => e.employeeId !== emp.employeeId));
      showToast(`${emp.name} removed.`);
    } catch (err) {
      showToast(err.message || 'Failed to delete employee.');
    }
  };

  const openActionMenu = (e, emp) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const isNearBottom = rect.bottom > window.innerHeight - 230;

    setActiveMenu({
      type: 'action',
      emp,
      top: isNearBottom ? Math.max(10, rect.top - 200) : (rect.bottom + 6),
      right: Math.max(16, window.innerWidth - rect.right),
    });
  };

  const openStatusMenu = (e, emp) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const isNearBottom = rect.bottom > window.innerHeight - 170;

    setActiveMenu({
      type: 'status',
      emp,
      top: isNearBottom ? Math.max(10, rect.top - 160) : (rect.bottom + 6),
      left: Math.max(16, rect.left),
    });
  };

  const districts = ['All', ...new Set(employees.map(e => e.districtId).filter(Boolean))];

  const filteredEmployees = employees.filter(emp => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q ||
      (emp.name || '').toLowerCase().includes(q) ||
      (emp.employeeId || '').toLowerCase().includes(q) ||
      (emp.email || '').toLowerCase().includes(q) ||
      (emp.phone || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'All' || emp.displayStatus === statusFilter;
    const matchesDistrict = districtFilter === 'All' || emp.districtId === districtFilter;

    return matchesSearch && matchesStatus && matchesDistrict;
  });

  const getStatusBadge = (emp) => {
    const isUpdating = updatingId === emp.employeeId;

    if (isUpdating) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 animate-pulse">
          <Loader2 size={12} className="animate-spin" /> Updating...
        </span>
      );
    }

    if (emp.displayStatus === 'Active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </span>
      );
    }

    if (emp.displayStatus === 'Inactive') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-rose-800 bg-rose-100 border border-rose-200">
          <XCircle size={13} className="text-rose-600 shrink-0" />
          Inactive
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-800 bg-amber-100 border border-amber-200">
        <Clock size={12} className="text-amber-600 shrink-0" />
        Onboarding
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <span>Staff Directory & Workforce</span>
            <span className="text-xs font-bold bg-[#D8F5FA] text-blue-800 px-2.5 py-0.5 rounded-full">
              {employees.length} Total
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">Real-time database of field personnel across all mandal sectors.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/admin/employees/add')}
            className="bg-[#E63946] hover:bg-[#FF6B6B] text-white font-bold cursor-pointer"
            icon={UserPlus}
          >
            + Add New Employee
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['All', 'Active', 'Onboarding', 'Inactive'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${statusFilter === st ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* District Selector */}
          {districts.length > 1 && (
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="text-xs font-bold text-slate-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
            >
              {districts.map(d => (
                <option key={d} value={d}>{d === 'All' ? 'All Districts' : d}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Directory Table / Cards */}
      <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
        <div className="overflow-x-auto">
          {filteredEmployees.length > 0 ? (
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Qualification</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp.employeeId}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/employees/${emp.employeeId}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <EmployeeAvatar emp={emp} />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{emp.name}</span>
                            {emp.displayStatus === 'Inactive' && (
                              <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-bold">Disabled</span>
                            )}
                          </div>
                          <div className="font-mono text-xs text-[#E63946] font-semibold">{emp.employeeId}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-slate-800 font-medium">{emp.phone || '-'}</div>
                      <div className="text-xs text-slate-400">{emp.email || '-'}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{emp.qualification || '-'}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <MapPin size={13} className="text-rose-500" />
                        {emp.districtId || '-'}
                      </div>
                      <div className="text-xs text-slate-500 pl-4">{emp.mandalId || '-'}</div>
                    </td>

                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => openStatusMenu(e, emp)}
                        className="group flex items-center gap-1 hover:opacity-85 transition-opacity cursor-pointer focus:outline-none"
                        title="Click to change status"
                      >
                        {getStatusBadge(emp)}
                        <ChevronDown size={12} className="text-slate-400 group-hover:text-slate-600 ml-0.5" />
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/employees/edit/${emp.employeeId}`)}
                          className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <Edit size={12} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={(e) => openActionMenu(e, emp)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer focus:outline-none"
                          title="More actions"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center space-y-3">
              <Users className="h-12 w-12 text-slate-300 mx-auto" />
              <p className="font-bold text-sm text-slate-700">No matching employees found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {employees.length === 0
                  ? 'Your database is currently empty. Add your first employee using the button above.'
                  : 'Try adjusting your search query or filter settings.'}
              </p>
              {employees.length === 0 && (
                <Button onClick={() => navigate('/admin/employees/add')} className="bg-[#E63946] text-white font-bold mt-2" icon={Plus}>
                  Add First Employee
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Floating Action / Status Overlay Menu (Fixed to viewport - never clipped by table overflow) */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-900/10"
          onClick={() => setActiveMenu(null)}
        >
          {activeMenu.type === 'action' ? (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                top: `${activeMenu.top}px`,
                right: `${activeMenu.right}px`,
              }}
              className="w-52 rounded-2xl bg-white shadow-2xl border border-slate-200 py-2 z-[9999] text-left animate-in fade-in zoom-in-95"
            >
              <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Status Controls
              </div>

              {activeMenu.emp.displayStatus !== 'Active' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(activeMenu.emp, 'Active')}
                  className="w-full text-left px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <UserCheck size={14} className="text-emerald-600" />
                  <span>Mark as Active</span>
                </button>
              )}

              {activeMenu.emp.displayStatus !== 'Inactive' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(activeMenu.emp, 'Inactive')}
                  className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <UserX size={14} className="text-rose-600" />
                  <span>Mark as Inactive</span>
                </button>
              )}

              {activeMenu.emp.displayStatus !== 'Onboarding' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(activeMenu.emp, 'Onboarding')}
                  className="w-full text-left px-3.5 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Clock size={14} className="text-amber-600" />
                  <span>Mark as Onboarding</span>
                </button>
              )}

              <div className="my-1.5 border-t border-slate-100" />
              <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Workforce Actions
              </div>

              <button
                type="button"
                onClick={() => { setActiveMenu(null); navigate(`/admin/employees/${activeMenu.emp.employeeId}`); }}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <AlertCircle size={14} className="text-[#00B4D8]" />
                <span>View Profile</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveMenu(null); navigate(`/admin/employees/edit/${activeMenu.emp.employeeId}`); }}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Edit size={14} className="text-[#00B4D8]" />
                <span>Edit Employee</span>
              </button>

              <div className="my-1.5 border-t border-slate-100" />

              <button
                type="button"
                onClick={() => handleDelete(activeMenu.emp)}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 size={14} className="text-rose-600" />
                <span>Delete Employee</span>
              </button>
            </div>
          ) : (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                top: `${activeMenu.top}px`,
                left: `${activeMenu.left}px`,
              }}
              className="w-48 rounded-2xl bg-white shadow-2xl border border-slate-200 py-1.5 z-[9999] animate-in fade-in zoom-in-95"
            >
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Change Status
              </div>

              <button
                type="button"
                onClick={() => handleUpdateStatus(activeMenu.emp, 'active')}
                className={`w-full text-left px-3.5 py-2 text-xs font-bold flex items-center justify-between hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer ${activeMenu.emp.displayStatus === 'Active' ? 'text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Active
                </span>
                {activeMenu.emp.displayStatus === 'Active' && <Check size={14} className="text-emerald-600" />}
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus(activeMenu.emp, 'inactive')}
                className={`w-full text-left px-3.5 py-2 text-xs font-bold flex items-center justify-between hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer ${activeMenu.emp.displayStatus === 'Inactive' ? 'text-rose-700 bg-rose-50/50' : 'text-slate-700'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Inactive
                </span>
                {activeMenu.emp.displayStatus === 'Inactive' && <Check size={14} className="text-rose-600" />}
              </button>
            </div>
          )}
        </div>
      )}
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, emp: null })}
        onConfirm={executeDelete}
        title="Delete Employee?"
        message={confirmModal.emp ? `Permanently remove ${confirmModal.emp.name} (${confirmModal.emp.employeeId})? This action cannot be undone and will delete all their uploaded documents.` : ''}
        confirmText="Yes, delete"
        confirmVariant="danger"
      />
    </div>
  );
}
