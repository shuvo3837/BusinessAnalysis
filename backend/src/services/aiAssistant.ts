/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AI Business Assistant service.
 *
 * Provides a single entry point — `generateAssistantReply` — that the `/api/chat`
 * route handler can call. The service:
 *
 *   1. Builds a compact business-context snapshot from the live MongoDB
 *      collections (products, sales, expenses, recent chat history, optional
 *      custom uploaded analytics).
 *   2. Tries Google Gemini first (the primary AI provider).
 *   3. On ANY error from Gemini (missing key, 429 quota, network, malformed
 *      response, etc.) — falls back to Groq (LLaMA 3.x).
 *   4. If both providers fail, returns a deterministic local "smart" reply
 *      built from the live numbers, so the UI is never broken.
 *
 * API keys live ONLY in process.env (loaded from `.env` via dotenv in
 * database/connection.ts). This module never imports them into a string the
 * frontend can ever see — they only flow into server-side SDK constructors.
 */

import { GoogleGenAI } from "@google/genai";
import type { Collections } from "../database/collections";
import type { ChatMessage } from "../types";

export type AssistantSource = "gemini" | "groq" | "local";

export interface AssistantResult {
  text: string;
  source: AssistantSource;
  warning?: string;
}

export interface GenerateOptions {
  message: string;
  customContext?: any;
  /** Cap on how many historical turns are sent to the LLM. Default 10. */
  historyLimit?: number;
}

interface BusinessSnapshot {
  productCount: number;
  salesCount: number;
  expenseCount: number;
  totalRevenue: number;
  totalProfit: number;
  totalExpenses: number;
  netProfit: number;
  inventoryValue: number;
  lowStockProducts: { name: string; sku: string; stock: number; marketplace: string }[];
  deadStockProducts: { name: string; sku: string; stock: number; idleValue: number }[];
  topProducts: { name: string; sku: string; units: number; revenue: number }[];
  marketBreakdown: { marketplace: string; revenue: number; profit: number; units: number }[];
  recentSales: { productName: string; qty: number; revenue: number; date: string; marketplace: string }[];
  inventoryLines: string[];
  hasCustomContext: boolean;
  customContextLabel?: string;
}

/**
 * Build a deterministic snapshot of the user's business state. Returns numbers
 * the LLM can quote verbatim so the answer is grounded in the live DB.
 */
function buildSnapshot(db: Collections, customContext?: any): BusinessSnapshot {
  const products = db.products.toArray();
  const sales = db.sales.toArray();
  const expenses = db.expenses.toArray();

  const totalRevenue = sales.reduce((s, r) => s + r.totalRevenue, 0);
  const totalProfit = sales.reduce((s, r) => s + r.profit, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalProfit - totalExpenses;
  const inventoryValue = products.reduce((s, p) => s + p.stock * p.costPrice, 0);

  const lowStockProducts = products
    .filter((p) => p.stock <= 15)
    .map((p) => ({ name: p.name, sku: p.sku, stock: p.stock, marketplace: p.marketplace }))
    .slice(0, 8);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentActiveIds = new Set(
    sales.filter((s) => new Date(s.saleDate) >= thirtyDaysAgo).map((s) => s.productId)
  );
  const deadStockProducts = products
    .filter((p) => p.stock >= 50 && !recentActiveIds.has(p.id))
    .map((p) => ({
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      idleValue: Number((p.stock * p.costPrice).toFixed(2)),
    }))
    .slice(0, 8);

  const topProducts = products
    .map((p) => {
      const productSales = sales.filter((s) => s.productId === p.id);
      const units = productSales.reduce((sum, s) => sum + s.quantity, 0);
      const revenue = productSales.reduce((sum, s) => sum + s.totalRevenue, 0);
      return { name: p.name, sku: p.sku, units, revenue };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const marketMap: Record<string, { revenue: number; profit: number; units: number }> = {};
  sales.forEach((s) => {
    const m = s.marketplace || "Shopify";
    if (!marketMap[m]) marketMap[m] = { revenue: 0, profit: 0, units: 0 };
    marketMap[m].revenue += s.totalRevenue;
    marketMap[m].profit += s.profit;
    marketMap[m].units += s.quantity;
  });
  const marketBreakdown = Object.entries(marketMap)
    .map(([marketplace, v]) => ({
      marketplace,
      revenue: Number(v.revenue.toFixed(2)),
      profit: Number(v.profit.toFixed(2)),
      units: v.units,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const recentSales = sales
    .slice()
    .sort((a, b) => (a.saleDate < b.saleDate ? 1 : -1))
    .slice(0, 8)
    .map((s) => ({
      productName: s.productName,
      qty: s.quantity,
      revenue: Number(s.totalRevenue.toFixed(2)),
      date: s.saleDate,
      marketplace: s.marketplace,
    }));

  const inventoryLines = products.map(
    (p) =>
      `${p.name} (SKU ${p.sku}) — stock ${p.stock}, price $${p.sellingPrice} (cost $${p.costPrice}), ${p.category} on ${p.marketplace}`
  );

  return {
    productCount: products.length,
    salesCount: sales.length,
    expenseCount: expenses.length,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalProfit: Number(totalProfit.toFixed(2)),
    totalExpenses: Number(totalExpenses.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2)),
    inventoryValue: Number(inventoryValue.toFixed(2)),
    lowStockProducts,
    deadStockProducts,
    topProducts,
    marketBreakdown,
    recentSales,
    inventoryLines,
    hasCustomContext: !!customContext,
    customContextLabel: customContext?.businessCategory || undefined,
  };
}

/** Format the snapshot into a system prompt the LLM can read. */
function buildSystemPrompt(snapshot: BusinessSnapshot, hasCustomContext: boolean): string {
  const lowStock = snapshot.lowStockProducts
    .map((p) => `- ${p.name} (${p.sku}) — ${p.stock} units left on ${p.marketplace}`)
    .join("\n") || "- None right now.";

  const deadStock = snapshot.deadStockProducts
    .map((p) => `- ${p.name} (${p.sku}) — ${p.stock} units, ~$${p.idleValue} tied up`)
    .join("\n") || "- None right now.";

  const top = snapshot.topProducts
    .map((p, i) => `${i + 1}. ${p.name} (${p.sku}) — ${p.units} units, $${p.revenue.toFixed(2)} revenue`)
    .join("\n") || "- No sales recorded yet.";

  const markets = snapshot.marketBreakdown
    .map((m) => `- ${m.marketplace}: $${m.revenue.toFixed(2)} revenue, $${m.profit.toFixed(2)} profit, ${m.units} units`)
    .join("\n") || "- No marketplace data.";

  const recent = snapshot.recentSales
    .map((s) => `- ${s.date} ${s.marketplace}: ${s.qty} × ${s.productName} = $${s.revenue.toFixed(2)}`)
    .join("\n") || "- No recent sales.";

  const inventory = snapshot.inventoryLines.join("\n") || "- Inventory empty.";

  return `You are BizGrow AI's "AI Business Assistant" — a personal business analyst embedded in the user's SaaS dashboard.

VOICE & RULES
- Speak directly to the business owner in the second person ("you", "your store").
- Be a senior partner: precise, tactical, and commercially useful. No fluff.
- Always quote the EXACT product names, SKUs, prices, and dollar numbers provided in the live database snapshot below. Never invent figures.
- When the user asks about inventory, sales, profit, forecasts, or growth, anchor your answer to the snapshot — not generic advice.
- Format responses in clean Markdown: short paragraphs, bullet lists for action items, bold for product names and key numbers, and headings only when the answer is long.
- If the user's question is ambiguous, ask ONE clarifying question instead of guessing.
- If you don't have enough data for a confident answer, say so explicitly and recommend the next data to capture.

WHAT YOU CAN DO
1. Explain dashboard metrics in plain language and surface what looks healthy vs. risky.
2. Analyze sales performance: top sellers, weak categories, channel mix, margin pressure.
3. Recommend inventory actions: which SKUs to restock now, which to discount, dead stock to liquidate.
4. Forecast demand using the snapshot (recent velocity vs. current stock).
5. Suggest growth strategies: pricing, bundles, ad budget allocation by channel, cross-sell ideas.
6. Draft copy hooks, ad headlines, and campaign briefs when asked.

${
  hasCustomContext
    ? "NOTE: The user has uploaded a custom CSV/dataset. The snapshot below is the LIVE database state — you may also reference the user's customContext passed in the user message. Prefer the live numbers when both are available, and call out deltas."
    : "Use ONLY the live database snapshot below. Do not invent data."
}

--- LIVE DATABASE SNAPSHOT ---
Generated: ${new Date().toISOString()}

HEADLINE METRICS
- Products in catalog: ${snapshot.productCount}
- Sales logged: ${snapshot.salesCount}
- Expenses logged: ${snapshot.expenseCount}
- Total revenue: $${snapshot.totalRevenue.toFixed(2)}
- Gross profit (from sales): $${snapshot.totalProfit.toFixed(2)}
- Total operating expenses: $${snapshot.totalExpenses.toFixed(2)}
- Net profit (profit − expenses): $${snapshot.netProfit.toFixed(2)}
- Inventory tied up at cost: $${snapshot.inventoryValue.toFixed(2)}

TOP PRODUCTS BY REVENUE
${top}

LOW STOCK ALERTS (≤ 15 units)
${lowStock}

DEAD STOCK (≥ 50 units, no sales in last 30 days)
${deadStock}

MARKETPLACE BREAKDOWN
${markets}

RECENT SALES (latest 8)
${recent}

FULL INVENTORY
${inventory}
`;
}

/**
 * Deterministic offline reply built from the snapshot. Used as a final safety
 * net so the chat UI is never broken even if both AI providers are down.
 */
function buildLocalFallbackReply(message: string, snapshot: BusinessSnapshot): string {
  const lower = message.toLowerCase();
  const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (/(restock|stock|inventory|low)/.test(lower)) {
    const critical = snapshot.lowStockProducts;
    if (critical.length === 0) {
      return `Inventory looks healthy — no SKU is at or below the 15-unit threshold right now across ${snapshot.productCount} catalog items.\n\nYou have **${fmt(snapshot.inventoryValue)}** in inventory tied up at cost, so the next decision is *which* items to push, not *which* to refill.`;
    }
    const list = critical
      .slice(0, 5)
      .map((p) => `- **${p.name}** — ${p.stock} units left on ${p.marketplace}`)
      .join("\n");
    return `**Restock priorities** based on current stock levels:\n\n${list}\n\nTotal inventory on hand: **${fmt(snapshot.inventoryValue)}**. I'd suggest a 2-week safety stock on the top sellers above and a flash bundle on the dead stock list before pushing more ad spend.`;
  }

  if (/(sale|revenue|profit|earnings|money|top|best|performance)/.test(lower)) {
    const top = snapshot.topProducts
      .slice(0, 3)
      .map((p, i) => `${i + 1}. **${p.name}** — ${p.units} units, ${fmt(p.revenue)}`)
      .join("\n");
    const markets = snapshot.marketBreakdown
      .slice(0, 3)
      .map((m) => `- ${m.marketplace}: ${fmt(m.revenue)} revenue, ${fmt(m.profit)} profit`)
      .join("\n");
    return `**Performance snapshot**\n\n- Total revenue tracked: **${fmt(snapshot.totalRevenue)}**\n- Gross profit from sales: **${fmt(snapshot.totalProfit)}**\n- Net profit after expenses: **${fmt(snapshot.netProfit)}**\n- Operating expenses logged: **${fmt(snapshot.totalExpenses)}**\n\n**Top sellers by revenue:**\n${top}\n\n**Channel mix:**\n${markets}\n\nWant me to dig into margins by SKU or compare marketplace efficiency?`;
  }

  if (/(forecast|predict|next month|growth|future|30 day)/.test(lower)) {
    const totalUnits30 = snapshot.topProducts.reduce((s, p) => s + Math.round(p.units / 60) * 30, 0);
    return `**Forward outlook (next 30 days, based on recent velocity)**\n\n- Projected unit sales across top SKUs: **~${totalUnits30} units**\n- Estimated revenue range: **${fmt((snapshot.totalRevenue / 60) * 30 * 0.85)} – ${fmt((snapshot.totalRevenue / 60) * 30 * 1.15)}**\n\nHeadwinds to watch:\n${snapshot.lowStockProducts.slice(0, 3).map((p) => `- ${p.name} will stock out before the end of the window`).join("\n") || "- None — inventory is sufficient."}\n\nTo sharpen this forecast, share last quarter's monthly sales and we'll model seasonality instead of a flat 30-day average.`;
  }

  if (/(market|facebook|tiktok|daraz|shopify|channel|platform)/.test(lower)) {
    const rows = snapshot.marketBreakdown
      .map((m) => `- **${m.marketplace}** — ${fmt(m.revenue)} revenue, ${m.units} units, profit ${fmt(m.profit)}`)
      .join("\n");
    return `**Marketplace breakdown**\n\n${rows || "No sales recorded yet."}\n\nIf you're optimizing spend, the channel with the highest revenue isn't always the most profitable — check profit-per-unit before reallocating ad budget.`;
  }

  if (/(strategy|growth|scale|advice|recommend|how to|increase)/.test(lower)) {
    return `**Three growth moves I'd prioritize right now:**\n\n1. **Protect the winners.** ${snapshot.topProducts[0]?.name ?? "Your top SKU"} is driving most of the revenue — make sure it can't stock out (currently **${snapshot.lowStockProducts.find((p) => p.name === snapshot.topProducts[0]?.name)?.stock ?? "OK"}** units).\n2. **Liquidate dead inventory.** Bundle slow movers with the top sellers to lift AOV without extra ad spend.\n3. **Re-allocate by channel profitability.** Your mix is: ${snapshot.marketBreakdown.map((m) => `${m.marketplace} (${fmt(m.profit)})`).join(", ")}. Shift budget toward whichever is delivering the highest profit-per-unit.\n\nNet profit currently: **${fmt(snapshot.netProfit)}**. Tell me which lever you want to pull first and I'll go deeper.`;
  }

  return `I'm running in **offline analysis mode** (no AI provider is reachable right now), but I still have full access to your live numbers:\n\n- Revenue tracked: **${fmt(snapshot.totalRevenue)}**\n- Net profit: **${fmt(snapshot.netProfit)}**\n- SKUs in catalog: **${snapshot.productCount}**\n- Items needing restock: **${snapshot.lowStockProducts.length}**\n\nTry asking me: *which products should I restock?*, *why are my profits dropping?*, or *how should I split my ad budget?*`;
}

/**
 * Call Google Gemini with a system prompt and message history. Throws on any
 * failure so the caller can fall through to Groq.
 */
async function callGemini(
  systemInstruction: string,
  message: string,
  history: { role: "user" | "model"; text: string }[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set");
  }
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: { "User-Agent": "aistudio-build" },
    },
  });

  const historyContents = history.map((h) => ({
    role: h.role,
    parts: [{ text: h.text }],
  }));

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      ...historyContents,
      { role: "user", parts: [{ text: message }] },
    ],
    config: { systemInstruction },
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

/**
 * Call Groq chat completions via REST. We avoid the `groq-sdk` package
 * intentionally: it's a thin wrapper around this endpoint and skipping it
 * means one fewer dependency for the project to install / vendor.
 * Throws on any failure so the caller can fall through to the local reply.
 */
async function callGroq(
  systemInstruction: string,
  message: string,
  history: { role: "user" | "model"; text: string }[]
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not set");
  }
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemInstruction },
    ...history.map((h) => ({
      role: (h.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: h.text,
    })),
    { role: "user", content: message },
  ];

  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.5,
      max_tokens: 1024,
    }),
  });

  if (!resp.ok) {
    const errBody = await resp.text().catch(() => "");
    throw new Error(`Groq HTTP ${resp.status}: ${errBody.slice(0, 200) || resp.statusText}`);
  }

  const data: any = await resp.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Groq returned empty response");
  return text;
}

/**
 * Public entry point. Returns an `AssistantResult` and never throws — the
 * worst-case behavior is a deterministic offline reply so the UI stays alive.
 */
export async function generateAssistantReply(
  db: Collections,
  options: GenerateOptions
): Promise<AssistantResult> {
  const { message, customContext, historyLimit = 10 } = options;

  const snapshot = buildSnapshot(db, customContext);
  const systemInstruction = buildSystemPrompt(snapshot, snapshot.hasCustomContext);

  // Build conversation history from the persisted chats (slice last N turns).
  const historyRaw: ChatMessage[] = db.chats.toArray();
  const history = historyRaw.slice(-historyLimit).map((c) => ({
    role: c.role === "user" ? ("user" as const) : ("model" as const),
    text: c.text,
  }));

  // Try Gemini first.
  try {
    const text = await callGemini(systemInstruction, message, history);
    return { text, source: "gemini" };
  } catch (geminiErr: any) {
    const geminiMsg = geminiErr?.message || "Gemini call failed";
    console.warn("[aiAssistant] Gemini failed, attempting Groq fallback:", geminiMsg);

    // Try Groq second.
    try {
      const text = await callGroq(systemInstruction, message, history);
      return {
        text,
        source: "groq",
        warning: `Gemini unavailable (${geminiMsg}). Served via Groq fallback.`,
      };
    } catch (groqErr: any) {
      const groqMsg = groqErr?.message || "Groq call failed";
      console.warn("[aiAssistant] Groq also failed, serving offline fallback:", groqMsg);

      // Final safety net: deterministic local reply.
      const text = buildLocalFallbackReply(message, snapshot);
      return {
        text,
        source: "local",
        warning: `AI providers unavailable (Gemini: ${geminiMsg}; Groq: ${groqMsg}). Showing offline analysis.`,
      };
    }
  }
}
