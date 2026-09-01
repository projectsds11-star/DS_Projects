import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Paperclip, 
  X, 
  Send, 
  Search, 
  MapPin, 
  FileText, 
  Check, 
  Inbox
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { liveDataService } from '../../services/liveDataService';

export default function MyWork() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [reportText, setReportText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentEmpId = localStorage.getItem('ds_current_employee_id') || 'DS-127';

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      try {
        const liveTasks = await liveDataService.getWorkTasks(currentEmpId);
        setTasks(liveTasks || []);
        if (liveTasks && liveTasks.length > 0) {
          setSelectedTask(liveTasks[0]);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, [currentEmpId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const FILTERS = ['All', 'Assigned', 'In Progress', 'Submitted', 'Approved'];

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = statusFilter === 'All' || task.status === statusFilter;
    const matchesSearch = (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (task.task_code || task.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (task.location_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStartWork = async (taskCode) => {
    await liveDataService.updateTaskStatus(taskCode, 'In Progress');
    setTasks(prev => prev.map(t => (t.task_code === taskCode || t.id === taskCode) ? { ...t, status: 'In Progress' } : t));
    if (selectedTask?.task_code === taskCode || selectedTask?.id === taskCode) {
      setSelectedTask(prev => ({ ...prev, status: 'In Progress' }));
    }
    showToast(`Task moved to In Progress!`);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = files.map(f => ({ name: f.name, size: `${(f.size / (1024*1024)).toFixed(1)} MB` }));
      setAttachedFiles([...attachedFiles, ...newFiles]);
      showToast(`${files.length} file(s) attached.`);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportText.trim() || !selectedTask) return;

    const taskCode = selectedTask.task_code || selectedTask.id;
    await liveDataService.submitWorkReport(taskCode, {
      reportSummary: reportText,
      attachments: attachedFiles
    });

    setTasks(prev => prev.map(t => {
      if (t.task_code === taskCode || t.id === taskCode) {
        return {
          ...t,
          status: 'Submitted',
          report_summary: reportText
        };
      }
      return t;
    }));

    setSelectedTask(prev => ({
      ...prev,
      status: 'Submitted',
      report_summary: reportText
    }));

    showToast(`Report submitted for review!`);
    setReportText('');
    setAttachedFiles([]);
  };

  const getPriorityBadge = (p) => {
    if (p === 'High') return <Badge variant="destructive" className="text-xs font-bold px-2 py-0.5">High Priority</Badge>;
    if (p === 'Medium') return <Badge variant="warning" className="text-xs font-bold px-2 py-0.5">Medium</Badge>;
    return <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5">Normal</Badge>;
  };

  const getStatusBadge = (s) => {
    if (s === 'Approved') return <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={12} /> Approved</span>;
    if (s === 'Submitted') return <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full flex items-center gap-1"><Upload size={12} /> Submitted</span>;
    if (s === 'In Progress') return <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full flex items-center gap-1"><Clock size={12} /> In Progress</span>;
    return <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full flex items-center gap-1"><FileText size={12} /> Assigned</span>;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">My Daily Work & Field Tasks</h1>
          <p className="text-sm text-slate-500">Track assigned field tasks, log survey progress, and submit completion reports.</p>
        </div>
        <div>
          <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
            {tasks.filter(t => t.status !== 'Approved').length} Pending Tasks
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search task by code, title, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === f
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Layout: Tasks List (Left) + Detail & Submission Workspace (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Tasks List */}
        <div className="lg:col-span-5 space-y-3.5">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((work) => {
              const isSelected = selectedTask?.id === work.id || selectedTask?.task_code === work.task_code;
              return (
                <div
                  key={work.id || work.task_code}
                  onClick={() => setSelectedTask(work)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'bg-white border-blue-600 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-600" />
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {work.task_code || work.id}
                        </span>
                        {getPriorityBadge(work.priority)}
                      </div>
                      {getStatusBadge(work.status)}
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {work.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {work.description}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <MapPin size={12} className="text-rose-500" /> {work.location_name || `${work.mandal || ''}, ${work.district || ''}`}
                      </span>
                      <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                        Due: {work.due_date || work.due || 'Open'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 space-y-2">
              <Inbox className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="font-bold text-sm text-slate-700">No tasks in this view</p>
              <p className="text-xs text-slate-400">Assigned live tasks will be listed here.</p>
            </div>
          )}
        </div>

        {/* Right Side: Task Detail Workspace & Submission Hub */}
        <div className="lg:col-span-7">
          {selectedTask ? (
            <Card className="border border-slate-200/80 shadow-md rounded-2xl bg-white overflow-hidden sticky top-24">
              <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 border-b border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs font-bold bg-blue-600 px-2.5 py-0.5 rounded text-white">
                        {selectedTask.task_code || selectedTask.id}
                      </span>
                      {getPriorityBadge(selectedTask.priority)}
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                      {selectedTask.title}
                    </CardTitle>
                  </div>

                  <div className="shrink-0">
                    {getStatusBadge(selectedTask.status)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block font-medium">Location</span>
                    <span className="font-bold text-slate-800 mt-0.5 block truncate">{selectedTask.location_name || 'Field Office'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block font-medium">Supervisor</span>
                    <span className="font-bold text-slate-800 mt-0.5 block truncate">{selectedTask.supervisor_name || 'District Lead'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Task Details & Description
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {selectedTask.description}
                  </p>
                </div>

                {/* Form or State Actions */}
                {selectedTask.status === 'Assigned' && (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                    <p className="text-sm font-bold text-slate-800">Ready to start work on this task?</p>
                    <Button
                      onClick={() => handleStartWork(selectedTask.task_code || selectedTask.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                      icon={Play}
                    >
                      Move to In Progress
                    </Button>
                  </div>
                )}

                {selectedTask.status === 'In Progress' && (
                  <form onSubmit={handleSubmitReport} className="space-y-4 pt-2 border-t border-slate-100">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Work Summary & Observations *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={reportText}
                        onChange={(e) => setReportText(e.target.value)}
                        placeholder="Detailed observations and survey counts completed..."
                        className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        type="submit"
                        disabled={!reportText.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                        icon={Send}
                      >
                        Submit Report for Approval
                      </Button>
                    </div>
                  </form>
                )}

                {selectedTask.status === 'Submitted' && (
                  <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 font-medium">
                    Report has been submitted and is currently awaiting admin verification.
                  </div>
                )}

                {selectedTask.status === 'Approved' && (
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>This work report was verified and approved by the supervisor.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
              <FileText className="h-12 w-12 text-slate-300 mb-3" />
              <p className="font-bold text-sm text-slate-700">Select a Task to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
