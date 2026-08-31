import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export default function EmployeeLogin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/employee/dashboard');
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-background)] items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--color-card)] rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[var(--color-primary)] p-8 text-center text-white">
          <h1 className="text-3xl font-bold tracking-tight mb-2">DS PROJECTS</h1>
          <p className="text-blue-200 text-sm uppercase tracking-widest font-semibold">Employee Portal</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="rahulkumar127@dsprojects"
                {...register('username')}
                error={errors.username}
              />
              {errors.username && (
                <p className="text-sm text-[var(--color-error)] mt-1">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                error={errors.password}
              />
              {errors.password && (
                <p className="text-sm text-[var(--color-error)] mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  {...register('remember')}
                />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Remember me
                </Label>
              </div>
              <a href="#" className="text-sm text-[var(--color-primary)] hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
              LOGIN
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Need help? <a href="#" className="text-[var(--color-primary)] hover:underline font-medium">Contact HR</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
