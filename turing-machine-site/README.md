# ⚙ Turing Machine Simulator

An interactive Turing Machine simulator with challenges, visual state graphs, and a retro CRT terminal aesthetic.

## 🚀 Deploy to Vercel (Step by Step)

### Step 1: Push to GitHub
1. Create a GitHub account at https://github.com (if you don't have one)
2. Click **"New repository"** → name it `turing-machine-simulator`
3. On your computer, open a terminal in this project folder and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/turing-machine-simulator.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to https://vercel.com and sign up with your GitHub account
2. Click **"Add New" → "Project"**
3. Select your `turing-machine-simulator` repository
4. Vercel auto-detects Vite — just click **"Deploy"**
5. Wait ~1 minute. Your site is now live at `turing-machine-simulator.vercel.app`!

### Step 3: Custom Domain (Optional)
1. In your Vercel project → **Settings → Domains**
2. Add your custom domain (e.g., `turingmachine.io`)
3. Follow Vercel's DNS instructions

---

## 💰 Setting Up Google AdSense

### Step 1: Apply for AdSense
1. Go to https://adsense.google.com
2. Sign up with your Google account
3. Add your site URL (your Vercel URL or custom domain)
4. Google reviews your site — this can take **1-14 days**
5. Your site needs some content and traffic, so share it around first!

### Step 2: Add Your AdSense Code
Once approved, Google gives you a **publisher ID** (looks like `ca-pub-1234567890123456`).

**In `index.html`:**
Uncomment the AdSense script and add your publisher ID:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID" crossorigin="anonymous"></script>
```

### Step 3: Create Ad Units & Add Slot IDs
1. In your AdSense dashboard, go to **Ads → By ad unit**
2. Create a **Display ad** unit → copy the `data-ad-slot` value
3. Open `src/components/AdBanner.jsx`:
   - Replace `ca-pub-YOUR_PUBLISHER_ID` with your real publisher ID
   - Replace `YOUR_AD_SLOT_ID` with your ad slot
4. Open `src/App.jsx`:
   - Replace `YOUR_TOP_BANNER_SLOT` and `YOUR_BOTTOM_BANNER_SLOT` with ad slot IDs

### Step 4: Redeploy
Push your changes to GitHub — Vercel auto-deploys:
```bash
git add .
git commit -m "Add AdSense integration"
git push
```

---

## 🛠 Local Development

```bash
npm install
npm run dev
```
Opens at http://localhost:5173

## 📁 Project Structure

```
├── index.html              ← AdSense script goes here
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx              ← Ad placement layout
    └── components/
        ├── TuringMachine.jsx  ← The game
        └── AdBanner.jsx       ← Reusable ad component
```

## 💡 Tips to Maximize Ad Revenue
- **Drive traffic**: Share on Reddit (r/compsci, r/learnprogramming), Hacker News, X/Twitter
- **SEO**: The meta tags in index.html help with search rankings
- **More content**: Consider adding a "Learn" page explaining Turing machines
- **AdSense alternatives**: If AdSense takes too long to approve, try:
  - **Media.net** (Yahoo/Bing ad network)
  - **Carbon Ads** (developer-focused, looks nicer)
  - **EthicalAds** (privacy-friendly, targets devs)
