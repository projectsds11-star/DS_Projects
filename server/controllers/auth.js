import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

// ✅ Supabase client for persistent OTP storage
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://wprxkmxbuwipmymswmgq.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwcnhrbXhidXdpcG15bXN3bWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNjc4NjAsImV4cCI6MjEwMzc0Mzg2MH0.1v8bdsxokG7TWleHilXtHsO9gl5ai7xhYfZ_3GcsENQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

function getTransporter() {
  const user = (process.env.EMAIL_USER || 'projectsds11@gmail.com').trim();
  const pass = (process.env.EMAIL_PASS || 'csuuuanyimfzoarx').trim();
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

const ADMIN_EMAILS = [
  'shaikjakeerbasha07@gmail.com',
  'balajiprojects049@gmail.com',
  'projectsds11@gmail.com',
];

// ─── REQUEST OTP ────────────────────────────────────────────────────────────
export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Email address is required.',
        message: 'Email address is required.',
      });
    }

    const formattedEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formattedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.',
        message: 'Please provide a valid email address.',
      });
    }

    if (!ADMIN_EMAILS.includes(formattedEmail)) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized email address. Access denied.',
        message: 'Unauthorized email address. Access denied.',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min expiry

    // Store OTP in Supabase
    try {
      const { error: upsertError } = await supabase
        .from('admin_otps')
        .upsert({ email: formattedEmail, otp, expires_at: expiresAt }, { onConflict: 'email' });

      if (upsertError) {
        console.error('[Auth Service] Supabase OTP storage warning:', upsertError.message);
      }
    } catch (dbErr) {
      console.error('[Auth Service] Supabase DB exception:', dbErr.message);
    }

    // Dispatch Email via Nodemailer
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"DS Projects Security" <${process.env.EMAIL_USER || 'projectsds11@gmail.com'}>`,
      to: formattedEmail,
      subject: `Your Admin Login Passcode: ${otp} - DS Projects`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; background: #2563EB; color: #ffffff; border-radius: 12px; font-weight: 900; font-size: 18px;">DS</div>
            <h2 style="color: #0F172A; margin: 12px 0 4px; font-size: 20px;">Executive Console Verification</h2>
            <p style="color: #64748B; font-size: 13px; margin: 0;">DS PROJECTS — Two-Factor Administrator Authentication</p>
          </div>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            Hello Administrator,<br/>
            You requested a secure one-time passcode to sign in to the executive console.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1E3A8A; background: #EFF6FF; padding: 14px 28px; border-radius: 12px; border: 1px dashed #93C5FD; display: inline-block; font-family: monospace;">
              ${otp}
            </span>
          </div>
          <p style="color: #64748B; font-size: 12px; line-height: 1.5; text-align: center;">
            This passcode is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
          </p>
          <hr style="border: none; border-top: 1px solid #F1F5F9; margin: 24px 0;" />
          <p style="font-size: 11px; color: #94A3B8; text-align: center; margin: 0;">
            DS Projects Private Limited • Automated Security System
          </p>
        </div>
      `,
    });

    console.log(`[Auth Service] OTP successfully generated and emailed to ${formattedEmail}`);
    return res.status(200).json({
      success: true,
      message: `A 6-digit passcode was dispatched to ${formattedEmail}`,
    });
  } catch (error) {
    console.error('[Auth Service] Critical error in requestOtp:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to send verification email. Please verify SMTP settings or try again later.',
      message: 'Unable to send verification email. Please verify SMTP settings or try again later.',
    });
  }
};

// ─── VERIFY OTP ─────────────────────────────────────────────────────────────
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body || {};

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and authentication code are required.',
        message: 'Email and authentication code are required.',
      });
    }

    const formattedEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    // Fetch OTP from Supabase
    const { data, error } = await supabase
      .from('admin_otps')
      .select('otp, expires_at')
      .eq('email', formattedEmail)
      .single();

    if (error || !data) {
      return res.status(400).json({
        success: false,
        error: 'No active OTP requested for this email or it has expired.',
        message: 'No active OTP requested for this email or it has expired.',
      });
    }

    // Check expiry
    if (new Date() > new Date(data.expires_at)) {
      await supabase.from('admin_otps').delete().eq('email', formattedEmail);
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired. Please request a new one.',
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    // Check OTP value
    if (data.otp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid authentication code. Please check and try again.',
        message: 'Invalid authentication code. Please check and try again.',
      });
    }

    // ✅ OTP correct — delete it so it can't be reused
    await supabase.from('admin_otps').delete().eq('email', formattedEmail);

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || 'DS_Projects_JWT_SuperSecret_2026_#Andhra';
    const token = jwt.sign(
      { email: formattedEmail, role: 'admin' },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      email: formattedEmail,
    });
  } catch (error) {
    console.error('[Auth Service] Critical error in verifyOtp:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during verification.',
      message: 'An unexpected error occurred during verification.',
    });
  }
};

// ── In-Memory OTP Store & Password Store Fallback ───────────────────────────
const employeeOtpStore = new Map();
const employeePasswordStore = new Map();

function maskEmail(email) {
  if (!email || !email.includes('@')) return email || '';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  const visible = user.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(3, user.length - 2))}@${domain}`;
}

// ─── EMPLOYEE REQUEST PASSWORD RESET OTP ─────────────────────────────────────
export const requestEmployeePasswordReset = async (req, res) => {
  try {
    const { identifier } = req.body || {};

    if (!identifier || typeof identifier !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Employee ID or registered email address is required.',
        message: 'Employee ID or registered email address is required.',
      });
    }

    const input = identifier.trim();
    let emp = null;

    // Extract numeric ID if corporate username format e.g. balajis001@dsprojects, ds-001, or 001
    const digitsMatch = input.match(/\d+/);
    const extractedEmpId = digitsMatch ? `DS-${digitsMatch[0].padStart(3, '0')}` : null;
    const cleanEmpId = digitsMatch ? `DS${digitsMatch[0].padStart(3, '0')}` : null;

    // 1. Search Supabase employees table
    try {
      const orConditions = [
        `email.ilike.%${input}%`,
        `employee_id.ilike.%${input}%`,
        `phone.ilike.%${input}%`,
      ];
      if (extractedEmpId) orConditions.push(`employee_id.ilike.%${extractedEmpId}%`);
      if (cleanEmpId) orConditions.push(`employee_id.ilike.%${cleanEmpId}%`);

      const { data: dbEmp } = await supabase
        .from('employees')
        .select('*')
        .or(orConditions.join(','))
        .is('deleted_at', null)
        .limit(1)
        .maybeSingle();

      if (dbEmp) emp = dbEmp;
    } catch (dbErr) {
      console.warn('[Employee Auth] Supabase employee lookup error:', dbErr.message);
    }

    // 2. Search job_offers table if not found in employees
    if (!emp) {
      try {
        const orConditions = [
          `email.ilike.%${input}%`,
          `employee_id.ilike.%${input}%`,
          `phone.ilike.%${input}%`,
        ];
        if (extractedEmpId) orConditions.push(`employee_id.ilike.%${extractedEmpId}%`);

        const { data: dbOffer } = await supabase
          .from('job_offers')
          .select('*')
          .or(orConditions.join(','))
          .limit(1)
          .maybeSingle();

        if (dbOffer) {
          emp = {
            employee_id: dbOffer.employee_id,
            full_name: dbOffer.employee_name || dbOffer.candidate_name,
            email: dbOffer.email || dbOffer.candidate_email,
            phone: dbOffer.phone || dbOffer.candidate_phone,
            district_id: dbOffer.district,
            mandal_id: dbOffer.mandal,
            status: dbOffer.status === 'Offer Accepted' ? 'active' : 'onboarding',
          };
        }
      } catch (offerErr) {
        console.warn('[Employee Auth] Supabase job_offers lookup error:', offerErr.message);
      }
    }

    if (!emp || !emp.email) {
      return res.status(404).json({
        success: false,
        error: 'No registered employee profile found matching this ID or email.',
        message: 'No registered employee profile found matching this ID or email. Please check and try again.',
      });
    }

    // Check if employee is inactive/terminated
    if (emp.status === 'Inactive' || emp.status === 'inactive' || emp.status === 'Deactivated') {
      return res.status(403).json({
        success: false,
        error: 'Account Deactivated: This employee account is currently deactivated. Contact HR Administration.',
        message: 'Account Deactivated: This employee account is currently deactivated. Contact HR Administration.',
      });
    }

    const targetEmail = emp.email.toLowerCase().trim();
    const employeeId = emp.employee_id || input.toUpperCase();
    const employeeName = emp.full_name || emp.name || 'Team Member';
    const masked = maskEmail(targetEmail);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Store in Supabase admin_otps table
    try {
      await supabase
        .from('admin_otps')
        .upsert({ email: targetEmail, otp, expires_at: expiresAt }, { onConflict: 'email' });
    } catch (upsertErr) {
      console.warn('[Employee Auth] Supabase OTP save error:', upsertErr.message);
    }

    // Store in-memory cache
    employeeOtpStore.set(targetEmail, { otp, expiresAt: Date.now() + 10 * 60 * 1000, employeeId });
    if (employeeId) {
      employeeOtpStore.set(employeeId.toLowerCase(), { otp, expiresAt: Date.now() + 10 * 60 * 1000, email: targetEmail });
    }

    // Send Email via Nodemailer
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"DS Projects Security" <${process.env.EMAIL_USER || 'projectsds11@gmail.com'}>`,
      to: targetEmail,
      subject: `Your Password Reset Code: ${otp} — DS Projects Employee Portal`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 16px; background-color: #f1f5f9;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 32px 28px; text-align: center;">
                      <div style="display: inline-block; width: 46px; height: 46px; line-height: 46px; background-color: #E63946; color: #ffffff; border-radius: 14px; font-weight: 900; font-size: 18px; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(230, 57, 70, 0.3);">
                        DS
                      </div>
                      <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em;">DS PROJECTS PRIVATE LIMITED</h1>
                      <p style="color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin: 6px 0 0 0;">Employee Portal • Password Reset Request</p>
                    </td>
                  </tr>

                  <!-- Body Content -->
                  <tr>
                    <td style="padding: 32px 28px;">
                      <p style="font-size: 15px; color: #334155; margin: 0 0 16px 0; line-height: 1.6;">
                        Dear <strong>${employeeName}</strong>,
                      </p>
                      <p style="font-size: 14px; color: #475569; margin: 0 0 24px 0; line-height: 1.6;">
                        We received a request to reset the login password for your DS Projects Employee Portal account (<strong>${employeeId}</strong>). Use the one-time verification code below to proceed:
                      </p>

                      <!-- OTP Box -->
                      <div style="text-align: center; margin: 28px 0; padding: 24px; background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; border: 1.5px dashed #cbd5e1;">
                        <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #E63946; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; display: inline-block;">
                          ${otp}
                        </span>
                        <p style="font-size: 12px; color: #64748B; margin: 10px 0 0 0; font-weight: 500;">
                          Valid for the next <strong>10 minutes</strong>
                        </p>
                      </div>

                      <!-- Details Box -->
                      <table width="100%" cellpadding="10" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 13px; margin-bottom: 24px;">
                        <tr>
                          <td style="color: #64748b; font-weight: 600; width: 40%;">Employee ID:</td>
                          <td style="color: #0f172a; font-weight: 700; font-family: monospace;">${employeeId}</td>
                        </tr>
                        <tr>
                          <td style="color: #64748b; font-weight: 600;">Registered Email:</td>
                          <td style="color: #0f172a; font-weight: 600;">${targetEmail}</td>
                        </tr>
                      </table>

                      <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="font-size: 12px; color: #9f1239; margin: 0; line-height: 1.5;">
                          <strong>Security Notice:</strong> Never share this verification code with anyone. DS Projects HR staff will never ask you for your password or OTP.
                        </p>
                      </div>

                      <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0;">
                        If you did not request this password reset, please contact your District Project Coordinator or HR Department immediately.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 20px 28px; border-top: 1px solid #e2e8f0; text-align: center;">
                      <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">
                        DS Projects Private Limited • Andhra Pradesh Field Operations<br/>
                        Automated HRMS Security Notification
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log(`[Employee Auth] OTP ${otp} emailed to ${targetEmail} for employee ${employeeId}`);

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code was dispatched to ${masked}`,
      email: targetEmail,
      maskedEmail: masked,
      employeeId,
      employeeName,
    });
  } catch (error) {
    console.error('[Employee Auth] Critical error in requestEmployeePasswordReset:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to send password reset code. Please try again later.',
      message: 'Unable to send password reset code. Please try again later.',
    });
  }
};

// ─── EMPLOYEE VERIFY PASSWORD RESET OTP ─────────────────────────────────────
export const verifyEmployeePasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body || {};

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Registered email and 6-digit verification code are required.',
        message: 'Registered email and 6-digit verification code are required.',
      });
    }

    const formattedEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    // Check in-memory store
    const memRecord = employeeOtpStore.get(formattedEmail);
    if (memRecord && memRecord.otp === cleanOtp) {
      if (Date.now() > memRecord.expiresAt) {
        employeeOtpStore.delete(formattedEmail);
        return res.status(400).json({
          success: false,
          error: 'Verification code has expired. Please request a new one.',
          message: 'Verification code has expired. Please request a new one.',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully.',
      });
    }

    // Check Supabase admin_otps table
    const { data, error } = await supabase
      .from('admin_otps')
      .select('otp, expires_at')
      .eq('email', formattedEmail)
      .maybeSingle();

    if (error || !data) {
      return res.status(400).json({
        success: false,
        error: 'No active OTP requested for this email or it has expired.',
        message: 'No active OTP requested for this email or it has expired.',
      });
    }

    if (new Date() > new Date(data.expires_at)) {
      await supabase.from('admin_otps').delete().eq('email', formattedEmail);
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired. Please request a new one.',
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    if (data.otp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid 6-digit verification code. Please check and try again.',
        message: 'Invalid 6-digit verification code. Please check and try again.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
    });
  } catch (error) {
    console.error('[Employee Auth] Critical error in verifyEmployeePasswordOtp:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during OTP verification.',
      message: 'An unexpected error occurred during OTP verification.',
    });
  }
};

// ─── EMPLOYEE RESET PASSWORD CONFIRMATION ────────────────────────────────────
export const resetEmployeePassword = async (req, res) => {
  try {
    const { email, employeeId, newPassword, otp } = req.body || {};

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email and new password are required.',
        message: 'Email and new password are required.',
      });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters in length.',
        message: 'New password must be at least 8 characters in length.',
      });
    }

    const formattedEmail = email.toLowerCase().trim();
    const cleanOtp = otp ? String(otp).trim() : null;

    // Validate OTP if provided
    if (cleanOtp) {
      const memRecord = employeeOtpStore.get(formattedEmail);
      let isValidOtp = false;

      if (memRecord && memRecord.otp === cleanOtp && Date.now() <= memRecord.expiresAt) {
        isValidOtp = true;
      } else {
        const { data } = await supabase
          .from('admin_otps')
          .select('otp, expires_at')
          .eq('email', formattedEmail)
          .maybeSingle();

        if (data && data.otp === cleanOtp && new Date() <= new Date(data.expires_at)) {
          isValidOtp = true;
        }
      }

      if (!isValidOtp) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired OTP session. Please request a new OTP.',
          message: 'Invalid or expired OTP session. Please request a new OTP.',
        });
      }
    }

    // Save updated password in server memory store
    employeePasswordStore.set(formattedEmail, newPassword);
    if (employeeId) {
      employeePasswordStore.set(employeeId.toUpperCase(), newPassword);
    }

    // ── Supabase Database SQL Updates for Password Saving ─────────────────────
    // 1. Update employees table
    try {
      await supabase
        .from('employees')
        .update({ password: newPassword, updated_at: new Date().toISOString() })
        .eq('email', formattedEmail);

      if (employeeId) {
        await supabase
          .from('employees')
          .update({ password: newPassword, updated_at: new Date().toISOString() })
          .eq('employee_id', employeeId.toUpperCase());
      }
    } catch (dbErr) {
      console.warn('[Employee Auth] Supabase employees password column update note:', dbErr.message);
    }

    // 2. Update job_offers table
    try {
      await supabase
        .from('job_offers')
        .update({ password: newPassword, updated_at: new Date().toISOString() })
        .eq('email', formattedEmail);
    } catch (offerErr) {
      console.warn('[Employee Auth] Supabase job_offers password update note:', offerErr.message);
    }

    // 3. Upsert into employee_credentials table
    try {
      await supabase
        .from('employee_credentials')
        .upsert({
          email: formattedEmail,
          employee_id: employeeId ? employeeId.toUpperCase() : '',
          password: newPassword,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });
    } catch (credErr) {
      // Table may not exist yet
    }

    // Clear OTP
    employeeOtpStore.delete(formattedEmail);
    if (employeeId) employeeOtpStore.delete(employeeId.toLowerCase());
    await supabase.from('admin_otps').delete().eq('email', formattedEmail);


    // Send confirmation email
    try {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: `"DS Projects Security" <${process.env.EMAIL_USER || 'projectsds11@gmail.com'}>`,
        to: formattedEmail,
        subject: `Password Reset Successful — DS Projects Employee Portal`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head><meta charset="UTF-8"></head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b;">
            <table width="100%" cellpadding="0" cellspacing="0" style="padding: 30px 16px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <tr>
                      <td style="background: #0f172a; padding: 24px; text-align: center;">
                        <h2 style="color: #ffffff; margin: 0; font-size: 18px;">DS PROJECTS PRIVATE LIMITED</h2>
                        <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">Employee Portal Security Update</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 28px 24px;">
                        <div style="text-align: center; margin-bottom: 20px;">
                          <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; background-color: #dcfce7; color: #16a34a; border-radius: 50%; font-size: 24px; font-weight: bold;">
                            ✓
                          </div>
                        </div>
                        <h3 style="color: #0f172a; margin: 0 0 12px 0; font-size: 16px; text-align: center;">Password Updated Successfully</h3>
                        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
                          The password for your DS Projects Employee Portal account (<strong>${employeeId || formattedEmail}</strong>) has been successfully reset.
                        </p>
                        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 20px 0;">
                          You can now use your new password to sign in to the Employee Portal anytime.
                        </p>
                        <div style="background-color: #f8fafc; padding: 14px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
                          <strong>Time of change:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)<br/>
                          If you did not perform this change, please contact HR administration immediately.
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
                        DS Projects Private Limited • Andhra Pradesh
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });
    } catch (mailErr) {
      console.warn('[Employee Auth] Password confirmation email warning:', mailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully. You can now login with your new password.',
      employeeId: employeeId || '',
      email: formattedEmail,
    });
  } catch (error) {
    console.error('[Employee Auth] Critical error in resetEmployeePassword:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update password. Please try again.',
      message: 'Failed to update password. Please try again.',
    });
  }
};

