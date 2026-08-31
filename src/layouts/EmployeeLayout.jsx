import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { cn } from '../utils/cn';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
  { name: 'Profile', path: '/employee/profile', icon: User },
  { name: 'My Work', path: '/employee/work', icon: ClipboardList },
  { name: 'Attendance', path: '/employee/attendance', icon: Clock },
  { name: 'Documents', path: '/employee/documents', icon: FileText },
  { name: 'Notifications', path: '/employee/notifications', icon: Bell },
  { name: 'Settings', path: '/employee/settings', icon: Settings },
];

export default function EmployeeLayout() {
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
          "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[var(--color-border)] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col shadow-sm",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-[var(--color-primary)] text-white">
          <span className="text-xl font-bold tracking-wider">DS PROJECTS</span>
          <button onClick={toggleSidebar} className="lg:hidden text-white hover:text-gray-300">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 bg-white">
          <div className="px-3 pb-4 mb-4 border-b border-[var(--color-border)]">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Employee Portal</p>
          </div>
          
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
                    ? "bg-[var(--color-primary)] bg-opacity-10 text-[var(--color-primary)]" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-[var(--color-primary)]" : "text-gray-400 group-hover:text-gray-600")} />
                {item.name}
              </NavLink>
            );
          })}
        </div>
        
        <div className="p-4 bg-white border-t border-[var(--color-border)]">
          <div className="flex items-center p-3 space-x-3 rounded-lg bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-[var(--color-lavender)] flex items-center justify-center font-bold text-[var(--color-navy)] text-lg">
              R
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Rahul Kumar</p>
              <p className="text-xs text-gray-500 truncate">DS-127</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-[var(--color-border)] shadow-sm z-30">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 mr-4 -ml-2 text-gray-500 rounded-md lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <Menu size={24} />
            </button>
            
            <h1 className="text-lg font-semibold text-gray-800 lg:hidden">Employee Portal</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-[var(--color-primary)] relative transition-colors">
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              <Bell size={20} />
            </button>
            <div className="h-8 w-px bg-gray-200"></div>
            <button className="flex items-center text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">
              <LogOut size={20} className="sm:mr-2" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[var(--color-background)] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
