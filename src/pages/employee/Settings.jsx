import React, { useState } from 'react';
import { Lock, Bell, Save, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

export default function EmployeeSettings() {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [activeTab, setActiveTab] = useState('password');
  const TABS = [
    { id: 'password', label: 'Change Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-navy)]">Settings</h1>
        <p className="text-[var(--color-text-secondary)]">Manage your account preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-52 shrink-0">
          <nav className="flex flex-col space-y-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id ? 'bg-[var(--color-primary)] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 max-w-lg">
          {activeTab === 'password' && (
            <Card>
              <CardHeader className="border-b border-[var(--color-border)]">
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <div className="relative">
                    <Input type={showOld ? 'text' : 'password'} placeholder="Enter current password" />
                    <button
                      type="button"
                      onClick={() => setShowOld(!showOld)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input type={showNew ? 'text' : 'password'} placeholder="Enter new password" />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">Minimum 8 characters, include a number and symbol.</p>
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" placeholder="Re-enter new password" />
                </div>
                <div className="pt-2">
                  <Button icon={Save}>Update Password</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader className="border-b border-[var(--color-border)]">
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {[
                  { label: 'New work assigned', desc: 'Get notified when admin assigns you a task', enabled: true },
                  { label: 'Work approved/rejected', desc: 'Get notified when your submission is reviewed', enabled: true },
                  { label: 'Attendance reminders', desc: 'Daily check-in reminder at 9:00 AM', enabled: false },
                  { label: 'Company announcements', desc: 'Admin broadcasts and system updates', enabled: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border border-[var(--color-border)] rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <div className={`w-10 h-6 rounded-full flex items-center cursor-pointer transition-colors ${item.enabled ? 'bg-[var(--color-primary)] justify-end pr-1' : 'bg-gray-200 pl-1'}`}>
                      <div className="w-4 h-4 bg-white rounded-full shadow" />
                    </div>
                  </div>
                ))}
                <Button icon={Save} className="mt-2">Save Preferences</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
