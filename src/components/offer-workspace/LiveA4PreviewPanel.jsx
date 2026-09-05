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
    salary = { basic: 25000, travel: 5000, incentive: 0, other: 0 },
    responsibilities = [],
    termsAndConditions = [],
    jobDescription = '',
    pdfTitle = 'APPOINTMENT FOR THE POST OF MANDAL COORDINATOR',
    documentMode = 'generate',
    manualPdf = null,
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
          className="bg-white text-gray-900 shadow-xl transition-transform duration-150 font-sans leading-relaxed text-[11px] w-[794px] min-h-[1123px] shrink-0 print:shadow-none print:m-0 print:border-none relative"
        >
          {/* Official Letterhead Banner */}
          <div className="bg-[#2b3c8f] text-white p-6 pb-5 flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-wide mb-2">DS PROJECTS</h1>
              <div className="text-[10px] text-white/90 uppercase">
                {department?.split('•').map((line, i) => (
                  <p key={i}>{line.trim()}</p>
                )) || <p>Implementation & Monitoring Unit</p>}
              </div>
            </div>
            <div className="text-right text-[9px] text-white/90 leading-snug max-w-[240px]">
              <p className="font-bold text-white mb-0.5">Corporate Office</p>
              <p>DS Projects Head Office</p>
              <p>Industrial Development Zone</p>
              <p>Email: hr@dsprojects.com | Web: www.dsprojects.com</p>
            </div>
          </div>

          <div className="px-10 py-8">
            {/* Metadata Section */}
            <div className="flex justify-between items-start text-[10px] mb-8">
              <div className="space-y-0.5 max-w-[50%]">
                <p><span className="font-bold">Ref No:</span> {offerNumber}</p>
                <p className="font-bold mt-2">To:</p>
                <p className="font-bold">{employeeName}</p>
                <p>Employee ID: {employeeId}</p>
                <p>{district || 'Assigned District'}, Andhra Pradesh</p>
                <p className="mt-1"><span className="font-bold">Mobile:</span> {offerData.phone || '+91 -'} | <span className="font-bold">Email:</span> {offerData.email || '-'}</p>
              </div>
              <div className="text-right space-y-1">
                <p><span className="font-bold">Date:</span> {formattedDate}</p>
                <p><span className="font-bold">Posting Region:</span> {mandal ? `${mandal}, ${district}` : 'Assigned Jurisdiction'}</p>
                <p><span className="font-bold">Employment Type:</span> {employmentType}</p>
              </div>
            </div>

            {/* Letter Title */}
            <div className="text-center font-bold text-[#2b3c8f] text-xl border-y-[1.5px] border-[#2b3c8f] py-2.5 mb-8 tracking-[0.2em] uppercase">
              LETTER OF APPOINTMENT
            </div>

            {/* Subject */}
            <div className="bg-blue-50/40 border-l-4 border-[#2b3c8f] pl-3 py-2 mb-6">
              <p className="font-bold text-[#2b3c8f] text-[11px] uppercase tracking-wide">
                SUBJECT: {pdfTitle}
              </p>
            </div>

            {/* Introduction */}
            <div className="mb-6 text-justify">
              <p className="mb-3">Dear <span className="font-bold">{employeeName}</span>,</p>
              <p>{jobDescription}</p>
            </div>

            {/* Section 1: Commencement */}
            <div className="mb-6">
              <h2 className="text-[#2b3c8f] font-bold text-xs uppercase border-l-4 border-[#2b3c8f] pl-2 mb-3 tracking-wide">
                1. COMMENCEMENT & DESIGNATION
              </h2>
              <p className="text-justify">
                Your appointment will take effect from <span className="font-bold">{formattedJoining}</span>. You will be designated as <span className="font-bold">{position}</span> and assigned to carry out operations across your designated jurisdiction under the guidance of the {reportingManager} of DS Projects.
              </p>
            </div>

            {/* Section 2: Responsibilities */}
            {responsibilities && responsibilities.length > 0 && (
              <div className="mb-6">
                <h2 className="text-[#2b3c8f] font-bold text-xs uppercase border-l-4 border-[#2b3c8f] pl-2 mb-3 tracking-wide">
                  2. KEY ROLES AND RESPONSIBILITIES
                </h2>
                <p className="mb-2">As {position}, your core duties and responsibilities shall include, but are not limited to, the following:</p>
                <ul className="space-y-1.5 ml-1">
                  {responsibilities.map((r, i) => {
                    const [boldPart, ...rest] = r.split(':');
                    if (rest.length > 0) {
                      return (
                        <li key={i} className="flex items-start">
                          <span className="mr-2 text-lg leading-[14px] text-gray-800">•</span>
                          <span className="text-justify"><span className="font-bold">{boldPart}:</span>{rest.join(':')}</span>
                        </li>
                      );
                    }
                    return (
                      <li key={i} className="flex items-start">
                        <span className="mr-2 text-lg leading-[14px] text-gray-800">•</span>
                        <span className="text-justify">{r}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Section 3: Remuneration */}
            <div className="mb-6">
              <h2 className="text-[#2b3c8f] font-bold text-xs uppercase border-l-4 border-[#2b3c8f] pl-2 mb-3 tracking-wide">
                3. REMUNERATION & COMPENSATION STRUCTURE
              </h2>
              <p className="mb-3">You will receive a monthly consolidated salary package structured as outlined below:</p>
              <table className="w-full border-collapse border border-gray-300 text-[10px] mb-2">
                <thead>
                  <tr className="bg-[#2b3c8f] text-white text-left">
                    <th className="p-2 border border-gray-300 font-medium">Component Header</th>
                    <th className="p-2 border border-gray-300 font-medium">Details / Terms</th>
                    <th className="p-2 border border-gray-300 font-medium text-right">Monthly Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-gray-300 font-bold">Basic Monthly Salary</td>
                    <td className="p-2 border border-gray-300 text-gray-600">Fixed Monthly Component</td>
                    <td className="p-2 border border-gray-300 text-right font-mono font-bold text-gray-800">{formatINR(basic)}</td>
                  </tr>
                  {travel > 0 && (
                    <tr>
                      <td className="p-2 border border-gray-300 font-bold">Allowance</td>
                      <td className="p-2 border border-gray-300 text-gray-600">Field Mobility & Travel Allowance</td>
                      <td className="p-2 border border-gray-300 text-right font-mono font-bold text-gray-800">{formatINR(travel)}</td>
                    </tr>
                  )}
                  {other > 0 && (
                    <tr>
                      <td className="p-2 border border-gray-300 font-bold">Statutory Contributions (ESI & PF)</td>
                      <td className="p-2 border border-gray-300 text-gray-600">Employer & Employee Statutory Coverage</td>
                      <td className="p-2 border border-gray-300 text-right font-mono font-bold text-gray-800">{formatINR(other)}</td>
                    </tr>
                  )}
                  <tr className="bg-blue-50/50">
                    <td colSpan={2} className="p-2 border border-gray-300 font-bold text-[#2b3c8f] uppercase">Total Monthly Remuneration (CTC)</td>
                    <td className="p-2 border border-gray-300 text-right font-mono font-bold text-[#2b3c8f]">{formatINR(monthlyGross)}</td>
                  </tr>
                </tbody>
              </table>
              {other > 0 && (
                <p className="text-[9px] text-gray-500 italic">* Statutory contributions (Employee State Insurance & Provident Fund) will be administered in accordance with applicable labor regulations.</p>
              )}
            </div>

            {/* Remaining Sections from termsAndConditions */}
            {termsAndConditions && termsAndConditions.map((term, index) => (
              <div key={index} className="mb-6">
                {term.title && (
                  <h2 className="text-[#2b3c8f] font-bold text-xs uppercase border-l-4 border-[#2b3c8f] pl-2 mb-3 tracking-wide">
                    {3 + index + 1}. {term.title}
                  </h2>
                )}
                <p className="text-justify">
                  {term.text.includes(':') && !term.title ? (
                    <>
                      <span className="font-bold">{term.text.split(':')[0]}:</span>
                      {term.text.substring(term.text.indexOf(':') + 1)}
                    </>
                  ) : (
                    term.text
                  )}
                </p>
              </div>
            ))}

            {/* Signatures */}
            <div className="mt-12 pt-8 text-left">
              <p className="font-bold mb-8">For DS PROJECTS</p>
              <div className="flex justify-between items-end border-b border-dashed border-gray-300 pb-4 mb-2">
                <div>
                  <p className="font-bold mt-12">Authorized Signatory</p>
                  <p className="text-gray-600">Head of Human Resources & Operations</p>
                  <p className="text-gray-600">DS Projects Corporate Management</p>
                </div>
                <div className="text-gray-400 italic text-[10px]">
                  Official Seal / Stamp
                </div>
              </div>
            </div>

            {/* Declaration Slip */}
            <div className="mt-8 border border-gray-300 rounded-lg p-5 bg-gray-50/30">
              <h3 className="font-bold text-[#2b3c8f] mb-4">DECLARATION & ACCEPTANCE OF APPOINTMENT</h3>
              <p className="text-justify mb-8 leading-loose">
                I, <span className="inline-block border-b border-gray-400 w-64"></span>, have read, understood, and accept all terms and conditions of employment stated in this appointment letter for the position of <span className="font-bold">{position}</span> at <span className="font-bold">DS Projects</span>. I confirm my readiness to join on or before <span className="inline-block border-b border-gray-400 w-32"></span>.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <p><span className="font-bold mr-2">Signature of Candidate:</span> <span className="inline-block border-b border-gray-400 w-40"></span></p>
                  <p><span className="font-bold mr-2">Full Name:</span> <span className="inline-block border-b border-gray-400 w-52"></span></p>
                </div>
                <div className="space-y-6 text-right">
                  <p><span className="font-bold mr-2">Date:</span> <span className="inline-block border-b border-gray-400 w-32"></span></p>
                  <p><span className="font-bold mr-2">Place:</span> <span className="inline-block border-b border-gray-400 w-32"></span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
