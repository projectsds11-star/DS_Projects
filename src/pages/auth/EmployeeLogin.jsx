import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, User, ArrowRight, ShieldCheck, Sparkles, Building2, MapPin, AlertCircle, ShieldAlert, CheckCircle2, KeyRound } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import { liveDataService } from '../../services/liveDataService';
import { employeeAuthService } from '../../services/employeeAuthService';

const loginSchema = z.object({
  username: z.string().min(1, 'Please enter your Employee ID, Username, or Email'),
  password: z.string().min(1, 'Please enter your password'),
  remember: z.boolean().optional(),
});

export default function EmployeeLogin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: searchParams.get('id') || '',
      password: '',
    }
  });

  const usernameValue = watch('username');

  useEffect(() => {
    if (searchParams.get('error') === 'deactivated') {
      setLoginError('Account Deactivated: Your employee profile was disabled by the administrator. Portal access has been revoked.');
    }
    if (searchParams.get('updated') === 'true') {
      setSuccessBanner('Password reset successful! Please sign in using your newly updated password.');
    }
    const prefillId = searchParams.get('id');
    if (prefillId) {
      setValue('username', prefillId);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setLoginError(null);
    setSuccessBanner(null);
    try {
      const input = data.username.trim();
      let emp = null;

      // Extract numeric ID if corporate username format e.g. balajis001@dsprojects, ds-001, or 001
      const digitsMatch = input.match(/\d+/);
      const extractedEmpId = digitsMatch ? `DS-${digitsMatch[0].padStart(3, '0')}` : null;
      const cleanEmpId = digitsMatch ? `DS${digitsMatch[0].padStart(3, '0')}` : null;

      if (isSupabaseConfigured) {
        try {
          const orConditions = [
            `employee_id.ilike.%${input}%`,
            `email.ilike.%${input}%`,
            `phone.ilike.%${input}%`,
          ];
          if (extractedEmpId) orConditions.push(`employee_id.ilike.%${extractedEmpId}%`);
          if (cleanEmpId) orConditions.push(`employee_id.ilike.%${cleanEmpId}%`);

          const { data: dbEmp } = await supabase
            .from('employees')
            .select('*')
            .or(orConditions.join(','))
            .limit(1)
            .maybeSingle();
          if (dbEmp) emp = dbEmp;
        } catch (dbErr) {
          console.warn('Employee DB lookup error:', dbErr);
        }
      }

      if (!emp) {
        // Fallback to local liveDataService
        const liveList = await liveDataService.getEmployees();
        emp = liveList.find(e => {
          const normInput = input.toLowerCase();
          const eId = (e.employee_id || '').toLowerCase();
          const eEmail = (e.email || '').toLowerCase();
          const ePhone = (e.phone || '');
          const eName = (e.full_name || e.employee_name || '').toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');
          const eNum = (e.employee_id || '').replace(/[^0-9]/g, '');
          const eCorpUser = `${eName}${eNum}@dsprojects`.toLowerCase();

          return (
            eId === normInput ||
            eEmail === normInput ||
            ePhone === input ||
            (extractedEmpId && eId === extractedEmpId.toLowerCase()) ||
            (cleanEmpId && eId === cleanEmpId.toLowerCase()) ||
            eCorpUser === normInput
          );
        });
      }

      // If still not found, check offers list
      if (!emp && isSupabaseConfigured) {
        try {
          const { data: dbOffer } = await supabase
            .from('job_offers')
            .select('*')
            .or(`email.ilike.%${input}%,employee_id.ilike.%${input}%`)
            .limit(1)
            .maybeSingle();
          if (dbOffer) {
            emp = {
              employee_id: dbOffer.employee_id,
              full_name: dbOffer.employee_name || dbOffer.candidate_name,
              email: dbOffer.email,
              phone: dbOffer.phone,
              district: dbOffer.district,
              mandal: dbOffer.mandal,
              status: dbOffer.status === 'Offer Accepted' ? 'Active' : 'Onboarding',
            };
          }
        } catch (e) {
          console.warn('Offer fallback error:', e);
        }
      }

      // If no employee profile exists at all
      if (!emp) {
        setLoginError(
          `Account Not Found: No employee record was found for "${input}". Please enter your registered Employee ID or email.`
        );
        setIsSubmitting(false);
        return;
      }

      // Check Inactive status restriction
      if (emp && (emp.status === 'Inactive' || emp.status === 'inactive')) {
        setLoginError(
          `Account Inactive: Employee account ${emp.employee_id || input} is currently deactivated by administration. Access to the Employee Portal is blocked.`
        );
        setIsSubmitting(false);
        return;
      }

      // Check Onboarding status restriction
      if (emp && (emp.status === 'Onboarding' || emp.status === 'onboarding')) {
        setLoginError(
          `Onboarding Incomplete: Employee account ${emp.employee_id || input} has not completed the onboarding process. Access to the Employee Portal is restricted until onboarding is marked complete.`
        );
        setIsSubmitting(false);
        return;
      }

      // Validate Password (custom updated password, default temporary password, or stored password)
      const isPasswordValid = employeeAuthService.verifyEmployeePassword(emp, data.password);
      if (!isPasswordValid) {
        setLoginError(
          'Invalid Password: The password you entered is incorrect. If you forgot your password or need to change it, click "Forgot Password?" below to reset it via Email OTP.'
        );
        setIsSubmitting(false);
        return;
      }

      const empId = emp?.employee_id || input.toUpperCase();
      localStorage.setItem('ds_employee_token', 'emp_jwt_' + Date.now());
      localStorage.setItem('ds_current_employee_id', empId);
      localStorage.setItem('ds_employee_session', JSON.stringify({
        username: data.username,
        employeeId: empId,
        fullName: emp?.full_name || emp?.employee_name || 'Field Officer',
        district: emp?.district || emp?.district_id || 'Nellore',
        mandal: emp?.mandal || emp?.mandal_id || 'Kavali',
        status: emp?.status || 'Active',
        loggedInAt: new Date().toISOString()
      }));

      navigate('/employee/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('An unexpected login error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-white p-8 pb-6 text-center border-b border-slate-100 relative">
          <div className="flex items-center justify-center mx-auto mb-3 h-20 w-auto max-w-[260px]">
            <img src="/logo.png" alt="DS PROJECTS" className="h-full w-auto object-contain" />
          </div>
          <span className="inline-block px-3 py-1 bg-[#D8F5FA] text-[#E63946] border border-[#D8F5FA] text-xs font-bold uppercase tracking-widest rounded-full">
            Field Operations Employee Portal
          </span>
        </div>

        {/* Form */}
        <div className="p-8">
          {/* Success Banner */}
          {successBanner && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3 shadow-2xs animate-in fade-in">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-emerald-900">Success</p>
                <p className="text-emerald-700 leading-relaxed">{successBanner}</p>
              </div>
            </div>
          )}

          {/* Deactivated or Blocked Alert Banner */}
          {loginError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 shadow-2xs animate-in fade-in">
              <ShieldAlert size={20} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-rose-900">Sign In Failed</p>
                <p className="text-rose-700 leading-relaxed">{loginError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-bold text-slate-700">
                Employee ID, Username, or Email *
              </Label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="username"
                  type="text"
                  placeholder="e.g. DS-001 or email@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:bg-white transition"
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-rose-600 mt-1">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-bold text-slate-700">
                  Password *
                </Label>
                <Link
                  to={usernameValue ? `/employee/forgot-password?id=${encodeURIComponent(usernameValue)}` : '/employee/forgot-password'}
                  className="text-[11px] font-bold text-[#00B4D8] hover:text-[#0096C7] hover:underline transition"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63946] focus:bg-white transition"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full bg-[#E63946] hover:bg-[#FF6B6B] text-white font-bold h-11 rounded-xl shadow-lg shadow-[#E63946]/20" isLoading={isSubmitting}>
                <span>Sign In to Portal</span>
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </form>

          {/* Forgot password card banner */}
          <div className="mt-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center flex items-center justify-between">
            <div className="flex items-center gap-2 text-left">
              <KeyRound size={16} className="text-[#E63946] shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-800">Want to change password?</p>
                <p className="text-[10px] text-slate-500">Reset with your registered email OTP</p>
              </div>
            </div>
            <Link
              to={usernameValue ? `/employee/forgot-password?id=${encodeURIComponent(usernameValue)}` : '/employee/forgot-password'}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:border-[#E63946] text-[#E63946] font-bold text-xs rounded-xl shadow-2xs hover:bg-[#E63946]/5 transition"
            >
              Reset Here
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500 space-y-1">
            <p>Credentials are dispatched to your registered email upon onboarding.</p>
            <p className="text-slate-400">DS Projects Private Limited &bull; Andhra Pradesh</p>
          </div>
        </div>
      </div>
    </div>
  );
}


