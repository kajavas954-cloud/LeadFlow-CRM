import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../services/api.js';
import { useNotification } from '../contexts/NotificationContext.js';
import { UserCheck, ShieldAlert, UserPlus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const Assignments: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  // Fetch leads
  const { data: leads = [], isLoading: leadsLoading } = useQuery<any[]>({
    queryKey: ['assignmentsLeadsList'],
    queryFn: () => apiRequest('/leads?limit=100').then((res) => res.data),
  });

  // Fetch Sales Representatives
  const { data: reps = [], isLoading: repsLoading } = useQuery<any[]>({
    queryKey: ['salesRepsList'],
    queryFn: () => apiRequest('/users').then((res) => res.data.filter((u: any) => u.role === 'SALES_MEMBER')),
  });

  // Assignment Mutation
  const assignMutation = useMutation({
    mutationFn: ({ leadId, userId }: { leadId: string; userId: string | null }) =>
      apiRequest(`/leads/${leadId}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ assignedToId: userId }),
      }),
    onSuccess: (_, variables) => {
      const assignedRep = reps.find(r => r.id === variables.userId);
      showToast(
        assignedRep 
          ? `Lead assigned to ${assignedRep.name} successfully` 
          : 'Lead unassigned successfully', 
        'success'
      );
      queryClient.invalidateQueries({ queryKey: ['assignmentsLeadsList'] });
      queryClient.invalidateQueries({ queryKey: ['boardLeads'] });
      queryClient.invalidateQueries({ queryKey: ['leadsList'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
    },
    onError: (err) => {
      showToast(err.message || 'Failed to update assignment', 'error');
    }
  });

  const handleAssignChange = (leadId: string, value: string) => {
    const userId = value === 'unassigned' ? null : value;
    assignMutation.mutate({ leadId, userId });
  };

  const unassignedLeads = leads.filter(l => !l.assignedToId);
  const assignedLeadsCount = leads.length - unassignedLeads.length;

  if (leadsLoading || repsLoading) {
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
          Lead Allocations & Assignments
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-400 mt-1">
          Distribute incoming prospect opportunities among your active sales team members
        </p>
      </div>

      {/* Grid summary cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="premium-card bg-white dark:bg-dark-900 p-6 flex items-center justify-between border border-slate-200/60 dark:border-dark-800">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-dark-500">Unassigned Leads</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans">{unassignedLeads.length}</h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>

        <div className="premium-card bg-white dark:bg-dark-900 p-6 flex items-center justify-between border border-slate-200/60 dark:border-dark-800">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-dark-500">Assigned Leads</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans">{assignedLeadsCount}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-650 rounded-xl">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="premium-card bg-white dark:bg-dark-900 p-6 flex items-center justify-between border border-slate-200/60 dark:border-dark-800">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-dark-500">Active Reps</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans">{reps.length}</h3>
          </div>
          <div className="p-3 bg-violet-500/10 text-violet-650 rounded-xl">
            <UserPlus className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Allocation control board */}
      <div className="premium-card bg-white dark:bg-dark-900 p-6 border border-slate-200/60 dark:border-dark-800">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-5">Lead Allocation Directory</h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-slate-500 dark:text-dark-400">
            <thead>
              <tr className="border-b border-slate-100 dark:border-dark-800/80 bg-slate-50/50 dark:bg-dark-950/20 text-slate-400 dark:text-dark-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Lead Name</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Priority / Score</th>
                <th className="py-3.5 px-4">Sales Assignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-800/60">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-950/10 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-850 dark:text-slate-100">{lead.name}</td>
                  <td className="py-4 px-4 font-semibold text-slate-600 dark:text-dark-350">{lead.company || '-'}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                        lead.priority === 'URGENT' 
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                          : lead.priority === 'HIGH'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-550 border-blue-550/20'
                      }`}>
                        {lead.priority}
                      </span>
                      <span className="font-extrabold text-slate-400 dark:text-dark-500">Score: {lead.score}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="relative max-w-[200px]">
                      <select
                        value={lead.assignedToId || 'unassigned'}
                        onChange={(e) => handleAssignChange(lead.id, e.target.value)}
                        className={`w-full text-xs px-3 py-1.5 bg-transparent rounded-lg border outline-none cursor-pointer focus:border-violet-500 transition font-bold ${
                          lead.assignedToId 
                            ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-450 bg-emerald-500/5' 
                            : 'border-slate-200 dark:border-dark-800 text-slate-500 dark:text-dark-400'
                        }`}
                      >
                        <option value="unassigned" className="bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100">🚫 Unassigned</option>
                        {reps.map((rep) => (
                          <option key={rep.id} value={rep.id} className="bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100">
                            👤 {rep.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 dark:text-dark-500">
                    No leads available to assign.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
