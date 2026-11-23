import express from 'express';
import {
  submitDailyWorkReport,
  acceptDailyWorkReport,
  getDailyWorkReports,
} from '../controllers/workReports.js';

const router = express.Router();

// Candidate or Admin endpoints
router.post('/submit', submitDailyWorkReport);
router.post('/accept', acceptDailyWorkReport);
router.get('/', getDailyWorkReports);

export default router;
