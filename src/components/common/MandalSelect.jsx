import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, Loader2, MapPin, X, AlertCircle } from 'lucide-react';
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
    m.code.toLowerCase().includes(search.toLowerCase())
  );

  const selectedObj = mandals.find(m => m.name === value || m.id === value);

  return (
    <div className={cn('space-y-1.5', className)} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
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
            'flex h-11 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm text-left transition',
            error ? 'border-red-500 ring-1 ring-red-500' : 'border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)]',
            isControlDisabled && 'bg-gray-50 text-gray-400 cursor-not-allowed border-dashed',
            isOpen && 'ring-2 ring-[var(--color-primary)] border-transparent shadow-sm'
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
            {!district ? (
              <span className="text-gray-400 text-xs">Select District First</span>
            ) : loading ? (
              <span className="text-gray-400 text-xs flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" /> Loading mandals...
              </span>
            ) : selectedObj ? (
              <span className="font-medium text-gray-900 truncate">
                {selectedObj.name} <span className="text-xs text-gray-400 font-mono">({selectedObj.code})</span>
              </span>
            ) : (
              <span className="text-gray-400 text-xs">
                {placeholder} ({mandals.length} available)
              </span>
            )}
          </div>
          <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform shrink-0', isOpen && 'rotate-180')} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && !isControlDisabled && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl bg-white border border-[var(--color-border)] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Search Input */}
            <div className="p-2 border-b border-[var(--color-border)] bg-gray-50/70">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search ${mandals.length} mandals in ${district}...`}
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
              {filteredMandals.map((m) => {
                const isSelected = m.name === value || m.id === value;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      onChange(m.name, m);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors',
                      isSelected ? 'bg-blue-50 text-[var(--color-primary)] font-bold' : 'hover:bg-gray-100 text-gray-800'
                    )}
                  >
                    <div>
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-[10px] font-mono text-gray-400">{m.code}</p>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" />}
                  </div>
                );
              })}

              {filteredMandals.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-400">
                  No mandal matching "{search}" in {district}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : !district ? (
        <p className="text-xs text-gray-400">Please choose a district to enable mandal options.</p>
      ) : helper ? (
        <p className="text-xs text-gray-400">{helper}</p>
      ) : null}
    </div>
  );
}
