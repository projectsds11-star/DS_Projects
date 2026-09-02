import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Lock, 
  Bell, 
  Building, 
  Palette, 
  Save, 
  MapPin, 
  Search, 
  CheckCircle2, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { AP_DISTRICTS_DATA, AP_STATE } from '../../data/andhraPradeshMasterData';

const TABS = [
  { id: 'company', label: 'Company Profile', icon: Building },
  { id: 'locations', label: 'AP Location Master', icon: MapPin },
  { id: 'security', label: 'Security & Auth', icon: Lock },
  { id: 'notifications', label: 'Alert Preferences', icon: Bell },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('company');
  const [districtSearch, setDistrictSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState(AP_DISTRICTS_DATA[20]); // Default: Nellore
  const [mandalSearch, setMandalSearch] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredDistricts = AP_DISTRICTS_DATA.filter(d =>
    !districtSearch ||
    d.name.toLowerCase().includes(districtSearch.toLowerCase()) ||
    d.headquarters.toLowerCase().includes(districtSearch.toLowerCase()) ||
    d.code.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const filteredMandals = selectedDistrict?.mandals?.filter(m =>
    !mandalSearch || m.toLowerCase().includes(mandalSearch.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 pb-20">
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
            <span>Executive Settings & Master Data</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">Corporate identity, statewide 26 district location master, and perimeter security.</p>
        </div>

        <Button 
          onClick={() => showToast('Configurations successfully saved!')} 
          className="bg-[#E63946] hover:bg-[#FF6B6B] text-white font-bold cursor-pointer"
          icon={Save}
        >
          Save Changes
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation Tabs */}
        <div className="w-full lg:w-64 shrink-0">
          <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white p-3 space-y-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </Card>
        </div>

        {/* Tab Panels */}
        <div className="flex-1">
          {activeTab === 'company' && (
            <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="px-6 py-5 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">Company Identity & Registration</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700 text-xs">Company Name</Label>
                    <Input defaultValue="DS Projects Private Limited" className="rounded-xl border-slate-300" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700 text-xs">Official Portal URL</Label>
                    <Input defaultValue="www.dsprojects.in" className="rounded-xl border-slate-300" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700 text-xs">Corporate Email</Label>
                    <Input defaultValue="contact@dsprojects.in" className="rounded-xl border-slate-300" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700 text-xs">Contact Phone</Label>
                    <Input defaultValue="+91 861 2345678" className="rounded-xl border-slate-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'locations' && (
            <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Andhra Pradesh Location Master (26 Districts)
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">Selected: <strong className="text-[#E63946]">{selectedDistrict?.name} District</strong> ({selectedDistrict?.mandals?.length} Mandals)</p>
                </div>
              </CardHeader>

              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* District List */}
                <div className="md:col-span-5 space-y-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter district..."
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                    />
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                    {filteredDistricts.map(d => (
                      <button
                        key={d.code}
                        onClick={() => setSelectedDistrict(d)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                          selectedDistrict?.code === d.code
                            ? 'bg-[#E63946] text-white shadow-xs'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{d.name}</span>
                        <span className="text-[10px] opacity-75 font-mono">{d.mandals?.length} mandals</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mandal Chips */}
                <div className="md:col-span-7 space-y-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter mandals in this district..."
                      value={mandalSearch}
                      onChange={(e) => setMandalSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946]"
                    />
                  </div>

                  <div className="max-h-72 overflow-y-auto flex flex-wrap gap-1.5 pr-1">
                    {filteredMandals.map(m => (
                      <span key={m} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-medium border border-slate-200/60">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="px-6 py-5 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">Perimeter Security & MFA Gates</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Email OTP Multi-Factor Authentication</p>
                    <p className="text-xs text-slate-500 mt-0.5">Strict 6-digit real-time passcode gate on login</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                    Enforced
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">JWT Single-Session Tokenization</p>
                    <p className="text-xs text-slate-500 mt-0.5">8-hour session lifetime with automatic revocation</p>
                  </div>
                  <span className="text-xs font-bold text-[#E63946] bg-[#D8F5FA] px-3 py-1 rounded-full">
                    Active
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="px-6 py-5 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">Alert Triggers & Push Matrix</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3 text-xs sm:text-sm">
                {[
                  { title: 'New Employee Registration Alert', desc: 'Notify admin when candidate completes registration' },
                  { title: 'Field Work Report Submission', desc: 'Instant alert when a mandal lead submits daily report' },
                  { title: 'Attendance Missed Punch Notification', desc: 'Alert supervisor when punch is regularized' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-[#E63946] rounded cursor-pointer" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
