# Katalog.ai 🚀

> **The Operating System for Automated E-commerce Cataloging.**

Katalog.ai is an infrastructure layer that solves the "Cold Start Problem" for e-commerce. It uses Computer Vision and Web Search Agents to turn a single product photo into a comprehensive, validated, and SEO-optimized product listing.

## 🏗 Architecture

### 1. The Core (Frontend)
- **Next.js 14 (App Router)**: Fast, reactive UI for bulk approval.
- **Tailwind CSS + Shadcn/UI**: High-velocity interface design.
- **Supabase**: Real-time database, Auth, and Vector Store.

### 2. The Brain (Backend Automation)
- **n8n Workflow Engine**: Orchestrates the multi-agent system.
- **Agents**:
  - 🕵️ **Detective Node**: Google Shopping Search & Match (Serper.dev).
  - 👁 **Vision Node**: OCR & Visual Analysis (GPT-4o Vision).
  - 📝 **Copywriter Node**: SEO & Sales text generation.

## ⚡ Features

- **Magical Ingestion**: Syncs directly via Shopify API or CSV.
- **Ground Truth Verification**: Validates product specs against manufacturer data found on the web.
- **Human-in-the-loop**: High-speed "Tinder-like" approval interface for catalog managers.

## 🛠 Setup

1. Clone the repo.
2. `npm install`
3. Set up `.env.local` with Supabase credentials.
4. `npm run dev`

---
*Built by Félix. Target: Hyper-scale.*
