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

// ✅ Supabase client for persistent OTP storage (works across serverless instances)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://wprxkmxbuwipmymswmgq.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwcnhrbXhidXdpcG15bXN3bWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNjc4NjAsImV4cCI6MjEwMzc0Mzg2MH0.1v8bdsxokG7TWleHilXtHsO9gl5ai7xhYfZ_3GcsENQ'
);

function getTransporter() {
  const user = process.env.EMAIL_USER || 'projectsds11@gmail.com';
  const pass = process.env.EMAIL_PASS || 'csuuuanyimfzoarx';
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: user.trim(), pass: pass.trim() },
  });
}

const ADMIN_EMAILS = [
  'shaikjakeerbasha07@gmail.com',
  'balajiprojects049@gmail.com',
  'projectsds11@gmail.com',
];

// ─── REQUEST OTP ────────────────────────────────────────────────────────────
export const requestOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required.' });

  const formattedEmail = email.toLowerCase().trim();

  if (!ADMIN_EMAILS.includes(formattedEmail)) {
    return res.status(403).json({ message: 'Unauthorized email address. Access denied.' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min expiry

  // Store OTP in Supabase (upsert so only one OTP per email at a time)
  const { error: upsertError } = await supabase
    .from('admin_otps')
    .upsert({ email: formattedEmail, otp, expires_at: expiresAt }, { onConflict: 'email' });

  if (upsertError) {
    console.error('Supabase OTP upsert error:', upsertError.message);
    // Fallback: continue anyway (email will still be sent)
  }

  console.log(`\n========================================`);
  console.log(`🔑 ADMIN OTP for ${formattedEmail}: ${otp}`);
  console.log(`========================================\n`);

  try {
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

    console.log(`✅ OTP email sent to ${formattedEmail}`);
    return res.status(200).json({ message: `Passcode sent to ${formattedEmail}` });
  } catch (error) {
    console.error('⚠️ Error sending OTP email:', error.message);
    return res.status(500).json({ message: 'Failed to deliver OTP email. Please try again.' });
  }
};

// ─── VERIFY OTP ─────────────────────────────────────────────────────────────
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  const formattedEmail = email.toLowerCase().trim();

  // Fetch OTP from Supabase
  const { data, error } = await supabase
    .from('admin_otps')
    .select('otp, expires_at')
    .eq('email', formattedEmail)
    .single();

  if (error || !data) {
    return res.status(400).json({ message: 'No OTP requested for this email or it has expired.' });
  }

  // Check expiry
  if (new Date() > new Date(data.expires_at)) {
    await supabase.from('admin_otps').delete().eq('email', formattedEmail);
    return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
  }

  // Check OTP value
  if (data.otp !== otp.trim()) {
    return res.status(400).json({ message: 'Invalid OTP. Please check the code and try again.' });
  }

  // ✅ OTP correct — delete it so it can't be reused
  await supabase.from('admin_otps').delete().eq('email', formattedEmail);

  // Generate JWT
  const token = jwt.sign(
    { email: formattedEmail, role: 'admin' },
    process.env.JWT_SECRET || 'DS_Projects_JWT_SuperSecret_2026_#Andhra',
    { expiresIn: '8h' }
  );

  return res.status(200).json({ message: 'Login successful', token, email: formattedEmail });
};
