import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle,
  KeyRound,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { employeeAuthService } from '../../services/employeeAuthService';

export default function EmployeeForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Wizard Step: 1 = Identifier, 2 = OTP, 3 = New Password, 4 = Success
  const [step, setStep] = useState(1);

  // Form State
  const [identifier, setIdentifier] = useState(searchParams.get('id') || '');
  const [emailInfo, setEmailInfo] = useState({ email: '', maskedEmail: '', employeeId: '', employeeName: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(false);

  const otpInputRefs = useRef([]);

  // Countdown timer for OTP Resend
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    } else {
      setResendCooldown(false);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Password validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial && passwordsMatch;

  // Calculate Password Strength
  const calculateStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-rose-500', width: 'w-1/4' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500', width: 'w-2/4' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-[#00B4D8]', width: 'w-3/4' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };

  const strength = calculateStrength(newPassword);

  // ── Step 1: Request OTP ───────────────────────────────────────────────────
  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Please enter your Employee ID or registered email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await employeeAuthService.requestForgotPasswordOtp(identifier.trim());
      if (res.success) {
        setEmailInfo({
          email: res.email || identifier.trim(),
          maskedEmail: res.maskedEmail || res.email || identifier.trim(),
          employeeId: res.employeeId || identifier.trim(),
          employeeName: res.employeeName || 'Team Member',
        });
        setStep(2);
        setResendTimer(60);
        setResendCooldown(true);
        // Focus first OTP box
        setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
      } else {
        setErrorMessage(res.message || 'No registered employee found with this ID or email.');
      }
    } catch (err) {
      setErrorMessage('Unable to dispatch verification code. Please check SMTP or network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Handle OTP Input ──────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    // Only accept numeric digit
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto advance to next box
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setOtp(newOtp);
    const nextIdx = Math.min(pasted.length, 5);
    otpInputRefs.current[nextIdx]?.focus();
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await employeeAuthService.verifyOtp(emailInfo.email, fullOtp);
      if (res.success) {
        setStep(3);
      } else {
        setErrorMessage(res.message || 'Invalid or expired OTP code. Please check and try again.');
      }
    } catch (err) {
      setErrorMessage('Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown || resendTimer > 0) return;
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await employeeAuthService.requestForgotPasswordOtp(emailInfo.email || identifier);
      if (res.success) {
        setResendTimer(60);
        setResendCooldown(true);
        setOtp(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
      } else {
        setErrorMessage(res.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      setErrorMessage('Error resending OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 3: Handle Password Reset ─────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e?.preventDefault();
    if (!isPasswordValid) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await employeeAuthService.resetPassword({
        email: emailInfo.email,
        employeeId: emailInfo.employeeId,
        newPassword,
        otp: otp.join(''),
      });

      if (res.success) {
        setStep(4);
      } else {
        setErrorMessage(res.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred while updating your password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 selection:bg-[#E63946] selection:text-white">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
        
        {/* Top Header */}
        <div className="bg-slate-900 p-6 sm:p-8 text-center relative border-b border-slate-800">
          <div className="flex items-center justify-center mx-auto mb-3 h-16 w-auto max-w-[220px]">
            <img src="/logo.png" alt="DS PROJECTS" className="h-full w-auto object-contain brightness-110" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D8F5FA]/10 border border-[#D8F5FA]/20 text-[#D8F5FA] text-[11px] font-bold uppercase tracking-widest rounded-full">
            <KeyRound size={12} className="text-[#E63946]" />
            Employee Portal &bull; Password Reset
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-3.5 flex items-center justify-between">
          {[
            { stepNum: 1, title: 'Identity' },
            { stepNum: 2, title: 'OTP Code' },
            { stepNum: 3, title: 'New Password' },
            { stepNum: 4, title: 'Complete' },
          ].map((s, idx) => (
            <div key={s.stepNum} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                  step > s.stepNum
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : step === s.stepNum
                    ? 'bg-[#E63946] text-white ring-4 ring-[#E63946]/20 shadow-xs'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step > s.stepNum ? <Check size={12} /> : s.stepNum}
              </div>
              <span
                className={`text-[11px] font-bold hidden sm:inline ${
                  step === s.stepNum ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {s.title}
              </span>
              {idx < 3 && <div className="w-4 sm:w-8 h-[2px] bg-slate-200 mx-1" />}
            </div>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {/* Error Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 shadow-2xs"
            >
              <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-rose-900">Verification Error</p>
                <p className="text-rose-700 leading-relaxed">{errorMessage}</p>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* ── STEP 1: Enter Identifier / Registered Email ──────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Find Your Account</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Enter your <strong>Employee ID</strong> (e.g. <code>DS-001</code>) or your <strong>registered email address</strong>. We will send a secure 6-digit verification code to your email.
                  </p>
                </div>

                <form onSubmit={handleRequestOtp} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Employee ID or Registered Email *
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. DS-001 or email@example.com"
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:bg-white transition"
                        autoFocus
                        required
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      The OTP will be dispatched to the email registered during your official onboarding.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#E63946] hover:bg-[#FF6B6B] text-white font-bold h-11 rounded-xl shadow-lg shadow-[#E63946]/20 justify-center"
                    isLoading={isLoading}
                    disabled={isLoading || !identifier.trim()}
                  >
                    <span>Send Verification Code</span>
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </form>

                <div className="pt-4 border-t border-slate-100 text-center">
                  <Link
                    to="/employee/login"
                    className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-[#E63946] transition"
                  >
                    <ArrowLeft size={14} className="mr-1.5" />
                    Back to Employee Login
                  </Link>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Enter 6-Digit Email OTP ─────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Enter Verification Code</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    We sent a 6-digit one-time passcode to:
                  </p>
                  <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-[#00B4D8] shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-800 font-mono">{emailInfo.maskedEmail}</p>
                        <p className="text-[10px] text-slate-400">Employee ID: {emailInfo.employeeId}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setErrorMessage(null);
                      }}
                      className="text-[11px] font-bold text-[#E63946] hover:underline"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block text-center">
                      Enter 6-Digit Code *
                    </label>
                    
                    {/* 6 OTP Boxes */}
                    <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:bg-white transition"
                        />
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#E63946] hover:bg-[#FF6B6B] text-white font-bold h-11 rounded-xl shadow-lg shadow-[#E63946]/20 justify-center"
                    isLoading={isLoading}
                    disabled={isLoading || otp.join('').length !== 6}
                  >
                    <span>Verify Code & Continue</span>
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </form>

                {/* Resend Timer & Action */}
                <div className="pt-2 text-center">
                  {resendTimer > 0 ? (
                    <p className="text-xs text-slate-500">
                      Resend code available in{' '}
                      <span className="font-bold text-slate-800 font-mono">{resendTimer}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="inline-flex items-center text-xs font-bold text-[#00B4D8] hover:text-[#0096C7] transition"
                    >
                      <RefreshCw size={13} className="mr-1.5" />
                      Didn't receive code? Resend OTP
                    </button>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setErrorMessage(null);
                    }}
                    className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                  >
                    <ArrowLeft size={14} className="mr-1.5" />
                    Back to Step 1
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Create & Confirm New Password ──────────────────── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Create New Password</h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Set a secure, memorable password for your portal account (<strong>{emailInfo.employeeId}</strong>).
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      New Password *
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new strong password"
                        className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:bg-white transition"
                        autoFocus
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Meter */}
                  {newPassword && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Strength:</span>
                        <span className="font-bold text-slate-700">{strength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                      </div>
                    </div>
                  )}

                  {/* Confirm New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:bg-white transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Real-time Password Rules Checklist */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                    <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1">
                      Password Requirements:
                    </p>
                    {[
                      { label: 'Minimum 8 characters length', ok: hasMinLength },
                      { label: 'At least one uppercase letter (A-Z)', ok: hasUpper },
                      { label: 'At least one lowercase letter (a-z)', ok: hasLower },
                      { label: 'At least one number (0-9)', ok: hasNumber },
                      { label: 'At least one special character (!@#$...)', ok: hasSpecial },
                      { label: 'Passwords match', ok: passwordsMatch },
                    ].map((rule, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {rule.ok ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                        )}
                        <span className={rule.ok ? 'text-emerald-700 font-semibold text-[11px]' : 'text-slate-500 text-[11px]'}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#E63946] hover:bg-[#FF6B6B] text-white font-bold h-11 rounded-xl shadow-lg shadow-[#E63946]/20 justify-center"
                    isLoading={isLoading}
                    disabled={isLoading || !isPasswordValid}
                  >
                    <span>Update Password & Save</span>
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 4: Success & Proceed to Login ──────────────────────── */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-4 space-y-5"
              >
                <div className="w-16 h-16 bg-emerald-50 border-4 border-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                  <CheckCircle2 className="h-9 w-9" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Password Reset Successful!
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Your employee portal password has been updated securely. You can now login using your new password.
                  </p>
                </div>

                {/* Account Summary Card */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Employee Name:</span>
                    <span className="font-bold text-slate-900">{emailInfo.employeeName}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Employee ID:</span>
                    <span className="font-mono font-bold text-[#E63946]">{emailInfo.employeeId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Registered Email:</span>
                    <span className="font-bold text-slate-800">{emailInfo.email}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-[#E63946] hover:bg-[#FF6B6B] text-white font-bold h-11 rounded-xl shadow-lg shadow-[#E63946]/20 justify-center"
                  onClick={() => navigate(`/employee/login?id=${encodeURIComponent(emailInfo.employeeId || identifier)}&updated=true`)}
                >
                  <span>Sign In to Employee Portal</span>
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-[11px] text-slate-400 space-y-1">
            <p>DS Projects Private Limited &bull; Andhra Pradesh Field Operations</p>
            <p>Official HRMS Enterprise Security System</p>
          </div>
        </div>
      </div>
    </div>
  );
}
