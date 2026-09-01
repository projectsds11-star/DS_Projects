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
  Plus,
  Sparkles,
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
  const location = useLocation();
  const navigate = useNavigate();
  
  // Read admin email from session for sidebar profile
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
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    navigate('/admin/login', { replace: true });
  };

  const currentNav = NAV_ITEMS.find(item => location.pathname.startsWith(item.path));
  const pageTitle = currentNav ? currentNav.name : 'Executive Command';

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
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
          "fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-slate-100 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col shadow-2xl border-r border-slate-800",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-6 bg-[#0B0F19] border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/25 tracking-tight text-base ring-2 ring-white/10">
              DS
            </div>
            <div>
              <span className="text-base font-bold tracking-wider text-white flex items-center gap-1.5">
                DS PROJECTS
              </span>
              <span className="inline-flex items-center text-[10px] font-semibold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 mt-0.5">
                Executive Admin
              </span>
            </div>
          </div>
          <button 
            onClick={toggleSidebar} 
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
          <div className="px-3 pb-2 mb-2 flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Enterprise Modules</p>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
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
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 font-bold" 
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400")} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-blue-200" />}
              </NavLink>
            );
          })}
        </div>
        
        {/* Admin profile & logout */}
        <div className="p-4 bg-[#0B0F19] border-t border-slate-800/80 space-y-3">
          <div className="flex items-center p-3 rounded-2xl bg-slate-900/90 border border-slate-800 gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-black text-white text-base shrink-0 shadow-sm">
              {adminEmail.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-white truncate">Super Admin</p>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-400 truncate">{adminEmail}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all border border-rose-500/20 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out Console</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Executive Header */}
        <header className="h-20 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <Menu size={22} />
            </button>

            <div className="hidden md:flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {pageTitle}
              </h2>
            </div>

            {/* Global Search Bar */}
            <div className="hidden sm:flex items-center max-w-md w-full ml-auto md:ml-4">
              <div className="relative w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search employees, work tasks, candidate offers..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions & Telemetry Header Tools */}
          <div className="flex items-center gap-3 ml-4">
            <button
              onClick={() => navigate('/admin/employees/add')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <UserPlus size={14} />
              <span>+ Add Employee</span>
            </button>

            <button
              onClick={() => navigate('/admin/onboarding/create')}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Send size={14} />
              <span>+ Issue Offer</span>
            </button>

            <button
              onClick={() => navigate('/admin/notifications')}
              className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            <button
              onClick={handleLogout}
              className="sm:hidden p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
