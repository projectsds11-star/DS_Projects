import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "OTP must contain only numbers"),
});

export default function AdminLogin() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors } } = useForm({
    resolver: zodResolver(emailSchema),
  });

  const { register: registerOtp, handleSubmit: handleOtpSubmit, formState: { errors: otpErrors } } = useForm({
    resolver: zodResolver(otpSchema),
  });

  const onSendOtp = async (data) => {
    setIsSubmitting(true);
    setEmail(data.email);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
    }, 1500);
  };

  const onVerifyOtp = async (data) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/admin/dashboard');
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Left side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-[var(--color-primary)] text-white p-12 flex-col justify-center relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-6 tracking-tight">DS PROJECTS</h1>
          <h2 className="text-2xl font-light mb-8 text-blue-100">Employee Management Platform</h2>
          <p className="text-lg text-blue-200 max-w-md leading-relaxed">
            Manage your workforce, onboarding and daily operations from one secure platform.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-[var(--color-navy)] opacity-20 rounded-full translate-y-1/3 -translate-x-1/4"></div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md bg-[var(--color-card)] p-8 rounded-2xl shadow-sm border border-[var(--color-border)]">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[var(--color-navy)]">Admin Login</h2>
            <p className="text-[var(--color-text-secondary)] mt-2">
              {step === 1 ? "Enter your email to receive an OTP." : "Enter the OTP sent to your email."}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleEmailSubmit(onSendOtp)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@dsprojects.com"
                  {...registerEmail('email')}
                  error={emailErrors.email}
                />
                {emailErrors.email && (
                  <p className="text-sm text-[var(--color-error)] mt-1">{emailErrors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                SEND OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit(onVerifyOtp)} className="space-y-6">
              <div className="bg-[var(--color-lavender)] p-4 rounded-lg mb-6 text-sm text-[var(--color-navy)] text-center">
                OTP sent to <span className="font-semibold">{email}</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="• • • • • •"
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  {...registerOtp('otp')}
                  error={otpErrors.otp}
                />
                {otpErrors.otp && (
                  <p className="text-sm text-[var(--color-error)] mt-1 text-center">{otpErrors.otp.message}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
                VERIFY OTP
              </Button>

              <div className="text-center mt-6">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="text-sm text-[var(--color-primary)] hover:underline"
                >
                  Change email or resend OTP
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
