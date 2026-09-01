import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Send,
  Trash2,
  Edit
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { liveDataService } from '../../services/liveDataService';

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmployees() {
      setLoading(true);
      try {
        const liveList = await liveDataService.getEmployees();
        setEmployees(liveList || []);
      } catch (err) {
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEmployees();
  }, []);

  const districts = ['All', ...new Set(employees.map(e => e.district).filter(Boolean))];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = (emp.full_name || emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (emp.employee_id || emp.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (emp.phone || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    const matchesDistrict = districtFilter === 'All' || emp.district === districtFilter;

    return matchesSearch && matchesStatus && matchesDistrict;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active': return <Badge variant="success" className="font-bold text-xs">Active</Badge>;
      case 'Onboarding': return <Badge variant="warning" className="font-bold text-xs">Onboarding</Badge>;
      case 'Draft': return <Badge variant="secondary" className="font-bold text-xs">Draft</Badge>;
      case 'Inactive': return <Badge variant="destructive" className="font-bold text-xs">Inactive</Badge>;
      default: return <Badge variant="default" className="font-bold text-xs">{status || 'Active'}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <span>Staff Directory & Workforce</span>
            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
              {employees.length} Total
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">Real-time database of field personnel across all mandal sectors.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => navigate('/admin/employees/add')} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
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
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['All', 'Active', 'Onboarding', 'Inactive'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === st ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
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
              className="text-xs font-bold text-slate-700 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                  <th className="px-6 py-4">Designation & Role</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id || emp.employee_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                          {(emp.full_name || emp.name || 'E').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{emp.full_name || emp.name}</div>
                          <div className="font-mono text-xs text-blue-600 font-semibold">{emp.employee_id || emp.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-slate-800 font-medium">{emp.phone || '-'}</div>
                      <div className="text-xs text-slate-400">{emp.email || '-'}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{emp.designation || 'Mandal Co-ordinator'}</div>
                      <div className="text-xs text-slate-500">{emp.department || 'Field Operations'}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <MapPin size={13} className="text-rose-500" />
                        {emp.district || '-'}
                      </div>
                      <div className="text-xs text-slate-500 pl-4">{emp.mandal || '-'}</div>
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge(emp.status)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate('/admin/onboarding/create')}
                          className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                        >
                          Offer
                        </button>
                        <button
                          onClick={() => navigate('/admin/work')}
                          className="px-2.5 py-1 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                        >
                          Assign
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
                <Button onClick={() => navigate('/admin/employees/add')} className="bg-blue-600 text-white font-bold mt-2" icon={Plus}>
                  Add First Employee
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
