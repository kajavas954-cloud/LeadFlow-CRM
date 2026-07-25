import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '../services/api.js';
import { useNotification } from '../contexts/NotificationContext.js';
import { 
  Bot, 
  Sparkles, 
  Mail, 
  FileText, 
  Search, 
  MessageSquare, 
  TrendingUp, 
  Copy, 
  Check, 
  Loader2, 
  Send,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AIWorkspace: React.FC = () => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'summary' | 'email' | 'notes' | 'search' | 'chat' | 'insights'>('summary');

  // Fetch all leads for selector dropdowns
  const { data: leads = [] } = useQuery<any[]>({
    queryKey: ['aiWorkspaceLeads'],
    queryFn: () => apiRequest('/leads?limit=100').then((res) => res.data),
  });

  // 1. AI Summary Section States
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [leadSummary, setLeadSummary] = useState('');
  const [isCopiedSummary, setIsCopiedSummary] = useState(false);

  const summaryMutation = useMutation({
    mutationFn: (leadId: string) => 
      apiRequest('/ai/summary', {
        method: 'POST',
        body: JSON.stringify({ leadId }),
      }).then((res) => res.data),
    onSuccess: (data) => {
      setLeadSummary(data);
      showToast('AI Lead Summary generated successfully', 'success');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to generate summary', 'error');
    }
  });

  const handleGenerateSummary = () => {
    if (!selectedLeadId) {
      showToast('Please select a lead first', 'info');
      return;
    }
    summaryMutation.mutate(selectedLeadId);
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(leadSummary);
    setIsCopiedSummary(true);
    setTimeout(() => setIsCopiedSummary(false), 2000);
    showToast('Summary copied to clipboard', 'info');
  };

  // 2. AI Email Generator States
  const [emailLeadName, setEmailLeadName] = useState('');
  const [emailCompany, setEmailCompany] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('FIRST_CONTACT');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isCopiedEmail, setIsCopiedEmail] = useState(false);

  const emailMutation = useMutation({
    mutationFn: () =>
      apiRequest('/ai/email', {
        method: 'POST',
        body: JSON.stringify({
          leadName: emailLeadName,
          company: emailCompany,
          template: emailTemplate,
        }),
      }).then((res) => res.data),
    onSuccess: (data) => {
      setGeneratedEmail(data);
      showToast('Outbound email draft ready', 'success');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to generate email', 'error');
    }
  });

  const handleGenerateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailLeadName) {
      showToast('Lead name is required', 'info');
      return;
    }
    emailMutation.mutate();
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(generatedEmail);
    setIsCopiedEmail(true);
    setTimeout(() => setIsCopiedEmail(false), 2000);
    showToast('Email draft copied to clipboard', 'info');
  };

  // 3. AI Meeting Notes States
  const [rawNotes, setRawNotes] = useState('');
  const [parsedNotes, setParsedNotes] = useState<any>(null);

  const notesMutation = useMutation({
    mutationFn: (notesText: string) =>
      apiRequest('/ai/meeting-notes', {
        method: 'POST',
        body: JSON.stringify({ rawText: notesText }),
      }).then((res) => res.data),
    onSuccess: (data) => {
      setParsedNotes(data);
      showToast('Meeting notes formatted and structured', 'success');
    },
    onError: (err: any) => {
      showToast(err.message || 'Notes processing failed', 'error');
    }
  });

  const handleParseNotes = () => {
    if (!rawNotes.trim()) {
      showToast('Please enter raw meeting transcripts or scribbles', 'info');
      return;
    }
    notesMutation.mutate(rawNotes);
  };

  // 4. AI Natural Search States
  const [searchPrompt, setSearchPrompt] = useState('');
  const [searchedLeadsList, setSearchedLeadsList] = useState<any[]>([]);
  const [parsedFilters, setParsedFilters] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const searchMutation = useMutation({
    mutationFn: (promptText: string) =>
      apiRequest('/ai/natural-search', {
        method: 'POST',
        body: JSON.stringify({ prompt: promptText }),
      }).then((res) => res.data),
    onSuccess: async (filters) => {
      setParsedFilters(filters);
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.source) queryParams.append('source', filters.source);
      
      const res = await apiRequest(`/leads?${queryParams.toString()}&limit=50`);
      if (res.success) {
        setSearchedLeadsList(res.data);
      }
      setHasSearched(true);
      showToast('Search filters extracted successfully', 'success');
    },
    onError: (err: any) => {
      showToast(err.message || 'Search execution failed', 'error');
    }
  });

  const handleNaturalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPrompt.trim()) {
      showToast('Please specify what you are looking for', 'info');
      return;
    }
    searchMutation.mutate(searchPrompt);
  };

  // 5. AI Chat Assistant States
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: '1', role: 'assistant', text: 'Hello! I am your CRM Assistant. How can I help you optimize your sales pipelines today?', time: new Date() }
  ]);
  const [userChatMsg, setUserChatMsg] = useState('');

  const chatMutation = useMutation({
    mutationFn: (msg: string) =>
      apiRequest('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: msg }),
      }).then((res) => res.data),
    onSuccess: (reply) => {
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', text: reply, time: new Date() }
      ]);
    },
    onError: (err: any) => {
      showToast(err.message || 'Chatbot connectivity issue', 'error');
    }
  });

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChatMsg.trim()) return;

    const userMsg = userChatMsg;
    setUserChatMsg('');
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', text: userMsg, time: new Date() }
    ]);

    chatMutation.mutate(userMsg);
  };

  // 6. AI Insights Engine
  const { data: insights = [], isLoading: insightsLoading } = useQuery<string[]>({
    queryKey: ['workspaceInsights'],
    queryFn: () => apiRequest('/ai/insights').then((res) => res.data),
  });

  const tabs = [
    { id: 'summary', label: 'AI Summaries', icon: <Bot className="h-4.5 w-4.5" /> },
    { id: 'email', label: 'Email Drafts', icon: <Mail className="h-4.5 w-4.5" /> },
    { id: 'notes', label: 'Meeting Scribe', icon: <FileText className="h-4.5 w-4.5" /> },
    { id: 'search', label: 'NLP Query', icon: <Search className="h-4.5 w-4.5" /> },
    { id: 'chat', label: 'Sales Assistant', icon: <MessageSquare className="h-4.5 w-4.5" /> },
    { id: 'insights', label: 'Dynamic Insights', icon: <TrendingUp className="h-4.5 w-4.5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 font-sans flex items-center gap-2.5">
          <Bot className="h-8 w-8 text-violet-500 animate-pulse" />
          AI CRM Workspace
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-400 mt-1">
          Harness context-aware algorithms to summarize interactions, draft emails, translate search queries, and automate pipeline workflows
        </p>
      </div>

      {/* Tab Menu Header */}
      <div className="flex border-b border-slate-200 dark:border-dark-800 overflow-x-auto gap-2 pb-0.5 scrollbar-thin">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition duration-200 whitespace-nowrap outline-none ${
              activeTab === tab.id
                ? 'border-violet-500 text-violet-650 dark:text-violet-405 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-dark-400 dark:hover:text-dark-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Block */}
      <div className="min-h-[450px]">
        <AnimatePresence mode="wait">
          {activeTab === 'summary' && (
            <motion.div
              key="summary-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="md:col-span-1 premium-card bg-white dark:bg-dark-900 p-6 border border-slate-200/60 dark:border-dark-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-805 dark:text-slate-200">Generate Lead Summary</h3>
                <p className="text-xs text-slate-450 dark:text-dark-500">
                  Select an active customer opportunity to analyze their communication notes and status.
                </p>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-dark-500">Target Lead</label>
                  <select
                    value={selectedLeadId}
                    onChange={(e) => setSelectedLeadId(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-transparent border border-slate-200 dark:border-dark-800 rounded-lg focus:border-violet-500 outline-none text-slate-800 dark:text-slate-100 font-semibold cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-dark-900 text-slate-405">-- Select Prospect Account --</option>
                    {leads.map((l: any) => (
                      <option key={l.id} value={l.id} className="bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100">
                        {l.name} ({l.company || 'No Company'})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleGenerateSummary}
                  disabled={summaryMutation.isPending}
                  className="w-full flex justify-center items-center gap-2 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-750 text-white font-bold text-xs transition"
                >
                  {summaryMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Synthesize Summary
                </button>
              </div>

              <div className="md:col-span-2 premium-card bg-white dark:bg-dark-900 p-6 border border-slate-200/60 dark:border-dark-800 min-h-[250px] flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Synthesized Interaction Brief</h3>
                  
                  {summaryMutation.isPending ? (
                    <div className="space-y-3 py-6">
                      <div className="h-4 w-3/4 bg-slate-100 dark:bg-dark-850 animate-pulse rounded" />
                      <div className="h-4 w-5/6 bg-slate-100 dark:bg-dark-850 animate-pulse rounded" />
                      <div className="h-4 w-2/3 bg-slate-100 dark:bg-dark-850 animate-pulse rounded" />
                    </div>
                  ) : leadSummary ? (
                    <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-500/10 text-xs leading-relaxed text-slate-800 dark:text-slate-100 font-semibold shadow-sm">
                      {leadSummary}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 dark:text-dark-500">
                      <Sparkles className="h-8 w-8 text-slate-300 dark:text-dark-700 mb-2" />
                      <p>Select a lead and request a summary to load AI intelligence.</p>
                    </div>
                  )}
                </div>

                {leadSummary && !summaryMutation.isPending && (
                  <button
                    onClick={handleCopySummary}
                    className="self-end mt-4 flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-dark-800 text-xs font-bold text-slate-600 dark:text-dark-350 hover:bg-slate-50 dark:hover:bg-dark-950 transition"
                  >
                    {isCopiedSummary ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Summary
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'email' && (
            <motion.div
              key="email-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <form onSubmit={handleGenerateEmail} className="md:col-span-1 premium-card bg-white dark:bg-dark-900 p-6 border border-slate-200/60 dark:border-dark-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-805 dark:text-slate-200">Email Draft parameters</h3>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-dark-500">Lead Contact Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tony Stark"
                    value={emailLeadName}
                    onChange={(e) => setEmailLeadName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-transparent border border-slate-200 dark:border-dark-800 rounded-lg focus:border-violet-500 outline-none text-slate-800 dark:text-slate-100 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-dark-500">Lead Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. Stark Industries"
                    value={emailCompany}
                    onChange={(e) => setEmailCompany(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-transparent border border-slate-200 dark:border-dark-800 rounded-lg focus:border-violet-500 outline-none text-slate-800 dark:text-slate-100 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-dark-500">Target Template</label>
                  <select
                    value={emailTemplate}
                    onChange={(e) => setEmailTemplate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-transparent border border-slate-200 dark:border-dark-800 rounded-lg focus:border-violet-500 outline-none text-slate-800 dark:text-slate-100 font-semibold cursor-pointer"
                  >
                    <option value="FIRST_CONTACT" className="bg-white dark:bg-dark-900">First Contact</option>
                    <option value="FOLLOW_UP" className="bg-white dark:bg-dark-900">Follow-up</option>
                    <option value="PROPOSAL" className="bg-white dark:bg-dark-900">Proposal</option>
                    <option value="THANK_YOU" className="bg-white dark:bg-dark-900">Thank You</option>
                    <option value="MEETING_REMINDER" className="bg-white dark:bg-dark-900">Meeting Reminder</option>
                    <option value="RE_ENGAGEMENT" className="bg-white dark:bg-dark-900">Re-engagement</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={emailMutation.isPending}
                  className="w-full flex justify-center items-center gap-2 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-750 text-white font-bold text-xs transition"
                >
                  {emailMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  Compose Draft
                </button>
              </form>

              <div className="md:col-span-2 premium-card bg-white dark:bg-dark-900 p-6 border border-slate-200/60 dark:border-dark-800 min-h-[300px] flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Outbound Email Editor</h3>

                  {emailMutation.isPending ? (
                    <div className="space-y-3 py-6">
                      <div className="h-4 w-3/4 bg-slate-100 dark:bg-dark-850 animate-pulse rounded" />
                      <div className="h-4 w-5/6 bg-slate-100 dark:bg-dark-850 animate-pulse rounded" />
                      <div className="h-4 w-2/3 bg-slate-100 dark:bg-dark-850 animate-pulse rounded" />
                    </div>
                  ) : generatedEmail ? (
                    <textarea
                      value={generatedEmail}
                      onChange={(e) => setGeneratedEmail(e.target.value)}
                      rows={10}
                      className="w-full p-4 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/40 text-xs font-mono leading-relaxed text-slate-800 dark:text-slate-100 font-medium outline-none focus:border-violet-500 transition"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 dark:text-dark-500">
                      <Mail className="h-8 w-8 text-slate-300 dark:text-dark-700 mb-2" />
                      <p>Enter contact details and click compose to review draft suggestions.</p>
                    </div>
                  )}
                </div>

                {generatedEmail && !emailMutation.isPending && (
                  <button
                    onClick={handleCopyEmail}
                    className="self-end mt-4 flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-dark-800 text-xs font-bold text-slate-600 dark:text-dark-350 hover:bg-slate-50 dark:hover:bg-dark-950 transition"
                  >
                    {isCopiedEmail ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Draft
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div
              key="notes-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="md:col-span-1 premium-card bg-white dark:bg-dark-900 p-6 border border-slate-200/60 dark:border-dark-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-805 dark:text-slate-200">Raw Meeting Transcripts</h3>
                <p className="text-xs text-slate-450 dark:text-dark-500">
                  Paste raw shorthand notes, chat logs, or transcription snippets from Zoom/Teams.
                </p>

                <textarea
                  rows={8}
                  placeholder="e.g. client Acme Corp, bruce wayne was present. they liked the kanban view but wanted pricing details on enterprise. schedule demo next week tuesday at 2 PM. tony agreed to send proposal tomorrow..."
                  value={rawNotes}
                  onChange={(e) => setRawNotes(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-dark-800 bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-violet-500 transition font-medium"
                />

                <button
                  onClick={handleParseNotes}
                  disabled={notesMutation.isPending}
                  className="w-full flex justify-center items-center gap-2 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-750 text-white font-bold text-xs transition"
                >
                  {notesMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  Analyze & Structure
                </button>
              </div>

              <div className="md:col-span-2 premium-card bg-white dark:bg-dark-900 p-6 border border-slate-200/60 dark:border-dark-800 min-h-[300px]">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Structured Meeting Briefing</h3>

                {notesMutation.isPending ? (
                  <div className="space-y-4 py-6">
                    <div className="h-6 w-1/3 bg-slate-100 dark:bg-dark-850 animate-pulse rounded" />
                    <div className="h-4 w-3/4 bg-slate-100 dark:bg-dark-850 animate-pulse rounded" />
                    <div className="h-6 w-1/4 bg-slate-100 dark:bg-dark-850 animate-pulse rounded" />
                    <div className="h-4 w-5/6 bg-slate-100 dark:bg-dark-850 animate-pulse rounded" />
                  </div>
                ) : parsedNotes ? (
                  <div className="space-y-5 text-xs text-slate-800 dark:text-slate-100">
                    
                    {/* Summary */}
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">Summary</h4>
                      <p className="p-3 rounded-lg border border-slate-100 dark:border-dark-850 bg-slate-50/50 dark:bg-dark-950/40 text-slate-800 dark:text-slate-100 font-semibold leading-relaxed">
                        • {parsedNotes.summary}
                      </p>
                    </div>

                    {/* Action Items */}
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">Action Items</h4>
                      <ul className="space-y-1 pl-1">
                        {parsedNotes.actionItems.map((item: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Next Follow Up */}
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">Next Follow-Up</h4>
                      <p className="font-bold text-violet-600 dark:text-violet-400 pl-1">
                        ⏱️ {parsedNotes.nextFollowUp}
                      </p>
                    </div>

                    {/* Decisions */}
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">Important Decisions</h4>
                      <ul className="space-y-1 pl-1">
                        {parsedNotes.decisions.map((dec: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 font-semibold">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                            {dec}
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 dark:text-dark-500">
                    <FileText className="h-8 w-8 text-slate-300 dark:text-dark-700 mb-2" />
                    <p>Analyze meeting scribbles to construct meeting action registers.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div
              key="search-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="premium-card bg-white dark:bg-dark-900 p-6 border border-slate-200/60 dark:border-dark-800">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2.5">AI Natural Language Search</h3>
                
                <form onSubmit={handleNaturalSearch} className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute inset-y-0 left-3.5 h-4.5 w-4.5 my-auto text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Show high-priority leads from LinkedIn, or Find leads in qualified stage..."
                      value={searchPrompt}
                      onChange={(e) => setSearchPrompt(e.target.value)}
                      className="w-full text-xs pl-11 pr-4 py-3 bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 text-slate-800 dark:text-slate-100 outline-none focus:border-violet-500 transition font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searchMutation.isPending}
                    className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-lg bg-violet-650 hover:bg-violet-750 text-white font-bold text-xs shadow-sm transition"
                  >
                    {searchMutation.isPending ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-4.5 w-4.5" />
                    )}
                    Search
                  </button>
                </form>

                <div className="mt-3.5 flex flex-wrap gap-2.5 text-[10px] text-slate-400 dark:text-dark-500 font-bold uppercase tracking-wider items-center">
                  <span>Try:</span>
                  <button onClick={() => setSearchPrompt('Show high-priority leads from LinkedIn')} className="hover:text-violet-500 underline transition cursor-pointer">"high-priority from LinkedIn"</button>
                  <span>•</span>
                  <button onClick={() => setSearchPrompt('Find leads contacted this week')} className="hover:text-violet-500 underline transition cursor-pointer">"contacted this week"</button>
                  <span>•</span>
                  <button onClick={() => setSearchPrompt('Leads in qualified status')} className="hover:text-violet-500 underline transition cursor-pointer">"leads in qualified status"</button>
                </div>
              </div>

              {/* Search results list */}
              {hasSearched && (
                <div className="premium-card bg-white dark:bg-dark-900 p-6 border border-slate-200/60 dark:border-dark-800 space-y-4">
                  
                  {/* Extracted filters info */}
                  {parsedFilters && (
                    <div className="flex items-center gap-3 p-3 bg-violet-500/5 border border-violet-500/10 rounded-lg text-[11px] text-violet-650 dark:text-violet-405 font-bold">
                      <SlidersHorizontal className="h-4.5 w-4.5" />
                      <span>Extracted NLP Filters:</span>
                      <div className="flex gap-2">
                        {Object.entries(parsedFilters).map(([k, v]: any) => (
                          <span key={k} className="px-2 py-0.5 rounded-full bg-violet-500/10 text-[10px]">
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs text-slate-500 dark:text-dark-400">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/20 text-slate-400 dark:text-dark-500 font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Lead Name</th>
                          <th className="py-3 px-4">Company</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Priority</th>
                          <th className="py-3 px-4">Source</th>
                          <th className="py-3 px-4">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-dark-800/60">
                        {searchedLeadsList.map((lead) => (
                          <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-950/10 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-850 dark:text-slate-100">{lead.name}</td>
                            <td className="py-3.5 px-4 font-semibold text-slate-550 dark:text-dark-350">{lead.company || '-'}</td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-slate-100 dark:bg-dark-800/50 text-slate-600 dark:text-dark-350">
                                {lead.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                                lead.priority === 'URGENT' 
                                  ? 'bg-rose-500/10 text-rose-500' 
                                  : lead.priority === 'HIGH'
                                  ? 'bg-amber-500/10 text-amber-500'
                                  : 'bg-blue-500/10 text-blue-550'
                              }`}>
                                {lead.priority}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-[10px] text-slate-400 dark:text-dark-550">{lead.source}</td>
                            <td className="py-3.5 px-4 font-extrabold text-violet-500">{lead.score}/100</td>
                          </tr>
                        ))}
                        {searchedLeadsList.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-dark-500">
                              No prospects matched the extracted search parameters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="premium-card bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-dark-800 h-[500px] flex flex-col overflow-hidden"
            >
              {/* Chat Title header */}
              <div className="p-4 border-b border-slate-100 dark:border-dark-800 flex items-center gap-2.5 bg-slate-50/50 dark:bg-dark-950/20">
                <Bot className="h-5 w-5 text-violet-500" />
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">CRM Interactive Assistant</h3>
                  <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" /> Online & Connected to DB
                  </span>
                </div>
              </div>

              {/* Message scroll container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs shadow-sm space-y-1 ${
                      msg.role === 'user'
                        ? 'bg-violet-600 text-white rounded-br-none'
                        : 'bg-slate-50 dark:bg-dark-950 border border-slate-200/50 dark:border-dark-850 text-slate-750 dark:text-slate-200 rounded-bl-none'
                    }`}>
                      <p className="leading-relaxed whitespace-pre-line font-medium">{msg.text}</p>
                      <span className={`block text-[8px] text-right ${msg.role === 'user' ? 'text-violet-200' : 'text-slate-400 dark:text-dark-550'}`}>
                        {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 dark:bg-dark-950 border border-slate-200/50 dark:border-dark-850 max-w-[80%] rounded-2xl rounded-bl-none p-3.5 text-xs shadow-sm flex items-center gap-2 text-slate-450">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-500" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChat} className="p-3 border-t border-slate-100 dark:border-dark-805 flex items-center gap-2 bg-slate-50/30 dark:bg-dark-950/10">
                <input
                  type="text"
                  placeholder="Ask a CRM question (e.g. How many leads are in Negotiation?)"
                  value={userChatMsg}
                  onChange={(e) => setUserChatMsg(e.target.value)}
                  className="flex-1 text-xs px-3.5 py-2.5 bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 text-slate-800 dark:text-slate-100 outline-none focus:border-violet-500 transition font-medium"
                />
                <button
                  type="submit"
                  disabled={chatMutation.isPending}
                  className="p-2.5 rounded-lg bg-violet-600 hover:bg-violet-750 text-white transition shrink-0"
                >
                  <Send className="h-4.5 w-4.5" />
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="premium-card bg-white dark:bg-dark-900 p-6 border border-slate-200/60 dark:border-dark-800">
                <h3 className="text-sm font-bold text-slate-805 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-violet-500 animate-pulse" />
                  Dynamic AI CRM Insights
                </h3>

                {insightsLoading ? (
                  <div className="space-y-3 py-6">
                    <div className="h-10 bg-slate-50 dark:bg-dark-950 rounded animate-pulse" />
                    <div className="h-10 bg-slate-50 dark:bg-dark-950 rounded animate-pulse" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {insights.map((insight, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl border border-violet-500/20 bg-violet-500/10 text-xs font-semibold leading-relaxed text-slate-800 dark:text-slate-100 flex items-start gap-3 shadow-sm"
                      >
                        <span className="text-sm shrink-0">
                          {insight.startsWith('💡') && '💡'}
                          {insight.startsWith('⚠️') && '⚠️'}
                          {insight.startsWith('📈') && '📈'}
                          {insight.startsWith('⭐') && '⭐'}
                          {insight.startsWith('✅') && '✅'}
                        </span>
                        <div>
                          <p className="font-bold">
                            {insight.replace(/^[💡⚠️📈⭐✅]\s*/, '')}
                          </p>
                        </div>
                      </div>
                    ))}
                    {insights.length === 0 && (
                      <div className="py-12 text-center text-slate-450 dark:text-dark-500">
                        No insights calculated yet. Capture or edit leads to construct statistics.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default AIWorkspace;
