import { useState } from 'react';
import { ARDSNET_LOW_PEEP_TABLE, ardsnetMinPeep, oxygenationIndex, oxygenSaturationIndex, pardsSeverity } from '@/engine/respiratory';
import { cn, fmt } from '@/lib/utils';
import { Badge, Card, CardBody, CardHeader, NumberField, Page, PageHeader, Segmented, Stat } from '@/components/ui';
import { RefChips } from '@/components/learn';

type Support = 'invasive' | 'niv' | 'hfnc-or-nasal' | 'oxygen';

export default function PardsTool() {
  const [support, setSupport] = useState<Support>('invasive');
  const [mpaw, setMpaw] = useState<number | null>(16);
  const [fio2, setFio2] = useState<number | null>(0.6);
  const [pao2, setPao2] = useState<number | null>(62);
  const [spo2, setSpo2] = useState<number | null>(91);

  const valid = fio2 !== null && fio2 >= 0.21 && fio2 <= 1;
  const oi = valid && mpaw && pao2 ? oxygenationIndex(mpaw, fio2, pao2) : null;
  const osi = valid && mpaw && spo2 && spo2 <= 97 ? oxygenSaturationIndex(mpaw, fio2, spo2) : null;
  const pf = valid && pao2 ? pao2 / fio2 : null;
  const sf = valid && spo2 && spo2 <= 97 ? spo2 / fio2 : null;
  const res = pardsSeverity({ support, oi, osi, pf, sf });

  return (
    <Page className="max-w-5xl">
      <PageHeader eyebrow="Bedside" title="PARDS stratification" subtitle="PALICC-2 (2023). Imaging, timing (≤7 days) and non-cardiac origin must also be met." />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Inputs" />
          <CardBody className="space-y-3">
            <Segmented
              label="Support"
              value={support}
              onChange={setSupport}
              options={[
                { value: 'invasive', label: 'Invasive' },
                { value: 'niv', label: 'Full-face NIV' },
                { value: 'hfnc-or-nasal', label: 'HFNC / nasal' },
                { value: 'oxygen', label: 'Oxygen' },
              ]}
            />
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Mean airway pressure" unit="cmH₂O" value={mpaw} onChange={setMpaw} />
              <NumberField label="FiO₂" step={0.05} value={fio2} onChange={setFio2} hint="0.21–1.0" />
              <NumberField label="PaO₂" unit="mmHg" value={pao2} onChange={setPao2} />
              <NumberField label="SpO₂" unit="%" value={spo2} onChange={setSpo2} hint="S/F & OSI only valid ≤97%" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Result" />
          <CardBody className="space-y-3">
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-monitor p-2">
              <Stat label="OI" value={oi === null ? '—' : fmt(oi)} tone={oi !== null && oi >= 16 ? 'danger' : oi !== null && oi >= 4 ? 'warn' : 'neutral'} />
              <Stat label="OSI" value={osi === null ? '—' : fmt(osi)} tone={osi !== null && osi >= 12 ? 'danger' : osi !== null && osi >= 5 ? 'warn' : 'neutral'} />
              <Stat label="P/F" value={pf === null ? '—' : Math.round(pf)} />
              <Stat label="S/F" value={sf === null ? '—' : Math.round(sf)} />
            </div>
            <Badge tone={res.category === 'severe' ? 'danger' : res.category === 'mild-moderate' || res.category === 'possible' ? 'warn' : 'ok'}>{res.category.replace('-', '/')}</Badge>
            <p className="text-sm text-muted-foreground">{res.basis}</p>
            {valid && <p className="text-sm">Minimum PEEP at FiO₂ {fio2}: <span className="font-semibold">{ardsnetMinPeep(fio2)} cmH₂O</span></p>}
            <RefChips ids={['palicc2-2023']} />
          </CardBody>
        </Card>
      </div>
      <Card className="mt-5">
        <CardHeader title="ARDSnet lower-PEEP / higher-FiO₂ table" />
        <CardBody className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm tabular">
            <tbody>
              {(['FiO₂', 'PEEP'] as const).map((row, ri) => (
                <tr key={row}>
                  <th className="pr-3 text-left text-muted-foreground">{row}</th>
                  {ARDSNET_LOW_PEEP_TABLE.map(([f, p]) => (
                    <td key={f} className={cn('px-2 py-1 text-center', fio2 !== null && Math.abs(f - fio2) < 0.051 && 'rounded bg-accent font-semibold')}>
                      {ri === 0 ? f.toFixed(1) : p}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </Page>
  );
}
