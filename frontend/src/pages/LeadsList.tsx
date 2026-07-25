import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '../services/api.js';
import { useNotification } from '../contexts/NotificationContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { 
  Plus, 
  Search, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Upload, 
  X, 
  User, 
  Building,
  Flame, 
  Filter,
  Eye,
  AlertCircle
} from 'lucide-react';

// Create Lead Zod Schema matching backend expectations
const leadFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().optional(),
  source: z.enum(['WEBSITE', 'REFERRAL', 'LINKEDIN', 'COLD_EMAIL', 'FACEBOOK', 'INSTAGRAM', 'GOOGLE_ADS', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST']),
  assignedToId: z.string().optional(),
});

type LeadFormFields = z.infer<typeof leadFormSchema>;

export const LeadsList: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Dialog Toggles
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Filters State (hooked to URL search params for bookmarkability!)
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const source = searchParams.get('source') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 10;

  // React Router query triggers
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsCreateOpen(true);
      // Clean query param
      const params = new URLSearchParams(searchParams);
      params.delete('create');
      setSearchParams(params);
    }
  }, [searchParams]);

  // Fetch Leads query
  const { data, isLoading } = useQuery({
    queryKey: ['leadsList', page, status, priority, source, search],
    queryFn: () => {
      const q = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (status) q.append('status', status);
      if (priority) q.append('priority', priority);
      if (source) q.append('source', source);
      if (search) q.append('search', search);

      return apiRequest(`/leads?${q.toString()}`);
    },
  });

  // Fetch Users (for Assignee list)
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['usersList'],
    queryFn: () => apiRequest('/users').then((res) => res.data),
    enabled: user?.role === 'ADMIN',
  });

  // Create Lead Mutation
  const createLeadMutation = useMutation({
    mutationFn: (newLead: LeadFormFields) => 
      apiRequest('/leads', {
        method: 'POST',
        body: JSON.stringify(newLead),
      }),
    onSuccess: () => {
      showToast('Lead created successfully', 'success');
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['leadsList'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
      queryClient.invalidateQueries({ queryKey: ['boardLeads'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to create lead', 'error');
    }
  });

  // Delete Lead Mutation
  const deleteLeadMutation = useMutation({
    mutationFn: (leadId: string) => 
      apiRequest(`/leads/${leadId}`, { method: 'DELETE' }),
    onSuccess: () => {
      showToast('Lead deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['leadsList'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
      queryClient.invalidateQueries({ queryKey: ['boardLeads'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to delete lead', 'error');
    }
  });

  // Assign/Reassign Mutation
  const assignMutation = useMutation({
    mutationFn: ({ leadId, assignedToId }: { leadId: string; assignedToId: string | null }) =>
      apiRequest(`/leads/${leadId}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ assignedToId }),
      }),
    onSuccess: () => {
      showToast('Lead assignment updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['leadsList'] });
      queryClient.invalidateQueries({ queryKey: ['boardLeads'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to reassign lead', 'error');
    }
  });

  // Form Setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormFields>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      source: 'WEBSITE',
      priority: 'MEDIUM',
      status: 'NEW',
      assignedToId: '',
    }
  });

  const onSubmit = (data: LeadFormFields) => {
    // Map empty string assignedToId to undefined
    const payload = {
      ...data,
      assignedToId: data.assignedToId || undefined,
    };
    createLeadMutation.mutate(payload);
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // Reset to page 1 on filter
    setSearchParams(params);
  };

  // CSV Export handler
  const handleCSVExport = () => {
    if (!data?.data || data.data.length === 0) {
      showToast('No leads available to export', 'info');
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Company', 'Website', 'Source', 'Priority', 'Status', 'Score', 'Assignee'];
    const csvRows = [headers.join(',')];

    data.data.forEach((lead: any) => {
      const row = [
        `"${lead.name.replace(/"/g, '""')}"`,
        `"${lead.email.replace(/"/g, '""')}"`,
        `"${(lead.phone || '').replace(/"/g, '""')}"`,
        `"${(lead.company || '').replace(/"/g, '""')}"`,
        `"${(lead.website || '').replace(/"/g, '""')}"`,
        `"${lead.source}"`,
        `"${lead.priority}"`,
        `"${lead.status}"`,
        lead.score,
        `"${lead.assignedTo?.name || 'Unassigned'}"`,
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'leads_export.csv');
    link.click();
    showToast('Leads exported as CSV', 'success');
  };

  // CSV Import handler
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const handleCSVImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      showToast('Please select a CSV file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        let successCount = 0;
        let duplicateCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const payload: any = {};
          headers.forEach((header, index) => {
            const camelHeader = header.toLowerCase();
            if (camelHeader === 'name') payload.name = values[index];
            if (camelHeader === 'email') payload.email = values[index];
            if (camelHeader === 'phone') payload.phone = values[index] || '';
            if (camelHeader === 'company') payload.company = values[index] || '';
            if (camelHeader === 'source') payload.source = values[index] || 'WEBSITE';
          });

          if (!payload.name || !payload.email) continue;

          try {
            // Call API directly for each row
            await apiRequest('/leads', {
              method: 'POST',
              body: JSON.stringify(payload),
            });
            successCount++;
          } catch (err: any) {
            if (err.message.includes('already exists')) {
              duplicateCount++;
            }
          }
        }

        showToast(`Import summary: ${successCount} imported successfully, ${duplicateCount} duplicates skipped`, 'success');
        setIsImportOpen(false);
        setCSVFile(null);
        queryClient.invalidateQueries({ queryKey: ['leadsList'] });
      } catch (err) {
        showToast('Error parsing CSV. Ensure correct format.', 'error');
      }
    };
    reader.readAsText(csvFile);
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 font-sans">
            Leads Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-dark-400 mt-1">
            Browse, filter, assign, and manage all your customer pipeline leads
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {!isAdmin && (
            <button
              onClick={() => setIsImportOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-dark-350 hover:bg-slate-50 dark:hover:bg-dark-800 hover:text-slate-800 dark:hover:text-slate-100 transition shadow-sm"
            >
              <Upload className="h-4 w-4" />
              <span>Import CSV</span>
            </button>
          )}
          
          <button
            onClick={handleCSVExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-dark-350 hover:bg-slate-50 dark:hover:bg-dark-800 hover:text-slate-800 dark:hover:text-slate-100 transition shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>

          {!isAdmin && (
            <button
              onClick={() => { reset(); setIsCreateOpen(true); }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters and search card */}
      <div className="premium-card bg-white dark:bg-dark-900 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute inset-y-0 left-3 h-4 w-4 my-auto text-slate-400 dark:text-dark-500" />
          <input
            type="text"
            placeholder="Search name, company, email..."
            value={search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-dark-800 bg-transparent text-sm text-slate-850 dark:text-slate-100 outline-none transition focus:border-brand-500"
          />
        </div>

        {/* Filter select list */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-450 dark:text-dark-500">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="text-xs font-semibold py-2 px-3 border border-slate-200 dark:border-dark-800 rounded-lg bg-white dark:bg-dark-900 text-slate-650 dark:text-dark-400 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PROPOSAL_SENT">Proposal Sent</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>

          {/* Priority filter */}
          <select
            value={priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="text-xs font-semibold py-2 px-3 border border-slate-200 dark:border-dark-800 rounded-lg bg-white dark:bg-dark-900 text-slate-650 dark:text-dark-400 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          {/* Source filter */}
          <select
            value={source}
            onChange={(e) => handleFilterChange('source', e.target.value)}
            className="text-xs font-semibold py-2 px-3 border border-slate-200 dark:border-dark-800 rounded-lg bg-white dark:bg-dark-900 text-slate-650 dark:text-dark-400 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Sources</option>
            <option value="WEBSITE">Website</option>
            <option value="REFERRAL">Referral</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="COLD_EMAIL">Cold Email</option>
            <option value="GOOGLE_ADS">Google Ads</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Leads Table Container */}
      <div className="premium-card overflow-hidden bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-dark-800/80 rounded-xl shadow-premium">
        {isLoading ? (
          <div className="p-12 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse bg-slate-100 dark:bg-dark-800 rounded" />
            ))}
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="py-24 text-center text-slate-500 dark:text-dark-400 flex flex-col items-center justify-center">
            <AlertCircle className="h-12 w-12 text-slate-350 dark:text-dark-600 mb-3" />
            <h3 className="text-base font-bold font-sans">No leads found</h3>
            <p className="text-xs text-slate-400 dark:text-dark-500 mt-1">Try clearing filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-dark-800 text-xs font-bold text-slate-400 dark:text-dark-500 uppercase bg-slate-50/50 dark:bg-dark-950/20">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Assignee</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-800/60">
                {data.data.map((lead: any) => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-dark-800/20 transition-all text-slate-700 dark:text-slate-300"
                  >
                    {/* Name */}
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                      <Link to={`/leads/${lead.id}`} className="hover:underline flex items-center gap-1.5">
                        {lead.name}
                      </Link>
                    </td>
                    
                    {/* Company */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Building className="h-3.5 w-3.5 text-slate-350 dark:text-dark-500 shrink-0" />
                        <span>{lead.company || '—'}</span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="text-xs font-medium">{lead.email}</div>
                      <div className="text-[10px] text-slate-400 dark:text-dark-500 mt-0.5">{lead.phone || '—'}</div>
                    </td>

                    {/* Source */}
                    <td className="px-6 py-4 text-xs font-semibold capitalize">
                      {lead.source.replace('_', ' ').toLowerCase()}
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        lead.priority === 'URGENT' 
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                          : lead.priority === 'HIGH'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : lead.priority === 'MEDIUM'
                          ? 'bg-brand-500/10 text-brand-500 border-brand-500/20'
                          : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                      }`}>
                        {lead.priority}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-bold text-xs">
                        <Flame className="h-3.5 w-3.5 text-rose-500" />
                        <span>{lead.score}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${
                        lead.status === 'WON' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : lead.status === 'LOST'
                          ? 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                          : 'bg-brand-500/10 text-brand-500 border-brand-500/20'
                      }`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Assignee select (Admin only modification, otherwise static text) */}
                    <td className="px-6 py-4">
                      {user?.role === 'ADMIN' ? (
                        <select
                          value={lead.assignedToId || ''}
                          onChange={(e) => assignMutation.mutate({ leadId: lead.id, assignedToId: e.target.value || null })}
                          className="text-xs bg-transparent border-b border-slate-200 dark:border-dark-800 pb-0.5 outline-none focus:border-brand-500"
                        >
                          <option value="">Unassigned</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center gap-1 text-xs">
                          <User className="h-3 w-3 text-slate-400 dark:text-dark-500" />
                          <span>{lead.assignedTo?.name || 'Unassigned'}</span>
                        </div>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/leads/${lead.id}`)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-250 transition"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {user?.role === 'ADMIN' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete lead "${lead.name}"?`)) {
                                deleteLeadMutation.mutate(lead.id);
                              }
                            }}
                            className="p-1 rounded hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition"
                            title="Delete Lead"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {!isLoading && data?.pagination && (
          <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-dark-800 px-6 py-4 shrink-0 bg-slate-50/20 dark:bg-dark-950/10">
            <span className="text-xs text-slate-450 dark:text-dark-500">
              Showing Page <span className="font-bold text-slate-700 dark:text-slate-300">{data.pagination.page}</span> of{' '}
              <span className="font-bold text-slate-700 dark:text-slate-300">{data.pagination.totalPages || 1}</span> ({data.pagination.total} leads total)
            </span>
            
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => handleFilterChange('page', (page - 1).toString())}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-dark-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-800 disabled:opacity-40 disabled:pointer-events-none transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= data.pagination.totalPages}
                onClick={() => handleFilterChange('page', (page + 1).toString())}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-dark-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-800 disabled:opacity-40 disabled:pointer-events-none transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* POPUP Create Lead Modal Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
          
          <div className="relative max-w-lg w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-800 p-5 bg-slate-50/50 dark:bg-dark-950/20">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-sans">
                Create New Lead Record
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-dark-400 mb-1.5 uppercase tracking-wider">Name *</label>
                  <input type="text" {...register('name')} className="w-full px-3.5 py-2 text-sm bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 text-slate-800 dark:text-slate-100 focus:border-brand-500 outline-none transition" />
                  {errors.name && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-dark-400 mb-1.5 uppercase tracking-wider">Email Address *</label>
                  <input type="email" {...register('email')} className="w-full px-3.5 py-2 text-sm bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 text-slate-800 dark:text-slate-100 focus:border-brand-500 outline-none transition" />
                  {errors.email && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-dark-400 mb-1.5 uppercase tracking-wider">Phone number</label>
                  <input type="text" placeholder="5550100" {...register('phone', { onChange: (e) => { e.target.value = e.target.value.replace(/[^\d]/g, ''); } })} className="w-full px-3.5 py-2 text-sm bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 text-slate-800 dark:text-slate-100 focus:border-brand-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-dark-400 mb-1.5 uppercase tracking-wider">Company name</label>
                  <input type="text" placeholder="Wayne Enterprises" {...register('company')} className="w-full px-3.5 py-2 text-sm bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 text-slate-800 dark:text-slate-100 focus:border-brand-500 outline-none transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-dark-400 mb-1.5 uppercase tracking-wider">Website URL</label>
                <input type="text" placeholder="https://company.com" {...register('website')} className="w-full px-3.5 py-2 text-sm bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 text-slate-800 dark:text-slate-100 focus:border-brand-500 outline-none transition" />
                {errors.website && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.website.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-dark-400 mb-1.5 uppercase tracking-wider">Source</label>
                  <select {...register('source')} className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100 focus:border-brand-500 outline-none transition">
                    <option value="WEBSITE">Website</option>
                    <option value="REFERRAL">Referral</option>
                    <option value="LINKEDIN">LinkedIn</option>
                    <option value="COLD_EMAIL">Cold Email</option>
                    <option value="GOOGLE_ADS">Google Ads</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-dark-400 mb-1.5 uppercase tracking-wider">Priority</label>
                  <select {...register('priority')} className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100 focus:border-brand-500 outline-none transition">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-dark-400 mb-1.5 uppercase tracking-wider">Status</label>
                  <select {...register('status')} className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100 focus:border-brand-500 outline-none transition">
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="PROPOSAL_SENT">Proposal Sent</option>
                    <option value="NEGOTIATION">Negotiation</option>
                    <option value="WON">Won</option>
                    <option value="LOST">Lost</option>
                  </select>
                </div>
              </div>

              {user?.role === 'ADMIN' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-dark-400 mb-1.5 uppercase tracking-wider">Assign to user</label>
                  <select {...register('assignedToId')} className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100 focus:border-brand-500 outline-none transition">
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-dark-800 hover:bg-slate-50 dark:hover:bg-dark-800 rounded-lg text-slate-500 dark:text-dark-400 transition">Cancel</button>
                <button type="submit" disabled={createLeadMutation.isPending} className="px-4 py-2 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition">Create Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP CSV Import Dialog */}
      {isImportOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setIsImportOpen(false)} />
          
          <div className="relative max-w-md w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-sans">Import Leads from CSV</h3>
              <button onClick={() => setIsImportOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleCSVImport} className="space-y-4">
              <div className="p-4 border-2 border-dashed border-slate-200 dark:border-dark-800 rounded-xl text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCSVFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="csv-file-input"
                />
                <label htmlFor="csv-file-input" className="cursor-pointer block">
                  <Upload className="h-8 w-8 text-brand-500 mx-auto mb-2" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-dark-350 block">
                    {csvFile ? csvFile.name : 'Select CSV file to import'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-dark-500 mt-1 block">
                    File must contain headers: Name, Email (and optional: Phone, Company, Source)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setIsImportOpen(false)} className="px-3.5 py-1.5 text-xs font-semibold border border-slate-200 dark:border-dark-800 hover:bg-slate-50 dark:hover:bg-dark-800 rounded-lg text-slate-500 dark:text-dark-400 transition">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition">Upload & Process</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
