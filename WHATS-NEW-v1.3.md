# What's New in v1.3

## How to update your live site (5 min, same as always)

1. Go to your repository on **GitHub.com**
2. **"Add file"** → **"Upload files"** → drag in ALL files from this zip
3. Commit with a note like `Update to v1.3`
4. Vercel auto-redeploys in 1–2 minutes. Hard-refresh your site (Ctrl+Shift+R / Cmd+Shift+R)

Your data is untouched.

---

## What changed

### New Order — Hide amounts toggle
- Added a **"Hide amounts"** button at the top-right of the New Order screen (eye icon), same as the one on the Dashboard.
- When on, every peso figure on the New Order screen is masked to `₱•••••`:
  - Each item's line total
  - Total Sales, Supplier Cost, and Profit at the bottom
- This is exactly for the situation where the customer is beside you picking their items — you can build their order without them seeing your cost or profit.
- The toggle is per-session on this screen; it resets when you leave New Order, so each new order starts visible by default.

### Supplier Copy — Export as image
- The Supplier Copy now has a **"Save Supplier Copy"** button (same green export button the Order Summary has).
- It saves a clean full image you can forward straight to your supplier (Messenger, Viber, etc.).
- File saves as `supplier-copy-[customername].png`. The Order Summary still saves as `order-summary-[customername].png`.
- The full-capture fix from v1.2 applies here too, so nothing gets clipped.

### Unchanged
Everything else — Dashboard, Orders, Pickup Checker, Expenses, Inventory, Price List — is the same as v1.2.
