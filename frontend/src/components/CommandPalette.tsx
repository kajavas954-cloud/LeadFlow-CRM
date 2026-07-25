import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  LayoutDashboard, 
  Kanban, 
  ListFilter, 
  BarChart3, 
  Moon, 
  Sun, 
  LogOut, 
  ArrowRight, 
  UserPlus, 
  Users, 
  UserCheck, 
  History, 
  Settings,
  PlusSquare
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { apiRequest } from '../services/api.js';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  icon: React.ReactNode;
  label: string;
  category: string;
  action: () => void;
  shortcut?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [searchedLeads, setSearchedLeads] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { toggleTheme, theme } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Search leads when query is entered
  useEffect(() => {
    if (!query.trim()) {
      setSearchedLeads([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await apiRequest(`/leads?search=${encodeURIComponent(query)}&limit=5`);
        if (response.success) {
          setSearchedLeads(response.data);
        }
      } catch (error) {
        console.error('Command palette search error:', error);
      }
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Commands list
  const baseCommands: CommandItem[] = [
    {
      category: 'Navigation',
      icon: <LayoutDashboard className="h-4 w-4" />,
      label: 'Go to Dashboard',
      action: () => { navigate('/dashboard'); onClose(); },
      shortcut: 'G D'
    },
    {
      category: 'Navigation',
      icon: <Kanban className="h-4 w-4" />,
      label: 'Go to Kanban Board',
      action: () => { navigate('/board'); onClose(); },
      shortcut: 'G B'
    },
    {
      category: 'Navigation',
      icon: <ListFilter className="h-4 w-4" />,
      label: 'Go to Leads List',
      action: () => { navigate('/leads'); onClose(); },
      shortcut: 'G L'
    },
    {
      category: 'Navigation',
      icon: <BarChart3 className="h-4 w-4" />,
      label: 'Go to Analytics',
      action: () => { navigate('/analytics'); onClose(); },
      shortcut: 'G A'
    },
    {
      category: 'Preferences',
      icon: theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      action: () => { toggleTheme(); onClose(); },
      shortcut: 'T'
    },
    {
      category: 'Account',
      icon: <LogOut className="h-4 w-4" />,
      label: 'Logout Session',
      action: () => { logout(); onClose(); }
    }
  ];

  if (user?.role === 'ADMIN') {
    baseCommands.push(
      {
        category: 'Navigation',
        icon: <Users className="h-4 w-4" />,
        label: 'Go to Users Management',
        action: () => { navigate('/users'); onClose(); },
        shortcut: 'G U'
      },
      {
        category: 'Navigation',
        icon: <UserCheck className="h-4 w-4" />,
        label: 'Go to Lead Assignments',
        action: () => { navigate('/assignments'); onClose(); },
        shortcut: 'G S'
      },
      {
        category: 'Navigation',
        icon: <History className="h-4 w-4" />,
        label: 'Go to Activity Logs',
        action: () => { navigate('/logs'); onClose(); },
        shortcut: 'G H'
      },
      {
        category: 'Navigation',
        icon: <Settings className="h-4 w-4" />,
        label: 'Go to CRM Settings',
        action: () => { navigate('/settings'); onClose(); },
        shortcut: 'G C'
      },
      {
        category: 'Actions',
        icon: <PlusSquare className="h-4 w-4 text-violet-500" />,
        label: 'Open Public Lead Capture Form',
        action: () => { window.open('/public-capture', '_blank'); onClose(); }
      }
    );
  } else {
    baseCommands.unshift({
      category: 'Actions',
      icon: <UserPlus className="h-4 w-4 text-brand-500" />,
      label: 'Create New Lead',
      action: () => { navigate('/leads?create=true'); onClose(); },
      shortcut: 'N'
    });
  }

  // Filter commands by query
  const filteredCommands = query.trim()
    ? baseCommands.filter((cmd) => cmd.label.toLowerCase().includes(query.toLowerCase()))
    : baseCommands;

  // Combine commands and lead search results
  const itemsCount = filteredCommands.length + searchedLeads.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % itemsCount);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + itemsCount) % itemsCount);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < filteredCommands.length) {
        filteredCommands[selectedIndex].action();
      } else {
        const lead = searchedLeads[selectedIndex - filteredCommands.length];
        navigate(`/leads/${lead.id}`);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4">
        {/* Backdrop blur overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
        />

        {/* Command Menu Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -10 }}
          className="relative max-w-xl w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[450px]"
          onKeyDown={handleKeyDown}
        >
          {/* Search bar */}
          <div className="flex items-center gap-3 px-4 border-b border-slate-200 dark:border-dark-800">
            <Search className="h-5 w-5 text-slate-400 dark:text-dark-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search actions or leads..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
              className="w-full py-4 text-slate-800 dark:text-slate-100 bg-transparent outline-none text-base placeholder-slate-400 dark:placeholder-dark-500"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 select-none rounded border border-slate-200 dark:border-dark-800 bg-slate-100 dark:bg-dark-800 px-2 py-0.5 text-xs text-slate-400 dark:text-dark-500 font-mono">
              ESC
            </kbd>
          </div>

          {/* Results list */}
          <div className="flex-1 overflow-y-auto p-2">
            {itemsCount === 0 && (
              <div className="py-12 text-center text-sm text-slate-500 dark:text-dark-400">
                No matching actions or leads found.
              </div>
            )}

            {/* Render actions */}
            {filteredCommands.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-dark-500 uppercase tracking-wider">
                  Quick Actions
                </div>
                {filteredCommands.map((cmd, index) => {
                  const isActive = index === selectedIndex;
                  return (
                    <button
                      key={cmd.label}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                        isActive
                          ? 'bg-slate-100 dark:bg-dark-800 text-brand-500 dark:text-slate-100'
                          : 'text-slate-600 dark:text-dark-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`${isActive ? 'text-brand-500 dark:text-slate-200' : 'text-slate-400 dark:text-dark-500'}`}>
                          {cmd.icon}
                        </span>
                        <span className="font-medium">{cmd.label}</span>
                      </div>
                      {cmd.shortcut && (
                        <span className="text-[10px] font-mono border border-slate-200 dark:border-dark-800 px-1.5 py-0.5 rounded bg-slate-50 dark:bg-dark-900 text-slate-400 dark:text-dark-500">
                          {cmd.shortcut}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Render leads */}
            {searchedLeads.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-dark-500 uppercase tracking-wider">
                  Matching Leads
                </div>
                {searchedLeads.map((lead, idx) => {
                  const actualIdx = filteredCommands.length + idx;
                  const isActive = actualIdx === selectedIndex;
                  return (
                    <button
                      key={lead.id}
                      onClick={() => { navigate(`/leads/${lead.id}`); onClose(); }}
                      onMouseEnter={() => setSelectedIndex(actualIdx)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                        isActive
                          ? 'bg-slate-100 dark:bg-dark-800 text-brand-500 dark:text-slate-100'
                          : 'text-slate-600 dark:text-dark-300'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{lead.name}</span>
                        <span className="text-xs text-slate-400 dark:text-dark-500">
                          {lead.company || 'No Company'} • {lead.email}
                        </span>
                      </div>
                      <ArrowRight className={`h-4 w-4 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'} transition-all text-brand-500`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
