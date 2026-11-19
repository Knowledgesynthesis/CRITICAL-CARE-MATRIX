import { useMemo, useState } from 'react';
import { Clock, Droplet, Droplets, RotateCcw, Scissors, Wind } from 'lucide-react';
import {
  computeHemodynamics,
  decompress,
  DRUG_META,
  giveFluid,
  guytonCurves,
  intubate,
  makeBaseline,
  NO_DRUGS,
  passTime,
  SCENARIOS,
  scenarioState,
  type Drugs,
  type HemoOutput,
  type HemoState,
  type InductionAgent,
} from '@/engine/hemodynamics';
import { formatAge, heartRateRange, hypotensionSBP, mapPercentiles } from '@/engine/peds';
import { fmt, round } from '@/lib/utils';
import { Badge, Button, Callout, Card, CardBody, CardHeader, Page, PageHeader, RangeField, SelectField, Stat, type Tone } from '@/components/ui';
import { GuytonChart } from '@/components/charts';

const AGE_PRESETS = [
  { value: '0.5', label: 'Neonate (2 wk)' },
  { value: '8', label: 'Infant (8 mo)' },
  { value: '14', label: 'Toddler (14 mo)' },
  { value: '48', label: 'Preschool (4 y)' },
  { value: '72', label: 'Child (6 y)' },
  { value: '96', label: 'Child (8 y)' },
  { value: '120', label: 'Child (10 y)' },
  { value: '168', label: 'Adolescent (14 y)' },
];

interface LogEntry {
  label: string;
  before: HemoOutput;
  after: HemoOutput;
  kind: 'fluid' | 'drug' | 'vent' | 'time' | 'procedure';
}

function pct(a: number, b: number) {
  return ((b - a) / a) * 100;
}

function interpret(e: LogEntry): string {
  const dSV = pct(e.before.sv, e.after.sv);
  const dCVP = e.after.cvp - e.before.cvp;
  const dMAP = e.after.map - e.before.map;
  const parts = [`SV ${dSV >= 0 ? '+' : ''}${round(dSV, 0)}%`, `MAP ${dMAP >= 0 ? '+' : ''}${round(dMAP, 0)}`, `CVP ${dCVP >= 0 ? '+' : ''}${round(dCVP, 1)}`];
  if (e.kind === 'fluid') {
    if (dSV >= 10) parts.push('→ fluid-responsive (SV ↑ ≥10%)');
    else if (dCVP > 2) parts.push('→ NOT fluid-responsive: CVP rose without stroke volume');
    else parts.push('→ marginal response');
  }
  return parts.join(' · ');
}

export default function ShockLab() {
  const [age, setAge] = useState('8');
  const [scenarioId, setScenarioId] = useState('septic-cold');
  const [agent, setAgent] = useState<InductionAgent>('ketamine');
  const b = useMemo(() => makeBaseline(Number(age)), [age]);
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const [state, setState] = useState<HemoState>(() => scenarioState(scenario, makeBaseline(8)));
  const [prevState, setPrevState] = useState<HemoState | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);

  const out = useMemo(() => computeHemodynamics(b, state), [b, state]);
  const prevOut = useMemo(() => (prevState ? computeHemodynamics(b, prevState) : null), [b, prevState]);
  const curves = useMemo(() => {
    const g = guytonCurves(b, state);
    const normal = guytonCurves(b, scenarioState(SCENARIOS[0], b));
    return { ...g, points: g.points.map((p, i) => ({ ...p, normalCardiac: normal.points[i].cardiac, normalVenous: normal.points[i].venous })) };
  }, [b, state]);
  const prevOp = useMemo(() => (prevState ? guytonCurves(b, prevState).operating : null), [b, prevState]);

  const reset = (scId = scenarioId, ageStr = age) => {
    const bb = makeBaseline(Number(ageStr));
    setState(scenarioState(SCENARIOS.find((s) => s.id === scId)!, bb));
    setPrevState(null);
    setLog([]);
  };

  const apply = (label: string, kind: LogEntry['kind'], next: HemoState) => {
    const before = computeHemodynamics(b, state);
    const after = computeHemodynamics(b, next);
    setPrevState(state);
    setState(next);
    setLog((l) => [{ label, kind, before, after }, ...l].slice(0, 12));
  };

  const setDrug = (k: keyof Drugs, v: number) => {
    setPrevState(state);
    setState({ ...state, drugs: { ...state.drugs, [k]: v } });
  };

  const hr = heartRateRange(b.ageMonths);
  const hypo = hypotensionSBP(b.ageMonths);
  const p5 = mapPercentiles(b.ageMonths).p5;
  const tone = {
    hr: (out.hr > hr.hi + 30 || out.hr < hr.lo * 0.8 ? 'danger' : out.hr > hr.hi || out.hr < hr.lo ? 'warn' : 'ok') as Tone,
    bp: (out.sbp < hypo || out.map < p5 ? 'danger' : out.sbp < hypo + 8 ? 'warn' : 'ok') as Tone,
    ci: (out.ci < 3 ? 'danger' : out.ci < 3.5 || out.ci > 6.5 ? 'warn' : 'ok') as Tone,
    crt: (out.crt > 3 ? 'danger' : out.crt > 2 ? 'warn' : 'ok') as Tone,
    uo: (out.urineOutput < 0.5 ? 'danger' : out.urineOutput < 1 ? 'warn' : 'ok') as Tone,
    lac: (out.lactate >= 4 ? 'danger' : out.lactate > 2 ? 'warn' : 'ok') as Tone,
    scv: (out.scvo2 < 60 ? 'danger' : out.scvo2 < 70 ? 'warn' : 'ok') as Tone,
    spo2: (out.spo2 < 90 ? 'danger' : out.spo2 < 94 ? 'warn' : 'ok') as Tone,
    liver: (out.liverEdgeCm >= 3 ? 'danger' : out.liverEdgeCm >= 2 ? 'warn' : 'ok') as Tone,
    cvp: (out.cvp > 14 ? 'danger' : out.cvp > 10 || out.cvp < 2 ? 'warn' : 'ok') as Tone,
  };

  const insights: { tone: Tone; text: string }[] = [];
  if (out.profile === 'compensated') {
    const signs = [
      out.ci < 0.75 * b.ci0 && `CI ${round((out.ci / b.ci0) * 100)}% of normal`,
      out.crt > 3 && `CRT ${fmt(out.crt)} s`,
      out.lactate > 2 && `lactate ${fmt(out.lactate)}`,
      out.urineOutput < 1 && `urine ${fmt(out.urineOutput, 1)} mL/kg/h`,
    ].filter(Boolean);
    insights.push({ tone: 'warn', text: `Compensated shock: SBP ${round(out.sbp)} is above the hypotension threshold (${hypo}), yet perfusion is abnormal – ${signs.join(', ')}.` });
  }
  if (out.profile === 'hypotensive') insights.push({ tone: 'danger', text: `Decompensated: ${out.sbp < hypo ? `SBP ${round(out.sbp)} < ${hypo} (PALS)` : `MAP ${round(out.map)} below the 5th centile (~${round(p5)})`}. Hypotension is a late sign in children.` });
  if (out.warmCold === 'cold') insights.push({ tone: 'info', text: 'Cold pattern: low output, high SVR, slow CRT, narrow pulse pressure → inotropy (epinephrine) once preload is adequate.' });
  if (out.warmCold === 'warm') insights.push({ tone: 'info', text: 'Warm pattern: vasoplegia with low diastolic pressure and flash CRT → norepinephrine (± vasopressin).' });
  if (out.liverEdgeCm >= 3) insights.push({ tone: 'danger', text: `Liver edge ${out.liverEdgeCm} cm – venous congestion. This is the pediatric stop-fluids sign.` });
  if (out.pulmonaryEdema >= 1) insights.push({ tone: 'warn', text: 'Crackles / rising oxygen need from pulmonary edema.' });
  if (out.scvo2 < 70) insights.push({ tone: 'warn', text: `ScvO₂ ${round(out.scvo2)}% (<70%): oxygen delivery is not meeting demand.` });
  if (state.drugs.epinephrine >= 0.1) insights.push({ tone: 'info', text: 'Epinephrine raises lactate via β2 (type B) – judge perfusion by CRT, mental status, urine output and ScvO₂ too.' });
  if (state.pext > 0) insights.push({ tone: 'danger', text: 'Extrinsic compression of the heart: fluid only buys time – decompress.' });
  if (out.sipaPositive) insights.push({ tone: 'warn', text: `Shock index ${fmt(out.shockIndex, 2)} exceeds the age-adjusted SIPA cut-off (${out.sipaThreshold}).` });
  if (insights.length === 0) insights.push({ tone: 'ok', text: 'Perfusion adequate for age.' });

  return (
    <Page className="max-w-7xl">
      <PageHeader
        eyebrow="Simulate · Shock Lab"
        title="Pediatric circulation simulator"
        subtitle="Cardiac output is where the heart's Starling curve meets the venous-return curve. Change volume, tone, contractility or intrathoracic pressure and watch the operating point (yellow) move."
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,22rem)_1fr]">
        {/* Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Patient & scenario" />
            <CardBody className="space-y-3">
              <SelectField
                label="Age"
                value={age}
                onChange={(v) => {
                  setAge(v);
                  reset(scenarioId, v);
                }}
                options={AGE_PRESETS}
              />
              <SelectField
                label="Scenario"
                value={scenarioId}
                onChange={(v) => {
                  setScenarioId(v);
                  const sc = SCENARIOS.find((s) => s.id === v)!;
                  const nearest = AGE_PRESETS.reduce((a, o) => (Math.abs(Number(o.value) - sc.defaultAgeMonths) < Math.abs(Number(a.value) - sc.defaultAgeMonths) ? o : a)).value;
                  setAge(nearest);
                  reset(v, nearest);
                }}
                options={SCENARIOS.map((s) => ({ value: s.id, label: s.label }))}
              />
              <p className="text-sm text-muted-foreground">{scenario.story}</p>
              <p className="text-xs text-muted-foreground tabular">
                {formatAge(b.ageMonths)} · {b.weightKg} kg · BSA {fmt(b.bsa, 2)} m² · normal HR {hr.lo}–{hr.hi}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Interventions" subtitle={`Fluid given: ${round(state.cumulativeFluidPerKg)} mL/kg · t = ${state.minutes} min`} />
            <CardBody className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => apply('Crystalloid 10 mL/kg', 'fluid', giveFluid(b, state, 10, 'crystalloid'))}>
                  <Droplet className="h-4 w-4" /> 10 mL/kg
                </Button>
                <Button variant="secondary" onClick={() => apply('Crystalloid 20 mL/kg', 'fluid', giveFluid(b, state, 20, 'crystalloid'))}>
                  <Droplets className="h-4 w-4" /> 20 mL/kg
                </Button>
                <Button variant="secondary" onClick={() => apply('PRBC 10 mL/kg', 'fluid', giveFluid(b, state, 10, 'prbc'))}>
                  <Droplet className="h-4 w-4 text-danger" /> PRBC 10
                </Button>
                <Button variant="secondary" onClick={() => apply('30 minutes pass', 'time', passTime(state, 30))}>
                  <Clock className="h-4 w-4" /> +30 min
                </Button>
              </div>
              {!state.ventilated ? (
                <div className="flex gap-2">
                  <SelectField
                    className="flex-1"
                    label="Induction agent"
                    value={agent}
                    onChange={setAgent}
                    options={[
                      { value: 'ketamine', label: 'Ketamine' },
                      { value: 'etomidate', label: 'Etomidate' },
                      { value: 'midazolam-fentanyl', label: 'Midazolam + fentanyl' },
                      { value: 'propofol', label: 'Propofol' },
                    ]}
                  />
                  <Button className="self-end" variant="outline" onClick={() => apply(`Intubate (${agent}) + PPV`, 'vent', intubate(state, agent))}>
                    <Wind className="h-4 w-4" /> Intubate
                  </Button>
                </div>
              ) : (
                <RangeField label="PEEP" unit="cmH₂O" value={state.peep} min={0} max={18} onChange={(v) => { setPrevState(state); setState({ ...state, peep: v }); }} hint="Positive intrathoracic pressure lowers venous return but also unloads a failing LV." />
              )}
              {state.pext > 0 && (
                <Button variant="danger" className="w-full" onClick={() => apply('Decompression (pericardiocentesis / needle)', 'procedure', decompress(state))}>
                  <Scissors className="h-4 w-4" /> Decompress
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => reset()}>
                <RotateCcw className="h-4 w-4" /> Reset scenario
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Vasoactive infusions" subtitle={`Phoenix CV points now: ${out.phoenixCV}`} />
            <CardBody className="space-y-4">
              {(Object.keys(DRUG_META) as (keyof Drugs)[]).map((k) => (
                <RangeField
                  key={k}
                  label={DRUG_META[k].label}
                  unit={DRUG_META[k].unit}
                  value={state.drugs[k]}
                  min={0}
                  max={DRUG_META[k].max}
                  step={DRUG_META[k].step}
                  onChange={(v) => setDrug(k, v)}
                  hint={`Usual ${DRUG_META[k].usual}. ${DRUG_META[k].action}`}
                />
              ))}
              <Button variant="ghost" size="sm" onClick={() => { setPrevState(state); setState({ ...state, drugs: { ...NO_DRUGS } }); }}>
                Stop all infusions
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Outputs */}
        <div className="min-w-0 space-y-4">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between bg-monitor px-4 py-2 text-xs text-slate-300">
              <span className="font-semibold uppercase tracking-wider">Monitor</span>
              <span className="flex gap-2">
                <Badge tone={out.profile === 'normal' ? 'ok' : out.profile === 'compensated' ? 'warn' : 'danger'}>
                  {out.profile === 'normal' ? 'Adequate perfusion' : out.profile === 'compensated' ? 'Compensated shock' : 'Hypotensive shock'}
                </Badge>
                {out.warmCold !== 'neither' && <Badge tone="info">{out.warmCold}</Badge>}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 bg-monitor p-3 pt-0 sm:grid-cols-3 xl:grid-cols-4">
              <Stat label="HR" value={round(out.hr)} unit="/min" tone={tone.hr} color="text-emerald-400" sub={`normal ${hr.lo}–${hr.hi}`} />
              <Stat label="BP (MAP)" value={`${round(out.sbp)}/${round(out.dbp)}`} tone={tone.bp} color="text-rose-400" sub={`MAP ${round(out.map)} · hypotension <${hypo}`} />
              <Stat label="CVP" value={fmt(out.cvp)} unit="mmHg" tone={tone.cvp} color="text-sky-300" />
              <Stat label="Cardiac index" value={fmt(out.ci, 2)} unit="L/min/m²" tone={tone.ci} sub={`SVI ${round(out.svi)} mL/m²`} />
              <Stat label="SVRI" value={round(out.svri)} unit="dyn·s/cm⁵·m²" sub="peds ~800–1600" />
              <Stat label="Cap refill" value={fmt(out.crt)} unit="s" tone={tone.crt} />
              <Stat label="Urine" value={fmt(out.urineOutput, 2)} unit="mL/kg/h" tone={tone.uo} />
              <Stat label="Lactate" value={fmt(out.lactate)} unit="mmol/L" tone={tone.lac} color="text-amber-300" />
              <Stat label="ScvO₂" value={round(out.scvo2)} unit="%" tone={tone.scv} sub={`O₂ER ${round(out.o2er * 100)}%`} />
              <Stat label="SpO₂" value={out.spo2} unit="%" tone={tone.spo2} color="text-cyan-300" />
              <Stat label="Liver edge" value={fmt(out.liverEdgeCm)} unit="cm" tone={tone.liver} />
              <Stat label="Hb" value={fmt(state.hb)} unit="g/dL" sub={`DO₂I ${round(out.do2i)}`} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Guyton diagram" subtitle="Red: cardiac function (Starling). Cyan: venous return. Dashed: normal child of this age. Hollow dot: previous state." />
            <CardBody>
              <GuytonChart data={curves.points} op={curves.operating} prev={prevOp} />
              <p className="mt-2 text-xs text-muted-foreground tabular">
                Pmsf {fmt(curves.pmsf)} mmHg · venous-return gradient {fmt(curves.pmsf - out.cvp)} mmHg
                {prevOut && ` · ΔCI ${out.ci - prevOut.ci >= 0 ? '+' : ''}${fmt(out.ci - prevOut.ci, 2)}`}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Interpretation" />
            <CardBody className="space-y-2">
              {insights.map((i) => (
                <Callout key={i.text} tone={i.tone}>
                  {i.text}
                </Callout>
              ))}
              <p className="pt-1 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Teaching point:</span> {scenario.teaching}
              </p>
            </CardBody>
          </Card>

          {log.length > 0 && (
            <Card>
              <CardHeader title="Response log" subtitle="Each intervention's effect on stroke volume, MAP and CVP." />
              <CardBody className="p-0 sm:p-0">
                <ol className="divide-y text-sm">
                  {log.map((e, i) => (
                    <li key={i} className="px-4 py-2.5 sm:px-5">
                      <p className="font-medium">{e.label}</p>
                      <p className="text-muted-foreground tabular">{interpret(e)}</p>
                    </li>
                  ))}
                </ol>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </Page>
  );
}
