import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Upload, 
  Check, 
  AlertCircle, 
  Clock, 
  Search, 
  X, 
  CheckCircle2, 
  Inbox
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { liveDataService } from '../../services/liveDataService';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentEmpId = localStorage.getItem('ds_current_employee_id') || 'DS-127';

  useEffect(() => {
    async function fetchDocuments() {
      setLoading(true);
      try {
        const liveDocs = await liveDataService.getDocuments(currentEmpId);
        setDocuments(liveDocs || []);
      } catch (err) {
        console.error('Error fetching documents:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, [currentEmpId]);

  const CATEGORIES = ['All', 'Official Letters', 'KYC & Identity', 'Academic'];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredDocs = documents.filter(doc => {
    const matchesCat = activeCategory === 'All' || doc.category === activeCategory;
    const matchesSearch = (doc.document_name || doc.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (doc.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const newDocPayload = {
          employee_id: currentEmpId,
          document_name: file.name.replace(/\.[^/.]+$/, ''),
          category: 'KYC & Identity',
          file_type: file.name.split('.').pop().toUpperCase(),
          file_size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          verification_status: 'Pending',
          verified_by: 'HR Admin'
        };
        await liveDataService.addDocument(newDocPayload);
        const freshDocs = await liveDataService.getDocuments(currentEmpId);
        setDocuments(freshDocs);
        showToast(`Document "${file.name}" uploaded successfully for verification.`);
      } catch (err) {
        showToast('Failed to upload document.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Verified') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
          <Check size={12} /> Verified
        </span>
      );
    }
    if (status === 'Pending') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
          <Clock size={12} /> Pending Verification
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full">
        <AlertCircle size={12} /> Action Required
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-12">
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
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Documents Hub & KYC Vault</h1>
          <p className="text-sm text-slate-500">Access official letters, KYC certificates, and submit required documents.</p>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <Card className="border-2 border-dashed border-[#D8F5FA] bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-white rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden">
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 bg-[#E63946] text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#E63946]/30">
            <Upload className="h-6 w-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">Upload Official Document or Certificate</h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports scanned PDF, JPG, or PNG files up to 10MB. Files are sent to HR for verification.
            </p>
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E63946] hover:bg-[#FF6B6B] text-white text-xs font-bold rounded-xl shadow-md shadow-[#E63946]/20 cursor-pointer transition-all">
              <Upload size={14} />
              <span>{isUploading ? 'Uploading file...' : 'Choose File to Upload'}</span>
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>
      </Card>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search document name or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#E63946] text-white shadow-sm shadow-[#E63946]/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents List Card */}
      <Card className="border border-slate-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Uploaded Documents</span>
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
              {filteredDocs.length}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-slate-100">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc, idx) => (
              <div key={doc.id || idx} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold text-xs shrink-0">
                    {doc.file_type || doc.type || 'PDF'}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <p className="font-bold text-sm text-slate-900 truncate">{doc.document_name || doc.name}</p>
                    <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                      <span className="font-semibold text-[#E63946]">{doc.category}</span>
                      <span>•</span>
                      <span>{doc.file_size || doc.size || '1.0 MB'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div>{getStatusBadge(doc.verification_status || doc.status)}</div>
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-2 text-slate-500 hover:text-[#E63946] hover:bg-[#D8F5FA] rounded-xl transition-colors cursor-pointer"
                    title="Preview Document"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center space-y-2">
              <Inbox className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No documents uploaded yet</p>
              <p className="text-xs text-slate-400">Upload your KYC or certification above.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-[#E63946] text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white mt-1">{previewDoc.document_name || previewDoc.name}</h3>
                <p className="text-xs text-slate-300">Category: {previewDoc.category}</p>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 bg-slate-50 text-center space-y-4 border-b border-slate-200">
              <FileText size={48} className="text-[#E63946] mx-auto" />
              <div className="space-y-1">
                <p className="font-bold text-sm text-slate-800">{previewDoc.document_name || previewDoc.name}</p>
                <p className="text-xs text-slate-500">Status: {previewDoc.verification_status || previewDoc.status}</p>
              </div>
            </div>

            <div className="p-5 bg-white flex items-center justify-end">
              <Button variant="outline" size="sm" onClick={() => setPreviewDoc(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
