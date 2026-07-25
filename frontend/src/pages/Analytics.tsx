import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { apiRequest } from '../services/api.js';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, Sparkles, Award, PieChart as PieIcon, Loader2 } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analyticsSummary'],
    queryFn: () => apiRequest('/analytics').then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-dark-950">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
      </div>
    );
  }

  // Prep Charts Data
  const statusData = Object.entries(analytics?.statusCounts || {}).map(([key, value]) => ({
    name: key.replace('_', ' ').toLowerCase(),
    value: value as number,
  }));

  const sourceData = Object.entries(analytics?.sourceCounts || {}).map(([key, value]) => ({
    name: key.replace('_', ' ').toLowerCase(),
    value: value as number,
  }));

  const priorityData = Object.entries(analytics?.priorityCounts || {}).map(([key, value]) => ({
    name: key.replace('_', ' ').toLowerCase(),
    value: value as number,
  }));

  const COLORS = ['#3b5cff', '#00c49f', '#ffbb28', '#ff8042', '#a855f7', '#6366f1', '#ec4899'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 font-sans">
          Analytics & Insights
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-400 mt-1">
          Perform statistical breakdowns of your pipeline distribution, sales performance, and lead origins
        </p>
      </div>

      {/* KPI Stats rows */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="premium-card bg-white dark:bg-dark-900 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-dark-500">Sales Conversion</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans">{analytics?.conversionRate}%</h3>
            <p className="text-[10px] text-slate-500 dark:text-dark-400 leading-relaxed">Percentage of leads closed won</p>
          </div>
          <div className="p-3 bg-brand-500/10 text-brand-500 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="premium-card bg-white dark:bg-dark-900 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-dark-500">Pipeline Velocity</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans">High</h3>
            <p className="text-[10px] text-slate-500 dark:text-dark-400 leading-relaxed">Average lead-to-won closure times</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>

        <div className="premium-card bg-white dark:bg-dark-900 p-6 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-dark-500">Active Opportunities</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans">{analytics?.totalLeads}</h3>
            <p className="text-[10px] text-slate-500 dark:text-dark-400 leading-relaxed">Total active accounts in system</p>
          </div>
          <div className="p-3 bg-violet-500/10 text-violet-500 rounded-xl">
            <BarChart3 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main double column charts layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pipeline Stage count Bar Chart */}
        <div className="premium-card bg-white dark:bg-dark-900 p-6">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-sans mb-5 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-brand-500" />
            Leads Count by Status Stage
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
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
                <Bar dataKey="value" fill="#3b5cff" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Breakdown Pie Chart */}
        <div className="premium-card bg-white dark:bg-dark-900 p-6">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-sans mb-5 flex items-center gap-2">
            <PieIcon className="h-5 w-5 text-emerald-500" />
            Lead Origins Breakdown
          </h3>
          <div className="h-72 flex items-center justify-center">
            {sourceData.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-dark-500">No data records available</p>
            ) : (
              <div className="h-full w-full flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="h-48 w-48 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {sourceData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Labels */}
                <div className="flex-1 space-y-2">
                  {sourceData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-xs border-b border-slate-50 dark:border-dark-950 pb-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="capitalize text-slate-700 dark:text-dark-300 font-medium">{entry.name}</span>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{entry.value} leads</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Leaderboard and Priority breakdowns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top sales performers leaderboard list */}
        <div className="premium-card bg-white dark:bg-dark-900 p-6 lg:col-span-2 flex flex-col h-[350px]">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-sans mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-violet-500" />
            Top Sales Representatives Leaderboard
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3">
            {analytics?.topPerformers && analytics.topPerformers.length > 0 ? (
              analytics.topPerformers.map((rep: any, idx: number) => (
                <div key={rep.userId} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/50 dark:border-dark-800/60 bg-slate-50/50 dark:bg-dark-950/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white font-extrabold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-150 leading-tight">{rep.userName}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-dark-500 mt-0.5">Active assigned leads: {rep.totalAssigned}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-brand-500">{rep.wonCount} won deals</span>
                    <span className="block text-[10px] text-slate-400 dark:text-dark-500 mt-0.5">Quota met successfully</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-450 dark:text-dark-500 py-16">
                No performance data recorded yet. Close won deals to update.
              </div>
            )}
          </div>
        </div>

        {/* Priority breakdown radial list */}
        <div className="premium-card bg-white dark:bg-dark-900 p-6 flex flex-col h-[350px]">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-sans mb-4">
            Leads Count by Priority
          </h3>
          <div className="flex-1 overflow-y-auto space-y-4">
            {priorityData.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-dark-500 py-16 text-center">No priority details</p>
            ) : (
              priorityData.map((data) => (
                <div key={data.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-dark-350">
                    <span className="capitalize">{data.name}</span>
                    <span>{data.value} leads</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-dark-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${analytics?.totalLeads > 0 ? (data.value / analytics.totalLeads) * 100 : 0}%`,
                        backgroundColor: data.name === 'urgent' ? '#f43f5e' : data.name === 'high' ? '#f59e0b' : data.name === 'medium' ? '#3b5cff' : '#64748b'
                      }} 
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
