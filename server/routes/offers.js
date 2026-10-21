/**
 * server/routes/offers.js
 * REST API routes for job offers
 */
import express from 'express';
import { getOffers, createOffer, resendOffer, activateAccount, getEmailLogs } from '../controllers/offers.js';

const router = express.Router();

router.get('/', getOffers);
router.post('/', createOffer);
router.post('/resend', resendOffer);
router.post('/activate', activateAccount);

export default router;
