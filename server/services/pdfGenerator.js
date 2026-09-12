/**
 * server/services/pdfGenerator.js
 * Generates official DS PROJECTS Appointment / Offer Letter PDF
 * Clean, structured A4 layout — no overlapping elements.
 */
import PDFDocument from 'pdfkit';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Format number as Indian currency string using Rs. (PDFKit Helvetica has no ₹ glyph) */
function inr(num) {
  return `Rs. ${Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

/** Format a date string as "11 September 2026" */
function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return String(d);
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────
const PAGE_W   = 595.28;  // A4 width in points
const PAGE_H   = 841.89;  // A4 height
const MARGIN   = 45;
const CONTENT_W = PAGE_W - MARGIN * 2;   // 505.28 pts
const NAVY     = '#1e3a8a';
const SLATE    = '#334155';
const LIGHT_BG = '#f1f5f9';
const WHITE    = '#ffffff';

// ── Main export ───────────────────────────────────────────────────────────────
export function generateOfferLetterPDF(offerData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
        info: {
          Title: `Appointment Letter - ${offerData.employeeName || 'Candidate'}`,
          Author: 'DS Projects Private Limited',
          Subject: 'Official Letter of Appointment',
          Creator: 'DS Projects HRMS',
        },
        autoFirstPage: true,
      });

      const buffers = [];
      doc.on('data', b => buffers.push(b));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // ── Extract data ──────────────────────────────────────────────────────
      const {
        employeeName  = 'Candidate',
        employeeId    = 'DS-001',
        offerNumber   = 'DS/OFF/2026/001',
        position      = 'Mandal Co-ordinator',
        department    = 'Field Operations',
        district      = 'Nellore',
        mandal        = 'Kavali',
        joiningDate,
        probation     = '3 Months',
        noticePeriod  = '30 Days',
        reportingManager = 'District Project Coordinator',
        salary        = {},
        basic_salary, travel_allowance, incentive, other_allowance, monthly_total, annual_ctc,
        email = '', phone = '',
      } = offerData;

      const basicNum    = Number(basic_salary    || salary.basic        || 25000);
      const travelNum   = Number(travel_allowance || salary.travel       || 5000);
      const incentiveNum= Number(incentive        || salary.incentive    || 0);
      const otherNum    = Number(other_allowance  || salary.other        || 0);
      const monthlyNum  = Number(monthly_total    || salary.monthlyTotal || basicNum + travelNum + incentiveNum + otherNum);
      const annualNum   = Number(annual_ctc       || salary.annualCtc   || monthlyNum * 12);

      const today         = fmtDate(new Date());
      const joiningFmt    = joiningDate ? fmtDate(joiningDate) : 'To be communicated';
      const allowanceName = position.toLowerCase().includes('district') ? 'District Work Allowance' : 'Field Work Allowance';

      // ─────────────────────────────────────────────────────────────────────
      // SECTION HELPER — track Y position manually for precision
      // ─────────────────────────────────────────────────────────────────────
      let y = MARGIN;

      function ensureSpace(needed) {
        if (y + needed > PAGE_H - MARGIN - 60) {
          doc.addPage();
          y = MARGIN;
        }
      }

      // ── 1. HEADER BANNER ─────────────────────────────────────────────────
      doc.rect(MARGIN, y, CONTENT_W, 56).fill(NAVY);
      doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(17)
         .text('DS PROJECTS PRIVATE LIMITED', MARGIN + 12, y + 10, { width: CONTENT_W - 12 });
      doc.font('Helvetica').fontSize(8.5)
         .text('Corporate Workforce Management & Operations Unit  •  Andhra Pradesh', MARGIN + 12, y + 32);
      doc.fontSize(8)
         .text('Email: hr@dsprojects.in  |  Web: www.dsprojects.in', MARGIN + 12, y + 44, { width: CONTENT_W - 24, align: 'right' });
      y += 70;

      // ── 2. REF / DATE LINE ───────────────────────────────────────────────
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8.5)
         .text(`Ref No: ${offerNumber}`, MARGIN, y);
      doc.font('Helvetica').fontSize(8.5)
         .text(`Date: ${today}`, MARGIN, y, { width: CONTENT_W, align: 'right' });
      y += 20;

      // ── 3. THIN RULE ─────────────────────────────────────────────────────
      doc.rect(MARGIN, y, CONTENT_W, 0.5).fill('#cbd5e1');
      y += 8;

      // ── 4. TO / ADDRESSEE BLOCK ──────────────────────────────────────────
      doc.fillColor(SLATE).font('Helvetica').fontSize(9).text('To,', MARGIN, y);
      y += 13;
      doc.font('Helvetica-Bold').fontSize(9.5).text(employeeName, MARGIN, y);
      y += 13;
      doc.font('Helvetica').fontSize(8.5).text(`Employee ID: ${employeeId}`, MARGIN, y);
      y += 12;
      doc.text(`Location: ${mandal}, ${district}, Andhra Pradesh`, MARGIN, y);
      y += 12;
      if (phone || email) {
        const contact = [phone ? `Contact: +91 ${phone}` : '', email ? `Email: ${email}` : ''].filter(Boolean).join('  |  ');
        doc.text(contact, MARGIN, y, { width: CONTENT_W });
        y += 12;
      }
      y += 8;

      // ── 5. DOCUMENT TITLE BAND ───────────────────────────────────────────
      doc.rect(MARGIN, y, CONTENT_W, 22).fill(LIGHT_BG);
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(11)
         .text('OFFICIAL LETTER OF APPOINTMENT', MARGIN, y + 6, { width: CONTENT_W, align: 'center' });
      y += 30;

      // ── 6. SUBJECT LINE ──────────────────────────────────────────────────
      doc.rect(MARGIN, y, CONTENT_W, 18).fill('#e8eef8');
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(8.5)
         .text(`SUBJECT: APPOINTMENT FOR THE POSITION OF ${position.toUpperCase()}`, MARGIN + 8, y + 5, { width: CONTENT_W - 16 });
      y += 26;

      // ── 7. SALUTATION & INTRODUCTION ────────────────────────────────────
      doc.fillColor(SLATE).font('Helvetica').fontSize(9)
         .text(`Dear ${employeeName},`, MARGIN, y);
      y += 14;
      const intro = `On behalf of DS Projects Private Limited, we are pleased to extend this formal offer of employment for the post of ${position} in the ${department}. Your deployment jurisdiction will be ${mandal} Mandal, ${district} District, Andhra Pradesh.`;
      doc.text(intro, MARGIN, y, { width: CONTENT_W, align: 'justify', lineGap: 2 });
      y += doc.heightOfString(intro, { width: CONTENT_W, lineGap: 2 }) + 14;

      // ── 8. SECTION 1: COMMENCEMENT ───────────────────────────────────────
      ensureSpace(50);
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(9.5).text('1. COMMENCEMENT & REPORTING', MARGIN, y);
      y += 14;
      const comm = `Your official date of joining is confirmed as ${joiningFmt}. You will report directly to the ${reportingManager} and adhere to the project operational guidelines of the organization.`;
      doc.fillColor(SLATE).font('Helvetica').fontSize(9)
         .text(comm, MARGIN, y, { width: CONTENT_W, align: 'justify', lineGap: 2 });
      y += doc.heightOfString(comm, { width: CONTENT_W, lineGap: 2 }) + 14;

      // ── 9. SECTION 2: ROLES & RESPONSIBILITIES ───────────────────────────
      ensureSpace(60);
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(9.5).text('2. KEY ROLES & RESPONSIBILITIES', MARGIN, y);
      y += 13;
      const respLines = [
        `Operational Execution: Execute all project tasks and daily field assignments within ${mandal} jurisdiction.`,
        'Attendance & Reporting: Mark daily attendance in the Employee Portal and submit scheduled activity reports.',
        'Compliance & Integrity: Maintain strict adherence to organizational data confidentiality and professional conduct.',
      ];
      doc.fillColor(SLATE).font('Helvetica').fontSize(9);
      respLines.forEach(line => {
        const h = doc.heightOfString(`\u2022  ${line}`, { width: CONTENT_W - 10, lineGap: 1.5 });
        ensureSpace(h + 4);
        doc.text(`\u2022  ${line}`, MARGIN + 8, y, { width: CONTENT_W - 8, lineGap: 1.5 });
        y += h + 4;
      });
      y += 10;

      // ── 10. SECTION 3: SALARY TABLE ──────────────────────────────────────
      ensureSpace(120);
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(9.5).text('3. COMPENSATION & SALARY BREAKDOWN (CTC)', MARGIN, y);
      y += 14;

      const COL1_W = 180, COL2_W = 160, COL3_W = CONTENT_W - COL1_W - COL2_W;
      const ROW_H  = 20;
      const c1 = MARGIN, c2 = MARGIN + COL1_W, c3 = MARGIN + COL1_W + COL2_W;

      // Header row
      doc.rect(c1, y, CONTENT_W, ROW_H).fill(NAVY);
      doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(8);
      doc.text('Component', c1 + 6, y + 6, { width: COL1_W - 6 });
      doc.text('Details / Terms',  c2 + 6, y + 6, { width: COL2_W - 6 });
      doc.text('Monthly (Rs.)',     c3,     y + 6, { width: COL3_W - 6, align: 'right' });
      y += ROW_H;

      // Data rows
      const rows = [['Basic Monthly Salary', 'Fixed Monthly Component', inr(basicNum)]];
      if (travelNum   > 0) rows.push([allowanceName, 'Field Work & Mobility Allowance',         inr(travelNum)]);
      if (otherNum    > 0) rows.push(['Statutory Contributions (ESI & PF)', 'Employer & Employee Statutory',   inr(otherNum)]);
      if (incentiveNum> 0) rows.push(['Performance Incentive', 'Project Output & Target Metric',             inr(incentiveNum)]);

      rows.forEach(([comp, det, amt], i) => {
        doc.rect(c1, y, CONTENT_W, ROW_H).fill(i % 2 === 0 ? '#f8fafc' : WHITE);
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8).text(comp, c1 + 6, y + 6, { width: COL1_W - 6 });
        doc.fillColor('#475569').font('Helvetica').fontSize(8).text(det,  c2 + 6, y + 6, { width: COL2_W - 6 });
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8).text(amt, c3, y + 6, { width: COL3_W - 6, align: 'right' });
        y += ROW_H;
      });

      // Monthly total row
      doc.rect(c1, y, CONTENT_W, ROW_H).fill('#dbeafe');
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(8.5)
         .text('TOTAL MONTHLY REMUNERATION (CTC)', c1 + 6, y + 6, { width: COL1_W + COL2_W - 6 });
      doc.text(inr(monthlyNum), c3, y + 6, { width: COL3_W - 6, align: 'right' });
      y += ROW_H;

      // Annual CTC row
      doc.rect(c1, y, CONTENT_W, ROW_H + 2).fill(NAVY);
      doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(8.5)
         .text('ANNUAL COST TO COMPANY (CTC)', c1 + 6, y + 6, { width: COL1_W + COL2_W - 6 });
      doc.text(`${inr(annualNum)} / annum`, c3, y + 6, { width: COL3_W - 6, align: 'right' });
      y += ROW_H + 14;

      // ── 11. SECTION 4: TERMS OF APPOINTMENT ─────────────────────────────
      ensureSpace(80);
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(9.5).text('4. TERMS OF APPOINTMENT', MARGIN, y);
      y += 13;
      const terms = [
        `Probation Period: Your appointment is subject to a probation period of ${probation}.`,
        `Notice Period: In the event of resignation or termination, a notice period of ${noticePeriod} or salary in lieu thereof shall apply.`,
        'Code of Conduct: You agree to uphold all statutory company policies, ethical standards, and workplace guidelines.',
        'Jurisdiction: Any disputes arising out of this appointment shall be subject to the jurisdiction of courts in Andhra Pradesh.',
      ];
      doc.fillColor(SLATE).font('Helvetica').fontSize(9);
      terms.forEach(t => {
        const h = doc.heightOfString(`\u2022  ${t}`, { width: CONTENT_W - 8, lineGap: 1.5 });
        ensureSpace(h + 4);
        doc.text(`\u2022  ${t}`, MARGIN + 8, y, { width: CONTENT_W - 8, lineGap: 1.5 });
        y += h + 4;
      });
      y += 12;

      // ── 12. ACCEPTANCE NOTE ──────────────────────────────────────────────
      ensureSpace(30);
      doc.rect(MARGIN, y, CONTENT_W, 24).fill('#f0fdf4');
      doc.fillColor('#166534').font('Helvetica').fontSize(8.5)
         .text('By accepting this offer, you confirm that you have read, understood, and agree to all the terms and conditions mentioned above.', MARGIN + 8, y + 7, { width: CONTENT_W - 16, align: 'justify' });
      y += 34;

      // ── 13. SIGNATURE BLOCK ──────────────────────────────────────────────
      ensureSpace(90);
      // Horizontal rule above signatures
      doc.rect(MARGIN, y, CONTENT_W, 0.5).fill('#cbd5e1');
      y += 12;

      const sigCol2X = MARGIN + CONTENT_W / 2 + 20;
      const sigColW  = CONTENT_W / 2 - 20;

      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9)
         .text('For DS PROJECTS PRIVATE LIMITED', MARGIN, y, { width: sigColW });
      doc.text('CANDIDATE ACCEPTANCE', sigCol2X, y, { width: sigColW, align: 'right' });
      y += 40;

      // Signature lines
      doc.rect(MARGIN, y, 150, 0.5).fill('#64748b');
      doc.rect(sigCol2X + sigColW - 150, y, 150, 0.5).fill('#64748b');
      y += 6;

      doc.fillColor(SLATE).font('Helvetica').fontSize(8.5)
         .text('Authorized Signatory', MARGIN, y)
         .text('Head of HR Administration & Operations', MARGIN, y + 11);
      doc.text('Signature', sigCol2X, y, { width: sigColW, align: 'right' })
         .text(`Name: ${employeeName}`, sigCol2X, y + 11, { width: sigColW, align: 'right' });
      y += 35;

      // ── 14. FOOTER ───────────────────────────────────────────────────────
      const footerY = PAGE_H - MARGIN - 18;
      doc.rect(MARGIN, footerY - 6, CONTENT_W, 0.5).fill('#e2e8f0');
      doc.fillColor('#94a3b8').font('Helvetica').fontSize(7.5)
         .text(
           'DS Projects Private Limited  •  Official Employment Appointment Letter  •  Confidential  •  Andhra Pradesh',
           MARGIN, footerY, { width: CONTENT_W, align: 'center' }
         );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
