# What's New in v1.2

## How to update your live site (same as before, 5 min)

1. Go to your repository on **GitHub.com**
2. **"Add file"** → **"Upload files"** → drag in ALL files from this new zip (GitHub replaces what changed)
3. Commit with a note like `Update to v1.2`
4. Vercel auto-redeploys in 1–2 minutes. Hard-refresh your site (Ctrl+Shift+R / Cmd+Shift+R)

**Note:** This version adds a new file `src/logo.js` — make sure it's included when you upload. Your data is untouched.

---

## What changed

### Dashboard — completely revamped
- **No longer dominated by Business Health.** It's now one small strip at the very bottom.
- **Your real logo** is now in the sidebar, the dashboard header, and faintly behind the hero card.
- **The hero is now "This Month's Profit"** — the single number that matters day to day — with sales and money-owed beside it.
- Cleaner flow: month profit → all-time profit → one sales/profit chart → money owed (clickable, actionable) → top products → recent orders → health strip.
- Removed the overwhelming 4-metric health grid and the duplicate stat rows.

### Privacy mode (hide amounts)
- New **"Hide amounts"** button at the top-right of the dashboard with an eye icon.
- Tap it and every peso amount on the dashboard becomes `₱•••••` — including the chart numbers.
- Tap again to reveal. Use it when working in public so no one can see your figures.

### Real logo everywhere
- Extracted your actual M&N Meatshop logo from your Excel file.
- Now appears in: the sidebar, dashboard header, Order Summary, and Supplier Copy.
- It's embedded directly in the app so it always shows up — even in saved images and offline.

### Order Summary / Supplier Copy fixes
- **Fixed the cut-off image bug** — "Save Order Summary" now captures the full document every time, nothing clipped.
- Saved file is now named `order-summary-[customer].png`.
- **Logo added** to the top of both Order Summary and Supplier Copy.
- **Supplier Copy: removed the "Ref: ORD-xxx" line entirely** — the order ID is for your eyes only and no longer appears on the supplier's copy. (It still shows on your Order Summary as a small reference.)

### Unchanged (as requested)
Pickup Checker, Expenses, Inventory, Price List, and New Order are the same.
