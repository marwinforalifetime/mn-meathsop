# How to Put Your M&N Meatshop App Live on the Internet

This guide walks you through getting your app online with a real web address (like `mn-meatshop.vercel.app`). It's free, takes about 15–30 minutes, and you don't need to write any code.

You'll use two services: **GitHub** (to store the app's files) and **Vercel** (to put it online). Both are free.

---

## Step 1 — Make a GitHub account (5 minutes)

1. Go to **[github.com](https://github.com)** and click **"Sign up"** in the top-right.
2. Use your email, pick a username (e.g. `mnmeatshop`), and a password.
3. Verify your email when GitHub asks.

That's it. You now have a free GitHub account.

---

## Step 2 — Create a new repository (3 minutes)

A "repository" is just a folder that holds your project files online.

1. Once logged in, click the green **"New"** button (or click the **+** icon in the top right → "New repository").
2. Fill in:
   - **Repository name**: `mn-meatshop` (or anything you like)
   - **Description** (optional): `Order tracker and dashboard for M&N Meatshop`
   - Select **Public** (Vercel's free tier needs public repos)
   - **Do NOT** check "Add a README" — your project already has one
3. Click **"Create repository"**.

---

## Step 3 — Upload your project files (5 minutes)

You'll see a page that says "Quick setup". Look near the middle for a link that says **"uploading an existing file"** — click it.

1. On the upload page, **drag the entire contents** of this project folder into the upload box. Make sure you upload:

   - `package.json`
   - `vite.config.js`
   - `tailwind.config.js`
   - `postcss.config.js`
   - `index.html`
   - `.gitignore`
   - `README.md`
   - `DEPLOY.md`
   - the `public/` folder (with the icons inside)
   - the `src/` folder (with App.jsx, main.jsx, index.css)

   **Do NOT** upload `node_modules/` if you have one — it's huge and unnecessary.

2. Scroll down. In the **"Commit changes"** box, type something like `Initial upload` in the description.
3. Click the green **"Commit changes"** button.

GitHub will upload everything and take you back to your repository. You should now see all your files listed.

---

## Step 4 — Make a Vercel account (3 minutes)

1. Go to **[vercel.com](https://vercel.com)** and click **"Sign Up"**.
2. Choose **"Continue with GitHub"** — this connects the two accounts automatically.
3. Authorize Vercel to access your GitHub account when it asks.
4. On the signup form, pick the **Hobby (free)** plan.

---

## Step 5 — Deploy your app (5 minutes)

1. Once you're in Vercel, click **"Add New..."** → **"Project"** (top-right area).
2. You'll see a list of your GitHub repositories. Find **`mn-meatshop`** and click the **"Import"** button next to it.
3. On the configuration page, you'll see the project settings. **Just leave everything as default** — Vercel auto-detects that this is a Vite project. The settings should show:
   - Framework Preset: **Vite**
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `dist` (auto-filled)
4. Click the big **"Deploy"** button.

Wait about 1–2 minutes while Vercel builds and deploys your app. You'll see a progress screen with logs.

When it's done, you'll see a **"Congratulations!"** screen with a preview of your app and a URL like:

```
https://mn-meatshop-xxxxx.vercel.app
```

**That's your live app.** Click the URL to open it. Bookmark it.

---

## Step 6 — Install it on your laptop / phone home screen

Because the app is a PWA (Progressive Web App), you can install it like a real app.

### On a laptop (Chrome / Edge)
1. Open your app URL in Chrome or Edge
2. Look for a small install icon in the address bar (looks like a screen with a down arrow)
3. Click it → "Install"
4. The app now opens in its own window with its own icon

### On Android (Chrome)
1. Open the URL in Chrome
2. Tap the three-dot menu → **"Add to Home screen"** or **"Install app"**
3. The M&N icon appears on your home screen

### On iPhone (Safari)
1. Open the URL in Safari (must be Safari, not Chrome)
2. Tap the share button (square with up arrow) → **"Add to Home Screen"**
3. Done

---

## Step 7 (optional) — Use your own domain

If you want a cleaner URL like `mnmeatshop.com`:

1. Buy a domain from a registrar (Namecheap, GoDaddy, etc.) — usually ₱600–₱1,000/year
2. In Vercel, go to your project → **Settings** → **Domains** → Add your domain
3. Vercel will show you DNS records to add at your registrar
4. After ~10 minutes, your custom domain is live

---

## Updating your app later

If you ever want to make changes:

1. On GitHub, navigate to the file you want to change
2. Click the pencil icon to edit, make your change, click "Commit changes"
3. Vercel **automatically rebuilds and redeploys** within a minute or two

That's the magic — every time you change something in GitHub, the live site updates by itself.

---

## Important: BACK UP YOUR DATA

Your orders, expenses, and inventory live in your browser's storage, not on a server. If you clear your browser data, switch devices, or have a browser problem, the data is gone.

**Once a week** (or before any big change):

1. Open your app
2. Click **"Backup & Restore"** at the bottom of the sidebar
3. Click **"Download Backup"**
4. Save the JSON file somewhere safe (Google Drive, email it to yourself, USB drive)

To restore: click **"Backup & Restore"** → **"Choose Backup File"** → pick your JSON.

---

## Need to make changes to the app itself?

If you want new features (different layout, more product categories, different reports, etc.), come back to Claude with your existing files and the new requirements — Claude can update the code and you redo Step 3 to upload the new version.

---

## Troubleshooting

**"Build failed" in Vercel**
- Check that you uploaded ALL the files including `package.json`, `vite.config.js`, the `src/` folder, etc.
- Click the build log to see the error message and search for it online or ask Claude

**The app loads but looks broken**
- Hard refresh the browser (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)
- Try a different browser

**Lost my data**
- This is why backups matter! If you have a backup file, use "Restore from Backup" to get it back
- If no backup exists, the data cannot be recovered

**I want to delete a test order / start fresh**
- Open the app → use the in-app delete buttons. To wipe everything: in browser dev tools (F12) → Application → Local Storage → delete entries starting with `mn_meatshop_`. Better: just delete items individually in the app.

---

Good luck with your meatshop! 🥩
