import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, ArrowRight, ShieldCheck, KeyRound, Lock,
  RefreshCw, Building2, Users, AlertCircle, ArrowLeft
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
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code.');
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
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid or expired verification code.');
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-indigo-800 to-blue-700 lg:bg-none lg:bg-slate-50 relative overflow-hidden font-sans">
      {/* Dynamic Background for Desktop */}
      <div className="hidden lg:block absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50 pointer-events-none" />
      <div className="hidden lg:block absolute -top-40 -right-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden lg:block absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
      
      {/* Mobile animated background elements */}
      <motion.div 
        animate={{ backgroundPosition: ['0px 0px', '100px 100px'] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="lg:hidden absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, -40, 0],
          y: [0, 40, 0]
        }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        className="lg:hidden absolute -top-20 -right-20 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2],
          x: [0, 40, 0],
          y: [0, -40, 0]
        }}
        transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
        className="lg:hidden absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-400/30 rounded-full blur-3xl" 
      />

      {/* Container */}
      <div className="w-full max-w-5xl flex flex-col lg:grid lg:grid-cols-2 bg-transparent lg:bg-white/70 lg:backdrop-blur-xl lg:border border-white lg:rounded-3xl shadow-none lg:shadow-2xl overflow-hidden relative z-10 m-0 min-h-screen lg:min-h-0 lg:m-4 xl:m-8">
        
        {/* Mobile/Tablet Header (Visible only on < lg) */}
        <div className="lg:hidden w-full text-white p-6 pt-16 sm:pt-20 pb-8 relative flex flex-col items-center text-center">

          
          <div className="relative z-10 bg-white rounded-2xl p-3 shadow-2xl w-24 h-24 flex items-center justify-center mb-4 border-2 border-white/20">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain scale-110" />
          </div>
          <h1 className="relative z-10 text-3xl font-black tracking-widest uppercase drop-shadow-md mb-2">Admin Portal</h1>
          <p className="relative z-10 text-indigo-100 text-sm font-medium px-4">
            Secure workforce management console
          </p>
        </div>

        {/* Left Side: Desktop Branding (Visible only on lg+) */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-b from-indigo-600 to-blue-700 text-white relative overflow-hidden">
          {/* Background Accents */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col items-start gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-xl w-32 h-32 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain scale-125" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-widest text-white uppercase drop-shadow-md">Admin Portal</h1>
            </div>
          </div>

          <div className="relative z-10 my-16">
            <h2 className="text-4xl font-black mb-6 leading-tight">
              Manage your workforce <br />
              <span className="text-indigo-200">with precision.</span>
            </h2>
            <p className="text-indigo-100 text-base leading-relaxed max-w-md">
              Secure, centralized access to employee onboarding, offer letters, attendance telemetry, and statewide deployment metrics.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-6 text-sm font-medium text-indigo-200 border-t border-indigo-400/30 pt-6">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> AES-256 Auth
            </span>
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" /> TLS 1.3 Secure
            </span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex flex-col flex-1 p-6 sm:p-12 relative bg-transparent lg:bg-white/40 justify-center z-20">
          <div className="max-w-md w-full mx-auto bg-white/95 lg:bg-transparent backdrop-blur-2xl lg:backdrop-blur-none rounded-3xl p-6 sm:p-8 lg:p-0 shadow-2xl lg:shadow-none border border-white/20 lg:border-none">
            <AnimatePresence mode="wait">
              {step === 'email' ? (
                <motion.div
                  key="email-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-indigo-200">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Sign In</h2>
                    <p className="text-slate-500 font-medium">Enter your administrative email to continue.</p>
                  </div>

                  <form onSubmit={handleSendOtp} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                          <Mail className="h-5 w-5" />
                        </div>
                        <input
                          type="email"
                          required
                          autoFocus
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="admin@dsprojects.com"
                          className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex gap-3 shadow-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>{error}</p>
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <>Continue <ArrowRight className="w-5 h-5" /></>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <button
                    onClick={() => setStep('email')}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-8 group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
                  </button>

                  <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Verify Identity</h2>
                    <p className="text-slate-500 font-medium">We sent a 6-digit passcode to <span className="text-slate-900 font-bold">{email}</span></p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="flex gap-2 sm:gap-3 justify-between">
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
                          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                        />
                      ))}
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex gap-3 shadow-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>{error}</p>
                      </motion.div>
                    )}
                    {message && !error && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium flex gap-3 shadow-sm">
                        <ShieldCheck className="w-5 h-5 shrink-0" />
                        <p>{message}</p>
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || otpValues.join('').length !== 6}
                      className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        'Secure Login'
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={resendCooldown > 0 || isLoading}
                        className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors disabled:text-slate-400 disabled:pointer-events-none"
                      >
                        {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Passcode'}
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
