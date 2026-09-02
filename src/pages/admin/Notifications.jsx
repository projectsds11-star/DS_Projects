import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Send, 
  Users, 
  CheckCircle2, 
  Megaphone, 
  Sparkles, 
  AlertCircle,
  Inbox
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { liveDataService } from '../../services/liveDataService';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('inbox');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [targetType, setTargetType] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [notifList, empList] = await Promise.all([
          liveDataService.getNotifications(),
          liveDataService.getActiveOnboardedEmployees()
        ]);
        if (notifList) setNotifications(notifList);
        if (empList) setEmployees(empList);
      } catch (err) {
        console.error('Error loading notifications:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMsg) return;

    // Send to all employees or target
    const targetEmployees = targetType === 'All' ? employees : employees.filter(e => e.district === targetType);
    
    if (targetEmployees.length === 0) {
      await liveDataService.createNotification({
        employee_id: 'DS-127',
        title: broadcastTitle,
        message: broadcastMsg,
        type: 'announcement',
        is_read: false
      });
    } else {
      for (const emp of targetEmployees) {
        await liveDataService.createNotification({
          employee_id: emp.employee_id,
          title: broadcastTitle,
          message: broadcastMsg,
          type: 'announcement',
          is_read: false
        });
      }
    }

    showToast('Broadcast notification dispatched to all field staff!');
    setBroadcastTitle('');
    setBroadcastMsg('');
    setActiveTab('inbox');

    const freshNotifs = await liveDataService.getNotifications();
    setNotifications(freshNotifs);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 pb-12">
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
            <span>Notifications & Broadcast Hub</span>
            {unreadCount > 0 && (
              <span className="text-xs font-bold bg-[#D8F5FA] text-blue-800 px-2.5 py-0.5 rounded-full">
                {unreadCount} Unread
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">Send operational bulletins and emergency alerts to field personnel.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inbox' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Notification Stream
          </button>
          <button
            onClick={() => setActiveTab('send')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'send' ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/20' : 'bg-[#D8F5FA] text-[#E63946] hover:bg-[#D8F5FA]'
            }`}
          >
            <Megaphone size={14} />
            <span>+ Send Broadcast</span>
          </button>
        </div>
      </div>

      {activeTab === 'send' && (
        <Card className="border border-slate-200/80 shadow-md rounded-2xl bg-white overflow-hidden max-w-2xl mx-auto">
          <CardHeader className="bg-[#E63946] text-white p-6">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-amber-400" />
              <span>Broadcast Statewide Circular</span>
            </CardTitle>
            <p className="text-xs text-slate-300">Push real-time alert to employee mobile portal</p>
          </CardHeader>

          <form onSubmit={handleSendBroadcast} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Target Audience</label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-[#E63946] focus:outline-none"
              >
                <option value="All">All Registered Staff (Statewide)</option>
                <option value="Nellore">Nellore District Only</option>
                <option value="Guntur">Guntur District Only</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Circular Title *</label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Mandatory Mandal Survey Deadline Update"
                className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm focus:ring-2 focus:ring-[#E63946] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Message Content *</label>
              <textarea
                required
                rows={4}
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="Detailed announcement text..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm focus:ring-2 focus:ring-[#E63946] focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setActiveTab('inbox')}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#E63946] hover:bg-[#FF6B6B] text-white font-bold" icon={Send}>
                Dispatch Broadcast
              </Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === 'inbox' && (
        <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-0 divide-y divide-slate-100">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className="p-5 hover:bg-slate-50/80 transition-colors flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#D8F5FA] text-[#E63946] flex items-center justify-center shrink-0 border border-[#D8F5FA]">
                    <Bell size={18} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-bold text-sm text-slate-900">{n.title}</p>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{n.message}</p>
                    <p className="text-[11px] text-slate-400 pt-1 font-mono">Assigned Staff: {n.employee_id || 'All'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center space-y-3">
                <Inbox className="h-12 w-12 text-slate-300 mx-auto" />
                <p className="font-bold text-sm text-slate-700">No notifications sent yet</p>
                <p className="text-xs text-slate-400">Send an operational broadcast using the button above.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
