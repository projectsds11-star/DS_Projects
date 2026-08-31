import React, { useState } from 'react';
import { Bell, CheckCheck, Megaphone } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const NOTIFICATIONS = [
  { id: 1, title: 'New Work Assigned', message: 'Admin assigned you a new task: "Collect farmer survey data – Nellore". Due today at 5:00 PM.', time: '2 hours ago', read: false, type: 'work' },
  { id: 2, title: 'Work Approved 🎉', message: 'Your submission for "Weekly field report – Week 34" has been approved by the admin.', time: '5 hours ago', read: false, type: 'success' },
  { id: 3, title: 'Attendance Reminder', message: 'You have not checked in today. Please mark your attendance before 10:00 AM.', time: 'Yesterday, 9:55 AM', read: true, type: 'reminder' },
  { id: 4, title: 'Company Announcement', message: 'New holiday list for Q4 2026 has been published. Please check the settings for the updated calendar.', time: '2 days ago', read: true, type: 'announcement' },
  { id: 5, title: 'Profile Updated', message: 'Your profile contact information has been successfully updated by HR.', time: '3 days ago', read: true, type: 'info' },
];

const dotColor = {
  work: 'bg-blue-500',
  success: 'bg-green-500',
  reminder: 'bg-amber-500',
  announcement: 'bg-purple-500',
  info: 'bg-gray-400',
};

export default function EmployeeNotifications() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const unread = notifications.filter(n => !n.read).length;

  const markAll = () => setNotifications(n => n.map(x => ({ ...x, read: true })));
  const markOne = (id) => setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-navy)]">Notifications</h1>
          <p className="text-[var(--color-text-secondary)]">Stay up to date with your assignments and updates.</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" icon={CheckCheck} onClick={markAll}>
            Mark all read ({unread})
          </Button>
        )}
      </div>

      {unread === 0 && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700">
          <CheckCheck className="h-5 w-5 text-green-500 shrink-0" />
          All caught up! No unread notifications.
        </div>
      )}

      <Card>
        <CardContent className="p-0 divide-y divide-[var(--color-border)]">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`flex gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/40' : ''}`}
              onClick={() => markOne(n.id)}
            >
              <div className="mt-2 shrink-0">
                <div className={`w-2.5 h-2.5 rounded-full ${!n.read ? dotColor[n.type] : 'bg-transparent border border-gray-200'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className={`text-sm font-semibold ${n.read ? 'text-gray-700' : 'text-[var(--color-navy)]'}`}>{n.title}</p>
                  <span className="text-xs text-gray-400 shrink-0">{n.time}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
