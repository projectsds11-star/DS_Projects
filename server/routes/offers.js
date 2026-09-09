/**
 * server/routes/offers.js
 * REST API routes for job offers
 */
import express from 'express';
import { getOffers, createOffer, resendOffer } from '../controllers/offers.js';

const router = express.Router();

router.get('/', getOffers);
router.post('/', createOffer);
router.post('/resend', resendOffer);

export default router;
