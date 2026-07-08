import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import Markdown from "react-markdown";

interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

export default function ChatAssistant() {
  const { customAnalytics } = useBusiness();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: "ai",
        content: `Hello! I am BizMind AI, your business partner and strategist. \n\n${customAnalytics ? "I've analyzed your data and am ready to assist you!" : "Please upload a data file so I can give you personalized advice."}`
      }]);
    }
  }, [customAnalytics, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (e?: React.FormEvent, predefinedText?: string) => {
    e?.preventDefault();
    const textToSend = predefinedText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: textToSend,
          customContext: customAnalytics
        })
      });
      const data = await res.json();
      const replyText = data.chat?.text || data.reply || "No response received";
      setMessages(prev => [...prev, { role: "ai", content: replyText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, I am having trouble connecting to my reasoning engine right now." }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    "What products should I restock?",
    "Give me a marketing strategy.",
    "Why are my sales decreasing?",
    "Who is my target audience?"
  ];

  return (
    <div className="flex h-full p-4 lg:p-8 gap-6 max-w-7xl mx-auto">
      {/* Sidebar Info */}
      <div className="hidden lg:flex flex-col w-80 shrink-0 gap-6">
        <div className="bg-[#12121A] border border-[#2A2A3A] p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
            <Bot className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="font-syne text-xl font-bold text-white mb-2">BizMind AI</h2>
          <p className="text-sm text-slate-400">Your AI-Powered Business Partner</p>
          
          {customAnalytics && (
            <div className="w-full mt-6 space-y-3">
               <div className="bg-[#1A1A26] rounded-lg p-3 text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Business Type</span>
                  <p className="text-sm font-semibold text-white">{customAnalytics.businessCategory || "Unknown"}</p>
               </div>
               <div className="bg-[#1A1A26] rounded-lg p-3 text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Target Audience</span>
                  <p className="text-sm font-semibold text-white">{customAnalytics.persona?.ageGroup || "N/A"} {customAnalytics.persona?.gender || ""}</p>
               </div>
            </div>
          )}
        </div>

        <div className="bg-[#12121A] border border-[#2A2A3A] p-6 rounded-2xl">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Suggested Actions</h3>
          <div className="space-y-2">
            {quickActions.map((action, i) => (
              <button 
                key={i} 
                onClick={() => sendMessage(undefined, action)}
                className="w-full text-left text-sm text-blue-400 hover:bg-blue-500/10 p-2.5 rounded-lg transition-colors flex items-center gap-2"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#12121A] border border-[#2A2A3A] rounded-2xl overflow-hidden shadow-2xl">
        <div className="h-16 border-b border-[#2A2A3A] flex items-center px-6 gap-3">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h3 className="font-syne font-bold text-white text-lg">Chat Session</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 text-[15px] leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm whitespace-pre-wrap' 
                  : 'bg-[#1A1A26] text-slate-200 border border-[#2A2A3A] rounded-tl-sm shadow-sm'
              }`}>
                {msg.role === 'ai' ? (
                  <div className="markdown-body prose prose-invert prose-blue max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5 mt-0 mb-0">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#1A1A26] border border-[#2A2A3A] rounded-2xl rounded-tl-sm p-4 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-75" />
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-150" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-[#12121A] border-t border-[#2A2A3A]">
          <form onSubmit={sendMessage} className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything about your business..."
              className="w-full bg-[#1A1A26] border border-[#2A2A3A] text-white rounded-xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-500 shadow-inner"
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-3 text-xs text-slate-500">
             BizMind AI can make mistakes. Consider analyzing critical actions before executing.
          </div>
        </div>
      </div>
    </div>
  );
}
