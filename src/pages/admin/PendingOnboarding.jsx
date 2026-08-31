import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ArrowRight, UserPlus, Clock, ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import StatusBadge from '../../components/onboarding/StatusBadge';
import { onboardingService } from '../../services/onboardingService';

export default function PendingOnboarding() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await onboardingService.getPendingEmployees(search, district);
        setEmployees(list);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search, district]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/admin/onboarding')}
            className="mt-1 p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <nav className="flex items-center gap-1 text-xs text-gray-400 mb-1">
              <Link to="/admin/onboarding" className="hover:text-[var(--color-primary)] transition-colors">Onboarding</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-600 font-medium">Pending Onboarding</span>
            </nav>
            <h1 className="text-xl font-bold text-[var(--color-navy)]">Pending Onboarding Candidates</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Employees registered in DS Projects who are awaiting job position allocation & offer letters.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          icon={UserPlus}
          onClick={() => navigate('/admin/employees/add')}
        >
          Add New Employee
        </Button>
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate name, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full pl-9 pr-3 text-xs rounded-lg border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="h-9 px-3 text-xs rounded-lg border border-[var(--color-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] w-full sm:w-auto"
            >
              <option value="">All Districts</option>
              <option value="Nellore">Nellore</option>
              <option value="Guntur">Guntur</option>
              <option value="Krishna">Krishna</option>
              <option value="Prakasam">Prakasam</option>
              <option value="Chittoor">Chittoor</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Grid Cards of Pending Candidates */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {employees.map((emp) => (
          <Card key={emp.employeeId} className="border border-[var(--color-border)] hover:border-blue-300 transition-all shadow-xs">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[var(--color-lavender)] flex items-center justify-center font-bold text-sm text-[var(--color-navy)] shrink-0">
                    {emp.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 leading-tight">{emp.fullName}</h3>
                    <p className="text-xs font-mono font-bold text-[var(--color-primary)]">{emp.employeeId}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{emp.qualification || 'Graduate'}</p>
                  </div>
                </div>
                <StatusBadge status="Pending Offer" size="sm" />
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="font-medium text-gray-800 truncate max-w-[170px]">{emp.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone:</span>
                  <span className="font-mono text-gray-800">+91 {emp.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span className="text-gray-800">{emp.district || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Registered:</span>
                  <span className="text-gray-800">{emp.createdDate}</span>
                </div>
              </div>

              <Button
                className="w-full justify-center"
                size="sm"
                icon={ArrowRight}
                onClick={() => navigate(`/admin/onboarding/create?employeeId=${emp.employeeId}`)}
              >
                Create Job Offer
              </Button>
            </CardContent>
          </Card>
        ))}

        {employees.length === 0 && !loading && (
          <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <Clock className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-gray-700">No Pending Onboarding Candidates</h3>
            <p className="text-xs text-gray-400 mt-1">All registered employees have active offer letters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
