/**
 * Pediatric circulation model (teaching model, not a clinical predictor).
 *
 * Cardiac output is the intersection of
 *   • a Frank–Starling cardiac-function curve: SV = SVmax·contractility·(1−e^(−Ptm/k))·g(HR)·afterload
 *   • a Guyton venous-return curve:            VR = (Pmsf − RAP)/Rvr, with Pmsf = stressed volume / systemic compliance
 * Infants: flatter Starling reserve (stiffer ventricle) and higher HR dependence.
 * Vasoactive effects use Emax dose–response curves (mcg/kg/min; vasopressin in milliunits/kg/min).
 */
import { clamp, emax, round } from '@/lib/utils';
import {
  bloodVolumePerKg,
  bsa,
  estimateHeight,
  estimateWeight,
  hypotensionSBP,
  mapPercentiles,
  normalHb,
  sipaThreshold,
  typicalHR,
  vo2PerKg,
} from './peds';
import { phoenixCardiovascular } from './phoenix';
import { po2FromSat } from './respiratory';

export interface Drugs {
  epinephrine: number; // mcg/kg/min
  norepinephrine: number; // mcg/kg/min
  dopamine: number; // mcg/kg/min
  dobutamine: number; // mcg/kg/min
  milrinone: number; // mcg/kg/min
  vasopressin: number; // milliunits/kg/min
}

export const NO_DRUGS: Drugs = { epinephrine: 0, norepinephrine: 0, dopamine: 0, dobutamine: 0, milrinone: 0, vasopressin: 0 };

export interface Baseline {
  ageMonths: number;
  weightKg: number;
  heightCm: number;
  bsa: number;
  hr0: number;
  ci0: number;
  co0: number;
  sv0: number;
  map0: number;
  cvp0: number;
  svr0: number;
  pmsf0: number;
  rvr: number;
  csysPerKg: number; // mL/kg/mmHg
  vs0PerKg: number;
  kFill: number;
  svMax: number;
  hrK: number;
  hrMax: number;
  pp0: number;
  uo0: number;
  vo2: number;
  bvPerKg: number;
}

export interface HemoState {
  contractility: number;
  svrFactor: number;
  vsPerKg: number;
  pext: number;
  tempC: number;
  leak: number;
  ongoingLossPerKg: number; // per 30 min
  hb: number;
  sympathetic: number;
  inflammatoryLactate: number;
  ventilated: boolean;
  peep: number;
  sao2: number; // 0–1 before pulmonary edema effect
  drugs: Drugs;
  cumulativeFluidPerKg: number;
  minutes: number;
  /** baroreflex gain (1 = intact; ~0.15 after high spinal cord injury) */
  reflexGain?: number;
  /** vascular/cardiac responsiveness to catecholamines (1 = normal; low in adrenal insufficiency) */
  drugGain?: number;
  /** rate fixed by an arrhythmia (SVT) or heart block; null/undefined = sinus control */
  fixedHr?: number | null;
  steroidGiven?: boolean;
}

export interface HemoOutput {
  hr: number;
  sbp: number;
  dbp: number;
  map: number;
  cvp: number;
  co: number;
  ci: number;
  sv: number;
  svi: number;
  svr: number;
  svri: number;
  pmsf: number;
  pulsePressure: number;
  crt: number;
  urineOutput: number; // mL/kg/h
  liverEdgeCm: number;
  pulmonaryEdema: number; // 0 none … 3 severe
  spo2: number;
  do2: number; // mL/min
  do2i: number; // mL/min/m²
  vo2: number;
  o2er: number;
  scvo2: number;
  lactate: number;
  shockIndex: number;
  sipaThreshold: number | null;
  sipaPositive: boolean;
  phoenixCV: number;
  hypotensive: boolean;
  mapBelowP5: boolean;
  profile: 'normal' | 'compensated' | 'hypotensive';
  warmCold: 'warm' | 'cold' | 'neither';
  contractilityEff: number;
  svrMult: number;
}

export function makeBaseline(ageMonths: number, weightKg?: number, heightCm?: number): Baseline {
  const w = weightKg ?? estimateWeight(ageMonths);
  const h = heightCm ?? estimateHeight(ageMonths);
  const area = bsa(w, h);
  const hr0 = typicalHR(ageMonths);
  const ci0 = 4.0;
  const co0 = ci0 * area;
  const sv0 = (co0 / hr0) * 1000;
  const map0 = mapPercentiles(ageMonths).p50;
  const cvp0 = 5;
  const svr0 = ((map0 - cvp0) * 80) / co0;
  const csysPerKg = 2.5;
  const vs0PerKg = 22.5;
  const pmsf0 = vs0PerKg / csysPerKg; // 9 mmHg
  const rvr = (pmsf0 - cvp0) / co0;
  // infant ventricle: less preload reserve (smaller k = earlier plateau)
  const kFill = ageMonths < 12 ? 3 : ageMonths < 72 ? 3.5 : 4;
  // output peaks at ≈0.76·hrK: ~186/min infants, ~175 young children, ~163 school age, ~152 adolescents
  const hrK = ageMonths < 12 ? 245 : ageMonths < 72 ? 230 : ageMonths < 144 ? 215 : 200;
  const hrMax = ageMonths < 12 ? 220 : ageMonths < 72 ? 200 : 185;
  const g0 = hrFactorRaw(hr0, hrK);
  const fill0 = 1 - Math.exp(-(cvp0 + 0.5) / kFill); // spontaneous breathing: Pit ≈ −0.5 mmHg
  const svMax = sv0 / (fill0 * g0);
  const pp0 = ageMonths < 12 ? 35 : ageMonths < 72 ? 45 : ageMonths < 144 ? 48 : 50;
  const uo0 = ageMonths < 12 ? 2 : ageMonths < 144 ? 1.5 : 1;
  return {
    ageMonths,
    weightKg: w,
    heightCm: h,
    bsa: area,
    hr0,
    ci0,
    co0,
    sv0,
    map0,
    cvp0,
    svr0,
    pmsf0,
    rvr,
    csysPerKg,
    vs0PerKg,
    kFill,
    svMax,
    hrK,
    hrMax,
    pp0,
    uo0,
    vo2: vo2PerKg(ageMonths) * w,
    bvPerKg: bloodVolumePerKg(ageMonths),
  };
}

function hrFactorRaw(hr: number, hrK: number): number {
  return 1 / (1 + (hr / hrK) ** 4);
}

export function drugEffects(d: Drugs) {
  // inotropes share the β-adrenergic/cAMP pathway → saturating combination
  const ino =
    1 -
    (1 - 0.65 * emax(d.epinephrine, 0.05)) *
      (1 - 0.25 * emax(d.norepinephrine, 0.1)) *
      (1 - 0.45 * emax(d.dopamine, 6)) *
      (1 - 0.55 * emax(d.dobutamine, 7)) *
      (1 - 0.35 * emax(d.milrinone, 0.4));
  const contractility = 1 + 0.9 * ino;
  // α-mediated vasoconstriction from all agents saturates (shared final pathway): combine as 1 − Π(1 − eᵢ)
  const alpha =
    1 -
    (1 - 0.55 * emax(d.epinephrine, 0.3, 2)) *
      (1 - 0.6 * emax(d.norepinephrine, 0.15, 1.5)) *
      (1 - 0.45 * emax(d.dopamine, 15, 3)) *
      (1 - 0.45 * emax(d.vasopressin, 0.5, 1.5));
  const svr =
    (1 + 2.4 * alpha) *
    (1 - 0.15 * emax(d.epinephrine, 0.03)) *
    (1 - 0.2 * emax(d.dobutamine, 8)) *
    (1 - 0.3 * emax(d.milrinone, 0.4));
  const hr =
    1 +
    0.25 * emax(d.epinephrine, 0.1) +
    0.05 * emax(d.norepinephrine, 0.1) +
    0.2 * emax(d.dopamine, 8) +
    0.2 * emax(d.dobutamine, 10) +
    0.05 * emax(d.milrinone, 0.4);
  const venoconstriction =
    3 * emax(d.epinephrine, 0.3, 2) + 5 * emax(d.norepinephrine, 0.2) + 2 * emax(d.dopamine, 12) + 2 * emax(d.vasopressin, 0.8);
  const lactate = 2.0 * emax(d.epinephrine, 0.3, 1.5);
  return { contractility, svr, hr, venoconstriction, lactate };
}

export function vasoactiveCount(d: Drugs): number {
  return Object.values(d).filter((v) => v > 0).length;
}

export function intrathoracicPressure(s: Pick<HemoState, 'ventilated' | 'peep'>): number {
  return s.ventilated ? 0.25 * s.peep : -0.5;
}

interface CircSolve {
  rap: number;
  co: number;
  sv: number;
  map: number;
  hr: number;
  svr: number;
  pmsf: number;
  reflex: number;
}

/** Smooth HR ceiling: identity near baseline, saturating toward hrMax. */
function softHR(target: number, b: Baseline): number {
  const f = (x: number) => x / (1 + (x / b.hrMax) ** 4) ** 0.25;
  return (f(target) * b.hr0) / f(b.hr0);
}

/** Cardiac function curve value (L/min) for a given RAP. */
export function heartOutput(
  b: Baseline,
  rap: number,
  hr: number,
  contr: number,
  svrMult: number,
  pit: number,
  pext: number,
  pressureLoad = 0,
): { co: number; sv: number } {
  const ptm = rap - pit - pext;
  const fill = ptm <= 0 ? 0 : 1 - Math.exp(-ptm / b.kFill);
  const sens = 0.1 + 0.7 * Math.max(0, 1 - contr);
  // positive intrathoracic pressure lowers LV transmural (afterload) pressure
  const afterloadLoad = svrMult * Math.max(0.5, (b.map0 - Math.max(0, pit) * 3) / b.map0);
  // even a normal ventricle cannot maintain stroke volume against extreme afterload
  const af = clamp(1 / (1 + sens * (afterloadLoad - 1) + 0.25 * Math.max(0, afterloadLoad - 1.5) ** 2 + pressureLoad), 0.25, 1.3);
  const g = hrFactorRaw(hr, b.hrK) / hrFactorRaw(b.hr0, b.hrK);
  const sv = b.svMax * hrFactorRaw(b.hr0, b.hrK) * contr * fill * g * af;
  return { co: (hr * sv) / 1000, sv };
}

export function venousReturn(b: Baseline, rap: number, pmsf: number): number {
  return Math.max(0, (pmsf - Math.max(rap, 0)) / b.rvr);
}

function solveRAP(b: Baseline, hr: number, contr: number, svrMult: number, pit: number, pext: number, pmsf: number, pressureLoad: number): number {
  let lo = -8;
  let hi = Math.max(pmsf, -7);
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const f = heartOutput(b, mid, hr, contr, svrMult, pit, pext, pressureLoad).co - venousReturn(b, mid, pmsf);
    if (f > 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

interface Effective {
  contr: number;
  svrMult: number;
  pmsf: number;
  pit: number;
  drugLac: number;
  fxHr: number;
}

/** Disease + drugs + baroreflex (reflex 0 = none, ~1 = maximal) → effective circulatory parameters. */
function effective(b: Baseline, s: HemoState, reflex: number): Effective {
  const raw = drugEffects(s.drugs);
  // catecholamine responsiveness scales each drug's deviation from baseline
  const g = s.drugGain ?? 1;
  const fx = {
    contractility: 1 + (raw.contractility - 1) * g,
    svr: 1 + (raw.svr - 1) * g,
    hr: 1 + (raw.hr - 1) * g,
    venoconstriction: raw.venoconstriction * g,
    lactate: raw.lactate,
  };
  const r = reflex * (s.reflexGain ?? 1);
  // vasoplegia (low intrinsic SVR) blunts the reflex vasoconstrictor response
  const reflexSvr = 1 + 0.9 * r * (r > 0 ? Math.min(1, s.svrFactor) : 1);
  const svrMult = s.svrFactor * fx.svr * reflexSvr;
  const pit = intrathoracicPressure(s);
  const peepPmsf = s.ventilated ? 0.12 * s.peep : 0;
  const pmsf = Math.max(0.5, Math.max(1, s.vsPerKg + fx.venoconstriction + 4 * r) / b.csysPerKg + peepPmsf);
  return { contr: s.contractility * fx.contractility, svrMult, pmsf, pit, drugLac: fx.lactate, fxHr: fx.hr };
}

function solveCirculation(b: Baseline, s: HemoState): CircSolve & Effective & { pressureLoad: number } {
  const fever = 1 + 0.07 * Math.max(0, s.tempC - 37);
  let hr = s.fixedHr ?? b.hr0;
  let reflex = 0;
  let e = effective(b, s, reflex);
  let res: CircSolve = { rap: b.cvp0, co: b.co0, sv: b.sv0, map: b.map0, hr, svr: b.svr0, pmsf: e.pmsf, reflex };
  let mapPrev = b.map0;
  let pressureLoad = 0;
  for (let iter = 0; iter < 200; iter++) {
    e = effective(b, s, reflex);
    // wall stress rises steeply in severe hypertension → stroke volume cannot keep rising
    pressureLoad = 0.5 * pressureLoad + 0.5 * 1.5 * Math.max(0, mapPrev / b.map0 - 1.3) ** 2;
    const rap = solveRAP(b, hr, e.contr, e.svrMult, e.pit, s.pext, e.pmsf, pressureLoad);
    const { co, sv } = heartOutput(b, rap, hr, e.contr, e.svrMult, e.pit, s.pext, pressureLoad);
    const svr = b.svr0 * e.svrMult;
    const map = (co * svr) / 80 + rap;
    res = { rap, co, sv, map, hr, svr, pmsf: e.pmsf, reflex };
    mapPrev = map;
    const ci = co / b.bsa;
    // Baroreflex: hypoperfusion drives sympathetic tone (0…1); hypertension produces vagal/vasodilator withdrawal (down to −0.4)
    const mapDev = (b.map0 - map) / b.map0;
    const pressureTerm = mapDev >= 0 ? mapDev : mapDev < -0.1 ? 0.8 * (mapDev + 0.1) : 0;
    const deficit = clamp(pressureTerm + 0.6 * Math.max(0, 1 - ci / b.ci0), -0.4, 1);
    const hrTarget = softHR(b.hr0 * e.fxHr * fever * Math.max(0.3, 1 + s.sympathetic + 0.9 * deficit * (s.reflexGain ?? 1)), b);
    const nextHr = s.fixedHr ? s.fixedHr : 0.7 * hr + 0.3 * hrTarget;
    const nextReflex = 0.7 * reflex + 0.3 * deficit;
    const done = iter > 3 && Math.abs(nextHr - hr) < 0.02 && Math.abs(nextReflex - reflex) < 0.0005;
    hr = nextHr;
    reflex = nextReflex;
    if (done) break;
  }
  return { ...res, ...e, pressureLoad };
}

export function computeHemodynamics(b: Baseline, s: HemoState): HemoOutput {
  const c = solveCirculation(b, s);
  const ci = c.co / b.bsa;
  const pp = clamp(b.pp0 * (c.sv / b.sv0) ** 0.9 * c.svrMult ** -0.2, 8, 90);
  const sbp = c.map + (2 / 3) * pp;
  const dbp = c.map - pp / 3;

  // Left atrial pressure and pulmonary edema
  const lap = c.rap + 3 + Math.max(0, 1 - c.contr) * 12;
  const fluidLoad = Math.max(0, s.cumulativeFluidPerKg - 40) * s.leak * 0.06;
  const edemaRaw = Math.max(0, lap - 14) * 0.35 + fluidLoad;
  const peepProtect = s.ventilated ? Math.max(0.3, 1 - s.peep / 15) : 1;
  const pulmonaryEdema = clamp(edemaRaw * peepProtect, 0, 3);
  const sao2 = clamp(s.sao2 - pulmonaryEdema * 0.035, 0.6, 1);
  const pao2 = po2FromSat(sao2);

  // Oxygen transport
  const cao2 = 1.34 * s.hb * sao2 + 0.003 * pao2;
  const do2 = c.co * cao2 * 10;
  const vo2Demand = b.vo2 * (1 + 0.1 * (s.tempC - 37)) * (s.ventilated ? 0.85 : 1 + 0.1 * s.sympathetic);
  const o2erDemand = vo2Demand / Math.max(do2, 1);
  const o2er = Math.min(o2erDemand, 0.7);
  const vo2 = Math.min(vo2Demand, do2 * 0.7);
  const scvo2 = clamp(sao2 * (1 - o2er) * 100, 15, 95);
  const lactate = clamp(1.0 + 25 * Math.max(0, o2erDemand - 0.4) + s.inflammatoryLactate + c.drugLac, 0.6, 20);

  // Perfusion signs
  const crt = clamp(1.6 * (b.ci0 / Math.max(ci, 0.3)) ** 1.1 * c.svrMult ** 0.6, 0.5, 8);
  const rpp = c.map - c.rap;
  const rppCrit = 0.6 * b.map0;
  const sig = 1 / (1 + Math.exp(-(rpp - rppCrit) / 4));
  const sigBase = 1 / (1 + Math.exp(-(b.map0 - b.cvp0 - rppCrit) / 4));
  const antidiuresis = clamp(1 - 0.6 * (c.reflex + s.sympathetic), 0.15, 1);
  const urineOutput = clamp(b.uo0 * (sig / sigBase) * Math.min(1.2, ci / b.ci0) ** 1.2 * antidiuresis, 0, b.uo0 * 1.5);
  const liverEdgeCm = round(1 + Math.max(0, c.rap - 8) * 0.6, 1);

  const shockIndex = c.hr / sbp;
  const sipa = sipaThreshold(b.ageMonths);
  const p = mapPercentiles(b.ageMonths);
  const hypotensive = sbp < hypotensionSBP(b.ageMonths);
  const mapBelowP5 = c.map < p.p5;
  const hypoperfused = ci < 0.75 * b.ci0 || crt > 3 || lactate > 2 || urineOutput < 1;
  const profile: HemoOutput['profile'] = hypotensive || mapBelowP5 ? 'hypotensive' : hypoperfused ? 'compensated' : 'normal';
  const warmCold: HemoOutput['warmCold'] =
    profile === 'normal' ? 'neither' : crt <= 1.5 && c.svrMult < 0.8 ? 'warm' : crt > 2.5 || c.svrMult > 1.2 ? 'cold' : 'neither';

  return {
    hr: c.hr,
    sbp,
    dbp,
    map: c.map,
    cvp: c.rap,
    co: c.co,
    ci,
    sv: c.sv,
    svi: c.sv / b.bsa,
    svr: c.svr,
    svri: c.svr * b.bsa,
    pmsf: c.pmsf,
    pulsePressure: pp,
    crt,
    urineOutput,
    liverEdgeCm,
    pulmonaryEdema,
    spo2: round(sao2 * 100, 0),
    do2,
    do2i: do2 / b.bsa,
    vo2,
    o2er,
    scvo2,
    lactate,
    shockIndex,
    sipaThreshold: sipa,
    sipaPositive: sipa !== null && shockIndex > sipa,
    phoenixCV: phoenixCardiovascular({ ageMonths: b.ageMonths, vasoactiveCount: vasoactiveCount(s.drugs), lactate, map: c.map }),
    hypotensive,
    mapBelowP5,
    profile,
    warmCold,
    contractilityEff: c.contr,
    svrMult: c.svrMult,
  };
}

/** Points for drawing the Guyton diagram (cardiac-function and venous-return curves). */
export function guytonCurves(b: Baseline, s: HemoState) {
  const c = solveCirculation(b, s);
  const pts: { rap: number; cardiac: number | null; venous: number | null }[] = [];
  for (let rap = -2; rap <= 24; rap += 0.5) {
    const ci = heartOutput(b, rap, c.hr, c.contr, c.svrMult, c.pit, s.pext, c.pressureLoad).co / b.bsa;
    const vr = venousReturn(b, rap, c.pmsf) / b.bsa;
    pts.push({ rap, cardiac: round(ci, 2), venous: rap <= c.pmsf ? round(vr, 2) : null });
  }
  return { points: pts, operating: { rap: round(c.rap, 2), ci: round(c.co / b.bsa, 2) }, pmsf: c.pmsf };
}

// ---------------------------------------------------------------------------
// Scenarios & interventions
// ---------------------------------------------------------------------------

export interface Scenario {
  id: string;
  label: string;
  defaultAgeMonths: number;
  story: string;
  teaching: string;
  state: Omit<HemoState, 'hb' | 'drugs' | 'cumulativeFluidPerKg' | 'minutes'> & { hb?: number };
}

const base = {
  contractility: 1,
  svrFactor: 1,
  vsPerKg: 22.5,
  pext: 0,
  tempC: 37,
  leak: 0.2,
  ongoingLossPerKg: 0,
  sympathetic: 0,
  inflammatoryLactate: 0,
  ventilated: false,
  peep: 5,
  sao2: 0.98,
};

export const SCENARIOS: Scenario[] = [
  {
    id: 'healthy',
    label: 'Healthy baseline',
    defaultAgeMonths: 24,
    story: 'A well child. Use this to see how each drug and maneuver moves the curves.',
    teaching: 'Normal children sit on the steep-to-flat transition of the Starling curve: a bolus raises CVP more than stroke volume.',
    state: { ...base },
  },
  {
    id: 'hypovolemic',
    label: 'Hypovolemic (gastroenteritis)',
    defaultAgeMonths: 14,
    story: '14-month-old, 3 days of diarrhea and vomiting, sunken eyes, cool peripheries.',
    teaching: 'Blood pressure is preserved by tachycardia and vasoconstriction until late. Each 20 mL/kg bolus should produce a clear SV/HR response.',
    state: { ...base, vsPerKg: 12.5, svrFactor: 1.25, sympathetic: 0.25, tempC: 37.6, leak: 0.15, ongoingLossPerKg: 1 },
  },
  {
    id: 'septic-cold',
    label: 'Septic shock – "cold"',
    defaultAgeMonths: 8,
    story: '8-month-old, fever, mottled, CRT 4–5 s, lethargic. Typical infant/community-acquired pattern.',
    teaching: 'Low output + high SVR. Fluids help early; with poor contractility the curve flattens fast. Epinephrine is the logical next step.',
    state: { ...base, contractility: 0.62, svrFactor: 1.35, vsPerKg: 16, leak: 0.55, sympathetic: 0.12, tempC: 39.2, inflammatoryLactate: 1.0, ongoingLossPerKg: 2.5 },
  },
  {
    id: 'septic-warm',
    label: 'Septic shock – "warm"',
    defaultAgeMonths: 168,
    story: '14-year-old with toxic shock. Flushed, bounding pulses, flash CRT, low diastolic pressure.',
    teaching: 'Vasoplegia: high CO, low SVR, low diastolic BP. Norepinephrine (± vasopressin) restores tone; more fluid mainly leaks.',
    state: { ...base, contractility: 0.9, svrFactor: 0.5, vsPerKg: 18, leak: 0.55, sympathetic: 0.25, tempC: 39.6, inflammatoryLactate: 1.5, ongoingLossPerKg: 2.5 },
  },
  {
    id: 'cardiogenic',
    label: 'Cardiogenic (myocarditis)',
    defaultAgeMonths: 48,
    story: '4-year-old with a viral prodrome, tachypnea, gallop, hepatomegaly. Labelled "bronchiolitis/asthma" twice.',
    teaching: 'Already on the flat part of the curve: fluid raises CVP and lung water without output. Inodilators and afterload reduction help; pure vasoconstrictors hurt.',
    state: { ...base, contractility: 0.36, svrFactor: 1.15, vsPerKg: 26, leak: 0.2, sympathetic: 0.1, tempC: 37.4 },
  },
  {
    id: 'obstructive',
    label: 'Obstructive (tamponade / tension)',
    defaultAgeMonths: 96,
    story: '8-year-old after cardiac surgery, rising CVP, narrow pulse pressure, falling output.',
    teaching: 'External pressure shifts the cardiac curve right. Fluid buys minutes; only decompression fixes it.',
    state: { ...base, pext: 11, svrFactor: 1.05, vsPerKg: 31, sympathetic: 0.12 },
  },
  {
    id: 'anaphylaxis',
    label: 'Anaphylaxis',
    defaultAgeMonths: 72,
    story: '6-year-old, peanut exposure, urticaria, wheeze, collapse.',
    teaching: 'Massive vasodilation and leak. IM epinephrine first; refractory cases need an epinephrine infusion and large volumes.',
    state: { ...base, contractility: 0.95, svrFactor: 0.5, vsPerKg: 14, leak: 0.6, sympathetic: 0.15, ongoingLossPerKg: 3 },
  },
  {
    id: 'hemorrhagic',
    label: 'Hemorrhagic (trauma)',
    defaultAgeMonths: 120,
    story: '10-year-old pedestrian struck, splenic injury, ongoing bleeding.',
    teaching: 'Crystalloid dilutes hemoglobin and clotting factors; give blood early (balanced products, TXA) and control the source.',
    state: { ...base, vsPerKg: 10.5, hb: 7.5, svrFactor: 1.05, sympathetic: 0.3, leak: 0.15, ongoingLossPerKg: 3 },
  },
  {
    id: 'septic-mixed',
    label: 'Septic shock – late, mixed',
    defaultAgeMonths: 60,
    story: '5-year-old on day 2 of meningococcal sepsis: cool, low diastolic pressure, rising lactate despite epinephrine.',
    teaching: 'Myocardial depression AND vasoplegia: one drug rarely fixes both. Combine inotropy (epinephrine/milrinone once BP allows) with tone (norepinephrine ± vasopressin); refractory → consider VA-ECMO.',
    state: { ...base, contractility: 0.5, svrFactor: 0.6, vsPerKg: 16, leak: 0.6, sympathetic: 0.2, tempC: 39, inflammatoryLactate: 2, ongoingLossPerKg: 2.5 },
  },
  {
    id: 'neurogenic',
    label: 'Neurogenic (cervical cord injury)',
    defaultAgeMonths: 84,
    story: '7-year-old after a diving injury with C4 cord injury: hypotensive, warm, pink – and not tachycardic.',
    teaching: 'Loss of sympathetic outflow: vasodilation with bradycardia and a blunted baroreflex. Modest fluid, then norepinephrine (α + β1) to restore tone and spinal cord perfusion; atropine or pacing for symptomatic bradycardia.',
    state: { ...base, svrFactor: 0.68, vsPerKg: 18, sympathetic: -0.3, reflexGain: 0.15, contractility: 0.9 },
  },
  {
    id: 'adrenal',
    label: 'Adrenal crisis (salt-wasting CAH)',
    defaultAgeMonths: 0.75,
    story: '3-week-old boy with vomiting, weight loss, Na 122, K 7.4, glucose 40 – shocked and not responding to pressors.',
    teaching: 'Glucocorticoid deficiency causes hypovolemia, vasoplegia and catecholamine resistance: vasoactives barely move the BP until hydrocortisone (50–100 mg/m²) is given. Also treat hypoglycemia and hyperkalemia.',
    state: { ...base, vsPerKg: 13, svrFactor: 0.65, drugGain: 0.3, contractility: 0.8, sympathetic: 0.15, leak: 0.2 },
  },
  {
    id: 'svt',
    label: 'Tachyarrhythmia (SVT 290/min)',
    defaultAgeMonths: 1.5,
    story: '6-week-old with SVT for ~24 h: gray, sweaty, hepatomegaly.',
    teaching: 'At extreme rates diastolic filling collapses, so stroke volume falls faster than rate rises, and hours of tachycardia depress contractility. Fluid adds congestion; terminating the rhythm restores output.',
    state: { ...base, fixedHr: 290, contractility: 0.65, vsPerKg: 24, sympathetic: 0.1 },
  },
  {
    id: 'heart-block',
    label: 'Complete heart block (HR 38)',
    defaultAgeMonths: 120,
    story: '10-year-old after VSD closure with post-operative complete heart block and a junctional escape of 38/min.',
    teaching: 'Output is rate-limited: stroke volume is already near maximal, so fluid adds little and chronotropes cannot reliably raise a fixed escape rhythm. Pacing restores cardiac output.',
    state: { ...base, fixedHr: 38, contractility: 0.9, vsPerKg: 25, sympathetic: 0.1 },
  },
  {
    id: 'lcos',
    label: 'Low output after cardiac bypass',
    defaultAgeMonths: 4,
    story: '4-month-old 8 h after complete AV canal repair, ventilated: cool, oliguric, lactate rising.',
    teaching: 'Post-bypass myocardial dysfunction with high SVR. Milrinone (inodilator) raises output and lowers SVR; pure vasoconstrictors raise BP but cut flow. PEEP unloads the LV but can limit RV filling.',
    state: { ...base, contractility: 0.5, svrFactor: 1.3, vsPerKg: 22, tempC: 37.8, sympathetic: 0.15, ventilated: true, peep: 5 },
  },
];

export function scenarioState(sc: Scenario, b: Baseline): HemoState {
  return {
    ...sc.state,
    hb: sc.state.hb ?? normalHb(b.ageMonths),
    drugs: { ...NO_DRUGS },
    cumulativeFluidPerKg: 0,
    minutes: 0,
  };
}

export type FluidType = 'crystalloid' | 'albumin' | 'prbc';

export function giveFluid(b: Baseline, s: HemoState, mlPerKg: number, type: FluidType): HemoState {
  const baseRetention = type === 'prbc' ? 0.9 : type === 'albumin' ? 0.75 - 0.3 * s.leak : 0.6 * (1 - s.leak);
  // higher venous/capillary pressure → more filtration out of the vessels (and renal excretion)
  const congestion = 1 / (1 + Math.max(0, s.vsPerKg - 25) / 12);
  const retained = mlPerKg * baseRetention * congestion;
  let hb = s.hb;
  if (type === 'prbc') {
    // PRBC Hct ≈ 0.6 (Hb ≈ 20 g/dL): mixing calculation
    hb = (s.hb * b.bvPerKg + 20 * retained) / (b.bvPerKg + retained);
  } else {
    hb = (s.hb * b.bvPerKg) / (b.bvPerKg + retained);
  }
  return {
    ...s,
    vsPerKg: Math.min(50, s.vsPerKg + retained),
    hb: round(hb, 1),
    cumulativeFluidPerKg: s.cumulativeFluidPerKg + mlPerKg,
  };
}

export function passTime(s: HemoState, minutes = 30): HemoState {
  const f = minutes / 30;
  const leakLoss = s.leak > 0.3 ? Math.max(0, s.vsPerKg - 14) * 0.12 * f : 0;
  return {
    ...s,
    vsPerKg: Math.max(4, s.vsPerKg - s.ongoingLossPerKg * f - leakLoss),
    inflammatoryLactate: s.inflammatoryLactate,
    minutes: s.minutes + minutes,
  };
}

export type InductionAgent = 'ketamine' | 'propofol' | 'etomidate' | 'midazolam-fentanyl';

/** Intubation: induction agent vasodilation + loss of sympathetic drive + positive-pressure ventilation. */
export function intubate(s: HemoState, agent: InductionAgent): HemoState {
  const effect = {
    ketamine: { svr: 0.97, vs: -0.5, contr: 0.97 },
    etomidate: { svr: 0.95, vs: -1, contr: 1 },
    'midazolam-fentanyl': { svr: 0.85, vs: -2, contr: 0.95 },
    propofol: { svr: 0.75, vs: -3, contr: 0.85 },
  }[agent];
  return {
    ...s,
    ventilated: true,
    peep: Math.max(s.peep, 5),
    svrFactor: s.svrFactor * effect.svr,
    contractility: s.contractility * effect.contr,
    vsPerKg: Math.max(4, s.vsPerKg + effect.vs),
    sympathetic: s.sympathetic * 0.6,
  };
}

export function decompress(s: HemoState): HemoState {
  return { ...s, pext: 0 };
}

/** Synchronized cardioversion (fixed tachyarrhythmia → sinus) or pacing (fixed bradycardia → paced at a normal rate). */
export function treatRhythm(b: Baseline, s: HemoState): HemoState {
  if (!s.fixedHr) return s;
  return s.fixedHr > b.hr0 ? { ...s, fixedHr: null } : { ...s, fixedHr: b.hr0 };
}

/** Stress-dose hydrocortisone: restores catecholamine responsiveness and part of vascular tone. */
export function giveHydrocortisone(s: HemoState): HemoState {
  return { ...s, drugGain: 1, svrFactor: s.svrFactor + (1 - Math.min(1, s.svrFactor)) * 0.5, steroidGiven: true };
}

export const DRUG_META: Record<keyof Drugs, { label: string; unit: string; max: number; step: number; usual: string; action: string }> = {
  epinephrine: {
    label: 'Epinephrine',
    unit: 'mcg/kg/min',
    max: 1,
    step: 0.01,
    usual: '0.02–0.3',
    action: 'β1 inotropy/chronotropy at low dose; α1 vasoconstriction above ~0.3. Raises lactate (β2).',
  },
  norepinephrine: {
    label: 'Norepinephrine',
    unit: 'mcg/kg/min',
    max: 1,
    step: 0.01,
    usual: '0.02–0.3',
    action: 'α1 vasoconstriction (arterial and venous) with modest β1 support.',
  },
  dopamine: {
    label: 'Dopamine',
    unit: 'mcg/kg/min',
    max: 20,
    step: 0.5,
    usual: '5–10',
    action: 'Dose-dependent β then α effects; arrhythmogenic. Not preferred when epinephrine/norepinephrine are available.',
  },
  dobutamine: {
    label: 'Dobutamine',
    unit: 'mcg/kg/min',
    max: 20,
    step: 0.5,
    usual: '5–10',
    action: 'β1 inotropy with β2 vasodilation; can drop BP and raise HR.',
  },
  milrinone: {
    label: 'Milrinone',
    unit: 'mcg/kg/min',
    max: 1,
    step: 0.05,
    usual: '0.25–0.75',
    action: 'PDE-3 inodilator: ↑contractility, ↓SVR/PVR, lusitropy. Renally cleared – accumulates in AKI.',
  },
  vasopressin: {
    label: 'Vasopressin',
    unit: 'milliunits/kg/min',
    max: 2,
    step: 0.1,
    usual: '0.3–2',
    action: 'V1 vasoconstriction independent of catecholamine receptors; no inotropy.',
  },
};
