import { useState } from 'react';
import { maintenanceRate } from '@/engine/peds';
import { correctedNaForGlucose } from '@/engine/electrolytes';
import { useProgress } from '@/store/progress';
import { fmt, round } from '@/lib/utils';
import { Badge, Callout, Card, CardBody, CardHeader, NumberField, Page, PageHeader, Segmented, Stat } from '@/components/ui';
import { PatientBar, RefChips } from '@/components/learn';

function severity(ph: number, hco3: number): 'none' | 'mild' | 'moderate' | 'severe' {
  if (ph < 7.1 || hco3 < 5) return 'severe';
  if (ph < 7.2 || hco3 < 10) return 'moderate';
  if (ph < 7.3 || hco3 < 18) return 'mild';
  return 'none';
}

export default function DkaTool() {
  const { weightKg: w } = useProgress((s) => s.patient);
  const [ph, setPh] = useState<number | null>(7.08);
  const [hco3, setHco3] = useState<number | null>(5);
  const [glucose, setGlucose] = useState<number | null>(520);
  const [na, setNa] = useState<number | null>(131);
  const [k, setK] = useState<number | null>(5.6);
  const [bolus, setBolus] = useState<number | null>(10);
  const [hours, setHours] = useState<'24' | '36' | '48'>('36');
  const sev = ph !== null && hco3 !== null ? severity(ph, hco3) : 'none';
  const deficitPct = sev === 'severe' ? 10 : sev === 'moderate' ? 7 : sev === 'mild' ? 5 : 0;
  const deficitMl = (deficitPct / 100) * w * 1000;
  const bolusMl = (bolus ?? 0) * w;
  const h = Number(hours);
  const maint = maintenanceRate(w);
  const rate = (deficitMl - bolusMl) / h + maint;
  const corrected = na !== null && glucose !== null ? correctedNaForGlucose(na, glucose) : null;

  return (
    <Page className="max-w-5xl">
      <PageHeader eyebrow="Bedside" title="DKA planner" subtitle="ISPAD 2022 with PECARN FLUID. Fluids replace the deficit evenly; do not chase urine output." />
      <PatientBar />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Presentation" right={<Badge tone={sev === 'severe' ? 'danger' : sev === 'moderate' ? 'warn' : sev === 'mild' ? 'info' : 'ok'}>{sev === 'none' ? 'Not DKA by pH/HCO₃⁻' : `${sev} DKA`}</Badge>} />
          <CardBody className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <NumberField label="Venous pH" step={0.01} value={ph} onChange={setPh} />
              <NumberField label="HCO₃⁻" unit="mmol/L" value={hco3} onChange={setHco3} />
              <NumberField label="Glucose" unit="mg/dL" value={glucose} onChange={setGlucose} />
              <NumberField label="Na" unit="mmol/L" value={na} onChange={setNa} hint={corrected !== null ? `corrected ${fmt(corrected)}` : undefined} />
              <NumberField label="K" unit="mmol/L" step={0.1} value={k} onChange={setK} />
              <NumberField label="Bolus given" unit="mL/kg" value={bolus} onChange={setBolus} />
            </div>
            <p className="text-xs text-muted-foreground">Mild pH &lt;7.3 or HCO₃⁻ &lt;18 · moderate &lt;7.2 or &lt;10 · severe &lt;7.1 or &lt;5. Assumed deficit {deficitPct}%.</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Fluid & insulin plan" right={<Segmented label="Rehydration period" value={hours} onChange={setHours} options={[{ value: '24', label: '24 h' }, { value: '36', label: '36 h' }, { value: '48', label: '48 h' }]} />} />
          <CardBody className="space-y-3">
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-monitor p-2">
              <Stat label="Initial bolus" value={`${round(10 * w)}–${round(20 * w)}`} unit="mL" sub="isotonic over 20–30 min" />
              <Stat label="Then IV rate" value={rate > 0 ? round(rate) : '—'} unit="mL/h" sub={`deficit ${round(deficitMl)} mL + maint ${maint}/h`} color="text-cyan-300" />
              <Stat label="Insulin" value={`${fmt(0.05 * w, 2)}–${fmt(0.1 * w, 2)}`} unit="U/h" sub="0.05–0.1 U/kg/h, ≥1 h after fluids" />
              <Stat label="Potassium" value={k !== null && k < 5.5 ? '40' : 'hold'} unit={k !== null && k < 5.5 ? 'mmol/L' : ''} tone={k !== null && k < 3.5 ? 'danger' : 'neutral'} sub={k !== null && k < 3.5 ? 'replace K before insulin' : 'once voiding and K <5.5'} />
            </div>
            {k !== null && k < 3.5 && <Callout tone="danger">Hypokalemia at presentation: start potassium replacement and delay insulin until K is rising.</Callout>}
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• No insulin bolus. Add dextrose 5–12.5% when glucose reaches ~250–300 mg/dL or falls &gt;90 mg/dL/h; keep insulin running.</li>
              <li>• Resolution: pH &gt;7.30, HCO₃⁻ &gt;18, β-OHB &lt;1 mmol/L.</li>
              <li>• Corrected Na should rise as glucose falls; a fall is a cerebral-injury warning.</li>
            </ul>
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Cerebral injury – treat on suspicion" subtitle="Headache, vomiting, lethargy, inappropriate bradycardia, rising BP, incontinence, posturing, cranial nerve palsy" />
          <CardBody className="space-y-3">
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-monitor p-2 sm:grid-cols-3">
              <Stat label="Mannitol 20%" value={`${round(0.5 * w)}–${round(Math.min(w, 100))}`} unit="g" sub={`${fmt((0.5 * w) / 0.2, 0)}–${fmt(Math.min(w, 100) / 0.2, 0)} mL over 10–15 min`} tone="danger" />
              <Stat label="or 3% saline" value={`${round(2.5 * w)}–${round(5 * w)}`} unit="mL" sub="over 10–15 min" tone="danger" />
              <Stat label="Head of bed" value="30°" sub="then imaging" />
            </div>
            <RefChips ids={['ispad-2022', 'pecarn-fluid-2018']} />
          </CardBody>
        </Card>
      </div>
    </Page>
  );
}
