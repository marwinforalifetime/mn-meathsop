// Supabase client for M&N Meatshop.
// The anon/public key is safe to ship in front-end code — it is designed for
// this. The database is protected by Row Level Security policies (see the
// setup SQL). The service_role secret key is NEVER placed here.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aqeefyxfnvmcopqwnyss.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxZWVmeXhmbnZtY29wcXdueXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNDExMjEsImV4cCI6MjA5NDYxNzEyMX0.SoGnX27MM7_hIqTzFeVhbD2bsGOAdiApliPaedzjAOk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Single shared row id. This is a single-business app, so all data lives under
// one workspace row. (When real multi-user login is added later, this becomes
// per-user/per-workspace.)
export const WORKSPACE_ID = 'mn-meatshop-main';

// Storage keys we sync to the cloud (mirrors the old localStorage keys).
export const SYNC_KEYS = ['catalog', 'orders', 'expenses', 'inventory', 'meta'];

// Load the whole workspace blob from Supabase. Returns an object keyed by
// SYNC_KEYS, or null if nothing stored yet (fresh database).
export async function cloudLoad() {
  const { data, error } = await supabase
    .from('app_state')
    .select('payload')
    .eq('id', WORKSPACE_ID)
    .maybeSingle();
  if (error) {
    console.error('Supabase load error:', error);
    throw error;
  }
  return data ? data.payload : null;
}

// Save the whole workspace blob to Supabase (upsert = insert or update).
export async function cloudSave(payload) {
  const { error } = await supabase
    .from('app_state')
    .upsert({ id: WORKSPACE_ID, payload, updated_at: new Date().toISOString() });
  if (error) {
    console.error('Supabase save error:', error);
    throw error;
  }
  return true;
}

// ---- Authentication ----
// Real server-enforced auth via Supabase. The password is NEVER stored in this
// code — it lives only in Supabase's secure auth system. We use one shared
// account (email + password) created by the owner in the Supabase dashboard.

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data ? data.session : null;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export function onAuthChange(cb) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
  return data ? data.subscription : null;
}
