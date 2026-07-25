import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'SALES_MEMBER')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-dark-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-dark-400">Loading LeadFlow CRM...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-6 dark:bg-dark-950">
        <div className="premium-card max-w-md p-8 text-center bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-dark-800">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Access Denied</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-dark-400">
            You do not have the required permissions to view this page. Please contact your system administrator.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 inline-flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
