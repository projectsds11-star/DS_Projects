import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Copy, 
  Check, 
  ArrowLeft, 
  ChevronRight, 
  Briefcase, 
  IndianRupee, 
  Save 
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { MASTER_TEMPLATES, JOB_POSITIONS, formatINR } from '../../services/templateService';

export default function TemplateManager() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('Mandal Co-ordinator');
  const [templates, setTemplates] = useState(MASTER_TEMPLATES);
  const [savedToast, setSavedToast] = useState(false);

  const currentTpl = templates[selectedRole];

  const handleUpdate = (field, val) => {
    setTemplates(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [field]: val,
      },
    }));
  };

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast */}
      {savedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>Master template saved successfully.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/admin/onboarding')}
            className="mt-1 p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <nav className="flex items-center gap-1 text-xs text-gray-400 mb-1">
              <Link to="/admin/onboarding" className="hover:text-[var(--color-primary)] transition-colors">Onboarding</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-600 font-medium">Templates</span>
            </nav>
            <h1 className="text-xl font-bold text-[var(--color-navy)]">Offer Letter Master Templates</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage default role job descriptions, salary benchmarks, and email structures across positions.
            </p>
          </div>
        </div>

        <Button size="sm" icon={Save} onClick={handleSave}>
          Save Template Changes
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Roles Sidebar */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 px-1 mb-2">Job Positions</p>
          {JOB_POSITIONS.map(pos => (
            <button
              key={pos}
              onClick={() => setSelectedRole(pos)}
              className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                selectedRole === pos
                  ? 'border-[var(--color-primary)] bg-[#D8F5FA] text-[var(--color-primary)] shadow-xs'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{pos}</span>
              <ChevronRight className="h-4 w-4 opacity-60" />
            </button>
          ))}
        </div>

        {/* Template Content Editor */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="border-b border-[var(--color-border)] p-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm">Template: {selectedRole}</CardTitle>
                <p className="text-xs text-gray-400 mt-0.5">Department: {currentTpl.department}</p>
              </div>
              <span className="text-xs font-mono font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                Default CTC: {formatINR((currentTpl.defaultSalary.basic + currentTpl.defaultSalary.travel + currentTpl.defaultSalary.incentive + currentTpl.defaultSalary.other) * 12)}
              </span>
            </CardHeader>
            <CardContent className="p-6 space-y-5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Default Role Overview / Description
                </label>
                <textarea
                  rows={4}
                  value={currentTpl.jobDescription}
                  onChange={(e) => handleUpdate('jobDescription', e.target.value)}
                  className="w-full p-3 border border-[var(--color-border)] rounded-lg font-sans text-xs focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Default Email Subject
                </label>
                <input
                  type="text"
                  value={currentTpl.emailSubject}
                  onChange={(e) => handleUpdate('emailSubject', e.target.value)}
                  className="w-full h-9 px-3 border border-[var(--color-border)] rounded-lg font-sans text-xs focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Default Email Welcome Body
                </label>
                <textarea
                  rows={8}
                  value={currentTpl.emailBody}
                  onChange={(e) => handleUpdate('emailBody', e.target.value)}
                  className="w-full p-3 border border-[var(--color-border)] rounded-lg font-sans text-xs focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
