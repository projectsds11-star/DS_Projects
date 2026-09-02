import React, { useState, useEffect, useRef } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  Check, 
  X, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Send, 
  User, 
  AlertCircle,
  Inbox,
  Paperclip,
  UploadCloud,
  FileText,
  File,
  Eye,
  Trash2,
  Download,
  Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { liveDataService } from '../../services/liveDataService';
import { storageService } from '../../services/supabaseClient';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  if (typeof bytes === 'string') return bytes;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileCategory(fileName = '', fileType = '') {
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  if (['pdf'].includes(ext) || fileType.includes('pdf')) {
    return { label: 'PDF', bg: 'bg-red-100 text-red-700 border-red-200' };
  }
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) || fileType.startsWith('image/')) {
    return { label: 'IMG', bg: 'bg-blue-100 text-blue-700 border-blue-200' };
  }
  if (['xls', 'xlsx', 'csv'].includes(ext) || fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('csv')) {
    return { label: 'XLS', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  }
  if (['doc', 'docx'].includes(ext) || fileType.includes('word') || fileType.includes('document')) {
    return { label: 'DOC', bg: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
  }
  return { label: 'FILE', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
}

export default function WorkManagement() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'assign', 'review'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [reviewTask, setReviewTask] = useState(null);
  const [adminFeedback, setAdminFeedback] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigned_employee_id: '',
    due_date: new Date().toISOString().slice(0, 10),
    priority: 'Medium',
    location_name: '',
    district: '',
    mandal: '',
  });

  // Attached files state
  const [taskFiles, setTaskFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [taskList, empList] = await Promise.all([
          liveDataService.getWorkTasks(),
          liveDataService.getActiveOnboardedEmployees()
        ]);
        if (taskList) setTasks(taskList);
        if (empList) {
          setEmployees(empList);
          if (empList.length > 0) {
            setNewTask(prev => ({
              ...prev,
              assigned_employee_id: empList[0].employee_id || empList[0].employeeId,
              district: empList[0].district,
              mandal: empList[0].mandal,
              location_name: `${empList[0].mandal || 'Field'} Mandal HQ`
            }));
          }
        }
      } catch (err) {
        console.error('Error loading work management data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileSelect = (filesList) => {
    if (!filesList || filesList.length === 0) return;
    const newItems = Array.from(filesList).map(file => ({
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setTaskFiles(prev => [...prev, ...newItems]);
    showToast(`${newItems.length} file(s) attached to task.`);
  };

  const handleRemoveFile = (id) => {
    setTaskFiles(prev => {
      const target = prev.find(f => f.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.assigned_employee_id) return;

    setIsSubmittingTask(true);
    try {
      const taskCode = `TSK-${Math.floor(1000 + Math.random() * 9000)}`;

      // Upload attached files via storageService
      const uploadedAttachments = [];
      for (const item of taskFiles) {
        let fileUrl = item.preview;
        if (item.file) {
          fileUrl = await storageService.uploadTaskAttachment(item.file, taskCode);
        }
        uploadedAttachments.push({
          name: item.name,
          size: formatBytes(item.size),
          type: item.type,
          url: fileUrl || ''
        });
      }

      const payload = {
        task_code: taskCode,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        due_date: newTask.due_date,
        assigned_employee_id: newTask.assigned_employee_id,
        location_name: newTask.location_name || 'Field Sector',
        district: newTask.district || 'Nellore',
        mandal: newTask.mandal || 'Kavali',
        attachments: uploadedAttachments,
        status: 'Assigned'
      };

      await liveDataService.createWorkTask(payload);
      showToast(`Task ${taskCode} successfully assigned with ${uploadedAttachments.length} file(s)!`);
      setActiveTab('list');

      const freshTasks = await liveDataService.getWorkTasks();
      setTasks(freshTasks);

      setNewTask({
        title: '',
        description: '',
        assigned_employee_id: employees[0]?.employee_id || '',
        due_date: new Date().toISOString().slice(0, 10),
        priority: 'Medium',
        location_name: '',
        district: '',
        mandal: '',
      });
      setTaskFiles([]);
    } catch (err) {
      console.error('Error creating task:', err);
      showToast('Error dispatching task. Please try again.');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleApproveReport = async (taskCode) => {
    await liveDataService.updateTaskStatus(taskCode, 'Approved');
    showToast(`Work report approved!`);
    setReviewTask(null);
    const freshTasks = await liveDataService.getWorkTasks();
    setTasks(freshTasks);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (task.task_code || task.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (task.assigned_employee_id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'High': return <Badge variant="destructive" className="text-xs font-bold">High</Badge>;
      case 'Medium': return <Badge variant="warning" className="text-xs font-bold">Medium</Badge>;
      default: return <Badge variant="secondary" className="text-xs font-bold">Normal</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved': return <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={12} /> Approved</span>;
      case 'Submitted': return <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full flex items-center gap-1"><Clock size={12} /> Under Review</span>;
      case 'In Progress': return <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full flex items-center gap-1"><Clock size={12} /> In Progress</span>;
      default: return <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full flex items-center gap-1">Assigned</span>;
    }
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

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <span>Daily Work Operations</span>
            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
              {tasks.length} Dispatched
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">Dispatch field survey tasks, track live progress, and verify field reports.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'list' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Work Dossier
          </button>
          <button
            onClick={() => setActiveTab('assign')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'assign' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Plus size={14} />
            <span>+ Assign Task</span>
          </button>
        </div>
      </div>

      {/* Assign Task View */}
      {activeTab === 'assign' && (
        <Card className="border border-slate-200/80 shadow-md rounded-2xl bg-white overflow-hidden max-w-2xl mx-auto">
          <CardHeader className="bg-[#0F172A] text-white p-6">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-400" />
              <span>Dispatch New Field Survey Task</span>
            </CardTitle>
            <p className="text-xs text-slate-300">Assign task to a deployed mandal coordinator</p>
          </CardHeader>

          <form onSubmit={handleCreateTask} className="p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Task Title *</label>
              <input
                type="text"
                required
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g. Mandal Farmer Aadhaar Linkage Survey"
                className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Assign To Staff *</label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Onboarded & Active Only
                  </span>
                </div>
                {employees.length > 0 ? (
                  <select
                    required
                    value={newTask.assigned_employee_id}
                    onChange={(e) => {
                      const emp = employees.find(x => (x.employee_id || x.employeeId || x.id) === e.target.value);
                      setNewTask({
                        ...newTask,
                        assigned_employee_id: e.target.value,
                        district: emp?.district || '',
                        mandal: emp?.mandal || '',
                        location_name: `${emp?.mandal || 'Field'} Mandal HQ`
                      });
                    }}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {employees.map(emp => {
                      const id = emp.employee_id || emp.employeeId || emp.id;
                      const name = emp.full_name || emp.name || 'Staff Member';
                      const role = emp.designation || 'Field Staff';
                      const loc = emp.mandal || emp.district || 'AP';
                      return (
                        <option key={id} value={id}>
                          {name} ({id}) — {role} [{loc}]
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle size={14} className="text-amber-600 shrink-0" />
                      <span>No Onboarded Active Staff Found</span>
                    </div>
                    <p className="text-[11px] text-amber-700">
                      Candidates must complete the Onboarding process and have their offer accepted before field tasks can be assigned to them.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Normal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Due Date</label>
                <input
                  type="date"
                  required
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Target Location</label>
                <input
                  type="text"
                  value={newTask.location_name}
                  onChange={(e) => setNewTask({ ...newTask, location_name: e.target.value })}
                  placeholder="e.g. Kavali Mandal Office"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Task Scope & Field Instructions</label>
              <textarea
                rows={3}
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Specific survey deliverables, target counts, and guidance..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* File Upload Option Section */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Paperclip size={13} className="text-blue-600" />
                  <span>Attach Survey Documents & Files (Optional)</span>
                </label>
                <span className="text-[11px] text-slate-400 font-medium">PDF, DOC, XLS, JPG, PNG (Max 10MB)</span>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-600 bg-blue-50/70 scale-[0.99]'
                    : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/60 bg-slate-50/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isDragging ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">
                    <span className="text-blue-600 hover:underline">Click to browse</span> or drag & drop reference files
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Questionnaires, guidelines, field manuals, lists or survey forms
                  </p>
                </div>
              </div>

              {/* Selected Files List */}
              {taskFiles.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Attached Files ({taskFiles.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {taskFiles.map((f) => {
                      const category = getFileCategory(f.name, f.type);
                      return (
                        <div
                          key={f.id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl hover:bg-slate-100/70 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border shrink-0 ${category.bg}`}>
                              {category.label}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate" title={f.name}>
                                {f.name}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {formatBytes(f.size)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {f.preview && (
                              <a
                                href={f.preview}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                                title="Preview"
                              >
                                <Eye size={13} />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile(f.id);
                              }}
                              className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                              title="Remove"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => { setActiveTab('list'); setTaskFiles([]); }}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmittingTask}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold" 
                icon={isSubmittingTask ? Loader2 : Send}
              >
                {isSubmittingTask ? 'Dispatching & Uploading...' : 'Dispatch Task'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Work Dossier View */}
      {activeTab === 'list' && (
        <div className="space-y-5">
          {/* Filters and search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by code, title, employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              {['All', 'Assigned', 'In Progress', 'Submitted', 'Approved'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks Table */}
          <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
            <div className="overflow-x-auto">
              {filteredTasks.length > 0 ? (
                <table className="w-full text-xs sm:text-sm text-left">
                  <thead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200/80">
                    <tr>
                      <th className="px-6 py-4">Task Dossier</th>
                      <th className="px-6 py-4">Assigned Personnel</th>
                      <th className="px-6 py-4">Target Sector</th>
                      <th className="px-6 py-4">Due Date</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTasks.map((task) => {
                      const attachCount = (task.attachments && Array.isArray(task.attachments)) ? task.attachments.length : 0;
                      return (
                        <tr key={task.id || task.task_code} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{task.title}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-xs text-blue-600 font-semibold">{task.task_code || task.id}</span>
                              {attachCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.5 rounded">
                                  <Paperclip size={10} /> {attachCount} {attachCount === 1 ? 'file' : 'files'}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-800">{task.assigned_employee_id}</div>
                            <div className="text-xs text-slate-500">Mandal Lead</div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-slate-800 flex items-center gap-1 font-medium">
                              <MapPin size={13} className="text-rose-500" />
                              {task.location_name || `${task.mandal || ''}, ${task.district || ''}`}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-slate-700 whitespace-nowrap">
                            {task.due_date || task.due || 'Open'}
                          </td>

                          <td className="px-6 py-4">
                            {getPriorityBadge(task.priority)}
                          </td>

                          <td className="px-6 py-4">
                            {getStatusBadge(task.status)}
                          </td>

                          <td className="px-6 py-4 text-right">
                            {task.status === 'Submitted' ? (
                              <button
                                onClick={() => setReviewTask(task)}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                              >
                                Review Report
                              </button>
                            ) : (
                              <button
                                onClick={() => setReviewTask(task)}
                                className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
                              >
                                View
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center space-y-3">
                  <Inbox className="h-12 w-12 text-slate-300 mx-auto" />
                  <p className="font-bold text-sm text-slate-700">No work tasks found</p>
                  <p className="text-xs text-slate-400">Click "+ Assign Task" above to dispatch field surveys.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Report Review & Task Dossier Modal */}
      {reviewTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
            <div className="p-6 bg-[#0F172A] text-white flex items-start justify-between shrink-0">
              <div>
                <span className="text-[10px] font-mono font-bold bg-blue-600 px-2 py-0.5 rounded text-white">
                  {reviewTask.task_code || reviewTask.id}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{reviewTask.title}</h3>
                <p className="text-xs text-slate-300 mt-0.5">Assigned to: {reviewTask.assigned_employee_id}</p>
              </div>
              <button 
                onClick={() => setReviewTask(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block font-medium">Target Location</span>
                  <span className="font-bold text-slate-800 mt-0.5 block truncate">{reviewTask.location_name || 'Field HQ'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block font-medium">Due Date</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{reviewTask.due_date || 'Open'}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Task Scope & Instructions</span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {reviewTask.description || 'No instructions specified.'}
                </p>
              </div>

              {/* Task Reference Attachments */}
              {reviewTask.attachments && Array.isArray(reviewTask.attachments) && reviewTask.attachments.length > 0 && (
                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/60 space-y-2">
                  <span className="font-bold text-blue-900 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Paperclip size={12} className="text-blue-600" />
                    <span>Dispatched Reference Files & Guidelines ({reviewTask.attachments.length})</span>
                  </span>
                  <div className="space-y-1.5">
                    {reviewTask.attachments.map((file, idx) => {
                      const cat = getFileCategory(file.name, file.type);
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-xl border border-blue-100 text-xs">
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold border shrink-0 ${cat.bg}`}>
                              {cat.label}
                            </span>
                            <span className="font-semibold text-slate-800 truncate" title={file.name}>{file.name}</span>
                            {file.size && <span className="text-[10px] text-slate-400 shrink-0">({file.size})</span>}
                          </div>
                          {file.url ? (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0"
                            >
                              <Download size={11} /> View
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Attached</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submitted Field Report Section */}
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200/70 space-y-2">
                <span className="font-bold text-indigo-950 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <FileText size={12} className="text-indigo-600" />
                  <span>Submitted Field Report</span>
                </span>
                <p className="text-slate-800 leading-relaxed font-medium bg-white p-3 rounded-xl border border-indigo-100">
                  {reviewTask.report_summary || 'No report remarks logged yet.'}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setReviewTask(null)}>
                  Close
                </Button>
                {reviewTask.status === 'Submitted' && (
                  <Button 
                    type="button" 
                    onClick={() => handleApproveReport(reviewTask.task_code || reviewTask.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" 
                    icon={Check}
                  >
                    Approve & Verify
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
