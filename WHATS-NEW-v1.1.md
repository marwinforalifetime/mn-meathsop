# What's New in v1.1 — and How to Update Your Live Site

## How to push this update (5 minutes)

You already have the app live. To update it with this new version:

1. Go to your repository on **GitHub.com**
2. For each changed file, you'll re-upload the new version:
   - Click **"Add file"** → **"Upload files"**
   - Drag in the updated files from this new zip (easiest: just drag ALL the files and folders — GitHub replaces what changed)
3. Scroll down, type a note like `Update to v1.1`, click **"Commit changes"**
4. **Vercel automatically rebuilds and redeploys** within 1–2 minutes

That's it. Refresh your live site (hard refresh: Ctrl+Shift+R or Cmd+Shift+R) and you'll see the changes.

**Your data is safe** — this update doesn't touch your stored orders, expenses, or inventory. All your existing orders will keep working; older orders simply show "—" where the new notes field would be.

---

## What changed

### Dashboard — fully rebuilt with Business Health
A new hero panel at the top shows whether your business is **self-sustaining, recovering, or building up**, with:
- **Net Position** — gross profit minus all expenses (the real "are we ahead?" number)
- **Expense recovery bar** — visual progress toward covering all costs
- **To Break Even** — how much more profit you need to cover all expenses
- **Avg Profit / Selling Day** — your true daily earning pace
- **Est. Days to Self-Sustain** — projected days until the business funds itself at your current pace
- **Avg Sales / Selling Day** — revenue pace

The charts are also redesigned: a combined Sales & Profit area chart, cleaner top-products bars.

### New Order
- Added a **Notes / Special Cut** field for each item (e.g. "thin slice", "cut in cubes")
- Added an optional **Phone** field for the customer

### Order Summary (was "Invoice")
- Renamed from "OFFICIAL RECEIPT" to **ORDER SUMMARY**
- Customer name is now the main header (not the Order ID)
- Added **Notes / Special Cut** column (shows "-" if none), matching your Excel
- New **"Save Order Summary"** button — downloads a clean image you can send straight to the customer
- Removed the Paid/Unpaid status badge
- Footer changed to **"Thank you for your order!"**

### Supplier Copy
- Customer name is now the header
- Removed unit cost and total columns
- Added **Notes / Special Cut** column so the supplier knows exactly how to prepare each item

### Unchanged (as you requested)
Pickup Checker, Expenses, Inventory, and Price List are exactly as they were.
