/**
 * server/routes/applications.js
 * Routing for public applicants and authenticated administrative reviews.
 */
import express from 'express';
import {
  submitApplication,
  getPublicApplication,
  listApplications,
  updateApplication,
  deleteApplication,
} from '../controllers/applications.js';
import { requireAdmin } from '../middleware/auth.js';

export const publicApplicationRouter = express.Router();
export const adminApplicationRouter = express.Router();

// ── Public Routes ────────────────────────────────────────────────────────────
// Candidates submitting their job applications
publicApplicationRouter.post('/', submitApplication);
// Candidates viewing/downloading their submitted receipt
publicApplicationRouter.get('/public/:idOrAppNo', getPublicApplication);

// ── Admin Routes ─────────────────────────────────────────────────────────────
adminApplicationRouter.get('/', requireAdmin, listApplications);
adminApplicationRouter.get('/:id', requireAdmin, getPublicApplication);
adminApplicationRouter.patch('/:id', requireAdmin, updateApplication);
adminApplicationRouter.delete('/:id', requireAdmin, deleteApplication);
