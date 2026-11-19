import { type ButtonHTMLAttributes, type ReactNode, useId, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Card({ className, children, as: As = 'section' }: { className?: string; children: ReactNode; as?: 'section' | 'div' | 'article' }) {
  return <As className={cn('rounded-xl border bg-card text-card-foreground shadow-sm', className)}>{children}</As>;
}

export function CardHeader({ title, subtitle, right, className }: { title: ReactNode; subtitle?: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start justify-between gap-3 border-b px-4 py-3 sm:px-5', className)}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold leading-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('px-4 py-4 sm:px-5', className)}>{children}</div>;
}

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'lg' }) {
  const v: Record<Variant, string> = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90',
    secondary: 'bg-muted text-foreground hover:bg-muted/70',
    ghost: 'hover:bg-muted text-foreground',
    outline: 'border bg-transparent hover:bg-muted',
    danger: 'bg-danger text-white hover:opacity-90',
  };
  const s = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-12 px-5 text-base' }[size];
  return (
    <button
      type="button"
      className={cn('inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:pointer-events-none disabled:opacity-50', v[variant], s, className)}
      {...props}
    />
  );
}

export type Tone = 'ok' | 'info' | 'warn' | 'danger' | 'neutral';
const toneText: Record<Tone, string> = { ok: 'text-ok', info: 'text-info', warn: 'text-warn', danger: 'text-danger', neutral: 'text-muted-foreground' };
const toneBg: Record<Tone, string> = {
  ok: 'bg-ok/10 border-ok/30',
  info: 'bg-info/10 border-info/30',
  warn: 'bg-warn/10 border-warn/30',
  danger: 'bg-danger/10 border-danger/30',
  neutral: 'bg-muted border-border',
};

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', toneBg[tone], toneText[tone], className)}>{children}</span>;
}

export function Callout({ tone = 'info', title, children, className }: { tone?: Tone; title?: ReactNode; children: ReactNode; className?: string }) {
  const Icon = tone === 'ok' ? CheckCircle2 : tone === 'warn' ? AlertTriangle : tone === 'danger' ? AlertOctagon : Info;
  return (
    <div className={cn('flex gap-3 rounded-lg border p-3 text-sm', toneBg[tone], className)} role={tone === 'danger' ? 'alert' : undefined}>
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', toneText[tone])} aria-hidden />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className={cn(title && 'mt-0.5', 'text-foreground/90')}>{children}</div>
      </div>
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  unit,
  min,
  max,
  step = 1,
  className,
  hint,
}: {
  label: ReactNode;
  value: number | null;
  onChange: (v: number | null) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  hint?: string;
}) {
  const id = useId();
  // local draft lets the user clear and retype without the parent snapping the value back
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <label htmlFor={id} className={cn('block min-w-0', className)}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex h-10 items-center rounded-lg border bg-background focus-within:ring-2 focus-within:ring-primary">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          className="h-full w-full min-w-0 rounded-lg bg-transparent px-3 text-sm tabular outline-none"
          value={draft ?? (value ?? '')}
          min={min}
          max={max}
          step={step}
          onBlur={() => setDraft(null)}
          onChange={(e) => {
            const raw = e.target.value;
            setDraft(raw);
            if (raw === '') return onChange(null);
            const v = Number(raw);
            if (Number.isFinite(v)) onChange(v);
          }}
        />
        {unit && <span className="shrink-0 pr-3 text-xs text-muted-foreground">{unit}</span>}
      </div>
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function RangeField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  format,
  hint,
}: {
  label: ReactNode;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  format?: (v: number) => string;
  hint?: ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <span className="tabular text-sm font-semibold text-primary">
          {format ? format(value) : value}
          {unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
        </span>
      </div>
      <input id={id} type="range" className="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: ReactNode;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn('block min-w-0', className)}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <select id={id} className="h-10 w-full rounded-lg border bg-background px-3 text-sm" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode }[];
  className?: string;
  label?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={cn('inline-flex max-w-full gap-1 overflow-x-auto rounded-lg bg-muted p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          type="button"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition',
            value === o.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** ICU-monitor style value tile */
export function Stat({
  label,
  value,
  unit,
  tone = 'neutral',
  sub,
  color,
  className,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  tone?: Tone;
  sub?: ReactNode;
  color?: string;
  className?: string;
}) {
  const ring: Record<Tone, string> = { ok: 'ring-ok/40', info: 'ring-info/40', warn: 'ring-warn/60', danger: 'ring-danger/70', neutral: 'ring-white/5' };
  return (
    <div className={cn('rounded-lg bg-monitor px-3 py-2 ring-1 ring-inset', ring[tone], className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</span>
        {tone === 'danger' && <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-danger" aria-label="abnormal" />}
        {tone === 'warn' && <span className="h-2 w-2 shrink-0 rounded-full bg-warn" aria-label="borderline" />}
      </div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className={cn('tabular text-2xl font-semibold leading-none', color ?? 'text-slate-50')}>{value}</span>
        {unit && <span className="text-xs text-slate-400">{unit}</span>}
      </div>
      {sub && <div className="mt-1 truncate text-[11px] text-slate-400">{sub}</div>}
    </div>
  );
}

export function ProgressBar({ value, className, tone = 'primary' }: { value: number; className?: string; tone?: 'primary' | 'ok' }) {
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-muted', className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn('h-full rounded-full transition-all', tone === 'ok' ? 'bg-ok' : 'bg-primary')} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 72, label }: { value: number; size?: number; label?: string }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label ?? `${value}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={6} className="stroke-muted" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={6}
        strokeLinecap="round"
        className="stroke-primary transition-all"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="fill-foreground text-sm font-semibold">
        {value}%
      </text>
    </svg>
  );
}

export function PageHeader({ eyebrow, title, subtitle, right }: { eyebrow?: ReactNode; title: ReactNode; subtitle?: ReactNode; right?: ReactNode }) {
  return (
    <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-3xl text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  );
}

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 md:pb-12 lg:px-8', className)}>{children}</div>;
}
