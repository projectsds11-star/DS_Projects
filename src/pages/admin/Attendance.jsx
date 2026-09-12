import React, { useState, useEffect, useMemo } from 'react';
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
  FileSpreadsheet,
  FileText,
  Printer,
  ChevronDown,
  CalendarDays
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
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'yesterday' | 'week' | 'this_month' | 'last_month' | 'custom_date' | 'custom_month'
  const [customDate, setCustomDate] = useState(new Date().toISOString().slice(0, 10));
  
  // Dynamic Month Options (Last 12 months)
  const monthOptions = useMemo(() => {
    const list = [];
    const curr = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(curr.getFullYear(), curr.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      list.push({ label, key, year: d.getFullYear(), month: d.getMonth() });
    }
    return list;
  }, []);

  const [customMonthKey, setCustomMonthKey] = useState(monthOptions[0]?.key || '2026-09');
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

  const empMap = useMemo(() => {
    const map = {};
    employees.forEach(e => {
      const key = e.employee_id || e.employeeId || e.id;
      if (key) map[key] = e;
    });
    return map;
  }, [employees]);

  // Helper to parse record date safely
  const parseRecordDate = (row) => {
    if (row.created_at) {
      const d = new Date(row.created_at);
      if (!isNaN(d.getTime())) return d;
    }
    if (row.punch_date || row.date) {
      const d = new Date(row.punch_date || row.date);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  };

  // Filtered dataset according to date, status, and search
  const filteredAttendance = useMemo(() => {
    const now = new Date();
    const todayDateStr = now.toDateString();
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayDateStr = yesterday.toDateString();

    const dayBeforeYesterday = new Date(now);
    dayBeforeYesterday.setDate(now.getDate() - 2);
    const dayBeforeYesterdayDateStr = dayBeforeYesterday.toDateString();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    return attendance.filter(a => {
      const recDate = parseRecordDate(a);
      const punchDateStr = (a.punch_date || a.date || '').toLowerCase();
      
      // 1. Date Filter
      if (dateFilter === 'today') {
        const isToday = recDate.toDateString() === todayDateStr || punchDateStr.includes(now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toLowerCase());
        if (!isToday) return false;
      } else if (dateFilter === 'yesterday') {
        const isYesterday = recDate.toDateString() === yesterdayDateStr || punchDateStr.includes(yesterday.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toLowerCase());
        if (!isYesterday) return false;
      } else if (dateFilter === 'day_before_yesterday') {
        const isDayBeforeYesterday = recDate.toDateString() === dayBeforeYesterdayDateStr || punchDateStr.includes(dayBeforeYesterday.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toLowerCase());
        if (!isDayBeforeYesterday) return false;
      } else if (dateFilter === 'week') {
        if (recDate < startOfWeek || recDate > now) return false;
      } else if (dateFilter === 'this_month') {
        const isThisMonth = recDate.getFullYear() === now.getFullYear() && recDate.getMonth() === now.getMonth();
        if (!isThisMonth && !punchDateStr.includes(now.toLocaleDateString('en-US', { month: 'short' }).toLowerCase())) return false;
      } else if (dateFilter === 'last_month') {
        const isLastMonth = recDate.getFullYear() === prevMonthDate.getFullYear() && recDate.getMonth() === prevMonthDate.getMonth();
        if (!isLastMonth && !punchDateStr.includes(prevMonthDate.toLocaleDateString('en-US', { month: 'short' }).toLowerCase())) return false;
      } else if (dateFilter === 'custom_date') {
        if (customDate) {
          const [y, m, d] = customDate.split('-').map(Number);
          const isMatch = recDate.getFullYear() === y && (recDate.getMonth() + 1) === m && recDate.getDate() === d;
          if (!isMatch) return false;
        }
      } else if (dateFilter === 'custom_month') {
        if (customMonthKey) {
          const [selYear, selMonth] = customMonthKey.split('-').map(Number);
          const isMonthMatch = recDate.getFullYear() === selYear && (recDate.getMonth() + 1) === selMonth;
          if (!isMonthMatch) return false;
        }
      }

      // 2. Status Filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'Present') {
          const isPres = a.status === 'Present' || (a.check_out_time && a.check_out_time !== '-- : --');
          if (!isPres) return false;
        } else if (statusFilter === 'Late') {
          if (a.status !== 'Late') return false;
        } else if (statusFilter === 'Absent') {
          if (a.status !== 'Absent') return false;
        }
      }

      // 3. Search Filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const emp = empMap[a.employee_id] || {};
        const empName = (emp.full_name || emp.name || '').toLowerCase();
        const empId = (a.employee_id || '').toLowerCase();
        const loc = (a.location_name || a.location || '').toLowerCase();
        const dateStr = punchDateStr;
        if (!empName.includes(term) && !empId.includes(term) && !loc.includes(term) && !dateStr.includes(term)) {
          return false;
        }
      }

      return true;
    });
  }, [attendance, empMap, dateFilter, statusFilter, searchTerm, customDate, customMonthKey]);

  // Real-time KPI Counts for Filtered View
  const presentCount = filteredAttendance.filter(a => a.status === 'Present' || (a.check_out_time && a.check_out_time !== '-- : --')).length;
  const lateCount = filteredAttendance.filter(a => a.status === 'Late').length;
  const absentCount = filteredAttendance.filter(a => a.status === 'Absent').length;

  const selectedMonthObj = monthOptions.find(m => m.key === customMonthKey);
  const selectedMonthLabel = selectedMonthObj ? selectedMonthObj.label : customMonthKey;

  const activeDateFilterLabel = useMemo(() => {
    switch (dateFilter) {
      case 'today': return 'Today (Live)';
      case 'yesterday': return 'Yesterday';
      case 'day_before_yesterday': return 'Day Before Yesterday';
      case 'week': return 'This Week';
      case 'this_month': return 'This Month';
      case 'last_month': return 'Last Month';
      case 'custom_date': return `Date: ${customDate}`;
      case 'custom_month': return `Month: ${selectedMonthLabel}`;
      default: return 'All Time Records';
    }
  }, [dateFilter, customDate, selectedMonthLabel]);

  // ── CSV Export ─────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (filteredAttendance.length === 0) {
      alert('No attendance records to export under current filter.');
      return;
    }
    const headers = ['Serial No', 'Employee ID', 'Employee Name', 'Punch Date', 'Check In', 'Check Out', 'Effective Working Hours', 'Deployment Location', 'Status'];
    const rows = filteredAttendance.map((a, idx) => {
      const emp = empMap[a.employee_id] || {};
      const statusText = (a.check_out_time === '-- : --' || a.check_out_time === '--:--' || !a.check_out_time) ? 'On Duty' : (a.status || 'Present');
      return [
        idx + 1,
        a.employee_id,
        `"${emp.full_name || emp.name || 'Staff'}"`,
        a.punch_date || a.date,
        a.check_in_time || '--:--',
        a.check_out_time || '--:--',
        a.effective_hours || '0h 00m',
        `"${a.location_name || a.location || 'Field Office'}"`,
        statusText
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DS_Projects_Attendance_${dateFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── PDF Export ─────────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    if (filteredAttendance.length === 0) {
      alert('No attendance records to export under current filter.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1100,height=850');
    if (!printWindow) {
      alert('Please allow popups to generate and print the PDF report.');
      return;
    }

    const generatedDate = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const rowsHtml = filteredAttendance.map((row, idx) => {
      const emp = empMap[row.employee_id] || {};
      const empName = emp.full_name || emp.name || 'Field Staff';
      const isStillOnDuty = (row.check_out_time === '-- : --' || row.check_out_time === '--:--' || !row.check_out_time);
      const statusText = isStillOnDuty ? 'On Duty Now' : (row.status || 'Present');
      const statusColor = isStillOnDuty ? '#0284c7' : row.status === 'Present' ? '#16a34a' : row.status === 'Late' ? '#d97706' : '#dc2626';

      return `
        <tr>
          <td style="text-align:center;font-weight:bold;color:#64748b;">${idx + 1}</td>
          <td>
            <strong style="color:#0f172a;font-size:12px;">${empName}</strong>
            <div style="font-family:monospace;color:#0284c7;font-weight:bold;font-size:11px;">${row.employee_id}</div>
          </td>
          <td style="white-space:nowrap;font-weight:600;">${row.punch_date || row.date}</td>
          <td style="font-family:monospace;font-weight:600;">${row.check_in_time || '--:--'}</td>
          <td style="font-family:monospace;font-weight:600;">${row.check_out_time || '--:--'}</td>
          <td style="font-family:monospace;font-weight:800;color:#0f172a;">${row.effective_hours || '0h 00m'}</td>
          <td style="color:#334155;">${row.location_name || 'Field Office'}</td>
          <td>
            <span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:10px;font-weight:bold;color:${statusColor};background:${statusColor}15;border:1px solid ${statusColor}40;">
              ${statusText}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>DS_Projects_Attendance_Report_${Date.now()}</title>
          <style>
            @page { size: A4 landscape; margin: 12mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; margin: 0; padding: 24px; font-size: 12px; line-height: 1.4; background: #fff; }
            .report-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #E63946; padding-bottom: 16px; margin-bottom: 18px; }
            .brand-title { font-size: 22px; font-weight: 900; color: #E63946; margin: 0; letter-spacing: 0.5px; }
            .report-title { font-size: 13px; font-weight: 800; color: #1e293b; margin: 4px 0 0 0; text-transform: uppercase; }
            .meta-box { font-size: 11px; text-align: right; color: #475569; background: #f8fafc; padding: 8px 14px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .summary-grid { display: flex; gap: 14px; margin-bottom: 18px; }
            .summary-card { flex: 1; padding: 10px 16px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; }
            .summary-card .num { font-size: 20px; font-weight: 900; color: #0f172a; }
            .summary-card .lbl { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th { background: #f1f5f9; color: #1e293b; font-weight: 800; text-transform: uppercase; font-size: 10px; padding: 10px 12px; border: 1px solid #cbd5e1; text-align: left; }
            td { padding: 9px 12px; border: 1px solid #e2e8f0; vertical-align: middle; }
            tr:nth-child(even) { background: #f8fafc; }
            .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            <div>
              <h1 class="brand-title">DS PROJECTS PRIVATE LIMITED</h1>
              <p class="report-title">Attendance Telemetry & Working Timesheets Report</p>
            </div>
            <div class="meta-box">
              <div><strong>Active Filter:</strong> ${activeDateFilterLabel}</div>
              <div><strong>Status Scope:</strong> ${statusFilter}</div>
              <div><strong>Generated Date:</strong> ${generatedDate}</div>
              <div><strong>Total Records:</strong> ${filteredAttendance.length}</div>
            </div>
          </div>

          <div class="summary-grid">
            <div class="summary-card">
              <div class="num">${filteredAttendance.length}</div>
              <div class="lbl">Total Log Entries</div>
            </div>
            <div class="summary-card">
              <div class="num" style="color:#16a34a;">${presentCount}</div>
              <div class="lbl">Present / On Duty</div>
            </div>
            <div class="summary-card">
              <div class="num" style="color:#d97706;">${lateCount}</div>
              <div class="lbl">Late Arrivals (>09:30 AM)</div>
            </div>
            <div class="summary-card">
              <div class="num" style="color:#dc2626;">${absentCount}</div>
              <div class="lbl">Leaves / Absences</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width:35px;text-align:center;">#</th>
                <th>Staff Member</th>
                <th>Punch Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours Logged</th>
                <th>Deployment Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <span>DS Projects HRMS • Confidential Official Attendance Telemetry</span>
            <span>Page 1 of 1 • System Verified Record</span>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const statusBadge = (s, checkOut) => {
    if (checkOut === '-- : --' || checkOut === '--:--' || !checkOut) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
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
              {filteredAttendance.length} Records Shown
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Live shift telemetry, daily GPS check-ins, and verified staff timesheets.
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => loadAttendance(true)} 
            disabled={refreshing}
            className="font-semibold text-slate-700 cursor-pointer border-slate-200 hover:bg-slate-50 shadow-2xs"
            icon={RefreshCw}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Logs'}
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportCSV} 
            className="font-bold cursor-pointer text-emerald-700 border-emerald-200 hover:bg-emerald-50 shadow-2xs"
            icon={FileSpreadsheet}
          >
            Export CSV
          </Button>

          <Button 
            variant="default" 
            size="sm"
            onClick={handleExportPDF} 
            className="bg-[#E63946] hover:bg-[#FF6B6B] text-white font-bold cursor-pointer shadow-sm"
            icon={FileText}
          >
            Download PDF Report
          </Button>
        </div>
      </div>

      {/* KPI Cards (Dynamically calculated based on active filter) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Present & On Duty
            </span>
            <UserCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">{presentCount}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">In selected date filter ({activeDateFilterLabel})</p>
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

      {/* Date Filter & Search Control Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Row 1: Date Filter Tabs */}
        <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 shrink-0">
              <CalendarDays size={15} className="text-[#E63946]" />
              <span>Date Scope:</span>
            </div>

            {[
              { id: 'all', label: 'All Records' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'day_before_yesterday', label: 'Day Before Yesterday' },
              { id: 'week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'custom_month', label: 'Month Selector' },
              { id: 'custom_date', label: 'Specific Date' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDateFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  dateFilter === tab.id
                    ? 'bg-[#E63946] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Filter Scope Tag */}
          <div className="text-xs font-bold text-[#00B4D8] bg-blue-50 px-3 py-1 rounded-xl border border-blue-100 shrink-0">
            Scope: {activeDateFilterLabel}
          </div>
        </div>

        {/* Row 2: Secondary Pickers (When Month Selector or Specific Date is chosen) */}
        {(dateFilter === 'custom_date' || dateFilter === 'custom_month') && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center gap-4 animate-in fade-in">
            {dateFilter === 'custom_date' && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Choose Specific Date:</span>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-2xs focus:ring-2 focus:ring-[#E63946] focus:outline-none"
                />
              </div>
            )}

            {dateFilter === 'custom_month' && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Select Month:</span>
                <select
                  value={customMonthKey}
                  onChange={(e) => setCustomMonthKey(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-2xs focus:ring-2 focus:ring-[#E63946] focus:outline-none cursor-pointer"
                >
                  {monthOptions.map(opt => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Row 3: Search Bar & Status Pills */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-1">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Employee Name, ID, or Location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:bg-white font-medium shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Status:</span>
            {['All', 'Present', 'Late'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <Card className="border border-slate-200/80 shadow-sm rounded-3xl bg-white overflow-hidden">
        <CardHeader className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>Filtered Telemetry Timesheet</span>
            <span className="text-xs text-slate-400 font-normal">({filteredAttendance.length} records found)</span>
          </CardTitle>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title="Export CSV"
            >
              <FileSpreadsheet size={16} />
            </button>
            <button
              onClick={handleExportPDF}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Download PDF"
            >
              <FileText size={16} />
            </button>
          </div>
        </CardHeader>

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
              <p className="font-bold text-sm text-slate-700">No attendance logs matching filter</p>
              <p className="text-xs text-slate-400">Try changing your date filter or search query.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
