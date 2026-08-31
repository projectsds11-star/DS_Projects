import React from 'react';
import { MapPin, Building2, CheckCircle2 } from 'lucide-react';
import DistrictSelect from './DistrictSelect';
import MandalSelect from './MandalSelect';
import { cn } from '../../utils/cn';

export default function LocationSelector({
  stateValue = 'Andhra Pradesh',
  districtValue = '',
  mandalValue = '',
  onDistrictChange,
  onMandalChange,
  districtError = '',
  mandalError = '',
  required = true,
  showJurisdictionBadge = true,
  layout = 'grid', // 'grid' | 'stack'
  className = '',
}) {
  const handleDistrictChange = (districtName, districtObj) => {
    if (onDistrictChange) {
      onDistrictChange(districtName, districtObj);
    }
  };

  const handleMandalChange = (mandalName, mandalObj) => {
    if (onMandalChange) {
      onMandalChange(mandalName, mandalObj);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className={cn(
        layout === 'grid' ? 'grid sm:grid-cols-2 gap-4' : 'space-y-4'
      )}>
        {/* District Select */}
        <DistrictSelect
          value={districtValue}
          onChange={handleDistrictChange}
          label="District"
          required={required}
          error={districtError}
          helper="Select from 28 Andhra Pradesh districts."
        />

        {/* Mandal Select */}
        <MandalSelect
          district={districtValue}
          value={mandalValue}
          onChange={handleMandalChange}
          label="Mandal"
          required={required}
          error={mandalError}
        />
      </div>

      {/* Real-time Location Jurisdiction Preview Badge */}
      {showJurisdictionBadge && districtValue && mandalValue && (
        <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-[var(--color-navy)]">
                Assigned Jurisdiction: {mandalValue}, {districtValue}
              </p>
              <p className="text-[11px] text-gray-500">
                State: Andhra Pradesh · Country: India
              </p>
            </div>
          </div>
          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 shrink-0">
            ✓ Verified AP Location
          </span>
        </div>
      )}
    </div>
  );
}
