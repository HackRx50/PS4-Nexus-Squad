import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import Conversation from "./pages/Conversation";
import CodeEditor from "./pages/CodeEditor";
import HomePage from "./pages/HomePage";

import "../styles.css";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat/:agent_id" element={<Conversation />} />
          <Route path="/chat" element={<Conversation />} />
          <Route path="/actions" element={<CodeEditor />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
