import { useState } from 'react';
import { bedsideSchwartz, ckidU25, crrtPlan, estimatedBaselineScr, fluidOverloadPercent, kdigoStage, renalAnginaIndex, type RaiInput } from '@/engine/renal';
import { estimateHeight } from '@/engine/peds';
import { useProgress } from '@/store/progress';
import { fmt } from '@/lib/utils';
import { Badge, Callout, Card, CardBody, CardHeader, NumberField, Page, PageHeader, Segmented, SelectField, Stat } from '@/components/ui';
import { PatientBar, RefChips } from '@/components/learn';

export default function RenalTool() {
  const { ageMonths, weightKg } = useProgress((s) => s.patient);
  const [height, setHeight] = useState<number | null>(estimateHeight(ageMonths));
  const [sex, setSex] = useState<'M' | 'F'>('M');
  const [scr, setScr] = useState<number | null>(0.6);
  const [baseline, setBaseline] = useState<number | null>(null);
  const [uo, setUo] = useState<number | null>(0.4);
  const [uoH, setUoH] = useState<number | null>(12);
  const [rrt, setRrt] = useState(false);
  const [fin, setFin] = useState<number | null>(2.4);
  const [fout, setFout] = useState<number | null>(1.1);
  const [risk, setRisk] = useState<RaiInput['risk']>('ventilated-vasoactive');
  const [circuit, setCircuit] = useState<number | null>(93);

  const h = height ?? estimateHeight(ageMonths);
  const neonate = ageMonths < 1;
  const base = baseline ?? estimatedBaselineScr(h);
  const egfr = scr ? bedsideSchwartz(h, scr) : null;
  const u25 = scr && ageMonths >= 12 ? ckidU25(ageMonths / 12, sex, h, scr) : null;
  const k = scr ? kdigoStage({ baselineScr: base, currentScr: scr, eGFR: egfr, onRRT: rrt, uoMlKgH: uo, uoHours: uoH, neonate }) : null;
  const fo = fin !== null && fout !== null ? fluidOverloadPercent(fin, fout, weightKg) : null;
  const rai = renalAnginaIndex({ risk, injuryBy: fo !== null && fo > 0 ? 'fo' : 'scr', foPercent: fo ?? 0, scrRatio: scr ? scr / base : 1 });
  const plan = circuit ? crrtPlan(weightKg, h, ageMonths, circuit) : null;

  return (
    <Page className="max-w-6xl">
      <PageHeader eyebrow="Bedside" title="AKI, eGFR, fluid overload & CRRT" subtitle="Pediatric KDIGO (neonatal modified criteria under 1 month)." />
      <PatientBar />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Kidney function" />
          <CardBody className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <NumberField label="Height" unit="cm" value={height} onChange={setHeight} />
              <SelectField label="Sex" value={sex} onChange={setSex} options={[{ value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }]} />
              <NumberField label="SCr now" unit="mg/dL" step={0.05} value={scr} onChange={setScr} />
              <NumberField label="Baseline SCr" unit="mg/dL" step={0.05} value={baseline} onChange={setBaseline} hint={baseline === null ? `blank → est. ${base} (eGFR 120)` : undefined} />
              <NumberField label="Urine output" unit="mL/kg/h" step={0.1} value={uo} onChange={setUo} />
              <NumberField label="for" unit="h" value={uoH} onChange={setUoH} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-[hsl(var(--primary))]" checked={rrt} onChange={(e) => setRrt(e.target.checked)} /> On kidney replacement therapy
            </label>
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-monitor p-2">
              <Stat label="Schwartz" value={egfr === null ? '—' : fmt(egfr, 0)} unit="mL/min/1.73m²" />
              <Stat label="CKiD U25" value={u25 === null ? '—' : fmt(u25, 0)} unit="mL/min/1.73m²" />
              <Stat label="KDIGO" value={k ? k.stage : '—'} tone={k && k.stage >= 2 ? 'danger' : k?.stage === 1 ? 'warn' : 'ok'} sub={k ? `SCr ×${fmt(k.ratio, 2)}` : undefined} />
            </div>
            {k && (
              <ul className="space-y-1 text-sm text-muted-foreground">
                {k.reasons.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
            )}
            <Callout tone="warn">eGFR equations assume steady state – in evolving AKI they overestimate true GFR.</Callout>
            <RefChips ids={['kdigo-2012', 'ckid-2009', 'ckidu25-2021']} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Fluid overload & renal angina" />
          <CardBody className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Fluid in since admission" unit="L" step={0.1} value={fin} onChange={setFin} />
              <NumberField label="Fluid out" unit="L" step={0.1} value={fout} onChange={setFout} />
            </div>
            <Segmented
              label="Risk"
              value={risk}
              onChange={setRisk}
              options={[
                { value: 'icu', label: 'PICU (1)' },
                { value: 'transplant', label: 'Transplant (3)' },
                { value: 'ventilated-vasoactive', label: 'Vent + vasoactive (5)' },
              ]}
            />
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-monitor p-2">
              <Stat label="Fluid overload" value={fo === null ? '—' : fmt(fo, 1)} unit="%" tone={fo !== null && fo >= 20 ? 'danger' : fo !== null && fo >= 10 ? 'warn' : 'ok'} />
              <Stat label="Renal angina" value={rai.score} tone={rai.positive ? 'danger' : 'ok'} sub={`${rai.risk} × ${rai.injury} · ≥8 positive`} />
            </div>
            {rai.positive && <Badge tone="danger">Renal angina positive – high risk of severe AKI on day 3</Badge>}
            <RefChips ids={['rai-2014', 'ninja-2016']} />
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Starting CRRT prescription (CVVHDF)" />
          <CardBody className="space-y-3">
            <div className="max-w-xs">
              <NumberField label="Circuit + filter volume" unit="mL" value={circuit} onChange={setCircuit} hint="Check your machine/filter set" />
            </div>
            {plan && (
              <>
                <div className="grid grid-cols-2 gap-2 rounded-lg bg-monitor p-2 sm:grid-cols-4">
                  <Stat label="Effluent" value={plan.effluentMlH} unit="mL/h" sub={`${plan.effluentMlKgH} mL/kg/h`} />
                  <Stat label="Blood flow" value={`${plan.bloodFlowMlMin[0]}–${plan.bloodFlowMlMin[1]}`} unit="mL/min" />
                  <Stat label="Catheter" value={plan.catheter.split(' ')[0]} sub={plan.catheter} />
                  <Stat label="Circuit / BV" value={`${fmt(plan.circuitFractionOfBV * 100, 0)}%`} tone={plan.bloodPrime ? 'warn' : 'ok'} sub={plan.bloodPrime ? 'blood prime' : 'crystalloid prime'} />
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {plan.notes.map((n) => (
                    <li key={n}>• {n}</li>
                  ))}
                </ul>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </Page>
  );
}
