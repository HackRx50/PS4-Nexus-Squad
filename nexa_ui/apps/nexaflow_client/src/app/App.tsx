import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import Conversation from "./pages/Conversation";
import CodeEditor from "./pages/CodeEditor";
import HomePage from "./pages/HomePage";
import { createId } from "@paralleldrive/cuid2";

import "../styles.css";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat/:session_id" element={<Conversation />} />
          <Route path="/chat" element={<Navigate to={`/chat/${createId()}`} />} />
          <Route path="/actions" element={<CodeEditor />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
