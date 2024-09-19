import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';

import '../styles.css';
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const AgentsPage = lazy(() => import('./pages/AgentsSetupPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AgentsList = lazy(() => import('./components/AgentsList'));
const APIKeysPage = lazy(() => import('./pages/APIKeysPage'));
const SendVerifyEmailPage = lazy(() => import('./pages/SendVerifyEmailPage'));

import { AuthProvider } from './contexts/AuthContext';
import Loading from './components/Loading';
import AppTitle from './components/AppTitle';
import AuthActionPage from './pages/AuthActionPage';
import AnalyticsPage from './pages/AnalyticsPage';
import UserProfile from './pages/UserProfile';
import NotFoundPage from './pages/404NotFound';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AppTitle>
            <Suspense fallback={<Loading message="Loading..." />}>
              <Routes>
                <Route path="/" Component={AdminDashboard}>
                  <Route path="/" Component={UserProfile} />
                  <Route path="/agents" Component={AgentsList} />
                  <Route path="/apikeys" Component={APIKeysPage} />
                  <Route path="/analytics" Component={AnalyticsPage} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route path="/auth/action" element={<AuthActionPage />} />
                <Route path="/verify-email" element={<SendVerifyEmailPage />} />
                <Route
                  path="/agents/:agent_name"
                  element={<AgentsPage />}
                />
                <Route path='/error' Component={NotFoundPage} />
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
