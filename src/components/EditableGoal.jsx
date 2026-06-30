import { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export default function EditableGoal({ value, onSave, label }) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function start() { setRaw(String(value)); setEditing(true); }
  function commit() {
    const n = parseFloat(raw.replace(/\s/g, ''));
    if (!isNaN(n) && n > 0) onSave(n);
    setEditing(false);
  }
  function handleKey(e) {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={raw}
        onChange={e => setRaw(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKey}
        style={{
          background: 'var(--input-bg)',
          border: '1px solid var(--green)',
          borderRadius: '8px',
          color: 'var(--text-1)',
          fontSize: '14px',
          fontWeight: '600',
          fontVariantNumeric: 'tabular-nums',
          padding: '3px 9px',
          width: '120px',
          outline: 'none',
        }}
        type="number"
        min="1"
      />
    );
  }

  return (
    <span
      onClick={start}
      title={`Modifier ${label}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        cursor: 'pointer', borderRadius: '6px',
        padding: '1px 4px', margin: '-1px -4px',
      }}
    >
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(value)}</span>
      <Pencil size={10} style={{ color: 'var(--text-4)', flexShrink: 0 }} />
    </span>
  );
}
