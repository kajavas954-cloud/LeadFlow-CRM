import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { apiRequest } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.js';
import { 
  Users, 
  Percent, 
  Flame, 
  BarChart, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  CheckSquare, 
  Mail, 
  Info,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analyticsSummary'],
    queryFn: () => apiRequest('/analytics').then((res) => res.data),
  });

  const { data: recentLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['recentActivityLogs'],
    queryFn: () => apiRequest('/leads/activity').then((res) => res.data).catch(() => []),
  });

  const { data: insights = [] } = useQuery<string[]>({
    queryKey: ['dashboardInsights'],
    queryFn: () => apiRequest('/ai/insights').then((res) => res.data).catch(() => []),
  });

  // Mock Tasks for Sales Reps
  const [tasks, setTasks] = useState([
    { id: '1', text: 'Call Bruce Wayne regarding Gotham proposal', done: false, date: 'Today, 2:00 PM' },
    { id: '2', text: 'Follow up with Acme Corp manufacturing lead', done: true, date: 'Today, 10:30 AM' },
    { id: '3', text: 'Send updated rate sheet to Stark Industries', done: false, date: 'Today, 4:00 PM' },
    { id: '4', text: 'Review new submissions from Cyberdyne Systems', done: false, date: 'Tomorrow' },
  ]);

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  // Mock email status
  const [emailBriefEnabled, setEmailBriefEnabled] = useState(true);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded bg-slate-200 dark:bg-dark-800" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200 dark:bg-dark-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="h-96 lg:col-span-2 animate-pulse rounded-xl bg-slate-200 dark:bg-dark-800" />
          <div className="h-96 animate-pulse rounded-xl bg-slate-200 dark:bg-dark-800" />
        </div>
      </div>
    );
  }

  // Prepping charts data from aggregate values
  const statusChartData = Object.entries(analytics?.statusCounts || {}).map(([key, value]) => ({
    name: key.replace('_', ' ').toLowerCase(),
    value: value as number,
  }));

  const sourceChartData = Object.entries(analytics?.sourceCounts || {}).map(([key, value]) => ({
    name: key.replace('_', ' ').toLowerCase(),
    value: value as number,
  }));

  // Recharts custom colors
  const COLORS = ['#3b5cff', '#00c49f', '#ffbb28', '#ff8042', '#a855f7', '#6366f1', '#ec4899'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 font-sans">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-dark-400 mt-1">
            Real-time pipeline tracking and sales statistics overview
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-dark-500 bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-dark-800 rounded-lg px-3 py-1.5 shadow-sm">
          <Clock className="h-3.5 w-3.5" />
          <span>Last sync: Just now</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Leads */}
        <div className="premium-card bg-white dark:bg-dark-900 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-dark-500">Total Leads</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans">{analytics?.totalLeads}</h3>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
              <TrendingUp className="h-3 w-3" />
              <span>+12% from last week</span>
            </span>
          </div>
          <div className="p-3 bg-brand-500/10 text-brand-500 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="premium-card bg-white dark:bg-dark-900 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-dark-500">Conversion Rate</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans">{analytics?.conversionRate}%</h3>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 dark:text-dark-500">
              <Info className="h-3 w-3 text-slate-350" />
              <span>Total Won / Total Leads</span>
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Percent className="h-6 w-6" />
          </div>
        </div>

        {/* Active Pipeline */}
        <div className="premium-card bg-white dark:bg-dark-900 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-dark-500">Leads in Pipeline</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans">
              {(analytics?.statusCounts?.NEW || 0) + 
               (analytics?.statusCounts?.CONTACTED || 0) + 
               (analytics?.statusCounts?.QUALIFIED || 0) +
               (analytics?.statusCounts?.PROPOSAL_SENT || 0) +
               (analytics?.statusCounts?.NEGOTIATION || 0)}
            </h3>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-brand-500">
              <Flame className="h-3 w-3" />
              <span>Active engagement active</span>
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <BarChart className="h-6 w-6" />
          </div>
        </div>

        {/* Won Leads count */}
        <div className="premium-card bg-white dark:bg-dark-900 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-dark-500">Deals Won</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans">{analytics?.statusCounts?.WON || 0}</h3>
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-500">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>Target quota matches</span>
            </span>
          </div>
          <div className="p-3 bg-violet-500/10 text-violet-500 rounded-xl">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Recharts Analytics Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pipeline Trend Chart */}
        <div className="premium-card bg-white dark:bg-dark-900 p-6 lg:col-span-2">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-sans mb-5">
            Pipeline Distribution
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statusChartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b5cff" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b5cff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <ChartTooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="value" stroke="#3b5cff" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Breakdown */}
        <div className="premium-card bg-white dark:bg-dark-900 p-6">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-sans mb-5">
            Lead Source Share
          </h3>
          <div className="h-72 flex flex-col justify-center items-center">
            {sourceChartData.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-dark-500">No source data available</p>
            ) : (
              <>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {sourceChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        contentStyle={{ 
                          backgroundColor: 'rgba(30, 41, 59, 0.8)', 
                          border: 'none', 
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '11px'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legends */}
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-2">
                  {sourceChartData.map((data, index) => (
                    <div key={data.name} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-dark-400">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="capitalize">{data.name} ({data.value})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* AI Dashboard Insights Panel */}
      {insights && insights.length > 0 && (
        <div className="premium-card bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-dark-800 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-550 animate-pulse" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans uppercase tracking-wider">
              AI Sales Copilot Insights
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className="p-3.5 rounded-xl border border-violet-500/20 bg-violet-500/10 hover:bg-violet-500/20 transition text-xs font-semibold leading-relaxed text-slate-800 dark:text-slate-100 flex items-start gap-2.5 shadow-sm"
              >
                <span className="text-sm shrink-0">
                  {insight.startsWith('💡') && '💡'}
                  {insight.startsWith('⚠️') && '⚠️'}
                  {insight.startsWith('📈') && '📈'}
                  {insight.startsWith('⭐') && '⭐'}
                  {insight.startsWith('✅') && '✅'}
                </span>
                <span>{insight.replace(/^[💡⚠️📈⭐✅]\s*/, '')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Double Column Widget Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Today's Tasks or Admin Console Widget */}
        {isAdmin ? (
          <div className="flex flex-col gap-4 h-[400px]">
            {/* System Console */}
            <div className="premium-card bg-white dark:bg-dark-900 p-4 flex flex-col h-[185px] shrink-0 border border-slate-200/60 dark:border-dark-800">
              <div className="flex items-center gap-2 mb-2.5">
                <ShieldCheck className="h-4 w-4 text-violet-600" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans uppercase tracking-wider">
                  System Console
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-2.5 mb-2.5">
                <div className="p-2 rounded-lg border border-slate-100 dark:border-dark-855 bg-slate-50/50 dark:bg-dark-950/20 text-center">
                  <span className="block text-[8px] uppercase font-bold text-slate-450 dark:text-dark-500">Database</span>
                  <span className="text-[10px] font-extrabold text-emerald-500">Online</span>
                </div>
                <div className="p-2 rounded-lg border border-slate-100 dark:border-dark-855 bg-slate-50/50 dark:bg-dark-950/20 text-center">
                  <span className="block text-[8px] uppercase font-bold text-slate-450 dark:text-dark-500">Mode</span>
                  <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-350">Dev</span>
                </div>
                <div className="p-2 rounded-lg border border-slate-100 dark:border-dark-855 bg-slate-50/50 dark:bg-dark-950/20 text-center">
                  <span className="block text-[8px] uppercase font-bold text-slate-450 dark:text-dark-500">Swagger Docs</span>
                  <span className="text-[10px] font-extrabold text-brand-500">Live</span>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href="http://localhost:5000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-slate-200/60 dark:border-dark-800 text-[10px] font-bold text-slate-750 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-850 hover:border-violet-500 dark:hover:border-violet-500 transition"
                >
                  <span>API Docs</span>
                  <ArrowUpRight className="h-3 w-3 text-slate-400" />
                </a>
                <Link
                  to="/public-capture"
                  target="_blank"
                  className="flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-slate-200/60 dark:border-dark-800 text-[10px] font-bold text-slate-750 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-850 hover:border-violet-500 dark:hover:border-violet-500 transition"
                >
                  <span>Public Form</span>
                  <ArrowUpRight className="h-3 w-3 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Today's Tasks */}
            <div className="premium-card bg-white dark:bg-dark-900 p-4 flex flex-col flex-1 min-h-0 border border-slate-200/60 dark:border-dark-800">
              <div className="flex items-center justify-between mb-2.5 shrink-0">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-brand-500" />
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans uppercase tracking-wider">
                    Representative Tasks
                  </h3>
                </div>
                <span className="text-[9px] font-bold bg-brand-500/10 text-brand-500 px-1.5 py-0.5 rounded-full">
                  {tasks.filter(t => !t.done).length} Rem.
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                {tasks.map((task) => (
                  <div 
                    key={task.id} 
                    onClick={() => toggleTask(task.id)}
                    className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition select-none ${
                      task.done 
                        ? 'bg-slate-50/50 dark:bg-dark-950/20 border-slate-100 dark:border-dark-800/40 text-slate-450 dark:text-dark-600 line-through' 
                        : 'bg-slate-50 dark:bg-dark-950 border-slate-200/50 dark:border-dark-800/60 hover:border-slate-350 dark:hover:border-dark-700 text-slate-750 dark:text-slate-200'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={task.done} 
                      onChange={() => {}}
                      className="mt-0.5 h-3 w-3 text-brand-500 border-slate-300 dark:border-dark-800 rounded focus:ring-brand-500/20 pointer-events-none"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold leading-snug truncate">{task.text}</p>
                      <span className="text-[9px] text-slate-400 dark:text-dark-500 block mt-0.5">{task.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="premium-card bg-white dark:bg-dark-900 p-6 flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-brand-500" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-sans">
                  Today's Tasks
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-brand-500/10 text-brand-500 px-2 py-0.5 rounded-full">
                {tasks.filter(t => !t.done).length} Remaining
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition select-none ${
                    task.done 
                      ? 'bg-slate-50/50 dark:bg-dark-950/20 border-slate-100 dark:border-dark-800/40 text-slate-400 dark:text-dark-600 line-through' 
                      : 'bg-slate-50 dark:bg-dark-950 border-slate-200/50 dark:border-dark-800/60 hover:border-slate-350 dark:hover:border-dark-700 text-slate-750 dark:text-slate-200'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={task.done} 
                    onChange={() => {}} // handled by click
                    className="mt-0.5 h-3.5 w-3.5 text-brand-500 border-slate-300 dark:border-dark-800 rounded focus:ring-brand-500/20 pointer-events-none"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-semibold leading-relaxed">{task.text}</p>
                    <span className="text-[10px] text-slate-400 dark:text-dark-500 mt-1 block">{task.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Audit Timeline Widget */}
        <div className="premium-card bg-white dark:bg-dark-900 p-6 flex flex-col h-[400px]">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-brand-500" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-sans">
              Recent Activity Audit
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {logsLoading ? (
              <div className="space-y-3 py-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 animate-pulse bg-slate-100 dark:bg-dark-800 rounded" />
                ))}
              </div>
            ) : recentLogs && recentLogs.length > 0 ? (
              recentLogs.map((log: any) => (
                <div key={log.id} className="relative flex gap-3 text-xs leading-relaxed">
                  {/* Icon indicator */}
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-150 dark:bg-dark-850 text-slate-500 dark:text-dark-400 text-[10px] font-bold">
                    {log.action.substring(0, 1)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 hover:underline cursor-pointer">
                      {log.user?.name}
                    </span>{' '}
                    <span className="text-slate-500 dark:text-dark-400">
                      {log.action === 'LEAD_CREATED' && `created lead "${log.lead?.name}"`}
                      {log.action === 'STATUS_CHANGED' && `changed status of "${log.lead?.name}" to "${log.metadata?.new}"`}
                      {log.action === 'ASSIGNED' && `assigned "${log.lead?.name}" to ${log.metadata?.assigneeName || 'someone'}`}
                      {log.action === 'NOTE_ADDED' && `added a note to "${log.lead?.name}"`}
                      {log.action === 'NOTE_DELETED' && `removed a note from "${log.lead?.name}"`}
                      {log.action === 'PRIORITY_CHANGED' && `changed priority of "${log.lead?.name}"`}
                    </span>
                    <span className="block text-[10px] text-slate-400 dark:text-dark-500 mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.lead?.company || 'No Company'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-dark-500 py-24">
                No recent activity recorded
              </div>
            )}
          </div>
        </div>

        {/* Email Reminders (Mocked) Widget & Leaderboard */}
        <div className="space-y-6 flex flex-col h-[400px]">
          {/* Top Reps Leaderboard */}
          <div className="premium-card bg-white dark:bg-dark-900 p-6 flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-sans mb-3">
              Leaderboard (Top Performers)
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3">
              {analytics?.topPerformers && analytics.topPerformers.length > 0 ? (
                analytics.topPerformers.map((rep: any, idx: number) => (
                  <div key={rep.userId} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50/50 dark:bg-dark-950/20 border border-slate-100/50 dark:border-dark-800/40">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white font-bold text-[10px]">
                        {idx + 1}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">{rep.userName}</span>
                    </div>
                    <div className="text-right text-slate-500 dark:text-dark-400 font-medium">
                      <span className="text-brand-500 font-bold">{rep.wonCount} won</span> / {rep.totalAssigned} deals
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-dark-500 py-12">
                  No won deals recorded yet
                </div>
              )}
            </div>
          </div>

          {/* Email Reminders Toggle Widget */}
          <div className="premium-card bg-white dark:bg-dark-900 p-6 flex flex-col shrink-0">
            <div className="flex items-center gap-2.5 mb-2">
              <Mail className="h-5 w-5 text-brand-500" />
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Email Reminders (Mocked)</h4>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500 dark:text-dark-400 mb-3.5">
              Receive daily brief emails with assigned lead counts, conversions, and today's tasks.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-650 dark:text-slate-350">Daily Sales Briefing</span>
              <button 
                onClick={() => setEmailBriefEnabled(!emailBriefEnabled)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                  emailBriefEnabled ? 'bg-brand-500' : 'bg-slate-200 dark:bg-dark-800'
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                  emailBriefEnabled ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
