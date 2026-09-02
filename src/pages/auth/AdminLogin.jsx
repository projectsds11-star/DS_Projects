import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Lock,
  Sparkles,
  RefreshCw,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Copy,
  Check,
  Fingerprint,
  ShieldAlert,
} from 'lucide-react';

const ADMIN_EMAILS = [
  'shaikjakeerbasha07@gmail.com',
  'balajiprojects049@gmail.com',
  'projectsds11@gmail.com',
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputsRef = useRef([]);

  // Resend OTP countdown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Step 1: Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setMessage('');

    const formattedEmail = email.toLowerCase().trim();
    if (!formattedEmail) {
      setError('Please enter your administrator email address.');
      return;
    }

    if (!ADMIN_EMAILS.includes(formattedEmail)) {
      setError('This email is not authorized for executive administrator access.');
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');
      const response = await fetch(`${apiUrl}/api/admin/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formattedEmail }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code.');
      }

      setStep('otp');
      setResendCooldown(60);
      setMessage(data.message || `A 6-digit passcode was dispatched to ${formattedEmail}`);
      // Focus first OTP input on transition
      setTimeout(() => {
        if (otpInputsRef.current[0]) {
          otpInputsRef.current[0].focus();
        }
      }, 200);
    } catch (err) {
      setError(err.message || 'Unable to connect to authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index, value) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    if (!sanitized && value !== '') return;

    const newOtp = [...otpValues];

    if (sanitized.length > 1) {
      // Handle multi-character paste into one slot
      const pastedDigits = sanitized.slice(0, 6).split('');
      pastedDigits.forEach((digit, i) => {
        if (index + i < 6) newOtp[index + i] = digit;
      });
      setOtpValues(newOtp);
      const nextIndex = Math.min(index + pastedDigits.length, 5);
      if (otpInputsRef.current[nextIndex]) {
        otpInputsRef.current[nextIndex].focus();
      }
      return;
    }

    newOtp[index] = sanitized;
    setOtpValues(newOtp);

    // Auto-focus next input
    if (sanitized && index < 5 && otpInputsRef.current[index + 1]) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  // Handle OTP keyboard navigation (backspace)
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputsRef.current[index - 1].focus();
    }
  };

  // Handle OTP paste across all inputs
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (!pasteData) return;

    const digits = pasteData.slice(0, 6).split('');
    const newOtp = [...otpValues];
    digits.forEach((digit, idx) => {
      newOtp[idx] = digit;
    });
    setOtpValues(newOtp);

    const targetIndex = Math.min(digits.length, 5);
    if (otpInputsRef.current[targetIndex]) {
      otpInputsRef.current[targetIndex].focus();
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const fullOtp = otpValues.join('').trim();
    if (fullOtp.length !== 6) {
      setError('Please provide the full 6-digit authentication code.');
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');
      const response = await fetch(`${apiUrl}/api/admin/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          otp: fullOtp,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid or expired verification code.');
      }

      // Store security credentials
      localStorage.setItem('ds_admin_token', data.token);
      localStorage.setItem('ds_admin_session', JSON.stringify({ email: data.email }));

      // Navigate to admin console
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0B0F19] text-slate-100 font-sans relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Background Ambient Glows & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.18),rgba(255,255,255,0))]" />
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Decorative Grid Lines */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main Container */}
      <div className="w-full flex flex-col lg:flex-row relative z-10">
        
        {/* Left Side: Enterprise Branding & Live Telemetry */}
        <div className="hidden lg:flex lg:w-7/12 p-12 xl:p-16 flex-col justify-between border-r border-white/10 backdrop-blur-sm relative">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-slate-900 p-1 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/15 overflow-hidden shrink-0">
                <img src="/logo.png" alt="DS Projects Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
              <div>
                <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
                  DS PROJECTS
                  <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
                    PRO SUITE
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 font-medium tracking-wider uppercase">
                  Executive HRMS & Operations Infrastructure
                </p>
              </div>
            </div>

            {/* Live Node Status */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-xs text-slate-300 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-[11px] text-slate-200">AP Central Nodes Online</span>
            </div>
          </div>

          {/* Hero Centerpiece */}
          <div className="my-auto py-12 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-6">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                Zero-Trust Multi-Factor Identity Gate
              </div>

              <h2 className="text-4xl xl:text-5xl font-black text-white leading-[1.12] tracking-tight mb-6">
                Central Administrative & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300">
                  Workforce Command Console
                </span>
              </h2>

              <p className="text-slate-300 text-base leading-relaxed mb-10 max-w-xl font-normal">
                Authorized access point for executive management, automated candidate onboarding, digital offer issuance, and district-wide workforce attendance intelligence.
              </p>

              {/* Feature Tiles Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-500/30 transition-colors backdrop-blur-sm group">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                    <Users className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">Onboarding Engine</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Automated document collection and background verification workflows.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-500/30 transition-colors backdrop-blur-sm group">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">Statewide Deployment</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Unified telemetry across all 26 Andhra Pradesh district sectors.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Security Badges */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-400" /> AES-256 Auth
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span>TLS 1.3 Strict Mode</span>
            </div>
            <p className="text-[11px] text-slate-500">
              DS Projects Private Limited © {new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* Right Side: High-End Glassmorphic Login Form */}
        <div className="w-full lg:w-5/12 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-14 relative min-h-screen lg:min-h-auto">
          
          {/* Mobile Top Header */}
          <div className="lg:hidden w-full max-w-md flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-900 p-1 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/15 overflow-hidden shrink-0">
                <img src="/logo.png" alt="DS Projects Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">DS PROJECTS</h3>
                <p className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">Executive Console</p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Secure
            </span>
          </div>

          {/* Login Card */}
          <div className="w-full max-w-md">
            <motion.div
              layout
              className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl shadow-black/80 relative overflow-hidden"
            >
              {/* Top Accent Gradient Border */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-400" />

              <AnimatePresence mode="wait">
                {step === 'email' ? (
                  /* ==================================================== */
                  /* STEP 1: EMAIL ENTRY                                  */
                  /* ==================================================== */
                  <motion.div
                    key="step-email"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Header */}
                    <div className="mb-8 text-center sm:text-left">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-4 shadow-inner">
                        <KeyRound className="h-6 w-6" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                        Executive Sign In
                      </h2>
                      <p className="text-sm text-slate-400">
                        Enter your registered administrative email to receive a secure real-time OTP.
                      </p>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleSendOtp} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                          Administrator Email Address
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-400 transition-colors">
                            <Mail className="h-5 w-5" />
                          </div>
                          <input
                            type="email"
                            required
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@dsprojects.com"
                            className="w-full h-13 pl-12 pr-4 bg-slate-950/70 border border-white/10 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500"
                          />
                        </div>
                      </div>


                      {/* Error Alert */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-start gap-2.5"
                        >
                          <AlertCircle className="w-4 h-4 min-w-4 mt-0.5 text-red-400" />
                          <span>{error}</span>
                        </motion.div>
                      )}

                      {/* Submit Action */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-13 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                            <span>GENERATING PASSCODE...</span>
                          </div>
                        ) : (
                          <>
                            <span>SEND ONE-TIME PASSCODE</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Portal Switcher */}
                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                      <p className="text-xs text-slate-400">
                        Staff or Field Worker?{' '}
                        <Link
                          to="/employee/login"
                          className="text-blue-400 hover:text-blue-300 font-semibold transition-colors inline-flex items-center gap-1 hover:underline"
                        >
                          Employee Sign In →
                        </Link>
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  /* ==================================================== */
                  /* STEP 2: OTP VERIFICATION                            */
                  /* ==================================================== */
                  <motion.div
                    key="step-otp"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Top Navigation */}
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setOtpValues(['', '', '', '', '', '']);
                        setError('');
                        setMessage('');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6 group font-medium"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                      Back to Email Input
                    </button>

                    {/* Header */}
                    <div className="mb-6">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-inner">
                        <Fingerprint className="h-6 w-6" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                        Enter Security Code
                      </h2>
                      <p className="text-sm text-slate-400">
                        Sent to <span className="font-semibold text-slate-200">{email}</span>
                      </p>
                    </div>

                    {/* Info Notice */}
                    {message && (
                      <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 min-w-4 mt-0.5 text-emerald-400" />
                        <span>{message}</span>
                      </div>
                    )}

                    {/* OTP Form */}
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 text-center">
                          6-Digit Verification Code
                        </label>
                        
                        {/* 6 Individual Interactive OTP Input Boxes */}
                        <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                          {otpValues.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => (otpInputsRef.current[idx] = el)}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-xl bg-slate-950/80 border transition-all focus:outline-none ${
                                digit
                                  ? 'border-blue-500 text-blue-300 bg-blue-500/10 ring-2 ring-blue-500/20'
                                  : 'border-white/10 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Error Alert */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-start gap-2.5"
                        >
                          <AlertCircle className="w-4 h-4 min-w-4 mt-0.5 text-red-400" />
                          <span>{error}</span>
                        </motion.div>
                      )}

                      {/* Verify Action */}
                      <button
                        type="submit"
                        disabled={isLoading || otpValues.join('').length !== 6}
                        className="w-full h-13 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                            <span>AUTHENTICATING IDENTITY...</span>
                          </div>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>VERIFY & ENTER CONSOLE</span>
                          </>
                        )}
                      </button>

                      {/* Resend OTP Timer & Button */}
                      <div className="text-center pt-2">
                        {resendCooldown > 0 ? (
                          <p className="text-xs text-slate-400 font-medium">
                            Resend code available in{' '}
                            <span className="text-blue-400 font-bold">{resendCooldown}s</span>
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendOtp()}
                            className="text-xs text-blue-400 hover:text-blue-300 font-bold hover:underline inline-flex items-center gap-1.5 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Resend Verification Code
                          </button>
                        )}
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Bottom Security Notice */}
            <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-500 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              Protected Executive Perimeter • Single-Session Tokenization
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
