import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  PackageSearch, 
  LayoutDashboard, 
  Database, 
  TrendingUp, 
  Tags, 
  Megaphone, 
  Target, 
  BrainCircuit, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

export default function Sidebar({ user, onLogout, onTriggerRefresh }: any) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const location = useLocation();

  const handleResetDatabase = async () => {
    if (!window.confirm("Are you sure you want to reset the database?")) return;
    setLoadingReset(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (!res.ok) throw new Error("Failed to reset");
      alert("Database reset successfully.");
      onTriggerRefresh(); 
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingReset(false);
    }
  };

  const navItemClass = (path: string) => {
    const isActive = location.pathname.startsWith(path);
    return `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-teal-500/10 text-teal-400" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"}`;
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900 border-b border-slate-800 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-md flex items-center justify-center text-white font-bold tracking-tighter">BM</div>
          <span className="font-bold text-white tracking-tight">BizMind AI</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-400 hover:text-white">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 ease-in-out flex flex-col ${mobileMenuOpen ? 'translate-x-0 pt-14' : '-translate-x-full pt-0'} md:relative md:translate-x-0 md:pt-0`}>
        <div className="h-16 hidden md:flex items-center gap-2 px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-teal-600 rounded-md flex flex-col items-center justify-center text-white font-bold tracking-tighter shadow-md">
            BM
          </div>
          <span className="font-bold text-white text-lg tracking-tight">BizMind AI</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">Overview</div>
          <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={navItemClass('/dashboard')}>
            <LayoutDashboard className="w-4 h-4" /> Operations HQ
          </NavLink>
          <NavLink to="/upload" onClick={() => setMobileMenuOpen(false)} className={navItemClass('/upload')}>
            <Database className="w-4 h-4" /> Data Upload
          </NavLink>
          <NavLink to="/scanner" onClick={() => setMobileMenuOpen(false)} className={navItemClass('/scanner')}>
            <Target className="w-4 h-4" /> Smart Note Scanner
          </NavLink>
          
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-6 mb-3 px-3">Commerce Logic</div>
          <NavLink to="/analytics" onClick={() => setMobileMenuOpen(false)} className={navItemClass('/analytics')}>
            <PackageSearch className="w-4 h-4" /> Analytics
          </NavLink>
          <NavLink to="/customers" onClick={() => setMobileMenuOpen(false)} className={navItemClass('/customers')}>
            <Target className="w-4 h-4" /> Customer Behavior
          </NavLink>

          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-6 mb-3 px-3">AI Intelligence</div>
          <NavLink to="/market" onClick={() => setMobileMenuOpen(false)} className={navItemClass('/market')}>
            <Tags className="w-4 h-4" /> Market Insights
          </NavLink>
          <NavLink to="/chat" onClick={() => setMobileMenuOpen(false)} className={navItemClass('/chat')}>
            <BrainCircuit className="w-4 h-4" /> BizMind AI
            <span className="ml-auto bg-blue-500/20 text-blue-400 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase">Pro</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-800 mt-auto space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 mt-4">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs ring-1 ring-indigo-500/50">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name || "Partner Account"}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Admin</p>
            </div>
            <button onClick={onLogout} className="text-slate-500 hover:text-red-400 p-1 rounded-md transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
