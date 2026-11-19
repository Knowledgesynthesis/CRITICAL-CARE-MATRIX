import { CartesianGrid, Legend, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { WavePoint } from '@/engine/respiratory';

const AXIS = { stroke: 'hsl(var(--muted-foreground))', fontSize: 11 };
const GRID = 'hsl(var(--border))';
const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 8,
  fontSize: 12,
  color: 'hsl(var(--foreground))',
};

export interface GuytonPoint {
  rap: number;
  cardiac: number | null;
  venous: number | null;
  normalCardiac?: number | null;
  normalVenous?: number | null;
}

export function GuytonChart({ data, op, prev }: { data: GuytonPoint[]; op: { rap: number; ci: number }; prev?: { rap: number; ci: number } | null }) {
  // scale to the cardiac curves and operating point; the venous-return plateau (RAP <0) is clipped
  const yMax = Math.max(6, Math.ceil(Math.max(op.ci * 1.5, ...data.map((d) => Math.max(d.cardiac ?? 0, d.normalCardiac ?? 0))) + 0.5));
  return (
    <div className="h-72 w-full" role="img" aria-label={`Guyton diagram. Operating point: right atrial pressure ${op.rap} mmHg, cardiac index ${op.ci} L/min/m².`}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 12, bottom: 18, left: 0 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
          <XAxis dataKey="rap" type="number" domain={[-2, 24]} tick={AXIS} stroke={AXIS.stroke} label={{ value: 'Right atrial pressure (mmHg)', position: 'insideBottom', offset: -10, fill: AXIS.stroke, fontSize: 11 }} />
          <YAxis domain={[0, yMax]} allowDataOverflow tick={AXIS} stroke={AXIS.stroke} width={34} label={{ value: 'CI (L/min/m²)', angle: -90, position: 'insideLeft', offset: 12, fill: AXIS.stroke, fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => v?.toFixed?.(2)} labelFormatter={(l) => `RAP ${l} mmHg`} />
          <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 11 }} />
          <Line name="Normal heart" dataKey="normalCardiac" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" dot={false} strokeWidth={1.2} isAnimationActive={false} />
          <Line name="Normal venous return" dataKey="normalVenous" stroke="hsl(var(--muted-foreground))" strokeDasharray="2 4" dot={false} strokeWidth={1.2} isAnimationActive={false} connectNulls={false} />
          <Line name="Cardiac function" dataKey="cardiac" stroke="#f43f5e" strokeWidth={2.4} dot={false} isAnimationActive={false} />
          <Line name="Venous return" dataKey="venous" stroke="#22d3ee" strokeWidth={2.4} dot={false} isAnimationActive={false} connectNulls={false} />
          {prev && <ReferenceDot x={prev.rap} y={prev.ci} r={5} fill="transparent" stroke="hsl(var(--muted-foreground))" strokeWidth={2} />}
          <ReferenceDot x={op.rap} y={op.ci} r={6} fill="#facc15" stroke="#0f172a" strokeWidth={1.5} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function WaveRow({ data, k, color, label, unit, zero }: { data: WavePoint[]; k: 'p' | 'flow' | 'vol'; color: string; label: string; unit: string; zero?: boolean }) {
  return (
    <div>
      <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label} <span className="normal-case text-slate-500">({unit})</span>
      </p>
      <div className="h-24 w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="t" type="number" domain={['dataMin', 'dataMax']} hide />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} stroke="rgba(148,163,184,0.3)" width={34} domain={zero ? ['auto', 'auto'] : [0, 'auto']} />
            <Line dataKey={k} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} type="linear" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function Waveforms({ data }: { data: WavePoint[] }) {
  return (
    <div className="space-y-1 rounded-lg bg-monitor p-3" role="img" aria-label="Ventilator pressure, flow and volume waveforms for two breaths">
      <WaveRow data={data} k="p" color="#facc15" label="Pressure" unit="cmH₂O" />
      <WaveRow data={data} k="flow" color="#34d399" label="Flow" unit="L/min" zero />
      <WaveRow data={data} k="vol" color="#60a5fa" label="Volume" unit="mL" />
    </div>
  );
}
