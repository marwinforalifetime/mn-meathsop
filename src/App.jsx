import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard, PlusCircle, ListOrdered, Truck, Wallet, Tag,
  Printer, Trash2, Edit3, Search, X, Check, AlertCircle, TrendingUp,
  Receipt, FileText, ChevronRight, ChevronUp, ChevronDown, Save, Loader2, Plus,
  Eye, EyeOff, ArrowLeft, RefreshCw, Download, Upload, HardDrive, Image as ImageIcon,
  Activity, Menu, Store, Moon, Sun, CheckCircle
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis,
  Tooltip, CartesianGrid, LineChart, Line, Area, AreaChart, ReferenceLine,
} from 'recharts';
import { toPng } from 'html-to-image';
import { LOGO_DATA_URL } from './logo.js';
import { GCASH_QR, GCASH_NUMBER } from './gcash-qr.js';
import { cloudLoad, cloudSave, getSession, signIn, signOut, onAuthChange } from './supabase.js';

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
  { name: 'Pork Loin / Porloin (Boneless)', unit: 'kg', cost: 200, price: 279, wholesalePrice: 249, group: 'Pork' },
  { name: 'Sawdust', unit: 'kg', cost: 60, price: 80, wholesalePrice: 70, group: 'Pork' },
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

const APP_VERSION = 'v7.0 · Live Ticker';

const THEME_LIGHT = {
  bg: '#FAF5EE', card: '#FFFEF8', ink: '#2A2624', inkSoft: '#6B5F58',
  line: '#E8DFD2', brand: '#7A2E33', brandSoft: '#A04D52',
  accent: '#C9853A', green: '#4F7942', red: '#B23A48', amber: '#D89A3C',
  brandBg: '#F5E6E1', successBg: '#E5EDDE', successInk: '#2f4a2a',
  errorBg: '#FBEAEA', warnBg: '#F7E8C9', warnInk: '#7a5a1a',
};
const THEME_DARK = {
  // Tuned for dark: warm near-black backgrounds, soft off-white text, and a
  // lightened maroon/gold so the brand still reads on dark.
  bg: '#1A1614', card: '#241F1C', ink: '#F0E9E0', inkSoft: '#A99E92',
  line: '#3A322C', brand: '#C77A7F', brandSoft: '#B0686D',
  accent: '#E0A45A', green: '#7CA86A', red: '#D9737E', amber: '#E0B062',
  brandBg: '#3A2A2C', successBg: '#27331F', successInk: '#A9C99B',
  errorBg: '#3A2222', warnBg: '#3A3120', warnInk: '#E0C98A',
};
// THEME is mutated in place when the user switches, so the hundreds of
// existing `THEME.x` references keep working without any change.
const THEME = { ...THEME_LIGHT };
function applyTheme(mode) {
  const src = mode === 'dark' ? THEME_DARK : THEME_LIGHT;
  Object.keys(src).forEach((k) => { THEME[k] = src[k]; });
}

/* ============================================================
   HELPERS
   ============================================================ */

const peso = (n) => {
  if (n === null || n === undefined || isNaN(n)) return '₱0';
  const num = Number(n);
  // Whole pesos stay clean (₱239). Partial values always show 2 decimals
  // (₱77.50, not ₱77.5) — proper money formatting.
  const hasDecimals = Math.round(num * 100) % 100 !== 0;
  return '₱' + num.toLocaleString('en-PH', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
};
const pesoFull = (n) => '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const fmtDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
};
const fmtDateShort = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
};
const nextOrderId = (lastNum) => 'ORD-' + String(lastNum + 1).padStart(3, '0');

// Delivery batch helpers — Tuesday=2, Saturday=6 in JS Date (Sunday=0).
// IMPORTANT: dates are stored as local YYYY-MM-DD strings, never via
// toISOString() which converts to UTC and breaks the day in PH (UTC+8).
const isoLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const nextDayOfWeek = (fromIso, targetDow) => {
  const d = fromIso ? new Date(fromIso + 'T00:00:00') : new Date();
  const dow = d.getDay();
  const delta = (targetDow - dow + 7) % 7;
  d.setDate(d.getDate() + delta);
  return isoLocal(d);
};
const nextTuesday = (fromIso) => nextDayOfWeek(fromIso || today(), 2);
const nextSaturday = (fromIso) => nextDayOfWeek(fromIso || today(), 6);
// Smart default — return the closer of next Tuesday or next Saturday from today.
// Most orders should land on one of these without the user having to pick.
const suggestedBatch = (fromIso) => {
  const tue = nextTuesday(fromIso);
  const sat = nextSaturday(fromIso);
  return tue <= sat ? tue : sat;
};
// Human-readable batch label, e.g. "Tue · May 27" or "Sat · May 31"
const batchLabel = (iso) => {
  if (!iso) return 'Unassigned';
  const d = new Date(iso + 'T00:00:00');
  const dow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
  return `${dow} · ${d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}`;
};

/* ============================================================
   DELIVERY BATCH PICKER (compact, expandable)
   ============================================================
   Shows the currently-selected batch as a small chip, with a
   "Change" affordance that expands the full picker inline.
   Default selection is set by parent — usually suggestedBatch().
   ============================================================ */
function DeliveryBatchPicker({ value, onChange, allowUnassign = false }) {
  const [expanded, setExpanded] = useState(false);
  const tue = nextTuesday();
  const sat = nextSaturday();
  const isStandard = value === tue || value === sat;
  const isCustom = value && !isStandard;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs uppercase font-medium tracking-wider" style={{ color: '#6B5F58', letterSpacing: '0.08em' }}>
          Delivery Batch
        </span>
        {!expanded && (
          <button type="button" onClick={() => setExpanded(true)}
            className="text-xs underline" style={{ color: '#6B5F58' }}>
            Change
          </button>
        )}
      </div>
      {!expanded ? (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md"
          style={{ background: value ? '#F5E6E1' : '#FEF3C7', color: value ? '#7A2E33' : '#92400E', border: `1px solid ${value ? '#7A2E33' : '#FCD34D'}` }}>
          <Truck size={14} />
          <span className="text-sm font-semibold">{value ? batchLabel(value) : 'Unassigned'}</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 mt-1">
          <button type="button" onClick={() => { onChange(tue); setExpanded(false); }}
            className="px-3 py-2 text-sm rounded-md inline-flex items-center gap-1.5"
            style={{ background: value === tue ? '#7A2E33' : 'transparent', color: value === tue ? 'white' : '#2A2624', border: `1px solid ${value === tue ? '#7A2E33' : '#E8DFD2'}` }}>
            <Truck size={13} /> Tuesday <span className="opacity-75">({batchLabel(tue).split(' · ')[1]})</span>
          </button>
          <button type="button" onClick={() => { onChange(sat); setExpanded(false); }}
            className="px-3 py-2 text-sm rounded-md inline-flex items-center gap-1.5"
            style={{ background: value === sat ? '#7A2E33' : 'transparent', color: value === sat ? 'white' : '#2A2624', border: `1px solid ${value === sat ? '#7A2E33' : '#E8DFD2'}` }}>
            <Truck size={13} /> Saturday <span className="opacity-75">({batchLabel(sat).split(' · ')[1]})</span>
          </button>
          <input type="date" value={isCustom ? value : ''}
            onChange={(e) => { if (e.target.value) { onChange(e.target.value); setExpanded(false); } }}
            className="px-3 py-2 text-sm rounded-md outline-none"
            style={{ background: '#FFFEF8', border: `1px solid #E8DFD2`, color: '#2A2624', minWidth: 140, opacity: isCustom ? 1 : 0.6 }} />
          {allowUnassign && value && (
            <button type="button" onClick={() => { onChange(''); setExpanded(false); }}
              className="px-3 py-2 text-sm rounded-md" style={{ color: '#6B5F58', border: `1px solid #E8DFD2` }}>
              Unassign
            </button>
          )}
          <button type="button" onClick={() => setExpanded(false)}
            className="px-2 py-2 text-xs underline" style={{ color: '#6B5F58' }}>
            Done
          </button>
        </div>
      )}
    </div>
  );
}

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
    brand: { bg: THEME.brandBg, fg: THEME.brand },
    green: { bg: THEME.successBg, fg: THEME.green },
    red: { bg: THEME.errorBg, fg: THEME.red },
    amber: { bg: THEME.warnBg, fg: THEME.amber },
    gray: { bg: THEME.line, fg: THEME.inkSoft },
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
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 no-print">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl leading-tight" style={{ color: THEME.ink }}>{title}</h1>
        {subtitle && <div className="text-sm mt-1" style={{ color: THEME.inkSoft }}>{subtitle}</div>}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
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

function MainApp() {
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState('dashboard');
  const [mobileNav, setMobileNav] = useState(false);
  // Shared quote quantities — kept at app level so they survive tab switches
  // and are shared between Restaurant Quote and Quote Profit Check. Only the
  // Clear button empties them.
  const [quoteQtys, setQuoteQtys] = useState({});
  // Current user — hardcoded for now. When login is added later, this gets
  // set from the authenticated session (e.g. Marwin or his partner).
  const [currentUser, setCurrentUser] = useState({ name: 'Marwin' });
  const [catalog, setCatalog] = useState([]);
  const [orders, setOrders] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [inventory, setInventory] = useState({});
  const [priceHistory, setPriceHistory] = useState([]);
  const [supplierPayments, setSupplierPayments] = useState([]);
  const [meta, setMeta] = useState({ lastOrderNum: 0 });
  const [saving, setSaving] = useState(false);
  // Cloud sync status: 'connecting' | 'cloud' | 'local-only' | 'error'
  const [syncStatus, setSyncStatus] = useState('connecting');
  const [needsImport, setNeedsImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  // Theme: 'light' | 'dark'. Read synchronously from localStorage so the very
  // first render already uses the right palette (no flash of the wrong theme).
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PREFIX + 'theme');
      if (saved === 'dark') { applyTheme('dark'); return 'dark'; }
    } catch (e) {}
    applyTheme('light');
    return 'light';
  });
  const setTheme = (mode) => {
    applyTheme(mode);
    setThemeState(mode);
    try { localStorage.setItem(STORAGE_PREFIX + 'theme', mode); } catch (e) {}
  };
  const [backupNagDismissed, setBackupNagDismissed] = useState(false);
  const [daysSinceBackup, setDaysSinceBackup] = useState(0);
  const lastSaveRef = useRef(Date.now());

  // Keep the page background and iOS status-bar colour in sync with the theme
  // (covers overscroll area and the notch bar outside React's root).
  useEffect(() => {
    try {
      document.body.style.background = THEME.bg;
      // Expose a theme-aware hover colour as a CSS variable so hover states
      // adapt to dark mode (a hardcoded light hover hid text in dark mode).
      document.documentElement.style.setProperty('--row-hover', theme === 'dark' ? '#3A322C' : '#FBF3E8');
      document.documentElement.style.setProperty('--danger-hover', theme === 'dark' ? '#3A2222' : '#FBEAEA');
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', theme === 'dark' ? '#1A1614' : '#7A2E33');
    } catch (e) {}
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Always read local first — it's instant and our offline safety net.
      const localCatalog = storage.load('catalog', null);
      const localOrders = storage.load('orders', {});
      const localExpenses = storage.load('expenses', []);
      const localInventory = storage.load('inventory', null);
      const localPriceHistory = storage.load('priceHistory', []);
      const localSupplierPayments = storage.load('supplierPayments', []);
      const localMeta = storage.load('meta', { lastOrderNum: 0 });
      const hasLocalData = (localOrders && Object.keys(localOrders).length > 0)
        || (localExpenses && localExpenses.length > 0);

      let usedCloud = false;
      try {
        const cloud = await cloudLoad();
        if (cancelled) return;
        if (cloud && (
          (cloud.orders && Object.keys(cloud.orders).length > 0) ||
          (cloud.expenses && cloud.expenses.length > 0) ||
          cloud.catalog
        )) {
          // Cloud has real data — it's the source of truth.
          setCatalog(cloud.catalog || SEED_PRODUCTS);
          setOrders(cloud.orders || {});
          setExpenses(cloud.expenses || []);
          setInventory(cloud.inventory || Object.fromEntries(SEED_PRODUCTS.map(p => [p.name, { qty: 0, dateAdded: '', notes: '' }])));
          setPriceHistory(cloud.priceHistory || []);
          setSupplierPayments(cloud.supplierPayments || []);
          setMeta(cloud.meta || { lastOrderNum: 0 });
          usedCloud = true;
          setSyncStatus('cloud');
        } else {
          // Cloud reachable but empty. Use local, and offer a one-time import.
          setCatalog(localCatalog || SEED_PRODUCTS);
          setOrders(localOrders || {});
          setExpenses(localExpenses || []);
          setInventory(localInventory || Object.fromEntries(SEED_PRODUCTS.map(p => [p.name, { qty: 0, dateAdded: '', notes: '' }])));
          setPriceHistory(localPriceHistory || []);
          setSupplierPayments(localSupplierPayments || []);
          setMeta(localMeta || { lastOrderNum: 0 });
          setSyncStatus('cloud');
          if (hasLocalData) setNeedsImport(true);
        }
      } catch (e) {
        if (cancelled) return;
        // Cloud unreachable — fall back to local so the app still works.
        setCatalog(localCatalog || SEED_PRODUCTS);
        setOrders(localOrders || {});
        setExpenses(localExpenses || []);
        setInventory(localInventory || Object.fromEntries(SEED_PRODUCTS.map(p => [p.name, { qty: 0, dateAdded: '', notes: '' }])));
        setPriceHistory(localPriceHistory || []);
        setSupplierPayments(localSupplierPayments || []);
        setMeta(localMeta || { lastOrderNum: 0 });
        setSyncStatus('local-only');
      }

      // Backup reminder bookkeeping (unchanged)
      try {
        const last = localStorage.getItem(STORAGE_PREFIX + 'lastBackup');
        if (last) {
          setDaysSinceBackup(Math.floor((Date.now() - Number(last)) / 86400000));
        } else {
          localStorage.setItem(STORAGE_PREFIX + 'lastBackup', String(Date.now()));
          setDaysSinceBackup(0);
        }
      } catch (e) {}
      if (!cancelled) setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    setSaving(true);
    // Always write local first — instant, and our offline safety net.
    storage.save('catalog', catalog);
    storage.save('orders', orders);
    storage.save('expenses', expenses);
    storage.save('inventory', inventory);
    storage.save('priceHistory', priceHistory);
    storage.save('supplierPayments', supplierPayments);
    storage.save('meta', meta);
    lastSaveRef.current = Date.now();

    // Then push to the cloud (debounced so rapid edits don't spam it).
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        await cloudSave({ catalog, orders, expenses, inventory, priceHistory, supplierPayments, meta });
        if (!cancelled) {
          setSyncStatus('cloud');
          setSaving(false);
        }
      } catch (e) {
        if (!cancelled) {
          // Saved locally but cloud failed — data is NOT lost, just not synced.
          setSyncStatus('local-only');
          setSaving(false);
        }
      }
    }, 600);
    return () => { cancelled = true; clearTimeout(t); };
  }, [catalog, orders, expenses, inventory, priceHistory, supplierPayments, meta, loaded]);

  // One-time import: push existing local data up to an empty cloud.
  const importLocalToCloud = async () => {
    setImporting(true);
    try {
      await cloudSave({ catalog, orders, expenses, inventory, priceHistory, supplierPayments, meta });
      setNeedsImport(false);
      setSyncStatus('cloud');
      alert('Your existing data is now saved to the cloud and will sync across your devices.');
    } catch (e) {
      alert('Could not reach the cloud right now. Your data is still safe on this device. Please try again in a moment.');
    } finally {
      setImporting(false);
    }
  };

  const productByName = useMemo(() => Object.fromEntries(catalog.map(p => [p.name, p])), [catalog]);

  const exportData = () => {
    const data = {
      version: 1,
      exported_at: new Date().toISOString(),
      catalog, orders, expenses, inventory, priceHistory, supplierPayments, meta,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${today()}_backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    // Record the backup time so the reminder resets
    try { localStorage.setItem(STORAGE_PREFIX + 'lastBackup', String(Date.now())); } catch (e) {}
    setBackupNagDismissed(true);
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
        setPriceHistory(data.priceHistory || []);
        setSupplierPayments(data.supplierPayments || []);
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
    { id: 'salescheck', label: 'Sales Check', icon: Receipt },
    { id: 'expenses', label: 'Expenses', icon: Wallet },
    { id: 'products', label: 'Price List', icon: Tag },
    { id: 'restaurantquote', label: 'Restaurant Quote', icon: Store },
    { id: 'profitcheck', label: 'Quote Profit Check', icon: EyeOff },
    { id: 'supplierprices', label: 'Supplier Prices', icon: TrendingUp },
    { id: 'supplierpayments', label: 'Supplier Payments', icon: Wallet },
  ];

  return (
    <div className="min-h-screen" style={{ background: THEME.bg, color: THEME.ink, fontFamily: 'DM Sans, sans-serif' }}>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-3 no-print"
        style={{
          background: THEME.card,
          borderBottom: `1px solid ${THEME.line}`,
          paddingTop: 'max(env(safe-area-inset-top), 12px)',
          paddingBottom: '12px',
        }}>
        <button onClick={() => setMobileNav(true)}
          className="flex items-center justify-center"
          style={{ width: 44, height: 44, color: THEME.ink }} aria-label="Open menu">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <img src={LOGO_DATA_URL} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          <span className="font-display text-lg truncate" style={{ color: THEME.brand }}>M&N Meatshop</span>
        </div>
        <button onClick={() => { setView('new'); }}
          className="flex items-center justify-center"
          style={{ width: 44, height: 44, color: THEME.brand }} aria-label="New order">
          <PlusCircle size={24} />
        </button>
      </div>

      {/* Mobile drawer backdrop */}
      {mobileNav && (
        <div className="lg:hidden fixed inset-0 z-40 no-print" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setMobileNav(false)} />
      )}

      <div className="flex">
        <aside
          className={`fixed lg:sticky top-0 z-50 lg:z-auto w-64 lg:w-60 h-screen lg:h-screen border-r flex flex-col no-print transition-transform duration-300 ${mobileNav ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
          style={{ borderColor: THEME.line, background: THEME.card }}>
          <div className="px-6 pb-6 border-b flex flex-col items-center text-center relative" style={{ borderColor: THEME.line, paddingTop: 'max(env(safe-area-inset-top), 24px)' }}>
            <button onClick={() => setMobileNav(false)} className="lg:hidden absolute right-3 p-2" style={{ color: THEME.inkSoft, top: 'max(env(safe-area-inset-top), 12px)' }} aria-label="Close menu">
              <X size={20} />
            </button>
            <img src={LOGO_DATA_URL} alt="M&N Meatshop" className="w-24 h-24 lg:w-28 lg:h-28 rounded-full object-cover mb-3" style={{ boxShadow: '0 2px 10px rgba(122,46,51,0.18)' }} />
            <div className="font-display text-xl leading-tight" style={{ color: THEME.brand }}>M&N Meatshop</div>
            <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>Your daily meat choice</div>
          </div>
          <nav className="flex-1 py-4 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button key={item.id} onClick={() => { setView(item.id); setMobileNav(false); }}
                  className="w-full flex items-center gap-3 px-6 py-3 lg:py-2.5 text-sm transition-colors text-left"
                  style={{
                    background: active ? THEME.brandBg : 'transparent',
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
            <button onClick={() => { setShowBackup(true); setMobileNav(false); }} className="flex items-center gap-2 text-xs mb-2 hover:opacity-70" style={{ color: THEME.inkSoft }}>
              <HardDrive size={12} /> Backup & Restore
            </button>
            <button onClick={async () => { if (confirm('Sign out of M&N Meatshop?')) { await signOut(); } }} className="flex items-center gap-2 text-xs mb-2 hover:opacity-70" style={{ color: THEME.inkSoft }}>
              <ArrowLeft size={12} /> Sign Out
            </button>
            <div className="text-xs flex items-center gap-2" style={{ color: THEME.inkSoft }}>
              {saving
                ? (<><Loader2 size={11} className="animate-spin" /> Syncing…</>)
                : syncStatus === 'cloud'
                  ? (<><Check size={11} style={{ color: THEME.green }} /> Saved to cloud</>)
                  : syncStatus === 'local-only'
                    ? (<><HardDrive size={11} style={{ color: THEME.amber }} /> Saved on this device</>)
                    : syncStatus === 'connecting'
                      ? (<><Loader2 size={11} className="animate-spin" /> Connecting…</>)
                      : (<><AlertCircle size={11} style={{ color: THEME.red }} /> Sync issue</>)}
            </div>
            <div className="text-xs mt-1 opacity-70" style={{ color: THEME.inkSoft }}>{Object.keys(orders).length} orders · {expenses.length} expenses</div>
            <div className="text-xs mt-2 px-2 py-1 rounded inline-block" style={{ background: THEME.brandBg, color: THEME.brand, fontWeight: 600 }}>
              {APP_VERSION}
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {needsImport && (
            <div className="mb-6 px-5 py-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 no-print"
              style={{ background: THEME.successBg, border: `1px solid ${THEME.green}` }}>
              <div className="flex items-start gap-3">
                <Upload size={18} style={{ color: THEME.green }} className="mt-0.5 flex-shrink-0" />
                <div className="text-sm" style={{ color: THEME.successInk }}>
                  <span className="font-semibold">Your cloud database is connected and empty.</span>
                  <span> This device has existing orders/expenses. Import them to the cloud once, so they sync across all your devices and are safely backed up.</span>
                </div>
              </div>
              <button onClick={importLocalToCloud} disabled={importing}
                className="px-4 py-2 text-sm rounded-md font-medium flex-shrink-0"
                style={{ background: THEME.green, color: 'white', opacity: importing ? 0.7 : 1 }}>
                {importing ? 'Importing…' : 'Import my data to cloud'}
              </button>
            </div>
          )}
          {daysSinceBackup >= 7 && !backupNagDismissed && (
            <div className="mb-6 px-5 py-4 rounded-lg flex items-center justify-between gap-4 no-print"
              style={{ background: THEME.warnBg, border: `1px solid ${THEME.amber}` }}>
              <div className="flex items-start gap-3">
                <HardDrive size={18} style={{ color: '#9A6A1F' }} className="mt-0.5 flex-shrink-0" />
                <div className="text-sm" style={{ color: '#7a541a' }}>
                  <span className="font-semibold">It's been {daysSinceBackup} days since your last backup.</span>
                  <span> Your data lives only in this browser — download a backup file to keep it safe.</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => setBackupNagDismissed(true)}
                  className="px-3 py-1.5 text-sm rounded-md"
                  style={{ background: 'transparent', color: '#7a541a', border: `1px solid ${THEME.amber}` }}>
                  Later
                </button>
                <button onClick={exportData}
                  className="px-3.5 py-1.5 text-sm rounded-md font-medium"
                  style={{ background: THEME.brand, color: 'white' }}>
                  <Download size={14} className="inline -mt-0.5 mr-1" /> Back up now
                </button>
              </div>
            </div>
          )}
          {view === 'dashboard' && <Dashboard orders={orders} expenses={expenses} catalog={catalog} setView={setView} privacy={privacy} setPrivacy={setPrivacy} currentUser={currentUser} theme={theme} setTheme={setTheme} />}
          {view === 'new' && <NewOrder catalog={catalog} meta={meta} setMeta={setMeta} orders={orders} setOrders={setOrders} onSaved={() => setView('orders')} />}
          {view === 'orders' && <Orders orders={orders} setOrders={setOrders} productByName={productByName} catalog={catalog} />}
          {view === 'pickup' && <Pickup orders={orders} />}
          {view === 'salescheck' && <SalesCheck orders={orders} privacy={privacy} />}
          {view === 'expenses' && <Expenses expenses={expenses} setExpenses={setExpenses} />}
          {view === 'products' && <Products catalog={catalog} setCatalog={setCatalog} priceHistory={priceHistory} setPriceHistory={setPriceHistory} />}
          {view === 'restaurantquote' && <RestaurantQuote catalog={catalog} qtys={quoteQtys} setQtys={setQuoteQtys} />}
          {view === 'profitcheck' && <QuoteProfitCheck catalog={catalog} privacy={privacy} qtys={quoteQtys} setQtys={setQuoteQtys} />}
          {view === 'supplierprices' && <SupplierPrices priceHistory={priceHistory} setPriceHistory={setPriceHistory} catalog={catalog} privacy={privacy} />}
          {view === 'supplierpayments' && <SupplierPayments payments={supplierPayments} setPayments={setSupplierPayments} privacy={privacy} />}
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
   AUTH GATE — login required before the app loads
   ============================================================ */

function LoginScreen({ onSignedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!email.trim() || !password) { setErr('Enter your email and password.'); return; }
    setBusy(true); setErr('');
    try {
      await signIn(email.trim(), password);
      onSignedIn();
    } catch (e) {
      setErr('Wrong email or password, or no internet. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: THEME.bg, fontFamily: 'DM Sans, sans-serif' }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <img src={LOGO_DATA_URL} alt="M&N Meatshop" className="w-20 h-20 rounded-full object-cover mb-3" />
          <div className="font-display text-2xl" style={{ color: THEME.brand }}>M&N Meatshop</div>
          <div className="text-sm mt-1" style={{ color: THEME.inkSoft }}>Please sign in to continue</div>
        </div>
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" />
            </div>
            <div>
              <Label>Password</Label>
              <input type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
                placeholder="Your password"
                className="w-full px-3 py-2 rounded-md outline-none"
                style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink }} />
            </div>
            {err && (
              <div className="text-sm px-3 py-2 rounded" style={{ background: THEME.errorBg, color: THEME.red }}>
                {err}
              </div>
            )}
            <Btn variant="primary" onClick={submit} disabled={busy} className="w-full">
              {busy ? 'Signing in…' : 'Sign In'}
            </Btn>
          </div>
        </Card>
        <div className="text-xs text-center mt-5" style={{ color: THEME.inkSoft }}>
          Authorized users only. Your data is protected by this login.
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // 'checking' = verifying existing session, 'out' = show login, 'in' = app
  const [authState, setAuthState] = useState('checking');

  useEffect(() => {
    let active = true;
    getSession()
      .then((session) => { if (active) setAuthState(session ? 'in' : 'out'); })
      .catch(() => { if (active) setAuthState('out'); });
    const sub = onAuthChange((session) => {
      if (active) setAuthState(session ? 'in' : 'out');
    });
    return () => { active = false; if (sub) sub.unsubscribe(); };
  }, []);

  if (authState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: THEME.bg, color: THEME.inkSoft, fontFamily: 'DM Sans, sans-serif' }}>
        <Loader2 size={22} className="animate-spin" />
      </div>
    );
  }

  if (authState === 'out') {
    return <LoginScreen onSignedIn={() => setAuthState('in')} />;
  }

  return <MainApp />;
}

/* ============================================================
   DASHBOARD
   ============================================================ */

function Dashboard({ orders, expenses, catalog, setView, privacy, setPrivacy, currentUser, theme, setTheme }) {
  const ordersList = Object.values(orders);
  const [showWeekly, setShowWeekly] = useState(false);

  // Privacy-aware money formatter
  const m = (n) => privacy ? '₱•••••' : peso(n);

  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const todayKey = now.toISOString().slice(0, 10);

  const stats = useMemo(() => {
    let totalSales = 0, totalCost = 0, unpaid = 0;
    let monthSales = 0, monthCost = 0;
    let monthUnpaid = 0;                          // owed within this month (for collection rate)
    const productQty = {};
    const byOrderDate = {};        // sales grouped by the order's date
    const profitByDate = {};
    const costByDate = {};         // supplier cost grouped by the order's date
    let pendingOrders = 0, pendingValue = 0;     // orders not yet delivered (being collected)
    let weekdayTotals = {};        // sales by weekday name (production pattern)
    const customerOrderCount = {}; // how many orders each customer placed this month
    let b2bRevenue = 0, b2bOrders = 0;           // Pick N' Go and other business clients
    let monthOrderCount = 0, monthOrderValueSum = 0;

    ordersList.forEach((o) => {
      if (o.delivery_status === 'Cancelled') return;
      const oSales = (o.items || []).reduce((s, i) => s + i.qty * i.price, 0);
      const oCost = (o.items || []).reduce((s, i) => s + i.qty * i.cost, 0);
      totalSales += oSales;
      totalCost += oCost;
      if (o.payment_status === 'Unpaid') unpaid += oSales;
      else if (o.payment_status === 'Partial') {
        const paid = Number(o.amount_paid) || 0;
        unpaid += Math.max(0, oSales - paid);
      }
      if ((o.date || '').startsWith(thisMonthKey)) {
        monthSales += oSales;
        monthCost += oCost;
        monthOrderCount += 1;
        monthOrderValueSum += oSales;
        // Track owed amount within this month for collection rate
        if (o.payment_status === 'Unpaid') monthUnpaid += oSales;
        else if (o.payment_status === 'Partial') {
          const paid = Number(o.amount_paid) || 0;
          monthUnpaid += Math.max(0, oSales - paid);
        }
        // Count orders per customer this month (for repeat-customer rate)
        const cname = (o.customer || '').trim().toLowerCase();
        if (cname) customerOrderCount[cname] = (customerOrderCount[cname] || 0) + 1;
        // B2B revenue — orders that used wholesale pricing OR match a known business client
        const isWholesale = (o.items || []).some(it => it.wholesale) || /pick\s*n.?\s*go/i.test(o.customer || '');
        if (isWholesale) { b2bRevenue += oSales; b2bOrders += 1; }
      }
      // Orders still pending delivery = the batch being collected for next production
      if ((o.delivery_status || 'Pending') === 'Pending') {
        pendingOrders += 1;
        pendingValue += oSales;
      }
      (o.items || []).forEach((it) => {
        productQty[it.product] = (productQty[it.product] || 0) + it.qty * it.price;
      });
      const d = o.date || '';
      if (d) {
        byOrderDate[d] = (byOrderDate[d] || 0) + oSales;
        profitByDate[d] = (profitByDate[d] || 0) + (oSales - oCost);
        costByDate[d] = (costByDate[d] || 0) + oCost;
        const wd = new Date(d).toLocaleDateString('en-PH', { weekday: 'long' });
        if (!weekdayTotals[wd]) weekdayTotals[wd] = { sales: 0, count: 0 };
        weekdayTotals[wd].sales += oSales;
        weekdayTotals[wd].count += 1;
      }
    });

    const grossProfit = totalSales - totalCost;
    const monthProfit = monthSales - monthCost;
    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const netPosition = grossProfit - totalExpenses;
    const recoveryPct = totalExpenses > 0
      ? Math.min(100, Math.max(0, (grossProfit / totalExpenses) * 100))
      : (grossProfit > 0 ? 100 : 0);
    const isSelfSustaining = netPosition >= 0;
    const amountToBreakEven = Math.max(0, totalExpenses - grossProfit);

    // Production runs: only the dates that actually had sales (real delivery days),
    // newest last. Each point is a genuine production day, no empty calendar gaps.
    const productionRuns = Object.entries(byOrderDate)
      .map(([date, sales]) => ({
        date,
        sales: Math.round(sales),
        profit: Math.round(profitByDate[date] || 0),
        cost: Math.round(costByDate[date] || 0),
        label: fmtDateShort(date),
        weekday: new Date(date).toLocaleDateString('en-PH', { weekday: 'short' }),
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-8);

    const runCount = Object.keys(byOrderDate).length;
    const avgPerRun = runCount > 0 ? grossProfit / runCount : 0;
    const avgSalesPerRun = runCount > 0 ? totalSales / runCount : 0;
    const lastRun = productionRuns[productionRuns.length - 1] || null;
    const prevRun = productionRuns[productionRuns.length - 2] || null;
    const runChangePct = (lastRun && prevRun && prevRun.sales > 0)
      ? ((lastRun.sales - prevRun.sales) / prevRun.sales) * 100
      : null;

    // Weekday pattern — average sales per production weekday
    const weekdayPattern = Object.entries(weekdayTotals)
      .map(([day, v]) => ({ day: day.slice(0, 3), full: day, avg: Math.round(v.sales / v.count), runs: v.count }))
      .sort((a, b) => b.avg - a.avg);

    const topProducts = Object.entries(productQty)
      .map(([name, v]) => ({ name: name.length > 16 ? name.slice(0, 16) + '…' : name, value: Math.round(v) }))
      .sort((a, b) => b.value - a.value).slice(0, 5);

    // ── New metrics ──
    // Collection rate: % of this month's sales actually collected
    const monthCollected = monthSales - monthUnpaid;
    const collectionRate = monthSales > 0 ? Math.round((monthCollected / monthSales) * 100) : 100;

    // Repeat customer rate: % of this month's customers who ordered 2+ times
    const monthCustomers = Object.keys(customerOrderCount).length;
    const repeatCustomers = Object.values(customerOrderCount).filter(c => c >= 2).length;
    const repeatRate = monthCustomers > 0 ? Math.round((repeatCustomers / monthCustomers) * 100) : 0;

    // Average order value this month
    const avgOrderValue = monthOrderCount > 0 ? monthOrderValueSum / monthOrderCount : 0;

    // Next delivery batch — soonest upcoming batch with pending orders
    const todayIso = todayKey;
    const upcomingByBatch = {};
    ordersList.forEach((o) => {
      if (o.delivery_status === 'Cancelled') return;
      if ((o.delivery_status || 'Pending') !== 'Pending') return;
      const b = o.delivery_batch;
      if (!b || b < todayIso) return;
      if (!upcomingByBatch[b]) upcomingByBatch[b] = { batch: b, orders: [], total: 0 };
      const oSales = (o.items || []).reduce((s, i) => s + i.qty * i.price, 0);
      upcomingByBatch[b].orders.push({ customer: o.customer, total: Math.round(oSales), id: o.id });
      upcomingByBatch[b].total += oSales;
    });
    const nextBatch = Object.values(upcomingByBatch).sort((a, b) => a.batch.localeCompare(b.batch))[0] || null;
    if (nextBatch) {
      nextBatch.total = Math.round(nextBatch.total);
      nextBatch.orders.sort((a, b) => b.total - a.total);
    }

    return {
      totalSales, grossProfit, monthSales, monthProfit, totalExpenses,
      netPosition, unpaid, orderCount: ordersList.filter(o => o.delivery_status !== 'Cancelled').length,
      runCount, avgPerRun, avgSalesPerRun, productionRuns, weekdayPattern,
      lastRun, runChangePct,
      pendingOrders, pendingValue,
      topProducts,
      recoveryPct, isSelfSustaining, amountToBreakEven,
      collectionRate, monthUnpaid, repeatRate, repeatCustomers, monthCustomers,
      avgOrderValue, monthOrderCount, b2bRevenue, b2bOrders, nextBatch,
    };
  }, [orders, expenses, thisMonthKey, todayKey]);

  // ── Weekly summary (Mon–Sun of the current calendar week) ──
  const weekly = useMemo(() => {
    const n = new Date();
    // Find Monday of this week (getDay: Sun=0..Sat=6)
    const dow = n.getDay();
    const daysSinceMon = (dow + 6) % 7;
    const monday = new Date(n);
    monday.setDate(n.getDate() - daysSinceMon);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    const mIso = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
    const sIso = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`;

    let sales = 0, cost = 0, owed = 0, orderCount = 0;
    const customers = new Set();
    const byBatch = {};
    ordersList.forEach((o) => {
      if (o.delivery_status === 'Cancelled') return;
      const d = o.date || '';
      if (d < mIso || d > sIso) return;
      const oSales = (o.items || []).reduce((s, i) => s + i.qty * i.price, 0);
      const oCost = (o.items || []).reduce((s, i) => s + i.qty * i.cost, 0);
      sales += oSales; cost += oCost; orderCount += 1;
      if (o.customer) customers.add(o.customer.trim().toLowerCase());
      if (o.payment_status === 'Unpaid') owed += oSales;
      else if (o.payment_status === 'Partial') owed += Math.max(0, oSales - (Number(o.amount_paid) || 0));
      const b = o.delivery_batch || 'Unassigned';
      if (!byBatch[b]) byBatch[b] = { sales: 0, count: 0 };
      byBatch[b].sales += oSales; byBatch[b].count += 1;
    });
    return {
      mIso, sIso, monday, sunday,
      sales: Math.round(sales), cost: Math.round(cost), profit: Math.round(sales - cost),
      owed: Math.round(owed), orderCount, customerCount: customers.size,
      byBatch: Object.entries(byBatch).map(([batch, v]) => ({ batch, sales: Math.round(v.sales), count: v.count }))
        .sort((a, b) => a.batch.localeCompare(b.batch)),
    };
  }, [orders]);

  // Build the shareable text version of the weekly summary
  const weeklyText = useMemo(() => {
    const range = `${weekly.monday.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} – ${weekly.sunday.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}`;
    let t = `📊 M&N Meatshop — Weekly Summary\n${range}\n\n`;
    t += `Sales: ${peso(weekly.sales)}\n`;
    t += `Supplier cost: ${peso(weekly.cost)}\n`;
    t += `Profit: ${peso(weekly.profit)}\n`;
    t += `Orders: ${weekly.orderCount} from ${weekly.customerCount} customer${weekly.customerCount !== 1 ? 's' : ''}\n`;
    if (weekly.owed > 0) t += `Still to collect: ${peso(weekly.owed)}\n`;
    if (weekly.byBatch.length > 0) {
      t += `\nBy delivery:\n`;
      weekly.byBatch.forEach((b) => {
        t += `• ${batchLabel(b.batch)}: ${peso(b.sales)} (${b.count} order${b.count !== 1 ? 's' : ''})\n`;
      });
    }
    return t;
  }, [weekly]);

  const unpaidOrders = useMemo(() =>
    ordersList
      .filter(o => (o.payment_status === 'Unpaid' || o.payment_status === 'Partial') && o.delivery_status !== 'Cancelled')
      .sort((a, b) => (b.id || '').localeCompare(a.id || ''))
      .slice(0, 5),
    [orders]
  );

  const monthName = now.toLocaleString('en-PH', { month: 'long' });

  return (
    <div>
      {/* ===== Clean header: logo + title + privacy toggle ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7 no-print">
        <div className="flex items-center gap-4">
          <img src={LOGO_DATA_URL} alt="M&N Meatshop" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover" style={{ boxShadow: '0 2px 8px rgba(122,46,51,0.15)' }} />
          <div>
            <div className="text-sm sm:text-base mb-0.5" style={{ color: THEME.inkSoft }}>
              {(() => {
                const h = new Date().getHours();
                const part = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
                return `${part},`;
              })()}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl leading-tight" style={{ color: THEME.ink }}>
              Hello, {currentUser?.name || 'there'}!
            </h1>
            <div className="text-xs sm:text-sm mt-1" style={{ color: THEME.inkSoft }}>{monthName} {now.getFullYear()} · {stats.orderCount} orders all-time</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center rounded-md transition-colors"
            style={{ width: 40, height: 40, background: 'transparent', color: THEME.inkSoft, border: `1px solid ${THEME.line}` }}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setPrivacy(!privacy)}
            className="flex items-center gap-2 px-3.5 py-2 text-sm rounded-md transition-colors flex-1 sm:flex-initial justify-center"
            style={{ background: privacy ? THEME.brand : 'transparent', color: privacy ? 'white' : THEME.inkSoft, border: `1px solid ${privacy ? THEME.brand : THEME.line}` }}
            title={privacy ? 'Show amounts' : 'Hide amounts'}
          >
            {privacy ? <EyeOff size={15} /> : <Eye size={15} />}
            {privacy ? 'Amounts hidden' : 'Hide amounts'}
          </button>
          <Btn variant="secondary" onClick={() => setShowWeekly(true)}><FileText size={16} className="inline mr-1.5 -mt-0.5" />Weekly</Btn>
          <Btn variant="primary" onClick={() => setView('new')}><PlusCircle size={16} className="inline mr-1.5 -mt-0.5" />New Order</Btn>
        </div>
      </div>

      {/* ===== Live ticker tape ===== */}
      {(() => {
        const tick = [];
        tick.push({ label: `${monthName} profit`, value: m(stats.monthProfit ?? stats.grossProfit), cls: 'green' });
        tick.push({ label: 'Sales', value: m(stats.monthSales ?? stats.totalSales), cls: '' });
        tick.push({ label: 'Orders', value: `${stats.monthOrderCount} this month`, cls: '' });
        tick.push({ label: 'Collection', value: `${stats.collectionRate}%`, cls: stats.collectionRate >= 80 ? 'green' : 'amber' });
        if (stats.unpaid > 0) tick.push({ label: 'Still owed', value: m(stats.unpaid), cls: 'red' });
        if (stats.nextBatch) {
          tick.push({ label: 'Next batch', value: batchLabel(stats.nextBatch.batch), cls: 'gold' });
          tick.push({ label: 'Batch total', value: m(stats.nextBatch.total), cls: 'green' });
        }
        if (stats.b2bRevenue > 0) tick.push({ label: 'B2B', value: m(stats.b2bRevenue), cls: 'gold' });
        if (stats.topProducts && stats.topProducts.length > 0) tick.push({ label: 'Top product', value: stats.topProducts[0].name, cls: '' });
        if (stats.repeatRate > 0) tick.push({ label: 'Repeat rate', value: `${stats.repeatRate}%`, cls: 'green' });
        if (stats.avgOrderValue > 0) tick.push({ label: 'Avg order', value: m(stats.avgOrderValue), cls: '' });

        const clsColor = (c) => c === 'green' ? THEME.green : c === 'red' ? THEME.red : c === 'gold' ? THEME.accent : THEME.ink;
        const doubled = [...tick, ...tick];
        return (
          <div className="mb-4 rounded-lg overflow-hidden flex items-stretch"
            style={{ background: THEME.brandBg, border: `1px solid ${THEME.line}` }}>
            <div className="flex items-center px-3 flex-shrink-0"
              style={{ background: THEME.brand, color: '#fff', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em' }}>
              LIVE
            </div>
            <div className="overflow-hidden whitespace-nowrap flex items-center" style={{ flex: 1, height: 34 }}>
              <div className="mn-ticker-track inline-flex items-center">
                {doubled.map((it, i) => (
                  <span key={i} className="inline-flex items-center" style={{ paddingRight: 24 }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: THEME.accent, marginRight: 7, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: THEME.inkSoft, marginRight: 5 }}>{it.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: clsColor(it.cls) }}>{it.value}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== Currently collecting (for next production day) ===== */}
      <Card className="px-5 py-4 mb-4" style={{ background: stats.pendingOrders > 0 ? THEME.warnBg : THEME.card, border: `1px solid ${stats.pendingOrders > 0 ? THEME.amber : THEME.line}` }}>
        <div className="flex items-center justify-between flex-wrap gap-y-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: stats.pendingOrders > 0 ? THEME.amber : THEME.line }}>
              <ListOrdered size={17} style={{ color: stats.pendingOrders > 0 ? 'white' : THEME.inkSoft }} />
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: THEME.ink }}>
                {stats.pendingOrders > 0
                  ? `${stats.pendingOrders} order${stats.pendingOrders !== 1 ? 's' : ''} collecting for next production`
                  : 'No pending orders — all caught up'}
              </div>
              <div className="text-xs" style={{ color: THEME.inkSoft }}>
                Orders marked Pending, waiting to be delivered on your next production day (Tue / Sat)
              </div>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider" style={{ color: THEME.inkSoft }}>Batch Value</div>
              <div className="font-display text-xl" style={{ color: THEME.brand }}>{m(stats.pendingValue)}</div>
            </div>
            <Btn variant="secondary" size="sm" onClick={() => setView('pickup')}>
              View Pickup <ChevronRight size={14} className="inline" />
            </Btn>
          </div>
        </div>
      </Card>

      {/* ===== Hero: This month's profit ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2 p-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${THEME.brand} 0%, ${THEME.brandSoft} 100%)`, border: 'none' }}>
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
          <div className="text-xs uppercase tracking-wider mb-2" style={{ color: THEME.inkSoft }}>Collection Rate · {monthName}</div>
          <div className="font-display text-3xl" style={{ color: stats.collectionRate >= 80 ? THEME.green : stats.collectionRate >= 60 ? THEME.amber : THEME.red }}>
            {stats.collectionRate}%
          </div>
          <div className="text-xs mt-1" style={{ color: THEME.inkSoft }}>
            {stats.monthUnpaid > 0 ? `${m(stats.monthUnpaid)} still to collect this month` : 'Everything collected — nice'}
          </div>
          <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: THEME.line }}>
            <div className="h-full rounded-full" style={{ width: `${stats.collectionRate}%`, background: stats.collectionRate >= 80 ? THEME.green : stats.collectionRate >= 60 ? THEME.amber : THEME.red }} />
          </div>
          <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${THEME.line}` }}>
            <div className="flex justify-between items-baseline">
              <span className="text-xs" style={{ color: THEME.inkSoft }}>All-time profit</span>
              <span className="text-sm font-medium" style={{ color: THEME.green }}>{m(stats.grossProfit)}</span>
            </div>
            <div className="flex justify-between items-baseline mt-1">
              <span className="text-xs" style={{ color: THEME.inkSoft }}>Avg / production run</span>
              <span className="text-sm font-medium" style={{ color: THEME.ink }}>{m(stats.avgPerRun)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ===== Key metrics row ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Card className="p-4">
          <div className="text-xs mb-1" style={{ color: THEME.inkSoft }}>Orders · {monthName}</div>
          <div className="font-display text-2xl" style={{ color: THEME.ink }}>{stats.monthOrderCount}</div>
          <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>this month</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs mb-1" style={{ color: THEME.inkSoft }}>Repeat customers</div>
          <div className="font-display text-2xl" style={{ color: stats.repeatRate >= 50 ? THEME.green : THEME.ink }}>{stats.repeatRate}%</div>
          <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>{stats.repeatCustomers} of {stats.monthCustomers} ordered 2+</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs mb-1" style={{ color: THEME.inkSoft }}>Avg order value</div>
          <div className="font-display text-2xl" style={{ color: THEME.ink }}>{m(stats.avgOrderValue)}</div>
          <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>this month</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs mb-1" style={{ color: THEME.inkSoft }}>B2B revenue</div>
          <div className="font-display text-2xl" style={{ color: THEME.brand }}>{m(stats.b2bRevenue)}</div>
          <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>{stats.b2bOrders} wholesale order{stats.b2bOrders !== 1 ? 's' : ''}</div>
        </Card>
      </div>

      {/* ===== Next batch preview ===== */}
      {stats.nextBatch && (
        <Card className="p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Truck size={17} style={{ color: THEME.brand }} />
              <span className="font-display text-lg">Next Batch · {batchLabel(stats.nextBatch.batch)}</span>
              <Badge color="blue">{stats.nextBatch.orders.length} order{stats.nextBatch.orders.length !== 1 ? 's' : ''}</Badge>
            </div>
            <div className="text-right">
              <div className="text-xs" style={{ color: THEME.inkSoft }}>Projected</div>
              <div className="font-display text-xl" style={{ color: THEME.brand }}>{m(stats.nextBatch.total)}</div>
            </div>
          </div>
          <div className="space-y-1">
            {stats.nextBatch.orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between py-1.5 text-sm" style={{ borderTop: `1px solid ${THEME.line}` }}>
                <span>{o.customer}</span>
                <span style={{ color: THEME.inkSoft }}>{m(o.total)}</span>
              </div>
            ))}
            {stats.nextBatch.orders.length > 5 && (
              <div className="text-xs pt-1" style={{ color: THEME.inkSoft }}>+ {stats.nextBatch.orders.length - 5} more</div>
            )}
          </div>
          <div className="mt-3 pt-2" style={{ borderTop: `1px solid ${THEME.line}` }}>
            <Btn variant="secondary" size="sm" onClick={() => setView('pickup')}>
              Open Pickup Mode <ChevronRight size={14} className="inline" />
            </Btn>
          </div>
        </Card>
      )}

      {/* ===== Production run performance ===== */}
      <div className="grid grid-cols-1 gap-4 mb-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="font-display text-lg">Production Run Performance</div>
            {stats.runChangePct !== null && (
              <div className="text-sm font-medium" style={{ color: stats.runChangePct >= 0 ? THEME.green : THEME.red }}>
                {stats.runChangePct >= 0 ? '▲' : '▼'} {Math.abs(stats.runChangePct).toFixed(0)}% vs previous run
              </div>
            )}
          </div>
          <div className="text-xs mb-4" style={{ color: THEME.inkSoft }}>
            Each bar = one delivery day. Full height is total sales; green is your profit, the rest is supplier cost.
          </div>
          {stats.productionRuns.length === 0 ? (
            <EmptyHint>No production runs yet. Sales appear here once orders have a delivery date.</EmptyHint>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.productionRuns} margin={{ left: -8, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="2 4" stroke={THEME.line} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: THEME.inkSoft, fontSize: 11 }} axisLine={{ stroke: THEME.line }} tickLine={false} />
                <YAxis tick={{ fill: THEME.inkSoft, fontSize: 11 }} axisLine={false} tickLine={false} width={56}
                  tickFormatter={(v) => privacy ? '•••' : (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)} />
                <Tooltip cursor={{ fill: THEME.brandBg }}
                  contentStyle={{ background: THEME.card, border: `1px solid ${THEME.line}`, borderRadius: 8, fontSize: 13 }}
                  formatter={(v, n) => [privacy ? '₱•••••' : peso(v), n === 'cost' ? 'Supplier Cost' : 'Profit']}
                  labelFormatter={(l, p) => p && p[0] ? `${p[0].payload.weekday} · ${l} · Sales ${privacy ? '₱•••••' : peso(p[0].payload.sales)}` : l} />
                <Bar dataKey="cost" stackId="a" fill={THEME.brandSoft} maxBarSize={42} />
                <Bar dataKey="profit" stackId="a" fill={THEME.green} radius={[4, 4, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-4 mt-3 text-xs" style={{ color: THEME.inkSoft }}>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 inline-block rounded-sm" style={{ background: THEME.green }} /> Profit (what you keep)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 inline-block rounded-sm" style={{ background: THEME.brandSoft }} /> Supplier cost</span>
          </div>
        </Card>
      </div>

      {/* ===== Two columns: Money owed (actionable) + Top products ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
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
                  <div key={o.id} className="flex items-center justify-between py-2 px-2 rounded row-hover cursor-pointer"
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
                <Tooltip cursor={{ fill: THEME.brandBg }}
                  contentStyle={{ background: THEME.card, border: `1px solid ${THEME.line}`, borderRadius: 8 }}
                  formatter={(v) => [privacy ? '₱•••••' : peso(v), 'Sales']} />
                <Bar dataKey="value" fill={THEME.brand} radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ===== Business health: demoted to one compact strip ===== */}
      <Card className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: stats.isSelfSustaining ? THEME.successBg : THEME.warnBg }}>
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

      {/* ===== Weekly Summary modal ===== */}
      {showWeekly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print"
          style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowWeekly(false)}>
          <div className="w-full max-w-md rounded-xl overflow-hidden" style={{ background: THEME.card, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5" style={{ borderBottom: `1px solid ${THEME.line}` }}>
              <div className="flex items-center justify-between">
                <div className="font-display text-xl" style={{ color: THEME.brand }}>Weekly Summary</div>
                <button onClick={() => setShowWeekly(false)} className="p-1.5 rounded row-hover"><X size={18} /></button>
              </div>
              <div className="text-sm mt-1" style={{ color: THEME.inkSoft }}>
                {weekly.monday.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} – {weekly.sunday.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg" style={{ background: THEME.brandBg }}>
                  <div className="text-xs" style={{ color: THEME.inkSoft }}>Sales</div>
                  <div className="font-display text-2xl" style={{ color: THEME.brand }}>{m(weekly.sales)}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: THEME.successBg }}>
                  <div className="text-xs" style={{ color: THEME.inkSoft }}>Profit</div>
                  <div className="font-display text-2xl" style={{ color: THEME.green }}>{m(weekly.profit)}</div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span style={{ color: THEME.inkSoft }}>Supplier cost</span><span>{m(weekly.cost)}</span></div>
                <div className="flex justify-between"><span style={{ color: THEME.inkSoft }}>Orders</span><span>{weekly.orderCount} from {weekly.customerCount} customer{weekly.customerCount !== 1 ? 's' : ''}</span></div>
                {weekly.owed > 0 && (
                  <div className="flex justify-between"><span style={{ color: THEME.inkSoft }}>Still to collect</span><span style={{ color: THEME.red }}>{m(weekly.owed)}</span></div>
                )}
              </div>

              {weekly.byBatch.length > 0 && (
                <div className="pt-3" style={{ borderTop: `1px solid ${THEME.line}` }}>
                  <div className="text-xs uppercase tracking-wider mb-2" style={{ color: THEME.inkSoft }}>By delivery</div>
                  <div className="space-y-1.5">
                    {weekly.byBatch.map((b) => (
                      <div key={b.batch} className="flex justify-between text-sm">
                        <span>{batchLabel(b.batch)}</span>
                        <span style={{ color: THEME.inkSoft }}>{m(b.sales)} · {b.count} order{b.count !== 1 ? 's' : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {weekly.orderCount === 0 && (
                <div className="text-center py-4 text-sm" style={{ color: THEME.inkSoft }}>
                  No orders yet this week.
                </div>
              )}
            </div>

            <div className="px-6 py-4 flex gap-2" style={{ borderTop: `1px solid ${THEME.line}` }}>
              <Btn variant="primary" className="flex-1" onClick={async () => {
                const text = weeklyText;
                try {
                  if (navigator.share) { await navigator.share({ text }); }
                  else { await navigator.clipboard.writeText(text); alert('Summary copied! Paste it into Messenger.'); }
                } catch (e) { /* user cancelled share — ignore */ }
              }}>
                <Upload size={15} className="inline mr-1.5 -mt-0.5" />Share / Copy
              </Btn>
              <Btn variant="secondary" onClick={() => setShowWeekly(false)}>Close</Btn>
            </div>
          </div>
        </div>
      )}
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
  const [showSuggest, setShowSuggest] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [deliveryStatus, setDeliveryStatus] = useState('Pending');
  const [deliveryBatch, setDeliveryBatch] = useState(suggestedBatch());
  const [notes, setNotes] = useState('');
  // Wholesale toggle: when ON, all line items default to wholesale pricing
  // (the same prices used in the Restaurant Quote / Wholesale Price Sheet).
  // Per-line checkbox can override for mixed orders.
  const [wholesaleOrder, setWholesaleOrder] = useState(false);

  // Build a directory of past customers (most recent phone wins)
  const pastCustomers = useMemo(() => {
    const map = new Map();
    Object.values(orders)
      .sort((a, b) => (a.id || '').localeCompare(b.id || '')) // oldest first so latest overwrites
      .forEach((o) => {
        const name = (o.customer || '').trim();
        if (!name) return;
        const prev = map.get(name.toLowerCase()) || { name, phone: '', count: 0 };
        map.set(name.toLowerCase(), {
          name,
          phone: (o.phone || '').trim() || prev.phone,
          count: prev.count + 1,
        });
      });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [orders]);

  const customerMatches = useMemo(() => {
    const q = customer.trim().toLowerCase();
    if (!q) return [];
    return pastCustomers
      .filter(c => c.name.toLowerCase().includes(q) && c.name.toLowerCase() !== q)
      .slice(0, 6);
  }, [customer, pastCustomers]);

  const pickCustomer = (c) => {
    setCustomer(c.name);
    if (c.phone) setPhone(c.phone);
    setShowSuggest(false);
  };
  const [items, setItems] = useState([{ product: '', qty: 1, note: '', wholesale: false }]);
  const [error, setError] = useState('');
  const [hideAmounts, setHideAmounts] = useState(false);

  const productByName = useMemo(() => Object.fromEntries(catalog.map(p => [p.name, p])), [catalog]);
  const m = (n) => hideAmounts ? '₱•••••' : peso(n);
  // Effective unit price: wholesale (from rqPricing) when the line is flagged,
  // otherwise the catalog retail price.
  const linePrice = (it) => {
    const p = productByName[it.product];
    if (!p) return 0;
    return it.wholesale ? rqPricing(p).wholesale : p.price;
  };
  const lineTotal = (it) => (Number(it.qty) || 0) * linePrice(it);
  const lineCost = (it) => { const p = productByName[it.product]; return p ? (Number(it.qty) || 0) * p.cost : 0; };
  const orderTotal = items.reduce((s, it) => s + lineTotal(it), 0);
  const orderCost = items.reduce((s, it) => s + lineCost(it), 0);
  const orderProfit = orderTotal - orderCost;

  const updateItem = (idx, patch) => setItems(items.map((it, i) => i === idx ? { ...it, ...patch } : it));
  const setOrderWholesale = (on) => {
    setWholesaleOrder(on);
    // Cascade to every line so it feels like one decision applied everywhere
    setItems((prev) => prev.map((it) => ({ ...it, wholesale: on })));
  };
  const addItem = () => setItems([...items, { product: '', qty: 1, note: '', wholesale: wholesaleOrder }]);
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
      const usedPrice = it.wholesale ? rqPricing(p).wholesale : p.price;
      return { product: it.product, qty: Number(it.qty), price: usedPrice, cost: p.cost, unit: p.unit, note: (it.note || '').trim(), wholesale: !!it.wholesale };
    });
    const order = {
      id, date, customer: customer.trim(), phone: phone.trim(),
      payment_status: paymentStatus, payment_method: paymentMethod, delivery_status: deliveryStatus,
      delivery_batch: deliveryBatch,
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div className="relative">
                <Label>Customer Name</Label>
                <Input
                  value={customer}
                  onChange={(e) => { setCustomer(e.target.value); setShowSuggest(true); }}
                  onFocus={() => setShowSuggest(true)}
                  onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                  placeholder="Juan Dela Cruz"
                />
                {showSuggest && customerMatches.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-1 rounded-md overflow-hidden shadow-lg"
                    style={{ background: THEME.card, border: `1px solid ${THEME.line}` }}>
                    {customerMatches.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); pickCustomer(c); }}
                        className="w-full text-left px-3 py-2 text-sm row-hover flex items-center justify-between"
                        style={{ color: THEME.ink }}
                      >
                        <span>{c.name}{c.phone ? <span style={{ color: THEME.inkSoft }}> · {c.phone}</span> : ''}</span>
                        <span className="text-xs" style={{ color: THEME.inkSoft }}>{c.count}x</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div><Label>Phone (optional)</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0917 123 4567" /></div>
            </div>

            {/* Delivery batch — smart default, expandable to change */}
            <DeliveryBatchPicker value={deliveryBatch} onChange={setDeliveryBatch} />
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-display text-lg">Order Items</div>
              <Btn variant="secondary" size="sm" onClick={addItem}><Plus size={14} className="inline -mt-0.5" /> Add item</Btn>
            </div>

            {/* Wholesale toggle — applies wholesale (business client) pricing
                to every line. Per-line checkboxes can override for mixed orders. */}
            <label className="flex items-start gap-3 mb-4 p-3 rounded-md cursor-pointer"
              style={{ background: wholesaleOrder ? THEME.brandBg : 'transparent', border: `1px solid ${wholesaleOrder ? THEME.brand : THEME.line}` }}>
              <input type="checkbox" checked={wholesaleOrder}
                onChange={(e) => setOrderWholesale(e.target.checked)}
                className="mt-0.5" style={{ width: 18, height: 18, accentColor: THEME.brand }} />
              <div className="text-sm">
                <span className="font-medium" style={{ color: wholesaleOrder ? THEME.brand : THEME.ink }}>
                  Wholesale order (business client)
                </span>
                <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>
                  Use wholesale pricing instead of retail. Per-line checkbox below can override individual items.
                </div>
              </div>
            </label>

            <div className="space-y-3">
              {items.map((it, idx) => {
                const p = productByName[it.product];
                return (
                  <div key={idx} className="grid grid-cols-2 sm:grid-cols-12 gap-3 items-start pb-3 sm:pb-0 border-b sm:border-b-0" style={{ borderColor: THEME.line }}>
                    <div className="col-span-2 sm:col-span-4">
                      <Label>Product</Label>
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
                    <div className="col-span-1 sm:col-span-2">
                      <Label>Qty</Label>
                      <Input type="number" step="0.01" min="0" value={it.qty} onChange={(e) => updateItem(idx, { qty: e.target.value })} />
                    </div>
                    <div className="col-span-1 sm:col-span-3">
                      <Label>Notes / Special Cut</Label>
                      <Input value={it.note} onChange={(e) => updateItem(idx, { note: e.target.value })} placeholder="e.g. thin slice" />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <Label>Line</Label>
                      <div className="px-2 py-2 text-sm font-medium">
                        {lineTotal(it) > 0 ? m(lineTotal(it)) : '—'}
                        {p && it.wholesale && (
                          <span className="block text-xs font-normal mt-0.5" style={{ color: THEME.brand }}>
                            @ {peso(linePrice(it))}/kg
                          </span>
                        )}
                      </div>
                      {p && (
                        <label className="flex items-center gap-1.5 mt-1 cursor-pointer">
                          <input type="checkbox" checked={!!it.wholesale}
                            onChange={(e) => updateItem(idx, { wholesale: e.target.checked })}
                            style={{ width: 13, height: 13, accentColor: THEME.brand }} />
                          <span className="text-xs" style={{ color: it.wholesale ? THEME.brand : THEME.inkSoft }}>
                            Wholesale
                          </span>
                        </label>
                      )}
                    </div>
                    <div className="col-span-1 sm:col-span-1 flex items-end justify-end sm:block">
                      <span className="hidden sm:block"><Label>&nbsp;</Label></span>
                      {items.length > 1 && (
                        <button onClick={() => removeItem(idx)} className="p-2 rounded danger-hover" style={{ color: THEME.red }}><X size={14} /></button>
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
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [printMode, setPrintMode] = useState(null);
  const [pickupMode, setPickupMode] = useState(false);

  const ordersList = useMemo(() => {
    let list = Object.values(orders);
    if (filter !== 'all') list = list.filter(o => o.payment_status === filter);
    if (deliveryFilter !== 'all') list = list.filter(o => (o.delivery_status || 'Pending') === deliveryFilter);
    if (batchFilter !== 'all') {
      if (batchFilter === 'unassigned') list = list.filter(o => !o.delivery_batch);
      else list = list.filter(o => o.delivery_batch === batchFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        (o.customer || '').toLowerCase().includes(q) ||
        (o.items || []).some(i => i.product.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
  }, [orders, search, filter, deliveryFilter, batchFilter]);

  // Available batches — derived from existing orders' delivery_batch, plus the next 2 Tuesdays and Saturdays.
  const availableBatches = useMemo(() => {
    const set = new Set();
    const todayIso = today();
    // Only include batches from orders that are today or in the future —
    // past delivery dates clutter the filter without adding value.
    Object.values(orders).forEach(o => {
      if (o.delivery_batch && o.delivery_batch >= todayIso && o.delivery_status !== 'Cancelled') {
        set.add(o.delivery_batch);
      }
    });
    // Always include next Tue and next Sat as choices, even with zero orders.
    set.add(nextTuesday());
    set.add(nextSaturday());
    return Array.from(set).sort();
  }, [orders]);

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

  if (pickupMode) {
    const batchOrders = Object.values(orders)
      .filter(o => o.delivery_batch === batchFilter && o.delivery_status !== 'Cancelled')
      .sort((a, b) => (a.customer || '').localeCompare(b.customer || ''));
    return <PickupMode batch={batchFilter} orders={batchOrders} onBack={() => setPickupMode(false)} />;
  }

  return (
    <div>
      <Header title="Orders" subtitle={(() => {
        const all = Object.values(orders);
        const cancelled = all.filter(o => o.delivery_status === 'Cancelled').length;
        const active = all.length - cancelled;
        return cancelled > 0
          ? `${active} active · ${cancelled} cancelled · showing ${ordersList.length}`
          : `${ordersList.length} order${ordersList.length !== 1 ? 's' : ''}`;
      })()} />

      <Card className="p-5">
        <div className="mb-4">
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: THEME.inkSoft }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order ID, customer, or product…"
              className="w-full pl-9 pr-3 py-2 rounded-md outline-none text-sm"
              style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink }} />
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider" style={{ color: THEME.inkSoft, letterSpacing: '0.06em' }}>Payment</span>
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
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider" style={{ color: THEME.inkSoft, letterSpacing: '0.06em' }}>Delivery</span>
              <div className="flex gap-1">
                {['all', 'Pending', 'Delivered', 'Cancelled'].map((f) => (
                  <button key={f} onClick={() => setDeliveryFilter(f)}
                    className="px-3 py-1.5 text-sm rounded-md"
                    style={{ background: deliveryFilter === f ? THEME.accent : 'transparent', color: deliveryFilter === f ? 'white' : THEME.ink, border: `1px solid ${deliveryFilter === f ? THEME.accent : THEME.line}` }}>
                    {f === 'all' ? 'All' : f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Batch filter row + Pickup Mode entry */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${THEME.line}` }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider" style={{ color: THEME.inkSoft, letterSpacing: '0.06em' }}>Batch</span>
              <div className="flex gap-1 flex-wrap">
                <button onClick={() => setBatchFilter('all')}
                  className="px-3 py-1.5 text-sm rounded-md"
                  style={{ background: batchFilter === 'all' ? THEME.brand : 'transparent', color: batchFilter === 'all' ? 'white' : THEME.ink, border: `1px solid ${batchFilter === 'all' ? THEME.brand : THEME.line}` }}>All</button>
                {availableBatches.map((b) => {
                  const count = Object.values(orders).filter(o => o.delivery_batch === b && o.delivery_status !== 'Cancelled').length;
                  return (
                    <button key={b} onClick={() => setBatchFilter(b)}
                      className="px-3 py-1.5 text-sm rounded-md inline-flex items-center gap-1.5"
                      style={{ background: batchFilter === b ? THEME.brand : 'transparent', color: batchFilter === b ? 'white' : THEME.ink, border: `1px solid ${batchFilter === b ? THEME.brand : THEME.line}` }}>
                      {batchLabel(b)} <span className="text-xs opacity-75">({count})</span>
                    </button>
                  );
                })}
                {(() => {
                  const unassignedCount = Object.values(orders).filter(o => !o.delivery_batch && o.delivery_status !== 'Cancelled').length;
                  if (unassignedCount === 0) return null;
                  return (
                    <button onClick={() => setBatchFilter('unassigned')}
                      className="px-3 py-1.5 text-sm rounded-md inline-flex items-center gap-1.5"
                      style={{ background: batchFilter === 'unassigned' ? THEME.red : 'transparent', color: batchFilter === 'unassigned' ? 'white' : THEME.red, border: `1px solid ${THEME.red}` }}>
                      Unassigned <span className="text-xs opacity-75">({unassignedCount})</span>
                    </button>
                  );
                })()}
              </div>
            </div>
            {/* Pickup Mode button — only shows when a specific batch is selected */}
            {batchFilter !== 'all' && batchFilter !== 'unassigned' && (
              <Btn variant="primary" size="sm" onClick={() => setPickupMode(true)}>
                <Check size={14} className="inline -mt-0.5 mr-1" /> Pickup Mode
              </Btn>
            )}
          </div>
        </div>

        {ordersList.length === 0 ? (
          <EmptyHint>No orders match. Try clearing filters.</EmptyHint>
        ) : (
          <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm" style={{ minWidth: 640 }}>
            <thead>
              <tr className="text-left" style={{ color: THEME.inkSoft, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <th className="pb-2 font-medium">Order ID</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Batch</th>
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
                const isCancelled = o.delivery_status === 'Cancelled';
                return (
                  <tr key={o.id} style={{ borderTop: `1px solid ${THEME.line}`, opacity: isCancelled ? 0.5 : 1 }} className="row-hover cursor-pointer" onClick={() => setSelected(o)}>
                    <td className="py-2.5 font-medium" style={{ textDecoration: isCancelled ? 'line-through' : 'none' }}>{o.id}</td>
                    <td className="py-2.5" style={{ color: THEME.inkSoft }}>{fmtDate(o.date)}</td>
                    <td className="py-2.5" style={{ textDecoration: isCancelled ? 'line-through' : 'none' }}>{o.customer}</td>
                    <td className="py-2.5">
                      {o.delivery_batch ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: THEME.brandBg, color: THEME.brand }}>
                          <Truck size={10} /> {batchLabel(o.delivery_batch)}
                        </span>
                      ) : (
                        <span className="text-xs italic" style={{ color: THEME.inkSoft }}>Unassigned</span>
                      )}
                    </td>
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
          </div>
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
      delivery_batch: order.delivery_batch || '',
      notes: order.notes || '',
      amount_paid: order.amount_paid ?? '',
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
      delivery_batch: draft.delivery_batch || '',
      notes: draft.notes.trim(),
      amount_paid: draft.payment_status === 'Partial' ? (draft.amount_paid === '' ? '' : Number(draft.amount_paid) || 0) : '',
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
          <button onClick={onClose} className="p-2 rounded row-hover"><X size={18} /></button>
        </div>
      </div>

      <div className="px-6 py-5">
        {/* ===== Cancelled banner ===== */}
        {!editing && order.delivery_status === 'Cancelled' && (
          <div className="mb-5 px-4 py-3 rounded-md flex items-start gap-2" style={{ background: '#F5DDE0', color: THEME.red }}>
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-semibold">This order is cancelled.</span> It's excluded from sales, profit, and pickup totals but kept here for your records.
              {order.cancel_reason ? <div className="mt-1" style={{ color: THEME.ink }}>Reason: {order.cancel_reason}</div> : null}
            </div>
          </div>
        )}

        {/* ===== Edit mode: customer + date ===== */}
        {editing && (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div><Label>Date</Label><Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></div>
            <div><Label>Customer Name</Label><Input value={draft.customer} onChange={(e) => setDraft({ ...draft, customer: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="optional" /></div>
          </div>
          <div className="mb-5">
            <DeliveryBatchPicker
              value={draft.delivery_batch}
              onChange={(v) => setDraft({ ...draft, delivery_batch: v })}
              allowUnassign
            />
          </div>
          </>
        )}

        {/* Quick batch-set banner — shows in view mode when order has no batch yet */}
        {!editing && !order.delivery_batch && order.delivery_status !== 'Cancelled' && (
          <div className="mb-5 px-4 py-3 rounded-md flex items-center justify-between gap-3 flex-wrap"
            style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }}>
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>No delivery batch yet. Set one so it shows up in the right pickup list.</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => onSaveFull({ ...order, delivery_batch: nextTuesday() })}
                className="px-3 py-1.5 text-xs font-semibold rounded-md inline-flex items-center gap-1"
                style={{ background: THEME.brand, color: 'white' }}>
                <Truck size={12} /> Tuesday ({batchLabel(nextTuesday()).split(' · ')[1]})
              </button>
              <button onClick={() => onSaveFull({ ...order, delivery_batch: nextSaturday() })}
                className="px-3 py-1.5 text-xs font-semibold rounded-md inline-flex items-center gap-1"
                style={{ background: THEME.brand, color: 'white' }}>
                <Truck size={12} /> Saturday ({batchLabel(nextSaturday()).split(' · ')[1]})
              </button>
            </div>
          </div>
        )}

        {/* Batch info — shows in view mode when batch is set */}
        {!editing && order.delivery_batch && (
          <div className="mb-4 px-4 py-2.5 rounded-md flex items-center gap-2"
            style={{ background: THEME.brandBg, color: THEME.brand }}>
            <Truck size={15} className="flex-shrink-0" />
            <span className="text-sm">
              <span className="font-semibold">Delivery Batch:</span> {batchLabel(order.delivery_batch)}
            </span>
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
                  <div key={idx} className="grid grid-cols-2 sm:grid-cols-12 gap-3 items-start pb-3 sm:pb-0 border-b sm:border-b-0" style={{ borderColor: THEME.line }}>
                    <div className="col-span-2 sm:col-span-4">
                      <Label>Product</Label>
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
                    <div className="col-span-1 sm:col-span-2">
                      <Label>Qty</Label>
                      <Input type="number" step="0.01" min="0" value={it.qty} onChange={(e) => dUpdateItem(idx, { qty: e.target.value })} />
                    </div>
                    <div className="col-span-1 sm:col-span-3">
                      <Label>Notes / Special Cut</Label>
                      <Input value={it.note || ''} onChange={(e) => dUpdateItem(idx, { note: e.target.value })} placeholder="e.g. thin slice" />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <Label>Line</Label>
                      <div className="px-2 py-2 text-sm font-medium">{lt > 0 ? peso(lt) : '—'}</div>
                    </div>
                    <div className="col-span-1 sm:col-span-1 flex items-end justify-end sm:block">
                      <span className="hidden sm:block"><Label>&nbsp;</Label></span>
                      {draft.items.length > 1 && (
                        <button onClick={() => dRemoveItem(idx)} className="p-2 rounded danger-hover" style={{ color: THEME.red }}><X size={14} /></button>
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

        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5 py-3" style={{ borderTop: `1px solid ${THEME.line}`, borderBottom: `1px solid ${THEME.line}` }}>
          <div><div className="text-xs uppercase tracking-wider" style={{ color: THEME.inkSoft }}>Sales</div><div className="font-display text-lg" style={{ color: THEME.brand }}>{peso(total)}</div></div>
          <div><div className="text-xs uppercase tracking-wider" style={{ color: THEME.inkSoft }}>Cost</div><div className="font-display text-lg" style={{ color: THEME.inkSoft }}>{peso(cost)}</div></div>
          <div><div className="text-xs uppercase tracking-wider" style={{ color: THEME.inkSoft }}>Profit</div><div className="font-display text-lg" style={{ color: THEME.green }}>{peso(profit)}</div></div>
        </div>

        {/* ===== Status fields ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
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

        {/* ===== Partial payment amount ===== */}
        {((editing ? draft.payment_status : order.payment_status) === 'Partial') && (
          <div className="mb-5 -mt-2">
            <Label>Amount Paid So Far (₱)</Label>
            <div className="flex items-center gap-3">
              <div className="w-48">
                <Input type="number" step="0.01" min="0"
                  value={editing ? (draft.amount_paid ?? '') : (order.amount_paid ?? '')}
                  onChange={(e) => {
                    const v = e.target.value;
                    editing ? setDraft({ ...draft, amount_paid: v }) : onUpdate({ amount_paid: v === '' ? '' : Number(v) });
                  }}
                  placeholder="0.00" />
              </div>
              <div className="text-sm" style={{ color: THEME.inkSoft }}>
                Balance: <span className="font-medium" style={{ color: THEME.red }}>
                  {peso(Math.max(0, total - (Number(editing ? draft.amount_paid : order.amount_paid) || 0)))}
                </span> of {peso(total)}
              </div>
            </div>
          </div>
        )}
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
            <div className="flex gap-2">
              <Btn variant="danger" size="sm" onClick={onDelete}><Trash2 size={14} className="inline -mt-0.5 mr-1" /> Delete</Btn>
              {order.delivery_status === 'Cancelled' ? (
                <Btn variant="secondary" size="sm" onClick={() => onUpdate({ delivery_status: 'Pending', cancel_reason: '' })}>
                  <RefreshCw size={14} className="inline -mt-0.5 mr-1" /> Restore Order
                </Btn>
              ) : (
                <Btn variant="secondary" size="sm" onClick={() => {
                  const reason = prompt('Cancel this order? Optionally type a reason (e.g. "customer changed mind"):', '');
                  if (reason === null) return; // user pressed Cancel on the prompt
                  onUpdate({ delivery_status: 'Cancelled', cancel_reason: (reason || '').trim() });
                }}>
                  <X size={14} className="inline -mt-0.5 mr-1" /> Cancel Order
                </Btn>
              )}
            </div>
            <div className="flex gap-2">
              <Btn variant="secondary" onClick={() => onPrint('supplier')}><FileText size={14} className="inline -mt-0.5 mr-1" /> Supplier Copy</Btn>
              <Btn variant="secondary" onClick={() => { onClose(); }}><Save size={14} className="inline -mt-0.5 mr-1" /> Save</Btn>
              <Btn variant="primary" onClick={() => onPrint('invoice')}><Receipt size={14} className="inline -mt-0.5 mr-1" /> Invoice</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   PICKUP MODE
   ============================================================
   Single-page checklist view of all customers in a batch.
   Designed for use at the supplier while picking meat.
   - Temporary checkboxes (local state only — not saved to DB)
   - Resets when the screen closes
   - Shows progress per customer and overall
   ============================================================ */

function PickupMode({ batch, orders, onBack }) {
  // Local state: { [orderId]: { [itemIndex]: true } }
  const [picked, setPicked] = useState({});

  const togglePick = (orderId, itemIdx) => {
    setPicked(prev => {
      const orderPicks = prev[orderId] || {};
      return { ...prev, [orderId]: { ...orderPicks, [itemIdx]: !orderPicks[itemIdx] } };
    });
  };

  // Aggregate totals for supplier-buying reference
  const totalsByProduct = useMemo(() => {
    const m = new Map();
    orders.forEach(o => (o.items || []).forEach(it => {
      const prev = m.get(it.product) || 0;
      m.set(it.product, prev + (Number(it.qty) || 0));
    }));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [orders]);

  const totalItems = orders.reduce((s, o) => s + (o.items?.length || 0), 0);
  const pickedItems = orders.reduce((s, o) => {
    const op = picked[o.id] || {};
    return s + (o.items || []).filter((_, i) => op[i]).length;
  }, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-2" style={{ color: THEME.inkSoft }}>
            <ArrowLeft size={14} /> Back to Orders
          </button>
          <div className="font-display text-2xl" style={{ color: THEME.brand }}>Pickup Mode</div>
          <div className="text-sm mt-1" style={{ color: THEME.inkSoft }}>
            Batch: <span className="font-medium" style={{ color: THEME.ink }}>{batchLabel(batch)}</span> · {orders.length} customer{orders.length !== 1 ? 's' : ''} · {totalItems} item{totalItems !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider" style={{ color: THEME.inkSoft, letterSpacing: '0.08em' }}>Picked</div>
          <div className="font-display text-2xl" style={{ color: pickedItems === totalItems && totalItems > 0 ? '#059669' : THEME.brand }}>
            {pickedItems}/{totalItems}
          </div>
        </div>
      </div>

      {/* Aggregate totals — handy reference for supplier buying */}
      {totalsByProduct.length > 0 && (
        <Card className="p-4 mb-5" style={{ background: THEME.brandBg }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: THEME.brand, letterSpacing: '0.1em' }}>
            Total to buy from supplier
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {totalsByProduct.map(([prod, qty]) => (
              <span key={prod} className="text-sm">
                <span style={{ color: THEME.ink }}>{prod}:</span>{' '}
                <span className="font-semibold" style={{ color: THEME.brand }}>{qty} kg</span>
              </span>
            ))}
          </div>
        </Card>
      )}

      {orders.length === 0 ? (
        <Card className="p-8 text-center">
          <div style={{ color: THEME.inkSoft }} className="text-sm">No orders in this batch yet.</div>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const items = order.items || [];
            const orderPicks = picked[order.id] || {};
            const pickedCount = items.filter((_, i) => orderPicks[i]).length;
            const allDone = pickedCount === items.length && items.length > 0;
            return (
              <Card key={order.id} className="p-5" style={{
                background: allDone ? '#F0FDF4' : THEME.card,
                borderColor: allDone ? '#86EFAC' : THEME.line,
              }}>
                <div className="flex items-center justify-between mb-3 pb-3" style={{ borderBottom: `1px solid ${THEME.line}` }}>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-display text-lg" style={{ color: allDone ? '#065F46' : THEME.brand }}>
                        {order.customer}
                      </div>
                      {allDone && (
                        <CheckCircle size={18} style={{ color: '#059669' }} />
                      )}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>
                      {order.id} · {items.length} item{items.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-sm font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: allDone ? '#D1FAE5' : THEME.brandBg,
                      color: allDone ? '#065F46' : THEME.brand
                    }}>
                    {pickedCount}/{items.length}
                  </div>
                </div>

                <div className="space-y-2">
                  {items.map((it, i) => {
                    const isPicked = !!orderPicks[i];
                    return (
                      <label key={i}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer"
                        style={{
                          background: isPicked ? '#ECFDF5' : 'transparent',
                          border: `1px solid ${isPicked ? '#A7F3D0' : THEME.line}`,
                        }}>
                        <input type="checkbox" checked={isPicked}
                          onChange={() => togglePick(order.id, i)}
                          style={{ width: 22, height: 22, accentColor: '#059669', cursor: 'pointer', flexShrink: 0 }} />
                        <div className="flex-1 flex items-center justify-between gap-3">
                          <div style={{ textDecoration: isPicked ? 'line-through' : 'none', color: isPicked ? THEME.inkSoft : THEME.ink }}>
                            <div className="text-sm font-medium">{it.product}</div>
                            {it.note && (
                              <div className="text-xs italic mt-0.5" style={{ color: THEME.inkSoft }}>{it.note}</div>
                            )}
                          </div>
                          <div className="text-base font-semibold flex-shrink-0"
                            style={{ color: isPicked ? THEME.inkSoft : THEME.brand }}>
                            {it.qty} {it.unit}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="text-center mt-6 text-xs" style={{ color: THEME.inkSoft }}>
        💡 Checkboxes here are temporary and reset when you leave this screen.
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

      // ── MOBILE FIX: force a fixed desktop-width render during capture ──
      // On mobile the invoice renders at phone screen width (~390px on iPhone 12),
      // which squishes the table columns and distorts the QR aspect ratio.
      // We temporarily override the node's width to match the web layout (680px),
      // capture at that size, then restore everything. This makes the exported PNG
      // identical on all devices — phone, tablet, desktop — every time.
      const EXPORT_WIDTH = 680;
      const prevStyles = {
        width: node.style.width,
        minWidth: node.style.minWidth,
        maxWidth: node.style.maxWidth,
        overflow: node.style.overflow,
        position: node.style.position,
      };
      node.style.width = `${EXPORT_WIDTH}px`;
      node.style.minWidth = `${EXPORT_WIDTH}px`;
      node.style.maxWidth = `${EXPORT_WIDTH}px`;
      node.style.overflow = 'visible';
      node.style.position = 'relative';

      // Force a reflow so the browser recalculates layout at the new width
      // before we measure scrollHeight for the capture dimensions.
      void node.offsetHeight;
      await new Promise((r) => setTimeout(r, 100));

      // Turn off internal overflow scrollbars so they don't appear in the PNG
      const scrollables = Array.from(node.querySelectorAll('*')).filter((el) => {
        const cs = getComputedStyle(el);
        return cs.overflowX === 'auto' || cs.overflowX === 'scroll' ||
               cs.overflowY === 'auto' || cs.overflowY === 'scroll' ||
               cs.overflow === 'auto' || cs.overflow === 'scroll';
      });
      const savedOverflow = scrollables.map((el) => ({ el, prev: el.style.overflow }));
      scrollables.forEach(({ }, i) => { savedOverflow[i].el.style.overflow = 'visible'; });

      const fullWidth = EXPORT_WIDTH;
      const fullHeight = node.scrollHeight;

      // Force full image decode before capture (logo + QR both base64).
      // .decode() makes the browser fully prepare the bitmap — required on iOS.
      const imgs = Array.from(node.querySelectorAll('img'));
      await Promise.all(imgs.map(async (img) => {
        try {
          if (typeof img.decode === 'function') { await img.decode(); return; }
        } catch (e) { /* decode can reject on some browsers — fall through */ }
        if (img.complete && img.naturalWidth > 0) return;
        await new Promise((res) => { img.onload = res; img.onerror = res; });
      }));
      // Let fonts settle at the new width
      await new Promise((r) => setTimeout(r, 300));

      const opts = {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: fullWidth,
        height: fullHeight,
        cacheBust: true,
        style: { margin: '0', transform: 'none' },
      };

      // iOS Safari renders base64 images unreliably on the FIRST capture.
      // Triple-pass is the documented workaround — keep the final result.
      let dataUrl = await toPng(node, opts);
      dataUrl = await toPng(node, opts);
      dataUrl = await toPng(node, opts);

      // Restore all overridden styles so the on-screen view goes back to mobile layout
      savedOverflow.forEach(({ el, prev }) => { el.style.overflow = prev; });
      node.style.width = prevStyles.width;
      node.style.minWidth = prevStyles.minWidth;
      node.style.maxWidth = prevStyles.maxWidth;
      node.style.overflow = prevStyles.overflow;
      node.style.position = prevStyles.position;

      const cleanName = (order.customer || 'Customer').replace(/[\\/:*?"<>|]+/g, '').trim();
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${order.id} - ${cleanName}.png`;
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
      <div className="no-print sticky top-0 z-10 px-4 sm:px-8 py-3 flex items-center justify-between gap-2" style={{ background: THEME.card, borderBottom: `1px solid ${THEME.line}` }}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm flex-shrink-0" style={{ color: THEME.ink }}>
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Back to order</span><span className="sm:hidden">Back</span>
        </button>
        <div className="flex gap-2">
          <Btn variant="accent" onClick={saveAsImage} disabled={savingImg}>
            {savingImg
              ? <><Loader2 size={15} className="inline -mt-0.5 mr-1.5 animate-spin" /> Saving…</>
              : <><ImageIcon size={15} className="inline -mt-0.5 mr-1.5" /> <span className="hidden sm:inline">{isInvoice ? 'Save Order Summary' : 'Save Supplier Copy'}</span><span className="sm:hidden">Save</span></>}
          </Btn>
          <Btn variant="primary" onClick={() => window.print()}>
            <Printer size={15} className="inline -mt-0.5 sm:mr-1.5" /> <span className="hidden sm:inline">Print</span>
          </Btn>
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto px-3 sm:px-0" style={{ marginTop: 16, marginBottom: 24 }}>
        <div ref={docRef} className="p-5 sm:p-10" style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="flex flex-col items-center text-center mb-6 pb-5" style={{ borderBottom: `2px solid ${THEME.brand}` }}>
            <img src={LOGO_DATA_URL} alt="M&N Meatshop"
              width="96" height="96"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mb-3"
              style={{ display: 'block' }} />
            <div className="font-display text-2xl sm:text-3xl" style={{ color: THEME.brand }}>M&N MEATSHOP</div>
            <div className="text-xs sm:text-sm mt-0.5" style={{ color: THEME.inkSoft }}>
              Your Daily Meat Choice
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="font-display text-xl sm:text-2xl tracking-wide uppercase" style={{ color: THEME.ink }}>
              {isInvoice ? 'Order Summary' : 'Supplier Order Copy'}
            </div>
            {!isInvoice && (
              <div className="text-xs sm:text-sm mt-1" style={{ color: THEME.inkSoft }}>
                Please prepare the following items for the customer below.
              </div>
            )}
          </div>

          {/* Customer name as the main identifier */}
          <div className="flex justify-between gap-4 mb-6 pb-4" style={{ borderBottom: `1px solid ${THEME.line}` }}>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: THEME.inkSoft }}>Customer</div>
              <div className="font-display text-xl sm:text-2xl" style={{ color: THEME.brand }}>{order.customer}</div>
              {order.phone && <div className="text-sm mt-0.5" style={{ color: THEME.inkSoft }}>{order.phone}</div>}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: THEME.inkSoft }}>Date</div>
              <div className="text-base sm:text-lg whitespace-nowrap">{fmtDate(order.date)}</div>
            </div>
          </div>

        {isInvoice ? (
          /* ===== INVOICE / ORDER SUMMARY ===== */
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-xs sm:text-sm" style={{ minWidth: 340 }}>
              <thead>
                <tr style={{ background: THEME.brandBg }}>
                  <th className="text-left px-2 sm:px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>#</th>
                  <th className="text-left px-2 sm:px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>Product / Item</th>
                  <th className="text-right px-2 sm:px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>Qty</th>
                  <th className="text-right px-2 sm:px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>Unit Price</th>
                  <th className="text-right px-2 sm:px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>Amount</th>
                  <th className="text-left px-2 sm:px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>Notes / Special Cut</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((it, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${THEME.line}` }}>
                    <td className="px-2 sm:px-3 py-3" style={{ color: THEME.inkSoft }}>{i + 1}</td>
                    <td className="px-2 sm:px-3 py-3">{it.product}</td>
                    <td className="px-2 sm:px-3 py-3 text-right whitespace-nowrap">{it.qty} {it.unit}</td>
                    <td className="px-2 sm:px-3 py-3 text-right whitespace-nowrap">{peso(it.price)}</td>
                    <td className="px-2 sm:px-3 py-3 text-right font-medium whitespace-nowrap">{peso(it.qty * it.price)}</td>
                    <td className="px-2 sm:px-3 py-3" style={{ color: it.note ? THEME.ink : THEME.inkSoft }}>{it.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* ===== SUPPLIER COPY: no costs ===== */
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-xs sm:text-sm" style={{ minWidth: 300 }}>
              <thead>
                <tr style={{ background: THEME.brandBg }}>
                  <th className="text-left px-2 sm:px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>#</th>
                  <th className="text-left px-2 sm:px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>Product / Item</th>
                  <th className="text-right px-2 sm:px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>Qty</th>
                  <th className="text-left px-2 sm:px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>Notes / Special Cut</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((it, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${THEME.line}` }}>
                    <td className="px-2 sm:px-3 py-3" style={{ color: THEME.inkSoft }}>{i + 1}</td>
                    <td className="px-2 sm:px-3 py-3">{it.product}</td>
                    <td className="px-2 sm:px-3 py-3 text-right whitespace-nowrap">{it.qty} {it.unit}</td>
                    <td className="px-2 sm:px-3 py-3" style={{ color: it.note ? THEME.ink : THEME.inkSoft }}>{it.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isInvoice ? (
          <div className="flex justify-end mb-8">
            <div className="w-full sm:w-72">
              <div className="flex justify-between py-3 font-display text-xl sm:text-2xl" style={{ borderTop: `2px solid ${THEME.brand}`, color: THEME.brand }}>
                <span>TOTAL</span>
                <span>{pesoFull(total)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-end mb-8">
            <div className="w-full sm:w-72">
              <div className="flex justify-between py-3 font-display text-lg sm:text-xl" style={{ borderTop: `2px solid ${THEME.brand}`, color: THEME.brand }}>
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

          {/* GCash payment strip — invoice only, Layout C full-width style.
              Lives between the total and the Thank You so the customer sees
              payment options at the natural eye-flow point after the total. */}
          {isInvoice && (
            <div className="mt-8 flex items-center justify-between gap-4 px-4 py-4 rounded-md"
              style={{ background: THEME.brandBg, border: `1px solid ${THEME.line}` }}>
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md"
                  style={{ background: 'white', border: `1px solid ${THEME.line}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', flexShrink: 0 }}>
                  <img src={GCASH_QR} alt="GCash QR"
                    width="96" height="96"
                    style={{ width: 96, height: 96, display: 'block', flexShrink: 0 }} />
                </div>
                <div>
                  <div className="text-[9px] font-semibold uppercase mb-0.5"
                    style={{ color: THEME.brand, letterSpacing: '0.14em' }}>
                    Pay via GCash / InstaPay
                  </div>
                  <div className="text-lg font-bold leading-tight" style={{ color: '#0066CC', letterSpacing: '0.02em' }}>
                    {GCASH_NUMBER}
                  </div>
                </div>
              </div>
              <div className="text-right text-[10.5px] italic leading-relaxed" style={{ color: THEME.inkSoft }}>
                Scan QR or send to number above<br />
                Cash also accepted<br />
                <span className="text-[10px]" style={{ color: THEME.inkSoft, opacity: 0.75 }}>
                  Please send screenshot as confirmation
                </span>
              </div>
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
    () => Object.values(orders)
      .filter(o => o.delivery_status !== 'Cancelled')
      .sort((a, b) => (b.id || '').localeCompare(a.id || '')),
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
  // Total kilos across rollup (only items priced per kg, so the figure is meaningful).
  const totalKg = rollup.reduce((s, r) => s + ((r.unit === 'kg' || !r.unit) ? r.qty : 0), 0);

  return (
    <div>
      <Header title="Pickup Cross-Check" subtitle="Select multiple orders to roll up supplier pickup quantities" />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-display text-lg">Select Orders</div>
              <div className="flex gap-1.5">
                <button onClick={selectAll} className="text-xs px-2 py-1 rounded" style={{ color: THEME.brand, border: `1px solid ${THEME.line}` }}>All</button>
                <button onClick={clear} className="text-xs px-2 py-1 rounded" style={{ color: THEME.inkSoft, border: `1px solid ${THEME.line}` }}>Clear</button>
              </div>
            </div>
            <div className="text-xs mb-3" style={{ color: THEME.inkSoft }}>{selected.size} selected</div>
            <div className="max-h-96 overflow-y-auto overflow-x-auto -mx-2">
              {ordersList.length === 0 && <EmptyHint>No orders yet.</EmptyHint>}
              {ordersList.map((o) => {
                const total = (o.items || []).reduce((s, i) => s + i.qty * i.price, 0);
                const isSel = selected.has(o.id);
                return (
                  <label key={o.id} className="flex items-center gap-3 px-2 py-2 rounded cursor-pointer" style={{ background: isSel ? THEME.brandBg : 'transparent' }}>
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

        <div className="lg:col-span-3">
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
                  <div className="text-right">
                    <div className="font-display text-3xl" style={{ color: THEME.brand }}>{peso(grandTotal)}</div>
                    {totalKg > 0 && (
                      <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>{totalKg.toFixed(2).replace(/\.00$/, '')} kg total</div>
                    )}
                  </div>
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
   SALES CROSS-CHECK (customer side — selling price)
   ============================================================ */

function SalesCheck({ orders, privacy }) {
  const [selected, setSelected] = useState(new Set());
  const m = (n) => privacy ? '₱•••••' : peso(n);

  const ordersList = useMemo(
    () => Object.values(orders)
      .filter(o => o.delivery_status !== 'Cancelled')
      .sort((a, b) => (b.id || '').localeCompare(a.id || '')),
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
          byProduct[it.product] = { product: it.product, qty: 0, price: 0, totalPrice: 0, totalCost: 0, unit: it.unit };
        }
        byProduct[it.product].qty += it.qty;
        byProduct[it.product].price = it.price;
        byProduct[it.product].totalPrice += it.qty * it.price;
        byProduct[it.product].totalCost += it.qty * (Number(it.cost) || 0);
      });
    });
    return Object.values(byProduct).sort((a, b) => a.product.localeCompare(b.product));
  }, [selected, orders]);

  const grandTotal = rollup.reduce((s, r) => s + r.totalPrice, 0);
  const grandCost = rollup.reduce((s, r) => s + r.totalCost, 0);
  const grandProfit = grandTotal - grandCost;
  const totalKg = rollup.reduce((s, r) => s + ((r.unit === 'kg' || !r.unit) ? r.qty : 0), 0);

  return (
    <div>
      <Header title="Sales Cross-Check" subtitle="Select multiple orders to roll up quantities and totals at your selling price" />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-display text-lg">Select Orders</div>
              <div className="flex gap-1.5">
                <button onClick={selectAll} className="text-xs px-2 py-1 rounded" style={{ color: THEME.brand, border: `1px solid ${THEME.line}` }}>All</button>
                <button onClick={clear} className="text-xs px-2 py-1 rounded" style={{ color: THEME.inkSoft, border: `1px solid ${THEME.line}` }}>Clear</button>
              </div>
            </div>
            <div className="text-xs mb-3" style={{ color: THEME.inkSoft }}>{selected.size} selected</div>
            <div className="max-h-96 overflow-y-auto overflow-x-auto -mx-2">
              {ordersList.length === 0 && <EmptyHint>No orders yet.</EmptyHint>}
              {ordersList.map((o) => {
                const total = (o.items || []).reduce((s, i) => s + i.qty * i.price, 0);
                const isSel = selected.has(o.id);
                return (
                  <label key={o.id} className="flex items-center gap-3 px-2 py-2 rounded cursor-pointer" style={{ background: isSel ? THEME.brandBg : 'transparent' }}>
                    <input type="checkbox" checked={isSel} onChange={() => toggle(o.id)} style={{ accentColor: THEME.brand }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{o.id}</span>
                        <span style={{ color: THEME.inkSoft }}>{m(total)}</span>
                      </div>
                      <div className="text-xs truncate" style={{ color: THEME.inkSoft }}>{fmtDateShort(o.date)} · {o.customer}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="p-5">
            <div className="font-display text-lg mb-1">Sales Roll-up</div>
            <div className="text-xs mb-4" style={{ color: THEME.inkSoft }}>Total quantity & value at your selling price for the selected orders</div>
            {rollup.length === 0 ? (
              <EmptyHint>Select orders to see the sales roll-up.</EmptyHint>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ color: THEME.inkSoft, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      <th className="text-left pb-2 font-medium">Product</th>
                      <th className="text-right pb-2 font-medium">Total Qty</th>
                      <th className="text-right pb-2 font-medium">Unit Price</th>
                      <th className="text-right pb-2 font-medium">Total Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rollup.map((r) => (
                      <tr key={r.product} style={{ borderTop: `1px solid ${THEME.line}` }}>
                        <td className="py-2.5">{r.product}</td>
                        <td className="py-2.5 text-right font-medium">{r.qty} {r.unit}</td>
                        <td className="py-2.5 text-right">{m(r.price)}</td>
                        <td className="py-2.5 text-right font-medium">{m(r.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: `2px solid ${THEME.brand}` }}>
                  <div>
                    <div className="text-xs uppercase tracking-wider" style={{ color: THEME.inkSoft }}>Total sales value</div>
                    <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>{selected.size} order{selected.size !== 1 ? 's' : ''} · {rollup.length} product{rollup.length !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-3xl" style={{ color: THEME.brand }}>{m(grandTotal)}</div>
                    {totalKg > 0 && (
                      <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>{totalKg.toFixed(2).replace(/\.00$/, '')} kg total</div>
                    )}
                    {grandTotal > 0 && (
                      <div className="text-sm mt-1 font-medium" style={{ color: grandProfit >= 0 ? THEME.green : THEME.red }}>
                        Profit: {m(grandProfit)}
                      </div>
                    )}
                  </div>
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
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);   // null = adding, otherwise editing this id
  const [date, setDate] = useState(today());
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[1]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payment, setPayment] = useState('Cash');
  const [notes, setNotes] = useState('');

  const openAdd = () => {
    setEditId(null);
    setDate(today()); setCategory(EXPENSE_CATEGORIES[1]);
    setDescription(''); setAmount(''); setPayment('Cash'); setNotes('');
    setShowForm(true);
  };

  const openEdit = (e) => {
    setEditId(e.id);
    setDate(e.date || today());
    setCategory(e.category || EXPENSE_CATEGORIES[1]);
    setDescription(e.description || '');
    setAmount(String(e.amount ?? ''));
    setPayment(e.payment || 'Cash');
    setNotes(e.notes || '');
    setShowForm(true);
  };

  const saveExpense = () => {
    if (!description.trim() || !amount || Number(amount) <= 0) return;
    if (editId) {
      setExpenses(expenses.map(e => e.id === editId
        ? { ...e, date, category, description: description.trim(), amount: Number(amount), payment, notes: notes.trim() }
        : e));
    } else {
      const newExpense = {
        id: 'EXP-' + Date.now(), date, category,
        description: description.trim(), amount: Number(amount), payment, notes: notes.trim(),
      };
      setExpenses([newExpense, ...expenses]);
    }
    setShowForm(false);
  };

  const deleteExpense = (id) => {
    if (!confirm('Delete this expense?')) return;
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // Sort entries by the actual expense date (newest first), so logging a past
  // date drops it into the right place instead of always sitting on top.
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => {
      const da = a.date || '';
      const db = b.date || '';
      if (da !== db) return db.localeCompare(da);    // newest date first
      // same date: keep most-recently-added on top (id is timestamp-based)
      return (b.id || '').localeCompare(a.id || '');
    });
  }, [expenses]);

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
        right={<Btn variant="primary" onClick={openAdd}><Plus size={15} className="inline -mt-0.5 mr-1" />Add Expense</Btn>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Spent" value={peso(stats.total)} sub={`${expenses.length} entries`} accent={THEME.brand} />
        <KpiCard label="This Month" value={peso(stats.thisMonth)} sub={new Date().toLocaleString('en-PH', { month: 'long', year: 'numeric' })} accent={THEME.amber} />
        <KpiCard label="Avg per Entry" value={peso(stats.avg)} accent={THEME.inkSoft} />
        <KpiCard label="Top Category" value={stats.categoryData[0]?.name || '—'} sub={stats.categoryData[0] ? peso(stats.categoryData[0].value) : ''} accent={THEME.green} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 p-5">
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
            <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
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
                  {sortedExpenses.map((e) => (
                    <tr key={e.id} style={{ borderTop: `1px solid ${THEME.line}` }}>
                      <td className="py-2.5" style={{ color: THEME.inkSoft }}>{fmtDateShort(e.date)}</td>
                      <td className="py-2.5"><Badge color="gray">{e.category}</Badge></td>
                      <td className="py-2.5">{e.description}</td>
                      <td className="py-2.5 text-right font-medium">{peso(e.amount)}</td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        <button onClick={() => openEdit(e)} style={{ color: THEME.inkSoft }} className="p-1 mr-1 hover:opacity-70" title="Edit"><Edit3 size={13} /></button>
                        <button onClick={() => deleteExpense(e.id)} style={{ color: THEME.red }} className="p-1 hover:opacity-70" title="Delete"><Trash2 size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} maxWidth="max-w-lg">
        <div className="px-6 py-5">
          <div className="font-display text-xl mb-5">{editId ? 'Edit Expense' : 'Add Expense'}</div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div><Label>Category</Label><Select value={category} onChange={(e) => setCategory(e.target.value)} options={EXPENSE_CATEGORIES} /></div>
            </div>
            <div><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Styrobox cooler" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Amount (₱)</Label><Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></div>
              <div><Label>Payment</Label><Select value={payment} onChange={(e) => setPayment(e.target.value)} options={PAYMENT_METHODS} /></div>
            </div>
            <div><Label>Notes (optional)</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={saveExpense}><Save size={14} className="inline -mt-0.5 mr-1" />{editId ? 'Save Changes' : 'Save'}</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
/* ============================================================
   PRODUCTS / PRICE LIST
   ============================================================ */


/* ============================================================
   RESTAURANT QUOTE  (client-facing — NO cost/profit shown)
   QUOTE PROFIT CHECK (private — your cost & profit)
   ============================================================ */

// Shared-trip delivery estimate and minimum profit kept per kg, used ONLY by
// the private profit check. Wholesale price is derived from each product's
// real cost & retail price.
const RQ_DELIV_PER_KG = 9;
const RQ_MIN_PROFIT_KG = 25;   // fat-margin items: min profit AFTER delivery
const RQ_THIN_FLOOR_KG = 20;   // thin items: min GROSS (price-cost), per owner

// One wholesale price per item.
// Fat-margin items (retail-cost >= 60): ~16% off retail, never below
//   cost + delivery + RQ_MIN_PROFIT_KG  (real profit protected).
// Thin-margin items: also discounted now, but never below cost + RQ_THIN_FLOOR_KG
//   i.e. a ₱20 GROSS floor (delivery NOT included, per owner's decision —
//   the portfolio mix is expected to compensate). The private Profit Check
//   screen still shows the true after-delivery number so it's never hidden.
function rqPricing(p) {
  const cost = Number(p.cost) || 0;
  const retail = Number(p.price) || 0;
  // If a custom wholesale price is set on the product itself, honor it. This
  // is for special items where you've deliberately chosen a price below the
  // safety floor (e.g. courtesy/loss-leader items). Otherwise the formula
  // protects you with a ₱20 gross floor on thin items.
  const custom = Number(p.wholesalePrice);
  if (custom > 0) {
    return { wholesale: Math.round(custom), discounted: custom < retail, thin: false, floor: custom, custom: true };
  }
  const headroom = retail - cost;
  if (headroom < 60) {
    const thinFloor = cost + RQ_THIN_FLOOR_KG;
    let w = Math.round(retail * 0.92);
    w = Math.max(w, thinFloor);
    w = Math.min(w, retail);
    return { wholesale: w, discounted: w < retail, thin: true, floor: thinFloor };
  }
  const floor = cost + RQ_DELIV_PER_KG + RQ_MIN_PROFIT_KG;
  let wholesale = Math.round(retail * 0.84);
  wholesale = Math.max(wholesale, floor);
  return { wholesale, discounted: true, thin: false, floor };
}

// ---- Client-facing quote: safe to show the restaurant ----
function RestaurantQuote({ catalog, qtys, setQtys }) {
  const sheetRef = useRef(null);
  const [savingSheet, setSavingSheet] = useState(false);

  const rows = useMemo(() => catalog.map((p) => {
    const pr = rqPricing(p);
    const kg = Number(qtys[p.name]) || 0;
    return { ...p, ...pr, kg };
  }), [catalog, qtys]);

  const totalKg = useMemo(() => rows.reduce((s, r) => s + r.kg, 0), [rows]);
  const grandTotal = useMemo(
    () => rows.reduce((s, r) => s + (r.kg > 0 ? r.wholesale * r.kg : 0), 0),
    [rows]
  );
  const retailTotal = useMemo(
    () => rows.reduce((s, r) => s + (r.kg > 0 ? (Number(r.price) || 0) * r.kg : 0), 0),
    [rows]
  );
  const avgPerKg = totalKg > 0 ? grandTotal / totalKg : 0;
  const savings = retailTotal - grandTotal;
  const setQty = (name, v) => setQtys({ ...qtys, [name]: v });
  const clearAll = () => setQtys({});

  // Export the price sheet element as a full-HD PNG, ready to print or share.
  const saveSheetImage = async () => {
    if (!sheetRef.current) return;
    setSavingSheet(true);
    try {
      const node = sheetRef.current;
      // Temporarily make the element visible at its natural size for capture
      const prev = node.style.cssText;
      node.style.cssText = 'position:absolute;left:0;top:0;z-index:-1;opacity:1;pointer-events:none;';
      // Wait for the logo (base64) to finish decoding
      const imgs = Array.from(node.querySelectorAll('img'));
      await Promise.all(imgs.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise((res) => { img.onload = res; img.onerror = res; });
      }));
      await new Promise((r) => setTimeout(r, 200));
      const dataUrl = await toPng(node, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: 1056,
        height: 816,
      });
      node.style.cssText = prev;
      const a = document.createElement('a');
      const ts = new Date().toISOString().slice(0, 10);
      a.href = dataUrl;
      a.download = `M&N Wholesale Price Sheet - ${ts}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      alert('Could not save the image. Please try again.');
      console.error(e);
    } finally {
      setSavingSheet(false);
    }
  };

  return (
    <div>
      <Header title="Restaurant Quote" subtitle="Our wholesale pricing — build the order together"
        right={
          <div className="flex gap-2">
            <Btn variant="secondary" size="sm" onClick={saveSheetImage} disabled={savingSheet}>
              <Download size={13} className="inline -mt-0.5 mr-1" />
              {savingSheet ? 'Saving…' : 'Price Sheet'}
            </Btn>
            <Btn variant="secondary" size="sm" onClick={clearAll}><RefreshCw size={13} className="inline -mt-0.5 mr-1" />Clear</Btn>
          </div>
        } />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="p-5">
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm" style={{ minWidth: 460 }}>
                <thead>
                  <tr style={{ color: THEME.inkSoft, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <th className="text-left pb-2 font-medium">Product</th>
                    <th className="text-right pb-2 font-medium">Retail</th>
                    <th className="text-right pb-2 font-medium">Our Price / kg</th>
                    <th className="text-right pb-2 font-medium" style={{ width: 90 }}>Kg</th>
                    <th className="text-right pb-2 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {['Pork', 'Chicken', 'Beef'].map((g) => (
                    <React.Fragment key={g}>
                      <tr><td colSpan={5} className="pt-3 pb-1 text-xs font-semibold" style={{ color: THEME.brandSoft }}>{g}</td></tr>
                      {rows.filter(r => r.group === g).map((r) => (
                        <tr key={r.name} style={{ borderTop: `1px solid ${THEME.line}` }}>
                          <td className="py-2">{r.name}</td>
                          <td className="py-2 text-right" style={{ color: THEME.inkSoft, textDecoration: r.discounted ? 'line-through' : 'none' }}>{peso(r.price)}</td>
                          <td className="py-2 text-right font-medium">{peso(r.wholesale)}</td>
                          <td className="py-2 text-right">
                            <input type="number" min="0" step="0.5" value={qtys[r.name] || ''}
                              onChange={(e) => setQty(r.name, e.target.value)}
                              placeholder="0"
                              className="w-16 px-2 py-1 rounded text-right outline-none"
                              style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink }} />
                          </td>
                          <td className="py-2 text-right font-medium">{r.kg > 0 ? peso(r.wholesale * r.kg) : '—'}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-5" style={{ position: 'sticky', top: 16 }}>
            <div className="font-display text-lg mb-4">Order Total</div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span style={{ color: THEME.inkSoft }}>Total quantity</span>
                <span className="font-medium">{totalKg.toFixed(1)} kg</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: THEME.inkSoft }}>Items</span>
                <span className="font-medium">{rows.filter(r => r.kg > 0).length}</span>
              </div>
            </div>
            <div className="py-4" style={{ borderTop: `2px solid ${THEME.brand}` }}>
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: THEME.inkSoft }}>Total Amount</div>
              <div className="font-display text-3xl" style={{ color: THEME.brand }}>{peso(grandTotal)}</div>
              {totalKg > 0 && (
                <div className="text-sm mt-1" style={{ color: THEME.inkSoft }}>
                  Averages {peso(avgPerKg)}/kg
                </div>
              )}
            </div>
            {savings > 0 && (
              <div className="mt-3 px-3 py-2.5 rounded-md text-sm" style={{ background: THEME.successBg, color: THEME.successInk }}>
                You save <strong>{peso(savings)}</strong> vs our regular price
                <span style={{ color: THEME.inkSoft }}> ({peso(retailTotal)})</span>
              </div>
            )}
            <div className="text-xs mt-3" style={{ color: THEME.inkSoft }}>
              M&N Meatshop · fresh, cut to your spec, delivered on schedule.
            </div>
          </Card>
        </div>
      </div>

      {/* ============================================================
          HIDDEN PRICE SHEET — rendered offscreen, captured as PNG by
          saveSheetImage(). Designed at ~800px wide; pixelRatio:2 → 1600px.
          Print-friendly proportions, editorial styling.
          ============================================================ */}
      <div style={{ position: 'absolute', left: -99999, top: 0, opacity: 0, pointerEvents: 'none' }}>
        <div ref={sheetRef} style={{
          // 11 × 8.5 inches at 96dpi = 1056 × 816px. Captured at 2× = 2112 × 1632px.
          // True US Letter landscape (same as your spec: 279 × 216mm).
          width: 1056, height: 816,
          background: '#ffffff', color: '#2A2624',
          fontFamily: 'DM Sans, sans-serif',
          padding: '44px 52px',
          boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottom: '2px solid #7A2E33', marginBottom: 14 }}>
            <img src={LOGO_DATA_URL} alt="" style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 30, color: '#7A2E33', lineHeight: 1.05 }}>M&N Meatshop</div>
              <div style={{ fontSize: 13, color: '#6B5F58', marginTop: 3 }}>Wholesale Price Sheet · For Restaurant &amp; Bulk Clients</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 11, color: '#6B5F58', flexShrink: 0 }}>
              <div style={{ letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 10 }}>Effective</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#2A2624', marginTop: 3 }}>{new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>

          {/* Intro line */}
          <div style={{ fontSize: 12.5, color: '#6B5F58', marginBottom: 14, lineHeight: 1.5 }}>
            All prices are per kilogram. Volume totals (5–20 kg) shown for quick reference. Cut to your specification. Delivered Tuesday &amp; Saturday.
          </div>

          {/* Two-column tables — proper landscape layout */}
          <div style={{ display: 'flex', gap: 28, flex: 1 }}>
            {/* Left: Pork */}
            <div style={{ flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '34%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '13.25%' }} />
                  <col style={{ width: '13.25%' }} />
                  <col style={{ width: '13.25%' }} />
                  <col style={{ width: '13.25%' }} />
                </colgroup>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #2A2624' }}>
                    {['PRODUCT','PER KG','5 KG','10 KG','15 KG','20 KG'].map((h, i) => (
                      <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', padding: '6px 5px', fontSize: 9.5, letterSpacing: '0.08em', color: '#6B5F58', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr><td colSpan={6} style={{ padding: '11px 5px 3px', fontFamily: 'Fraunces, Georgia, serif', fontSize: 15, color: '#7A2E33', fontWeight: 600 }}>Pork</td></tr>
                  {rows.filter(r => r.group === 'Pork').map(r => (
                    <tr key={r.name} style={{ borderTop: '1px solid #EFE7DA' }}>
                      <td style={{ padding: '8px 5px', color: '#2A2624', fontSize: 12 }}>{r.name}</td>
                      <td style={{ padding: '8px 5px', textAlign: 'right', fontWeight: 700, color: '#7A2E33' }}>{peso(r.wholesale)}</td>
                      <td style={{ padding: '8px 5px', textAlign: 'right' }}>{peso(r.wholesale * 5)}</td>
                      <td style={{ padding: '8px 5px', textAlign: 'right' }}>{peso(r.wholesale * 10)}</td>
                      <td style={{ padding: '8px 5px', textAlign: 'right' }}>{peso(r.wholesale * 15)}</td>
                      <td style={{ padding: '8px 5px', textAlign: 'right' }}>{peso(r.wholesale * 20)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vertical divider */}
            <div style={{ width: 1, background: '#E8DFD2', flexShrink: 0 }} />

            {/* Right: Chicken + Beef */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '34%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '13.25%' }} />
                  <col style={{ width: '13.25%' }} />
                  <col style={{ width: '13.25%' }} />
                  <col style={{ width: '13.25%' }} />
                </colgroup>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #2A2624' }}>
                    {['PRODUCT','PER KG','5 KG','10 KG','15 KG','20 KG'].map((h, i) => (
                      <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', padding: '6px 5px', fontSize: 9.5, letterSpacing: '0.08em', color: '#6B5F58', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['Chicken','Beef'].map(g => {
                    const items = rows.filter(r => r.group === g);
                    if (!items.length) return null;
                    return (
                      <React.Fragment key={g}>
                        <tr><td colSpan={6} style={{ padding: '11px 5px 3px', fontFamily: 'Fraunces, Georgia, serif', fontSize: 15, color: '#7A2E33', fontWeight: 600 }}>{g}</td></tr>
                        {items.map(r => (
                          <tr key={r.name} style={{ borderTop: '1px solid #EFE7DA' }}>
                            <td style={{ padding: '8px 5px', color: '#2A2624', fontSize: 12 }}>{r.name}</td>
                            <td style={{ padding: '8px 5px', textAlign: 'right', fontWeight: 700, color: '#7A2E33' }}>{peso(r.wholesale)}</td>
                            <td style={{ padding: '8px 5px', textAlign: 'right' }}>{peso(r.wholesale * 5)}</td>
                            <td style={{ padding: '8px 5px', textAlign: 'right' }}>{peso(r.wholesale * 10)}</td>
                            <td style={{ padding: '8px 5px', textAlign: 'right' }}>{peso(r.wholesale * 15)}</td>
                            <td style={{ padding: '8px 5px', textAlign: 'right' }}>{peso(r.wholesale * 20)}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>

              {/* Key points below the right column where space allows */}
              <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid #E8DFD2' }}>
                <div style={{ fontSize: 11.5, color: '#2A2624', lineHeight: 1.8 }}>
                  <div style={{ fontWeight: 600, color: '#7A2E33', marginBottom: 4 }}>Why order from us</div>
                  <div>· No minimum order — order exactly what you need</div>
                  <div>· Cut to your spec — menudo, sinigang, cubes, fillet</div>
                  <div>· Mixed orders welcome — pork, chicken &amp; beef together</div>
                  <div>· Reliable Tue &amp; Sat delivery, one person to call</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #E8DFD2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10.5, color: '#6B5F58' }}>
            <div>Prices subject to supplier cost adjustments. Final pricing confirmed upon order.</div>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontSize: 13, color: '#7A2E33' }}>M&amp;N Meatshop</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Private profit check: ONLY for the owner, never shown to a client ----
function QuoteProfitCheck({ catalog, privacy, qtys, setQtys }) {
  const m = (n) => privacy ? '₱•••••' : peso(n);
  // Your real model: the restaurant order rides the existing Tue/Sat neighbor
  // trip, which the neighbor orders already pay for. So the restaurant order's
  // marginal delivery cost is ~₱0. Turn this OFF only if a restaurant needs a
  // genuinely separate dedicated trip/detour.
  const [ridesNeighborTrip, setRidesNeighborTrip] = useState(true);
  const delivPerKg = ridesNeighborTrip ? 0 : RQ_DELIV_PER_KG;

  const rows = useMemo(() => catalog.map((p) => {
    const pr = rqPricing(p);
    const kg = Number(qtys[p.name]) || 0;
    return { ...p, ...pr, kg };
  }), [catalog, qtys]);

  const totalKg = useMemo(() => rows.reduce((s, r) => s + r.kg, 0), [rows]);
  const calc = useMemo(() => {
    let total = 0, cost = 0;
    rows.forEach((r) => {
      if (r.kg <= 0) return;
      total += r.wholesale * r.kg;
      cost += (Number(r.cost) || 0) * r.kg;
    });
    const delivery = totalKg > 0 ? delivPerKg * totalKg : 0;
    const profit = total - cost - delivery;
    return { total, cost, delivery, profit };
  }, [rows, totalKg, delivPerKg]);

  const setQty = (name, v) => setQtys({ ...qtys, [name]: v });
  const clearAll = () => setQtys({});

  return (
    <div>
      <Header title="Quote Profit Check" subtitle="PRIVATE — for you only. Never show this screen to a client."
        right={<Btn variant="secondary" size="sm" onClick={clearAll}><RefreshCw size={13} className="inline -mt-0.5 mr-1" />Clear</Btn>} />

      <div className="mb-5 px-4 py-3 rounded-md flex items-start gap-2 text-sm no-print" style={{ background: THEME.errorBg, color: THEME.red }}>
        <EyeOff size={15} className="mt-0.5 flex-shrink-0" />
        <div>
          <strong>This screen shows your cost and profit.</strong> Use it to check a quote is worthwhile <em>before</em> meeting a client. Do not open this in front of them — use the Restaurant Quote screen for that.
        </div>
      </div>

      <Card className="p-4 mb-5 no-print">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={ridesNeighborTrip}
            onChange={(e) => setRidesNeighborTrip(e.target.checked)}
            className="mt-0.5" style={{ width: 18, height: 18, accentColor: THEME.brand }} />
          <div className="text-sm">
            <span className="font-medium">This order rides my existing Tue/Sat neighbor trip</span>
            <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>
              ON (your normal case): the neighbor orders already pay for the trip, so this order's delivery cost is ~₱0 — which is exactly why you can beat S&R by having no minimum. Turn OFF only if a restaurant needs a separate dedicated trip or big detour (then ₱{RQ_DELIV_PER_KG}/kg applies).
            </div>
          </div>
        </label>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card className="p-5">
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm" style={{ minWidth: 560 }}>
                <thead>
                  <tr style={{ color: THEME.inkSoft, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <th className="text-left pb-2 font-medium">Product</th>
                    <th className="text-right pb-2 font-medium">Cost</th>
                    <th className="text-right pb-2 font-medium">Wholesale</th>
                    <th className="text-right pb-2 font-medium" style={{ width: 80 }}>Kg</th>
                    <th className="text-right pb-2 font-medium">Profit/kg*</th>
                  </tr>
                </thead>
                <tbody>
                  {['Pork', 'Chicken', 'Beef'].map((g) => (
                    <React.Fragment key={g}>
                      <tr><td colSpan={5} className="pt-3 pb-1 text-xs font-semibold" style={{ color: THEME.brandSoft }}>{g}</td></tr>
                      {rows.filter(r => r.group === g).map((r) => {
                        const ppk = r.wholesale - (Number(r.cost) || 0) - delivPerKg;
                        return (
                          <tr key={r.name} style={{ borderTop: `1px solid ${THEME.line}` }}>
                            <td className="py-2">
                              {r.name}
                              {!r.discounted && <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded" style={{ background: THEME.bg, color: THEME.inkSoft }}>retail</span>}
                            </td>
                            <td className="py-2 text-right" style={{ color: THEME.inkSoft }}>{m(r.cost)}</td>
                            <td className="py-2 text-right font-medium">{m(r.wholesale)}</td>
                            <td className="py-2 text-right">
                              <input type="number" min="0" step="0.5" value={qtys[r.name] || ''}
                                onChange={(e) => setQty(r.name, e.target.value)}
                                placeholder="0"
                                className="w-14 px-2 py-1 rounded text-right outline-none"
                                style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink }} />
                            </td>
                            <td className="py-2 text-right font-medium" style={{ color: ppk >= 5 ? THEME.green : ppk >= 0 ? THEME.amber : THEME.red }}>
                              {m(ppk)}
                              {ppk >= 0 && ppk < 5 && <span title="Very thin after delivery — relies on other items to compensate"> ⚠</span>}
                              {ppk < 0 && <span title="Loses money after delivery on this item alone"> ⚠</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-xs mt-3" style={{ color: THEME.inkSoft }}>
              *Profit per kg {ridesNeighborTrip ? 'assumes ₱0 delivery (rides your existing neighbor trip — see toggle above)' : `subtracts ₱${RQ_DELIV_PER_KG}/kg for a separate dedicated trip`}.
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-5" style={{ position: 'sticky', top: 16 }}>
            <div className="font-display text-lg mb-3">This Quote</div>
            <div className="space-y-2 text-sm mb-3">
              <div className="flex justify-between"><span style={{ color: THEME.inkSoft }}>Total quantity</span><span className="font-medium">{totalKg.toFixed(1)} kg</span></div>
              <div className="flex justify-between"><span style={{ color: THEME.inkSoft }}>Client pays</span><span className="font-medium">{m(calc.total)}</span></div>
            </div>
            <div className="space-y-1.5 text-sm py-3" style={{ borderTop: `1px solid ${THEME.line}` }}>
              <div className="flex justify-between"><span style={{ color: THEME.inkSoft }}>Your cost</span><span>{m(calc.cost)}</span></div>
              <div className="flex justify-between"><span style={{ color: THEME.inkSoft }}>Est. delivery</span><span style={{ color: THEME.red }}>−{m(calc.delivery)}</span></div>
            </div>
            <div className="py-3" style={{ borderTop: `2px solid ${THEME.brand}` }}>
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: THEME.inkSoft }}>Your Profit</div>
              <div className="font-display text-3xl" style={{ color: calc.profit >= 0 ? THEME.green : THEME.red }}>{m(calc.profit)}</div>
              {totalKg > 0 && (
                <div className="text-xs mt-1" style={{ color: THEME.inkSoft }}>{m(calc.profit / totalKg)}/kg take-home</div>
              )}
            </div>
            {calc.profit < 0 && totalKg > 0 && (
              <div className="text-xs px-2 py-1.5 rounded" style={{ background: THEME.errorBg, color: THEME.red }}>
                This order loses money. Don't offer it at these quantities.
              </div>
            )}
            {calc.profit >= 0 && totalKg >= 20 && (
              <div className="text-xs px-2 py-1.5 rounded" style={{ background: THEME.successBg, color: THEME.successInk }}>
                Worthwhile — safe to pursue this as a weekly order.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}





function SupplierPrices({ priceHistory, setPriceHistory, catalog, privacy }) {
  const m = (n) => privacy ? '₱•••••' : peso(n);
  const history = priceHistory || [];
  const [adding, setAdding] = useState(null); // null | {product, oldCost, newCost, date}

  const startAdd = () => setAdding({
    product: catalog[0]?.name || '',
    oldCost: '',
    newCost: '',
    date: today(),
  });

  const saveManual = () => {
    if (!adding) return;
    const oldCost = Number(adding.oldCost);
    const newCost = Number(adding.newCost);
    if (!adding.product || !(oldCost >= 0) || !(newCost >= 0) || oldCost === newCost) {
      alert('Please pick a product and enter a valid old and new cost that are different.');
      return;
    }
    const prod = catalog.find(p => p.name === adding.product);
    const sellPrice = Number(prod?.price) || 0;
    const entry = {
      id: 'PH-' + Date.now(),
      date: adding.date || today(),
      product: adding.product,
      oldCost: Math.round(oldCost * 100) / 100,
      newCost: Math.round(newCost * 100) / 100,
      delta: Math.round((newCost - oldCost) * 100) / 100,
      sellPrice,
      marginImpact: Math.round((oldCost - newCost) * 100) / 100,
      manual: true, // truthfully marked: this was hand-entered, not auto-captured
    };
    setPriceHistory([entry, ...(priceHistory || [])]);
    setAdding(null);
  };

  const sorted = useMemo(
    () => [...history].sort((a, b) => {
      if (a.date !== b.date) return (b.date || '').localeCompare(a.date || '');
      return (b.id || '').localeCompare(a.id || '');
    }),
    [history]
  );

  const stats = useMemo(() => {
    const increases = history.filter(h => h.delta > 0);
    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonth = increases.filter(h => (h.date || '').startsWith(thisMonthKey));
    // Per-product current erosion: compare each product's earliest recorded
    // cost to its latest, where selling price stayed the same.
    const byProduct = {};
    history.forEach((h) => {
      if (!byProduct[h.product]) byProduct[h.product] = [];
      byProduct[h.product].push(h);
    });
    const erosion = Object.entries(byProduct).map(([product, entries]) => {
      const chrono = [...entries].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      const firstCost = chrono[0].oldCost;
      const lastCost = chrono[chrono.length - 1].newCost;
      const sell = chrono[chrono.length - 1].sellPrice || 0;
      const totalRise = Math.round((lastCost - firstCost) * 100) / 100;
      const oldMargin = sell > 0 ? ((sell - firstCost) / sell) * 100 : 0;
      const newMargin = sell > 0 ? ((sell - lastCost) / sell) * 100 : 0;
      return { product, firstCost, lastCost, totalRise, sell, oldMargin, newMargin, changes: entries.length };
    }).filter(e => e.totalRise !== 0)
      .sort((a, b) => b.totalRise - a.totalRise);
    return {
      totalChanges: history.length,
      thisMonthCount: thisMonth.length,
      thisMonthPesos: Math.round(thisMonth.reduce((s, h) => s + Math.max(0, h.delta), 0) * 100) / 100,
      erosion,
    };
  }, [history]);

  return (
    <div>
      <Header title="Supplier Prices" subtitle="Every time your supplier changes a cost — and what it does to your margin"
        right={<Btn variant="secondary" size="sm" onClick={startAdd}><PlusCircle size={14} className="inline -mt-0.5 mr-1" />Add past change</Btn>} />

      {history.length === 0 ? (
        <Card className="p-8">
          <EmptyHint>
            No supplier price changes recorded yet. Whenever you edit a product's <strong>Supplier Cost</strong> in the Price List, the change (date, item, old → new, and the effect on your margin) is automatically logged here. Nothing to do manually — just keep your Price List costs up to date.
          </EmptyHint>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <KpiCard label="Total Changes Logged" value={String(stats.totalChanges)} sub="All recorded cost changes" accent={THEME.brand} />
            <KpiCard label="Increases This Month" value={String(stats.thisMonthCount)} sub={`+${m(stats.thisMonthPesos)} total per-kg`} accent={THEME.red} />
            <KpiCard label="Items Affected" value={String(stats.erosion.length)} sub="Products with cost movement" accent={THEME.accent} />
          </div>

          {stats.erosion.length > 0 && (
            <Card className="p-5 mb-6">
              <div className="font-display text-lg mb-1">Margin Impact Per Item</div>
              <div className="text-xs mb-4" style={{ color: THEME.inkSoft }}>
                Your selling price stayed the same — so every cost increase comes straight out of your profit. This is what you're losing per kg.
              </div>
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm" style={{ minWidth: 560 }}>
                  <thead>
                    <tr style={{ color: THEME.inkSoft, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      <th className="text-left pb-2 font-medium">Product</th>
                      <th className="text-right pb-2 font-medium">First Cost</th>
                      <th className="text-right pb-2 font-medium">Now</th>
                      <th className="text-right pb-2 font-medium">You Lose / kg</th>
                      <th className="text-right pb-2 font-medium">Margin Then → Now</th>
                      <th className="text-right pb-2 font-medium">Changes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.erosion.map((e) => (
                      <tr key={e.product} style={{ borderTop: `1px solid ${THEME.line}` }}>
                        <td className="py-2.5 font-medium">{e.product}</td>
                        <td className="py-2.5 text-right" style={{ color: THEME.inkSoft }}>{m(e.firstCost)}</td>
                        <td className="py-2.5 text-right">{m(e.lastCost)}</td>
                        <td className="py-2.5 text-right font-medium" style={{ color: e.totalRise > 0 ? THEME.red : THEME.green }}>
                          {e.totalRise > 0 ? '−' : '+'}{m(Math.abs(e.totalRise))}
                        </td>
                        <td className="py-2.5 text-right" style={{ color: THEME.inkSoft }}>
                          {e.oldMargin.toFixed(0)}% → <span style={{ color: e.newMargin < e.oldMargin ? THEME.red : THEME.green, fontWeight: 600 }}>{e.newMargin.toFixed(0)}%</span>
                        </td>
                        <td className="py-2.5 text-right" style={{ color: THEME.inkSoft }}>{e.changes}×</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          <Card className="p-5">
            <div className="font-display text-lg mb-1">Change History</div>
            <div className="text-xs mb-4" style={{ color: THEME.inkSoft }}>Every recorded supplier cost change, newest first</div>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm" style={{ minWidth: 520 }}>
                <thead>
                  <tr style={{ color: THEME.inkSoft, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <th className="text-left pb-2 font-medium">Date</th>
                    <th className="text-left pb-2 font-medium">Product</th>
                    <th className="text-right pb-2 font-medium">Old Cost</th>
                    <th className="text-right pb-2 font-medium">New Cost</th>
                    <th className="text-right pb-2 font-medium">Change</th>
                    <th className="text-right pb-2 font-medium">Effect on You /kg</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((h) => (
                    <tr key={h.id} style={{ borderTop: `1px solid ${THEME.line}` }}>
                      <td className="py-2.5" style={{ color: THEME.inkSoft }}>
                        {fmtDateShort(h.date)}
                        {h.manual && <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded" style={{ background: THEME.bg, color: THEME.inkSoft }}>added</span>}
                      </td>
                      <td className="py-2.5">{h.product}</td>
                      <td className="py-2.5 text-right" style={{ color: THEME.inkSoft }}>{m(h.oldCost)}</td>
                      <td className="py-2.5 text-right">{m(h.newCost)}</td>
                      <td className="py-2.5 text-right font-medium" style={{ color: h.delta > 0 ? THEME.red : THEME.green }}>
                        {h.delta > 0 ? '+' : ''}{m(h.delta)}
                      </td>
                      <td className="py-2.5 text-right font-medium" style={{ color: h.marginImpact < 0 ? THEME.red : THEME.green }}>
                        {h.marginImpact < 0 ? '−' : '+'}{m(Math.abs(h.marginImpact))}/kg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      <Modal open={!!adding} onClose={() => setAdding(null)} maxWidth="max-w-md">
        {adding && (
          <div>
            <div className="font-display text-xl mb-1">Add a past price change</div>
            <div className="text-xs mb-5" style={{ color: THEME.inkSoft }}>
              For a supplier change that already happened before this was tracked. This creates a real history entry.
            </div>
            <div className="space-y-4">
              <div>
                <Label>Product</Label>
                <Select value={adding.product} onChange={(e) => setAdding({ ...adding, product: e.target.value })}
                  options={catalog.map(p => p.name)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Old Cost (₱)</Label>
                  <Input type="number" step="0.01" value={adding.oldCost}
                    onChange={(e) => setAdding({ ...adding, oldCost: e.target.value })} placeholder="e.g. 183" />
                </div>
                <div>
                  <Label>New Cost (₱)</Label>
                  <Input type="number" step="0.01" value={adding.newCost}
                    onChange={(e) => setAdding({ ...adding, newCost: e.target.value })} placeholder="e.g. 188" />
                </div>
              </div>
              <div>
                <Label>Date it changed</Label>
                <Input type="date" value={adding.date}
                  onChange={(e) => setAdding({ ...adding, date: e.target.value })} />
              </div>
              {adding.oldCost !== '' && adding.newCost !== '' && Number(adding.oldCost) !== Number(adding.newCost) && (
                <div className="text-sm px-3 py-2 rounded-md" style={{ background: THEME.bg, color: THEME.ink }}>
                  Change: <strong style={{ color: Number(adding.newCost) > Number(adding.oldCost) ? THEME.red : THEME.green }}>
                    {Number(adding.newCost) > Number(adding.oldCost) ? '+' : ''}{peso(Number(adding.newCost) - Number(adding.oldCost))}
                  </strong>
                  {' '}— since your selling price is unchanged, that's what it does to your margin per kg.
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <Btn variant="secondary" onClick={() => setAdding(null)} className="flex-1">Cancel</Btn>
              <Btn variant="primary" onClick={saveManual} className="flex-1">Save entry</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ============================================================
   SUPPLIER PAYMENTS (simple log of what you paid the supplier)
   ============================================================ */

function SupplierPayments({ payments, setPayments, privacy }) {
  const m = (n) => privacy ? '₱•••••' : peso(n);
  const list = payments || [];
  const [adding, setAdding] = useState(null);   // null | { date, amount, notes }
  const [editingId, setEditingId] = useState(null);

  const sorted = useMemo(
    () => [...list].sort((a, b) => {
      if ((a.date || '') !== (b.date || '')) return (b.date || '').localeCompare(a.date || '');
      return (b.id || '').localeCompare(a.id || '');
    }),
    [list]
  );

  const total = useMemo(() => list.reduce((s, p) => s + (Number(p.amount) || 0), 0), [list]);
  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthTotal = useMemo(
    () => list.filter(p => (p.date || '').startsWith(thisMonthKey)).reduce((s, p) => s + (Number(p.amount) || 0), 0),
    [list, thisMonthKey]
  );

  // Monthly totals — for the bar chart trend view
  const monthly = useMemo(() => {
    const byMonth = {};
    list.forEach((p) => {
      if (!p.date) return;
      const key = p.date.slice(0, 7); // YYYY-MM
      byMonth[key] = (byMonth[key] || 0) + (Number(p.amount) || 0);
    });
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const [y, mo] = key.split('-');
        const d = new Date(Number(y), Number(mo) - 1, 1);
        return {
          key,
          label: d.toLocaleString('en-PH', { month: 'short', year: '2-digit' }),
          amount: Math.round(value * 100) / 100,
        };
      });
  }, [list]);

  // Cumulative spend — for the stock-chart-like line view (this one IS continuous)
  const cumulative = useMemo(() => {
    const sortedByDate = [...list]
      .filter(p => p.date)
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    let running = 0;
    return sortedByDate.map((p) => {
      running += Number(p.amount) || 0;
      return {
        date: p.date,
        label: fmtDateShort(p.date),
        cumulative: Math.round(running * 100) / 100,
        amount: Number(p.amount) || 0,
      };
    });
  }, [list]);

  const avgMonthly = monthly.length > 0 ? total / monthly.length : 0;

  // Per-payment series for the "stock chart" line — each logged date is a
  // point, value = that pickup's amount. Going up/down here = this pickup
  // was bigger/smaller than the last. The reference line shows the average.
  const perPayment = useMemo(() => {
    const sorted = [...list].filter(p => p.date).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    return sorted.map((p) => ({
      date: p.date,
      label: fmtDateShort(p.date),
      amount: Number(p.amount) || 0,
      notes: p.notes || '',
    }));
  }, [list]);
  const avgPayment = perPayment.length > 0
    ? perPayment.reduce((s, p) => s + p.amount, 0) / perPayment.length
    : 0;

  const startAdd = () => setAdding({ date: today(), amount: '', notes: '' });
  const save = () => {
    if (!adding) return;
    const amt = Number(adding.amount);
    if (!(amt > 0)) { alert('Enter a valid amount.'); return; }
    const entry = {
      id: editingId || ('SP-' + Date.now()),
      date: adding.date || today(),
      amount: Math.round(amt * 100) / 100,
      notes: (adding.notes || '').trim(),
    };
    if (editingId) {
      setPayments(list.map(p => p.id === editingId ? entry : p));
    } else {
      setPayments([entry, ...list]);
    }
    setAdding(null);
    setEditingId(null);
  };
  const startEdit = (p) => {
    setEditingId(p.id);
    setAdding({ date: p.date || today(), amount: String(p.amount), notes: p.notes || '' });
  };
  const remove = (id) => {
    if (!confirm('Delete this payment entry?')) return;
    setPayments(list.filter(p => p.id !== id));
  };

  return (
    <div>
      <Header title="Supplier Payments" subtitle="Log of what you've paid the supplier on pickups"
        right={<Btn variant="primary" size="sm" onClick={startAdd}><PlusCircle size={14} className="inline -mt-0.5 mr-1" />Add payment</Btn>} />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KpiCard label="Total Paid (All Time)" value={m(total)} sub={`${list.length} payment${list.length !== 1 ? 's' : ''}`} accent={THEME.brand} />
        <KpiCard label="This Month" value={m(monthTotal)} sub="Supplier payments logged this month" accent={THEME.accent} />
        <KpiCard label="Avg / Month" value={m(avgMonthly)} sub={`${monthly.length} month${monthly.length !== 1 ? 's' : ''} of data`} accent={THEME.green} />
      </div>

      {list.length > 0 && (
        <>
          <Card className="p-5 mb-4">
            <div className="flex items-baseline justify-between mb-1">
              <div className="font-display text-lg">Payment size per pickup</div>
              <div className="text-xs" style={{ color: THEME.inkSoft }}>Each logged date plotted</div>
            </div>
            <div className="text-xs mb-4" style={{ color: THEME.inkSoft }}>
              Each dot is a pickup payment. The line connects them in order of date. Dashed line = your average payment ({m(avgPayment)}). Dots <em>above</em> the line = bigger-than-usual pickup, <em>below</em> = smaller.
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={perPayment} margin={{ left: -8, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={THEME.line} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: THEME.inkSoft, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: THEME.inkSoft, fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `₱${(v/1000).toFixed(0)}k` : `₱${v}`} />
                <Tooltip
                  contentStyle={{ background: THEME.card, border: `1px solid ${THEME.line}`, borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [privacy ? '₱•••••' : peso(v), 'This pickup']}
                  labelFormatter={(label, payload) => {
                    const p = payload && payload[0] && payload[0].payload;
                    return p && p.notes ? `${label} · ${p.notes}` : label;
                  }}
                />
                <ReferenceLine y={avgPayment} stroke={THEME.inkSoft} strokeDasharray="4 4" strokeWidth={1}
                  label={{ value: 'avg', position: 'right', fill: THEME.inkSoft, fontSize: 10 }} />
                <Line type="monotone" dataKey="amount" stroke={THEME.brand} strokeWidth={2}
                  dot={{ r: 4, fill: THEME.brand, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: THEME.brand }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {cumulative.length > 1 && (
            <Card className="p-5 mb-4">
              <div className="flex items-baseline justify-between mb-1">
                <div className="font-display text-lg">Cumulative spend over time</div>
                <div className="text-xs" style={{ color: THEME.inkSoft }}>Running total of all supplier payments</div>
              </div>
              <div className="text-xs mb-4" style={{ color: THEME.inkSoft }}>Like a stock chart — only goes one direction (up). The slope = how fast you're paying out. Steeper = faster spending.</div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={cumulative} margin={{ left: -8, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={THEME.brand} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={THEME.brand} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={THEME.line} vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: THEME.inkSoft, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: THEME.inkSoft, fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => v >= 1000 ? `₱${(v/1000).toFixed(0)}k` : `₱${v}`} />
                  <Tooltip
                    contentStyle={{ background: THEME.card, border: `1px solid ${THEME.line}`, borderRadius: 8, fontSize: 12 }}
                    formatter={(v, name) => [privacy ? '₱•••••' : peso(v), name === 'cumulative' ? 'Total paid' : 'This payment']}
                  />
                  <Area type="monotone" dataKey="cumulative" stroke={THEME.brand} strokeWidth={2} fill="url(#cumFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          )}
        </>
      )}

      <Card className="p-5">
        {list.length === 0 ? (
          <EmptyHint>No supplier payments logged yet. Tap "Add payment" after each pickup to keep a clean record of what you paid and when.</EmptyHint>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm" style={{ minWidth: 520 }}>
              <thead>
                <tr style={{ color: THEME.inkSoft, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <th className="text-left pb-2 font-medium">Date</th>
                  <th className="text-left pb-2 font-medium">Notes</th>
                  <th className="text-right pb-2 font-medium">Amount</th>
                  <th className="text-right pb-2 font-medium" style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p) => (
                  <tr key={p.id} style={{ borderTop: `1px solid ${THEME.line}` }}>
                    <td className="py-2.5" style={{ color: THEME.inkSoft }}>{fmtDate(p.date)}</td>
                    <td className="py-2.5">{p.notes || <span style={{ color: THEME.inkSoft }}>—</span>}</td>
                    <td className="py-2.5 text-right font-medium">{m(p.amount)}</td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => startEdit(p)} className="text-xs px-2 py-1 mr-1 rounded hover:opacity-70" style={{ color: THEME.inkSoft }} title="Edit"><Edit3 size={13} /></button>
                      <button onClick={() => remove(p.id)} className="text-xs px-2 py-1 rounded hover:opacity-70" style={{ color: THEME.red }} title="Delete"><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!adding} onClose={() => { setAdding(null); setEditingId(null); }} maxWidth="max-w-md">
        {adding && (
          <div className="p-6">
            <div className="font-display text-xl mb-1">{editingId ? 'Edit payment' : 'Add supplier payment'}</div>
            <div className="text-xs mb-5" style={{ color: THEME.inkSoft }}>Record what you paid the supplier on a pickup.</div>
            <div className="space-y-4">
              <div>
                <Label>Date</Label>
                <Input type="date" value={adding.date} onChange={(e) => setAdding({ ...adding, date: e.target.value })} />
              </div>
              <div>
                <Label>Amount (₱)</Label>
                <Input type="number" step="0.01" value={adding.amount}
                  onChange={(e) => setAdding({ ...adding, amount: e.target.value })} placeholder="e.g. 4500" />
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Input type="text" value={adding.notes}
                  onChange={(e) => setAdding({ ...adding, notes: e.target.value })} placeholder="e.g. Tuesday pickup, invoice #..." />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Btn variant="secondary" onClick={() => { setAdding(null); setEditingId(null); }} className="flex-1">Cancel</Btn>
              <Btn variant="primary" onClick={save} className="flex-1">{editingId ? 'Save changes' : 'Save'}</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


/* ============================================================
   PRODUCTS / PRICE LIST
   ============================================================ */

function Products({ catalog, setCatalog, priceHistory, setPriceHistory }) {
  const [editing, setEditing] = useState(null);

  const updateProduct = (idx, patch) => setCatalog(catalog.map((p, i) => i === idx ? { ...p, ...patch } : p));
  const addProduct = () => setEditing({ idx: catalog.length, isNew: true, data: { name: '', unit: 'kg', cost: 0, price: 0, group: 'Pork' } });
  const saveEdit = () => {
    if (!editing) return;
    if (!editing.data.name.trim()) return;
    if (editing.isNew) {
      setCatalog([...catalog, editing.data]);
    } else {
      const before = catalog[editing.idx];
      const oldCost = Number(before?.cost) || 0;
      const newCost = Number(editing.data.cost) || 0;
      // Auto-capture a supplier price change when the cost actually moved.
      if (before && oldCost !== newCost) {
        const sellPrice = Number(editing.data.price) || 0;
        const entry = {
          id: 'PH-' + Date.now(),
          date: today(),
          product: editing.data.name,
          oldCost,
          newCost,
          delta: Math.round((newCost - oldCost) * 100) / 100,
          sellPrice,                       // selling price at the time of the change
          // Margin impact in ₱ per unit, since selling price is unchanged:
          marginImpact: Math.round((oldCost - newCost) * 100) / 100, // negative = you lose this much per kg
        };
        setPriceHistory([entry, ...(priceHistory || [])]);
      }
      updateProduct(editing.idx, editing.data);
    }
    setEditing(null);
  };
  const removeProduct = (idx) => {
    if (!confirm(`Delete ${catalog[idx].name}? This won't affect past orders.`)) return;
    setCatalog(catalog.filter((_, i) => i !== idx));
  };

  // Move a product up or down within its group. Swaps its position in the
  // catalog array with the nearest product that shares the same group, so
  // the display order (which follows array order) updates accordingly.
  const moveProduct = (idx, direction) => {
    const group = catalog[idx].group;
    // Find indices of all products in the same group, in array order.
    const groupIdxs = catalog.map((p, i) => ({ i, group: p.group })).filter(x => x.group === group).map(x => x.i);
    const posInGroup = groupIdxs.indexOf(idx);
    const targetPos = direction === 'up' ? posInGroup - 1 : posInGroup + 1;
    if (targetPos < 0 || targetPos >= groupIdxs.length) return; // already at edge
    const swapWith = groupIdxs[targetPos];
    const next = [...catalog];
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    setCatalog(next);
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
                  {items.map((p, posInGroup) => {
                    const margin = p.price > 0 ? ((p.price - p.cost) / p.price) * 100 : 0;
                    return (
                      <tr key={p.idx} style={{ borderTop: `1px solid ${THEME.line}` }}>
                        <td className="py-2.5">{p.name}</td>
                        <td className="py-2.5 text-right" style={{ color: THEME.inkSoft }}>{p.unit}</td>
                        <td className="py-2.5 text-right">{peso(p.cost)}</td>
                        <td className="py-2.5 text-right font-medium">{peso(p.price)}</td>
                        <td className="py-2.5 text-right" style={{ color: THEME.green }}>{peso(p.price - p.cost)}</td>
                        <td className="py-2.5 text-right" style={{ color: THEME.inkSoft }}>{margin.toFixed(1)}%</td>
                        <td className="py-2.5 text-right whitespace-nowrap">
                          <button onClick={() => moveProduct(p.idx, 'up')} disabled={posInGroup === 0}
                            className="p-1" style={{ color: posInGroup === 0 ? THEME.line : THEME.inkSoft, cursor: posInGroup === 0 ? 'default' : 'pointer' }} title="Move up"><ChevronUp size={14} /></button>
                          <button onClick={() => moveProduct(p.idx, 'down')} disabled={posInGroup === items.length - 1}
                            className="p-1 mr-1" style={{ color: posInGroup === items.length - 1 ? THEME.line : THEME.inkSoft, cursor: posInGroup === items.length - 1 ? 'default' : 'pointer' }} title="Move down"><ChevronDown size={14} /></button>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Category</Label><Select value={editing.data.group} onChange={(e) => setEditing({ ...editing, data: { ...editing.data, group: e.target.value } })} options={['Pork', 'Chicken', 'Beef']} /></div>
                <div><Label>Unit</Label><Select value={editing.data.unit} onChange={(e) => setEditing({ ...editing, data: { ...editing.data, unit: e.target.value } })} options={['kg', 'pack', 'pcs']} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Supplier Cost (₱)</Label><Input type="number" step="0.01" value={editing.data.cost} onChange={(e) => setEditing({ ...editing, data: { ...editing.data, cost: Number(e.target.value) } })} /></div>
                <div><Label>Selling Price (₱)</Label><Input type="number" step="0.01" value={editing.data.price} onChange={(e) => setEditing({ ...editing, data: { ...editing.data, price: Number(e.target.value) } })} /></div>
              </div>
              <div>
                <Label>Custom Wholesale Price (₱) — optional</Label>
                <Input type="number" step="0.01" value={editing.data.wholesalePrice || ''}
                  onChange={(e) => setEditing({ ...editing, data: { ...editing.data, wholesalePrice: e.target.value === '' ? undefined : Number(e.target.value) } })}
                  placeholder="Leave blank to use auto-calculated wholesale price" />
                <div className="text-xs mt-1" style={{ color: THEME.inkSoft }}>
                  Set this only if you want a specific wholesale price that overrides the formula. Otherwise leave blank.
                </div>
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
