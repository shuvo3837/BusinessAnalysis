/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  HelpCircle, 
  MessageSquare, 
  Trash, 
  CheckCircle,
  TrendingUp,
  BrainCircuit,
  CornerDownLeft,
  ChevronRight
} from "lucide-react";
import { ChatMessage } from "../types";

interface AICopilotProps {
  token: string | null;
  onRefreshTrigger: number;
  customAnalytics?: any;
}

export default function AICopilot({ token, onRefreshTrigger, customAnalytics }: AICopilotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { text: "Which products should I restock first?", label: "Restock Advice" },
    { text: "Explain recent gross revenue metrics.", label: "Sales Review" },
    { text: "Tell me which items have dead stock risk?", label: "Overstock risk" },
    { text: "Recommend a high-yield marketing strategy.", label: "Ad Strategies" }
  ];

  useEffect(() => {
    fetchMessages();
  }, [onRefreshTrigger]);

  useEffect(() => {
    // Smooth scroll down when new message updates
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Could not download chat records");
      setMessages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || sending) return;
    setError("");
    setSending(true);
    setInput("");

    // optimistic user render
    const optimisticMsg: ChatMessage = {
      id: "u-opt-" + Date.now(),
      role: "user",
      text: textToSend,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: textToSend,
          customContext: customAnalytics
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Copilot message endpoint error.");

      // Replace messages list with actual database history logs including actual response
      fetchMessages();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setSending(false);
    } finally {
      setSending(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Restore chat partner history to standard greetings?")) return;
    setError("");
    try {
      const res = await fetch("/api/reset-demo", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Could not wipe data logs");
      fetchMessages();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl h-[700px] flex flex-col justify-between overflow-hidden relative font-sans">
      
      {/* Target User HUD Top Bar */}
      <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800/80 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Domain AI Business Partner</span>
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">Real-time stats sync engine context active</p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="text-[10.5px] text-slate-500 hover:text-red-400 p-1 px-2 border border-slate-800 rounded-md hover:border-red-500/20 transition-all font-semibold uppercase tracking-wider font-sans cursor-pointer"
          title="Restore standard greeting layout"
        >
          Reset Logs
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs p-3 flex items-center gap-2">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Main Messages Block */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/20">
        {loading && messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
            <span className="text-xs">Connecting AI session grids...</span>
          </div>
        ) : (
          messages.map((m) => (
            <div 
              key={m.id} 
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl p-4 text-xs shadow-xl leading-relaxed font-normal whitespace-pre-line ${
                  m.role === "user" 
                    ? "bg-indigo-600 text-white rounded-tr-none px-4" 
                    : "bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none font-sans"
                }`}
              >
                {/* Meta role flags */}
                <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono font-bold uppercase mb-1">
                  <span>{m.role === "user" ? "ME (Seller Account)" : "AI PARTNER COPILOT"}</span>
                  <span>•</span>
                  <span>{new Date(m.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" })}</span>
                </div>

                <div className="prose prose-invert prose-xs leading-relaxed">
                  {m.text}
                </div>
              </div>
            </div>
          ))
        )}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl rounded-tl-none p-3 px-4 text-xs max-w-[80%] flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>Partner recalculating channel levels...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Inputs block and quick suggestion tags */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        
        {/* Quick prompt selections */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(qp.text)}
              disabled={sending}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-indigo-300 text-[10.5px] rounded-lg transition-all text-left flex items-center gap-1 cursor-pointer"
            >
              <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="font-semibold">{qp.label}</span>
            </button>
          ))}
        </div>

        {/* Input Text Form */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-830 rounded-xl p-1.5 pl-3">
          <input
            type="text"
            placeholder="Query Stock planning, marketplace allocations, ad copy optimizations..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage(input);
            }}
            disabled={sending}
            className="flex-1 bg-transparent text-slate-100 text-xs focus:outline-none placeholder-slate-500 pr-2"
          />

          <button
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || sending}
            className="p-2 py-2 bg-indigo-600 border border-indigo-400/20 rounded-lg hover:bg-indigo-505 text-white disabled:opacity-40 transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
