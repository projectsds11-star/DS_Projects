import express from 'express';
import { 
  requestOtp, 
  verifyOtp, 
  requestEmployeePasswordReset, 
  verifyEmployeePasswordOtp, 
  resetEmployeePassword 
} from '../controllers/auth.js';
import { sendWelcomeEmail, sendOnboardingCompletionEmail } from '../controllers/employeeEmail.js';

const router = express.Router();

// Admin 2FA Auth Routes
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/send-welcome-email', sendWelcomeEmail);
router.post('/send-onboarding-email', sendOnboardingCompletionEmail);

// Employee Forgot Password & Reset Routes
router.post('/employee/forgot-password', requestEmployeePasswordReset);
router.post('/employee/verify-otp', verifyEmployeePasswordOtp);
router.post('/employee/reset-password', resetEmployeePassword);

export default router;

