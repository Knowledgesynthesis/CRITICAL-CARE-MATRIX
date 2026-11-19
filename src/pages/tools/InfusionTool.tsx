import { useMemo, useState } from 'react';
import { infusionDose, infusionRateMlH, INFUSIONS } from '@/engine/drugs';
import { useProgress } from '@/store/progress';
import { fmt } from '@/lib/utils';
import { Callout, Card, CardBody, CardHeader, NumberField, Page, PageHeader, SelectField, Stat } from '@/components/ui';
import { PatientBar, RefChips } from '@/components/learn';

export default function InfusionTool() {
  const { weightKg: w } = useProgress((s) => s.patient);
  const [id, setId] = useState('epi');
  const spec = INFUSIONS.find((x) => x.id === id)!;
  const [amount, setAmount] = useState<number | null>(spec.bag.amount);
  const [volume, setVolume] = useState<number | null>(spec.bag.volumeMl);
  const [dose, setDose] = useState<number | null>(spec.range[0]);
  const [rate, setRate] = useState<number | null>(null);

  const bag = useMemo(() => ({ ...spec.bag, amount: amount ?? spec.bag.amount, volumeMl: volume ?? spec.bag.volumeMl }), [spec, amount, volume]);
  const rateFromDose = dose !== null ? infusionRateMlH(spec, dose, w, bag) : null;
  const doseFromRate = rate !== null ? infusionDose(spec, rate, w, bag) : null;
  const outOfRange = (d: number | null) => d !== null && (d < spec.range[0] * 0.5 || d > spec.range[1] * 1.5);
  const fixedBag = spec.bag.drugUnit === 'mL';

  return (
    <Page className="max-w-5xl">
      <PageHeader eyebrow="Bedside" title="Infusion calculator" subtitle="Weight-based dose ↔ pump rate. Edit the bag to match your local standard concentration." />
      <PatientBar />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Drug & concentration" />
          <CardBody className="space-y-3">
            <SelectField
              label="Infusion"
              value={id}
              onChange={(v) => {
                const s = INFUSIONS.find((x) => x.id === v)!;
                setId(v);
                setAmount(s.bag.amount);
                setVolume(s.bag.volumeMl);
                setDose(s.range[0]);
                setRate(null);
              }}
              options={INFUSIONS.map((x) => ({ value: x.id, label: `${x.name} (${x.group})` }))}
            />
            {!fixedBag && (
              <div className="grid grid-cols-2 gap-3">
                <NumberField label={`Amount (${spec.bag.drugUnit})`} value={amount} step={0.1} onChange={setAmount} />
                <NumberField label="In volume" unit="mL" value={volume} onChange={setVolume} />
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Usual range {spec.range[0]}–{spec.range[1]} {spec.rateUnit}. {spec.notes}
            </p>
            <RefChips ids={spec.refs} />
          </CardBody>
        </Card>
        <div className="space-y-5">
          <Card>
            <CardHeader title="Dose → rate" />
            <CardBody className="space-y-3">
              <NumberField label="Dose" unit={spec.rateUnit} value={dose} step={0.01} onChange={setDose} />
              <div className="rounded-lg bg-monitor p-2">
                <Stat label="Pump rate" value={rateFromDose === null ? '—' : fmt(rateFromDose, 2)} unit="mL/h" color="text-cyan-300" tone={outOfRange(dose) ? 'warn' : 'neutral'} />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Rate → dose" />
            <CardBody className="space-y-3">
              <NumberField label="Pump rate" unit="mL/h" value={rate} step={0.1} onChange={setRate} />
              <div className="rounded-lg bg-monitor p-2">
                <Stat label="Delivered dose" value={doseFromRate === null ? '—' : fmt(doseFromRate, 3)} unit={spec.rateUnit} tone={outOfRange(doseFromRate) ? 'warn' : 'neutral'} />
              </div>
              {outOfRange(doseFromRate) && <Callout tone="warn">Outside the usual range – double-check concentration and units.</Callout>}
            </CardBody>
          </Card>
        </div>
      </div>
    </Page>
  );
}
