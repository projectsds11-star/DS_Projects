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
  ShieldCheck 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { AP_DISTRICTS_DATA, AP_STATE } from '../../data/andhraPradeshMasterData';

const TABS = [
  { id: 'company', label: 'Company Info', icon: Building },
  { id: 'locations', label: 'Location Master (AP)', icon: MapPin },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('company');
  const [districtSearch, setDistrictSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState(AP_DISTRICTS_DATA[20]); // Default: Nellore
  const [mandalSearch, setMandalSearch] = useState('');

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
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--color-navy)]">System Settings</h1>
        <p className="text-xs text-gray-500 mt-0.5">Manage administrative configurations, location master data, and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Nav */}
        <div className="w-full lg:w-60 shrink-0">
          <nav className="flex flex-col space-y-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 text-left px-4 py-3 text-xs font-semibold rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-[var(--color-primary)] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {activeTab === 'company' && (
            <Card>
              <CardHeader className="border-b border-[var(--color-border)] p-5">
                <CardTitle className="text-sm">Company Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6 text-xs">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Company Name</Label>
                    <Input defaultValue="DS Projects Private Limited" className="h-10 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Official Portal URL</Label>
                    <Input defaultValue="www.dsprojects.in" className="h-10 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Corporate Email</Label>
                    <Input defaultValue="contact@dsprojects.in" className="h-10 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Contact Phone</Label>
                    <Input defaultValue="+91 861 2345678" className="h-10 text-xs" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Registered Head Office Address</Label>
                  <Input defaultValue="12-4, Nellore, Andhra Pradesh - 524001, India" className="h-10 text-xs" />
                </div>

                <div className="pt-2">
                  <Button size="sm" icon={Save}>Save Company Details</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── LOCATION MASTER TAB ───────────────────────────── */}
          {activeTab === 'locations' && (
            <div className="space-y-4">
              {/* Header Overview Card */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-navy)]">
                      Andhra Pradesh Location Master Database
                    </h3>
                    <p className="text-xs text-gray-600">
                      Official 28-District Administrative Structure · 600+ Verified Mandals
                    </p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-200 self-start sm:self-auto">
                  ✓ Active State Master
                </span>
              </div>

              {/* 2-Column Browser: Districts & Mandals */}
              <div className="grid md:grid-cols-12 gap-4">
                {/* Districts Column */}
                <div className="md:col-span-5 space-y-2">
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search 28 districts..."
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      className="h-8 w-full pl-8 pr-3 text-xs rounded-lg border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>

                  <div className="bg-white rounded-xl border border-[var(--color-border)] divide-y divide-gray-100 max-h-[460px] overflow-y-auto shadow-xs">
                    {filteredDistricts.map((d) => {
                      const isSelected = selectedDistrict?.id === d.id;
                      return (
                        <div
                          key={d.id}
                          onClick={() => setSelectedDistrict(d)}
                          className={`p-3 text-xs cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50/90 text-[var(--color-primary)] font-bold border-l-4 border-[var(--color-primary)]'
                              : 'hover:bg-gray-50 text-gray-800'
                          }`}
                        >
                          <div>
                            <p className="leading-tight">{d.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                              Code: {d.code} · HQ: {d.headquarters}
                            </p>
                          </div>
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-mono font-medium">
                            {d.mandals.length}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mandals Column */}
                <div className="md:col-span-7 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="relative flex-1">
                      <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder={`Search mandals in ${selectedDistrict?.name || 'district'}...`}
                        value={mandalSearch}
                        onChange={(e) => setMandalSearch(e.target.value)}
                        className="h-8 w-full pl-8 pr-3 text-xs rounded-lg border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                      {filteredMandals.length} Mandals
                    </span>
                  </div>

                  <Card className="border border-[var(--color-border)] shadow-xs">
                    <CardHeader className="p-4 border-b border-[var(--color-border)] bg-gray-50/60">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xs font-bold text-[var(--color-navy)]">
                            {selectedDistrict?.name} District Mandals
                          </CardTitle>
                          <p className="text-[11px] text-gray-400 font-mono">
                            Headquarters: {selectedDistrict?.headquarters} · State: Andhra Pradesh
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          Code: {selectedDistrict?.code}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
                        {filteredMandals.map((mandalName, idx) => (
                          <div
                            key={mandalName}
                            className="p-2 rounded-lg bg-gray-50 hover:bg-blue-50/50 border border-gray-100 text-xs transition-colors flex items-center justify-between"
                          >
                            <span className="text-gray-800 font-medium truncate">{mandalName}</span>
                            <span className="text-[9px] font-mono text-gray-400 shrink-0 ml-1">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader className="border-b border-[var(--color-border)] p-5">
                <CardTitle className="text-sm">Authentication & Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-xs">
                <div className="space-y-1.5">
                  <Label className="text-xs">Session Timeout (Minutes)</Label>
                  <Input defaultValue="60" type="number" className="h-10 text-xs max-w-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Admin 2FA Authentication Mode</Label>
                  <Input defaultValue="Email OTP Authentication" readOnly className="h-10 text-xs max-w-xs bg-gray-50" />
                </div>
                <div className="pt-2">
                  <Button size="sm" icon={Save}>Update Security</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader className="border-b border-[var(--color-border)] p-5">
                <CardTitle className="text-sm">Notification Channels</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-900">Email Offer Letter Alerts</p>
                    <p className="text-gray-500 text-[11px]">Send notification on offer generation & acceptance</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-[var(--color-primary)]" />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-900">Daily Work Submission Alerts</p>
                    <p className="text-gray-500 text-[11px]">Notify reporting managers on work submission</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-[var(--color-primary)]" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
