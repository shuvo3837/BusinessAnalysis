import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
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

import AdminLogin from "../admin/AdminLogin";
import AdminDashboard from "../admin/AdminDashboard";

import { LogOut, Target } from "lucide-react";

// ONE <Routes> block at the root level is critical: nested sibling <Routes>
// under the same <BrowserRouter> silently fail to register their internal
// <Routes> children, which is what caused /login and /register to 404 on
// Vercel after a hard navigation. Everything in the user app lives under
// the wildcard route below and is handled by AppContent.
function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { customAnalytics, setCustomAnalytics } = useBusiness();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem("partner_token");
    const savedUser = localStorage.getItem("partner_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Keep auth state in sync with browser back/forward buttons.
  useEffect(() => {
    const onPop = () => {
      const savedToken = localStorage.getItem("partner_token");
      const savedUser = localStorage.getItem("partner_user");
      setIsAuthenticated(!!(savedToken && savedUser));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const triggerDataRefresh = () => setRefreshTrigger((prev) => prev + 1);

  // Hidden admin surface lives outside the user-auth gate.
  // The /admin/* routes are declared in the outer <Routes> block in <App/>,
  // so we just need to bail out here so LandingPage doesn't paint over them.
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  // Public landing page (root) — only shown when user is not authenticated.
  if (!isAuthenticated && location.pathname === "/") {
    return <LandingPage onLoginClick={() => navigate("/login")} />;
  }

  // Login / Register screen — uses SPA navigation, no full page reload.
  if (!isAuthenticated && location.pathname === "/login") {
    return (
      <AuthScreen
        onSuccess={(t) => {
          setToken(t);
          const savedUser = localStorage.getItem("partner_user");
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
          setIsAuthenticated(true);
          navigate("/dashboard");
        }}
        onBack={() => navigate("/")}
      />
    );
  }

  // Authenticated shell with sidebar + nested routes.
  if (isAuthenticated) {
    return (
      <div className="flex h-screen bg-[#0A0A0F] font-sans text-slate-300 overflow-hidden">
        <Sidebar
          user={user}
          onLogout={() => {
            localStorage.removeItem("partner_token");
            localStorage.removeItem("partner_user");
            setIsAuthenticated(false);
            setToken(null);
            setUser(null);
            navigate("/");
          }}
          onTriggerRefresh={triggerDataRefresh}
        />

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

  // Not authenticated and not on a public route — bounce to login.
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BusinessProvider>
      <BrowserRouter>
        {/* ONE <Routes> at the root — handles every URL in the app, including
            the hidden admin surface and the user-auth shell. */}
        <Routes>
          {/* Hidden admin surface — entirely separate auth, not linked from the user app. */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />

          {/* Everything else is owned by AppContent (landing / login / authenticated shell). */}
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </BrowserRouter>
    </BusinessProvider>
  );
}

