import express from 'express';
import { requestOtp, verifyOtp } from '../controllers/auth.js';
import { sendWelcomeEmail, sendOnboardingCompletionEmail } from '../controllers/employeeEmail.js';

const router = express.Router();

router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/send-welcome-email', sendWelcomeEmail);
router.post('/send-onboarding-email', sendOnboardingCompletionEmail);

export default router;
