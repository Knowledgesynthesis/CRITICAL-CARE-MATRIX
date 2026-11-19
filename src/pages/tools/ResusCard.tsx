import { useState } from 'react';
import { CATEGORY_LABEL, calcDose, DRUGS, type DrugCategory } from '@/engine/drugs';
import { bloodVolumePerKg, bpNormal, equipment, formatAge, heartRateRange, hypotensionSBP, maintenanceRate, mapPercentiles, respRateRange } from '@/engine/peds';
import { useProgress } from '@/store/progress';
import { fmt, round } from '@/lib/utils';
import { Badge, Card, CardBody, CardHeader, Page, PageHeader, Segmented, Stat } from '@/components/ui';
import { PatientBar, RefChips } from '@/components/learn';

const CATS = Object.keys(CATEGORY_LABEL) as DrugCategory[];

export default function ResusCard() {
  const { ageMonths, weightKg: w } = useProgress((s) => s.patient);
  const [cat, setCat] = useState<DrugCategory>('arrest');
  const eq = equipment(ageMonths, w);
  const hr = heartRateRange(ageMonths);
  const rr = respRateRange(ageMonths);
  const bp = bpNormal(ageMonths);
  const drugs = DRUGS.filter((d) => d.category === cat);

  return (
    <Page className="max-w-6xl">
      <PageHeader eyebrow="Bedside" title="Resuscitation card" subtitle="Equipment, normal limits and weight-based doses for one child. Doses are capped at adult maxima; capped values are flagged." />
      <PatientBar />

      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Airway & equipment" subtitle={`${formatAge(ageMonths)} · ${w} kg`} />
          <CardBody>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-monitor p-2 sm:grid-cols-3">
              <Stat label="ETT cuffed" value={eq.ettCuffed.toFixed(1)} unit="mm" sub={`uncuffed ${eq.ettUncuffed.toFixed(1)}`} color="text-sky-300" />
              <Stat label="Depth (lip)" value={eq.ettDepthCm} unit="cm" />
              <Stat label="LMA" value={eq.lmaSize} />
              <Stat label="Suction" value={eq.suctionFr} unit="Fr" />
              <Stat label="NG/OG" value={eq.ngFr} unit="Fr" />
              <Stat label="Blade" value={eq.bladeSuggestion} className="col-span-1" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Pads: {eq.defibPads}. Have one tube size above and below ready.</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Normal limits for age" />
          <CardBody>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-monitor p-2 sm:grid-cols-3">
              <Stat label="HR awake" value={`${hr.lo}–${hr.hi}`} color="text-emerald-400" />
              <Stat label="RR" value={`${rr.lo}–${rr.hi}`} color="text-amber-300" />
              <Stat label="SBP" value={`${bp.sbp.lo}–${bp.sbp.hi}`} color="text-rose-400" />
              <Stat label="Hypotension" value={`<${hypotensionSBP(ageMonths)}`} unit="SBP" tone="danger" />
              <Stat label="MAP 5th/50th" value={`${round(mapPercentiles(ageMonths).p5)}/${round(mapPercentiles(ageMonths).p50)}`} />
              <Stat label="Maintenance" value={maintenanceRate(w)} unit="mL/h" sub={`blood vol ${round(bloodVolumePerKg(ageMonths) * w)} mL`} />
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Drug doses" right={<span className="text-xs text-muted-foreground tabular">{DRUGS.length} drugs</span>} />
        <CardBody className="space-y-4">
          <div className="overflow-x-auto">
            <Segmented label="Category" value={cat} onChange={setCat} options={CATS.map((c) => ({ value: c, label: CATEGORY_LABEL[c] }))} />
          </div>
          <ul className="divide-y rounded-lg border">
            {drugs.map((d) => {
              const r = calcDose(d, w);
              const doseText = r.doseHigh !== null ? `${fmt(r.dose, 3)}–${fmt(r.doseHigh, 3)}` : fmt(r.dose, 3);
              const volText = r.volumeMl !== null ? (r.volumeHighMl !== null ? `${fmt(r.volumeMl, 2)}–${fmt(r.volumeHighMl, 2)} mL` : `${fmt(r.volumeMl, 2)} mL`) : null;
              const perKgText = d.bands ? 'weight-banded' : d.perKgHigh ? `${d.perKg}–${d.perKgHigh} ${d.unit}/kg` : `${d.perKg} ${d.unit}/kg`;
              return (
                <li key={d.id} className="grid gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold">{d.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {d.indication} · {d.route}
                    </p>
                    {d.notes && <p className="mt-1 text-sm">{d.notes}</p>}
                    <div className="mt-1.5">
                      <RefChips ids={d.refs} />
                    </div>
                  </div>
                  <div className="rounded-lg bg-monitor px-3 py-2 text-right sm:min-w-[11rem]">
                    <p className="tabular text-xl font-semibold text-slate-50">
                      {doseText} <span className="text-sm font-normal text-slate-400">{d.unit}</span>
                    </p>
                    {volText && <p className="tabular text-sm text-cyan-300">{volText}</p>}
                    <p className="text-[11px] text-slate-400">
                      {perKgText}
                      {d.max !== undefined && ` · max ${d.max} ${d.unit}`}
                    </p>
                    {d.concentration && <p className="text-[11px] text-slate-400">{d.concentration.label}</p>}
                    {r.capped && (
                      <Badge tone="warn" className="mt-1">
                        capped at max
                      </Badge>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>
    </Page>
  );
}
