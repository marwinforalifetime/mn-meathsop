import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard, PlusCircle, ListOrdered, Truck, Wallet, Snowflake, Tag,
  Printer, Trash2, Edit3, Search, X, Check, AlertCircle, TrendingUp,
  Receipt, FileText, ChevronRight, Save, Loader2, Plus,
  Eye, EyeOff, ArrowLeft, RefreshCw, Download, Upload, HardDrive, Image as ImageIcon,
  Activity
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis,
  Tooltip, CartesianGrid, Area, AreaChart,
} from 'recharts';
import { toPng } from 'html-to-image';
import { LOGO_DATA_URL } from './logo.js';

/* ============================================================
   SEED DATA (from your spreadsheet)
   ============================================================ */

const SEED_PRODUCTS = [
  { name: 'Pork Kasim / Hamleg', unit: 'kg', cost: 190, price: 259, group: 'Pork' },
  { name: 'Pork Chop', unit: 'kg', cost: 183, price: 269, group: 'Pork' },
  { name: 'Pork Liver', unit: 'kg', cost: 103, price: 155, group: 'Pork' },
  { name: 'Pork Liempo', unit: 'kg', cost: 263, price: 339, group: 'Pork' },
  { name: 'Pork Ribs Malaman', unit: 'kg', cost: 186, price: 299, group: 'Pork' },
  { name: 'Pork Riblets', unit: 'kg', cost: 170, price: 265, group: 'Pork' },
  { name: 'Pork Jowls / Pisngi', unit: 'kg', cost: 193, price: 255, group: 'Pork' },
  { name: 'Pork Flower / Chicharon Bulaklak', unit: 'kg', cost: 110, price: 195, group: 'Pork' },
  { name: 'Pork Pata Hock', unit: 'kg', cost: 153, price: 239, group: 'Pork' },
  { name: 'Pork Ear', unit: 'kg', cost: 158, price: 229, group: 'Pork' },
  { name: 'Pork Pata Feet', unit: 'kg', cost: 100, price: 179, group: 'Pork' },
  { name: 'Chicken Leg Quarter', unit: 'kg', cost: 148, price: 179, group: 'Chicken' },
  { name: 'Chicken Wings', unit: 'kg', cost: 158, price: 189, group: 'Chicken' },
  { name: 'Chicken Drumstick', unit: 'kg', cost: 150, price: 185, group: 'Chicken' },
  { name: 'Chicken Breast Fillet', unit: 'kg', cost: 227, price: 299, group: 'Chicken' },
  { name: 'Beef Laman / Beef Cubes', unit: 'kg', cost: 365, price: 399, group: 'Beef' },
  { name: 'Beef Buto-Buto / Soup Bones', unit: 'kg', cost: 155, price: 259, group: 'Beef' },
  { name: 'Beef Tripe / Tuwalya', unit: 'kg', cost: 152, price: 259, group: 'Beef' },
];

const EXPENSE_CATEGORIES = [
  'Capital / Stock', 'Stock', 'Equipment', 'Packaging',
  'Transport', 'Utilities', 'Marketing', 'Other'
];

const PAYMENT_METHODS = ['Cash', 'Gcash', 'Bank Transfer', 'Other'];
const PAYMENT_STATUSES = ['Paid', 'Unpaid', 'Partial'];
const DELIVERY_STATUSES = ['Pending', 'Delivered', 'Cancelled'];

const APP_VERSION = 'v1.5 · No Ref ID';

const THEME = {
  bg: '#FAF5EE', card: '#FFFEF8', ink: '#2A2624', inkSoft: '#6B5F58',
  line: '#E8DFD2', brand: '#7A2E33', brandSoft: '#A04D52',
  accent: '#C9853A', green: '#4F7942', red: '#B23A48', amber: '#D89A3C',
};

/* ============================================================
   HELPERS
   ============================================================ */

const peso = (n) => {
  if (n === null || n === undefined || isNaN(n)) return '₱0';
  return '₱' + Number(n).toLocaleString('en-PH', { maximumFractionDigits: 2 });
};
const pesoFull = (n) => '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
};
const fmtDateShort = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
};
const nextOrderId = (lastNum) => 'ORD-' + String(lastNum + 1).padStart(3, '0');

/* ============================================================
   STORAGE (localStorage with safe wrappers)
   ============================================================ */

const STORAGE_PREFIX = 'mn_meatshop_';

const storage = {
  load(key, fallback) {
    try {
      const v = localStorage.getItem(STORAGE_PREFIX + key);
      return v !== null ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  },
  save(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('localStorage save failed', e);
      return false;
    }
  },
  clear() {
    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith(STORAGE_PREFIX)) localStorage.removeItem(k);
      });
    } catch (e) {}
  }
};

/* ============================================================
   UI PRIMITIVES
   ============================================================ */

function Card({ children, className = '', style = {} }) {
  return (
    <div className={`rounded-lg ${className}`} style={{ background: THEME.card, border: `1px solid ${THEME.line}`, ...style }}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', className = '' }) {
  const styles = {
    primary: { background: THEME.brand, color: 'white', border: `1px solid ${THEME.brand}` },
    secondary: { background: 'transparent', color: THEME.ink, border: `1px solid ${THEME.line}` },
    ghost: { background: 'transparent', color: THEME.inkSoft, border: '1px solid transparent' },
    danger: { background: 'transparent', color: THEME.red, border: `1px solid ${THEME.line}` },
    accent: { background: THEME.accent, color: 'white', border: `1px solid ${THEME.accent}` },
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5' };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${sizes[size]} font-medium rounded-md transition-opacity ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-85 cursor-pointer'} ${className}`}
      style={styles[variant]}>
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder, type = 'text', className = '', ...rest }) {
  return (
    <input type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder}
      className={`w-full px-3 py-2 rounded-md outline-none transition-colors ${className}`}
      style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink, fontFamily: 'DM Sans, sans-serif' }}
      onFocus={(e) => e.target.style.borderColor = THEME.brand}
      onBlur={(e) => e.target.style.borderColor = THEME.line}
      {...rest} />
  );
}

function Select({ value, onChange, options, className = '' }) {
  return (
    <select value={value ?? ''} onChange={onChange}
      className={`w-full px-3 py-2 rounded-md outline-none ${className}`}
      style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink }}>
      {options.map((o) => (
        <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
          {typeof o === 'string' ? o : o.label}
        </option>
      ))}
    </select>
  );
}

function Label({ children }) {
  return (
    <label className="block text-xs uppercase tracking-wider mb-1.5 font-medium" style={{ color: THEME.inkSoft, letterSpacing: '0.08em' }}>
      {children}
    </label>
  );
}

function Badge({ children, color = 'brand' }) {
  const colors = {
    brand: { bg: '#F5E6E1', fg: THEME.brand },
    green: { bg: '#E5EDDE', fg: THEME.green },
    red: { bg: '#F5DDE0', fg: THEME.red },
    amber: { bg: '#F7E8C9', fg: '#9A6A1F' },
    gray: { bg: '#EDE6DC', fg: THEME.inkSoft },
  };
  const c = colors[color] || colors.brand;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ background: c.bg, color: c.fg }}>
      {children}
    </span>
  );
}

function statusColor(status) {
  if (status === 'Paid' || status === 'Delivered') return 'green';
  if (status === 'Unpaid' || status === 'Cancelled') return 'red';
  if (status === 'Partial' || status === 'Pending') return 'amber';
  return 'gray';
}

function Modal({ open, onClose, children, maxWidth = 'max-w-2xl' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print"
      style={{ background: 'rgba(42,38,36,0.55)' }} onClick={onClose}>
      <div className={`w-full ${maxWidth} max-h-[90vh] overflow-auto rounded-lg`} style={{ background: THEME.card }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function Header({ title, subtitle, right }) {
  return (
    <div className="flex items-end justify-between mb-6 no-print">
      <div>
        <h1 className="font-display text-3xl leading-tight" style={{ color: THEME.ink }}>{title}</h1>
        {subtitle && <div className="text-sm mt-1" style={{ color: THEME.inkSoft }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

function KpiCard({ label, value, sub, accent, icon }) {
  return (
    <Card className="p-5">
      <div className="text-xs uppercase tracking-wider mb-2" style={{ color: THEME.inkSoft, letterSpacing: '0.08em' }}>{label}</div>
      <div className="font-display text-2xl leading-tight flex items-center gap-2" style={{ color: accent || THEME.ink }}>
        {value}
        {icon && <span style={{ color: accent }}>{icon}</span>}
      </div>
      {sub && <div className="text-xs mt-1.5" style={{ color: THEME.inkSoft }}>{sub}</div>}
    </Card>
  );
}

function SmallStat({ label, value, color }) {
  return (
    <Card className="px-5 py-3 flex items-center justify-between">
      <div>
        <div className="text-xs uppercase tracking-wider" style={{ color: THEME.inkSoft, letterSpacing: '0.08em' }}>{label}</div>
        <div className="font-display text-lg" style={{ color }}>{value}</div>
      </div>
      <div className="w-2 h-10 rounded-full" style={{ background: color }} />
    </Card>
  );
}

function EmptyHint({ children }) {
  return <div className="py-12 text-center text-sm" style={{ color: THEME.inkSoft }}>{children}</div>;
}

/* ============================================================
   MAIN APP
   ============================================================ */

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState('dashboard');
  const [catalog, setCatalog] = useState([]);
  const [orders, setOrders] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [inventory, setInventory] = useState({});
  const [meta, setMeta] = useState({ lastOrderNum: 0 });
  const [saving, setSaving] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const lastSaveRef = useRef(Date.now());

  useEffect(() => {
    const c = storage.load('catalog', null);
    const o = storage.load('orders', {});
    const e = storage.load('expenses', []);
    const i = storage.load('inventory', null);
    const m = storage.load('meta', { lastOrderNum: 0 });
    setCatalog(c || SEED_PRODUCTS);
    setOrders(o || {});
    setExpenses(e || []);
    setInventory(i || Object.fromEntries(SEED_PRODUCTS.map(p => [p.name, { qty: 0, dateAdded: '', notes: '' }])));
    setMeta(m || { lastOrderNum: 0 });
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    setSaving(true);
    storage.save('catalog', catalog);
    storage.save('orders', orders);
    storage.save('expenses', expenses);
    storage.save('inventory', inventory);
    storage.save('meta', meta);
    lastSaveRef.current = Date.now();
    const t = setTimeout(() => setSaving(false), 300);
    return () => clearTimeout(t);
  }, [catalog, orders, expenses, inventory, meta, loaded]);

  const productByName = useMemo(() => Object.fromEntries(catalog.map(p => [p.name, p])), [catalog]);

  const exportData = () => {
    const data = {
      version: 1,
      exported_at: new Date().toISOString(),
      catalog, orders, expenses, inventory, meta,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mn-meatshop-backup-${today()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.catalog || !data.orders) {
          alert('That file doesn\'t look like an M&N Meatshop backup.');
          return;
        }
        if (!confirm('This will REPLACE all your current data with the backup. Continue?')) return;
        setCatalog(data.catalog);
        setOrders(data.orders);
        setExpenses(data.expenses || []);
        setInventory(data.inventory || {});
        setMeta(data.meta || { lastOrderNum: 0 });
        setShowBackup(false);
        alert('Backup restored successfully!');
      } catch (err) {
        alert('Could not read that file. Make sure it\'s a valid backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: THEME.bg, color: THEME.ink }}>
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-3" size={28} style={{ color: THEME.brand }} />
          <div className="font-display text-xl">Loading M&N Meatshop…</div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new', label: 'New Order', icon: PlusCircle },
    { id: 'orders', label: 'Orders', icon: ListOrdered },
    { id: 'pickup', label: 'Pickup Check', icon: Truck },
    { id: 'expenses', label: 'Expenses', icon: Wallet },
    { id: 'inventory', label: 'Inventory', icon: Snowflake },
    { id: 'products', label: 'Price List', icon: Tag },
  ];

  return (
    <div className="min-h-screen" style={{ background: THEME.bg, color: THEME.ink, fontFamily: 'DM Sans, sans-serif' }}>
      <div className="flex">
        <aside className="w-60 min-h-screen border-r flex flex-col no-print" style={{ borderColor: THEME.line, background: THEME.card }}>
          <div className="px-6 py-6 border-b flex flex-col items-center text-center" style={{ borderColor: THEME.line }}>
            <img src={LOGO_DATA_URL} alt="M&N Meatshop" className="w-28 h-28 rounded-full object-cover mb-3" style={{ boxShadow: '0 2px 10px rgba(122,46,51,0.18)' }} />
            <div className="font-display text-xl leading-tight" style={{ color: THEME.brand }}>M&N Meatshop</div>
            <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>Your daily meat choice</div>
          </div>
          <nav className="flex-1 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button key={item.id} onClick={() => setView(item.id)}
                  className="w-full flex items-center gap-3 px-6 py-2.5 text-sm transition-colors text-left"
                  style={{
                    background: active ? '#F5E6E1' : 'transparent',
                    color: active ? THEME.brand : THEME.ink,
                    fontWeight: active ? 600 : 400,
                    borderLeft: active ? `3px solid ${THEME.brand}` : '3px solid transparent',
                    paddingLeft: active ? '21px' : '24px',
                  }}>
                  <Icon size={17} />{item.label}
                </button>
              );
            })}
          </nav>
          <div className="px-6 py-4 border-t" style={{ borderColor: THEME.line }}>
            <button onClick={() => setShowBackup(true)} className="flex items-center gap-2 text-xs mb-2 hover:opacity-70" style={{ color: THEME.inkSoft }}>
              <HardDrive size={12} /> Backup & Restore
            </button>
            <div className="text-xs flex items-center gap-2" style={{ color: THEME.inkSoft }}>
              {saving ? (<><Loader2 size={11} className="animate-spin" /> Saving…</>) : (<><Check size={11} style={{ color: THEME.green }} /> All saved</>)}
            </div>
            <div className="text-xs mt-1 opacity-70" style={{ color: THEME.inkSoft }}>{Object.keys(orders).length} orders · {expenses.length} expenses</div>
            <div className="text-xs mt-2 px-2 py-1 rounded inline-block" style={{ background: '#F5E6E1', color: THEME.brand, fontWeight: 600 }}>
              {APP_VERSION}
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8">
          {view === 'dashboard' && <Dashboard orders={orders} expenses={expenses} catalog={catalog} setView={setView} privacy={privacy} setPrivacy={setPrivacy} />}
          {view === 'new' && <NewOrder catalog={catalog} meta={meta} setMeta={setMeta} orders={orders} setOrders={setOrders} onSaved={() => setView('orders')} />}
          {view === 'orders' && <Orders orders={orders} setOrders={setOrders} productByName={productByName} catalog={catalog} />}
          {view === 'pickup' && <Pickup orders={orders} />}
          {view === 'expenses' && <Expenses expenses={expenses} setExpenses={setExpenses} />}
          {view === 'inventory' && <Inventory inventory={inventory} setInventory={setInventory} catalog={catalog} />}
          {view === 'products' && <Products catalog={catalog} setCatalog={setCatalog} />}
        </main>
      </div>

      <Modal open={showBackup} onClose={() => setShowBackup(false)} maxWidth="max-w-lg">
        <div className="px-6 py-5">
          <div className="font-display text-xl mb-2">Backup & Restore</div>
          <div className="text-sm mb-5" style={{ color: THEME.inkSoft }}>
            Your data is saved in this browser. Export a backup file regularly — especially before clearing browser data or switching devices.
          </div>
          <div className="space-y-4">
            <Card className="p-4">
              <div className="font-medium mb-1">Export Backup</div>
              <div className="text-xs mb-3" style={{ color: THEME.inkSoft }}>Downloads a JSON file with everything — orders, expenses, inventory, prices.</div>
              <Btn variant="primary" onClick={exportData}><Download size={14} className="inline -mt-0.5 mr-1" /> Download Backup</Btn>
            </Card>
            <Card className="p-4">
              <div className="font-medium mb-1">Restore from Backup</div>
              <div className="text-xs mb-3" style={{ color: THEME.inkSoft }}>Will replace all current data. Make sure to export a backup first if you want to keep what's here.</div>
              <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-md text-sm font-medium"
                style={{ background: 'transparent', color: THEME.ink, border: `1px solid ${THEME.line}` }}>
                <Upload size={14} className="-mt-0.5 mr-1.5" /> Choose Backup File
                <input type="file" accept=".json,application/json" className="hidden"
                  onChange={(e) => { if (e.target.files[0]) importData(e.target.files[0]); }} />
              </label>
            </Card>
          </div>
          <div className="flex justify-end mt-6">
            <Btn variant="secondary" onClick={() => setShowBackup(false)}>Close</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ============================================================
   DASHBOARD
   ============================================================ */

function Dashboard({ orders, expenses, catalog, setView, privacy, setPrivacy }) {
  const ordersList = Object.values(orders);

  // Privacy-aware money formatter
  const m = (n) => privacy ? '₱•••••' : peso(n);

  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const stats = useMemo(() => {
    let totalSales = 0, totalCost = 0, unpaid = 0;
    let monthSales = 0, monthCost = 0;
    const productQty = {};
    const daily = {};
    const profitByDay = {};
    ordersList.forEach((o) => {
      const oSales = (o.items || []).reduce((s, i) => s + i.qty * i.price, 0);
      const oCost = (o.items || []).reduce((s, i) => s + i.qty * i.cost, 0);
      totalSales += oSales;
      totalCost += oCost;
      if (o.payment_status === 'Unpaid') unpaid += oSales;
      else if (o.payment_status === 'Partial') unpaid += oSales / 2;
      if ((o.date || '').startsWith(thisMonthKey)) {
        monthSales += oSales;
        monthCost += oCost;
      }
      (o.items || []).forEach((it) => {
        productQty[it.product] = (productQty[it.product] || 0) + it.qty * it.price;
      });
      const d = o.date || '';
      daily[d] = (daily[d] || 0) + oSales;
      profitByDay[d] = (profitByDay[d] || 0) + (oSales - oCost);
    });

    const grossProfit = totalSales - totalCost;
    const monthProfit = monthSales - monthCost;
    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const netPosition = grossProfit - totalExpenses;
    const sellingDays = Object.keys(daily).filter(Boolean).length;
    const avgProfitPerDay = sellingDays > 0 ? grossProfit / sellingDays : 0;
    const recoveryPct = totalExpenses > 0
      ? Math.min(100, Math.max(0, (grossProfit / totalExpenses) * 100))
      : (grossProfit > 0 ? 100 : 0);
    const isSelfSustaining = netPosition >= 0;
    const amountToBreakEven = Math.max(0, totalExpenses - grossProfit);

    const topProducts = Object.entries(productQty)
      .map(([name, v]) => ({ name: name.length > 16 ? name.slice(0, 16) + '…' : name, value: Math.round(v) }))
      .sort((a, b) => b.value - a.value).slice(0, 5);

    const trend = Object.entries(daily)
      .map(([date, sales]) => ({ date, sales: Math.round(sales), profit: Math.round(profitByDay[date] || 0), label: fmtDateShort(date) }))
      .sort((a, b) => a.date.localeCompare(b.date)).slice(-10);

    return {
      totalSales, grossProfit, monthSales, monthProfit, totalExpenses,
      netPosition, unpaid, orderCount: ordersList.length,
      sellingDays, avgProfitPerDay, recoveryPct, isSelfSustaining, amountToBreakEven,
      topProducts, trend,
    };
  }, [orders, expenses, thisMonthKey]);

  const unpaidOrders = useMemo(() =>
    ordersList
      .filter(o => o.payment_status === 'Unpaid' || o.payment_status === 'Partial')
      .sort((a, b) => (b.id || '').localeCompare(a.id || ''))
      .slice(0, 5),
    [orders]
  );

  const recentOrders = useMemo(
    () => ordersList.sort((a, b) => (b.id || '').localeCompare(a.id || '')).slice(0, 5),
    [orders]
  );

  const monthName = now.toLocaleString('en-PH', { month: 'long' });

  return (
    <div>
      {/* ===== Clean header: logo + title + privacy toggle ===== */}
      <div className="flex items-center justify-between mb-7 no-print">
        <div className="flex items-center gap-4">
          <img src={LOGO_DATA_URL} alt="M&N Meatshop" className="w-14 h-14 rounded-full object-cover" style={{ boxShadow: '0 2px 8px rgba(122,46,51,0.15)' }} />
          <div>
            <h1 className="font-display text-3xl leading-tight" style={{ color: THEME.ink }}>Dashboard</h1>
            <div className="text-sm" style={{ color: THEME.inkSoft }}>{monthName} {now.getFullYear()} · {stats.orderCount} orders all-time</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPrivacy(!privacy)}
            className="flex items-center gap-2 px-3.5 py-2 text-sm rounded-md transition-colors"
            style={{ background: privacy ? THEME.brand : 'transparent', color: privacy ? 'white' : THEME.inkSoft, border: `1px solid ${privacy ? THEME.brand : THEME.line}` }}
            title={privacy ? 'Show amounts' : 'Hide amounts'}
          >
            {privacy ? <EyeOff size={15} /> : <Eye size={15} />}
            {privacy ? 'Amounts hidden' : 'Hide amounts'}
          </button>
          <Btn variant="primary" onClick={() => setView('new')}><PlusCircle size={16} className="inline mr-1.5 -mt-0.5" />New Order</Btn>
        </div>
      </div>

      {/* ===== Hero: This month's profit (the one number that matters most) ===== */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="col-span-2 p-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${THEME.brand} 0%, ${THEME.brandSoft} 100%)`, border: 'none' }}>
          <div className="relative z-10">
            <div className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.75)' }}>{monthName} Profit</div>
            <div className="font-display text-5xl mt-2 text-white">{m(stats.monthProfit)}</div>
            <div className="flex gap-6 mt-4">
              <div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Sales this month</div>
                <div className="text-lg font-medium text-white">{m(stats.monthSales)}</div>
              </div>
              <div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Money owed to you</div>
                <div className="text-lg font-medium" style={{ color: stats.unpaid > 0 ? '#F0C674' : 'rgba(255,255,255,0.9)' }}>{m(stats.unpaid)}</div>
              </div>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-10">
            <img src={LOGO_DATA_URL} alt="" className="w-44 h-44 rounded-full object-cover" />
          </div>
        </Card>

        <Card className="p-6 flex flex-col justify-center">
          <div className="text-xs uppercase tracking-wider mb-2" style={{ color: THEME.inkSoft }}>All-Time Profit</div>
          <div className="font-display text-3xl" style={{ color: THEME.green }}>{m(stats.grossProfit)}</div>
          <div className="text-xs mt-1" style={{ color: THEME.inkSoft }}>From {m(stats.totalSales)} total sales</div>
          <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${THEME.line}` }}>
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: THEME.inkSoft }}>Avg / Selling Day</div>
            <div className="font-display text-xl" style={{ color: THEME.ink }}>{m(stats.avgProfitPerDay)}</div>
          </div>
        </Card>
      </div>

      {/* ===== Trend chart (the main visual) ===== */}
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-display text-lg">Sales & Profit</div>
            <div className="text-xs" style={{ color: THEME.inkSoft }}>Last 10 active days</div>
          </div>
          <div className="flex gap-4 text-xs" style={{ color: THEME.inkSoft }}>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 inline-block" style={{ background: THEME.brand }} /> Sales</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 inline-block" style={{ background: THEME.green }} /> Profit</span>
          </div>
        </div>
        {stats.trend.length === 0 ? (
          <EmptyHint>No sales yet. Add your first order to see the trend.</EmptyHint>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats.trend} margin={{ left: -10, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={THEME.brand} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={THEME.brand} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={THEME.green} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={THEME.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke={THEME.line} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: THEME.inkSoft, fontSize: 11 }} axisLine={{ stroke: THEME.line }} tickLine={false} />
              <YAxis tick={{ fill: THEME.inkSoft, fontSize: 11 }} axisLine={false} tickLine={false} width={56}
                tickFormatter={(v) => privacy ? '•••' : (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
              <Tooltip contentStyle={{ background: THEME.card, border: `1px solid ${THEME.line}`, borderRadius: 8, fontSize: 13 }}
                formatter={(v, n) => [privacy ? '₱•••••' : peso(v), n === 'sales' ? 'Sales' : 'Profit']} />
              <Area type="monotone" dataKey="sales" stroke={THEME.brand} strokeWidth={2.5} fill="url(#gS)" />
              <Area type="monotone" dataKey="profit" stroke={THEME.green} strokeWidth={2.5} fill="url(#gP)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* ===== Two columns: Money owed (actionable) + Top products ===== */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-display text-lg">Money Owed to You</div>
              <div className="text-xs" style={{ color: THEME.inkSoft }}>Unpaid & partial orders</div>
            </div>
            {stats.unpaid > 0 && <Badge color="red">{m(stats.unpaid)}</Badge>}
          </div>
          {unpaidOrders.length === 0 ? (
            <div className="py-8 text-center text-sm" style={{ color: THEME.green }}>
              <Check size={20} className="mx-auto mb-2" /> All orders are paid. Nice.
            </div>
          ) : (
            <div className="space-y-1">
              {unpaidOrders.map((o) => {
                const t = (o.items || []).reduce((s, i) => s + i.qty * i.price, 0);
                return (
                  <div key={o.id} className="flex items-center justify-between py-2 px-2 rounded hover:bg-amber-50 cursor-pointer"
                    onClick={() => setView('orders')}>
                    <div>
                      <div className="text-sm font-medium">{o.customer}</div>
                      <div className="text-xs" style={{ color: THEME.inkSoft }}>{fmtDateShort(o.date)} · {o.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium" style={{ color: THEME.red }}>{m(t)}</div>
                      <Badge color={statusColor(o.payment_status)}>{o.payment_status}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="font-display text-lg mb-1">Top Products</div>
          <div className="text-xs mb-4" style={{ color: THEME.inkSoft }}>By total sales</div>
          {stats.topProducts.length === 0 ? (
            <EmptyHint>No sales yet.</EmptyHint>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={stats.topProducts} layout="vertical" margin={{ left: 0, right: 8 }}>
                <CartesianGrid strokeDasharray="2 4" stroke={THEME.line} horizontal={false} />
                <XAxis type="number" tick={{ fill: THEME.inkSoft, fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => privacy ? '•••' : (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fill: THEME.ink, fontSize: 10.5 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#F5E6E1' }}
                  contentStyle={{ background: THEME.card, border: `1px solid ${THEME.line}`, borderRadius: 8 }}
                  formatter={(v) => [privacy ? '₱•••••' : peso(v), 'Sales']} />
                <Bar dataKey="value" fill={THEME.brand} radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ===== Recent orders ===== */}
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="font-display text-lg">Recent Orders</div>
          <Btn variant="secondary" size="sm" onClick={() => setView('orders')}>View all <ChevronRight size={14} className="inline" /></Btn>
        </div>
        {recentOrders.length === 0 ? (
          <EmptyHint>No orders yet. Click "New Order" to log your first sale.</EmptyHint>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ color: THEME.inkSoft, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <th className="pb-2 font-medium">Order</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Items</th>
                <th className="pb-2 font-medium text-right">Total</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => {
                const t = (o.items || []).reduce((s, i) => s + i.qty * i.price, 0);
                return (
                  <tr key={o.id} style={{ borderTop: `1px solid ${THEME.line}` }}>
                    <td className="py-2.5 font-medium">{o.id}</td>
                    <td className="py-2.5" style={{ color: THEME.inkSoft }}>{fmtDate(o.date)}</td>
                    <td className="py-2.5">{o.customer}</td>
                    <td className="py-2.5" style={{ color: THEME.inkSoft }}>{(o.items || []).length} item{(o.items || []).length !== 1 ? 's' : ''}</td>
                    <td className="py-2.5 text-right font-medium">{m(t)}</td>
                    <td className="py-2.5"><Badge color={statusColor(o.payment_status)}>{o.payment_status}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* ===== Business health: demoted to one compact strip ===== */}
      <Card className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: stats.isSelfSustaining ? '#E5EDDE' : '#F7E8C9' }}>
              <Activity size={16} style={{ color: stats.isSelfSustaining ? THEME.green : THEME.amber }} />
            </div>
            <div>
              <div className="text-sm font-medium">
                {stats.isSelfSustaining ? 'Business is self-sustaining' : 'Building toward break-even'}
              </div>
              <div className="text-xs" style={{ color: THEME.inkSoft }}>
                {stats.isSelfSustaining
                  ? `Net position: +${m(stats.netPosition)} after all expenses`
                  : `${m(stats.amountToBreakEven)} more profit needed to cover all expenses`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider" style={{ color: THEME.inkSoft }}>Recovery</div>
              <div className="font-display text-lg" style={{ color: stats.isSelfSustaining ? THEME.green : THEME.amber }}>
                {stats.recoveryPct.toFixed(0)}%
              </div>
            </div>
            <div className="w-32">
              <div className="h-2 rounded-full overflow-hidden" style={{ background: THEME.line }}>
                <div className="h-full rounded-full" style={{ width: `${stats.recoveryPct}%`, background: stats.isSelfSustaining ? THEME.green : THEME.amber }} />
              </div>
              <div className="text-xs mt-1 text-right" style={{ color: THEME.inkSoft }}>
                {m(stats.grossProfit)} / {m(stats.totalExpenses)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   NEW ORDER
   ============================================================ */

function NewOrder({ catalog, meta, setMeta, orders, setOrders, onSaved }) {
  const [date, setDate] = useState(today());
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [deliveryStatus, setDeliveryStatus] = useState('Pending');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ product: '', qty: 1, note: '' }]);
  const [error, setError] = useState('');
  const [hideAmounts, setHideAmounts] = useState(false);

  const productByName = useMemo(() => Object.fromEntries(catalog.map(p => [p.name, p])), [catalog]);
  const m = (n) => hideAmounts ? '₱•••••' : peso(n);
  const lineTotal = (it) => { const p = productByName[it.product]; return p ? (Number(it.qty) || 0) * p.price : 0; };
  const lineCost = (it) => { const p = productByName[it.product]; return p ? (Number(it.qty) || 0) * p.cost : 0; };
  const orderTotal = items.reduce((s, it) => s + lineTotal(it), 0);
  const orderCost = items.reduce((s, it) => s + lineCost(it), 0);
  const orderProfit = orderTotal - orderCost;

  const updateItem = (idx, patch) => setItems(items.map((it, i) => i === idx ? { ...it, ...patch } : it));
  const addItem = () => setItems([...items, { product: '', qty: 1, note: '' }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const save = () => {
    setError('');
    if (!customer.trim()) { setError('Customer name is required'); return; }
    const cleanItems = items.filter(it => it.product && Number(it.qty) > 0);
    if (cleanItems.length === 0) { setError('Add at least one product with quantity > 0'); return; }
    const newNum = (meta.lastOrderNum || 0) + 1;
    const id = nextOrderId(meta.lastOrderNum || 0);
    const snapshotItems = cleanItems.map((it) => {
      const p = productByName[it.product];
      return { product: it.product, qty: Number(it.qty), price: p.price, cost: p.cost, unit: p.unit, note: (it.note || '').trim() };
    });
    const order = {
      id, date, customer: customer.trim(), phone: phone.trim(),
      payment_status: paymentStatus, payment_method: paymentMethod, delivery_status: deliveryStatus,
      notes: notes.trim(), items: snapshotItems, created_at: new Date().toISOString(),
    };
    setOrders({ ...orders, [id]: order });
    setMeta({ ...meta, lastOrderNum: newNum });
    onSaved();
  };

  return (
    <div>
      <Header title="New Order" subtitle="Log a sale. Prices auto-fill from your price list."
        right={
          <button
            onClick={() => setHideAmounts(!hideAmounts)}
            className="flex items-center gap-2 px-3.5 py-2 text-sm rounded-md transition-colors"
            style={{ background: hideAmounts ? THEME.brand : 'transparent', color: hideAmounts ? 'white' : THEME.inkSoft, border: `1px solid ${hideAmounts ? THEME.brand : THEME.line}` }}
            title={hideAmounts ? 'Show amounts' : 'Hide amounts while customer is picking'}
          >
            {hideAmounts ? <EyeOff size={15} /> : <Eye size={15} />}
            {hideAmounts ? 'Amounts hidden' : 'Hide amounts'}
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          <Card className="p-6">
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div><Label>Customer Name</Label><Input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Juan Dela Cruz" /></div>
              <div><Label>Phone (optional)</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0917 123 4567" /></div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-display text-lg">Order Items</div>
              <Btn variant="secondary" size="sm" onClick={addItem}><Plus size={14} className="inline -mt-0.5" /> Add item</Btn>
            </div>
            <div className="space-y-3">
              {items.map((it, idx) => {
                const p = productByName[it.product];
                return (
                  <div key={idx} className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-4">
                      {idx === 0 && <Label>Product</Label>}
                      <select value={it.product} onChange={(e) => updateItem(idx, { product: e.target.value })}
                        className="w-full px-3 py-2 rounded-md outline-none"
                        style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink }}>
                        <option value="">— Select product —</option>
                        {['Pork', 'Chicken', 'Beef'].map((group) => (
                          <optgroup key={group} label={group}>
                            {catalog.filter(c => c.group === group).map(c => (<option key={c.name} value={c.name}>{c.name}</option>))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      {idx === 0 && <Label>Qty</Label>}
                      <Input type="number" step="0.01" min="0" value={it.qty} onChange={(e) => updateItem(idx, { qty: e.target.value })} />
                    </div>
                    <div className="col-span-3">
                      {idx === 0 && <Label>Notes / Special Cut</Label>}
                      <Input value={it.note} onChange={(e) => updateItem(idx, { note: e.target.value })} placeholder="e.g. thin slice" />
                    </div>
                    <div className="col-span-2">
                      {idx === 0 && <Label>Line</Label>}
                      <div className="px-2 py-2 text-sm font-medium">{lineTotal(it) > 0 ? m(lineTotal(it)) : '—'}</div>
                    </div>
                    <div className="col-span-1">
                      {idx === 0 && <Label>&nbsp;</Label>}
                      {items.length > 1 && (
                        <button onClick={() => removeItem(idx)} className="p-2 rounded hover:bg-red-50" style={{ color: THEME.red }}><X size={14} /></button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 grid grid-cols-3 gap-4" style={{ borderTop: `1px solid ${THEME.line}` }}>
              <div><div className="text-xs uppercase tracking-wider" style={{ color: THEME.inkSoft }}>Total Sales</div><div className="font-display text-xl mt-0.5" style={{ color: THEME.brand }}>{m(orderTotal)}</div></div>
              <div><div className="text-xs uppercase tracking-wider" style={{ color: THEME.inkSoft }}>Supplier Cost</div><div className="font-display text-xl mt-0.5" style={{ color: THEME.inkSoft }}>{m(orderCost)}</div></div>
              <div><div className="text-xs uppercase tracking-wider" style={{ color: THEME.inkSoft }}>Profit</div><div className="font-display text-xl mt-0.5" style={{ color: THEME.green }}>{m(orderProfit)}</div></div>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-6">
            <div className="font-display text-lg mb-4">Status</div>
            <div className="space-y-4">
              <div>
                <Label>Payment Status</Label>
                <div className="flex gap-2">
                  {PAYMENT_STATUSES.map((s) => (
                    <button key={s} onClick={() => setPaymentStatus(s)}
                      className="flex-1 px-3 py-2 text-sm rounded-md"
                      style={{ background: paymentStatus === s ? THEME.brand : 'transparent', color: paymentStatus === s ? 'white' : THEME.ink, border: `1px solid ${paymentStatus === s ? THEME.brand : THEME.line}` }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div><Label>Payment Method</Label><Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} options={PAYMENT_METHODS} /></div>
              <div><Label>Delivery Status</Label><Select value={deliveryStatus} onChange={(e) => setDeliveryStatus(e.target.value)} options={DELIVERY_STATUSES} /></div>
              <div>
                <Label>Notes</Label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded-md outline-none text-sm"
                  style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink, fontFamily: 'DM Sans' }}
                  placeholder="Optional" />
              </div>
            </div>
          </Card>

          {error && (
            <div className="px-4 py-3 rounded-md flex items-start gap-2 text-sm" style={{ background: '#F5DDE0', color: THEME.red }}>
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />{error}
            </div>
          )}

          <Btn variant="primary" size="lg" onClick={save} className="w-full">
            <Save size={16} className="inline mr-2 -mt-0.5" /> Save Order
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ORDERS LIST
   ============================================================ */

function Orders({ orders, setOrders, productByName, catalog }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [printMode, setPrintMode] = useState(null);

  const ordersList = useMemo(() => {
    let list = Object.values(orders);
    if (filter !== 'all') list = list.filter(o => o.payment_status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        (o.customer || '').toLowerCase().includes(q) ||
        (o.items || []).some(i => i.product.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
  }, [orders, search, filter]);

  const deleteOrder = (id) => {
    if (!confirm(`Delete order ${id}? This cannot be undone.`)) return;
    const next = { ...orders };
    delete next[id];
    setOrders(next);
    setSelected(null);
  };

  const updateOrderStatus = (id, patch) => {
    setOrders({ ...orders, [id]: { ...orders[id], ...patch } });
    if (selected && selected.id === id) setSelected({ ...selected, ...patch });
  };

  const saveFullOrder = (id, updatedOrder) => {
    setOrders({ ...orders, [id]: updatedOrder });
    setSelected(updatedOrder);
  };

  if (printMode && selected) {
    return <PrintableView order={selected} mode={printMode} onBack={() => setPrintMode(null)} />;
  }

  return (
    <div>
      <Header title="Orders" subtitle={`${ordersList.length} order${ordersList.length !== 1 ? 's' : ''}`} />

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: THEME.inkSoft }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order ID, customer, or product…"
              className="w-full pl-9 pr-3 py-2 rounded-md outline-none text-sm"
              style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink }} />
          </div>
          <div className="flex gap-1">
            {['all', 'Paid', 'Unpaid', 'Partial'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 text-sm rounded-md"
                style={{ background: filter === f ? THEME.brand : 'transparent', color: filter === f ? 'white' : THEME.ink, border: `1px solid ${filter === f ? THEME.brand : THEME.line}` }}>
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>

        {ordersList.length === 0 ? (
          <EmptyHint>No orders match. Try clearing filters.</EmptyHint>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ color: THEME.inkSoft, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <th className="pb-2 font-medium">Order ID</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Items</th>
                <th className="pb-2 font-medium text-right">Total</th>
                <th className="pb-2 font-medium">Payment</th>
                <th className="pb-2 font-medium">Delivery</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {ordersList.map((o) => {
                const total = (o.items || []).reduce((s, i) => s + i.qty * i.price, 0);
                return (
                  <tr key={o.id} style={{ borderTop: `1px solid ${THEME.line}` }} className="hover:bg-amber-50 cursor-pointer" onClick={() => setSelected(o)}>
                    <td className="py-2.5 font-medium">{o.id}</td>
                    <td className="py-2.5" style={{ color: THEME.inkSoft }}>{fmtDate(o.date)}</td>
                    <td className="py-2.5">{o.customer}</td>
                    <td className="py-2.5" style={{ color: THEME.inkSoft }}>{(o.items || []).length} item{(o.items || []).length !== 1 ? 's' : ''}</td>
                    <td className="py-2.5 text-right font-medium">{peso(total)}</td>
                    <td className="py-2.5"><Badge color={statusColor(o.payment_status)}>{o.payment_status}</Badge></td>
                    <td className="py-2.5"><Badge color={statusColor(o.delivery_status)}>{o.delivery_status}</Badge></td>
                    <td className="py-2.5 text-right">
                      <button onClick={(e) => { e.stopPropagation(); setSelected(o); }} style={{ color: THEME.inkSoft }} className="p-1.5 hover:opacity-70"><Eye size={15} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} maxWidth="max-w-3xl">
        {selected && (
          <OrderDetail
            order={selected}
            catalog={catalog}
            productByName={productByName}
            onClose={() => setSelected(null)}
            onDelete={() => deleteOrder(selected.id)}
            onPrint={(mode) => setPrintMode(mode)}
            onUpdate={(patch) => updateOrderStatus(selected.id, patch)}
            onSaveFull={(updated) => saveFullOrder(selected.id, updated)}
          />
        )}
      </Modal>
    </div>
  );
}

function OrderDetail({ order, catalog, productByName, onClose, onDelete, onPrint, onUpdate, onSaveFull }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [err, setErr] = useState('');

  const startEdit = () => {
    setDraft({
      date: order.date || today(),
      customer: order.customer || '',
      phone: order.phone || '',
      payment_status: order.payment_status || 'Paid',
      payment_method: order.payment_method || 'Cash',
      delivery_status: order.delivery_status || 'Pending',
      notes: order.notes || '',
      items: (order.items || []).map((it) => ({ ...it })),
    });
    setErr('');
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setDraft(null); setErr(''); };

  const dUpdateItem = (idx, patch) => {
    setDraft({ ...draft, items: draft.items.map((it, i) => i === idx ? { ...it, ...patch } : it) });
  };
  const dChangeProduct = (idx, name) => {
    const p = productByName[name];
    const it = draft.items[idx];
    // Re-price to the product's current price/cost when product changes
    const updated = p
      ? { ...it, product: name, price: p.price, cost: p.cost, unit: p.unit }
      : { ...it, product: name };
    setDraft({ ...draft, items: draft.items.map((x, i) => i === idx ? updated : x) });
  };
  const dAddItem = () => setDraft({ ...draft, items: [...draft.items, { product: '', qty: 1, note: '', price: 0, cost: 0, unit: 'kg' }] });
  const dRemoveItem = (idx) => setDraft({ ...draft, items: draft.items.filter((_, i) => i !== idx) });

  const saveEdit = () => {
    setErr('');
    if (!draft.customer.trim()) { setErr('Customer name is required'); return; }
    const cleanItems = draft.items
      .filter(it => it.product && Number(it.qty) > 0)
      .map(it => {
        const p = productByName[it.product];
        return {
          product: it.product,
          qty: Number(it.qty),
          price: p ? p.price : Number(it.price) || 0,
          cost: p ? p.cost : Number(it.cost) || 0,
          unit: p ? p.unit : (it.unit || 'kg'),
          note: (it.note || '').trim(),
        };
      });
    if (cleanItems.length === 0) { setErr('Add at least one product with quantity > 0'); return; }
    const updated = {
      ...order,
      date: draft.date,
      customer: draft.customer.trim(),
      phone: draft.phone.trim(),
      payment_status: draft.payment_status,
      payment_method: draft.payment_method,
      delivery_status: draft.delivery_status,
      notes: draft.notes.trim(),
      items: cleanItems,
      edited_at: new Date().toISOString(),
    };
    onSaveFull(updated);
    setEditing(false);
    setDraft(null);
  };

  const view = editing ? draft : order;
  const total = (view.items || []).reduce((s, i) => s + (Number(i.qty) || 0) * (i.price || 0), 0);
  const cost = (view.items || []).reduce((s, i) => s + (Number(i.qty) || 0) * (i.cost || 0), 0);
  const profit = total - cost;

  return (
    <div>
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${THEME.line}` }}>
        <div>
          <div className="font-display text-2xl" style={{ color: THEME.brand }}>{order.id}</div>
          <div className="text-sm" style={{ color: THEME.inkSoft }}>
            {editing ? 'Editing order' : `${fmtDate(order.date)} · ${order.customer}${order.phone ? ` · ${order.phone}` : ''}`}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!editing && (
            <Btn variant="secondary" size="sm" onClick={startEdit}><Edit3 size={14} className="inline -mt-0.5 mr-1" /> Edit</Btn>
          )}
          <button onClick={onClose} className="p-2 rounded hover:bg-amber-50"><X size={18} /></button>
        </div>
      </div>

      <div className="px-6 py-5">
        {/* ===== Edit mode: customer + date ===== */}
        {editing && (
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div><Label>Date</Label><Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></div>
            <div><Label>Customer Name</Label><Input value={draft.customer} onChange={(e) => setDraft({ ...draft, customer: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="optional" /></div>
          </div>
        )}

        {/* ===== Items ===== */}
        {!editing ? (
          <table className="w-full text-sm mb-4">
            <thead>
              <tr style={{ color: THEME.inkSoft, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <th className="text-left pb-2 font-medium">Product</th>
                <th className="text-right pb-2 font-medium">Qty</th>
                <th className="text-left pb-2 font-medium pl-4">Notes / Special Cut</th>
                <th className="text-right pb-2 font-medium">Unit Price</th>
                <th className="text-right pb-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((it, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${THEME.line}` }}>
                  <td className="py-2.5">{it.product}</td>
                  <td className="py-2.5 text-right">{it.qty} {it.unit}</td>
                  <td className="py-2.5 pl-4" style={{ color: it.note ? THEME.ink : THEME.inkSoft }}>{it.note || '—'}</td>
                  <td className="py-2.5 text-right">{peso(it.price)}</td>
                  <td className="py-2.5 text-right font-medium">{peso(it.qty * it.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <Label>Order Items</Label>
              <Btn variant="secondary" size="sm" onClick={dAddItem}><Plus size={13} className="inline -mt-0.5" /> Add item</Btn>
            </div>
            <div className="space-y-3">
              {draft.items.map((it, idx) => {
                const lt = (Number(it.qty) || 0) * (it.price || 0);
                return (
                  <div key={idx} className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-4">
                      {idx === 0 && <Label>Product</Label>}
                      <select value={it.product} onChange={(e) => dChangeProduct(idx, e.target.value)}
                        className="w-full px-3 py-2 rounded-md outline-none text-sm"
                        style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink }}>
                        <option value="">— Select product —</option>
                        {['Pork', 'Chicken', 'Beef'].map((group) => (
                          <optgroup key={group} label={group}>
                            {catalog.filter(c => c.group === group).map(c => (<option key={c.name} value={c.name}>{c.name}</option>))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      {idx === 0 && <Label>Qty</Label>}
                      <Input type="number" step="0.01" min="0" value={it.qty} onChange={(e) => dUpdateItem(idx, { qty: e.target.value })} />
                    </div>
                    <div className="col-span-3">
                      {idx === 0 && <Label>Notes / Special Cut</Label>}
                      <Input value={it.note || ''} onChange={(e) => dUpdateItem(idx, { note: e.target.value })} placeholder="e.g. thin slice" />
                    </div>
                    <div className="col-span-2">
                      {idx === 0 && <Label>Line</Label>}
                      <div className="px-2 py-2 text-sm font-medium">{lt > 0 ? peso(lt) : '—'}</div>
                    </div>
                    <div className="col-span-1">
                      {idx === 0 && <Label>&nbsp;</Label>}
                      {draft.items.length > 1 && (
                        <button onClick={() => dRemoveItem(idx)} className="p-2 rounded hover:bg-red-50" style={{ color: THEME.red }}><X size={14} /></button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-xs mt-2" style={{ color: THEME.inkSoft }}>
              Note: changing a product re-prices that line to the product's current price.
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-5 py-3" style={{ borderTop: `1px solid ${THEME.line}`, borderBottom: `1px solid ${THEME.line}` }}>
          <div><div className="text-xs uppercase tracking-wider" style={{ color: THEME.inkSoft }}>Sales</div><div className="font-display text-lg" style={{ color: THEME.brand }}>{peso(total)}</div></div>
          <div><div className="text-xs uppercase tracking-wider" style={{ color: THEME.inkSoft }}>Cost</div><div className="font-display text-lg" style={{ color: THEME.inkSoft }}>{peso(cost)}</div></div>
          <div><div className="text-xs uppercase tracking-wider" style={{ color: THEME.inkSoft }}>Profit</div><div className="font-display text-lg" style={{ color: THEME.green }}>{peso(profit)}</div></div>
        </div>

        {/* ===== Status fields ===== */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div>
            <Label>Payment Status</Label>
            <Select
              value={editing ? draft.payment_status : order.payment_status}
              onChange={(e) => editing ? setDraft({ ...draft, payment_status: e.target.value }) : onUpdate({ payment_status: e.target.value })}
              options={PAYMENT_STATUSES} />
          </div>
          <div>
            <Label>Payment Method</Label>
            <Select
              value={editing ? draft.payment_method : order.payment_method}
              onChange={(e) => editing ? setDraft({ ...draft, payment_method: e.target.value }) : onUpdate({ payment_method: e.target.value })}
              options={PAYMENT_METHODS} />
          </div>
          <div>
            <Label>Delivery</Label>
            <Select
              value={editing ? draft.delivery_status : order.delivery_status}
              onChange={(e) => editing ? setDraft({ ...draft, delivery_status: e.target.value }) : onUpdate({ delivery_status: e.target.value })}
              options={DELIVERY_STATUSES} />
          </div>
        </div>

        {/* ===== Order notes ===== */}
        {editing ? (
          <div className="mb-5">
            <Label>Order Notes</Label>
            <textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} rows={2}
              className="w-full px-3 py-2 rounded-md outline-none text-sm"
              style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink, fontFamily: 'DM Sans' }}
              placeholder="Optional" />
          </div>
        ) : (
          order.notes && (
            <div className="mb-5"><Label>Notes</Label><div className="text-sm" style={{ color: THEME.ink }}>{order.notes}</div></div>
          )
        )}

        {err && (
          <div className="px-4 py-3 rounded-md flex items-start gap-2 text-sm mb-4" style={{ background: '#F5DDE0', color: THEME.red }}>
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />{err}
          </div>
        )}

        {/* ===== Actions ===== */}
        {editing ? (
          <div className="flex items-center justify-end gap-2">
            <Btn variant="secondary" onClick={cancelEdit}>Cancel</Btn>
            <Btn variant="primary" onClick={saveEdit}><Save size={14} className="inline -mt-0.5 mr-1" /> Save Changes</Btn>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <Btn variant="danger" size="sm" onClick={onDelete}><Trash2 size={14} className="inline -mt-0.5 mr-1" /> Delete</Btn>
            <div className="flex gap-2">
              <Btn variant="secondary" onClick={() => onPrint('supplier')}><FileText size={14} className="inline -mt-0.5 mr-1" /> Supplier Copy</Btn>
              <Btn variant="primary" onClick={() => onPrint('invoice')}><Receipt size={14} className="inline -mt-0.5 mr-1" /> Invoice</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   PRINTABLE INVOICE / SUPPLIER COPY
   ============================================================ */

function PrintableView({ order, mode, onBack }) {
  const total = (order.items || []).reduce((s, i) => s + i.qty * i.price, 0);
  const totalQty = (order.items || []).reduce((s, i) => s + Number(i.qty || 0), 0);
  const isInvoice = mode === 'invoice';
  const docRef = useRef(null);
  const [savingImg, setSavingImg] = useState(false);

  const saveAsImage = async () => {
    if (!docRef.current) return;
    setSavingImg(true);
    try {
      const node = docRef.current;
      // Capture the FULL document using its real scroll size so nothing is clipped
      const fullWidth = node.scrollWidth;
      const fullHeight = node.scrollHeight;
      // Wait a tick so fonts/images settle before capture
      await new Promise((r) => setTimeout(r, 150));
      const dataUrl = await toPng(node, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: fullWidth,
        height: fullHeight,
        cacheBust: true,
        style: {
          margin: '0',
          transform: 'none',
        },
      });
      const a = document.createElement('a');
      const safeName = (order.customer || 'order').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      a.href = dataUrl;
      a.download = `${isInvoice ? 'order-summary' : 'supplier-copy'}-${safeName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      alert('Could not save the image. Try the Print button instead.');
      console.error(e);
    } finally {
      setSavingImg(false);
    }
  };

  return (
    <div style={{ background: THEME.bg, minHeight: '100vh' }}>
      <div className="no-print sticky top-0 z-10 px-8 py-3 flex items-center justify-between" style={{ background: THEME.card, borderBottom: `1px solid ${THEME.line}` }}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm" style={{ color: THEME.ink }}>
          <ArrowLeft size={16} /> Back to order
        </button>
        <div className="flex gap-2">
          <Btn variant="accent" onClick={saveAsImage} disabled={savingImg}>
            {savingImg
              ? <><Loader2 size={15} className="inline -mt-0.5 mr-1.5 animate-spin" /> Saving…</>
              : <><ImageIcon size={15} className="inline -mt-0.5 mr-1.5" /> {isInvoice ? 'Save Order Summary' : 'Save Supplier Copy'}</>}
          </Btn>
          <Btn variant="primary" onClick={() => window.print()}>
            <Printer size={15} className="inline -mt-0.5 mr-1.5" /> Print
          </Btn>
        </div>
      </div>

      <div className="max-w-3xl mx-auto" style={{ marginTop: 24, marginBottom: 24 }}>
        <div ref={docRef} className="p-10" style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="flex flex-col items-center text-center mb-6 pb-5" style={{ borderBottom: `2px solid ${THEME.brand}` }}>
            <img src={LOGO_DATA_URL} alt="M&N Meatshop"
              className="w-24 h-24 rounded-full object-cover mb-3"
              style={{ boxShadow: '0 2px 10px rgba(122,46,51,0.2)' }} />
            <div className="font-display text-3xl" style={{ color: THEME.brand }}>M&N MEATSHOP</div>
            <div className="text-sm mt-0.5" style={{ color: THEME.inkSoft }}>
              Your Daily Meat Choice
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="font-display text-2xl tracking-wide uppercase" style={{ color: THEME.ink }}>
              {isInvoice ? 'Order Summary' : 'Supplier Order Copy'}
            </div>
            {!isInvoice && (
              <div className="text-sm mt-1" style={{ color: THEME.inkSoft }}>
                Please prepare the following items for the customer below.
              </div>
            )}
          </div>

          {/* Customer name as the main identifier */}
          <div className="grid grid-cols-2 gap-6 mb-6 pb-4" style={{ borderBottom: `1px solid ${THEME.line}` }}>
            <div>
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: THEME.inkSoft }}>Customer</div>
              <div className="font-display text-2xl" style={{ color: THEME.brand }}>{order.customer}</div>
              {order.phone && <div className="text-sm mt-0.5" style={{ color: THEME.inkSoft }}>{order.phone}</div>}
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: THEME.inkSoft }}>Date</div>
              <div className="text-lg">{fmtDate(order.date)}</div>
            </div>
          </div>

        {isInvoice ? (
          /* ===== INVOICE / ORDER SUMMARY: product, qty, unit price, amount, notes ===== */
          <table className="w-full mb-6 text-sm">
            <thead>
              <tr style={{ background: '#F5E6E1' }}>
                <th className="text-left px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>#</th>
                <th className="text-left px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>Product / Item</th>
                <th className="text-right px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>Qty</th>
                <th className="text-right px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>Unit Price</th>
                <th className="text-right px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>Amount</th>
                <th className="text-left px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>Notes / Special Cut</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((it, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${THEME.line}` }}>
                  <td className="px-3 py-3" style={{ color: THEME.inkSoft }}>{i + 1}</td>
                  <td className="px-3 py-3">{it.product}</td>
                  <td className="px-3 py-3 text-right">{it.qty} {it.unit}</td>
                  <td className="px-3 py-3 text-right">{peso(it.price)}</td>
                  <td className="px-3 py-3 text-right font-medium">{peso(it.qty * it.price)}</td>
                  <td className="px-3 py-3" style={{ color: it.note ? THEME.ink : THEME.inkSoft }}>{it.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* ===== SUPPLIER COPY: no costs, product + qty + notes ===== */
          <table className="w-full mb-6 text-sm">
            <thead>
              <tr style={{ background: '#F5E6E1' }}>
                <th className="text-left px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>#</th>
                <th className="text-left px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>Product / Item</th>
                <th className="text-right px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>Qty</th>
                <th className="text-left px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>Notes / Special Cut</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((it, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${THEME.line}` }}>
                  <td className="px-3 py-3" style={{ color: THEME.inkSoft }}>{i + 1}</td>
                  <td className="px-3 py-3">{it.product}</td>
                  <td className="px-3 py-3 text-right">{it.qty} {it.unit}</td>
                  <td className="px-3 py-3" style={{ color: it.note ? THEME.ink : THEME.inkSoft }}>{it.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {isInvoice ? (
          <div className="flex justify-end mb-8">
            <div className="w-72">
              <div className="flex justify-between py-3 font-display text-2xl" style={{ borderTop: `2px solid ${THEME.brand}`, color: THEME.brand }}>
                <span>TOTAL</span>
                <span>{pesoFull(total)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-end mb-8">
            <div className="w-72">
              <div className="flex justify-between py-3 font-display text-xl" style={{ borderTop: `2px solid ${THEME.brand}`, color: THEME.brand }}>
                <span>TOTAL QUANTITY</span>
                <span>{totalQty} kg</span>
              </div>
            </div>
          </div>
        )}

        {order.notes && (
          <div className="mt-6 pt-4 text-sm" style={{ borderTop: `1px solid ${THEME.line}`, color: THEME.inkSoft }}>
            <span className="font-medium">Order Notes: </span>{order.notes}
          </div>
        )}

          <div className="text-center mt-10 pt-6 text-sm" style={{ borderTop: `1px solid ${THEME.line}`, color: THEME.inkSoft }}>
            {isInvoice ? 'Thank you for your order!' : 'For supplier use only  ·  M&N Meatshop'}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PICKUP CROSS-CHECK
   ============================================================ */

function Pickup({ orders }) {
  const [selected, setSelected] = useState(new Set());

  const ordersList = useMemo(
    () => Object.values(orders).sort((a, b) => (b.id || '').localeCompare(a.id || '')),
    [orders]
  );

  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };
  const selectAll = () => setSelected(new Set(ordersList.map(o => o.id)));
  const clear = () => setSelected(new Set());

  const rollup = useMemo(() => {
    const byProduct = {};
    selected.forEach((id) => {
      const order = orders[id];
      if (!order) return;
      (order.items || []).forEach((it) => {
        if (!byProduct[it.product]) {
          byProduct[it.product] = { product: it.product, qty: 0, cost: 0, totalCost: 0, unit: it.unit };
        }
        byProduct[it.product].qty += it.qty;
        byProduct[it.product].cost = it.cost;
        byProduct[it.product].totalCost += it.qty * it.cost;
      });
    });
    return Object.values(byProduct).sort((a, b) => a.product.localeCompare(b.product));
  }, [selected, orders]);

  const grandTotal = rollup.reduce((s, r) => s + r.totalCost, 0);

  return (
    <div>
      <Header title="Pickup Cross-Check" subtitle="Select multiple orders to roll up supplier pickup quantities" />

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-display text-lg">Select Orders</div>
              <div className="flex gap-1.5">
                <button onClick={selectAll} className="text-xs px-2 py-1 rounded" style={{ color: THEME.brand, border: `1px solid ${THEME.line}` }}>All</button>
                <button onClick={clear} className="text-xs px-2 py-1 rounded" style={{ color: THEME.inkSoft, border: `1px solid ${THEME.line}` }}>Clear</button>
              </div>
            </div>
            <div className="text-xs mb-3" style={{ color: THEME.inkSoft }}>{selected.size} selected</div>
            <div className="max-h-96 overflow-y-auto -mx-2">
              {ordersList.length === 0 && <EmptyHint>No orders yet.</EmptyHint>}
              {ordersList.map((o) => {
                const total = (o.items || []).reduce((s, i) => s + i.qty * i.price, 0);
                const isSel = selected.has(o.id);
                return (
                  <label key={o.id} className="flex items-center gap-3 px-2 py-2 rounded cursor-pointer" style={{ background: isSel ? '#F5E6E1' : 'transparent' }}>
                    <input type="checkbox" checked={isSel} onChange={() => toggle(o.id)} style={{ accentColor: THEME.brand }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{o.id}</span>
                        <span style={{ color: THEME.inkSoft }}>{peso(total)}</span>
                      </div>
                      <div className="text-xs truncate" style={{ color: THEME.inkSoft }}>{fmtDateShort(o.date)} · {o.customer}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="col-span-3">
          <Card className="p-5">
            <div className="font-display text-lg mb-1">Pickup Roll-up</div>
            <div className="text-xs mb-4" style={{ color: THEME.inkSoft }}>Total quantity & cost to pick up from supplier for the selected orders</div>
            {rollup.length === 0 ? (
              <EmptyHint>Select orders to see the pickup roll-up.</EmptyHint>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ color: THEME.inkSoft, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      <th className="text-left pb-2 font-medium">Product</th>
                      <th className="text-right pb-2 font-medium">Pickup Qty</th>
                      <th className="text-right pb-2 font-medium">Unit Cost</th>
                      <th className="text-right pb-2 font-medium">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rollup.map((r) => (
                      <tr key={r.product} style={{ borderTop: `1px solid ${THEME.line}` }}>
                        <td className="py-2.5">{r.product}</td>
                        <td className="py-2.5 text-right font-medium">{r.qty} {r.unit}</td>
                        <td className="py-2.5 text-right">{peso(r.cost)}</td>
                        <td className="py-2.5 text-right font-medium">{peso(r.totalCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: `2px solid ${THEME.brand}` }}>
                  <div>
                    <div className="text-xs uppercase tracking-wider" style={{ color: THEME.inkSoft }}>Total to pay supplier</div>
                    <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>{selected.size} order{selected.size !== 1 ? 's' : ''} · {rollup.length} product{rollup.length !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="font-display text-3xl" style={{ color: THEME.brand }}>{peso(grandTotal)}</div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   EXPENSES
   ============================================================ */

function Expenses({ expenses, setExpenses }) {
  const [showAdd, setShowAdd] = useState(false);
  const [date, setDate] = useState(today());
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[1]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payment, setPayment] = useState('Cash');
  const [notes, setNotes] = useState('');

  const addExpense = () => {
    if (!description.trim() || !amount || Number(amount) <= 0) return;
    const newExpense = {
      id: 'EXP-' + Date.now(), date, category,
      description: description.trim(), amount: Number(amount), payment, notes: notes.trim(),
    };
    setExpenses([newExpense, ...expenses]);
    setDescription(''); setAmount(''); setNotes('');
    setShowAdd(false);
  };

  const deleteExpense = (id) => {
    if (!confirm('Delete this expense?')) return;
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const stats = useMemo(() => {
    const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const thisMonth = expenses.filter(e => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, e) => s + (e.amount || 0), 0);
    const byCategory = {};
    expenses.forEach((e) => { byCategory[e.category] = (byCategory[e.category] || 0) + (e.amount || 0); });
    const categoryData = Object.entries(byCategory)
      .map(([name, value]) => ({ name, value: Math.round(value), pct: total > 0 ? (value / total) * 100 : 0 }))
      .sort((a, b) => b.value - a.value);
    return { total, thisMonth, categoryData, avg: expenses.length > 0 ? total / expenses.length : 0 };
  }, [expenses]);

  const CATEGORY_COLORS = ['#7A2E33', '#C9853A', '#4F7942', '#A04D52', '#6B5F58', '#D89A3C', '#7B8F5F', '#B23A48'];

  return (
    <div>
      <Header title="Expenses" subtitle="Every peso spent on your business"
        right={<Btn variant="primary" onClick={() => setShowAdd(true)}><Plus size={15} className="inline -mt-0.5 mr-1" />Add Expense</Btn>} />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Spent" value={peso(stats.total)} sub={`${expenses.length} entries`} accent={THEME.brand} />
        <KpiCard label="This Month" value={peso(stats.thisMonth)} sub={new Date().toLocaleString('en-PH', { month: 'long', year: 'numeric' })} accent={THEME.amber} />
        <KpiCard label="Avg per Entry" value={peso(stats.avg)} accent={THEME.inkSoft} />
        <KpiCard label="Top Category" value={stats.categoryData[0]?.name || '—'} sub={stats.categoryData[0] ? peso(stats.categoryData[0].value) : ''} accent={THEME.green} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-1 p-5">
          <div className="font-display text-lg mb-1">By Category</div>
          <div className="text-xs mb-4" style={{ color: THEME.inkSoft }}>Where your money goes</div>
          {stats.categoryData.length === 0 ? (
            <EmptyHint>No expenses yet.</EmptyHint>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={stats.categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {stats.categoryData.map((_, i) => (<Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />))}
                  </Pie>
                  <Tooltip contentStyle={{ background: THEME.card, border: `1px solid ${THEME.line}`, borderRadius: 6 }} formatter={(v) => peso(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3">
                {stats.categoryData.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    <div className="flex-1 truncate">{c.name}</div>
                    <div style={{ color: THEME.inkSoft }} className="text-xs">{c.pct.toFixed(0)}%</div>
                    <div className="font-medium tabular-nums">{peso(c.value)}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card className="col-span-2 p-5">
          <div className="font-display text-lg mb-4">All Entries</div>
          {expenses.length === 0 ? (
            <EmptyHint>No expenses logged yet.</EmptyHint>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0" style={{ background: THEME.card }}>
                  <tr style={{ color: THEME.inkSoft, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <th className="text-left pb-2 font-medium">Date</th>
                    <th className="text-left pb-2 font-medium">Category</th>
                    <th className="text-left pb-2 font-medium">Description</th>
                    <th className="text-right pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id} style={{ borderTop: `1px solid ${THEME.line}` }}>
                      <td className="py-2.5" style={{ color: THEME.inkSoft }}>{fmtDateShort(e.date)}</td>
                      <td className="py-2.5"><Badge color="gray">{e.category}</Badge></td>
                      <td className="py-2.5">{e.description}</td>
                      <td className="py-2.5 text-right font-medium">{peso(e.amount)}</td>
                      <td className="py-2.5 text-right">
                        <button onClick={() => deleteExpense(e.id)} style={{ color: THEME.red }} className="p-1 hover:opacity-70"><Trash2 size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} maxWidth="max-w-lg">
        <div className="px-6 py-5">
          <div className="font-display text-xl mb-5">Add Expense</div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div><Label>Category</Label><Select value={category} onChange={(e) => setCategory(e.target.value)} options={EXPENSE_CATEGORIES} /></div>
            </div>
            <div><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Styrobox cooler" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Amount (₱)</Label><Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></div>
              <div><Label>Payment</Label><Select value={payment} onChange={(e) => setPayment(e.target.value)} options={PAYMENT_METHODS} /></div>
            </div>
            <div><Label>Notes (optional)</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={addExpense}><Save size={14} className="inline -mt-0.5 mr-1" />Save</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ============================================================
   INVENTORY
   ============================================================ */

function Inventory({ inventory, setInventory, catalog }) {
  const updateItem = (product, patch) => {
    setInventory({ ...inventory, [product]: { ...(inventory[product] || { qty: 0, dateAdded: '', notes: '' }), ...patch } });
  };

  const setAllZero = () => {
    if (!confirm('Reset all stock quantities to 0?')) return;
    const next = {};
    Object.keys(inventory).forEach(k => { next[k] = { ...inventory[k], qty: 0 }; });
    setInventory(next);
  };

  const totalKg = useMemo(() => Object.values(inventory).reduce((s, v) => s + (Number(v.qty) || 0), 0), [inventory]);
  const stockValue = useMemo(() => {
    let val = 0;
    catalog.forEach((p) => { val += (Number(inventory[p.name]?.qty) || 0) * p.cost; });
    return val;
  }, [inventory, catalog]);

  const groups = ['Pork', 'Chicken', 'Beef'];

  return (
    <div>
      <Header title="Fridge Stock" subtitle="What's physically in your fridge right now"
        right={<Btn variant="secondary" size="sm" onClick={setAllZero}><RefreshCw size={13} className="inline -mt-0.5 mr-1" />Reset All</Btn>} />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <KpiCard label="Total Stock" value={`${totalKg.toFixed(1)} kg`} sub="Across all products" accent={THEME.brand} />
        <KpiCard label="Stock Value" value={peso(stockValue)} sub="At supplier cost" accent={THEME.accent} />
        <KpiCard label="Out of Stock" value={String(catalog.filter(p => (inventory[p.name]?.qty || 0) === 0).length)} sub={`of ${catalog.length} products`} accent={THEME.red} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {groups.map((group) => {
          const items = catalog.filter(c => c.group === group);
          const emoji = group === 'Pork' ? '🐷' : group === 'Chicken' ? '🐔' : '🐄';
          return (
            <Card key={group} className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{emoji}</span>
                <span className="font-display text-lg">{group}</span>
              </div>
              <div className="space-y-2">
                {items.map((p) => {
                  const cur = inventory[p.name] || { qty: 0, dateAdded: '', notes: '' };
                  const isOut = (Number(cur.qty) || 0) === 0;
                  return (
                    <div key={p.name} className="grid grid-cols-12 gap-2 items-center py-1.5 px-2 rounded" style={{ background: isOut ? 'transparent' : '#F8F2E8' }}>
                      <div className="col-span-7 text-sm">{p.name}</div>
                      <div className="col-span-5 flex items-center gap-1">
                        <button onClick={() => updateItem(p.name, { qty: Math.max(0, (Number(cur.qty) || 0) - 1) })}
                          className="w-7 h-7 rounded text-xs" style={{ background: THEME.line, color: THEME.ink }}>−</button>
                        <input type="number" step="0.1" min="0" value={cur.qty}
                          onChange={(e) => updateItem(p.name, { qty: e.target.value, dateAdded: cur.dateAdded || today() })}
                          className="w-full px-2 py-1 text-sm rounded text-center"
                          style={{ background: THEME.card, border: `1px solid ${THEME.line}` }} />
                        <button onClick={() => updateItem(p.name, { qty: (Number(cur.qty) || 0) + 1, dateAdded: cur.dateAdded || today() })}
                          className="w-7 h-7 rounded text-xs" style={{ background: THEME.brand, color: 'white' }}>+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-center" style={{ color: THEME.inkSoft }}>
        💡 Update qty as you add or sell stock. Use the + / − buttons or type directly.
      </div>
    </div>
  );
}

/* ============================================================
   PRODUCTS / PRICE LIST
   ============================================================ */

function Products({ catalog, setCatalog }) {
  const [editing, setEditing] = useState(null);

  const updateProduct = (idx, patch) => setCatalog(catalog.map((p, i) => i === idx ? { ...p, ...patch } : p));
  const addProduct = () => setEditing({ idx: catalog.length, isNew: true, data: { name: '', unit: 'kg', cost: 0, price: 0, group: 'Pork' } });
  const saveEdit = () => {
    if (!editing) return;
    if (!editing.data.name.trim()) return;
    if (editing.isNew) setCatalog([...catalog, editing.data]);
    else updateProduct(editing.idx, editing.data);
    setEditing(null);
  };
  const removeProduct = (idx) => {
    if (!confirm(`Delete ${catalog[idx].name}? This won't affect past orders.`)) return;
    setCatalog(catalog.filter((_, i) => i !== idx));
  };

  const groups = ['Pork', 'Chicken', 'Beef'];

  return (
    <div>
      <Header title="Price List" subtitle="Supplier cost and selling prices — updates flow to new orders"
        right={<Btn variant="primary" onClick={addProduct}><Plus size={15} className="inline -mt-0.5 mr-1" />Add Product</Btn>} />

      <div className="space-y-5">
        {groups.map((group) => {
          const items = catalog.map((p, i) => ({ ...p, idx: i })).filter(c => c.group === group);
          const emoji = group === 'Pork' ? '🐷' : group === 'Chicken' ? '🐔' : '🐄';
          return (
            <Card key={group} className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{emoji}</span>
                <span className="font-display text-lg">{group}</span>
                <span className="text-xs ml-2" style={{ color: THEME.inkSoft }}>{items.length} product{items.length !== 1 ? 's' : ''}</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ color: THEME.inkSoft, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <th className="text-left pb-2 font-medium">Product</th>
                    <th className="text-right pb-2 font-medium">Unit</th>
                    <th className="text-right pb-2 font-medium">Cost</th>
                    <th className="text-right pb-2 font-medium">Price</th>
                    <th className="text-right pb-2 font-medium">Profit/Unit</th>
                    <th className="text-right pb-2 font-medium">Margin</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => {
                    const margin = p.price > 0 ? ((p.price - p.cost) / p.price) * 100 : 0;
                    return (
                      <tr key={p.idx} style={{ borderTop: `1px solid ${THEME.line}` }}>
                        <td className="py-2.5">{p.name}</td>
                        <td className="py-2.5 text-right" style={{ color: THEME.inkSoft }}>{p.unit}</td>
                        <td className="py-2.5 text-right">{peso(p.cost)}</td>
                        <td className="py-2.5 text-right font-medium">{peso(p.price)}</td>
                        <td className="py-2.5 text-right" style={{ color: THEME.green }}>{peso(p.price - p.cost)}</td>
                        <td className="py-2.5 text-right" style={{ color: THEME.inkSoft }}>{margin.toFixed(1)}%</td>
                        <td className="py-2.5 text-right">
                          <button onClick={() => setEditing({ idx: p.idx, isNew: false, data: { ...catalog[p.idx] } })} className="p-1 mr-1" style={{ color: THEME.inkSoft }}><Edit3 size={13} /></button>
                          <button onClick={() => removeProduct(p.idx)} className="p-1" style={{ color: THEME.red }}><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          );
        })}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} maxWidth="max-w-md">
        {editing && (
          <div className="px-6 py-5">
            <div className="font-display text-xl mb-5">{editing.isNew ? 'Add Product' : 'Edit Product'}</div>
            <div className="space-y-4">
              <div><Label>Product Name</Label><Input value={editing.data.name} onChange={(e) => setEditing({ ...editing, data: { ...editing.data, name: e.target.value } })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Category</Label><Select value={editing.data.group} onChange={(e) => setEditing({ ...editing, data: { ...editing.data, group: e.target.value } })} options={['Pork', 'Chicken', 'Beef']} /></div>
                <div><Label>Unit</Label><Select value={editing.data.unit} onChange={(e) => setEditing({ ...editing, data: { ...editing.data, unit: e.target.value } })} options={['kg', 'pack', 'pcs']} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Supplier Cost (₱)</Label><Input type="number" step="0.01" value={editing.data.cost} onChange={(e) => setEditing({ ...editing, data: { ...editing.data, cost: Number(e.target.value) } })} /></div>
                <div><Label>Selling Price (₱)</Label><Input type="number" step="0.01" value={editing.data.price} onChange={(e) => setEditing({ ...editing, data: { ...editing.data, price: Number(e.target.value) } })} /></div>
              </div>
              <div className="text-sm pt-2" style={{ color: THEME.inkSoft, borderTop: `1px solid ${THEME.line}` }}>
                Profit per unit: <span style={{ color: THEME.green }} className="font-medium">{peso((editing.data.price || 0) - (editing.data.cost || 0))}</span>
                {editing.data.price > 0 && (<> · Margin: <span className="font-medium">{(((editing.data.price - editing.data.cost) / editing.data.price) * 100).toFixed(1)}%</span></>)}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Btn variant="secondary" onClick={() => setEditing(null)}>Cancel</Btn>
              <Btn variant="primary" onClick={saveEdit}><Save size={14} className="inline -mt-0.5 mr-1" />Save</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
