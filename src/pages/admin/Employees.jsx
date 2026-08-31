import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, MoreHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';

const MOCK_EMPLOYEES = [
  { id: 'DS-001', name: 'Rahul Kumar', email: 'rahul@example.com', phone: '+91 9876543210', job: 'District Co-ordinator', district: 'Nellore', mandal: '-', status: 'Active' },
  { id: 'DS-002', name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 9876543211', job: 'Mandal Co-ordinator', district: 'Nellore', mandal: 'Kavali', status: 'Active' },
  { id: 'DS-003', name: 'Suresh Kumar', email: 'suresh@example.com', phone: '+91 9876543212', job: 'Z-Assencer', district: 'Guntur', mandal: 'Tenali', status: 'Onboarding' },
  { id: 'DS-004', name: 'Anita Reddy', email: 'anita@example.com', phone: '+91 9876543213', job: 'Facilator', district: 'Krishna', mandal: 'Vijayawada', status: 'Draft' },
  { id: 'DS-005', name: 'Venkatesh Rao', email: 'venkat@example.com', phone: '+91 9876543214', job: 'Office Staff', district: 'Hyderabad', mandal: 'Ameerpet', status: 'Inactive' },
];

export default function Employees() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = MOCK_EMPLOYEES.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active': return <Badge variant="success">Active</Badge>;
      case 'Onboarding': return <Badge variant="warning">Onboarding</Badge>;
      case 'Draft': return <Badge variant="secondary">Draft</Badge>;
      case 'Inactive': return <Badge variant="destructive">Inactive</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-navy)]">Employees</h1>
          <p className="text-[var(--color-text-secondary)]">Manage your workforce and view employee details.</p>
        </div>
        <Button onClick={() => navigate('/admin/employees/add')} icon={Plus}>
          Add Employee
        </Button>
      </div>

      <Card>
        <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between border-b border-[var(--color-border)]">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-transparent"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" icon={Filter}>Filter</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--color-text-secondary)] uppercase bg-gray-50 border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Job Position</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="border-b border-[var(--color-border)] hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[var(--color-lavender)] flex items-center justify-center text-[var(--color-navy)] font-semibold">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-[var(--color-text-primary)]">{emp.name}</div>
                          <div className="text-xs text-[var(--color-text-secondary)]">{emp.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[var(--color-text-primary)]">{emp.phone}</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">{emp.email}</div>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-primary)]">{emp.job}</td>
                    <td className="px-6 py-4">
                      <div className="text-[var(--color-text-primary)]">{emp.district}</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">{emp.mandal}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(emp.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 text-gray-500 hover:text-[var(--color-primary)] transition-colors rounded">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-secondary)]">
                    No employees found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-[var(--color-border)] flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
          <div>Showing {filteredEmployees.length} of {MOCK_EMPLOYEES.length} results</div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>
      
      {/* Mobile Card View (visible only on small screens) */}
      <div className="sm:hidden space-y-4">
         {/* For a real implementation, we would hide the table above on mobile and show these cards instead */}
         {/* This is simulated here by the responsive classes in a real production build */}
      </div>
    </div>
  );
}
