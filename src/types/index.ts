/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// The frontend never sees the admin role — admin auth lives in a separate
// JWT-protected surface (see /api/admin/login and /admin/login in the router).
export type UserRole = "Seller";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  stock: number;
  costPrice: number;
  sellingPrice: number;
  category: string;
  marketplace: string; // e.g. "Shopify", "TikTok Shop", "Daraz", "Facebook"
  createdAt: string;
}

export interface SaleRecord {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  sellingPrice: number;
  totalRevenue: number;
  costPrice: number;
  totalCost: number;
  profit: number;
  marketplace: string;
  saleDate: string; // YYYY-MM-DD
}

export interface ExpenseRecord {
  id: string;
  title: string;
  amount: number;
  category: string; // e.g. "Ads", "Shipping", "Platform Fees", "Packaging"
  expenseDate: string; // YYYY-MM-DD
  marketplace?: string;
}

export interface DemandForecast {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  forecast30d: number;
  forecast3m: number;
  forecast6m: number;
  confidenceScore: number; // 0 - 100
  growthProbability: number; // 0 - 100
  riskAnalysis: "Low Stock Risk" | "Healthy" | "Dead Stock Risk" | "High Volatility";
  suggestedRestockQuantity: number;
}

export interface MarketTrend {
  keyword: string;
  country: string; // e.g. "Global", "Bangladesh", "Pakistan", "United States"
  marketplace: string; // "Shopify" | "TikTok Shop" | "Daraz" | "Facebook"
  category: string;
  monthlySearches: number;
  growthTrend: number; // monthly percentage growth
  competition: "Low" | "Medium" | "High";
  seasonalPeak: string; // e.g. "November", "December", "Ramazan"
}

export interface MarketingStrategy {
  bestMarketplace: string;
  bundleIdeas: string[];
  postingTimes: string[];
  audienceTargeting: string[];
  optimizedTitle: string;
  optimizedDescription: string;
  seoKeywords: string[];
  adStrategy: {
    facebook: string;
    tiktok: string;
    budget: number;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  createdAt: string;
}

export interface CSVColumnMapping {
  sku: string;
  name: string;
  stock: string;
  costPrice: string;
  sellingPrice: string;
  category: string;
  marketplace: string;
}
