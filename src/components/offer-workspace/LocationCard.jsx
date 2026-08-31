import React from 'react';
import { MapPin, CheckCircle2, ShieldCheck } from 'lucide-react';
import DistrictSelect from '../common/DistrictSelect';
import MandalSelect from '../common/MandalSelect';
import { cn } from '../../utils/cn';

export default function LocationCard({
  district = '',
  mandal = '',
  onDistrictChange,
  onMandalChange,
  districtError = '',
  mandalError = '',
}) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-navy)] flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
            Work Jurisdiction Assignment (Andhra Pradesh) *
          </span>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Assign the official district and reporting mandal from the current 28-district master database.
          </p>
        </div>
        {district && mandal && (
          <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            ✓ Jurisdiction Verified
          </span>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <DistrictSelect
          value={district}
          onChange={(distName) => onDistrictChange(distName)}
          label="Assigned District"
          required
          error={districtError}
          placeholder="Select District (28 Available)..."
        />

        <MandalSelect
          district={district}
          value={mandal}
          onChange={(mandalName) => onMandalChange(mandalName)}
          label="Assigned Mandal"
          required
          error={mandalError}
          placeholder={district ? `Select Mandal in ${district}...` : 'Select District First'}
        />
      </div>

      {/* Spacious Location Summary Banner */}
      {district && mandal && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-[var(--color-navy)] text-sm">
                Reporting Mandal: {mandal} · District: {district}
              </p>
              <p className="text-xs text-gray-500">
                State: Andhra Pradesh · Country: India
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
            Field Operation Unit
          </span>
        </div>
      )}
    </div>
  );
}
