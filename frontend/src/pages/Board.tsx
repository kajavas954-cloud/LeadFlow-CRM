import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../services/api.js';
import { useNotification } from '../contexts/NotificationContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Flame, 
  Building,
  User,
  BadgeAlert
} from 'lucide-react';

type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'WON' | 'LOST';

const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'NEW', label: 'New', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { id: 'CONTACTED', label: 'Contacted', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  { id: 'QUALIFIED', label: 'Qualified', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  { id: 'PROPOSAL_SENT', label: 'Proposal Sent', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { id: 'NEGOTIATION', label: 'Negotiation', color: 'bg-pink-500/10 text-pink-500 border-pink-500/20' },
  { id: 'WON', label: 'Won', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { id: 'LOST', label: 'Lost', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
];

export const Board: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const navigate = useNavigate();

  // Fetch leads
  const { data: leads = [], isLoading } = useQuery<any[]>({
    queryKey: ['boardLeads'],
    queryFn: () => apiRequest('/leads?limit=100').then((res) => res.data),
  });

  // Mutate lead status (Optimistic update implementation)
  const statusMutation = useMutation({
    mutationFn: ({ leadId, newStatus }: { leadId: string; newStatus: LeadStatus }) =>
      apiRequest(`/leads/${leadId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      }),
    onMutate: async ({ leadId, newStatus }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['boardLeads'] });

      // Snapshot previous value
      const previousLeads = queryClient.getQueryData<any[]>(['boardLeads']);

      // Optimistically update query cache
      if (previousLeads) {
        queryClient.setQueryData<any[]>(
          ['boardLeads'],
          previousLeads.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead))
        );
      }

      return { previousLeads };
    },
    onError: (err, _variables, context) => {
      // Rollback cache if error
      if (context?.previousLeads) {
        queryClient.setQueryData(['boardLeads'], context.previousLeads);
      }
      showToast('Failed to update lead status: ' + err.message, 'error');
    },
    onSuccess: (_data, variables) => {
      showToast(`Lead moved to ${variables.newStatus.replace('_', ' ').toLowerCase()}`, 'success');
      // Invalidate queries to refresh background
      queryClient.invalidateQueries({ queryKey: ['boardLeads'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
    },
  });

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    if (!leadId) return;

    const lead = leads.find((l) => l.id === leadId);
    if (lead && lead.status !== targetStatus) {
      statusMutation.mutate({ leadId, newStatus: targetStatus });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 h-full">
        <div className="h-10 w-48 animate-pulse rounded bg-slate-200 dark:bg-dark-800" />
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-72 shrink-0 animate-pulse bg-slate-200 dark:bg-dark-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 font-sans">
            Pipeline Board
          </h1>
          <p className="text-sm text-slate-500 dark:text-dark-400 mt-1">
            Drag cards between status columns to update their sales stages
          </p>
        </div>
        {!isAdmin && (
          <Link
            to="/leads?create=true"
            className="inline-flex items-center gap-1.5 self-start rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 transition"
          >
            <Plus className="h-4 w-4" />
            <span>New Lead</span>
          </Link>
        )}
      </div>

      {/* Kanban Board columns scroll wrapper */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 flex gap-4 min-h-0 select-none">
        {COLUMNS.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="w-72 shrink-0 flex flex-col bg-slate-100/50 dark:bg-dark-900/40 border border-slate-200/40 dark:border-dark-850/40 rounded-xl p-3 h-full overflow-hidden"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 shrink-0 px-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 border rounded-full ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-dark-500">
                    {colLeads.length}
                  </span>
                </div>
              </div>

              {/* Column Cards scroll list */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {colLeads.length === 0 ? (
                  <div className="h-24 border border-dashed border-slate-200 dark:border-dark-800 rounded-lg flex items-center justify-center text-xs text-slate-400 dark:text-dark-500">
                    Drop leads here
                  </div>
                ) : (
                  colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onClick={() => navigate(`/leads/${lead.id}`)}
                      className="bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-dark-800/80 p-4 rounded-xl shadow-premium hover:shadow-premium-hover cursor-pointer hover:border-slate-350 dark:hover:border-dark-700/80 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-sans truncate">
                          {lead.name}
                        </h4>
                        
                        {/* Lead Score Indicator */}
                        <div 
                          className={`shrink-0 flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                            lead.score >= 80 
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                              : lead.score >= 50
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                          }`}
                          title={`Lead Score: ${lead.score}`}
                        >
                          <Flame className="h-2.5 w-2.5 shrink-0" />
                          <span>{lead.score}</span>
                        </div>
                      </div>

                      <div className="mt-2 space-y-1.5">
                        {lead.company && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-dark-400">
                            <Building className="h-3.5 w-3.5 text-slate-400 dark:text-dark-500 shrink-0" />
                            <span className="truncate">{lead.company}</span>
                          </div>
                        )}
                        
                        {/* Assignee Badge */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-dark-500">
                          <User className="h-3.5 w-3.5 text-slate-400 dark:text-dark-500 shrink-0" />
                          <span className="truncate font-medium text-slate-500 dark:text-dark-400">
                            {lead.assignedTo?.name || 'Unassigned'}
                          </span>
                        </div>
                      </div>

                      {/* Bottom row badges */}
                      <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-dark-800/60 flex items-center justify-between text-[10px] text-slate-400 dark:text-dark-500 font-semibold uppercase">
                        <span>{lead.source.replace('_', ' ')}</span>
                        
                        {lead.priority === 'URGENT' && (
                          <span className="text-red-500 font-extrabold flex items-center gap-0.5 animate-pulse">
                            <BadgeAlert className="h-3 w-3" />
                            <span>Urgent</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
