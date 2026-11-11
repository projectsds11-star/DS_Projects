/**
 * server/routes/offers.js
 * REST API routes for job offers
 */
import express from 'express';
import { getOffers, createOffer, resendOffer, activateAccount } from '../controllers/offers.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAdmin, getOffers);
router.post('/', requireAdmin, createOffer);
router.post('/resend', requireAdmin, resendOffer);
// Public candidate self-activation route (verified via offer activation token)
router.post('/activate', activateAccount);

export default router;
