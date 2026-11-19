import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cpp, cppTarget, GCS_EYE, GCS_MOTOR, GCS_VERBAL, hypertonicSalineBolus, tbiTargets } from '@/engine/neuro';
import { useProgress } from '@/store/progress';
import { cn } from '@/lib/utils';
import { Card, CardBody, CardHeader, NumberField, Page, PageHeader, Segmented, Stat } from '@/components/ui';
import { PatientBar, RefChips } from '@/components/learn';

export default function NeuroTool() {
  const { ageMonths, weightKg } = useProgress((s) => s.patient);
  const [infant, setInfant] = useState<'child' | 'infant'>(ageMonths < 24 ? 'infant' : 'child');
  const [e, setE] = useState(2);
  const [v, setV] = useState(2);
  const [m, setM] = useState(4);
  const [vals, setVals] = useState({ map: 62, icp: 24, sbp: 92, paco2: 38, spo2: 97, na: 146, tempC: 37.8, glucose: 140 });
  const c = cpp(vals.map, vals.icp);
  const target = cppTarget(ageMonths);
  const hts = hypertonicSalineBolus(weightKg);
  const checks = tbiTargets({ ageMonths, ...vals });
  const gcs = e + v + m;

  const Col = ({ title, opts, val, set }: { title: string; opts: typeof GCS_EYE; val: number; set: (n: number) => void }) => (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold">{title}</legend>
      <div className="space-y-1">
        {opts.map((o) => (
          <button
            key={o.score}
            type="button"
            aria-pressed={val === o.score}
            onClick={() => set(o.score)}
            className={cn('flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-sm', val === o.score ? 'border-primary bg-accent' : 'hover:bg-muted')}
          >
            <span className="w-4 font-semibold tabular">{o.score}</span>
            {infant === 'infant' ? o.infant : o.child}
          </button>
        ))}
      </div>
    </fieldset>
  );

  return (
    <Page className="max-w-6xl">
      <PageHeader eyebrow="Bedside" title="CPP, GCS & TBI targets" subtitle="BTF pediatric severe TBI guideline (3rd ed., 2019)." />
      <PatientBar />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title={`Glasgow Coma Scale: ${gcs} (E${e} V${v} M${m})`}
            subtitle={gcs <= 8 ? 'GCS ≤8 → secure the airway; consider ICP monitoring after TBI.' : undefined}
            right={
              <Segmented
                label="Version"
                value={infant}
                onChange={setInfant}
                options={[
                  { value: 'infant', label: 'Pre-verbal' },
                  { value: 'child', label: 'Verbal' },
                ]}
              />
            }
          />
          <CardBody className="grid gap-4 sm:grid-cols-3">
            <Col title="Eye" opts={GCS_EYE} val={e} set={setE} />
            <Col title="Verbal" opts={GCS_VERBAL} val={v} set={setV} />
            <Col title="Motor" opts={GCS_MOTOR} val={m} set={setM} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Perfusion & ICP targets" />
          <CardBody className="space-y-3">
            <div className="grid grid-cols-4 gap-3">
              {(
                [
                  ['map', 'MAP', 'mmHg'],
                  ['icp', 'ICP', 'mmHg'],
                  ['sbp', 'SBP', 'mmHg'],
                  ['paco2', 'PaCO₂', 'mmHg'],
                  ['spo2', 'SpO₂', '%'],
                  ['na', 'Na', 'mmol/L'],
                  ['tempC', 'Temp', '°C'],
                  ['glucose', 'Glucose', 'mg/dL'],
                ] as const
              ).map(([k, l, u]) => (
                <NumberField key={k} label={l} unit={u} step={k === 'tempC' ? 0.1 : 1} value={vals[k]} onChange={(x) => x !== null && setVals({ ...vals, [k]: x })} />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-monitor p-2">
              <Stat label="CPP" value={c} unit="mmHg" tone={c < target ? 'danger' : 'ok'} sub={`target ≥${target}`} />
              <Stat label="ICP" value={vals.icp} unit="mmHg" tone={vals.icp >= 20 ? 'danger' : 'ok'} sub="treat ≥20" />
              <Stat label="3% saline" value={`${hts.lowMl}–${hts.highMl}`} unit="mL" sub="2–5 mL/kg" />
            </div>
            <ul className="space-y-1.5">
              {checks.map((x) => (
                <li key={x.item} className="flex items-start gap-2 text-sm">
                  {x.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />}
                  <span>
                    <span className="font-medium">{x.item}</span> <span className="text-muted-foreground">– {x.note}</span>
                  </span>
                </li>
              ))}
            </ul>
            <RefChips ids={['btf-2019']} />
          </CardBody>
        </Card>
      </div>
    </Page>
  );
}
