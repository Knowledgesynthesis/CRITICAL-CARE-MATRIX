import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { equipment, estimateHeight, estimateWeight, formatAge, predictedBodyWeight, typicalRR, ventilationWeight } from '@/engine/peds';
import {
  ARDSNET_LOW_PEEP_TABLE,
  ardsnetMinPeep,
  LUNG_PRESETS,
  pardsSeverity,
  simulateVentilator,
  ventAlerts,
  ventWaveforms,
  VENT_SCENARIOS,
  type VentPatient,
  type VentSettings,
} from '@/engine/respiratory';
import { cn, fmt, round } from '@/lib/utils';
import { Badge, Button, Callout, Card, CardBody, CardHeader, NumberField, Page, PageHeader, RangeField, Segmented, SelectField, Stat, type Tone } from '@/components/ui';
import { Waveforms } from '@/components/charts';

const AGE_PRESETS = [
  { value: '0.5', label: 'Neonate (2 wk)' },
  { value: '2', label: 'Infant (2 mo)' },
  { value: '8', label: 'Infant (8 mo)' },
  { value: '36', label: 'Toddler (3 y)' },
  { value: '48', label: 'Preschool (4 y)' },
  { value: '72', label: 'Child (6 y)' },
  { value: '120', label: 'Child (10 y)' },
  { value: '144', label: 'Child (12 y)' },
  { value: '168', label: 'Adolescent (14 y)' },
];

const EXPERIMENTS: Record<string, string[]> = {
  normal: ['In the neonate, raise equipment dead space from 2 to 12 mL (pediatric HME + elbow) and watch PaCO₂.', 'Drop the ETT one size in an infant: resistance and peak–plateau gap jump (r⁴).'],
  'chest-wall': ['Compare Vt sized to actual vs predicted weight in an obese adolescent.', 'Raise PEEP 5 → 10: dependent atelectasis reopens and compliance rises; Pplat up to 32 is acceptable here.'],
  'cardiogenic-edema': ['Raise PEEP 4 → 9: shunt falls steeply because edema is recruitable.', 'Note the small fall in output with higher PEEP – in a failing LV the afterload benefit often outweighs it.'],
  bpd: ['Compare Vt 6 mL/kg at rate 40 with Vt 11 mL/kg at rate 20: dead-space fraction and PaCO₂ fall with larger, slower breaths.', 'Lengthen Ti to 0.6–0.7 s for the slow-filling regions.'],
  'pards-recruitable': ['Raise PEEP 5 → 14 at FiO₂ 0.8: compliance, SpO₂ and OI improve together.', 'Push Vt to 10 mL/kg: Pplat and ΔP breach limits while CO₂ falls only modestly.', 'Set FiO₂ 1.0 at PEEP 5 – shunt is refractory to oxygen.'],
  'pards-poor': ['Raise PEEP to 14: little oxygen gain, Pplat climbs, venous return falls – non-recruitable lung.'],
  asthma: ['Raise RR from 12 to 30: Te/τ falls, auto-PEEP builds, Pplat rises and output drops.', 'Shorten Ti to 0.7 s at RR 12 to lengthen exhalation.'],
  bronchiolitis: ['Mixed physiology: modest PEEP (6–8) helps; high RR traps gas.'],
};

function defaultTi(ageMonths: number) {
  return ageMonths < 12 ? 0.5 : ageMonths < 72 ? 0.65 : ageMonths < 144 ? 0.8 : 0.9;
}

export default function VentLab() {
  const [age, setAge] = useState('36');
  const ageMonths = Number(age);
  const [weight, setWeight] = useState<number>(estimateWeight(36));
  const [lungId, setLungId] = useState('pards-recruitable');
  const lung = LUNG_PRESETS.find((l) => l.id === lungId)!;
  const height = estimateHeight(ageMonths);
  const eq = equipment(ageMonths, weight);
  const [ettId, setEttId] = useState<number>(eq.ettCuffed);
  const [deadSpace, setDeadSpace] = useState(weight < 10 ? 3 : weight < 30 ? 8 : 25);
  const [s, setS] = useState<VentSettings>({ mode: 'VC', vtMlPerKg: 10, pInsp: 18, rr: 24, peep: 5, fio2: 0.8, ti: 0.65 });
  const [scenarioId, setScenarioId] = useState('pards-injurious');
  const scenario = VENT_SCENARIOS.find((x) => x.id === scenarioId);

  const loadScenario = (id: string) => {
    setScenarioId(id);
    const sc = VENT_SCENARIOS.find((x) => x.id === id);
    if (!sc) return;
    setAge(String(sc.ageMonths));
    setWeight(sc.weightKg);
    setLungId(sc.lungId);
    setEttId(sc.ettId ?? equipment(sc.ageMonths, sc.weightKg).ettCuffed);
    setDeadSpace(sc.deadSpaceMl ?? (sc.weightKg < 10 ? 3 : sc.weightKg < 30 ? 8 : 25));
    setS({ ...sc.settings });
  };

  const pbw = ventilationWeight(weight, height);
  const patient: VentPatient = useMemo(
    () => ({ weightKg: weight, heightCm: height, ageMonths, pbwKg: pbw, hb: 11, hco3: 24, tempC: 37, ettId, equipmentDeadSpaceMl: deadSpace }),
    [weight, height, ageMonths, pbw, ettId, deadSpace],
  );
  const r = useMemo(() => simulateVentilator(patient, s, lung), [patient, s, lung]);
  const alerts = ventAlerts(r, s, lung, patient);
  const waves = useMemo(() => ventWaveforms(r, s), [r, s]);
  const pards = pardsSeverity({ support: 'invasive', oi: r.oi, osi: r.osi });

  const changeAge = (v: string) => {
    const m = Number(v);
    const w = estimateWeight(m);
    setScenarioId('');
    setAge(v);
    setWeight(w);
    setEttId(equipment(m, w).ettCuffed);
    setDeadSpace(w < 10 ? 3 : w < 30 ? 8 : 25);
    setS((x) => ({ ...x, rr: typicalRR(m), ti: defaultTi(m) }));
  };

  const applyStart = () => {
    const obstructive = lung.id === 'asthma';
    const isPards = lung.id.startsWith('pards');
    setS((x) => ({
      ...x,
      mode: 'VC',
      vtMlPerKg: isPards ? 6 : 7,
      peep: isPards ? Math.max(ardsnetMinPeep(x.fio2), 8) : obstructive ? 4 : 5,
      rr: obstructive ? Math.max(10, Math.round(typicalRR(ageMonths) * 0.6)) : isPards ? Math.round(typicalRR(ageMonths) * 1.2) : typicalRR(ageMonths),
      ti: obstructive ? Math.max(0.6, defaultTi(ageMonths) - 0.1) : defaultTi(ageMonths),
    }));
  };

  const set = <K extends keyof VentSettings>(k: K, v: VentSettings[K]) => setS((x) => ({ ...x, [k]: v }));
  const t = (cond: boolean, warnCond: boolean): Tone => (cond ? 'danger' : warnCond ? 'warn' : 'ok');

  return (
    <Page className="max-w-7xl">
      <PageHeader
        eyebrow="Simulate · Ventilator Lab"
        title="Pediatric ventilation & PARDS"
        subtitle="Single-compartment R–C lung with recruitment, overdistension, gas trapping, dead space and shunt. Targets and alerts follow PALICC-2."
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader title="Patient & lungs" />
            <CardBody className="space-y-3">
              <SelectField
                label={`Load a scenario (${VENT_SCENARIOS.length})`}
                value={scenarioId}
                onChange={loadScenario}
                options={[{ value: '', label: 'Custom – set it yourself' }, ...VENT_SCENARIOS.map((x) => ({ value: x.id, label: x.label }))]}
              />
              {scenario && (
                <Callout tone="info" title="Your task">
                  {scenario.goal}
                </Callout>
              )}
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Age" value={age} onChange={changeAge} options={AGE_PRESETS} />
                <NumberField label="Weight" unit="kg" value={weight} min={1} max={150} step={0.1} onChange={(v) => v && v >= 1 && setWeight(v)} />
              </div>
              <SelectField
                label="Lung disease"
                value={lungId}
                onChange={(v) => {
                  setScenarioId('');
                  setLungId(v);
                }}
                options={LUNG_PRESETS.map((l) => ({ value: l.id, label: l.label }))}
              />
              <p className="text-sm text-muted-foreground">{lung.summary}</p>
              {lung.strategy && <p className="rounded-lg border border-primary/30 bg-accent/40 p-2.5 text-sm">{lung.strategy}</p>}
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="ETT (ID mm)"
                  value={String(ettId)}
                  onChange={(v) => setEttId(Number(v))}
                  options={[2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5].map((x) => ({ value: String(x), label: `${x.toFixed(1)}${x === eq.ettCuffed ? ' (age)' : ''}` }))}
                />
                <NumberField label="Equipment dead space" unit="mL" value={deadSpace} min={0} max={80} onChange={(v) => v !== null && v >= 0 && setDeadSpace(Math.min(80, v))} />
              </div>
              <p className="text-xs text-muted-foreground tabular">
                {formatAge(ageMonths)} · height ~{height} cm · PBW {predictedBodyWeight(height)} kg → Vt weight {pbw} kg (lesser of PBW/actual)
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Ventilator" right={<Button size="sm" variant="outline" onClick={applyStart}><Sparkles className="h-4 w-4" /> Protective start</Button>} />
            <CardBody className="space-y-4">
              <Segmented
                label="Mode"
                value={s.mode}
                onChange={(v) => set('mode', v)}
                options={[
                  { value: 'VC', label: 'Volume control' },
                  { value: 'PC', label: 'Pressure control' },
                ]}
              />
              {s.mode === 'VC' ? (
                <RangeField label="Tidal volume" unit="mL/kg PBW" value={s.vtMlPerKg} min={3} max={14} step={0.5} onChange={(v) => set('vtMlPerKg', v)} hint={`= ${round(s.vtMlPerKg * pbw)} mL · target 6–8`} />
              ) : (
                <RangeField label="Inspiratory pressure (above PEEP)" unit="cmH₂O" value={s.pInsp} min={5} max={35} onChange={(v) => set('pInsp', v)} />
              )}
              <RangeField label="Rate" unit="/min" value={s.rr} min={6} max={60} onChange={(v) => set('rr', v)} />
              <RangeField label="PEEP" unit="cmH₂O" value={s.peep} min={0} max={20} onChange={(v) => set('peep', v)} hint={lung.id.startsWith('pards') ? `ARDSnet minimum at FiO₂ ${s.fio2}: ${ardsnetMinPeep(s.fio2)}` : undefined} />
              <RangeField label="FiO₂" value={s.fio2} min={0.21} max={1} step={0.01} onChange={(v) => set('fio2', v)} format={(v) => v.toFixed(2)} />
              <RangeField label="Inspiratory time" unit="s" value={s.ti} min={0.3} max={1.5} step={0.05} onChange={(v) => set('ti', v)} format={(v) => v.toFixed(2)} hint={`I:E 1:${fmt((60 / s.rr - s.ti) / s.ti, 1)}`} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Try this" />
            <CardBody>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {(EXPERIMENTS[lung.id] ?? []).map((e) => (
                  <li key={e}>• {e}</li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>

        <div className="min-w-0 space-y-4">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between bg-monitor px-4 py-2 text-xs text-slate-300">
              <span className="font-semibold uppercase tracking-wider">Ventilator & gases</span>
              <Badge tone={pards.category === 'severe' ? 'danger' : pards.category === 'mild-moderate' ? 'warn' : 'ok'}>
                {!lung.id.startsWith('pards')
                  ? `OI ${fmt(r.oi)}${lung.id === 'cardiogenic-edema' ? ' · cardiac edema, not PARDS' : ''}`
                  : pards.category === 'severe'
                    ? 'Severe PARDS range'
                    : pards.category === 'mild-moderate'
                      ? 'Mild/moderate PARDS range'
                      : 'OI <4'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-monitor p-3 pt-0 sm:grid-cols-3 xl:grid-cols-4">
              <Stat label="Peak" value={round(r.ppeak)} unit="cmH₂O" tone={t(r.ppeak > 40, r.ppeak > 32)} color="text-yellow-300" />
              <Stat label="Plateau" value={round(r.pplat)} unit="cmH₂O" tone={t(r.pplat > 32, r.pplat > 28)} color="text-yellow-300" />
              <Stat label="Driving ΔP" value={round(r.drivingPressure)} unit="cmH₂O" tone={t(r.drivingPressure > 18, r.drivingPressure > 15)} />
              <Stat label="Total PEEP" value={fmt(r.totalPeep)} unit="cmH₂O" tone={t(r.autoPeep > 5, r.autoPeep > 2)} sub={`auto-PEEP ${fmt(r.autoPeep)}`} />
              <Stat label="Tidal volume" value={round(r.vtMl)} unit="mL" tone={t(r.vtPerKg < 4 || r.vtPerKg > 10, r.vtPerKg > 8 || r.vtPerKg < 6)} sub={`${fmt(r.vtPerKg)} mL/kg PBW`} color="text-sky-300" />
              <Stat label="Mean Paw" value={fmt(r.mpaw)} unit="cmH₂O" sub={`MV ${fmt(r.minuteVentL, 2)} L/min`} />
              <Stat label="SpO₂" value={r.spo2} unit="%" tone={t(r.spo2 < 88, r.spo2 < 92 || r.spo2 > 97)} color="text-cyan-300" />
              <Stat label="PaO₂" value={round(r.pao2)} unit="mmHg" sub={`P/F ${round(r.pf)}`} />
              <Stat label="PaCO₂" value={round(r.paco2)} unit="mmHg" tone={t(r.ph < 7.2, r.paco2 > 50 || r.paco2 < 32)} color="text-amber-300" sub={`ETCO₂ ${round(r.etco2)}`} />
              <Stat label="pH" value={r.ph.toFixed(2)} tone={t(r.ph < 7.2 || r.ph > 7.55, r.ph < 7.3 || r.ph > 7.48)} />
              <Stat label="OI / OSI" value={`${fmt(r.oi)}${r.osi !== null ? ` / ${fmt(r.osi)}` : ''}`} tone={t(r.oi >= 16, r.oi >= 4)} sub="severe ≥16 / ≥12" />
              <Stat label="Compliance" value={fmt(r.compliancePerKg, 2)} unit="mL/cmH₂O/kg" sub={`τ ${fmt(r.tau, 2)} s · Te ${fmt(r.teOverTau, 1)}τ`} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Waveforms" subtitle="Look for expiratory flow that fails to return to zero (auto-PEEP) and the peak–plateau gap (resistance)." />
            <CardBody>
              <Waveforms data={waves} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="PALICC-2 check" subtitle={`Dead space VD/VT ${round(r.vdvt * 100)}% · shunt ${round(r.shuntFraction * 100)}% · A–a gradient ${round(r.aaGradient)} mmHg · output ${round(r.coFactor * 100)}% of baseline`} />
            <CardBody className="space-y-2">
              {alerts.map((a) => (
                <Callout key={a.text} tone={a.level === 'ok' ? 'ok' : a.level}>
                  {a.text}
                </Callout>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="ARDSnet lower-PEEP / higher-FiO₂ table" subtitle="PALICC-2 (strong): keep PEEP at or above this table in PARDS." />
            <CardBody className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm tabular">
                <tbody>
                  <tr>
                    <th className="pr-3 text-left text-muted-foreground">FiO₂</th>
                    {ARDSNET_LOW_PEEP_TABLE.map(([f]) => (
                      <td key={f} className={cn('px-2 py-1 text-center', Math.abs(f - s.fio2) < 0.051 && 'rounded bg-accent font-semibold')}>
                        {f.toFixed(1)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th className="pr-3 text-left text-muted-foreground">PEEP</th>
                    {ARDSNET_LOW_PEEP_TABLE.map(([f, p]) => (
                      <td key={f} className={cn('px-2 py-1 text-center', Math.abs(f - s.fio2) < 0.051 && 'rounded bg-accent font-semibold')}>
                        {p}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      </div>
    </Page>
  );
}
