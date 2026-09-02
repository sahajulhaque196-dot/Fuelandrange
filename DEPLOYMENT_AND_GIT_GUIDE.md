# 🚀 RangeAndFuel.ca — Git & Cloudflare Deployment Guide

This document contains all repository configurations, push instructions, authentication credentials, and Cloudflare Pages deployment details.

---

## 📌 Repository Information

- **GitHub Repository URL:** `https://github.com/sahajulhaque196-dot/Fuelandrange.git`
- **Default Branch:** `main`
- **Framework:** Astro 4.10 (Static Site Generator) + React 18 + Tailwind CSS + TypeScript
- **Target Deployment Platform:** Cloudflare Pages (Recommended) / Vercel / Netlify

---

## ☁️ Cloudflare Pages Deployment (2 Best Methods)

### 🥇 Method 1: Automatic GitHub CI/CD (Recommended)
Every time you push code to GitHub, Cloudflare automatically builds and deploys your site globally in seconds.

1. Go to **[Cloudflare Dashboard](https://dash.cloudflare.com/)**.
2. Click **Workers & Pages** in the left sidebar ➔ Click **Create application** ➔ Select **Pages** tab.
3. Click **Connect to Git** ➔ Select your repository: `sahajulhaque196-dot/Fuelandrange`.
4. Configure Build Settings:
   - **Framework preset:** `Astro`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (Leave empty or default)
5. *(Optional)* Add Environment Variable:
   - Variable name: `NODE_VERSION`
   - Value: `20`
6. Click **Save and Deploy**.
7. In ~60 seconds, your site will be live at `https://fuelandrange.pages.dev`!

---

### 💻 Method 2: Direct Terminal CLI Deploy via Wrangler (1-Click)

If you want to deploy directly from your local terminal without Git webhooks:

```bash
# 1. Build the production files
npm run build

# 2. Deploy directly to Cloudflare Pages
npx wrangler pages deploy dist --project-name=fuelandrange
```

*(First time run karne par browser mein Cloudflare authorize popup aayega, allow karte hi upload ho jayega).*

---

## 🌐 Custom Domain Setup (`rangeandfuel.ca`)

1. In Cloudflare Pages dashboard, click on your project (`fuelandrange`).
2. Go to the **Custom domains** tab.
3. Click **Set up a custom domain**.
4. Enter your domain: `rangeandfuel.ca` (and `www.rangeandfuel.ca`).
5. Cloudflare will automatically configure DNS, Global Edge CDN, and Free SSL certificates.

---

## 🔄 Daily Workflow / 1-Click Push Commands

Whenever you make changes to the project:

```bash
# 1. Stage all changes
git add .

# 2. Commit
git commit -m "feat: updates and optimizations"

# 3. Push to GitHub (Cloudflare will auto-deploy!)
git push origin main
```

---

## 🔐 Google AdSense Live Activation (After Approval)

When your Google AdSense account is approved:
1. Open `src/components/common/AdSlot.astro`.
2. Change `const ADSENSE_ENABLED = false;` to `const ADSENSE_ENABLED = true;`.
3. Update `adClient = 'ca-pub-XXXXXXXXXXXXXXXX'` with your actual Google Publisher ID.
4. Commit and push:
   ```bash
   git add .
   git commit -m "feat: activate Google AdSense live slots"
   git push origin main
   ```
