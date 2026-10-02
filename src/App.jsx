import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard, PlusCircle, ListOrdered, Truck, Wallet, Tag,
  Printer, Trash2, Edit3, Search, X, Check, AlertCircle, TrendingUp,
  Receipt, FileText, ChevronRight, ChevronUp, ChevronDown, Save, Loader2, Plus,
  Eye, EyeOff, ArrowLeft, RefreshCw, Download, Upload, HardDrive, Image as ImageIcon,
  Activity, Menu, Store, Moon, Sun, CheckCircle, Inbox, MapPin, Users, MessageCircle,
  Crown, Trophy, Lightbulb, Sparkles, TrendingDown, ArrowUpRight, ArrowDownRight, CalendarDays,
  Target, Package, Info, Minus, BarChart3, ChevronLeft, MoreHorizontal, Filter, Scissors,
  ArrowUp, ArrowDown, ArrowUpDown,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis,
  Tooltip, CartesianGrid, LineChart, Line, Area, AreaChart, ReferenceLine, LabelList,
} from 'recharts';
import { toPng } from 'html-to-image';
import { LOGO_DATA_URL } from './logo.js';
import { GCASH_QR, GCASH_NUMBER } from './gcash-qr.js';
import { cloudLoad, cloudSave, getSession, signIn, signOut, onAuthChange, fetchOrderRequests, updateOrderRequestStatus, deleteOrderRequest, publishCatalog } from './supabase.js';

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

const APP_VERSION = 'v10.1 · Price List redesign';

const THEME_LIGHT = {
  bg: '#FAF5EE', card: '#FFFEF8', ink: '#2A2624', inkSoft: '#6B5F58',
  line: '#E8DFD2', brand: '#7A2E33', brandSoft: '#A04D52',
  accent: '#C9853A', green: '#4F7942', red: '#B23A48', amber: '#D89A3C',
  brandBg: '#F5E6E1', successBg: '#E5EDDE', successInk: '#2f4a2a',
  errorBg: '#FBEAEA', warnBg: '#F7E8C9', warnInk: '#7a5a1a',
  // Sidebar (v10): deep burgundy with light text and a cream active pill.
  sideBg: '#6E2A2F', sideInk: '#F8EEE7', sideInkSoft: 'rgba(248,238,231,0.66)',
  sideActiveBg: '#FBF5EE', sideActiveInk: '#6E2A2F', sideHover: 'rgba(255,255,255,0.08)',
  sideLine: 'rgba(255,255,255,0.12)', sideOk: '#B9DDA9', sideWarn: '#F3CF86', sideErr: '#F6B2AB',
};
const THEME_DARK = {
  // Tuned for dark: warm near-black backgrounds, soft off-white text, and a
  // lightened maroon/gold so the brand still reads on dark.
  bg: '#1A1614', card: '#241F1C', ink: '#F0E9E0', inkSoft: '#A99E92',
  line: '#3A322C', brand: '#C77A7F', brandSoft: '#B0686D',
  accent: '#E0A45A', green: '#7CA86A', red: '#D9737E', amber: '#E0B062',
  brandBg: '#3A2A2C', successBg: '#27331F', successInk: '#A9C99B',
  errorBg: '#3A2222', warnBg: '#3A3120', warnInk: '#E0C98A',
  sideBg: '#2B1A1C', sideInk: '#EFE3DB', sideInkSoft: 'rgba(239,227,219,0.6)',
  sideActiveBg: '#F0E6DE', sideActiveInk: '#5A2328', sideHover: 'rgba(255,255,255,0.07)',
  sideLine: 'rgba(255,255,255,0.09)', sideOk: '#A9C99B', sideWarn: '#E0C98A', sideErr: '#F0A9A2',
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

// Turn a customer's free-text preferred date ("Saturday, June 20", "Jun 20",
// "2026-06-20", "6/20") into a local YYYY-MM-DD batch date. Returns null when it
// can't be parsed, so callers can fall back to the suggested batch. When no year
// is given, assume the current year, rolling to next year if the date is past.
const MONTH_NAMES = ['january','february','march','april','may','june','july','august','september','october','november','december'];
/* ============================================================
   MULTI-DEVICE MERGE ENGINE
   ============================================================
   The whole workspace syncs as one JSON blob. Previously every save
   OVERWROTE that blob, so a device with stale data erased newer orders
   from other devices. Now every save and every load MERGES instead:
   - orders/customers: union by id, newest `updated_at` wins conflicts
   - deletions: recorded as tombstones in meta so they don't resurrect
   - expenses: union by id, newest updated_at wins
   - meta.lastOrderNum: max of both (prevents duplicate ORD numbers)
   - catalog & other low-contention data: the side with the newer
     domain stamp wins whole (edits happen on one device in practice)
   Nothing is ever lost by a stale device saving: its missing orders
   come back from the cloud copy during the merge.                    */
const orderStamp = (o) => o?.updated_at || o?.edited_at || o?.created_at || '';

const mergeById = (base = {}, incoming = {}, tombstones = {}) => {
  const out = {};
  const ids = new Set([...Object.keys(base || {}), ...Object.keys(incoming || {})]);
  ids.forEach((id) => {
    if (tombstones[id]) return; // deleted on some device — stays deleted
    const a = base?.[id], b = incoming?.[id];
    if (a && b) out[id] = orderStamp(b) >= orderStamp(a) ? b : a;
    else out[id] = a || b;
  });
  return out;
};

const mergeArrayById = (base = [], incoming = [], tombstones = {}) => {
  const map = {};
  (base || []).forEach((e) => { if (e && e.id != null && !tombstones[e.id]) map[e.id] = e; });
  (incoming || []).forEach((e) => {
    if (!e || e.id == null || tombstones[e.id]) return;
    const prev = map[e.id];
    if (!prev || orderStamp(e) >= orderStamp(prev)) map[e.id] = e;
  });
  return Object.values(map);
};

const mergeTombstones = (a = {}, b = {}) => {
  const out = { ...(a || {}) };
  Object.entries(b || {}).forEach(([id, ts]) => { if (!out[id] || ts > out[id]) out[id] = ts; });
  // Keep the registry small: newest 400 entries are plenty.
  const entries = Object.entries(out).sort((x, y) => (y[1] || '').localeCompare(x[1] || '')).slice(0, 400);
  return Object.fromEntries(entries);
};

// domainStamps live in meta.domainStamps = { catalog: iso, inventory: iso, ... }
const newerDomain = (key, metaA, metaB) =>
  ((metaB?.domainStamps?.[key] || '') > (metaA?.domainStamps?.[key] || ''));

// Merge two full workspace payloads. `incoming` is "the other side".
// On ties (no stamps at all), `base` wins — callers order args accordingly.
const mergeAppState = (base, incoming) => {
  if (!incoming) return base;
  if (!base) return incoming;
  const delOrders = mergeTombstones(base.meta?.deletedOrders, incoming.meta?.deletedOrders);
  const delExpenses = mergeTombstones(base.meta?.deletedExpenses, incoming.meta?.deletedExpenses);
  const delAreas = mergeTombstones(base.meta?.deletedAreas, incoming.meta?.deletedAreas);
  const pickDomain = (key) => (newerDomain(key, base.meta, incoming.meta) ? incoming[key] : base[key]) ?? base[key] ?? incoming[key];
  const domainStamps = { ...(incoming.meta?.domainStamps || {}), ...(base.meta?.domainStamps || {}) };
  Object.entries(incoming.meta?.domainStamps || {}).forEach(([k, v]) => { if ((v || '') > (domainStamps[k] || '')) domainStamps[k] = v; });
  return {
    catalog: pickDomain('catalog'),
    inventory: pickDomain('inventory'),
    priceHistory: (() => {   // append-only: union by value
      const seen = new Set(); const out = [];
      [...(base.priceHistory || []), ...(incoming.priceHistory || [])].forEach((e) => {
        const k = JSON.stringify(e); if (!seen.has(k)) { seen.add(k); out.push(e); }
      });
      return out;
    })(),
    supplierPayments: mergeArrayById(base.supplierPayments, incoming.supplierPayments, {}),
    dayCloses: { ...(incoming.dayCloses || {}), ...(base.dayCloses || {}) },
    orders: mergeById(base.orders, incoming.orders, delOrders),
    expenses: mergeArrayById(base.expenses, incoming.expenses, delExpenses),
    customers: mergeById(base.customers, incoming.customers, {}),
    meta: {
      ...(incoming.meta || {}), ...(base.meta || {}),
      lastOrderNum: Math.max(Number(base.meta?.lastOrderNum) || 0, Number(incoming.meta?.lastOrderNum) || 0),
      deletedOrders: delOrders,
      deletedExpenses: delExpenses,
      // Areas: union by id (newest edit wins), so two devices adding areas
      // at once both keep theirs; deletions stay deleted via tombstones.
      areas: mergeArrayById(base.meta?.areas, incoming.meta?.areas, delAreas),
      deletedAreas: delAreas,
      domainStamps,
    },
  };
};

const parsePreferredBatch = (text, refIso) => {
  if (!text) return null;
  const s = String(text).trim();
  const ref = new Date((refIso || today()) + 'T00:00:00');
  // Build an ISO date. When no year is written, pick the year (last / this /
  // next) whose date lands CLOSEST to the reference. This keeps "June 27"
  // anchored near when the order was placed instead of blindly jumping a year
  // ahead — the bug that pushed a past Saturday order into next-year Sunday.
  const pick = (monthIdx, day, explicitYear) => {
    if (monthIdx < 0 || monthIdx > 11 || day < 1 || day > 31) return null;
    if (explicitYear) {
      const d = new Date(explicitYear, monthIdx, day);
      return isNaN(d.getTime()) ? null : isoLocal(d);
    }
    let best = null, bestDiff = Infinity;
    for (const y of [ref.getFullYear() - 1, ref.getFullYear(), ref.getFullYear() + 1]) {
      const d = new Date(y, monthIdx, day);
      if (isNaN(d.getTime())) continue;
      const diff = Math.abs(d.getTime() - ref.getTime());
      if (diff < bestDiff) { bestDiff = diff; best = d; }
    }
    return best ? isoLocal(best) : null;
  };
  // ISO: 2026-06-20
  let m = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return pick(+m[2] - 1, +m[3], +m[1]);
  // Month name + day (+ optional year): "June 20", "Jun 20, 2026", "Saturday, June 20"
  m = s.match(/([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:[,\s]+(\d{4}))?/);
  if (m) {
    const monthIdx = MONTH_NAMES.findIndex((mo) => mo.slice(0, 3) === m[1].toLowerCase().slice(0, 3));
    if (monthIdx >= 0) return pick(monthIdx, +m[2], m[3] ? +m[3] : null);
  }
  // Numeric: 6/20 or 06/20/2026
  m = s.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (m) {
    const year = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : null;
    return pick(+m[1] - 1, +m[2], year);
  }
  return null;
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
        <span className="text-xs uppercase font-medium tracking-wider" style={{ color: THEME.inkSoft, letterSpacing: '0.08em' }}>
          Delivery Batch
        </span>
        {!expanded && (
          <button type="button" onClick={() => setExpanded(true)}
            className="text-xs underline" style={{ color: THEME.inkSoft }}>
            Change
          </button>
        )}
      </div>
      {!expanded ? (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md"
          style={{ background: value ? THEME.brandBg : THEME.warnBg, color: value ? THEME.brand : THEME.warnInk, border: `1px solid ${value ? THEME.brand : THEME.amber}` }}>
          <Truck size={14} />
          <span className="text-sm font-semibold">{value ? batchLabel(value) : 'Unassigned'}</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 mt-1">
          <button type="button" onClick={() => { onChange(tue); setExpanded(false); }}
            className="px-3 py-2 text-sm rounded-md inline-flex items-center gap-1.5"
            style={{ background: value === tue ? THEME.brand : 'transparent', color: value === tue ? 'white' : THEME.ink, border: `1px solid ${value === tue ? THEME.brand : THEME.line}` }}>
            <Truck size={13} /> Tuesday <span className="opacity-75">({batchLabel(tue).split(' · ')[1]})</span>
          </button>
          <button type="button" onClick={() => { onChange(sat); setExpanded(false); }}
            className="px-3 py-2 text-sm rounded-md inline-flex items-center gap-1.5"
            style={{ background: value === sat ? THEME.brand : 'transparent', color: value === sat ? 'white' : THEME.ink, border: `1px solid ${value === sat ? THEME.brand : THEME.line}` }}>
            <Truck size={13} /> Saturday <span className="opacity-75">({batchLabel(sat).split(' · ')[1]})</span>
          </button>
          <input type="date" value={isCustom ? value : ''}
            onChange={(e) => { if (e.target.value) { onChange(e.target.value); setExpanded(false); } }}
            className="px-3 py-2 text-sm rounded-md outline-none"
            style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink, minWidth: 140, opacity: isCustom ? 1 : 0.6 }} />
          {allowUnassign && value && (
            <button type="button" onClick={() => { onChange(''); setExpanded(false); }}
              className="px-3 py-2 text-sm rounded-md" style={{ color: THEME.inkSoft, border: `1px solid ${THEME.line}` }}>
              Unassign
            </button>
          )}
          <button type="button" onClick={() => setExpanded(false)}
            className="px-2 py-2 text-xs underline" style={{ color: THEME.inkSoft }}>
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
    <div className={`rounded-xl ${className}`} style={{ background: THEME.card, border: `1px solid ${THEME.line}`, ...style }}>
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
      className={`${sizes[size]} font-medium rounded-lg transition ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-85 cursor-pointer'} ${className}`}
      style={styles[variant]}>
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder, type = 'text', className = '', ...rest }) {
  return (
    <input type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder}
      className={`w-full px-3 py-2 rounded-lg outline-none transition-colors ${className}`}
      style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink, fontFamily: 'DM Sans, sans-serif' }}
      onFocus={(e) => e.target.style.borderColor = THEME.brand}
      onBlur={(e) => e.target.style.borderColor = THEME.line}
      {...rest} />
  );
}

function Select({ value, onChange, options, className = '', ...rest }) {
  return (
    <select value={value ?? ''} onChange={onChange}
      className={`w-full px-3 py-2 rounded-lg outline-none ${className}`}
      style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink }} {...rest}>
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
      <div className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-lg`} style={{ background: THEME.card }} onClick={(e) => e.stopPropagation()}>
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
  const [pendingOnline, setPendingOnline] = useState(0);

  // Poll for new online orders every 30s so the menu shows a live badge.
  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const reqs = await fetchOrderRequests();
        if (active) setPendingOnline((reqs || []).filter(r => r.status === 'pending').length);
      } catch (e) { /* table may not exist yet — ignore */ }
    };
    check();
    const iv = setInterval(check, 30000);
    return () => { active = false; clearInterval(iv); };
  }, [view]);
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
  const [dayCloses, setDayCloses] = useState({});
  const [customers, setCustomers] = useState({});
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
  // Orders registers a guard here so leaving with unsaved order edits asks
  // first. go() is used by every navigation control.
  const navGuardRef = useRef(null);
  const registerNavGuard = useRef((fn) => { navGuardRef.current = fn; }).current;
  const go = (v) => {
    if (v !== view && navGuardRef.current && !navGuardRef.current()) return;
    setView(v);
    setMobileNav(false);
  };

  // Keep the page background and iOS status-bar colour in sync with the theme
  // (covers overscroll area and the notch bar outside React's root).
  useEffect(() => {
    try {
      document.body.style.background = THEME.bg;
      // Expose a theme-aware hover colour as a CSS variable so hover states
      // adapt to dark mode (a hardcoded light hover hid text in dark mode).
      document.documentElement.style.setProperty('--row-hover', theme === 'dark' ? '#3A322C' : '#FBF3E8');
      document.documentElement.style.setProperty('--danger-hover', theme === 'dark' ? '#3A2222' : '#FBEAEA');
      document.documentElement.style.setProperty('--focus-ring', theme === 'dark' ? '#E0A9AD' : '#7A2E33');
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
      const localDayCloses = storage.load('dayCloses', {});
      const localCustomers = storage.load('customers', {});
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
          // Cloud has real data. MERGE it with what this device had locally
          // (instead of replacing) so a device that made offline/unsynced
          // changes doesn't lose them — and a stale device instantly gains
          // everything newer from other devices.
          const local = {
            catalog: localCatalog, orders: localOrders || {}, expenses: localExpenses || [],
            inventory: localInventory, priceHistory: localPriceHistory || [],
            supplierPayments: localSupplierPayments || [], dayCloses: localDayCloses || {},
            customers: localCustomers || {}, meta: localMeta || { lastOrderNum: 0 },
          };
          const merged = hasLocalData ? mergeAppState(cloud, local) : cloud; // cloud wins ties
          setCatalog(merged.catalog || SEED_PRODUCTS);
          setOrders(merged.orders || {});
          setExpenses(merged.expenses || []);
          setInventory(merged.inventory || Object.fromEntries(SEED_PRODUCTS.map(p => [p.name, { qty: 0, dateAdded: '', notes: '' }])));
          setPriceHistory(merged.priceHistory || []);
          setSupplierPayments(merged.supplierPayments || []);
          setDayCloses(merged.dayCloses || {});
          setCustomers(merged.customers || {});
          setMeta(merged.meta || { lastOrderNum: 0 });
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
          setDayCloses(localDayCloses || {});
          setCustomers(localCustomers || {});
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
        setDayCloses(localDayCloses || {});
        setCustomers(localCustomers || {});
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

  // ── One-time correction (runs once per order, then never again) ─────
  // An earlier date-logic bug rolled some preferred dates a full year forward
  // (e.g. "June 27" became 2027 instead of 2026), and the old backfill could
  // re-date orders on every load. This replaces that risky behavior: it ONLY
  // corrects a batch that sits implausibly far (>120 days) after the order was
  // created, re-deriving it from the customer's preferred date using the
  // order's own creation date as the anchor. Everything else is left exactly
  // as-is — no more silent re-dating on load.
  useEffect(() => {
    if (!loaded) return;
    let changed = false;
    const next = { ...orders };
    Object.values(next).forEach((o) => {
      if (o.batch_year_fixed) return;
      const b = o.delivery_batch;
      if (!b || typeof b !== 'string' || b.length < 10) { next[o.id] = { ...o, batch_year_fixed: true }; return; }
      const created = (o.created_at || o.date || '').slice(0, 10) || today();
      const gapDays = (new Date(b + 'T00:00:00').getTime() - new Date(created + 'T00:00:00').getTime()) / 86400000;
      if (gapDays > 120 && o.preferred_date) {
        const fixed = parsePreferredBatch(o.preferred_date, created);
        if (fixed && fixed !== b) {
          next[o.id] = { ...o, delivery_batch: fixed, batch_year_fixed: true, updated_at: new Date().toISOString() };
          changed = true;
          return;
        }
      }
      next[o.id] = { ...o, batch_year_fixed: true };
    });
    if (changed) setOrders(next);
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stamp low-contention domains whenever they change so the merge's
  // last-writer-wins picks the genuinely newest copy across devices.
  const skipStampRef = useRef(true);
  useEffect(() => {
    if (!loaded) { return; }
    if (skipStampRef.current) { skipStampRef.current = false; return; }
    setMeta((m) => ({ ...m, domainStamps: { ...(m.domainStamps || {}), catalog: new Date().toISOString() } }));
  }, [catalog]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!loaded || skipStampRef.current) return;
    setMeta((m) => ({ ...m, domainStamps: { ...(m.domainStamps || {}), inventory: new Date().toISOString() } }));
  }, [inventory]); // eslint-disable-line react-hooks/exhaustive-deps

  // Adopt a merged payload into React state, but only for domains that
  // actually changed (JSON compare) — avoids pointless re-renders and
  // save-effect loops.
  const adoptIfChanged = (merged, current) => {
    const pairs = [
      ['catalog', setCatalog], ['orders', setOrders], ['expenses', setExpenses],
      ['inventory', setInventory], ['priceHistory', setPriceHistory],
      ['supplierPayments', setSupplierPayments], ['dayCloses', setDayCloses],
      ['customers', setCustomers], ['meta', setMeta],
    ];
    pairs.forEach(([key, set]) => {
      if (JSON.stringify(merged[key]) !== JSON.stringify(current[key])) set(merged[key]);
    });
  };

  // ── PULL LOOP: real-time-ish sync from other devices ────────────────
  // Every 20s (and whenever the app regains focus), fetch the cloud copy
  // and merge it in. Combined with merge-on-save, all devices converge
  // without manual refreshes — no more "old session" overwrites.
  const pullBusyRef = useRef(false);
  useEffect(() => {
    if (!loaded) return;
    const pull = async () => {
      if (pullBusyRef.current || saving || document.hidden) return;
      pullBusyRef.current = true;
      try {
        const remote = await cloudLoad();
        if (remote) {
          const current = { catalog, orders, expenses, inventory, priceHistory, supplierPayments, dayCloses, customers, meta };
          const merged = mergeAppState(remote, current); // remote wins ties on pull
          adoptIfChanged(merged, current);
        }
      } catch (e) { /* offline — try again next tick */ }
      pullBusyRef.current = false;
    };
    const iv = setInterval(pull, 20000);
    const onVis = () => { if (!document.hidden) pull(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onVis);
    return () => { clearInterval(iv); document.removeEventListener('visibilitychange', onVis); window.removeEventListener('focus', onVis); };
  }, [loaded, saving, catalog, orders, expenses, inventory, priceHistory, supplierPayments, dayCloses, customers, meta]);

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
    storage.save('dayCloses', dayCloses);
    storage.save('customers', customers);
    storage.save('meta', meta);
    lastSaveRef.current = Date.now();

    // Then push to the cloud (debounced so rapid edits don't spam it).
    // MERGE-ON-SAVE: read the cloud copy first and merge it with this
    // device's data, so a stale device can never erase newer orders made
    // on another device. If the merge pulled in anything new from the
    // cloud, adopt it locally too — that's the "other device's changes
    // appear here" half of the sync.
    let cancelled = false;
    const t = setTimeout(async () => {
      const local = { catalog, orders, expenses, inventory, priceHistory, supplierPayments, dayCloses, customers, meta };
      try {
        let payload = local;
        try {
          const remote = await cloudLoad();
          if (remote) payload = mergeAppState(local, remote); // local wins ties; union keeps remote-new
        } catch (e) { /* cloud read failed — save local as before */ }
        await cloudSave(payload);
        if (cancelled) return;
        adoptIfChanged(payload, local);
        setSyncStatus('cloud');
        setSaving(false);
      } catch (e) {
        if (!cancelled) {
          // Saved locally but cloud failed — data is NOT lost, just not synced.
          setSyncStatus('local-only');
          setSaving(false);
        }
      }
    }, 600);
    return () => { cancelled = true; clearTimeout(t); };
  }, [catalog, orders, expenses, inventory, priceHistory, supplierPayments, dayCloses, customers, meta, loaded]);

  // Publish the public-safe catalog (names + prices only) to the public_catalog
  // table so the customer ordering app shows current prices. Debounced, and only
  // runs when the catalog actually changes. Safe to fail quietly — if the
  // public_catalog table doesn't exist yet, this just no-ops.
  useEffect(() => {
    if (!loaded) return; // app data loaded implies the owner is logged in
    const t = setTimeout(() => { publishCatalog(catalog); }, 1000);
    return () => clearTimeout(t);
  }, [catalog, loaded]);

  // One-time import: push existing local data up to an empty cloud.
  const importLocalToCloud = async () => {
    setImporting(true);
    try {
      await cloudSave({ catalog, orders, expenses, inventory, priceHistory, supplierPayments, dayCloses, customers, meta });
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
      catalog, orders, expenses, inventory, priceHistory, supplierPayments, dayCloses, customers, meta,
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
        setDayCloses(data.dayCloses || {});
        setCustomers(data.customers || {});
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

  const navGroups = [
    { label: null, items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]},
    { label: 'Orders', items: [
      { id: 'new', label: 'New Order', icon: PlusCircle },
      { id: 'requests', label: 'Online Orders', icon: Inbox },
      { id: 'orders', label: 'Orders', icon: ListOrdered },
      { id: 'pickup', label: 'Pickup Check', icon: Truck },
    ]},
    { label: 'Money', items: [
      { id: 'salescheck', label: 'Sales Check', icon: Receipt },
      { id: 'expenses', label: 'Expenses', icon: Wallet },
      { id: 'supplierpayments', label: 'Supplier Payments', icon: Wallet },
    ]},
    { label: 'Pricing', items: [
      { id: 'products', label: 'Price List', icon: Tag },
      { id: 'restaurantquote', label: 'Restaurant Quote', icon: Store },
      { id: 'profitcheck', label: 'Quote Profit Check', icon: EyeOff },
      { id: 'supplierprices', label: 'Supplier Prices', icon: TrendingUp },
      { id: 'monthlyreport', label: 'Monthly Report', icon: BarChart3 },
    ]},
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
        <button onClick={() => go('new')}
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
          className={`mn-side fixed lg:sticky top-0 z-50 lg:z-auto w-64 lg:w-60 h-screen lg:h-screen flex flex-col no-print transition-transform duration-300 ${mobileNav ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
          style={{ background: THEME.sideBg, color: THEME.sideInk }}>
          <div className="flex-shrink-0 px-6 pb-5 flex flex-col items-center text-center relative" style={{ borderBottom: `1px solid ${THEME.sideLine}`, paddingTop: 'max(env(safe-area-inset-top), 24px)' }}>
            <button onClick={() => setMobileNav(false)} className="lg:hidden absolute right-3 p-2 rounded-lg" style={{ color: THEME.sideInkSoft, top: 'max(env(safe-area-inset-top), 12px)' }} aria-label="Close menu">
              <X size={20} />
            </button>
            <img src={LOGO_DATA_URL} alt="M&N Meatshop" className="w-20 h-20 lg:w-24 lg:h-24 [@media(max-height:760px)]:w-14 [@media(max-height:760px)]:h-14 rounded-full object-cover mb-3"
              style={{ boxShadow: '0 0 0 3px rgba(255,255,255,0.14), 0 6px 18px rgba(0,0,0,0.25)' }} />
            <div className="font-display text-xl leading-tight" style={{ color: THEME.sideInk }}>M&N Meatshop</div>
            <div className="text-xs mt-0.5" style={{ color: THEME.sideInkSoft }}>Your daily meat choice</div>
          </div>
          <nav className="flex-1 min-h-0 py-4 px-3 overflow-y-auto overscroll-contain" aria-label="Main">
            {navGroups.map((group, gi) => (
              <div key={gi} className={gi > 0 ? 'mt-4' : ''}>
                {group.label && (
                  <div className="px-3.5 mb-1.5 text-[11px] font-semibold uppercase" style={{ color: THEME.sideInkSoft, letterSpacing: '0.12em' }}>
                    {group.label}
                  </div>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = view === item.id;
                  return (
                    <button key={item.id} onClick={() => go(item.id)} aria-current={active ? 'page' : undefined}
                      className="w-full flex items-center gap-3 px-3.5 py-3 lg:py-2.5 text-sm text-left rounded-xl mb-0.5 transition-colors"
                      style={{
                        background: active ? THEME.sideActiveBg : 'transparent',
                        color: active ? THEME.sideActiveInk : THEME.sideInk,
                        fontWeight: active ? 600 : 400,
                        boxShadow: active ? '0 2px 10px rgba(0,0,0,0.18)' : 'none',
                      }}
                      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = THEME.sideHover; }}
                      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                      <Icon size={17} style={{ opacity: active ? 1 : 0.8, flexShrink: 0 }} />
                      <span className="flex-1">{item.label}</span>
                      {item.id === 'requests' && pendingOnline > 0 && (
                        <span className="flex items-center justify-center text-xs font-bold rounded-full"
                          style={{
                            background: active ? THEME.sideActiveInk : '#E9B45E',
                            color: active ? THEME.sideActiveBg : '#3A1F12',
                            minWidth: 20, height: 20, padding: '0 6px',
                          }}>
                          {pendingOnline}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="flex-shrink-0 px-6 pt-4" style={{ borderTop: `1px solid ${THEME.sideLine}`, paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
            <button onClick={() => { setShowBackup(true); setMobileNav(false); }} className="flex items-center gap-2 text-xs mb-2 hover:opacity-80" style={{ color: THEME.sideInkSoft }}>
              <HardDrive size={12} /> Backup & Restore
            </button>
            <button onClick={async () => { if (confirm('Sign out of M&N Meatshop?')) { await signOut(); } }} className="flex items-center gap-2 text-xs mb-2 hover:opacity-80" style={{ color: THEME.sideInkSoft }}>
              <ArrowLeft size={12} /> Sign Out
            </button>
            <div className="text-xs flex items-center gap-2" style={{ color: THEME.sideInk }} role="status">
              {saving
                ? (<><Loader2 size={11} className="animate-spin" /> Syncing…</>)
                : syncStatus === 'cloud'
                  ? (<><Check size={11} style={{ color: THEME.sideOk }} /> Saved to cloud</>)
                  : syncStatus === 'local-only'
                    ? (<><HardDrive size={11} style={{ color: THEME.sideWarn }} /> Saved on this device</>)
                    : syncStatus === 'connecting'
                      ? (<><Loader2 size={11} className="animate-spin" /> Connecting…</>)
                      : (<><AlertCircle size={11} style={{ color: THEME.sideErr }} /> Sync issue</>)}
            </div>
            <div className="text-xs mt-1" style={{ color: THEME.sideInkSoft }}>{Object.keys(orders).length} orders · {expenses.length} expenses</div>
            <div className="text-xs mt-2 px-2 py-1 rounded-md inline-block" style={{ background: 'rgba(255,255,255,0.10)', color: THEME.sideInk, fontWeight: 600 }}>
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
          {view === 'dashboard' && <Dashboard orders={orders} setOrders={setOrders} expenses={expenses} catalog={catalog} setView={setView} privacy={privacy} setPrivacy={setPrivacy} currentUser={currentUser} theme={theme} setTheme={setTheme} />}
          {view === 'new' && <NewOrder catalog={catalog} meta={meta} setMeta={setMeta} orders={orders} setOrders={setOrders} customers={customers} setCustomers={setCustomers} onSaved={() => setView('orders')} />}
          {view === 'requests' && <OrderRequests catalog={catalog} orders={orders} setOrders={setOrders} meta={meta} setMeta={setMeta} customers={customers} setCustomers={setCustomers} />}
          {view === 'orders' && <Orders orders={orders} setOrders={setOrders} productByName={productByName} catalog={catalog} meta={meta} setMeta={setMeta} customers={customers} setCustomers={setCustomers}
            onNewOrder={() => go('new')} sync={{ saving, syncStatus }} registerNavGuard={registerNavGuard} />}
          {view === 'pickup' && <Pickup orders={orders} catalog={catalog} />}
          {view === 'salescheck' && <SalesCheck orders={orders} catalog={catalog} privacy={privacy} />}
          {view === 'expenses' && <Expenses expenses={expenses} setExpenses={setExpenses} setMeta={setMeta} />}
          {view === 'products' && <Products catalog={catalog} setCatalog={setCatalog} priceHistory={priceHistory} setPriceHistory={setPriceHistory}
            sync={{ saving, syncStatus }} registerNavGuard={registerNavGuard} />}
          {view === 'restaurantquote' && <RestaurantQuote catalog={catalog} setCatalog={setCatalog} qtys={quoteQtys} setQtys={setQuoteQtys} />}
          {view === 'profitcheck' && <QuoteProfitCheck catalog={catalog} privacy={privacy} qtys={quoteQtys} setQtys={setQuoteQtys} />}
          {view === 'supplierprices' && <SupplierPrices priceHistory={priceHistory} setPriceHistory={setPriceHistory} catalog={catalog} setCatalog={setCatalog} privacy={privacy} />}
          {view === 'supplierpayments' && <SupplierPayments payments={supplierPayments} setPayments={setSupplierPayments} privacy={privacy} />}
          {view === 'monthlyreport' && <MonthlyReport orders={orders} expenses={expenses} catalog={catalog} privacy={privacy} />}
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
   CUSTOMER DIRECTORY HELPERS (internal/admin only)
   ============================================================
   Saved customers live in the same synced data blob as orders. We
   match an order to a saved customer by phone first, then by exact
   name, then by similar name — never by name alone silently, because
   names get duplicated and mistyped. Internal notes here are admin-
   only and are never written onto orders or customer-facing copies. */
const cNormName = (s) => (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
const cDigits = (s) => (s || '').replace(/[^\d]/g, '');
const makeCustomerId = () => 'cust_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/* ============================================================
   AREAS — colored location tags (e.g. "The Bellecourt")
   ============================================================
   Stored in meta.areas = [{ id, name, color, keywords, updated_at }].
   Orders carry area_id; saved customers carry area_id too, so a
   customer only has to be tagged once. Deleted areas are tombstoned
   in meta.deletedAreas so multi-device merging can't resurrect them. */
const AREA_COLORS = [
  { id: 'red',    light: { bg: '#FBE4E2', ink: '#9F2F2D', dot: '#D9534F' }, dark: { bg: '#4A2624', ink: '#F4ADA8', dot: '#E5736D' } },
  { id: 'orange', light: { bg: '#FCEBDD', ink: '#9A4A12', dot: '#E08A3C' }, dark: { bg: '#4A3220', ink: '#F5C08E', dot: '#E89A55' } },
  { id: 'yellow', light: { bg: '#FBF1C9', ink: '#7A5B0C', dot: '#D4A82A' }, dark: { bg: '#463D1C', ink: '#EAD48A', dot: '#D9B840' } },
  { id: 'green',  light: { bg: '#E3F0DF', ink: '#2F6630', dot: '#5A9A55' }, dark: { bg: '#25381F', ink: '#A9D49C', dot: '#74B067' } },
  { id: 'teal',   light: { bg: '#DCEFEC', ink: '#1E615C', dot: '#3E9A92' }, dark: { bg: '#1F3836', ink: '#93D1CA', dot: '#55B0A7' } },
  { id: 'blue',   light: { bg: '#DFEAF7', ink: '#2B5584', dot: '#4F84C4' }, dark: { bg: '#22324A', ink: '#A6C4EC', dot: '#6A9BDA' } },
  { id: 'purple', light: { bg: '#ECE3F5', ink: '#5C3D86', dot: '#8E6BC2' }, dark: { bg: '#352A48', ink: '#C9B3EB', dot: '#A285D6' } },
  { id: 'pink',   light: { bg: '#F8E1EC', ink: '#8C2F5E', dot: '#CF5F96' }, dark: { bg: '#462638', ink: '#F0AECF', dot: '#DB78A8' } },
  { id: 'gray',   light: { bg: '#ECE8E3', ink: '#55504A', dot: '#8F877E' }, dark: { bg: '#353029', ink: '#CFC6BB', dot: '#A39A8E' } },
];
const areaTone = (colorId) => {
  const c = AREA_COLORS.find((x) => x.id === colorId) || AREA_COLORS[AREA_COLORS.length - 1];
  return THEME.bg === THEME_DARK.bg ? c.dark : c.light;
};
const makeAreaId = () => 'area_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const newAreaRecord = (list, name) => ({
  id: makeAreaId(),
  name: name.trim(),
  // Next unused color, so neighbouring areas never share one by accident.
  color: (AREA_COLORS.find((c) => !(list || []).some((a) => a.color === c.id)) || AREA_COLORS[(list || []).length % AREA_COLORS.length]).id,
  keywords: '',
  updated_at: new Date().toISOString(),
});
// Words that identify an area inside an address: its name (with and without a
// leading "The"), plus any comma-separated "also matches" keywords.
const areaTerms = (a) => {
  const name = (a.name || '').trim().toLowerCase();
  return [name, name.replace(/^the\s+/, ''), ...String(a.keywords || '').split(',').map((s) => s.trim().toLowerCase())]
    .filter((s, i, arr) => s.length >= 3 && arr.indexOf(s) === i);
};
// The one area whose name/keywords appear in an address. Ambiguous → null.
function detectArea(areas, address) {
  const addr = (address || '').toLowerCase();
  if (!addr) return null;
  const hits = (areas || []).filter((a) => areaTerms(a).some((t) => addr.includes(t)));
  return hits.length === 1 ? hits[0].id : null;
}
// Is this order from the given person? Phone (7+ digits) first, then exact name.
const sameCustomer = (o, name, phone) => {
  const d = cDigits(phone);
  if (d.length >= 7 && cDigits(o.phone) === d) return true;
  const n = cNormName(name);
  return !!n && cNormName(o.customer) === n;
};

// Live last-order date + order count for a saved customer, read from orders.
function customerStats(orders, c) {
  const cd = cDigits(c.phone);
  const cn = cNormName(c.name);
  let count = 0, last = '';
  Object.values(orders || {}).forEach((o) => {
    if (o.delivery_status === 'Cancelled') return;
    const match = (cd && cDigits(o.phone) === cd) || (cn && cNormName(o.customer) === cn);
    if (match) { count += 1; if ((o.date || '') > last) last = o.date || ''; }
  });
  return { count, last };
}

// Best single match for an order's {name, phone}: phone → exact name → none.
function findCustomerMatch(customers, name, phone) {
  const list = Object.values(customers || {});
  const d = cDigits(phone);
  if (d) { const byPhone = list.find((c) => cDigits(c.phone) && cDigits(c.phone) === d); if (byPhone) return byPhone; }
  const n = cNormName(name);
  if (n) { const exact = list.find((c) => cNormName(c.name) === n); if (exact) return exact; }
  return null;
}

// Ranked suggestions for a typed query (name text or phone digits).
function searchSavedCustomers(customers, query) {
  const q = (query || '').trim();
  if (!q) return [];
  const d = cDigits(q);
  const n = cNormName(q);
  return Object.values(customers || {})
    .map((c) => {
      let score = 0;
      if (d && d.length >= 3 && cDigits(c.phone).includes(d)) score = 4;        // contact match
      else if (n && cNormName(c.name) === n) score = 3;                          // exact name
      else if (n && cNormName(c.name).includes(n)) score = 2;                    // similar (substring)
      else if (n) {
        const toks = n.split(' ').filter((t) => t.length >= 2);
        if (toks.some((t) => cNormName(c.name).includes(t))) score = 1;          // token overlap
      }
      return { c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((x) => x.c);
}

/* ============================================================
   ORDER DETAILS NORMALIZER (audience-aware display)
   ============================================================
   New orders carry structured fields (source, online_ref, address,
   preferred_date/time, customer_note, internal_notes). Older orders
   only have one combined `notes` string, so we parse those back out
   here. This single source of truth decides what each surface shows:
   admin sees everything, supplier sees prep only, the customer sees a
   clean delivery block — without ever changing totals/cost/profit. */
function orderDetails(o) {
  const note = o.notes || '';
  const grab = (re) => { const m = note.match(re); return m ? m[1].trim() : ''; };
  const isOnline = o.source === 'online' || /^\s*online order/i.test(note);
  const phone = (o.phone || '').trim();
  const address = o.delivery_address || grab(/Address:\s*([^·]+)/i);
  const preferredDate = o.preferred_date || grab(/Preferred delivery:\s*([^·]+)/i);
  const preferredTime = o.preferred_time || grab(/Preferred time:\s*([^·]+)/i);
  const paymentMethod = o.payment_method || grab(/Payment:\s*([^·]+)/i);
  const onlineRef = o.online_ref || grab(/Ref:\s*([^·]+)/i);
  const contactMethod = o.contact_method || (/messenger/i.test(phone) ? 'Messenger' : (phone ? 'SMS / Call' : ''));

  // Customer note: explicit field wins. Legacy fallback only treats the free
  // leftover of an ONLINE note as a customer note; legacy manual notes are
  // kept internal so they can never leak onto the invoice.
  let customerNote;
  if (o.customer_note !== undefined && o.customer_note !== null) {
    customerNote = (o.customer_note || '').trim();
  } else if (isOnline) {
    customerNote = note
      .replace(/^\s*online order\.?\s*/i, '')
      .split('·').map(s => s.trim())
      .filter(s => s && !/^Address:/i.test(s) && !/^Preferred delivery:/i.test(s)
        && !/^Payment:/i.test(s) && !/^Reach via/i.test(s) && !/^Preferred time:/i.test(s) && !/^Ref:/i.test(s))
      .join(' · ').trim();
  } else {
    customerNote = '';
  }

  // Internal notes: explicit field, else (legacy manual only) the freeform note.
  let internalNotes = (o.internal_notes || '').trim();
  if (!internalNotes && !isOnline && o.customer_note === undefined) {
    internalNotes = note.replace(/^Address:\s*[^·]+·?\s*/i, '').trim();
  }

  return {
    isOnline, source: isOnline ? 'Online Order' : (o.source === 'manual' ? 'Manual' : ''),
    address, preferredDate, preferredTime, paymentMethod, onlineRef, contactMethod, customerNote, internalNotes,
  };
}

/* ============================================================
   DASHBOARD
   ============================================================ */

// One-time ease-out count-up for the hero number. Pure presentation —
// the underlying stats are untouched; this only animates the displayed value.
function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(target);
  const prevRef = useRef(null);
  useEffect(() => {
    const from = prevRef.current === null ? 0 : prevRef.current;
    prevRef.current = target;
    if (!isFinite(target) || from === target) { setVal(target); return; }
    let raf;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function Dashboard({ orders, setOrders, expenses, catalog, setView, privacy, setPrivacy, currentUser, theme, setTheme }) {
  const ordersList = Object.values(orders);
  const [showWeekly, setShowWeekly] = useState(false);
  const [owedSort, setOwedSort] = useState('oldest');   // oldest | highest
  const [showHealthMath, setShowHealthMath] = useState(false);
  const moneyOwedRef = useRef(null);
  const productByName = useMemo(() => Object.fromEntries((catalog || []).map(p => [p.name, p])), [catalog]);

  // Shorten a long product name for compact chart labels: drop anything after
  // a "/" or "(", then keep at most the first two words. Full name stays in the
  // tooltip. e.g. "Chicken Breast Fillet" -> "Chicken Breast".
  const shortLabel = (name) => {
    let s = (name || '').split('/')[0].split('(')[0].trim();
    const words = s.split(/\s+/);
    if (words.length > 2) s = words.slice(0, 2).join(' ');
    return s;
  };

  // Mark an unpaid/partial order as fully paid, straight from the dashboard.
  const markPaid = (id) => {
    setOrders((prev) => prev[id] ? { ...prev, [id]: { ...prev[id], payment_status: 'Paid', amount_paid: '', updated_at: new Date().toISOString() } } : prev);
  };

  // tel:/sms: link only when the contact is an actual phone number (not a
  // "Messenger: name" handle, which can't be linked reliably).
  const phoneDigits = (phone) => {
    const p = (phone || '').trim();
    if (!p || /messenger/i.test(p)) return '';
    const digits = p.replace(/[^\d+]/g, '');
    return digits.length >= 7 ? digits : '';
  };

  // Privacy-aware money formatter
  const m = (n) => privacy ? '₱•••••' : peso(n);

  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const todayKey = now.toISOString().slice(0, 10);

  // Always use the CURRENT supplier cost from the catalog so profit reflects
  // what you actually pay today. Falls back to the order's snapshot cost only
  // if the product is no longer in the catalog.
  const effectiveCost = (order, it) => {
    const p = productByName[it.product];
    if (p && p.cost !== undefined && p.cost !== null && p.cost !== '') return Number(p.cost) || 0;
    return Number(it.cost) || 0;
  };

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
      const oCost = (o.items || []).reduce((s, i) => s + i.qty * effectiveCost(o, i), 0);
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
      if (!['Delivered', 'Cancelled'].includes(o.delivery_status || 'Pending')) {
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
      .map(([name, v]) => ({ name, value: Math.round(v) }))
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
      if (['Delivered', 'Cancelled'].includes(o.delivery_status || 'Pending')) return;
      const b = o.delivery_batch;
      if (!b || b < todayIso) return;
      if (!upcomingByBatch[b]) upcomingByBatch[b] = { batch: b, orders: [], total: 0 };
      const oSales = (o.items || []).reduce((s, i) => s + i.qty * i.price, 0);
      const oOutstanding = o.payment_status === 'Unpaid' ? oSales
        : o.payment_status === 'Partial' ? Math.max(0, oSales - (Number(o.amount_paid) || 0))
        : 0;
      upcomingByBatch[b].orders.push({ customer: o.customer, total: Math.round(oSales), id: o.id, status: o.payment_status || 'Unpaid', outstanding: Math.round(oOutstanding) });
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
  }, [orders, expenses, thisMonthKey, todayKey, productByName]);

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
      const oCost = (o.items || []).reduce((s, i) => s + i.qty * effectiveCost(o, i), 0);
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
  }, [orders, productByName]);

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

  const unpaidOrders = useMemo(() => {
    const list = ordersList
      .filter(o => (o.payment_status === 'Unpaid' || o.payment_status === 'Partial') && o.delivery_status !== 'Cancelled')
      .map((o) => {
        const total = (o.items || []).reduce((s, i) => s + i.qty * i.price, 0);
        const outstanding = o.payment_status === 'Partial' ? Math.max(0, total - (Number(o.amount_paid) || 0)) : total;
        return { ...o, _total: total, _outstanding: outstanding };
      });
    list.sort((a, b) => owedSort === 'highest'
      ? b._outstanding - a._outstanding
      : (a.date || '').localeCompare(b.date || '') || (a.id || '').localeCompare(b.id || '')); // oldest first
    return list;
  }, [orders, owedSort]);
  const unpaidShown = unpaidOrders.slice(0, 6);

  const monthName = now.toLocaleString('en-PH', { month: 'long' });
  // Animated hero number (presentation only — privacy mode bypasses it).
  const heroProfit = useCountUp(stats.monthProfit || 0);

  return (
    <div>
      {/* ===== Clean header: logo + title + privacy toggle ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 no-print mn-rise">
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

      {/* ===== Hero: This month's profit ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3 mn-rise">
        <Card className="lg:col-span-2 p-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${THEME.brand} 0%, ${THEME.brandSoft} 100%)`, border: 'none' }}>
          <div className="relative z-10">
            <div className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.75)' }}>{monthName} Profit</div>
            <div className="font-display text-5xl mt-2 text-white">{privacy ? m(stats.monthProfit) : peso(Math.round(heroProfit))}</div>
            <div className="flex gap-6 mt-4">
              <div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Sales this month</div>
                <div className="text-lg font-medium text-white">{m(stats.monthSales)}</div>
              </div>
              <div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Still unpaid</div>
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
            {stats.monthUnpaid > 0 ? `${m(stats.monthUnpaid)} still unpaid this month` : 'Everything collected — nice'}
          </div>
          <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: THEME.line }}>
            <div className="h-full rounded-full" style={{ width: `${stats.collectionRate}%`, background: stats.collectionRate >= 80 ? THEME.green : stats.collectionRate >= 60 ? THEME.amber : THEME.red }} />
          </div>
          {stats.unpaid > 0 && (
            <button onClick={() => moneyOwedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="text-xs font-medium mt-3 inline-flex items-center gap-1" style={{ color: THEME.brand }}>
              View unpaid orders <ChevronRight size={13} />
            </button>
          )}
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

      {/* ===== Currently collecting (for next production day) ===== */}
      {(() => {
        // Amber = act soon: there are pending orders AND the next batch is today/tomorrow.
        // Otherwise stay calm — a standing amber strip stops meaning anything.
        const daysToBatch = stats.nextBatch ? Math.ceil((new Date(stats.nextBatch.batch) - new Date(today())) / 86400000) : null;
        const urgent = stats.pendingOrders > 0 && daysToBatch !== null && daysToBatch <= 1;
        return (
      <Card className="px-5 py-4 mb-3 mn-rise rise-1" style={{ background: urgent ? THEME.warnBg : THEME.card, border: `1px solid ${urgent ? THEME.amber : THEME.line}` }}>
        <div className="flex items-center justify-between flex-wrap gap-y-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: stats.pendingOrders > 0 ? THEME.amber : THEME.line }}>
              <ListOrdered size={17} style={{ color: stats.pendingOrders > 0 ? 'white' : THEME.inkSoft }} />
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: THEME.ink }}>
                {stats.pendingOrders > 0
                  ? `${stats.pendingOrders} order${stats.pendingOrders !== 1 ? 's' : ''} collecting for next production${urgent ? ' — delivery is close' : ''}`
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
        );
      })()}

      {/* ===== Key metrics row ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3 mn-rise rise-1">
        <Card className="p-4 mn-lift">
          <div className="text-xs mb-1" style={{ color: THEME.inkSoft }}>Orders · {monthName}</div>
          <div className="font-display text-2xl" style={{ color: THEME.ink }}>{stats.monthOrderCount}</div>
          <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>this month</div>
        </Card>
        <Card className="p-4 mn-lift">
          <div className="text-xs mb-1" style={{ color: THEME.inkSoft }}>Repeat customers</div>
          <div className="font-display text-2xl" style={{ color: stats.repeatRate >= 50 ? THEME.green : THEME.ink }}>{stats.repeatRate}%</div>
          <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>{stats.repeatCustomers} of {stats.monthCustomers} ordered 2+</div>
        </Card>
        <Card className="p-4 mn-lift">
          <div className="text-xs mb-1" style={{ color: THEME.inkSoft }}>Avg order value</div>
          <div className="font-display text-2xl" style={{ color: THEME.ink }}>{m(stats.avgOrderValue)}</div>
          <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>this month</div>
        </Card>
        <Card className="p-4 mn-lift">
          <div className="text-xs mb-1" style={{ color: THEME.inkSoft }}>B2B revenue</div>
          <div className="font-display text-2xl" style={{ color: THEME.brand }}>{m(stats.b2bRevenue)}</div>
          <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>{stats.b2bOrders} wholesale order{stats.b2bOrders !== 1 ? 's' : ''}</div>
        </Card>
      </div>

      {/* ===== Live metric chips ===== */}
      {(() => {
        // Only metrics NOT already shown in the hero zone above — the ticker is
        // a pulse of secondary stats, not a duplicate of the headline numbers.
        const tick = [];
        if (stats.nextBatch) {
          tick.push({ label: 'Next batch', value: batchLabel(stats.nextBatch.batch), cls: 'gold' });
          tick.push({ label: 'Projected', value: m(stats.nextBatch.total), cls: 'green' });
        }
        if (stats.topProducts && stats.topProducts.length > 0) tick.push({ label: 'Top product', value: shortLabel(stats.topProducts[0].name), cls: '' });
        if (stats.b2bRevenue > 0) tick.push({ label: 'B2B', value: m(stats.b2bRevenue), cls: '' });
        if (stats.repeatRate > 0) tick.push({ label: 'Repeat', value: `${stats.repeatRate}%`, cls: 'green' });
        if (stats.avgOrderValue > 0) tick.push({ label: 'Avg order', value: m(stats.avgOrderValue), cls: '' });
        if (tick.length === 0) return null;

        const clsColor = (c) => c === 'green' ? THEME.green : c === 'red' ? THEME.red : c === 'gold' ? THEME.accent : THEME.ink;
        return (
          <div className="mb-8 rounded-lg overflow-hidden flex items-stretch mn-rise rise-2"
            style={{ background: THEME.brandBg, border: `1px solid ${THEME.line}` }}>
            <div className="flex items-center px-2.5 flex-shrink-0" style={{ background: THEME.brand, color: '#fff' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', marginRight: 5 }} className="mn-live-dot" />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em' }}>LIVE</span>
            </div>
            <div className="overflow-hidden flex items-center" style={{ flex: 1, minWidth: 0 }}>
              <div className="mn-ticker-track inline-flex items-center gap-2 py-2 pl-2">
                {[...tick, ...tick].map((it, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: THEME.card, border: `1px solid ${THEME.line}` }}>
                    <span style={{ fontSize: 11.5, color: THEME.inkSoft, whiteSpace: 'nowrap' }}>{it.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: clsColor(it.cls), whiteSpace: 'nowrap' }}>{it.value}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== Next batch preview ===== */}
      {stats.nextBatch && (
        <Card className="p-5 mb-4 mn-lift">
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
              <div key={o.id} className="flex items-center justify-between py-1.5 text-sm gap-2" style={{ borderTop: `1px solid ${THEME.line}` }}>
                <span className="min-w-0 truncate">{o.customer}</span>
                <span className="flex items-center gap-2 flex-shrink-0">
                  <span style={{ color: THEME.inkSoft }}>{m(o.total)}</span>
                  <Badge color={statusColor(o.status)}>{o.status}</Badge>
                </span>
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
      <div className="grid grid-cols-1 gap-4 mb-8 mn-rise rise-2">
        <Card className="p-5 mn-lift">
          <div className="flex items-center justify-between mb-1">
            <div className="font-display text-lg">Delivery Batch Performance</div>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 mn-rise rise-3">
        <div ref={moneyOwedRef} className="min-w-0">
        <Card className="p-5 mn-lift">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div>
              <div className="font-display text-lg">Money Owed to You</div>
              <div className="text-xs" style={{ color: THEME.inkSoft }}>Unpaid &amp; partial orders</div>
            </div>
            {stats.unpaid > 0 && <Badge color="red">{m(stats.unpaid)}</Badge>}
          </div>
          {unpaidOrders.length > 1 && (
            <div className="flex gap-1.5 mb-3">
              {[{ id: 'oldest', label: 'Oldest unpaid' }, { id: 'highest', label: 'Highest amount' }].map((opt) => {
                const on = owedSort === opt.id;
                return (
                  <button key={opt.id} onClick={() => setOwedSort(opt.id)}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{ background: on ? THEME.brand : 'transparent', color: on ? 'white' : THEME.inkSoft, border: `1px solid ${on ? THEME.brand : THEME.line}` }}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
          {unpaidOrders.length === 0 ? (
            <div className="py-8 text-center text-sm" style={{ color: THEME.green }}>
              <Check size={20} className="mx-auto mb-2" /> All orders are paid. Nice.
            </div>
          ) : (
            <div className="space-y-1.5">
              {unpaidShown.map((o) => {
                const tel = phoneDigits(o.phone);
                return (
                  <div key={o.id} className="flex items-center gap-3 py-2.5 px-2.5 rounded-lg" style={{ background: THEME.bg }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: THEME.brandBg }}>
                      <Wallet size={16} style={{ color: THEME.brand }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{o.customer}</div>
                      <div className="text-xs" style={{ color: THEME.inkSoft }}>
                        {fmtDateShort(o.date)} · {o.id} · <span style={{ color: THEME.red, fontWeight: 600 }}>{m(o._outstanding)}</span> {o.payment_status === 'Partial' ? 'left' : 'unpaid'}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <button onClick={() => setView('orders')} className="text-xs" style={{ color: THEME.inkSoft }}>View Order</button>
                        {tel && <a href={`sms:${tel}`} className="text-xs" style={{ color: THEME.inkSoft }}>Message</a>}
                      </div>
                    </div>
                    <button onClick={() => markPaid(o.id)}
                      className="text-xs font-semibold px-3 py-2 rounded-lg flex-shrink-0 transition-colors"
                      style={{ color: THEME.green, border: `1px solid ${THEME.line}`, background: THEME.card }}>
                      Mark Paid
                    </button>
                  </div>
                );
              })}
              {unpaidOrders.length > unpaidShown.length && (
                <button onClick={() => setView('orders')} className="text-xs font-medium pt-1" style={{ color: THEME.brand }}>
                  + {unpaidOrders.length - unpaidShown.length} more unpaid → view in Orders
                </button>
              )}
            </div>
          )}
        </Card>
        </div>

        <Card className="p-5 mn-lift">
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
                <YAxis dataKey="name" type="category" width={96} axisLine={false} tickLine={false}
                  tick={({ x, y, payload }) => (
                    <text x={x} y={y} dy={3} textAnchor="end" fill={THEME.ink} fontSize={11}>{shortLabel(payload.value)}</text>
                  )} />
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
        <button onClick={() => setShowHealthMath((s) => !s)}
          className="flex items-center gap-1 text-xs font-medium mt-3" style={{ color: THEME.brand }}>
          {showHealthMath ? <ChevronUp size={13} /> : <ChevronDown size={13} />} How this is calculated
        </button>
        {showHealthMath && (
          <div className="text-xs mt-2 leading-relaxed" style={{ color: THEME.inkSoft }}>
            Recovery = all-time profit ÷ all-time expenses ({m(stats.grossProfit)} ÷ {m(stats.totalExpenses)}). Net position = all-time profit − all-time expenses. You're self-sustaining once your profit has covered every expense you've logged — after that, the business funds itself.
          </div>
        )}
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
   ONLINE ORDER REQUESTS (from the customer ordering app)
   ============================================================ */
/* ============================================================
   ONLINE ORDERS (incoming requests from the customer app)
   ============================================================
   Card-based review board: compact summary cards by default, a full
   receipt-style modal on "View Receipt". The customer app packs
   delivery date / payment / preferred time into a single note string,
   and the contact into `phone` (a number or "Messenger: <name>"), so
   we parse those back out for labeled rows — without inventing any
   value we can't find — and keep the raw note in the receipt. */

// Pull the labeled bits back out of the packed note + phone field.
function parseRequestMeta(req) {
  const note = req.note || '';
  const grab = (re) => { const m = note.match(re); return m ? m[1].trim() : ''; };
  const deliveryDate = (req.delivery_date || grab(/Preferred delivery:\s*([^·]+)/i) || '').trim();
  const payment = (req.payment_method || grab(/Payment:\s*([^·]+)/i) || '').trim();
  const preferredTime = grab(/Preferred time:\s*([^·]+)/i);
  const phone = (req.phone || '').trim();
  const isMessenger = /messenger/i.test(phone);
  const contactMethod = isMessenger ? 'Messenger' : (phone ? 'SMS / Call' : '');
  const contactDetail = phone.replace(/^messenger:\s*/i, '').trim();
  const freeNote = note
    .split('·').map((s) => s.trim())
    .filter((s) => s
      && !/^Preferred delivery:/i.test(s)
      && !/^Payment:/i.test(s)
      && !/^Reach via/i.test(s)
      && !/^Preferred time:/i.test(s))
    .join(' · ').trim();
  return { deliveryDate, payment, preferredTime, contactMethod, contactDetail, freeNote, rawNote: note };
}

const reqStatusInfo = (status) => {
  if (status === 'pending') return { label: 'New', color: 'amber' };
  if (status === 'accepted') return { label: 'Accepted', color: 'brand' };
  if (status === 'delivered') return { label: 'Delivered', color: 'green' };
  if (status === 'declined') return { label: 'Declined', color: 'red' };
  return { label: status || 'New', color: 'gray' };
};

const reqRef = (req) => req.reference || req.order_ref || req.ref || '';
const submittedAt = (req) => {
  if (!req.created_at) return '';
  const d = new Date(req.created_at);
  return `${d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} · ${d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}`;
};

function OrderRequests({ catalog, orders, setOrders, meta, setMeta, customers, setCustomers }) {
  const productByName = useMemo(() => Object.fromEntries(catalog.map(p => [p.name, p])), [catalog]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [notSetUp, setNotSetUp] = useState(false);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('new');     // new | accepted | declined
  const [sort, setSort] = useState('newest');        // newest | delivery | total
  const [viewing, setViewing] = useState(null);      // req shown in receipt modal
  const [declineTarget, setDeclineTarget] = useState(null);
  const [declineReason, setDeclineReason] = useState('');

  const load = async () => {
    setLoading(true); setErr(''); setNotSetUp(false);
    try {
      const data = await fetchOrderRequests();
      setRequests(data);
    } catch (e) {
      const msg = (e && (e.message || e.details || e.hint || '')) + '' + (e && e.code ? ' ' + e.code : '');
      const missing = /does not exist|not found|relation|PGRST(205|202|116)|404/i.test(msg);
      if (missing) setNotSetUp(true);
      else setErr('Could not load online orders. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const counts = useMemo(() => ({
    new: requests.filter(r => r.status === 'pending').length,
    accepted: requests.filter(r => r.status === 'accepted' || r.status === 'delivered').length,
    declined: requests.filter(r => r.status === 'declined').length,
  }), [requests]);

  const visible = useMemo(() => {
    let list = requests.filter((r) => {
      if (filter === 'new') return r.status === 'pending';
      if (filter === 'accepted') return r.status === 'accepted' || r.status === 'delivered';
      if (filter === 'declined') return r.status === 'declined';
      return true;
    });
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const hay = [r.customer_name, r.phone, r.address, reqRef(r), (r.items || []).map(i => i.product).join(' ')]
          .filter(Boolean).join(' ').toLowerCase();
        return hay.includes(q);
      });
    }
    const dkey = (r) => {
      const meta = parseRequestMeta(r);
      const t = Date.parse(r.delivery_date || meta.deliveryDate);
      return isNaN(t) ? Infinity : t;
    };
    return [...list].sort((a, b) => {
      if (sort === 'total') return (b.total || 0) - (a.total || 0);
      if (sort === 'delivery') return dkey(a) - dkey(b);
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
  }, [requests, filter, search, sort]);

  const accept = async (req) => {
    if (busyId) return;                 // one at a time — protects the order numbering
    setBusyId(req.id); setErr('');
    try {
      const newNum = (meta.lastOrderNum || 0) + 1;
      const id = 'ORD-' + String(newNum).padStart(3, '0');
      const snapshotItems = (req.items || []).map((it) => {
        const p = productByName[it.product];
        return {
          product: it.product, qty: Number(it.qty),
          price: p ? p.price : (Number(it.price) || 0),
          cost: p ? p.cost : 0,
          unit: p ? p.unit : (it.unit || 'kg'),
          note: (it.note || '').trim(), wholesale: false,
        };
      });
      const pm = parseRequestMeta(req);
      const isMsgr = /messenger/i.test(req.phone || '');
      const payMethod = pm.payment
        ? (/gcash/i.test(pm.payment) ? 'Gcash' : /cash/i.test(pm.payment) ? 'Cash' : 'Gcash')
        : 'Gcash';
      // Honor the customer's requested delivery day. Fall back to the next
      // scheduled batch only if their preferred date can't be parsed.
      const requestedBatch = parsePreferredBatch(pm.deliveryDate) || suggestedBatch();
      // Area: the saved customer's area wins; otherwise detect it from the address.
      const savedCust = findCustomerMatch(customers, req.customer_name, req.phone);
      const reqAreas = (meta && meta.areas) || [];
      const areaIdForOrder = (savedCust && reqAreas.some((a) => a.id === savedCust.area_id) ? savedCust.area_id : '') || detectArea(reqAreas, req.address) || '';
      const order = {
        id, date: today(),
        customer: req.customer_name, phone: req.phone,
        payment_status: 'Unpaid', payment_method: payMethod,
        amount_paid: '',
        delivery_status: 'Pending', delivery_batch: requestedBatch,
        // Structured fields — each surface picks what it needs (see orderDetails).
        source: 'online',
        online_ref: reqRef(req) || '',
        contact_method: isMsgr ? 'Messenger' : 'SMS / Call',
        delivery_address: req.address || '',
        area_id: areaIdForOrder,
        preferred_date: pm.deliveryDate || '',
        preferred_time: pm.preferredTime || '',
        customer_note: pm.freeNote || '',
        internal_notes: '',
        notes: '',
        items: snapshotItems, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      setOrders({ ...orders, [id]: order });
      setMeta({ ...meta, lastOrderNum: newNum });
      // Save / refresh the internal customer record from this online order.
      // Online orders carry a real address, so they're a good source — newest
      // address wins, but we never overwrite existing internal notes.
      if (setCustomers && req.customer_name) {
        const match = findCustomerMatch(customers, req.customer_name, req.phone);
        if (!match) {
          const cid = makeCustomerId();
          const isMsgr = /messenger/i.test(req.phone || '');
          setCustomers((prev) => ({ ...prev, [cid]: {
            id: cid, name: req.customer_name,
            phone: isMsgr ? '' : (req.phone || ''),
            messenger: isMsgr ? (req.phone || '').replace(/^messenger:\s*/i, '') : '',
            address: req.address || '', payment: '', notes: '', area_id: areaIdForOrder,
            updated_at: new Date().toISOString(),
          } }));
        } else if (req.address && req.address !== (match.address || '')) {
          setCustomers((prev) => ({ ...prev, [match.id]: { ...prev[match.id], address: req.address } }));
        }
      }
      await updateOrderRequestStatus(req.id, 'accepted');
      setRequests((prev) => prev.map(r => r.id === req.id ? { ...r, status: 'accepted' } : r));
      setViewing(null);
    } catch (e) {
      setErr('Could not accept this order. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const confirmDecline = async () => {
    const req = declineTarget;
    if (!req) return;
    setBusyId(req.id); setErr('');
    try {
      await updateOrderRequestStatus(req.id, 'declined');
      setRequests((prev) => prev.map(r => r.id === req.id ? { ...r, status: 'declined', decline_reason: declineReason.trim() } : r));
      setDeclineTarget(null); setDeclineReason(''); setViewing(null);
    } catch (e) {
      setErr('Could not decline. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const removeReq = async (req) => {
    if (!confirm('Remove this from the list? This only clears it here — the order in your Orders tab stays.')) return;
    setBusyId(req.id);
    try {
      await deleteOrderRequest(req.id);
      setRequests((prev) => prev.filter(r => r.id !== req.id));
      setViewing(null);
    } catch (e) {
      setErr('Could not remove. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const openDecline = (req) => { setDeclineTarget(req); setDeclineReason(''); };

  const filterChips = [
    { id: 'new', label: 'New', n: counts.new },
    { id: 'accepted', label: 'Accepted', n: counts.accepted },
    { id: 'declined', label: 'Declined', n: counts.declined },
  ];

  return (
    <div>
      <Header title="Online Orders" subtitle="Requests from your customer ordering app — review and accept to create an order." />

      {err && <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: THEME.errorBg, color: THEME.red }}>{err}</div>}

      {notSetUp ? (
        <Card className="p-8 text-center">
          <Inbox size={32} style={{ color: THEME.brand, margin: '0 auto 12px' }} />
          <div className="font-display text-lg mb-2">Online ordering isn't set up yet</div>
          <div className="text-sm mb-1" style={{ color: THEME.inkSoft, maxWidth: 420, margin: '0 auto' }}>
            This is where customer orders from your online ordering app will appear. To turn it on, set up the customer app and its database table.
          </div>
          <div className="text-sm" style={{ color: THEME.inkSoft, maxWidth: 420, margin: '8px auto 0' }}>
            Until then, everything else works normally — this tab just waits quietly.
          </div>
        </Card>
      ) : (
        <>
          {/* ===== Top controls ===== */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
            <div className="relative flex-1 min-w-0">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: THEME.inkSoft }} />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, contact, address, product…" className="pl-9" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-44">
                <Select value={sort} onChange={(e) => setSort(e.target.value)}
                  options={[{ value: 'newest', label: 'Newest first' }, { value: 'delivery', label: 'Delivery date' }, { value: 'total', label: 'Highest total' }]} />
              </div>
              <Btn variant="secondary" size="sm" onClick={load} disabled={loading}>
                {loading ? <Loader2 size={14} className="inline animate-spin" /> : <><RefreshCw size={13} className="inline -mt-0.5 mr-1" />Refresh</>}
              </Btn>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {filterChips.map((c) => {
              const on = filter === c.id;
              return (
                <button key={c.id} onClick={() => setFilter(c.id)}
                  className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5"
                  style={{ background: on ? THEME.brand : 'transparent', color: on ? 'white' : THEME.ink, border: `1px solid ${on ? THEME.brand : THEME.line}` }}>
                  {c.label}
                  <span className="text-xs px-1.5 rounded-full" style={{ background: on ? 'rgba(255,255,255,0.22)' : THEME.bg, color: on ? 'white' : THEME.inkSoft }}>{c.n}</span>
                </button>
              );
            })}
          </div>

          {/* ===== Cards ===== */}
          {loading ? (
            <div className="flex items-center gap-2 py-12 justify-center" style={{ color: THEME.inkSoft }}>
              <Loader2 size={18} className="animate-spin" /> Loading…
            </div>
          ) : visible.length === 0 ? (
            <Card className="p-10 text-center">
              <Inbox size={28} style={{ color: THEME.inkSoft, margin: '0 auto 8px' }} />
              <div className="text-sm" style={{ color: THEME.inkSoft }}>
                {search.trim() ? 'No requests match your search.'
                  : filter === 'new' ? 'No new online orders right now.'
                  : filter === 'accepted' ? 'No accepted requests yet.'
                  : 'No declined requests.'}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {visible.map((req) => (
                <RequestSummaryCard key={req.id} req={req} busy={busyId === req.id}
                  onView={() => setViewing(req)}
                  onAccept={() => accept(req)}
                  onDecline={() => openDecline(req)} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== Receipt modal ===== */}
      <RequestReceiptModal req={viewing} busy={viewing && busyId === viewing.id}
        onClose={() => setViewing(null)}
        onAccept={() => viewing && accept(viewing)}
        onDecline={() => viewing && openDecline(viewing)}
        onRemove={() => viewing && removeReq(viewing)} />

      {/* ===== Decline dialog ===== */}
      <Modal open={!!declineTarget} onClose={() => setDeclineTarget(null)} maxWidth="max-w-sm">
        <div className="p-6">
          <div className="font-display text-lg mb-1">Decline this request?</div>
          <div className="text-sm mb-4" style={{ color: THEME.inkSoft }}>
            {declineTarget ? `${declineTarget.customer_name}'s order will move to your Declined list. It won't be deleted.` : ''}
          </div>
          <Label>Reason (optional)</Label>
          <textarea value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} rows={2}
            className="w-full px-3 py-2 rounded-lg outline-none text-sm mb-1"
            style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink, fontFamily: 'DM Sans' }}
            placeholder="e.g. out of stock, outside delivery area" />
          <div className="text-xs mb-4" style={{ color: THEME.inkSoft }}>Saved for this session so you remember why.</div>
          <div className="flex justify-end gap-2">
            <Btn variant="secondary" onClick={() => setDeclineTarget(null)}>Cancel</Btn>
            <Btn variant="danger" onClick={confirmDecline} disabled={declineTarget && busyId === declineTarget.id}>
              {declineTarget && busyId === declineTarget.id ? <Loader2 size={14} className="inline animate-spin" /> : 'Decline Request'}
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Small labeled row used inside the summary cards.
function MetaRow({ label, children }) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="flex-shrink-0 text-xs uppercase tracking-wider" style={{ color: THEME.inkSoft, letterSpacing: '0.05em', minWidth: 64 }}>{label}</span>
      <span className="min-w-0" style={{ color: THEME.ink }}>{children}</span>
    </div>
  );
}

function RequestSummaryCard({ req, busy, onView, onAccept, onDecline }) {
  const meta = parseRequestMeta(req);
  const s = reqStatusInfo(req.status);
  const isNew = req.status === 'pending';
  const items = req.items || [];
  const shown = items.slice(0, 2);
  const moreCount = Math.max(0, items.length - shown.length);
  const ref = reqRef(req);

  return (
    <Card className="p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <Badge color={s.color}>{s.label}</Badge>
          {ref && <div className="font-medium mt-1.5 truncate">{ref}</div>}
        </div>
        <div className="text-xs text-right flex-shrink-0" style={{ color: THEME.inkSoft }}>{submittedAt(req)}</div>
      </div>

      {/* Customer */}
      <div className="space-y-1.5 mb-3 pb-3" style={{ borderBottom: `1px solid ${THEME.line}` }}>
        <div className="font-medium" style={{ color: THEME.ink }}>{req.customer_name}</div>
        {meta.contactDetail && (
          <MetaRow label={meta.contactMethod === 'Messenger' ? 'Messenger' : 'Contact'}>{meta.contactDetail}</MetaRow>
        )}
        {req.address && (
          <div className="flex items-start gap-1.5 text-sm" style={{ color: THEME.inkSoft }}>
            <MapPin size={14} className="mt-0.5 flex-shrink-0" /><span className="min-w-0">{req.address}</span>
          </div>
        )}
      </div>

      {/* Delivery */}
      <div className="space-y-1.5 mb-3 pb-3" style={{ borderBottom: `1px solid ${THEME.line}` }}>
        {meta.deliveryDate && <MetaRow label="Delivery">{meta.deliveryDate}</MetaRow>}
        {meta.preferredTime && <MetaRow label="Time">{meta.preferredTime}</MetaRow>}
        {meta.payment && <MetaRow label="Payment">{meta.payment}</MetaRow>}
        {!meta.deliveryDate && !meta.payment && !meta.preferredTime && (
          <div className="text-xs" style={{ color: THEME.inkSoft }}>Delivery details in receipt</div>
        )}
      </div>

      {/* Items */}
      <div className="space-y-1 mb-2">
        {shown.map((it, i) => (
          <div key={i} className="flex justify-between text-sm gap-2">
            <span className="min-w-0 truncate">{it.product} <span style={{ color: THEME.inkSoft }}>× {it.qty} {it.unit || 'kg'}</span></span>
            <span className="flex-shrink-0" style={{ color: THEME.inkSoft }}>{peso(it.qty * it.price)}</span>
          </div>
        ))}
        {moreCount > 0 && (
          <button onClick={onView} className="text-xs font-medium" style={{ color: THEME.brand }}>+ {moreCount} more item{moreCount !== 1 ? 's' : ''}</button>
        )}
      </div>

      {/* Notes preview */}
      {meta.freeNote && (
        <div className="text-xs mb-3 px-2.5 py-1.5 rounded" style={{ background: THEME.bg, color: THEME.inkSoft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Note: {meta.freeNote}
        </div>
      )}
      {req.status === 'declined' && req.decline_reason && (
        <div className="text-xs mb-3" style={{ color: THEME.red }}>Declined: {req.decline_reason}</div>
      )}

      {/* Total */}
      <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: `1px solid ${THEME.line}` }}>
        <span className="text-xs uppercase tracking-wider" style={{ color: THEME.inkSoft, letterSpacing: '0.06em' }}>Total</span>
        <span className="font-display text-2xl" style={{ color: THEME.brand }}>{peso(req.total)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <Btn variant="secondary" size="sm" onClick={onView} className="flex-shrink-0">
          <Receipt size={14} className="inline -mt-0.5 mr-1" />View Receipt
        </Btn>
        {isNew && (
          <>
            <Btn variant="danger" size="sm" onClick={onDecline} disabled={busy}>Decline</Btn>
            <Btn variant="primary" size="sm" onClick={onAccept} disabled={busy} className="flex-1">
              {busy ? <Loader2 size={14} className="inline animate-spin" /> : <><Check size={14} className="inline -mt-0.5 mr-1" />Accept &amp; Create</>}
            </Btn>
          </>
        )}
      </div>
    </Card>
  );
}

function RequestReceiptModal({ req, busy, onClose, onAccept, onDecline, onRemove }) {
  if (!req) return null;
  const meta = parseRequestMeta(req);
  const s = reqStatusInfo(req.status);
  const isNew = req.status === 'pending';
  const items = req.items || [];
  const ref = reqRef(req);

  const detail = (label, value) => value ? (
    <div className="flex justify-between gap-3 py-1 text-sm">
      <span style={{ color: THEME.inkSoft }}>{label}</span>
      <span className="text-right" style={{ color: THEME.ink }}>{value}</span>
    </div>
  ) : null;

  return (
    <Modal open={!!req} onClose={onClose} maxWidth="max-w-md">
      <div className="flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Receipt body (scrolls) */}
        <div className="overflow-y-auto p-6">
          <div className="text-center mb-4">
            <img src={LOGO_DATA_URL} alt="M&N Meatshop" style={{ height: 52, margin: '0 auto 8px' }} />
            <div className="font-display text-lg leading-tight" style={{ color: THEME.brand }}>M&amp;N Meatshop</div>
            <div className="mt-2 inline-flex"><Badge color={s.color}>Order Request · {s.label}</Badge></div>
            {ref && <div className="text-sm mt-2 font-medium">{ref}</div>}
            {submittedAt(req) && <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>Submitted {submittedAt(req)}</div>}
          </div>

          <div className="rounded-lg p-4 mb-3" style={{ background: THEME.bg }}>
            <div className="text-xs uppercase tracking-wider mb-1.5 font-medium" style={{ color: THEME.inkSoft, letterSpacing: '0.06em' }}>Customer</div>
            <div className="font-medium mb-1">{req.customer_name}</div>
            {detail(meta.contactMethod || 'Contact', meta.contactDetail)}
            {detail('Address', req.address)}
          </div>

          {(meta.deliveryDate || meta.preferredTime || meta.payment) && (
            <div className="rounded-lg p-4 mb-3" style={{ background: THEME.bg }}>
              <div className="text-xs uppercase tracking-wider mb-1.5 font-medium" style={{ color: THEME.inkSoft, letterSpacing: '0.06em' }}>Delivery</div>
              {detail('Delivery date', meta.deliveryDate)}
              {detail('Preferred time', meta.preferredTime)}
              {detail('Payment', meta.payment)}
            </div>
          )}

          <div className="mb-3">
            <div className="text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: THEME.inkSoft, letterSpacing: '0.06em' }}>Items</div>
            {items.map((it, i) => (
              <div key={i} className="py-1.5 flex justify-between gap-3 text-sm" style={{ borderTop: i ? `1px solid ${THEME.line}` : 'none' }}>
                <div className="min-w-0">
                  <div>{it.product} <span style={{ color: THEME.inkSoft }}>× {it.qty} {it.unit || 'kg'}</span></div>
                  {it.note && <div className="text-xs mt-0.5" style={{ color: THEME.brand }}>{it.note}</div>}
                </div>
                <div className="flex-shrink-0 font-medium">{peso(it.qty * it.price)}</div>
              </div>
            ))}
          </div>

          {meta.freeNote && (
            <div className="rounded-lg p-3 mb-3 text-sm" style={{ background: THEME.bg, color: THEME.ink }}>
              <span style={{ color: THEME.inkSoft }}>Note: </span>{meta.freeNote}
            </div>
          )}
          {req.status === 'declined' && req.decline_reason && (
            <div className="text-sm mb-3" style={{ color: THEME.red }}>Declined reason: {req.decline_reason}</div>
          )}

          <div className="flex items-center justify-between pt-3 mt-1" style={{ borderTop: `2px solid ${THEME.brand}` }}>
            <span className="text-sm font-medium">Total</span>
            <span className="font-display text-2xl" style={{ color: THEME.brand }}>{peso(req.total)}</span>
          </div>
        </div>

        {/* Sticky action bar */}
        <div className="flex items-center justify-between gap-2 px-6 py-4" style={{ borderTop: `1px solid ${THEME.line}`, background: THEME.card }}>
          <Btn variant="secondary" onClick={onClose}>Close</Btn>
          {isNew ? (
            <div className="flex gap-2">
              <Btn variant="danger" onClick={onDecline} disabled={busy}>Decline</Btn>
              <Btn variant="primary" onClick={onAccept} disabled={busy}>
                {busy ? <Loader2 size={15} className="inline animate-spin" /> : <><Check size={15} className="inline -mt-0.5 mr-1" />Accept &amp; Create Order</>}
              </Btn>
            </div>
          ) : (
            <button onClick={onRemove} disabled={busy} className="text-xs" style={{ color: THEME.inkSoft }}>Remove from list</button>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ============================================================
   NEW ORDER
   ============================================================ */
function NewOrder({ catalog, meta, setMeta, orders, setOrders, customers, setCustomers, onSaved }) {
  const [date, setDate] = useState(today());
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [pickedFromSaved, setPickedFromSaved] = useState(false);
  // Area: filled from the saved customer, else detected from the address,
  // until the admin picks one by hand (areaTouched).
  const [areaId, setAreaId] = useState('');
  const [areaTouched, setAreaTouched] = useState(false);
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);
  const areas = (meta && meta.areas) || [];
  const areaById = Object.fromEntries(areas.map((a) => [a.id, a]));
  useEffect(() => {
    if (!areaTouched) setAreaId(detectArea(areas, address) || '');
  }, [address, areaTouched, meta && meta.areas]); // eslint-disable-line react-hooks/exhaustive-deps
  const chooseArea = (id) => { setAreaId(id || ''); setAreaTouched(true); setAreaPickerOpen(false); };
  const createAreaHere = (name) => {
    const existing = areas.find((a) => a.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (existing) return existing.id;
    const rec = newAreaRecord(areas, name);
    setMeta((m) => ({ ...m, areas: [...(m.areas || []), rec] }));
    return rec.id;
  };
  const [pendingConflict, setPendingConflict] = useState(null);
  const [showSuggest, setShowSuggest] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('Unpaid');
  const [paymentMethod, setPaymentMethod] = useState('Gcash');
  const [amountPaid, setAmountPaid] = useState('');
  const [justSaved, setJustSaved] = useState(null);
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

  // Suggestions: saved customers first (rich — have address/notes), then any
  // past-order names not already saved. Matching priority lives in
  // searchSavedCustomers (phone → exact name → similar).
  const suggestions = useMemo(() => {
    const q = customer.trim();
    if (!q) return [];
    const saved = searchSavedCustomers(customers, q).map((c) => ({ ...c, _saved: true }));
    const savedKeys = new Set(saved.map((c) => cNormName(c.name)));
    const past = pastCustomers
      .filter((c) => c.name.toLowerCase().includes(q.toLowerCase())
        && !savedKeys.has(cNormName(c.name)) && cNormName(c.name) !== cNormName(q))
      .map((c) => ({ ...c, _saved: false }));
    return [...saved, ...past].slice(0, 6);
  }, [customer, customers, pastCustomers]);

  // Exact saved match for the phone currently typed (phone-first lookup).
  const phoneMatch = useMemo(() => {
    const d = cDigits(phone);
    if (d.length < 7) return null;
    return Object.values(customers).find((c) => cDigits(c.phone) === d) || null;
  }, [phone, customers]);

  const applySavedCustomer = (c) => {
    setCustomer(c.name || '');
    if (c.phone) setPhone(c.phone);
    if (c.address) setAddress(c.address);
    if (c.area_id) { setAreaId(c.area_id); setAreaTouched(true); }
    // Payment is treated fresh every order — never carried over from the saved
    // customer. Each order starts Unpaid with the GCash default.
    setInternalNotes(c.notes || '');
    setPickedFromSaved(true);
    setShowSuggest(false);
  };
  const pickSuggestion = (c) => {
    if (c._saved) { applySavedCustomer(c); return; }
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

  const resetForm = () => {
    setCustomer(''); setPhone(''); setNotes(''); setAddress(''); setInternalNotes(''); setPickedFromSaved(false);
    setAreaId(''); setAreaTouched(false);
    setItems([{ product: '', qty: 1, note: '', wholesale: false }]);
    setPaymentStatus('Unpaid'); setPaymentMethod('Gcash'); setAmountPaid('');
    setDeliveryStatus('Pending'); setWholesaleOrder(false);
    setError(''); setShowSuggest(false);
    // Order Date and Delivery Batch are kept on purpose — a run of manual
    // entries is usually the same date and the same delivery batch.
  };

  // Save / update the internal customer record from the form. Returns a
  // conflict object when an existing customer's saved details differ, so the
  // caller can ask the admin what to do; otherwise creates/leaves silently.
  const upsertCustomer = () => {
    const name = customer.trim();
    if (!name) return null;
    const fields = {
      name, phone: phone.trim(), messenger: '', address: address.trim(),
      notes: internalNotes.trim(),
    };
    const match = findCustomerMatch(customers, name, fields.phone);
    const validArea = areaById[areaId] ? areaId : '';
    if (!match) {
      const id = makeCustomerId();
      setCustomers((prev) => ({ ...prev, [id]: { id, ...fields, area_id: validArea, updated_at: new Date().toISOString() } }));
      return null;
    }
    if (validArea && match.area_id !== validArea) {
      setCustomers((prev) => (prev[match.id] ? { ...prev, [match.id]: { ...prev[match.id], area_id: validArea, updated_at: new Date().toISOString() } } : prev));
    }
    const changed =
      (fields.address && fields.address !== (match.address || '')) ||
      (fields.phone && fields.phone !== (match.phone || '')) ||
      (fields.notes && fields.notes !== (match.notes || ''));
    return changed ? { matchId: match.id, matchName: match.name, fields } : null;
  };

  const resolveConflict = (action) => {
    const pc = pendingConflict;
    if (!pc) return;
    if (action === 'update') {
      setCustomers((prev) => {
        const ex = prev[pc.matchId] || {};
        return { ...prev, [pc.matchId]: {
          ...ex,
          name: pc.fields.name || ex.name,
          phone: pc.fields.phone || ex.phone,
          address: pc.fields.address || ex.address,
          notes: pc.fields.notes || ex.notes,
          updated_at: new Date().toISOString(),
        } };
      });
    } else if (action === 'new') {
      const id = makeCustomerId();
      setCustomers((prev) => ({ ...prev, [id]: { id, ...pc.fields } }));
    }
    // 'keep' → leave saved record untouched
    const then = pc.then;
    setPendingConflict(null);
    if (then) then();
  };

  const buildAndSaveOrder = () => {
    setError('');
    if (!customer.trim()) { setError('Customer name is required'); return null; }
    const cleanItems = items.filter(it => it.product && Number(it.qty) > 0);
    if (cleanItems.length === 0) { setError('Add at least one product with quantity > 0'); return null; }
    const newNum = (meta.lastOrderNum || 0) + 1;
    const id = nextOrderId(meta.lastOrderNum || 0);
    const snapshotItems = cleanItems.map((it) => {
      const p = productByName[it.product];
      const usedPrice = it.wholesale ? rqPricing(p).wholesale : p.price;
      return { product: it.product, qty: Number(it.qty), price: usedPrice, cost: p.cost, unit: p.unit, note: (it.note || '').trim(), wholesale: !!it.wholesale };
    });
    const order = {
      id, date, customer: customer.trim(), phone: phone.trim(),
      payment_status: paymentStatus,
      // Keep the chosen method even when unpaid, so the invoice can show the
      // GCash QR for the customer to pay. Status (Unpaid) tracks payment itself.
      payment_method: paymentMethod,
      // Partial orders remember how much was actually paid (used by Orders,
      // the Dashboard "owed" total, and Batch Money Check's "collected").
      amount_paid: paymentStatus === 'Partial' ? (Number(amountPaid) || 0) : '',
      delivery_status: deliveryStatus,
      delivery_batch: deliveryBatch,
      // Structured fields. customer_note shows on the invoice; internal_notes is
      // admin-only and never reaches a receipt. Address stays admin-only too.
      source: 'manual',
      delivery_address: address.trim(),
      area_id: areaById[areaId] ? areaId : '',
      contact_method: /messenger/i.test(phone) ? 'Messenger' : (phone.trim() ? 'SMS / Call' : ''),
      online_ref: '', preferred_date: '', preferred_time: '',
      customer_note: notes.trim(),
      internal_notes: internalNotes.trim(),
      notes: '',
      items: snapshotItems, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    setOrders({ ...orders, [id]: order });
    setMeta({ ...meta, lastOrderNum: newNum });
    return id;
  };

  const save = () => {
    const id = buildAndSaveOrder();
    if (!id) return;
    const conflict = upsertCustomer();
    if (conflict) setPendingConflict({ ...conflict, then: () => onSaved() });
    else onSaved();
  };
  const saveAndNew = () => {
    const id = buildAndSaveOrder();
    if (!id) return;
    const conflict = upsertCustomer();
    setJustSaved(id);
    resetForm();
    if (conflict) setPendingConflict({ ...conflict, then: null });
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
              <div><Label>Order Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div className="relative">
                <Label>Customer Name</Label>
                <Input
                  value={customer}
                  onChange={(e) => { setCustomer(e.target.value); setShowSuggest(true); setJustSaved(null); setPickedFromSaved(false); }}
                  onFocus={() => setShowSuggest(true)}
                  onBlur={() => setTimeout(() => setShowSuggest(false), 180)}
                  placeholder="Customer name"
                />
                {showSuggest && suggestions.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-1 rounded-md overflow-hidden shadow-lg"
                    style={{ background: THEME.card, border: `1px solid ${THEME.line}` }}>
                    {suggestions.map((c, i) => {
                      const st = c._saved ? customerStats(orders, c) : null;
                      return (
                        <button
                          key={c.id || c.name || i}
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); pickSuggestion(c); }}
                          className="w-full text-left px-3 py-2 text-sm row-hover block"
                          style={{ color: THEME.ink, borderTop: i ? `1px solid ${THEME.line}` : 'none' }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium truncate">{c.name}</span>
                            {c._saved
                              ? <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: THEME.brandBg, color: THEME.brand }}>Saved · Use details</span>
                              : <span className="text-xs flex-shrink-0" style={{ color: THEME.inkSoft }}>{c.count}x</span>}
                          </div>
                          {c._saved && (
                            <div className="text-xs mt-0.5 truncate" style={{ color: THEME.inkSoft }}>
                              {st && st.last ? `Last order ${fmtDateShort(st.last)}` : 'No orders yet'}{c.address ? ` · ${c.address}` : ''}
                            </div>
                          )}
                          {!c._saved && c.phone && (
                            <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>{c.phone}</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div><Label>Phone (optional)</Label><Input value={phone} onChange={(e) => { setPhone(e.target.value); setPickedFromSaved(false); }} placeholder="09XX XXX XXXX" /></div>
            </div>

            {/* Phone-first match — surfaced when the typed number is on file */}
            {phoneMatch && cNormName(phoneMatch.name) !== cNormName(customer) && (
              <button type="button" onClick={() => applySavedCustomer(phoneMatch)}
                className="mt-3 w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between gap-2"
                style={{ background: THEME.brandBg, border: `1px solid ${THEME.line}`, color: THEME.ink }}>
                <span>This number is saved for <span className="font-medium">{phoneMatch.name}</span>{phoneMatch.address ? ` · ${phoneMatch.address}` : ''}</span>
                <span className="text-xs font-medium flex-shrink-0" style={{ color: THEME.brand }}>Use saved details</span>
              </button>
            )}

            {/* Delivery address + admin-only notes (never shown to the customer) */}
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <Label>Delivery Address</Label>
                <Input value={address} onChange={(e) => { setAddress(e.target.value); setPickedFromSaved(false); }} placeholder="House / street / subdivision, barangay" />
                {pickedFromSaved && (
                  <div className="text-xs mt-1.5 flex items-center gap-1" style={{ color: THEME.green }}>
                    <Check size={12} /> Saved from a previous order. You can still edit this address.
                  </div>
                )}
              </div>
              <div>
                <Label>Area</Label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {areas.map((a) => {
                    const on = areaId === a.id;
                    return (
                      <button key={a.id} type="button" onClick={() => chooseArea(on ? '' : a.id)}
                        className="rounded-full p-0.5" style={{ outline: on ? `2px solid ${areaTone(a.color).dot}` : 'none', outlineOffset: 1, opacity: areaId && !on ? 0.55 : 1 }}
                        aria-pressed={on}>
                        <AreaChip area={a} size="md" />
                      </button>
                    );
                  })}
                  <button type="button" onClick={() => setAreaPickerOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm"
                    style={{ border: `1px dashed ${THEME.inkSoft}`, color: THEME.inkSoft }}>
                    <Plus size={12} /> {areas.length ? 'New' : 'Add an area'}
                  </button>
                </div>
                {areaId && !areaTouched && (
                  <div className="text-xs mt-1.5" style={{ color: THEME.inkSoft }}>Detected from the address. Tap another area to change it.</div>
                )}
              </div>
              <div>
                <Label>Internal Delivery Notes</Label>
                <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={2}
                  className="w-full px-3 py-2 rounded-lg outline-none text-sm"
                  style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink, fontFamily: 'DM Sans' }}
                  placeholder="e.g. blue gate near sari-sari store · message before delivery" />
                <div className="text-xs mt-1.5 flex items-center gap-1" style={{ color: THEME.inkSoft }}>
                  <EyeOff size={12} /> Admin only — saved to this customer, never shown on receipts or to the customer.
                </div>
              </div>
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
                  Use wholesale pricing for this order. You can still change individual items below.
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
                      <Label>Cut / Preparation / Notes</Label>
                      <Input value={it.note} onChange={(e) => updateItem(idx, { note: e.target.value })} placeholder="e.g. adobo cut, thin slice, whole" />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <Label>Line Total</Label>
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

              {/* Partial — record how much was actually paid, show the balance. */}
              {paymentStatus === 'Partial' && (
                <div>
                  <Label>Amount Paid</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: THEME.inkSoft }}>₱</span>
                    <Input type="number" step="0.01" min="0" inputMode="decimal" value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)} placeholder="0.00" className="pl-7 tabular-nums" />
                  </div>
                  <div className="text-sm mt-2" style={{ color: THEME.inkSoft }}>
                    Remaining balance: <span className="font-medium" style={{ color: THEME.red }}>{m(Math.max(0, orderTotal - (Number(amountPaid) || 0)))}</span>
                    <span> of {m(orderTotal)}</span>
                  </div>
                </div>
              )}

              {/* Payment method = how they'll pay (drives the GCash QR on the
                  invoice). Valid even when unpaid — status tracks collection. */}
              <div>
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} options={PAYMENT_METHODS} />
                {paymentStatus === 'Unpaid' && (
                  <div className="text-xs mt-1.5" style={{ color: THEME.inkSoft }}>Not collected yet — this is how they'll pay. GCash shows the QR on the invoice.</div>
                )}
              </div>

              <div><Label>Delivery Status</Label><Select value={deliveryStatus} onChange={(e) => setDeliveryStatus(e.target.value)} options={DELIVERY_STATUSES} /></div>
              <div>
                <Label>Customer Note</Label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded-lg outline-none text-sm"
                  style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink, fontFamily: 'DM Sans' }}
                  placeholder="Optional — shows on the customer's order summary" />
                <div className="text-xs mt-1.5" style={{ color: THEME.inkSoft }}>Customer-facing. For private notes use Internal Delivery Notes above.</div>
              </div>
            </div>
          </Card>

          {error && (
            <div className="px-4 py-3 rounded-md flex items-start gap-2 text-sm" style={{ background: '#F5DDE0', color: THEME.red }}>
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />{error}
            </div>
          )}

          {justSaved && (
            <div className="px-4 py-3 rounded-md flex items-start gap-2 text-sm" style={{ background: THEME.successBg, color: THEME.successInk }}>
              <CheckCircle size={16} className="mt-0.5 flex-shrink-0" /> Saved {justSaved}. Form cleared for the next order — date and delivery batch kept.
            </div>
          )}

          <div className="space-y-2">
            <Btn variant="primary" size="lg" onClick={save} className="w-full">
              <Save size={16} className="inline mr-2 -mt-0.5" /> Save Order
            </Btn>
            <Btn variant="secondary" size="lg" onClick={saveAndNew} className="w-full">
              <Plus size={16} className="inline mr-2 -mt-0.5" /> Save &amp; New Order
            </Btn>
          </div>
        </div>
      </div>

      {/* Saved-customer conflict prompt — only when an existing record differs */}
      <Modal open={!!pendingConflict} onClose={() => resolveConflict('keep')} maxWidth="max-w-sm">
        {pendingConflict && (
          <div className="p-6">
            <div className="font-display text-lg mb-1">{pendingConflict.matchName} may already be saved</div>
            <div className="text-sm mb-4" style={{ color: THEME.inkSoft }}>
              This order's details differ from what's saved. Update the saved customer?
            </div>
            <div className="rounded-md p-3 mb-4 text-sm space-y-1" style={{ background: THEME.bg }}>
              {pendingConflict.fields.address && <div><span style={{ color: THEME.inkSoft }}>New address: </span>{pendingConflict.fields.address}</div>}
              {pendingConflict.fields.phone && <div><span style={{ color: THEME.inkSoft }}>Contact: </span>{pendingConflict.fields.phone}</div>}
              {pendingConflict.fields.notes && <div><span style={{ color: THEME.inkSoft }}>Notes: </span>{pendingConflict.fields.notes}</div>}
            </div>
            <div className="flex flex-col gap-2">
              <Btn variant="primary" onClick={() => resolveConflict('update')} className="w-full">Update saved customer</Btn>
              <Btn variant="secondary" onClick={() => resolveConflict('keep')} className="w-full">Keep old saved details</Btn>
              <Btn variant="secondary" onClick={() => resolveConflict('new')} className="w-full">Save as new customer</Btn>
            </div>
          </div>
        )}
      </Modal>
      <AreaPickerModal open={areaPickerOpen} onClose={() => setAreaPickerOpen(false)} areas={areas}
        currentId={areaById[areaId] ? areaId : null} title="Area" subtitle="Where this customer lives"
        onPick={chooseArea} onCreate={createAreaHere} />
    </div>
  );
}

/* ============================================================
   ORDERS LIST
   ============================================================ */

/* ============================================================
   ORDERS WORKSPACE (v10)
   ============================================================
   List + batch bar + filters on the left, order detail in a docked
   right panel on wide screens (an overlay sheet on smaller ones).
   Everything here is UI state — business data, calculations, sync and
   tombstones are untouched and still flow through setOrders/setMeta. */

// Order total, same arithmetic used everywhere else (qty × price per line).
const ordTotal = (o) => (o.items || []).reduce((s, i) => s + i.qty * i.price, 0);
// What's still owed, for display only. Partial payments use the recorded
// amount; a Partial order with no amount recorded is flagged as `unknown`
// instead of being treated as verified.
function ordBalance(o) {
  const total = ordTotal(o);
  if (o.delivery_status === 'Cancelled') return { total, paid: 0, due: 0, cancelled: true };
  if (o.payment_status === 'Paid') return { total, paid: total, due: 0 };
  if (o.payment_status === 'Partial') {
    const raw = o.amount_paid;
    if (raw === '' || raw === null || raw === undefined || isNaN(Number(raw))) return { total, paid: null, due: null, unknown: true };
    const paid = Number(raw);
    return { total, paid, due: Math.max(0, total - paid) };
  }
  return { total, paid: 0, due: total };
}
// Numeric part of an order ID, so ORD-1000 sorts after ORD-999.
const ordIdNum = (id) => { const m = String(id || '').match(/(\d+)/); return m ? Number(m[1]) : 0; };
// Batch dates are local YYYY-MM-DD; parse at local midnight (never UTC).
const fmtBatchLong = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const fmtBatchMed = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

function useMediaQuery(query) {
  const get = () => { try { return window.matchMedia(query).matches; } catch (e) { return false; } };
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    let mq;
    try { mq = window.matchMedia(query); } catch (e) { return undefined; }
    const onChange = () => setMatches(mq.matches);
    onChange();
    if (mq.addEventListener) mq.addEventListener('change', onChange); else mq.addListener(onChange);
    return () => { if (mq.removeEventListener) mq.removeEventListener('change', onChange); else mq.removeListener(onChange); };
  }, [query]);
  return matches;
}
const prefersReducedMotion = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

const ORDER_SORTS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'customer', label: 'Customer A–Z' },
  { id: 'total', label: 'Total, highest first' },
  { id: 'balance', label: 'Balance due, highest first' },
  { id: 'batch', label: 'Delivery batch' },
];

function Orders({ orders, setOrders, productByName, catalog, meta, setMeta, customers, setCustomers, onNewOrder, sync, registerNavGuard }) {
  // ── List state (UI only) ──
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');                // payment
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');      // 'all' | 'unassigned' | 'YYYY-MM-DD'
  const [areaFilter, setAreaFilter] = useState('all');        // 'all' | areaId | 'none'
  const [sortBy, setSortBy] = useState('newest');
  const [pageSize, setPageSize] = useState(() => {
    try { const n = Number(localStorage.getItem(STORAGE_PREFIX + 'ordersPageSize')); return [25, 50, 100].includes(n) ? n : 25; } catch (e) { return 25; }
  });
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [batchMenuOpen, setBatchMenuOpen] = useState(false);
  const batchMenuRef = useRef(null);
  const batchBtnRef = useRef(null);
  const listTopRef = useRef(null);

  // ── Area state (unchanged behaviour from v9.12) ──
  const [areaFor, setAreaFor] = useState(null);
  const [alsoOthers, setAlsoOthers] = useState(true);
  const [showAreaManager, setShowAreaManager] = useState(false);
  const [areaToast, setAreaToast] = useState('');
  const [groupByArea, setGroupByArea] = useState(() => {
    try { return localStorage.getItem(STORAGE_PREFIX + 'groupByArea') !== '0'; } catch (e) { return true; }
  });
  const areas = (meta && meta.areas) || [];
  const areaById = useMemo(() => Object.fromEntries(areas.map((a) => [a.id, a])), [areas]);
  const areaOf = (o) => areaById[o.area_id] || null;

  // ── Detail state ──
  const [selectedId, setSelectedId] = useState(null);
  const [closing, setClosing] = useState(false);
  const dirtyRef = useRef(false);
  const openerRef = useRef(null);
  const closeTimer = useRef(null);
  const [flashId, setFlashId] = useState(null);
  const flashTimer = useRef(null);
  const [printMode, setPrintMode] = useState(null);
  const [pickupMode, setPickupMode] = useState(false);
  const [batchExport, setBatchExport] = useState(false);
  const scrollRef = useRef(0);
  const restoreScroll = useRef(false);
  // Docked side panel only when the list keeps a comfortable width beside it.
  const docked = useMediaQuery('(min-width: 1360px)');
  const roomy = useMediaQuery('(min-width: 1400px)');
  const phone = !useMediaQuery('(min-width: 768px)');
  const selectedOrder = selectedId ? orders[selectedId] || null : null;

  // ── Unsaved-edit protection ──
  const confirmDiscard = () => {
    if (!dirtyRef.current) return true;
    if (!window.confirm('You have unsaved changes to this order. Discard them?')) return false;
    dirtyRef.current = false;
    return true;
  };
  useEffect(() => {
    if (!registerNavGuard) return undefined;
    registerNavGuard(confirmDiscard);
    return () => registerNavGuard(null);
  }, [registerNavGuard]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onBeforeUnload = (e) => { if (dirtyRef.current) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);
  // If the open order disappears (deleted on another device), close the panel.
  useEffect(() => {
    if (selectedId && !orders[selectedId]) { dirtyRef.current = false; setSelectedId(null); setClosing(false); }
  }, [orders, selectedId]);

  const openOrder = (id, el) => {
    if (id === selectedId && !closing) return;
    if (!confirmDiscard()) return;
    clearTimeout(closeTimer.current);
    setClosing(false);
    if (!selectedId) openerRef.current = el || document.activeElement;
    setSelectedId(id);
  };
  const requestClose = () => {
    if (!selectedId || closing) return;
    if (!confirmDiscard()) return;
    const finish = () => {
      setSelectedId(null);
      setClosing(false);
      const el = openerRef.current;
      openerRef.current = null;
      if (el && document.contains(el)) { try { el.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    };
    if (prefersReducedMotion()) { finish(); return; }
    setClosing(true);
    closeTimer.current = setTimeout(finish, 210);
  };
  useEffect(() => () => { clearTimeout(closeTimer.current); clearTimeout(flashTimer.current); }, []);
  // Escape closes the detail (unless a dialog or menu on top of it is open).
  useEffect(() => {
    if (!selectedId) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if (areaFor || showAreaManager || batchMenuOpen) return;
      requestClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  // ── Leaving to Invoice / Supplier Copy / Pickup / Export and coming back ──
  const leaveTo = (fn) => {
    if (!confirmDiscard()) return;
    scrollRef.current = window.scrollY;
    restoreScroll.current = true;
    fn();
    window.scrollTo(0, 0);
  };
  useLayoutEffect(() => {
    if (!printMode && !pickupMode && !batchExport && restoreScroll.current) {
      restoreScroll.current = false;
      window.scrollTo(0, scrollRef.current);
    }
  }, [printMode, pickupMode, batchExport]);

  // ── Batches ──
  const todayIso = today();
  const batchInfo = useMemo(() => {
    const counts = {};
    let unassigned = 0, all = 0;
    Object.values(orders).forEach((o) => {
      if (o.delivery_status === 'Cancelled') return;
      all += 1;
      if (o.delivery_batch) counts[o.delivery_batch] = (counts[o.delivery_batch] || 0) + 1;
      else unassigned += 1;
    });
    // Next Tuesday and Saturday are always offered, even with no orders yet.
    [nextTuesday(), nextSaturday()].forEach((b) => { if (!(b in counts)) counts[b] = 0; });
    if (batchFilter !== 'all' && batchFilter !== 'unassigned' && !(batchFilter in counts)) counts[batchFilter] = 0;
    return { counts, asc: Object.keys(counts).sort(), unassigned, all };
  }, [orders, batchFilter]);
  const isBatch = batchFilter !== 'all' && batchFilter !== 'unassigned';
  let prevBatch, nextBatch;
  if (isBatch) {
    const i = batchInfo.asc.indexOf(batchFilter);
    prevBatch = batchInfo.asc[i - 1];
    nextBatch = batchInfo.asc[i + 1];
  } else {
    nextBatch = batchInfo.asc.find((b) => b >= todayIso);
    prevBatch = [...batchInfo.asc].reverse().find((b) => b < todayIso);
  }
  const selectBatch = (b) => { setBatchFilter(b); setBatchMenuOpen(false); };
  useEffect(() => {
    if (!batchMenuOpen) return undefined;
    const onDown = (e) => { if (batchMenuRef.current && !batchMenuRef.current.contains(e.target)) setBatchMenuOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('touchstart', onDown); };
  }, [batchMenuOpen]);

  // ── Filtering (same rules as before) ──
  const filtered = useMemo(() => {
    let list = Object.values(orders);
    if (filter !== 'all') list = list.filter((o) => o.payment_status === filter);
    if (deliveryFilter !== 'all') list = list.filter((o) => (o.delivery_status || 'Pending') === deliveryFilter);
    if (batchFilter === 'unassigned') list = list.filter((o) => !o.delivery_batch);
    else if (batchFilter !== 'all') list = list.filter((o) => o.delivery_batch === batchFilter);
    if (areaFilter === 'none') list = list.filter((o) => !areaById[o.area_id]);
    else if (areaFilter !== 'all') list = list.filter((o) => o.area_id === areaFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((o) =>
        (o.id || '').toLowerCase().includes(q) ||
        (o.customer || '').toLowerCase().includes(q) ||
        (o.items || []).some((i) => (i.product || '').toLowerCase().includes(q)));
    }
    return list;
  }, [orders, search, filter, deliveryFilter, batchFilter, areaFilter, areaById]);

  // Grouping by area only makes sense inside one delivery batch.
  const grouped = groupByArea && areas.length > 0 && isBatch;
  const sorted = useMemo(() => {
    const byNewest = (a, b) => (ordIdNum(b.id) - ordIdNum(a.id)) || (b.date || '').localeCompare(a.date || '');
    const byCustomer = (a, b) => (a.customer || '').localeCompare(b.customer || '', undefined, { sensitivity: 'base' }) || byNewest(a, b);
    const dueOf = (o) => { const b = ordBalance(o); return b.cancelled ? -1 : b.unknown ? b.total : b.due; };
    const cmps = {
      newest: byNewest,
      oldest: (a, b) => -byNewest(a, b),
      customer: byCustomer,
      total: (a, b) => (ordTotal(b) - ordTotal(a)) || byNewest(a, b),
      balance: (a, b) => (dueOf(b) - dueOf(a)) || byNewest(a, b),
      batch: (a, b) => (a.delivery_batch || '9999-99-99').localeCompare(b.delivery_batch || '9999-99-99') || byCustomer(a, b),
    };
    const list = filtered.slice();
    if (grouped) {
      // Within an area, the default "newest" reads better alphabetically (as in v9.12).
      const within = sortBy === 'newest' ? byCustomer : (cmps[sortBy] || byNewest);
      const rank = Object.fromEntries(areas.map((a, i) => [a.id, i]));
      const r = (o) => (areaById[o.area_id] ? rank[o.area_id] : 1e6);
      list.sort((a, b) => (r(a) - r(b)) || within(a, b));
    } else {
      list.sort(cmps[sortBy] || byNewest);
    }
    return list;
  }, [filtered, sortBy, grouped, areas, areaById]);

  // ── Pagination ──
  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const curPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((curPage - 1) * pageSize, curPage * pageSize);
  useEffect(() => { setPage(1); }, [search, filter, deliveryFilter, batchFilter, areaFilter, sortBy, pageSize, groupByArea]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);
  const goPage = (p) => {
    setPage(p);
    const el = listTopRef.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  };
  const changePageSize = (n) => {
    setPageSize(n);
    try { localStorage.setItem(STORAGE_PREFIX + 'ordersPageSize', String(n)); } catch (e) { /* ignore */ }
  };

  // Group stats across the whole filtered list (not only this page).
  const groupStats = useMemo(() => {
    const s = {};
    if (!grouped) return s;
    sorted.forEach((o) => {
      const k = areaById[o.area_id] ? o.area_id : '__none';
      s[k] = s[k] || { count: 0, value: 0 };
      s[k].count += 1;
      if (o.delivery_status !== 'Cancelled') s[k].value += ordTotal(o);
    });
    return s;
  }, [grouped, sorted, areaById]);
  const pageGroups = useMemo(() => {
    if (!grouped) return [{ key: 'all', area: null, orders: pageItems, plain: true }];
    const out = [];
    pageItems.forEach((o) => {
      const a = areaById[o.area_id] || null;
      const k = a ? a.id : '__none';
      const last = out[out.length - 1];
      if (last && last.key === k) last.orders.push(o); else out.push({ key: k, area: a, orders: [o] });
    });
    return out;
  }, [grouped, pageItems, areaById]);

  // ── Summary for the current view ──
  const summary = useMemo(() => {
    let pending = 0, withBalance = 0, needsAmount = 0, value = 0, cancelled = 0;
    filtered.forEach((o) => {
      if (o.delivery_status === 'Cancelled') { cancelled += 1; return; }
      value += ordTotal(o);
      if ((o.delivery_status || 'Pending') !== 'Delivered') pending += 1;
      const b = ordBalance(o);
      if (b.unknown) needsAmount += 1;
      else if (b.due > 0.004) withBalance += 1;
    });
    return { count: filtered.length, pending, withBalance, needsAmount, value, cancelled };
  }, [filtered]);

  // ── Active filter chips ──
  const chips = [
    filter !== 'all' && { key: 'pay', label: filter, clear: () => setFilter('all') },
    deliveryFilter !== 'all' && { key: 'del', label: deliveryFilter === 'Pending' ? 'Pending delivery' : deliveryFilter, clear: () => setDeliveryFilter('all') },
    areaFilter !== 'all' && { key: 'area', label: areaFilter === 'none' ? 'No area' : (areaById[areaFilter] ? areaById[areaFilter].name : 'Area'), area: areaById[areaFilter] || null, clear: () => setAreaFilter('all') },
  ].filter(Boolean);
  const clearAll = () => { setFilter('all'); setDeliveryFilter('all'); setAreaFilter('all'); setSearch(''); };

  // ── Order updates (same data changes as before, now via functional updates) ──
  const flash = (id) => {
    setFlashId(id);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashId(null), 900);
  };
  const updateOrderStatus = (id, patch) => {
    setOrders((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], ...patch, updated_at: new Date().toISOString() } } : prev));
    flash(id);
  };
  const saveFullOrder = (id, updatedOrder) => {
    setOrders((prev) => ({ ...prev, [id]: updatedOrder }));
    flash(id);
  };
  const deleteOrder = (id) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    setOrders((prev) => { const next = { ...prev }; delete next[id]; return next; });
    // Tombstone so the deletion survives multi-device merging.
    setMeta((m) => ({ ...m, deletedOrders: { ...(m.deletedOrders || {}), [id]: new Date().toISOString() } }));
    dirtyRef.current = false;
    clearTimeout(closeTimer.current);
    setClosing(false);
    setSelectedId(null);
  };

  // ── Area tagging (unchanged from v9.12) ──
  const nowIso = () => new Date().toISOString();
  const createArea = (name) => {
    const existing = areas.find((a) => a.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (existing) return existing.id;
    const rec = newAreaRecord(areas, name);
    setMeta((m) => ({ ...m, areas: [...(m.areas || []), rec] }));
    return rec.id;
  };
  const untaggedSiblings = (order) => Object.values(orders).filter((o) =>
    o.id !== order.id && !areaById[o.area_id] && sameCustomer(o, order.customer, order.phone));
  const assignArea = (order, areaId) => {
    const t = nowIso();
    const siblings = areaId && alsoOthers ? untaggedSiblings(order) : [];
    setOrders((prev) => {
      const next = { ...prev };
      [order, ...siblings].forEach((o) => { if (next[o.id]) next[o.id] = { ...next[o.id], area_id: areaId || '', updated_at: t }; });
      return next;
    });
    if (setCustomers) {
      const match = findCustomerMatch(customers, order.customer, order.phone);
      if (match) {
        setCustomers((prev) => (prev[match.id] ? { ...prev, [match.id]: { ...prev[match.id], area_id: areaId || '', updated_at: t } } : prev));
      } else if (areaId && (order.customer || '').trim()) {
        const cid = makeCustomerId();
        const isMsgr = /messenger/i.test(order.phone || '');
        setCustomers((prev) => ({ ...prev, [cid]: {
          id: cid, name: order.customer.trim(),
          phone: isMsgr ? '' : (order.phone || ''),
          messenger: isMsgr ? (order.phone || '').replace(/^messenger:\s*/i, '') : '',
          address: order.delivery_address || '', notes: '', area_id: areaId, updated_at: t,
        } }));
      }
    }
    setAreaFor(null);
    flash(order.id);
    if (siblings.length) {
      setAreaToast(`Also tagged ${siblings.length} other order${siblings.length !== 1 ? 's' : ''} from ${order.customer}.`);
      setTimeout(() => setAreaToast(''), 3500);
    }
  };
  const openAreaPicker = (e, order) => { if (e) e.stopPropagation(); setAlsoOthers(true); setAreaFor(order); };
  const setGroup = (on) => {
    setGroupByArea(on);
    try { localStorage.setItem(STORAGE_PREFIX + 'groupByArea', on ? '1' : '0'); } catch (e) { /* ignore */ }
  };

  // ── Full-screen sub-views (state above is kept, so you return to the same place) ──
  if (printMode && selectedOrder) {
    return <PrintableView order={selectedOrder} mode={printMode} onBack={() => setPrintMode(null)} />;
  }
  if (pickupMode && isBatch) {
    const batchOrders = Object.values(orders)
      .filter((o) => o.delivery_batch === batchFilter && o.delivery_status !== 'Cancelled')
      .sort((a, b) => (a.customer || '').localeCompare(b.customer || ''));
    return <PickupMode batch={batchFilter} orders={batchOrders} areas={areas} onBack={() => setPickupMode(false)} />;
  }
  if (batchExport && isBatch) {
    const batchOrders = Object.values(orders)
      .filter((o) => o.delivery_batch === batchFilter && o.delivery_status !== 'Cancelled')
      .sort((a, b) => (a.customer || '').localeCompare(b.customer || ''));
    return <BatchExportView batchOrders={batchOrders} batch={batchFilter} onBack={() => setBatchExport(false)} />;
  }

  const panelOpenDocked = docked && !!selectedOrder;
  const showBatchCol = !isBatch && !panelOpenDocked;
  const colCount = showBatchCol ? 6 : 5;
  const anyOrders = Object.keys(orders).length > 0;
  const batchCenterLabel = batchFilter === 'all' ? 'All orders'
    : batchFilter === 'unassigned' ? 'No batch set'
      : (phone ? fmtBatchMed(batchFilter) : fmtBatchLong(batchFilter));
  const batchWhen = isBatch ? (batchFilter === todayIso ? 'Today' : batchFilter > todayIso ? 'Upcoming batch' : 'Past batch') : '';
  const upcoming = batchInfo.asc.filter((b) => b >= todayIso);
  const past = batchInfo.asc.filter((b) => b < todayIso).reverse();

  // Small building blocks used by both the table and the phone cards.
  const payDue = (o) => {
    const b = ordBalance(o);
    if (b.cancelled) return null;
    if (b.unknown) return <div className="text-[11px] mt-1 font-medium" style={{ color: THEME.warnInk }}>Amount paid not recorded</div>;
    if (b.due > 0.004 && o.payment_status === 'Partial') return <div className="text-[11px] mt-1 font-medium" style={{ color: THEME.red }}>{peso(b.due)} due</div>;
    return null;
  };
  // Status pills: text + colour (never colour alone). Amber uses the darker
  // warning ink so "Pending"/"Partial" stay readable.
  const pillTone = (status) => {
    const c = statusColor(status);
    if (c === 'green') return { background: THEME.successBg, color: THEME.green };
    if (c === 'red') return { background: THEME.errorBg, color: THEME.red };
    if (c === 'amber') return { background: THEME.warnBg, color: THEME.warnInk };
    return { background: THEME.line, color: THEME.inkSoft };
  };
  const statusBadges = (o, nowrap) => {
    const pay = o.payment_status || 'Unpaid';
    const del = o.delivery_status || 'Pending';
    const cls = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${flashId === o.id ? 'mn-pop' : ''}`;
    return (
      <div className={`flex gap-1.5 ${nowrap ? 'flex-nowrap' : 'flex-wrap'}`}>
        <span key={'p' + pay} className={cls} style={pillTone(pay)}>{pay}</span>
        <span key={'d' + del} className={cls} style={pillTone(del)}>{del}</span>
      </div>
    );
  };
  const batchTag = (iso) => (iso ? (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap" style={{ background: THEME.brandBg, color: THEME.brand }}>
      <Truck size={10} /> {batchLabel(iso)}
    </span>
  ) : <span className="text-xs italic" style={{ color: THEME.inkSoft }}>No batch</span>);
  const rowKey = (e, o) => { if (e.target !== e.currentTarget) return; if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openOrder(o.id, e.currentTarget); } };
  const segBtn = (on) => ({
    background: on ? THEME.brand : 'transparent', color: on ? 'white' : THEME.ink,
    border: `1px solid ${on ? THEME.brand : THEME.line}`,
  });

  const detail = selectedOrder && (
    <OrderDetail
      key={selectedOrder.id}
      order={selectedOrder}
      catalog={catalog}
      productByName={productByName}
      onClose={requestClose}
      onDelete={() => deleteOrder(selectedOrder.id)}
      onPrint={(mode) => leaveTo(() => setPrintMode(mode))}
      onUpdate={(patch) => updateOrderStatus(selectedOrder.id, patch)}
      onSaveFull={(updated) => saveFullOrder(selectedOrder.id, updated)}
      area={areaOf(selectedOrder)}
      onEditArea={() => openAreaPicker(null, selectedOrder)}
      onDirtyChange={(d) => { dirtyRef.current = d; }}
      sync={sync}
      narrow={phone}
    />
  );

  return (
    <div className={panelOpenDocked ? 'flex items-start gap-6' : ''}>
      <div className="flex-1 min-w-0">
        {/* ===== Header ===== */}
        <div className="flex items-center justify-between gap-3 mb-5 no-print">
          <h1 className="font-display text-3xl sm:text-4xl leading-tight" style={{ color: THEME.brand }}>Orders</h1>
          <button onClick={onNewOrder}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 mn-btn"
            style={{ background: THEME.brand, color: 'white', boxShadow: '0 2px 8px rgba(122,46,51,0.18)' }}>
            <PlusCircle size={17} /> New order
          </button>
        </div>

        {/* ===== Batch bar ===== */}
        <div className="flex items-stretch gap-2 mb-4 no-print">
          <div className="flex-1 min-w-0 flex items-center rounded-xl" style={{ background: THEME.card, border: `1px solid ${THEME.line}` }}>
            <button onClick={() => prevBatch && selectBatch(prevBatch)} disabled={!prevBatch}
              className="flex items-center gap-1 px-3 py-3 text-sm rounded-l-xl flex-shrink-0 mn-btn disabled:opacity-35"
              style={{ color: THEME.ink }} aria-label={prevBatch ? `Previous batch, ${fmtBatchMed(prevBatch)}` : 'No earlier batch'}>
              <ChevronLeft size={18} /> <span className="hidden sm:inline">Previous</span>
            </button>
            <div className="flex-1 min-w-0 text-center px-1">
              <div className="font-display text-lg sm:text-xl leading-tight truncate" style={{ color: batchFilter === 'all' ? THEME.ink : THEME.brand }} aria-live="polite">
                {batchCenterLabel}
              </div>
              {batchWhen && <div className="text-[11px] uppercase tracking-wider" style={{ color: THEME.inkSoft, letterSpacing: '0.08em' }}>{batchWhen}</div>}
            </div>
            <button onClick={() => nextBatch && selectBatch(nextBatch)} disabled={!nextBatch}
              className="flex items-center gap-1 px-3 py-3 text-sm rounded-r-xl flex-shrink-0 mn-btn disabled:opacity-35"
              style={{ color: THEME.ink }} aria-label={nextBatch ? `Next batch, ${fmtBatchMed(nextBatch)}` : 'No later batch'}>
              <span className="hidden sm:inline">Next</span> <ChevronRight size={18} />
            </button>
          </div>
          <div className="relative flex-shrink-0" ref={batchMenuRef}
            onKeyDown={(e) => { if (e.key === 'Escape' && batchMenuOpen) { e.preventDefault(); setBatchMenuOpen(false); if (batchBtnRef.current) batchBtnRef.current.focus(); } }}>
            <button ref={batchBtnRef} onClick={() => setBatchMenuOpen((v) => !v)}
              className="h-full flex items-center gap-2 px-3.5 rounded-xl text-sm font-medium mn-btn"
              style={{ background: batchFilter === 'all' ? THEME.brandBg : THEME.card, border: `1px solid ${batchFilter === 'all' ? THEME.brandBg : THEME.line}`, color: THEME.ink }}
              aria-haspopup="true" aria-expanded={batchMenuOpen}>
              <CalendarDays size={16} /> <span>{phone ? 'Dates' : 'All dates'}</span> <ChevronDown size={14} />
            </button>
            {batchMenuOpen && (
              <div className="absolute right-0 top-full mt-2 z-30 w-72 max-w-[calc(100vw-2rem)] rounded-xl p-1.5 mn-pop-in"
                style={{ background: THEME.card, border: `1px solid ${THEME.line}`, boxShadow: '0 12px 32px rgba(42,38,36,0.16)' }}
                role="menu" aria-label="Choose delivery batch">
                <div className="max-h-[60vh] overflow-y-auto">
                  {[
                    { id: 'all', label: 'All orders', sub: 'Every date', n: batchInfo.all },
                    { id: 'unassigned', label: 'No batch set', sub: 'Orders waiting for a delivery day', n: batchInfo.unassigned },
                  ].map((it) => (
                    <button key={it.id} role="menuitemradio" aria-checked={batchFilter === it.id} onClick={() => selectBatch(it.id)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left row-hover"
                      style={{ background: batchFilter === it.id ? THEME.brandBg : 'transparent' }}>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium" style={{ color: THEME.ink }}>{it.label}</span>
                        <span className="block text-xs" style={{ color: THEME.inkSoft }}>{it.sub}</span>
                      </span>
                      <span className="text-xs tabular-nums" style={{ color: THEME.inkSoft }}>{it.n}</span>
                    </button>
                  ))}
                  {[['Upcoming', upcoming], ['Past batches', past]].map(([title, list]) => list.length > 0 && (
                    <div key={title} className="mt-1.5 pt-1.5" style={{ borderTop: `1px solid ${THEME.line}` }}>
                      <div className="px-3 py-1 text-[11px] uppercase tracking-wider font-semibold" style={{ color: THEME.inkSoft, letterSpacing: '0.08em' }}>{title}</div>
                      {list.map((b) => (
                        <button key={b} role="menuitemradio" aria-checked={batchFilter === b} onClick={() => selectBatch(b)}
                          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left text-sm row-hover"
                          style={{ background: batchFilter === b ? THEME.brandBg : 'transparent', color: THEME.ink }}>
                          <span>{fmtBatchMed(b)}{b === todayIso && <span className="ml-1.5 text-[11px] font-semibold" style={{ color: THEME.green }}>Today</span>}</span>
                          <span className="text-xs tabular-nums" style={{ color: THEME.inkSoft }}>{batchInfo.counts[b]}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== Summary + batch tools ===== */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4 no-print">
          <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1 text-sm" style={{ color: THEME.inkSoft }}>
            <span><span className="font-display text-xl" style={{ color: THEME.brand }}>{summary.count}</span> order{summary.count !== 1 ? 's' : ''}</span>
            <span aria-hidden="true" style={{ color: THEME.line }}>|</span>
            <span><span className="font-display text-xl" style={{ color: THEME.brand }}>{summary.pending}</span> pending delivery</span>
            <span aria-hidden="true" style={{ color: THEME.line }}>|</span>
            <span><span className="font-display text-xl" style={{ color: THEME.brand }}>{summary.withBalance}</span> with balance</span>
            {summary.needsAmount > 0 && (
              <button onClick={() => setFilter('Partial')} className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: THEME.warnBg, color: THEME.warnInk }} title="Partial payments with no amount recorded">
                {summary.needsAmount} partial need amount
              </button>
            )}
            <span className="text-xs">· {peso(summary.value)} total{summary.cancelled ? ` · ${summary.cancelled} cancelled` : ''}</span>
          </div>
          {isBatch && (
            <div className="flex gap-2">
              <Btn variant="primary" size="sm" onClick={() => leaveTo(() => setPickupMode(true))}>
                <Check size={14} className="inline -mt-0.5 mr-1" /> Pickup Mode
              </Btn>
              <Btn variant="secondary" size="sm" onClick={() => leaveTo(() => setBatchExport(true))}>
                <ImageIcon size={14} className="inline -mt-0.5 mr-1" /> Export Docs
              </Btn>
            </div>
          )}
        </div>

        {/* ===== Search + Filters ===== */}
        <div className="flex gap-2 mb-2 no-print">
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: THEME.inkSoft }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer, order ID, or product…"
              aria-label="Search orders"
              className="w-full pl-10 pr-9 py-2.5 rounded-xl outline-none text-sm"
              style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink }} />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg row-hover" aria-label="Clear search">
                <X size={14} style={{ color: THEME.inkSoft }} />
              </button>
            )}
          </div>
          <button onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen} aria-controls="orders-filters"
            className="flex items-center gap-2 px-3.5 rounded-xl text-sm font-medium flex-shrink-0 mn-btn"
            style={{ background: filtersOpen ? THEME.brandBg : THEME.card, border: `1px solid ${filtersOpen ? THEME.brandBg : THEME.line}`, color: THEME.ink }}>
            <Filter size={15} /> <span>Filters</span>
            {chips.length > 0 && <span className="text-[11px] font-bold rounded-full px-1.5" style={{ background: THEME.brand, color: 'white' }}>{chips.length}</span>}
            <ChevronDown size={14} style={{ transition: 'transform 0.18s ease', transform: filtersOpen ? 'rotate(180deg)' : 'none' }} />
          </button>
        </div>

        <div id="orders-filters" className={`mn-collapse no-print ${filtersOpen ? 'open' : ''}`} aria-hidden={!filtersOpen}>
          <div>
            <div className="rounded-xl p-4 mt-1 mb-2 space-y-3.5" style={{ background: THEME.card, border: `1px solid ${THEME.line}` }}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wider w-20" style={{ color: THEME.inkSoft, letterSpacing: '0.06em' }}>Payment</span>
                {['all', 'Paid', 'Unpaid', 'Partial'].map((f) => (
                  <button key={f} tabIndex={filtersOpen ? 0 : -1} onClick={() => setFilter(f)} aria-pressed={filter === f}
                    className="px-3 py-1.5 text-sm rounded-lg mn-btn" style={segBtn(filter === f)}>{f === 'all' ? 'All' : f}</button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wider w-20" style={{ color: THEME.inkSoft, letterSpacing: '0.06em' }}>Delivery</span>
                {['all', 'Pending', 'Delivered', 'Cancelled'].map((f) => (
                  <button key={f} tabIndex={filtersOpen ? 0 : -1} onClick={() => setDeliveryFilter(f)} aria-pressed={deliveryFilter === f}
                    className="px-3 py-1.5 text-sm rounded-lg mn-btn" style={segBtn(deliveryFilter === f)}>{f === 'all' ? 'All' : f}</button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wider w-20" style={{ color: THEME.inkSoft, letterSpacing: '0.06em' }}>Area</span>
                {areas.length === 0 ? (
                  <button tabIndex={filtersOpen ? 0 : -1} onClick={() => setShowAreaManager(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg"
                    style={{ border: `1px dashed ${THEME.inkSoft}`, color: THEME.inkSoft }}>
                    <MapPin size={13} /> Set up areas
                  </button>
                ) : (() => {
                  const inScope = Object.values(orders).filter((o) => o.delivery_status !== 'Cancelled' &&
                    (batchFilter === 'all' ? true : batchFilter === 'unassigned' ? !o.delivery_batch : o.delivery_batch === batchFilter));
                  const noneCount = inScope.filter((o) => !areaById[o.area_id]).length;
                  return (
                    <>
                      <button tabIndex={filtersOpen ? 0 : -1} onClick={() => setAreaFilter('all')} aria-pressed={areaFilter === 'all'}
                        className="px-3 py-1.5 text-sm rounded-lg mn-btn" style={segBtn(areaFilter === 'all')}>All</button>
                      {areas.map((a) => {
                        const on = areaFilter === a.id;
                        return (
                          <button key={a.id} tabIndex={filtersOpen ? 0 : -1} onClick={() => setAreaFilter(on ? 'all' : a.id)} aria-pressed={on}
                            className="inline-flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-lg"
                            style={{ border: `1px solid ${on ? THEME.brand : THEME.line}`, background: on ? THEME.brandBg : 'transparent' }}>
                            <AreaChip area={a} />
                            <span className="text-xs" style={{ color: THEME.inkSoft }}>{inScope.filter((o) => o.area_id === a.id).length}</span>
                          </button>
                        );
                      })}
                      <button tabIndex={filtersOpen ? 0 : -1} onClick={() => setAreaFilter(areaFilter === 'none' ? 'all' : 'none')} aria-pressed={areaFilter === 'none'}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                        style={{ border: `1px solid ${areaFilter === 'none' ? THEME.brand : THEME.line}`, background: areaFilter === 'none' ? THEME.brandBg : 'transparent', color: THEME.inkSoft }}>
                        No area <span>{noneCount}</span>
                      </button>
                      <button tabIndex={filtersOpen ? 0 : -1} onClick={() => setShowAreaManager(true)} className="text-xs font-medium px-2 py-1" style={{ color: THEME.inkSoft }}>Manage areas</button>
                    </>
                  );
                })()}
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-3" style={{ borderTop: `1px solid ${THEME.line}` }}>
                <label className="flex items-center gap-2 text-sm" style={{ color: THEME.ink }}>
                  <span className="text-xs uppercase tracking-wider w-20" style={{ color: THEME.inkSoft, letterSpacing: '0.06em' }}>Sort</span>
                  <select tabIndex={filtersOpen ? 0 : -1} value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort orders"
                    className="px-3 py-1.5 rounded-lg outline-none text-sm"
                    style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink }}>
                    {ORDER_SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </label>
                {areas.length > 0 && (
                  <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: THEME.ink }}>
                    <input tabIndex={filtersOpen ? 0 : -1} type="checkbox" checked={groupByArea} onChange={(e) => setGroup(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: THEME.brand }} />
                    Group by area <span className="text-xs" style={{ color: THEME.inkSoft }}>(when a batch is selected)</span>
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-3 no-print">
            {chips.map((c) => {
              const tone = c.area ? areaTone(c.area.color) : null;
              return (
                <span key={c.key} className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-lg text-sm mn-pop-in"
                  style={{ background: tone ? tone.bg : THEME.brandBg, color: tone ? tone.ink : THEME.brand }}>
                  {tone && <span style={{ width: 7, height: 7, borderRadius: '50%', background: tone.dot }} />}
                  {c.label}
                  <button onClick={c.clear} className="p-1 rounded-md row-hover" aria-label={`Remove filter ${c.label}`}><X size={13} /></button>
                </span>
              );
            })}
            <button onClick={clearAll} className="text-sm font-medium px-2 py-1" style={{ color: THEME.inkSoft }}>Clear all</button>
          </div>
        )}

        {/* ===== List ===== */}
        <div ref={listTopRef} style={{ scrollMarginTop: 80 }} />
        {totalCount === 0 ? (
          <Card className="px-6 py-12 text-center">
            <div className="font-display text-xl mb-1" style={{ color: THEME.ink }}>{anyOrders ? 'No orders match' : 'No orders yet'}</div>
            <div className="text-sm mb-5" style={{ color: THEME.inkSoft }}>
              {anyOrders
                ? (isBatch || batchFilter === 'unassigned' ? 'Nothing in this view with these filters.' : 'Try a different search or remove a filter.')
                : 'Orders you create or accept from the online shop appear here.'}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {(chips.length > 0 || search) && <Btn variant="secondary" onClick={clearAll}>Clear filters</Btn>}
              {batchFilter !== 'all' && <Btn variant="secondary" onClick={() => selectBatch('all')}>Show all dates</Btn>}
              {!anyOrders && <Btn variant="primary" onClick={onNewOrder}><PlusCircle size={15} className="inline -mt-0.5 mr-1.5" />New order</Btn>}
            </div>
          </Card>
        ) : (
          <>
            {/* Tablet / desktop table */}
            <div className="hidden md:block rounded-xl overflow-hidden" style={{ background: THEME.card, border: `1px solid ${THEME.line}` }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left" style={{ color: THEME.inkSoft, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    <th className="px-4 py-3 font-medium" aria-sort={sortBy === 'customer' ? 'ascending' : 'none'}>
                      <button onClick={() => setSortBy(sortBy === 'customer' ? 'newest' : 'customer')} className="uppercase tracking-wider inline-flex items-center gap-1">
                        Customer {sortBy === 'customer' && <ChevronDown size={12} />}
                      </button>
                    </th>
                    {showBatchCol && <th className="px-2 py-3 font-medium">Batch</th>}
                    <th className="px-2 py-3 font-medium">Area</th>
                    <th className="px-2 py-3 font-medium text-right" aria-sort={sortBy === 'total' ? 'descending' : 'none'}>
                      <button onClick={() => setSortBy(sortBy === 'total' ? 'newest' : 'total')} className="uppercase tracking-wider inline-flex items-center gap-1">
                        Total {sortBy === 'total' && <ChevronDown size={12} />}
                      </button>
                    </th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="w-8" aria-hidden="true"></th>
                  </tr>
                </thead>
                <tbody>
                  {pageGroups.map((g) => (
                    <React.Fragment key={g.key}>
                      {!g.plain && (
                        <tr>
                          <td colSpan={colCount} className="px-4 pt-4 pb-2" style={{ borderTop: `1px solid ${THEME.line}`, background: THEME.bg }}>
                            <div className="flex items-center gap-2">
                              {g.area ? <AreaChip area={g.area} size="md" /> : <span className="text-sm font-medium" style={{ color: THEME.inkSoft }}>No area</span>}
                              {groupStats[g.key] && (
                                <span className="text-xs" style={{ color: THEME.inkSoft }}>
                                  {groupStats[g.key].count} order{groupStats[g.key].count !== 1 ? 's' : ''} · {peso(groupStats[g.key].value)}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                      {g.orders.map((o) => {
                        const sel = o.id === selectedId;
                        const cancelled = o.delivery_status === 'Cancelled';
                        const n = (o.items || []).length;
                        return (
                          <tr key={o.id} tabIndex={0} aria-selected={sel} aria-label={`${o.customer || 'Order'}, ${o.id}`}
                            onClick={(e) => openOrder(o.id, e.currentTarget)} onKeyDown={(e) => rowKey(e, o)}
                            className={`mn-row cursor-pointer ${sel ? '' : 'row-hover'}`}
                            style={{ borderTop: `1px solid ${THEME.line}`, background: sel ? THEME.brandBg : 'transparent', boxShadow: sel ? `inset 3px 0 0 ${THEME.brand}` : 'none' }}>
                            <td className="px-4 py-3 align-top" style={{ opacity: cancelled ? 0.55 : 1 }}>
                              <div className="font-semibold break-words" style={{ color: THEME.ink, textDecoration: cancelled ? 'line-through' : 'none' }}>{o.customer || '—'}</div>
                              <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>{o.id} · {fmtDateShort(o.date)} · {n} item{n !== 1 ? 's' : ''}</div>
                            </td>
                            {showBatchCol && <td className="px-2 py-3 align-top" style={{ opacity: cancelled ? 0.55 : 1 }}>{batchTag(o.delivery_batch)}</td>}
                            <td className="px-2 py-3 align-top">
                              <AreaChip area={areaOf(o)} variant="dot" onClick={(e) => openAreaPicker(e, o)} />
                            </td>
                            <td className="px-2 py-3 align-top text-right font-semibold tabular-nums whitespace-nowrap" style={{ color: THEME.ink, opacity: cancelled ? 0.55 : 1 }}>
                              {peso(ordTotal(o))}
                            </td>
                            <td className="px-4 py-3 align-top">{statusBadges(o, !panelOpenDocked || roomy)}{payDue(o)}</td>
                            <td className="pr-3 py-3 align-top" aria-hidden="true"><ChevronRight size={16} style={{ color: THEME.inkSoft, marginTop: 2 }} /></td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phone cards */}
            <div className="md:hidden space-y-2">
              {pageGroups.map((g) => (
                <div key={g.key} className="space-y-2">
                  {!g.plain && (
                    <div className="flex items-center gap-2 pt-3 pb-0.5">
                      {g.area ? <AreaChip area={g.area} size="md" /> : <span className="text-sm font-medium" style={{ color: THEME.inkSoft }}>No area</span>}
                      {groupStats[g.key] && <span className="text-xs" style={{ color: THEME.inkSoft }}>{groupStats[g.key].count} order{groupStats[g.key].count !== 1 ? 's' : ''}</span>}
                    </div>
                  )}
                  {g.orders.map((o) => {
                    const sel = o.id === selectedId;
                    const cancelled = o.delivery_status === 'Cancelled';
                    const area = areaOf(o);
                    const tone = area ? areaTone(area.color) : null;
                    const n = (o.items || []).length;
                    return (
                      <div key={o.id} role="button" tabIndex={0} aria-label={`${o.customer || 'Order'}, ${o.id}`}
                        onClick={(e) => openOrder(o.id, e.currentTarget)} onKeyDown={(e) => rowKey(e, o)}
                        className="mn-row rounded-xl p-3.5 cursor-pointer"
                        style={{
                          background: sel ? THEME.brandBg : THEME.card,
                          borderTop: `1px solid ${sel ? THEME.brand : THEME.line}`,
                          borderRight: `1px solid ${sel ? THEME.brand : THEME.line}`,
                          borderBottom: `1px solid ${sel ? THEME.brand : THEME.line}`,
                          borderLeft: `4px solid ${tone ? tone.dot : (sel ? THEME.brand : THEME.line)}`,
                        }}>
                        <div className="flex items-start justify-between gap-2" style={{ opacity: cancelled ? 0.6 : 1 }}>
                          <span className="text-sm font-semibold break-words min-w-0" style={{ color: THEME.ink, textDecoration: cancelled ? 'line-through' : 'none' }}>{o.customer || '—'}</span>
                          <span className="font-display text-lg leading-none flex-shrink-0" style={{ color: THEME.brand }}>{peso(ordTotal(o))}</span>
                        </div>
                        <div className="text-xs mt-1" style={{ color: THEME.inkSoft }}>{o.id} · {fmtDateShort(o.date)} · {n} item{n !== 1 ? 's' : ''}</div>
                        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                          {o.delivery_batch && batchTag(o.delivery_batch)}
                          <AreaChip area={area} onClick={(e) => openAreaPicker(e, o)} />
                          {statusBadges(o)}
                        </div>
                        {payDue(o)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-3 flex-wrap mt-4 no-print">
              <div className="text-sm" style={{ color: THEME.inkSoft }}>
                {(curPage - 1) * pageSize + 1}–{Math.min(curPage * pageSize, totalCount)} of {totalCount} order{totalCount !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs" style={{ color: THEME.inkSoft }}>
                  <span className="hidden sm:inline">Rows</span>
                  <select value={pageSize} onChange={(e) => changePageSize(Number(e.target.value))} aria-label="Orders per page"
                    className="px-2 py-1.5 rounded-lg outline-none text-sm"
                    style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink }}>
                    {[25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
                {totalPages > 1 && (
                  <nav className="flex items-center gap-1" aria-label="Pagination">
                    <button onClick={() => goPage(curPage - 1)} disabled={curPage === 1} aria-label="Previous page"
                      className="w-9 h-9 flex items-center justify-center rounded-lg disabled:opacity-35 mn-btn"
                      style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink }}><ChevronLeft size={16} /></button>
                    {phone ? (
                      <span className="text-sm px-2" style={{ color: THEME.ink }}>{curPage} / {totalPages}</span>
                    ) : (() => {
                      const pages = [];
                      for (let p = 1; p <= totalPages; p++) {
                        if (p === 1 || p === totalPages || Math.abs(p - curPage) <= 1) pages.push(p);
                        else if (pages[pages.length - 1] !== '…') pages.push('…');
                      }
                      return pages.map((p, i) => p === '…'
                        ? <span key={`e${i}`} className="px-1 text-sm" style={{ color: THEME.inkSoft }}>…</span>
                        : (
                          <button key={p} onClick={() => goPage(p)} aria-current={p === curPage ? 'page' : undefined}
                            className="min-w-9 h-9 px-2.5 rounded-lg text-sm mn-btn"
                            style={{ background: p === curPage ? THEME.brand : THEME.card, color: p === curPage ? 'white' : THEME.ink, border: `1px solid ${p === curPage ? THEME.brand : THEME.line}` }}>
                            {p}
                          </button>
                        ));
                    })()}
                    <button onClick={() => goPage(curPage + 1)} disabled={curPage === totalPages} aria-label="Next page"
                      className="w-9 h-9 flex items-center justify-center rounded-lg disabled:opacity-35 mn-btn"
                      style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink }}><ChevronRight size={16} /></button>
                  </nav>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ===== Detail: docked panel on wide screens ===== */}
      {panelOpenDocked && (
        <aside aria-label="Order details"
          className={`no-print flex-shrink-0 sticky top-4 w-[460px] 2xl:w-[500px] rounded-2xl overflow-hidden flex flex-col ${closing ? 'mn-panel-out' : 'mn-panel-in'}`}
          style={{ height: 'calc(100vh - 2rem)', background: THEME.card, border: `1px solid ${THEME.line}`, boxShadow: '0 10px 30px rgba(42,38,36,0.08)' }}>
          {detail}
        </aside>
      )}
      {/* ===== Detail: overlay sheet on tablets and phones ===== */}
      {!docked && selectedOrder && (
        <OrderDetailOverlay closing={closing} phone={phone} onDismiss={requestClose}>{detail}</OrderDetailOverlay>
      )}

      <AreaPickerModal
        open={!!areaFor}
        onClose={() => setAreaFor(null)}
        areas={areas}
        currentId={areaFor && areaById[areaFor.area_id] ? areaFor.area_id : null}
        title={areaFor ? `Area for ${areaFor.customer}` : 'Area'}
        subtitle={areaFor && areaFor.delivery_address ? areaFor.delivery_address : 'Where this customer lives'}
        onPick={(id) => areaFor && assignArea(areaFor, id)}
        onCreate={createArea}
        onManage={() => { setAreaFor(null); setShowAreaManager(true); }}
        extra={areaFor && (() => {
          const n = untaggedSiblings(areaFor).length;
          return (
            <div className="text-xs leading-relaxed" style={{ color: THEME.inkSoft }}>
              {n > 0 && (
                <label className="flex items-start gap-2 mb-1.5 cursor-pointer" style={{ color: THEME.ink }}>
                  <input type="checkbox" checked={alsoOthers} onChange={(e) => setAlsoOthers(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: THEME.brand, marginTop: 1 }} />
                  <span>Also tag {areaFor.customer}'s {n} other untagged order{n !== 1 ? 's' : ''}</span>
                </label>
              )}
              Their next orders will be tagged automatically.
            </div>
          );
        })()}
      />
      <AreaManagerModal open={showAreaManager} onClose={() => setShowAreaManager(false)}
        areas={areas} setMeta={setMeta} orders={orders} setOrders={setOrders} customers={customers} setCustomers={setCustomers} />

      {areaToast && (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 pointer-events-none no-print">
          <div className="px-4 py-2.5 rounded-xl text-sm shadow-lg mn-rise" style={{ background: THEME.ink, color: THEME.bg }} role="status">
            <Check size={14} className="inline -mt-0.5 mr-1.5" />{areaToast}
          </div>
        </div>
      )}
    </div>
  );
}

// Overlay wrapper for the detail on screens narrower than 1360px: a right-side
// drawer on tablets, a full-screen sheet on phones. Modal: traps focus, locks
// page scroll, Escape/backdrop close (handled by the parent's guarded close).
function OrderDetailOverlay({ closing, phone, onDismiss, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el) {
      const target = el.querySelector('[data-autofocus]') || el;
      try { target.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  const onKeyDown = (e) => {
    if (e.key !== 'Tab' || !ref.current) return;
    const nodes = Array.from(ref.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter((n) => !n.disabled && n.offsetParent !== null);
    if (!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  return (
    <div className="fixed inset-0 z-[45] no-print">
      <div className={`absolute inset-0 ${closing ? 'mn-backdrop-out' : 'mn-backdrop-in'}`} style={{ background: 'rgba(30,20,18,0.5)' }} onClick={onDismiss} />
      <div ref={ref} role="dialog" aria-modal="true" aria-label="Order details" tabIndex={-1} onKeyDown={onKeyDown}
        className={`absolute flex flex-col outline-none ${phone
          ? `inset-0 ${closing ? 'mn-sheet-out' : 'mn-sheet-in'}`
          : `top-0 right-0 bottom-0 w-full max-w-[560px] ${closing ? 'mn-panel-out' : 'mn-panel-in'}`}`}
        style={{ background: THEME.card, boxShadow: '-12px 0 40px rgba(0,0,0,0.18)' }}>
        {children}
      </div>
    </div>
  );
}

// "⋯" menu for less frequent actions. Destructive items sit at the bottom.
function OrderMoreMenu({ order, onCancelOrder, onRestore, onDelete }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('touchstart', onDown); };
  }, [open]);
  const cancelled = order.delivery_status === 'Cancelled';
  const run = (fn) => { setOpen(false); fn(); };
  return (
    <div className="relative" ref={wrapRef}
      onKeyDown={(e) => { if (e.key === 'Escape' && open) { e.preventDefault(); setOpen(false); if (btnRef.current) btnRef.current.focus(); } }}>
      <button ref={btnRef} onClick={() => setOpen((v) => !v)} aria-haspopup="true" aria-expanded={open} aria-label="More actions"
        className="h-full w-12 flex items-center justify-center rounded-xl mn-btn"
        style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink, minHeight: 46 }}>
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 bottom-full mb-2 w-56 rounded-xl p-1.5 z-10 mn-pop-in"
          style={{ background: THEME.card, border: `1px solid ${THEME.line}`, boxShadow: '0 12px 32px rgba(42,38,36,0.18)' }}>
          {cancelled ? (
            <button role="menuitem" onClick={() => run(onRestore)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left row-hover" style={{ color: THEME.ink }}>
              <RefreshCw size={15} /> Restore order
            </button>
          ) : (
            <button role="menuitem" onClick={() => run(onCancelOrder)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left row-hover" style={{ color: THEME.ink }}>
              <X size={15} /> Cancel order
            </button>
          )}
          <div className="my-1" style={{ borderTop: `1px solid ${THEME.line}` }} />
          <button role="menuitem" onClick={() => run(onDelete)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left danger-hover" style={{ color: THEME.red }}>
            <Trash2 size={15} /> Delete order
          </button>
        </div>
      )}
    </div>
  );
}

// Order detail — used in the docked right panel (wide screens) and in the
// overlay sheet (tablets / phones). Header and footer stay put; only the
// body scrolls. All data changes go through the same onUpdate / onSaveFull /
// onDelete callbacks as before, with the same fields.
function OrderDetail({ order, catalog, productByName, onClose, onDelete, onPrint, onUpdate, onSaveFull, area, onEditArea, onDirtyChange, sync, narrow }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [draftBase, setDraftBase] = useState('');
  const [err, setErr] = useState('');
  const [finOpen, setFinOpen] = useState(false);
  const bodyRef = useRef(null);
  const titleRef = useRef(null);
  const editBtnRef = useRef(null);
  const mountedRef = useRef(false);

  // ── Save feedback, driven by the app's real persistence state ──
  // 'pending' → we changed something; 'saving' → the app's cloud save is in
  // flight; 'done' → it finished, and syncStatus says where it landed.
  const [syncPhase, setSyncPhase] = useState('idle');
  const sawSaving = useRef(false);
  const isSaving = !!(sync && sync.saving);
  const syncStatus = sync ? sync.syncStatus : null;
  const markChanged = () => { sawSaving.current = false; setSyncPhase('pending'); };
  useEffect(() => {
    if (syncPhase !== 'pending' && syncPhase !== 'saving') return;
    if (isSaving) { sawSaving.current = true; if (syncPhase === 'pending') setSyncPhase('saving'); }
    else if (sawSaving.current) setSyncPhase('done');
  }, [isSaving, syncPhase]);
  useEffect(() => {
    // Never saw a save start — say nothing rather than guess.
    if (syncPhase !== 'pending') return undefined;
    const t = setTimeout(() => setSyncPhase((p) => (p === 'pending' ? 'idle' : p)), 2500);
    return () => clearTimeout(t);
  }, [syncPhase]);
  useEffect(() => {
    // A confirmed cloud save fades out; a "this device only" warning stays.
    if (syncPhase !== 'done' || syncStatus !== 'cloud') return undefined;
    const t = setTimeout(() => setSyncPhase('idle'), 3500);
    return () => clearTimeout(t);
  }, [syncPhase, syncStatus]);

  const update = (patch) => { onUpdate(patch); markChanged(); };
  const saveFull = (o) => { onSaveFull(o); markChanged(); };

  const startEdit = () => {
    const d = orderDetails(order);
    const initial = {
      date: order.date || today(),
      customer: order.customer || '',
      phone: order.phone || '',
      payment_status: order.payment_status || 'Paid',
      payment_method: order.payment_method || 'Gcash',
      delivery_status: order.delivery_status || 'Pending',
      delivery_batch: order.delivery_batch || '',
      delivery_address: d.address || '',
      customer_note: d.customerNote || '',
      internal_notes: d.internalNotes || '',
      amount_paid: order.amount_paid ?? '',
      items: (order.items || []).map((it) => ({ ...it })),
    };
    setDraft(initial);
    setDraftBase(JSON.stringify(initial));
    setErr('');
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setDraft(null); setDraftBase(''); setErr(''); };

  // Unsaved-change tracking for the parent's close / switch / navigate guard.
  const dirty = editing && !!draft && JSON.stringify(draft) !== draftBase;
  useEffect(() => {
    if (onDirtyChange) onDirtyChange(dirty);
  }, [dirty]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (onDirtyChange) onDirtyChange(false); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep keyboard focus somewhere sensible when switching view ↔ edit.
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
    const el = editing ? titleRef.current : editBtnRef.current;
    if (el) { try { el.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
  }, [editing]);

  const dUpdateItem = (idx, patch) => {
    setDraft({ ...draft, items: draft.items.map((it, i) => i === idx ? { ...it, ...patch } : it) });
  };
  const dChangeProduct = (idx, name) => {
    const p = productByName[name];
    const it = draft.items[idx];
    // Re-price to the product's current price/cost when product changes,
    // honoring this line's wholesale flag.
    const unitPrice = p ? (it.wholesale ? rqPricing(p).wholesale : p.price) : (it.price || 0);
    const updated = p
      ? { ...it, product: name, price: unitPrice, cost: p.cost, unit: p.unit }
      : { ...it, product: name };
    setDraft({ ...draft, items: draft.items.map((x, i) => i === idx ? updated : x) });
  };
  // Toggle wholesale on a single line — re-prices that line accordingly.
  const dToggleLineWholesale = (idx, on) => {
    const it = draft.items[idx];
    const p = productByName[it.product];
    const price = p ? (on ? rqPricing(p).wholesale : p.price) : it.price;
    setDraft({ ...draft, items: draft.items.map((x, i) => i === idx ? { ...x, wholesale: on, price } : x) });
  };
  // Toggle wholesale on the whole order — cascades to every line.
  const dToggleAllWholesale = (on) => {
    setDraft({
      ...draft,
      items: draft.items.map((it) => {
        const p = productByName[it.product];
        const price = p ? (on ? rqPricing(p).wholesale : p.price) : it.price;
        return { ...it, wholesale: on, price };
      }),
    });
  };
  const dAddItem = () => setDraft({ ...draft, items: [...draft.items, { product: '', qty: 1, note: '', price: 0, cost: 0, unit: 'kg', wholesale: false }] });
  const dRemoveItem = (idx) => setDraft({ ...draft, items: draft.items.filter((_, i) => i !== idx) });

  const saveEdit = () => {
    setErr('');
    if (!draft.customer.trim()) { setErr('Customer name is required'); return; }
    const cleanItems = draft.items
      .filter(it => it.product && Number(it.qty) > 0)
      .map(it => {
        const p = productByName[it.product];
        // Honor the line's wholesale flag when determining the saved price.
        const unitPrice = p
          ? (it.wholesale ? rqPricing(p).wholesale : p.price)
          : (Number(it.price) || 0);
        return {
          product: it.product,
          qty: Number(it.qty),
          price: unitPrice,
          cost: p ? p.cost : Number(it.cost) || 0,
          unit: p ? p.unit : (it.unit || 'kg'),
          note: (it.note || '').trim(),
          wholesale: !!it.wholesale,
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
      delivery_address: (draft.delivery_address || '').trim(),
      customer_note: (draft.customer_note || '').trim(),
      internal_notes: (draft.internal_notes || '').trim(),
      // Legacy combined note retired now that fields are structured.
      notes: '',
      amount_paid: draft.payment_status === 'Partial' ? (draft.amount_paid === '' ? '' : Number(draft.amount_paid) || 0) : '',
      items: cleanItems,
      edited_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveFull(updated);
    setEditing(false);
    setDraft(null);
    setDraftBase('');
  };

  const cancelOrder = () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    const reason = prompt('Optional — type a reason (e.g. "customer changed mind"):', '');
    update({ delivery_status: 'Cancelled', cancel_reason: (reason || '').trim() });
  };
  const restoreOrder = () => update({ delivery_status: 'Pending', cancel_reason: '' });

  const view = editing ? draft : order;
  const cancelled = order.delivery_status === 'Cancelled';
  // Always reflect the current supplier cost from the catalog.
  const vCost = (it) => {
    const p = productByName[it.product];
    if (p && p.cost !== undefined && p.cost !== null && p.cost !== '') return Number(p.cost) || 0;
    return Number(it.cost) || 0;
  };
  const total = (view.items || []).reduce((s, i) => s + (Number(i.qty) || 0) * (i.price || 0), 0);
  const cost = (view.items || []).reduce((s, i) => s + (Number(i.qty) || 0) * vCost(i), 0);
  const profit = total - cost;

  // Balance shown in the panel (display only; same rules as the list).
  const bal = (() => {
    if ((editing ? draft.delivery_status : order.delivery_status) === 'Cancelled') return { cancelled: true };
    const ps = view.payment_status;
    if (ps === 'Paid') return { paid: total, due: 0 };
    if (ps === 'Partial') {
      const raw = view.amount_paid;
      if (raw === '' || raw === null || raw === undefined || isNaN(Number(raw))) return { unknown: true };
      const paid = Number(raw);
      return { paid, due: Math.max(0, total - paid) };
    }
    return { paid: 0, due: total };
  })();

  const d = orderDetails(order);
  const items = order.items || [];
  const ink = THEME.ink, soft = THEME.inkSoft, line = THEME.line;
  const sectionTitle = (text, extra) => (
    <div className="flex items-center justify-between gap-2 mb-2.5">
      <h3 className="text-xs uppercase font-semibold" style={{ color: soft, letterSpacing: '0.09em' }}>{text}</h3>
      {extra}
    </div>
  );
  const fieldCls = 'w-full px-3 py-2.5 rounded-lg outline-none text-sm';
  const fieldStyle = { background: THEME.card, border: `1px solid ${line}`, color: ink, fontFamily: 'DM Sans, sans-serif' };
  const footBtn = 'inline-flex items-center justify-center gap-1.5 px-3.5 rounded-xl text-sm font-semibold whitespace-nowrap mn-btn';
  const footH = { minHeight: 46 };

  const feedback = syncPhase === 'idle' ? null
    : (syncPhase === 'pending' || syncPhase === 'saving')
      ? { icon: <Loader2 size={13} className="animate-spin" />, text: 'Saving…', bg: THEME.ink, fg: THEME.bg }
      : syncStatus === 'cloud'
        ? { icon: <Check size={13} />, text: 'Saved to cloud', bg: THEME.successBg, fg: THEME.successInk }
        : syncStatus === 'local-only'
          ? { icon: <HardDrive size={13} />, text: 'Saved on this device only — not synced to the cloud yet', bg: THEME.warnBg, fg: THEME.warnInk }
          : { icon: <AlertCircle size={13} />, text: 'Saved on this device — cloud sync not confirmed', bg: THEME.warnBg, fg: THEME.warnInk };

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full" style={{ background: THEME.card }}>
      {/* ===== Header ===== */}
      <div className="flex-shrink-0 px-5 sm:px-6 pb-4" style={{ borderBottom: `1px solid ${line}`, paddingTop: narrow ? 'max(env(safe-area-inset-top), 16px)' : 20 }}>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h2 ref={titleRef} tabIndex={-1} className="font-display text-[26px] leading-tight break-words outline-none" style={{ color: THEME.brand }}>
              {editing ? (draft.customer.trim() || 'Customer') : (order.customer || '—')}
            </h2>
            <div className="text-sm mt-1" style={{ color: soft }}>
              <span className="font-medium" style={{ color: THEME.brand }}>{order.id}</span>
              {editing ? ' · Editing order' : (order.date ? ` · Ordered ${fmtDate(order.date)}` : '')}
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {!editing && (
              <button ref={editBtnRef} onClick={startEdit}
                className="inline-flex items-center gap-1.5 px-3 h-10 rounded-lg text-sm font-medium mn-btn"
                style={{ border: `1px solid ${line}`, color: ink, background: THEME.card }}>
                <Edit3 size={14} /> Edit
              </button>
            )}
            <button data-autofocus onClick={onClose} aria-label="Close order details"
              className="w-10 h-10 flex items-center justify-center rounded-lg row-hover" style={{ color: ink }}>
              <X size={20} />
            </button>
          </div>
        </div>
        {!editing && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {order.delivery_batch ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium" style={{ background: THEME.brandBg, color: THEME.brand }}>
                <CalendarDays size={14} /> {fmtBatchMed(order.delivery_batch)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium" style={{ background: THEME.warnBg, color: THEME.warnInk }}>
                <CalendarDays size={14} /> No batch set
              </span>
            )}
            {onEditArea && <AreaChip area={area} size="md" onClick={onEditArea} />}
            {cancelled && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold" style={{ background: THEME.errorBg, color: THEME.red }}>
                <X size={13} /> Cancelled
              </span>
            )}
          </div>
        )}
      </div>

      {/* ===== Body (scrolls) ===== */}
      <div ref={bodyRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 sm:px-6 py-5 space-y-6">
        {!editing && cancelled && (
          <div className="px-4 py-3 rounded-xl flex items-start gap-2.5" style={{ background: THEME.errorBg, color: THEME.red }}>
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-semibold">This order is cancelled.</span> It's excluded from sales, profit, and pickup totals but kept here for your records.
              {order.cancel_reason ? <div className="mt-1 break-words" style={{ color: ink }}>Reason: {order.cancel_reason}</div> : null}
            </div>
          </div>
        )}

        {/* Quick batch-set — view mode, no batch yet */}
        {!editing && !order.delivery_batch && !cancelled && (
          <div className="px-4 py-3 rounded-xl" style={{ background: THEME.warnBg, color: THEME.warnInk, border: `1px solid ${THEME.amber}` }}>
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>No delivery batch yet. Set one so it shows up in the right pickup list.</span>
            </div>
            <div className="flex gap-2 flex-wrap mt-2.5">
              {[['Tuesday', nextTuesday()], ['Saturday', nextSaturday()]].map(([label, iso]) => (
                <button key={label} onClick={() => saveFull({ ...order, delivery_batch: iso, updated_at: new Date().toISOString() })}
                  className="px-3 py-2 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 mn-btn"
                  style={{ background: THEME.brand, color: 'white' }}>
                  <Truck size={12} /> {label} ({batchLabel(iso).split(' · ')[1]})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===== Balance ===== */}
        {bal.cancelled ? (
          <div className="rounded-2xl px-4 py-4 sm:px-5" style={{ background: THEME.bg, border: `1px solid ${line}` }}>
            <div className="text-xs uppercase font-medium" style={{ color: soft, letterSpacing: '0.08em' }}>Order total</div>
            <div className="font-display text-3xl leading-none mt-1.5 tabular-nums" style={{ color: soft, textDecoration: 'line-through' }}>{peso(total)}</div>
            <div className="text-xs mt-2" style={{ color: soft }}>Cancelled — nothing to collect.</div>
          </div>
        ) : (
          <div className={`rounded-2xl overflow-hidden ${narrow ? '' : 'flex items-stretch'}`}
            style={{ background: bal.unknown ? THEME.warnBg : (bal.due > 0.004 ? THEME.brandBg : THEME.successBg) }}>
            <div className="flex-1 min-w-0 px-4 sm:px-5 py-4">
              <div className="text-xs uppercase font-medium" style={{ color: bal.unknown ? THEME.warnInk : soft, letterSpacing: '0.08em' }}>Balance due</div>
              {bal.unknown ? (
                <>
                  <div className="font-display text-4xl leading-none mt-2" style={{ color: THEME.warnInk }}>—</div>
                  <div className="text-xs mt-2 font-medium" style={{ color: THEME.warnInk }}>Partial payment, but the amount paid isn't recorded yet.</div>
                </>
              ) : (
                <>
                  <div key={`${bal.due}`} className="font-display text-4xl leading-none mt-2 tabular-nums mn-swap"
                    style={{ color: bal.due > 0.004 ? THEME.brand : THEME.green }}>{peso(bal.due)}</div>
                  {bal.due <= 0.004 && (
                    <div className="text-xs mt-2 font-semibold inline-flex items-center gap-1" style={{ color: THEME.green }}>
                      <CheckCircle size={13} /> Paid in full
                    </div>
                  )}
                </>
              )}
            </div>
            <div className={narrow ? 'grid grid-cols-2' : 'flex'} style={narrow ? { borderTop: `1px solid ${line}` } : undefined}>
              {[['Total', peso(total)], ['Paid', bal.unknown ? '—' : peso(bal.paid)]].map(([k, v], i) => (
                <div key={k} className="px-4 sm:px-5 py-3 flex flex-col justify-center" style={{ borderLeft: (!narrow || i) ? `1px solid ${line}` : 'none' }}>
                  <div className="text-xs uppercase font-medium" style={{ color: soft, letterSpacing: '0.08em' }}>{k}</div>
                  <div className="font-display text-xl tabular-nums mt-1 whitespace-nowrap" style={{ color: ink }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== VIEW MODE ===== */}
        {!editing && (
          <>
            <section>
              {sectionTitle(`Items (${items.length})`)}
              <ul style={{ borderTop: `1px solid ${line}` }}>
                {items.map((it, i) => (
                  <li key={i} className="py-3 grid gap-x-4 items-baseline"
                    style={{ gridTemplateColumns: narrow ? 'minmax(0,1fr) auto' : 'minmax(0,1fr) auto auto auto', borderBottom: `1px solid ${line}` }}>
                    <div className="min-w-0">
                      <div className="font-medium break-words" style={{ color: ink }}>
                        {it.product}
                        {it.wholesale && <span className="ml-1.5 align-middle text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded" style={{ background: THEME.brandBg, color: THEME.brand, letterSpacing: '0.05em' }}>Wholesale</span>}
                      </div>
                      {narrow && <div className="text-xs mt-0.5 tabular-nums" style={{ color: soft }}>{it.qty} {it.unit} × {peso(it.price)}</div>}
                      {it.note && (
                        <div className="text-sm mt-1 flex items-start gap-1.5" style={{ color: THEME.brand }}>
                          <Scissors size={13} className="mt-1 flex-shrink-0" />
                          <span className="min-w-0 break-words whitespace-pre-wrap">{it.note}</span>
                        </div>
                      )}
                    </div>
                    {!narrow && <div className="text-sm tabular-nums text-right whitespace-nowrap" style={{ color: soft }}>{it.qty} {it.unit}</div>}
                    {!narrow && <div className="text-sm tabular-nums text-right whitespace-nowrap" style={{ color: soft }}>{peso(it.price)}</div>}
                    <div className="font-semibold tabular-nums text-right whitespace-nowrap" style={{ color: ink }}>{peso(it.qty * it.price)}</div>
                  </li>
                ))}
                <li className="py-2.5 flex items-center justify-between text-sm" style={{ borderBottom: `1px solid ${line}` }}>
                  <span style={{ color: soft }}>Order total</span>
                  <span className="font-semibold tabular-nums" style={{ color: ink }}>{peso(total)}</span>
                </li>
              </ul>
            </section>

            {d.customerNote && (
              <section className="rounded-xl px-4 py-3" style={{ background: THEME.bg, borderLeft: `3px solid ${THEME.accent}` }}>
                <div className="text-xs uppercase font-semibold mb-1" style={{ color: soft, letterSpacing: '0.09em' }}>Customer note</div>
                <div className="text-sm break-words whitespace-pre-wrap" style={{ color: ink }}>{d.customerNote}</div>
              </section>
            )}

            <section>
              {sectionTitle('Payment & delivery', <span className="text-[11px]" style={{ color: soft }}>Changes save right away</span>)}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Payment status</Label>
                  <Select aria-label="Payment status" value={order.payment_status}
                    onChange={(e) => update({ payment_status: e.target.value })} options={PAYMENT_STATUSES} />
                </div>
                <div>
                  <Label>Payment method</Label>
                  <Select aria-label="Payment method" value={order.payment_method || 'Gcash'}
                    onChange={(e) => update({ payment_method: e.target.value })} options={PAYMENT_METHODS} />
                </div>
                <div className="col-span-2">
                  <Label>Delivery status</Label>
                  <Select aria-label="Delivery status" value={order.delivery_status}
                    onChange={(e) => update({ delivery_status: e.target.value })} options={DELIVERY_STATUSES} />
                </div>
              </div>
              {order.payment_status === 'Partial' && (
                <div className="mt-3 rounded-xl p-3" style={{ background: THEME.bg }}>
                  <Label>Amount paid so far (₱)</Label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-40">
                      <Input type="number" step="0.01" min="0" inputMode="decimal" aria-label="Amount paid so far"
                        value={order.amount_paid ?? ''}
                        onChange={(e) => { const v = e.target.value; update({ amount_paid: v === '' ? '' : Number(v) }); }}
                        placeholder="0.00" />
                    </div>
                    <div className="text-sm" style={{ color: soft }}>
                      Balance: <span className="font-semibold" style={{ color: THEME.red }}>
                        {peso(Math.max(0, total - (Number(order.amount_paid) || 0)))}
                      </span> of {peso(total)}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-xl" style={{ border: `1px solid ${line}` }}>
              <button onClick={() => setFinOpen((v) => !v)} aria-expanded={finOpen} aria-controls={`fin-${order.id}`}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-sm font-medium row-hover" style={{ color: ink }}>
                <span className="inline-flex items-center gap-2"><BarChart3 size={15} style={{ color: soft }} /> Financial breakdown</span>
                <ChevronDown size={16} style={{ color: soft, transition: 'transform 0.18s ease', transform: finOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
              <div id={`fin-${order.id}`} className={`mn-collapse ${finOpen ? 'open' : ''}`} aria-hidden={!finOpen}>
                <div>
                  <div className="grid grid-cols-3 gap-2 px-4 pb-4 pt-1">
                    <div><div className="text-xs uppercase tracking-wider" style={{ color: soft }}>Sales</div><div className="font-display text-lg" style={{ color: THEME.brand }}>{peso(total)}</div></div>
                    <div><div className="text-xs uppercase tracking-wider" style={{ color: soft }}>Cost</div><div className="font-display text-lg" style={{ color: soft }}>{peso(cost)}</div></div>
                    <div><div className="text-xs uppercase tracking-wider" style={{ color: soft }}>Profit</div><div className="font-display text-lg" style={{ color: THEME.green }}>{peso(profit)}</div></div>
                  </div>
                </div>
              </div>
            </section>

            {(() => {
              const rows = [
                order.phone && ['Contact', order.phone],
                d.contactMethod && ['Contact method', d.contactMethod],
                d.address && ['Delivery address', d.address],
                d.preferredDate && ['Preferred date', d.preferredDate],
                d.preferredTime && ['Preferred time', d.preferredTime],
                d.source && ['Source', d.source],
                d.onlineRef && ['Online ref', d.onlineRef],
              ].filter(Boolean);
              if (rows.length === 0 && !d.internalNotes) return null;
              return (
                <section>
                  {sectionTitle('Customer & delivery')}
                  <dl className="rounded-xl px-4 py-3 text-sm space-y-2" style={{ background: THEME.bg }}>
                    {rows.map(([k, v]) => (
                      <div key={k} className="grid gap-3" style={{ gridTemplateColumns: '7.5rem minmax(0,1fr)' }}>
                        <dt className="text-xs uppercase pt-0.5" style={{ color: soft, letterSpacing: '0.04em' }}>{k}</dt>
                        <dd className="min-w-0 break-words" style={{ color: ink }}>{v}</dd>
                      </div>
                    ))}
                    {d.internalNotes && (
                      <div className="grid gap-3 pt-2" style={{ gridTemplateColumns: '7.5rem minmax(0,1fr)', borderTop: rows.length ? `1px solid ${line}` : 'none' }}>
                        <dt className="text-xs uppercase pt-0.5 flex items-start gap-1" style={{ color: soft, letterSpacing: '0.04em' }}><EyeOff size={11} className="mt-0.5" />Internal notes</dt>
                        <dd className="min-w-0 break-words whitespace-pre-wrap" style={{ color: ink }}>{d.internalNotes}</dd>
                      </div>
                    )}
                  </dl>
                </section>
              );
            })()}
          </>
        )}

        {/* ===== EDIT MODE ===== */}
        {editing && (
          <>
            <section>
              {sectionTitle('Customer')}
              <div className="space-y-3">
                <div><Label>Customer name</Label><Input aria-label="Customer name" value={draft.customer} onChange={(e) => setDraft({ ...draft, customer: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Phone</Label><Input aria-label="Phone" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="optional" /></div>
                  <div><Label>Order date</Label><Input aria-label="Order date" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></div>
                </div>
              </div>
              <DeliveryBatchPicker value={draft.delivery_batch} onChange={(v) => setDraft({ ...draft, delivery_batch: v })} allowUnassign />
            </section>

            <section>
              {sectionTitle(`Items (${draft.items.length})`,
                <button onClick={dAddItem} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium mn-btn"
                  style={{ border: `1px solid ${line}`, color: ink, background: THEME.card }}><Plus size={14} /> Add item</button>)}

              {/* Order-level wholesale toggle — cascades to all lines; per-line
                  checkboxes below can still override individual items. */}
              {(() => {
                const allWholesale = draft.items.length > 0 && draft.items.every((it) => it.wholesale);
                return (
                  <label className="flex items-start gap-3 mb-3 p-3 rounded-xl cursor-pointer"
                    style={{ background: allWholesale ? THEME.brandBg : 'transparent', border: `1px solid ${allWholesale ? THEME.brand : line}` }}>
                    <input type="checkbox" checked={allWholesale} onChange={(e) => dToggleAllWholesale(e.target.checked)}
                      className="mt-0.5" style={{ width: 18, height: 18, accentColor: THEME.brand }} />
                    <div className="text-sm">
                      <span className="font-medium" style={{ color: allWholesale ? THEME.brand : ink }}>Wholesale order (business client)</span>
                      <div className="text-xs mt-0.5" style={{ color: soft }}>Switch this order to wholesale pricing. Per-line checkbox below can override individual items.</div>
                    </div>
                  </label>
                );
              })()}

              <div className="space-y-2.5">
                {draft.items.map((it, idx) => {
                  const lt = (Number(it.qty) || 0) * (it.price || 0);
                  const p = productByName[it.product];
                  return (
                    <div key={idx} className="rounded-xl p-3 space-y-2.5" style={{ background: THEME.bg, border: `1px solid ${line}` }}>
                      <div className="flex items-end gap-2">
                        <div className="flex-1 min-w-0">
                          <Label>Product</Label>
                          <select value={it.product} onChange={(e) => dChangeProduct(idx, e.target.value)} aria-label={`Product, line ${idx + 1}`}
                            className={fieldCls} style={fieldStyle}>
                            <option value="">— Select product —</option>
                            {['Pork', 'Chicken', 'Beef'].map((group) => (
                              <optgroup key={group} label={group}>
                                {catalog.filter(c => c.group === group).map(c => (<option key={c.name} value={c.name}>{c.name}</option>))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                        {draft.items.length > 1 && (
                          <button onClick={() => dRemoveItem(idx)} aria-label={`Remove line ${idx + 1}${it.product ? `, ${it.product}` : ''}`}
                            className="w-10 h-10 flex items-center justify-center rounded-lg danger-hover flex-shrink-0" style={{ color: THEME.red }}>
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                      <div className="grid gap-2" style={{ gridTemplateColumns: '6.5rem minmax(0,1fr)' }}>
                        <div><Label>Qty</Label><Input aria-label={`Quantity, line ${idx + 1}`} type="number" step="0.01" min="0" inputMode="decimal" value={it.qty} onChange={(e) => dUpdateItem(idx, { qty: e.target.value })} /></div>
                        <div><Label>Cut / note</Label><Input aria-label={`Cut or note, line ${idx + 1}`} value={it.note || ''} onChange={(e) => dUpdateItem(idx, { note: e.target.value })} placeholder="e.g. thin slice" /></div>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        {p ? (
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" checked={!!it.wholesale} onChange={(e) => dToggleLineWholesale(idx, e.target.checked)}
                              style={{ width: 15, height: 15, accentColor: THEME.brand }} />
                            <span className="text-xs" style={{ color: it.wholesale ? THEME.brand : soft }}>Wholesale</span>
                          </label>
                        ) : <span />}
                        <span className="text-right">
                          <span className="font-semibold tabular-nums" style={{ color: ink }}>{lt > 0 ? peso(lt) : '—'}</span>
                          {p && it.wholesale && <span className="block text-xs" style={{ color: THEME.brand }}>@ {peso(it.price)}/kg</span>}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs mt-2" style={{ color: soft }}>Note: changing a product re-prices that line to the product's current price.</div>
            </section>

            <section className="rounded-xl" style={{ border: `1px solid ${line}` }}>
              <div className="px-4 pt-3 text-sm font-medium inline-flex items-center gap-2" style={{ color: ink }}><BarChart3 size={15} style={{ color: soft }} /> Financial breakdown</div>
              <div className="grid grid-cols-3 gap-2 px-4 pb-4 pt-2">
                <div><div className="text-xs uppercase tracking-wider" style={{ color: soft }}>Sales</div><div className="font-display text-lg" style={{ color: THEME.brand }}>{peso(total)}</div></div>
                <div><div className="text-xs uppercase tracking-wider" style={{ color: soft }}>Cost</div><div className="font-display text-lg" style={{ color: soft }}>{peso(cost)}</div></div>
                <div><div className="text-xs uppercase tracking-wider" style={{ color: soft }}>Profit</div><div className="font-display text-lg" style={{ color: THEME.green }}>{peso(profit)}</div></div>
              </div>
            </section>

            <section>
              {sectionTitle('Payment & delivery')}
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Payment status</Label><Select aria-label="Payment status" value={draft.payment_status} onChange={(e) => setDraft({ ...draft, payment_status: e.target.value })} options={PAYMENT_STATUSES} /></div>
                <div><Label>Payment method</Label><Select aria-label="Payment method" value={draft.payment_method} onChange={(e) => setDraft({ ...draft, payment_method: e.target.value })} options={PAYMENT_METHODS} /></div>
                <div className="col-span-2"><Label>Delivery status</Label><Select aria-label="Delivery status" value={draft.delivery_status} onChange={(e) => setDraft({ ...draft, delivery_status: e.target.value })} options={DELIVERY_STATUSES} /></div>
              </div>
              {draft.payment_status === 'Partial' && (
                <div className="mt-3 rounded-xl p-3" style={{ background: THEME.bg }}>
                  <Label>Amount paid so far (₱)</Label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-40">
                      <Input type="number" step="0.01" min="0" inputMode="decimal" aria-label="Amount paid so far"
                        value={draft.amount_paid ?? ''} onChange={(e) => setDraft({ ...draft, amount_paid: e.target.value })} placeholder="0.00" />
                    </div>
                    <div className="text-sm" style={{ color: soft }}>
                      Balance: <span className="font-semibold" style={{ color: THEME.red }}>{peso(Math.max(0, total - (Number(draft.amount_paid) || 0)))}</span> of {peso(total)}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-3">
              {sectionTitle('Delivery & notes')}
              <div><Label>Delivery address</Label><Input aria-label="Delivery address" value={draft.delivery_address} onChange={(e) => setDraft({ ...draft, delivery_address: e.target.value })} placeholder="House / street / subdivision, barangay" /></div>
              <div>
                <Label>Customer note</Label>
                <textarea value={draft.customer_note} onChange={(e) => setDraft({ ...draft, customer_note: e.target.value })} rows={2} aria-label="Customer note"
                  className={fieldCls} style={fieldStyle} placeholder="Shows on the customer's order summary" />
              </div>
              <div>
                <Label>Internal notes</Label>
                <textarea value={draft.internal_notes} onChange={(e) => setDraft({ ...draft, internal_notes: e.target.value })} rows={2} aria-label="Internal notes"
                  className={fieldCls} style={fieldStyle} placeholder="Admin only — never shown to the customer or supplier" />
              </div>
            </section>

            {err && (
              <div className="px-4 py-3 rounded-xl flex items-start gap-2 text-sm" role="alert" style={{ background: THEME.errorBg, color: THEME.red }}>
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />{err}
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== Footer (stays put) ===== */}
      <div className="flex-shrink-0 relative px-4 sm:px-5 pt-3" style={{ borderTop: `1px solid ${line}`, background: THEME.card, paddingBottom: narrow ? 'max(env(safe-area-inset-bottom), 12px)' : 14 }}>
        <div className="absolute inset-x-0 bottom-full flex justify-center px-4 pb-2 pointer-events-none" role="status" aria-live="polite">
          {feedback && (
            <span key={feedback.text} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-md mn-pop-in"
              style={{ background: feedback.bg, color: feedback.fg }}>
              {feedback.icon} {feedback.text}
            </span>
          )}
        </div>
        {editing ? (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={cancelEdit} className={footBtn} style={{ ...footH, background: THEME.card, color: ink, border: `1px solid ${line}` }}>Cancel</button>
            <button onClick={saveEdit} className={footBtn} style={{ ...footH, background: THEME.brand, color: 'white', border: `1px solid ${THEME.brand}` }}>
              <Save size={15} /> Save changes
            </button>
          </div>
        ) : (
          <div className={narrow ? 'grid gap-2' : 'flex gap-2'} style={narrow ? { gridTemplateColumns: '1fr 1fr auto' } : undefined}>
            <button onClick={onClose} className={`${footBtn} ${narrow ? '' : 'flex-1 min-w-[96px]'}`}
              style={{ ...footH, background: THEME.brand, color: 'white', border: `1px solid ${THEME.brand}`, gridColumn: narrow ? '1 / -1' : undefined }}>
              <Check size={16} /> Done
            </button>
            <button onClick={() => onPrint('invoice')} className={footBtn} style={{ ...footH, background: THEME.card, color: ink, border: `1px solid ${line}` }}>
              <Receipt size={15} /> Invoice
            </button>
            <button onClick={() => onPrint('supplier')} className={footBtn} style={{ ...footH, background: THEME.card, color: ink, border: `1px solid ${line}` }}>
              <FileText size={15} /> Supplier copy
            </button>
            <OrderMoreMenu order={order} onCancelOrder={cancelOrder} onRestore={restoreOrder} onDelete={onDelete} />
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

/* ============================================================
   AREA UI — chip, picker, manager
   ============================================================ */

// Pastel tag in the area's color. With no area and an onClick, shows a
// dashed "+ Area" prompt so tagging is one tap away.
function AreaChip({ area, onClick, size = 'sm', variant = 'pill' }) {
  const pad = size === 'xs' ? 'px-1.5 py-0.5 text-[11px]' : size === 'md' ? 'px-2.5 py-1 text-sm' : 'px-2 py-0.5 text-xs';
  if (area && variant === 'dot') {
    const t = areaTone(area.color);
    const inner = (<><span style={{ width: 8, height: 8, borderRadius: '50%', background: t.dot, flexShrink: 0 }} /><span className={`min-w-0 text-left ${(area.name || '').length > 18 ? 'break-words' : 'whitespace-nowrap'}`}>{area.name}</span></>);
    const cls = 'inline-flex items-center gap-2 text-sm max-w-full rounded-md';
    return onClick
      ? <button type="button" onClick={onClick} className={`${cls} px-1 -mx-1 py-0.5 row-hover`} style={{ color: THEME.ink }} title="Change area" aria-label={`Area: ${area.name}. Change area`}>{inner}</button>
      : <span className={cls} style={{ color: THEME.ink }}>{inner}</span>;
  }
  if (!area) {
    if (!onClick) return null;
    return (
      <button type="button" onClick={onClick} aria-label="Set area"
        className={`inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap ${pad}`}
        style={{ border: `1px dashed ${THEME.inkSoft}`, color: THEME.inkSoft, background: 'transparent' }}>
        <Plus size={10} /> Area
      </button>
    );
  }
  const t = areaTone(area.color);
  const inner = (<><span style={{ width: 7, height: 7, borderRadius: '50%', background: t.dot, flexShrink: 0 }} />{area.name}</>);
  const cls = `inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap ${pad}`;
  return onClick
    ? <button type="button" onClick={onClick} className={cls} style={{ background: t.bg, color: t.ink }} title="Change area">{inner}</button>
    : <span className={cls} style={{ background: t.bg, color: t.ink }}>{inner}</span>;
}

// Pick (or create) an area for an order. `extra` renders under the list
// (e.g. "also tag this customer's other orders").
function AreaPickerModal({ open, onClose, areas, currentId, title, subtitle, onPick, onCreate, onManage, extra }) {
  const [q, setQ] = useState('');
  useEffect(() => { if (open) setQ(''); }, [open]);
  if (!open) return null;
  const query = q.trim();
  const shown = (areas || []).filter((a) => !query || a.name.toLowerCase().includes(query.toLowerCase()));
  const exact = (areas || []).some((a) => a.name.trim().toLowerCase() === query.toLowerCase());
  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="font-display text-lg" style={{ color: THEME.ink }}>{title || 'Choose area'}</div>
            {subtitle && <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded row-hover" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: THEME.inkSoft }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search or type a new area…"
            onKeyDown={(e) => { if (e.key === 'Enter' && query && !exact && onCreate) onPick(onCreate(query)); }}
            className="w-full pl-8 pr-3 py-2 rounded-lg outline-none text-sm"
            style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink }} />
        </div>
        <div className="space-y-1 max-h-72 overflow-y-auto">
          {shown.map((a) => {
            const on = a.id === currentId;
            return (
              <button key={a.id} onClick={() => onPick(a.id)}
                className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left row-hover"
                style={{ background: on ? THEME.brandBg : 'transparent' }}>
                <AreaChip area={a} size="md" />
                {on && <Check size={16} style={{ color: THEME.brand }} />}
              </button>
            );
          })}
          {query && !exact && onCreate && (
            <button onClick={() => onPick(onCreate(query))}
              className="w-full flex items-center gap-2 px-2.5 py-2.5 rounded-lg text-left text-sm row-hover" style={{ color: THEME.brand }}>
              <Plus size={15} /> Create “{query}”
            </button>
          )}
          {!query && (areas || []).length === 0 && (
            <div className="text-sm py-3 px-1" style={{ color: THEME.inkSoft }}>
              No areas yet. Type a place your customers live, like “The Bellecourt”, to create the first one.
            </div>
          )}
          {currentId && (
            <button onClick={() => onPick(null)}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-sm row-hover" style={{ color: THEME.inkSoft }}>
              <X size={14} /> Remove area
            </button>
          )}
        </div>
        {extra && <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${THEME.line}` }}>{extra}</div>}
        {onManage && (
          <button onClick={onManage} className="text-xs font-medium mt-3" style={{ color: THEME.inkSoft }}>
            Rename, recolor or delete areas →
          </button>
        )}
      </div>
    </Modal>
  );
}

// Rename / recolor / set keywords / delete areas, and bulk-tag untagged
// orders whose address mentions an area (only when the admin taps it).
function AreaManagerModal({ open, onClose, areas, setMeta, orders, setOrders, customers, setCustomers }) {
  const [newName, setNewName] = useState('');
  if (!open) return null;
  const list = areas || [];
  const valid = new Set(list.map((a) => a.id));
  const now = () => new Date().toISOString();
  const patchArea = (id, patch) => setMeta((m) => ({
    ...m, areas: (m.areas || []).map((a) => (a.id === id ? { ...a, ...patch, updated_at: now() } : a)),
  }));
  const addArea = () => {
    const name = newName.trim();
    if (!name || list.some((a) => a.name.trim().toLowerCase() === name.toLowerCase())) return;
    setMeta((m) => ({ ...m, areas: [...(m.areas || []), newAreaRecord(m.areas || [], name)] }));
    setNewName('');
  };
  const removeArea = (a) => {
    const used = Object.values(orders || {}).filter((o) => o.area_id === a.id).length;
    if (!confirm(`Delete the area “${a.name}”?${used ? ` ${used} order${used !== 1 ? 's' : ''} will lose this tag.` : ''}`)) return;
    setMeta((m) => ({
      ...m,
      areas: (m.areas || []).filter((x) => x.id !== a.id),
      deletedAreas: { ...(m.deletedAreas || {}), [a.id]: now() },
    }));
  };
  // Untagged orders / customers whose address points to exactly this area.
  const matchesFor = (a) => ({
    orders: Object.values(orders || {}).filter((o) => !valid.has(o.area_id) && detectArea(list, o.delivery_address) === a.id),
    customers: Object.values(customers || {}).filter((c) => !valid.has(c.area_id) && detectArea(list, c.address) === a.id),
  });
  const applyMatches = (a) => {
    const { orders: os, customers: cs } = matchesFor(a);
    const t = now();
    if (os.length) setOrders((prev) => {
      const next = { ...prev };
      os.forEach((o) => { if (next[o.id]) next[o.id] = { ...next[o.id], area_id: a.id, updated_at: t }; });
      return next;
    });
    if (cs.length && setCustomers) setCustomers((prev) => {
      const next = { ...prev };
      cs.forEach((c) => { if (next[c.id]) next[c.id] = { ...next[c.id], area_id: a.id, updated_at: t }; });
      return next;
    });
  };
  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-lg">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="font-display text-xl" style={{ color: THEME.ink }}>Areas</div>
          <button onClick={onClose} className="p-1.5 rounded row-hover" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="text-xs mb-4" style={{ color: THEME.inkSoft }}>
          Group customers by where they live. "Also matches" words help spot the area inside an address, e.g. <span style={{ color: THEME.ink }}>Bellecourt, Belle St</span>.
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {list.map((a) => {
            const t = areaTone(a.color);
            const m = matchesFor(a);
            const tagged = Object.values(orders || {}).filter((o) => o.area_id === a.id).length;
            return (
              <div key={a.id} className="rounded-xl p-3" style={{ background: THEME.bg, border: `1px solid ${THEME.line}` }}>
                <div className="flex items-center gap-2">
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: t.dot, flexShrink: 0 }} />
                  <input value={a.name} onChange={(e) => patchArea(a.id, { name: e.target.value })}
                    className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg outline-none text-sm font-medium"
                    style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink }} />
                  <button onClick={() => removeArea(a)} className="p-1.5 rounded row-hover flex-shrink-0" style={{ color: THEME.red }} aria-label={`Delete ${a.name}`}>
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {AREA_COLORS.map((c) => {
                    const tone = THEME.bg === THEME_DARK.bg ? c.dark : c.light;
                    const on = a.color === c.id;
                    return (
                      <button key={c.id} onClick={() => patchArea(a.id, { color: c.id })} aria-label={`Color ${c.id}`}
                        className="rounded-full flex items-center justify-center"
                        style={{ width: 26, height: 26, background: tone.bg, border: `2px solid ${on ? tone.dot : 'transparent'}` }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: tone.dot }} />
                      </button>
                    );
                  })}
                </div>
                <input value={a.keywords || ''} onChange={(e) => patchArea(a.id, { keywords: e.target.value })}
                  placeholder="Also matches (optional, comma-separated)"
                  className="w-full mt-2.5 px-2.5 py-1.5 rounded-lg outline-none text-xs"
                  style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink }} />
                <div className="flex items-center justify-between gap-2 mt-2 text-xs" style={{ color: THEME.inkSoft }}>
                  <span>{tagged} order{tagged !== 1 ? 's' : ''} tagged</span>
                  {m.orders.length + m.customers.length > 0 && (
                    <button onClick={() => applyMatches(a)} className="font-semibold" style={{ color: THEME.brand }}>
                      Tag {m.orders.length} untagged order{m.orders.length !== 1 ? 's' : ''} that mention it
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 mt-4">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New area, e.g. Villa Caceres"
            onKeyDown={(e) => { if (e.key === 'Enter') addArea(); }} />
          <Btn variant="primary" onClick={addArea} disabled={!newName.trim()}><Plus size={14} className="inline -mt-0.5" /> Add</Btn>
        </div>
      </div>
    </Modal>
  );
}

function PickupMode({ batch, orders, onBack, areas = [] }) {
  // Ticks are kept on this device per batch, so leaving the screen (or the
  // phone locking) no longer wipes them. Shape: { [orderId]: { [itemKey]: true } }
  const storeKey = STORAGE_PREFIX + 'pick_' + batch;
  const [picked, setPicked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storeKey) || '{}') || {}; } catch (e) { return {}; }
  });
  const [openDone, setOpenDone] = useState({});        // completed cards the admin re-opened
  const cardRefs = useRef({});
  useEffect(() => {
    try { localStorage.setItem(storeKey, JSON.stringify(picked)); } catch (e) {}
  }, [picked, storeKey]);
  // Housekeeping: forget tick lists for batches more than two weeks old.
  useEffect(() => {
    try {
      const cutoff = isoLocal(new Date(Date.now() - 14 * 86400000));
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith(STORAGE_PREFIX + 'pick_') && k.slice((STORAGE_PREFIX + 'pick_').length) < cutoff) localStorage.removeItem(k);
      });
    } catch (e) {}
  }, []);

  // Item key survives edits that reorder lines better than a bare index.
  const itemKey = (it, i) => `${i}|${it.product}`;
  const isPicked = (o, it, i) => !!(picked[o.id] || {})[itemKey(it, i)];
  const togglePick = (o, it, i) => setPicked((prev) => {
    const op = prev[o.id] || {};
    const k = itemKey(it, i);
    return { ...prev, [o.id]: { ...op, [k]: !op[k] } };
  });
  const setAll = (o, on) => setPicked((prev) => ({
    ...prev,
    [o.id]: on ? Object.fromEntries((o.items || []).map((it, i) => [itemKey(it, i), true])) : {},
  }));

  const statusOf = (o) => {
    const items = o.items || [];
    const done = items.filter((it, i) => isPicked(o, it, i)).length;
    const state = items.length > 0 && done === items.length ? 'done' : done > 0 ? 'partial' : 'todo';
    return { done, total: items.length, state };
  };

  // Group customers by area (in the area list's order), untagged last.
  const areaById = Object.fromEntries((areas || []).map((a) => [a.id, a]));
  const groups = useMemo(() => {
    const byKey = {};
    orders.forEach((o) => {
      const k = areaById[o.area_id] ? o.area_id : '__none';
      (byKey[k] = byKey[k] || []).push(o);
    });
    const ordered = [...(areas || []).map((a) => a.id).filter((id) => byKey[id]), ...(byKey.__none ? ['__none'] : [])];
    return ordered.map((k) => ({
      area: k === '__none' ? null : areaById[k],
      orders: byKey[k].slice().sort((a, b) => (a.customer || '').localeCompare(b.customer || '')),
    }));
  }, [orders, areas]); // eslint-disable-line react-hooks/exhaustive-deps
  const flat = groups.flatMap((g) => g.orders);

  const totalsByProduct = useMemo(() => {
    const m = new Map();
    orders.forEach((o) => (o.items || []).forEach((it) => m.set(it.product, (m.get(it.product) || 0) + (Number(it.qty) || 0))));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [orders]);

  const stats = flat.map((o) => ({ o, s: statusOf(o) }));
  const totalItems = stats.reduce((n, x) => n + x.s.total, 0);
  const pickedItems = stats.reduce((n, x) => n + x.s.done, 0);
  const doneCustomers = stats.filter((x) => x.s.state === 'done').length;
  const allDone = flat.length > 0 && doneCustomers === flat.length;
  const pct = flat.length ? (doneCustomers / flat.length) * 100 : 0;

  const DONE_BG = THEME.successBg, DONE_INK = THEME.successInk, DONE_DOT = THEME.green;
  const scrollTo = (id) => {
    setOpenDone((s) => ({ ...s, [id]: true }));
    const el = cardRefs.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div>
      <div className="mb-5">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm mb-2" style={{ color: THEME.inkSoft }}>
          <ArrowLeft size={14} /> Back to Orders
        </button>
        <div className="font-display text-2xl" style={{ color: THEME.brand }}>Pickup Mode</div>
        <div className="text-sm mt-1" style={{ color: THEME.inkSoft }}>
          Batch <span className="font-medium" style={{ color: THEME.ink }}>{batchLabel(batch)}</span> · {orders.length} customer{orders.length !== 1 ? 's' : ''} · {totalItems} item{totalItems !== 1 ? 's' : ''}
        </div>
      </div>

      {/* ===== Status board: who's complete at a glance ===== */}
      {flat.length > 0 && (
        <Card className="p-4 sm:p-5 mb-4 mn-rise" style={allDone ? { background: DONE_BG, borderColor: DONE_DOT } : {}}>
          <div className="flex items-end justify-between gap-3 mb-2">
            <div>
              <div className="text-xs uppercase tracking-wider" style={{ color: THEME.inkSoft, letterSpacing: '0.08em' }}>Customers complete</div>
              <div className="font-display text-3xl leading-tight" style={{ color: allDone ? DONE_INK : THEME.ink }}>
                {doneCustomers}<span className="text-xl" style={{ color: THEME.inkSoft }}> / {flat.length}</span>
              </div>
            </div>
            <div className="text-right text-xs" style={{ color: THEME.inkSoft }}>
              {allDone ? (
                <span className="inline-flex items-center gap-1 font-semibold text-sm" style={{ color: DONE_INK }}><CheckCircle size={16} /> Everyone's order is complete</span>
              ) : (
                <>Items picked <span className="font-semibold" style={{ color: THEME.ink }}>{pickedItems}/{totalItems}</span></>
              )}
            </div>
          </div>
          <MrBar pct={pct} color={DONE_DOT} height={8} />
          <div className="flex flex-wrap gap-1.5 mt-3">
            {stats.map(({ o, s }) => {
              const st = s.state === 'done'
                ? { bg: DONE_BG, ink: DONE_INK, border: 'transparent' }
                : s.state === 'partial'
                  ? { bg: THEME.warnBg, ink: THEME.warnInk, border: 'transparent' }
                  : { bg: 'transparent', ink: THEME.inkSoft, border: THEME.line };
              return (
                <button key={o.id} onClick={() => scrollTo(o.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: st.bg, color: st.ink, border: `1px solid ${st.border}` }}
                  title={`${o.customer}: ${s.done} of ${s.total} picked`}>
                  {s.state === 'done' && <Check size={12} />}
                  <span className="max-w-[9rem] truncate">{o.customer}</span>
                  {s.state === 'partial' && <span className="opacity-80">{s.done}/{s.total}</span>}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-3 text-[11px]" style={{ color: THEME.inkSoft }}>
            <span className="inline-flex items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: '50%', background: DONE_DOT }} /> Complete</span>
            <span className="inline-flex items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: '50%', background: THEME.amber }} /> In progress</span>
            <span className="inline-flex items-center gap-1"><span style={{ width: 8, height: 8, borderRadius: '50%', border: `1px solid ${THEME.inkSoft}` }} /> Not started</span>
          </div>
        </Card>
      )}

      {/* Supplier buying reference */}
      {totalsByProduct.length > 0 && (
        <Card className="p-4 mb-5" style={{ background: THEME.brandBg }}>
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: THEME.brand, letterSpacing: '0.1em' }}>
            Total to buy from supplier
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {totalsByProduct.map(([prod, qty]) => (
              <span key={prod} className="text-sm">
                <span style={{ color: THEME.ink }}>{prod}:</span>{' '}
                <span className="font-semibold" style={{ color: THEME.brand }}>{Math.round(qty * 100) / 100} kg</span>
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
        <div className="space-y-6">
          {groups.map((g) => {
            const gDone = g.orders.filter((o) => statusOf(o).state === 'done').length;
            return (
              <div key={g.area ? g.area.id : 'none'}>
                {(areas || []).length > 0 && (
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    {g.area ? <AreaChip area={g.area} size="md" /> : <span className="text-sm font-medium" style={{ color: THEME.inkSoft }}>No area</span>}
                    <span className="text-xs" style={{ color: gDone === g.orders.length ? DONE_INK : THEME.inkSoft }}>
                      {gDone}/{g.orders.length} complete
                    </span>
                  </div>
                )}
                <div className="space-y-3">
                  {g.orders.map((order) => {
                    const items = order.items || [];
                    const s = statusOf(order);
                    const done = s.state === 'done';
                    const collapsed = done && !openDone[order.id];
                    const label = done ? 'All picked' : s.state === 'partial' ? `${s.done} of ${s.total} picked` : 'Not started';
                    const pill = done
                      ? { bg: DONE_BG, ink: DONE_INK }
                      : s.state === 'partial' ? { bg: THEME.warnBg, ink: THEME.warnInk } : { bg: THEME.bg, ink: THEME.inkSoft };
                    return (
                      <div key={order.id} ref={(el) => { cardRefs.current[order.id] = el; }} style={{ scrollMarginTop: 90 }}>
                        <Card className="p-4 sm:p-5" style={{ background: done ? DONE_BG : THEME.card, borderColor: done ? DONE_DOT : THEME.line, transition: 'background-color 0.25s ease' }}>
                          <div className={`flex items-start justify-between gap-3 ${collapsed ? '' : 'mb-3 pb-3'}`} style={collapsed ? {} : { borderBottom: `1px solid ${THEME.line}` }}>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="font-display text-lg leading-tight" style={{ color: done ? DONE_INK : THEME.brand }}>{order.customer}</div>
                                {done && <CheckCircle size={18} style={{ color: DONE_DOT }} />}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: pill.bg, color: pill.ink }}>{label}</span>
                                <span className="text-xs" style={{ color: THEME.inkSoft }}>{order.id}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                              {collapsed ? (
                                <button onClick={() => setOpenDone((o) => ({ ...o, [order.id]: true }))}
                                  className="text-xs font-medium px-3 py-2 rounded-lg" style={{ color: DONE_INK, border: `1px solid ${DONE_DOT}` }}>
                                  Show items
                                </button>
                              ) : done ? (
                                <button onClick={() => setAll(order, false)}
                                  className="text-xs font-medium px-3 py-2 rounded-lg" style={{ color: THEME.inkSoft, border: `1px solid ${THEME.line}`, background: THEME.card }}>
                                  Undo all
                                </button>
                              ) : (
                                <button onClick={() => setAll(order, true)}
                                  className="inline-flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-lg"
                                  style={{ background: DONE_DOT, color: THEME.bg === THEME_DARK.bg ? '#16240F' : 'white' }}>
                                  <Check size={15} /> Pick all
                                </button>
                              )}
                            </div>
                          </div>

                          {!collapsed && (
                            <div className="space-y-2">
                              {items.map((it, i) => {
                                const on = isPicked(order, it, i);
                                return (
                                  <label key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer"
                                    style={{ background: on ? THEME.successBg : 'transparent', border: `1px solid ${on ? DONE_DOT : THEME.line}` }}>
                                    <input type="checkbox" checked={on} onChange={() => togglePick(order, it, i)}
                                      style={{ width: 22, height: 22, accentColor: DONE_DOT, cursor: 'pointer', flexShrink: 0 }} />
                                    <div className="flex-1 flex items-center justify-between gap-3 min-w-0">
                                      <div className="min-w-0" style={{ textDecoration: on ? 'line-through' : 'none', color: on ? THEME.inkSoft : THEME.ink }}>
                                        <div className="text-sm font-medium">{it.product}</div>
                                        {it.note && <div className="text-xs italic mt-0.5" style={{ color: THEME.inkSoft }}>{it.note}</div>}
                                      </div>
                                      <div className="text-base font-semibold flex-shrink-0" style={{ color: on ? THEME.inkSoft : THEME.brand }}>
                                        {it.qty} {it.unit}
                                      </div>
                                    </div>
                                  </label>
                                );
                              })}
                              {done && openDone[order.id] && (
                                <button onClick={() => setOpenDone((o) => ({ ...o, [order.id]: false }))}
                                  className="text-xs font-medium mt-1" style={{ color: THEME.inkSoft }}>Hide items</button>
                              )}
                            </div>
                          )}
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-center gap-3 mt-6 text-xs" style={{ color: THEME.inkSoft }}>
        <span>Ticks are saved on this device for this batch.</span>
        {pickedItems > 0 && (
          <button onClick={() => { if (confirm('Clear every tick in this batch?')) { setPicked({}); setOpenDone({}); } }}
            className="font-medium underline" style={{ color: THEME.inkSoft }}>Clear all</button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   PRINTABLE INVOICE / SUPPLIER COPY
   ============================================================ */

/* ============================================================
   ORDER DOCUMENT (shared by single view + batch export)
   ============================================================
   The ONE source of truth for how a Supplier Copy / Invoice looks.
   PrintableView renders it for a single order; BatchExportView
   renders many of them for a whole delivery batch.                */
function OrderDocument({ order, mode, exporting = false }) {
  const total = (order.items || []).reduce((s, i) => s + i.qty * i.price, 0);
  const totalQty = (order.items || []).reduce((s, i) => s + Number(i.qty || 0), 0);
  const isInvoice = mode === 'invoice';
  return (
    <>

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
              {isInvoice && order.phone && <div className="text-sm mt-0.5" style={{ color: THEME.inkSoft }}>{order.phone}</div>}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs uppercase tracking-wider mb-1" style={{ color: THEME.inkSoft }}>Date</div>
              <div className="text-base sm:text-lg whitespace-nowrap">{fmtDate(order.date)}</div>
            </div>
          </div>

        {isInvoice ? (
          /* ===== INVOICE / ORDER SUMMARY ===== */
          <>
          <div className={`mb-6 overflow-x-auto ${exporting ? 'block' : 'hidden sm:block'}`}>
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
          {/* Mobile: stacked invoice rows (premium receipt style) */}
          <div className={`mb-6 ${exporting ? 'hidden' : 'block sm:hidden'}`}>
            {(order.items || []).map((it, i) => (
              <div key={i} className="py-3" style={{ borderBottom: `1px solid ${THEME.line}` }}>
                <div className="flex justify-between gap-2">
                  <div className="font-medium min-w-0">{it.product}</div>
                  <div className="font-medium whitespace-nowrap flex-shrink-0">{peso(it.qty * it.price)}</div>
                </div>
                {it.note && <div className="text-xs mt-0.5" style={{ color: THEME.brand }}>Cut: {it.note}</div>}
                <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>{it.qty} {it.unit} × {peso(it.price)}</div>
              </div>
            ))}
          </div>
          </>
        ) : (
          /* ===== SUPPLIER COPY: no costs ===== */
          <>
          <div className={`mb-6 overflow-x-auto ${exporting ? 'block' : 'hidden sm:block'}`}>
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
          {/* Mobile: stacked prep rows */}
          <div className={`mb-6 ${exporting ? 'hidden' : 'block sm:hidden'}`}>
            {(order.items || []).map((it, i) => (
              <div key={i} className="py-3 flex justify-between gap-3" style={{ borderBottom: `1px solid ${THEME.line}` }}>
                <div className="min-w-0">
                  <div className="font-medium">{it.product}</div>
                  {it.note && <div className="text-xs mt-0.5" style={{ color: THEME.brand }}>Cut: {it.note}</div>}
                </div>
                <div className="font-medium whitespace-nowrap flex-shrink-0">{it.qty} {it.unit}</div>
              </div>
            ))}
          </div>
          </>
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

        {isInvoice && (() => {
          const d = orderDetails(order);
          const deliveryWhen = order.delivery_batch ? batchLabel(order.delivery_batch) : (d.preferredDate || '');
          if (!deliveryWhen && !d.customerNote) return null;
          return (
            <div className="mt-6 pt-4 text-sm space-y-1" style={{ borderTop: `1px solid ${THEME.line}` }}>
              {deliveryWhen && (
                <div>
                  <span style={{ color: THEME.inkSoft }}>Delivery: </span>
                  <span style={{ color: THEME.ink }}>{deliveryWhen}{d.preferredTime ? ` · ${d.preferredTime}` : ''}</span>
                </div>
              )}
              {d.customerNote && (
                <div><span style={{ color: THEME.inkSoft }}>Customer Note: </span><span style={{ color: THEME.ink }}>{d.customerNote}</span></div>
              )}
            </div>
          );
        })()}

          {/* GCash payment strip — only when the order is actually paid via GCash.
              Stacks cleanly on a phone; stays side-by-side in the saved image. */}
          {isInvoice && /gcash/i.test(order.payment_method || 'Gcash') && (
            <div className={`mt-8 px-4 py-4 rounded-md flex gap-4 ${exporting ? 'flex-row items-center' : 'flex-col sm:flex-row sm:items-center'}`}
              style={{ background: THEME.brandBg, border: `1px solid ${THEME.line}` }}>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="p-1.5 rounded-md"
                  style={{ background: 'white', border: `1px solid ${THEME.line}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', flexShrink: 0 }}>
                  <img src={GCASH_QR} alt="GCash QR" width="88" height="88"
                    style={{ width: 88, height: 88, display: 'block', flexShrink: 0 }} />
                </div>
                <div>
                  <div className="text-[9px] font-semibold uppercase mb-0.5" style={{ color: THEME.brand, letterSpacing: '0.14em' }}>
                    Pay via GCash / InstaPay
                  </div>
                  <div className="text-lg font-bold leading-tight" style={{ color: '#0066CC', letterSpacing: '0.02em' }}>
                    {GCASH_NUMBER}
                  </div>
                </div>
              </div>
              <div className={`text-xs leading-relaxed ${exporting ? 'text-right ml-auto' : 'sm:text-right sm:ml-auto'}`} style={{ color: THEME.inkSoft }}>
                Please send a screenshot after payment.
              </div>
            </div>
          )}

          <div className="text-center mt-10 pt-6 text-sm" style={{ borderTop: `1px solid ${THEME.line}`, color: THEME.inkSoft }}>
            {isInvoice ? 'Thank you for your order!' : 'For supplier use only  ·  M&N Meatshop'}
          </div>
    </>
  );
}

// Render a document node to a PNG data URL (no download/share side effect).
// Exposed separately so batch export can render several documents first and
// deliver them together in a single Share Sheet call (see shareOrDownloadMultiple).
async function renderNodeToDataUrl(node) {
  const EXPORT_WIDTH = 680;
  const prevStyles = {
    width: node.style.width, minWidth: node.style.minWidth,
    maxWidth: node.style.maxWidth, overflow: node.style.overflow, position: node.style.position,
  };
  node.style.width = `${EXPORT_WIDTH}px`;
  node.style.minWidth = `${EXPORT_WIDTH}px`;
  node.style.maxWidth = `${EXPORT_WIDTH}px`;
  node.style.overflow = 'visible';
  node.style.position = 'relative';
  void node.offsetHeight;
  await new Promise((r) => setTimeout(r, 100));
  const scrollables = Array.from(node.querySelectorAll('*')).filter((el) => {
    const cs = getComputedStyle(el);
    return ['auto', 'scroll'].includes(cs.overflowX) || ['auto', 'scroll'].includes(cs.overflowY) || ['auto', 'scroll'].includes(cs.overflow);
  });
  const savedOverflow = scrollables.map((el) => ({ el, prev: el.style.overflow }));
  savedOverflow.forEach((s) => { s.el.style.overflow = 'visible'; });
  const imgs = Array.from(node.querySelectorAll('img'));
  await Promise.all(imgs.map(async (img) => {
    try { if (typeof img.decode === 'function') { await img.decode(); return; } } catch (e) {}
    if (img.complete && img.naturalWidth > 0) return;
    await new Promise((res) => { img.onload = res; img.onerror = res; });
  }));
  await new Promise((r) => setTimeout(r, 250));
  const opts = {
    quality: 1, pixelRatio: 2, backgroundColor: '#ffffff',
    width: EXPORT_WIDTH, height: node.scrollHeight, cacheBust: true,
    style: { margin: '0', transform: 'none' },
  };
  // iOS Safari renders base64 images unreliably on the first capture — triple-pass.
  let dataUrl = await toPng(node, opts);
  dataUrl = await toPng(node, opts);
  dataUrl = await toPng(node, opts);
  savedOverflow.forEach(({ el, prev }) => { el.style.overflow = prev; });
  Object.assign(node.style, prevStyles);
  return dataUrl;
}

// Capture a rendered document node and deliver it as a single file.
// Shared by the single Save button and "Save as One Image".
async function captureDocNode(node, filename) {
  const dataUrl = await renderNodeToDataUrl(node);
  await shareOrDownloadDataUrl(dataUrl, filename);
}

// Deliver a captured image to the user. iOS Safari (all browsers there share
// the same WebKit engine) has a long-standing bug where an <a download> anchor
// pointing at a large base64 `data:` URI silently fails — no save, no error —
// once the image crosses a size threshold that depends on the device's memory
// and iOS version. That's exactly why this worked on some phones and not
// others, and why it broke as the invoice grew taller over recent versions
// (GCash block, order-details panel) pushing more devices past the limit.
// Fix: convert to a Blob and use a short `blob:` URL instead of embedding the
// whole image as text in the href — this alone removes the size ceiling. On
// top of that, the native Share Sheet (Web Share API) is offered first on
// phones/tablets, since it's the officially reliable way to save an image to
// Photos or Files on iOS, and feels more native than a browser download.
async function shareOrDownloadDataUrl(dataUrl, filename) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;
  if (isTouchDevice && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return; // user closed the share sheet — not a failure
      // Any other share error: fall through to the blob-URL download below.
    }
  }
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
}

// Deliver several images at once (batch export's "Save All"). iOS requires a
// fresh user gesture for every navigator.share() call, so sharing files one
// at a time in a loop breaks after the first — instead we render everything
// first, then make ONE share call with every file, which opens a single
// native Share Sheet the person can save all of at once (or picks Files).
async function shareOrDownloadMultiple(items) {
  if (items.length === 0) return;
  const files = await Promise.all(items.map(async ({ dataUrl, filename }) => {
    const blob = await (await fetch(dataUrl)).blob();
    return new File([blob], filename, { type: 'image/png' });
  }));
  const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;
  if (isTouchDevice && navigator.canShare) {
    try {
      if (navigator.canShare({ files })) {
        await navigator.share({ files });
        return;
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      // fall through to sequential downloads below
    }
  }
  for (const file of files) {
    const blobUrl = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    await new Promise((r) => setTimeout(r, 400)); // let the browser accept each one
  }
}

/* ============================================================
   BATCH EXPORT — all Supplier Copies / Invoices for one delivery batch
   ============================================================ */
function BatchExportView({ batchOrders, batch, onBack }) {
  const [mode, setMode] = useState('supplier');           // 'supplier' | 'invoice'
  const [progress, setProgress] = useState(null);          // "3 / 12" while saving
  const refs = useRef({});
  const stackRef = useRef(null);

  const clean = (s) => (s || '').replace(/[\\/:*?"<>|]+/g, '').trim();
  const suffix = mode === 'supplier' ? 'Supplier Copy' : 'Invoice';

  // Save every order's document as its own image, one after another.
  const saveAll = async () => {
    setProgress(`0 / ${batchOrders.length}`);
    try {
      const items = [];
      for (let i = 0; i < batchOrders.length; i++) {
        const o = batchOrders[i];
        const node = refs.current[o.id];
        if (!node) continue;
        setProgress(`Rendering ${i + 1} / ${batchOrders.length}`);
        const dataUrl = await renderNodeToDataUrl(node);
        items.push({ dataUrl, filename: `${o.id} - ${clean(o.customer)} - ${suffix}.png` });
      }
      setProgress('Saving…');
      await shareOrDownloadMultiple(items);
    } catch (e) {
      alert('Could not save all images. Please try again.');
      console.error(e);
    } finally {
      setProgress(null);
    }
  };

  // Save the entire batch as ONE tall image — easiest to send in one message.
  const saveCombined = async () => {
    if (!stackRef.current) return;
    setProgress('1 / 1');
    try {
      await captureDocNode(stackRef.current, `Batch ${clean(batchLabel(batch))} - ${suffix === 'Invoice' ? 'Invoices' : 'Supplier Copies'}.png`);
    } catch (e) {
      alert('Could not save the combined image.');
      console.error(e);
    } finally {
      setProgress(null);
    }
  };

  return (
    <div style={{ background: THEME.bg, minHeight: '100vh' }}>
      <div className="no-print sticky top-0 z-10 px-4 sm:px-8 py-3 flex items-center justify-between gap-2 flex-wrap" style={{ background: THEME.card, borderBottom: `1px solid ${THEME.line}` }}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm flex-shrink-0" style={{ color: THEME.ink }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode toggle: which document type to export */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${THEME.line}` }}>
            {[['supplier', 'Supplier Copies'], ['invoice', 'Invoices']].map(([m, label]) => (
              <button key={m} onClick={() => setMode(m)} className="px-3 py-1.5 text-sm font-medium"
                style={{ background: mode === m ? THEME.brand : 'transparent', color: mode === m ? 'white' : THEME.ink }}>
                {label}
              </button>
            ))}
          </div>
          <Btn variant="accent" onClick={saveAll} disabled={!!progress}>
            {progress ? <><Loader2 size={15} className="inline -mt-0.5 mr-1.5 animate-spin" /> Saving {progress}…</> : <><ImageIcon size={15} className="inline -mt-0.5 mr-1.5" /> Save All ({batchOrders.length})</>}
          </Btn>
          <Btn variant="primary" onClick={saveCombined} disabled={!!progress}>
            <ImageIcon size={15} className="inline -mt-0.5 mr-1.5" /> Save as One Image
          </Btn>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 sm:px-0 py-4">
        <div className="text-sm mb-3" style={{ color: THEME.inkSoft }}>
          <Truck size={14} className="inline -mt-0.5 mr-1" /> Batch {batchLabel(batch)} · {batchOrders.length} order{batchOrders.length !== 1 ? 's' : ''} · {mode === 'supplier' ? 'documents for your supplier' : 'order summaries for customers'}
        </div>
        <div ref={stackRef} style={{ background: 'white' }}>
          {batchOrders.map((o, i) => (
            <div key={o.id} ref={(el) => { refs.current[o.id] = el; }} className="p-5 sm:p-10"
              style={{ background: 'white', borderBottom: i < batchOrders.length - 1 ? `2px dashed ${THEME.line}` : 'none' }}>
              <OrderDocument order={o} mode={mode} exporting={true} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrintableView({ order, mode, onBack }) {
  const total = (order.items || []).reduce((s, i) => s + i.qty * i.price, 0);
  const totalQty = (order.items || []).reduce((s, i) => s + Number(i.qty || 0), 0);
  const isInvoice = mode === 'invoice';
  const docRef = useRef(null);
  const [savingImg, setSavingImg] = useState(false);
  const [exporting, setExporting] = useState(false);

  const saveAsImage = async () => {
    if (!docRef.current) return;
    setSavingImg(true);
    // Force the desktop table layout into the captured image.
    setExporting(true);
    await new Promise((r) => setTimeout(r, 60));
    try {
      const cleanName = (order.customer || 'Customer').replace(/[\\/:*?"<>|]+/g, '').trim();
      await captureDocNode(docRef.current, `${order.id} - ${cleanName}.png`);
    } catch (e) {
      alert('Could not save the image. Try the Print button instead.');
      console.error(e);
    } finally {
      setSavingImg(false);
      setExporting(false);
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
          <Btn variant="primary" onClick={() => { setExporting(true); setTimeout(() => { window.print(); setExporting(false); }, 80); }}>
            <Printer size={15} className="inline -mt-0.5 sm:mr-1.5" /> <span className="hidden sm:inline">Print</span>
          </Btn>
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto px-3 sm:px-0" style={{ marginTop: 16, marginBottom: 24 }}>
        <div ref={docRef} className="p-5 sm:p-10" style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <OrderDocument order={order} mode={mode} exporting={exporting} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PICKUP CROSS-CHECK
   ============================================================ */

function Pickup({ orders, catalog }) {
  const [selected, setSelected] = useState(new Set());
  const [picked, setPicked] = useState(new Set());   // products ticked off at the supplier (session-only)
  const [activeBatch, setActiveBatch] = useState(null);   // which batch chip is highlighted
  const [savingRollup, setSavingRollup] = useState(false);
  const rollupExportRef = useRef(null);
  const productByName = useMemo(() => Object.fromEntries((catalog || []).map(p => [p.name, p])), [catalog]);
  // Always use the current supplier cost from the catalog (what you pay today).
  const effectiveCost = (order, it) => {
    const p = productByName[it.product];
    if (p && p.cost !== undefined && p.cost !== null && p.cost !== '') return Number(p.cost) || 0;
    return Number(it.cost) || 0;
  };

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
    setPicked(new Set());   // selection changed -> restart the shopping checklist
    setActiveBatch(null);   // manual change → no single batch is "active"
  };
  const selectAll = () => { setSelected(new Set(ordersList.map(o => o.id))); setPicked(new Set()); setActiveBatch(null); };
  const clear = () => { setSelected(new Set()); setPicked(new Set()); setActiveBatch(null); };
  // The real workflow: "select everything for Saturday" in one tap.
  const upcomingBatches = useMemo(() => {
    const todayIso = today();
    const counts = {};
    let prev = '';   // most recent past batch, for review
    ordersList.forEach((o) => {
      if (!o.delivery_batch) return;
      counts[o.delivery_batch] = (counts[o.delivery_batch] || 0) + 1;
      if (o.delivery_batch < todayIso && o.delivery_batch > prev) prev = o.delivery_batch;
    });
    const upcoming = Object.keys(counts).filter((b) => b >= todayIso).sort().slice(0, 3);
    const dates = prev ? [prev, ...upcoming] : upcoming;   // previous batch first
    return dates.map((b) => [b, counts[b] || 0]);
  }, [ordersList]);
  const selectBatch = (batch) => {
    setSelected(new Set(ordersList.filter(o => o.delivery_batch === batch).map(o => o.id)));
    setPicked(new Set());
    setActiveBatch(batch);
  };
  const togglePicked = (product) => {
    const next = new Set(picked);
    if (next.has(product)) next.delete(product);
    else next.add(product);
    setPicked(next);
  };

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
        byProduct[it.product].cost = effectiveCost(order, it);
        byProduct[it.product].totalCost += it.qty * effectiveCost(order, it);
      });
    });
    return Object.values(byProduct).sort((a, b) => a.product.localeCompare(b.product));
  }, [selected, orders, productByName]);

  const grandTotal = rollup.reduce((s, r) => s + r.totalCost, 0);
  // Total kilos across rollup (only items priced per kg, so the figure is meaningful).
  const totalKg = rollup.reduce((s, r) => s + ((r.unit === 'kg' || !r.unit) ? r.qty : 0), 0);

  // Save the roll-up as a branded image to send straight to the supplier.
  const saveRollupImage = async () => {
    setSavingRollup(true);
    await new Promise((r) => setTimeout(r, 120)); // let the offscreen node render
    try {
      const label = activeBatch ? batchLabel(activeBatch) : fmtDate(today());
      await captureDocNode(rollupExportRef.current, `Pickup Roll-up - ${label.replace(/[\\/:*?"<>|]+/g, '')}.png`);
    } catch (e) {
      alert('Could not save the roll-up image.');
      console.error(e);
    } finally {
      setSavingRollup(false);
    }
  };

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
            {upcomingBatches.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {upcomingBatches.map(([batch, n]) => {
                  const on = activeBatch === batch;
                  return (
                  <button key={batch} onClick={() => selectBatch(batch)}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full font-medium"
                    style={{ background: on ? THEME.brand : THEME.brandBg, color: on ? 'white' : THEME.brand, border: `1px solid ${on ? THEME.brand : THEME.line}` }}>
                    <Truck size={11} /> {batchLabel(batch)} ({n})
                  </button>
                  );
                })}
              </div>
            )}
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
            <div className="flex items-center justify-between mb-1">
              <div className="font-display text-lg">Pickup Roll-up</div>
              {rollup.length > 0 && (
                <Btn variant="accent" size="sm" onClick={saveRollupImage} disabled={savingRollup}>
                  {savingRollup
                    ? <><Loader2 size={14} className="inline -mt-0.5 mr-1 animate-spin" /> Saving…</>
                    : <><ImageIcon size={14} className="inline -mt-0.5 mr-1" /> Save Image</>}
                </Btn>
              )}
            </div>
            <div className="text-xs mb-2" style={{ color: THEME.inkSoft }}>Total quantity & cost to pick up from supplier for the selected orders. Tap a row to tick it off at the counter.</div>
            {rollup.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1" style={{ color: THEME.inkSoft }}>
                  <span>{picked.size} of {rollup.length} picked</span>
                  {picked.size > 0 && <button onClick={() => setPicked(new Set())} style={{ color: THEME.brand }}>Reset</button>}
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: THEME.line }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${rollup.length ? (picked.size / rollup.length) * 100 : 0}%`, background: THEME.green }} />
                </div>
              </div>
            )}
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
                    {rollup.map((r) => {
                      const done = picked.has(r.product);
                      return (
                      <tr key={r.product} onClick={() => togglePicked(r.product)} className="cursor-pointer"
                        style={{ borderTop: `1px solid ${THEME.line}`, opacity: done ? 0.45 : 1 }}>
                        <td className="py-2.5">
                          <span className="inline-flex items-center gap-2">
                            <span className="inline-flex items-center justify-center rounded flex-shrink-0"
                              style={{ width: 18, height: 18, border: `1.5px solid ${done ? THEME.green : THEME.line}`, background: done ? THEME.green : 'transparent' }}>
                              {done && <Check size={12} style={{ color: 'white' }} />}
                            </span>
                            <span style={{ textDecoration: done ? 'line-through' : 'none' }}>{r.product}</span>
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-medium">{r.qty} {r.unit}</td>
                        <td className="py-2.5 text-right">{peso(r.cost)}</td>
                        <td className="py-2.5 text-right font-medium">{peso(r.totalCost)}</td>
                      </tr>
                      );
                    })}
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
      {/* Offscreen branded roll-up document, rendered only during capture */}
      {savingRollup && (
        <div style={{ position: 'fixed', left: -9999, top: 0, width: 680 }}>
          <div ref={rollupExportRef} className="p-10" style={{ background: 'white' }}>
            <div className="flex flex-col items-center text-center mb-6 pb-5" style={{ borderBottom: `2px solid ${THEME.brand}` }}>
              <img src={LOGO_DATA_URL} alt="M&N Meatshop" width="80" height="80" className="rounded-full object-cover mb-2" style={{ display: 'block', width: 80, height: 80 }} />
              <div className="font-display text-2xl" style={{ color: THEME.brand }}>M&N MEATSHOP</div>
              <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>Your Daily Meat Choice</div>
            </div>
            <div className="text-center mb-6">
              <div className="font-display text-xl tracking-wide uppercase" style={{ color: THEME.ink }}>Supplier Pickup List</div>
              <div className="text-sm mt-1" style={{ color: THEME.inkSoft }}>
                {activeBatch ? `Delivery batch: ${batchLabel(activeBatch)}` : `As of ${fmtDate(today())}`} · {selected.size} order{selected.size !== 1 ? 's' : ''}
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: THEME.brandBg }}>
                  <th className="text-left px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>Product</th>
                  <th className="text-right px-3 py-2.5 font-medium" style={{ color: THEME.brand }}>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {rollup.map((r) => (
                  <tr key={r.product} style={{ borderBottom: `1px solid ${THEME.line}` }}>
                    <td className="px-3 py-3">{r.product}</td>
                    <td className="px-3 py-3 text-right font-medium whitespace-nowrap">{r.qty} {r.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-5 pt-4 text-sm" style={{ borderTop: `2px solid ${THEME.brand}`, color: THEME.inkSoft }}>
              {rollup.length} products{totalKg > 0 ? ` · ${totalKg} kg total` : ''}
            </div>
            <div className="text-center mt-8 pt-5 text-sm" style={{ borderTop: `1px solid ${THEME.line}`, color: THEME.inkSoft }}>
              For supplier use only · M&N Meatshop
            </div>
          </div>
        </div>
      )}
    </div>

  );
}

/* ============================================================
   SALES CROSS-CHECK (customer side — selling price)
   ============================================================ */

function SalesCheck({ orders, catalog, privacy }) {
  const productByName = useMemo(() => Object.fromEntries((catalog || []).map(p => [p.name, p])), [catalog]);
  // Always use the current supplier cost from the catalog so profit reflects
  // what you actually pay today. Falls back to the order snapshot only if the
  // product was removed from the catalog.
  const effectiveCost = (order, it) => {
    const p = productByName[it.product];
    if (p && p.cost !== undefined && p.cost !== null && p.cost !== '') return Number(p.cost) || 0;
    return Number(it.cost) || 0;
  };
  const [selected, setSelected] = useState(new Set());
  const [activeBatch, setActiveBatch] = useState(null);   // which batch chip is highlighted
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
    setActiveBatch(null);
  };
  const selectAll = () => { setSelected(new Set(ordersList.map(o => o.id))); setActiveBatch(null); };
  const clear = () => { setSelected(new Set()); setActiveBatch(null); };
  // Quick-select an entire delivery batch (e.g. "everything for Saturday").
  const upcomingBatches = useMemo(() => {
    const todayIso = today();
    const counts = {};
    let prev = '';   // most recent past batch, for review
    ordersList.forEach((o) => {
      if (!o.delivery_batch) return;
      counts[o.delivery_batch] = (counts[o.delivery_batch] || 0) + 1;
      if (o.delivery_batch < todayIso && o.delivery_batch > prev) prev = o.delivery_batch;
    });
    const upcoming = Object.keys(counts).filter((b) => b >= todayIso).sort().slice(0, 3);
    const dates = prev ? [prev, ...upcoming] : upcoming;   // previous batch first
    return dates.map((b) => [b, counts[b] || 0]);
  }, [ordersList]);
  const selectBatch = (batch) => { setSelected(new Set(ordersList.filter(o => o.delivery_batch === batch).map(o => o.id))); setActiveBatch(batch); };

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
        byProduct[it.product].totalCost += it.qty * effectiveCost(order, it);
      });
    });
    return Object.values(byProduct).sort((a, b) => a.product.localeCompare(b.product));
  }, [selected, orders, productByName]);

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
            {upcomingBatches.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {upcomingBatches.map(([batch, n]) => {
                  const on = activeBatch === batch;
                  return (
                  <button key={batch} onClick={() => selectBatch(batch)}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full font-medium"
                    style={{ background: on ? THEME.brand : THEME.brandBg, color: on ? 'white' : THEME.brand, border: `1px solid ${on ? THEME.brand : THEME.line}` }}>
                    <Truck size={11} /> {batchLabel(batch)} ({n})
                  </button>
                  );
                })}
              </div>
            )}
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

function Expenses({ expenses, setExpenses, setMeta }) {
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
        ? { ...e, date, category, description: description.trim(), amount: Number(amount), payment, notes: notes.trim(), updated_at: new Date().toISOString() }
        : e));
    } else {
      const newExpense = {
        id: 'EXP-' + Date.now(), date, category,
        description: description.trim(), amount: Number(amount), payment, notes: notes.trim(),
        updated_at: new Date().toISOString(),
      };
      setExpenses([newExpense, ...expenses]);
    }
    setShowForm(false);
  };

  const deleteExpense = (id) => {
    if (!confirm('Delete this expense?')) return;
    setExpenses(expenses.filter(e => e.id !== id));
    // Tombstone so the deletion survives multi-device merging.
    setMeta((m) => ({ ...m, deletedExpenses: { ...(m.deletedExpenses || {}), [id]: new Date().toISOString() } }));
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
function RestaurantQuote({ catalog, setCatalog, qtys, setQtys }) {
  const sheetRef = useRef(null);
  const [savingSheet, setSavingSheet] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null); // product name being edited
  const [priceDraft, setPriceDraft] = useState('');

  // Save an edited wholesale price as a custom override on the product.
  // Setting it to blank or 0 clears the override (back to formula pricing).
  const saveWholesalePrice = (name) => {
    const val = Number(priceDraft);
    setCatalog(catalog.map(p => {
      if (p.name !== name) return p;
      if (!(val > 0)) { const { wholesalePrice, ...rest } = p; return rest; } // clear override
      return { ...p, wholesalePrice: Math.round(val) };
    }));
    setEditingPrice(null);
    setPriceDraft('');
  };
  const startEditPrice = (r) => {
    setEditingPrice(r.name);
    setPriceDraft(String(r.wholesale));
  };

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
      const ts = new Date().toISOString().slice(0, 10);
      await shareOrDownloadDataUrl(dataUrl, `M&N Wholesale Price Sheet - ${ts}.png`);
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
                          <td className="py-2 text-right">
                            {editingPrice === r.name ? (
                              <span className="inline-flex items-center gap-1 justify-end">
                                <input type="number" min="0" step="1" value={priceDraft} autoFocus
                                  onChange={(e) => setPriceDraft(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') saveWholesalePrice(r.name); if (e.key === 'Escape') { setEditingPrice(null); setPriceDraft(''); } }}
                                  className="w-20 px-2 py-1 rounded text-right outline-none"
                                  style={{ background: THEME.card, border: `1px solid ${THEME.brand}`, color: THEME.ink }} />
                                <button onClick={() => saveWholesalePrice(r.name)} className="p-1" style={{ color: THEME.green }} title="Save"><Save size={13} /></button>
                              </span>
                            ) : (
                              <button onClick={() => startEditPrice(r)}
                                className="inline-flex items-center gap-1 font-medium px-1.5 py-0.5 rounded row-hover"
                                style={{ color: THEME.ink }} title="Tap to edit price">
                                {peso(r.wholesale)}
                                {r.custom && <span style={{ fontSize: 9, color: THEME.accent, fontWeight: 600 }}>•</span>}
                                <Edit3 size={11} style={{ color: THEME.inkSoft, opacity: 0.6 }} />
                              </button>
                            )}
                          </td>
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
            <div className="text-xs mt-3 pt-3" style={{ color: THEME.inkSoft, borderTop: `1px solid ${THEME.line}` }}>
              Tap any price in <strong>Our Price / kg</strong> to adjust what you charge restaurants. A gold dot (<span style={{ color: THEME.accent, fontWeight: 600 }}>•</span>) marks a custom price you've set. Clear the field and save to return to automatic pricing. Changes apply everywhere — wholesale orders, invoices, and the printed price sheet.
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





function SupplierPrices({ priceHistory, setPriceHistory, catalog, setCatalog, privacy }) {
  const m = (n) => privacy ? '₱•••••' : peso(n);
  const history = priceHistory || [];
  const [adding, setAdding] = useState(null); // null | {product, oldCost, newCost, date}

  const startAdd = () => {
    const first = catalog[0];
    return setAdding({
      product: first?.name || '',
      oldCost: first ? String(first.cost) : '',   // pre-fill with current cost
      newCost: '',
      date: today(),
    });
  };

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
      manual: true,
    };
    setPriceHistory([entry, ...(priceHistory || [])]);
    // LINKED: update the product's actual cost in the catalog so Price List,
    // pending-order profit, and everything else reflect the new cost immediately.
    if (setCatalog) {
      setCatalog(catalog.map(p => p.name === adding.product ? { ...p, cost: entry.newCost } : p));
    }
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
                <Select value={adding.product} onChange={(e) => {
                  const prod = catalog.find(p => p.name === e.target.value);
                  setAdding({ ...adding, product: e.target.value, oldCost: prod ? String(prod.cost) : '' });
                }}
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
      setPayments((prev) => (prev || []).map(p => p.id === editingId ? entry : p));
    } else {
      setPayments((prev) => [entry, ...(prev || [])]);
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
    setPayments((prev) => (prev || []).filter(p => p.id !== id));
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

/* ============================================================
   PRICE LIST (v10.1)
   ============================================================
   Responsive by the space the list actually has (not by device name):
   a comparison table when there's room, accordion rows otherwise.
   Products have no ids, so every write locates its product by object
   identity first and by name second — never by a filtered row index.
   Formulas are unchanged: profit = price − cost; margin = profit ÷ price
   × 100 when price > 0. Wholesale still comes from rqPricing().        */
const PL_GROUPS = ['Pork', 'Chicken', 'Beef'];
const PL_UNITS = ['kg', 'pack', 'pcs'];
const PL_TABLE_MIN = 820; // px of list width needed for the table layout
const plUnit = (u) => (u === 'pcs' ? 'pc' : (u || 'kg'));
const plNum = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const plStats = (p) => {
  const price = plNum(p.price), cost = plNum(p.cost);
  const profit = price - cost;
  return { price, cost, profit, margin: price > 0 ? (profit / price) * 100 : null };
};
const plMoney = (n) => (n < 0 ? '−' + peso(Math.abs(n)) : peso(n));
const plPct = (m) => (m === null || !Number.isFinite(m) ? '—' : `${m < 0 ? '−' : ''}${Math.abs(m).toFixed(1)}%`);
const plStr = (v) => (v === undefined || v === null ? '' : String(v));
// Find a product in the live catalog: same object first, then same name.
const plLocate = (list, ref, name) => {
  let i = ref ? list.indexOf(ref) : -1;
  if (i < 0 && name !== undefined) i = list.findIndex((p) => p.name === name);
  return i;
};

function Products({ catalog, setCatalog, priceHistory, setPriceHistory, sync, registerNavGuard }) {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All');
  const [expanded, setExpanded] = useState(null);       // row key
  const [reorder, setReorder] = useState(false);
  const stashedQuery = useRef('');
  const [editor, setEditor] = useState(null);           // { isNew, ref, origName, snapshot, base, draft }
  const [editorClosing, setEditorClosing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({});
  const [flashKey, setFlashKey] = useState(null);
  const [announce, setAnnounce] = useState('');
  const rootRef = useRef(null);
  const openerRef = useRef(null);
  const savingRef = useRef(false);
  const dirtyRef = useRef(false);
  const closeTimer = useRef(null);
  const flashTimer = useRef(null);
  const pendingFocus = useRef(null);
  const phone = !useMediaQuery('(min-width: 640px)');

  // ── Layout from the list's real width (sidebar, Split View, rotation) ──
  const [wide, setWide] = useState(() => { try { return window.innerWidth >= 1180; } catch (e) { return false; } });
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const measure = () => setWide(el.getBoundingClientRect().width >= PL_TABLE_MIN);
    measure();
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', measure); return () => window.removeEventListener('resize', measure); }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Rows with stable keys (name + occurrence, so duplicates stay distinct) ──
  const rows = useMemo(() => {
    const seen = {};
    return catalog.map((p, i) => {
      const nm = p.name || '';
      seen[nm] = (seen[nm] || 0) + 1;
      return { p, i, key: nm + '#' + seen[nm] };
    });
  }, [catalog]);
  const groupsPresent = useMemo(() => {
    const extra = [];
    catalog.forEach((p) => { if (p.group && !PL_GROUPS.includes(p.group) && !extra.includes(p.group)) extra.push(p.group); });
    return [...PL_GROUPS, ...extra];
  }, [catalog]);
  const q = reorder ? '' : query.trim().toLowerCase();
  const matchesQuery = (p) => !q || (p.name || '').toLowerCase().includes(q);
  const searched = rows.filter((r) => matchesQuery(r.p));
  const counts = { All: searched.length };
  groupsPresent.forEach((g) => { counts[g] = searched.filter((r) => r.p.group === g).length; });
  const visible = searched.filter((r) => cat === 'All' || r.p.group === cat);
  const sections = (cat === 'All' ? groupsPresent : [cat])
    .map((g) => ({ group: g, rows: visible.filter((r) => r.p.group === g) }))
    .filter((s) => s.rows.length > 0);
  const groupSize = (g) => rows.filter((r) => r.p.group === g).length;

  // Latest supplier-cost change per product (read-only, from Supplier Prices history).
  const lastChange = useMemo(() => {
    const m = {};
    [...(priceHistory || [])]
      .sort((a, b) => ((b.date || '').localeCompare(a.date || '')) || (b.id || '').localeCompare(a.id || ''))
      .forEach((h) => { if (h && h.product && !m[h.product]) m[h.product] = h; });
    return m;
  }, [priceHistory]);

  // ── Truthful save feedback (driven by the app's real persistence state) ──
  const [fb, setFb] = useState(null); // { label, phase: 'pending' | 'saving' | 'done' }
  const sawSaving = useRef(false);
  const isSaving = !!(sync && sync.saving);
  const syncStatus = sync ? sync.syncStatus : null;
  const notify = (label) => { sawSaving.current = false; setFb({ label, phase: 'pending', t: Date.now() }); };
  useEffect(() => {
    if (!fb || (fb.phase !== 'pending' && fb.phase !== 'saving')) return;
    if (isSaving) { sawSaving.current = true; if (fb.phase === 'pending') setFb((f) => f && { ...f, phase: 'saving' }); }
    else if (sawSaving.current) setFb((f) => f && { ...f, phase: 'done' });
  }, [isSaving, fb]);
  useEffect(() => {
    if (!fb) return undefined;
    if (fb.phase === 'pending') { const t = setTimeout(() => setFb((f) => (f && f.phase === 'pending' && f.t === fb.t ? null : f)), 2500); return () => clearTimeout(t); }
    if (fb.phase === 'done' && syncStatus === 'cloud') { const t = setTimeout(() => setFb((f) => (f && f.t === fb.t ? null : f)), 3500); return () => clearTimeout(t); }
    return undefined;
  }, [fb, syncStatus]);

  const flash = (key) => {
    setFlashKey(key);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashKey(null), 1500);
  };
  useEffect(() => () => { clearTimeout(flashTimer.current); clearTimeout(closeTimer.current); }, []);

  // ── Category tabs with a sliding underline ──
  const tabListRef = useRef(null);
  const tabRefs = useRef({});
  const [ind, setInd] = useState(null);
  const tabs = ['All', ...PL_GROUPS];
  useLayoutEffect(() => {
    const place = () => {
      const el = tabRefs.current[cat];
      if (el) setInd({ left: el.offsetLeft, width: el.offsetWidth });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [cat, wide, counts.All, counts.Pork, counts.Chicken, counts.Beef]);
  const onTabKey = (e) => {
    const i = tabs.indexOf(cat);
    let n = null;
    if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
    if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
    if (e.key === 'Home') n = tabs[0];
    if (e.key === 'End') n = tabs[tabs.length - 1];
    if (n) { e.preventDefault(); setCat(n); const el = tabRefs.current[n]; if (el) el.focus(); }
  };

  // ── Reorder mode ──
  const startReorder = () => {
    stashedQuery.current = query;
    setQuery('');
    setExpanded(null);
    setReorder(true);
  };
  const stopReorder = () => { setReorder(false); setQuery(stashedQuery.current); stashedQuery.current = ''; };
  const move = (row, dir) => {
    const target = row.p;
    const group = target.group;
    const groupIdx = catalog.map((p, i) => (p.group === group ? i : -1)).filter((i) => i >= 0);
    const pos = groupIdx.indexOf(plLocate(catalog, target, target.name));
    const to = dir === 'up' ? pos - 1 : pos + 1;
    if (pos < 0 || to < 0 || to >= groupIdx.length) return;
    // Same rule as before: swap with the nearest product in the same category.
    setCatalog((prev) => {
      const idx = plLocate(prev, target, target.name);
      if (idx < 0) return prev;
      const g = prev.map((p, i) => (p.group === prev[idx].group ? i : -1)).filter((i) => i >= 0);
      const at = g.indexOf(idx);
      const t2 = dir === 'up' ? at - 1 : at + 1;
      if (t2 < 0 || t2 >= g.length) return prev;
      const next = [...prev];
      const j = g[t2];
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
    pendingFocus.current = { key: row.key, dir };
    setAnnounce(`${target.name} moved to position ${to + 1} of ${groupIdx.length} in ${group}.`);
    notify('Product order updated');
  };
  // Keep focus on the moved product; if its arrow just became disabled, use the other one.
  const listRef = useRef(null);
  const prevTops = useRef({});
  useLayoutEffect(() => {
    const root = listRef.current;
    if (pendingFocus.current && root) {
      const { key, dir } = pendingFocus.current;
      pendingFocus.current = null;
      const esc = (s) => (window.CSS && CSS.escape ? CSS.escape(s) : s.replace(/"/g, '\\"'));
      const rowEl = root.querySelector(`[data-plkey="${esc(key)}"]`);
      if (rowEl) {
        const same = rowEl.querySelector(`[data-dir="${dir}"]`);
        const other = rowEl.querySelector(`[data-dir="${dir === 'up' ? 'down' : 'up'}"]`);
        const el = same && !same.disabled ? same : other;
        if (el) el.focus({ preventScroll: true });
      }
    }
    // Smooth position change (FLIP) for rows in reorder mode.
    if (!root || !reorder) { prevTops.current = {}; return; }
    const els = root.querySelectorAll('[data-plkey]');
    const now = {};
    els.forEach((el) => { now[el.getAttribute('data-plkey')] = el.offsetTop; });
    if (!prefersReducedMotion()) {
      els.forEach((el) => {
        const k = el.getAttribute('data-plkey');
        const before = prevTops.current[k];
        if (before === undefined) return;
        const d = before - now[k];
        if (!d) return;
        el.style.transition = 'none';
        el.style.transform = `translateY(${d}px)`;
        requestAnimationFrame(() => {
          el.style.transition = 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)';
          el.style.transform = '';
        });
      });
    }
    prevTops.current = now;
  }, [catalog, reorder, cat]);

  // ── Delete (same confirmation as before; past orders keep their own data) ──
  const deleteProduct = (row) => {
    const target = row.p;
    if (!confirm(`Delete ${target.name}? This won't affect past orders.`)) return;
    setCatalog((prev) => {
      const i = plLocate(prev, target, target.name);
      return i < 0 ? prev : prev.filter((_, j) => j !== i);
    });
    setExpanded(null);
    const panel = document.getElementById('pl-panel');
    if (panel) panel.focus({ preventScroll: true });
    setAnnounce(`${target.name} deleted.`);
    notify(`${target.name} deleted`);
  };

  // ── Editor ──
  const openEditor = (row, el) => {
    if (editor) return;
    clearTimeout(closeTimer.current);
    openerRef.current = el || document.activeElement;
    savingRef.current = false;
    setSubmitted(false);
    setTouched({});
    setEditorClosing(false);
    if (!row) {
      const draft = { name: '', group: PL_GROUPS.includes(cat) ? cat : 'Pork', unit: 'kg', cost: '', price: '', wholesalePrice: '' };
      setEditor({ isNew: true, ref: null, origName: undefined, snapshot: null, base: { ...draft }, draft });
      return;
    }
    const p = row.p;
    const draft = {
      name: p.name || '', group: p.group || 'Pork', unit: p.unit || 'kg',
      cost: plStr(p.cost), price: plStr(p.price),
      wholesalePrice: Number(p.wholesalePrice) > 0 ? String(p.wholesalePrice) : '',
    };
    setEditor({ isNew: false, ref: p, origName: p.name, snapshot: JSON.stringify(p), base: { ...draft }, draft });
  };
  const dirty = !!editor && JSON.stringify(editor.draft) !== JSON.stringify(editor.base);
  dirtyRef.current = dirty;
  const confirmDiscard = () => {
    if (!dirtyRef.current) return true;
    if (!window.confirm('You have unsaved changes to this product. Discard them?')) return false;
    dirtyRef.current = false;
    return true;
  };
  useEffect(() => {
    if (!registerNavGuard) return undefined;
    registerNavGuard(confirmDiscard);
    return () => registerNavGuard(null);
  }, [registerNavGuard]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onBeforeUnload = (e) => { if (dirtyRef.current) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);
  const focusKeyAfterClose = useRef(null);
  const finishClose = () => {
    setEditor(null);
    setEditorClosing(false);
    let el = openerRef.current;
    openerRef.current = null;
    const k = focusKeyAfterClose.current;
    focusKeyAfterClose.current = null;
    if ((!el || !document.contains(el)) && k) {
      el = Array.from(document.querySelectorAll('[data-edit]')).find((b) => b.getAttribute('data-edit') === k) || null;
    }
    if (el && document.contains(el)) { try { el.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
  };
  const closeEditor = (force) => {
    if (!editor || editorClosing) return;
    if (!force && !confirmDiscard()) return;
    dirtyRef.current = false;
    if (prefersReducedMotion()) { finishClose(); return; }
    setEditorClosing(true);
    closeTimer.current = setTimeout(finishClose, 210);
  };
  const setDraft = (patch) => setEditor((ed) => (ed ? { ...ed, draft: { ...ed.draft, ...patch } } : ed));

  // Where is the edited product now? (Another device may have changed or removed it.)
  const editIdx = editor && !editor.isNew ? plLocate(catalog, editor.ref, editor.origName) : -1;
  const editCurrent = editIdx >= 0 ? catalog[editIdx] : null;
  const editState = !editor || editor.isNew ? 'ok' : !editCurrent ? 'missing' : (JSON.stringify(editCurrent) !== editor.snapshot ? 'changed' : 'ok');

  const validate = (d) => {
    const e = {};
    const nm = d.name.trim();
    if (!nm) e.name = 'Product name is required.';
    else if (catalog.some((p, i) => i !== editIdx && (p.name || '').trim().toLowerCase() === nm.toLowerCase())) e.name = 'Another product already uses this name.';
    const num = (s, label, required) => {
      const t = String(s).trim();
      if (t === '') return required ? `Enter the ${label}.` : null;
      const n = Number(t);
      if (!Number.isFinite(n)) return `Enter the ${label} as a number, e.g. 259 or 259.50.`;
      if (n < 0) return `The ${label} can't be negative.`;
      return null;
    };
    const c = num(d.cost, 'supplier cost', true); if (c) e.cost = c;
    const pr = num(d.price, 'selling price', true); if (pr) e.price = pr;
    const w = num(d.wholesalePrice, 'wholesale price', false); if (w) e.wholesalePrice = w;
    return e;
  };
  const errors = editor ? validate(editor.draft) : {};

  const save = () => {
    if (!editor || savingRef.current || editorClosing) return;
    setSubmitted(true);
    if (Object.keys(errors).length) {
      const first = ['name', 'cost', 'price', 'wholesalePrice'].find((k) => errors[k]);
      const el = document.getElementById(`pl-f-${first}`);
      if (el) el.focus();
      return;
    }
    if (!editor.isNew && editState === 'missing') return;
    if (!editor.isNew && !dirty) { closeEditor(true); return; }
    const d = editor.draft;
    const name = d.name.trim();
    const cost = Number(String(d.cost).trim());
    const price = Number(String(d.price).trim());
    const wTxt = String(d.wholesalePrice).trim();
    savingRef.current = true;
    if (editor.isNew) {
      const rec = { name, unit: d.unit, cost, price, group: d.group };
      if (wTxt !== '') rec.wholesalePrice = Number(wTxt);
      setCatalog((prev) => [...prev, rec]);
      const occ = catalog.filter((p) => p.name === name).length + 1;
      flash(name + '#' + occ);
      setAnnounce(`${name} added.`);
      notify(`${name} added`);
    } else {
      const current = editCurrent;
      const updated = { ...current, name, group: d.group, unit: d.unit, cost, price };
      if (d.wholesalePrice === editor.base.wholesalePrice) {
        // Untouched: keep whatever was stored (including a stored 0).
        if (current.wholesalePrice === undefined) delete updated.wholesalePrice; else updated.wholesalePrice = current.wholesalePrice;
      } else if (wTxt === '') delete updated.wholesalePrice;      // blank → automatic wholesale (as before)
      else updated.wholesalePrice = Number(wTxt);
      // Supplier cost history: only when an existing product's cost really changed.
      const oldCost = Number(current.cost) || 0;
      const newCost = Number(cost) || 0;
      if (oldCost !== newCost) {
        const entry = {
          id: 'PH-' + Date.now(),
          date: today(),
          product: name,
          oldCost,
          newCost,
          delta: Math.round((newCost - oldCost) * 100) / 100,
          sellPrice: Number(price) || 0,                 // selling price at the time of the change
          marginImpact: Math.round((oldCost - newCost) * 100) / 100,
        };
        setPriceHistory((prev) => [entry, ...(prev || [])]);
      }
      setCatalog((prev) => {
        const i = plLocate(prev, current, current.name);
        if (i < 0) return prev;
        const next = [...prev];
        next[i] = updated;
        return next;
      });
      const occ = catalog.slice(0, editIdx + 1).filter((p, i) => (i === editIdx ? true : p.name === name)).length;
      const newKey = name + '#' + occ;
      const oldKey = rows[editIdx] ? rows[editIdx].key : null;
      setExpanded((e) => (e === oldKey ? newKey : e));
      focusKeyAfterClose.current = newKey;
      flash(newKey);
      setAnnounce(`${name} saved.`);
      notify(`${name} saved`);
    }
    closeEditor(true);
  };

  // ── Small render helpers ──
  const priceCell = (p, big) => {
    const s = plStats(p);
    return (
      <span className="whitespace-nowrap">
        <span className={`font-semibold tabular-nums ${big ? 'text-base' : ''}`} style={{ color: THEME.ink }}>{peso(s.price)}</span>
        <span className="text-xs ml-1" style={{ color: THEME.inkSoft }}>/ {plUnit(p.unit)}</span>
      </span>
    );
  };
  const profitText = (n) => (n < 0
    ? <span style={{ color: THEME.red }}>{plMoney(n)} <span className="text-[11px] font-medium uppercase" style={{ letterSpacing: '0.04em' }}>loss</span></span>
    : <span style={{ color: THEME.green }}>{plMoney(n)}</span>);
  const wholesaleText = (p) => {
    const w = rqPricing(p);
    return <>{peso(w.wholesale)} <span className="text-xs" style={{ color: THEME.inkSoft }}>/ {plUnit(p.unit)} · {w.custom ? 'custom' : 'automatic'}</span></>;
  };
  const lastChangeText = (p) => {
    const h = lastChange[p.name];
    if (!h) return <span style={{ color: THEME.inkSoft }}>No changes recorded</span>;
    return <>{fmtDate(h.date)} · {peso(h.oldCost)} → {peso(h.newCost)}</>;
  };
  const detailGrid = (p, withMoney) => {
    const s = plStats(p);
    const items = [
      withMoney && ['Supplier cost', <span className="tabular-nums">{peso(s.cost)} <span className="text-xs" style={{ color: THEME.inkSoft }}>/ {plUnit(p.unit)}</span></span>],
      withMoney && ['Profit per unit', <span className="tabular-nums font-medium">{profitText(s.profit)}</span>],
      withMoney && ['Margin', <span className="tabular-nums" style={{ color: s.margin !== null && s.margin < 0 ? THEME.red : THEME.ink }}>{plPct(s.margin)}</span>],
      ['Wholesale price', <span className="tabular-nums">{wholesaleText(p)}</span>],
      ['Category', p.group || '—'],
      ['Unit', p.unit || 'kg'],
      ['Last cost change', lastChangeText(p)],
    ].filter(Boolean);
    return (
      <dl className="grid gap-x-6 gap-y-3" style={{ gridTemplateColumns: withMoney ? 'repeat(auto-fill, minmax(140px, 1fr))' : 'repeat(auto-fill, minmax(170px, 1fr))' }}>
        {items.map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-[11px] uppercase font-medium" style={{ color: THEME.inkSoft, letterSpacing: '0.08em' }}>{k}</dt>
            <dd className="text-sm mt-0.5 break-words" style={{ color: THEME.ink }}>{v}</dd>
          </div>
        ))}
      </dl>
    );
  };
  const actions = (row, full) => (
    <div className={`flex items-center gap-2 ${full ? 'w-full' : ''}`}>
      <button type="button" data-edit={row.key} onClick={(e) => openEditor(row, e.currentTarget)}
        className={`pl-btn ${full ? 'flex-1' : ''} inline-flex items-center justify-center gap-1.5 px-4 rounded-xl text-sm font-semibold`}
        style={{ minHeight: 44, background: THEME.brand, color: 'white' }}>
        <Edit3 size={15} /> Edit product
      </button>
      <PLMoreMenu name={row.p.name} onReorder={startReorder} onDelete={() => deleteProduct(row)} />
    </div>
  );
  const sectionHead = (g, n) => (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-lg" style={{ color: THEME.ink }}>{g}</span>
      <span className="text-xs" style={{ color: THEME.inkSoft }}>{n} product{n !== 1 ? 's' : ''}{q ? ' match' : ''}</span>
    </div>
  );

  // ── Views ──
  const tableView = (
    <div className="rounded-2xl overflow-hidden" style={{ background: THEME.card, border: `1px solid ${THEME.line}` }}>
      <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col />
          <col style={{ width: 150 }} />
          <col style={{ width: 130 }} />
          <col style={{ width: 140 }} />
          <col style={{ width: 96 }} />
          <col style={{ width: 60 }} />
        </colgroup>
        <thead>
          <tr style={{ color: THEME.inkSoft, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <th scope="col" className="text-left font-medium px-5 py-3">Product</th>
            <th scope="col" className="text-right font-medium px-3 py-3">Selling price</th>
            <th scope="col" className="text-right font-medium px-3 py-3">Supplier cost</th>
            <th scope="col" className="text-right font-medium px-3 py-3">Profit / unit</th>
            <th scope="col" className="text-right font-medium px-3 py-3">Margin</th>
            <th scope="col" className="px-3 py-3"><span className="sr-only">Details</span></th>
          </tr>
        </thead>
        {sections.map((sec) => (
          <tbody key={sec.group}>
            {cat === 'All' && (
              <tr>
                <th scope="colgroup" colSpan={6} className="text-left font-normal px-5 pt-5 pb-2" style={{ borderTop: `1px solid ${THEME.line}`, background: THEME.bg }}>
                  {sectionHead(sec.group, sec.rows.length)}
                </th>
              </tr>
            )}
            {sec.rows.map((row) => {
              const p = row.p;
              const s = plStats(p);
              const open = expanded === row.key;
              const id = `pl-d-${row.i}`;
              return (
                <React.Fragment key={row.key}>
                  <tr data-plkey={row.key} onClick={() => setExpanded(open ? null : row.key)}
                    className={`pl-row cursor-pointer ${open ? '' : 'row-hover'} ${flashKey === row.key ? 'pl-flash' : ''}`}
                    style={{ borderTop: `1px solid ${THEME.line}`, background: open ? THEME.brandBg : 'transparent' }}>
                    <th scope="row" className="text-left font-semibold px-5 py-3.5 break-words" style={{ color: THEME.ink }}>{p.name}</th>
                    <td className="text-right px-3 py-3.5">{priceCell(p, true)}</td>
                    <td className="text-right px-3 py-3.5 tabular-nums whitespace-nowrap" style={{ color: THEME.ink }}>{peso(s.cost)}</td>
                    <td className="text-right px-3 py-3.5 tabular-nums whitespace-nowrap font-medium">{profitText(s.profit)}</td>
                    <td className="text-right px-3 py-3.5 tabular-nums whitespace-nowrap" style={{ color: s.margin !== null && s.margin < 0 ? THEME.red : THEME.inkSoft }}>{plPct(s.margin)}</td>
                    <td className="px-2 py-2 text-right">
                      <button type="button" aria-expanded={open} aria-controls={id} aria-label={`${open ? 'Hide' : 'Show'} details for ${p.name}`}
                        onClick={(e) => { e.stopPropagation(); setExpanded(open ? null : row.key); }}
                        className="pl-btn w-11 h-11 inline-flex items-center justify-center rounded-lg" style={{ color: THEME.inkSoft }}>
                        <ChevronDown size={18} style={{ transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'none' }} />
                      </button>
                    </td>
                  </tr>
                  <tr aria-hidden={!open}>
                    <td colSpan={6} className="p-0" style={{ background: open ? THEME.brandBg : 'transparent' }}>
                      <div id={id} role="region" aria-label={`${p.name} details`} className={`mn-collapse ${open ? 'open' : ''}`}>
                        <div>
                          <div className="px-5 pb-4 pt-1 flex items-end justify-between gap-6 flex-wrap">
                            <div className="flex-1 min-w-[280px]">{detailGrid(p, false)}</div>
                            {actions(row)}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        ))}
      </table>
    </div>
  );

  const accordionView = (
    <div className="space-y-5">
      {sections.map((sec) => (
        <section key={sec.group} aria-label={sec.group}>
          {cat === 'All' && <div className="mb-2 px-1">{sectionHead(sec.group, sec.rows.length)}</div>}
          <ul className="rounded-2xl overflow-hidden" style={{ background: THEME.card, border: `1px solid ${THEME.line}` }}>
            {sec.rows.map((row, k) => {
              const p = row.p;
              const s = plStats(p);
              const open = expanded === row.key;
              const id = `pl-d-${row.i}`;
              const bid = `pl-b-${row.i}`;
              return (
                <li key={row.key} data-plkey={row.key} className={`pl-row ${flashKey === row.key ? 'pl-flash' : ''}`}
                  style={{ borderTop: k ? `1px solid ${THEME.line}` : 'none', background: open ? THEME.brandBg : 'transparent' }}>
                  <h3 className="m-0">
                    <button type="button" id={bid} aria-expanded={open} aria-controls={id}
                      onClick={() => setExpanded(open ? null : row.key)}
                      className={`w-full text-left px-4 py-3.5 flex items-start gap-3 ${open ? '' : 'row-hover'}`} style={{ minHeight: 56 }}>
                      <span className="flex-1 min-w-0">
                        <span className="block font-semibold break-words" style={{ color: THEME.ink, fontSize: 15 }}>{p.name}</span>
                        {!open && (
                          <span className="block text-[13px] mt-1 tabular-nums" style={{ color: THEME.inkSoft }}>
                            Cost {peso(s.cost)} · {s.profit < 0 ? <span style={{ color: THEME.red }}>Loss {peso(Math.abs(s.profit))}</span> : <>Profit <span style={{ color: THEME.green }}>{peso(s.profit)}</span></>} · {plPct(s.margin)}
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                        {priceCell(p, true)}
                        <ChevronDown size={18} style={{ color: THEME.inkSoft, transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'none' }} />
                      </span>
                    </button>
                  </h3>
                  <div id={id} role="region" aria-labelledby={bid} className={`mn-collapse ${open ? 'open' : ''}`}>
                    <div>
                      <div className="px-4 pb-4 pt-0.5 space-y-4">
                        {detailGrid(p, true)}
                        {actions(row, phone)}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );

  const reorderView = (
    <div className="space-y-5">
      {sections.map((sec) => (
        <section key={sec.group} aria-label={`${sec.group}, reorder`}>
          <div className="mb-2 px-1">{sectionHead(sec.group, sec.rows.length)}</div>
          <ol className="rounded-2xl overflow-hidden relative" style={{ background: THEME.card, border: `1px solid ${THEME.line}` }}>
            {sec.rows.map((row, k) => {
              const p = row.p;
              const n = sec.rows.length;
              return (
                <li key={row.key} data-plkey={row.key} className="flex items-center gap-3 px-3 sm:px-4 py-2 relative"
                  style={{ borderTop: k ? `1px solid ${THEME.line}` : 'none', background: THEME.card }}>
                  <span className="w-7 text-center text-sm tabular-nums flex-shrink-0" style={{ color: THEME.inkSoft }} aria-hidden="true">{k + 1}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-medium break-words" style={{ color: THEME.ink }}>{p.name}</span>
                    <span className="block text-xs mt-0.5" style={{ color: THEME.inkSoft }}>{peso(plNum(p.price))} / {plUnit(p.unit)}</span>
                  </span>
                  <span className="flex gap-1.5 flex-shrink-0">
                    <button type="button" data-dir="up" disabled={k === 0} onClick={() => move(row, 'up')}
                      aria-label={`Move ${p.name} up`} className="pl-btn w-11 h-11 inline-flex items-center justify-center rounded-xl disabled:opacity-30"
                      style={{ border: `1px solid ${THEME.line}`, color: THEME.ink, background: THEME.card }}>
                      <ArrowUp size={17} />
                    </button>
                    <button type="button" data-dir="down" disabled={k === n - 1} onClick={() => move(row, 'down')}
                      aria-label={`Move ${p.name} down`} className="pl-btn w-11 h-11 inline-flex items-center justify-center rounded-xl disabled:opacity-30"
                      style={{ border: `1px solid ${THEME.line}`, color: THEME.ink, background: THEME.card }}>
                      <ArrowDown size={17} />
                    </button>
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );

  const total = catalog.length;
  const emptySearch = !reorder && total > 0 && visible.length === 0;

  return (
    <div ref={rootRef} className="pl-root">
      {/* ===== Header ===== */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h1 className="font-display text-3xl sm:text-4xl leading-tight" style={{ color: THEME.brand }}>Price List</h1>
          <div className="text-sm mt-1" style={{ color: THEME.inkSoft }}>Supplier cost and selling price for each product.</div>
        </div>
        <button type="button" onClick={(e) => openEditor(null, e.currentTarget)} disabled={reorder}
          className="pl-btn inline-flex items-center gap-1.5 px-4 rounded-xl text-sm font-semibold flex-shrink-0 disabled:opacity-40"
          style={{ minHeight: 44, background: THEME.brand, color: 'white', boxShadow: '0 2px 8px rgba(122,46,51,0.18)' }}>
          <Plus size={17} /> Product
        </button>
      </div>

      {/* ===== Search + reorder ===== */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: THEME.inkSoft }} />
          <input value={reorder ? '' : query} onChange={(e) => setQuery(e.target.value)} disabled={reorder}
            placeholder={reorder ? 'Search is off while reordering' : 'Search products'} aria-label="Search products"
            className="pl-input w-full pl-10 pr-11 rounded-xl outline-none disabled:opacity-60"
            style={{ minHeight: 44, background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink }} />
          {query && !reorder && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 inline-flex items-center justify-center rounded-lg row-hover">
              <X size={15} style={{ color: THEME.inkSoft }} />
            </button>
          )}
        </div>
        {reorder ? (
          <button type="button" onClick={stopReorder}
            className="pl-btn inline-flex items-center gap-1.5 px-4 rounded-xl text-sm font-semibold flex-shrink-0"
            style={{ minHeight: 44, background: THEME.brand, color: 'white' }}>
            <Check size={16} /> Done
          </button>
        ) : (
          <button type="button" onClick={startReorder} disabled={total < 2}
            className="pl-btn inline-flex items-center gap-1.5 px-3.5 rounded-xl text-sm font-medium flex-shrink-0 disabled:opacity-40"
            style={{ minHeight: 44, background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink }}>
            <ArrowUpDown size={16} /> Reorder
          </button>
        )}
      </div>

      {reorder && (
        <div className="mb-3 px-4 py-3 rounded-xl text-sm flex items-start gap-2 mn-pop-in" style={{ background: THEME.brandBg, color: THEME.ink }} role="note">
          <ArrowUpDown size={16} className="mt-0.5 flex-shrink-0" style={{ color: THEME.brand }} />
          <span>Use the arrows to move products within their category — this is the order they appear in everywhere. Search is off while reordering so every product stays in view.</span>
        </div>
      )}

      {/* ===== Category tabs ===== */}
      <div className="relative mb-4 overflow-x-auto mn-noscroll" style={{ borderBottom: `1px solid ${THEME.line}` }}>
        <div ref={tabListRef} role="tablist" aria-label="Product categories" className="relative flex min-w-max" onKeyDown={onTabKey}>
          {tabs.map((t) => {
            const on = cat === t;
            return (
              <button key={t} type="button" role="tab" aria-selected={on} aria-controls="pl-panel" tabIndex={on ? 0 : -1}
                ref={(el) => { tabRefs.current[t] = el; }} onClick={() => setCat(t)}
                className="pl-tab px-3 sm:px-4 inline-flex items-center gap-1.5 text-sm"
                style={{ minHeight: 44, color: on ? THEME.brand : THEME.inkSoft, fontWeight: on ? 600 : 500 }}>
                {t}
                <span className="text-xs tabular-nums px-1.5 py-0.5 rounded-full" style={{ background: on ? THEME.brandBg : 'transparent', color: on ? THEME.brand : THEME.inkSoft }}>
                  {t === 'All' ? counts.All : (counts[t] || 0)}
                </span>
              </button>
            );
          })}
          {ind && <span className="pl-underline" aria-hidden="true" style={{ left: ind.left, width: ind.width, background: THEME.brand }} />}
        </div>
      </div>

      {/* ===== List ===== */}
      <div id="pl-panel" role="tabpanel" tabIndex={-1} className="outline-none" aria-label={`${cat === 'All' ? 'All products' : cat}`} ref={listRef}>
        {total === 0 ? (
          <Card className="px-6 py-12 text-center">
            <div className="font-display text-xl mb-1" style={{ color: THEME.ink }}>No products yet</div>
            <div className="text-sm mb-5" style={{ color: THEME.inkSoft }}>Add your first product to start pricing orders.</div>
            <Btn variant="primary" onClick={(e) => openEditor(null, e && e.currentTarget)}><Plus size={15} className="inline -mt-0.5 mr-1" />Add product</Btn>
          </Card>
        ) : emptySearch ? (
          <Card className="px-6 py-12 text-center">
            <div className="font-display text-xl mb-1" style={{ color: THEME.ink }}>{q ? `No products match “${query.trim()}”` : `No ${cat} products yet`}</div>
            <div className="text-sm mb-5" style={{ color: THEME.inkSoft }}>
              {q && cat !== 'All' && counts.All > 0 ? `${counts.All} match${counts.All !== 1 ? '' : 'es'} in other categories.` : 'Try a different name or category.'}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {q && <Btn variant="secondary" onClick={() => setQuery('')}>Clear search</Btn>}
              {cat !== 'All' && <Btn variant="secondary" onClick={() => setCat('All')}>Show all categories</Btn>}
            </div>
          </Card>
        ) : reorder ? reorderView : (wide ? tableView : accordionView)}
        {!reorder && total > 0 && !emptySearch && (
          <div className="text-xs mt-3 px-1" style={{ color: THEME.inkSoft }}>
            {q || cat !== 'All' ? `Showing ${visible.length} of ${total} products` : `${total} products`}
          </div>
        )}
      </div>

      {/* Screen-reader announcements */}
      <div className="sr-only" role="status" aria-live="polite">{announce}</div>

      {/* Save feedback (real persistence state) */}
      {fb && (
        <div className="fixed inset-x-0 z-40 flex justify-center px-4 pointer-events-none no-print" style={{ bottom: 'max(env(safe-area-inset-bottom), 20px)' }}>
          <div key={fb.t + fb.phase} className="pl-toast px-4 py-2.5 rounded-xl text-sm shadow-lg inline-flex items-center gap-2 max-w-full"
            style={fb.phase === 'done' && syncStatus !== 'cloud'
              ? { background: THEME.warnBg, color: THEME.warnInk, border: `1px solid ${THEME.amber}` }
              : { background: THEME.ink, color: THEME.bg }}>
            {fb.phase === 'done'
              ? (syncStatus === 'cloud' ? <Check size={15} /> : <HardDrive size={15} />)
              : <Loader2 size={15} className="animate-spin" />}
            <span className="min-w-0">
              <span className="font-semibold">{fb.label}</span>
              <span className="opacity-85"> · {fb.phase === 'done'
                ? (syncStatus === 'cloud' ? 'synced to cloud' : syncStatus === 'local-only' ? 'saved on this device only, not synced yet' : 'saved on this device, cloud not confirmed')
                : 'saved on this device, syncing…'}</span>
            </span>
          </div>
        </div>
      )}

      {editor && (
        <ProductEditorSheet
          editor={editor} closing={editorClosing} phone={phone}
          errors={errors} showError={(k) => submitted || (touched[k] && String(editor.draft[k]).trim() !== '')} onBlurField={(k) => setTouched((t) => ({ ...t, [k]: true }))}
          setDraft={setDraft} onSave={save} onCancel={() => closeEditor(true)} onRequestClose={() => closeEditor(false)}
          editState={editState} dirty={dirty} />
      )}
    </div>
  );
}

// Product editor: right-side sheet on larger screens, full screen on phones.
// Modal — traps focus, locks page scroll, Escape / backdrop ask before
// discarding. On phones it follows the visual viewport so the footer stays
// above the on-screen keyboard.
function ProductEditorSheet({ editor, closing, phone, errors, showError, onBlurField, setDraft, onSave, onCancel, onRequestClose, editState, dirty }) {
  const ref = useRef(null);
  const [vv, setVv] = useState(null);
  useEffect(() => {
    const el = ref.current;
    if (el) {
      const target = (!phone && editor.isNew && el.querySelector('#pl-f-name')) || el.querySelector('[data-autofocus]') || el;
      try { target.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!phone || !window.visualViewport) { setVv(null); return undefined; }
    const v = window.visualViewport;
    const upd = () => setVv({ h: v.height, top: v.offsetTop });
    upd();
    v.addEventListener('resize', upd);
    v.addEventListener('scroll', upd);
    return () => { v.removeEventListener('resize', upd); v.removeEventListener('scroll', upd); };
  }, [phone]);
  // Escape works wherever focus is (e.g. after a click on the backdrop).
  const closeRef = useRef(onRequestClose);
  closeRef.current = onRequestClose;
  useEffect(() => {
    const onDocKey = (e) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      e.preventDefault();
      closeRef.current();
      // Still open (kept editing)? Put focus back inside the editor.
      setTimeout(() => { const el = ref.current; if (el && document.contains(el) && !el.contains(document.activeElement)) el.focus({ preventScroll: true }); }, 0);
    };
    document.addEventListener('keydown', onDocKey);
    return () => document.removeEventListener('keydown', onDocKey);
  }, []);
  const onBackdrop = () => {
    onRequestClose();
    setTimeout(() => { const el = ref.current; if (el && document.contains(el) && !el.contains(document.activeElement)) el.focus({ preventScroll: true }); }, 0);
  };
  const onKeyDown = (e) => {
    if (e.key !== 'Tab' || !ref.current) return;
    const nodes = Array.from(ref.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter((n) => !n.disabled && n.offsetParent !== null);
    if (!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const d = editor.draft;
  const err = (k) => (showError(k) ? errors[k] : null);
  // Live preview from the draft — only when both numbers are valid.
  const cTxt = String(d.cost).trim(), pTxt = String(d.price).trim();
  const ready = cTxt !== '' && pTxt !== '' && !errors.cost && !errors.price;
  const stats = ready ? plStats({ cost: Number(cTxt), price: Number(pTxt) }) : null;
  const autoW = ready ? rqPricing({ cost: Number(cTxt), price: Number(pTxt) }).wholesale : null;
  const wTxt = String(d.wholesalePrice).trim();
  const wNum = wTxt === '' || errors.wholesalePrice ? null : Number(wTxt);
  const unit = plUnit(d.unit);
  const renamed = !editor.isNew && d.name.trim() !== '' && d.name.trim() !== editor.origName;
  const title = editor.isNew ? 'Add product' : 'Edit product';

  const field = (k, label, input, hint) => (
    <div>
      <label htmlFor={`pl-f-${k}`} className="block text-xs uppercase font-medium mb-1.5" style={{ color: THEME.inkSoft, letterSpacing: '0.08em' }}>{label}</label>
      {input}
      {err(k)
        ? <div id={`pl-e-${k}`} className="text-sm mt-1.5 flex items-start gap-1.5" style={{ color: THEME.red }}><AlertCircle size={14} className="mt-0.5 flex-shrink-0" />{err(k)}</div>
        : hint ? <div className="text-xs mt-1.5" style={{ color: THEME.inkSoft }}>{hint}</div> : null}
    </div>
  );
  const inputProps = (k) => ({
    id: `pl-f-${k}`,
    value: d[k],
    onChange: (e) => setDraft({ [k]: e.target.value }),
    onBlur: () => onBlurField(k),
    'aria-invalid': !!err(k),
    'aria-describedby': err(k) ? `pl-e-${k}` : undefined,
    className: 'pl-input w-full px-3.5 rounded-xl outline-none',
    style: { minHeight: 46, background: THEME.card, border: `1px solid ${err(k) ? THEME.red : THEME.line}`, color: THEME.ink },
  });
  const money = (k) => (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style={{ color: THEME.inkSoft }}>₱</span>
      <input {...inputProps(k)} type="text" inputMode="decimal" autoComplete="off" placeholder={k === 'wholesalePrice' ? 'Automatic' : '0.00'}
        className={`${inputProps(k).className} pl-8 tabular-nums`} />
    </div>
  );
  const segmented = (k, options, label) => (
    <div role="radiogroup" aria-label={label} className="grid gap-1 p-1 rounded-xl" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))`, background: THEME.bg, border: `1px solid ${THEME.line}` }}>
      {options.map((o) => {
        const on = d[k] === o;
        return (
          <button key={o} type="button" role="radio" aria-checked={on} onClick={() => setDraft({ [k]: o })}
            className="pl-btn rounded-lg text-sm font-medium" style={{ minHeight: 40, background: on ? THEME.card : 'transparent', color: on ? THEME.brand : THEME.inkSoft, boxShadow: on ? '0 1px 4px rgba(42,38,36,0.12)' : 'none' }}>
            {o}
          </button>
        );
      })}
    </div>
  );

  const sheetStyle = phone
    ? { left: 0, right: 0, top: vv ? vv.top : 0, height: vv ? vv.h : '100dvh' }
    : undefined;
  return (
    <div className="fixed inset-0 z-[46] no-print">
      <div className={`absolute inset-0 ${closing ? 'mn-backdrop-out' : 'mn-backdrop-in'}`} style={{ background: 'rgba(30,20,18,0.5)' }} onClick={onBackdrop} />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="pl-editor-title" tabIndex={-1} onKeyDown={onKeyDown}
        className={`absolute flex flex-col outline-none ${phone
          ? (closing ? 'mn-sheet-out' : 'mn-sheet-in')
          : `top-0 right-0 bottom-0 w-full max-w-[480px] ${closing ? 'mn-panel-out' : 'mn-panel-in'}`}`}
        style={{ ...sheetStyle, background: THEME.card, boxShadow: '-12px 0 40px rgba(0,0,0,0.18)' }}>
        {/* Header */}
        <div className="flex-shrink-0 flex items-start gap-3 px-5 sm:px-6 pb-4" style={{ borderBottom: `1px solid ${THEME.line}`, paddingTop: phone ? 'max(env(safe-area-inset-top), 14px)' : 20 }}>
          <div className="flex-1 min-w-0">
            <h2 id="pl-editor-title" className="font-display text-2xl leading-tight" style={{ color: THEME.brand }}>{title}</h2>
            {!editor.isNew && <div className="text-sm mt-0.5 break-words" style={{ color: THEME.inkSoft }}>{editor.origName}</div>}
          </div>
          <button type="button" data-autofocus onClick={onRequestClose} aria-label="Close product editor"
            className="w-11 h-11 flex items-center justify-center rounded-lg row-hover flex-shrink-0" style={{ color: THEME.ink }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 sm:px-6 py-5 space-y-5">
          {editState === 'missing' && (
            <div className="px-4 py-3 rounded-xl text-sm flex items-start gap-2" role="alert" style={{ background: THEME.errorBg, color: THEME.red }}>
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>This product is no longer in the Price List — it may have been deleted or renamed on another device. Saving is turned off so nothing is overwritten. Close this editor to see the latest list.</span>
            </div>
          )}
          {editState === 'changed' && (
            <div className="px-4 py-3 rounded-xl text-sm flex items-start gap-2" role="note" style={{ background: THEME.warnBg, color: THEME.warnInk }}>
              <Info size={16} className="mt-0.5 flex-shrink-0" />
              <span>This product was updated on another device while you were editing. Saving will replace those values with yours.</span>
            </div>
          )}

          {field('name', 'Product name',
            <input {...inputProps('name')} type="text" autoComplete="off" placeholder="e.g. Pork Liempo" />,
            renamed ? `Orders already placed keep the name “${editor.origName}”, so they'll keep using the cost saved on each order.` : null)}

          <div>
            <div className="block text-xs uppercase font-medium mb-1.5" style={{ color: THEME.inkSoft, letterSpacing: '0.08em' }} id="pl-l-group">Category</div>
            {segmented('group', PL_GROUPS, 'Category')}
          </div>
          <div>
            <div className="block text-xs uppercase font-medium mb-1.5" style={{ color: THEME.inkSoft, letterSpacing: '0.08em' }}>Unit</div>
            {segmented('unit', PL_UNITS, 'Unit')}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {field('cost', `Supplier cost / ${unit}`, money('cost'))}
            {field('price', `Selling price / ${unit}`, money('price'))}
          </div>

          {/* Live preview */}
          <div className="rounded-2xl grid grid-cols-2 overflow-hidden" style={{ background: stats && stats.profit < 0 ? THEME.errorBg : THEME.bg, border: `1px solid ${THEME.line}` }} aria-live="polite">
            <div className="px-4 py-3">
              <div className="text-[11px] uppercase font-medium" style={{ color: THEME.inkSoft, letterSpacing: '0.08em' }}>{stats && stats.profit < 0 ? 'Loss per unit' : 'Profit per unit'}</div>
              <div className="font-display text-2xl tabular-nums mt-0.5" style={{ color: !stats ? THEME.inkSoft : stats.profit < 0 ? THEME.red : THEME.green }}>
                {stats ? `${plMoney(stats.profit)}` : '—'}<span className="text-sm font-sans ml-1" style={{ color: THEME.inkSoft }}>{stats ? `/ ${unit}` : ''}</span>
              </div>
            </div>
            <div className="px-4 py-3" style={{ borderLeft: `1px solid ${THEME.line}` }}>
              <div className="text-[11px] uppercase font-medium" style={{ color: THEME.inkSoft, letterSpacing: '0.08em' }}>Margin</div>
              <div className="font-display text-2xl tabular-nums mt-0.5" style={{ color: stats && stats.margin !== null && stats.margin < 0 ? THEME.red : THEME.ink }}>{stats ? plPct(stats.margin) : '—'}</div>
            </div>
            {(!stats || stats.margin === null) && (
              <div className="col-span-2 px-4 pb-3 -mt-1 text-xs" style={{ color: THEME.inkSoft }}>
                {!stats ? 'Enter the supplier cost and selling price to see profit and margin.' : 'Margin needs a selling price above ₱0.'}
              </div>
            )}
          </div>

          {field('wholesalePrice', `Custom wholesale price / ${unit} — optional`, money('wholesalePrice'),
            wNum !== null && wNum > 0
              ? `This price will be used for wholesale orders instead of the automatic one${autoW !== null ? ` (${peso(autoW)})` : ''}.`
              : autoW !== null
                ? `Leave blank to use the automatic wholesale price: ${peso(autoW)} / ${unit}${wNum === 0 ? ' (0 also means automatic)' : ''}.`
                : 'Leave blank to use the automatic wholesale price.')}

          <div className="text-xs leading-relaxed pt-1" style={{ color: THEME.inkSoft }}>
            New orders, accepted online orders and the customer app use the prices saved here. Orders already placed keep their saved prices — but editing and saving an older order re-prices its items to this list.
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 grid grid-cols-2 gap-2 px-4 sm:px-5 pt-3" style={{ borderTop: `1px solid ${THEME.line}`, background: THEME.card, paddingBottom: phone ? 'max(env(safe-area-inset-bottom), 12px)' : 14 }}>
          <button type="button" onClick={onCancel} className="pl-btn inline-flex items-center justify-center rounded-xl text-sm font-semibold"
            style={{ minHeight: 48, background: THEME.card, color: THEME.ink, border: `1px solid ${THEME.line}` }}>
            Cancel
          </button>
          <button type="button" onClick={onSave} disabled={editState === 'missing'}
            className="pl-btn inline-flex items-center justify-center gap-1.5 rounded-xl text-sm font-semibold disabled:opacity-40"
            style={{ minHeight: 48, background: THEME.brand, color: 'white', border: `1px solid ${THEME.brand}` }}>
            <Save size={15} /> {editor.isNew ? 'Add product' : 'Save changes'}
          </button>
          {dirty && <div className="col-span-2 text-center text-[11px] -mt-0.5" style={{ color: THEME.inkSoft }}>Unsaved changes</div>}
        </div>
      </div>
    </div>
  );
}

// "⋯" menu on an expanded product: less frequent actions; destructive last.
function PLMoreMenu({ name, onReorder, onDelete }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('touchstart', onDown); };
  }, [open]);
  const run = (fn) => { setOpen(false); fn(); };
  return (
    <div className="relative" ref={wrapRef}
      onKeyDown={(e) => { if (e.key === 'Escape' && open) { e.preventDefault(); e.stopPropagation(); setOpen(false); if (btnRef.current) btnRef.current.focus(); } }}>
      <button ref={btnRef} type="button" onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-haspopup="true" aria-expanded={open} aria-label={`More actions for ${name}`}
        className="pl-btn w-11 h-11 inline-flex items-center justify-center rounded-xl"
        style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink }}>
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-2 w-52 rounded-xl p-1.5 z-20 mn-pop-in"
          style={{ background: THEME.card, border: `1px solid ${THEME.line}`, boxShadow: '0 12px 32px rgba(42,38,36,0.18)' }}>
          <button role="menuitem" type="button" onClick={(e) => { e.stopPropagation(); run(onReorder); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left row-hover" style={{ color: THEME.ink, minHeight: 44 }}>
            <ArrowUpDown size={15} /> Reorder products
          </button>
          <div className="my-1" style={{ borderTop: `1px solid ${THEME.line}` }} />
          <button role="menuitem" type="button" onClick={(e) => { e.stopPropagation(); run(onDelete); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left danger-hover" style={{ color: THEME.red, minHeight: 44 }}>
            <Trash2 size={15} /> Delete product
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MONTHLY REPORT ENGINE (pure — no React, unit-testable)
   ============================================================
   Turns orders + expenses into one record per calendar month.
   Definitions (kept consistent with the Dashboard):
   - Month = the order's date (same as the Dashboard's "this month").
   - Cancelled orders are excluded everywhere.
   - Supplier cost: every order uses the cost locked on each line when it
     was placed, so a price change today never rewrites history (valuing
     May's orders at September prices would cut May's real 25.6% margin to
     16.7%). The one exception: current-month orders NOT yet delivered use
     today's Price List cost, because they still have to be bought at it.
   - Expenses: operating expenses logged in that month. "Stock" and
     "Capital / Stock" are excluded — that's inventory money already
     counted as supplier cost, so including it would double-count.
   - Net profit = gross profit − operating expenses.                    */
const MR_STOCK_CATEGORIES = ['Capital / Stock', 'Stock'];
const mrMonthLabel = (key, opts = { month: 'long', year: 'numeric' }) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-PH', opts);
};
const mrDaysInMonth = (key) => { const [y, m] = key.split('-').map(Number); return new Date(y, m, 0).getDate(); };

function buildMonthlyReport(orders, expenses, catalog, todayIso) {
  const productByName = Object.fromEntries((catalog || []).map((p) => [p.name, p]));
  const currentKey = (todayIso || '').slice(0, 7);
  const liveCost = (it) => {
    const p = productByName[it.product];
    if (p && p.cost !== undefined && p.cost !== null && p.cost !== '') return Number(p.cost) || 0;
    return Number(it.cost) || 0;
  };
  const lockedCost = (it) => {
    const c = Number(it.cost);
    return c > 0 ? c : liveCost(it); // fall back only if the line never stored a cost
  };
  const blank = (key) => ({
    key, sales: 0, cost: 0, gross: 0, expenses: 0, net: 0, orders: 0, cancelled: 0,
    kg: 0, outstanding: 0, b2bSales: 0, firstDay: 99, lastDay: 0, unbatched: 0,
    customers: {}, products: {}, batches: {}, expenseByCat: {},
  });
  const months = {};
  const get = (key) => (months[key] = months[key] || blank(key));

  // First month each customer ever ordered → "new customer" detection.
  const firstSeen = {};
  const live = Object.values(orders || {}).filter((o) => o && o.date);
  [...live].sort((a, b) => (a.date || '').localeCompare(b.date || '')).forEach((o) => {
    if (o.delivery_status === 'Cancelled') return;
    const c = (o.customer || '').trim().toLowerCase();
    if (c && !firstSeen[c]) firstSeen[c] = o.date.slice(0, 7);
  });

  live.forEach((o) => {
    const key = o.date.slice(0, 7);
    const M = get(key);
    if (o.delivery_status === 'Cancelled') { M.cancelled += 1; return; }
    const useLive = key === currentKey && o.delivery_status !== 'Delivered';
    let sales = 0, cost = 0;
    (o.items || []).forEach((it) => {
      const q = Number(it.qty) || 0;
      const ls = q * (Number(it.price) || 0);
      const lc = q * (useLive ? liveCost(it) : lockedCost(it));
      sales += ls; cost += lc;
      if (!it.unit || it.unit === 'kg') M.kg += q;
      const P = (M.products[it.product] = M.products[it.product] || { name: it.product, qty: 0, unit: it.unit || 'kg', sales: 0, gross: 0 });
      P.qty += q; P.sales += ls; P.gross += ls - lc;
    });
    M.sales += sales; M.cost += cost; M.orders += 1;
    const day = Number(o.date.slice(8, 10)) || 1;
    M.firstDay = Math.min(M.firstDay, day); M.lastDay = Math.max(M.lastDay, day);
    if (o.payment_status === 'Unpaid') M.outstanding += sales;
    else if (o.payment_status === 'Partial') M.outstanding += Math.max(0, sales - (Number(o.amount_paid) || 0));
    if ((o.items || []).some((it) => it.wholesale) || /pick\s*n.?\s*go/i.test(o.customer || '')) M.b2bSales += sales;
    const cname = (o.customer || '').trim();
    const ck = cname.toLowerCase();
    if (ck) {
      const C = (M.customers[ck] = M.customers[ck] || { name: cname, orders: 0, sales: 0, gross: 0, isNew: firstSeen[ck] === key });
      C.orders += 1; C.sales += sales; C.gross += sales - cost;
    }
    // Batches = real delivery days only. Orders never given a batch are
    // counted separately instead of each becoming a fake "batch".
    if (o.delivery_batch) {
      const bday = o.delivery_batch;
      const B = (M.batches[bday] = M.batches[bday] || { date: bday, orders: 0, sales: 0, gross: 0 });
      B.orders += 1; B.sales += sales; B.gross += sales - cost;
    } else {
      M.unbatched += 1;
    }
  });

  (expenses || []).forEach((e) => {
    if (!e || !e.date || MR_STOCK_CATEGORIES.includes(e.category)) return;
    const M = get(e.date.slice(0, 7));
    const amt = Number(e.amount) || 0;
    M.expenses += amt;
    M.expenseByCat[e.category || 'Other'] = (M.expenseByCat[e.category || 'Other'] || 0) + amt;
  });

  const list = Object.values(months)
    .filter((M) => M.orders > 0 || M.expenses > 0)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((M, idx, arr) => {
      M.gross = M.sales - M.cost;
      M.net = M.gross - M.expenses;
      M.margin = M.sales > 0 ? M.gross / M.sales : 0;
      M.aov = M.orders > 0 ? M.sales / M.orders : 0;
      M.profitPerOrder = M.orders > 0 ? M.gross / M.orders : 0;
      const custs = Object.values(M.customers);
      M.customerCount = custs.length;
      M.newCustomers = custs.filter((c) => c.isNew).length;
      M.returningGross = custs.filter((c) => !c.isNew).reduce((s, c) => s + c.gross, 0);
      M.topCustomers = custs.sort((a, b) => b.sales - a.sales).slice(0, 5);
      M.topProducts = Object.values(M.products).sort((a, b) => b.gross - a.gross);
      M.batchList = Object.values(M.batches).sort((a, b) => a.date.localeCompare(b.date)).map((b) => ({
        ...b,
        weekday: new Date(b.date + 'T00:00:00').toLocaleDateString('en-PH', { weekday: 'short' }),
        label: new Date(b.date + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
      }));
      // Share of this month's orders that had a real delivery batch. Batch and
      // weekday comparisons are only shown when most orders are covered.
      M.batchCoverage = M.orders > 0 ? (M.orders - M.unbatched) / M.orders : 0;
      M.expenseCats = Object.entries(M.expenseByCat).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
      M.label = mrMonthLabel(M.key);
      M.short = mrMonthLabel(M.key, { month: 'short' });
      M.isCurrent = M.key === currentKey;
      M.daysInMonth = mrDaysInMonth(M.key);
      M.isFirst = idx === 0;
      // A month that started late (the first month of the business) isn't a fair comparison.
      M.partialStart = idx === 0 && M.firstDay > 7;
      if (M.isCurrent) {
        const elapsed = Math.max(1, Number((todayIso || '').slice(8, 10)) || 1);
        M.daysElapsed = elapsed;
        M.projectedNet = elapsed < M.daysInMonth ? (M.net / elapsed) * M.daysInMonth : null;
      }
      M.prevKey = idx > 0 ? arr[idx - 1].key : null;
      return M;
    });

  const byKey = Object.fromEntries(list.map((M) => [M.key, M]));
  // Rank only full, comparable months (skip a still-running current month).
  const ranked = list.filter((M) => !M.isCurrent).slice().sort((a, b) => b.net - a.net);
  const rankOf = Object.fromEntries(ranked.map((M, i) => [M.key, i + 1]));
  const totals = list.reduce((t, M) => ({ net: t.net + M.net, gross: t.gross + M.gross, sales: t.sales + M.sales, orders: t.orders + M.orders }), { net: 0, gross: 0, sales: 0, orders: 0 });
  return { list, byKey, ranked, rankOf, totals, best: ranked[0] || null, weakest: ranked.length > 1 ? ranked[ranked.length - 1] : null };
}

// Explain WHY profit moved between two months: gross = orders × avg order × margin.
// Splits the peso change into those three drivers (log-share method, so the
// three parts always add up exactly to the real change).
function mrDrivers(cur, prev) {
  if (!cur || !prev || cur.gross <= 0 || prev.gross <= 0 || cur.orders <= 0 || prev.orders <= 0 || cur.aov <= 0 || prev.aov <= 0 || cur.margin <= 0 || prev.margin <= 0) return null;
  const dG = cur.gross - prev.gross;
  const lnTotal = Math.log(cur.gross / prev.gross);
  const parts = [
    { id: 'orders', label: 'Number of orders', ln: Math.log(cur.orders / prev.orders) },
    { id: 'aov', label: 'Order size', ln: Math.log(cur.aov / prev.aov) },
    { id: 'margin', label: 'Margin', ln: Math.log(cur.margin / prev.margin) },
  ];
  if (Math.abs(lnTotal) < 1e-9) return { dG, parts: parts.map((p) => ({ ...p, value: 0 })) };
  return { dG, parts: parts.map((p) => ({ ...p, value: dG * (p.ln / lnTotal) })) };
}

// Plain-English takeaways for one month. Each insight: { tone: 'good'|'warn'|'info', text }.
function mrInsights(M, report, fmt) {
  if (!M) return [];
  const out = [];
  const prev = M.prevKey ? report.byKey[M.prevKey] : null;
  const rank = report.rankOf[M.key];
  const nRanked = report.ranked.length;
  if (M.isCurrent) {
    if (M.projectedNet != null) out.push({ tone: M.projectedNet >= 0 ? 'info' : 'warn', text: `Month in progress — day ${M.daysElapsed} of ${M.daysInMonth}. At this pace you'll finish around ${M.projectedNet >= 0 ? `${fmt(M.projectedNet)} net profit` : `a ${fmt(Math.abs(M.projectedNet))} loss`}.` });
  } else if (nRanked >= 2 && rank === 1) {
    out.push({ tone: 'good', text: `Your strongest month so far — #1 of ${nRanked} months by net profit.` });
  } else if (nRanked >= 3 && rank === nRanked && M.partialStart) {
    out.push({ tone: 'info', text: `Lowest net profit so far (#${rank} of ${nRanked}) — but it was a partial first month.` });
  } else if (nRanked >= 3 && rank === nRanked) {
    out.push({ tone: 'warn', text: `Your weakest month so far — #${rank} of ${nRanked}. Worth asking what was different this month.` });
  } else if (rank) {
    out.push({ tone: 'info', text: `Ranked #${rank} of ${nRanked} months by net profit.` });
  }
  if (M.partialStart) out.push({ tone: 'info', text: `This was your first month and started on day ${M.firstDay}, so it isn't a full-month comparison.` });
  const d = mrDrivers(M, prev);
  // Totals of an unfinished month vs a full month aren't a fair fight, so the
  // "why profit moved" sentence is only written for finished months.
  if (d && prev && !M.isCurrent) {
    const sorted = [...d.parts].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    const main = sorted[0];
    const dir = d.dG >= 0 ? 'rose' : 'fell';
    const why = { orders: main.value >= 0 ? 'more orders' : 'fewer orders', aov: main.value >= 0 ? 'bigger orders' : 'smaller orders', margin: main.value >= 0 ? 'a better margin' : 'a thinner margin' }[main.id];
    const reason = (p) => ({ orders: p.value >= 0 ? 'more orders' : 'fewer orders', aov: p.value >= 0 ? 'bigger orders' : 'smaller orders', margin: p.value >= 0 ? 'a better margin' : 'a thinner margin' }[p.id]);
    // Also name a driver that pulled the other way, if it mattered.
    const against = sorted.find((p) => Math.sign(p.value) !== Math.sign(d.dG) && Math.abs(p.value) >= Math.abs(d.dG) * 0.25);
    const tail = against ? `, while ${reason(against)} ${against.value >= 0 ? 'added' : 'cost'} ${fmt(Math.abs(against.value))}` : '';
    out.push({ tone: d.dG >= 0 ? 'good' : 'warn', text: `Gross profit ${dir} ${fmt(Math.abs(d.dG))} vs ${prev.short}, mostly from ${why} (${main.value >= 0 ? '+' : '−'}${fmt(Math.abs(main.value))})${tail}.` });
  }
  // Margin trend: compare with the best-margin month so far.
  const earlier = report.list.filter((x) => x.key < M.key && x.sales > 0);
  if (earlier.length >= 2 && M.sales > 0) {
    const peak = earlier.reduce((a, b) => (b.margin > a.margin ? b : a));
    const drop = (peak.margin - M.margin) * 100;
    if (drop >= 3) out.push({ tone: 'warn', text: `Margin has slipped from ${(peak.margin * 100).toFixed(1)}% in ${peak.short} to ${(M.margin * 100).toFixed(1)}%${M.isCurrent ? ' so far' : ''}. On ${fmt(M.sales)} of sales, every point of margin is about ${fmt(M.sales / 100)}.` });
  }
  // Which product's profit per unit shrank the most vs last month (weighted by volume).
  if (prev) {
    let worst = null;
    Object.values(M.products).forEach((p) => {
      const q = prev.products[p.name];
      if (!q || q.qty <= 0 || p.qty <= 0) return;
      const nowPer = p.gross / p.qty, thenPer = q.gross / q.qty;
      const lost = (thenPer - nowPer) * p.qty;
      if (!worst || lost > worst.lost) worst = { name: p.name, unit: p.unit, nowPer, thenPer, lost };
    });
    if (worst && worst.lost >= Math.max(300, M.gross * 0.03)) {
      out.push({ tone: 'warn', text: `${worst.name} now earns ${fmt(worst.nowPer)}/${worst.unit} vs ${fmt(worst.thenPer)}/${worst.unit} in ${prev.short} — about ${fmt(worst.lost)} less profit this month. Worth checking its selling price against the supplier cost.` });
    }
  }
  if (M.isCurrent && M.expenses === 0 && prev && prev.expenses > 0) {
    out.push({ tone: 'info', text: `No expenses logged yet this month. ${prev.short} had ${fmt(prev.expenses)}, so net profit will likely come down once they're added.` });
  }
  const top = M.topProducts[0];
  if (top && M.gross > 0) out.push({ tone: 'info', text: `${top.name} earned the most — ${fmt(top.gross)}, ${Math.round((top.gross / M.gross) * 100)}% of the month's gross profit.` });
  const wk = {};
  M.batchList.forEach((b) => { (wk[b.weekday] = wk[b.weekday] || { n: 0, g: 0 }); wk[b.weekday].n += 1; wk[b.weekday].g += b.gross; });
  if (wk.Tue && wk.Sat && wk.Tue.n >= 2 && wk.Sat.n >= 2 && M.batchCoverage >= 0.6) {
    const tue = wk.Tue.g / wk.Tue.n, sat = wk.Sat.g / wk.Sat.n;
    const hi = sat >= tue ? ['Saturday', sat, 'Tuesday', tue] : ['Tuesday', tue, 'Saturday', sat];
    out.push({ tone: 'info', text: `${hi[0]} batches earned ${fmt(hi[1])} each on average, vs ${fmt(hi[3])} on ${hi[2]}.` });
  }
  if (M.customerCount > 0 && M.isFirst) {
    out.push({ tone: 'good', text: `${M.customerCount} customers ordered in your first month.` });
  } else if (M.customerCount > 0) {
    const retShare = M.gross > 0 ? Math.round((M.returningGross / M.gross) * 100) : 0;
    out.push({ tone: M.newCustomers > 0 ? 'good' : 'info', text: `${M.newCustomers} new customer${M.newCustomers !== 1 ? 's' : ''} this month; returning customers brought ${retShare}% of gross profit.` });
  }
  if (M.gross > 0 && M.expenses / M.gross > 0.2 && M.expenseCats[0]) {
    out.push({ tone: 'warn', text: `Expenses took ${Math.round((M.expenses / M.gross) * 100)}% of gross profit — biggest was ${M.expenseCats[0].name} (${fmt(M.expenseCats[0].value)}).` });
  }
  if (M.outstanding > 0.5) out.push({ tone: 'warn', text: `${fmt(M.outstanding)} from this month's orders is still unpaid.` });
  return out;
}

/* ============================================================
   MONTHLY REPORT (UI)
   ============================================================ */

// Fill bar that grows from 0 on mount and glides when the value changes.
function MrBar({ pct, color, delay = 0, height = 8, track }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(Math.max(0, Math.min(100, pct || 0))), 40 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div className="rounded-full overflow-hidden" style={{ height, background: track || THEME.line }}>
      <div className="h-full rounded-full mn-grow" style={{ width: `${w}%`, background: color }} />
    </div>
  );
}

// Signed change chip: arrow + text, green when the move is good, red when bad.
function MrDelta({ diff, text, onDark = false, goodWhenUp = true, neutral = false }) {
  const flat = Math.abs(diff || 0) < 1e-9;
  const up = diff > 0;
  // neutral: direction shown, but not judged (e.g. an unfinished month's running totals)
  const good = flat || neutral ? null : up === goodWhenUp;
  const color = good === null
    ? (onDark ? 'rgba(255,255,255,0.8)' : THEME.inkSoft)
    : good ? (onDark ? '#CDEBC0' : THEME.green) : (onDark ? '#FFC9CF' : THEME.red);
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-semibold whitespace-nowrap" style={{ color }}>
      <Icon size={13} />{text}
    </span>
  );
}

// Tiny month-by-month columns; the selected month is solid, the rest muted.
function MrSpark({ values, selectedIdx }) {
  const max = Math.max(1, ...values.map((v) => Math.abs(v)));
  return (
    <div className="flex items-end gap-[3px] h-8 mt-3" aria-hidden="true">
      {values.map((v, i) => (
        <div key={i} className="flex-1 rounded-t-sm mn-spark"
          style={{
            height: `${Math.max(8, (Math.abs(v) / max) * 100)}%`,
            maxWidth: 14,
            background: v < 0 ? THEME.red : THEME.brand,
            opacity: i === selectedIdx ? 1 : 0.28,
            animationDelay: `${i * 40}ms`,
          }} />
      ))}
    </div>
  );
}

function MrSectionTitle({ icon: Icon, title, sub, right }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="min-w-0">
        <div className="font-display text-lg flex items-center gap-2" style={{ color: THEME.ink }}>
          {Icon && <Icon size={17} style={{ color: THEME.brand }} />}{title}
        </div>
        {sub && <div className="text-xs mt-0.5" style={{ color: THEME.inkSoft }}>{sub}</div>}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  );
}

// The hero stays deep maroon in both themes so white text always reads well.
const MR_HERO_FROM = '#7A2E33';
const MR_HERO_TO = '#A04D52';

function MonthlyReport({ orders, expenses, catalog, privacy }) {
  const todayIso = today();
  const report = useMemo(
    () => buildMonthlyReport(orders, expenses, catalog, todayIso),
    [orders, expenses, catalog, todayIso]
  );
  const list = report.list;
  const [selectedKey, setSelectedKey] = useState(null);
  const [metric, setMetric] = useState('net');           // net | gross | sales
  const [showMath, setShowMath] = useState(false);
  const [showAllTips, setShowAllTips] = useState(false);
  const pillsRef = useRef(null);
  const topRef = useRef(null);

  // Default to the newest month; fall back if a selected month disappears.
  const key = selectedKey && report.byKey[selectedKey] ? selectedKey : (list.length ? list[list.length - 1].key : null);
  const M = key ? report.byKey[key] : null;
  const prev = M && M.prevKey ? report.byKey[M.prevKey] : null;
  const heroNet = useCountUp(M ? M.net : 0);

  // Start the month strip scrolled to the newest month.
  useEffect(() => {
    if (pillsRef.current) pillsRef.current.scrollLeft = pillsRef.current.scrollWidth;
  }, [list.length]);

  // ── Formatters (privacy-aware, whole pesos for monthly totals) ──
  const HIDDEN = '₱•••••';
  const m0 = (n) => (privacy ? HIDDEN : `${n < 0 ? '−' : ''}${peso(Math.abs(Math.round(n || 0)))}`);
  const sm = (n) => (privacy ? HIDDEN : `${n < 0 ? '−' : '+'}${peso(Math.abs(Math.round(n || 0)))}`);
  const compact = (v) => {
    if (privacy) return '•••';
    const a = Math.abs(v);
    const s = a >= 1e6 ? `${(a / 1e6).toFixed(1)}M` : a >= 1000 ? `${(a / 1000).toFixed(a >= 10000 ? 0 : 1).replace(/\.0$/, '')}k` : `${Math.round(a)}`;
    return `${v < 0 ? '−' : ''}₱${s}`;
  };
  const pctOf = (a, b) => (b > 0 ? Math.round(((a - b) / b) * 100) : null);
  const pctTxt = (p) => (p === null ? '' : ` (${p >= 0 ? '+' : ''}${p}%)`);

  const metrics = {
    net: { label: 'Net profit', get: (x) => x.net },
    gross: { label: 'Gross profit', get: (x) => x.gross },
    sales: { label: 'Sales', get: (x) => x.sales },
  };
  const metricGet = metrics[metric].get;

  if (!M) {
    return (
      <div>
        <Header title="Monthly Report" subtitle="See which months are strong or weak, and why." />
        <Card className="p-6"><EmptyHint>No orders yet. Your monthly report appears after your first order.</EmptyHint></Card>
      </div>
    );
  }

  const shown = list.slice(-12);
  const selIdx = shown.findIndex((x) => x.key === key);
  const chartData = shown.map((x) => ({ key: x.key, value: Math.round(metricGet(x)) }));
  const completed = list.filter((x) => !x.isCurrent);
  const avg = completed.length >= 2 ? completed.reduce((s, x) => s + metricGet(x), 0) / completed.length : null;
  const rankedByMetric = completed.slice().sort((a, b) => metricGet(b) - metricGet(a));
  const rankMax = Math.max(1, ...rankedByMetric.map((x) => Math.abs(metricGet(x))), M.isCurrent ? Math.abs(metricGet(M)) : 0);
  const netRank = report.rankOf[M.key];
  const isBest = !M.isCurrent && report.ranked.length >= 2 && netRank === 1;
  const isWeakest = !M.isCurrent && report.ranked.length >= 3 && netRank === report.ranked.length;
  const drivers = mrDrivers(M, prev);
  const insights = mrInsights(M, report, (n) => (privacy ? HIDDEN : peso(Math.round(n))));
  const heroText = privacy ? HIDDEN : `${heroNet < 0 ? '−' : ''}${peso(Math.abs(Math.round(heroNet)))}`;
  const monthPill = (x) => mrMonthLabel(x.key, { month: 'short', year: 'numeric' });
  const fullMonthsNet = completed.reduce((s, x) => s + x.net, 0);

  const selectMonth = (k, scroll = false) => {
    setSelectedKey(k);
    setShowAllTips(false);
    if (scroll && topRef.current) topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Chart pieces ──
  const MonthTick = ({ x, y, payload }) => {
    const d = report.byKey[payload.value];
    if (!d) return null;
    const sel = payload.value === key;
    const yr = d.key.endsWith('-01') ? ` '${d.key.slice(2, 4)}` : '';
    return (
      <g transform={`translate(${x},${y})`}>
        <text dy={14} textAnchor="middle" fontSize={11} fontWeight={sel ? 700 : 400} fill={sel ? THEME.ink : THEME.inkSoft}>{d.short}{yr}</text>
        {d.isCurrent && <text dy={27} textAnchor="middle" fontSize={9} fill={THEME.inkSoft}>so far</text>}
      </g>
    );
  };
  const SelectedLabel = ({ x, y, width, height, value, index }) => {
    const d = chartData[index];
    if (!d || d.key !== key) return null;
    const ty = value >= 0 ? y - 8 : y + Math.abs(height) + 14;
    return <text x={x + width / 2} y={ty} textAnchor="middle" fontSize={11} fontWeight={700} fill={THEME.ink}>{compact(value)}</text>;
  };
  const ChartTip = ({ active, payload }) => {
    if (!active || !payload || !payload[0]) return null;
    const d = report.byKey[payload[0].payload.key];
    if (!d) return null;
    const row = (k, v, strong) => (
      <div className="flex justify-between gap-5"><span style={{ color: THEME.inkSoft }}>{k}</span><span style={{ fontWeight: strong ? 700 : 500 }}>{v}</span></div>
    );
    return (
      <div className="rounded-lg px-3 py-2.5 text-xs space-y-0.5" style={{ background: THEME.card, border: `1px solid ${THEME.line}`, color: THEME.ink, boxShadow: '0 6px 18px rgba(0,0,0,0.08)', minWidth: 170 }}>
        <div className="font-semibold mb-1">{d.label}{d.isCurrent ? ' · so far' : ''}</div>
        {row('Sales', m0(d.sales))}
        {row('Gross profit', m0(d.gross))}
        {row('Expenses', m0(d.expenses))}
        {row('Net profit', m0(d.net), true)}
        {row('Margin', `${(d.margin * 100).toFixed(1)}%`)}
        {row('Orders', d.orders)}
      </div>
    );
  };

  // ── KPI tiles with month-over-month change + spark columns ──
  const kpis = [
    { label: 'Orders', running: true, value: String(M.orders), diff: prev ? M.orders - prev.orders : null, text: prev ? `${M.orders - prev.orders >= 0 ? '+' : ''}${M.orders - prev.orders}` : '', series: shown.map((x) => x.orders), sub: `${M.customerCount} customers` },
    { label: 'New customers', running: true, value: String(M.newCustomers), diff: prev ? M.newCustomers - prev.newCustomers : null, text: prev ? `${M.newCustomers - prev.newCustomers >= 0 ? '+' : ''}${M.newCustomers - prev.newCustomers}` : '', series: shown.map((x) => x.newCustomers), sub: `${M.customerCount - M.newCustomers} returning` },
    { label: 'Avg order', value: m0(M.aov), diff: prev ? M.aov - prev.aov : null, text: prev ? `${sm(M.aov - prev.aov)}${pctTxt(pctOf(M.aov, prev.aov))}` : '', series: shown.map((x) => x.aov), sub: `${m0(M.profitPerOrder)} profit per order` },
    { label: 'Margin', value: `${(M.margin * 100).toFixed(1)}%`, diff: prev ? M.margin - prev.margin : null, text: prev ? `${M.margin - prev.margin >= 0 ? '+' : '−'}${Math.abs((M.margin - prev.margin) * 100).toFixed(1)} pts` : '', series: shown.map((x) => x.margin), sub: `${Math.round(M.kg * 10) / 10} kg sold` },
  ];

  const batchesReliable = M.batchList.length > 0 && M.batchCoverage >= 0.6;
  const batchMax = Math.max(1, ...M.batchList.map((b) => Math.abs(b.gross)));
  const prodList = M.topProducts.slice(0, 6);
  const prodMax = Math.max(1, ...prodList.map((p) => Math.abs(p.gross)));
  const custMax = Math.max(1, ...M.topCustomers.map((c) => c.sales));
  const expMax = Math.max(1, ...M.expenseCats.map((c) => c.value));
  const collected = Math.max(0, M.sales - M.outstanding);
  const collectedPct = M.sales > 0 ? (collected / M.sales) * 100 : 100;
  const toneIcon = { good: CheckCircle, warn: AlertCircle, info: Info };
  const toneColor = { good: THEME.green, warn: THEME.amber, info: THEME.inkSoft };

  return (
    <div ref={topRef} style={{ scrollMarginTop: 80 }}>
      <Header
        title="Monthly Report"
        subtitle="See which months are strong or weak, and why, so you can plan ahead." />

      {/* ===== Month strip ===== */}
      <div ref={pillsRef} className="flex gap-2 overflow-x-auto mn-noscroll pb-1 mb-5 mn-rise">
        {list.map((x) => {
          const sel = x.key === key;
          const crown = !x.isCurrent && report.ranked.length >= 2 && report.rankOf[x.key] === 1;
          return (
            <button key={x.key} onClick={() => selectMonth(x.key)}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium"
              style={{ background: sel ? THEME.brand : THEME.card, color: sel ? 'white' : THEME.ink, border: `1px solid ${sel ? THEME.brand : THEME.line}` }}
              aria-pressed={sel}>
              {crown && <Crown size={13} style={{ color: sel ? '#FFD98A' : THEME.accent }} />}
              {monthPill(x)}
              {x.isCurrent && <span className="mn-live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: sel ? 'white' : THEME.green }} />}
            </button>
          );
        })}
      </div>

      {/* ===== Hero: the selected month ===== */}
      <Card key={`hero-${key}`} className="p-6 sm:p-7 mb-4 relative overflow-hidden mn-rise"
        style={{ background: `linear-gradient(135deg, ${MR_HERO_FROM} 0%, ${MR_HERO_TO} 100%)`, border: 'none' }}>
        <div className="mn-glow" />
        <div className="hidden sm:block absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <img src={LOGO_DATA_URL} alt="" className="w-48 h-48 rounded-full object-cover" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-xl sm:text-2xl text-white">{M.label}</span>
            {isBest && (
              <span className="mn-shimmer inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: '#FFE3A3' }}>
                <Crown size={12} /> Best month
              </span>
            )}
            {isWeakest && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.14)', color: 'white' }}>
                <TrendingDown size={12} /> Weakest month
              </span>
            )}
            {M.isCurrent && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.14)', color: 'white' }}>
                <CalendarDays size={12} /> In progress · day {M.daysElapsed} of {M.daysInMonth}
              </span>
            )}
            {M.partialStart && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.14)', color: 'white' }}>
                First month · from day {M.firstDay}
              </span>
            )}
          </div>

          <div className="text-xs uppercase tracking-widest mt-5" style={{ color: 'rgba(255,255,255,0.75)' }}>Net profit{M.isCurrent ? ' so far' : ''}</div>
          <div className="font-display text-5xl sm:text-6xl text-white mt-1 leading-none">{heroText}</div>
          <div className="flex items-center gap-2 flex-wrap mt-3">
            {prev ? (
              <>
                <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }}>
                  <MrDelta onDark neutral={M.isCurrent} diff={M.net - prev.net} text={`${sm(M.net - prev.net)}${privacy ? '' : pctTxt(prev.net > 0 ? pctOf(M.net, prev.net) : null)}`} />
                </span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>{M.isCurrent ? `so far vs all of ${prev.label}` : `vs ${prev.label}`}</span>
              </>
            ) : (
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>Your first month on record.</span>
            )}
          </div>
          {M.isCurrent && M.projectedNet != null && (
            <div className="text-sm mt-3" style={{ color: 'rgba(255,255,255,0.9)' }}>
              <Target size={14} className="inline -mt-0.5 mr-1.5" />On pace for about <span className="font-semibold text-white">{m0(M.projectedNet)}</span> by month end (estimate)
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6">
            {[
              ['Sales', m0(M.sales)],
              ['Gross profit', m0(M.gross)],
              ['Expenses', m0(M.expenses)],
              ['Margin', `${(M.margin * 100).toFixed(1)}%`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.72)' }}>{k}</div>
                <div className="text-base sm:text-lg font-semibold text-white mt-0.5">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ===== Trend + ranking (cross-month views: selection only changes the highlight) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-5 lg:col-span-2 min-w-0 mn-rise rise-1">
          <MrSectionTitle icon={BarChart3} title="Month by month"
            sub="Tap a month to open it."
            right={
              <div className="flex rounded-lg overflow-hidden text-xs" style={{ border: `1px solid ${THEME.line}` }}>
                {Object.entries(metrics).map(([id, d]) => (
                  <button key={id} onClick={() => setMetric(id)} className="px-2.5 py-1.5 font-medium"
                    style={{ background: metric === id ? THEME.brand : 'transparent', color: metric === id ? 'white' : THEME.ink }}
                    aria-pressed={metric === id}>
                    {id === 'net' ? 'Net' : id === 'gross' ? 'Gross' : 'Sales'}
                  </button>
                ))}
              </div>
            } />
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 22, right: 12, left: 0, bottom: 0 }}
              onClick={(e) => { if (e && e.activePayload && e.activePayload[0]) selectMonth(e.activePayload[0].payload.key); }}>
              <CartesianGrid vertical={false} stroke={THEME.line} />
              <XAxis dataKey="key" interval={0} height={36} tickLine={false} axisLine={{ stroke: THEME.line }} tick={<MonthTick />} />
              <YAxis width={52} tickLine={false} axisLine={false} tick={{ fill: THEME.inkSoft, fontSize: 11 }} tickFormatter={compact} />
              <Tooltip cursor={{ fill: THEME.brandBg, opacity: 0.6 }} content={<ChartTip />} />
              {avg !== null && (
                <ReferenceLine y={avg} stroke={THEME.accent} strokeWidth={1} />
              )}
              <ReferenceLine y={0} stroke={THEME.line} />
              <Bar dataKey="value" maxBarSize={28} radius={[4, 4, 0, 0]} animationDuration={750} cursor="pointer">
                {chartData.map((d) => (
                  <Cell key={d.key} fill={d.value < 0 ? THEME.red : THEME.brand} fillOpacity={d.key === key ? 1 : 0.28} />
                ))}
                <LabelList dataKey="value" content={<SelectedLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="text-xs mt-2" style={{ color: THEME.inkSoft }}>
            {metrics[metric].label} per month{avg !== null ? ` · gold line = average of full months (${m0(avg)})` : ''}.
          </div>
        </Card>

        <Card className="p-5 min-w-0 mn-rise rise-2">
          <MrSectionTitle icon={Trophy} title="Best to weakest" sub={`Full months, ranked by ${metrics[metric].label.toLowerCase()}`} />
          {rankedByMetric.length === 0 ? (
            <div className="text-sm py-6 text-center" style={{ color: THEME.inkSoft }}>Your first full month will be ranked here once it ends.</div>
          ) : (
            <div className="space-y-1">
              {rankedByMetric.map((x, i) => {
                const v = metricGet(x);
                const sel = x.key === key;
                return (
                  <button key={x.key} onClick={() => selectMonth(x.key)}
                    className="w-full text-left rounded-lg px-2.5 py-2"
                    style={{ background: sel ? THEME.brandBg : 'transparent' }}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="w-5 text-xs font-semibold tabular-nums" style={{ color: THEME.inkSoft }}>#{i + 1}</span>
                        <span className="truncate" style={{ fontWeight: sel ? 700 : 500, color: THEME.ink }}>{x.label}</span>
                        {i === 0 && rankedByMetric.length > 1 && <Crown size={13} style={{ color: THEME.accent }} />}
                        {i === rankedByMetric.length - 1 && rankedByMetric.length > 2 && <TrendingDown size={13} style={{ color: THEME.red }} />}
                      </span>
                      <span className="font-semibold tabular-nums flex-shrink-0" style={{ color: THEME.ink }}>{m0(v)}</span>
                    </div>
                    <div className="mt-1.5 pl-7">
                      <MrBar pct={(Math.abs(v) / rankMax) * 100} color={v < 0 ? THEME.red : THEME.brand} delay={i * 70} height={6} />
                    </div>
                  </button>
                );
              })}
              {list.filter((x) => x.isCurrent).map((x) => (
                <button key={x.key} onClick={() => selectMonth(x.key)}
                  className="w-full text-left rounded-lg px-2.5 py-2 mt-2"
                  style={{ background: x.key === key ? THEME.brandBg : 'transparent', borderTop: `1px solid ${THEME.line}` }}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="w-5 flex justify-center"><span className="mn-live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: THEME.green }} /></span>
                      <span className="truncate" style={{ color: THEME.ink }}>{x.label} <span style={{ color: THEME.inkSoft }}>· so far</span></span>
                    </span>
                    <span className="font-semibold tabular-nums flex-shrink-0" style={{ color: THEME.ink }}>{m0(metricGet(x))}</span>
                  </div>
                  <div className="mt-1.5 pl-7">
                    <MrBar pct={(Math.abs(metricGet(x)) / rankMax) * 100} color={metricGet(x) < 0 ? THEME.red : THEME.brand} height={6} track={THEME.line} />
                  </div>
                </button>
              ))}
            </div>
          )}
          {completed.length > 0 && (
            <div className="text-xs mt-4 pt-3" style={{ borderTop: `1px solid ${THEME.line}`, color: THEME.inkSoft }}>
              Full months total: <span className="font-semibold" style={{ color: THEME.ink }}>{m0(fullMonthsNet)}</span> net · average <span className="font-semibold" style={{ color: THEME.ink }}>{m0(fullMonthsNet / completed.length)}</span> per month
            </div>
          )}
        </Card>
      </div>

      {/* ===== Everything below is about the selected month (re-animates on switch) ===== */}
      <div key={`detail-${key}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <Card className="p-5 min-w-0 mn-rise">
            <MrSectionTitle icon={Sparkles} title="What moved profit"
              sub={prev ? (M.isCurrent ? `So far vs all of ${prev.label} — order count keeps growing until month end` : `Gross profit vs ${prev.label}, split into its three drivers`) : 'Comparisons start from your second month'} />
            {!drivers ? (
              <div className="text-sm py-4" style={{ color: THEME.inkSoft }}>
                {prev ? 'Not enough data to split this change into drivers.' : `Once ${mrMonthLabel(nextMonthKey(M.key))} has orders, you'll see here exactly what made profit go up or down.`}
              </div>
            ) : (
              <>
                {(() => {
                  const maxAbs = Math.max(1, ...drivers.parts.map((p) => Math.abs(p.value)));
                  return drivers.parts.map((p, i) => {
                    const pos = p.value >= 0;
                    const w = (Math.abs(p.value) / maxAbs) * 50;
                    // Order count isn't final until the month ends, so don't judge it yet.
                    const judge = !(M.isCurrent && p.id === 'orders');
                    const tone = !judge ? THEME.inkSoft : pos ? THEME.green : THEME.red;
                    return (
                      <div key={p.id} className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span style={{ color: THEME.ink }}>{p.label}</span>
                          <span className="font-semibold tabular-nums" style={{ color: tone }}>{sm(p.value)}{!judge ? ' so far' : ''}</span>
                        </div>
                        <div className="relative h-2.5 rounded-full" style={{ background: THEME.bg }}>
                          <div className="absolute top-0 bottom-0" style={{ left: '50%', width: 1, background: THEME.line }} />
                          <MrDiverge pos={pos} width={w} delay={i * 90} color={tone} />
                        </div>
                      </div>
                    );
                  });
                })()}
                <div className="flex items-center justify-between text-sm mt-4 pt-3" style={{ borderTop: `1px solid ${THEME.line}` }}>
                  <span className="font-semibold" style={{ color: THEME.ink }}>Change in gross profit{M.isCurrent ? ' so far' : ''}</span>
                  <MrDelta neutral={M.isCurrent} diff={drivers.dG} text={sm(drivers.dG)} />
                </div>
                <div className="text-xs mt-2 leading-relaxed" style={{ color: THEME.inkSoft }}>
                  {prev.orders} → {M.orders} orders · avg order {m0(prev.aov)} → {m0(M.aov)} · margin {(prev.margin * 100).toFixed(1)}% → {(M.margin * 100).toFixed(1)}%
                </div>
              </>
            )}
          </Card>

          <Card className="p-5 min-w-0 mn-rise rise-1">
            <MrSectionTitle icon={Lightbulb} title="Takeaways" sub="Written from this month's numbers" />
            {insights.length === 0 ? (
              <div className="text-sm" style={{ color: THEME.inkSoft }}>Nothing stands out yet.</div>
            ) : (
              <ul className="space-y-3">
                {(showAllTips ? insights : insights.slice(0, 5)).map((it, i) => {
                  const Icon = toneIcon[it.tone] || Info;
                  return (
                    <li key={i} className="flex items-start gap-2.5 text-sm mn-rise" style={{ animationDelay: `${0.08 + i * 0.07}s`, color: THEME.ink }}>
                      <Icon size={16} className="mt-0.5 flex-shrink-0" style={{ color: toneColor[it.tone] }} />
                      <span className="leading-snug">{it.text}</span>
                    </li>
                  );
                })}
                {insights.length > 5 && (
                  <li>
                    <button onClick={() => setShowAllTips((v) => !v)} className="text-xs font-medium pl-6" style={{ color: THEME.brand }}>
                      {showAllTips ? 'Show fewer' : `Show ${insights.length - 5} more`}
                    </button>
                  </li>
                )}
              </ul>
            )}
          </Card>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {kpis.map((k, i) => (
            <Card key={k.label} className={`p-4 min-w-0 mn-lift mn-rise rise-${Math.min(3, i)}`}>
              <div className="text-xs" style={{ color: THEME.inkSoft }}>{k.label}</div>
              <div className="font-display text-2xl mt-0.5" style={{ color: THEME.ink }}>{k.value}</div>
              <div className="mt-0.5 min-h-[18px]">
                {k.diff !== null ? <MrDelta neutral={k.running && M.isCurrent} diff={k.diff} text={`${k.text} vs ${prev.short}${k.running && M.isCurrent ? ' (so far)' : ''}`} /> : <span className="text-xs" style={{ color: THEME.inkSoft }}>—</span>}
              </div>
              <div className="text-xs mt-1" style={{ color: THEME.inkSoft }}>{k.sub}</div>
              <MrSpark values={k.series} selectedIdx={selIdx} />
            </Card>
          ))}
        </div>

        {/* Products + batches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <Card className="p-5 min-w-0 mn-rise rise-1">
            <MrSectionTitle icon={Package} title="Top products" sub="Ranked by gross profit this month" />
            {prodList.length === 0 ? <div className="text-sm" style={{ color: THEME.inkSoft }}>No products sold.</div> : (
              <div className="space-y-3">
                {prodList.map((p, i) => (
                  <div key={p.name}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="truncate" style={{ color: THEME.ink }}>{p.name}</span>
                      <span className="font-semibold tabular-nums flex-shrink-0" style={{ color: THEME.ink }}>{m0(p.gross)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-0.5 mb-1" style={{ color: THEME.inkSoft }}>
                      <span>{Math.round(p.qty * 100) / 100} {p.unit} · {m0(p.sales)} sales</span>
                      <span>{M.gross > 0 ? `${Math.round((p.gross / M.gross) * 100)}% of profit` : ''}</span>
                    </div>
                    <MrBar pct={(Math.abs(p.gross) / prodMax) * 100} color={p.gross < 0 ? THEME.red : THEME.brand} delay={i * 60} height={6} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5 min-w-0 mn-rise rise-2">
            <MrSectionTitle icon={Truck} title="Delivery batches" sub="Gross profit per delivery day, from this month's orders" />
            {!batchesReliable ? (
              <div className="text-sm leading-relaxed" style={{ color: THEME.inkSoft }}>
                {M.unbatched > 0
                  ? `${M.unbatched} of ${M.orders} orders this month had no delivery batch set, so a batch breakdown wouldn't be accurate for this month.`
                  : 'No delivery batches this month.'}
              </div>
            ) : (
              <div className="space-y-2.5">
                {M.batchList.map((b, i) => (
                  <div key={b.date}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: THEME.brandBg, color: THEME.brand, minWidth: 34, textAlign: 'center' }}>{b.weekday}</span>
                        <span style={{ color: THEME.ink }}>{b.label}</span>
                        <span className="text-xs" style={{ color: THEME.inkSoft }}>· {b.orders} order{b.orders !== 1 ? 's' : ''}</span>
                      </span>
                      <span className="font-semibold tabular-nums flex-shrink-0" style={{ color: THEME.ink }}>{m0(b.gross)}</span>
                    </div>
                    <div className="mt-1">
                      <MrBar pct={(Math.abs(b.gross) / batchMax) * 100} color={b.gross < 0 ? THEME.red : THEME.brand} delay={i * 50} height={5} />
                    </div>
                  </div>
                ))}
                {M.unbatched > 0 && (
                  <div className="text-xs pt-1" style={{ color: THEME.inkSoft }}>+ {M.unbatched} order{M.unbatched !== 1 ? 's' : ''} with no batch set</div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Customers + expenses + collection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <Card className="p-5 min-w-0 mn-rise rise-1">
            <MrSectionTitle icon={Users} title="Top customers" sub="By sales this month" />
            {M.topCustomers.length === 0 ? <div className="text-sm" style={{ color: THEME.inkSoft }}>No customers yet.</div> : (
              <div className="space-y-3">
                {M.topCustomers.map((c, i) => (
                  <div key={c.name + i}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span className="truncate" style={{ color: THEME.ink }}>{c.name}</span>
                        {c.isNew && !M.isFirst && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: THEME.successBg, color: THEME.successInk }}>New</span>}
                      </span>
                      <span className="font-semibold tabular-nums flex-shrink-0" style={{ color: THEME.ink }}>{m0(c.sales)}</span>
                    </div>
                    <div className="text-xs mt-0.5 mb-1" style={{ color: THEME.inkSoft }}>{c.orders} order{c.orders !== 1 ? 's' : ''}</div>
                    <MrBar pct={(c.sales / custMax) * 100} color={THEME.brand} delay={i * 60} height={5} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5 min-w-0 mn-rise rise-2">
            <MrSectionTitle icon={Wallet} title="Expenses"
              sub={M.gross > 0 && M.expenses > 0 ? `${Math.round((M.expenses / M.gross) * 100)}% of gross profit` : 'Operating costs this month'}
              right={<span className="text-sm font-semibold" style={{ color: THEME.ink }}>{m0(M.expenses)}</span>} />
            {M.expenseCats.length === 0 ? <div className="text-sm" style={{ color: THEME.inkSoft }}>No expenses logged this month.</div> : (
              <div className="space-y-3">
                {M.expenseCats.map((c, i) => (
                  <div key={c.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span style={{ color: THEME.ink }}>{c.name}</span>
                      <span className="tabular-nums" style={{ color: THEME.ink }}>{m0(c.value)}</span>
                    </div>
                    <MrBar pct={(c.value / expMax) * 100} color={THEME.brandSoft} delay={i * 60} height={5} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5 min-w-0 mn-rise rise-3">
            <MrSectionTitle icon={Receipt} title="Collection" sub="How much of this month's sales is in your hands" />
            <div className="font-display text-3xl" style={{ color: collectedPct >= 95 ? THEME.green : collectedPct >= 80 ? THEME.ink : THEME.red }}>
              {Math.round(collectedPct)}%
            </div>
            <div className="text-xs mt-0.5 mb-3" style={{ color: THEME.inkSoft }}>collected</div>
            <MrBar pct={collectedPct} color={THEME.green} height={10} track={THEME.errorBg} />
            <div className="flex justify-between text-xs mt-2">
              <span style={{ color: THEME.inkSoft }}>Collected <span className="font-semibold" style={{ color: THEME.ink }}>{m0(collected)}</span></span>
              <span style={{ color: THEME.inkSoft }}>Unpaid <span className="font-semibold" style={{ color: M.outstanding > 0 ? THEME.red : THEME.ink }}>{m0(M.outstanding)}</span></span>
            </div>
            {M.cancelled > 0 && (
              <div className="text-xs mt-4 pt-3" style={{ borderTop: `1px solid ${THEME.line}`, color: THEME.inkSoft }}>
                {M.cancelled} cancelled order{M.cancelled !== 1 ? 's' : ''} left out of all totals.
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ===== All months side by side (the table view of every chart above) ===== */}
      <Card className="p-5 mb-4 min-w-0 mn-rise">
        <MrSectionTitle icon={CalendarDays} title="All months" sub="Newest first. Tap a month to open it." />
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="text-left" style={{ color: THEME.inkSoft, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <th className="pb-2 font-medium">Month</th>
                <th className="pb-2 font-medium text-right">Orders</th>
                <th className="pb-2 font-medium text-right">Sales</th>
                <th className="pb-2 font-medium text-right">Gross</th>
                <th className="pb-2 font-medium text-right">Expenses</th>
                <th className="pb-2 font-medium text-right">Net</th>
                <th className="pb-2 font-medium text-right">Margin</th>
                <th className="pb-2 font-medium text-right">Net vs prev</th>
              </tr>
            </thead>
            <tbody>
              {[...list].reverse().map((x) => {
                const p = x.prevKey ? report.byKey[x.prevKey] : null;
                const sel = x.key === key;
                return (
                  <tr key={x.key} onClick={() => selectMonth(x.key, true)} className="cursor-pointer row-hover"
                    style={{ borderTop: `1px solid ${THEME.line}`, background: sel ? THEME.brandBg : 'transparent' }}>
                    <td className="py-2.5" style={{ fontWeight: sel ? 700 : 500 }}>
                      {x.label}{x.isCurrent && <span className="text-xs font-normal" style={{ color: THEME.inkSoft }}> · so far</span>}
                    </td>
                    <td className="py-2.5 text-right">{x.orders}</td>
                    <td className="py-2.5 text-right">{m0(x.sales)}</td>
                    <td className="py-2.5 text-right">{m0(x.gross)}</td>
                    <td className="py-2.5 text-right">{m0(x.expenses)}</td>
                    <td className="py-2.5 text-right font-semibold" style={{ color: x.net < 0 ? THEME.red : THEME.ink }}>{m0(x.net)}</td>
                    <td className="py-2.5 text-right">{(x.margin * 100).toFixed(1)}%</td>
                    <td className="py-2.5 text-right">{p ? <MrDelta neutral={x.isCurrent} diff={x.net - p.net} text={sm(x.net - p.net)} /> : <span style={{ color: THEME.inkSoft }}>—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="sm:hidden space-y-2">
          {[...list].reverse().map((x) => {
            const p = x.prevKey ? report.byKey[x.prevKey] : null;
            const sel = x.key === key;
            return (
              <button key={x.key} onClick={() => selectMonth(x.key, true)} className="w-full text-left rounded-xl p-3.5"
                style={{ background: sel ? THEME.brandBg : THEME.bg }}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold" style={{ color: THEME.ink }}>{x.label}{x.isCurrent && <span className="text-xs font-normal" style={{ color: THEME.inkSoft }}> · so far</span>}</span>
                  <span className="font-display text-lg" style={{ color: x.net < 0 ? THEME.red : THEME.brand }}>{m0(x.net)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs mt-1" style={{ color: THEME.inkSoft }}>
                  <span>{x.orders} orders · {m0(x.sales)} sales · {(x.margin * 100).toFixed(1)}%</span>
                  {p && <MrDelta neutral={x.isCurrent} diff={x.net - p.net} text={sm(x.net - p.net)} />}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* ===== How it's calculated ===== */}
      <Card className="p-5 mb-2">
        <button onClick={() => setShowMath((s) => !s)} className="w-full flex items-center justify-between text-sm font-medium" style={{ color: THEME.ink }}>
          <span className="flex items-center gap-2"><Info size={15} style={{ color: THEME.inkSoft }} /> How these numbers are calculated</span>
          {showMath ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showMath && (
          <ul className="text-xs leading-relaxed mt-3 space-y-1.5 list-disc pl-5" style={{ color: THEME.inkSoft }}>
            <li>Each order counts in the month of its <b>order date</b> — the same rule the Dashboard uses. Cancelled orders are left out.</li>
            <li><b>Gross profit</b> = sales − supplier cost. <b>Net profit</b> = gross profit − expenses logged that month.</li>
            <li>Past months use the supplier cost saved on each order when it was placed, so a price change today never rewrites old months. The current month uses today's Price List cost, so it matches the Dashboard.</li>
            <li>Expenses in "Stock" or "Capital / Stock" are left out, because that money is already counted as supplier cost.</li>
            <li>"What moved profit" splits the change in gross profit into three parts — number of orders, average order size and margin — that add up exactly to the real change.</li>
            <li>The month-end pace is an estimate: profit so far ÷ days passed × days in the month.</li>
          </ul>
        )}
      </Card>
    </div>
  );
}

// Center-anchored bar for the drivers card: grows right for gains, left for losses.
function MrDiverge({ pos, width, delay = 0, color }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(width), 60 + delay);
    return () => clearTimeout(t);
  }, [width, delay]);
  return (
    <div className="absolute top-0 bottom-0 rounded-full mn-grow"
      style={{ [pos ? 'left' : 'right']: '50%', width: `${w}%`, background: color || (pos ? THEME.green : THEME.red) }} />
  );
}

const nextMonthKey = (key) => {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
