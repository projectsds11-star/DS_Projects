import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Megaphone, 
  ClipboardCheck, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Search, 
  ArrowRight,
  Inbox
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { liveDataService } from '../../services/liveDataService';

export default function EmployeeNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const currentEmpId = localStorage.getItem('ds_current_employee_id') || 'DS-127';

  useEffect(() => {
    async function loadNotifications() {
      setLoading(true);
      try {
        const liveNotifs = await liveDataService.getNotifications(currentEmpId);
        setNotifications(liveNotifs || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, [currentEmpId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const unreadCount = notifications.filter(n => !n.is_read && !n.read).length;

  const markAllAsRead = async () => {
    await liveDataService.markAllNotificationsRead(currentEmpId);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read: true })));
    showToast('All notifications marked as read.');
  };

  const markSingleAsRead = async (id) => {
    await liveDataService.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true, read: true } : n));
  };

  const CATEGORIES = ['All', 'Unread', 'Tasks', 'Approvals', 'Announcements'];

  const filteredNotifications = notifications.filter(n => {
    const isRead = n.is_read || n.read;
    if (activeFilter === 'Unread' && isRead) return false;
    if (activeFilter === 'Tasks' && n.type !== 'task' && n.type !== 'work') return false;
    if (activeFilter === 'Approvals' && n.type !== 'success') return false;
    if (activeFilter === 'Announcements' && n.type !== 'announcement') return false;

    if (searchTerm) {
      const matchTitle = (n.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchMsg = (n.message || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchTitle || matchMsg;
    }
    return true;
  });

  const getTypeIcon = (type) => {
    if (type === 'task' || type === 'work') return <ClipboardCheck className="h-5 w-5 text-blue-600" />;
    if (type === 'success') return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
    if (type === 'reminder') return <Clock className="h-5 w-5 text-amber-600" />;
    if (type === 'announcement') return <Megaphone className="h-5 w-5 text-purple-600" />;
    return <Sparkles className="h-5 w-5 text-indigo-600" />;
  };

  const getTypeBg = (type) => {
    if (type === 'task' || type === 'work') return 'bg-blue-50 border-blue-200';
    if (type === 'success') return 'bg-emerald-50 border-emerald-200';
    if (type === 'reminder') return 'bg-amber-50 border-amber-200';
    if (type === 'announcement') return 'bg-purple-50 border-purple-200';
    return 'bg-indigo-50 border-indigo-200';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500">Live operational alerts and assignments.</p>
        </div>

        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={markAllAsRead}
            className="font-semibold text-slate-700 cursor-pointer"
            icon={CheckCheck}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-0 divide-y divide-slate-100">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((n) => {
              const isRead = n.is_read || n.read;
              return (
                <div
                  key={n.id}
                  onClick={() => markSingleAsRead(n.id)}
                  className={`p-6 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-5 cursor-pointer ${
                    !isRead ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${getTypeBg(n.type)} shadow-2xs`}>
                      {getTypeIcon(n.type)}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm sm:text-base font-bold ${!isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                          {n.title}
                        </h3>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                        {n.message}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <span>{n.time || 'Recent'}</span>
                        {(n.action_link || n.actionLink) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markSingleAsRead(n.id);
                              navigate(n.action_link || n.actionLink);
                            }}
                            className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline cursor-pointer"
                          >
                            <span>{n.action_text || n.actionText || 'View'}</span>
                            <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center space-y-2">
              <Inbox className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No notifications found</p>
              <p className="text-xs text-slate-400">New alerts and circulars will be listed here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
