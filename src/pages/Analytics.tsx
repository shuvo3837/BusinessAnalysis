import React from 'react';
import { useBusiness } from '../context/BusinessContext';
import { Sparkles, BarChart2, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function Analytics() {
  const { customAnalytics } = useBusiness();

  if (!customAnalytics) return (
    <div className="p-8"><h1 className="text-2xl text-white">Analytics Setup</h1><p className="text-slate-400 mt-2">Please upload data to view detailed analytics.</p></div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
         <h1 className="text-3xl font-bold font-syne text-white mb-2">Deep Dive Analytics</h1>
         <p className="text-slate-400">Advanced performance metrics for your {customAnalytics.businessCategory} business.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#12121A] border border-[#2A2A3A] rounded-2xl p-6">
           <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><TrendingDown className="w-5 h-5 text-red-400" /> Dead Stock Identifier</h3>
           <div className="space-y-4">
             {customAnalytics.slowSelling && customAnalytics.slowSelling.length > 0 ? customAnalytics.slowSelling.map((p: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-4 bg-[#1A1A26] border border-[#2A2A3A] rounded-xl">
                   <div>
                      <p className="font-bold text-slate-200">{p.name}</p>
                      <p className="text-xs text-red-400">Risk: Immobile Inventory</p>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-medium text-slate-400">{p.stock} units left</p>
                   </div>
                </div>
             )) : (
                <p className="text-slate-500 text-sm">No dead stock detected.</p>
             )}
           </div>
           <button className="mt-4 w-full p-3 border border-dashed border-blue-500/30 text-blue-400 text-sm font-bold rounded-xl hover:bg-blue-500/10">Ask AI for Clearance Strategies</button>
        </div>

        <div className="bg-[#12121A] border border-[#2A2A3A] rounded-2xl p-6">
           <h3 className="text-lg font-bold text-white mb-4">Fastest Moving Inventory</h3>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={customAnalytics.fastSelling || []}>
                   <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                   <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                   <Tooltip cursor={{ fill: '#1A1A26' }} contentStyle={{ backgroundColor: '#0D0D0D', borderColor: '#2A2A3A', color: '#fff' }} />
                   <Bar dataKey="sales" fill="#10B981" radius={[4, 4, 0, 0]} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}
