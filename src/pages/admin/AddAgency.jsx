import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  User,
  ShieldCheck,
  FileText,
  Loader2,
  Sparkles,
  Info
} from 'lucide-react';
import { agencyService } from '../../services/agencyService';
import { locationService } from '../../services/locationService';
import { AP_DISTRICTS_DATA } from '../../data/andhraPradeshMasterData';

export default function AddAgency() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // Form State
  const [formData, setFormData] = useState({
    agency_code: '',
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    state_id: 'AP-STATE-01',
    state_name: 'Andhra Pradesh',
    district_id: '',
    district_name: '',
    mandal_id: '',
    mandal_name: '',
    address: '',
    pincode: '',
    status: 'active',
    notes: ''
  });

  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Initialize districts and initial agency code or edit data
  useEffect(() => {
    async function init() {
      const distList = locationService.getDistrictsSync();
      setDistricts(distList);

      if (isEdit) {
        setLoading(true);
        try {
          const agency = await agencyService.getAgencyById(id);
          if (agency) {
            setFormData({
              agency_code: agency.agency_code || '',
              name: agency.name || '',
              contact_person: agency.contact_person || '',
              phone: agency.phone || '',
              email: agency.email || '',
              state_id: agency.state_id || 'AP-STATE-01',
              state_name: agency.state_name || 'Andhra Pradesh',
              district_id: agency.district_id || '',
              district_name: agency.district_name || '',
              mandal_id: agency.mandal_id || '',
              mandal_name: agency.mandal_name || '',
              address: agency.address || '',
              pincode: agency.pincode || '',
              status: agency.status || 'active',
              notes: agency.notes || ''
            });

            // Load mandals for existing district
            if (agency.district_name) {
              const mList = locationService.getMandalsSync(agency.district_name);
              setMandals(mList);
            }
          } else {
            setServerError('Agency record not found.');
          }
        } catch (err) {
          console.error('Error fetching agency:', err);
          setServerError('Failed to load agency details.');
        } finally {
          setLoading(false);
        }
      } else {
        // Generate next agency code preview
        try {
          const nextCode = await agencyService.getNextAgencyCode();
          setFormData((prev) => ({ ...prev, agency_code: nextCode }));
        } catch (e) {
          setFormData((prev) => ({ ...prev, agency_code: 'AG-001' }));
        }
      }
    }

    init();
  }, [id, isEdit]);

  // Handle District Change
  const handleDistrictChange = (e) => {
    const distName = e.target.value;
    const distObj = districts.find((d) => d.name === distName);

    const mList = distName ? locationService.getMandalsSync(distName) : [];
    setMandals(mList);

    setFormData((prev) => ({
      ...prev,
      district_name: distName,
      district_id: distObj ? distObj.id : '',
      mandal_name: '', // reset mandal
      mandal_id: ''
    }));

    if (errors.district_name) {
      setErrors((prev) => ({ ...prev, district_name: null }));
    }
  };

  // Handle Mandal Change
  const handleMandalChange = (e) => {
    const mandalName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      mandal_name: mandalName,
      mandal_id: mandalName ? `AP-MANDAL-${mandalName}` : ''
    }));

    if (errors.mandal_name) {
      setErrors((prev) => ({ ...prev, mandal_name: null }));
    }
  };

  // Generic Field Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Agency name is required.';
    }

    if (!formData.contact_person.trim()) {
      newErrors.contact_person = 'Contact person name is required.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^[0-9+\s-]{10,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Enter a valid 10-digit phone number.';
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (!formData.district_name) {
      newErrors.district_name = 'Please select an operating district.';
    }

    if (!formData.mandal_name) {
      newErrors.mandal_name = 'Please select an operational mandal.';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Full office or physical address is required.';
    }

    if (formData.pincode && !/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'PIN code must be a 6-digit number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    setServerError('');

    try {
      if (isEdit) {
        await agencyService.updateAgency(id, formData);
      } else {
        await agencyService.createAgency(formData);
      }

      setShowSuccessToast(true);
      setTimeout(() => {
        navigate('/admin/agencies');
      }, 1000);
    } catch (err) {
      console.error('Save agency error:', err);
      setServerError(err.message || 'Failed to save agency record. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center shadow-xs">
        <Loader2 className="w-8 h-8 text-[#E63946] animate-spin mx-auto mb-3" />
        <h3 className="font-bold text-slate-800">Loading Agency Details...</h3>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* ── Breadcrumb & Top Bar ───────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/admin/agencies')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Agencies</span>
        </button>

        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-lg border border-slate-200">
          Node ID: {formData.agency_code || 'AG-AUTO'}
        </span>
      </div>

      {/* ── Header Card ────────────────────────────────────────── */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#E63946] via-rose-500 to-amber-500" />
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E63946] shrink-0 shadow-xs">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isEdit ? 'Edit Agency Partner' : 'Register New Partner Agency'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isEdit
                ? 'Update agency organizational credentials, territorial jurisdiction, and contact leads.'
                : 'Enter agency details to register an authorized partner node in the DS Projects network.'}
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {serverError && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Error saving agency record</p>
              <p>{serverError}</p>
            </div>
          </div>
        )}

        {/* Success Toast Banner */}
        {showSuccessToast && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs sm:text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold">
                {isEdit ? 'Agency updated successfully!' : 'Agency registered successfully!'}
              </p>
              <p className="text-xs text-emerald-700">Redirecting to Agencies directory...</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Registration Form ──────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Agency Identification */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-[#E63946]" />
            <h2 className="text-base font-bold text-slate-900">Agency Identification & Status</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Agency Name */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Agency Name</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Apex Tech Solutions & Operations"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? 'border-rose-300 bg-rose-50/40 focus:ring-rose-200 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white focus:ring-[#E63946]/20 focus:border-[#E63946]'
                }`}
              />
              {errors.name && <p className="text-xs text-rose-500 font-medium">{errors.name}</p>}
            </div>

            {/* Operational Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Operational Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] transition-all cursor-pointer"
              >
                <option value="active">Active (Verified)</option>
                <option value="inactive">Inactive (Suspended)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Person & Communication */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Lead Contact & Communication</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Contact Person */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Contact Person / Lead</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Varma"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.contact_person
                      ? 'border-rose-300 bg-rose-50/40 focus:ring-rose-200 focus:border-rose-500'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.contact_person && (
                <p className="text-xs text-rose-500 font-medium">{errors.contact_person}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Primary Contact Phone</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.phone
                      ? 'border-rose-300 bg-rose-50/40 focus:ring-rose-200 focus:border-rose-500'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-xs text-rose-500 font-medium">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Official Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="agency@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-rose-300 bg-rose-50/40 focus:ring-rose-200 focus:border-rose-500'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-500 font-medium">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Section 3: Operating Jurisdiction & Mandals */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Operating Jurisdiction (Andhra Pradesh)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* State */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">State</label>
              <input
                type="text"
                disabled
                value="Andhra Pradesh"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-600 cursor-not-allowed"
              />
            </div>

            {/* District */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Assigned District</span>
                <span className="text-rose-500">*</span>
              </label>
              <select
                name="district_name"
                value={formData.district_name}
                onChange={handleDistrictChange}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                  errors.district_name
                    ? 'border-rose-300 bg-rose-50/40 focus:ring-rose-200 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white focus:ring-emerald-500/20 focus:border-emerald-500'
                }`}
              >
                <option value="">Select District</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.district_name && (
                <p className="text-xs text-rose-500 font-medium">{errors.district_name}</p>
              )}
            </div>

            {/* Mandal */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Assigned Mandal</span>
                <span className="text-rose-500">*</span>
              </label>
              <select
                name="mandal_name"
                value={formData.mandal_name}
                onChange={handleMandalChange}
                disabled={!formData.district_name}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                  !formData.district_name ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'cursor-pointer'
                } ${
                  errors.mandal_name
                    ? 'border-rose-300 bg-rose-50/40 focus:ring-rose-200 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white focus:ring-emerald-500/20 focus:border-emerald-500'
                }`}
              >
                <option value="">
                  {formData.district_name ? 'Select Mandal' : 'Select District First'}
                </option>
                {mandals.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {errors.mandal_name && (
                <p className="text-xs text-rose-500 font-medium">{errors.mandal_name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Address & Location */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">Physical Office & Postal Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            {/* Full Address */}
            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Building / Street / Full Address</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. D.No 40-1-28, MG Road, Benz Circle"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.address
                    ? 'border-rose-300 bg-rose-50/40 focus:ring-rose-200 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white focus:ring-amber-500/20 focus:border-amber-500'
                }`}
              />
              {errors.address && (
                <p className="text-xs text-rose-500 font-medium">{errors.address}</p>
              )}
            </div>

            {/* PIN Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Postal PIN Code</label>
              <input
                type="text"
                name="pincode"
                maxLength={6}
                value={formData.pincode}
                onChange={handleChange}
                placeholder="6 digits (e.g. 520010)"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.pincode
                    ? 'border-rose-300 bg-rose-50/40 focus:ring-rose-200 focus:border-rose-500'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white focus:ring-amber-500/20 focus:border-amber-500'
                }`}
              />
              {errors.pincode && (
                <p className="text-xs text-rose-500 font-medium">{errors.pincode}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Scope & Operational Notes */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Operational Scope & Responsibilities (Optional)
            </h2>
          </div>

          <div className="space-y-1.5">
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Provide context regarding partner responsibilities, verified staff count, MoU references, or key deliverables..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] transition-all"
            />
          </div>
        </div>

        {/* ── Form Actions Footer ────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/agencies')}
            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white font-bold text-sm shadow-md shadow-[#E63946]/25 hover:shadow-lg hover:shadow-[#E63946]/35 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isEdit ? 'Updating Agency...' : 'Registering Agency...'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEdit ? 'Update Agency' : 'Register Agency'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
