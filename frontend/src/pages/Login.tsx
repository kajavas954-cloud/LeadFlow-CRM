import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { useNotification } from '../contexts/NotificationContext.js';
import { Sparkles, Mail, Lock, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFields = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFields) => {
    try {
      await login(data.email, data.password);
      showToast('Logged in successfully', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please verify credentials.', 'error');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-dark-950 px-4 transition-colors">
      <div className="w-full max-w-md">
        
        {/* Brand header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white font-semibold shadow-lg mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
            Welcome to LeadFlow
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-dark-400">
            Sign in to manage your sales pipeline
          </p>
        </div>

        {/* Login form Card */}
        <div className="premium-card bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-dark-800 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Email input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-dark-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-dark-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  placeholder="name@company.com"
                  disabled={isLoading}
                  {...register('email')}
                  className={`block w-full pl-10 pr-4 py-3 rounded-lg border text-sm bg-transparent text-slate-800 dark:text-slate-100 outline-none transition focus:border-brand-500 ${
                    errors.email 
                      ? 'border-rose-500 focus:border-rose-500' 
                      : 'border-slate-200 dark:border-dark-800'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-dark-400">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-dark-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...register('password')}
                  className={`block w-full pl-10 pr-4 py-3 rounded-lg border text-sm bg-transparent text-slate-800 dark:text-slate-100 outline-none transition focus:border-brand-500 ${
                    errors.password 
                      ? 'border-rose-500 focus:border-rose-500' 
                      : 'border-slate-200 dark:border-dark-800'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 rounded-lg bg-brand-500 text-white font-bold text-sm shadow-sm hover:bg-brand-600 focus:ring-2 focus:ring-brand-500/20 active:bg-brand-700 outline-none disabled:opacity-50 disabled:pointer-events-none transition"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Registration link */}
          <div className="mt-6 text-center text-xs font-medium text-slate-400 dark:text-dark-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-500 hover:text-brand-600 font-bold transition">
              Create an Account
            </Link>
          </div>
        </div>

        {/* Digital Heroes watermark */}
        <div className="mt-8 text-center text-xs text-slate-400 dark:text-dark-500">
          Built for{' '}
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline font-bold text-slate-500 dark:text-dark-400"
          >
            Digital Heroes Training Task
          </a>
        </div>
      </div>
    </div>
  );
};
