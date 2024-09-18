import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';

import '../styles.css';
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const AgentDashboard = lazy(() => import('./pages/AdminDashboard'));
const AgentsPage = lazy(() => import('./pages/AgentsPage'));
import { AuthProvider } from './contexts/AuthContext';
import Loading from './components/Loading';
import AppTitle from './components/AppTitle';
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AppTitle>
            <Suspense fallback={<Loading message="Loading..." />}>
              <Routes>
                <Route path="/" element={<Navigate to={'/login'} />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/agents" element={<AgentsPage />} />
                <Route
                  path="/agents/:agent_name"
                  element={<AgentDashboard />}
                />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Suspense>
          </AppTitle>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
