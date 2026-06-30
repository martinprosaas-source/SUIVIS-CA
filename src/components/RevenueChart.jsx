import {
  ResponsiveContainer, ComposedChart, Area, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { formatCurrency, getMonthLabel } from '../utils/format';

function CustomTooltip({ active, payload, label, colors }) {
  if (!active || !payload?.length) return null;
  const ca = payload.find(p => p.dataKey === 'ca')?.value;
  const obj = payload.find(p => p.dataKey === 'goal')?.value;
  return (
    <div style={{
      background: colors.tooltipBg,
      border: `1px solid ${colors.tooltipBorder}`,
      boxShadow: colors.tooltipShadow,
      borderRadius: '10px',
      padding: '10px 14px',
      fontSize: '13px',
    }}>
      <div style={{ color: colors.tooltipLabel, marginBottom: '6px', fontWeight: 500 }}>{label}</div>
      {ca != null && (
        <div style={{ color: colors.accent, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
          CA : {formatCurrency(ca)}
        </div>
      )}
      {obj != null && (
        <div style={{ color: colors.tooltipGoal, marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
          Obj : {formatCurrency(obj)}
        </div>
      )}
    </div>
  );
}

const FALLBACK = {
  accent: '#00D4AA', goal: 'rgba(255,255,255,0.2)', grid: 'rgba(255,255,255,0.04)',
  cursor: 'rgba(255,255,255,0.08)', tick: 'rgba(255,255,255,0.3)', gradientOpacity: 0.22,
  dotStroke: '#08090A', tooltipBg: '#1A1B1E', tooltipBorder: 'rgba(255,255,255,0.08)',
  tooltipShadow: 'none', tooltipLabel: 'rgba(255,255,255,0.5)', tooltipGoal: 'rgba(255,255,255,0.35)',
};

export default function RevenueChart({ data, monthlyGoal, colors = FALLBACK }) {
  const chartData = data.map(d => ({
    name: `${getMonthLabel(d.year, d.month)} ${String(d.year).slice(2)}`,
    ca: d.ca,
    goal: monthlyGoal,
  }));

  const max = Math.max(...chartData.map(d => Math.max(d.ca, d.goal)), 0);
  const yMax = Math.ceil(max * 1.18 / 1000) * 1000;

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="caGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.accent} stopOpacity={colors.gradientOpacity} />
              <stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={colors.grid} />
          <XAxis
            dataKey="name"
            tick={{ fill: colors.tick, fontSize: 11, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, yMax]}
            tick={{ fill: colors.tick, fontSize: 11, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => v >= 1000 ? `${v / 1000}k` : v}
          />
          <Tooltip
            content={<CustomTooltip colors={colors} />}
            cursor={{ stroke: colors.cursor, strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="ca"
            stroke={colors.accent}
            strokeWidth={2}
            fill="url(#caGradient)"
            dot={false}
            activeDot={{ r: 4, fill: colors.accent, stroke: colors.dotStroke, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="goal"
            stroke={colors.goal}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
            activeDot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
