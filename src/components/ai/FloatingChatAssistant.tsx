import React, { useState, useEffect, useRef, useCallback } from "react";
import { apiFetch } from "../../lib/api";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Loader2,
  ArrowRight,
  Trash2,
  Minus,
} from "lucide-react";
import Markdown from "react-markdown";
import { useBusiness } from "../../context/BusinessContext";

type Role = "user" | "model";

interface ChatTurn {
  id: string;
  role: Role;
  text: string;
  source?: "gemini" | "groq" | "local";
  warning?: string;
  createdAt: string;
}

const SUGGESTED_QUESTIONS = [
  "Which products should I restock first?",
  "What are my top sellers and why are they winning?",
  "How is each marketplace performing in profit?",
  "Forecast next month's revenue based on current trends",
  "Suggest a growth strategy for the next 30 days",
  "Which SKUs are dead stock and how should I clear them?",
  "Help me draft a launch campaign for my best product",
];

const SOURCE_BADGE: Record<NonNullable<ChatTurn["source"]>, { label: string; cls: string }> = {
  gemini: { label: "via Gemini", cls: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  groq: { label: "via Groq", cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  local: { label: "offline analysis", cls: "bg-slate-500/15 text-slate-300 border-slate-500/30" },
};

export default function FloatingChatAssistant() {
  const { customAnalytics } = useBusiness();

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasHistory, setHasHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial load: pull chat history from the backend so the conversation
  // survives across sessions.
  useEffect(() => {
    if (!open || hasHistory) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/api/chat");
        if (!res.ok) throw new Error(`History HTTP ${res.status}`);
        const data: Array<{ id: string; role: Role; text: string; createdAt: string }> = await res.json();
        if (cancelled) return;
        const turns: ChatTurn[] = (data || []).map((m) => ({
          id: m.id,
          role: m.role,
          text: m.text,
          createdAt: m.createdAt,
        }));
        if (turns.length === 0) {
          turns.push({
            id: "welcome",
            role: "model",
            text: `Hi! I'm your **AI Business Assistant**. I can see your live sales, inventory, expenses, and forecasts — ask me anything about your store, and I'll answer with real numbers.\n\n${customAnalytics ? `I noticed you uploaded a dataset categorized as **${customAnalytics.businessCategory || "Unknown"}** — I'll factor that in too.\n\n` : ""}Try one of the suggested questions below to get started.`,
            createdAt: new Date().toISOString(),
          });
        }
        setMessages(turns);
        setHasHistory(true);
      } catch (err) {
        if (cancelled) return;
        setMessages([
          {
            id: "welcome-fallback",
            role: "model",
            text:
              "I'm your AI Business Assistant. I couldn't load your previous conversation, but I still have access to your live store data. Ask me about restocking, profits, growth strategy, or anything else.",
            createdAt: new Date().toISOString(),
          },
        ]);
        setHasHistory(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, hasHistory, customAnalytics]);

  // Auto-scroll on new content.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input when panel opens.
  useEffect(() => {
    if (open && !minimized) {
      // Slight delay so the panel finishes its transition.
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [open, minimized]);

  const sendMessage = useCallback(
    async (textOverride?: string) => {
      const textToSend = (textOverride ?? input).trim();
      if (!textToSend || loading) return;

      const optimisticId = "u-" + Math.random().toString(36).slice(2, 9);
      const userTurn: ChatTurn = {
        id: optimisticId,
        role: "user",
        text: textToSend,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userTurn]);
      setInput("");
      setLoading(true);

      try {
        const res = await apiFetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: textToSend,
            customContext: customAnalytics,
          }),
        });
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }
        const data = await res.json();
        const replyText: string =
          data?.chat?.text ?? data?.reply ?? "I didn't get a response. Please try again.";
        const source = (data?.source as ChatTurn["source"]) ?? undefined;
        const warning: string | undefined = data?.warning;

        const aiTurn: ChatTurn = {
          id: data?.chat?.id ?? "m-" + Math.random().toString(36).slice(2, 9),
          role: "model",
          text: replyText,
          source,
          warning,
          createdAt: data?.chat?.createdAt ?? new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiTurn]);
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            id: "err-" + Math.random().toString(36).slice(2, 9),
            role: "model",
            text:
              "I'm having trouble reaching the assistant service. Please check your connection and try again.",
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, customAnalytics]
  );

  const handleClearHistory = useCallback(async () => {
    if (!window.confirm("Clear this chat session from view? Your server-side history will be replaced on the next message.")) {
      return;
    }
    // We don't expose a delete endpoint; locally reset and let the next
    // message start fresh. The persisted history will still be there but
    // hidden behind the welcome screen.
    setMessages([
      {
        id: "welcome-reset",
        role: "model",
        text: "Chat cleared locally. Ask me anything — your new question will continue the conversation.",
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  // --- Render ---

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setMinimized(false);
        }}
        aria-label="Open AI Business Assistant"
        className="fixed bottom-5 right-5 z-40 group flex items-center gap-2 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-3.5 shadow-2xl shadow-blue-900/40 ring-1 ring-white/10 transition-all hover:scale-[1.03] active:scale-95"
      >
        <span className="relative">
          <MessageCircle className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0A0A0F]" />
        </span>
        <span className="hidden sm:inline text-sm font-semibold pr-1">Ask AI</span>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-40 transition-all duration-200 ${
        minimized
          ? "bottom-5 right-5 w-72"
          : "bottom-5 right-5 sm:bottom-6 sm:right-6 w-[calc(100vw-2.5rem)] sm:w-[420px] h-[min(78vh,640px)]"
      }`}
      role="dialog"
      aria-label="AI Business Assistant"
    >
      <div className="flex flex-col h-full bg-[#12121A] border border-[#2A2A3A] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#2A2A3A] bg-gradient-to-r from-blue-600/10 to-indigo-600/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0 w-9 h-9 rounded-full bg-blue-500/15 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-blue-400" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#12121A]" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">
                AI Business Assistant
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                Live data · Gemini + Groq fallback
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setMinimized((m) => !m)}
              aria-label={minimized ? "Expand chat" : "Minimize chat"}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                handleClearHistory();
              }}
              aria-label="Clear chat history"
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#0F0F16]"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[88%]">
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-[14.5px] leading-relaxed shadow-sm ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-tr-sm whitespace-pre-wrap"
                          : "bg-[#1A1A26] text-slate-200 border border-[#2A2A3A] rounded-tl-sm"
                      }`}
                    >
                      {msg.role === "model" ? (
                        <div className="markdown-body prose prose-invert prose-blue max-w-none prose-p:my-1.5 prose-headings:my-2 prose-ul:my-1.5 prose-li:my-0.5 prose-strong:text-white prose-strong:font-semibold prose-a:text-blue-400">
                          <Markdown>{msg.text}</Markdown>
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>
                    {msg.role === "model" && msg.source && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 pl-1">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${
                            SOURCE_BADGE[msg.source].cls
                          }`}
                        >
                          {SOURCE_BADGE[msg.source].label}
                        </span>
                        {msg.warning && (
                          <span
                            className="text-[10px] text-slate-500 truncate max-w-[200px]"
                            title={msg.warning}
                          >
                            {msg.warning}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#1A1A26] border border-[#2A2A3A] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                    <span className="text-xs text-slate-400">Analyzing your store…</span>
                    <span className="flex gap-1 ml-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse [animation-delay:120ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse [animation-delay:240ms]" />
                    </span>
                  </div>
                </div>
              )}

              {/* Suggested questions (only show when there's just the welcome turn) */}
              {messages.length <= 1 && !loading && (
                <div className="pt-2 space-y-2">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-1">
                    Try asking
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => sendMessage(q)}
                        className="text-left text-[13px] text-blue-300 hover:text-blue-200 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/15 rounded-lg px-3 py-2 transition-colors flex items-start gap-2"
                      >
                        <ArrowRight className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>{q}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="px-3 py-3 bg-[#12121A] border-t border-[#2A2A3A]"
            >
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about restock, sales, growth strategy…"
                  disabled={loading}
                  className="w-full bg-[#1A1A26] border border-[#2A2A3A] text-white rounded-xl pl-4 pr-12 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-500 disabled:opacity-60 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="absolute right-1.5 p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[10px] text-slate-500 text-center mt-2">
                Answers are generated from your live store data. Verify before acting.
              </div>
            </form>
          </>
        )}

        {minimized && (
          <button
            type="button"
            onClick={() => setMinimized(false)}
            className="flex-1 px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/[0.02] transition-colors truncate"
          >
            Click to expand the assistant…
          </button>
        )}
      </div>
    </div>
  );
}
