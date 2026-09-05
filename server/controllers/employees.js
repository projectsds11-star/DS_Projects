/**
 * server/controllers/employees.js
 * Full CRUD for Employee module — production grade.
 * All sensitive operations (create/update/delete/status) run here with service-role access.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { supabaseAdmin } from '../services/supabaseAdmin.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ── Location validation (uses the same master data as frontend) ────────────
// We import directly from the src/data folder (same monorepo)
let AP_DISTRICTS_DATA = [];
let AP_DISTRICT_MANDAL_MAP = {};

try {
  const mod = await import('../../src/data/andhraPradeshMasterData.js');
  AP_DISTRICTS_DATA = mod.AP_DISTRICTS_DATA || [];
  AP_DISTRICT_MANDAL_MAP = mod.AP_DISTRICT_MANDAL_MAP || {};
} catch (e) {
  console.warn('[EmployeeCtrl] Could not load AP master data — location validation skipped:', e.message);
}

function isValidLocation(stateId, districtId, mandalId) {
  // state must be AP
  if (!stateId || !stateId.includes('AP')) return false;
  const mandals = AP_DISTRICT_MANDAL_MAP[districtId];
  if (!Array.isArray(mandals)) return false;
  return mandals.includes(mandalId);
}

// ── Nodemailer ─────────────────────────────────────────────────────────────
function getTransporter() {
  const user = (process.env.EMAIL_USER || 'projectsds11@gmail.com').trim();
  const pass = (process.env.EMAIL_PASS || 'csuuuanyimfzoarx').trim();
  return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
}

async function sendWelcomeEmail({ employeeId, name, email }) {
  const html = `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f8fafc;color:#334155">
<table width="100%" cellspacing="0" cellpadding="0" style="padding:30px 15px">
  <tr><td align="center">
    <table width="600" cellspacing="0" cellpadding="0" style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;max-width:600px">
      <tr>
        <td style="background:#0f172a;padding:25px 30px">
          <h1 style="color:#fff;font-size:20px;margin:0">DS PROJECTS PRIVATE LIMITED</h1>
          <p style="color:#94a3b8;font-size:12px;margin:4px 0 0">Employee Registration Confirmation</p>
        </td>
      </tr>
      <tr>
        <td style="padding:30px;font-size:14px">
          <p style="font-size:16px;margin-top:0">Dear <strong>${name}</strong>,</p>
          <p>Congratulations and a warm welcome to <strong>DS Projects Private Limited</strong>! We are delighted to have you join our team.</p>
          <p>Your official employee profile has been successfully registered in our system with the following details:</p>
          <table width="100%" cellspacing="0" cellpadding="8" style="background:#f8fafc;border-radius:8px;margin:20px 0;border:1px solid #e2e8f0;font-size:13px">
            <tr><td width="38%" style="color:#64748b;font-weight:bold">Employee Name:</td><td style="color:#0f172a;font-weight:600">${name}</td></tr>
            <tr><td style="color:#64748b;font-weight:bold">Employee ID:</td><td style="color:#1e3a8a;font-weight:bold;font-family:monospace">${employeeId}</td></tr>
            <tr><td style="color:#64748b;font-weight:bold">Registered Email:</td><td style="color:#0f172a">${email}</td></tr>
          </table>
          <p>Our HR team is currently preparing your onboarding documentation. You will receive further communications shortly.</p>
          <p style="margin-bottom:0;margin-top:25px">Warm regards,<br><strong>HR Administration</strong><br><strong>DS Projects Private Limited</strong></p>
        </td>
      </tr>
      <tr>
        <td style="background:#f8fafc;padding:15px 30px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center">
          DS Projects Private Limited &bull; Andhra Pradesh
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  const transporter = getTransporter();
  const info = await transporter.sendMail({
    from: `"DS Projects HR" <${process.env.EMAIL_USER || 'projectsds11@gmail.com'}>`,
    to: email,
    subject: `Welcome to DS Projects Private Limited — Registration Confirmed (${employeeId})`,
    html,
  });
  return info.messageId;
}

// ── File upload helpers ─────────────────────────────────────────────────────
async function uploadFile(bucket, storagePath, buffer, mimetype) {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(storagePath, buffer, { contentType: mimetype, upsert: true });
  if (error) throw new Error(`Storage upload failed [${bucket}/${storagePath}]: ${error.message}`);
  return storagePath;
}

async function deleteFile(bucket, storagePath) {
  if (!storagePath) return;
  await supabaseAdmin.storage.from(bucket).remove([storagePath]);
}

// ── Validation helpers ──────────────────────────────────────────────────────
function validatePhone(v) {
  return /^[6-9]\d{9}$/.test(v.replace(/\s/g, ''));
}
function validatePAN(v) {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v);
}
function validateIFSC(v) {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v);
}
function validateAadhaar(v) {
  return /^\d{12}$/.test(v);
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE EMPLOYEE
// POST /api/admin/employees
// ─────────────────────────────────────────────────────────────────────────────
export const createEmployee = async (req, res) => {
  const {
    name, address, phone, email, qualification,
    course, university, year_of_passing,
    aadhaar_number, pan_number, account_holder_name, bank_name, account_number, ifsc_code, branch_name,
    reference_mobile, reference_person_name, reference_relationship,
    state_id, district_id, mandal_id,
  } = req.body;

  // ── 1. Field validation ──────────────────────────────────────────────────
  const errors = {};
  if (!name?.trim()) errors.name = 'Name is required.';
  if (!address?.trim()) errors.address = 'Address is required.';
  if (!phone?.trim() || !validatePhone(phone.trim())) errors.phone = 'Enter a valid 10-digit phone number.';
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email address.';
  if (!qualification?.trim()) errors.qualification = 'Qualification is required.';
  if (!aadhaar_number || !validateAadhaar(aadhaar_number.replace(/-/g, ''))) errors.aadhaar_number = 'Enter a valid 12-digit Aadhaar number.';
  if (!pan_number || !validatePAN(pan_number.toUpperCase())) errors.pan_number = 'Enter a valid PAN (e.g. ABCDE1234F).';
  if (!account_number?.trim() || account_number.trim().length < 9) errors.account_number = 'Enter a valid account number.';
  if (!ifsc_code || !validateIFSC(ifsc_code.toUpperCase())) errors.ifsc_code = 'Enter a valid IFSC code (e.g. SBIN0001234).';
  if (!reference_mobile?.trim() || !validatePhone(reference_mobile.trim())) errors.reference_mobile = 'Enter a valid reference mobile number.';
  if (!reference_person_name?.trim()) errors.reference_person_name = 'Reference person name is required.';
  if (!reference_relationship?.trim()) errors.reference_relationship = 'Relationship is required.';
  if (!state_id?.trim()) errors.state_id = 'Please select a state.';
  if (!district_id?.trim()) errors.district_id = 'Please select a district.';
  if (!mandal_id?.trim()) errors.mandal_id = 'Please select a mandal.';

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({ success: false, message: 'Validation failed.', errors });
  }

  // ── 2. Location hierarchy validation ─────────────────────────────────────
  if (AP_DISTRICTS_DATA.length > 0 && !isValidLocation(state_id, district_id, mandal_id)) {
    return res.status(422).json({ success: false, message: 'Invalid location: The selected State → District → Mandal combination is not valid.' });
  }

  // ── 3. Duplicate email check ──────────────────────────────────────────────
  const { data: existing } = await supabaseAdmin
    .from('employees')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .is('deleted_at', null)
    .limit(1);

  if (existing && existing.length > 0) {
    return res.status(409).json({ success: false, message: 'An employee with this email already exists.' });
  }

  // ── 4. Generate atomic Employee ID ────────────────────────────────────────
  const { data: idData, error: idError } = await supabaseAdmin.rpc('generate_employee_id');
  if (idError || !idData) {
    console.error('[createEmployee] ID generation error:', idError);
    return res.status(500).json({ success: false, message: 'Failed to generate Employee ID. Please try again.' });
  }
  const employeeId = idData;

  // ── 5. File uploads ───────────────────────────────────────────────────────
  let photoPath = null;
  let passbookPath = null;
  let aadhaarDocumentPath = null;
  let panDocumentPath = null;

  try {
    const photoFile = req.files?.photo?.[0];
    const passbookFile = req.files?.passbook?.[0];
    const aadhaarDocumentFile = req.files?.aadhaarDocument?.[0];
    const panDocumentFile = req.files?.panDocument?.[0];

    if (!photoFile) {
      return res.status(422).json({ success: false, message: 'Candidate photo is required.' });
    }
    if (!passbookFile) {
      return res.status(422).json({ success: false, message: 'Bank passbook is required.' });
    }
    if (!aadhaarDocumentFile) {
      return res.status(422).json({ success: false, message: 'Aadhaar document is required.' });
    }
    if (!panDocumentFile) {
      return res.status(422).json({ success: false, message: 'PAN document is required.' });
    }

    const photoExt = photoFile.originalname.split('.').pop().toLowerCase();
    const passbookExt = passbookFile.originalname.split('.').pop().toLowerCase();
    const aadhaarDocumentExt = aadhaarDocumentFile.originalname.split('.').pop().toLowerCase();
    const panDocumentExt = panDocumentFile.originalname.split('.').pop().toLowerCase();

    photoPath = `employees/${employeeId}/photo.${photoExt}`;
    passbookPath = `employees/${employeeId}/bank-passbook.${passbookExt}`;
    aadhaarDocumentPath = `employees/${employeeId}/aadhaar-document.${aadhaarDocumentExt}`;
    panDocumentPath = `employees/${employeeId}/pan-document.${panDocumentExt}`;

    await uploadFile('employee-photos', photoPath, photoFile.buffer, photoFile.mimetype);
    await uploadFile('employee-documents', passbookPath, passbookFile.buffer, passbookFile.mimetype);
    await uploadFile('employee-documents', aadhaarDocumentPath, aadhaarDocumentFile.buffer, aadhaarDocumentFile.mimetype);
    await uploadFile('employee-documents', panDocumentPath, panDocumentFile.buffer, panDocumentFile.mimetype);

  } catch (uploadErr) {
    // Cleanup partial uploads
    await deleteFile('employee-photos', photoPath);
    await deleteFile('employee-documents', passbookPath);
    await deleteFile('employee-documents', aadhaarDocumentPath);
    await deleteFile('employee-documents', panDocumentPath);
    return res.status(500).json({ success: false, message: uploadErr.message });
  }

  // ── 6. Database insert ────────────────────────────────────────────────────
  const employeeRecord = {
    employee_id: employeeId,
    full_name: name.trim(),
    address: address.trim(),
    phone: phone.trim().replace(/\s/g, ''),
    email: email.trim().toLowerCase(),
    candidate_photo_path: photoPath,
    qualification: qualification.trim(),
    course: course.trim(),
    university: university.trim(),
    year_of_passing: year_of_passing.trim(),
    aadhaar_number: aadhaar_number.replace(/-/g, ''),
    aadhaar_document_path: aadhaarDocumentPath,
    pan_number: pan_number.toUpperCase(),
    pan_document_path: panDocumentPath,
    bank_passbook_path: passbookPath,
    account_holder_name: account_holder_name.trim(),
    bank_name: bank_name.trim(),
    account_number: account_number.trim(),
    ifsc_code: ifsc_code.toUpperCase(),
    branch_name: branch_name.trim(),
    reference_mobile: reference_mobile.trim(),
    reference_person_name: reference_person_name.trim(),
    reference_relationship: reference_relationship.trim(),
    state_id: state_id.trim(),
    district_id: district_id.trim(),
    mandal_id: mandal_id.trim(),
    status: 'active',
  };

  const { data: created, error: insertError } = await supabaseAdmin
    .from('employees')
    .insert([employeeRecord])
    .select()
    .single();

  if (insertError) {
    // Rollback file uploads
    await deleteFile('employee-photos', photoPath);
    await deleteFile('employee-documents', passbookPath);
    console.error('[createEmployee] DB insert error:', insertError.message, insertError.details);
    return res.status(500).json({ success: false, message: `DB Error: ${insertError.message}` });
  }

  // ── 7. Welcome email (non-blocking — employee already created) ────────────
  let emailStatus = 'SENT';
  let emailError = null;
  let sentAt = null;

  try {
    await sendWelcomeEmail({ employeeId, name: name.trim(), email: email.trim().toLowerCase() });
    sentAt = new Date().toISOString();
  } catch (mailErr) {
    emailStatus = 'FAILED';
    emailError = mailErr.message;
    console.warn('[createEmployee] Welcome email failed (employee still created):', mailErr.message);
  }

  // ── 8. Email log ──────────────────────────────────────────────────────────
  await supabaseAdmin.from('email_logs').insert([{
    employee_id: created.id,
    recipient_email: email.trim().toLowerCase(),
    email_type: 'WELCOME_EMPLOYEE',
    subject: `Welcome to DS Projects Private Limited — Registration Confirmed (${employeeId})`,
    status: emailStatus,
    error_message: emailError,
    sent_at: sentAt,
  }]).select();

  return res.status(201).json({
    success: true,
    message: 'Employee created successfully.',
    data: {
      employee_id: employeeId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
    },
    emailStatus,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE EMPLOYEE
// PUT /api/admin/employees/:id
// ─────────────────────────────────────────────────────────────────────────────
export const updateEmployee = async (req, res) => {
  const { id } = req.params; // employee_id (DS-001)
  const {
    name, address, phone, email, qualification,
    course, university, year_of_passing,
    aadhaar_number, pan_number, account_holder_name, bank_name, account_number, ifsc_code, branch_name,
    reference_mobile, reference_person_name, reference_relationship,
    state_id, district_id, mandal_id,
  } = req.body;

  // Fetch existing record
  const { data: existing, error: fetchErr } = await supabaseAdmin
    .from('employees')
    .select('*')
    .eq('employee_id', id)
    .is('deleted_at', null)
    .single();

  if (fetchErr || !existing) {
    return res.status(404).json({ success: false, message: 'Employee not found.' });
  }

  // Duplicate email check (allow same email as own)
  if (email && email.trim().toLowerCase() !== existing.email) {
    const { data: emailConflict } = await supabaseAdmin
      .from('employees')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .is('deleted_at', null)
      .limit(1);
    if (emailConflict && emailConflict.length > 0) {
      return res.status(409).json({ success: false, message: 'An employee with this email already exists.' });
    }
  }

  // Location validation
  if (AP_DISTRICTS_DATA.length > 0 && state_id && district_id && mandal_id) {
    if (!isValidLocation(state_id, district_id, mandal_id)) {
      return res.status(422).json({ success: false, message: 'Invalid location hierarchy.' });
    }
  }

  // Handle file updates
  let photoPath = existing.candidate_photo_path;
  let passbookPath = existing.bank_passbook_path;
  let aadhaarDocumentPath = existing.aadhaar_document_path;
  let panDocumentPath = existing.pan_document_path;

  try {
    const photoFile = req.files?.photo?.[0];
    const passbookFile = req.files?.passbook?.[0];
    const aadhaarDocumentFile = req.files?.aadhaarDocument?.[0];
    const panDocumentFile = req.files?.panDocument?.[0];

    if (photoFile) {
      const photoExt = photoFile.originalname.split('.').pop().toLowerCase();
      const newPhotoPath = `employees/${id}/photo.${photoExt}`;
      await uploadFile('employee-photos', newPhotoPath, photoFile.buffer, photoFile.mimetype);
      photoPath = newPhotoPath;
    }

    if (passbookFile) {
      const passbookExt = passbookFile.originalname.split('.').pop().toLowerCase();
      const newPassbookPath = `employees/${id}/bank-passbook.${passbookExt}`;
      await uploadFile('employee-documents', newPassbookPath, passbookFile.buffer, passbookFile.mimetype);
      passbookPath = newPassbookPath;
    }

    if (aadhaarDocumentFile) {
      const aadhaarDocumentExt = aadhaarDocumentFile.originalname.split('.').pop().toLowerCase();
      const newAadhaarDocumentPath = `employees/${id}/aadhaar-document.${aadhaarDocumentExt}`;
      await uploadFile('employee-documents', newAadhaarDocumentPath, aadhaarDocumentFile.buffer, aadhaarDocumentFile.mimetype);
      aadhaarDocumentPath = newAadhaarDocumentPath;
    }

    if (panDocumentFile) {
      const panDocumentExt = panDocumentFile.originalname.split('.').pop().toLowerCase();
      const newPanDocumentPath = `employees/${id}/pan-document.${panDocumentExt}`;
      await uploadFile('employee-documents', newPanDocumentPath, panDocumentFile.buffer, panDocumentFile.mimetype);
      panDocumentPath = newPanDocumentPath;
    }
  } catch (uploadErr) {
    return res.status(500).json({ success: false, message: uploadErr.message });
  }

  const updates = {};
  if (name) updates.full_name = name.trim();
  if (address) updates.address = address.trim();
  if (phone) updates.phone = phone.trim();
  if (email) updates.email = email.trim().toLowerCase();
  if (qualification) updates.qualification = qualification.trim();
  if (course) updates.course = course.trim();
  if (university) updates.university = university.trim();
  if (year_of_passing) updates.year_of_passing = year_of_passing.trim();
  if (aadhaar_number) updates.aadhaar_number = aadhaar_number.replace(/-/g, '');
  if (pan_number) updates.pan_number = pan_number.toUpperCase();
  if (account_holder_name) updates.account_holder_name = account_holder_name.trim();
  if (bank_name) updates.bank_name = bank_name.trim();
  if (account_number) updates.account_number = account_number.trim();
  if (ifsc_code) updates.ifsc_code = ifsc_code.toUpperCase();
  if (branch_name) updates.branch_name = branch_name.trim();
  if (reference_mobile) updates.reference_mobile = reference_mobile.trim();
  if (reference_person_name) updates.reference_person_name = reference_person_name.trim();
  if (reference_relationship) updates.reference_relationship = reference_relationship.trim();
  if (state_id) updates.state_id = state_id.trim();
  if (district_id) updates.district_id = district_id.trim();
  if (mandal_id) updates.mandal_id = mandal_id.trim();
  updates.candidate_photo_path = photoPath;
  updates.bank_passbook_path = passbookPath;
  updates.aadhaar_document_path = aadhaarDocumentPath;
  updates.pan_document_path = panDocumentPath;

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('employees')
    .update(updates)
    .eq('employee_id', id)
    .select()
    .single();

  if (updateErr) {
    return res.status(500).json({ success: false, message: 'Failed to update employee record.' });
  }

  return res.status(200).json({ success: true, message: 'Employee updated successfully.', data: { employee_id: updated.employee_id } });
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE STATUS (Activate / Deactivate)
// PATCH /api/admin/employees/:id/status
// ─────────────────────────────────────────────────────────────────────────────
export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive', 'onboarding'].includes(status)) {
    return res.status(422).json({ success: false, message: 'Status must be "active", "inactive", or "onboarding".' });
  }

  const { error } = await supabaseAdmin
    .from('employees')
    .update({ status })
    .eq('employee_id', id)
    .is('deleted_at', null);

  if (error) {
    return res.status(500).json({ success: false, message: 'Failed to update employee status.' });
  }

  return res.status(200).json({ success: true, message: `Employee status updated to ${status} successfully.` });
};

// ─────────────────────────────────────────────────────────────────────────────
// SOFT DELETE
// DELETE /api/admin/employees/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  const { data: emp, error: fetchErr } = await supabaseAdmin
    .from('employees')
    .select('id, candidate_photo_path, bank_passbook_path, aadhaar_document_path, pan_document_path')
    .eq('employee_id', id)
    .single();

  if (fetchErr || !emp) {
    return res.status(404).json({ success: false, message: 'Employee not found.' });
  }

  // Hard delete from database
  const { error: delErr } = await supabaseAdmin
    .from('employees')
    .delete()
    .eq('employee_id', id);

  if (delErr) {
    return res.status(500).json({ success: false, message: 'Failed to delete employee.' });
  }

  // Cleanup files in background (don't block response)
  Promise.all([
    deleteFile('employee-photos', emp.candidate_photo_path),
    deleteFile('employee-documents', emp.bank_passbook_path),
    deleteFile('employee-documents', emp.aadhaar_document_path),
    deleteFile('employee-documents', emp.pan_document_path)
  ]).catch(err => console.error('[deleteEmployee] Failed to delete files:', err));

  return res.status(200).json({ success: true, message: 'Employee permanently removed.' });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET SIGNED URL (for private document preview)
// GET /api/admin/employees/:id/signed-url?bucket=...&path=...
// ─────────────────────────────────────────────────────────────────────────────
export const getSignedUrl = async (req, res) => {
  const { bucket, filePath } = req.query;

  if (!bucket || !filePath) {
    return res.status(400).json({ success: false, message: 'bucket and filePath query params required.' });
  }

  const allowedBuckets = ['employee-photos', 'employee-documents'];
  if (!allowedBuckets.includes(bucket)) {
    return res.status(400).json({ success: false, message: 'Invalid bucket.' });
  }

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(filePath, 3600); // 1 hour

  if (error || !data?.signedUrl) {
    return res.status(500).json({ success: false, message: 'Failed to generate document URL.' });
  }

  return res.status(200).json({ success: true, signedUrl: data.signedUrl });
};
