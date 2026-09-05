/**
 * server/routes/employees.js
 * Employee REST API routes — all protected by requireAdmin middleware.
 */
import express from 'express';
import multer from 'multer';
import { requireAdmin } from '../middleware/auth.js';
import {
  createEmployee,
  updateEmployee,
  updateStatus,
  deleteEmployee,
  getSignedUrl,
} from '../controllers/employees.js';

const router = express.Router();

// Multer: memory storage (files as Buffers, uploaded to Supabase from server)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter(req, file, cb) {
    const allowedPhoto = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedDoc = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (file.fieldname === 'photo' && !allowedPhoto.includes(file.mimetype)) {
      return cb(new Error('Invalid photo type. Use JPG, PNG or WEBP.'));
    }
    if (
      ['passbook', 'aadhaarDocument', 'panDocument'].includes(file.fieldname) &&
      !allowedDoc.includes(file.mimetype)
    ) {
      return cb(new Error(`Invalid ${file.fieldname} type. Use PDF, JPG, PNG or WEBP.`));
    }
    cb(null, true);
  },
});

const uploadFields = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'passbook', maxCount: 1 },
  { name: 'aadhaarDocument', maxCount: 1 },
  { name: 'panDocument', maxCount: 1 },
]);

// Wrap multer errors into JSON responses
function handleUpload(req, res, next) {
  uploadFields(req, res, (err) => {
    if (err) {
      return res.status(422).json({ success: false, message: err.message });
    }
    next();
  });
}

// POST   /api/admin/employees          — Create employee
router.post('/', requireAdmin, handleUpload, createEmployee);

// PUT    /api/admin/employees/:id      — Update employee (employee_id e.g. DS-001)
router.put('/:id', requireAdmin, handleUpload, updateEmployee);

// PATCH  /api/admin/employees/:id/status — Activate / Deactivate
router.patch('/:id/status', requireAdmin, updateStatus);

// DELETE /api/admin/employees/:id      — Soft delete
router.delete('/:id', requireAdmin, deleteEmployee);

// GET    /api/admin/employees/signed-url?bucket=...&filePath=... — Private document URL
router.get('/signed-url', requireAdmin, getSignedUrl);

export default router;
