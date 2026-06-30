import { useState } from 'react';
import { X } from 'lucide-react';

const MONTHS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
];

function initForm() {
  const now = new Date();
  return {
    amount: '',
    note: '',
    month: String(now.getMonth() + 1).padStart(2, '0'),
    year:  String(now.getFullYear()),
  };
}

export default function AddEntryModal({ onAdd, onClose }) {
  const [form, setForm] = useState(initForm);
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  function handleSubmit(e) {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { setError('Montant invalide'); return; }
    onAdd({
      id:     `entry-${Date.now()}`,
      amount,
      note:   form.note.trim() || 'Entrée',
      date:   `${form.year}-${form.month}-15`,
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-handle" style={s.handle} />

        <div style={s.header}>
          <span style={s.title}>Nouvelle entrée</span>
          <button style={s.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          {/* Montant */}
          <div style={s.field}>
            <label style={s.label}>Montant (€)</label>
            <input
              style={s.input}
              type="number" min="1" step="1" placeholder="5 000"
              inputMode="decimal"
              value={form.amount}
              onChange={e => { setForm(f => ({ ...f, amount: e.target.value })); setError(''); }}
            />
            {error && <span style={s.error}>{error}</span>}
          </div>

          {/* Mois + Année */}
          <div style={s.field}>
            <label style={s.label}>Période</label>
            <div style={s.selectRow}>
              <div style={s.selectWrap}>
                <select
                  style={s.select}
                  value={form.month}
                  onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                >
                  {MONTHS.map((name, i) => (
                    <option key={i} value={String(i + 1).padStart(2, '0')}>{name}</option>
                  ))}
                </select>
                <span style={s.chevron}>›</span>
              </div>
              <div style={{ ...s.selectWrap, flex: '0 0 100px' }}>
                <select
                  style={s.select}
                  value={form.year}
                  onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                >
                  {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
                </select>
                <span style={s.chevron}>›</span>
              </div>
            </div>
          </div>

          {/* Note */}
          <div style={s.field}>
            <label style={s.label}>Note</label>
            <input
              style={s.input}
              type="text" placeholder="Prestation conseil..."
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            />
          </div>

          <button style={s.submit} type="submit">Ajouter</button>
        </form>
      </div>
    </div>
  );
}

const s = {
  handle: {
    width: '36px', height: '4px',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '2px',
    margin: '0 auto 18px',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '20px',
  },
  title: { fontSize: '17px', fontWeight: '700', color: 'var(--text-1)' },
  closeBtn: {
    color: 'var(--text-3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '30px', height: '30px', borderRadius: '8px',
    cursor: 'pointer', background: 'none', border: 'none',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '600', color: 'var(--text-3)', letterSpacing: '0.3px' },
  input: {
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '12px',
    padding: '13px 14px',
    color: 'var(--text-1)',
    fontSize: '16px',
    outline: 'none',
    width: '100%',
  },
  selectRow: { display: 'flex', gap: '10px' },
  selectWrap: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  select: {
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '12px',
    padding: '13px 36px 13px 14px',
    color: 'var(--text-1)',
    fontSize: '16px',
    outline: 'none',
    width: '100%',
    appearance: 'none',
    WebkitAppearance: 'none',
    cursor: 'pointer',
  },
  chevron: {
    position: 'absolute', right: '12px',
    color: 'var(--text-3)', fontSize: '18px',
    pointerEvents: 'none', transform: 'rotate(90deg)',
    lineHeight: 1,
  },
  error: { fontSize: '12px', color: 'var(--red)' },
  submit: {
    background: 'var(--green)',
    color: 'var(--add-btn-text)',
    fontWeight: '700',
    fontSize: '16px',
    padding: '15px',
    borderRadius: '14px',
    cursor: 'pointer',
    marginTop: '6px',
    border: 'none',
    width: '100%',
  },
};
