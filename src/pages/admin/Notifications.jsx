import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, Send, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const NOTIFICATIONS = [
  { id: 1, title: 'New Employee Registered', message: 'Arjun Mehta (DS-128) has been added to the system.', time: '2 min ago', type: 'info', read: false },
  { id: 2, title: 'Work Submitted for Review', message: 'Rahul Kumar submitted "Farmer Survey – Kavali" and is awaiting your review.', time: '45 min ago', type: 'action', read: false },
  { id: 3, title: 'Offer Letter Sent', message: 'Offer letter for Sunita Rao (Facilator, Guntur) was emailed successfully.', time: '2 hours ago', type: 'success', read: false },
  { id: 4, title: 'Attendance Alert', message: '51 employees were absent today in Nellore district.', time: '5 hours ago', type: 'warning', read: true },
  { id: 5, title: 'Onboarding Completed', message: 'Ramesh Babu (DS-130) has completed all 6 onboarding steps.', time: 'Yesterday', type: 'success', read: true },
];

const typeConfig = {
  info: { color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  action: { color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  success: { color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  warning: { color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('inbox');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })));
  const markRead = (id) => setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-navy)]">Notifications</h1>
          <p className="text-[var(--color-text-secondary)]">Manage system alerts and send broadcasts.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" icon={CheckCheck} onClick={markAllRead}>
            Mark all as read ({unreadCount})
          </Button>
        )}
      </div>

      <div className="flex gap-4 border-b border-[var(--color-border)]">
        {['inbox', 'send'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 text-sm font-medium border-b-2 capitalize transition-colors ${activeTab === tab ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab === 'inbox' ? `Inbox ${unreadCount > 0 ? `(${unreadCount})` : ''}` : 'Send Broadcast'}
          </button>
        ))}
      </div>

      {activeTab === 'inbox' && (
        <Card>
          <CardContent className="p-0 divide-y divide-[var(--color-border)]">
            {notifications.map(n => {
              const cfg = typeConfig[n.type];
              return (
                <div
                  key={n.id}
                  className={`flex gap-4 p-5 hover:bg-gray-50 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}
                  onClick={() => markRead(n.id)}
                >
                  <div className="mt-1 shrink-0">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${!n.read ? cfg.dot : 'bg-transparent'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <p className={`text-sm font-semibold ${n.read ? 'text-gray-700' : 'text-[var(--color-navy)]'}`}>{n.title}</p>
                      <span className="text-xs text-gray-400 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {activeTab === 'send' && (
        <Card>
          <CardHeader className="border-b border-[var(--color-border)]">
            <CardTitle>Send Notification to Employees</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5 max-w-2xl">
            <div className="space-y-2">
              <label className="text-sm font-medium">Send To</label>
              <select className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                <option>All Employees</option>
                <option>Nellore District</option>
                <option>Guntur District</option>
                <option>Mandal Co-ordinators only</option>
                <option>Select individuals...</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notification Title</label>
              <input
                type="text"
                className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="e.g. New Policy Update"
                value={broadcastTitle}
                onChange={e => setBroadcastTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <textarea
                rows={5}
                className="flex w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Type your message here..."
                value={broadcastMsg}
                onChange={e => setBroadcastMsg(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button icon={Send} disabled={!broadcastTitle || !broadcastMsg}>Send Notification</Button>
              <Button variant="outline">Schedule for Later</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
