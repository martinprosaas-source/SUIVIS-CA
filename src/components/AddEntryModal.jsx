import { useState } from 'react';
import { X } from 'lucide-react';

function currentYearMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export default function AddEntryModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ amount: '', note: '', month: currentYearMonth() });
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { setError('Montant invalide'); return; }
    if (!form.month) { setError('Mois requis'); return; }
    onAdd({
      id: `entry-${Date.now()}`,
      amount,
      note: form.note.trim() || 'Entrée',
      date: `${form.month}-15`,
    });
    onClose();
  }

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.header}>
          <span style={s.title}>Nouvelle entrée</span>
          <button style={s.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Montant (€)</label>
            <input
              style={s.input}
              type="number" min="1" step="1" placeholder="5 000"
              value={form.amount}
              onChange={e => { setForm(f => ({ ...f, amount: e.target.value })); setError(''); }}
              autoFocus
            />
            {error && <span style={s.error}>{error}</span>}
          </div>

          <div style={s.field}>
            <label style={s.label}>Mois</label>
            <input
              style={{ ...s.input, colorScheme: 'dark' }}
              type="month"
              value={form.month}
              onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
            />
          </div>

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
  overlay: {
    position: 'fixed', inset: 0,
    background: 'var(--modal-overlay)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100, padding: '16px',
  },
  modal: {
    background: 'var(--modal-card)',
    border: '1px solid var(--modal-border)',
    borderRadius: '18px',
    padding: '24px',
    width: '100%', maxWidth: '400px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '22px',
  },
  title: { fontSize: '16px', fontWeight: '600', color: 'var(--text-1)' },
  closeBtn: {
    color: 'var(--text-3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '30px', height: '30px', borderRadius: '8px',
    cursor: 'pointer', background: 'none', border: 'none',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '500', color: 'var(--text-3)', letterSpacing: '0.3px' },
  input: {
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '10px',
    padding: '12px 14px',
    color: 'var(--text-1)',
    fontSize: '15px',
    outline: 'none',
    width: '100%',
  },
  error: { fontSize: '12px', color: 'var(--red)' },
  submit: {
    background: 'var(--green)',
    color: 'var(--add-btn-text)',
    fontWeight: '700',
    fontSize: '15px',
    padding: '13px',
    borderRadius: '12px',
    cursor: 'pointer',
    marginTop: '4px',
    border: 'none',
  },
};
