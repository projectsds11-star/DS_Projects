import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
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
  User, 
  Search 
} from 'lucide-react';
import { cn } from '../utils/cn';

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

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background)]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-[var(--color-navy)] text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-[#1f2150]">
          <span className="text-xl font-bold tracking-wider">DS PROJECTS</span>
          <button onClick={toggleSidebar} className="lg:hidden text-white hover:text-gray-300">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 rounded-lg transition-colors group text-sm font-medium",
                  isActive 
                    ? "bg-[var(--color-primary)] text-white" 
                    : "text-gray-300 hover:bg-[#2c2f6d] hover:text-white"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-white" : "text-gray-400 group-hover:text-white")} />
                {item.name}
              </NavLink>
            );
          })}
        </div>
        
        <div className="p-4 bg-[#1f2150]">
          <div className="flex items-center p-3 space-x-3 rounded-lg bg-[#2c2f6d]">
            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center font-bold text-lg">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Super Admin</p>
              <p className="text-xs text-gray-400 truncate">admin@dsprojects.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-[var(--color-border)] shadow-sm z-30">
          <div className="flex items-center flex-1">
            <button
              onClick={toggleSidebar}
              className="p-2 mr-4 -ml-2 text-gray-500 rounded-md lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <Menu size={24} />
            </button>
            
            <div className="hidden sm:flex items-center max-w-md w-full ml-4">
              <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search employees, work, offers..."
                  className="block w-full h-10 pl-10 pr-3 py-2 border border-transparent rounded-lg leading-5 bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent sm:text-sm transition-colors"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-500 relative">
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              <Bell size={20} />
            </button>
            <div className="h-8 w-px bg-gray-200"></div>
            <button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
              <LogOut size={20} className="sm:mr-2 text-gray-400" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[var(--color-background)]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
