import React, { useState } from 'react';
import { ClipboardList, Plus, Search, Filter, Check, X, MessageSquare } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const MOCK_WORK = [
  { id: 'W-1001', title: 'Collect farmer survey data', assignee: 'Rahul Kumar (DS-127)', date: 'Aug 31, 2026', priority: 'High', status: 'Submitted' },
  { id: 'W-1002', title: 'Mandal level meeting report', assignee: 'Priya Sharma (DS-002)', date: 'Aug 31, 2026', priority: 'Medium', status: 'Assigned' },
  { id: 'W-1003', title: 'Update village records', assignee: 'Suresh Kumar (DS-003)', date: 'Aug 30, 2026', priority: 'Low', status: 'Approved' },
];

export default function WorkManagement() {
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'assign', 'review'

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'High': return <Badge variant="destructive">High</Badge>;
      case 'Medium': return <Badge variant="warning">Medium</Badge>;
      case 'Low': return <Badge variant="secondary">Low</Badge>;
      default: return <Badge variant="default">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Assigned': return <Badge variant="secondary">Assigned</Badge>;
      case 'In Progress': return <Badge variant="info">In Progress</Badge>;
      case 'Submitted': return <Badge variant="warning">Review Pending</Badge>;
      case 'Approved': return <Badge variant="success">Approved</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-navy)]">Daily Work Management</h1>
          <p className="text-[var(--color-text-secondary)]">Assign tasks and review employee submissions.</p>
        </div>
        <Button icon={Plus} onClick={() => setActiveTab('assign')}>Assign Work</Button>
      </div>

      <div className="flex gap-4 mb-4 border-b border-[var(--color-border)]">
        <button 
          className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'list' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('list')}
        >
          Work Sheets
        </button>
        <button 
          className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'assign' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('assign')}
        >
          Assign Work
        </button>
      </div>

      {activeTab === 'list' && (
        <Card>
          <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between border-b border-[var(--color-border)]">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search work assignments..."
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
                  <th className="px-6 py-4 font-medium">ID & Title</th>
                  <th className="px-6 py-4 font-medium">Assignee</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Priority</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_WORK.map((work) => (
                  <tr key={work.id} className="border-b border-[var(--color-border)] hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--color-text-primary)]">{work.title}</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">{work.id}</div>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-primary)]">{work.assignee}</td>
                    <td className="px-6 py-4 text-[var(--color-text-secondary)]">{work.date}</td>
                    <td className="px-6 py-4">{getPriorityBadge(work.priority)}</td>
                    <td className="px-6 py-4">{getStatusBadge(work.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {work.status === 'Submitted' ? (
                        <Button size="sm" onClick={() => setActiveTab('review')}>Review</Button>
                      ) : (
                        <Button variant="outline" size="sm">View</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'assign' && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-[var(--color-navy)] mb-6">Assign New Work</h3>
            <div className="space-y-6 max-w-2xl">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Employee(s)</label>
                  <select className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                    <option>Select multiple employees...</option>
                    <option>Rahul Kumar (DS-127)</option>
                    <option>Priya Sharma (DS-002)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <input type="date" className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Work Title</label>
                <input type="text" placeholder="Enter work title" className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Work Description</label>
                <textarea rows={4} placeholder="Enter detailed description and instructions..." className="flex w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <select className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setActiveTab('list')}>Cancel</Button>
                <Button icon={Plus}>Assign Work</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'review' && (
        <Card>
          <div className="p-6 border-b border-[var(--color-border)] bg-gray-50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-navy)]">Review Work Submission</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">W-1001: Collect farmer survey data</p>
            </div>
            <Badge variant="warning">Review Pending</Badge>
          </div>
          <CardContent className="p-6 space-y-6 max-w-3xl">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Assignee</p>
                <p className="font-medium">Rahul Kumar (DS-127)</p>
              </div>
              <div>
                <p className="text-gray-500">Submitted On</p>
                <p className="font-medium">Aug 31, 2026 04:30 PM</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800">Employee Progress Report</h4>
              <div className="p-4 bg-blue-50 text-blue-900 rounded-lg text-sm leading-relaxed border border-blue-100">
                Completed survey of 45 farmers in Kavali mandal. The detailed responses are attached in the PDF. Main challenges included network connectivity in remote areas.
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800">Attachments (1)</h4>
              <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg max-w-sm hover:bg-gray-50 cursor-pointer">
                <div className="h-10 w-10 bg-red-100 text-red-600 rounded flex items-center justify-center font-bold">
                  PDF
                </div>
                <div>
                  <p className="text-sm font-medium">farmer_survey_kavali.pdf</p>
                  <p className="text-xs text-gray-500">2.4 MB</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--color-border)] space-y-4">
              <h4 className="font-semibold text-gray-800">Review Actions</h4>
              <textarea rows={3} placeholder="Add comments for the employee (required for requesting changes or rejecting)..." className="flex w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"></textarea>
              
              <div className="flex gap-3">
                <Button className="bg-[var(--color-success)] hover:bg-green-700 text-white" icon={Check}>Approve Work</Button>
                <Button variant="outline" className="text-amber-600 hover:bg-amber-50 hover:text-amber-700" icon={MessageSquare}>Request Changes</Button>
                <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" icon={X}>Reject</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
