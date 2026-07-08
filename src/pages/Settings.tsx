import React from 'react';
import { useBusiness } from '../context/BusinessContext';
import { Trash2, User, Moon, Sun, Settings as ConfigIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { setCustomAnalytics, theme, setTheme } = useBusiness();
  const navigate = useNavigate();

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear your current session's analytics data?")) {
      setCustomAnalytics(null);
      navigate('/upload');
    }
  };

  const clearAuth = () => {
    localStorage.removeItem("partner_token");
    localStorage.removeItem("partner_user");
    window.location.href = '/';
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
         <h1 className="text-3xl font-bold font-syne text-white mb-2 flex items-center gap-3">
           <ConfigIcon className="w-8 h-8 text-slate-500" /> Platform Settings
         </h1>
      </div>

      <div className="bg-[#12121A] border border-[#2A2A3A] p-6 rounded-2xl space-y-6">
        <h2 className="text-lg font-bold text-white mb-2 border-b border-[#2A2A3A] pb-4">Data Management</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium">Clear Custom Analytics Memory</h3>
            <p className="text-sm text-slate-500">Remove uploaded data and reset AI analyst context for this session.</p>
          </div>
          <button onClick={handleClearData} className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors">
            <Trash2 className="w-4 h-4" /> Purge Memory
          </button>
        </div>
      </div>

      <div className="bg-[#12121A] border border-[#2A2A3A] p-6 rounded-2xl space-y-6 mt-6">
        <h2 className="text-lg font-bold text-white mb-2 border-b border-[#2A2A3A] pb-4">Account Security</h2>
        
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">SaaS Admin Profile</h3>
                <p className="text-sm text-slate-500">Active session token valid.</p>
              </div>
            </div>
            <button onClick={clearAuth} className="px-4 py-2 border border-[#2A2A3A] hover:bg-[#1A1A26] rounded-lg text-sm font-bold text-slate-300 transition-colors">
              Sign Out
            </button>
        </div>
      </div>
    </div>
  );
}
