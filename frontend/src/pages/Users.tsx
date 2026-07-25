import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../services/api.js';
import { Users as UsersIcon, Shield, Briefcase, Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const Users: React.FC = () => {
  const [search, setSearch] = useState('');
  const { data: users = [], isLoading } = useQuery<any[]>({
    queryKey: ['usersList'],
    queryFn: () => apiRequest('/users').then((res) => res.data),
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const repCount = users.filter(u => u.role === 'SALES_MEMBER').length;

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
          User Management
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-400 mt-1">
          Review, analyze, and manage active administrator and sales representative accounts
        </p>
      </div>

      {/* Role Summary Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="premium-card bg-white dark:bg-dark-900 p-6 flex items-center justify-between border border-slate-200/60 dark:border-dark-800">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-dark-500">Total Personnel</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans">{users.length}</h3>
          </div>
          <div className="p-3 bg-violet-500/10 text-violet-650 rounded-xl">
            <UsersIcon className="h-6 w-6" />
          </div>
        </div>

        <div className="premium-card bg-white dark:bg-dark-900 p-6 flex items-center justify-between border border-slate-200/60 dark:border-dark-800">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-dark-500">Administrators</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans">{adminCount}</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-650 rounded-xl">
            <Shield className="h-6 w-6" />
          </div>
        </div>

        <div className="premium-card bg-white dark:bg-dark-900 p-6 flex items-center justify-between border border-slate-200/60 dark:border-dark-800">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-dark-500">Sales Representatives</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans">{repCount}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-650 rounded-xl">
            <Briefcase className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Users List Card */}
      <div className="premium-card bg-white dark:bg-dark-900 p-6 border border-slate-200/60 dark:border-dark-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Active Accounts Directory</h3>
          <div className="relative max-w-sm w-full">
            <Search className="absolute inset-y-0 left-3 h-4 w-4 my-auto text-slate-450 dark:text-dark-500" />
            <input
              type="text"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2.5 bg-transparent rounded-lg border border-slate-200 dark:border-dark-800 text-slate-800 dark:text-slate-100 focus:border-violet-500 outline-none transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-slate-500 dark:text-dark-400">
            <thead>
              <tr className="border-b border-slate-100 dark:border-dark-800/80 bg-slate-50/50 dark:bg-dark-950/20 text-slate-400 dark:text-dark-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">System Role</th>
                <th className="py-3.5 px-4">Workspace Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-800/60">
              {filteredUsers.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-950/10 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white font-bold select-none text-xs">
                        {item.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-600 dark:text-dark-350">{item.email}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.role === 'ADMIN' 
                        ? 'bg-violet-500/10 text-violet-500 border-violet-500/20' 
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {item.role === 'ADMIN' ? 'Administrator' : 'Sales Representative'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Now
                    </span>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 dark:text-dark-500">
                    No active users match search query.
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
