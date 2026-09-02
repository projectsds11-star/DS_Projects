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
  Inbox
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { liveDataService } from '../../services/liveDataService';

export default function EmployeeAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [showRegularizeModal, setShowRegularizeModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Regularize form state
  const [regDate, setRegDate] = useState(new Date().toISOString().slice(0, 10));
  const [regType, setRegType] = useState('Missed Check-in');
  const [regReason, setRegReason] = useState('');

  // Live timer
  const [elapsedSec, setElapsedSec] = useState(0);

  const currentEmpId = localStorage.getItem('ds_current_employee_id') || 'DS-127';

  useEffect(() => {
    async function loadAttendance() {
      setLoading(true);
      try {
        const liveAtt = await liveDataService.getAttendance(currentEmpId);
        setAttendance(liveAtt || []);
        const active = liveAtt?.find(a => a.isToday || a.check_out_time === '-- : --');
        if (active) {
          setIsCheckedIn(true);
          setElapsedSec(3600);
        }
      } catch (err) {
        console.error('Error loading attendance:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAttendance();
  }, [currentEmpId]);

  useEffect(() => {
    let timer = null;
    if (isCheckedIn) {
      timer = setInterval(() => setElapsedSec(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isCheckedIn]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const formatTimer = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handleToggleCheckIn = async () => {
    if (isCheckedIn) {
      await liveDataService.punchCheckOut(currentEmpId);
      setIsCheckedIn(false);
      showToast('Checked out successfully. Working hours logged.');
    } else {
      await liveDataService.punchCheckIn(currentEmpId, 'Field Office (GPS Verified)');
      setIsCheckedIn(true);
      setElapsedSec(0);
      showToast('Checked in successfully!');
    }
    const fresh = await liveDataService.getAttendance(currentEmpId);
    setAttendance(fresh);
  };

  const handleRegularizeSubmit = async (e) => {
    e.preventDefault();
    await liveDataService.requestRegularization(currentEmpId, {
      date: regDate,
      category: regType,
      reason: regReason
    });
    setShowRegularizeModal(false);
    showToast(`Regularization request submitted to supervisor!`);
    setRegReason('');
  };

  const statusBadge = (s) => {
    if (s === 'Present') return <Badge variant="success" className="font-bold text-xs">Present</Badge>;
    if (s === 'Late') return <Badge variant="warning" className="font-bold text-xs">Late Arrival</Badge>;
    return <Badge variant="destructive" className="font-bold text-xs">Absent</Badge>;
  };

  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const lateCount = attendance.filter(a => a.status === 'Late').length;
  const absentCount = attendance.filter(a => a.status === 'Absent').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Attendance & Working Timesheets</h1>
          <p className="text-sm text-slate-500">Live shift punches and monthly working hours log.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowRegularizeModal(true)}
            className="font-semibold text-slate-700 cursor-pointer"
            icon={Plus}
          >
            Request Regularization
          </Button>
        </div>
      </div>

      {/* Live Punch-In Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#E63946] via-[#FF6B6B] to-[#FFDDE0] text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-[#E63946]/40">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#D8F5FA] text-xs font-semibold">
              <span className={`w-2 h-2 rounded-full ${isCheckedIn ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
              <span>{isCheckedIn ? 'Live Active Shift' : 'Shift Off'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock size={14} className="text-[#00B4D8]" />
                Shift: 09:00 AM - 06:00 PM
              </span>
              <span className="text-slate-500">•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin size={14} className="text-emerald-400" />
                GPS Location Log Active
              </span>
            </div>
          </div>

          {/* Stopwatch & Action */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 shadow-inner flex flex-col sm:flex-row sm:items-center gap-6 shrink-0">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {isCheckedIn ? 'Elapsed Shift Duration' : 'Shift Clock'}
              </span>
              <p className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                {isCheckedIn ? formatTimer(elapsedSec) : '00h 00m 00s'}
              </p>
            </div>

            <div className="sm:border-l sm:border-white/15 sm:pl-6">
              <button
                onClick={handleToggleCheckIn}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-sm tracking-wide transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2 ${
                  isCheckedIn
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'
                }`}
              >
                {isCheckedIn ? (
                  <>
                    <LogOut size={18} />
                    <span>Punch Out</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Punch In Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Stats KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white p-6">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
            Present
          </span>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{presentCount} Days</p>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white p-6">
          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
            Late Arrivals
          </span>
          <p className="text-3xl font-extrabold text-amber-600 mt-3">{lateCount} Days</p>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white p-6">
          <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">
            Leaves / Absent
          </span>
          <p className="text-3xl font-extrabold text-rose-600 mt-3">{absentCount} Days</p>
        </Card>
      </div>

      {/* Monthly Attendance Log Table */}
      <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Shift Attendance Logs ({attendance.length})
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <CalendarIcon size={16} className="text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold text-slate-700 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#E63946]"
            >
              <option>September 2026</option>
              <option>August 2026</option>
            </select>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          {attendance.length > 0 ? (
            <table className="w-full text-xs sm:text-sm">
              <thead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200/80">
                <tr>
                  <th className="px-6 py-3.5 text-left">Date</th>
                  <th className="px-6 py-3.5 text-left">Check In</th>
                  <th className="px-6 py-3.5 text-left">Check Out</th>
                  <th className="px-6 py-3.5 text-left">Location</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                      {row.punch_date || row.date}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-700">
                      {row.check_in_time || row.checkIn}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-700">
                      {row.check_out_time || row.checkOut}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {row.location_name || row.location || 'Field HQ'}
                    </td>
                    <td className="px-6 py-4">
                      {statusBadge(row.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center space-y-2">
              <Inbox className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No attendance logs found</p>
              <p className="text-xs text-slate-400">Punched in times will record here live.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Missed Punch / Regularization Modal */}
      {showRegularizeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-[#E63946] text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Attendance Regularization</h3>
                <p className="text-xs text-slate-300">Request missed punch correction</p>
              </div>
              <button 
                onClick={() => setShowRegularizeModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
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
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#E63946] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Correction Category</label>
                <select 
                  value={regType}
                  onChange={(e) => setRegType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-[#E63946] focus:outline-none"
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
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm focus:ring-2 focus:ring-[#E63946] focus:outline-none"
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
