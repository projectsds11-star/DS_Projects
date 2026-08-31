import React from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export default function Attendance() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-navy)]">Attendance Monitor</h1>
          <p className="text-[var(--color-text-secondary)]">View and export daily employee attendance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={Download}>Export CSV</Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--color-border)]">
          <p className="text-sm text-gray-500 font-medium">Present Today</p>
          <p className="text-2xl font-bold text-green-600">1,120</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--color-border)]">
          <p className="text-sm text-gray-500 font-medium">Late In</p>
          <p className="text-2xl font-bold text-amber-500">45</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--color-border)]">
          <p className="text-sm text-gray-500 font-medium">On Leave</p>
          <p className="text-2xl font-bold text-blue-500">32</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--color-border)]">
          <p className="text-sm text-gray-500 font-medium">Absent</p>
          <p className="text-2xl font-bold text-red-500">51</p>
        </div>
      </div>

      <Card>
        <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between border-b border-[var(--color-border)]">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-transparent"
            />
          </div>
          <div className="flex gap-2">
            <input type="date" className="h-10 border border-[var(--color-border)] rounded-md px-3 text-sm" defaultValue={new Date().toISOString().split('T')[0]} />
            <Button variant="outline" icon={Filter}>Filter</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--color-text-secondary)] uppercase bg-gray-50 border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Check In</th>
                <th className="px-6 py-4 font-medium">Check Out</th>
                <th className="px-6 py-4 font-medium">Working Hours</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--color-border)] hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-[var(--color-text-primary)]">Rahul Kumar</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">DS-127</div>
                </td>
                <td className="px-6 py-4">09:15 AM</td>
                <td className="px-6 py-4">--:--</td>
                <td className="px-6 py-4">4h 15m (Active)</td>
                <td className="px-6 py-4"><Badge variant="success">Present</Badge></td>
              </tr>
              <tr className="border-b border-[var(--color-border)] hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-[var(--color-text-primary)]">Priya Sharma</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">DS-002</div>
                </td>
                <td className="px-6 py-4 text-amber-600">10:45 AM</td>
                <td className="px-6 py-4">--:--</td>
                <td className="px-6 py-4">2h 45m (Active)</td>
                <td className="px-6 py-4"><Badge variant="warning">Late In</Badge></td>
              </tr>
              <tr className="border-b border-[var(--color-border)] hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-[var(--color-text-primary)]">Suresh Kumar</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">DS-003</div>
                </td>
                <td className="px-6 py-4">--:--</td>
                <td className="px-6 py-4">--:--</td>
                <td className="px-6 py-4">-</td>
                <td className="px-6 py-4"><Badge variant="destructive">Absent</Badge></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
