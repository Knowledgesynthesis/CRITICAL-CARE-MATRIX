import { useState } from 'react';
import { phoenixMapCutoffs, phoenixScore, type PhoenixInput, type RespSupport } from '@/engine/phoenix';
import { useProgress } from '@/store/progress';
import { formatAge } from '@/engine/peds';
import { Badge, Callout, Card, CardBody, CardHeader, NumberField, Page, PageHeader, Segmented, Stat } from '@/components/ui';
import { PatientBar, RefChips } from '@/components/learn';

export default function PhoenixTool() {
  const { ageMonths } = useProgress((s) => s.patient);
  const [i, setI] = useState<Omit<PhoenixInput, 'ageMonths'>>({
    respSupport: 'noninvasive',
    pf: null,
    sf: null,
    spo2: null,
    vasoactiveCount: 0,
    lactate: null,
    map: null,
    platelets: null,
    inr: null,
    dDimer: null,
    fibrinogen: null,
    gcs: null,
    bilateralFixedPupils: false,
    suspectedInfection: true,
  });
  const r = phoenixScore({ ...i, ageMonths });
  const [two, zero] = phoenixMapCutoffs(ageMonths);
  const set = <K extends keyof typeof i>(k: K, v: (typeof i)[K]) => setI((x) => ({ ...x, [k]: v }));

  return (
    <Page className="max-w-5xl">
      <PageHeader eyebrow="Bedside" title="Phoenix Sepsis Score" subtitle="International consensus criteria (JAMA 2024). Use the worst values in the first 24 h; missing values score 0." />
      <PatientBar />
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <Card>
            <CardHeader title="Respiratory (0–3)" subtitle="P/F, or S/F when SpO₂ ≤97%. 2–3 points require invasive ventilation." />
            <CardBody className="space-y-3">
              <Segmented
                label="Respiratory support"
                value={i.respSupport}
                onChange={(v: RespSupport) => set('respSupport', v)}
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'noninvasive', label: 'O₂ / HFNC / NIV' },
                  { value: 'imv', label: 'Invasive ventilation' },
                ]}
              />
              <div className="grid grid-cols-3 gap-3">
                <NumberField label="PaO₂:FiO₂" value={i.pf ?? null} onChange={(v) => set('pf', v)} />
                <NumberField label="SpO₂:FiO₂" value={i.sf ?? null} onChange={(v) => set('sf', v)} />
                <NumberField label="SpO₂" unit="%" value={i.spo2 ?? null} onChange={(v) => set('spo2', v)} />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Cardiovascular (0–6)" subtitle={`MAP for ${formatAge(ageMonths)}: <${two} → 2 points, ${two}–${zero - 1} → 1 point`} />
            <CardBody className="space-y-3">
              <Segmented
                label="Vasoactive drugs"
                value={String(Math.min(i.vasoactiveCount, 2))}
                onChange={(v) => set('vasoactiveCount', Number(v))}
                options={[
                  { value: '0', label: 'No vasoactive' },
                  { value: '1', label: '1 vasoactive' },
                  { value: '2', label: '≥2 vasoactives' },
                ]}
              />
              <div className="grid grid-cols-2 gap-3">
                <NumberField label="Lactate" unit="mmol/L" step={0.1} value={i.lactate ?? null} onChange={(v) => set('lactate', v)} hint="≥5 → 1, ≥11 → 2" />
                <NumberField label="MAP" unit="mmHg" value={i.map ?? null} onChange={(v) => set('map', v)} />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Coagulation (0–2) & neurologic (0–2)" subtitle="1 point each: platelets <100, INR >1.3, D-dimer >2 mg/L FEU, fibrinogen <100 mg/dL." />
            <CardBody className="space-y-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <NumberField label="Platelets" unit="×10³/µL" value={i.platelets ?? null} onChange={(v) => set('platelets', v)} />
                <NumberField label="INR" step={0.1} value={i.inr ?? null} onChange={(v) => set('inr', v)} />
                <NumberField label="D-dimer" unit="mg/L" step={0.1} value={i.dDimer ?? null} onChange={(v) => set('dDimer', v)} />
                <NumberField label="Fibrinogen" unit="mg/dL" value={i.fibrinogen ?? null} onChange={(v) => set('fibrinogen', v)} />
              </div>
              <div className="grid grid-cols-2 items-end gap-3">
                <NumberField label="GCS" value={i.gcs ?? null} min={3} max={15} onChange={(v) => set('gcs', v)} hint="≤10 → 1" />
                <label className="flex h-10 items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4 accent-[hsl(var(--primary))]" checked={i.bilateralFixedPupils} onChange={(e) => set('bilateralFixedPupils', e.target.checked)} />
                  Bilateral fixed pupils (2)
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="h-4 w-4 accent-[hsl(var(--primary))]" checked={i.suspectedInfection} onChange={(e) => set('suspectedInfection', e.target.checked)} />
                Suspected or confirmed infection
              </label>
            </CardBody>
          </Card>
        </div>
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <Card>
            <CardHeader title="Result" />
            <CardBody className="space-y-3">
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-monitor p-2">
                <Stat label="Respiratory" value={r.respiratory} />
                <Stat label="Cardiovascular" value={r.cardiovascular} tone={r.cardiovascular ? 'danger' : 'neutral'} />
                <Stat label="Coagulation" value={r.coagulation} />
                <Stat label="Neurologic" value={r.neurologic} />
                <Stat label="Total" value={r.total} className="col-span-2" tone={r.total >= 2 ? 'warn' : 'ok'} color="text-cyan-300" />
              </div>
              <div className="flex flex-wrap gap-2">
                {r.septicShock ? <Badge tone="danger">Septic shock</Badge> : r.sepsis ? <Badge tone="warn">Sepsis</Badge> : <Badge tone="ok">Does not meet sepsis criteria</Badge>}
              </div>
              {r.detail.map((d) => (
                <Callout key={d} tone="info">
                  {d}
                </Callout>
              ))}
              <p className="text-xs text-muted-foreground">Not a screening tool. Not validated &lt;37 weeks post-conceptional age, during birth hospitalization, or ≥18 y.</p>
              <RefChips ids={['phoenix-2024', 'ssc-peds-2026']} />
            </CardBody>
          </Card>
        </div>
      </div>
    </Page>
  );
}
