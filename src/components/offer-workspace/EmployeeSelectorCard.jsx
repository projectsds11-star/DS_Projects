import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Check, X, Shield, Phone, Mail, GraduationCap } from 'lucide-react';
import { cn } from '../../utils/cn';
import StatusBadge from '../onboarding/StatusBadge';

export default function EmployeeSelectorCard({
  employees = [],
  selectedEmployee = null,
  onSelectEmployee,
  error = '',
}) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const filteredEmployees = employees.filter(e =>
    !search ||
    e.fullName.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 sm:p-6 shadow-xs space-y-4" ref={dropdownRef}>
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-navy)] flex items-center gap-2">
            <User className="h-4 w-4 text-[var(--color-primary)]" />
            Candidate Employee Selection *
          </span>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Select a verified candidate from the employee master records.
          </p>
        </div>
        {selectedEmployee && (
          <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            ✓ Verified
          </span>
        )}
      </div>

      {/* Searchable Picker */}
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center justify-between h-11 w-full rounded-xl border bg-gray-50/70 hover:bg-white px-3.5 py-2.5 text-xs cursor-pointer transition',
            error ? 'border-red-500 ring-1 ring-red-500' : 'border-[var(--color-border)] hover:border-blue-400',
            isOpen && 'bg-white ring-2 ring-[var(--color-primary)] border-transparent'
          )}
        >
          <span className={selectedEmployee ? 'font-semibold text-gray-900 truncate' : 'text-gray-400'}>
            {selectedEmployee ? `${selectedEmployee.fullName} (${selectedEmployee.employeeId})` : 'Search & select employee by name or ID...'}
          </span>
          <Search className="h-4 w-4 text-gray-400 shrink-0 ml-2" />
        </div>

        {/* Dropdown Results */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="p-3 border-b border-[var(--color-border)] bg-gray-50/80">
              <input
                type="text"
                placeholder="Type employee name, DS-ID, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full px-3 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                autoFocus
              />
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-gray-50 p-1.5">
              {filteredEmployees.map((emp) => {
                const isSelected = selectedEmployee?.employeeId === emp.employeeId;
                return (
                  <div
                    key={emp.employeeId}
                    onClick={() => {
                      onSelectEmployee(emp);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      'p-3 rounded-xl cursor-pointer transition-colors flex items-center justify-between text-xs',
                      isSelected ? 'bg-blue-50 text-[var(--color-primary)] font-bold' : 'hover:bg-gray-100 text-gray-800'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-lavender)] flex items-center justify-center font-bold text-xs text-[var(--color-navy)] shrink-0">
                        {emp.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold truncate leading-tight">{emp.fullName}</p>
                        <p className="text-[11px] font-mono text-gray-400 truncate mt-0.5">
                          {emp.employeeId} · {emp.email}
                        </p>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-[var(--color-primary)] shrink-0" />}
                  </div>
                );
              })}

              {filteredEmployees.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-400">
                  No matching candidates found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Selected Employee Summary Card */}
      {selectedEmployee && (
        <div className="bg-gray-50/90 rounded-xl p-4 border border-gray-200 space-y-3 text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
            <div className="w-11 h-11 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
              {selectedEmployee.fullName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-gray-900 text-sm truncate">{selectedEmployee.fullName}</h4>
              <p className="text-xs font-mono font-bold text-[var(--color-primary)]">
                {selectedEmployee.employeeId}
              </p>
            </div>
            <StatusBadge status={selectedEmployee.onboardingStatus || 'Pending Offer'} size="sm" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-2 truncate">
              <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{selectedEmployee.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="font-mono">+91 {selectedEmployee.phone ? `${selectedEmployee.phone.substring(0, 5)} XXXXX` : '98765 XXXXX'}</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <GraduationCap className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span>Qualification: {selectedEmployee.qualification || 'Graduate Degree'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
