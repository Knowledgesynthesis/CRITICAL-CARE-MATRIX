import { useState } from 'react';
import {
  correctedCalcium,
  correctedNaForGlucose,
  deltaNaForVolume,
  deltaNaPerLitre,
  gir,
  hypernatremiaPlan,
  hyponatremiaBolus,
  INFUSATES,
  rateForGir,
} from '@/engine/electrolytes';
import { maintenanceDaily, maintenanceRate, tbwFraction } from '@/engine/peds';
import { fluidOverloadPercent } from '@/engine/renal';
import { useProgress } from '@/store/progress';
import { fmt, round } from '@/lib/utils';
import { Callout, Card, CardBody, CardHeader, NumberField, Page, PageHeader, Segmented, SelectField, Stat } from '@/components/ui';
import { PatientBar } from '@/components/learn';

function Maintenance() {
  const { weightKg: w } = useProgress((s) => s.patient);
  const [dex, setDex] = useState('10');
  const [rate, setRate] = useState<number | null>(maintenanceRate(w));
  const [target, setTarget] = useState<number | null>(6);
  const g = rate ? gir(Number(dex), rate, w) : null;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader title="Maintenance (Holliday–Segar)" subtitle="A ceiling, not a target, in critical illness." />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-monitor p-2">
            <Stat label="Full rate" value={maintenanceRate(w)} unit="mL/h" />
            <Stat label="Per day" value={maintenanceDaily(w)} unit="mL" />
            <Stat label="2/3 rate" value={round(maintenanceRate(w) * (2 / 3), 1)} unit="mL/h" />
          </div>
          <Callout tone="info" title="AAP 2018 (strong)">
            Use isotonic fluid with appropriate KCl and dextrose (e.g., 0.9% NaCl or Plasma-Lyte + 5% dextrose ± 20 mmol/L KCl). Count drug infusions, flushes and feeds; ventilated, post-operative and CNS-injured children often need 50–75%.
          </Callout>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Glucose infusion rate" subtitle="GIR = dextrose % × mL/h ÷ (6 × kg)" />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Dextrose"
              value={dex}
              onChange={setDex}
              options={['5', '10', '12.5', '15', '20', '25'].map((d) => ({ value: d, label: `D${d}` }))}
            />
            <NumberField label="Rate" unit="mL/h" value={rate} step={0.1} onChange={setRate} />
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-monitor p-2">
            <Stat label="GIR" value={g === null ? '—' : fmt(g, 1)} unit="mg/kg/min" tone={g !== null && (g < 4 || g > 12) ? 'warn' : 'ok'} />
            <Stat label="Glucose" value={rate ? round((Number(dex) * rate * 24) / 100) : '—'} unit="g/day" />
          </div>
          <NumberField label="Target GIR → rate" unit="mg/kg/min" value={target} step={0.5} onChange={setTarget} hint={target ? `D${dex} at ${fmt(rateForGir(target, Number(dex), w), 1)} mL/h` : undefined} />
          <p className="text-sm text-muted-foreground">Neonates need 4–8 mg/kg/min. Needing &gt;8–10 suggests hyperinsulinism; metabolic crises (IEM, hyperammonemia) use 8–10 to stop catabolism. Peripheral lines tolerate up to D12.5.</p>
        </CardBody>
      </Card>
    </div>
  );
}

function Sodium() {
  const patient = useProgress((s) => s.patient);
  const [na, setNa] = useState<number | null>(122);
  const [glucose, setGlucose] = useState<number | null>(100);
  const [infId, setInfId] = useState('hts3');
  const [vol, setVol] = useState<number | null>(Math.min(100, round(2 * patient.weightKg)));
  const [chronic, setChronic] = useState<'acute' | 'chronic'>('chronic');
  const tbw = round(patient.weightKg * tbwFraction(patient.ageMonths), 1);
  const inf = INFUSATES.find((x) => x.id === infId)!;
  const perL = na ? deltaNaPerLitre(na, inf, tbw) : 0;
  const d = na && vol ? deltaNaForVolume(na, inf, tbw, vol) : 0;
  const hypo = hyponatremiaBolus(patient.weightKg);
  const hyper = na ? hypernatremiaPlan(na, tbw) : null;
  const corrected = na && glucose ? correctedNaForGlucose(na, glucose) : null;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader title="Predict the sodium change" subtitle={`Adrogué–Madias · TBW ${tbw} L (${tbwFraction(patient.ageMonths)} × weight)`} />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Serum Na" unit="mmol/L" value={na} onChange={setNa} />
            <NumberField label="Glucose" unit="mg/dL" value={glucose} onChange={setGlucose} hint={corrected && glucose && glucose > 150 ? `Glucose-corrected Na ${fmt(corrected)}` : undefined} />
            <SelectField label="Infusate" value={infId} onChange={setInfId} options={INFUSATES.map((x) => ({ value: x.id, label: `${x.label} (Na ${x.na})` }))} />
            <NumberField label="Volume" unit="mL" value={vol} onChange={setVol} />
          </div>
          <Segmented
            label="Chronicity"
            value={chronic}
            onChange={setChronic}
            options={[
              { value: 'acute', label: 'Acute (<48 h)' },
              { value: 'chronic', label: 'Chronic / unknown' },
            ]}
          />
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-monitor p-2">
            <Stat label="Δ Na this volume" value={`${d >= 0 ? '+' : ''}${fmt(d, 1)}`} unit="mmol/L" tone={chronic === 'chronic' && Math.abs(d) > 10 ? 'danger' : Math.abs(d) > 8 ? 'warn' : 'ok'} />
            <Stat label="Δ Na per litre" value={`${perL >= 0 ? '+' : ''}${fmt(perL, 1)}`} unit="mmol/L" />
          </div>
          {chronic === 'chronic' && na !== null && na < 135 && Math.abs(d) > 10 && (
            <Callout tone="danger">Predicted rise exceeds 10 mmol/L – risk of osmotic demyelination in chronic hyponatremia. Limit to ≤8–10 mmol/L/24 h.</Callout>
          )}
          <p className="text-xs text-muted-foreground">The formula ignores ongoing losses and urine output – a water diuresis (resolving SIADH, hypovolemia corrected) can drive overcorrection. Re-check Na every 2–4 h.</p>
        </CardBody>
      </Card>
      <div className="space-y-5">
        <Card>
          <CardHeader title="Symptomatic hyponatremia" subtitle="Seizure, coma, apnea, severe vomiting/headache" />
          <CardBody className="space-y-3">
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-monitor p-2">
              <Stat label="3% NaCl bolus" value={hypo.bolusMl} unit="mL" sub="over 10 min, up to ×3" />
              <Stat label="Expected rise" value={`+${hypo.expectedRise}`} unit="mmol/L" sub="per bolus" />
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {hypo.notes.map((n) => (
                <li key={n}>• {n}</li>
              ))}
            </ul>
          </CardBody>
        </Card>
        {hyper && na !== null && na > 145 && (
          <Card>
            <CardHeader title="Hypernatremia plan" />
            <CardBody className="space-y-3">
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-monitor p-2">
                <Stat label="Free-water deficit" value={fmt(hyper.deficitL, 2)} unit="L" />
                <Stat label="Hours to fall 10" value={hyper.hoursToSafeTarget} unit="h" sub="at ≤0.5 mmol/L/h" />
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {hyper.notes.map((n) => (
                  <li key={n}>• {n}</li>
                ))}
              </ul>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

function Overload() {
  const patient = useProgress((s) => s.patient);
  const [adm, setAdm] = useState<number | null>(patient.weightKg);
  const [inL, setIn] = useState<number | null>(2.5);
  const [outL, setOut] = useState<number | null>(1.2);
  const [ca, setCa] = useState<number | null>(7.6);
  const [alb, setAlb] = useState<number | null>(2.4);
  const fo = adm && inL !== null && outL !== null ? fluidOverloadPercent(inL, outL, adm) : null;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader title="Fluid overload %" subtitle="(In − Out, L) ÷ ICU admission weight × 100" />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <NumberField label="Admission wt" unit="kg" value={adm} step={0.1} onChange={setAdm} />
            <NumberField label="Total in" unit="L" value={inL} step={0.1} onChange={setIn} />
            <NumberField label="Total out" unit="L" value={outL} step={0.1} onChange={setOut} />
          </div>
          <div className="rounded-lg bg-monitor p-2">
            <Stat label="Fluid overload" value={fo === null ? '—' : fmt(fo, 1)} unit="%" tone={fo !== null && fo >= 20 ? 'danger' : fo !== null && fo >= 10 ? 'warn' : 'ok'} />
          </div>
          <p className="text-sm text-muted-foreground">FO ≥10% is associated with longer ventilation and higher mortality; ≥10–20% with ongoing need is a common trigger to start CRRT.</p>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Albumin-corrected calcium" subtitle="Ionized calcium is preferred in the PICU." />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Total Ca" unit="mg/dL" value={ca} step={0.1} onChange={setCa} />
            <NumberField label="Albumin" unit="g/dL" value={alb} step={0.1} onChange={setAlb} />
          </div>
          <div className="rounded-lg bg-monitor p-2">
            <Stat label="Corrected Ca" value={ca !== null && alb !== null ? fmt(correctedCalcium(ca, alb), 1) : '—'} unit="mg/dL" />
          </div>
          <p className="text-sm text-muted-foreground">The correction is unreliable in critical illness, alkalosis and after citrate. Measure ionized Ca (normal 1.1–1.3 mmol/L).</p>
        </CardBody>
      </Card>
    </div>
  );
}

export default function FluidsLab() {
  const [tab, setTab] = useState<'maint' | 'na' | 'fo'>('maint');
  return (
    <Page className="max-w-6xl">
      <PageHeader
        eyebrow="Simulate · Fluids Lab"
        title="Fluids, sodium & glucose"
        right={
          <Segmented
            label="Section"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'maint', label: 'Maintenance & GIR' },
              { value: 'na', label: 'Sodium' },
              { value: 'fo', label: 'Overload & Ca' },
            ]}
          />
        }
      />
      <PatientBar />
      {tab === 'maint' ? <Maintenance /> : tab === 'na' ? <Sodium /> : <Overload />}
    </Page>
  );
}
