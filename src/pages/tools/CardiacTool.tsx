import { useState } from 'react';
import { caO2, do2, interpretQpQs, o2Extraction, qpqs, qpqsSingleVentricle } from '@/engine/cardiac';
import { fmt } from '@/lib/utils';
import { Callout, Card, CardBody, CardHeader, NumberField, Page, PageHeader, Segmented, Stat } from '@/components/ui';

export default function CardiacTool() {
  const [mode, setMode] = useState<'single' | 'two'>('single');
  const [sao2, setSao2] = useState<number | null>(88);
  const [svo2, setSvo2] = useState<number | null>(52);
  const [spvo2, setSpvo2] = useState<number | null>(98);
  const [spao2, setSpao2] = useState<number | null>(80);
  const [hb, setHb] = useState<number | null>(15);
  const [ci, setCi] = useState<number | null>(3.5);
  const [pao2, setPao2] = useState<number | null>(50);

  const r =
    sao2 !== null && svo2 !== null && spvo2 !== null
      ? mode === 'single'
        ? qpqsSingleVentricle(sao2, svo2, spvo2)
        : spao2 !== null
          ? qpqs(sao2, svo2, spvo2, spao2)
          : null
      : null;
  const content = hb !== null && sao2 !== null && pao2 !== null ? caO2(hb, sao2, pao2) : null;
  const delivery = content !== null && ci !== null ? do2(ci, content) : null;
  const er = sao2 !== null && svo2 !== null ? o2Extraction(sao2, svo2) : null;

  return (
    <Page className="max-w-5xl">
      <PageHeader eyebrow="Bedside" title="Qp:Qs & oxygen delivery" subtitle="Fick principle applied to shunt and single-ventricle physiology." />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Qp:Qs"
            right={
              <Segmented
                label="Circulation"
                value={mode}
                onChange={setMode}
                options={[
                  { value: 'single', label: 'Single ventricle' },
                  { value: 'two', label: 'Two ventricles' },
                ]}
              />
            }
          />
          <CardBody className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="SaO₂ (systemic arterial)" unit="%" value={sao2} onChange={setSao2} />
              <NumberField label="SvO₂ (SVC / mixed venous)" unit="%" value={svo2} onChange={setSvo2} />
              <NumberField label="SpvO₂ (pulmonary venous)" unit="%" value={spvo2} onChange={setSpvo2} hint="Assume 95–100% if lungs normal" />
              {mode === 'two' && <NumberField label="SpaO₂ (pulmonary artery)" unit="%" value={spao2} onChange={setSpao2} />}
            </div>
            <div className="rounded-lg bg-monitor p-2">
              <Stat label="Qp:Qs" value={r === null || !Number.isFinite(r) ? '—' : fmt(r, 2)} tone={r !== null && (r > 1.5 || r < 0.7) ? 'warn' : 'ok'} color="text-cyan-300" />
            </div>
            {r !== null && <Callout tone={r > 1.5 || r < 0.7 ? 'warn' : 'ok'}>{interpretQpQs(r)}</Callout>}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Oxygen delivery" />
          <CardBody className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <NumberField label="Hb" unit="g/dL" step={0.1} value={hb} onChange={setHb} />
              <NumberField label="CI" unit="L/min/m²" step={0.1} value={ci} onChange={setCi} />
              <NumberField label="PaO₂" unit="mmHg" value={pao2} onChange={setPao2} />
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-monitor p-2">
              <Stat label="CaO₂" value={content === null ? '—' : fmt(content, 1)} unit="mL/dL" />
              <Stat label="DO₂I" value={delivery === null ? '—' : fmt(delivery, 0)} unit="mL/min/m²" />
              <Stat label="O₂ extraction" value={er === null ? '—' : `${fmt(er * 100, 0)}%`} tone={er !== null && er > 0.4 ? 'warn' : 'ok'} />
            </div>
            <p className="text-sm text-muted-foreground">
              Cyanotic children rely on hemoglobin for oxygen content – transfusion thresholds are individualized, and polycythemia is expected. Rising extraction (&gt;40%) or SvO₂ falling below ~50% signals inadequate delivery.
            </p>
          </CardBody>
        </Card>
      </div>
    </Page>
  );
}
