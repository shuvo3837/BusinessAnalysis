/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit, 
  FileSpreadsheet, 
  RefreshCw, 
  Layers, 
  X, 
  UploadCloud, 
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from "lucide-react";

interface InventoryManagerProps {
  token: string | null;
  onRefreshTrigger: () => void;
}

export default function InventoryManager({ token, onRefreshTrigger }: InventoryManagerProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // CRUD state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [category, setCategory] = useState("Apparel");
  const [marketplace, setMarketplace] = useState("Shopify");

  // CSV paste state
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [csvMarketplace, setCsvMarketplace] = useState("Shopify");
  const [importResult, setImportResult] = useState<any>(null);

  const categories = ["Apparel", "Footwear", "Home Decor", "Accessories", "Electronics", "Beauty & Care"];
  const marketplaces = ["Shopify", "TikTok Shop", "Daraz", "Facebook"];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load products");
      setProducts(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setSku("");
    setName("");
    setStock("");
    setCostPrice("");
    setSellingPrice("");
    setCategory("Apparel");
    setMarketplace("Shopify");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingId(p.id);
    setSku(p.sku);
    setName(p.name);
    setStock(p.stock.toString());
    setCostPrice(p.costPrice.toString());
    setSellingPrice(p.sellingPrice.toString());
    setCategory(p.category);
    setMarketplace(p.marketplace);
    setIsFormOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const body = {
      sku,
      name,
      stock: Number(stock),
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      category,
      marketplace
    };

    const url = editingId ? `/api/inventory/${editingId}` : "/api/inventory";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Save endpoint failed.");

      setMessage(data.message);
      setIsFormOpen(false);
      fetchProducts();
      onRefreshTrigger();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product? All matching sales records will be cascade deleted too.")) return;
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");

      setMessage(data.message);
      fetchProducts();
      onRefreshTrigger();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleImportCSV = async () => {
    if (!csvText.trim()) return;
    setError("");
    setImportResult(null);

    try {
      const res = await fetch("/api/import-csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ csvData: csvText, marketplace: csvMarketplace })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setImportResult(data);
      setCsvText("");
      fetchProducts();
      onRefreshTrigger();
    } catch (err: any) {
      setError("Import failed: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Actions HUD */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-900 border border-slate-800 rounded-xl gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Store Inventory Stock manager</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Control live stock levels, configure unit wholsesale listings, and import spreadsheet logs.</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsCsvOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 font-medium text-xs text-slate-200 px-3 py-2 rounded-lg cursor-pointer border border-slate-700transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bulk Import CSV</span>
          </button>
          
          <button
            onClick={handleOpenCreate}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 font-medium text-xs text-white px-3.5 py-2 rounded-lg cursor-pointer transition-all shadow-lg shadow-indigo-600/10"
          >
            <Plus className="w-4 h-4" />
            <span>Register SKU</span>
          </button>
        </div>
      </div>

      {/* Info messages */}
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

      {/* Import Result Feedback */}
      {importResult && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 space-y-2">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>CSV Import Completed Successfully!</span>
          </h4>
          <p className="text-xs text-slate-300">
            Ingested <strong>{importResult.importedCount}</strong> SKU records dynamically.
          </p>
          <div className="bg-slate-950 p-2.5 rounded-lg text-[10px] font-mono text-slate-400">
            <span className="text-slate-500 block">Header auto-detections:</span>
            - SKU identified from Column: "{importResult.detectedMappings.sku}"<br/>
            - Title identified from Column: "{importResult.detectedMappings.name}"<br/>
            - Inventory levels from Column: "{importResult.detectedMappings.stock}"<br/>
            - Retail buying margin from Column: "{importResult.detectedMappings.costPrice}"
          </div>
          <button 
            onClick={() => setImportResult(null)} 
            className="text-[10px] text-indigo-400 hover:underline uppercase font-bold"
          >
            Clear Feedback
          </button>
        </div>
      )}

      {/* Products list Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
          <RefreshCw className="w-7 h-7 animate-spin text-indigo-400" />
          <span className="text-xs">Loading active store catalog...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
          <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-300">No Inventory Found</h4>
          <p className="text-xs text-slate-500 mt-1">Add manual items or upload a wholesale CSV list to start.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">SKU / Code ID</th>
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4 text-center">In Stock</th>
                  <th className="py-3 px-4 text-right">Cost Price / Buy</th>
                  <th className="py-3 px-4 text-right">Selling Price / Sale</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Listing Hub</th>
                  <th className="py-3 px-4 text-center">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {products.map((p) => {
                  const profitRatio = p.sellingPrice > 0 ? ((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100 : 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400 uppercase">{p.sku}</td>
                      <td className="py-3 px-4">
                        <span className="text-slate-100 font-semibold block">{p.name}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                          p.stock <= 5 
                            ? "bg-red-400/10 text-red-400 border border-red-500/20" 
                            : p.stock <= 15
                            ? "bg-amber-400/10 text-amber-400 border border-amber-500/20"
                            : "bg-emerald-400/10 text-emerald-400"
                        }`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">${p.costPrice.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-mono text-white font-semibold">${p.sellingPrice.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-full text-[10px] text-slate-400">{p.category}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-indigo-300 font-medium text-[11px]">{p.marketplace}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1 hover:text-white text-slate-400 hover:bg-slate-700/60 rounded transition-all cursor-pointer"
                            title="Edit Inventory Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1 hover:text-red-400 text-slate-400 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                            title="Delete SKU entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-950/40 text-[10px] text-slate-500 font-mono flex justify-between">
            <span>Total registered items: {products.length} catalog streams</span>
            <span>All values backed up locally</span>
          </div>
        </div>
      )}

      {/* Manual Add / Edit Modal Drawer */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>{editingId ? "Modify Registered SKU" : "Register New Product Stock"}</span>
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Unique Product SKU*</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingId}
                    placeholder="e.g. SNE-RUN-03"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 disabled:opacity-50 text-white text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Listing Channel*</label>
                  <select
                    value={marketplace}
                    onChange={(e) => setMarketplace(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    {marketplaces.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Descriptive Product Title*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cosmic Blue heavy weight Hoodie"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Initial Stock Level*</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="25"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Cost Price (Buy)*</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    placeholder="8.50"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Selling Price (Sale)*</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    placeholder="22.00"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Product Category Group</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-slate-400 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Save Product Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Paste Import Slide-Over Modal */}
      {isCsvOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
            <button
              onClick={() => setIsCsvOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <UploadCloud className="w-5 h-5 text-emerald-400" />
              <span>Smart Column Detection CSV Parser</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Paste spreadsheet comma separated values. Our AI engine automatically isolates columns matching titles, SKU keys, wholsesale cost and stocks.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Import To Account Hub</label>
                <select
                  value={csvMarketplace}
                  onChange={(e) => setCsvMarketplace(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none"
                >
                  {marketplaces.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="text-[11px] text-indigo-300 bg-indigo-950/40 p-2.5 border border-indigo-700/20 rounded-lg">
                <strong>💡 Quick Format Tip:</strong> Copy contents of any excel sheet, or paste matching format:<br/>
                <span className="font-mono text-slate-400 text-[10px]">SKU, Product Name, In Stock, Buying Cost, Retail Price, Category</span>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Raw CSV Text block</label>
                <textarea
                  rows={8}
                  placeholder={`SKU,Product Name,In Stock,Cost,Price,Category
JEAN-DEN-02,Classic Denim Skinny Jean,250,11.50,42.00,Apparel
SNE-SPRT-04,SpeedPro Lightweight Sneakers,42,22.00,68.00,Footwear
MUG-FLR-09,Floral Handcrafted Mug,110,2.80,12.50,Home Decor`}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs rounded-lg p-3 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setIsCsvOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-slate-400 rounded-lg cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleImportCSV();
                    setIsCsvOpen(false);
                  }}
                  disabled={!csvText.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Parse and Sync Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
