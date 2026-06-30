import { supabase, SUPABASE_MODE } from '../lib/supabase';

// ─── LocalStorage keys (fallback mode) ───────────────────
const LS = {
  entries: 'ca_entries',
  annual:  'ca_annual_goal',
  monthly: 'ca_monthly_goal',
  init:    'ca_initialized',
};

// ─── Entries ──────────────────────────────────────────────
export async function loadEntries() {
  if (!SUPABASE_MODE) {
    try { return JSON.parse(localStorage.getItem(LS.entries) || '[]'); } catch { return []; }
  }
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addEntry(entry) {
  if (!SUPABASE_MODE) {
    const prev = JSON.parse(localStorage.getItem(LS.entries) || '[]');
    localStorage.setItem(LS.entries, JSON.stringify([entry, ...prev]));
    return;
  }
  const { error } = await supabase.from('entries').insert({
    id:     entry.id,
    amount: entry.amount,
    note:   entry.note,
    date:   entry.date,
  });
  if (error) throw error;
}

export async function deleteEntry(id) {
  if (!SUPABASE_MODE) {
    const prev = JSON.parse(localStorage.getItem(LS.entries) || '[]');
    localStorage.setItem(LS.entries, JSON.stringify(prev.filter(e => e.id !== id)));
    return;
  }
  const { error } = await supabase.from('entries').delete().eq('id', id);
  if (error) throw error;
}

// ─── Goals ────────────────────────────────────────────────
export async function loadGoals() {
  if (!SUPABASE_MODE) {
    return {
      annual:  Number(localStorage.getItem(LS.annual))  || 120000,
      monthly: Number(localStorage.getItem(LS.monthly)) || 10000,
    };
  }
  const { data, error } = await supabase
    .from('goals').select('*').eq('id', 1).single();
  if (error && error.code !== 'PGRST116') throw error;
  return { annual: data?.annual ?? 120000, monthly: data?.monthly ?? 10000 };
}

export async function saveGoals(goals) {
  if (!SUPABASE_MODE) {
    localStorage.setItem(LS.annual,  goals.annual);
    localStorage.setItem(LS.monthly, goals.monthly);
    return;
  }
  const { error } = await supabase
    .from('goals')
    .upsert({ id: 1, annual: goals.annual, monthly: goals.monthly, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function clearAllEntries() {
  if (!SUPABASE_MODE) {
    localStorage.removeItem(LS.entries);
    localStorage.removeItem(LS.init);
    return;
  }
  const { error } = await supabase.from('entries').delete().gte('id', '');
  if (error) throw error;
}

// ─── Demo data helpers (localStorage mode uniquement) ────
export function isInitialized()  { return localStorage.getItem(LS.init) === 'true'; }
export function markInitialized(){ localStorage.setItem(LS.init, 'true'); }
export function saveEntries(arr) { localStorage.setItem(LS.entries, JSON.stringify(arr)); }
