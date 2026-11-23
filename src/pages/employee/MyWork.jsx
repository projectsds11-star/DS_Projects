import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Inbox, 
  UploadCloud, 
  Download, 
  Eye, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  ShieldAlert,
  FileSpreadsheet,
  Calendar,
  FileCheck2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { liveDataService } from '../../services/liveDataService';
import { storageService, supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import { workReportService } from '../../services/workReportService';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  if (typeof bytes === 'string') return bytes;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileCategory(fileName = '', fileType = '') {
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  if (['pdf'].includes(ext) || fileType?.includes('pdf')) {
    return { label: 'PDF', bg: 'bg-red-100 text-red-700 border-red-200' };
  }
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) || fileType?.startsWith('image/')) {
    return { label: 'IMG', bg: 'bg-[#D8F5FA] text-[#E63946] border-[#D8F5FA]' };
  }
  if (['xls', 'xlsx', 'csv'].includes(ext) || fileType?.includes('sheet') || fileType?.includes('excel') || fileType?.includes('csv')) {
    return { label: 'XLS', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  }
  if (['doc', 'docx'].includes(ext) || fileType?.includes('word') || fileType?.includes('document')) {
    return { label: 'DOC', bg: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
  }
  return { label: 'FILE', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
}

export default function MyWork() {
  const navigate = useNavigate();
  const [activeWorkTab, setActiveWorkTab] = useState('excel_report'); // 'excel_report' (Daily Excel Sheet) or 'tasks'
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [reportText, setReportText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(true);
  const fileInputRef = useRef(null);

  // Daily Work Excel Sheet State
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [excelFile, setExcelFile] = useState(null);
  const [excelFileStats, setExcelFileStats] = useState(null);
  const [reportNotes, setReportNotes] = useState('');
  const [isSubmittingSheet, setIsSubmittingSheet] = useState(false);
  const [isDraggingExcel, setIsDraggingExcel] = useState(false);
  const [submittedWorkReports, setSubmittedWorkReports] = useState([]);
  const excelInputRef = useRef(null);

  const currentEmpId = localStorage.getItem('ds_current_employee_id') || 'DS-127';

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      try {
        const [liveTasks, emp, dailyReports] = await Promise.all([
          liveDataService.getWorkTasks(currentEmpId),
          liveDataService.getEmployeeById(currentEmpId),
          workReportService.getDailyWorkReports(currentEmpId)
        ]);

        if (emp) {
          setCurrentEmployee(emp);
          if (emp.status === 'Onboarding' || emp.status === 'Draft' || emp.status === 'Inactive') {
            setIsOnboardingCompleted(false);
          } else {
            setIsOnboardingCompleted(true);
          }
        }

        setTasks(liveTasks || []);
        if (liveTasks && liveTasks.length > 0) {
          setSelectedTask(liveTasks[0]);
        }

        setSubmittedWorkReports(dailyReports || []);
      } catch (err) {
        console.error('Error fetching tasks and daily reports:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, [currentEmpId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadExcelTemplate = () => {
    try {
      workReportService.downloadExcelTemplate();
      showToast('Daily Work Excel Template downloaded!');
    } catch (e) {
      console.error('Error downloading template:', e);
      showToast('Error downloading template. Please try again.');
    }
  };

  const handleExcelFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      showToast('Please upload an Excel (.xlsx, .xls) or CSV file.');
      return;
    }

    setExcelFile(file);
    try {
      const parsed = await workReportService.parseExcelFile(file);
      setExcelFileStats(parsed);
      showToast(`Excel sheet loaded: ${parsed.totalRows} Enterprise Units detected!`);
    } catch (err) {
      console.warn('Note on parsing:', err.message);
      setExcelFileStats({
        fileName: file.name,
        fileSize: file.size,
        totalRows: 0,
        rows: []
      });
      showToast(`Excel file attached: ${file.name}`);
    }
  };

  const handleSubmitDailyWorkSheet = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      showToast('Please upload your completed Excel sheet first.');
      return;
    }

    setIsSubmittingSheet(true);
    try {
      // 1. Upload file to Supabase storage
      const fileUrl = await workReportService.uploadExcelFile(excelFile, currentEmpId, reportDate);

      // 2. Submit report & notify Admin via Email
      const payload = {
        employeeId: currentEmpId,
        employeeName: currentEmployee?.full_name || currentEmployee?.name || 'Field Officer',
        employeeEmail: currentEmployee?.email || '',
        workDate: reportDate,
        district: currentEmployee?.district || '',
        mandal: currentEmployee?.mandal || '',
        fileName: excelFile.name,
        fileSize: formatBytes(excelFile.size),
        fileUrl: fileUrl,
        totalEnterprises: excelFileStats?.totalRows || 0,
        records: excelFileStats?.rows || [],
        summaryNotes: reportNotes || 'Daily field work report completed and submitted for review.',
      };

      await workReportService.submitDailyWorkReport(payload);
      showToast('Daily work sheet submitted! Admin has been notified via email.');

      // Reset form
      setExcelFile(null);
      setExcelFileStats(null);
      setReportNotes('');
      if (excelInputRef.current) excelInputRef.current.value = '';

      // Reload submitted list
      const freshReports = await workReportService.getDailyWorkReports(currentEmpId);
      setSubmittedWorkReports(freshReports || []);
    } catch (err) {
      console.error('Error submitting daily work sheet:', err);
      showToast('Error submitting sheet. Please try again.');
    } finally {
      setIsSubmittingSheet(false);
    }
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

  const handleFileUpload = (filesList) => {
    if (!filesList || filesList.length === 0) return;
    const newItems = Array.from(filesList).map(file => ({
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setAttachedFiles(prev => [...prev, ...newItems]);
    showToast(`${newItems.length} file(s) attached to report.`);
  };

  const handleRemoveAttachedFile = (id) => {
    setAttachedFiles(prev => {
      const target = prev.find(f => f.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportText.trim() || !selectedTask) return;

    setIsSubmitting(true);
    try {
      const taskCode = selectedTask.task_code || selectedTask.id;

      const uploadedList = [];
      for (const item of attachedFiles) {
        let fileUrl = item.preview;
        if (item.file) {
          fileUrl = await storageService.uploadTaskAttachment(item.file, `${taskCode}_rep`);
        }
        uploadedList.push({
          name: item.name,
          size: formatBytes(item.size),
          type: item.type,
          url: fileUrl || ''
        });
      }

      await liveDataService.submitWorkReport(taskCode, {
        reportSummary: reportText,
        attachments: uploadedList
      });

      setTasks(prev => prev.map(t => {
        if (t.task_code === taskCode || t.id === taskCode) {
          return {
            ...t,
            status: 'Submitted',
            report_summary: reportText,
            report_attachments: uploadedList
          };
        }
        return t;
      }));

      setSelectedTask(prev => ({
        ...prev,
        status: 'Submitted',
        report_summary: reportText,
        report_attachments: uploadedList
      }));

      showToast(`Report submitted successfully for admin review!`);
      setReportText('');
      setAttachedFiles([]);
    } catch (err) {
      console.error('Error submitting report:', err);
      showToast('Error submitting report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadFile = async (e, file) => {
    e.preventDefault();
    e.stopPropagation();
    if (!file?.url) {
      showToast('File download link is unavailable.');
      return;
    }
    try {
      showToast(`Downloading ${file.name}...`);
      const res = await fetch(file.url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.name || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.warn('Direct blob download failed, opening in browser tab:', err);
      window.open(file.url, '_blank', 'noopener,noreferrer');
    }
  };


  const getPriorityBadge = (p) => {
    if (p === 'High') return <Badge variant="destructive" className="text-xs font-bold px-2.5 py-0.5 whitespace-nowrap shrink-0">High Priority</Badge>;
    if (p === 'Medium') return <Badge variant="warning" className="text-xs font-bold px-2.5 py-0.5 whitespace-nowrap shrink-0">Medium</Badge>;
    return <Badge variant="secondary" className="text-xs font-bold px-2.5 py-0.5 whitespace-nowrap shrink-0">Normal</Badge>;
  };

  const getStatusBadge = (s) => {
    if (s === 'Approved') return <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full inline-flex items-center gap-1 whitespace-nowrap shrink-0"><CheckCircle2 size={12} className="shrink-0" /> Approved</span>;
    if (s === 'Submitted') return <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full inline-flex items-center gap-1 whitespace-nowrap shrink-0"><Upload size={12} className="shrink-0" /> Submitted</span>;
    if (s === 'In Progress') return <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full inline-flex items-center gap-1 whitespace-nowrap shrink-0"><Clock size={12} className="shrink-0" /> In Progress</span>;
    return <span className="text-xs font-bold text-[#E63946] bg-[#D8F5FA] px-2.5 py-1 rounded-full inline-flex items-center gap-1 whitespace-nowrap shrink-0"><FileText size={12} className="shrink-0" /> Assigned</span>;
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
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">My Daily Work & Field Reports</h1>
          <p className="text-sm text-slate-500">Download daily field work Excel sheet, upload completed visit reports, and track admin verification.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={handleDownloadExcelTemplate}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs cursor-pointer flex items-center gap-2"
          >
            <Download size={15} />
            <FileSpreadsheet size={15} />
            <span>Download Excel Template</span>
          </Button>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveWorkTab('excel_report')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeWorkTab === 'excel_report'
              ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/20'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet size={16} />
          <span>Daily Field Work Sheet (Excel Upload)</span>
          {submittedWorkReports.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeWorkTab === 'excel_report' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {submittedWorkReports.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveWorkTab('tasks')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeWorkTab === 'tasks'
              ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/20'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileText size={16} />
          <span>Assigned Tasks ({tasks.length})</span>
        </button>
      </div>

      {/* VIEW 1: DAILY EXCEL FIELD WORK SHEET UPLOAD (PRIMARY) */}
      {activeWorkTab === 'excel_report' && (
        <div className="space-y-6">
          {/* Instructions and Download Template Card */}
          <div className="bg-gradient-to-r from-slate-900 to-[#0A192F] text-white p-6 rounded-3xl border border-slate-800 shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <FileCheck2 size={13} />
                  <span>Mandatory Daily Field Report</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Daily Field Work Excel Submission
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Every day after completing field visits, record all visited MSME units in the official Excel sheet (11 standard columns) and submit it here. Admin will verify and accept your sheet, and you will receive an acceptance confirmation email.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto shrink-0">
                <Button
                  type="button"
                  onClick={handleDownloadExcelTemplate}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  <span>Download Excel Sheet</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Upload Form Card */}
          <Card className="border border-slate-200/80 shadow-md rounded-3xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-200/80 p-6">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-[#E63946]" />
                <span>Upload Completed Daily Work Sheet</span>
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Select work date, attach your completed Excel (.xlsx, .xls) file, and click submit.
              </p>
            </CardHeader>

            <form onSubmit={handleSubmitDailyWorkSheet} className="p-6 space-y-6">
              {/* Row 1: Date & Officer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#E63946]" />
                    <span>Work Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={reportDate}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-[#E63946] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Field Officer / Candidate</label>
                  <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs sm:text-sm text-slate-700 font-semibold truncate">
                    {currentEmployee?.full_name || 'Candidate'} ({currentEmpId})
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin size={13} className="text-rose-500" />
                    <span>Assigned Area</span>
                  </label>
                  <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs sm:text-sm text-slate-700 font-semibold truncate">
                    {currentEmployee?.mandal || 'Field'}, {currentEmployee?.district || 'Andhra Pradesh'}
                  </div>
                </div>
              </div>

              {/* Row 2: Drag & Drop Excel File Upload Zone */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileSpreadsheet size={14} className="text-emerald-600" />
                    <span>Upload Completed Excel Sheet (.xlsx, .xls, .csv) *</span>
                  </label>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Exact 11 Columns Required
                  </span>
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingExcel(true); }}
                  onDragLeave={() => setIsDraggingExcel(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingExcel(false);
                    if (e.dataTransfer.files) handleExcelFileSelect(e.dataTransfer.files);
                  }}
                  onClick={() => excelInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                    isDraggingExcel
                      ? 'border-[#E63946] bg-[#D8F5FA]/50 scale-[0.99]'
                      : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 bg-slate-50/50'
                  }`}
                >
                  <input
                    ref={excelInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    onChange={(e) => handleExcelFileSelect(e.target.files)}
                    className="hidden"
                  />

                  {excelFile ? (
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
                        <FileSpreadsheet size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{excelFile.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Size: {formatBytes(excelFile.size)} &bull; Ready for submission
                        </p>
                      </div>

                      {excelFileStats && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-200">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          <span>{excelFileStats.totalRows} Enterprise Units Detected in Sheet</span>
                        </div>
                      )}

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExcelFile(null);
                            setExcelFileStats(null);
                            if (excelInputRef.current) excelInputRef.current.value = '';
                          }}
                          className="text-xs text-rose-600 hover:text-rose-700 font-bold underline"
                        >
                          Change / Upload Different File
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
                        <UploadCloud size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          <span className="text-[#E63946] underline">Click to choose</span> or drag and drop your completed Excel sheet
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Supports .xlsx, .xls, and .csv files (up to 25 MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: Observations / Remarks */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Field Observations / Summary Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="e.g. Visited 12 units in industrial growth center. All owner contacts verified and documents gathered."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm focus:ring-2 focus:ring-[#E63946] focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  <span>* After submission, Admin will be automatically notified via email.</span>
                </div>

                <Button
                  type="submit"
                  disabled={!excelFile || isSubmittingSheet}
                  className="w-full sm:w-auto bg-[#E63946] hover:bg-[#FF6B6B] text-white font-extrabold px-8 py-3 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmittingSheet ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting & Notifying Admin...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit Daily Work Sheet to Admin</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Submitted Work Sheets History */}
          <Card className="border border-slate-200/80 shadow-sm rounded-3xl bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <span>My Submitted Daily Work Sheets History</span>
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time status of your daily submitted field reports and admin verification
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {submittedWorkReports.length} Submissions
              </span>
            </CardHeader>

            <div className="overflow-x-auto">
              {submittedWorkReports.length > 0 ? (
                <table className="w-full text-xs sm:text-sm text-left">
                  <thead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200/80">
                    <tr>
                      <th className="px-6 py-4">Work Date</th>
                      <th className="px-6 py-4">Submitted File</th>
                      <th className="px-6 py-4">Units Audited</th>
                      <th className="px-6 py-4">Verification Status</th>
                      <th className="px-6 py-4">Admin Remarks</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submittedWorkReports.map((report) => {
                      const isAccepted = report.status === 'Accepted' || report.status === 'Approved' || report.status === 'Verified';
                      return (
                        <tr key={report.id || report.report_code} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-extrabold text-slate-900">{report.work_date}</div>
                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">{report.report_code || 'REPORT'}</div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <FileSpreadsheet size={14} />
                              </span>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 truncate max-w-xs">{report.file_name || 'DAILY_WORK_SHEET.xlsx'}</p>
                                {report.file_size && <p className="text-[10px] text-slate-400">{report.file_size}</p>}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="font-extrabold text-slate-900 text-sm">
                              {report.total_enterprises || (Array.isArray(report.records) ? report.records.length : 0)}
                            </span>
                            <span className="text-xs text-slate-500 ml-1">Units</span>
                          </td>

                          <td className="px-6 py-4">
                            {isAccepted ? (
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-emerald-200">
                                <CheckCircle2 size={13} className="text-emerald-600" />
                                <span>Accepted & Verified</span>
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full inline-flex items-center gap-1.5 border border-amber-200">
                                <Clock size={13} className="text-amber-600" />
                                <span>Under Admin Review</span>
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-xs text-slate-600 max-w-xs">
                            {report.admin_remarks ? (
                              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-100 text-xs font-medium">
                                {report.admin_remarks}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Pending review</span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-right">
                            {report.file_url ? (
                              <a
                                href={report.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                              >
                                <Download size={13} />
                                <span>Download</span>
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400">Attached</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center space-y-3">
                  <FileSpreadsheet className="h-12 w-12 text-slate-300 mx-auto" />
                  <p className="font-bold text-sm text-slate-700">No daily work sheets submitted yet</p>
                  <p className="text-xs text-slate-400">Download the template above, fill your daily field data, and upload it.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* VIEW 2: ASSIGNED TASKS (SECONDARY TAB) */}
      {activeWorkTab === 'tasks' && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search task by code, title, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === f
                      ? 'bg-[#E63946] text-white shadow-sm shadow-[#E63946]/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

      {/* If Employee is pending onboarding, show informational gate */}
      {!isOnboardingCompleted ? (
        <Card className="p-8 sm:p-12 text-center space-y-5 border border-amber-200/90 bg-gradient-to-b from-amber-50/80 to-amber-50/30 rounded-3xl shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-xs border border-amber-200">
            <Clock size={32} />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900">Onboarding Verification In Progress</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your employee profile is currently in the onboarding and document verification stage. Daily task dispatch, survey assignments, and work reporting will be unlocked as soon as your appointment offer is accepted and verified by the HR Directorate.
            </p>
          </div>
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/employee/documents')}
              className="px-5 py-2.5 bg-[#E63946] hover:bg-[#FF6B6B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              View My Documents & Status
            </button>
            <button
              onClick={() => navigate('/employee/profile')}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer"
            >
              My Profile
            </button>
          </div>
        </Card>
      ) : (
        /* Main Split Layout: Tasks List (Left) + Detail & Submission Workspace (Right) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Tasks List */}
        <div className="lg:col-span-5 space-y-3.5">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((work) => {
              const isSelected = selectedTask?.id === work.id || selectedTask?.task_code === work.task_code;
              const attachCount = (work.attachments && Array.isArray(work.attachments)) ? work.attachments.length : 0;
              return (
                <div
                  key={work.id || work.task_code}
                  onClick={() => setSelectedTask(work)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'bg-white border-[#E63946] shadow-lg shadow-[#E63946]/10 ring-2 ring-[#E63946]/20'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#E63946]" />
                  )}

                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="font-mono text-[11px] sm:text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 border border-slate-200">
                          {work.task_code || work.id}
                        </span>
                        {getPriorityBadge(work.priority)}
                        {attachCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#E63946] bg-[#D8F5FA] border border-[#D8F5FA]/60 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
                            <Paperclip size={10} className="shrink-0" /> {attachCount}
                          </span>
                        )}
                      </div>
                      <div className="shrink-0">
                        {getStatusBadge(work.status)}
                      </div>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#E63946] transition-colors line-clamp-2">
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
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-mono text-xs font-bold bg-[#E63946] px-2.5 py-0.5 rounded text-white whitespace-nowrap shrink-0">
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

                {/* Supervisor Reference Documents & Guidelines */}
                {selectedTask.attachments && Array.isArray(selectedTask.attachments) && selectedTask.attachments.length > 0 && (
                  <div className="p-4 bg-[#D8F5FA]/70 rounded-2xl border border-[#D8F5FA]/70 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Paperclip size={13} className="text-[#E63946]" />
                        <span>Attached Reference Documents & Guidelines ({selectedTask.attachments.length})</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedTask.attachments.map((file, idx) => {
                        const cat = getFileCategory(file.name, file.type);
                        return (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#D8F5FA] shadow-2xs hover:border-[#00B4D8] transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border shrink-0 ${cat.bg}`}>
                                {cat.label}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate" title={file.name}>
                                  {file.name}
                                </p>
                                {file.size && <p className="text-[10px] text-slate-400">{file.size}</p>}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1.5 shrink-0">
                              {file.url && (
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-slate-400 hover:text-[#00B4D8] hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                  title="View document in new tab"
                                >
                                  <Eye size={13} />
                                </a>
                              )}
                              {file.url ? (
                                <button
                                  type="button"
                                  onClick={(e) => handleDownloadFile(e, file)}
                                  className="px-2.5 py-1.5 bg-[#E63946] hover:bg-[#FF6B6B] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 shadow-2xs transition-colors cursor-pointer"
                                >
                                  <Download size={12} /> Download
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Attached</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                )}

                {/* Form or State Actions */}
                {selectedTask.status === 'Assigned' && (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                    <p className="text-sm font-bold text-slate-800">Ready to start work on this task?</p>
                    <Button
                      onClick={() => handleStartWork(selectedTask.task_code || selectedTask.id)}
                      className="bg-[#E63946] hover:bg-[#FF6B6B] text-white font-bold cursor-pointer"
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
                        placeholder="Detailed observations, voter/farmer counts, survey status..."
                        className="w-full rounded-xl border border-slate-300 p-3 text-xs sm:text-sm focus:ring-2 focus:ring-[#E63946] focus:outline-none"
                      />
                    </div>

                    {/* Field Report Attachments Upload */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Paperclip size={12} className="text-[#E63946]" />
                          <span>Attach Completed Survey Sheets / Field Photos (Optional)</span>
                        </label>
                      </div>

                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          if (e.dataTransfer.files) handleFileUpload(e.dataTransfer.files);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
                          isDragging ? 'border-[#E63946] bg-[#D8F5FA]/70' : 'border-slate-200 hover:border-[#00B4D8] bg-slate-50/40'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.webp"
                          onChange={(e) => handleFileUpload(e.target.files)}
                          className="hidden"
                        />
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                          <UploadCloud size={16} className="text-[#E63946]" />
                          <span><strong className="text-[#E63946] underline">Upload</strong> completion proof or filled Excel/PDF</span>
                        </div>
                      </div>

                      {attachedFiles.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {attachedFiles.map((f) => {
                            const cat = getFileCategory(f.name, f.type);
                            return (
                              <div key={f.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                                <div className="flex items-center gap-2 min-w-0 pr-2">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold border shrink-0 ${cat.bg}`}>{cat.label}</span>
                                  <span className="font-semibold text-slate-800 truncate">{f.name}</span>
                                  <span className="text-[10px] text-slate-400 shrink-0">({formatBytes(f.size)})</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAttachedFile(f.id)}
                                  className="text-slate-400 hover:text-red-500 p-1"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        type="submit"
                        disabled={!reportText.trim() || isSubmitting}
                        className="bg-[#E63946] hover:bg-[#FF6B6B] text-white font-bold cursor-pointer"
                        icon={isSubmitting ? Loader2 : Send}
                      >
                        {isSubmitting ? 'Submitting Report...' : 'Submit Report for Approval'}
                      </Button>
                    </div>
                  </form>
                )}

                {selectedTask.status === 'Submitted' && (
                  <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 font-medium space-y-1">
                    <p className="font-bold">Report has been submitted and is currently awaiting admin verification.</p>
                    {selectedTask.report_summary && (
                      <p className="text-indigo-800 bg-white/70 p-3 rounded-xl mt-2 border border-indigo-100">
                        {selectedTask.report_summary}
                      </p>
                    )}
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
      )}
        </div>
      )}
    </div>
  );
}
