import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../services/api.js';
import { History, Search, Filter, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const ActivityLogs: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const { data: logs = [], isLoading } = useQuery<any[]>({
    queryKey: ['fullActivityLogs'],
    queryFn: () => apiRequest('/leads/activity?limit=100').then((res) => res.data).catch(() => []),
  });

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user?.name.toLowerCase().includes(search.toLowerCase()) ||
      log.lead?.name.toLowerCase().includes(search.toLowerCase()) ||
      log.lead?.company?.toLowerCase().includes(search.toLowerCase());

    const matchesAction = filterAction === 'ALL' || log.action === filterAction;

    return matchesSearch && matchesAction;
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-dark-950">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
      </div>
    );
  }

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
          Activity Logs & Audit Trail
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-400 mt-1">
          Monitor system history, note logs, and pipeline alterations across the entire platform
        </p>
      </div>

      {/* Filter Card */}
      <div className="premium-card bg-white dark:bg-dark-900 p-4 border border-slate-200/60 dark:border-dark-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute inset-y-0 left-3 h-4 w-4 my-auto text-slate-450 dark:text-dark-500" />
          <input
            type="text"
            placeholder="Search representative, lead, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 text-slate-800 dark:text-slate-100 focus:border-violet-500 outline-none transition"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 dark:text-dark-500" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="text-xs px-3 py-1.5 bg-transparent border border-slate-200 dark:border-dark-800 rounded-lg outline-none cursor-pointer focus:border-violet-500 transition text-slate-700 dark:text-slate-200"
          >
            <option value="ALL" className="bg-white dark:bg-dark-900">All Operations</option>
            <option value="LEAD_CREATED" className="bg-white dark:bg-dark-900">Lead Created</option>
            <option value="STATUS_CHANGED" className="bg-white dark:bg-dark-900">Stage Changed</option>
            <option value="ASSIGNED" className="bg-white dark:bg-dark-900">Lead Assigned</option>
            <option value="NOTE_ADDED" className="bg-white dark:bg-dark-900">Notes Added</option>
            <option value="NOTE_DELETED" className="bg-white dark:bg-dark-900">Notes Deleted</option>
            <option value="PRIORITY_CHANGED" className="bg-white dark:bg-dark-900">Priority Changed</option>
          </select>
        </div>
      </div>

      {/* Main Timeline Card */}
      <div className="premium-card bg-white dark:bg-dark-900 p-6 border border-slate-200/60 dark:border-dark-800 min-h-[400px] flex flex-col">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
          <History className="h-5 w-5 text-violet-500" />
          Chronological Audit Stream
        </h3>

        <div className="flex-1 space-y-6 relative pl-6 border-l border-slate-200 dark:border-dark-800 ml-3">
          {filteredLogs.map((log) => (
            <div key={log.id} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              
              {/* Timeline marker node */}
              <span className="absolute -left-[30px] flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-dark-900 border-2 border-violet-500 text-violet-650 text-[10px] font-bold shadow-sm">
                {log.action.substring(0, 1)}
              </span>

              <div>
                <span className="font-extrabold text-slate-800 dark:text-slate-100">{log.user?.name}</span>{' '}
                <span className="text-slate-500 dark:text-dark-400">
                  {log.action === 'LEAD_CREATED' && `created lead "${log.lead?.name}"`}
                  {log.action === 'STATUS_CHANGED' && `changed status of "${log.lead?.name}" to "${log.metadata?.new}"`}
                  {log.action === 'ASSIGNED' && `assigned "${log.lead?.name}" to ${log.metadata?.assigneeName || 'someone'}`}
                  {log.action === 'NOTE_ADDED' && `added a note to "${log.lead?.name}"`}
                  {log.action === 'NOTE_DELETED' && `removed a note from "${log.lead?.name}"`}
                  {log.action === 'PRIORITY_CHANGED' && `changed priority of "${log.lead?.name}"`}
                </span>
                {log.lead?.company && (
                  <span className="block text-[10px] text-slate-400 dark:text-dark-500 mt-0.5">
                    Company: {log.lead.company}
                  </span>
                )}
              </div>

              <div className="shrink-0 text-[10px] text-slate-400 dark:text-dark-500 sm:text-right font-medium">
                {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 dark:text-dark-500">
              <Sparkles className="h-8 w-8 text-slate-300 dark:text-dark-700 mb-2" />
              <p>No activity records found matching filters.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
