import React, { useState } from 'react';
import { Clock, LogIn, LogOut, Download, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const HISTORY = [
  { date: 'Mon, Aug 31', checkIn: '09:15 AM', checkOut: '--:--', hours: '4h 30m', status: 'Present' },
  { date: 'Fri, Aug 28', checkIn: '09:05 AM', checkOut: '06:10 PM', hours: '9h 05m', status: 'Present' },
  { date: 'Thu, Aug 27', checkIn: '10:45 AM', checkOut: '05:30 PM', hours: '6h 45m', status: 'Late' },
  { date: 'Wed, Aug 26', checkIn: '--:--', checkOut: '--:--', hours: '-', status: 'Absent' },
  { date: 'Tue, Aug 25', checkIn: '09:00 AM', checkOut: '06:00 PM', hours: '9h 00m', status: 'Present' },
  { date: 'Mon, Aug 24', checkIn: '08:55 AM', checkOut: '05:55 PM', hours: '9h 00m', status: 'Present' },
];

const statusBadge = (s) => {
  if (s === 'Present') return <Badge variant="success">Present</Badge>;
  if (s === 'Late') return <Badge variant="warning">Late In</Badge>;
  return <Badge variant="destructive">Absent</Badge>;
};

export default function EmployeeAttendance() {
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [checkInTime] = useState('09:15 AM');

  const STATS = [
    { label: 'Present Days', value: '22', sub: 'This month', color: 'text-green-600' },
    { label: 'Absent Days', value: '1', sub: 'This month', color: 'text-red-500' },
    { label: 'Late Arrivals', value: '2', sub: 'This month', color: 'text-amber-500' },
    { label: 'Attendance %', value: '91.6%', sub: 'This month', color: 'text-[var(--color-primary)]' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-navy)]">My Attendance</h1>
          <p className="text-[var(--color-text-secondary)]">Track your daily attendance and working hours.</p>
        </div>
        <Button variant="outline" icon={Download}>Export Report</Button>
      </div>

      {/* Check-in Card */}
      <Card className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-navy)] text-white border-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <p className="text-blue-200 text-sm font-medium uppercase tracking-wider">Today's Status</p>
              <p className="text-3xl font-bold mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              {isCheckedIn && (
                <p className="text-blue-200 text-sm mt-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block"></span>
                  Checked in at {checkInTime} · Working: 4h 30m
                </p>
              )}
            </div>
            <div className="shrink-0">
              {isCheckedIn ? (
                <button
                  onClick={() => setIsCheckedIn(false)}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg"
                >
                  <LogOut className="h-5 w-5" />
                  Check Out
                </button>
              ) : (
                <button
                  onClick={() => setIsCheckedIn(true)}
                  className="flex items-center gap-2 bg-white text-[var(--color-primary)] font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg hover:bg-blue-50"
                >
                  <LogIn className="h-5 w-5" />
                  Check In for Today
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {STATS.map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-5 text-center">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm font-medium text-gray-700 mt-1">{stat.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* History Table */}
      <Card>
        <CardHeader className="border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <CardTitle>Attendance History</CardTitle>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select className="text-sm border border-[var(--color-border)] rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                <option>August 2026</option>
                <option>July 2026</option>
                <option>June 2026</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Date</th>
                <th className="px-6 py-3 text-left font-medium">Check In</th>
                <th className="px-6 py-3 text-left font-medium">Check Out</th>
                <th className="px-6 py-3 text-left font-medium">Working Hours</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {HISTORY.map(row => (
                <tr key={row.date} className="border-b border-[var(--color-border)] hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{row.date}</td>
                  <td className={`px-6 py-4 ${row.status === 'Late' ? 'text-amber-600 font-medium' : 'text-gray-600'}`}>{row.checkIn}</td>
                  <td className="px-6 py-4 text-gray-600">{row.checkOut}</td>
                  <td className="px-6 py-4 text-gray-600">{row.hours}</td>
                  <td className="px-6 py-4">{statusBadge(row.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
