import React, { useState } from 'react';
import { Play, Upload, CheckCircle, Clock, AlertCircle, Paperclip, X, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const WORK_ITEMS = [
  {
    id: 'W-1004', title: 'Collect farmer survey data – Nellore', description: 'Visit the designated 5 villages in Kavali mandal and complete the survey forms for at least 50 farmers. Attach filled forms or a PDF scan.', priority: 'High', due: 'Today, 5:00 PM', status: 'Assigned',
  },
  {
    id: 'W-1002', title: 'Mandal level meeting report', description: 'Compile the minutes of the meeting held yesterday with the district coordinator. Include action items and sign-off list.', priority: 'Medium', due: 'Tomorrow', status: 'In Progress',
  },
  {
    id: 'W-1001', title: 'Weekly field report – Week 34', description: 'Consolidate the week\'s field activities and submit the weekly field summary report.', priority: 'Low', due: 'Aug 28, 2026', status: 'Approved',
  },
];

const priorityBadge = (p) => {
  if (p === 'High') return <Badge variant="destructive">High</Badge>;
  if (p === 'Medium') return <Badge variant="warning">Medium</Badge>;
  return <Badge variant="secondary">Low</Badge>;
};

const statusIcon = (s) => {
  if (s === 'Approved') return <CheckCircle className="h-5 w-5 text-green-500" />;
  if (s === 'In Progress') return <Clock className="h-5 w-5 text-amber-500" />;
  if (s === 'Submitted') return <Upload className="h-5 w-5 text-blue-500" />;
  return <AlertCircle className="h-5 w-5 text-gray-400" />;
};

export default function MyWork() {
  const [selected, setSelected] = useState(null);
  const [report, setReport] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const FILTERS = ['All', 'Assigned', 'In Progress', 'Submitted', 'Approved'];

  const filtered = activeFilter === 'All' ? WORK_ITEMS : WORK_ITEMS.filter(w => w.status === activeFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-navy)]">My Work</h1>
        <p className="text-[var(--color-text-secondary)]">View assigned tasks and submit your daily work reports.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeFilter === f ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Work list */}
        <div className="lg:w-2/5 space-y-3">
          {filtered.map(work => (
            <button
              key={work.id}
              onClick={() => setSelected(work)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${selected?.id === work.id ? 'border-[var(--color-primary)] bg-blue-50 shadow-sm' : 'border-[var(--color-border)] bg-white hover:bg-gray-50'}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{statusIcon(work.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm text-[var(--color-navy)] truncate">{work.title}</p>
                    {priorityBadge(work.priority)}
                  </div>
                  <p className="text-xs text-gray-500">Due: {work.due}</p>
                </div>
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <CheckCircle className="h-10 w-10 mx-auto mb-2 text-gray-200" />
              <p>No tasks in this category</p>
            </div>
          )}
        </div>

        {/* Work Detail / Submission Panel */}
        <div className="lg:w-3/5">
          {selected ? (
            <Card>
              <CardHeader className="border-b border-[var(--color-border)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 font-mono">{selected.id}</span>
                      {priorityBadge(selected.priority)}
                    </div>
                    <CardTitle className="text-lg">{selected.title}</CardTitle>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Task Description</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{selected.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Due Date</p>
                    <p className="font-medium text-gray-800">{selected.due}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Current Status</p>
                    <p className="font-medium text-gray-800">{selected.status}</p>
                  </div>
                </div>

                {selected.status !== 'Approved' && (
                  <>
                    <div className="border-t border-[var(--color-border)] pt-5 space-y-4">
                      <h4 className="text-sm font-semibold text-gray-800">Submit Work Report</h4>
                      <textarea
                        rows={4}
                        value={report}
                        onChange={e => setReport(e.target.value)}
                        placeholder="Describe what you completed, challenges faced, and outcome..."
                        className="flex w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-600 transition-colors">
                          <Paperclip className="h-4 w-4" />
                          Attach files (PDF, images)
                          <input type="file" className="hidden" multiple />
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {selected.status === 'Assigned' && (
                        <Button variant="outline" icon={Play}>Mark as In Progress</Button>
                      )}
                      <Button icon={Send} disabled={!report}>Submit Report</Button>
                    </div>
                  </>
                )}

                {selected.status === 'Approved' && (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                    <p className="text-sm text-green-700 font-medium">This work has been reviewed and approved by the admin.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-full min-h-64 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
              <div className="text-center">
                <Play className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Select a task</p>
                <p className="text-gray-400 text-sm">to view details and submit your report</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
