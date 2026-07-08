/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  HelpCircle, 
  RefreshCw, 
  CheckCircle2, 
  Target, 
  DollarSign, 
  Search, 
  Megaphone, 
  Layers,
  ArrowRight,
  AlertTriangle
} from "lucide-react";

interface MarketingStrategistProps {
  token: string | null;
  customAnalytics?: any;
}

export default function MarketingStrategist({ token, customAnalytics }: MarketingStrategistProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [strategy, setStrategy] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [isDemoCall, setIsDemoCall] = useState(false);
  const [error, setError] = useState("");
  const [warningText, setWarningText] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/inventory", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.length > 0) {
        setProducts(data);
        setSelectedProductId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateStrategy = async () => {
    if (!selectedProductId) return;
    setLoading(true);
    setError("");
    setWarningText("");
    setStrategy(null);

    try {
      const res = await fetch("/api/marketing/strategy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId: selectedProductId })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Generation endpoint error");

      setStrategy(data.strategy);
      setIsDemoCall(!!data.isDemo);
      if (data.warning) {
        setWarningText(data.warning);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title block */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            <span>AI Automated Growth & Campaign strategist</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Automates title optimizations, description drafts, and Facebook/TikTok campaign target settings.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-xl p-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Custom Analytics Overview Strategy */}
      {customAnalytics && customAnalytics.strategies && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 mb-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Megaphone className="w-5 h-5 text-teal-600" />
              <span>Smart Market Intelligence Strategy</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Recommended approaches purely based on your uploaded business data and detected {customAnalytics.businessCategory} category.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customAnalytics.strategies.map((strat: string, i: number) => (
              <div key={i} className="p-4 bg-teal-50 border border-teal-100 rounded-xl text-xs space-y-1">
                <span className="font-bold text-teal-900 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  Strategy Blueprint {i + 1}
                </span>
                <p className="text-teal-800 text-xs leading-relaxed pt-1.5">{strat}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Select SKU block */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider block">Target Product</h3>
        
        {products.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">Add items to store inventory before generating strategies.</p>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3.5 items-end">
            <div className="flex-1 w-full">
              <label className="block text-[10px] text-slate-455 uppercase tracking-wider mb-1.5 font-semibold">Select SKU Catalog Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>[{p.sku}] {p.name} (${p.sellingPrice.toFixed(2)})</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerateStrategy}
              disabled={loading}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-550 text-white font-semibold text-xs px-5 py-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Configuring Hook Prompts...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Draft AI Campaign Strategy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Generation Loader State */}
      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 flex flex-col items-center justify-center text-center space-y-3">
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin" />
          <h4 className="text-slate-200 text-xs font-bold uppercase tracking-widest animate-pulse">Running Neural Optimization...</h4>
          <p className="text-slate-400 text-xs max-w-sm leading-relaxed">Gemini compiles targeting parameters, historical daily sales volume, category patterns and SEO search indexing keywords...</p>
        </div>
      )}

      {/* Demo warning text if key was missing */}
      {strategy && isDemoCall && (
        <div className="bg-emerald-505/5 border border-emerald-500/20 rounded-xl p-4 text-xs text-indigo-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-400 w-4 h-4 shrink-0" />
            <span>Completed locally inside container database records. To connect actual world model pipelines, key your API Secret in Workspace Settings.</span>
          </div>
        </div>
      )}

      {/* Output Content Display */}
      {strategy && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in font-sans">
          
          {/* Main detailed text block copy lists */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Optimized titles and descriptions cards */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
              
              <div className="border-b border-slate-850 pb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-indigo-400" />
                  <span>Highly Optimized eCommerce Copy</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">High click-through-rate title and psychological descriptions.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">High-Conversion Title</span>
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg text-slate-100 font-semibold text-xs border border-indigo-500/10 hover:border-indigo-500/25 transition-all">
                    {strategy.optimizedTitle}
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Hook Description Listing Copy</span>
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-lg text-slate-350 text-xs leading-relaxed font-normal whitespace-pre-line">
                    {strategy.optimizedDescription}
                  </div>
                </div>
              </div>

            </div>

            {/* Platform Ads strategies */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
              
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>Channel Social ads configurations</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Custom target strategies structured for immediate social campaigns.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-950/20 border border-indigo-500/10 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    Meta / Facebook Marketing
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed pt-1.5">{strategy.adStrategy.facebook}</p>
                </div>

                <div className="p-4 bg-teal-955/20 border border-teal-500/10 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-teal-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-400" />
                    TikTok Shop Ads UGC
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed pt-1.5">{strategy.adStrategy.tiktok}</p>
                </div>
              </div>

            </div>

          </div>

          {/* Right sidebar insights metrics */}
          <div className="space-y-6">
            
            {/* Quick Metrics: Spend Allocation, Best Hub */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Campaign Metrics Hud</h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-lg flex justify-between items-center border border-slate-850">
                  <span className="text-slate-400">Best Marketplace Hub:</span>
                  <span className="font-bold text-white text-right">{strategy.bestMarketplace}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg flex justify-between items-center border border-slate-850">
                  <span className="text-slate-400">Suggested Budget:</span>
                  <span className="font-extrabold text-indigo-450 font-mono text-sm flex items-center">
                    <DollarSign className="w-4 h-4 inline" />
                    {strategy.adStrategy.budget}
                  </span>
                </div>
              </div>
            </div>

            {/* Bundle Ideas */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Campaign Bundler Ideas</h3>
              <div className="space-y-2">
                {strategy.bundleIdeas.map((idea: string, i: number) => (
                  <div key={i} className="p-3 bg-slate-950/60 rounded-lg text-[11.5px] text-slate-300 flex gap-2 border border-slate-850">
                    <span className="font-mono text-indigo-400 text-xs">{i+1}.</span>
                    <span className="leading-relaxed font-normal">{idea}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Keyword tags */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">SEO tags optimization</h3>
              <div className="flex flex-wrap gap-1.5">
                {strategy.seoKeywords.map((tag: string, i: number) => (
                  <span 
                    key={i} 
                    className="p-1 px-2.5 bg-slate-950 text-slate-400 border border-slate-800/80 rounded-full text-[10.5px] font-mono hover:text-white transition-all cursor-default"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
