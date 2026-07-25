import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext.js';
import { Shield, Sliders, Database, Mail, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export const Settings: React.FC = () => {
  const { showToast } = useNotification();
  const [smtpHost, setSmtpHost] = useState('smtp.leadflow.com');
  const [archiveDays, setArchiveDays] = useState(30);
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [scoreThreshold, setScoreThreshold] = useState(80);
  const [enableDuplicateWarning, setEnableDuplicateWarning] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('System configuration saved successfully', 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Title block */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 font-sans">
          CRM Configuration & Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-400 mt-1">
          Adjust global scoring thresholds, duplicate checks, session lifetimes, and email integrations
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Double Columns Settings Fields */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Lead Management Logic */}
          <div className="premium-card bg-white dark:bg-dark-900 p-6 border border-slate-200/60 dark:border-dark-800 space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Sliders className="h-5 w-5 text-violet-500" />
              Lead Routing & Scoring Thresholds
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-450 dark:text-dark-500 mb-1.5 uppercase tracking-wider">Auto-Archive Days</label>
                <input
                  type="number"
                  value={archiveDays}
                  onChange={(e) => setArchiveDays(parseInt(e.target.value, 10))}
                  className="w-full text-xs px-3.5 py-2.5 bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 text-slate-800 dark:text-slate-100 focus:border-violet-500 outline-none transition font-semibold"
                />
                <span className="text-[10px] text-slate-450 dark:text-dark-500 mt-1 block">Leads inactive for this long auto-archive.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 dark:text-dark-500 mb-1.5 uppercase tracking-wider">Hot Lead Score Threshold</label>
                <input
                  type="number"
                  value={scoreThreshold}
                  onChange={(e) => setScoreThreshold(parseInt(e.target.value, 10))}
                  className="w-full text-xs px-3.5 py-2.5 bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 text-slate-800 dark:text-slate-100 focus:border-violet-500 outline-none transition font-semibold"
                />
                <span className="text-[10px] text-slate-450 dark:text-dark-500 mt-1 block">Leads reaching this score get a fire symbol badge.</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableDuplicateWarning}
                  onChange={(e) => setEnableDuplicateWarning(e.target.checked)}
                  className="h-4 w-4 text-violet-600 border-slate-350 dark:border-dark-850 rounded focus:ring-violet-500/20"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-700 dark:text-dark-200">Warn on Duplicate Email Submissions</p>
                  <p className="text-[10px] text-slate-450 dark:text-dark-500 mt-0.5">Enforces strict email unique validation checks at lead registration.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Section 2: Email SMTP Setup */}
          <div className="premium-card bg-white dark:bg-dark-900 p-6 border border-slate-200/60 dark:border-dark-800 space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-500" />
              SMTP Email Integration (Mocked)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-450 dark:text-dark-500 mb-1.5 uppercase tracking-wider">SMTP Host Gateway</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 text-slate-800 dark:text-slate-100 focus:border-violet-500 outline-none transition font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-450 dark:text-dark-500 mb-1.5 uppercase tracking-wider">SMTP Port Gateway</label>
                <input
                  type="text"
                  defaultValue="587"
                  disabled
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-dark-950 rounded-lg border border-slate-200 dark:border-dark-800 text-slate-400 dark:text-dark-600 outline-none cursor-not-allowed font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Section Details Panel */}
        <div className="space-y-6">
          {/* Session Configuration Card */}
          <div className="premium-card bg-white dark:bg-dark-900 p-6 border border-slate-200/60 dark:border-dark-800 space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" />
              Security & Session Controls
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-450 dark:text-dark-500 mb-1.5 uppercase tracking-wider">Access Token Lifetime (minutes)</label>
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(parseInt(e.target.value, 10))}
                className="w-full text-xs px-3.5 py-2.5 bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 text-slate-800 dark:text-slate-100 focus:border-violet-500 outline-none transition font-semibold"
              />
              <span className="text-[10px] text-slate-450 dark:text-dark-500 mt-1 block">Valid duration of JWT Access tokens in-memory.</span>
            </div>
          </div>

          {/* Database Info Card */}
          <div className="premium-card bg-white dark:bg-dark-900 p-6 border border-slate-200/60 dark:border-dark-800 space-y-3">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-500" />
              Neon Cluster Storage
            </h3>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-dark-400">
              Tables and schemas are actively managed using Prisma ORM mapping to serverless Neon PostgreSQL.
            </p>
            <div className="text-[10px] space-y-1 text-slate-400 dark:text-dark-500 font-medium">
              <p>• Schema: public</p>
              <p>• Tables initialized: User, Lead, LeadNote, ActivityLog</p>
              <p>• Status: Active Connection</p>
            </div>
          </div>

          {/* Save Action */}
          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 py-3 rounded-lg bg-violet-600 hover:bg-violet-750 text-white font-bold text-sm shadow-sm transition"
          >
            <Save className="h-4 w-4" />
            Save Configuration
          </button>
        </div>
      </form>
    </motion.div>
  );
};
