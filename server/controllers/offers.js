/**
 * server/controllers/offers.js
 * Controller for Job Offers and Onboarding Letters
 */
import { supabaseAdmin } from '../services/supabaseAdmin.js';
import { generateOfferLetterPDF } from '../services/pdfGenerator.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function getTransporter() {
  const user = (process.env.EMAIL_USER || 'projectsds11@gmail.com').trim();
  const pass = (process.env.EMAIL_PASS || 'csuuuanyimfzoarx').trim();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
}

/**
 * GET /api/admin/offers
 * Fetch all job offers
 */
export const getOffers = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('job_offers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching job offers:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    console.error('getOffers catch:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/admin/offers
 * Create a new job offer, update employee, generate PDF, and send onboarding email with PDF attached
 */
export const createOffer = async (req, res) => {
  try {
    const payload = req.body;
    const {
      employeeId,
      employeeName,
      email,
      phone,
      position,
      department,
      district,
      mandal,
      joiningDate,
      employmentType,
      workLocation,
      reportingManager,
      probation,
      noticePeriod,
      salary,
      status = 'Offer Sent',
      emailSubject,
      emailBody,
    } = payload;

    if (!employeeId || !email) {
      return res.status(400).json({ success: false, message: 'Employee ID and email are required.' });
    }

    // ── Duplicate offer guard — one offer per employee only ──────────────────
    const { data: existingOffers, error: checkErr } = await supabaseAdmin
      .from('job_offers')
      .select('id, offer_number, position, status, created_at')
      .eq('employee_id', employeeId)
      .limit(1);

    if (!checkErr && existingOffers && existingOffers.length > 0) {
      const existing = existingOffers[0];
      console.warn(`[createOffer] Blocked duplicate offer for ${employeeId} — existing: ${existing.offer_number}`);
      return res.status(409).json({
        success: false,
        duplicate: true,
        message: `An offer letter already exists for employee ${employeeId}. Each employee can only have one offer letter.`,
        existingOffer: {
          id: existing.id,
          offerNumber: existing.offer_number,
          position: existing.position,
          status: existing.status,
          createdAt: existing.created_at,
        },
      });
    }

    const cleanEmpId = (employeeId || 'DS001').replace(/[^a-zA-Z0-9]/g, '');
    const idNumber = (employeeId || '001').replace(/[^0-9]/g, '') || '001';
    const candName = employeeName || 'Candidate';
    const normalizedName = candName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '') || 'candidate';
    const corporateUsername = `${normalizedName}${idNumber}@dsprojects`;
    const generatedPassword = `DS@${idNumber}!2026`;

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const offerNum = `DS/OFF/${new Date().getFullYear()}/${cleanEmpId}_${randomSuffix}`;

    const basicSalary = Number(salary?.basic) || 25000;
    const travelAllowance = Number(salary?.travel) || 5000;
    const incentive = Number(salary?.incentive) || 0;
    const otherAllowance = Number(salary?.other) || 0;
    const monthlyTotal = basicSalary + travelAllowance + incentive + otherAllowance;
    const annualCtc = monthlyTotal * 12;

    const offerData = {
      offer_number: offerNum,
      employee_id: employeeId,
      employee_name: candName,
      email: email,
      phone: phone || '9999999999',
      position: position || 'Mandal Co-ordinator',
      department: department || 'Field Operations',
      district: district || 'Nellore',
      mandal: mandal || 'Kavali',
      employment_type: employmentType || 'Full Time',
      work_location: workLocation || 'Field / Mandal Office',
      joining_date: joiningDate || new Date().toISOString().slice(0, 10),
      reporting_manager: reportingManager || 'District Project Coordinator',
      probation: probation || '3 Months',
      notice_period: noticePeriod || '30 Days',
      basic_salary: basicSalary,
      travel_allowance: travelAllowance,
      incentive: incentive,
      other_allowance: otherAllowance,
      monthly_total: monthlyTotal,
      annual_ctc: annualCtc,
      status: status,
      email_status: 'Delivered',
      sent_at: new Date().toISOString(),
    };

    // 1. Insert into Supabase job_offers
    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from('job_offers')
      .insert([offerData])
      .select();

    if (insertError) {
      console.error('Failed to insert job offer:', insertError);
      return res.status(500).json({ success: false, message: insertError.message });
    }

    const savedOffer = insertedData?.[0] || offerData;

    // 2. Update employee in employees table
    try {
      await supabaseAdmin
        .from('employees')
        .update({
          status: 'active',
          district_id: district,
          mandal_id: mandal,
        })
        .eq('employee_id', employeeId);
    } catch (empErr) {
      console.warn('Employee update notice:', empErr);
    }

    // 3. Generate Official PDF Document
    let pdfBuffer = null;
    try {
      pdfBuffer = await generateOfferLetterPDF({
        ...offerData,
        employeeName: candName,
        employeeId,
        offerNumber: offerNum,
        salary,
      });
      console.log(`✅ Generated Offer Letter PDF (${pdfBuffer.length} bytes) for ${employeeId}`);
    } catch (pdfErr) {
      console.error('❌ PDF generation failed:', pdfErr);
    }

    // 4. Send Onboarding Email with Credentials & Attached PDF
    let emailSent = false;
    let emailError = null;

    if (status !== 'Draft') {
      try {
        let reqOrigin = null;
        try {
          reqOrigin = req.get('origin') || (req.get('referer') ? new URL(req.get('referer')).origin : null);
        } catch (_) {}
        const baseUrl = (reqOrigin && !reqOrigin.includes('localhost:5000'))
          ? reqOrigin
          : (process.env.APP_URL || process.env.VITE_APP_URL || 'https://www.dsprojects.com');
        const portalUrl = `${baseUrl.replace(/\/$/, '')}/employee/login`;
        const forgotPasswordUrl = `${baseUrl.replace(/\/$/, '')}/employee/forgot-password?id=${encodeURIComponent(employeeId)}`;
        const role = position || 'Mandal Co-ordinator';
        const locDistrict = district || 'Nellore';
        const locMandal = mandal || 'Kavali';

        const customMessageHtml = emailBody
          ? `<div style="background-color: #f1f5f9; border-left: 4px solid #2563eb; padding: 14px 16px; border-radius: 6px; margin: 18px 0; font-size: 13px; color: #1e293b; white-space: pre-line;">${emailBody}</div>`
          : '';

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Onboarding Completed & Login Credentials</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc; color: #334155; line-height: 1.6;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; max-width: 600px; width: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 28px 30px; text-align: left;">
              <h1 style="color: #ffffff; font-size: 20px; font-weight: bold; margin: 0; letter-spacing: 0.5px;">DS PROJECTS PRIVATE LIMITED</h1>
              <p style="color: #93c5fd; font-size: 13px; margin: 4px 0 0 0; font-weight: 600;">Official Onboarding Completion & Employment Offer</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 30px; font-size: 14px; color: #334155;">
              <p style="margin-top: 0; font-size: 16px;">Dear <strong>${candName}</strong>,</p>
              
              <p>On behalf of the Administration and Management of <strong>DS Projects Private Limited</strong>, we extend our warmest congratulations and are pleased to notify you that your employee onboarding process has been <strong>successfully completed</strong>!</p>
              
              ${customMessageHtml}

              <p>Your appointment details, deployment area, and official compensation schedule (CTC) have been confirmed as follows:</p>

              <!-- Deployment Info -->
              <table width="100%" cellspacing="0" cellpadding="8" style="background-color: #f8fafc; border-radius: 8px; margin: 15px 0; border: 1px solid #e2e8f0; font-size: 13px;">
                <tr>
                  <td width="38%" style="color: #64748b; font-weight: bold;">Designation / Position:</td>
                  <td style="color: #0f172a; font-weight: 600;">${role}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: bold;">Official Employee ID:</td>
                  <td style="color: #1e3a8a; font-weight: bold; font-family: monospace; font-size: 14px;">${employeeId}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: bold;">Offer Reference ID:</td>
                  <td style="color: #1e3a8a; font-weight: bold; font-family: monospace;">${offerNum}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: bold;">Assigned Deployment:</td>
                  <td style="color: #0f172a; font-weight: 600;">${locMandal} Mandal, ${locDistrict} District</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: bold;">Date of Joining:</td>
                  <td style="color: #0f172a;">${joiningDate || new Date().toISOString().slice(0, 10)}</td>
                </tr>
              </table>

              <!-- Attached PDF Notice -->
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px 16px; margin: 18px 0; font-size: 13px; color: #065f46;">
                📄 <strong>Official Appointment Letter Attached:</strong> Your signed Offer & Appointment Letter PDF is attached to this email. Please download, review, and retain it for your records.
              </div>

              <!-- CTC Breakdown Box -->
              <h3 style="font-size: 14px; font-weight: bold; color: #0f172a; margin: 20px 0 8px 0;">Salary & Compensation Breakdown (CTC):</h3>
              <table width="100%" cellspacing="0" cellpadding="8" style="background-color: #ffffff; border-radius: 8px; margin-bottom: 20px; border: 1px solid #cbd5e1; font-size: 13px;">
                <tr style="background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
                  <th align="left" style="padding: 8px; color: #475569;">Component</th>
                  <th align="left" style="padding: 8px; color: #475569;">Terms / Category</th>
                  <th align="right" style="padding: 8px; color: #475569;">Monthly (₹)</th>
                </tr>
                <tr>
                  <td style="border-bottom: 1px solid #f1f5f9; color: #334155; font-weight: 600;">Basic Monthly Salary</td>
                  <td style="border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 12px;">Fixed Monthly Component</td>
                  <td align="right" style="border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">₹${basicSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                ${travelAllowance > 0 ? `
                <tr>
                  <td style="border-bottom: 1px solid #f1f5f9; color: #334155; font-weight: 600;">${(position || '').toLowerCase().includes('district') ? 'District Work Allowance' : 'Field Work Allowance'}</td>
                  <td style="border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 12px;">Field Work & Mobility Allowance</td>
                  <td align="right" style="border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">₹${travelAllowance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>` : ''}
                ${otherAllowance > 0 ? `
                <tr>
                  <td style="border-bottom: 1px solid #f1f5f9; color: #334155; font-weight: 600;">Statutory Contributions (ESI & PF)</td>
                  <td style="border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 12px;">Employer & Employee Statutory Coverage</td>
                  <td align="right" style="border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">₹${otherAllowance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>` : ''}
                ${incentive > 0 ? `
                <tr>
                  <td style="border-bottom: 1px solid #f1f5f9; color: #334155; font-weight: 600;">Performance Incentive</td>
                  <td style="border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 12px;">Project Target Metric</td>
                  <td align="right" style="border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">₹${incentive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>` : ''}
                <tr style="background-color: #eff6ff; font-weight: bold;">
                  <td colspan="2" style="color: #1e3a8a;">TOTAL MONTHLY REMUNERATION (CTC)</td>
                  <td align="right" style="color: #1e3a8a; font-size: 14px;">₹${monthlyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style="background-color: #1e3a8a; color: #ffffff; font-weight: bold;">
                  <td colspan="2" style="color: #ffffff; padding: 10px 8px;">ANNUAL COST TO COMPANY (CTC)</td>
                  <td align="right" style="color: #ffffff; padding: 10px 8px; font-size: 15px;">₹${annualCtc.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              </table>

              <!-- Auto-generated Credentials Box with Explicit Corporate Username & Password -->
              <div style="background-color: #fefce8; border: 1.5px solid #fde047; border-radius: 10px; padding: 18px 20px; margin: 25px 0;">
                <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #854d0e;">🔐 Employee Portal Access Credentials</h3>
                <p style="font-size: 12px; color: #713f12; margin: 0 0 12px 0;">
                  Use these credentials to log into your official Employee Portal dashboard:
                </p>
                <table width="100%" cellspacing="0" cellpadding="7" style="font-size: 13px; background-color: #ffffff; border-radius: 8px; border: 1px solid #fef08a;">
                  <tr style="border-bottom: 1px solid #fef3c7;">
                    <td width="38%" style="color: #854d0e; font-weight: bold;">Portal URL:</td>
                    <td><a href="${portalUrl}" style="color: #2563eb; text-decoration: underline; font-weight: bold;">${portalUrl}</a></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #fef3c7;">
                    <td style="color: #854d0e; font-weight: bold;">Official Employee ID:</td>
                    <td style="color: #0f172a; font-family: monospace; font-size: 14px; font-weight: bold;">${employeeId}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #fef3c7;">
                    <td style="color: #854d0e; font-weight: bold;">Login User ID / Username:</td>
                    <td style="color: #1e3a8a; font-family: monospace; font-size: 14px; font-weight: bold;">${corporateUsername}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #fef3c7;">
                    <td style="color: #854d0e; font-weight: bold;">Registered Login Email:</td>
                    <td style="color: #0f172a; font-weight: 600;">${email}</td>
                  </tr>
                  <tr>
                    <td style="color: #854d0e; font-weight: bold;">Temporary Password:</td>
                    <td style="color: #b91c1c; font-family: monospace; font-size: 15px; font-weight: bold;">${generatedPassword}</td>
                  </tr>
                </table>
                <p style="font-size: 11px; color: #a16207; margin: 10px 0 0 0;">
                  💡 <em>You can log into the portal using your <strong>Username (${corporateUsername})</strong>, <strong>Employee ID (${employeeId})</strong>, or <strong>Email (${email})</strong>.</em>
                </p>
              </div>

              <!-- Password Reset / Recovery Box -->
              <div style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-radius: 10px; padding: 16px 20px; margin: 20px 0;">
                <h4 style="margin: 0 0 6px 0; font-size: 13px; font-weight: bold; color: #166534;">🔑 Forgot or Need to Change Your Password?</h4>
                <p style="font-size: 12px; color: #15803d; margin: 0 0 10px 0; line-height: 1.5;">
                  You can change or reset your portal password anytime using secure Email OTP verification:
                </p>
                <p style="margin: 0;">
                  <a href="${forgotPasswordUrl}" target="_blank" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: bold; padding: 10px 18px; border-radius: 6px;">
                    👉 Reset / Change Password &rarr;
                  </a>
                </p>
                <p style="font-size: 11px; color: #166534; margin: 10px 0 0 0; word-break: break-all;">
                  Direct link: <a href="${forgotPasswordUrl}" style="color: #15803d; text-decoration: underline;">${forgotPasswordUrl}</a><br>
                  Simply enter your Employee ID (<strong>${employeeId}</strong>) or registered email, and a 6-digit OTP will be dispatched to your inbox.
                </p>
              </div>

              <!-- CTA -->
              <table width="100%" cellspacing="0" cellpadding="0" style="margin: 25px 0 15px 0;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" target="_blank" style="background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold; padding: 13px 30px; border-radius: 8px; display: inline-block;">
                      Login to Employee Portal &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; color: #475569;">
                Upon logging into your dashboard, you will be able to view your allocated mandal location, record daily shift attendance, and submit work reports.
              </p>

              <p style="margin-top: 25px; margin-bottom: 0;">
                Warm regards,<br>
                <strong>Management & Administration</strong><br>
                <strong>DS PROJECTS PRIVATE LIMITED</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 15px 30px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
              DS Projects Private Limited &bull; Andhra Pradesh &bull; Official Employee Notice
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

        const plainText = `
DS PROJECTS PRIVATE LIMITED
Official Letter of Appointment & Employee Portal Access Credentials

Dear ${candName},

Congratulations! On behalf of the Administration and Management of DS Projects Private Limited, your employee onboarding process has been successfully completed.

Appointment Details:
- Designation / Position: ${role}
- Official Employee ID: ${employeeId}
- Offer Reference ID: ${offerNum}
- Assigned Jurisdiction: ${locMandal} Mandal, ${locDistrict} District, Andhra Pradesh
- Date of Joining: ${joiningDate || new Date().toISOString().slice(0, 10)}

Compensation Breakdown (CTC):
- Basic Monthly Salary: Rs. ${basicSalary.toLocaleString('en-IN')}/-
- District / Work Allowance: Rs. ${travelAllowance.toLocaleString('en-IN')}/-
- Statutory Contributions (ESI & PF): Rs. ${otherAllowance.toLocaleString('en-IN')}/-
- Total Monthly Remuneration (CTC): Rs. ${monthlyTotal.toLocaleString('en-IN')}/-
- Annual CTC: Rs. ${annualCtc.toLocaleString('en-IN')}/-

Employee Portal Login Credentials:
- Portal URL: ${portalUrl}
- Official Employee ID: ${employeeId}
- Login User ID / Username: ${corporateUsername}
- Registered Email: ${email}
- Temporary Password: ${generatedPassword}

You can log into the portal using your Username (${corporateUsername}), Employee ID (${employeeId}), or Email (${email}).

Forgot or Need to Change Your Password?
You can reset your password anytime via Email OTP verification at:
${forgotPasswordUrl}
Enter your Employee ID (${employeeId}) or email to receive a 6-digit verification code.

Your signed Letter of Appointment PDF is attached to this email.

Warm regards,
Management & Administration
DS PROJECTS PRIVATE LIMITED
`;

        let finalSubject = emailSubject
          ? emailSubject.replace(/\{\{\s*employee_name\s*\}\}/gi, candName).replace(/\{\{\s*designation\s*\}\}/gi, role).replace(/\{\{\s*employee_id\s*\}\}/gi, employeeId)
          : `Official Appointment Letter & Portal Login Credentials — DS Projects (${employeeId} - ${candName})`;

        const mailOptions = {
          from: `"DS Projects Administration" <${process.env.EMAIL_USER || 'projectsds11@gmail.com'}>`,
          replyTo: process.env.EMAIL_USER || 'projectsds11@gmail.com',
          to: email,
          subject: finalSubject,
          text: plainText,
          html: htmlContent,
          headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'high',
          },
        };

        if (pdfBuffer) {
          const safeFilename = `Appointment_Letter_${(employeeId || 'DS-001').replace(/[^a-zA-Z0-9_-]/g, '')}_${candName.replace(/\s+/g, '_')}.pdf`;
          mailOptions.attachments = [
            {
              filename: safeFilename,
              content: pdfBuffer,
              contentType: 'application/pdf',
            }
          ];
        }

        const transporter = getTransporter();
        const info = await transporter.sendMail(mailOptions);

        console.log(`✅ Onboarding & Credentials Email with PDF attachment sent to ${email} (ID: ${info.messageId})`);
        emailSent = true;

        // ── 5. Send Dedicated Administrative Notification Email to Admin ────────────
        // (Includes PDF attachment, full deployment and CTC details, but WITHOUT employee password)
        const adminEmail = (process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_USER || 'projectsds11@gmail.com').trim();
        try {
          const adminHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Admin Notification — Offer Released</title></head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc; color: #334155; line-height: 1.6;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; max-width: 600px; width: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 25px 30px; text-align: left;">
              <span style="background: #2563eb; color: #ffffff; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 4px; display: inline-block; margin-bottom: 8px;">ADMINISTRATIVE RECORD</span>
              <h1 style="color: #ffffff; font-size: 20px; font-weight: bold; margin: 0;">DS PROJECTS PRIVATE LIMITED</h1>
              <p style="color: #93c5fd; font-size: 13px; margin: 4px 0 0 0;">New Employee Offer Released & Dispatched</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; font-size: 14px; color: #334155;">
              <p style="margin-top: 0; font-size: 15px;">
                Hello <strong>Administrator</strong>,
              </p>
              <p>
                An official employment offer letter has been generated and dispatched to candidate <strong>${candName}</strong> (${email}).
              </p>

              <!-- Status Badge -->
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px 16px; margin: 15px 0; font-size: 13px; color: #065f46;">
                ✅ <strong>Status:</strong> Offer Released &bull; Email delivered with attached signed appointment letter PDF.
              </div>

              <!-- Deployment Info -->
              <h3 style="font-size: 14px; font-weight: bold; color: #0f172a; margin: 20px 0 8px 0;">Employee & Deployment Details:</h3>
              <table width="100%" cellspacing="0" cellpadding="8" style="background-color: #f8fafc; border-radius: 8px; margin: 10px 0 20px 0; border: 1px solid #e2e8f0; font-size: 13px;">
                <tr><td width="38%" style="color: #64748b; font-weight: bold;">Employee Name:</td><td style="color: #0f172a; font-weight: 600;">${candName}</td></tr>
                <tr><td style="color: #64748b; font-weight: bold;">Official Employee ID:</td><td style="color: #1e3a8a; font-weight: bold; font-family: monospace;">${employeeId}</td></tr>
                <tr><td style="color: #64748b; font-weight: bold;">Offer Reference ID:</td><td style="color: #1e3a8a; font-weight: bold; font-family: monospace;">${offerNum}</td></tr>
                <tr><td style="color: #64748b; font-weight: bold;">Designation / Position:</td><td style="color: #0f172a; font-weight: 600;">${role}</td></tr>
                <tr><td style="color: #64748b; font-weight: bold;">Assigned Jurisdiction:</td><td style="color: #0f172a; font-weight: 600;">${locMandal} Mandal, ${locDistrict} District</td></tr>
                <tr><td style="color: #64748b; font-weight: bold;">Date of Joining:</td><td style="color: #0f172a;">${joiningDate || new Date().toISOString().slice(0, 10)}</td></tr>
                <tr><td style="color: #64748b; font-weight: bold;">Candidate Email:</td><td style="color: #0f172a;">${email}</td></tr>
                <tr><td style="color: #64748b; font-weight: bold;">Candidate Phone:</td><td style="color: #0f172a;">${phone || 'N/A'}</td></tr>
                <tr><td style="color: #64748b; font-weight: bold;">Portal Login Username:</td><td style="color: #1e3a8a; font-weight: bold; font-family: monospace;">${corporateUsername}</td></tr>
              </table>

              <!-- Security Notice regarding password -->
              <div style="background-color: #f8fafc; border-left: 4px solid #64748b; border-radius: 6px; padding: 12px 16px; margin: 15px 0; font-size: 12px; color: #475569;">
                🔒 <strong>Password Privacy & Security:</strong> The employee's temporary portal password was securely dispatched directly to the employee's personal email (<strong>${email}</strong>). For enterprise security and privacy, the password is not included in administrative notifications.
              </div>

              <!-- Compensation Table -->
              <h3 style="font-size: 14px; font-weight: bold; color: #0f172a; margin: 20px 0 8px 0;">Approved Compensation Schedule:</h3>
              <table width="100%" cellspacing="0" cellpadding="8" style="background-color: #ffffff; border-radius: 8px; margin-bottom: 20px; border: 1px solid #cbd5e1; font-size: 13px;">
                <tr style="background-color: #eff6ff; font-weight: bold;">
                  <td style="color: #1e3a8a;">Total Monthly Remuneration (CTC)</td>
                  <td align="right" style="color: #1e3a8a; font-size: 14px;">₹${monthlyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style="background-color: #1e3a8a; color: #ffffff; font-weight: bold;">
                  <td style="color: #ffffff; padding: 10px 8px;">Annual Cost to Company (CTC)</td>
                  <td align="right" style="color: #ffffff; padding: 10px 8px; font-size: 15px;">₹${annualCtc.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              </table>

              <p style="font-size: 13px; color: #64748b; margin-top: 20px;">
                📄 <em>The signed Appointment Letter PDF is attached to this notification for company archives.</em>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 15px 30px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
              DS Projects Private Limited &bull; Internal HRMS Notification &bull; Confidential
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `;

          const adminMailOptions = {
            from: `"DS Projects System" <${process.env.EMAIL_USER || 'projectsds11@gmail.com'}>`,
            to: adminEmail,
            subject: `📋 [Admin Record] Offer Letter Released — ${candName} (${employeeId})`,
            html: adminHtml,
          };

          if (pdfBuffer) {
            const safeFilename = `Appointment_Letter_${(employeeId || 'DS-001').replace(/[^a-zA-Z0-9_-]/g, '')}_${candName.replace(/\s+/g, '_')}.pdf`;
            adminMailOptions.attachments = [
              {
                filename: safeFilename,
                content: pdfBuffer,
                contentType: 'application/pdf',
              }
            ];
          }

          await transporter.sendMail(adminMailOptions);
          console.log(`✅ Admin Notification Email dispatched to ${adminEmail} (password omitted for security)`);
        } catch (adminErr) {
          console.warn('⚠️ Admin notification email notice:', adminErr.message);
        }
      } catch (mailErr) {
        console.error('❌ Failed to send onboarding email:', mailErr);
        emailError = mailErr.message;
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Job offer created successfully and email dispatched with PDF attachment.',
      data: savedOffer,
      emailSent,
      emailError,
    });
  } catch (err) {
    console.error('createOffer catch error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/admin/offers/resend
 * Resend offer email to candidate with attached PDF
 */
export const resendOffer = async (req, res) => {
  try {
    const { offerId } = req.body;
    if (!offerId) {
      return res.status(400).json({ success: false, message: 'Offer ID is required.' });
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(offerId);
    let query = supabaseAdmin.from('job_offers').select('*');
    if (isUUID) {
      query = query.eq('id', offerId);
    } else {
      query = query.or(`offer_number.eq.${offerId},employee_id.eq.${offerId}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    const offer = data;
    const now = new Date().toISOString();

    const empId = offer.employee_id || 'DS-001';
    const candName = offer.employee_name || 'Candidate';
    const idNumber = empId.replace(/[^0-9]/g, '') || '001';
    const normalizedName = candName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '') || 'candidate';
    const corporateUsername = `${normalizedName}${idNumber}@dsprojects`;
    const generatedPassword = `DS@${idNumber}!2026`;
    let reqOrigin = null;
    try {
      reqOrigin = req.get('origin') || (req.get('referer') ? new URL(req.get('referer')).origin : null);
    } catch (_) {}
    const baseUrl = (reqOrigin && !reqOrigin.includes('localhost:5000'))
      ? reqOrigin
      : (process.env.APP_URL || process.env.VITE_APP_URL || 'https://www.dsprojects.com');
    const portalUrl = `${baseUrl.replace(/\/$/, '')}/employee/login`;
    const forgotPasswordUrl = `${baseUrl.replace(/\/$/, '')}/employee/forgot-password?id=${encodeURIComponent(empId)}`;

    const basicSalary = Number(offer.basic_salary) || 25000;
    const travelAllowance = Number(offer.travel_allowance) || 5000;
    const incentive = Number(offer.incentive) || 0;
    const otherAllowance = Number(offer.other_allowance) || 0;
    const monthlyTotal = Number(offer.monthly_total) || (basicSalary + travelAllowance + incentive + otherAllowance);
    const annualCtc = Number(offer.annual_ctc) || (monthlyTotal * 12);

    // Generate PDF Buffer
    let pdfBuffer = null;
    try {
      pdfBuffer = await generateOfferLetterPDF({
        ...offer,
        employeeName: candName,
        employeeId: empId,
        offerNumber: offer.offer_number,
        salary: {
          basic: basicSalary,
          travel: travelAllowance,
          incentive,
          other: otherAllowance,
          monthlyTotal,
          annualCtc,
        },
      });
    } catch (pdfErr) {
      console.warn('PDF generation notice during resend:', pdfErr);
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Onboarding Completed & Login Credentials</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc; color: #334155; line-height: 1.6;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; max-width: 600px; width: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 28px 30px; text-align: left;">
              <h1 style="color: #ffffff; font-size: 20px; font-weight: bold; margin: 0; letter-spacing: 0.5px;">DS PROJECTS PRIVATE LIMITED</h1>
              <p style="color: #93c5fd; font-size: 13px; margin: 4px 0 0 0; font-weight: 600;">Official Onboarding Completion & Employment Offer</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; font-size: 14px; color: #334155;">
              <p style="margin-top: 0; font-size: 16px;">Dear <strong>${candName}</strong>,</p>
              <p>Please find below your employment appointment details and access credentials for DS Projects Private Limited:</p>

              <table width="100%" cellspacing="0" cellpadding="8" style="background-color: #f8fafc; border-radius: 8px; margin: 15px 0; border: 1px solid #e2e8f0; font-size: 13px;">
                <tr><td width="38%" style="color: #64748b; font-weight: bold;">Designation / Position:</td><td style="color: #0f172a; font-weight: 600;">${offer.position}</td></tr>
                <tr><td style="color: #64748b; font-weight: bold;">Official Employee ID:</td><td style="color: #1e3a8a; font-weight: bold; font-family: monospace; font-size: 14px;">${empId}</td></tr>
                <tr><td style="color: #64748b; font-weight: bold;">Offer Reference ID:</td><td style="color: #1e3a8a; font-weight: bold; font-family: monospace;">${offer.offer_number}</td></tr>
                <tr><td style="color: #64748b; font-weight: bold;">Assigned Deployment:</td><td style="color: #0f172a; font-weight: 600;">${offer.mandal || ''} Mandal, ${offer.district || ''} District</td></tr>
                <tr><td style="color: #64748b; font-weight: bold;">Date of Joining:</td><td style="color: #0f172a;">${offer.joining_date || ''}</td></tr>
              </table>

              <!-- Attached PDF Notice -->
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px 16px; margin: 18px 0; font-size: 13px; color: #065f46;">
                📄 <strong>Official Appointment Letter Attached:</strong> Your signed Offer & Appointment Letter PDF is attached to this email. Please download and retain it for your records.
              </div>

              <h3 style="font-size: 14px; font-weight: bold; color: #0f172a; margin: 20px 0 8px 0;">Salary & Compensation Breakdown (CTC):</h3>
              <table width="100%" cellspacing="0" cellpadding="8" style="background-color: #ffffff; border-radius: 8px; margin-bottom: 20px; border: 1px solid #cbd5e1; font-size: 13px;">
                <tr style="background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
                  <th align="left" style="padding: 8px; color: #475569;">Component</th>
                  <th align="left" style="padding: 8px; color: #475569;">Terms / Category</th>
                  <th align="right" style="padding: 8px; color: #475569;">Monthly (₹)</th>
                </tr>
                <tr>
                  <td style="border-bottom: 1px solid #f1f5f9; color: #334155; font-weight: 600;">Basic Monthly Salary</td>
                  <td style="border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 12px;">Fixed Monthly Component</td>
                  <td align="right" style="border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">₹${basicSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                ${travelAllowance > 0 ? `
                <tr>
                  <td style="border-bottom: 1px solid #f1f5f9; color: #334155; font-weight: 600;">${(offer.position || '').toLowerCase().includes('district') ? 'District Work Allowance' : 'Field Work Allowance'}</td>
                  <td style="border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 12px;">Field Work & Mobility Allowance</td>
                  <td align="right" style="border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">₹${travelAllowance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>` : ''}
                ${otherAllowance > 0 ? `
                <tr>
                  <td style="border-bottom: 1px solid #f1f5f9; color: #334155; font-weight: 600;">Statutory Contributions (ESI & PF)</td>
                  <td style="border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 12px;">Employer & Employee Statutory Coverage</td>
                  <td align="right" style="border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">₹${otherAllowance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>` : ''}
                ${incentive > 0 ? `
                <tr>
                  <td style="border-bottom: 1px solid #f1f5f9; color: #334155; font-weight: 600;">Performance Incentive</td>
                  <td style="border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 12px;">Project Target Metric</td>
                  <td align="right" style="border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">₹${incentive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>` : ''}
                <tr style="background-color: #eff6ff; font-weight: bold;">
                  <td colspan="2" style="color: #1e3a8a;">TOTAL MONTHLY REMUNERATION (CTC)</td>
                  <td align="right" style="color: #1e3a8a; font-size: 14px;">₹${monthlyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr style="background-color: #1e3a8a; color: #ffffff; font-weight: bold;">
                  <td colspan="2" style="color: #ffffff; padding: 10px 8px;">ANNUAL COST TO COMPANY (CTC)</td>
                  <td align="right" style="color: #ffffff; padding: 10px 8px; font-size: 15px;">₹${annualCtc.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              </table>

              <!-- Auto-generated Credentials Box with Explicit Corporate Username & Password -->
              <div style="background-color: #fefce8; border: 1.5px solid #fde047; border-radius: 10px; padding: 18px 20px; margin: 25px 0;">
                <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #854d0e;">🔐 Employee Portal Access Credentials</h3>
                <p style="font-size: 12px; color: #713f12; margin: 0 0 12px 0;">
                  Use these credentials to log into your official Employee Portal dashboard:
                </p>
                <table width="100%" cellspacing="0" cellpadding="7" style="font-size: 13px; background-color: #ffffff; border-radius: 8px; border: 1px solid #fef08a;">
                  <tr style="border-bottom: 1px solid #fef3c7;">
                    <td width="38%" style="color: #854d0e; font-weight: bold;">Portal URL:</td>
                    <td><a href="${portalUrl}" style="color: #2563eb; text-decoration: underline; font-weight: bold;">${portalUrl}</a></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #fef3c7;">
                    <td style="color: #854d0e; font-weight: bold;">Official Employee ID:</td>
                    <td style="color: #0f172a; font-family: monospace; font-size: 14px; font-weight: bold;">${empId}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #fef3c7;">
                    <td style="color: #854d0e; font-weight: bold;">Login User ID / Username:</td>
                    <td style="color: #1e3a8a; font-family: monospace; font-size: 14px; font-weight: bold;">${corporateUsername}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #fef3c7;">
                    <td style="color: #854d0e; font-weight: bold;">Registered Login Email:</td>
                    <td style="color: #0f172a; font-weight: 600;">${offer.email}</td>
                  </tr>
                  <tr>
                    <td style="color: #854d0e; font-weight: bold;">Temporary Password:</td>
                    <td style="color: #b91c1c; font-family: monospace; font-size: 15px; font-weight: bold;">${generatedPassword}</td>
                  </tr>
                </table>
                <p style="font-size: 11px; color: #a16207; margin: 10px 0 0 0;">
                  💡 <em>You can log into the portal using your <strong>Username (${corporateUsername})</strong>, <strong>Employee ID (${empId})</strong>, or <strong>Email (${offer.email})</strong>.</em>
                </p>
              </div>

              <!-- Password Reset / Recovery Box -->
              <div style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-radius: 10px; padding: 16px 20px; margin: 20px 0;">
                <h4 style="margin: 0 0 6px 0; font-size: 13px; font-weight: bold; color: #166534;">🔑 Forgot or Need to Change Your Password?</h4>
                <p style="font-size: 12px; color: #15803d; margin: 0 0 10px 0; line-height: 1.5;">
                  You can change or reset your portal password anytime using secure Email OTP verification:
                </p>
                <p style="margin: 0;">
                  <a href="${forgotPasswordUrl}" target="_blank" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: bold; padding: 10px 18px; border-radius: 6px;">
                    👉 Reset / Change Password &rarr;
                  </a>
                </p>
                <p style="font-size: 11px; color: #166534; margin: 10px 0 0 0; word-break: break-all;">
                  Direct link: <a href="${forgotPasswordUrl}" style="color: #15803d; text-decoration: underline;">${forgotPasswordUrl}</a><br>
                  Simply enter your Employee ID (<strong>${empId}</strong>) or registered email, and a 6-digit OTP will be dispatched to your inbox.
                </p>
              </div>

              <p style="margin-top: 25px; margin-bottom: 0;">Warm regards,<br><strong>Management & Administration</strong><br><strong>DS PROJECTS PRIVATE LIMITED</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    const plainText = `
DS PROJECTS PRIVATE LIMITED
Official Letter of Appointment & Employee Portal Access Credentials

Dear ${candName},

Please find below your employment appointment details and access credentials for DS Projects Private Limited:

Appointment Details:
- Designation / Position: ${offer.position}
- Official Employee ID: ${empId}
- Offer Reference ID: ${offer.offer_number}
- Assigned Jurisdiction: ${offer.mandal || ''} Mandal, ${offer.district || ''} District, Andhra Pradesh
- Date of Joining: ${offer.joining_date || ''}

Compensation Breakdown (CTC):
- Basic Monthly Salary: Rs. ${basicSalary.toLocaleString('en-IN')}/-
- District / Work Allowance: Rs. ${travelAllowance.toLocaleString('en-IN')}/-
- Statutory Contributions (ESI & PF): Rs. ${otherAllowance.toLocaleString('en-IN')}/-
- Total Monthly Remuneration (CTC): Rs. ${monthlyTotal.toLocaleString('en-IN')}/-
- Annual CTC: Rs. ${annualCtc.toLocaleString('en-IN')}/-

Employee Portal Login Credentials:
- Portal URL: ${portalUrl}
- Official Employee ID: ${empId}
- Login User ID / Username: ${corporateUsername}
- Registered Email: ${offer.email}
- Temporary Password: ${generatedPassword}

You can log into the portal using your Username (${corporateUsername}), Employee ID (${empId}), or Email (${offer.email}).

Forgot or Need to Change Your Password?
You can reset your password anytime via Email OTP verification at:
${forgotPasswordUrl}
Enter your Employee ID (${empId}) or email to receive a 6-digit verification code.

Your signed Letter of Appointment PDF is attached to this email.

Warm regards,
Management & Administration
DS PROJECTS PRIVATE LIMITED
`;

    const mailOptions = {
      from: `"DS Projects Administration" <${process.env.EMAIL_USER || 'projectsds11@gmail.com'}>`,
      replyTo: process.env.EMAIL_USER || 'projectsds11@gmail.com',
      to: offer.email,
      subject: `Official Appointment Letter & Portal Login Credentials — DS Projects (${empId} - ${candName})`,
      text: plainText,
      html: htmlContent,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
      },
    };

    if (pdfBuffer) {
      const safeFilename = `Appointment_Letter_${(empId).replace(/[^a-zA-Z0-9_-]/g, '')}_${candName.replace(/\s+/g, '_')}.pdf`;
      mailOptions.attachments = [
        {
          filename: safeFilename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        }
      ];
    }

    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);

    // Send copy to admin without password
    const adminEmail = (process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_USER || 'projectsds11@gmail.com').trim();
    try {
      const adminMailOptions = {
        from: `"DS Projects System" <${process.env.EMAIL_USER || 'projectsds11@gmail.com'}>`,
        to: adminEmail,
        subject: `📋 [Admin Record - Resend] Offer Letter Re-dispatched — ${candName} (${empId})`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #334155;">
            <h2 style="color: #1e3a8a; margin-top: 0;">DS PROJECTS PRIVATE LIMITED</h2>
            <p><strong>Notice:</strong> The appointment letter for <strong>${candName}</strong> (${empId}) was re-dispatched to <strong>${offer.email}</strong>.</p>
            <p>Position: ${offer.position}<br/>Deployment: ${offer.mandal || ''} Mandal, ${offer.district || ''} District<br/>Joining Date: ${offer.joining_date || ''}</p>
            <p style="font-size: 12px; color: #64748b;">🔒 Employee portal credentials were provided directly to the employee. Password is omitted for security.</p>
          </div>
        `,
      };
      if (pdfBuffer) {
        adminMailOptions.attachments = [
          {
            filename: `Appointment_Letter_${(empId).replace(/[^a-zA-Z0-9_-]/g, '')}_${candName.replace(/\s+/g, '_')}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          }
        ];
      }
      await transporter.sendMail(adminMailOptions);
    } catch (adminErr) {
      console.warn('⚠️ Admin resend copy notice:', adminErr.message);
    }

    await supabaseAdmin
      .from('job_offers')
      .update({ sent_at: now, email_status: 'Delivered' })
      .eq('id', offer.id);

    return res.status(200).json({ success: true, message: 'Offer letter email resent successfully with attached PDF.' });
  } catch (err) {
    console.error('resendOffer catch error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
