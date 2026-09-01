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
  Inbox
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { liveDataService } from '../../services/liveDataService';

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAttendance() {
      setLoading(true);
      try {
        const liveLogs = await liveDataService.getAttendance();
        setAttendance(liveLogs || []);
      } catch (err) {
        console.error('Error fetching attendance:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAttendance();
  }, []);

  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const lateCount = attendance.filter(a => a.status === 'Late').length;
  const absentCount = attendance.filter(a => a.status === 'Absent').length;

  const filteredAttendance = attendance.filter(a => {
    const matchesSearch = (a.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (a.punch_date || a.date || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (a.location_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    if (attendance.length === 0) return;
    const headers = ['Employee ID', 'Date', 'Check In', 'Check Out', 'Location', 'Status'];
    const rows = attendance.map(a => [
      a.employee_id,
      a.punch_date || a.date,
      a.check_in_time || a.checkIn || '--:--',
      a.check_out_time || a.checkOut || '--:--',
      a.location_name || a.location || 'Field Office',
      a.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <span>Attendance Telemetry</span>
            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
              {attendance.length} Records
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">Live shift punches and daily field presence tracking.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleExportCSV} 
            className="font-bold cursor-pointer"
            icon={Download}
          >
            Export Timesheet CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            Present & On Duty
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{presentCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
            Late Check-Ins
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-2">{lateCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
            Leaves / Absent
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-2">{absentCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Employee ID, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {['All', 'Present', 'Late'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
        <div className="overflow-x-auto">
          {filteredAttendance.length > 0 ? (
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-4">Employee ID</th>
                  <th className="px-6 py-4">Punch Date</th>
                  <th className="px-6 py-4">Check In</th>
                  <th className="px-6 py-4">Check Out</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendance.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {row.employee_id}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {row.punch_date || row.date}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-800">
                      {row.check_in_time || row.checkIn || '--:--'}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-800">
                      {row.check_out_time || row.checkOut || '--:--'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {row.location_name || row.location || 'Field Office'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={row.status === 'Present' ? 'success' : row.status === 'Late' ? 'warning' : 'destructive'} className="font-bold text-xs">
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center space-y-3">
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
