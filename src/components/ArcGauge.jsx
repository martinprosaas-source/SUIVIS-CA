import { useEffect, useRef, useState } from 'react';

export default function ArcGauge({ percent }) {
  const [animated, setAnimated] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const target = Math.min(percent, 100);
    const duration = 1200;
    let startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      const t = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimated(eased * target);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [percent]);

  const size = 220;
  const cx = size / 2;
  const cy = size / 2 + 20;
  const r = 88;
  const startAngle = -210;
  const endAngle = 30;
  const totalArc = endAngle - startAngle;

  function polarToCartesian(angle) {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(start, end) {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const filledEnd = startAngle + (totalArc * animated) / 100;
  const color = animated >= 80 ? 'var(--green)' : animated >= 40 ? 'var(--warning)' : 'var(--red)';
  const tip = polarToCartesian(filledEnd);

  const h = size * 0.92;
  return (
    <svg className="gauge-svg" width={size} height={h} viewBox={`0 0 ${size} ${h}`}>
      <path
        d={describeArc(startAngle, endAngle)}
        fill="none"
        style={{ stroke: 'var(--track)' }}
        strokeWidth="10"
        strokeLinecap="round"
      />
      {animated > 0 && (
        <path
          d={describeArc(startAngle, filledEnd)}
          fill="none"
          style={{ stroke: color }}
          strokeWidth="10"
          strokeLinecap="round"
        />
      )}
      {animated > 2 && (
        <circle
          cx={tip.x}
          cy={tip.y}
          r="5"
          style={{ fill: color, filter: `drop-shadow(0 0 6px ${color})` }}
        />
      )}
      <text
        x={cx} y={cy - 8}
        textAnchor="middle"
        fontSize="28" fontWeight="800" fontFamily="Inter, sans-serif"
        style={{ fill: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}
      >
        {Math.round(animated)}%
      </text>
      <text
        x={cx} y={cy + 18}
        textAnchor="middle"
        fontSize="11" fontFamily="Inter, sans-serif" letterSpacing="0.5"
        style={{ fill: 'var(--text-3)' }}
      >
        DE L'OBJECTIF
      </text>
      <text x={polarToCartesian(startAngle).x - 4} y={polarToCartesian(startAngle).y + 16}
        textAnchor="middle" fontSize="10" fontFamily="Inter, sans-serif"
        style={{ fill: 'var(--text-5)' }}>0%</text>
      <text x={polarToCartesian(endAngle).x + 4} y={polarToCartesian(endAngle).y + 16}
        textAnchor="middle" fontSize="10" fontFamily="Inter, sans-serif"
        style={{ fill: 'var(--text-5)' }}>100%</text>
    </svg>
  );
}
