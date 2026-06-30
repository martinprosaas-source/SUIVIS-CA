import { useState, useEffect, useMemo } from 'react';
import { Plus, TrendingUp, TrendingDown, Sun, Moon, Trash2 } from 'lucide-react';
import ArcGauge from './components/ArcGauge';
import RevenueChart from './components/RevenueChart';
import AddEntryModal from './components/AddEntryModal';
import EditableGoal from './components/EditableGoal';
import { useTheme } from './context/ThemeContext';
import { SUPABASE_MODE } from './lib/supabase';
import {
  loadEntries, addEntry as persistEntry,
  loadGoals, saveGoals,
  isInitialized, markInitialized, saveEntries,
  clearAllEntries,
} from './utils/storage';
import { generateDemoData } from './data/demo';
import { formatCurrency, formatPercent, getMonthLabel } from './utils/format';

const DARK_COLORS = {
  accent: '#00D4AA',
  goal: 'rgba(255,255,255,0.2)',
  grid: 'rgba(255,255,255,0.04)',
  cursor: 'rgba(255,255,255,0.08)',
  tick: 'rgba(255,255,255,0.3)',
  gradientOpacity: 0.22,
  dotStroke: '#08090A',
  tooltipBg: '#1A1B1E',
  tooltipBorder: 'rgba(255,255,255,0.08)',
  tooltipShadow: 'none',
  tooltipLabel: 'rgba(255,255,255,0.5)',
  tooltipGoal: 'rgba(255,255,255,0.35)',
};

const LIGHT_COLORS = {
  accent: '#00A884',
  goal: 'rgba(10,11,13,0.18)',
  grid: 'rgba(0,0,0,0.04)',
  cursor: 'rgba(0,0,0,0.06)',
  tick: 'rgba(10,11,13,0.38)',
  gradientOpacity: 0.18,
  dotStroke: '#EEF0F4',
  tooltipBg: '#FFFFFF',
  tooltipBorder: 'rgba(0,0,0,0.08)',
  tooltipShadow: '0 4px 24px rgba(0,0,0,0.1)',
  tooltipLabel: 'rgba(10,11,13,0.5)',
  tooltipGoal: 'rgba(10,11,13,0.4)',
};

export default function App() {
  const { isDark, toggle } = useTheme();
  const [entries, setEntries] = useState([]);
  const [goals, setGoals] = useState({ annual: 120000, monthly: 10000 });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [g, e] = await Promise.all([loadGoals(), loadEntries()]);
        setGoals(g);
        if (!SUPABASE_MODE && !isInitialized()) {
          const demo = generateDemoData();
          saveEntries(demo);
          markInitialized();
          setEntries(demo);
        } else {
          setEntries(e);
        }
      } catch (err) {
        console.error('Erreur de chargement :', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function addEntry(entry) {
    // Optimistic update
    setEntries(prev => [entry, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
    try {
      await persistEntry(entry);
    } catch (err) {
      console.error('Erreur sauvegarde :', err);
    }
  }

  async function updateGoals(next) {
    setGoals(next);
    try {
      await saveGoals(next);
    } catch (err) {
      console.error('Erreur objectifs :', err);
    }
  }

  async function handleReset() {
    try {
      await clearAllEntries();
      setEntries([]);
      setConfirmReset(false);
    } catch (err) {
      console.error('Erreur reset :', err);
    }
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const monthlyData = useMemo(() => {
    const map = {};
    entries.forEach(e => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      map[key] = (map[key] || 0) + e.amount;
    });
    // Fixed Jan–Dec of current year
    return Array.from({ length: 12 }, (_, m) => ({
      year: currentYear,
      month: m,
      ca: map[`${currentYear}-${m}`] || 0,
    }));
  }, [entries, currentYear]);

  const annualCA = useMemo(() =>
    entries.filter(e => new Date(e.date).getFullYear() === currentYear)
      .reduce((s, e) => s + e.amount, 0),
    [entries, currentYear]
  );

  const annualPercent = goals.annual > 0 ? (annualCA / goals.annual) * 100 : 0;

  const currentMonthCA = useMemo(() =>
    entries.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }).reduce((s, e) => s + e.amount, 0),
    [entries, currentYear, currentMonth]
  );

  const monthMissing = Math.max(0, goals.monthly - currentMonthCA);
  const monthPercent = goals.monthly > 0 ? (currentMonthCA / goals.monthly) * 100 : 0;

  const monthList = useMemo(() => {
    return monthlyData.map((m, i) => {
      const prev = i > 0 ? monthlyData[i - 1].ca : null;
      const evolution = prev != null && prev > 0 ? ((m.ca - prev) / prev) * 100 : null;
      return { ...m, evolution, isCurrentMonth: m.year === currentYear && m.month === currentMonth };
    });
  }, [monthlyData, currentYear, currentMonth]);

  const chartData = monthlyData;
  const chartColors = isDark ? DARK_COLORS : LIGHT_COLORS;

  const progressColor = (pct) =>
    pct >= 80 ? 'var(--green)' : pct >= 40 ? 'var(--warning)' : 'var(--red)';

  return (
    <div style={s.app}>
      {/* Header */}
      <div style={s.header}>
        <span style={s.logo}>M&amp;A Labs LLC</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            style={s.themeBtn}
            onClick={toggle}
            title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {isDark
              ? <Sun size={16} style={{ color: '#FFB547' }} />
              : <Moon size={15} style={{ color: '#6B7280' }} />
            }
          </button>
          <button style={s.addBtn} onClick={() => setShowModal(true)} title="Ajouter une entrée">
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={s.loader}>
          <div style={s.loaderDot} />
        </div>
      ) : (
      <div className="app-container">
        {/* Hero */}
        <div style={s.hero}>
          <div style={s.heroLeft}>
            <div style={s.heroLabel}>Chiffre d'affaires {currentYear}</div>
            <div style={s.heroAmount}>{formatCurrency(annualCA)}</div>
            <div style={s.heroGoalRow}>
              <span style={s.heroGoalLabel}>Objectif&nbsp;</span>
              <EditableGoal
                value={goals.annual}
                onSave={v => updateGoals({ ...goals, annual: v })}
                label="objectif annuel"
              />
            </div>
            <div style={s.progressBar}>
              <div style={{
                ...s.progressFill,
                width: `${Math.min(annualPercent, 100)}%`,
                background: progressColor(annualPercent),
              }} />
            </div>
          </div>
          <div className="hero-gauge">
            <ArcGauge percent={annualPercent} />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-row">
          <div style={s.kpiCard}>
            <div style={s.kpiLabel}>Ce mois</div>
            <div style={s.kpiValue}>{formatCurrency(currentMonthCA)}</div>
            <div style={s.kpiSub}>{getMonthLabel(currentYear, currentMonth, true)} {currentYear}</div>
          </div>

          <div style={s.kpiCard}>
            <div style={s.kpiLabel}>Objectif mensuel</div>
            <div style={s.kpiValue}>
              <EditableGoal
                value={goals.monthly}
                onSave={v => updateGoals({ ...goals, monthly: v })}
                label="objectif mensuel"
              />
            </div>
            <div style={s.kpiSub}>
              <div style={s.progressBarSmall}>
                <div style={{
                  ...s.progressFillSmall,
                  width: `${Math.min(monthPercent, 100)}%`,
                  background: monthPercent >= 100 ? 'var(--green)' : 'var(--warning)',
                }} />
              </div>
              <span style={{ color: monthPercent >= 100 ? 'var(--green)' : 'var(--text-3)', flexShrink: 0 }}>
                {Math.round(monthPercent)}%
              </span>
            </div>
          </div>

          <div style={s.kpiCard}>
            <div style={s.kpiLabel}>Il manque</div>
            <div style={{
              ...s.kpiValue,
              color: monthMissing === 0 ? 'var(--green)' : 'var(--red)',
              fontSize: monthMissing === 0 ? '13px' : undefined,
              marginTop: monthMissing === 0 ? '8px' : undefined,
            }}>
              {monthMissing === 0 ? 'Objectif atteint !' : formatCurrency(monthMissing)}
            </div>
            <div style={s.kpiSub}>pour ce mois</div>
          </div>
        </div>

        <div className="bottom-grid">
        {/* Chart */}
        <div style={s.card}>
          <div className="card-header">
            <span style={s.cardTitle}>Évolution du CA — 12 mois</span>
            <div style={s.legend}>
              <span style={s.legendItem}>
                <span style={{ ...s.legendDot, background: 'var(--green)' }} />
                CA réel
              </span>
              <span style={s.legendItem}>
                <span style={{ ...s.legendDash, background: 'var(--chart-goal)' }} />
                Objectif
              </span>
            </div>
          </div>
          <RevenueChart data={chartData} monthlyGoal={goals.monthly} colors={chartColors} />
        </div>

        {/* Month list */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>Détail par mois</span>
          </div>
          <div className="month-list-scroll">
            {[...monthList].reverse().map(m => {
              const evo = m.evolution;
              const isUp = evo !== null && evo >= 0;
              const hasEvo = evo !== null && m.ca > 0;
              return (
                <div key={`${m.year}-${m.month}`} style={{
                  ...s.monthRow,
                  background: m.isCurrentMonth ? 'var(--green-dim)' : 'transparent',
                  borderLeft: m.isCurrentMonth ? '2px solid var(--green)' : '2px solid transparent',
                }}>
                  <div style={s.monthName}>
                    <span style={{
                      color: m.isCurrentMonth ? 'var(--green)' : 'var(--text-2)',
                      fontWeight: m.isCurrentMonth ? 600 : 400,
                    }}>
                      {getMonthLabel(m.year, m.month, true)}
                    </span>
                    <span style={s.monthYear}>{m.year}</span>
                  </div>
                  <div style={s.monthCA}>
                    {m.ca > 0
                      ? formatCurrency(m.ca)
                      : <span style={{ color: 'var(--text-5)' }}>—</span>
                    }
                  </div>
                  <div style={{
                    ...s.monthEvo,
                    color: !hasEvo ? 'var(--text-5)' : isUp ? 'var(--green)' : 'var(--red)',
                  }}>
                    {hasEvo ? (
                      <>
                        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        <span>{formatPercent(evo)}</span>
                      </>
                    ) : <span>—</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </div> {/* end bottom-grid */}

        {/* Reset button */}
        <div style={{ textAlign: 'center', paddingTop: '8px' }}>
          {!confirmReset ? (
            <button style={s.resetLink} onClick={() => setConfirmReset(true)}>
              <Trash2 size={12} /> Vider toutes les données
            </button>
          ) : (
            <div style={s.resetConfirm}>
              <span style={{ color: 'var(--text-2)', fontSize: '13px' }}>
                Supprimer toutes les entrées ?
              </span>
              <button style={s.resetOk} onClick={handleReset}>Confirmer</button>
              <button style={s.resetCancel} onClick={() => setConfirmReset(false)}>Annuler</button>
            </div>
          )}
        </div>
      </div>
      )} {/* end loading conditional */}

      {showModal && <AddEntryModal onAdd={addEntry} onClose={() => setShowModal(false)} />}
    </div>
  );
}

const s = {
  app: {
    minHeight: '100vh',
    background: 'var(--bg)',
    color: 'var(--text-1)',
    fontFamily: "'Inter', -apple-system, sans-serif",
    transition: 'background 0.22s ease',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: 'env(safe-area-inset-top, 0px) var(--pad-x) 0',
    height: 'calc(var(--header-h) + env(safe-area-inset-top, 0px))',
    borderBottom: '1px solid var(--border)',
    position: 'sticky', top: 0,
    background: 'var(--header-bg)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    zIndex: 10,
  },
  logo: { fontSize: '15px', fontWeight: '700', letterSpacing: '-0.3px', color: 'var(--text-1)' },
  themeBtn: {
    width: '34px', height: '34px',
    background: 'rgba(128,128,128,0.1)',
    borderRadius: '9px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', border: 'none',
    flexShrink: 0,
  },
  addBtn: {
    width: '36px', height: '36px',
    background: 'var(--green)',
    color: 'var(--add-btn-text)',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', border: 'none', flexShrink: 0,
  },
  hero: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--card-shadow)',
    borderRadius: '20px',
    padding: 'var(--hero-pad)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '8px', flexWrap: 'wrap',
    transition: 'background 0.22s ease, box-shadow 0.22s ease',
  },
  heroLeft: { flex: '1 1 180px', minWidth: 0 },
  heroLabel: {
    fontSize: '11px', fontWeight: 500, color: 'var(--text-3)',
    letterSpacing: '0.6px', marginBottom: '8px', textTransform: 'uppercase',
  },
  heroAmount: {
    fontSize: 'var(--hero-fs)', fontWeight: '800', letterSpacing: '-1.5px',
    fontVariantNumeric: 'tabular-nums', lineHeight: 1.1,
    color: 'var(--text-1)', marginBottom: '10px',
  },
  heroGoalRow: {
    display: 'flex', alignItems: 'center',
    fontSize: '14px', color: 'var(--text-2)', marginBottom: '14px',
  },
  heroGoalLabel: { color: 'var(--text-3)' },
  progressBar: { height: '4px', background: 'var(--track)', borderRadius: '2px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '2px', transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' },
  kpiCard: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--card-shadow)',
    borderRadius: '16px',
    padding: 'var(--kpi-pad)',
    display: 'flex', flexDirection: 'column', gap: '3px',
    transition: 'background 0.22s ease, box-shadow 0.22s ease',
  },
  kpiLabel: {
    fontSize: '11px', fontWeight: '500', color: 'var(--text-3)',
    letterSpacing: '0.4px', textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: '18px', fontWeight: '700', letterSpacing: '-0.5px',
    fontVariantNumeric: 'tabular-nums', color: 'var(--text-1)', marginTop: '4px',
  },
  kpiSub: {
    fontSize: '11px', color: 'var(--text-3)',
    display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px',
  },
  progressBarSmall: { height: '3px', background: 'var(--track)', borderRadius: '2px', flex: 1, overflow: 'hidden' },
  progressFillSmall: { height: '100%', borderRadius: '2px', transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' },
  card: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--card-shadow)',
    borderRadius: '20px',
    padding: 'var(--card-pad)',
    display: 'flex', flexDirection: 'column', gap: '12px',
    transition: 'background 0.22s ease, box-shadow 0.22s ease',
  },
  cardTitle: { fontSize: '13px', fontWeight: '600', color: 'var(--text-2)' },
  legend: { display: 'flex', gap: '12px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-3)' },
  legendDot: { width: '8px', height: '3px', borderRadius: '2px', display: 'inline-block' },
  legendDash: { width: '14px', height: '1.5px', display: 'inline-block', borderRadius: '1px', opacity: 0.6 },
  monthRow: {
    display: 'flex', alignItems: 'center',
    padding: '10px 8px 10px 12px',
    borderRadius: '8px', gap: '10px',
    borderBottom: '1px solid var(--month-sep)',
    transition: 'background 0.15s',
  },
  monthName: {
    flex: '1 1 0', display: 'flex', alignItems: 'center',
    gap: '7px', minWidth: 0, fontSize: '13px',
  },
  monthYear: { fontSize: '11px', color: 'var(--text-4)' },
  monthCA: { fontVariantNumeric: 'tabular-nums', fontWeight: '600', fontSize: '13px', color: 'var(--text-1)', flexShrink: 0 },
  monthEvo: { display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: '500', minWidth: '62px', justifyContent: 'flex-end', flexShrink: 0 },
  loader: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 58px)',
  },
  loaderDot: {
    width: '32px', height: '32px', borderRadius: '50%',
    border: '3px solid var(--border)',
    borderTopColor: 'var(--green)',
    animation: 'spin 0.8s linear infinite',
  },
  resetLink: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    fontSize: '12px', color: 'var(--text-4)', cursor: 'pointer',
    background: 'none', border: 'none', padding: '4px 8px', borderRadius: '6px',
  },
  resetConfirm: {
    display: 'inline-flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center',
  },
  resetOk: {
    fontSize: '12px', fontWeight: '600', color: 'var(--red)', cursor: 'pointer',
    background: 'var(--red-dim, rgba(255,77,106,0.1))', border: 'none',
    padding: '5px 12px', borderRadius: '8px',
  },
  resetCancel: {
    fontSize: '12px', color: 'var(--text-3)', cursor: 'pointer',
    background: 'none', border: 'none', padding: '5px 8px', borderRadius: '8px',
  },
};
