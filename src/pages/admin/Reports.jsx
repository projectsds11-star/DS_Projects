import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, ClipboardCheck, Download, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const DISTRICT_DATA = [
  { district: 'Nellore', employees: 412, present: 380, work_completed: 95, attendance_pct: 92 },
  { district: 'Guntur', employees: 298, present: 265, work_completed: 78, attendance_pct: 89 },
  { district: 'Krishna', employees: 188, present: 158, work_completed: 52, attendance_pct: 84 },
  { district: 'Prakasam', employees: 145, present: 130, work_completed: 41, attendance_pct: 90 },
  { district: 'Chittoor', employees: 205, present: 187, work_completed: 68, attendance_pct: 91 },
];

export default function Reports() {
  const [period, setPeriod] = useState('monthly');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-navy)]">Reports & Analytics</h1>
          <p className="text-[var(--color-text-secondary)]">Workforce performance at a glance.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {['daily', 'weekly', 'monthly'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${period === p ? 'bg-white shadow text-[var(--color-primary)]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <Button variant="outline" icon={Download}>Export</Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Employees', value: '1,248', icon: Users, color: 'blue', change: '+12 this month' },
          { label: 'Avg Attendance', value: '89.2%', icon: Calendar, color: 'green', change: '+2.1% vs last month' },
          { label: 'Tasks Completed', value: '3,841', icon: ClipboardCheck, color: 'purple', change: '87% completion rate' },
          { label: 'Growth Rate', value: '4.3%', icon: TrendingUp, color: 'amber', change: 'vs 3.1% last period' },
        ].map(({ label, value, icon: Icon, color, change }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-${color}-100`}>
                  <Icon className={`h-4 w-4 text-${color}-600`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--color-navy)]">{value}</p>
              <p className="text-xs text-green-600 mt-1 font-medium">{change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* District-wise breakdown */}
      <Card>
        <CardHeader className="border-b border-[var(--color-border)]">
          <CardTitle>District-wise Performance</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-3 text-left font-medium">District</th>
                <th className="px-6 py-3 text-left font-medium">Total Staff</th>
                <th className="px-6 py-3 text-left font-medium">Present Today</th>
                <th className="px-6 py-3 text-left font-medium">Tasks Done</th>
                <th className="px-6 py-3 text-left font-medium">Attendance %</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {DISTRICT_DATA.map(row => (
                <tr key={row.district} className="border-b border-[var(--color-border)] hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-[var(--color-navy)]">{row.district}</td>
                  <td className="px-6 py-4 text-gray-700">{row.employees}</td>
                  <td className="px-6 py-4 text-gray-700">{row.present}</td>
                  <td className="px-6 py-4 text-gray-700">{row.work_completed}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 w-24">
                        <div className="bg-[var(--color-primary)] h-1.5 rounded-full" style={{ width: `${row.attendance_pct}%` }} />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{row.attendance_pct}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {row.attendance_pct >= 90 ? (
                      <Badge variant="success">Excellent</Badge>
                    ) : row.attendance_pct >= 85 ? (
                      <Badge variant="warning">Good</Badge>
                    ) : (
                      <Badge variant="destructive">Needs Attention</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Work Summary */}
      <Card>
        <CardHeader className="border-b border-[var(--color-border)]">
          <CardTitle>Work Assignment Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { label: 'Assigned', count: 4421, color: 'bg-blue-500' },
              { label: 'In Progress', count: 1187, color: 'bg-amber-500' },
              { label: 'Submitted', count: 892, color: 'bg-purple-500' },
              { label: 'Approved', count: 2951, color: 'bg-green-500' },
            ].map(item => (
              <div key={item.label} className="text-center p-4 bg-gray-50 rounded-xl">
                <div className={`w-3 h-3 rounded-full ${item.color} mx-auto mb-2`} />
                <p className="text-2xl font-bold text-[var(--color-navy)]">{item.count.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
