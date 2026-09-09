/**
 * server/services/pdfGenerator.js
 * Generates official DS PROJECTS Appointment / Offer Letter PDF
 */
import PDFDocument from 'pdfkit';

export function generateOfferLetterPDF(offerData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Offer Letter - ${offerData.employeeName || 'Candidate'}`,
          Author: 'DS Projects Private Limited',
          Subject: 'Letter of Appointment',
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      const {
        employeeName = 'Candidate',
        employeeId = 'DS-001',
        offerNumber = 'DS/OFF/2026/001',
        position = 'Mandal Co-ordinator',
        department = 'Field Operations & Monitoring Unit',
        district = 'Nellore',
        mandal = 'Kavali',
        joiningDate = new Date().toISOString().slice(0, 10),
        employmentType = 'Full Time',
        probation = '3 Months',
        noticePeriod = '30 Days',
        reportingManager = 'District Project Coordinator',
        salary = {},
        basic_salary,
        travel_allowance,
        incentive,
        other_allowance,
        monthly_total,
        annual_ctc,
      } = offerData;

      const basicNum = Number(basic_salary || salary.basic || 25000);
      const travelNum = Number(travel_allowance || salary.travel || 5000);
      const incentiveNum = Number(incentive || salary.incentive || 0);
      const otherNum = Number(other_allowance || salary.other || 0);
      const monthlyTotalNum = Number(monthly_total || salary.monthlyTotal || (basicNum + travelNum + incentiveNum + otherNum));
      const annualCtcNum = Number(annual_ctc || salary.annualCtc || (monthlyTotalNum * 12));

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

      // ── Header Banner ──────────────────────────────────────────────────
      doc.rect(40, 40, 515, 60).fill('#1e3a8a');
      doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold').text('DS PROJECTS PRIVATE LIMITED', 55, 52);
      doc.fontSize(9).font('Helvetica').text('Corporate Workforce Management & Operations Unit • Andhra Pradesh', 55, 75);
      doc.fontSize(8).font('Helvetica').text('Email: hr@dsprojects.in | Web: www.dsprojects.in', 330, 75, { align: 'right', width: 210 });

      doc.moveDown(2.5);

      // ── Letter Metadata ───────────────────────────────────────────────
      const startY = 115;
      doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold').text(`Ref No: ${offerNumber}`, 40, startY);
      doc.font('Helvetica').text(`Date: ${formattedDate}`, 380, startY, { align: 'right', width: 175 });

      doc.moveDown(0.8);
      doc.font('Helvetica-Bold').text('To,', 40);
      doc.font('Helvetica-Bold').fontSize(10).text(employeeName, 40);
      doc.fontSize(9).font('Helvetica').text(`Employee ID: ${employeeId}`, 40);
      doc.text(`Location: ${mandal ? `${mandal}, ` : ''}${district}, Andhra Pradesh`, 40);
      if (offerData.phone) doc.text(`Contact: +91 ${offerData.phone} | Email: ${offerData.email || ''}`, 40);

      doc.moveDown(1);

      // ── Document Title ────────────────────────────────────────────────
      doc.rect(40, doc.y, 515, 24).fill('#f1f5f9');
      doc.fillColor('#1e3a8a').fontSize(12).font('Helvetica-Bold').text('OFFICIAL LETTER OF APPOINTMENT', 40, doc.y - 18, { align: 'center', width: 515 });

      doc.moveDown(1);

      // ── Subject ───────────────────────────────────────────────────────
      doc.fillColor('#1e3a8a').fontSize(9).font('Helvetica-Bold').text(`SUBJECT: APPOINTMENT FOR THE POSITION OF ${position.toUpperCase()}`, 40);
      doc.moveDown(0.5);

      // ── Salutation & Introduction ─────────────────────────────────────
      doc.fillColor('#334155').fontSize(9).font('Helvetica').text(`Dear ${employeeName},`, 40);
      doc.moveDown(0.4);
      doc.text(
        `On behalf of DS Projects Private Limited, we are pleased to extend this formal offer of employment for the post of ${position} in the ${department}. Your deployment jurisdiction will be ${mandal} Mandal, ${district} District, Andhra Pradesh.`,
        { align: 'justify', lineGap: 2 }
      );

      doc.moveDown(0.8);

      // ── 1. Commencement & Term ─────────────────────────────────────────
      doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(9.5).text('1. COMMENCEMENT & REPORTING');
      doc.fillColor('#334155').font('Helvetica').fontSize(9).text(
        `Your official date of joining is confirmed as ${formattedJoining}. You will report directly to the ${reportingManager} and adhere to the project operational guidelines of the organization.`,
        { align: 'justify', lineGap: 2 }
      );

      doc.moveDown(0.8);

      // ── 2. Roles & Responsibilities ───────────────────────────────────
      doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(9.5).text('2. KEY ROLES & RESPONSIBILITIES');
      doc.fillColor('#334155').font('Helvetica').fontSize(9);
      
      const responsibilities = [
        `Operational Execution: Execute all project tasks and daily field assignments within ${mandal} jurisdiction.`,
        'Attendance & Reporting: Mark daily attendance in the Employee Portal and submit scheduled activity reports.',
        'Compliance & Integrity: Maintain strict adherence to organizational data confidentiality and professional conduct.',
      ];

      responsibilities.forEach(r => {
        doc.text(`•  ${r}`, { indent: 10, lineGap: 1.5 });
      });

      doc.moveDown(0.8);

      // ── 3. Remuneration Table ──────────────────────────────────────────
      doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(9.5).text('3. COMPENSATION & SALARY BREAKDOWN (CTC)');
      doc.moveDown(0.3);

      const tableTop = doc.y;
      const col1 = 40;
      const col2 = 210;
      const col3 = 410;
      const rowHeight = 18;

      // Table Header
      doc.rect(col1, tableTop, 515, rowHeight).fill('#1e3a8a');
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
      doc.text('Component Header', col1 + 8, tableTop + 5);
      doc.text('Details / Terms', col2 + 8, tableTop + 5);
      doc.text('Monthly Amount (₹)', col3, tableTop + 5, { align: 'right', width: 135 });

      let currentY = tableTop + rowHeight;

      const allowanceName = position.toLowerCase().includes('district')
        ? 'District Work Allowance'
        : 'Field Work Allowance';

      const rows = [
        ['Basic Monthly Salary', 'Fixed Monthly Component', `₹${basicNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
      ];

      if (travelNum > 0) {
        rows.push([allowanceName, 'Field Work & Mobility Allowance', `₹${travelNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`]);
      }
      if (otherNum > 0) {
        rows.push(['Statutory Contributions (ESI & PF)', 'Employer & Employee Statutory Coverage', `₹${otherNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`]);
      }
      if (incentiveNum > 0) {
        rows.push(['Performance Incentive', 'Project Output & Target Metric', `₹${incentiveNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`]);
      }

      doc.font('Helvetica').fontSize(8);
      rows.forEach(([comp, details, amt], index) => {
        const bg = index % 2 === 0 ? '#f8fafc' : '#ffffff';
        doc.rect(col1, currentY, 515, rowHeight).fill(bg);
        doc.fillColor('#0f172a').font('Helvetica-Bold').text(comp, col1 + 8, currentY + 5);
        doc.fillColor('#475569').font('Helvetica').text(details, col2 + 8, currentY + 5);
        doc.font('Helvetica-Bold').fillColor('#0f172a').text(amt, col3, currentY + 5, { align: 'right', width: 135 });
        currentY += rowHeight;
      });

      // Total Monthly Remuneration
      doc.rect(col1, currentY, 515, rowHeight).fill('#eff6ff');
      doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(8.5).text('TOTAL MONTHLY REMUNERATION (CTC)', col1 + 8, currentY + 5);
      doc.text(`₹${monthlyTotalNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, col3, currentY + 5, { align: 'right', width: 135 });
      currentY += rowHeight;

      // Annual CTC
      doc.rect(col1, currentY, 515, rowHeight + 2).fill('#1e3a8a');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8.5).text('ANNUAL COST TO COMPANY (CTC)', col1 + 8, currentY + 6);
      doc.text(`₹${annualCtcNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / annum`, col3 - 20, currentY + 6, { align: 'right', width: 155 });
      currentY += rowHeight + 10;

      doc.y = currentY;

      // ── 4. Terms & Conditions ──────────────────────────────────────────
      doc.fillColor('#1e3a8a').font('Helvetica-Bold').fontSize(9.5).text('4. TERMS OF APPOINTMENT');
      doc.fillColor('#334155').font('Helvetica').fontSize(8.5);
      doc.text(`• Probation Period: Your appointment is subject to a probation period of ${probation}.`, { indent: 10, lineGap: 1 });
      doc.text(`• Notice Period: In the event of resignation or termination, a notice period of ${noticePeriod} or salary in lieu thereof shall apply.`, { indent: 10, lineGap: 1 });
      doc.text('• Code of Conduct: You agree to uphold all statutory company policies, ethical standards, and workplace guidelines.', { indent: 10, lineGap: 1 });

      doc.moveDown(1);

      // ── Signatures ─────────────────────────────────────────────────────
      const sigY = Math.min(doc.y + 10, 710);
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9).text('For DS PROJECTS PRIVATE LIMITED', 40, sigY);
      doc.font('Helvetica').fontSize(8.5).text('Authorized Signatory', 40, sigY + 35);
      doc.text('Head of HR Administration & Operations', 40, sigY + 47);

      doc.font('Helvetica-Bold').fontSize(9).text('CANDIDATE ACCEPTANCE', 380, sigY, { align: 'right', width: 175 });
      doc.font('Helvetica').fontSize(8.5).text('Signature: ___________________', 380, sigY + 35, { align: 'right', width: 175 });
      doc.text(`Name: ${employeeName}`, 380, sigY + 47, { align: 'right', width: 175 });

      // ── Footer ─────────────────────────────────────────────────────────
      doc.rect(40, 780, 515, 1).fill('#cbd5e1');
      doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica').text('DS Projects Private Limited • Official Employment Offer & Appointment Letter • Confidential', 40, 786, { align: 'center', width: 515 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
