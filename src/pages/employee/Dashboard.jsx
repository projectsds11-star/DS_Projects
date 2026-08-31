import React, { useState } from 'react';
import { Play, CheckSquare, Clock, FileText, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export default function EmployeeDashboard() {
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-navy)]">Welcome back, Rahul</h1>
          <p className="text-[var(--color-text-secondary)]">{currentDate}</p>
        </div>
        <div>
          {isCheckedIn ? (
            <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-[var(--color-border)] shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">Checked In</span>
                <span className="text-sm font-bold text-gray-900">09:15 AM</span>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">Working Time</span>
                <span className="text-sm font-bold text-[var(--color-primary)]">04h 20m</span>
              </div>
              <Button variant="danger" size="sm" onClick={() => setIsCheckedIn(false)}>Check Out</Button>
            </div>
          ) : (
            <Button size="lg" className="w-full sm:w-auto" onClick={() => setIsCheckedIn(true)}>
              Check In for Today
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-blue-900">Assigned Work</h3>
              <CheckSquare className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-700">5</p>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50 border-amber-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-amber-900">In Progress</h3>
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-amber-700">2</p>
          </CardContent>
        </Card>
        
        <Card className="bg-indigo-50 border-indigo-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-indigo-900">Submitted</h3>
              <Upload className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-indigo-700">2</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-green-900">Completed</h3>
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-700">1</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-[var(--color-border)]">
              <CardTitle>Today's Assigned Work</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[var(--color-border)]">
                {/* Task 1 */}
                <div className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="destructive">High Priority</Badge>
                        <span className="text-xs text-gray-500">W-1004</span>
                      </div>
                      <h4 className="font-semibold text-[var(--color-navy)] text-lg">Collect farmer survey data - Nellore</h4>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-xl">
                        Visit the designated 5 villages in Kavali mandal and complete the survey forms for at least 50 farmers.
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4"/> Due today, 5:00 PM</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Button icon={Play}>Start Work</Button>
                    </div>
                  </div>
                </div>
                
                {/* Task 2 */}
                <div className="p-6 hover:bg-gray-50 transition-colors bg-gray-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="warning">Medium Priority</Badge>
                        <span className="text-xs text-gray-500">W-1002</span>
                      </div>
                      <h4 className="font-semibold text-[var(--color-navy)] text-lg">Mandal level meeting report</h4>
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-xl">
                        Compile the minutes of the meeting held yesterday with the district coordinator.
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4"/> Due tomorrow</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Button variant="secondary">Continue</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-[var(--color-border)]">
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[var(--color-border)]">
                <div className="p-4 bg-blue-50/50">
                  <div className="flex gap-3">
                    <div className="mt-0.5"><div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div></div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-navy)]">New Work Assigned</p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Admin assigned "Collect farmer survey data" to you.</p>
                      <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5"><div className="w-2 h-2 bg-transparent rounded-full mt-1.5"></div></div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-navy)]">Work Approved</p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Your submission for "Weekly field report" was approved.</p>
                      <p className="text-xs text-gray-400 mt-1">Yesterday</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
