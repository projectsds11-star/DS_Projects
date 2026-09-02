import React, { useState, useEffect } from 'react';
import { 
  Play, 
  CheckSquare, 
  Clock, 
  FileText, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Paperclip, 
  X, 
  Send,
  UserCheck,
  PhoneCall,
  ShieldAlert,
  Flame,
  Inbox
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { liveDataService } from '../../services/liveDataService';

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTaskForSubmission, setSelectedTaskForSubmission] = useState(null);
  const [submissionRemarks, setSubmissionRemarks] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Live timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const currentEmpId = localStorage.getItem('ds_current_employee_id') || 'DS-127';

  useEffect(() => {
    async function loadLiveData() {
      setLoading(true);
      try {
        const [empData, taskData, attData, notifData] = await Promise.all([
          liveDataService.getEmployeeById(currentEmpId),
          liveDataService.getWorkTasks(currentEmpId),
          liveDataService.getAttendance(currentEmpId),
          liveDataService.getNotifications(currentEmpId)
        ]);

        if (empData) setEmployee(empData);
        if (taskData) setTasks(taskData);
        if (attData) {
          setAttendance(attData);
          const todayPunch = attData.find(a => a.isToday || a.check_out_time === '-- : --');
          if (todayPunch) {
            setIsCheckedIn(true);
            setElapsedSeconds(3600); // initial timer offset
          }
        }
        if (notifData) setNotifications(notifData);
      } catch (err) {
        console.error('Error loading dashboard live data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadLiveData();
  }, [currentEmpId]);

  useEffect(() => {
    let interval = null;
    if (isCheckedIn) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn]);

  const formatHours = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleCheckIn = async () => {
    if (isCheckedIn) {
      await liveDataService.punchCheckOut(currentEmpId);
      setIsCheckedIn(false);
      showToast('Checked out successfully. Shift time logged.');
    } else {
      await liveDataService.punchCheckIn(currentEmpId, `${employee?.mandal || 'Field'} HQ`);
      setIsCheckedIn(true);
      setElapsedSeconds(0);
      showToast('Checked in successfully!');
    }
    const freshAtt = await liveDataService.getAttendance(currentEmpId);
    setAttendance(freshAtt);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTaskForSubmission) return;

    await liveDataService.submitWorkReport(selectedTaskForSubmission.task_code || selectedTaskForSubmission.id, {
      reportSummary: submissionRemarks
    });

    showToast(`Work report for ${selectedTaskForSubmission.task_code || selectedTaskForSubmission.id} submitted!`);
    setSelectedTaskForSubmission(null);
    setSubmissionRemarks('');

    const freshTasks = await liveDataService.getWorkTasks(currentEmpId);
    setTasks(freshTasks);
  };

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'high') return t.priority === 'High';
    if (activeTab === 'in-progress') return t.status === 'In Progress';
    return true;
  });

  const assignedCount = tasks.filter(t => t.status === 'Assigned').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const submittedCount = tasks.filter(t => t.status === 'Submitted').length;
  const approvedCount = tasks.filter(t => t.status === 'Approved').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Hero Welcome & Shift Status Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#E63946] via-[#FF6B6B] to-[#FFDDE0] text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-[#E63946]/40">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-[#00B4D8]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-20 w-60 h-60 bg-[#D8F5FA]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#D8F5FA] text-xs font-semibold">
              <Sparkles size={14} className="text-amber-300" />
              <span>Live Field Operations Portal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">{employee?.full_name || 'Rahul Kumar'}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center gap-1.5 font-mono text-[#00B4D8] font-bold bg-blue-950/80 px-3 py-1 rounded-xl border border-blue-700/60 shadow-sm">
                ID: {employee?.employee_id || currentEmpId}
              </span>
              <span className="flex items-center gap-1.5 font-bold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-700/60 shadow-sm">
                <MapPin size={15} className="text-emerald-400" />
                <span>{employee?.mandal || 'Kavali'} Mandal, {employee?.district || 'Nellore'} District</span>
              </span>
              <span className="flex items-center gap-1 text-slate-300 bg-white/10 px-3 py-1 rounded-xl border border-white/10">
                <Calendar size={14} className="text-amber-400" />
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Shift Tracker Widget */}
          <div className="bg-white/10 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-white/15 shadow-inner flex flex-col sm:flex-row sm:items-center gap-5 shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isCheckedIn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {isCheckedIn ? 'Shift In Progress' : 'Currently Off-Duty'}
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                {isCheckedIn ? formatHours(elapsedSeconds) : '-- : -- : --'}
              </p>
              <p className="text-[11px] text-slate-300">
                {isCheckedIn ? 'Punched in • GPS Location active' : 'Click punch in to begin duty'}
              </p>
            </div>

            <div className="sm:border-l sm:border-white/15 sm:pl-5">
              <button
                onClick={handleToggleCheckIn}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-lg cursor-pointer ${
                  isCheckedIn
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'
                }`}
              >
                {isCheckedIn ? 'Punch Out' : 'Punch In Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-[#D8F5FA] rounded-xl text-[#E63946]">
              <CheckSquare className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-[#E63946] bg-[#D8F5FA] px-2.5 py-1 rounded-full">
              Live Total
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Work</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{tasks.length}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
              Active
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{inProgressCount}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 rounded-xl text-[#E63946]">
              <Upload className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full">
              Reviewing
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitted</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{submittedCount}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              Completed
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Tasks</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{approvedCount}</p>
        </div>
      </div>

      {/* Main Content: Tasks Section + Right Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-white px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  Assigned Work Tasks
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Live field survey and mandal operations</p>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({tasks.length})
                </button>
                <button
                  onClick={() => setActiveTab('high')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'high' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  High Priority
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-slate-100">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <div key={task.id || task.task_code} className="p-6 hover:bg-slate-50/80 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                      <div className="space-y-2.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={task.priority === 'High' ? 'destructive' : 'secondary'} className="text-xs">
                            {task.priority || 'Normal'}
                          </Badge>
                          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {task.task_code || task.id}
                          </span>
                          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <MapPin size={12} className="text-slate-400" />
                            {task.location_name || `${task.mandal || 'Kavali'}, ${task.district || 'Nellore'}`}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900">{task.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{task.description}</p>

                        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-1">
                          <span className="flex items-center gap-1 text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded">
                            <Clock size={12} /> Due: {task.due_date || task.due || 'Today'}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <Button
                          size="sm"
                          onClick={() => setSelectedTaskForSubmission(task)}
                          className="bg-[#E63946] hover:bg-[#FF6B6B] text-white font-semibold cursor-pointer"
                          icon={Send}
                        >
                          Submit Report
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center space-y-2">
                  <Inbox className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No work tasks assigned yet</p>
                  <p className="text-xs text-slate-400">Newly assigned tasks will appear here in real-time.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Quick Actions</span>
              <Sparkles size={14} className="text-[#E63946]" />
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button 
                onClick={() => showToast('Opening punch regularization form...')}
                className="p-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-100 text-xs font-bold text-center cursor-pointer"
              >
                Missed Punch
              </button>
              <button 
                onClick={() => showToast('Navigating to Documents Hub...')}
                className="p-3.5 rounded-xl bg-[#D8F5FA] hover:bg-[#D8F5FA] text-blue-800 border border-[#D8F5FA] text-xs font-bold text-center cursor-pointer"
              >
                Upload KYC
              </button>
            </div>
          </Card>

          {/* Notifications preview */}
          <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900">Notifications ({notifications.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100">
              {notifications.length > 0 ? (
                notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <p className="text-xs font-bold text-slate-900">{n.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No notifications currently.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Report Modal */}
      {selectedTaskForSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-[#E63946] text-white flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold bg-[#E63946] px-2 py-0.5 rounded text-white">
                  {selectedTaskForSubmission.task_code || selectedTaskForSubmission.id}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Submit Work Report</h3>
                <p className="text-xs text-slate-300 mt-0.5">{selectedTaskForSubmission.title}</p>
              </div>
              <button 
                onClick={() => setSelectedTaskForSubmission(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTaskSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Work Summary & Output *</label>
                <textarea
                  required
                  rows={4}
                  value={submissionRemarks}
                  onChange={(e) => setSubmissionRemarks(e.target.value)}
                  placeholder="Enter detailed field observations, completed count, and outcomes..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-[#E63946] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setSelectedTaskForSubmission(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#E63946] hover:bg-[#FF6B6B] text-white font-bold" icon={Send}>
                  Submit Report
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
