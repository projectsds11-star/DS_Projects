import React from 'react';
import { FileText, Download, Eye, Upload, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const DOCUMENTS = [
  { name: 'Offer Letter', date: 'Jan 15, 2025', status: 'Verified', type: 'PDF', size: '1.2 MB' },
  { name: 'Appointment Letter', date: 'Jan 15, 2025', status: 'Verified', type: 'PDF', size: '0.9 MB' },
  { name: 'Aadhaar Card', date: 'Jan 10, 2025', status: 'Verified', type: 'PDF', size: '2.1 MB' },
  { name: 'PAN Card', date: 'Jan 10, 2025', status: 'Verified', type: 'PDF', size: '1.5 MB' },
  { name: 'Bank Passbook', date: 'Jan 10, 2025', status: 'Verified', type: 'PDF', size: '3.4 MB' },
  { name: 'Qualification Certificate', date: 'Jan 12, 2025', status: 'Pending', type: 'PDF', size: '4.2 MB' },
  { name: 'Relieving Letter (Previous)', date: 'Jan 12, 2025', status: 'Not Uploaded', type: '-', size: '-' },
];

const FILE_TYPE_COLORS = {
  PDF: 'bg-red-100 text-red-600',
  IMG: 'bg-blue-100 text-blue-600',
  DOC: 'bg-blue-100 text-blue-600',
};

export default function Documents() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-navy)]">My Documents</h1>
          <p className="text-[var(--color-text-secondary)]">Access and manage your uploaded documents.</p>
        </div>
      </div>

      {/* Upload Area */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-8 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="h-6 w-6 text-[var(--color-primary)]" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">Upload a New Document</h3>
          <p className="text-sm text-gray-500 mb-4">PDF, JPG, PNG supported. Max size 10MB.</p>
          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[var(--color-navy)] transition-colors">
              <Upload className="h-4 w-4" />
              Choose File to Upload
            </span>
            <input type="file" className="hidden" />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-[var(--color-border)]">
          <CardTitle>My Documents ({DOCUMENTS.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-[var(--color-border)]">
          {DOCUMENTS.map((doc, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${FILE_TYPE_COLORS[doc.type] || 'bg-gray-100 text-gray-400'}`}>
                {doc.type === '-' ? <FileText className="h-4 w-4" /> : doc.type}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{doc.name}</p>
                <p className="text-xs text-gray-400">{doc.date} {doc.size !== '-' ? `· ${doc.size}` : ''}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {doc.status === 'Verified' && <Badge variant="success"><Check className="h-3 w-3 mr-1" />Verified</Badge>}
                {doc.status === 'Pending' && <Badge variant="warning">Pending</Badge>}
                {doc.status === 'Not Uploaded' && (
                  <label className="cursor-pointer">
                    <span className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-md font-medium flex items-center gap-1 transition-colors">
                      <Upload className="h-3 w-3" /> Upload
                    </span>
                    <input type="file" className="hidden" />
                  </label>
                )}
                {doc.type !== '-' && (
                  <>
                    <button className="p-1.5 text-gray-400 hover:text-[var(--color-primary)] transition-colors rounded-md hover:bg-gray-100" title="View">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-[var(--color-primary)] transition-colors rounded-md hover:bg-gray-100" title="Download">
                      <Download className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
