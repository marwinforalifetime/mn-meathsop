# M&N Meatshop System

A complete business management web app for M&N Meatshop: order tracking, invoices, supplier copies, expense tracking, fridge inventory, and a live dashboard.

Built with React + Vite + Tailwind. Installs on your phone or laptop home screen as a PWA. All data is stored locally in your browser.

## Features

- **Dashboard** — live sales, profit, margin, top products, daily trend
- **New Order** — fast entry with auto-pricing from your product list
- **Orders** — searchable list, printable invoices, printable supplier copies
- **Pickup Cross-Check** — multi-select orders, roll up supplier pickup quantities
- **Expenses** — categorized expense tracker with breakdown chart
- **Inventory** — fridge stock by Pork / Chicken / Beef
- **Price List** — manage products, costs, and selling prices
- **Backup & Restore** — export/import all data as JSON

## How to deploy it live

See **[DEPLOY.md](./DEPLOY.md)** for a step-by-step guide. Takes 15–30 minutes, free, no coding required.

## How to run it locally (optional)

If you want to test it on your laptop before deploying:

1. Install [Node.js](https://nodejs.org) (the LTS version)
2. Open a terminal in this folder
3. Run:
   ```
   npm install
   npm run dev
   ```
4. Open the URL it prints (usually http://localhost:5173)

To build for production: `npm run build`

## Backups

Your data lives in your browser's local storage. **Export a backup regularly** using the "Backup & Restore" button in the bottom of the sidebar. This is especially important before:

- Clearing your browser data
- Switching to a new computer or phone
- Major updates

Backups are plain JSON files — they'll keep working even if this app changes.
