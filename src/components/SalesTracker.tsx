/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  DollarSign, 
  ShoppingCart, 
  TrendingDown, 
  RefreshCw, 
  Download, 
  Calendar, 
  X, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

interface SalesTrackerProps {
  token: string | null;
  onRefreshTrigger: () => void;
}

export default function SalesTracker({ token, onRefreshTrigger }: SalesTrackerProps) {
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingExp, setLoadingExp] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Modals state
  const [isSaleOpen, setIsSaleOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);

  // Form Fields - Sale
  const [saleProductId, setSaleProductId] = useState("");
  const [saleQty, setSaleQty] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [saleMarketplace, setSaleMarketplace] = useState("");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split("T")[0]);

  // Form Fields - Expense
  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] = useState("Ads");
  const [expMarketplace, setExpMarketplace] = useState("Shopify");
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);

  const expenseCategories = ["Ads", "Platform Fees", "Shipping", "Packaging", "Employee Salary", "Utilities"];
  const marketplaces = ["All Channels", "Shopify", "TikTok Shop", "Daraz", "Facebook"];

  useEffect(() => {
    fetchSales();
    fetchExpenses();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/inventory", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(data);
        if (data.length > 0) setSaleProductId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSales = async () => {
    setLoadingSales(true);
    try {
      const res = await fetch("/api/sales", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cannot load transactions list");
      setSales(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingSales(false);
    }
  };

  const fetchExpenses = async () => {
    setLoadingExp(true);
    try {
      const res = await fetch("/api/expenses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cannot load expenses list");
      setExpenses(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingExp(false);
    }
  };

  // Log sale
  const handleLogSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const linkedProduct = products.find(p => p.id === saleProductId);
    if (!linkedProduct) {
      setError("Please register associated product first.");
      return;
    }

    const price = Number(salePrice) || linkedProduct.sellingPrice;

    const body = {
      productId: saleProductId,
      quantity: Number(saleQty),
      sellingPrice: price,
      marketplace: saleMarketplace || linkedProduct.marketplace,
      saleDate
    };

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Logged sale process failed");

      setMessage(data.message);
      setIsSaleOpen(false);
      setSaleQty("");
      setSalePrice("");
      fetchSales();
      fetchProducts(); // Refresh stocks list
      onRefreshTrigger();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Delete sale
  const handleDeleteSale = async (id: string) => {
    if (!window.confirm("Verify: Deleting sale refunds matching product items back into the stock. Proceed?")) return;
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/sales/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(data.message);
      fetchSales();
      fetchProducts(); // Refresh stocks list
      onRefreshTrigger();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Log expense
  const handleLogExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const body = {
      title: expTitle,
      amount: Number(expAmount),
      category: expCategory,
      marketplace: expMarketplace === "All Channels" ? undefined : expMarketplace,
      expenseDate: expDate
    };

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(data.message);
      setIsExpenseOpen(false);
      setExpTitle("");
      setExpAmount("");
      fetchExpenses();
      onRefreshTrigger();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Delete expense
  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this expense entry?")) return;
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(data.message);
      fetchExpenses();
      onRefreshTrigger();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Real working CSV download trigger
  const exportToCSV = (type: "sales" | "expenses") => {
    let headers = "";
    let rows = "";
    let fileName = "";

    if (type === "sales") {
      headers = "Date,SKU,Product Name,Quantity,Sold Price ($),Total Revenue ($),Total Wholesale Cost ($),Gross Profit ($),Marketplace Channel\n";
      rows = sales.map(s => 
        `"${s.saleDate}","${s.sku}","${s.productName}",${s.quantity},${s.sellingPrice},${s.totalRevenue},${s.totalCost},${s.profit},"${s.marketplace}"`
      ).join("\n");
      fileName = "sales-export-commerce-copilot.csv";
    } else {
      headers = "Date,Expense Title,Amount ($),Category Type,Marketplace Allocation\n";
      rows = expenses.map(e => 
        `"${e.expenseDate}","${e.title}",${e.amount},"${e.category}","${e.marketplace || 'Shared'}"`
      ).join("\n");
      fileName = "expenses-export-commerce-copilot.csv";
    }

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Title block HUD */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-900 border border-slate-800 rounded-xl gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-400" />
            <span>Multi-channel Financial ledger</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Audit transaction entries, logs, channel payouts, and overhead business advertising expenses.</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsExpenseOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700/90 font-medium text-xs text-slate-300 px-3 py-2 rounded-lg cursor-pointer border border-slate-700 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-amber-500" />
            <span>Log Expense Overhead</span>
          </button>
          
          <button
            onClick={() => setIsSaleOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-505 font-medium text-xs text-white px-3.5 py-2 rounded-lg cursor-pointer transition-all shadow-lg shadow-indigo-600/10"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Transaction Sale</span>
          </button>
        </div>
      </div>

      {infoLayout(error, message)}

      {/* Grid container split logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        
        {/* Sales log list */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center bg-slate-900">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                <ShoppingCart className="w-4 h-4 text-indigo-400" />
                <span>Historical Transactions ledger</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Logged sales and calculated retail profits.</p>
            </div>

            <button
              onClick={() => exportToCSV("sales")}
              disabled={sales.length === 0}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-950 border border-slate-800 rounded-md cursor-pointer disabled:opacity-40 transition-all flex items-center gap-1"
            >
              <Download className="w-3 h-3 text-indigo-400" />
              <span>Export CSV</span>
            </button>
          </div>

          {loadingSales ? (
            <div className="py-12 text-center text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-xs">Loading sales...</span>
            </div>
          ) : sales.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-12 border border-dashed border-slate-800 rounded-lg">No trading transactions verified in database.</p>
          ) : (
            <div className="overflow-x-auto border border-slate-850 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[9px] uppercase tracking-wider text-slate-400 font-mono">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Revenue</th>
                    <th className="py-2.5 px-3 text-right">Profit</th>
                    <th className="py-2.5 px-3">Marketplace</th>
                    <th className="py-2.5 px-3 text-center">Ctrl</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 text-[11px]">
                      <td className="py-2 px-3 font-mono text-[10.5px] text-slate-400">{s.saleDate}</td>
                      <td className="py-2 px-3 font-mono font-bold text-indigo-400 uppercase">{s.sku}</td>
                      <td className="py-2 px-3 font-medium text-slate-200">{s.productName}</td>
                      <td className="py-2 px-3 text-center font-mono font-bold">{s.quantity}</td>
                      <td className="py-2 px-3 text-right font-mono text-white">${s.totalRevenue.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-400 font-bold">${s.profit.toFixed(2)}</td>
                      <td className="py-2 px-3 text-indigo-300 font-medium">{s.marketplace}</td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleDeleteSale(s.id)}
                          className="p-1 hover:text-red-400 hover:bg-red-500/10 rounded cursor-pointer"
                          title="Delete sale log & return stock"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Expenses overhead list */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center bg-slate-900">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                <TrendingDown className="w-4 h-4 text-amber-500" />
                <span>Overhead Expenses tracker</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Platform plans, return stock feeds and ad targets.</p>
            </div>

            <button
              onClick={() => exportToCSV("expenses")}
              disabled={expenses.length === 0}
              className="px-2 py-1 text-[10px] font-bold text-slate-300 hover:text-white bg-slate-950 border border-slate-800 rounded-md cursor-pointer disabled:opacity-40 transition-all flex items-center gap-1"
            >
              <Download className="w-2.5 h-2.5 text-amber-400" />
              <span>Export CSV</span>
            </button>
          </div>

          {loadingExp ? (
            <div className="py-12 text-center text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-xs">Loading expenses...</span>
            </div>
          ) : expenses.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-12 border border-dashed border-slate-800 rounded-lg">No platform overhead logs logged.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {expenses.map((e) => (
                <div key={e.id} className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-200 block">{e.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{e.expenseDate} • {e.category}</span>
                    {e.marketplace && (
                      <span className="text-[9px] text-indigo-400 uppercase tracking-widest block font-bold font-mono">Hub: {e.marketplace}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-amber-400 font-mono">${e.amount.toFixed(0)}</span>
                    <button
                      onClick={() => handleDeleteExpense(e.id)}
                      className="p-1 hover:text-red-400 hover:bg-red-500/10 rounded cursor-pointer text-slate-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Manual Insert Transaction Modal Dialog */}
      {isSaleOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
            <button
              onClick={() => setIsSaleOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-indigo-400" />
              <span>Log Transaction Sale manually</span>
            </h3>

            {products.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                You must register at least one product in your inventory catalog first!
              </div>
            ) : (
              <form onSubmit={handleLogSale} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-450 uppercase tracking-wider mb-1">Select Product SKU*</label>
                  <select
                    value={saleProductId}
                    onChange={(e) => setSaleProductId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>[{p.sku}] {p.name} (Stock: {p.stock})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-450 uppercase tracking-wider mb-1">Quantity Sold*</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 2"
                      value={saleQty}
                      onChange={(e) => setSaleQty(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg p-2.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-450 uppercase tracking-wider mb-1">Sold Unit Price*</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Leave blank to use default price"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg p-2.5 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-450 uppercase tracking-wider mb-1">Platform Account</label>
                    <select
                      value={saleMarketplace}
                      onChange={(e) => setSaleMarketplace(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg p-2 focus:outline-none"
                    >
                      <option value="">Use item default hub</option>
                      {marketplaces.slice(1).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-450 uppercase tracking-wider mb-1">Transaction Date*</label>
                    <input
                      type="date"
                      required
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg p-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsSaleOpen(false)}
                    className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-slate-400 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg cursor-pointer"
                  >
                    Post Transaction Sale
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Manual Insert Expense Modal Dialog */}
      {isExpenseOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
            <button
              onClick={() => setIsExpenseOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-amber-500" />
              <span>Log Business Expense overhead</span>
            </h3>

            <form onSubmit={handleLogExpense} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-450 uppercase tracking-wider mb-1">Expense Title/Notes*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TikTok Influencer partnership Hoodie launch"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg p-2.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-450 uppercase tracking-wider mb-1">Expense Amount ($)*</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 150"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg p-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-450 uppercase tracking-wider mb-1">Expense Categories</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg p-2.5 focus:outline-none"
                  >
                    {expenseCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-450 uppercase tracking-wider mb-1">Applicable Hub Channel</label>
                  <select
                    value={expMarketplace}
                    onChange={(e) => setExpMarketplace(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg p-2.5 focus:outline-none"
                  >
                    {marketplaces.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-455 uppercase tracking-wider mb-1">Expense Logged Date*</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsExpenseOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-slate-400 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Post Expense Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function infoLayout(error: string, message: string) {
  if (!error && !message) return null;
  return (
    <div className="space-y-2">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl p-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
