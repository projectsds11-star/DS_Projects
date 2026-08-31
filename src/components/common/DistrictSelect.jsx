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
    d.headquarters.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  const selectedObj = districts.find(d => d.name === value || d.id === value);

  return (
    <div className={cn('space-y-1.5', className)} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
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
            'flex h-11 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm text-left transition',
            error ? 'border-red-500 ring-1 ring-red-500' : 'border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)]',
            disabled && 'bg-gray-50 text-gray-400 cursor-not-allowed',
            isOpen && 'ring-2 ring-[var(--color-primary)] border-transparent shadow-sm'
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
            {loading ? (
              <span className="text-gray-400 text-xs flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" /> Loading 28 districts...
              </span>
            ) : selectedObj ? (
              <span className="font-medium text-gray-900 truncate">
                {selectedObj.name} <span className="text-xs text-gray-400 font-normal">({selectedObj.mandalCount} mandals)</span>
              </span>
            ) : (
              <span className="text-gray-400 text-xs">{placeholder}</span>
            )}
          </div>
          <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform shrink-0', isOpen && 'rotate-180')} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && !disabled && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl bg-white border border-[var(--color-border)] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Search Input */}
            <div className="p-2 border-b border-[var(--color-border)] bg-gray-50/70">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search district or headquarters..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-full pl-8 pr-7 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  autoFocus
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-56 overflow-y-auto p-1 divide-y divide-gray-50">
              {filteredDistricts.map((d) => {
                const isSelected = d.name === value || d.id === value;
                return (
                  <div
                    key={d.id}
                    onClick={() => {
                      onChange(d.name, d);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors',
                      isSelected ? 'bg-blue-50 text-[var(--color-primary)] font-bold' : 'hover:bg-gray-100 text-gray-800'
                    )}
                  >
                    <div>
                      <p className="font-semibold leading-tight">{d.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        HQ: {d.headquarters} · {d.mandalCount} Mandals
                      </p>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" />}
                  </div>
                );
              })}

              {filteredDistricts.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-400">
                  No district matching "{search}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : helper ? (
        <p className="text-xs text-gray-400">{helper}</p>
      ) : null}
    </div>
  );
}
