import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext.js';
import { ThemeProvider } from './contexts/ThemeContext.js';
import { NotificationProvider } from './contexts/NotificationContext.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { Layout } from './components/Layout.js';

// Page imports
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { Dashboard } from './pages/Dashboard.js';
import { Board } from './pages/Board.js';
import { LeadsList } from './pages/LeadsList.js';
import { LeadDetails } from './pages/LeadDetails.js';
import { Analytics } from './pages/Analytics.js';
import { PublicForm } from './pages/PublicForm.js';
import { Users } from './pages/Users.js';
import { Assignments } from './pages/Assignments.js';
import { ActivityLogs } from './pages/ActivityLogs.js';
import { Settings } from './pages/Settings.js';
import { AIWorkspace } from './pages/AIWorkspace.js';

// Setup TanStack Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes caching
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public guest routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/public-capture" element={<PublicForm />} />

                {/* Secure CRM application routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="board" element={<Board />} />
                  <Route path="leads" element={<LeadsList />} />
                  <Route path="leads/:id" element={<LeadDetails />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="ai-workspace" element={<AIWorkspace />} />
                  
                  {/* Admin Restricted Views */}
                  <Route 
                    path="users" 
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <Users />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="assignments" 
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <Assignments />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="logs" 
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <ActivityLogs />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="settings" 
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <Settings />
                      </ProtectedRoute>
                    } 
                  />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
