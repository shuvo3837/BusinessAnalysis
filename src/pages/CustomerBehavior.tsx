import React from 'react';
import { useBusiness } from '../context/BusinessContext';
import { Users, UsersRound, MapPin, Activity } from 'lucide-react';

export default function CustomerBehavior() {
  const { customAnalytics } = useBusiness();

  if (!customAnalytics) return <div className="p-8"><h1 className="text-2xl text-white">Customer Personas</h1><p className="text-slate-400">Please provide sales data to discover your true audience.</p></div>;

  const { persona } = customAnalytics;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
         <h1 className="text-3xl font-bold font-syne text-white mb-2">Customer Persona Analyst</h1>
         <p className="text-slate-400">Detailed AI breakdown of who is buying your products and why.</p>
      </div>

      <div className="bg-[#12121A] border border-[#2A2A3A] p-8 rounded-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-6">Demographic Profile</h2>
            
            <div className="flex items-center justify-between p-4 bg-[#1A1A26] rounded-xl border border-[#2A2A3A]">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-slate-400 font-medium text-sm">Primary Age Group</span>
              </div>
              <span className="text-white font-bold">{persona?.ageGroup || "N/A"}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#1A1A26] rounded-xl border border-[#2A2A3A]">
              <div className="flex items-center gap-3">
                <UsersRound className="w-5 h-5 text-pink-400" />
                <span className="text-slate-400 font-medium text-sm">Gender Preference</span>
              </div>
              <span className="text-white font-bold">{persona?.gender || "N/A"}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#1A1A26] rounded-xl border border-[#2A2A3A]">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-400 font-medium text-sm">Dominant Region</span>
              </div>
              <span className="text-white font-bold">{persona?.region || "N/A"}</span>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-6">Behavioral Summary</h2>
            <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-2xl h-full relative">
              <span className="text-4xl text-blue-500/20 absolute top-4 left-4 font-serif">"</span>
              <p className="text-slate-300 leading-relaxed relative z-10 pt-4 px-2 italic text-lg">
                {persona?.summary || "Insufficient data to accurately map psychological buying behavior. Requires larger dataset upload."}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
