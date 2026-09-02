# 🚀 RangeAndFuel.ca — Git Repository & Deployment Guide

This document contains all repository configurations, push instructions, and deployment details to ensure smooth workflow.

---

## 📌 Repository Information

- **GitHub Repository URL:** `https://github.com/sahajulhaque196-dot/Fuelandrange.git`
- **Default Branch:** `main`
- **Framework:** Astro 4.10 (Static Site Generator) + React 18 + Tailwind CSS + TypeScript
- **Target Deployment Platform:** Vercel / Cloudflare Pages / Netlify / GitHub Pages

---

## 🔑 GitHub Token & Local Configuration

Your authenticated token is stored safely in your local `.git/config` and in local `.env.git-token`.

To reset or update the authenticated remote URL on any terminal:
```bash
git remote set-url origin https://<YOUR_GITHUB_TOKEN>@github.com/sahajulhaque196-dot/Fuelandrange.git
```

---

## 🔄 Daily Workflow / 1-Click Push Commands

Whenever you make changes to the project, run these commands in PowerShell or Terminal inside the project root directory:

```bash
# 1. Stage all changed and new files
git add .

# 2. Commit with a meaningful message
git commit -m "feat: updates and optimizations"

# 3. Push to GitHub main branch
git push origin main
```

---

## 🏗️ Build & Testing Commands

```bash
# Start local development server (http://localhost:4321)
npm run dev

# Compile all 839 production static pages
npm run build

# Preview production build locally
npm run preview
```

---

## 🔐 Google AdSense Activation Steps (After Approval)

When your Google AdSense account is approved:
1. Open `src/components/common/AdSlot.astro`.
2. Change `const ADSENSE_ENABLED = false;` to `const ADSENSE_ENABLED = true;`.
3. Update `adClient = 'ca-pub-XXXXXXXXXXXXXXXX'` with your actual Google Publisher ID (e.g. `ca-pub-1234567890123456`).
4. Commit and push:
   ```bash
   git add .
   git commit -m "feat: activate Google AdSense live slots"
   git push origin main
   ```
