import React, { useState, useEffect } from 'react';
import { 
  User, 
  Edit, 
  Camera, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  Save, 
  X,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Badge } from '../../components/ui/Badge';
import { liveDataService } from '../../services/liveDataService';

export default function EmployeeProfile() {
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentEmpId = localStorage.getItem('ds_current_employee_id') || 'DS-127';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fatherName: '',
    dob: '',
    gender: 'Male',
    bloodGroup: 'O+ Positive',
    maritalStatus: 'Married',
    phone: '',
    altPhone: '',
    email: '',
    personalEmail: '',
    emergencyContact: '',
    emergencyPhone: '',
    address: '',
    permanentAddress: '',
    designation: 'Mandal Co-ordinator',
    department: 'Field Operations',
    district: '',
    mandal: '',
    aadhaar_masked: '•••• •••• ••••',
    pan_masked: '••••••••',
    bank_name: '',
    account_number_masked: '•••• •••• ••••',
    ifsc_code: '',
    branch_name: '',
    status: 'Active'
  });

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const emp = await liveDataService.getEmployeeById(currentEmpId);
        if (emp) {
          const names = (emp.full_name || '').split(' ');
          setFormData({
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || '',
            fatherName: emp.father_name || '',
            dob: emp.date_of_birth || '',
            gender: emp.gender || 'Male',
            bloodGroup: emp.blood_group || 'O+ Positive',
            maritalStatus: emp.marital_status || 'Single',
            phone: emp.phone || '',
            altPhone: emp.emergency_phone || '',
            email: emp.email || '',
            personalEmail: emp.email || '',
            emergencyContact: emp.emergency_contact || '',
            emergencyPhone: emp.emergency_phone || '',
            address: emp.address || '',
            permanentAddress: emp.permanent_address || '',
            designation: emp.designation || 'Mandal Co-ordinator',
            department: emp.department || 'Field Operations',
            district: emp.district || '',
            mandal: emp.mandal || '',
            aadhaar_masked: emp.aadhaar_masked || '•••• •••• ••••',
            pan_masked: emp.pan_masked || '••••••••',
            bank_name: emp.bank_name || 'Bank Account',
            account_number_masked: emp.account_number_masked || '•••• •••• ••••',
            ifsc_code: emp.ifsc_code || '',
            branch_name: emp.branch_name || '',
            status: emp.status || 'Active'
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [currentEmpId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await liveDataService.updateEmployee(currentEmpId, {
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        father_name: formData.fatherName,
        date_of_birth: formData.dob,
        gender: formData.gender,
        blood_group: formData.bloodGroup,
        phone: formData.phone,
        address: formData.address,
      });
      setEditing(false);
      showToast('Profile information successfully saved to live database!');
    } catch (err) {
      showToast('Failed to save profile changes.');
    }
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
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">My Employee Profile</h1>
          <p className="text-sm text-slate-500">Live employee personal record and deployment credentials.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant={editing ? 'outline' : 'default'} 
            size="sm"
            onClick={() => setEditing(!editing)} 
            className={`font-semibold cursor-pointer ${!editing ? 'bg-[#E63946] hover:bg-[#FF6B6B] text-white' : ''}`}
            icon={editing ? X : Edit}
          >
            {editing ? 'Cancel Edit' : 'Edit Details'}
          </Button>
        </div>
      </div>

      {/* Hero Profile Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#E63946] via-[#FF6B6B] to-[#FFDDE0] text-white p-6 sm:p-8 shadow-xl border border-[#E63946]/40">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-3xl sm:text-4xl font-black text-slate-900 shadow-xl ring-4 ring-white/10">
              {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : 'E'}
            </div>
            <button 
              onClick={() => showToast('Select new profile photo to upload')}
              className="absolute -bottom-2 -right-2 p-2 bg-[#E63946] hover:bg-[#00B4D8] text-white rounded-xl shadow-lg transition-transform hover:scale-110 cursor-pointer"
            >
              <Camera size={16} />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {formData.firstName ? `${formData.firstName} ${formData.lastName}` : 'Live Employee Profile'}
              </h2>
              <span className="inline-flex items-center text-xs font-mono font-bold bg-[#00B4D8]/20 text-[#00B4D8] px-3 py-1 rounded-full border border-[#00B4D8]/30">
                {currentEmpId}
              </span>
            </div>

            <p className="text-sm text-slate-300 font-medium">
              {formData.designation} • {formData.department} {formData.mandal ? `(${formData.mandal}, ${formData.district})` : ''}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-5 text-xs text-slate-300">
              {formData.email && (
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-[#00B4D8]" />
                  {formData.email}
                </span>
              )}
              {formData.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-emerald-300" />
                  {formData.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'personal', label: 'Personal Details', icon: User },
          { id: 'contact', label: 'Contact & Addresses', icon: Phone },
          { id: 'deployment', label: 'Job & Location', icon: Briefcase },
          { id: 'kyc', label: 'KYC & Banking', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
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

      {/* Tab Content Cards */}
      <div className="space-y-6">
        {activeTab === 'personal' && (
          <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white">
            <CardHeader className="px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-[#E63946]" />
                Personal Information
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              {editing ? (
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">First Name</Label>
                    <Input 
                      value={formData.firstName} 
                      onChange={e => setFormData({...formData, firstName: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Last Name</Label>
                    <Input 
                      value={formData.lastName} 
                      onChange={e => setFormData({...formData, lastName: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Father's Name</Label>
                    <Input 
                      value={formData.fatherName} 
                      onChange={e => setFormData({...formData, fatherName: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Date of Birth</Label>
                    <Input 
                      type="date" 
                      value={formData.dob} 
                      onChange={e => setFormData({...formData, dob: e.target.value})} 
                    />
                  </div>
                  <div className="md:col-span-2 pt-4 flex justify-end gap-3 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button type="submit" className="bg-[#E63946] text-white" icon={Save}>Save</Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: 'Full Legal Name', value: `${formData.firstName} ${formData.lastName}`.trim() || 'Not provided' },
                    { label: "Father's Name", value: formData.fatherName || 'Not provided' },
                    { label: 'Date of Birth', value: formData.dob || 'Not provided' },
                    { label: 'Gender', value: formData.gender },
                    { label: 'Blood Group', value: formData.bloodGroup },
                  ].map((item) => (
                    <div key={item.label} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.label}</span>
                      <p className="text-sm font-bold text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'contact' && (
          <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white">
            <CardHeader className="px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Phone className="h-5 w-5 text-emerald-600" />
                Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Phone Number</span>
                  <p className="text-sm font-bold text-slate-900">{formData.phone || 'Not provided'}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Official Email</span>
                  <p className="text-sm font-bold text-slate-900">{formData.email || 'Not provided'}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 md:col-span-2">
                  <span className="text-xs font-semibold text-slate-500">Residential Address</span>
                  <p className="text-sm font-medium text-slate-800">{formData.address || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'deployment' && (
          <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white">
            <CardHeader className="px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#E63946]" />
                Deployment Record
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Designation</span>
                  <p className="text-sm font-bold text-slate-900">{formData.designation}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Mandal & District</span>
                  <p className="text-sm font-bold text-slate-900">{formData.mandal || '-'}, {formData.district || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'kyc' && (
          <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white">
            <CardHeader className="px-6 py-5 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                KYC & Banking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500">Aadhaar Card</span>
                  <p className="text-sm font-mono font-bold text-slate-900">{formData.aadhaar_masked}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500">PAN Card</span>
                  <p className="text-sm font-mono font-bold text-slate-900">{formData.pan_masked}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
