import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '../services/api.js';
import { Sparkles, CheckCircle, Mail, Phone, User, Building, Globe, MessageSquare, Loader2, RefreshCw } from 'lucide-react';

const publicLeadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().optional(),
  message: z.string().optional(),
  captchaAnswer: z.string().min(1, 'Security check answer is required'),
  honeypot: z.string().optional(), // Hidden anti-bot spam honey pot
});

type PublicLeadFields = z.infer<typeof publicLeadSchema>;

export const PublicForm: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, setIsPending] = useState(false);

  // Generate simple math challenge
  const [captcha, setCaptcha] = useState(() => {
    const num1 = Math.floor(Math.random() * 9) + 1;
    const num2 = Math.floor(Math.random() * 9) + 1;
    return { num1, num2, expected: num1 + num2 };
  });

  const refreshCaptcha = () => {
    const num1 = Math.floor(Math.random() * 9) + 1;
    const num2 = Math.floor(Math.random() * 9) + 1;
    setCaptcha({ num1, num2, expected: num1 + num2 });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PublicLeadFields>({
    resolver: zodResolver(publicLeadSchema),
  });

  const onSubmit = async (data: PublicLeadFields) => {
    setIsPending(true);
    setErrorMessage('');

    try {
      const payload = {
        ...data,
        captchaExpected: captcha.expected.toString(),
      };

      const response = await apiRequest('/leads/public', {
        method: 'POST',
        body: JSON.stringify(payload),
        skipAuth: true, // No token required for public form
      });

      if (response.success) {
        setIsSubmitted(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed. Please try again.');
      refreshCaptcha();
    } finally {
      setIsPending(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-dark-950 px-4 transition-colors">
        <div className="premium-card max-w-md w-full bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-dark-800 p-8 text-center text-slate-800 dark:text-slate-100 shadow-2xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mx-auto mb-4 border border-emerald-500/20">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight font-sans">Submission Successful!</h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-dark-400 leading-relaxed">
            Thank you for reaching out. A sales representative from our team has been notified and will contact you shortly.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="mt-6 inline-flex justify-center rounded-lg border border-slate-250 dark:border-dark-800 hover:bg-slate-50 dark:hover:bg-dark-850 px-5 py-2.5 text-xs font-bold text-slate-500 dark:text-dark-400 transition"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      
      {/* Side Brand Panel */}
      <div className="md:w-1/3 bg-brand-600 dark:bg-brand-950/20 p-8 md:p-12 flex flex-col justify-between text-white border-r border-brand-700/20">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-brand-600 font-semibold shadow">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold font-sans tracking-tight">LeadFlow CRM</span>
        </div>

        <div className="space-y-4 my-12">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-sans leading-tight">
            Let's build something spectacular.
          </h1>
          <p className="text-sm text-brand-100 leading-relaxed max-w-sm">
            Fill out the request demo form on the right. Our platform will capture your lead details, compute scoring metrics, and assign your profile to a sales representative.
          </p>
        </div>

        <div className="text-[10px] text-brand-200">
          Built for <a href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer" className="underline font-bold">Digital Heroes Training Task</a>
        </div>
      </div>

      {/* Main Form Panel */}
      <div className="flex-1 p-8 md:p-16 flex items-center justify-center">
        <div className="max-w-xl w-full">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            Request a Consultation
          </h2>
          <p className="text-sm text-slate-500 dark:text-dark-400 mt-1.5 mb-8">
            Tell us about your organization and how we can support you.
          </p>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-500">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Honeypot anti-spam field (hidden from browser view) */}
            <input type="text" {...register('honeypot')} className="hidden" tabIndex={-1} autoComplete="off" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-dark-500 mb-1.5 uppercase tracking-wider">Your Name *</label>
                <div className="relative">
                  <User className="absolute inset-y-0 left-3 h-4 w-4 my-auto text-slate-400 dark:text-dark-500" />
                  <input type="text" placeholder="Sarah Connor" {...register('name')} className={`w-full text-xs pl-9 pr-4 py-2.5 bg-transparent rounded-lg border outline-none focus:border-brand-500 transition ${errors.name ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 dark:border-dark-800'}`} />
                </div>
                {errors.name && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-dark-500 mb-1.5 uppercase tracking-wider">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute inset-y-0 left-3 h-4 w-4 my-auto text-slate-400 dark:text-dark-500" />
                  <input type="email" placeholder="sarah@acme.com" {...register('email')} className={`w-full text-xs pl-9 pr-4 py-2.5 bg-transparent rounded-lg border outline-none focus:border-brand-500 transition ${errors.email ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 dark:border-dark-800'}`} />
                </div>
                {errors.email && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-dark-500 mb-1.5 uppercase tracking-wider">Phone number</label>
                <div className="relative">
                  <Phone className="absolute inset-y-0 left-3 h-4 w-4 my-auto text-slate-400 dark:text-dark-500" />
                  <input type="text" placeholder="5550120" {...register('phone', { onChange: (e) => { e.target.value = e.target.value.replace(/[^\d]/g, ''); } })} className="w-full text-xs pl-9 pr-4 py-2.5 bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 outline-none focus:border-brand-500 transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-dark-500 mb-1.5 uppercase tracking-wider">Company name</label>
                <div className="relative">
                  <Building className="absolute inset-y-0 left-3 h-4 w-4 my-auto text-slate-400 dark:text-dark-500" />
                  <input type="text" placeholder="Acme Systems" {...register('company')} className="w-full text-xs pl-9 pr-4 py-2.5 bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 outline-none focus:border-brand-500 transition" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-dark-500 mb-1.5 uppercase tracking-wider">Company Website URL</label>
              <div className="relative">
                <Globe className="absolute inset-y-0 left-3 h-4 w-4 my-auto text-slate-400 dark:text-dark-500" />
                <input type="text" placeholder="https://acme.com" {...register('website')} className="w-full text-xs pl-9 pr-4 py-2.5 bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 outline-none focus:border-brand-500 transition" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-dark-500 mb-1.5 uppercase tracking-wider">How can we help you?</label>
              <div className="relative">
                <MessageSquare className="absolute top-3 left-3 h-4 w-4 text-slate-400 dark:text-dark-500" />
                <textarea placeholder="Describe your request..." {...register('message')} className="w-full text-xs pl-9 pr-4 py-3 bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 outline-none focus:border-brand-500 transition h-24 resize-none" />
              </div>
            </div>

            {/* Math Captcha Protection */}
            <div className="pt-2 border-t border-slate-100 dark:border-dark-800/60 mt-4">
              <label className="block text-xs font-bold text-slate-450 dark:text-dark-500 mb-2 uppercase tracking-wider">
                Security Check *
              </label>
              <div className="flex items-center gap-3">
                <span className="text-sm font-extrabold bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-lg px-4 py-2 select-none font-mono">
                  {captcha.num1} + {captcha.num2} =
                </span>
                <input
                  type="text"
                  placeholder="?"
                  disabled={isPending}
                  {...register('captchaAnswer')}
                  className={`w-20 px-3.5 py-2.5 text-center text-sm font-extrabold bg-transparent rounded-lg border outline-none focus:border-brand-500 transition ${
                    errors.captchaAnswer ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 dark:border-dark-800'
                  }`}
                />
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="p-2 border border-slate-200 dark:border-dark-800 hover:bg-slate-50 dark:hover:bg-dark-800 rounded-lg text-slate-400 hover:text-slate-700 transition"
                  title="Refresh Captcha"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              {errors.captchaAnswer && (
                <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.captchaAnswer.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center items-center gap-2 py-3 rounded-lg bg-brand-500 text-white font-bold text-sm shadow hover:bg-brand-600 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:pointer-events-none transition mt-6"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Inquiry...</span>
                </>
              ) : (
                <span>Submit Inquiry</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
