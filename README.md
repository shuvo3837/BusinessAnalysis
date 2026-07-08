# BizMind AI - Smart Business SaaS Platform

An AI-powered SaaS platform designed for small business owners, retail shops, and sellers in Bangladesh to easily digitize, manage, and analyze their business operations.

## 🚀 Key Features

### 1. 🔍 AI Business Scanner (Smart Note Scanner)
Allows non-technical business owners to easily digitize handwritten ledgers (khata pages), receipts, invoices, stock lists, or daily expense notes.
* **Handwritten OCR & Translation**: Detects messy handwriting, printed text, and mixed English/Bengali (Banglish) terms.
* **Smart Data Extraction**: Automatically detects items, quantities, transaction amounts, and expenses.
* **Instant Digitization**: Automatically converts the scanned document into parsed sales, inventory, and expense records.

### 2. 💬 AI Chat Assistant
An integrated business consultant powered by Gemini 2.5 Flash.
* **Real-time Feedback**: Get instant analysis, sales growth ideas, and cost-cutting recommendations.
* **Rich Formatting**: Supports clean, beautifully rendered Markdown text formatting for easier reading of complex business advice.

### 3. 📊 Analytics Dashboard
* **Dynamic Performance Tracking**: Track revenue, profits, fast-selling and slow-selling products, and regional category distributions.
* **Forecasts & Recommendations**: Automatic restock recommendations and expected growth forecasts.

## 🛠️ Tech Stack

* **Frontend**: React.js, Tailwind CSS, Lucide Icons, Vite
* **Backend**: Node.js, Express.js
* **AI Engine**: Google Gemini 2.5 Flash SDK (`@google/genai`)

## 📦 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/shuvo3837/Business_analysis.git
   cd Business_analysis
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables by copying `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Provide your `GEMINI_API_KEY` inside `.env`.

4. Start the development server:
   ```bash
   npm run dev
   ```

---
*Created with Google AI Studio Build.*
