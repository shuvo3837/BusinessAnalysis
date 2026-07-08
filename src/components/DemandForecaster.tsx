/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  LineChart as ChartIcon, 
  HelpCircle,
  Search,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";

interface DemandForecasterProps {
  token: string | null;
  onRefreshTrigger: number;
}

export default function DemandForecaster({ token, onRefreshTrigger }: DemandForecasterProps) {
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  useEffect(() => {
    fetchForecasts();
  }, [onRefreshTrigger]);

  const fetchForecasts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/forecasting", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Could not compute forecasting calculations");
      setForecasts(data);
      if (data.length > 0 && !selectedProductId) {
        setSelectedProductId(data[0].productId);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Safe checks filters
  const filteredForecasts = forecasts.filter(f => {
    const matchSearch = f.productName.toLowerCase().includes(searchQuery.toLowerCase()) || f.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRisk = riskFilter === "All" || f.riskAnalysis === riskFilter;
    return matchSearch && matchRisk;
  });

  const selectedForecast = forecasts.find(f => f.productId === selectedProductId);

  // Generate dynamic 6-month prediction data points for selected item's Recharts Line Chart
  const getGraphDataPoints = () => {
    if (!selectedForecast) return [];
    
    const curStock = selectedForecast.currentStock;
    const rate30 = selectedForecast.forecast30d;
    const rate90 = selectedForecast.forecast3m;
    const rate180 = selectedForecast.forecast6m;

    // Linear projection slope including standard safety deviations
    return [
      { step: "Current Stock", Volume: curStock, ProjectedDemand: 0 },
      { step: "30 Days Out", Volume: Math.max(0, curStock - rate30), ProjectedDemand: rate30 },
      { step: "90 Days (3m)", Volume: Math.max(0, curStock - rate90), ProjectedDemand: rate90 },
      { step: "180 Days (6m)", Volume: Math.max(0, curStock - rate180), ProjectedDemand: rate180 }
    ];
  };

  const graphData = getGraphDataPoints();

  if (loading && forecasts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        <span className="text-sm">Calculating Advanced Sales Forecasting...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* HUD Header */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <span>AI Predictive Demand & Restock Scheduler</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Statistical linear regression algorithms tracking trailing daily velocities of stock lines.</p>
        </div>
        
        <button
          onClick={fetchForecasts}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-100 text-xs rounded-xl p-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Product Selector List */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[650px] justify-between">
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest block mb-2">My Inventory Streams</h3>
            
            {/* Search and Filters panel */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="All">All Risk Conditions</option>
                  <option value="Low Stock Risk">⚠️ Low Stock Risk</option>
                  <option value="Dead Stock Risk">🛑 Dead Stock Risk</option>
                  <option value="Healthy">✅ Healthy Trajectory</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="space-y-1.5 overflow-y-auto max-h-[420px] pr-1 divide-y divide-slate-800/60">
              {filteredForecasts.map((f) => (
                <button
                  key={f.productId}
                  onClick={() => setSelectedProductId(f.productId)}
                  className={`w-full text-left p-3 rounded-lg transition-all border flex items-center justify-between text-xs cursor-pointer ${
                    selectedProductId === f.productId
                      ? "bg-indigo-600/10 border-indigo-500/40 text-white"
                      : "bg-slate-950/20 border-transparent hover:bg-slate-850 hover:text-white text-slate-300"
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="font-bold block truncate">{f.productName}</span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">{f.sku} • Stock: {f.currentStock}</span>
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider font-bold ${
                    f.riskAnalysis === "Low Stock Risk" 
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : f.riskAnalysis === "Dead Stock Risk"
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/10"
                      : "bg-emerald-500/10 text-emerald-400"
                  }`}>
                    {f.riskAnalysis === "Low Stock Risk" ? "Low Stock" : f.riskAnalysis === "Dead Stock Risk" ? "Dead Risk" : "Healthy"}
                  </span>
                </button>
              ))}
              {filteredForecasts.length === 0 && (
                <p className="text-center py-10 text-slate-500 text-xs">No matching products found.</p>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg text-[10.5px] text-slate-400 border border-slate-800 leading-normal">
            <strong>⚠️ Low Stock Risk triggers:</strong> item stock level fails to cover the calculated 30-day projected sales demand velocity.
          </div>
        </div>

        {/* Right: Detailed Predictive Graph Panel */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          {selectedForecast ? (
            <div className="space-y-6">
              
              {/* Product Info Block */}
              <div className="border-b border-slate-850 pb-4">
                <span className="text-[11px] text-indigo-400 uppercase tracking-widest font-mono block font-bold">Selected Forecast Stream</span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedForecast.productName}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5 uppercase">Model ID: SKU-{selectedForecast.sku} • Trailing Volume Sample: 60 Days</p>
              </div>

              {/* Confidence gauges row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Confidence Bar */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">Confidence Score</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-bold text-indigo-400">{selectedForecast.confidenceScore}%</span>
                    <span className="text-[10px] text-slate-500">reliability status</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${selectedForecast.confidenceScore}%` }} />
                  </div>
                </div>

                {/* Growth Probability */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">Monthly growth Trajectory</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-bold text-emerald-400">+{selectedForecast.growthProbability}%</span>
                    <span className="text-[10px] text-slate-500">volume speed</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${selectedForecast.growthProbability}%` }} />
                  </div>
                </div>

                {/* Restocking advice */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">Suggested replenishment</span>
                    <span className={`text-xl font-extrabold block mt-1.5 ${selectedForecast.suggestedRestockQuantity > 0 ? "text-yellow-400" : "text-emerald-400"}`}>
                      {selectedForecast.suggestedRestockQuantity > 0 ? `+${selectedForecast.suggestedRestockQuantity} units` : "Fully Stocked"}
                    </span>
                  </div>
                  {selectedForecast.suggestedRestockQuantity > 0 && (
                    <span className="text-[9px] text-slate-500 block uppercase font-mono mt-1">cover target 1.2x buffer</span>
                  )}
                </div>

              </div>

              {/* Trajectory predictions chart */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  <ChartIcon className="w-3.5 h-3.5" />
                  <span>Depletion slope vs Accumulating Demand (180 Days)</span>
                </h4>
                
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="step" stroke="#475569" fontSize={10} />
                      <YAxis stroke="#475569" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }} />
                      <Area type="monotone" name="Stock Depletion Run" dataKey="Volume" stroke="#f43f5e" strokeWidth={1.5} fillOpacity={0.1} fill="#f43f5e" />
                      <Area type="monotone" name="Projected Buyer demand" dataKey="ProjectedDemand" stroke="#6366f1" strokeWidth={1.5} fillOpacity={0.08} fill="#6366f1" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* RESTOCK CHECKLIST SUMMARY */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Forecast Timeline Numbers Breakdown</h4>
                <div className="grid grid-cols-3 gap-2.5 text-center pt-1.5">
                  <div className="bg-slate-900 p-2.5 rounded-lg">
                    <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-mono">Next 30 Days</span>
                    <span className="font-bold text-white text-base font-mono">{selectedForecast.forecast30d} units</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg">
                    <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-mono">Next 3 Months</span>
                    <span className="font-bold text-white text-base font-mono">{selectedForecast.forecast3m} units</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-lg">
                    <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-mono">Next 6 Months</span>
                    <span className="font-bold text-white text-base font-mono">{selectedForecast.forecast6m} units</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Select product on the left to display predictive charts.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
