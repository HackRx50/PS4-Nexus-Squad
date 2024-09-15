import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';

import '../styles.css';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { AuthProvider } from './contexts/AuthContext';
import AgentDashboard from './pages/AgentDashboard';
import AgentsPage from './pages/AgentsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to={"/login"} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path='/agents' element={<AgentsPage />} />
            <Route path='/agents/:agent_name' element={<AgentDashboard />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
