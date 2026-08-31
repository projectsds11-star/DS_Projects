import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Building2,
  KeyRound
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { offerService } from '../../services/onboardingService';

export default function AccountActivation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'demo_token';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activatedUser, setActivatedUser] = useState('rahulkumar001@dsprojects');

  // Real-time password validation rules
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const isFormValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial && passwordsMatch;

  const handleActivate = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      const res = await offerService.activateAccount(token, password);
      if (res.success) {
        setActivatedUser(res.username);
        setIsSuccess(true);
      } else {
        alert(res.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-xl mx-auto shadow-md mb-3">
          DS
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-navy)]">
          DS PROJECTS
        </h1>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-0.5">
          Employee Portal Activation
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="border border-[var(--color-border)] shadow-xl overflow-hidden rounded-2xl">
          {/* Top colored accent line */}
          <div className="h-1.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-navy)]" />

          <CardContent className="p-6 sm:p-8">
            {!isSuccess ? (
              <form onSubmit={handleActivate} className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-navy)]">
                    Activate Your Employee Account
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Welcome to DS Projects! Please establish your secure permanent password to activate your employee portal access.
                  </p>
                </div>

                {/* Username Display */}
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Assigned Portal Username</span>
                  <p className="font-mono font-bold text-sm text-[var(--color-primary)] mt-0.5">
                    {activatedUser}
                  </p>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Create New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new strong password"
                      className="flex h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password to verify"
                      className="flex h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3.5 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Real-time Password Rules Checklist */}
                <div className="p-3.5 bg-gray-50/70 border border-gray-200 rounded-xl space-y-1.5 text-xs">
                  <p className="font-bold text-gray-700 text-[11px] uppercase tracking-wider mb-1">
                    Password Security Criteria:
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
                        <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
                      )}
                      <span className={rule.ok ? 'text-green-700 font-medium' : 'text-gray-500'}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full justify-center h-11 text-sm font-bold shadow-md"
                  disabled={!isFormValid || isSubmitting}
                  isLoading={isSubmitting}
                >
                  Activate Employee Account
                </Button>
              </form>
            ) : (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 space-y-4"
              >
                <div className="w-16 h-16 bg-green-50 border-4 border-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                  <CheckCircle2 className="h-9 w-9" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[var(--color-navy)]">
                    Account Activated!
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Your permanent password has been set. You can now log in to the DS PROJECTS Employee Portal.
                  </p>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-left text-xs">
                  <span className="text-gray-400">Your Portal Username:</span>
                  <p className="font-mono font-bold text-sm text-[var(--color-primary)]">{activatedUser}</p>
                </div>

                <Button
                  className="w-full justify-center h-11 text-sm font-bold shadow-md"
                  icon={ArrowRight}
                  onClick={() => navigate('/employee/login')}
                >
                  Login to Employee Portal
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Footer info */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 DS PROJECTS PVT LTD · Enterprise HRMS Platform
        </p>
      </div>
    </div>
  );
}
