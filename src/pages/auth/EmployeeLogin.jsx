import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, User, ArrowRight, ShieldCheck, Sparkles, Building2, MapPin, AlertCircle, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import { liveDataService } from '../../services/liveDataService';

const loginSchema = z.object({
  username: z.string().min(1, 'Please enter your Employee ID, Username, or Email'),
  password: z.string().min(1, 'Please enter your password'),
  remember: z.boolean().optional(),
});

export default function EmployeeLogin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (searchParams.get('error') === 'deactivated') {
      setLoginError('Account Deactivated: Your employee profile was disabled by the administrator. Portal access has been revoked.');
    }
  }, [searchParams]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setLoginError(null);
    try {
      const input = data.username.trim();
      let emp = null;

      if (isSupabaseConfigured) {
        try {
          const { data: dbEmp } = await supabase
            .from('employees')
            .select('*')
            .or(`employee_id.ilike.%${input}%,email.ilike.%${input}%,phone.ilike.%${input}%`)
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
        emp = liveList.find(e => 
          (e.employee_id && e.employee_id.toLowerCase() === input.toLowerCase()) ||
          (e.email && e.email.toLowerCase() === input.toLowerCase()) ||
          (e.phone && e.phone === input)
        );
      }

      // Check Inactive status restriction
      if (emp && emp.status === 'Inactive') {
        setLoginError(
          `Account Inactive: Employee account ${emp.employee_id || input} is currently deactivated by administration. Access to the Employee Portal is blocked.`
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
        fullName: emp?.full_name || 'Field Officer',
        district: emp?.district || 'Nellore',
        mandal: emp?.mandal || 'Kavali',
        status: emp?.status || 'Active',
        loggedInAt: new Date().toISOString()
      }));

      navigate('/employee/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      navigate('/employee/dashboard', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0F172A] p-8 text-center text-white relative">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white font-extrabold text-xl shadow-lg shadow-blue-500/30">
            DS
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">DS PROJECTS</h1>
          <p className="text-blue-300 text-xs uppercase tracking-widest font-semibold mt-1">Field Operations Employee Portal</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {/* Deactivated or Blocked Alert Banner */}
          {loginError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 shadow-2xs animate-in fade-in">
              <ShieldAlert size={20} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-rose-900">Access Denied</p>
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
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-rose-600 mt-1">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-slate-700">
                Password *
              </Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-blue-500/25" isLoading={isSubmitting}>
                <span>Sign In to Portal</span>
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500 space-y-1">
            <p>Credentials are dispatched to your registered email upon onboarding.</p>
            <p className="text-slate-400">DS Projects Private Limited &bull; Andhra Pradesh</p>
          </div>
        </div>
      </div>
    </div>
  );
}

