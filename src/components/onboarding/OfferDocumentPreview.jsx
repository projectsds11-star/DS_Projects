import React, { useState, useRef } from 'react';
import { 
  Printer, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Copy, 
  Check, 
  Building2, 
  ShieldCheck, 
  FileCheck 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { formatINR } from '../../services/templateService';

export default function OfferDocumentPreview({ offerData = {} }) {
  const [zoom, setZoom] = useState(100);
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
    salary = { basic: 16000, travel: 3000, incentive: 3500, other: 1500, monthlyTotal: 24000, annualCtc: 288000 },
    jobDescription = '',
    responsibilities = [],
    termsAndConditions = [],
  } = offerData;

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
    // Generate a printable HTML download or trigger print to save as PDF
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
        .footer { margin-top: 40px; display: flex; justify-content: space-between; }
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

  const monthlyTotal = salary.monthlyTotal || ((salary.basic || 0) + (salary.travel || 0) + (salary.incentive || 0) + (salary.other || 0));
  const annualCtc = salary.annualCtc || (monthlyTotal * 12);

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[var(--color-border)] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">Document Tools:</span>
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(z - 10, 60))}
              className="p-1.5 hover:bg-white rounded text-gray-600 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-xs font-mono font-medium px-2 text-gray-700">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(z + 10, 140))}
              className="p-1.5 hover:bg-white rounded text-gray-600 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(100)}
              className="p-1.5 hover:bg-white rounded text-gray-600 transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" icon={copied ? Check : Copy} onClick={handleCopy}>
            {copied ? 'Copied' : 'Copy Text'}
          </Button>
          <Button variant="outline" size="sm" icon={Printer} onClick={handlePrint}>
            Print
          </Button>
          <Button size="sm" icon={Download} onClick={handleDownload}>
            Download Document
          </Button>
        </div>
      </div>

      {/* Document Viewport */}
      <div className="bg-gray-200/80 rounded-2xl p-4 sm:p-8 overflow-auto flex justify-center border border-gray-300 shadow-inner max-h-[800px]">
        <div
          ref={docRef}
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          className="bg-white text-gray-900 shadow-2xl transition-transform duration-200 font-serif leading-relaxed text-sm w-full max-w-[820px] p-8 sm:p-14 rounded-sm border border-gray-200 min-h-[1120px]"
        >
          {/* Header & Letterhead */}
          <div className="border-b-2 border-[var(--color-primary)] pb-5 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center font-sans font-bold text-xl tracking-wider">
                    DS
                  </div>
                  <div>
                    <h1 className="text-2xl font-sans font-black tracking-widest text-[var(--color-navy)]">
                      DS PROJECTS
                    </h1>
                    <p className="text-[10px] font-sans font-semibold text-[var(--color-primary)] uppercase tracking-wider">
                      DS PROJECTS PRIVATE LIMITED
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-center sm:text-right font-sans text-xs text-gray-500 space-y-0.5">
                <p className="font-semibold text-gray-700">Corporate & Operational Head Office</p>
                <p>12-4, Nellore, Andhra Pradesh - 524001</p>
                <p>Email: hr@dsprojects.in | Web: www.dsprojects.in</p>
                <p className="text-[10px] text-gray-400">CIN: U74999AP2024PTC123456</p>
              </div>
            </div>
          </div>

          {/* Reference & Date */}
          <div className="flex justify-between items-center text-xs font-sans text-gray-600 mb-6">
            <div>
              <span className="font-semibold text-gray-800">Ref No: </span>
              <span className="font-mono text-[var(--color-primary)] font-bold">{offerNumber}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800">Date: </span>
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Title Banner */}
          <div className="text-center py-2 bg-blue-50/70 border-y border-blue-100 font-sans my-4">
            <h2 className="text-base font-bold tracking-wider uppercase text-[var(--color-navy)]">
              Formal Offer of Employment
            </h2>
          </div>

          {/* Addressee */}
          <div className="font-sans text-xs mb-5 space-y-0.5">
            <p className="font-bold text-sm text-gray-900">To,</p>
            <p className="font-bold text-gray-800 text-sm">{employeeName}</p>
            <p className="text-gray-600 font-mono">Employee ID: {employeeId}</p>
            <p className="text-gray-600">Location: {district}, Andhra Pradesh</p>
          </div>

          {/* Greeting & Body */}
          <div className="space-y-4 text-justify">
            <p>
              <strong>Dear {employeeName},</strong>
            </p>
            <p>
              We are pleased to extend this formal offer of employment for the position of{' '}
              <strong className="text-[var(--color-navy)]">{position}</strong> with{' '}
              <strong>DS PROJECTS PRIVATE LIMITED</strong>. Your contributions will be pivotal in executing our district-wide developmental and field operations.
            </p>

            {/* Position Details Table */}
            <div className="my-3 font-sans">
              <table className="w-full text-xs border border-gray-200 rounded-md overflow-hidden">
                <tbody>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td className="p-2 font-semibold text-gray-600 w-1/3">Designation / Role</td>
                    <td className="p-2 font-bold text-[var(--color-navy)]">{position}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-2 font-semibold text-gray-600">Department</td>
                    <td className="p-2 text-gray-800">{department}</td>
                  </tr>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td className="p-2 font-semibold text-gray-600">Work Location & Jurisdiction</td>
                    <td className="p-2 text-gray-800">
                      District: <strong>{district}</strong> | Mandal: <strong>{mandal}</strong>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-2 font-semibold text-gray-600">Employment Type & Mode</td>
                    <td className="p-2 text-gray-800">{employmentType} · Field Execution</td>
                  </tr>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td className="p-2 font-semibold text-gray-600">Proposed Joining Date</td>
                    <td className="p-2 font-bold text-[var(--color-primary)]">{formattedJoining}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-2 font-semibold text-gray-600">Reporting Officer</td>
                    <td className="p-2 text-gray-800">{reportingManager}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold text-gray-600">Probation & Notice Period</td>
                    <td className="p-2 text-gray-800">
                      Probation: {probation} | Notice Period: {noticePeriod}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Compensation & Salary Breakdown */}
            <div className="font-sans pt-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--color-navy)] mb-2">
                1. Remuneration & Compensation Structure
              </h3>
              <table className="w-full text-xs border border-gray-300">
                <thead>
                  <tr className="bg-[var(--color-navy)] text-white text-left">
                    <th className="p-2 border-r border-navy-700">Salary Component</th>
                    <th className="p-2 border-r border-navy-700 text-right">Monthly (₹)</th>
                    <th className="p-2 text-right">Annualized (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="p-2">Basic Salary</td>
                    <td className="p-2 text-right font-mono">{formatINR(salary.basic || 0)}</td>
                    <td className="p-2 text-right font-mono">{formatINR((salary.basic || 0) * 12)}</td>
                  </tr>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <td className="p-2">Travel & Field Allowance</td>
                    <td className="p-2 text-right font-mono">{formatINR(salary.travel || 0)}</td>
                    <td className="p-2 text-right font-mono">{formatINR((salary.travel || 0) * 12)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="p-2">Performance & Output Incentive</td>
                    <td className="p-2 text-right font-mono">{formatINR(salary.incentive || 0)}</td>
                    <td className="p-2 text-right font-mono">{formatINR((salary.incentive || 0) * 12)}</td>
                  </tr>
                  {Number(salary.other) > 0 && (
                    <tr className="border-b border-gray-200 bg-gray-50/50">
                      <td className="p-2">Special / Other Allowances</td>
                      <td className="p-2 text-right font-mono">{formatINR(salary.other || 0)}</td>
                      <td className="p-2 text-right font-mono">{formatINR((salary.other || 0) * 12)}</td>
                    </tr>
                  )}
                  <tr className="bg-blue-50/80 font-bold border-t-2 border-[var(--color-primary)]">
                    <td className="p-2 text-[var(--color-navy)]">Total Monthly Gross Salary</td>
                    <td className="p-2 text-right font-mono text-[var(--color-primary)] text-sm">
                      {formatINR(monthlyTotal)}
                    </td>
                    <td className="p-2 text-right font-mono text-gray-500">-</td>
                  </tr>
                  <tr className="bg-[var(--color-lavender)]/50 font-bold text-base border-t border-[var(--color-primary)]">
                    <td className="p-2.5 text-[var(--color-navy)]">Total Annual Cost to Company (CTC)</td>
                    <td className="p-2.5 text-right font-mono text-gray-500 text-xs">-</td>
                    <td className="p-2.5 text-right font-mono text-[var(--color-navy)]">
                      {formatINR(annualCtc)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="text-[10px] text-gray-500 mt-1 italic">
                * Taxes, statutory deductions, and provident fund (if applicable) will be deducted as per prevailing government norms.
              </p>
            </div>

            {/* Responsibilities */}
            {responsibilities && responsibilities.length > 0 && (
              <div className="pt-2 font-sans">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--color-navy)] mb-1.5">
                  2. Key Roles & Responsibilities
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-800">
                  {responsibilities.map((resp, i) => (
                    <li key={i}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="pt-3 font-sans">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--color-navy)] mb-2">
                3. Terms & Conditions of Employment
              </h3>
              <div className="space-y-2 text-xs text-gray-800">
                {termsAndConditions.slice(0, 10).map(term => (
                  <div key={term.id} className="flex gap-2">
                    <span className="font-bold text-gray-900 shrink-0">{term.id}.</span>
                    <div>
                      <strong className="text-gray-900">{term.title}: </strong>
                      <span>{term.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Signatures & Seal */}
            <div className="pt-8 border-t border-gray-200 mt-8 font-sans">
              <div className="grid grid-cols-2 gap-8 items-end">
                {/* Company Signatory */}
                <div>
                  <div className="mb-2">
                    <div className="w-24 h-12 border border-dashed border-gray-300 rounded flex items-center justify-center text-[10px] text-gray-400 bg-gray-50/50">
                      [ Official Seal ]
                    </div>
                  </div>
                  <p className="font-bold text-sm text-[var(--color-navy)]">For DS PROJECTS PVT LTD</p>
                  <p className="text-xs text-gray-600 font-medium mt-0.5">Authorized Signatory</p>
                  <p className="text-[10px] text-gray-400">HR Directorate & Governance</p>
                </div>

                {/* Candidate Acceptance */}
                <div className="text-right">
                  <div className="h-12 border-b border-gray-400 mb-2"></div>
                  <p className="font-bold text-sm text-gray-900">{employeeName}</p>
                  <p className="text-xs text-gray-500">Candidate Signature & Acceptance Date</p>
                  <p className="text-[10px] text-gray-400">(I accept all terms & conditions stipulated above)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
