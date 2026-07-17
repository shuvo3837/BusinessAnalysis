import React from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, PackageSearch, AlertTriangle, Activity, 
  Sparkles, DollarSign, BarChart2, BrainCircuit 
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export default function Dashboard() {
  const { customAnalytics } = useBusiness();

  if (!customAnalytics) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-6"></div>
        <h2 className="text-2xl font-bold text-white mb-3">Initializing Business AI...</h2>
        <p className="text-slate-400 max-w-sm mb-8">
          BizMind AI is building your dashboard. If this takes too long, try uploading a fresh CSV.
        </p>
        <Link to="/upload" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">
          Upload Data
        </Link>
      </div>
    );
  }

  const { performance, businessCategory, forecast, fastSelling, slowSelling, trendData, categoryDistribution } = customAnalytics;
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-syne text-white">Dashboard Overview</h1>
        <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          {businessCategory} Business AI
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#12121A] border border-[#2A2A3A] p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg"><DollarSign className="w-5 h-5 text-blue-400" /></div>
            <h3 className="text-slate-400 text-sm font-medium">Total Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-white">${performance?.totalRevenue?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-[#12121A] border border-[#2A2A3A] p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg"><Activity className="w-5 h-5 text-green-400" /></div>
            <h3 className="text-slate-400 text-sm font-medium">Gross Margin</h3>
          </div>
          <p className="text-3xl font-bold text-white">{performance?.grossProfitMargin || 0}%</p>
        </div>
        <div className="bg-[#12121A] border border-[#2A2A3A] p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg"><PackageSearch className="w-5 h-5 text-amber-400" /></div>
            <h3 className="text-slate-400 text-sm font-medium">Open Orders</h3>
          </div>
          <p className="text-3xl font-bold text-white">{performance?.openOrders || 0}</p>
        </div>
        <div className="bg-[#12121A] border border-[#2A2A3A] p-5 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
            <h3 className="text-slate-400 text-sm font-medium">Dead Stock</h3>
          </div>
          <p className="text-3xl font-bold text-white">{slowSelling?.length || 0}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#12121A] border border-[#2A2A3A] p-5 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-6">Revenue Trends</h3>
          <div className="h-72">
            {trendData && trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1A1A26', borderColor: '#2A2A3A', color: '#fff' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">No trend data available</div>
            )}
          </div>
        </div>

        <div className="bg-[#12121A] border border-[#2A2A3A] p-5 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-6">Category Profitability</h3>
          <div className="h-72">
             {categoryDistribution && categoryDistribution.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={categoryDistribution}
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {categoryDistribution.map((entry: any, index: number) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip contentStyle={{ backgroundColor: '#1A1A26', borderColor: '#2A2A3A', color: '#fff' }} />
                 </PieChart>
               </ResponsiveContainer>
             ) : (
               <div className="flex h-full items-center justify-center text-slate-500">No category data</div>
             )}
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="bg-[#12121A] border border-[#2A2A3A] p-6 rounded-xl">
        <h3 className="text-xl font-bold font-syne text-white mb-6 flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-blue-400" /> BizMind AI Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-900/10 border border-blue-900/30 rounded-xl space-y-2">
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-[10px] font-bold uppercase">Growth Forecast</span>
            <p className="text-sm text-slate-300 font-medium">
              {forecast?.expectedGrowth || "Growth data pending. Provide more comprehensive records for analysis."}
            </p>
            <p className="text-xs text-slate-500 mt-2">Peak periods: {forecast?.bestMonths || "N/A"}</p>
          </div>
          
          <div className="p-4 bg-green-900/10 border border-green-900/30 rounded-xl space-y-2">
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-[10px] font-bold uppercase">Top Performers</span>
            <ul className="text-sm text-slate-300 font-medium space-y-1">
              {fastSelling?.slice(0,3).map((item: any, i: number) => (
                <li key={i} className="flex justify-between">
                  <span className="truncate pr-2">{item.name}</span>
                  <span className="text-green-400">{item.sales} sold</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="p-4 bg-red-900/10 border border-red-900/30 rounded-xl space-y-2">
            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-[10px] font-bold uppercase">Dead Stock Warning</span>
            <ul className="text-sm text-slate-300 font-medium space-y-1">
              {slowSelling?.slice(0,3).map((item: any, i: number) => (
                <li key={i} className="flex justify-between">
                  <span className="truncate pr-2">{item.name}</span>
                  <span className="text-slate-500">{item.stock} left</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
