import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, ArrowRight, ShieldCheck, KeyRound, Lock,
  RefreshCw, AlertCircle, ArrowLeft, CheckCircle2
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

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

      const contentType = response.headers.get('content-type') || '';
      let data = {};

      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonErr) {
          console.warn('Failed to parse JSON response:', jsonErr);
        }
      } else {
        const text = await response.text();
        console.warn('Non-JSON server response received:', text);
        data = { error: text?.slice(0, 150) || 'Server returned an unexpected response format.' };
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `Server responded with status ${response.status}`);
      }

      setStep('otp');
      setResendCooldown(60);
      setMessage(data.message || `A 6-digit passcode was dispatched to ${formattedEmail}`);
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

  const handleOtpChange = (index, value) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    if (!sanitized && value !== '') return;

    const newOtp = [...otpValues];

    if (sanitized.length > 1) {
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

    if (sanitized && index < 5 && otpInputsRef.current[index + 1]) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputsRef.current[index - 1].focus();
    }
  };

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

      const contentType = response.headers.get('content-type') || '';
      let data = {};

      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonErr) {
          console.warn('Failed to parse JSON response:', jsonErr);
        }
      } else {
        const text = await response.text();
        console.warn('Non-JSON server response received:', text);
        data = { error: text?.slice(0, 150) || 'Server returned an unexpected response format.' };
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Invalid or expired verification code.');
      }

      localStorage.setItem('ds_admin_token', data.token);
      localStorage.setItem('ds_admin_session', JSON.stringify({ email: data.email }));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-800 to-slate-900 lg:bg-slate-50 relative overflow-hidden font-sans p-3 sm:p-6">
      {/* Dynamic Background for Desktop */}
      <div className="hidden lg:block absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 pointer-events-none" />
      <div className="hidden lg:block absolute -top-40 -right-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden lg:block absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Mobile Animated Background Elements */}
      <div className="lg:hidden absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/30 via-transparent to-transparent pointer-events-none" />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="lg:hidden absolute -top-16 -right-16 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        className="lg:hidden absolute -bottom-16 -left-16 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"
      />

      {/* Main Card Container */}
      <div className="w-full max-w-md lg:max-w-5xl flex flex-col lg:grid lg:grid-cols-2 bg-transparent lg:bg-white/80 lg:backdrop-blur-xl lg:border border-slate-200/80 lg:rounded-3xl shadow-none lg:shadow-2xl overflow-hidden relative z-10 my-auto">
        
        {/* Mobile Header (Visible only on < lg) */}
        <div className="lg:hidden w-full text-white pt-4 pb-6 px-4 flex flex-col items-center text-center">
          <div className="bg-white rounded-2xl p-2.5 shadow-xl w-20 h-20 flex items-center justify-center mb-3 border-2 border-white/30">
            <img src="/logo.png" alt="DS Projects" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-black tracking-wider uppercase drop-shadow-md text-white">Admin Portal</h1>
          <p className="text-indigo-200 text-xs sm:text-sm font-medium mt-1">
            Secure workforce management console
          </p>
        </div>

        {/* Left Side: Desktop Branding (Visible only on lg+) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-700 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-start gap-4">
            <div className="bg-white rounded-2xl p-3 shadow-xl w-28 h-28 flex items-center justify-center">
              <img src="/logo.png" alt="DS Projects" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest text-indigo-200 uppercase bg-white/10 px-3 py-1 rounded-full border border-white/20">Executive Suite</span>
              <h1 className="text-3xl font-black tracking-wider text-white uppercase drop-shadow-sm mt-2">Admin Portal</h1>
            </div>
          </div>

          <div className="relative z-10 my-8">
            <h2 className="text-3xl xl:text-4xl font-black mb-4 leading-tight">
              Manage your workforce <br />
              <span className="text-indigo-200">with precision.</span>
            </h2>
            <p className="text-indigo-100 text-sm leading-relaxed max-w-sm">
              Secure, centralized access to employee onboarding, offer letters, attendance telemetry, and statewide deployment metrics.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-6 text-xs font-semibold text-indigo-200 border-t border-indigo-400/30 pt-6">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> AES-256 Auth
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" /> TLS 1.3 Secure
            </span>
          </div>
        </div>

        {/* Right Side: Login Form Card */}
        <div className="w-full flex flex-col justify-center p-1 sm:p-3 lg:p-12 z-20">
          <div className="w-full bg-white rounded-3xl p-5 sm:p-8 lg:p-0 shadow-2xl lg:shadow-none border border-slate-100 lg:border-none">
            <AnimatePresence mode="wait">
              {step === 'email' ? (
                <motion.div
                  key="email-step"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-6 sm:mb-8">
                    <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 border border-indigo-100 shadow-sm">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Sign In</h2>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">Enter your administrative email to continue.</p>
                  </div>

                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                          <Mail className="h-5 w-5" />
                        </div>
                        <input
                          type="email"
                          required
                          autoFocus
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="admin@dsprojects.com"
                          className="w-full h-11 sm:h-12 pl-11 pr-4 bg-slate-50/50 focus:bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm font-medium flex items-start gap-2.5 shadow-sm">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p className="leading-snug">{error}</p>
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 sm:h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm sm:text-base font-bold rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Sending passcode...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <button
                    onClick={() => {
                      setStep('email');
                      setError('');
                      setMessage('');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-5 group cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Back</span>
                  </button>

                  <div className="mb-5 sm:mb-6">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Verify Identity</h2>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1 leading-relaxed">
                      We sent a 6-digit passcode to <span className="text-indigo-900 font-bold break-all bg-indigo-50 px-1.5 py-0.5 rounded">{email}</span>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    {/* Responsive Grid for OTP Inputs - Perfectly fits any mobile screen width */}
                    <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5 w-full">
                      {otpValues.map((value, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpInputsRef.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={value}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={index === 0 ? handleOtpPaste : undefined}
                          className="w-full aspect-square min-w-0 flex items-center justify-center text-center text-lg sm:text-2xl font-black text-slate-900 bg-slate-50 focus:bg-white border-2 border-slate-200 focus:border-indigo-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/15 transition-all shadow-sm"
                        />
                      ))}
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm font-medium flex items-start gap-2.5 shadow-sm">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p className="leading-snug">{error}</p>
                      </motion.div>
                    )}

                    {message && !error && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-start gap-2.5 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <p className="leading-snug">{message}</p>
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || otpValues.join('').length !== 6}
                      className="w-full h-11 sm:h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm sm:text-base font-bold rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        'Secure Login'
                      )}
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={resendCooldown > 0 || isLoading}
                        className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors disabled:text-slate-400 disabled:pointer-events-none cursor-pointer"
                      >
                        {resendCooldown > 0 ? `Resend passcode in ${resendCooldown}s` : 'Resend Passcode'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
