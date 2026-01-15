# 📊 AI Business Diagnostic Agent & Financial Analyst

### Automated Due Diligence Powered by Gemini 2.5 Flash & Vertex AI

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_App-blue?style=for-the-badge&logo=vercel)](https://cosmic-mousse-3a11cd.netlify.app)
![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fcosmic-mousse-3a11cd.netlify.app%2F&style=for-the-badge&label=Status&logo=netlify&logoColor=white&color=00C7B7)
[![API](https://img.shields.io/badge/News_Feed-AlphaVantage-orange?style=for-the-badge)]()

> **"From 200-page PDF to strategic insight in under 60 seconds."**

## 💡 Executive Summary
The **AI Business Diagnostic Agent** is a GenAI tool engineered to accelerate the "Discovery Phase" of financial consulting. By leveraging **Google Vertex AI** and **Gemini 2.5 Flash**, the tool ingests complex annual reports and instantly transforms them into structured revenue visualizations, live market intelligence, and actionable strategic recommendations.

It is designed to solve the "Analyst's Bottleneck"—automating the manual spreading of comps and trend detection so consultants can focus on strategy.

## 🚀 Key Capabilities

### 1. 📄 Automated Financial Extraction
* **Ingestion:** Processes consolidated financial statements (PDFs) in <1 minute.
* **Analysis:** Deterministic extraction of Revenue, COGS, OpEx, and Net Income using a custom Gemini Agent.
* **Visualization:** Generates dynamic **Sankey Diagrams** to map capital allocation and operational inefficiencies.

### 2. 📡 Real-Time Market Intelligence
* **Live News Feed:** Integrated with the **AlphaVantage API** to pull real-time press releases, leadership changes, and sentiment updates.
* **Contextual Grounding:** Combines backward-looking financial data (10-K) with forward-looking market news to provide a complete picture of company health.

### 3. 🧠 Strategic AI Analyst
* **Buy/Hold/Sell Logic:** An algorithmic recommendation engine that weighs financial ratios (Liquidity, Solvency) against operational risks to output a preliminary investment rating.
* **Ratio Health Check:** Automated calculation of ROE, Current Ratio, and Debt-to-Equity with industry benchmarking.

### 4. 📤 Enterprise Workflow Integration
* **Export Options:** Instantly download analysis as **Excel (.xlsx)**, **CSV**, or **PDF** reports for seamless inclusion in client presentation decks.

---

## 🛠️ Tech Stack & Architecture

| Component | Technology | Usage |
| :--- | :--- | :--- |
| **Core AI** | **Gemini 2.5 Flash (Vertex AI)** | Long-context processing for full annual report analysis. |
| **Live Data** | **AlphaVantage API** | Real-time news fetching and sentiment analysis. |
| **Frontend** | **React + TypeScript** | Interactive dashboard and Sankey visualization. |
| **Visualization** | **Python (Matplotlib) / D3** | Graph generation pipeline. |
| **Export Engine** | **jsPDF / SheetJS** | Client-side generation of Excel/PDF reports. |

## 📂 Repository Structure
* **`src/services/alphaVantage.ts`**: Integration logic for fetching and filtering live company news.
* **`src/hooks/useFinancialAnalysis.ts`**: The core logic bridging the PDF parser with the Gemini recommendation engine.
* **`src/utils/exportUtils.ts`**: Handlers for generating Excel models and PDF summaries.

## 🧠 Case Study: The "Discovery" Workflow
*Input:* Consolidated Financial Statement (e.g., Nestlé 2024)
1.  **Diagnostic:** The agent identifies a 5% increase in OpEx.
2.  **Context:** The **AlphaVantage** feed flags a recent "Supply Chain Restructuring" press release.
3.  **Synthesis:** The AI correlates the cost spike with the news event.
4.  **Output:** A "Hold" recommendation is generated, citing "Short-term margin pressure due to restructuring."
5.  **Delivery:** Analyst exports the raw data to Excel for the final model.

---
*Created by Jayesh Jaswani.*
