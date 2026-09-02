import React, { useState } from 'react';
import { 
  Lock, 
  Bell, 
  Save, 
  Eye, 
  EyeOff, 
  Globe, 
  HelpCircle, 
  ShieldCheck, 
  Smartphone, 
  Mail, 
  CheckCircle2, 
  PhoneCall, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Info,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

export default function EmployeeSettings() {
  const [activeTab, setActiveTab] = useState('password');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState({
    workAssign: { email: true, inApp: true, sms: true },
    workApproval: { email: true, inApp: true, sms: false },
    attendanceReminder: { email: false, inApp: true, sms: true },
    broadcasts: { email: true, inApp: true, sms: false },
  });

  // App Preferences
  const [language, setLanguage] = useState('English');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  // FAQ open state
  const [openFaq, setOpenFaq] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!newPass || newPass !== confirmPass) {
      showToast('Passwords do not match. Please verify.');
      return;
    }
    showToast('Password updated securely!');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-[#00B4D8]' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = calculatePasswordStrength(newPass);

  const TABS = [
    { id: 'password', label: 'Security & Password', icon: Lock },
    { id: 'notifications', label: 'Notification Channels', icon: Bell },
    { id: 'preferences', label: 'Regional Preferences', icon: Globe },
    { id: 'help', label: 'Help & Field Support', icon: HelpCircle },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Account Settings & Preferences</h1>
        <p className="text-sm text-slate-500">Configure security credentials, notification channels, and field support.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 shrink-0 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1 w-full max-w-2xl space-y-6">
          {/* TAB 1: Security & Password */}
          {activeTab === 'password' && (
            <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="px-6 py-5 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-[#E63946]" />
                  Change Account Password
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Ensure your portal password is secure and updated regularly</p>
              </CardHeader>

              <CardContent className="p-6">
                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Current Password *</Label>
                    <div className="relative">
                      <Input
                        type={showOld ? 'text' : 'password'}
                        required
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        placeholder="Enter your current password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOld(!showOld)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">New Password *</Label>
                    <div className="relative">
                      <Input
                        type={showNew ? 'text' : 'password'}
                        required
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="Enter new strong password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {newPass && (
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Password Strength:</span>
                          <span className="font-bold text-slate-800">{strength.label}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${strength.color}`}
                            style={{ width: `${strength.score}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Confirm New Password *</Label>
                    <Input
                      type="password"
                      required
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Re-type new password"
                    />
                  </div>

                  {/* Criteria list */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs text-slate-600">
                    <p className="font-bold text-slate-800 mb-1">Password Requirements:</p>
                    <div className="flex items-center gap-2">
                      <Check size={12} className={newPass.length >= 8 ? 'text-emerald-600 font-bold' : 'text-slate-300'} />
                      <span>At least 8 characters in length</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={12} className={/[A-Z]/.test(newPass) ? 'text-emerald-600 font-bold' : 'text-slate-300'} />
                      <span>Contains at least one uppercase letter (A-Z)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={12} className={/[0-9]/.test(newPass) ? 'text-emerald-600 font-bold' : 'text-slate-300'} />
                      <span>Contains at least one numerical digit (0-9)</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-[#E63946] hover:bg-[#FF6B6B] text-white font-bold shadow-md shadow-[#E63946]/20"
                      icon={Save}
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: Notification Channels */}
          {activeTab === 'notifications' && (
            <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="px-6 py-5 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[#E63946]" />
                  Notification Channels & Alerts
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Control how and when you receive field updates and reminders</p>
              </CardHeader>

              <CardContent className="p-6 space-y-5">
                {[
                  { key: 'workAssign', title: 'New Field Task Assigned', desc: 'Alert when supervisor assigns you a new survey or mandal task' },
                  { key: 'workApproval', title: 'Work Report Approved / Reviewed', desc: 'Notification when your report is approved or returned for edits' },
                  { key: 'attendanceReminder', title: 'Daily Shift Punch Reminders', desc: 'Reminder at 09:10 AM if you have not checked in yet' },
                  { key: 'broadcasts', title: 'District & System Announcements', desc: 'Review meeting notices, government holiday circulars' },
                ].map((item) => (
                  <div key={item.key} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 pt-1 text-xs font-semibold text-slate-700">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifPrefs[item.key].email}
                          onChange={(e) => setNotifPrefs({
                            ...notifPrefs,
                            [item.key]: { ...notifPrefs[item.key], email: e.target.checked }
                          })}
                          className="rounded text-[#E63946] focus:ring-[#E63946] h-4 w-4"
                        />
                        <span>Email Alert</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifPrefs[item.key].inApp}
                          onChange={(e) => setNotifPrefs({
                            ...notifPrefs,
                            [item.key]: { ...notifPrefs[item.key], inApp: e.target.checked }
                          })}
                          className="rounded text-[#E63946] focus:ring-[#E63946] h-4 w-4"
                        />
                        <span>In-App Banner</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifPrefs[item.key].sms}
                          onChange={(e) => setNotifPrefs({
                            ...notifPrefs,
                            [item.key]: { ...notifPrefs[item.key], sms: e.target.checked }
                          })}
                          className="rounded text-[#E63946] focus:ring-[#E63946] h-4 w-4"
                        />
                        <span>SMS / WhatsApp</span>
                      </label>
                    </div>
                  </div>
                ))}

                <div className="pt-2 flex justify-end">
                  <Button 
                    onClick={() => showToast('Notification preferences saved!')}
                    className="bg-[#E63946] hover:bg-[#FF6B6B] text-white font-bold"
                    icon={Save}
                  >
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 3: Regional Preferences */}
          {activeTab === 'preferences' && (
            <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="px-6 py-5 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-emerald-600" />
                  Regional & Display Preferences
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Display Language</Label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white focus:ring-2 focus:ring-[#E63946] focus:outline-none"
                  >
                    <option>English (Default)</option>
                    <option>తెలుగు (Telugu)</option>
                    <option>हिंदी (Hindi)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Date Format</Label>
                  <select 
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white focus:ring-2 focus:ring-[#E63946] focus:outline-none"
                  >
                    <option>DD/MM/YYYY (e.g. 01/09/2026)</option>
                    <option>MM/DD/YYYY (e.g. 09/01/2026)</option>
                    <option>YYYY-MM-DD (e.g. 2026-09-01)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button 
                    onClick={() => showToast('Regional preferences saved!')}
                    className="bg-[#E63946] hover:bg-[#FF6B6B] text-white font-bold"
                    icon={Save}
                  >
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 4: Help & Field Support */}
          {activeTab === 'help' && (
            <div className="space-y-6">
              {/* Field Support Hotline */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#00B4D8] bg-white/10 px-2 py-0.5 rounded">
                    Field Operations Helpdesk
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">Need Assistance or Field Escalation?</h3>
                  <p className="text-xs text-slate-200 mt-1">
                    Contact the SPSR Nellore District Operational Command Center directly.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                    <p className="text-[11px] text-[#D8F5FA] font-medium">District Officer Hotline</p>
                    <p className="text-sm font-bold text-white font-mono mt-0.5">+91 94400 12345</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                    <p className="text-[11px] text-[#D8F5FA] font-medium">Technical Support Email</p>
                    <p className="text-sm font-bold text-white mt-0.5">support@dsprojects.in</p>
                  </div>
                </div>
              </div>

              {/* FAQs Accordion */}
              <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white">
                <CardHeader className="px-6 py-5 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900">Frequently Asked Field Questions</CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-3">
                  {[
                    {
                      q: 'How do I submit survey photos if I have low network connectivity in a village?',
                      a: 'The portal caches your report and photos locally on your device. Once you regain cellular network or return to Mandal HQ, click "Submit Report for Approval".'
                    },
                    {
                      q: 'What should I do if I forgot to punch in before 10:00 AM?',
                      a: 'Go to Attendance → Click "Request Regularization". Select "Missed Check-In" and provide your field reason for approval by your District Lead.'
                    },
                    {
                      q: 'How do I claim monthly travel & field fuel conveyance?',
                      a: 'Upload your village tour diary and fuel bills under Documents Hub → Field Reports by the 28th of every month.'
                    },
                  ].map((faq, idx) => (
                    <div 
                      key={idx} 
                      className="border border-slate-200 rounded-xl overflow-hidden cursor-pointer"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    >
                      <div className="p-4 bg-slate-50 flex items-center justify-between font-bold text-xs sm:text-sm text-slate-800">
                        <span>{faq.q}</span>
                        {openFaq === idx ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                      {openFaq === idx && (
                        <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
