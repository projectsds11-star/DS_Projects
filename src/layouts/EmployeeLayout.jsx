import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  ClipboardList, 
  Clock, 
  FileText,
  Bell, 
  Settings, 
  Menu, 
  X,
  LogOut,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { cn } from '../utils/cn';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard, badge: null },
  { name: 'My Work', path: '/employee/work', icon: ClipboardList, badge: '2 Due' },
  { name: 'Attendance', path: '/employee/attendance', icon: Clock, badge: null },
  { name: 'Documents', path: '/employee/documents', icon: FileText, badge: null },
  { name: 'Profile', path: '/employee/profile', icon: User, badge: null },
  { name: 'Notifications', path: '/employee/notifications', icon: Bell, badge: '3 New' },
  { name: 'Settings', path: '/employee/settings', icon: Settings, badge: null },
];

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem('ds_employee_token');
    localStorage.removeItem('ds_current_employee_id');
    localStorage.removeItem('ds_employee_session');
    navigate('/employee/login', { replace: true });
  };

  // Get current page title
  const currentNav = NAV_ITEMS.find(item => location.pathname.startsWith(item.path));
  const pageTitle = currentNav ? currentNav.name : 'Employee Portal';

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
          "fixed inset-y-0 left-0 z-50 w-72 bg-[#E63946] text-white transition-all duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col shadow-lg border-r border-[#E63946]/90",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-24 px-5 border-b border-white/20 shadow-2xs">
          <div className="flex items-center justify-center flex-1 h-full py-2">
            <img src="/logo.png" alt="DS PROJECTS" className="h-16 w-auto max-w-[210px] object-contain brightness-0 invert" />
          </div>
          <button 
            onClick={toggleSidebar} 
            className="lg:hidden text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors shrink-0 ml-1"
          >
            <X size={22} />
          </button>
        </div>
        
        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
          <div className="px-3 pb-2 mb-2 flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-white/60 uppercase tracking-wider">Navigation</p>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          </div>
          
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                  isActive 
                    ? "bg-white text-[#E63946] font-bold shadow-md" 
                    : "text-white/80 hover:bg-[#FF6B6B] hover:text-white"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    isActive ? "bg-[#E63946]/10 text-[#E63946]" : "bg-white/10 text-white/70 group-hover:text-white group-hover:bg-white/20"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="truncate">{item.name}</span>
                </div>

                {item.badge && (
                  <span className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 transition-colors",
                    isActive 
                      ? "bg-white/25 text-white" 
                      : "bg-[#D8F5FA] text-[#E63946] border border-[#D8F5FA]"
                  )}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
        
        {/* Quick Shift Status in Sidebar */}
        <div className="px-4 py-3 space-y-3 mt-auto">
          <div className="p-3 rounded-xl bg-white/10 border border-white/20 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className={cn(
                "w-2.5 h-2.5 rounded-full shrink-0",
                isCheckedIn ? "bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" : "bg-white/40"
              )} />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {isCheckedIn ? 'Currently Clocked In' : 'Clocked Out'}
                </p>
                <p className="text-[10px] text-white/60">
                  {isCheckedIn ? 'Since 09:15 AM (4h 25m)' : 'Shift ended'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsCheckedIn(!isCheckedIn)}
              className={cn(
                "text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer",
                isCheckedIn 
                  ? "bg-white/20 text-white hover:bg-white/30 border border-white/30"
                  : "bg-[#00B4D8] text-white hover:bg-[#48CAE4] shadow-xs"
              )}
            >
              {isCheckedIn ? 'Out' : 'In'}
            </button>
          </div>

          {/* User Card at bottom */}
          <div className="p-3 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-white text-sm shadow-xs">
                  RK
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#E63946] rounded-full" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Rahul Kumar</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-white/80 font-mono font-medium">DS-127</span>
                  <span className="text-white/40">•</span>
                  <span className="text-[11px] text-white/60 truncate">Nellore</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Modern Top Header */}
        <header className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs z-30 sticky top-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={toggleSidebar}
              className="p-2 text-slate-600 rounded-xl lg:hidden hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shrink-0"
            >
              <Menu size={22} />
            </button>
            <div className="lg:hidden flex items-center bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-sm h-12 max-w-[160px] shrink-0">
              <img src="/logo.png" alt="DS PROJECTS" className="h-full w-auto object-contain" />
            </div>
            
            <div className="hidden md:block">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span>Portal</span>
                <ChevronRight size={12} className="text-slate-400" />
                <span className="text-blue-600 font-semibold">{pageTitle}</span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
                {pageTitle}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Clock widget on header */}
            <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-600 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-700 font-mono font-semibold">
                <Clock size={14} className="text-blue-600" />
                <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
              <div className="w-px h-3.5 bg-slate-300" />
              <div className="flex items-center gap-1.5 text-slate-500">
                <Calendar size={13} />
                <span>{currentTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>

            {/* Quick Check-in pill */}
            <button
              onClick={() => setIsCheckedIn(!isCheckedIn)}
              className={cn(
                "hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer",
                isCheckedIn
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 group"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20"
              )}
            >
              <span className={cn(
                "w-2 h-2 rounded-full",
                isCheckedIn ? "bg-emerald-500 group-hover:bg-rose-500 animate-pulse" : "bg-white"
              )} />
              {isCheckedIn ? (
                <span>
                  <span className="group-hover:hidden">04h 25m Working</span>
                  <span className="hidden group-hover:inline">Click to Check Out</span>
                </span>
              ) : (
                <span>Punch In Now</span>
              )}
            </button>

            {/* Notifications Shortcut */}
            <NavLink
              to="/employee/notifications"
              className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl relative transition-all border border-slate-200/80"
              title="Notifications"
            >
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border-2 border-white"></span>
              </span>
              <Bell size={18} />
            </NavLink>

            <div className="h-6 w-px bg-slate-200" />

            {/* Logout button */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-rose-600 p-2 sm:px-3 sm:py-2 rounded-xl hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100 cursor-pointer"
            >
              <LogOut size={16} className="text-slate-400 group-hover:text-rose-500" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Main Content Container */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#F8FAFC] to-[#EFF6FF]/30 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
