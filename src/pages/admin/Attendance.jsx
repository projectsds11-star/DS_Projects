import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Users,
  Inbox,
  RefreshCw,
  UserCheck,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { liveDataService } from '../../services/liveDataService';
import EmployeeAvatar from '../../components/common/EmployeeAvatar';

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAttendance = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    try {
      const [liveLogs, allEmps] = await Promise.all([
        liveDataService.getAttendance(),
        liveDataService.getEmployees()
      ]);
      setAttendance(liveLogs || []);
      setEmployees(allEmps || []);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const lateCount = attendance.filter(a => a.status === 'Late').length;
  const absentCount = attendance.filter(a => a.status === 'Absent').length;

  const empMap = React.useMemo(() => {
    const map = {};
    employees.forEach(e => {
      const key = e.employee_id || e.employeeId || e.id;
      if (key) map[key] = e;
    });
    return map;
  }, [employees]);

  const filteredAttendance = attendance.filter(a => {
    const emp = empMap[a.employee_id] || {};
    const empName = emp.full_name || emp.name || '';
    const matchesSearch = (a.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (a.punch_date || a.date || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (a.location_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    if (attendance.length === 0) return;
    const headers = ['Employee ID', 'Employee Name', 'Date', 'Check In', 'Check Out', 'Working Hours', 'Location', 'Status'];
    const rows = attendance.map(a => {
      const emp = empMap[a.employee_id] || {};
      return [
        a.employee_id,
        `"${emp.full_name || emp.name || 'Staff'}"`,
        a.punch_date || a.date,
        a.check_in_time || a.checkIn || '--:--',
        a.check_out_time || a.checkOut || '--:--',
        a.effective_hours || '0h 00m',
        `"${a.location_name || a.location || 'Field Office'}"`,
        a.status
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `admin_attendance_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusBadge = (s, checkOut) => {
    if (checkOut === '-- : --' || checkOut === '--:--' || !checkOut) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          On Duty Now
        </span>
      );
    }
    if (s === 'Present') return <Badge variant="success" className="font-bold text-xs whitespace-nowrap">Present</Badge>;
    if (s === 'Late') return <Badge variant="warning" className="font-bold text-xs whitespace-nowrap">Late Arrival</Badge>;
    return <Badge variant="destructive" className="font-bold text-xs whitespace-nowrap">Absent</Badge>;
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Attendance Telemetry & Timesheets
            </h1>
            <span className="inline-flex items-center text-xs font-bold bg-[#D8F5FA] text-blue-800 px-3 py-0.5 rounded-full whitespace-nowrap shadow-2xs border border-blue-200/50">
              {attendance.length} Total Logs
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Live shift punches, daily field check-ins, and verified staff timesheets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => loadAttendance(true)} 
            disabled={refreshing}
            className="font-semibold text-slate-700 cursor-pointer border-slate-200 hover:bg-slate-50"
            icon={RefreshCw}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Logs'}
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleExportCSV} 
            className="bg-[#E63946] hover:bg-[#FF6B6B] text-white font-bold cursor-pointer shadow-sm"
            icon={Download}
          >
            Export Timesheet CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Present & On Duty
            </span>
            <UserCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">{presentCount}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">Verified active field presences</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
              Late Check-Ins
            </span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-3">{lateCount}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">Logged in after 09:30 AM</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
              Leaves / Absent
            </span>
            <AlertCircle className="h-5 w-5 text-rose-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-3">{absentCount}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">Unaccounted staff absences</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Employee Name, ID, or Location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:bg-white font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {['All', 'Present', 'Late'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st 
                  ? 'bg-[#E63946] text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <Card className="border border-slate-200/80 shadow-sm rounded-3xl bg-white overflow-hidden">
        <div className="overflow-x-auto">
          {filteredAttendance.length > 0 ? (
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80 border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-4">Staff Member</th>
                  <th className="px-6 py-4">Punch Date</th>
                  <th className="px-6 py-4">Check In</th>
                  <th className="px-6 py-4">Check Out</th>
                  <th className="px-6 py-4">Working Hours</th>
                  <th className="px-6 py-4">Deployment Location</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendance.map((row, idx) => {
                  const emp = empMap[row.employee_id] || {};
                  const empName = emp.full_name || emp.name || 'Field Officer';
                  return (
                    <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <EmployeeAvatar
                            emp={emp}
                            name={empName}
                            size="sm"
                            className="rounded-xl shadow-xs"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {empName}
                            </p>
                            <span className="font-mono text-[11px] font-bold text-[#00B4D8] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                              {row.employee_id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium whitespace-nowrap">
                        {row.punch_date || row.date}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-800">
                        {row.check_in_time || row.checkIn || '--:--'}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-800">
                        {row.check_out_time || row.checkOut || '--:--'}
                      </td>
                      <td className="px-6 py-4 font-mono font-extrabold text-slate-900">
                        {row.effective_hours || '0h 00m'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={13} className="text-emerald-500 shrink-0" />
                          {row.location_name || row.location || 'Field HQ'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {statusBadge(row.status, row.check_out_time)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-16 text-center space-y-3">
              <Inbox className="h-12 w-12 text-slate-300 mx-auto" />
              <p className="font-bold text-sm text-slate-700">No attendance records logged yet</p>
              <p className="text-xs text-slate-400">Employee punch-ins will automatically log here in real-time.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
