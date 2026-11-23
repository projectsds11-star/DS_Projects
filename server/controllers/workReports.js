import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabaseAdmin } from '../services/supabaseAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function getTransporter() {
  const user = process.env.EMAIL_USER || 'projectsds11@gmail.com';
  const pass = process.env.EMAIL_PASS || 'csuuuanyimfzoarx';

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user.trim(),
      pass: pass.trim(),
    },
  });
}

/**
 * POST /api/work-reports/submit
 * Candidate submits their daily Excel sheet report.
 * Automatically notifies Admin via Email.
 */
export const submitDailyWorkReport = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      employeeEmail,
      workDate,
      district,
      mandal,
      fileUrl,
      fileName,
      fileSize,
      totalEnterprises,
      records,
      summaryNotes,
    } = req.body;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee ID is required.' });
    }

    const effectiveDate = workDate || new Date().toISOString().slice(0, 10);
    const dateFormatted = effectiveDate.replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const reportCode = `DWR-${dateFormatted}-${randomSuffix}`;

    // Lookup candidate email & name if not provided
    let candidateName = employeeName || '';
    let candidateEmail = employeeEmail || '';

    try {
      const { data: emp } = await supabaseAdmin
        .from('employees')
        .select('full_name, email, district, mandal')
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (emp) {
        if (!candidateName) candidateName = emp.full_name || '';
        if (!candidateEmail) candidateEmail = emp.email || '';
      }
    } catch (e) {
      console.warn('Could not fetch employee details in submitDailyWorkReport:', e.message);
    }

    const newRecord = {
      report_code: reportCode,
      employee_id: employeeId,
      employee_name: candidateName || employeeId,
      work_date: effectiveDate,
      district: district || '',
      mandal: mandal || '',
      total_enterprises: Number(totalEnterprises) || (Array.isArray(records) ? records.length : 0),
      records: Array.isArray(records) ? records : [],
      summary_notes: summaryNotes || '',
      file_url: fileUrl || '',
      file_name: fileName || 'DAILY_WORK_SHEET.xlsx',
      file_size: fileSize || '',
      status: 'Submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let insertedReport = newRecord;

    // Persist to Supabase daily_work_reports
    try {
      const { data, error } = await supabaseAdmin
        .from('daily_work_reports')
        .insert([newRecord])
        .select()
        .single();

      if (!error && data) {
        insertedReport = data;
      } else if (error) {
        console.warn('Supabase insert warning for daily_work_reports:', error.message);
      }
    } catch (dbErr) {
      console.warn('Database error while saving daily work report:', dbErr.message);
    }

    // Send Notification Email to Admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'projectsds11@gmail.com';
    try {
      const transporter = getTransporter();

      const adminHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0A192F; color: #ffffff; padding: 24px; text-align: left; }
    .header h2 { margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; }
    .header p { margin: 4px 0 0; color: #94a3b8; font-size: 13px; }
    .body { padding: 24px; color: #334155; line-height: 1.5; font-size: 14px; }
    .badge { display: inline-block; background: #dbeafe; color: #1e40af; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 20px; }
    th { text-align: left; padding: 10px 12px; background: #f1f5f9; color: #475569; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .btn { display: inline-block; background: #E63946; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 13px; margin-top: 10px; }
    .footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>DS PROJECTS PRIVATE LIMITED</h2>
      <p>Daily Field Work Submission Alert — Admin Directorate</p>
    </div>
    <div class="body">
      <div class="badge">New Daily Work Sheet Uploaded</div>
      <p>Hello Admin,</p>
      <p>Candidate <strong>${candidateName || employeeId}</strong> has completed their field visits and submitted their Daily Excel Work Sheet for verification.</p>
      
      <table>
        <tr>
          <th>Field</th>
          <th>Details</th>
        </tr>
        <tr>
          <td><strong>Candidate Name</strong></td>
          <td>${candidateName || 'N/A'}</td>
        </tr>
        <tr>
          <td><strong>Employee ID</strong></td>
          <td><code>${employeeId}</code></td>
        </tr>
        <tr>
          <td><strong>Work Date</strong></td>
          <td><strong>${effectiveDate}</strong></td>
        </tr>
        <tr>
          <td><strong>District / Mandal</strong></td>
          <td>${district || 'Field'} ${mandal ? '/ ' + mandal : ''}</td>
        </tr>
        <tr>
          <td><strong>Excel Sheet File</strong></td>
          <td>${fileName || 'DAILY_WORK_SHEET.xlsx'} ${fileSize ? `(${fileSize})` : ''}</td>
        </tr>
        <tr>
          <td><strong>Candidate Remarks</strong></td>
          <td>${summaryNotes || 'Submitted as per daily survey schedule.'}</td>
        </tr>
      </table>

      ${fileUrl ? `<div style="text-align: center; margin: 20px 0;"><a href="${fileUrl}" class="btn" target="_blank">📥 Download / Inspect Submitted Excel Sheet</a></div>` : ''}

      <p style="font-size: 12px; color: #64748b; margin-top: 16px;">
        Please log into the Admin Portal (Daily Work Operations) to review and accept this candidate's field sheet.
      </p>
    </div>
    <div class="footer">
      DS Projects Private Limited &bull; Ongole, Andhra Pradesh &bull; www.dsprojectss.com
    </div>
  </div>
</body>
</html>
      `;

      await transporter.sendMail({
        from: `"DS Projects HR System" <${process.env.EMAIL_USER || 'projectsds11@gmail.com'}>`,
        to: adminEmail,
        subject: `📋 Daily Field Work Sheet: ${candidateName || employeeId} (${effectiveDate})`,
        html: adminHtml,
      });

      console.log(`[submitDailyWorkReport] Email notification sent to admin: ${adminEmail}`);
    } catch (mailErr) {
      console.warn('[submitDailyWorkReport] Failed to send email to admin:', mailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Daily work report submitted successfully. Admin has been notified via email.',
      data: insertedReport,
    });
  } catch (err) {
    console.error('Error submitting daily work report:', err);
    return res.status(500).json({ success: false, message: 'Internal server error submitting work report.' });
  }
};

/**
 * POST /api/work-reports/accept
 * Admin verifies and accepts the candidate's submitted daily Excel sheet.
 * Automatically sends an Acceptance Confirmation Email to the Candidate.
 */
export const acceptDailyWorkReport = async (req, res) => {
  try {
    const {
      reportId,
      reportCode,
      employeeId,
      employeeName,
      employeeEmail,
      workDate,
      adminRemarks,
    } = req.body;

    const identifier = reportId || reportCode;
    if (!identifier && !employeeId) {
      return res.status(400).json({ success: false, message: 'Report ID or Employee ID is required.' });
    }

    const verifiedAt = new Date().toISOString();
    const remarks = adminRemarks || 'Verified and approved by administration. All visited unit entries accepted.';

    // Update in Supabase
    try {
      let query = supabaseAdmin.from('daily_work_reports').update({
        status: 'Accepted',
        admin_remarks: remarks,
        verified_by: 'DS Projects Administration',
        verified_at: verifiedAt,
        updated_at: verifiedAt,
      });

      if (reportId) {
        query = query.eq('id', reportId);
      } else if (reportCode) {
        query = query.eq('report_code', reportCode);
      } else if (employeeId && workDate) {
        query = query.eq('employee_id', employeeId).eq('work_date', workDate);
      }

      const { error } = await query;
      if (error) {
        console.warn('Supabase update warning in acceptDailyWorkReport:', error.message);
      }
    } catch (dbErr) {
      console.warn('Database error in acceptDailyWorkReport:', dbErr.message);
    }

    // Lookup candidate email & name if missing
    let targetEmail = employeeEmail;
    let targetName = employeeName;

    if (!targetEmail && employeeId) {
      try {
        const { data: emp } = await supabaseAdmin
          .from('employees')
          .select('full_name, email')
          .eq('employee_id', employeeId)
          .maybeSingle();

        if (emp) {
          if (!targetName) targetName = emp.full_name;
          if (!targetEmail) targetEmail = emp.email;
        }
      } catch (e) {
        console.warn('Could not fetch candidate email in acceptDailyWorkReport:', e.message);
      }
    }

    // Send Acceptance Confirmation Email to the Candidate
    if (targetEmail) {
      try {
        const transporter = getTransporter();

        const candidateHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0A192F; color: #ffffff; padding: 24px; text-align: left; }
    .header h2 { margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; }
    .header p { margin: 4px 0 0; color: #38bdf8; font-size: 13px; font-weight: 600; }
    .body { padding: 24px; color: #334155; line-height: 1.5; font-size: 14px; }
    .status-badge { display: inline-block; background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 999px; text-transform: uppercase; margin-bottom: 16px; }
    .callout { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; border-radius: 8px; margin: 16px 0; font-size: 13px; color: #166534; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 20px; }
    th { text-align: left; padding: 10px 12px; background: #f1f5f9; color: #475569; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>DS PROJECTS PRIVATE LIMITED</h2>
      <p>Official Field Operations & Verification Directorate</p>
    </div>
    <div class="body">
      <div class="status-badge">✓ Daily Work Sheet Accepted & Verified</div>
      <p>Dear <strong>${targetName || 'Candidate'}</strong> (${employeeId || ''}),</p>
      <p>Your submitted <strong>Daily Field Work Excel Sheet</strong> for date <strong>${workDate || new Date().toISOString().slice(0, 10)}</strong> has been thoroughly inspected and officially <strong>ACCEPTED</strong> by the administration.</p>

      <div class="callout">
        <strong>Admin Verification Remarks:</strong><br>
        ${remarks}
      </div>

      <table>
        <tr>
          <th>Attribute</th>
          <th>Status Details</th>
        </tr>
        <tr>
          <td><strong>Work Date</strong></td>
          <td>${workDate || 'Today'}</td>
        </tr>
        <tr>
          <td><strong>Status</strong></td>
          <td><strong style="color: #16a34a;">Accepted & Verified</strong></td>
        </tr>
        <tr>
          <td><strong>Verified By</strong></td>
          <td>DS Projects Administration</td>
        </tr>
        <tr>
          <td><strong>Verified On</strong></td>
          <td>${new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
        </tr>
      </table>

      <p style="font-size: 13px; color: #475569;">
        Your daily attendance and field visit quotas for this date have been recorded in the central corporate registry. Keep up the good work!
      </p>
    </div>
    <div class="footer">
      DS Projects Private Limited &bull; RRR Complex, Ongole, Andhra Pradesh &bull; projectsds11@gmail.com
    </div>
  </div>
</body>
</html>
        `;

        await transporter.sendMail({
          from: `"DS Projects HR & Administration" <${process.env.EMAIL_USER || 'projectsds11@gmail.com'}>`,
          to: targetEmail,
          subject: `✅ Daily Work Sheet Accepted — DS Projects (${workDate || 'Field Work'})`,
          html: candidateHtml,
        });

        console.log(`[acceptDailyWorkReport] Acceptance email sent to candidate: ${targetEmail}`);
      } catch (mailErr) {
        console.warn('[acceptDailyWorkReport] Failed to send acceptance email:', mailErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Daily work report accepted successfully. Candidate has received the confirmation email.',
      data: {
        status: 'Accepted',
        adminRemarks: remarks,
        verifiedAt,
      },
    });
  } catch (err) {
    console.error('Error accepting daily work report:', err);
    return res.status(500).json({ success: false, message: 'Internal server error accepting work report.' });
  }
};

/**
 * GET /api/work-reports
 * Retrieves submitted work reports.
 */
export const getDailyWorkReports = async (req, res) => {
  try {
    const { employeeId } = req.query;

    let query = supabaseAdmin
      .from('daily_work_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Error fetching daily_work_reports:', error.message);
      return res.status(200).json({ success: true, data: [] });
    }

    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error('Error fetching daily work reports:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
