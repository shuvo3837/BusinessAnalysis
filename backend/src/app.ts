/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import {
  User,
  Product,
  SaleRecord,
  ExpenseRecord,
  DemandForecast,
  MarketTrend,
  MarketingStrategy,
  ChatMessage
} from "./types";
import { connectMongoWithFallback } from "./database/connection";
import { loadCollections, createFallbackCollections, Collections } from "./database/collections";
import { resolveServerPort } from "./utils/port";
import { verifyAdminCredentials, signAdminJwt } from "./services/adminAuth";
import { requireAdmin } from "./middleware/requireAdmin";

// Resolves this module's path in BOTH ESM (tsx / dev) and CJS (esbuild / `npm run build`).
// In CJS, `__filename` / `__dirname` are provided natively; in ESM we derive them from
// `import.meta.url`. We use distinct local bindings to avoid the ESM temporal dead zone:
// declaring `const __filename` inside an ESM module shadows the CJS global, and reading
// the LHS binding during its own initializer throws "Cannot access '__filename' before
// initialization". The aliases are installed on `globalThis` below so the rest of the
// file (and any code that reads `__dirname`) keeps working unchanged.
const moduleFilename: string =
  typeof (globalThis as { __filename?: unknown }).__filename === "string"
    ? ((globalThis as unknown as { __filename: string }).__filename)
    : fileURLToPath(import.meta.url);
const moduleDirname = path.dirname(moduleFilename);
// Expose `__filename` / `__dirname` for the rest of the file (CJS-style references).
// In ESM these globals don't exist; in CJS the original globals are already present.
if (typeof (globalThis as { __filename?: unknown }).__filename !== "string") {
  (globalThis as unknown as { __filename: string }).__filename = moduleFilename;
}
if (typeof (globalThis as { __dirname?: unknown }).__dirname !== "string") {
  (globalThis as unknown as { __dirname: string }).__dirname = moduleDirname;
}

// Setup and start server
async function startServer() {
  const app = express();
  const PORT = resolveServerPort(process.env.PORT, 3000);

  app.use(express.json({ limit: "50mb" }));

  // CORS for split-origin deploys (frontend on Vercel, backend on Render).
  // When the SPA and API share an origin this is a no-op.
  app.use(
    cors({
      origin: (origin, cb) => cb(null, true),
      credentials: false,
    })
  );

  // Connect to MongoDB and hydrate in-memory caches for each collection.
  // Route handlers see an array-like facade (push/find/filter/...) so the
  // vast majority of existing handler code works unchanged.
  const mongoState = await connectMongoWithFallback();
  let db: Collections;
  if (mongoState.connected && mongoState.db) {
    db = await loadCollections(mongoState.db);
  } else {
    console.warn("Using fallback in-memory data because MongoDB is unavailable.");
    db = createFallbackCollections();
  }

  // Generate seeds for realistic eCommerce operation
  async function seedDb() {
    console.log("Seeding initial database...");
    
    // Seed Users
    const adminUser: User = {
      id: "u-admin",
      email: "seller@partner.com",
      name: "Alex Mercer",
      role: "Seller",
      createdAt: new Date().toISOString()
    };
    await db.users.replaceAll([adminUser]);

    // Seed Products
    const products: Product[] = [
      {
        id: "p-1",
        sku: "TSH-COT-01",
        name: "Premium Cotton T-Shirt",
        stock: 142,
        costPrice: 8.00,
        sellingPrice: 22.00,
        category: "Apparel",
        marketplace: "Shopify",
        createdAt: "2026-03-01T10:00:00Z"
      },
      {
        id: "p-2",
        sku: "HOO-BLU-02",
        name: "Cosmic Blue heavyweight Hoodie",
        stock: 25,
        costPrice: 18.00,
        sellingPrice: 48.00,
        category: "Apparel",
        marketplace: "TikTok Shop",
        createdAt: "2026-03-05T11:00:00Z"
      },
      {
        id: "p-3",
        sku: "SNE-RUN-03",
        name: "AirFlex Running Sneakers",
        stock: 3,
        costPrice: 25.00,
        sellingPrice: 75.00,
        category: "Footwear",
        marketplace: "Daraz",
        createdAt: "2026-03-10T09:30:00Z"
      },
      {
        id: "p-4",
        sku: "MUG-CER-04",
        name: "Ceramic Minimalist Mug",
        stock: 210,
        costPrice: 3.50,
        sellingPrice: 14.50,
        category: "Home Decor",
        marketplace: "Facebook",
        createdAt: "2026-03-12T14:15:00Z"
      },
      {
        id: "p-5",
        sku: "BAG-LEA-05",
        name: "Classic Leather Backpack",
        stock: 12,
        costPrice: 32.00,
        sellingPrice: 89.00,
        category: "Accessories",
        marketplace: "Shopify",
        createdAt: "2026-03-15T15:40:00Z"
      },
      {
        id: "p-6",
        sku: "FIT-BAND-06",
        name: "PulseTrack Smart Gym Band",
        stock: 80,
        costPrice: 15.00,
        sellingPrice: 39.99,
        category: "Electronics",
        marketplace: "TikTok Shop",
        createdAt: "2026-03-18T16:00:00Z"
      }
    ];
    await db.products.replaceAll(products);

    // Seed historical sales for the past 60 days
    const sales: SaleRecord[] = [];
    const baseDate = new Date();
    
    // Distribute sales across products to make trends
    products.forEach((prod) => {
      // Loop over 60 days
      for (let i = 60; i >= 0; i--) {
        const date = new Date();
        date.setDate(baseDate.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        // Random sales rate based on product characteristics
        let salesChance = 0.4;
        let maxQty = 3;

        if (prod.sku === "TSH-COT-01") {
          salesChance = 0.75; // Fast seller
          maxQty = 8;
        } else if (prod.sku === "HOO-BLU-02") {
          salesChance = 0.55; // Seasonal peak
          maxQty = 4;
        } else if (prod.sku === "SNE-RUN-03") {
          salesChance = 0.25; // Slower, higher ticket
          maxQty = 2;
        } else if (prod.sku === "MUG-CER-04") {
          salesChance = 0.8; // Daily small ticket
          maxQty = 12;
        }

        if (Math.random() < salesChance) {
          const quantity = Math.floor(Math.random() * maxQty) + 1;
          const totalRevenue = Number((quantity * prod.sellingPrice).toFixed(2));
          const totalCost = Number((quantity * prod.costPrice).toFixed(2));
          const profit = Number((totalRevenue - totalCost).toFixed(2));

          sales.push({
            id: `s-${prod.sku}-${i}-${Math.random().toString(36).substr(2, 4)}`,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            quantity,
            sellingPrice: prod.sellingPrice,
            totalRevenue,
            costPrice: prod.costPrice,
            totalCost,
            profit,
            marketplace: prod.marketplace,
            saleDate: dateStr
          });
        }
      }
    });

    await db.sales.replaceAll(sales);

    // Seed Expenses (Ads, Fees, etc) for past 2 months
    const expenses: ExpenseRecord[] = [
      { id: "e-1", title: "TikTok Ad Campaign - Hoodies", amount: 250, category: "Ads", expenseDate: "2026-05-10", marketplace: "TikTok Shop" },
      { id: "e-2", title: "Shopify Platform Plan & App Fees", amount: 49, category: "Platform Fees", expenseDate: "2026-05-01", marketplace: "Shopify" },
      { id: "e-3", title: "Facebook Group Ads - Home Decor", amount: 120, category: "Ads", marketplace: "Facebook", expenseDate: "2026-05-15" },
      { id: "e-4", title: "Packaging Box Shipments", amount: 75, category: "Packaging", expenseDate: "2026-05-20" },
      { id: "e-5", title: "Daraz Campaign Promotion Boost", amount: 110, category: "Ads", marketplace: "Daraz", expenseDate: "2026-05-25" },
      { id: "e-6", title: "Customer Returns & Restocking Fees", amount: 45, category: "Shipping", expenseDate: "2026-05-28" },
      { id: "e-7", title: "Shopify Google Ads - Summer Launch", amount: 180, category: "Ads", marketplace: "Shopify", expenseDate: "2026-06-01" }
    ];
    await db.expenses.replaceAll(expenses);

    // Seed AI Chats
    await db.chats.replaceAll([
      {
        id: "c-1",
        role: "model",
        text: "Hello! I am your AI Business Partner. I have loaded your sales and inventory data from Shopify, TikTok Shop, Daraz, and Facebook. I can help analyze your profits, recommend restock guidelines, list your best & worst performing assets, and draft customized ad campaigns. What business question can I answer for you today?",
        createdAt: new Date().toISOString()
      }
    ]);
  }

  // Seed if any collection is empty (i.e. fresh MongoDB deployment).
  if (
    db.users.isEmpty() ||
    db.products.isEmpty() ||
    db.sales.isEmpty() ||
    db.expenses.isEmpty() ||
    db.chats.isEmpty()
  ) {
    await seedDb();
  }
  console.log(`Database ready. ${db.products.length} products, ${db.sales.length} sales found.`);

  // Auth User Extraction middleware
  app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      // Simplify jwt structure: find user matches token (which here is the user's ID)
      const user = db.users.find(u => u.id === token);
      if (user) {
        (req as any).user = user;
      }
    }
    next();
  });

  // Lazy initialize GoogleGenAI safely in compliance with the system guidelines
  function getGenAI() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Go to Settings > Secrets in the AI Studio panel.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }

  // --- API ROUTE GROUPS ---

  // AUTH API
  app.post("/api/auth/register", (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Required fields missing." });
    }
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: "Email already registered." });
    }
    // Role is fixed at registration time — clients cannot self-elevate.
    // Admin email from .env auto-elevates to Admin role so the same /login
    // surface grants access to the admin dashboard for that account.
    const isAdminEmail =
      !!process.env.ADMIN_EMAIL &&
      email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
    const newUser: User = {
      id: "u-" + Math.random().toString(36).substr(2, 9),
      name,
      email,
      role: isAdminEmail ? "Admin" : "Seller",
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);


    res.json({ user: newUser, token: newUser.id, message: "Registration successful!" });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    // Admin credentials from .env are accepted through this same /login
    // surface so the operator doesn't need a separate /admin/login page.
    const isAdminEmail =
      !!process.env.ADMIN_EMAIL &&
      email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
    if (
      isAdminEmail &&
      process.env.ADMIN_PASSWORD &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const adminUser: User = {
        id: "u-admin",
        name: process.env.ADMIN_NAME || "Admin",
        email: process.env.ADMIN_EMAIL!,
        role: "Admin",
        createdAt: new Date().toISOString(),
      };
      // Sign a real admin JWT (HS256) so the existing requireAdmin middleware
      // on /api/admin/* routes accepts this token without changes.
      const adminToken = signAdminJwt({
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: "ADMIN",
      });
      return res.json({
        user: adminUser,
        token: adminToken,
        refreshToken: "rt-" + adminToken,
        message: "Admin authentication successful!",
      });
    }

    // Simulating login: verify or dynamically register/find
    let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Create user automatically for sandbox convenience if it doesn't exist, to prevent blockages
      user = {
        id: "u-" + Math.random().toString(36).substr(2, 9),
        name: email.split("@")[0],
        email,
        role: "Seller",
        createdAt: new Date().toISOString()
      };
      db.users.push(user);

    }

    res.json({
      user,
      token: user.id,
      refreshToken: "rt-" + user.id,
      message: "Authentication successful!"
    });
  });

  app.get("/api/auth/me", (req, res) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }
    res.json({ user });
  });

  // --- ADMIN API (separate auth, hidden URL) ---
  // Admin credentials live in env (ADMIN_EMAIL / ADMIN_PASSWORD). There is no
  // admin user record in the database and no link to /admin/login anywhere
  // in the public frontend. All /api/admin/* routes are gated by requireAdmin.
  app.post("/api/admin/login", async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    try {
      const result = await verifyAdminCredentials(email, password);
      if (!result.ok) {
        return res.status(401).json({ error: "Invalid admin credentials." });
      }
      const token = signAdminJwt(result.principal);
      // Strip the internal id from the public response shape.
      const { id, ...adminPublic } = result.principal;
      return res.json({
        admin: adminPublic,
        token,
        message: "Admin authentication successful.",
      });
    } catch (err) {
      console.error("[admin login] error:", err);
      return res.status(500).json({ error: "Admin auth unavailable." });
    }
  });

  app.get("/api/admin/verify", requireAdmin, (req, res) => {
    res.json({ admin: req.admin });
  });

  // Protected admin endpoints — gated by requireAdmin middleware.
  app.get("/api/admin/users", requireAdmin, (req, res) => {
    res.json({
      count: db.users.length,
      users: db.users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      })),
    });
  });

  app.get("/api/admin/stats", requireAdmin, (req, res) => {
    res.json({
      users: db.users.length,
      products: db.products.length,
      sales: db.sales.length,
      expenses: db.expenses.length,
      chats: db.chats.length,
    });
  });

  // INVENTORY API
  app.get("/api/inventory", (req, res) => {
    res.json(db.products);
  });

  app.post("/api/inventory", (req, res) => {
    const { sku, name, stock, costPrice, sellingPrice, category, marketplace } = req.body;
    if (!sku || !name || stock === undefined || costPrice === undefined || sellingPrice === undefined) {
      return res.status(400).json({ error: "Missing required product parameters" });
    }

    // Check duplicate SKU
    if (db.products.some(p => p.sku.toUpperCase() === sku.toUpperCase())) {
      return res.status(400).json({ error: "Product SKU already exists in inventory." });
    }

    const newProduct: Product = {
      id: "p-" + Math.random().toString(36).substr(2, 9),
      sku: sku.toUpperCase(),
      name,
      stock: Number(stock),
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      category: category || "Uncategorized",
      marketplace: marketplace || "Shopify",
      createdAt: new Date().toISOString()
    };

    db.products.push(newProduct);

    res.json({ product: newProduct, message: "Product saved to inventory." });
  });

  app.put("/api/inventory/:id", async (req, res) => {
    const { id } = req.params;
    const { name, stock, costPrice, sellingPrice, category, marketplace } = req.body;
    const existing = db.products.find(p => p.id === id);
    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    const updated = {
      ...existing,
      name: name || existing.name,
      stock: stock !== undefined ? Number(stock) : existing.stock,
      costPrice: costPrice !== undefined ? Number(costPrice) : existing.costPrice,
      sellingPrice: sellingPrice !== undefined ? Number(sellingPrice) : existing.sellingPrice,
      category: category || existing.category,
      marketplace: marketplace || existing.marketplace
    };

    await db.products.updateOne((p) => p.id === id, () => updated);

    res.json({ product: updated, message: "Inventory record updated." });
  });

  app.delete("/api/inventory/:id", async (req, res) => {
    const { id } = req.params;
    await db.products.removeWhere(p => p.id === id);
    await db.sales.removeWhere(s => s.productId === id); // Cascade delete matching sales

    res.json({ success: true, message: "Product deleted from inventory." });
  });

  // SALES RECORD API
  app.get("/api/sales", (req, res) => {
    res.json(db.sales);
  });

  app.post("/api/sales", async (req, res) => {
    const { productId, quantity, sellingPrice, marketplace, saleDate } = req.body;
    if (!productId || !quantity || !sellingPrice || !saleDate) {
      return res.status(400).json({ error: "Required fields missing for sales record" });
    }

    const linkedProduct = db.products.find(p => p.id === productId);
    if (!linkedProduct) {
      return res.status(404).json({ error: "Associated product not registered in system." });
    }

    // Double check stock
    if (linkedProduct.stock < quantity) {
      // Let them make the sale anyway, but warn or reduce stock to low/negative
      console.warn("Selling quantity exceeds current inventory stock.");
    }

    const price = Number(sellingPrice);
    const qty = Number(quantity);
    const totalRevenue = Number((qty * price).toFixed(2));
    const totalCost = Number((qty * linkedProduct.costPrice).toFixed(2));
    const profit = Number((totalRevenue - totalCost).toFixed(2));

    const newSale: SaleRecord = {
      id: "s-" + Math.random().toString(36).substr(2, 9),
      productId: linkedProduct.id,
      productName: linkedProduct.name,
      sku: linkedProduct.sku,
      quantity: qty,
      sellingPrice: price,
      totalRevenue,
      costPrice: linkedProduct.costPrice,
      totalCost,
      profit,
      marketplace: marketplace || linkedProduct.marketplace,
      saleDate
    };

    // Deduct stock levels dynamically and persist to MongoDB.
    const newStock = Math.max(0, linkedProduct.stock - qty);
    await db.products.updateOne(
      (p) => p.id === linkedProduct.id,
      (p) => ({ ...p, stock: newStock })
    );

    db.sales.push(newSale);

    res.json({ sale: { ...newSale, _updatedStock: newStock }, message: "Sale logged and inventory adjusted." });
  });

  app.delete("/api/sales/:id", async (req, res) => {
    const { id } = req.params;
    // Refund stock to inventory before logging deletion
    const sale = db.sales.find(s => s.id === id);
    if (sale) {
      const prod = db.products.find(p => p.id === sale.productId);
      if (prod) {
        await db.products.updateOne(
          (p) => p.id === prod.id,
          (p) => ({ ...p, stock: p.stock + sale.quantity })
        );
      }
    }
    await db.sales.removeWhere((s) => s.id === id);

    res.json({ success: true, message: "Sale removed and stock replenished." });
  });

  // EXPENSE API
  app.get("/api/expenses", (req, res) => {
    res.json(db.expenses);
  });

  app.post("/api/expenses", (req, res) => {
    const { title, amount, category, expenseDate, marketplace } = req.body;
    if (!title || !amount || !category || !expenseDate) {
      return res.status(400).json({ error: "Missing required expense details." });
    }

    const newExpense: ExpenseRecord = {
      id: "e-" + Math.random().toString(36).substr(2, 9),
      title,
      amount: Number(amount),
      category,
      expenseDate,
      marketplace
    };

    db.expenses.push(newExpense);

    res.json({ expense: newExpense, message: "Expense logged successfully." });
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    const { id } = req.params;
    await db.expenses.removeWhere((e) => e.id === id);

    res.json({ success: true, message: "Expense entry deleted." });
  });

  // BACKEND CSV IMPORT WITH AUTO COLUMN DETECTION
  app.post("/api/import-csv", async (req, res) => {
    const { csvData, marketplace } = req.body;
    if (!csvData) {
      return res.status(400).json({ error: "No CSV data found in request payload" });
    }

    try {
      const lines = csvData.split(/\r?\n/).filter((l: string) => l.trim().length > 0);
      if (lines.length < 2) {
        return res.status(400).json({ error: "CSV must contain a header and at least one data row" });
      }

      // Read headers and normalize them
      const rawHeaders: string[] = lines[0].split(",").map((h: string) => h.replace(/["']/g, "").trim());
      const lowerHeaders = rawHeaders.map(h => h.toLowerCase());

      // Auto-detect index mappings
      let skuIdx = lowerHeaders.findIndex(h => h.includes("sku") || h.includes("code") || h.includes("key"));
      let nameIdx = lowerHeaders.findIndex(h => h.includes("name") || h.includes("title") || h.includes("product") || h.includes("desc"));
      let stockIdx = lowerHeaders.findIndex(h => h.includes("stock") || h.includes("qty") || h.includes("quantity") || h.includes("inventory") || h.includes("level"));
      let costIdx = lowerHeaders.findIndex(h => h.includes("cost") || h.includes("buying") || h.includes("purchase") || h.includes("wholesale"));
      let sellIdx = lowerHeaders.findIndex(h => h.includes("sell") || h.includes("price") || h.includes("retail") || h.includes("mrp"));
      let catIdx = lowerHeaders.findIndex(h => h.includes("category") || h.includes("type") || h.includes("group"));

      // Set fallback indices if some are missing
      if (skuIdx === -1) skuIdx = 0;
      if (nameIdx === -1) nameIdx = Math.min(1, rawHeaders.length - 1);
      if (stockIdx === -1) stockIdx = Math.min(2, rawHeaders.length - 1);
      if (costIdx === -1) costIdx = Math.min(3, rawHeaders.length - 1);
      if (sellIdx === -1) sellIdx = Math.min(4, rawHeaders.length - 1);
      if (catIdx === -1) catIdx = Math.min(5, rawHeaders.length - 1);

      let importedCount = 0;
      let errorRecords: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(",").map((c: string) => c.replace(/["']/g, "").trim());
        if (columns.length < Math.max(skuIdx, nameIdx, stockIdx, costIdx, sellIdx) + 1) {
          errorRecords.push(`Line ${i+1}: Columns count is less than expected layout`);
          continue;
        }

        const sku = columns[skuIdx]?.toUpperCase() || `SKU-TEMP-${Math.floor(Math.random() * 10000)}`;
        const name = columns[nameIdx] || "Imported Product";
        const stock = parseFloat(columns[stockIdx]) || 10;
        const costPrice = parseFloat(columns[costIdx]) || 5;
        const sellingPrice = parseFloat(columns[sellIdx]) || 15;
        const category = columns[catIdx] || "Imported";

        // De-duplicate: if product already exists, update stock levels, else create new
        const existing = db.products.find(p => p.sku === sku);
        if (existing) {
          // Persist the merged record so the change survives a restart.
          await db.products.updateOne(
            (p) => p.id === existing.id,
            (p) => ({
              ...p,
              stock: (p.stock || 0) + stock,
              costPrice,
              sellingPrice
            })
          );
        } else {
          db.products.push({
            id: "p-" + Math.random().toString(36).substr(2, 9),
            sku,
            name,
            stock,
            costPrice,
            sellingPrice,
            category,
            marketplace: marketplace || "Shopify",
            createdAt: new Date().toISOString()
          });
        }
        importedCount++;
      }


      res.json({
        success: true,
        importedCount,
        errors: errorRecords,
        detectedMappings: {
          headers: rawHeaders,
          sku: rawHeaders[skuIdx],
          name: rawHeaders[nameIdx],
          stock: rawHeaders[stockIdx],
          costPrice: rawHeaders[costIdx],
          sellingPrice: rawHeaders[sellIdx],
          category: rawHeaders[catIdx]
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: "Failed to parse CSV. " + e.message });
    }
  });

  // ANALYTICS & REVENUE API
  app.post("/api/analyze-file", async (req, res) => {
    try {
      const { base64Data, mimeType } = req.body;
      if (!base64Data || !mimeType) {
        return res.status(400).json({ error: "Missing file data" });
      }

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { data: base64Data, mimeType: mimeType } },
              { text: `Analyze this business data file. We need to create a smart business analyst response based ONLY on this data. Extract and compute the following accurately based on the content.

Do NOT give generic advice. Adapt everything to the specific data and business type.

1. Identifiy the Business Category (e.g., Agriculture, Fashion, Electronics, Beauty, Grocery, Handmade, etc.) based on the products.
2. Business Performance: Total Revenue, Gross Profit Margin, Open Orders, Average Order Value.
3. Trend data for daily sales to chart.
4. Category breakdown for profit.
5. Customer Persona Analysis based on what these products are (Age group, Gender, Customer Type, Ideal Region). 
6. Marketing Strategy: 3-5 relevant, practical marketing strategies tailored STRICTLY to this business category (e.g. if agriculture, mention local farming groups, seasonal campaigns). No generic stuff.
7. Top 3 fast-selling products and 3 slow-selling or dead stock products.
8. AI Forecast: Predict products needing restocking, expected future sales growth, best selling periods.

Return ONLY a pure JSON response matching the following schema. NO markdown backticks:
{
  "businessCategory": "string",
  "performance": { "totalRevenue": number, "grossProfitMargin": number, "openOrders": number, "averageOrderValue": number },
  "persona": { "ageGroup": "string", "gender": "string", "customerType": "string", "region": "string", "summary": "string" },
  "strategies": ["strategy 1", "strategy 2", "strategy 3"],
  "fastSelling": [{ "name": "string", "sales": number }],
  "slowSelling": [{ "name": "string", "stock": number }],
  "forecast": { "restockRecommendations": ["string"], "expectedGrowth": "string", "bestMonths": "string" },
  "trendData": [{ "date": "string", "revenue": number, "profit": number}],
  "categoryDistribution": [{ "name": "string", "value": number }]
}` }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });
      let dataText = response.text || "{}";
      dataText = dataText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const data = JSON.parse(dataText);
      res.json(data);
    } catch (e: any) {
      console.error("Analysis Error:", e);
      let errorMsg = e.message || "Failed to analyze document. Ensure it is a valid business text or document format.";
      if (errorMsg.includes("429") || errorMsg.includes("Quota exceeded") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
        errorMsg = "AI rate limit exceeded. Please wait a minute and try again.";
      }
      res.status(500).json({ error: errorMsg });
    }
  });

  app.post("/api/scan-note", async (req, res) => {
    try {
      const { base64Data, mimeType } = req.body;
      if (!base64Data || !mimeType) {
        return res.status(400).json({ error: "Missing image data" });
      }

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { data: base64Data, mimeType: mimeType } },
              { text: `Analyze this handwritten business note, khata page, invoice, or receipt. Extract the sales, inventory updates, and expenses accurately. 
Handle messy handwriting, misspellings, or mixed language (like transliterated Bengali).
Return ONLY a pure JSON response matching this schema. NO markdown backticks:
{
  "sales": [{ "item": "string", "qty": number, "amount": number }],
  "expenses": [{ "item": "string", "amount": number }],
  "summary": "Brief 1-2 sentence AI summary of these records indicating performance or actions to take.",
  "analytics": {
     "businessCategory": "Unknown",
     "performance": { "totalRevenue": number, "grossProfitMargin": number, "openOrders": number, "averageOrderValue": number },
     "persona": { "ageGroup": "Unknown", "gender": "Unknown", "customerType": "Unknown", "region": "Unknown", "summary": "Unknown" },
     "strategies": ["strategy 1"],
     "fastSelling": [{ "name": "string", "sales": number }],
     "slowSelling": [{ "name": "string", "stock": number }],
     "forecast": { "restockRecommendations": ["string"], "expectedGrowth": "string", "bestMonths": "string" },
     "trendData": [{ "date": "string", "revenue": number, "profit": number}],
     "categoryDistribution": [{ "name": "string", "value": number }]
  }
}
Note: For the 'analytics' object, generate an updated mock/simulated full analytical context relying on these new single-day/note inputs extrapolated out, so it can be updated into the system's global context seamlessly.` }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });
      let dataText = response.text || "{}";
      dataText = dataText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const data = JSON.parse(dataText);
      res.json(data);
    } catch (e: any) {
      console.error("Scan Error:", e);
      res.status(500).json({ error: e.message || "Failed to scan business note." });
    }
  });

  app.get("/api/analytics", (req, res) => {
    const products = db.products;
    const sales = db.sales;
    const expenses = db.expenses;

    // Standard Math Calculation (Real math, not placeholders)
    const totalRevenue = sales.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalCostOfGoods = sales.reduce((sum, item) => sum + item.totalCost, 0);
    const grossProfit = totalRevenue - totalCostOfGoods;
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const netProfit = grossProfit - totalExpenses;

    const inventoryValue = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
    const potentialRevenue = products.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0);

    // Compute Low Stock Alerts (threshold: 15)
    const lowStockAlerts = products.filter(p => p.stock <= 15).map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      marketplace: p.marketplace
    }));

    // Dead stock prediction: Stock > 50 and zero sales logged in previous 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const activeProductSalesIds = new Set(
      sales
        .filter(s => new Date(s.saleDate) >= thirtyDaysAgo)
        .map(s => s.productId)
    );

    const deadStockAlerts = products.filter(p => p.stock >= 50 && !activeProductSalesIds.has(p.id)).map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      marketplace: p.marketplace,
      idleValue: p.stock * p.costPrice
    }));

    // Sales by marketplace distribution
    const marketPerformance: Record<string, { revenue: number; profit: number; volume: number }> = {};
    sales.forEach(s => {
      const market = s.marketplace || "Shopify";
      if (!marketPerformance[market]) {
        marketPerformance[market] = { revenue: 0, profit: 0, volume: 0 };
      }
      marketPerformance[market].revenue += s.totalRevenue;
      marketPerformance[market].profit += s.profit;
      marketPerformance[market].volume += s.quantity;
    });

    const marketDistribution = Object.keys(marketPerformance).map(key => ({
      name: key,
      revenue: Number(marketPerformance[key].revenue.toFixed(2)),
      profit: Number(marketPerformance[key].profit.toFixed(2)),
      volume: marketPerformance[key].volume
    }));

    // Monthly category performance
    const categoryPerformance: Record<string, number> = {};
    sales.forEach(s => {
      // Find category of matching product
      const prod = products.find(p => p.id === s.productId);
      const cat = prod ? prod.category : "Others";
      categoryPerformance[cat] = (categoryPerformance[cat] || 0) + s.totalRevenue;
    });

    const categoryDistribution = Object.keys(categoryPerformance).map(cat => ({
      name: cat,
      value: Number(categoryPerformance[cat].toFixed(2))
    }));

    res.json({
      summary: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalCostOfGoods: Number(totalCostOfGoods.toFixed(2)),
        grossProfit: Number(grossProfit.toFixed(2)),
        totalExpenses: Number(totalExpenses.toFixed(2)),
        netProfit: Number(netProfit.toFixed(2)),
        inventoryValue: Number(inventoryValue.toFixed(2)),
        potentialRevenue: Number(potentialRevenue.toFixed(2))
      },
      lowStockAlerts,
      deadStockAlerts,
      marketDistribution,
      categoryDistribution
    });
  });

  // SALES DEMAND FORECASTING IMPLEMENTATION
  app.get("/api/forecasting", (req, res) => {
    const products = db.products;
    const sales = db.sales;

    // Auto calculate Sales forecasting for each product
    const forecasts: DemandForecast[] = products.map(prod => {
      const prodSales = sales.filter(s => s.productId === prod.id);
      
      // Calculate average daily sales rate over 60 days
      const totalUnitsSold = prodSales.reduce((sum, s) => sum + s.quantity, 0);
      const dailySalesRate = totalUnitsSold / 60; // Average of past 60 days

      // Predict values
      const forecast30d = Math.round(dailySalesRate * 30);
      const forecast3m = Math.round(dailySalesRate * 90);
      const forecast6m = Math.round(dailySalesRate * 180);

      // Growth probability
      // If sale count in second half of 60 days is greater than first half, positive trajectory
      const midpointDate = new Date();
      midpointDate.setDate(midpointDate.getDate() - 30);
      
      const firstHalfSales = prodSales.filter(s => new Date(s.saleDate) < midpointDate).reduce((sum, s) => sum + s.quantity, 0);
      const secondHalfSales = prodSales.filter(s => new Date(s.saleDate) >= midpointDate).reduce((sum, s) => sum + s.quantity, 0);

      let growthProbability = 50; // standard flat trend
      if (firstHalfSales > 0) {
        const ratio = secondHalfSales / firstHalfSales;
        growthProbability = Math.min(98, Math.max(5, Math.round(50 * ratio)));
      } else if (secondHalfSales > 0) {
        growthProbability = 85; // new soaring product
      }

      // Confidence score depends on volume (more samples = higher confidence)
      const confidenceScore = Math.min(95, Math.max(30, Math.round(30 + (prodSales.length * 1.5))));

      // Suggest restock quantity based on 30d forecast
      const neededQty = forecast30d * 1.2; // 20% safety margin buffer
      const suggestedRestockQuantity = Math.max(0, Math.round(neededQty - prod.stock));

      // Risk level determination
      let riskAnalysis: DemandForecast["riskAnalysis"] = "Healthy";
      if (prod.stock <= 5) {
        riskAnalysis = "Low Stock Risk";
      } else if (prod.stock > 100 && totalUnitsSold < 5) {
        riskAnalysis = "Dead Stock Risk";
      } else if (prodSales.length > 5 && growthProbability > 70 && prod.stock <= forecast30d) {
        riskAnalysis = "Low Stock Risk";
      }

      return {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        currentStock: prod.stock,
        forecast30d,
        forecast3m,
        forecast6m,
        confidenceScore,
        growthProbability,
        riskAnalysis,
        suggestedRestockQuantity
      };
    });

    res.json(forecasts);
  });

  // MARKET INTELLIGENCE ENGINE
  app.get("/api/market-trends", (req, res) => {
    const { country, marketplace, category } = req.query;

    const baseTrends: MarketTrend[] = [
      { keyword: "Oversized Cotton Hoodies", country: "United States", marketplace: "Shopify", category: "Apparel", monthlySearches: 45000, growthTrend: 28, competition: "High", seasonalPeak: "November" },
      { keyword: "Summer Linen Tops", country: "United States", marketplace: "Shopify", category: "Apparel", monthlySearches: 32000, growthTrend: 15, competition: "Medium", seasonalPeak: "July" },
      { keyword: "Minimalist Kitchen Mug", country: "United States", marketplace: "Facebook", category: "Home Decor", monthlySearches: 18000, growthTrend: 8, competition: "Low", seasonalPeak: "December" },
      
      { keyword: "Active Jogging Runners", country: "Pakistan", marketplace: "Daraz", category: "Footwear", monthlySearches: 25000, growthTrend: 34, competition: "Medium", seasonalPeak: "October" },
      { keyword: "Orthopedic Comfort Sandals", country: "Pakistan", marketplace: "Daraz", category: "Footwear", monthlySearches: 12000, growthTrend: -5, competition: "Low", seasonalPeak: "June" },
      { keyword: "Saffron Spiced Tea Cups", country: "Pakistan", marketplace: "Facebook", category: "Home Decor", monthlySearches: 8500, growthTrend: 12, competition: "Low", seasonalPeak: "Winter" },

      { keyword: "Premium Leather Backpacks", country: "Global", marketplace: "Shopify", category: "Accessories", monthlySearches: 85000, growthTrend: 22, competition: "High", seasonalPeak: "September" },
      { keyword: "Smart Sleep Tracker Bands", country: "Global", marketplace: "TikTok Shop", category: "Electronics", monthlySearches: 130000, growthTrend: 45, competition: "High", seasonalPeak: "December" },
      { keyword: "Unisex Vintage Tees", country: "Global", marketplace: "TikTok Shop", category: "Apparel", monthlySearches: 95000, growthTrend: 52, competition: "Medium", seasonalPeak: "April" },

      { keyword: "Matte Ceramic Dinnerware", country: "Bangladesh", marketplace: "Facebook", category: "Home Decor", monthlySearches: 15000, growthTrend: 18, competition: "Low", seasonalPeak: "Eid Season" },
      { keyword: "Anti-blue Light Smart Bands", country: "Bangladesh", marketplace: "TikTok Shop", category: "Electronics", monthlySearches: 42000, growthTrend: 25, competition: "Medium", seasonalPeak: "September" },
      { keyword: "Waterproof Hiking Travel Bag", country: "Bangladesh", marketplace: "Shopify", category: "Accessories", monthlySearches: 19000, growthTrend: 30, competition: "Medium", seasonalPeak: "June" }
    ];

    // Dynamic filtering
    let filtered = baseTrends;
    
    if (country && country !== "All") {
      filtered = filtered.filter(t => t.country.toLowerCase() === (country as string).toLowerCase());
    }
    if (marketplace && marketplace !== "All") {
      filtered = filtered.filter(t => t.marketplace.toLowerCase() === (marketplace as string).toLowerCase());
    }
    if (category && category !== "All") {
      filtered = filtered.filter(t => t.category.toLowerCase() === (category as string).toLowerCase());
    }

    res.json(filtered);
  });

  // AI MARKETING STRATEGIST PROMPT (Gemini Grounded Integration)
  app.post("/api/marketing/strategy", async (req, res) => {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required." });
    }

    const prod = db.products.find(p => p.id === productId);
    if (!prod) {
      return res.status(404).json({ error: "Product not found." });
    }

    // Capture actual sales metrics for context
    const sales = db.sales.filter(s => s.productId === prod.id);
    const unitsSold = sales.reduce((sum, s) => sum + s.quantity, 0);

    try {
      const isKeySet = !!process.env.GEMINI_API_KEY;
      if (!isKeySet) {
        // Fallback Strategy Generation locally if key is missing to maintain usability
        return res.json({
          strategy: {
            bestMarketplace: prod.marketplace || "Shopify",
            bundleIdeas: [
              `Buy 2 ${prod.name} & get FREE custom gift packaging`,
              `${prod.name} Summer Essential Starter Kit bundle`
            ],
            postingTimes: ["11:00 AM (Audience Peak)", "7:30 PM (TikTok prime shopping hour)", "2:00 PM (Sunday group deal hour)"],
            audienceTargeting: ["Young Entrepreneurs, Trend Followers", "Age 18-34, active in Shopping & Fashion", "Interests in eCommerce, Online Shopping"],
            optimizedTitle: `🔥 [Best Seller] Modern ${prod.name} – Premium Comfort Grade`,
            optimizedDescription: `Experience state-of-the-art beauty with our customized ${prod.name}. Durable material design, optimized for high durability and modern aesthetic standards. Loved by over ${unitsSold + 45} vendors worldwide. Get yours today!`,
            seoKeywords: [prod.name.toLowerCase(), "trending apparel", `${prod.category.toLowerCase()} catalog`, "free shipping", "tiktok recommendation"],
            adStrategy: {
              facebook: "Launch high-engagement video ads with direct call-to-action hooks. Run a lookalike audience campaign centered around repeat customers.",
              tiktok: "Leverage UGC micro-creators showing real unboxing experiences. Host a 10% coupon promo with countdown tags.",
              budget: 450
            }
          },
          isDemo: true
        });
      }

      // Live Gemini connection
      const ai = getGenAI();
      const prompt = `
        You are a world-class senior eCommerce growth hacker, CTO, and digital marketing expert.
        Formulate a pristine, high-conversion Marketing Strategy context for this item:
        - Product Name: "${prod.name}"
        - SKU: "${prod.sku}"
        - Stock: ${prod.stock} units
        - Current Selling Price: $${prod.sellingPrice} (Cost: $${prod.costPrice})
        - Category: "${prod.category}"
        - Distribution Marketplace: "${prod.marketplace}"
        - Past 60-day units sold in system: ${unitsSold} items

        Produce a valid JSON object matching the exact format detailed below. Do not output anything outside JSON brackets:
        {
          "bestMarketplace": "Specify the best marketplace (Shopify, Facebook, Daraz, or TikTok Shop) with a 2-word justification",
          "bundleIdeas": ["Idea 1 bundle", "Idea 2 bundle"],
          "postingTimes": ["posting time peak 1", "posting time peak 2"],
          "audienceTargeting": ["targeting segment 1", "targeting segment 2"],
          "optimizedTitle": "An optimized title with rich keyword targeting",
          "optimizedDescription": "A highly convincing sales description centered on hooks and consumer psychology",
          "seoKeywords": ["keyword1", "keyword2", "keyword3"],
          "adStrategy": {
            "facebook": "fb ad targeting strategy description",
            "tiktok": "tiktok creative hook recommendation",
            "budget": recommendedBudgetNumberUSD
          }
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "{}";
      const parsedStrategy = JSON.parse(responseText.trim());
      res.json({ strategy: parsedStrategy, isDemo: false });

    } catch (e: any) {
      console.warn("Gemini strategist API failed, serving custom generated fallback logic:", e.message);
      // Fail gracefully & fallback seamlessly
      res.json({
        strategy: {
          bestMarketplace: `${prod.marketplace} (Primary Hub)`,
          bundleIdeas: [`${prod.name} Classic Duo Pack`, `Holiday Season Starter Set`],
          postingTimes: ["11:00 AM EST", "8:15 PM EST"],
          audienceTargeting: [`Subscribers of ${prod.category} trend brands`, "Age 20-40, high disposal income"],
          optimizedTitle: `Luxury ${prod.name} – Authentic ${prod.category} Essential`,
          optimizedDescription: `A premium craftsmanship item optimized for daily usage. Styled from durable design material suitable for ${prod.category} enthusiasts.`,
          seoKeywords: [prod.name.toLowerCase(), "boutique deals", "premium fashion"],
          adStrategy: {
            facebook: "Direct retargeting of previous website visitors using catalog images.",
            tiktok: "User Generated Content (UGC) challenge with organic tags.",
            budget: 350
          }
        },
        isDemo: true,
        warning: e.message
      });
    }
  });

  // AI PERSISTENT CHAT ASSISTANT (Domain context-aware with actual state)
  app.get("/api/chat", (req, res) => {
    res.json(db.chats);
  });

  app.post("/api/chat", async (req, res) => {
    const { message, customContext } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message text is required." });
    }

    const userMsg: ChatMessage = {
      id: "c-u-" + Math.random().toString(36).substr(2, 9),
      role: "user",
      text: message,
      createdAt: new Date().toISOString()
    };

    db.chats.push(userMsg);

    try {
      // Delegate to the AI Business Assistant service. It runs the full
      // Gemini -> Groq -> offline-fallback chain and never throws.
      const { generateAssistantReply } = await import("./services/aiAssistant");
      const result = await generateAssistantReply(db, { message, customContext });

      const modelReply: ChatMessage = {
        id: "c-m-" + Math.random().toString(36).substr(2, 9),
        role: "model",
        text: result.text,
        createdAt: new Date().toISOString()
      };
      db.chats.push(modelReply);

      res.json({
        chat: modelReply,
        source: result.source,
        warning: result.warning,
        isDemo: result.source !== "gemini"
      });
    } catch (e: any) {
      // Should be unreachable because the service swallows errors internally,
      // but guard anyway so the route always returns a valid response shape.
      console.error("Unexpected /api/chat failure:", e);
      const fallback: ChatMessage = {
        id: "c-m-" + Math.random().toString(36).substr(2, 9),
        role: "model",
        text: `I'm having trouble answering right now. Please try again in a moment.\n\nDetails: ${e?.message || "unknown error"}`,
        createdAt: new Date().toISOString()
      };
      db.chats.push(fallback);
      res.json({ chat: fallback, source: "local", isDemo: true });
    }
  });

  // CLEAN ENTIRE HISTORY API FOR DEMO
  app.post("/api/reset-demo", async (req, res) => {
    await seedDb();
    res.json({ success: true, message: "Demo database reset to initial seeded values." });
  });

  // --- HEALTH CHECK (used by Render's healthCheckPath) ---
  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      service: "bizmind-api",
      time: new Date().toISOString(),
    });
  });

  // --- VITE MIDDLEWARE SETUP & STATIC ASSETS HANDLERS ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: path.resolve(__dirname, "..", ".."),
      configFile: path.resolve(__dirname, "..", "..", "vite.config.ts"),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "..", "..", "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Stop the existing process or set PORT to a different value.`);
      process.exit(1);
    }
    throw err;
  });
}

startServer().catch((err) => {
  console.error("Server failed to boot:", err);
  process.exit(1);
});
