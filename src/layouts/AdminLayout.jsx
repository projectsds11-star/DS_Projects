import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  FileCheck, 
  ClipboardList, 
  Clock, 
  BarChart3, 
  Bell, 
  Settings, 
  Menu, 
  X, 
  LogOut, 
  Search,
  ShieldCheck,
  ChevronRight,
  UserPlus,
  Send
} from 'lucide-react';
import { cn } from '../utils/cn';
import { supabase } from '../services/supabaseClient';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Employees', path: '/admin/employees', icon: Users },
  { name: 'Onboarding', path: '/admin/onboarding', icon: UserCheck },
  { name: 'Job Offers', path: '/admin/offers', icon: FileCheck },
  { name: 'Daily Work', path: '/admin/work', icon: ClipboardList },
  { name: 'Attendance', path: '/admin/attendance', icon: Clock },
  { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { name: 'Notifications', path: '/admin/notifications', icon: Bell },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const adminEmail = (() => {
    try {
      const raw = localStorage.getItem('ds_admin_session');
      if (!raw) return 'admin@dsprojects.com';
      const session = JSON.parse(raw);
      return session?.email || 'admin@dsprojects.com';
    } catch {
      return 'admin@dsprojects.com';
    }
  })();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = async () => {
    localStorage.removeItem('ds_admin_token');
    localStorage.removeItem('ds_admin_session');
    try { await supabase.auth.signOut(); } catch (e) {}
    navigate('/admin/login', { replace: true });
  };

  const currentNav = NAV_ITEMS.find(item => location.pathname.startsWith(item.path));
  const pageTitle = currentNav ? currentNav.name : 'Executive Command';

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">

      {/* ── Logout Confirmation Modal ─────────────────────────── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />
          <div
            className="relative w-full max-w-sm rounded-2xl border border-[#E63946]/40 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1a0a1e 100%)' }}
          >
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600" />

            <div className="p-7">
              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center shadow-lg shadow-rose-500/10">
                  <LogOut className="w-7 h-7 text-rose-400" />
                </div>
              </div>

              {/* Text */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Sign Out of Console?</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  You are about to exit the{' '}
                  <span className="text-blue-400 font-semibold">DS Projects Executive Console</span>.
                  Your active session will be terminated.
                </p>
              </div>

              {/* Admin info strip */}
              <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-black text-white text-sm shrink-0">
                  {adminEmail.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white">Super Admin</p>
                  <p className="text-[11px] text-slate-400 truncate">{adminEmail}</p>
                </div>
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)' }}
                >
                  <LogOut className="w-4 h-4" />
                  Yes, Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-[#E63946] text-white transition-all duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col shadow-lg border-r border-[#E63946]/90",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-24 px-5 border-b border-white/20 shadow-2xs">
          <div className="flex items-center justify-center flex-1 h-full py-2">
            <img src="/logo.png" alt="DS PROJECTS" className="h-16 w-auto max-w-[210px] object-contain brightness-0 invert" />
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors shrink-0 ml-1">
            <X size={22} />
          </button>
        </div>
        
        {/* Nav links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
          <div className="px-3 pb-2 mb-2 flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-white/60 uppercase tracking-wider">Enterprise Modules</p>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 text-xs sm:text-sm font-semibold group cursor-pointer",
                  isActive 
                    ? "bg-white text-[#E63946] shadow-md font-bold" 
                    : "text-white/80 hover:text-white hover:bg-[#FF6B6B]"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-[#E63946]" : "text-white/70 group-hover:text-white")} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-[#E63946]" />}
              </NavLink>
            );
          })}
        </div>
        
        {/* Admin Profile + Sign Out */}
        <div className="p-4 space-y-2.5 mt-auto">
          {/* Sign Out Button - TOP */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 transition-all duration-200 shadow-2xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <LogOut className="h-4 w-4 text-white/60 group-hover:text-white transition-transform group-hover:-translate-x-0.5" />
              <span className="font-bold">Sign Out</span>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] text-white font-bold bg-white/10 border border-white/20 px-2 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          </button>

          {/* Admin Profile Card - BOTTOM */}
          <div className="flex items-center p-3 rounded-2xl bg-white/10 border border-white/10 gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-white text-base shrink-0 shadow-xs">
              {adminEmail.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-white truncate">Super Admin</p>
                <ShieldCheck className="h-3.5 w-3.5 text-[#00B4D8] shrink-0" />
              </div>
              <p className="text-[11px] text-white/60 truncate">{adminEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0">
              <Menu size={22} />
            </button>
            <div className="lg:hidden flex items-center bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-sm h-12 max-w-[160px] shrink-0">
              <img src="/logo.png" alt="DS PROJECTS" className="h-full w-auto object-contain" />
            </div>
            <div className="hidden md:flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">{pageTitle}</h2>
            </div>
            <div className="hidden sm:flex items-center max-w-md w-full ml-auto md:ml-4">
              <div className="relative w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search employees, work tasks, candidate offers..." className="w-full h-10 pl-10 pr-4 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-slate-400" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <button onClick={() => navigate('/admin/employees/add')} className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#E63946] hover:bg-[#FF6B6B] text-white rounded-xl text-xs font-bold shadow-md shadow-[#E63946]/20 transition-all cursor-pointer">
              <UserPlus size={14} /><span>+ Add Employee</span>
            </button>
            <button onClick={() => navigate('/admin/onboarding/create')} className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#00B4D8] hover:bg-[#48CAE4] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer">
              <Send size={14} /><span>+ Issue Offer</span>
            </button>
            <button onClick={() => navigate('/admin/notifications')} className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
            <button onClick={() => setShowLogoutModal(true)} className="sm:hidden p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}
