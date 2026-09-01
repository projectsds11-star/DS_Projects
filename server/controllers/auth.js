import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from both server and root directories
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// In-memory store for OTPs (email -> { otp, expiresAt })
const otpStore = new Map();

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

export const requestOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  const ADMIN_EMAILS = [
    'shaikjakeerbasha07@gmail.com',
    'balajiprojects049@gmail.com',
    'projectsds11@gmail.com',
  ];

  const formattedEmail = email.toLowerCase().trim();

  if (!ADMIN_EMAILS.includes(formattedEmail)) {
    return res.status(403).json({ message: 'Unauthorized email address. Access denied.' });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP with 10-minute expiry
  const expiresAt = Date.now() + 10 * 60 * 1000;
  otpStore.set(formattedEmail, { otp, expiresAt });

  console.log(`\n========================================`);
  console.log(`🔑 ADMIN OTP for ${formattedEmail} is: ${otp}`);
  console.log(`========================================\n`);

  try {
    const transporter = getTransporter();
    const mailOptions = {
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
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email successfully sent to ${formattedEmail}`);
    res.status(200).json({ 
      message: `Passcode sent to ${formattedEmail}`
    });
  } catch (error) {
    console.error('⚠️ Error sending email:', error.message);
    res.status(500).json({ 
      message: 'Failed to deliver OTP email. Please verify SMTP credentials or try again.'
    });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  const formattedEmail = email.toLowerCase().trim();
  const storedData = otpStore.get(formattedEmail);

  if (!storedData) {
    return res.status(400).json({ message: 'No OTP requested for this email or it has expired.' });
  }

  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(formattedEmail);
    return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
  }

  if (storedData.otp !== otp.trim()) {
    return res.status(400).json({ message: 'Invalid OTP. Please check the code and try again.' });
  }

  // OTP is correct
  otpStore.delete(formattedEmail);

  // Generate JWT token
  const token = jwt.sign(
    { email: formattedEmail, role: 'admin' },
    process.env.JWT_SECRET || 'super_secret_jwt_key_replace_me_in_production',
    { expiresIn: '8h' }
  );

  res.status(200).json({ message: 'Login successful', token, email: formattedEmail });
};
