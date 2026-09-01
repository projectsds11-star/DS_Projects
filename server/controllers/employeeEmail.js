import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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
 * EMAIL 1: Welcome Email (Sent immediately upon adding employee)
 * Confirms registration in DS Projects and congratulates the employee.
 */
export const sendWelcomeEmail = async (req, res) => {
  const {
    employeeId,
    fullName,
    email,
    phone,
    designation,
    district,
    mandal,
    joiningDate,
  } = req.body;

  if (!email || !fullName) {
    return res.status(400).json({ message: 'Employee name and email are required.' });
  }

  const role = designation || 'Mandal Co-ordinator';
  const locDistrict = district || 'Nellore';
  const locMandal = mandal || 'Field';
  const empId = employeeId || 'DS-001';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to DS Projects</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc; color: #334155; line-height: 1.6;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; max-width: 600px; width: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 25px 30px; text-align: left;">
              <h1 style="color: #ffffff; font-size: 20px; font-weight: bold; margin: 0; letter-spacing: 0.5px;">DS PROJECTS PRIVATE LIMITED</h1>
              <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">Employee Registration Confirmation</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 30px; font-size: 14px; color: #334155;">
              <p style="margin-top: 0; font-size: 16px;">Dear <strong>${fullName}</strong>,</p>
              
              <p>Congratulations and a warm welcome to <strong>DS Projects Private Limited</strong>! We are delighted to have you join our team and wish you great success in your journey with us.</p>
              
              <p>Your official employee profile has been successfully registered in our corporate system with the following details:</p>

              <!-- Details Box -->
              <table width="100%" cellspacing="0" cellpadding="8" style="background-color: #f8fafc; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0; font-size: 13px;">
                <tr>
                  <td width="38%" style="color: #64748b; font-weight: bold;">Employee Name:</td>
                  <td style="color: #0f172a; font-weight: 600;">${fullName}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: bold;">Official Employee ID:</td>
                  <td style="color: #1e3a8a; font-weight: bold; font-family: monospace;">${empId}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: bold;">Registered Email:</td>
                  <td style="color: #0f172a;">${email}</td>
                </tr>
              </table>

              <p>Our HR administration team is currently preparing your onboarding documentation and job offer details. You will receive a subsequent email with your detailed compensation structure (CTC) and secure login credentials to access your employee portal.</p>

              <p>Once again, congratulations on joining the DS Projects team!</p>

              <p style="margin-bottom: 0; margin-top: 25px;">
                Warm regards,<br>
                <strong>HR Administration</strong><br>
                <strong>DS Projects Private Limited</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 15px 30px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
              DS Projects Private Limited &bull; Andhra Pradesh &bull; support: contact@dsprojects.in
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: `"DS Projects HR" <${process.env.EMAIL_USER || 'projectsds11@gmail.com'}>`,
      to: email,
      subject: `🎉 Welcome to DS Projects Private Limited — Registration Confirmed (${empId})`,
      html: htmlContent,
    });

    console.log(`✅ Welcome Email (Email 1) sent to ${email} (ID: ${info.messageId})`);

    return res.status(200).json({
      success: true,
      message: `Welcome email sent successfully to ${email}`,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send welcome email.',
      error: error.message,
    });
  }
};

/**
 * EMAIL 2: Onboarding & Job Offer Completion Email (Sent after Onboarding is completed)
 * Contains Admin wishes, CTC breakdown, and auto-generated system credentials.
 */
export const sendOnboardingCompletionEmail = async (req, res) => {
  const {
    employeeId,
    fullName,
    email,
    position,
    district,
    mandal,
    joiningDate,
    salary,
    username,
    password,
  } = req.body;

  if (!email || !fullName) {
    return res.status(400).json({ message: 'Employee name and email are required.' });
  }

  const role = position || 'Mandal Co-ordinator';
  const locDistrict = district || 'Nellore';
  const locMandal = mandal || 'Kavali';
  const empId = employeeId || 'DS-001';
  const portalUrl = process.env.VITE_APP_URL || 'http://localhost:5173/employee/login';

  // System auto-generated credentials (non-editable by admin)
  const systemUsername = username || empId;
  const systemPassword = password || `DS@${empId.replace(/[^a-zA-Z0-9]/g, '')}!2026`;

  // Salary / CTC formatted
  const basic = Number(salary?.basic || 16000).toLocaleString('en-IN');
  const travel = Number(salary?.travel || 3000).toLocaleString('en-IN');
  const incentive = Number(salary?.incentive || 3500).toLocaleString('en-IN');
  const other = Number(salary?.other || 1500).toLocaleString('en-IN');
  const monthlyTotal = Number(salary?.monthlyTotal || 24000).toLocaleString('en-IN');
  const annualCtc = Number(salary?.annualCtc || 288000).toLocaleString('en-IN');

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
              <p style="margin-top: 0; font-size: 16px;">Dear <strong>${fullName}</strong>,</p>
              
              <p>On behalf of the Administration and Management of <strong>DS Projects Private Limited</strong>, we extend our warmest wishes and are pleased to notify you that your employee onboarding process has been <strong>successfully completed</strong>!</p>
              
              <p>Your employment terms, deployment area, and compensation details (CTC) have been officially confirmed as follows:</p>

              <!-- Deployment Info -->
              <table width="100%" cellspacing="0" cellpadding="8" style="background-color: #f8fafc; border-radius: 8px; margin: 15px 0; border: 1px solid #e2e8f0; font-size: 13px;">
                <tr>
                  <td width="38%" style="color: #64748b; font-weight: bold;">Designation / Position:</td>
                  <td style="color: #0f172a; font-weight: 600;">${role}</td>
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

              <!-- CTC Breakdown Box -->
              <h3 style="font-size: 14px; font-weight: bold; color: #0f172a; margin: 20px 0 8px 0;">Salary & Compensation Breakdown (CTC):</h3>
              <table width="100%" cellspacing="0" cellpadding="8" style="background-color: #ffffff; border-radius: 8px; margin-bottom: 20px; border: 1px solid #cbd5e1; font-size: 13px;">
                <tr style="background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
                  <th align="left" style="padding: 8px; color: #475569;">Component</th>
                  <th align="right" style="padding: 8px; color: #475569;">Monthly (₹)</th>
                </tr>
                <tr>
                  <td style="border-bottom: 1px solid #f1f5f9; color: #334155;">Basic Salary</td>
                  <td align="right" style="border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">₹${basic}</td>
                </tr>
                <tr>
                  <td style="border-bottom: 1px solid #f1f5f9; color: #334155;">Travel & Field Allowance</td>
                  <td align="right" style="border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">₹${travel}</td>
                </tr>
                <tr>
                  <td style="border-bottom: 1px solid #f1f5f9; color: #334155;">Performance Incentive</td>
                  <td align="right" style="border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">₹${incentive}</td>
                </tr>
                <tr>
                  <td style="border-bottom: 1px solid #f1f5f9; color: #334155;">Special / Other Allowance</td>
                  <td align="right" style="border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">₹${other}</td>
                </tr>
                <tr style="background-color: #eff6ff; font-weight: bold;">
                  <td style="color: #1e3a8a;">Total Monthly Gross</td>
                  <td align="right" style="color: #1e3a8a; font-size: 14px;">₹${monthlyTotal}</td>
                </tr>
                <tr style="background-color: #1e3a8a; color: #ffffff; font-weight: bold;">
                  <td style="color: #ffffff; padding: 10px 8px;">Annual CTC</td>
                  <td align="right" style="color: #ffffff; padding: 10px 8px; font-size: 15px;">₹${annualCtc}</td>
                </tr>
              </table>

              <!-- Auto-generated Credentials Box (System generated, non-editable by admin) -->
              <div style="background-color: #fefce8; border: 1.5px solid #fde047; border-radius: 10px; padding: 18px 20px; margin: 25px 0;">
                <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #854d0e;">🔐 Employee Portal Login Credentials</h3>
                <p style="font-size: 12px; color: #713f12; margin: 0 0 12px 0;">
                  These system credentials have been automatically generated. Use them to log into the Employee Portal:
                </p>
                <table width="100%" cellspacing="0" cellpadding="4" style="font-size: 13px;">
                  <tr>
                    <td width="35%" style="color: #854d0e; font-weight: bold;">Portal URL:</td>
                    <td><a href="${portalUrl}" style="color: #2563eb; text-decoration: underline; font-weight: bold;">${portalUrl}</a></td>
                  </tr>
                  <tr>
                    <td style="color: #854d0e; font-weight: bold;">Username / ID:</td>
                    <td style="color: #0f172a; font-family: monospace; font-size: 14px; font-weight: bold;">${systemUsername}</td>
                  </tr>
                  <tr>
                    <td style="color: #854d0e; font-weight: bold;">Temporary Password:</td>
                    <td style="color: #b91c1c; font-family: monospace; font-size: 14px; font-weight: bold;">${systemPassword}</td>
                  </tr>
                </table>
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
                <strong>DS Projects Private Limited</strong>
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

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: `"DS Projects Administration" <${process.env.EMAIL_USER || 'projectsds11@gmail.com'}>`,
      to: email,
      subject: `📜 Employment Offer, CTC Details & Portal Credentials — DS Projects (${empId})`,
      html: htmlContent,
    });

    console.log(`✅ Onboarding & Credentials Email (Email 2) sent to ${email} (ID: ${info.messageId})`);

    return res.status(200).json({
      success: true,
      message: `Onboarding completion email with credentials sent to ${email}`,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('❌ Error sending onboarding email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send onboarding email.',
      error: error.message,
    });
  }
};
