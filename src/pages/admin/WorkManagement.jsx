import React, { useState, useEffect } from 'react';
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
  Inbox
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { liveDataService } from '../../services/liveDataService';

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

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [taskList, empList] = await Promise.all([
          liveDataService.getWorkTasks(),
          liveDataService.getEmployees()
        ]);
        if (taskList) setTasks(taskList);
        if (empList) {
          setEmployees(empList);
          if (empList.length > 0) {
            setNewTask(prev => ({
              ...prev,
              assigned_employee_id: empList[0].employee_id,
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

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.assigned_employee_id) return;

    const taskCode = `TSK-${Math.floor(1000 + Math.random() * 9000)}`;
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
      status: 'Assigned'
    };

    await liveDataService.createWorkTask(payload);
    showToast(`Task ${taskCode} successfully assigned!`);
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
                <label className="text-xs font-bold text-slate-700">Assign To Staff *</label>
                <select
                  required
                  value={newTask.assigned_employee_id}
                  onChange={(e) => {
                    const emp = employees.find(x => x.employee_id === e.target.value);
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
                  {employees.map(emp => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.full_name} ({emp.employee_id}) - {emp.mandal || emp.district}
                    </option>
                  ))}
                  {employees.length === 0 && (
                    <option value="DS-127">Rahul Kumar (DS-127)</option>
                  )}
                </select>
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

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setActiveTab('list')}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold" icon={Send}>
                Dispatch Task
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
                    {filteredTasks.map((task) => (
                      <tr key={task.id || task.task_code} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{task.title}</div>
                          <div className="font-mono text-xs text-blue-600 font-semibold">{task.task_code || task.id}</div>
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
                          ) : task.status === 'Assigned' ? (
                            <span className="text-xs text-slate-400 font-medium">Awaiting Start</span>
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
                    ))}
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

      {/* Report Review Modal */}
      {reviewTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-[#0F172A] text-white flex items-start justify-between">
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

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Submitted Field Report</span>
                <p className="text-slate-800 leading-relaxed font-medium">
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
