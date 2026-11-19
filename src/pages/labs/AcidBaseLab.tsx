import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronRight, Shuffle, XCircle } from 'lucide-react';
import { ABG_CASES, type CoreLabel } from '@/content/abgCases';
import { coreDisorders, interpretAcidBase, type AbgInput } from '@/engine/acidBase';
import { useProgress } from '@/store/progress';
import { cn, fmt } from '@/lib/utils';
import { Badge, Button, Callout, Card, CardBody, CardHeader, NumberField, Page, PageHeader, Segmented, type Tone } from '@/components/ui';

const LABELS: { id: CoreLabel; label: string }[] = [
  { id: 'met-acid', label: 'Metabolic acidosis' },
  { id: 'met-alk', label: 'Metabolic alkalosis' },
  { id: 'resp-acid', label: 'Respiratory acidosis' },
  { id: 'resp-alk', label: 'Respiratory alkalosis' },
];

function Steps({ input }: { input: AbgInput }) {
  const r = useMemo(() => interpretAcidBase(input), [input]);
  const tone = (s: string): Tone => (s === 'abnormal' ? 'danger' : s === 'warning' ? 'warn' : s === 'normal' ? 'ok' : 'info');
  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-primary/40 bg-accent/40 p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Interpretation</p>
        <p className="mt-1 font-semibold">{r.summary}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs tabular">
          <Badge>HCO₃⁻ {fmt(r.hco3)}</Badge>
          <Badge>Base excess {fmt(r.baseExcess)}</Badge>
          {r.anionGap !== null && <Badge>AG {fmt(r.anionGap)}</Badge>}
          {r.correctedAnionGap !== null && r.correctedAnionGap !== r.anionGap && <Badge>Corrected AG {fmt(r.correctedAnionGap)}</Badge>}
          {r.deltaRatio !== null && <Badge>Δ ratio {fmt(r.deltaRatio, 2)}</Badge>}
          {r.sig !== null && <Badge>SIG {fmt(r.sig)}</Badge>}
        </div>
      </div>
      <ol className="space-y-2">
        {r.steps.map((s) => (
          <li key={s.id}>
            <Callout tone={tone(s.status)} title={s.title}>
              <p>{s.result}</p>
              {s.detail && <p className="mt-1 text-xs text-muted-foreground">{s.detail}</p>}
            </Callout>
          </li>
        ))}
      </ol>
      {r.differentials.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-semibold">Pediatric differentials to consider</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {r.differentials.map((d) => (
              <li key={d}>• {d}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Analyzer() {
  const [i, setI] = useState<AbgInput>({ ph: 7.18, paco2: 38, hco3: 14, na: 135, cl: 100, albumin: 2.5, lactate: 8 });
  const [advanced, setAdvanced] = useState(false);
  const f = (k: keyof AbgInput, label: string, unit?: string, step = 1) => (
    <NumberField
      label={label}
      unit={unit}
      step={step}
      value={(i[k] as number | null | undefined) ?? null}
      onChange={(v) => setI((x) => ({ ...x, [k]: v ?? undefined }))}
    />
  );
  const valid = Number.isFinite(i.ph) && i.ph > 6.5 && i.ph < 8 && Number.isFinite(i.paco2) && i.paco2 > 5;
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,22rem)_1fr]">
      <Card>
        <CardHeader title="Blood gas & chemistry" subtitle="Leave optional fields empty." />
        <CardBody className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {f('ph', 'pH', undefined, 0.01)}
            {f('paco2', 'PaCO₂', 'mmHg')}
            {f('hco3', 'HCO₃⁻', 'mmol/L', 0.1)}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {f('na', 'Na', 'mmol/L')}
            {f('cl', 'Cl', 'mmol/L')}
            {f('albumin', 'Albumin', 'g/dL', 0.1)}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {f('k', 'K', 'mmol/L', 0.1)}
            {f('lactate', 'Lactate', 'mmol/L', 0.1)}
            {f('glucose', 'Glucose', 'mg/dL')}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setAdvanced(!advanced)}>
            {advanced ? 'Hide' : 'Show'} osmolal & urine gap fields
          </Button>
          {advanced && (
            <div className="grid grid-cols-3 gap-3">
              {f('bun', 'BUN', 'mg/dL')}
              {f('measuredOsm', 'Measured osm', 'mOsm/kg')}
              {f('phosphate', 'Phosphate', 'mg/dL', 0.1)}
              {f('urineNa', 'Urine Na')}
              {f('urineK', 'Urine K')}
              {f('urineCl', 'Urine Cl')}
            </div>
          )}
          <p className="text-xs text-muted-foreground">Load a drill case into the analyzer:</p>
          <select
            className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            aria-label="Load example"
            defaultValue=""
            onChange={(e) => {
              const c = ABG_CASES.find((x) => x.id === e.target.value);
              if (c) setI({ ...c.input });
            }}
          >
            <option value="" disabled>
              Choose an example…
            </option>
            {ABG_CASES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Six-step analysis" />
        <CardBody>{valid ? <Steps input={i} /> : <p className="text-sm text-muted-foreground">Enter a pH (6.5–8.0) and PaCO₂.</p>}</CardBody>
      </Card>
    </div>
  );
}

function Drills() {
  const record = useProgress((s) => s.recordDrill);
  const drills = useProgress((s) => s.drills);
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<CoreLabel[]>([]);
  const [ag, setAg] = useState<'high' | 'normal' | null>(null);
  const [checked, setChecked] = useState(false);
  const c = ABG_CASES[idx];
  const truth = useMemo(() => {
    const r = interpretAcidBase(c.input);
    return { labels: coreDisorders(r.disorders), highAg: r.disorders.includes('high anion gap metabolic acidosis') };
  }, [c]);
  const hasAg = c.input.na !== undefined && c.input.cl !== undefined;
  const correctLabels = sel.length === truth.labels.length && sel.every((x) => truth.labels.includes(x));
  const correctAg = !hasAg || (ag === 'high') === truth.highAg;
  const correct = correctLabels && correctAg;
  const doneCount = Object.values(drills).filter((d) => d.correct).length;

  const go = (n: number) => {
    setIdx(((n % ABG_CASES.length) + ABG_CASES.length) % ABG_CASES.length);
    setSel([]);
    setAg(null);
    setChecked(false);
  };

  const vals: [string, number | null | undefined, string][] = [
    ['pH', c.input.ph, ''],
    ['PaCO₂', c.input.paco2, 'mmHg'],
    ['HCO₃⁻', c.input.hco3, ''],
    ['Na', c.input.na, ''],
    ['Cl', c.input.cl, ''],
    ['K', c.input.k, ''],
    ['Albumin', c.input.albumin, 'g/dL'],
    ['Lactate', c.input.lactate, ''],
    ['Glucose', c.input.glucose, 'mg/dL'],
    ['BUN', c.input.bun, 'mg/dL'],
    ['Osm (measured)', c.input.measuredOsm, ''],
    ['Urine Na/K/Cl', c.input.urineNa !== undefined ? Number.NaN : undefined, ''],
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader
          title={`Drill ${idx + 1}/${ABG_CASES.length} · ${c.title}`}
          subtitle={`${doneCount}/${ABG_CASES.length} solved`}
          right={
            <Button size="sm" variant="ghost" onClick={() => go(Math.floor(Math.random() * ABG_CASES.length))} aria-label="Random drill">
              <Shuffle className="h-4 w-4" />
            </Button>
          }
        />
        <CardBody className="space-y-4">
          <p className="text-sm">{c.vignette}</p>
          <dl className="grid grid-cols-3 gap-2 rounded-lg bg-monitor p-3 text-sm tabular">
            {vals
              .filter(([, v]) => v !== undefined && v !== null)
              .map(([k, v, u]) => (
                <div key={k}>
                  <dt className="text-[11px] uppercase tracking-wide text-slate-400">{k}</dt>
                  <dd className="font-semibold text-slate-50">
                    {Number.isNaN(v) ? `${c.input.urineNa}/${c.input.urineK}/${c.input.urineCl}` : v} <span className="text-xs font-normal text-slate-400">{u}</span>
                  </dd>
                </div>
              ))}
          </dl>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Which disorders are present? (select all)</legend>
            <div className="grid grid-cols-2 gap-2">
              {LABELS.map((l) => {
                const on = sel.includes(l.id);
                const inTruth = truth.labels.includes(l.id);
                return (
                  <button
                    key={l.id}
                    type="button"
                    disabled={checked}
                    aria-pressed={on}
                    onClick={() => setSel(on ? sel.filter((x) => x !== l.id) : [...sel, l.id])}
                    className={cn(
                      'rounded-lg border p-2.5 text-left text-sm transition',
                      on && !checked && 'border-primary bg-accent',
                      checked && inTruth && 'border-ok bg-ok/10',
                      checked && on && !inTruth && 'border-danger bg-danger/10',
                    )}
                  >
                    {l.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
          {hasAg && (
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Anion gap (corrected for albumin)?</legend>
              <Segmented
                label="Anion gap"
                value={ag ?? ('' as 'high')}
                onChange={(v) => !checked && setAg(v)}
                options={[
                  { value: 'normal', label: 'Normal' },
                  { value: 'high', label: 'High' },
                ]}
              />
            </fieldset>
          )}
          {!checked ? (
            <Button
              disabled={sel.length === 0 || (hasAg && ag === null)}
              onClick={() => {
                setChecked(true);
                record(c.id, correct);
              }}
            >
              Check answer
            </Button>
          ) : (
            <div className="space-y-3" aria-live="polite">
              <p className={cn('flex items-center gap-2 font-semibold', correct ? 'text-ok' : 'text-danger')}>
                {correct ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                {correct ? 'Correct' : `Answer: ${truth.labels.map((x) => LABELS.find((l) => l.id === x)?.label).join(' + ')}${hasAg ? ` · AG ${truth.highAg ? 'high' : 'normal'}` : ''}`}
              </p>
              <Callout tone="info" title="Teaching">
                {c.teaching}
              </Callout>
              <Button onClick={() => go(idx + 1)}>
                Next drill <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Worked solution" subtitle={checked ? 'Step-by-step from the analyzer' : 'Revealed after you answer'} />
        <CardBody>{checked ? <Steps input={c.input} /> : <p className="text-sm text-muted-foreground">Commit to an answer first – retrieval is what builds mastery.</p>}</CardBody>
      </Card>
    </div>
  );
}

export default function AcidBaseLab() {
  const [tab, setTab] = useState<'drills' | 'analyzer'>('drills');
  return (
    <Page className="max-w-7xl">
      <PageHeader
        eyebrow="Simulate · Acid–Base Lab"
        title="Blood gases, step by step"
        subtitle="Internal consistency → pH → primary process → compensation → albumin-corrected anion gap → delta ratio, with a Stewart cross-check."
        right={
          <Segmented
            label="Mode"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'drills', label: `Drills (${ABG_CASES.length})` },
              { value: 'analyzer', label: 'Analyzer' },
            ]}
          />
        }
      />
      {tab === 'drills' ? <Drills /> : <Analyzer />}
    </Page>
  );
}
