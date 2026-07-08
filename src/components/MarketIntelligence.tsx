/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Globe, 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  Flame, 
  HelpCircle,
  RefreshCw,
  Info,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  ReferenceLine
} from "recharts";

interface MarketIntelligenceProps {
  token: string | null;
}

export default function MarketIntelligence({ token }: MarketIntelligenceProps) {
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters state
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedMarketplace, setSelectedMarketplace] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const countries = ["All", "Global", "United States", "Bangladesh", "Pakistan"];
  const marketplaces = ["All", "Shopify", "TikTok Shop", "Daraz", "Facebook"];
  const categories = ["All", "Apparel", "Footwear", "Home Decor", "Accessories", "Electronics"];

  useEffect(() => {
    fetchTrends();
  }, [selectedCountry, selectedMarketplace, selectedCategory]);

  const fetchTrends = async () => {
    setLoading(true);
    setError("");
    try {
      // Build search URL
      const url = new URL("/api/market-trends", window.location.origin);
      if (selectedCountry !== "All") url.searchParams.append("country", selectedCountry);
      if (selectedMarketplace !== "All") url.searchParams.append("marketplace", selectedMarketplace);
      if (selectedCategory !== "All") url.searchParams.append("category", selectedCategory);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Could not download market search indicators");
      setTrends(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case "Low": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
      case "Medium": return "text-amber-400 bg-amber-500/10 border-amber-500/25";
      case "High": return "text-pink-400 bg-pink-500/10 border-pink-500/25";
      default: return "text-slate-400 bg-slate-800";
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title block */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <span>Market Intelligence, Search Trends & Competition Indices</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Demographics and platform search keywords indicating future marketplace demands.</p>
        </div>

        <button
          onClick={fetchTrends}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-xl p-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dynamic Filters panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 font-semibold">Target Consumer Region</label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none"
          >
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 font-semibold font-sans">Index Platform Site</label>
          <select
            value={selectedMarketplace}
            onChange={(e) => setSelectedMarketplace(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none"
          >
            {marketplaces.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 font-semibold">Category Segment</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Split visual: Left list of terms, Right: Recharts Searches graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Keywords grid listing cards */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Indexed Keyword High-Volume Searches</h3>
          
          {loading ? (
            <div className="py-20 text-center flex items-center justify-center gap-2 text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
              <span className="text-xs">Gathering real-time keyword insights...</span>
            </div>
          ) : trends.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-xs">
              No trends matched the selected filter configuration. Try changing region scopes.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trends.map((t, idx) => (
                <div 
                  key={idx} 
                  className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-3 hover:border-slate-750 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-slate-100 font-bold text-xs block">{t.keyword}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider border font-mono font-bold ${getCompetitionColor(t.competition)}`}>
                        {t.competition} Comp
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[10px] bg-slate-900 border border-slate-800 text-indigo-300 px-2 py-0.5 rounded font-mono font-medium">{t.country}</span>
                      <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-sans italic">{t.marketplace}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-900/60 pt-2.5 flex justify-between items-baseline text-xs mt-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase tracking-widest font-mono">Monthly Traffic</span>
                      <span className="font-bold text-white font-mono text-xs">{t.monthlySearches.toLocaleString()} hits</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase tracking-widest font-mono">Seasonal Peak</span>
                      <span className="font-bold text-amber-400 text-[11px] font-sans flex items-center gap-0.5 justify-end">
                        <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        {t.seasonalPeak}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Recharts bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Keyword Search Vol. comparison</h3>
            <p className="text-[11px] text-slate-400 mb-4">Live comparison rating based on exact hits monthly.</p>

            <div className="h-72">
              {trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                    <XAxis type="number" stroke="#475569" fontSize={9} />
                    <YAxis dataKey="keyword" type="category" stroke="#475569" fontSize={8} width={75} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }} />
                    <Bar dataKey="monthlySearches" name="Hits Scope" fill="#6366f1" radius={[0, 4, 4, 0]}>
                      {trends.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#6366f1" : "#14b8a6"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  No data scopes.
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-[10.5px] text-slate-400 space-y-1 mt-4">
            <span className="font-bold text-slate-200 block">💡 Growth Opportunities Index</span>
            <p className="leading-relaxed">Keywords with <span className="text-emerald-400">Low Competition</span> and <span className="font-bold text-white">40K+ traffic volume</span> represent prime targets for high conversion SEO and ad campaigns.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
