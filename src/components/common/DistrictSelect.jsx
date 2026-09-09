import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, Loader2, MapPin, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { locationService } from '../../services/locationService';

export default function DistrictSelect({
  value = '',
  onChange,
  label = 'District',
  required = false,
  error = '',
  disabled = false,
  placeholder = 'Select District...',
  className = '',
  helper = '',
}) {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    locationService.getDistricts().then(list => {
      if (mounted) {
        setDistricts(list);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filteredDistricts = districts.filter(d =>
    !search ||
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.headquarters && d.headquarters.toLowerCase().includes(search.toLowerCase())) ||
    (d.code && d.code.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedObj = districts.find(d => d.name === value || d.id === value);

  return (
    <div className={cn('space-y-1.5 text-left', className)} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 tracking-wide">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Dropdown Trigger Button */}
        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-xl border bg-white px-3.5 py-2.5 text-xs text-left transition shadow-2xs cursor-pointer',
            error
              ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20'
              : 'border-slate-300 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
            disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200 shadow-none',
            isOpen && 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
          )}
        >
          <div className="flex items-center gap-2.5 truncate">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
            {loading ? (
              <span className="text-slate-400 text-xs flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading districts...
              </span>
            ) : selectedObj ? (
              <span className="font-semibold text-slate-900 truncate text-xs sm:text-sm">
                {selectedObj.name}
                <span className="text-xs text-slate-400 font-normal ml-1.5">
                  ({selectedObj.mandalCount || (selectedObj.mandals ? selectedObj.mandals.length : 0)} Mandals)
                </span>
              </span>
            ) : (
              <span className="text-slate-400 text-xs font-normal">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2',
              isOpen && 'rotate-180 text-blue-600'
            )}
          />
        </button>

        {/* Dropdown Menu Popup */}
        {isOpen && !disabled && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Search Input Bar */}
            <div className="p-2.5 border-b border-slate-100 bg-slate-50/80">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search district name or HQ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8.5 w-full pl-8.5 pr-8 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                  autoFocus
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* District List */}
            <div className="max-h-60 overflow-y-auto p-1.5 divide-y divide-slate-50">
              {filteredDistricts.map((d) => {
                const isSelected = d.name === value || d.id === value;
                const mCount = d.mandalCount || (d.mandals ? d.mandals.length : 0);
                return (
                  <div
                    key={d.id || d.name}
                    onClick={() => {
                      onChange(d.name, d);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors select-none',
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'hover:bg-slate-100 text-slate-700'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="truncate font-medium">{d.name}</span>
                      {d.headquarters && d.headquarters !== d.name && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          (HQ: {d.headquarters})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                        {mCount} Mandals
                      </span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredDistricts.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400">
                  No district found matching "{search}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      ) : helper ? (
        <p className="text-xs text-slate-400">{helper}</p>
      ) : null}
    </div>
  );
}
