import React, { useState, useRef } from 'react';
import { 
  Printer, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Copy, 
  Check, 
  Maximize2, 
  FileText, 
  CheckCircle2 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { formatINR } from '../../services/templateService';

export default function LiveA4PreviewPanel({
  offerData = {},
  onOpenFullscreen,
}) {
  const [zoom, setZoom] = useState(85);
  const [copied, setCopied] = useState(false);
  const docRef = useRef(null);

  const {
    employeeName = 'Rahul Kumar',
    employeeId = 'DS-001',
    offerNumber = 'DS/OFF/2026/001',
    position = 'Mandal Co-ordinator',
    department = 'Field Operations',
    district = 'Nellore',
    mandal = 'Kavali',
    joiningDate = '2026-09-15',
    employmentType = 'Full Time',
    probation = '3 Months',
    noticePeriod = '30 Days',
    reportingManager = 'District Lead',
    salary = { basic: 16000, travel: 3000, incentive: 3500, other: 1500 },
    responsibilities = [],
    termsAndConditions = [],
  } = offerData;

  const basic = Number(salary?.basic) || 0;
  const travel = Number(salary?.travel) || 0;
  const incentive = Number(salary?.incentive) || 0;
  const other = Number(salary?.other) || 0;
  const monthlyGross = basic + travel + incentive + other;
  const annualCtc = monthlyGross * 12;

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedJoining = joiningDate ? new Date(joiningDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) : 'To be communicated';

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (docRef.current) {
      navigator.clipboard.writeText(docRef.current.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const content = docRef.current?.innerHTML;
    const blob = new Blob([
      `<!DOCTYPE html><html><head><title>Offer Letter - ${employeeName}</title>
      <style>
        body { font-family: 'Times New Roman', serif; padding: 40px; color: #111; line-height: 1.5; font-size: 13px; }
        .header { text-align: center; border-bottom: 2px solid #234398; padding-bottom: 12px; margin-bottom: 20px; }
        .brand { font-size: 24px; font-weight: bold; color: #234398; letter-spacing: 2px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
        th { background: #f4f6fb; }
      </style>
      </head><body>${content}</body></html>`
    ], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Offer_Letter_${employeeName.replace(/\s+/g, '_')}_${employeeId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-xs flex flex-col h-full overflow-hidden">
      {/* Panel Toolbar */}
      <div className="p-3 border-b border-[var(--color-border)] bg-gray-50/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[var(--color-primary)]" />
          <span className="text-xs font-bold text-[var(--color-navy)]">Live A4 Document Preview</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Zoom controls */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(z - 10, 50))}
              className="p-1 hover:bg-gray-100 rounded text-gray-600"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[10px] text-gray-600">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(z + 10, 130))}
              className="p-1 hover:bg-gray-100 rounded text-gray-600"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
            title="Copy Text"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
            title="Print Document"
          >
            <Printer className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
            title="Download PDF/HTML"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          {onOpenFullscreen && (
            <button
              type="button"
              onClick={onOpenFullscreen}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
              title="Expand Fullscreen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* A4 Scroll Area */}
      <div className="flex-1 bg-gray-200/70 p-4 sm:p-6 overflow-y-auto overflow-x-hidden flex justify-center">
        <div
          ref={docRef}
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          className="bg-white text-gray-900 shadow-xl transition-transform duration-150 font-serif leading-relaxed text-xs w-[680px] p-8 sm:p-12 rounded-sm border border-gray-300 min-h-[960px] shrink-0"
        >
          {/* Official Letterhead */}
          <div className="border-b-2 border-[var(--color-primary)] pb-4 mb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center font-sans font-bold text-lg tracking-wider">
                  DS
                </div>
                <div>
                  <h1 className="text-xl font-sans font-black tracking-widest text-[var(--color-navy)]">
                    DS PROJECTS
                  </h1>
                  <p className="text-[9px] font-sans font-semibold text-[var(--color-primary)] uppercase tracking-wider">
                    DS PROJECTS PRIVATE LIMITED
                  </p>
                </div>
              </div>
              <div className="text-right font-sans text-[10px] text-gray-500 space-y-0.5">
                <p className="font-semibold text-gray-700">Corporate & Operational Head Office</p>
                <p>12-4, Nellore, Andhra Pradesh - 524001</p>
                <p>Web: www.dsprojects.in | Email: hr@dsprojects.in</p>
              </div>
            </div>
          </div>

          {/* Ref No & Date */}
          <div className="flex justify-between items-center text-[10px] font-sans text-gray-600 mb-4">
            <div>
              <span className="font-semibold text-gray-800">Ref No: </span>
              <span className="font-mono text-[var(--color-primary)] font-bold">{offerNumber}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800">Date: </span>
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Banner */}
          <div className="text-center py-1.5 bg-blue-50/70 border-y border-blue-100 font-sans my-3">
            <h2 className="text-xs font-bold tracking-wider uppercase text-[var(--color-navy)]">
              Formal Offer of Employment
            </h2>
          </div>

          {/* Addressee */}
          <div className="font-sans text-[11px] mb-4 space-y-0.5">
            <p className="font-bold text-gray-900">To,</p>
            <p className="font-bold text-gray-800 text-xs">{employeeName}</p>
            <p className="text-gray-500 font-mono text-[10px]">Employee ID: {employeeId}</p>
            <p className="text-gray-500 text-[10px]">District: {district || 'Nellore'}, Andhra Pradesh</p>
          </div>

          {/* Body */}
          <div className="space-y-3 text-justify text-[11px]">
            <p>
              <strong>Dear {employeeName},</strong>
            </p>
            <p>
              We are pleased to extend this formal offer of employment for the position of{' '}
              <strong className="text-[var(--color-navy)]">{position || 'Mandal Co-ordinator'}</strong> with{' '}
              <strong>DS PROJECTS PRIVATE LIMITED</strong>.
            </p>

            {/* Position Summary Table */}
            <div className="font-sans my-2">
              <table className="w-full text-[10px] border border-gray-200">
                <tbody>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td className="p-1.5 font-semibold text-gray-600 w-1/3">Designation / Role</td>
                    <td className="p-1.5 font-bold text-[var(--color-navy)]">{position || 'Mandal Co-ordinator'}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-1.5 font-semibold text-gray-600">Work Jurisdiction</td>
                    <td className="p-1.5 text-gray-800">
                      District: <strong>{district || 'Nellore'}</strong> | Mandal: <strong>{mandal || 'Kavali'}</strong>
                    </td>
                  </tr>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td className="p-1.5 font-semibold text-gray-600">Proposed Joining Date</td>
                    <td className="p-1.5 font-bold text-[var(--color-primary)]">{formattedJoining}</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 font-semibold text-gray-600">Probation & Notice</td>
                    <td className="p-1.5 text-gray-800">Probation: {probation} | Notice Period: {noticePeriod}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Compensation Breakdown Table */}
            <div className="font-sans pt-1">
              <h3 className="font-bold text-[10px] uppercase tracking-wider text-[var(--color-navy)] mb-1">
                1. Salary & Remuneration Structure
              </h3>
              <table className="w-full text-[10px] border border-gray-300">
                <thead>
                  <tr className="bg-[var(--color-navy)] text-white text-left">
                    <th className="p-1.5">Salary Component</th>
                    <th className="p-1.5 text-right">Monthly (₹)</th>
                    <th className="p-1.5 text-right">Annualized (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="p-1.5">Basic Salary</td>
                    <td className="p-1.5 text-right font-mono">{formatINR(basic)}</td>
                    <td className="p-1.5 text-right font-mono">{formatINR(basic * 12)}</td>
                  </tr>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <td className="p-1.5">Travel Allowance</td>
                    <td className="p-1.5 text-right font-mono">{formatINR(travel)}</td>
                    <td className="p-1.5 text-right font-mono">{formatINR(travel * 12)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-1.5">Performance Incentive</td>
                    <td className="p-1.5 text-right font-mono">{formatINR(incentive)}</td>
                    <td className="p-1.5 text-right font-mono">{formatINR(incentive * 12)}</td>
                  </tr>
                  {other > 0 && (
                    <tr className="border-b border-gray-200 bg-gray-50/50">
                      <td className="p-1.5">Other Allowances</td>
                      <td className="p-1.5 text-right font-mono">{formatINR(other)}</td>
                      <td className="p-1.5 text-right font-mono">{formatINR(other * 12)}</td>
                    </tr>
                  )}
                  <tr className="bg-blue-50 font-bold border-t-2 border-[var(--color-primary)]">
                    <td className="p-1.5 text-[var(--color-navy)]">Monthly Gross Salary</td>
                    <td className="p-1.5 text-right font-mono text-[var(--color-primary)]">{formatINR(monthlyGross)}</td>
                    <td className="p-1.5 text-right font-mono text-gray-500">-</td>
                  </tr>
                  <tr className="bg-[var(--color-lavender)]/50 font-bold border-t border-[var(--color-primary)]">
                    <td className="p-2 text-[var(--color-navy)]">Annual Cost to Company (CTC)</td>
                    <td className="p-2 text-right font-mono text-gray-500 text-[10px]">-</td>
                    <td className="p-2 text-right font-mono text-[var(--color-navy)] text-xs">{formatINR(annualCtc)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Responsibilities */}
            {responsibilities && responsibilities.length > 0 && (
              <div className="pt-1 font-sans">
                <h3 className="font-bold text-[10px] uppercase tracking-wider text-[var(--color-navy)] mb-1">
                  2. Key Roles & Deliverables
                </h3>
                <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-gray-800">
                  {responsibilities.slice(0, 4).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Signatures */}
            <div className="pt-6 border-t border-gray-200 mt-6 font-sans">
              <div className="grid grid-cols-2 gap-6 items-end">
                <div>
                  <div className="w-20 h-10 border border-dashed border-gray-300 rounded flex items-center justify-center text-[9px] text-gray-400 bg-gray-50/50 mb-1.5">
                    [ Official Seal ]
                  </div>
                  <p className="font-bold text-xs text-[var(--color-navy)]">For DS PROJECTS PVT LTD</p>
                  <p className="text-[10px] text-gray-500">Authorized Signatory</p>
                </div>
                <div className="text-right">
                  <div className="h-10 border-b border-gray-400 mb-1.5"></div>
                  <p className="font-bold text-xs text-gray-900">{employeeName}</p>
                  <p className="text-[10px] text-gray-500">Candidate Signature & Acceptance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
