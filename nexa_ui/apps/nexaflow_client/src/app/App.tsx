import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import Conversation from "./pages/Conversation";
import HomePage from "./pages/HomePage";
import { createId } from "@paralleldrive/cuid2";

import "../styles.css";
import AuthenticatePage from "./pages/AuthenticatePage";
import { useEffect } from "react";

function App() {
  
  
  useEffect(() => {
    console.log("Domain:", process.env.DOMAIN)
  }, [])

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthenticatePage />} />
          <Route path="/chat/:session_id" element={<Conversation />} />
          <Route path="/chat" element={<Conversation />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
