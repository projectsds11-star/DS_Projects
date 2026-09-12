import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Download, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  MapPin, 
  Plus, 
  X, 
  Send,
  Inbox,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Building2,
  AlertTriangle,
  Lock,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { liveDataService } from '../../services/liveDataService';

export default function EmployeeAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [shiftStatus, setShiftStatus] = useState({
    status: 'NOT_PUNCHED',
    isCheckedIn: false,
    isCompletedToday: false,
    todayRecord: null,
    elapsedSeconds: 0,
    remainingSeconds: 28800,
    canPunchOut: false,
    progressPercent: 0,
    mandatorySeconds: 28800
  });
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [showRegularizeModal, setShowRegularizeModal] = useState(false);
  const [showEarlyPunchModal, setShowEarlyPunchModal] = useState(false);
  const [earlyPunchData, setEarlyPunchData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);

  // Regularize form state
  const [regDate, setRegDate] = useState(new Date().toISOString().slice(0, 10));
  const [regType, setRegType] = useState('Missed Check-in');
  const [regReason, setRegReason] = useState('');

  // Live stopwatch
  const [elapsedSec, setElapsedSec] = useState(0);

  const currentEmpId = localStorage.getItem('ds_current_employee_id') || 'DS-001';

  const loadAttendanceData = async () => {
    try {
      const [empData, liveAtt, liveShift] = await Promise.all([
        liveDataService.getEmployeeById(currentEmpId),
        liveDataService.getAttendance(currentEmpId),
        liveDataService.getLiveShiftStatus(currentEmpId)
      ]);

      if (empData) setEmployee(empData);
      setAttendance(liveAtt || []);
      setShiftStatus(liveShift);

      if (liveShift.isCheckedIn) {
        setElapsedSec(liveShift.elapsedSeconds);
      } else {
        setElapsedSec(0);
      }
    } catch (err) {
      console.error('Error loading attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadAttendanceData();
  }, [currentEmpId]);

  useEffect(() => {
    let timer = null;
    if (shiftStatus.isCheckedIn) {
      timer = setInterval(() => {
        setElapsedSec(prev => {
          const next = prev + 1;
          const rem = Math.max(0, 28800 - next);
          const prog = Math.min(100, Math.round((next / 28800) * 100));
          setShiftStatus(s => ({
            ...s,
            elapsedSeconds: next,
            remainingSeconds: rem,
            canPunchOut: next >= 28800,
            progressPercent: prog
          }));
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [shiftStatus.isCheckedIn]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatTimer = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handleToggleCheckIn = async () => {
    if (shiftStatus.isCompletedToday) {
      showToast('Daily shift completed (1 punch-in and 1 punch-out allowed per day). Next punch available tomorrow.');
      return;
    }

    setPunching(true);
    try {
      if (shiftStatus.isCheckedIn) {
        // Attempt punch out
        const res = await liveDataService.punchCheckOut(currentEmpId);
        if (res.requiresEarlyConfirm) {
          setEarlyPunchData(res);
          setShowEarlyPunchModal(true);
          setPunching(false);
          return;
        }
        showToast(`Checked out at ${res.check_out_time || 'now'}! Shift completed (${res.effective_hours}).`);
      } else {
        // Punch in
        const locationName = employee?.mandal || employee?.mandal_id 
          ? `${employee.mandal || employee.mandal_id} Field Office (${employee.district || 'AP'})` 
          : 'Buchireddypalem HQ (GPS Verified)';

        let coords = null;
        if (navigator.geolocation) {
          try {
            const pos = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
            });
            coords = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude
            };
          } catch {}
        }

        const res = await liveDataService.punchCheckIn(currentEmpId, locationName, coords);
        showToast(`Punched in at ${res.data?.check_in_time || 'now'}! Mandatory 8-hour shift in progress.`);
      }
      await loadAttendanceData();
    } catch (err) {
      console.error('Punch error:', err);
      showToast(err.message || 'Failed to record punch.');
    } finally {
      setPunching(false);
    }
  };

  const handleConfirmEarlyPunchOut = async () => {
    setShowEarlyPunchModal(false);
    setPunching(true);
    try {
      const res = await liveDataService.punchCheckOut(currentEmpId, { force: true });
      showToast(`Early punch-out logged at ${res.check_out_time} (Worked: ${res.effective_hours}).`);
      await loadAttendanceData();
    } catch (err) {
      showToast(err.message || 'Early punch out failed.');
    } finally {
      setPunching(false);
    }
  };

  const handleRegularizeSubmit = async (e) => {
    e.preventDefault();
    try {
      await liveDataService.requestRegularization(currentEmpId, {
        date: regDate,
        category: regType,
        reason: regReason
      });
      setShowRegularizeModal(false);
      showToast(`Regularization request submitted to supervisor!`);
      setRegReason('');
      await loadAttendanceData();
    } catch {
      showToast('Could not submit regularization request.');
    }
  };

  const handleExportCSV = () => {
    if (attendance.length === 0) {
      showToast('No attendance records available to export.');
      return;
    }
    const headers = ['Employee ID', 'Date', 'Check In', 'Check Out', 'Working Hours', 'Location', 'Status'];
    const rows = attendance.map(a => [
      a.employee_id,
      a.punch_date || a.date,
      a.check_in_time || '--:--',
      a.check_out_time || '--:--',
      a.effective_hours || '0h 00m',
      `"${a.location_name || 'Field Office'}"`,
      a.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_${currentEmpId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusBadge = (s, checkOut) => {
    if (checkOut && checkOut !== '-- : --' && checkOut !== '--:--') {
      return <Badge variant="success" className="font-bold text-xs whitespace-nowrap">Completed (1 Shift)</Badge>;
    }
    if (s === 'Present') return <Badge variant="success" className="font-bold text-xs whitespace-nowrap">Present</Badge>;
    if (s === 'Late') return <Badge variant="warning" className="font-bold text-xs whitespace-nowrap">Late Check-in</Badge>;
    return <Badge variant="destructive" className="font-bold text-xs whitespace-nowrap">Absent</Badge>;
  };

  const presentCount = attendance.filter(a => a.status === 'Present' || (a.check_out_time && a.check_out_time !== '-- : --')).length;
  const lateCount = attendance.filter(a => a.status === 'Late').length;
  const absentCount = attendance.filter(a => a.status === 'Absent').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="p-4 rounded-2xl bg-rose-50 text-[#E63946] animate-spin">
          <RefreshCw size={28} />
        </div>
        <p className="text-sm font-bold text-slate-600">Loading live attendance records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            <span>Employee Portal</span>
            <span>/</span>
            <span className="text-[#E63946]">Daily Attendance Policy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Attendance & Shift Timesheets
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Strict 1 punch-in & 1 punch-out per day policy • 8 Hours mandatory shift duty.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportCSV}
            className="font-semibold text-slate-700 cursor-pointer border-slate-200 hover:bg-slate-50"
            icon={Download}
          >
            Export Timesheet
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => setShowRegularizeModal(true)}
            className="bg-[#E63946] hover:bg-[#FF6B6B] text-white font-semibold cursor-pointer shadow-sm"
            icon={Plus}
          >
            Request Regularization
          </Button>
        </div>
      </div>

      {/* Live Punch-In Hero Card with 8-Hour Progress */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#E63946] via-[#FF6B6B] to-[#FFDDE0] text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-[#E63946]/40">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-[#00B4D8]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-20 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[#D8F5FA] text-xs font-semibold">
              <span className={`w-2.5 h-2.5 rounded-full ${
                shiftStatus.isCompletedToday 
                  ? 'bg-blue-300' 
                  : shiftStatus.isCheckedIn 
                    ? 'bg-emerald-400 animate-ping' 
                    : 'bg-slate-300'
              }`} />
              <span>
                {shiftStatus.isCompletedToday 
                  ? 'Daily Shift Completed (1/1 Recorded)' 
                  : shiftStatus.isCheckedIn 
                    ? 'Active Shift • 8 Hours Mandatory Duty' 
                    : 'Shift Off-Duty (Ready for Daily Punch-in)'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>

            {/* 8-Hour Mandatory Progress Bar */}
            {shiftStatus.isCheckedIn && (
              <div className="space-y-2 bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/15">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>8 Hours Mandatory Shift Progress</span>
                  <span>{shiftStatus.progressPercent}% ({formatTimer(elapsedSec)} / 08h 00m)</span>
                </div>
                <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      shiftStatus.canPunchOut ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-300 to-[#00B4D8]'
                    }`}
                    style={{ width: `${shiftStatus.progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-rose-100 font-medium pt-0.5">
                  <span>Punched in: {shiftStatus.todayRecord?.check_in_time}</span>
                  <span>
                    {shiftStatus.canPunchOut 
                      ? '✓ 8h Mandatory requirement satisfied!' 
                      : `Remaining: ${formatTimer(shiftStatus.remainingSeconds)}`}
                  </span>
                </div>
              </div>
            )}

            {shiftStatus.isCompletedToday && (
              <div className="flex items-center gap-2.5 bg-emerald-900/40 border border-emerald-400/40 px-4 py-3 rounded-2xl text-xs text-emerald-100 font-medium">
                <CheckCircle2 size={18} className="text-emerald-300 shrink-0" />
                <span>
                  Today's shift completed: <strong>{shiftStatus.todayRecord?.check_in_time}</strong> to <strong>{shiftStatus.todayRecord?.check_out_time}</strong> (Logged: <strong>{shiftStatus.todayRecord?.effective_hours}</strong>). Next punch-in unlocks tomorrow at 09:00 AM.
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-rose-100 font-medium">
              <span className="flex items-center gap-1.5 bg-black/15 px-3 py-1 rounded-xl border border-white/15">
                <Clock size={14} className="text-[#00B4D8]" />
                Mandatory Hours: 8 Hours / Day
              </span>
              <span className="flex items-center gap-1.5 bg-black/15 px-3 py-1 rounded-xl border border-white/15">
                <MapPin size={14} className="text-emerald-300" />
                {employee?.mandal || employee?.mandal_id || 'Buchireddypalem'} Mandal
              </span>
            </div>
          </div>

          {/* Stopwatch & Action Box */}
          <div className="bg-white/15 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-white/20 shadow-2xl flex flex-col sm:flex-row sm:items-center gap-6 shrink-0">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-100">
                {shiftStatus.isCompletedToday 
                  ? 'Completed Shift Total' 
                  : shiftStatus.isCheckedIn 
                    ? 'Active Shift Stopwatch' 
                    : 'Shift Stopwatch'}
              </span>
              <p className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                {shiftStatus.isCompletedToday 
                  ? (shiftStatus.todayRecord?.effective_hours || '08h 00m') 
                  : shiftStatus.isCheckedIn 
                    ? formatTimer(elapsedSec) 
                    : '00h 00m 00s'}
              </p>
              <p className="text-[11px] text-rose-100">
                {shiftStatus.isCompletedToday 
                  ? '1 Punch-in & 1 Punch-out completed today' 
                  : shiftStatus.isCheckedIn 
                    ? (shiftStatus.canPunchOut ? 'Eligible to punch out' : 'Minimum 8 hours required') 
                    : '1 Daily punch-in allowed per calendar day'}
              </p>
            </div>

            <div className="sm:border-l sm:border-white/20 sm:pl-6">
              {shiftStatus.isCompletedToday ? (
                <button
                  disabled
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl font-black text-sm tracking-wide bg-white/20 text-white cursor-not-allowed flex items-center justify-center gap-2 border border-white/30"
                >
                  <Check size={18} />
                  <span>Shift Completed</span>
                </button>
              ) : (
                <button
                  onClick={handleToggleCheckIn}
                  disabled={punching}
                  className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm tracking-wide transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50 ${
                    shiftStatus.isCheckedIn
                      ? (shiftStatus.canPunchOut 
                          ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/40 hover:scale-105 animate-pulse' 
                          : 'bg-slate-900/90 hover:bg-slate-900 text-white shadow-slate-900/30')
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/40 hover:scale-105'
                  }`}
                >
                  {punching ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : shiftStatus.isCheckedIn ? (
                    <>
                      <LogOut size={18} />
                      <span>{shiftStatus.canPunchOut ? 'Punch Out (8h Met)' : 'Punch Out'}</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={18} />
                      <span>Punch In Now</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border border-slate-200/80 shadow-sm rounded-3xl bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Full Shifts (8h+)
            </span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-3">{presentCount} Days</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Completed daily 8h active duty</p>
        </Card>

        <Card className="border border-slate-200/80 shadow-sm rounded-3xl bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
              Late Check-ins
            </span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-600 mt-3">{lateCount} Days</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Punched in after 09:30 AM</p>
        </Card>

        <Card className="border border-slate-200/80 shadow-sm rounded-3xl bg-white p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
              Leaves / Absent
            </span>
            <X className="h-5 w-5 text-rose-500" />
          </div>
          <p className="text-3xl font-black text-rose-600 mt-3">{absentCount} Days</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Unrecorded shift dates</p>
        </Card>
      </div>

      {/* Shift Attendance Logs Table */}
      <Card className="border border-slate-200/80 shadow-sm rounded-3xl bg-white overflow-hidden">
        <CardHeader className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-[#E63946]" />
              Shift Attendance Logs ({attendance.length})
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold text-slate-700 border border-slate-200 rounded-xl px-3 py-1.5 bg-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#E63946]"
            >
              <option>September 2026</option>
              <option>August 2026</option>
            </select>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          {attendance.length > 0 ? (
            <table className="w-full text-xs sm:text-sm">
              <thead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80 border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-3.5 text-left">Punch Date</th>
                  <th className="px-6 py-3.5 text-left">Check In</th>
                  <th className="px-6 py-3.5 text-left">Check Out</th>
                  <th className="px-6 py-3.5 text-left">Working Hours</th>
                  <th className="px-6 py-3.5 text-left">Deployment Location</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                      {row.punch_date || row.date}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-700">
                      {row.check_in_time || row.checkIn || '--:--'}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-700">
                      {row.check_out_time || row.checkOut || '--:--'}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-900 font-black">
                      {row.effective_hours || '0h 00m'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {row.location_name || row.location || 'Field Office'}
                    </td>
                    <td className="px-6 py-4">
                      {statusBadge(row.status, row.check_out_time)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-16 text-center space-y-3">
              <Inbox className="h-12 w-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No attendance logs logged yet</p>
              <p className="text-xs text-slate-400">Click Punch In to start today's 8-hour shift.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Early Punch Out Warning Modal (Before 8 Hours) */}
      {showEarlyPunchModal && earlyPunchData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <AlertTriangle size={22} className="text-amber-100" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">8-Hour Shift Mandatory</h3>
                  <p className="text-xs text-amber-100">Premature Punch-Out Alert</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEarlyPunchModal(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
                <p className="font-bold text-sm text-amber-950">
                  Minimum 8 hours of active duty is required per day.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 font-medium">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Time Worked:</span>
                    <strong className="text-slate-800 text-sm font-mono">{earlyPunchData.elapsedTime}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Time Remaining:</span>
                    <strong className="text-rose-600 text-sm font-mono">{earlyPunchData.remainingTime}</strong>
                  </div>
                </div>
                <p className="text-[11px] text-amber-800 pt-1">
                  Once punched out, you cannot punch in again today (1 punch-in and 1 punch-out allowed per day).
                </p>
              </div>

              <p className="text-xs text-slate-600">
                Are you sure you want to proceed with early checkout? This will finalize your daily timesheet for today.
              </p>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEarlyPunchModal(false)}
                >
                  Continue Shift
                </Button>
                <Button 
                  type="button" 
                  onClick={handleConfirmEarlyPunchOut}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Confirm Early Punch-Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Missed Punch / Regularization Modal */}
      {showRegularizeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-[#E63946] text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Attendance Regularization</h3>
                <p className="text-xs text-rose-100">Request missed punch correction</p>
              </div>
              <button 
                onClick={() => setShowRegularizeModal(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegularizeSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Date to Regularize *</label>
                <input
                  type="date"
                  required
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#E63946] focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Correction Category</label>
                <select 
                  value={regType}
                  onChange={(e) => setRegType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-[#E63946] focus:outline-none font-medium"
                >
                  <option>Missed Check-In</option>
                  <option>Missed Check-Out</option>
                  <option>On Duty (Field Visit)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Reason & Justification *</label>
                <textarea
                  required
                  rows={3}
                  value={regReason}
                  onChange={(e) => setRegReason(e.target.value)}
                  placeholder="Explain why punch was missed..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm focus:ring-2 focus:ring-[#E63946] focus:outline-none font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowRegularizeModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#E63946] hover:bg-[#FF6B6B] text-white font-bold" icon={Send}>
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
