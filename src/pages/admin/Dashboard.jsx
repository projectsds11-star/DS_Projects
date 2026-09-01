import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  ClipboardList, 
  FileClock, 
  CalendarCheck, 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Send, 
  Plus, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  Activity, 
  CheckCircle2, 
  Building2,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import { liveDataService } from '../../services/liveDataService';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [empData, taskData, attData] = await Promise.all([
          liveDataService.getEmployees(),
          liveDataService.getWorkTasks(),
          liveDataService.getAttendance()
        ]);
        if (empData) setEmployees(empData);
        if (taskData) setTasks(taskData);
        if (attData) setAttendance(attData);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const onboardingCount = employees.filter(e => e.status === 'Onboarding' || e.onboarding_status !== 'Completed').length;
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'Assigned' || t.status === 'In Progress').length;
  const completedTasks = tasks.filter(t => t.status === 'Approved' || t.status === 'Submitted').length;

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Executive Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B0F19] via-[#1E293B] to-[#1E3A8A] text-white p-6 sm:p-8 lg:p-10 shadow-2xl border border-slate-700/60">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-200 text-xs font-semibold">
              <Sparkles size={14} className="text-amber-300" />
              <span>Executive HRMS & Operations Infrastructure</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Command Overview & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">
                Workforce Intelligence
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
              <Clock size={14} className="text-blue-400" />
              <span>{currentDate} • All 26 District Nodes Synchronized</span>
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/admin/employees/add')}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus size={16} />
              <span>+ Add Employee</span>
            </button>

            <button
              onClick={() => navigate('/admin/onboarding/create')}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send size={16} />
              <span>+ Issue Offer</span>
            </button>
          </div>
        </div>
      </div>

      {/* High-Impact 6-Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5">
        {/* Card 1: Total Employees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              Live State
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Staff</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{totalEmployees}</p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">100%</span> in system
          </p>
        </div>

        {/* Card 2: Active Employees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
              <UserCheck className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Deployed</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{activeEmployees}</p>
          <p className="text-[11px] text-slate-400 mt-1">Field verified</p>
        </div>

        {/* Card 3: Pending Onboarding */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
              <UserPlus className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              Pipeline
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Onboarding</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{onboardingCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Offers in transit</p>
        </div>

        {/* Card 4: Assigned Work */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform">
              <ClipboardList className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
              Tasks
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Field Tasks</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{totalTasks}</p>
          <p className="text-[11px] text-slate-400 mt-1">Mandal operations</p>
        </div>

        {/* Card 5: Pending Submissions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600 group-hover:scale-110 transition-transform">
              <FileClock className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
              Pending
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Work</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{pendingTasks}</p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting completion</p>
        </div>

        {/* Card 6: Today's Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-teal-50 rounded-xl text-teal-600 group-hover:scale-110 transition-transform">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center text-[11px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
              Punches
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Attendance Log</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{attendance.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Punched today</p>
        </div>
      </div>

      {/* Main Split Section: Activity Stream (Left) + Operations Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent Staff & Onboarding Dossier */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity size={18} className="text-blue-600" />
                  <span>Recent Registered Staff</span>
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Live records from database</p>
              </div>

              <button
                onClick={() => navigate('/admin/employees')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>View Directory ({employees.length})</span>
                <ChevronRight size={14} />
              </button>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-slate-100">
              {employees.length > 0 ? (
                employees.slice(0, 5).map((emp) => (
                  <div key={emp.id || emp.employee_id} className="p-5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                        {emp.full_name?.charAt(0) || 'E'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">{emp.full_name}</p>
                        <p className="text-xs text-slate-500 truncate">{emp.designation} • {emp.mandal || emp.district}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {emp.employee_id}
                      </span>
                      <Badge variant={emp.status === 'Active' ? 'success' : 'warning'} className="text-[10px]">
                        {emp.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center space-y-2">
                  <Users className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No employees registered yet</p>
                  <p className="text-xs text-slate-400">Click "+ Add Employee" to create your first live record.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Work Operations & Statewide Deployment */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>Work Completion Progress</span>
              <ClipboardList size={16} className="text-blue-600" />
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-slate-600">Completed / Approved</span>
                  <span className="text-emerald-600">{completedTasks} Tasks</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-slate-600">In Progress / Assigned</span>
                  <span className="text-blue-600">{pendingTasks} Tasks</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                    style={{ width: totalTasks > 0 ? `${(pendingTasks / totalTasks) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Dispatched</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">{totalTasks}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Attendance Logs</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">{attendance.length}</span>
              </div>
            </div>
          </Card>

          {/* Quick Management Shortlinks */}
          <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Management Modules
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => navigate('/admin/work')}
                className="p-3 rounded-xl bg-blue-50/60 hover:bg-blue-100/60 text-blue-900 border border-blue-100 text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Daily Work</span>
                <ChevronRight size={14} className="text-blue-600" />
              </button>
              <button
                onClick={() => navigate('/admin/attendance')}
                className="p-3 rounded-xl bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-900 border border-emerald-100 text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Attendance</span>
                <ChevronRight size={14} className="text-emerald-600" />
              </button>
              <button
                onClick={() => navigate('/admin/offers')}
                className="p-3 rounded-xl bg-indigo-50/60 hover:bg-indigo-100/60 text-indigo-900 border border-indigo-100 text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Job Offers</span>
                <ChevronRight size={14} className="text-indigo-600" />
              </button>
              <button
                onClick={() => navigate('/admin/reports')}
                className="p-3 rounded-xl bg-amber-50/60 hover:bg-amber-100/60 text-amber-900 border border-amber-100 text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Reports</span>
                <ChevronRight size={14} className="text-amber-600" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
