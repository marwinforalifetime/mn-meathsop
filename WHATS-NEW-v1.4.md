# What's New in v1.4

## How to update your live site (5 min, same as always)

1. Go to your repository on **GitHub.com**
2. **"Add file"** → **"Upload files"** → drag in ALL files from this zip
3. Commit with a note like `Update to v1.4`
4. Vercel auto-redeploys in 1–2 minutes. Hard-refresh your site (Ctrl+Shift+R / Cmd+Shift+R)

Your data is untouched.

---

## What changed

### Orders — full edit mode
When you open a customer's order, there's now an **"Edit"** button at the top-right of the popup. Tap it and the whole order becomes editable:

- **Date** the order was made (the thing you asked for)
- **Customer name** and **phone**
- **Each item**: change the product, quantity, or notes / special cut
- **Add or remove items** entirely
- **Payment status, method, delivery status**
- **Order notes**

Then **Save Changes** to keep them, or **Cancel** to discard. The Sales / Cost / Profit figures update live as you edit, so you can see the effect before saving.

**Important detail about pricing:** if you change an item's *product* while editing, that line is re-priced to the product's *current* price from your Price List. If you only change the quantity or notes (not the product), the original price the item was sold at is kept. This keeps your old profit numbers accurate while still letting you fix mistakes.

The order's ID never changes, and it quietly records when it was last edited.

Outside of edit mode, the status dropdowns still work the same quick way they did before (change and it saves instantly).

### Unchanged
Everything else — Dashboard, New Order, Pickup Checker, Expenses, Inventory, Price List, image exports, hide-amounts — is the same as v1.3.
