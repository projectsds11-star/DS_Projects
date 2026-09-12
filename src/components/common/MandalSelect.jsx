import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, Loader2, MapPin, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { locationService } from '../../services/locationService';

export default function MandalSelect({
  district = '',
  value = '',
  onChange,
  label = 'Mandal',
  required = false,
  error = '',
  disabled = false,
  placeholder = 'Select Mandal...',
  className = '',
  helper = '',
}) {
  const [mandals, setMandals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // When district changes, fetch that district's mandals and clear invalid selection
  useEffect(() => {
    let mounted = true;
    if (!district) {
      setMandals([]);
      return;
    }

    setLoading(true);
    locationService.getMandalsByDistrict(district).then(list => {
      if (mounted) {
        setMandals(list);
        setLoading(false);
        // If current value is not in the new district's mandals, clear it
        if (value && !list.some(m => m.name === value || m.id === value)) {
          onChange('');
        }
      }
    });

    return () => { mounted = false; };
  }, [district]);

  // Outside click to close
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const isControlDisabled = disabled || !district || loading;

  const filteredMandals = mandals.filter(m =>
    !search ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.code && m.code.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedObj = mandals.find(m => m.name === value || m.id === value);

  return (
    <div className={cn('space-y-1.5 text-left', className)} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 tracking-wide">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={isControlDisabled}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex h-12 w-full items-center justify-between rounded-xl border bg-gray-50/80 hover:bg-white px-3.5 py-2.5 text-xs text-left transition shadow-2xs cursor-pointer min-w-0',
            error
              ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20'
              : 'border-[var(--color-border)] hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]',
            isControlDisabled && 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200 border-dashed shadow-none',
            isOpen && 'bg-white ring-2 ring-[var(--color-primary)] border-transparent'
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
              selectedObj ? 'bg-blue-100 text-[var(--color-primary)]' : 'bg-gray-200 text-gray-500'
            )}>
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 truncate">
              {!district ? (
                <span className="text-gray-400 text-xs truncate">Select District First</span>
              ) : loading ? (
                <span className="text-gray-400 text-xs flex items-center gap-1.5 truncate">
                  <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" /> Loading mandals...
                </span>
              ) : selectedObj ? (
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-bold text-gray-900 truncate text-xs sm:text-sm">
                    {selectedObj.name}
                  </span>
                  {selectedObj.code && (
                    <span className="text-xs text-gray-500 font-mono font-normal shrink-0">
                      ({selectedObj.code})
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-gray-400 text-xs font-normal truncate">
                  {placeholder} ({mandals.length} available)
                </span>
              )}
            </div>
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-gray-400 transition-transform duration-200 shrink-0 ml-2',
              isOpen && 'rotate-180 text-[var(--color-primary)]'
            )}
          />
        </button>

        {/* Dropdown Menu Popup */}
        {isOpen && !isControlDisabled && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Search Input Bar */}
            <div className="p-2.5 border-b border-slate-100 bg-slate-50/80">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search ${mandals.length} mandals in ${district}...`}
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

            {/* Mandal List */}
            <div className="max-h-60 overflow-y-auto p-1.5 divide-y divide-slate-50">
              {filteredMandals.map((m) => {
                const isSelected = m.name === value || m.id === value;
                return (
                  <div
                    key={m.id || m.name}
                    onClick={() => {
                      onChange(m.name, m);
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
                    <span className="font-medium truncate">{m.name}</span>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {m.code}
                      </span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredMandals.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400">
                  No mandal found matching "{search}" in {district}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      ) : !district ? (
        <p className="text-xs text-slate-400">Please choose a district first.</p>
      ) : helper ? (
        <p className="text-xs text-slate-400">{helper}</p>
      ) : null}
    </div>
  );
}
