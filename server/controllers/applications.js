/**
 * server/controllers/applications.js
 * Controller for Job Applications (MSME ZED Certification Field Work & General Careers)
 * Supports Supabase database storage with automatic fallback for maximum reliability.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { supabaseAdmin } from '../services/supabaseAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const FALLBACK_DIR = path.resolve(__dirname, '../data');
const FALLBACK_FILE = path.resolve(FALLBACK_DIR, 'job_applications_fallback.json');

// Ensure fallback data directory exists
function ensureFallbackStore() {
  try {
    if (!fs.existsSync(FALLBACK_DIR)) {
      fs.mkdirSync(FALLBACK_DIR, { recursive: true });
    }
    if (!fs.existsSync(FALLBACK_FILE)) {
      fs.writeFileSync(FALLBACK_FILE, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (err) {
    console.warn('[Applications] Failed to initialize fallback storage:', err.message);
  }
}

function readFallbackApplications() {
  ensureFallbackStore();
  try {
    const raw = fs.readFileSync(FALLBACK_FILE, 'utf8');
    return JSON.parse(raw) || [];
  } catch (err) {
    console.warn('[Applications] Error reading fallback applications:', err.message);
    return [];
  }
}

function saveFallbackApplications(list) {
  ensureFallbackStore();
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Applications] Error saving fallback applications:', err.message);
  }
}

// ── Email Transporter ────────────────────────────────────────────────────────
function getTransporter() {
  const user = (process.env.EMAIL_USER || 'projectsds11@gmail.com').trim();
  const pass = (process.env.EMAIL_PASS || 'csuuuanyimfzoarx').trim();
  return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
}

// ── Application Number Generator ─────────────────────────────────────────────
async function generateNextAppNo() {
  try {
    const { data, error } = await supabaseAdmin.rpc('generate_application_no');
    if (!error && data) {
      return data;
    }
  } catch (err) {
    // Continue to fallback generator
  }

  // Fallback generation: format APP-YYYY-XXXX
  const currentYear = new Date().getFullYear();
  let nextSeq = 1;

  try {
    const { data: latest } = await supabaseAdmin
      .from('job_applications')
      .select('application_no')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latest && latest.application_no) {
      const match = latest.application_no.match(/APP-\d{4}-(\d+)/);
      if (match && match[1]) {
        nextSeq = parseInt(match[1], 10) + 1;
      }
    }
  } catch (err) {
    const local = readFallbackApplications();
    nextSeq = local.length + 1;
  }

  return `APP-${currentYear}-${String(nextSeq).padStart(4, '0')}`;
}

// ── Send Confirmation Emails ─────────────────────────────────────────────────
async function sendApplicationConfirmationEmails(appData) {
  try {
    const transporter = getTransporter();
    const { application_no, full_name, email, mobile_number, position_applied_for, preferred_area } = appData;

    // 1. Applicant Confirmation Email
    if (email && email.includes('@')) {
      const applicantHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Job Application Submitted Successfully - DS Projects</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f1f5f9; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.07);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0A192F 0%, #1E3A8A 100%); padding: 28px 32px; color: #ffffff;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; color: #ffffff;">DS PROJECTS</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #38bdf8; font-weight: 600;">MSME Sustainable (ZED) Certification &amp; Field Operations</p>
      <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;">Corporate Office: RRR Complex, Guntur Mini Bypass Road, Opposite Royal Oak, Ongole-523001</p>
    </div>
    
    <div style="padding: 32px;">
      <!-- Success Badge -->
      <div style="display: inline-block; padding: 6px 16px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; font-size: 12px; font-weight: 800; color: #047857; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px;">
        ✓ Application Submitted Successfully
      </div>

      <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a;">Dear ${full_name},</h2>
      <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 1.6;">
        Thank you for applying to <strong>DS PROJECTS PRIVATE LIMITED</strong>. Your application for <strong>${position_applied_for}</strong> has been successfully received and registered in our central recruitment database.
      </p>

      <!-- Application Details Card -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="text-align: center; padding-bottom: 14px; margin-bottom: 14px; border-bottom: 1px dashed #cbd5e1;">
          <span style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #64748b; letter-spacing: 1px;">Your Official Application Number</span>
          <div style="font-size: 22px; font-family: monospace; font-weight: 800; color: #E63946; margin-top: 4px;">
            ${application_no}
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 42%;">Position Applied:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: bold;">${position_applied_for}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Registered Mobile:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${mobile_number}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Registered Email:</td>
            <td style="padding: 6px 0; color: #0f172a;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Preferred Field Area:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${preferred_area || 'Andhra Pradesh'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Submission Date:</td>
            <td style="padding: 6px 0; color: #0f172a;">${new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
          </tr>
        </table>
      </div>

      <!-- 4 to 5 Days Timeline Notification Callout -->
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-left: 5px solid #10b981; border-radius: 10px; padding: 18px; margin-bottom: 24px;">
        <div style="font-weight: 800; color: #065f46; font-size: 14px; margin-bottom: 6px; display: flex; align-items: center;">
          📞 What happens next? (4 to 5 Days Review Window)
        </div>
        <p style="margin: 0; font-size: 13px; color: #047857; line-height: 1.6;">
          Our recruitment and field operations team is currently reviewing your profile and qualifications. <strong>Our team will connect with you within 4 to 5 working days</strong> via telephone call or email regarding your interview schedule, mandal allocation, and field orientation.
        </p>
      </div>

      <!-- Helpful Instructions -->
      <div style="background-color: #f8fafc; border-radius: 10px; padding: 16px; margin-bottom: 24px; font-size: 12px; color: #64748b;">
        <strong style="color: #334155; display: block; margin-bottom: 6px;">Important Candidate Notes:</strong>
        <ul style="margin: 0; padding-left: 18px; line-height: 1.7;">
          <li>Please keep your <strong>Application Number (${application_no})</strong> safe for future correspondence.</li>
          <li>Keep your mobile phone reachable during business hours (9:30 AM to 6:30 PM).</li>
          <li>Keep your original educational documents, Aadhaar card, and driving license ready for verification.</li>
        </ul>
      </div>

      <p style="font-size: 13px; color: #475569; margin: 0 0 24px 0;">
        If you have any urgent queries regarding your application, feel free to contact our recruitment desk at <strong>+91 9701529191</strong> or email us at <strong>projectsds11@gmail.com</strong>.
      </p>

      <!-- Signature Footer -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #64748b;">
        <p style="margin: 0; font-size: 14px; font-weight: 800; color: #0f172a;">Recruitment &amp; Field Operations Directorate</p>
        <p style="margin: 2px 0 0 0; font-weight: 600; color: #475569;">DS Projects Private Limited</p>
        <p style="margin: 4px 0 0 0; color: #94a3b8;">
          RRR Complex, Guntur Mini Bypass Road, Opposite Royal Oak, Ongole-523001, Andhra Pradesh<br>
          Website: <a href="https://www.dsprojectss.com" style="color: #1e3a8a; text-decoration: none;">www.dsprojectss.com</a> | Helpline: +91 9701529191
        </p>
      </div>
    </div>
  </div>
</body>
</html>
      `;

      await transporter.sendMail({
        from: '"DS Projects HR" <projectsds11@gmail.com>',
        to: email,
        subject: `🎉 Application Submitted Successfully: ${position_applied_for} (${application_no}) - DS Projects`,
        html: applicantHtml,
      }).catch(e => console.warn('[Applications Email] Applicant notification failed:', e.message));
    }

    // 2. Admin Alert Email
    const adminEmail = process.env.EMAIL_USER || 'projectsds11@gmail.com';
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
        <h2 style="color: #1e3a8a;">New Job Application Received</h2>
        <p>A new candidate has submitted an application on the DS Projects portal:</p>
        <ul>
          <li><strong>Application No:</strong> ${application_no}</li>
          <li><strong>Candidate Name:</strong> ${full_name}</li>
          <li><strong>Position:</strong> ${position_applied_for}</li>
          <li><strong>Phone:</strong> ${mobile_number}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Preferred Area:</strong> ${preferred_area || 'Not specified'}</li>
        </ul>
        <p>Please log in to the DS Projects Admin Portal to view full qualifications and candidate documents.</p>
      </div>
    `;

    await transporter.sendMail({
      from: '"DS Projects Portal" <projectsds11@gmail.com>',
      to: adminEmail,
      subject: `[New Applicant] ${full_name} - ${position_applied_for} (${application_no})`,
      html: adminHtml,
    }).catch(e => console.warn('[Applications Email] Admin alert failed:', e.message));

  } catch (emailErr) {
    console.warn('[Applications Email] Could not send confirmation emails:', emailErr.message);
  }
}

// ── Public: Submit Application ───────────────────────────────────────────────
export const submitApplication = async (req, res) => {
  try {
    const body = req.body || {};

    const fullName = (body.fullName || body.full_name || '').trim();
    const mobile = (body.mobileNumber || body.mobile_number || '').trim();
    const email = (body.emailAddress || body.email || '').trim().toLowerCase();

    if (!fullName) {
      return res.status(422).json({ success: false, message: 'Full Name is required.' });
    }
    if (!mobile) {
      return res.status(422).json({ success: false, message: 'Mobile Number is required.' });
    }
    if (!email) {
      return res.status(422).json({ success: false, message: 'Valid Email Address is required.' });
    }

    const applicationNo = await generateNextAppNo();
    const position = body.positionAppliedFor || body.position_applied_for || 'MSME ZED Certification Field Work';

    // Normalize qualifications
    const qualifications = Array.isArray(body.qualifications) ? body.qualifications : [
      { qualification: 'SSC / 10th', school: body.sscSchool || '', stream: body.sscStream || 'General', year: body.sscYear || '', score: body.sscScore || '' },
      { qualification: 'Intermediate / Diploma', school: body.interSchool || '', stream: body.interStream || '', year: body.interYear || '', score: body.interScore || '' },
      { qualification: 'Graduation (Degree)', school: body.gradSchool || '', stream: body.gradStream || '', year: body.gradYear || '', score: body.gradScore || '' },
      { qualification: 'Post-Graduation / Other', school: body.pgSchool || '', stream: body.pgStream || '', year: body.pgYear || '', score: body.pgScore || '' },
    ];

    // Normalize work experience
    const workExperience = Array.isArray(body.workExperience) ? body.workExperience : [];

    // Normalize languages
    const languagesKnown = Array.isArray(body.languagesKnown) ? body.languagesKnown : (body.languages || ['Telugu']);

    const applicationRecord = {
      id: crypto.randomUUID(),
      application_no: applicationNo,
      position_applied_for: position,
      application_date: body.applicationDate || body.application_date || new Date().toISOString().split('T')[0],
      
      // Personal Details
      full_name: fullName,
      father_or_guardian_name: (body.fatherName || body.father_or_guardian_name || '').trim(),
      date_of_birth: body.dateOfBirth || body.date_of_birth || null,
      gender: body.gender || 'Male',
      mobile_number: mobile,
      alternate_mobile: (body.alternateMobile || body.alternate_mobile || '').trim(),
      email: email,
      marital_status: body.maritalStatus || body.marital_status || 'Single',
      aadhaar_or_id_number: (body.aadhaarNumber || body.aadhaar_or_id_number || '').trim(),
      two_wheeler_and_license: Boolean(body.twoWheelerAndLicense ?? body.two_wheeler_and_license ?? false),
      present_address: (body.presentAddress || body.present_address || '').trim(),
      permanent_address: (body.permanentAddress || body.permanent_address || '').trim(),
      candidate_photo_url: body.candidatePhotoUrl || body.candidate_photo_url || '',

      // Educational Qualifications
      qualifications: qualifications,

      // Work Experience & Field Readiness
      work_experience: workExperience,
      languages_known: languagesKnown,
      languages_other: (body.languagesOther || body.languages_other || '').trim(),
      willing_to_travel: Boolean(body.willingToTravel ?? body.willing_to_travel ?? true),
      preferred_area: (body.preferredArea || body.preferred_area || '').trim(),

      // Declaration & Sign-off
      place: (body.place || '').trim(),
      declaration_accepted: true,
      signature_url: body.signatureUrl || body.signature_url || '',
      resume_url: body.resumeUrl || body.resume_url || '',

      // Office Use Only
      interview_date: null,
      status: 'submitted',
      authorized_signatory: '',
      office_notes: '',

      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    let savedInSupabase = false;

    try {
      const { data, error } = await supabaseAdmin
        .from('job_applications')
        .insert(applicationRecord)
        .select()
        .single();

      if (!error && data) {
        savedInSupabase = true;
      } else {
        console.warn('[Applications] Supabase insert warning:', error?.message);
      }
    } catch (dbErr) {
      console.warn('[Applications] Supabase connection error:', dbErr.message);
    }

    // Always ensure saved in fallback store so data is never lost
    const fallbackList = readFallbackApplications();
    fallbackList.unshift(applicationRecord);
    saveFallbackApplications(fallbackList);

    // Send confirmation emails in background
    sendApplicationConfirmationEmails(applicationRecord).catch(e => console.error(e));

    return res.status(201).json({
      success: true,
      message: 'Your job application has been successfully submitted.',
      application: applicationRecord,
      applicationNo: applicationNo,
      persistedTo: savedInSupabase ? 'database' : 'local_store',
    });
  } catch (err) {
    console.error('[Applications] Error submitting application:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'An error occurred while submitting your application.',
    });
  }
};

// ── Public: Get Application By ID or Application No ─────────────────────────
export const getPublicApplication = async (req, res) => {
  try {
    const { idOrAppNo } = req.params;
    if (!idOrAppNo) {
      return res.status(400).json({ success: false, message: 'Application identifier is required.' });
    }

    let application = null;

    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrAppNo);
      let query = supabaseAdmin.from('job_applications').select('*');
      if (isUuid) {
        query = query.or(`id.eq.${idOrAppNo},application_no.eq.${idOrAppNo}`);
      } else {
        query = query.eq('application_no', idOrAppNo);
      }
      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        application = data;
      }
    } catch (dbErr) {
      console.warn('[Applications] Supabase query error:', dbErr.message);
    }

    if (!application) {
      const local = readFallbackApplications();
      application = local.find(a => a.id === idOrAppNo || a.application_no === idOrAppNo);
    }

    if (!application || application.deleted_at) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
    }

    return res.status(200).json({ success: true, application });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: List Applications ─────────────────────────────────────────────────
export const listApplications = async (req, res) => {
  try {
    const { status, search } = req.query;
    let list = [];

    try {
      let query = supabaseAdmin
        .from('job_applications')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (search && search.trim()) {
        const q = search.trim();
        query = query.or(`full_name.ilike.%${q}%,application_no.ilike.%${q}%,email.ilike.%${q}%,mobile_number.ilike.%${q}%,preferred_area.ilike.%${q}%`);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        list = data;
      }
    } catch (dbErr) {
      console.warn('[Applications] Error fetching from Supabase, loading fallback store:', dbErr.message);
    }

    // Merge with fallback store if any records exist there and not in DB
    const fallbackList = readFallbackApplications().filter(a => !a.deleted_at);
    const existingIds = new Set(list.map(a => a.id));
    for (const item of fallbackList) {
      if (!existingIds.has(item.id)) {
        list.push(item);
      }
    }

    // Apply filters to merged list if query didn't run via DB
    if (status && status !== 'all') {
      list = list.filter(a => a.status === status);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(a =>
        (a.full_name || '').toLowerCase().includes(q) ||
        (a.application_no || '').toLowerCase().includes(q) ||
        (a.email || '').toLowerCase().includes(q) ||
        (a.mobile_number || '').includes(q) ||
        (a.preferred_area || '').toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      applications: list,
      total: list.length,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: Update Application (Office Use Only) ──────────────────────────────
export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (body.status !== undefined) updates.status = body.status;
    if (body.interviewDate !== undefined || body.interview_date !== undefined) {
      updates.interview_date = body.interviewDate || body.interview_date || null;
    }
    if (body.authorizedSignatory !== undefined || body.authorized_signatory !== undefined) {
      updates.authorized_signatory = body.authorizedSignatory || body.authorized_signatory || '';
    }
    if (body.officeNotes !== undefined || body.office_notes !== undefined) {
      updates.office_notes = body.officeNotes || body.office_notes || '';
    }

    let updatedRecord = null;

    try {
      const { data, error } = await supabaseAdmin
        .from('job_applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        updatedRecord = data;
      }
    } catch (dbErr) {
      console.warn('[Applications] Update in Supabase failed, updating local store:', dbErr.message);
    }

    // Also update in fallback store
    const local = readFallbackApplications();
    const idx = local.findIndex(a => a.id === id || a.application_no === id);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...updates };
      saveFallbackApplications(local);
      if (!updatedRecord) updatedRecord = local[idx];
    }

    if (!updatedRecord) {
      return res.status(404).json({ success: false, message: 'Application record not found to update.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Application status and office records updated successfully.',
      application: updatedRecord,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: Delete Application ────────────────────────────────────────────────
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      await supabaseAdmin
        .from('job_applications')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
    } catch (dbErr) {
      console.warn('[Applications] Soft delete in Supabase failed:', dbErr.message);
    }

    const local = readFallbackApplications();
    const updated = local.filter(a => a.id !== id && a.application_no !== id);
    saveFallbackApplications(updated);

    return res.status(200).json({
      success: true,
      message: 'Application record removed successfully.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
