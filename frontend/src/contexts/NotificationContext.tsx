import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showToast: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: NotificationType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}

      {/* Toast rendering portal container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`p-4 rounded-lg shadow-lg flex items-start gap-3 pointer-events-auto border backdrop-blur-md ${
                toast.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                  : toast.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
                  : 'bg-brand-500/10 border-brand-500/20 text-brand-800 dark:text-brand-300'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-500" />}
                {toast.type === 'info' && <Info className="h-5 w-5 text-brand-500" />}
              </div>
              <div className="flex-1 text-sm font-medium">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-0.5 rounded hover:bg-slate-200/50 dark:hover:bg-dark-800/50 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
