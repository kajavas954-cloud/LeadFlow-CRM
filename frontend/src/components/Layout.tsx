import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { useTheme } from '../contexts/ThemeContext.js';
import { CommandPalette } from './CommandPalette.js';
import { 
  LayoutDashboard, 
  Kanban, 
  ListFilter, 
  BarChart3, 
  LogOut, 
  Sun, 
  Moon, 
  Search, 
  Menu, 
  X,
  Sparkles,
  Command,
  PlusSquare,
  Users,
  UserCheck,
  History,
  Settings,
  Bot
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Global keybindings
  useEffect(() => {
    let lastKey = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle command palette: Ctrl + K or Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }

      // Sequential shortcuts (e.g. g then d)
      const currentKey = e.key.toLowerCase();
      if (lastKey === 'g') {
        const isAdminUser = user?.role === 'ADMIN';
        if (currentKey === 'd') {
          e.preventDefault();
          navigate('/dashboard');
        } else if (currentKey === 'b') {
          e.preventDefault();
          navigate('/board');
        } else if (currentKey === 'l') {
          e.preventDefault();
          navigate('/leads');
        } else if (currentKey === 'a') {
          e.preventDefault();
          navigate('/analytics');
        } else if (currentKey === 'u' && isAdminUser) {
          e.preventDefault();
          navigate('/users');
        } else if (currentKey === 's' && isAdminUser) {
          e.preventDefault();
          navigate('/assignments');
        } else if (currentKey === 'h' && isAdminUser) {
          e.preventDefault();
          navigate('/logs');
        } else if (currentKey === 'c' && isAdminUser) {
          e.preventDefault();
          navigate('/settings');
        }
        lastKey = '';
        return;
      }

      if (currentKey === 'g') {
        lastKey = 'g';
        // Clear sequence after 1 second if no key follows
        setTimeout(() => { lastKey = ''; }, 1000);
      }

      // Single key shortcut for theme toggle when not typing
      const activeElement = document.activeElement?.tagName.toLowerCase();
      if (activeElement !== 'input' && activeElement !== 'textarea') {
        if (currentKey === 't') {
          e.preventDefault();
          toggleTheme();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, toggleTheme, user]);

  const isAdmin = user?.role === 'ADMIN';

  const navItems = isAdmin
    ? [
        { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
        { label: 'Lead Pipeline (Kanban)', path: '/board', icon: <Kanban className="h-5 w-5" /> },
        { label: 'Leads', path: '/leads', icon: <ListFilter className="h-5 w-5" /> },
        { label: 'AI Workspace', path: '/ai-workspace', icon: <Bot className="h-5 w-5" /> },
        { label: 'Capture Lead', path: '/public-capture', icon: <PlusSquare className="h-5 w-5" />, external: true },
        { label: 'Users', path: '/users', icon: <Users className="h-5 w-5" /> },
        { label: 'Assignments', path: '/assignments', icon: <UserCheck className="h-5 w-5" /> },
        { label: 'Analytics', path: '/analytics', icon: <BarChart3 className="h-5 w-5" /> },
        { label: 'Activity Logs', path: '/logs', icon: <History className="h-5 w-5" /> },
        { label: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
      ]
    : [
        { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
        { label: 'Lead Pipeline (Kanban)', path: '/board', icon: <Kanban className="h-5 w-5" /> },
        { label: 'Leads', path: '/leads', icon: <ListFilter className="h-5 w-5" /> },
        { label: 'AI Workspace', path: '/ai-workspace', icon: <Bot className="h-5 w-5" /> },
        { label: 'Analytics', path: '/analytics', icon: <BarChart3 className="h-5 w-5" /> },
      ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-dark-950">
      
      {/* Mobile Sidebar Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col bg-white dark:bg-dark-900 border-r border-slate-200/60 dark:border-dark-800 transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/60 dark:border-dark-800">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isAdmin ? 'bg-violet-600' : 'bg-brand-500'} text-white font-semibold shadow-md`}>
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold font-sans tracking-tight text-slate-800 dark:text-slate-100">
              LeadFlow <span className={`${isAdmin ? 'text-violet-600' : 'text-brand-500'} font-semibold`}>CRM</span>
            </span>
          </Link>
          <button 
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workspace Console Header Indicator */}
        <div className="px-6 pt-4 pb-1">
          <span className={`text-[9px] font-extrabold tracking-widest uppercase ${isAdmin ? 'text-violet-500 dark:text-violet-400' : 'text-brand-500 dark:text-brand-400'} block`}>
            {isAdmin ? '🛡️ Administrator Console' : '💼 Sales Workspace'}
          </span>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto pt-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            if ('external' in item && item.external) {
              return (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-dark-300 hover:bg-slate-100/70 dark:hover:bg-dark-800/60 transition-all duration-200"
                >
                  <span className="text-slate-400 dark:text-dark-500">{item.icon}</span>
                  {item.label}
                </a>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? isAdmin
                      ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400'
                      : 'bg-brand-50 dark:bg-brand-500/10 text-brand-500 dark:text-brand-400' 
                    : 'text-slate-600 dark:text-dark-300 hover:bg-slate-100/70 dark:hover:bg-dark-800/60'
                }`}
              >
                <span className={isActive ? (isAdmin ? 'text-violet-600 dark:text-violet-400' : 'text-brand-500 dark:text-brand-400') : 'text-slate-400 dark:text-dark-500'}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer - Profile & Logout */}
        <div className="border-t border-slate-200/60 dark:border-dark-800 p-4">
          <div className="flex items-center gap-3 px-2 py-3 rounded-lg bg-slate-50 dark:bg-dark-950 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 dark:bg-dark-800 text-slate-600 dark:text-slate-300 font-bold uppercase select-none text-sm border border-slate-300 dark:border-dark-700">
              {user?.name.substring(0, 2)}
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">{user?.name}</h4>
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-dark-500 tracking-wider">
                {user?.role === 'ADMIN' ? 'Administrator' : 'Sales Representative'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 text-xs font-bold text-slate-500 dark:text-dark-400 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-dark-800 dark:hover:text-slate-200 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full min-w-0">
        
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200/60 dark:border-dark-800 bg-white dark:bg-dark-900 px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-800 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Ctrl+K Search helper button */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-dark-800 hover:border-slate-300 dark:hover:border-dark-700 text-xs text-slate-400 dark:text-dark-500 hover:text-slate-600 transition"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search or type command...</span>
              <kbd className="inline-flex items-center gap-0.5 rounded bg-slate-100 dark:bg-dark-800 px-1.5 py-0.2 text-[9px] font-mono border border-slate-200 dark:border-dark-750">
                <Command className="h-2 w-2" />K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200/60 dark:border-dark-800 bg-white dark:bg-dark-900 text-slate-600 dark:text-dark-400 hover:bg-slate-50 dark:hover:bg-dark-800 transition"
              title="Toggle theme (Shortcut: T)"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
            
            {/* External link to capture form */}
            <Link
              to="/public-capture"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-dashed border-brand-300 dark:border-brand-800/80 bg-brand-50/20 dark:bg-brand-500/5 px-4 py-2 text-xs font-bold text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition"
            >
              Open Lead Capture Form
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-6 focus:outline-none">
          <Outlet />
        </main>
      </div>

      {/* Command Palette Menu overlay */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />

    </div>
  );
};
