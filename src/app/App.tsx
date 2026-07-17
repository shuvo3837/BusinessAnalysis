import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { BusinessProvider, useBusiness } from "../context/BusinessContext";

import LandingPage from "../components/common/LandingPage";
import AuthScreen from "../components/common/AuthScreen";
import Dashboard from "../components/dashboard/Dashboard";
import DataUpload from "../components/inventory/DataUpload";
import Analytics from "../components/analytics/Analytics";
import MarketInsights from "../components/reports/MarketInsights";
import CustomerBehavior from "../components/analytics/CustomerBehavior";
import ChatAssistant from "../components/ai/ChatAssistant";
import Settings from "../components/common/Settings";
import NoteScanner from "../components/inventory/NoteScanner";
import Sidebar from "../components/common/Sidebar";
import FloatingChatAssistant from "../components/ai/FloatingChatAssistant";

import { LogOut, Target } from "lucide-react";

// Ensure the App content is correctly arranged
function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { customAnalytics, setCustomAnalytics } = useBusiness();
  const location = useLocation();

  useEffect(() => {
    const savedToken = localStorage.getItem("partner_token");
    const savedUser = localStorage.getItem("partner_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const triggerDataRefresh = () => setRefreshTrigger((prev) => prev + 1);

  if (!isAuthenticated && location.pathname !== "/login") {
     return <LandingPage onLoginClick={() => window.location.href='/login'} />
  }

  if (!isAuthenticated && location.pathname === "/login") {
     return <AuthScreen onSuccess={(t) => {
        setToken(t);
        const savedUser = localStorage.getItem("partner_user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        setIsAuthenticated(true);
        window.location.href='/dashboard';
     }} onBack={() => window.location.href='/'} />
  }

  return (
    <div className="flex h-screen bg-[#0A0A0F] font-sans text-slate-300 overflow-hidden">
      <Sidebar user={user} onLogout={() => {
          localStorage.removeItem("partner_token");
          localStorage.removeItem("partner_user");
          window.location.href = '/';
      }} onTriggerRefresh={triggerDataRefresh} />

      <main className="flex-1 overflow-y-auto bg-[#0A0A0F] pt-14 md:pt-0 w-full max-w-full">
        <section className="flex-1 min-w-0 h-full">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<DataUpload />} />
            <Route path="/scanner" element={<NoteScanner />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/market" element={<MarketInsights />} />
            <Route path="/customers" element={<CustomerBehavior />} />
            <Route path="/chat" element={<ChatAssistant />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </section>
      </main>
      <FloatingChatAssistant />
    </div>
  );
}

export default function App() {
  return (
    <BusinessProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </BusinessProvider>
  );
}

