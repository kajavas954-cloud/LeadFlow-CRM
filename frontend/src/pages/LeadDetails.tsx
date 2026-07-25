import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '../services/api.js';
import { useNotification } from '../contexts/NotificationContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { 
  Mail, 
  Phone, 
  Globe, 
  Flame, 
  Calendar, 
  User, 
  MessageSquare, 
  History, 
  Trash2, 
  Archive, 
  ArrowLeft,
  Loader2,
  Edit2,
  CheckCircle,
  Sparkles,
  Bot,
  Copy,
  Check,
  ClipboardList
} from 'lucide-react';

// Zod schema for editing lead
const editLeadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  source: z.enum(['WEBSITE', 'REFERRAL', 'LINKEDIN', 'COLD_EMAIL', 'FACEBOOK', 'INSTAGRAM', 'GOOGLE_ADS', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST']),
  industry: z.string().optional().nullable(),
});

type EditLeadFields = z.infer<typeof editLeadSchema>;

export const LeadDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useNotification();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'notes' | 'timeline'>('notes');
  const [isEditing, setIsEditing] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  // AI states
  const [leadSummary, setLeadSummary] = useState('');
  const [isSummaryPending, setIsSummaryPending] = useState(false);
  const [isCopiedSummary, setIsCopiedSummary] = useState(false);

  const [nextAction, setNextAction] = useState<any>(null);
  const [isActionPending, setIsActionPending] = useState(false);

  const [emailTemplate, setEmailTemplate] = useState('FIRST_CONTACT');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isEmailPending, setIsEmailPending] = useState(false);
  const [isCopiedEmail, setIsCopiedEmail] = useState(false);

  const [rawMeetingNotes, setRawMeetingNotes] = useState('');
  const [parsedMeetingNotes, setParsedMeetingNotes] = useState<any>(null);
  const [isNotesPending, setIsNotesPending] = useState(false);

  // Trigger handlers
  const handleGenerateSummary = async () => {
    setIsSummaryPending(true);
    try {
      const res = await apiRequest('/ai/summary', {
        method: 'POST',
        body: JSON.stringify({ leadId: id }),
      });
      if (res.success) {
        setLeadSummary(res.data);
        showToast('AI Lead Summary generated successfully', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to generate summary', 'error');
    } finally {
      setIsSummaryPending(false);
    }
  };

  const handleFetchNextAction = async () => {
    setIsActionPending(true);
    try {
      const res = await apiRequest('/ai/next-action', {
        method: 'POST',
        body: JSON.stringify({ leadId: id }),
      });
      if (res.success) {
        setNextAction(res.data);
        showToast('AI Next Best Action recommendations fetched', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch next action', 'error');
    } finally {
      setIsActionPending(false);
    }
  };

  const handleComposeEmail = async () => {
    if (!lead) return;
    setIsEmailPending(true);
    try {
      const res = await apiRequest('/ai/email', {
        method: 'POST',
        body: JSON.stringify({
          leadName: lead.name,
          company: lead.company,
          template: emailTemplate,
        }),
      });
      if (res.success) {
        setGeneratedEmail(res.data);
        showToast('Outbound email draft completed', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to compose email', 'error');
    } finally {
      setIsEmailPending(false);
    }
  };

  const handleAnalyzeMeetingNotes = async () => {
    if (!rawMeetingNotes.trim()) {
      showToast('Please type raw meeting notes first', 'info');
      return;
    }
    setIsNotesPending(true);
    try {
      const res = await apiRequest('/ai/meeting-notes', {
        method: 'POST',
        body: JSON.stringify({ rawText: rawMeetingNotes }),
      });
      if (res.success) {
        setParsedMeetingNotes(res.data);
        showToast('Notes analyzed and structured', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to process notes', 'error');
    } finally {
      setIsNotesPending(false);
    }
  };

  // Query: Fetch lead profile details
  const { data: lead, isLoading: leadLoading } = useQuery({
    queryKey: ['leadDetails', id],
    queryFn: () => apiRequest(`/leads/${id}`).then((res) => res.data),
  });

  // Query: Fetch notes list
  const { data: notes = [], isLoading: notesLoading } = useQuery<any[]>({
    queryKey: ['leadNotes', id],
    queryFn: () => apiRequest(`/leads/${id}/notes`).then((res) => res.data),
  });

  // Query: Fetch activities list
  const { data: activities = [], isLoading: activityLoading } = useQuery<any[]>({
    queryKey: ['leadActivity', id],
    queryFn: () => apiRequest(`/leads/${id}/activity`).then((res) => res.data),
  });

  // Query: Users list for assignee reselection
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['usersList'],
    queryFn: () => apiRequest('/users').then((res) => res.data),
    enabled: user?.role === 'ADMIN',
  });

  // Form Setup for Edit mode
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditLeadFields>({
    resolver: zodResolver(editLeadSchema),
    values: lead ? {
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || '',
      website: lead.website || '',
      source: lead.source,
      priority: lead.priority,
      status: lead.status,
      industry: lead.industry || '',
    } : undefined,
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (updatedData: EditLeadFields) =>
      apiRequest(`/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData),
      }),
    onSuccess: () => {
      showToast('Lead profile updated successfully', 'success');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['leadDetails', id] });
      queryClient.invalidateQueries({ queryKey: ['leadActivity', id] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to update lead', 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest(`/leads/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      showToast('Lead deleted successfully', 'success');
      navigate('/leads');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to delete lead', 'error');
    }
  });

  const archiveMutation = useMutation({
    mutationFn: () =>
      apiRequest(`/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ archived: true }),
      }),
    onSuccess: () => {
      showToast('Lead archived successfully', 'success');
      navigate('/leads');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to archive lead', 'error');
    }
  });

  const assignMutation = useMutation({
    mutationFn: (assignedToId: string | null) =>
      apiRequest(`/leads/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ assignedToId }),
      }),
    onSuccess: () => {
      showToast('Lead assignee updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['leadDetails', id] });
      queryClient.invalidateQueries({ queryKey: ['leadActivity', id] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to update assignment', 'error');
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: (note: string) =>
      apiRequest(`/leads/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      }),
    onSuccess: () => {
      showToast('Note added successfully', 'success');
      setNoteContent('');
      queryClient.invalidateQueries({ queryKey: ['leadNotes', id] });
      queryClient.invalidateQueries({ queryKey: ['leadActivity', id] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to add note', 'error');
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) =>
      apiRequest(`/leads/notes/${noteId}`, { method: 'DELETE' }),
    onSuccess: () => {
      showToast('Note deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['leadNotes', id] });
      queryClient.invalidateQueries({ queryKey: ['leadActivity', id] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to delete note', 'error');
    }
  });

  const handleEditSubmit = (data: EditLeadFields) => {
    updateMutation.mutate(data);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    addNoteMutation.mutate(noteContent);
  };

  if (leadLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-dark-950">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="py-24 text-center">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Lead not found</h3>
        <button onClick={() => navigate('/leads')} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Go Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top back actions */}
      <div className="flex items-center justify-between shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-dark-400 dark:hover:text-slate-200 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        {/* Lead status won/lost indicator banner */}
        {lead.status === 'WON' && (
          <div className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/25 px-3 py-1 rounded-full animate-bounce">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Closed Won</span>
          </div>
        )}
      </div>

      {/* Main profile layouts grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
        
        {/* LEFT COLUMN: Profile info & AI Workspace */}
        <div className="lg:col-span-1 space-y-6">
          <div className="premium-card bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-dark-800 p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight leading-tight">
                {lead.name}
              </h2>
              {lead.company && <p className="text-xs font-semibold text-slate-500 dark:text-dark-400 mt-1">{lead.company}</p>}
            </div>
            
            {/* Lead Score Flame */}
            <div className="flex items-center gap-1 text-xs font-extrabold bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full px-2.5 py-1">
              <Flame className="h-3.5 w-3.5" />
              <span>{lead.score}</span>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-dark-800/60 pt-4 space-y-4">
            
            {/* Inline contact info details */}
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center gap-3 text-slate-650 dark:text-dark-300">
                <Mail className="h-4 w-4 text-slate-400 dark:text-dark-500 shrink-0" />
                <span className="truncate">{lead.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-650 dark:text-dark-300">
                <Phone className="h-4 w-4 text-slate-400 dark:text-dark-500 shrink-0" />
                <span>{lead.phone || 'No phone number'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-650 dark:text-dark-300">
                <Globe className="h-4 w-4 text-slate-400 dark:text-dark-500 shrink-0" />
                {lead.website ? (
                  <a href={lead.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-brand-500 truncate">
                    {lead.website}
                  </a>
                ) : (
                  <span>No website</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-slate-650 dark:text-dark-300">
                <Calendar className="h-4 w-4 text-slate-400 dark:text-dark-500 shrink-0" />
                <span>Created {new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Admin Assignee select */}
            <div className="border-t border-slate-100 dark:border-dark-800/60 pt-4">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-dark-500 mb-2">
                Lead Assignee
              </label>
              {user?.role === 'ADMIN' ? (
                <div className="relative">
                  <User className="absolute inset-y-0 left-3 h-4 w-4 my-auto text-slate-400 dark:text-dark-500" />
                  <select
                    value={lead.assignedToId || ''}
                    onChange={(e) => assignMutation.mutate(e.target.value || null)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-brand-500"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-705 dark:text-dark-300 bg-slate-50 dark:bg-dark-950 px-3 py-2 rounded-lg border border-slate-250/20">
                  <User className="h-4 w-4 text-slate-400 dark:text-dark-500" />
                  <span>{lead.assignedTo?.name || 'Unassigned'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="border-t border-slate-100 dark:border-dark-800/60 pt-4 flex flex-col gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold border border-slate-200 dark:border-dark-800 rounded-lg text-slate-650 dark:text-dark-350 hover:bg-slate-50 dark:hover:bg-dark-800 transition"
            >
              <Edit2 className="h-3.5 w-3.5" />
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>

            {user?.role === 'ADMIN' && (
              <>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to archive this lead?')) {
                      archiveMutation.mutate();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold border border-slate-200 dark:border-dark-800 rounded-lg text-slate-650 dark:text-dark-350 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition"
                >
                  <Archive className="h-3.5 w-3.5" />
                  Archive Lead
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Warning: This action will permanently delete this lead and all history. Proceed?')) {
                      deleteMutation.mutate();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold border border-transparent bg-rose-500/10 rounded-lg text-rose-500 hover:bg-rose-500/20 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Lead
                </button>
              </>
            )}
          </div>
        </div>

        {/* AI Intelligence Workspace Widget Block */}
        <div className="premium-card bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-dark-800 p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-violet-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
              AI CRM Copilot
            </h3>
          </div>

          {/* Score */}
          <div className="border-t border-slate-100 dark:border-dark-800/60 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-450 dark:text-dark-500 uppercase tracking-wider">AI Lead Score</h4>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-violet-650 dark:text-violet-405 font-sans">
                {lead.score}
                <span className="text-xs text-slate-400 dark:text-dark-600">/100</span>
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                lead.score >= 75 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                  : lead.score >= 40
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              }`}>
                {lead.score >= 75 ? 'High Conversion' : lead.score >= 40 ? 'Medium Conversion' : 'Low Conversion'}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-dark-850 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  lead.score >= 75 ? 'bg-emerald-500' : lead.score >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${lead.score}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-450 dark:text-dark-550 leading-relaxed font-semibold">
              {lead.score >= 75 
                ? 'Strong engagement history, complete contact profiles, and referral source points.' 
                : lead.score >= 40
                ? 'Moderate response history, medium priority, and incomplete website data.'
                : 'Low engagement metrics, unassigned details, and cold outreach source.'}
            </p>
          </div>

          {/* AI Summary */}
          <div className="border-t border-slate-100 dark:border-dark-800/60 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-450 dark:text-dark-500 uppercase tracking-wider">AI Lead Summary</h4>
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={isSummaryPending}
                className="text-[10px] font-extrabold text-violet-500 hover:text-violet-650 flex items-center gap-1 cursor-pointer transition disabled:opacity-50 font-sans"
              >
                {isSummaryPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                {leadSummary ? 'Regenerate' : 'Generate'}
              </button>
            </div>
            {leadSummary && (
              <div className="p-3.5 rounded-lg border border-violet-500/30 bg-violet-500/10 text-[11px] leading-relaxed text-slate-800 dark:text-slate-100 font-bold relative group font-sans shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(leadSummary);
                    setIsCopiedSummary(true);
                    setTimeout(() => setIsCopiedSummary(false), 2000);
                    showToast('Summary copied', 'info');
                  }}
                  className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-violet-500/10 rounded"
                >
                  {isCopiedSummary ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                {leadSummary}
              </div>
            )}
          </div>

          {/* AI Next Best Action */}
          <div className="border-t border-slate-100 dark:border-dark-800/60 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-450 dark:text-dark-500 uppercase tracking-wider">AI Next Best Action</h4>
              <button
                type="button"
                onClick={handleFetchNextAction}
                disabled={isActionPending}
                className="text-[10px] font-extrabold text-violet-500 hover:text-violet-650 flex items-center gap-1 cursor-pointer transition disabled:opacity-50 font-sans"
              >
                {isActionPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                {nextAction ? 'Refresh' : 'Predict'}
              </button>
            </div>
            {nextAction && (
              <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-[11px] space-y-1 font-sans">
                <p className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  🎯 {nextAction.action}
                </p>
                <p className="text-[10px] text-slate-700 dark:text-slate-200 font-semibold leading-relaxed">
                  {nextAction.description}
                </p>
              </div>
            )}
          </div>

          {/* AI Email generator */}
          <div className="border-t border-slate-100 dark:border-dark-800/60 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-450 dark:text-dark-500 uppercase tracking-wider">AI Outbound Email</h4>
            <div className="flex gap-2">
              <select
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                className="flex-1 text-[10px] px-2 py-1.5 bg-transparent border border-slate-200 dark:border-dark-800 rounded-lg outline-none cursor-pointer text-slate-800 dark:text-slate-100 font-bold"
              >
                <option value="FIRST_CONTACT" className="bg-white dark:bg-dark-900">First Contact</option>
                <option value="FOLLOW_UP" className="bg-white dark:bg-dark-900">Follow-up</option>
                <option value="PROPOSAL" className="bg-white dark:bg-dark-900">Proposal</option>
                <option value="THANK_YOU" className="bg-white dark:bg-dark-900">Thank You</option>
                <option value="MEETING_REMINDER" className="bg-white dark:bg-dark-900">Meeting Reminder</option>
                <option value="RE_ENGAGEMENT" className="bg-white dark:bg-dark-900">Re-engagement</option>
              </select>
              <button
                type="button"
                onClick={handleComposeEmail}
                disabled={isEmailPending}
                className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-[10px] flex items-center gap-1 transition disabled:opacity-50"
              >
                {isEmailPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
                Compose
              </button>
            </div>
            {generatedEmail && (
              <div className="relative group mt-2">
                <textarea
                  readOnly
                  value={generatedEmail}
                  rows={4}
                  className="w-full p-2.5 text-[10px] font-mono leading-relaxed bg-slate-50 dark:bg-dark-950/40 border border-slate-200 dark:border-dark-800 rounded-lg text-slate-800 dark:text-slate-100 font-semibold outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedEmail);
                    setIsCopiedEmail(true);
                    setTimeout(() => setIsCopiedEmail(false), 2000);
                    showToast('Email copied', 'info');
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-violet-500/10 rounded bg-white dark:bg-dark-900 shadow-sm border border-slate-150 dark:border-dark-800"
                >
                  {isCopiedEmail ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* AI Notes Scribe */}
          <div className="border-t border-slate-100 dark:border-dark-800/60 pt-4 space-y-3 font-sans">
            <h4 className="text-xs font-bold text-slate-450 dark:text-dark-500 uppercase tracking-wider">AI Notes Formatter</h4>
            <textarea
              placeholder="Paste raw notes / meeting scribbles..."
              value={rawMeetingNotes}
              onChange={(e) => setRawMeetingNotes(e.target.value)}
              rows={2}
              className="w-full p-2 text-[10px] bg-transparent border border-slate-200 dark:border-dark-800 rounded-lg text-slate-800 dark:text-slate-100 outline-none"
            />
            <button
              type="button"
              onClick={handleAnalyzeMeetingNotes}
              disabled={isNotesPending}
              className="w-full flex justify-center items-center gap-1 py-1.5 rounded-lg bg-violet-650 hover:bg-violet-750 text-white font-bold text-[10px] transition disabled:opacity-50"
            >
              {isNotesPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ClipboardList className="h-3.5 w-3.5" />}
              Analyze Notes
            </button>
            {parsedMeetingNotes && (
              <div className="p-3 rounded-lg border border-slate-100 dark:border-dark-850 bg-slate-50/50 dark:bg-dark-950/20 text-[10px] space-y-2.5 font-medium leading-relaxed">
                <div>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Brief</p>
                  <p className="text-slate-600 dark:text-dark-350">• {parsedMeetingNotes.summary}</p>
                </div>
                <div>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Actions</p>
                  <ul className="list-disc pl-3 text-slate-600 dark:text-dark-350">
                    {parsedMeetingNotes.actionItems.map((ai: string, idx: number) => (
                      <li key={idx}>{ai}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Follow-up</p>
                  <p className="text-violet-650 dark:text-violet-405 font-bold">⏱️ {parsedMeetingNotes.nextFollowUp}</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

        {/* RIGHT COLUMN: Edit Mode OR Tabbed Activity/Notes thread */}
        <div className="lg:col-span-2 space-y-6">
          {isEditing ? (
            /* EDIT PROFILE FORM PANEL */
            <div className="premium-card bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-dark-800 p-6">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-sans mb-4">Edit Lead Profile</h3>
              
              <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-dark-500 mb-1.5 uppercase tracking-wider">Name *</label>
                    <input type="text" {...register('name')} className="w-full text-xs px-3.5 py-2.5 bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 text-slate-850 dark:text-slate-100 focus:border-brand-500 outline-none transition" />
                    {errors.name && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-dark-500 mb-1.5 uppercase tracking-wider">Email Address *</label>
                    <input type="email" {...register('email')} className="w-full text-xs px-3.5 py-2.5 bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 text-slate-850 dark:text-slate-100 focus:border-brand-500 outline-none transition" />
                    {errors.email && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-dark-500 mb-1.5 uppercase tracking-wider">Phone</label>
                    <input type="text" {...register('phone', { onChange: (e) => { e.target.value = e.target.value.replace(/[^\d]/g, ''); } })} className="w-full text-xs px-3.5 py-2.5 bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 text-slate-850 dark:text-slate-100 focus:border-brand-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-dark-500 mb-1.5 uppercase tracking-wider">Company</label>
                    <input type="text" {...register('company')} className="w-full text-xs px-3.5 py-2.5 bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 text-slate-850 dark:text-slate-100 focus:border-brand-500 outline-none transition" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-dark-500 mb-1.5 uppercase tracking-wider">Website URL</label>
                    <input type="text" {...register('website')} className="w-full text-xs px-3.5 py-2.5 bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 text-slate-850 dark:text-slate-100 focus:border-brand-500 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-dark-500 mb-1.5 uppercase tracking-wider">Industry</label>
                    <input type="text" placeholder="e.g. Technology, Robotics" {...register('industry')} className="w-full text-xs px-3.5 py-2.5 bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 text-slate-850 dark:text-slate-100 focus:border-brand-500 outline-none transition" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-dark-500 mb-1.5 uppercase tracking-wider">Source</label>
                    <select {...register('source')} className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100 focus:border-brand-500 outline-none transition">
                      <option value="WEBSITE">Website</option>
                      <option value="REFERRAL">Referral</option>
                      <option value="LINKEDIN">LinkedIn</option>
                      <option value="COLD_EMAIL">Cold Email</option>
                      <option value="GOOGLE_ADS">Google Ads</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-dark-500 mb-1.5 uppercase tracking-wider">Priority</label>
                    <select {...register('priority')} className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100 focus:border-brand-500 outline-none transition">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-dark-500 mb-1.5 uppercase tracking-wider">Status</label>
                    <select {...register('status')} className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100 focus:border-brand-500 outline-none transition">
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

                <div className="pt-4 flex items-center justify-end gap-2.5">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-dark-800 hover:bg-slate-50 dark:hover:bg-dark-800 rounded-lg text-slate-500 dark:text-dark-400 transition">Cancel</button>
                  <button type="submit" disabled={updateMutation.isPending} className="px-4 py-2 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition">Save Changes</button>
                </div>
              </form>
            </div>
          ) : (
            /* TABBED NOTES & ACTIVITY history thread */
            <div className="premium-card bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-dark-800 rounded-xl overflow-hidden flex flex-col h-[600px] shadow-premium">
              {/* Tab selector header */}
              <div className="flex h-12 border-b border-slate-200/60 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/20 shrink-0">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold border-b-2 transition ${
                    activeTab === 'notes'
                      ? 'border-brand-500 text-brand-500'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-355'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Notes & Discussions ({notes.length})
                </button>
                
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold border-b-2 transition ${
                    activeTab === 'timeline'
                      ? 'border-brand-500 text-brand-500'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-355'
                  }`}
                >
                  <History className="h-4 w-4" />
                  Timeline & Logs ({activities.length})
                </button>
              </div>

              {/* Scrollable feed thread */}
              <div className="flex-1 overflow-y-auto p-5 focus:outline-none min-h-0">
                {activeTab === 'notes' ? (
                  /* NOTES LIST */
                  <div className="space-y-4">
                    {/* Add note input form */}
                    <form onSubmit={handleAddNote} className="flex gap-3 items-start border-b border-slate-100 dark:border-dark-800 pb-5 shrink-0">
                      <div className="flex-1 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl overflow-hidden">
                        <textarea
                          placeholder="Write down some lead interaction notes or follow-up briefs..."
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                          className="w-full text-xs p-3.5 bg-transparent border-none outline-none resize-none h-20 text-slate-800 dark:text-slate-150"
                        />
                        <div className="flex justify-end p-2 bg-slate-100/50 dark:bg-dark-950/80 border-t border-slate-200/50 dark:border-dark-800/40">
                          <button
                            type="submit"
                            disabled={!noteContent.trim() || addNoteMutation.isPending}
                            className="inline-flex justify-center items-center gap-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-3 py-1.5 text-[10px] font-bold disabled:opacity-40 disabled:pointer-events-none transition"
                          >
                            Add Note
                          </button>
                        </div>
                      </div>
                    </form>

                    {/* Notes thread feed */}
                    {notesLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-14 animate-pulse bg-slate-100 dark:bg-dark-800 rounded-lg" />
                        ))}
                      </div>
                    ) : notes.length === 0 ? (
                      <div className="py-16 text-center text-xs text-slate-450 dark:text-dark-500">
                        No notes added for this lead yet. Use form above to add one.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notes.map((note: any) => (
                          <div
                            key={note.id}
                            className="p-3 border border-slate-200/50 dark:border-dark-800/60 rounded-xl bg-slate-50/50 dark:bg-dark-950/20 flex gap-3 items-start group"
                          >
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 dark:bg-dark-800 text-[10px] font-bold text-slate-650 dark:text-dark-400 select-none uppercase shrink-0">
                              {note.author?.name.substring(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline gap-2">
                                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{note.author?.name}</span>
                                <span className="text-[10px] text-slate-400 dark:text-dark-500">{new Date(note.createdAt).toLocaleString()}</span>
                              </div>
                              <p className="text-xs text-slate-650 dark:text-dark-300 leading-relaxed mt-1 whitespace-pre-line">{note.note}</p>
                            </div>
                            
                            {/* Author or Admin delete note control */}
                            {(note.authorId === user?.id || user?.role === 'ADMIN') && (
                              <button
                                onClick={() => deleteNoteMutation.mutate(note.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded shrink-0 transition"
                                title="Delete note"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* TIMELINE AUDIT HISTORY FEED */
                  <div className="relative border-l border-slate-200 dark:border-dark-800/80 pl-6 ml-3 space-y-6">
                    {activityLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-10 animate-pulse bg-slate-100 dark:bg-dark-800 rounded" />
                        ))}
                      </div>
                    ) : activities.length === 0 ? (
                      <div className="py-16 text-center text-xs text-slate-450 dark:text-dark-500">
                        No activity records found
                      </div>
                    ) : (
                      activities.map((log: any) => (
                        <div key={log.id} className="relative">
                          {/* Timeline dot pointer */}
                          <span className="absolute -left-[31px] top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white dark:bg-dark-900 border border-slate-300 dark:border-dark-750 text-[8px] font-bold text-slate-400 dark:text-dark-550 select-none uppercase">
                            {log.action.substring(0, 1)}
                          </span>

                          <div className="text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-200 leading-none">{log.user?.name}</span>{' '}
                            <span className="text-slate-500 dark:text-dark-400">
                              {log.action === 'LEAD_CREATED' && (log.metadata?.isPublicForm ? 'captured lead from public capture form' : 'created lead')}
                              {log.action === 'STATUS_CHANGED' && `changed status from "${log.metadata?.old}" to "${log.metadata?.new}"`}
                              {log.action === 'ASSIGNED' && `assigned lead to ${log.metadata?.assigneeName || 'someone'}`}
                              {log.action === 'PRIORITY_CHANGED' && `updated priority to "${log.metadata?.new || 'updated'}"`}
                              {log.action === 'NOTE_ADDED' && 'added a comment'}
                              {log.action === 'NOTE_DELETED' && 'deleted a comment'}
                            </span>
                            
                            {/* Metadata extra details */}
                            {log.action === 'NOTE_ADDED' && log.metadata?.snippet && (
                              <div className="mt-1.5 p-2 bg-slate-50 dark:bg-dark-950/40 rounded border border-slate-200/50 dark:border-dark-800/40 text-[10px] text-slate-500 dark:text-dark-400 font-medium italic truncate max-w-sm">
                                "{log.metadata.snippet}..."
                              </div>
                            )}

                            <span className="block text-[10px] text-slate-400 dark:text-dark-500 mt-1">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
