/**
 * Gas exchange and pediatric mechanical ventilation model.
 * Equations: alveolar gas equation, alveolar ventilation equation (PaCO2 = 0.863·VCO2/VA),
 * Severinghaus O2 dissociation curve, venous-admixture (shunt) equation,
 * single-compartment R–C lung with exponential exhalation (auto-PEEP).
 * Targets: PALICC-2 (Pediatr Crit Care Med 2023).
 */
import { clamp, round } from '@/lib/utils';
import { bsa, vo2PerKg } from './peds';

export const P_ATM = 760;
export const P_H2O = 47;

/** Simplified alveolar gas equation (mmHg). */
export function alveolarPO2(fio2: number, paco2: number, rq = 0.8, patm = P_ATM): number {
  return Math.max(0, fio2 * (patm - P_H2O) - paco2 / rq);
}

/** Severinghaus (1979) O2 dissociation curve, standard conditions. Returns saturation 0–1. */
export function satFromPO2(po2: number): number {
  if (po2 <= 0) return 0;
  return 1 / (1 + 23400 / (po2 ** 3 + 150 * po2));
}

export function po2FromSat(sat: number): number {
  const s = clamp(sat, 0.01, 0.9999);
  let lo = 1;
  let hi = 700;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (satFromPO2(mid) < s) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** O2 content (mL O2/dL) */
export function o2Content(hb: number, sat: number, po2: number): number {
  return 1.34 * hb * sat + 0.003 * po2;
}

/** Inverse of o2Content: find PO2 for a given content. */
export function po2FromContent(hb: number, content: number): number {
  let lo = 0.5;
  let hi = 1500;
  for (let i = 0; i < 70; i++) {
    const mid = (lo + hi) / 2;
    if (o2Content(hb, satFromPO2(mid), mid) < content) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function oxygenationIndex(mpaw: number, fio2: number, pao2: number): number {
  return (mpaw * fio2 * 100) / pao2;
}

/** OSI is only valid when SpO2 ≤97% */
export function oxygenSaturationIndex(mpaw: number, fio2: number, spo2: number): number {
  return (mpaw * fio2 * 100) / spo2;
}

export const pfRatio = (pao2: number, fio2: number) => pao2 / fio2;
export const sfRatio = (spo2: number, fio2: number) => spo2 / fio2;

/** Henderson–Hasselbalch (pK 6.1, CO2 solubility 0.0307 mmol/L/mmHg). */
export function phFrom(hco3: number, paco2: number): number {
  return 6.1 + Math.log10(hco3 / (0.0307 * paco2));
}
export function hco3From(ph: number, paco2: number): number {
  return 0.0307 * paco2 * 10 ** (ph - 6.1);
}

export type PardsCategory = 'none' | 'at-risk' | 'possible' | 'mild-moderate' | 'severe';

/**
 * PALICC-2 oxygenation stratification.
 * Invasive: OI ≥4 or OSI ≥5 = PARDS; severe if OI ≥16 or OSI ≥12.
 * NIV (full-face, CPAP ≥5): P/F ≤300 or S/F ≤250; severe if P/F ≤100 or S/F ≤150.
 * (Imaging, timing within 7 days and non-cardiac origin must also be satisfied.)
 */
export function pardsSeverity(args: {
  support: 'invasive' | 'niv' | 'hfnc-or-nasal' | 'oxygen' | 'none';
  oi?: number | null;
  osi?: number | null;
  pf?: number | null;
  sf?: number | null;
}): { category: PardsCategory; basis: string } {
  const { support, oi, osi, pf, sf } = args;
  const n = (v: number | null | undefined): v is number => typeof v === 'number' && Number.isFinite(v);
  if (support === 'invasive') {
    if ((n(oi) && oi >= 16) || (n(osi) && osi >= 12)) return { category: 'severe', basis: 'OI ≥16 or OSI ≥12' };
    if ((n(oi) && oi >= 4) || (n(osi) && osi >= 5)) return { category: 'mild-moderate', basis: 'OI 4–<16 or OSI 5–<12' };
    return { category: 'at-risk', basis: 'Invasive ventilation with OI <4 / OSI <5' };
  }
  if (support === 'niv') {
    if ((n(pf) && pf <= 100) || (n(sf) && sf <= 150)) return { category: 'severe', basis: 'NIV: P/F ≤100 or S/F ≤150' };
    if ((n(pf) && pf <= 300) || (n(sf) && sf <= 250)) return { category: 'mild-moderate', basis: 'NIV: P/F ≤300 or S/F ≤250' };
    return { category: 'at-risk', basis: 'NIV without qualifying hypoxemia' };
  }
  if (support === 'hfnc-or-nasal') {
    if ((n(pf) && pf <= 300) || (n(sf) && sf <= 250)) return { category: 'possible', basis: 'Nasal NIV or HFNC ≥1.5 L/kg/min (or ≥30 L/min) with P/F ≤300 or S/F ≤250' };
    return { category: 'at-risk', basis: 'Supplemental O2 / HFNC without qualifying hypoxemia' };
  }
  if (support === 'oxygen') return { category: 'at-risk', basis: 'Needs O2 to keep SpO₂ ≥88%' };
  return { category: 'none', basis: 'No respiratory support' };
}

/** ARDS Network lower-PEEP / higher-FiO2 table: minimum PEEP for a given FiO2 (PALICC-2 strong rec: stay at or above). */
export function ardsnetMinPeep(fio2: number): number {
  if (fio2 <= 0.3) return 5;
  if (fio2 <= 0.4) return 5;
  if (fio2 <= 0.5) return 8;
  if (fio2 <= 0.6) return 10;
  if (fio2 <= 0.7) return 10;
  if (fio2 <= 0.8) return 14;
  if (fio2 <= 0.9) return 14;
  return 18;
}

export const ARDSNET_LOW_PEEP_TABLE: Array<[number, string]> = [
  [0.3, '5'],
  [0.4, '5–8'],
  [0.5, '8–10'],
  [0.6, '10'],
  [0.7, '10–14'],
  [0.8, '14'],
  [0.9, '14–18'],
  [1.0, '18–24'],
];

// ---------------------------------------------------------------------------
// Ventilator simulation
// ---------------------------------------------------------------------------

export interface LungPreset {
  id: string;
  label: string;
  summary: string;
  /** respiratory-system compliance per kg (mL/cmH2O/kg); healthy ≈1 */
  cPerKg: number;
  /** multiplier on intrinsic airway resistance */
  rawMultiplier: number;
  /** true shunt fraction at low PEEP */
  shunt: number;
  /** low-V/Q admixture that responds to FiO2 */
  vq: number;
  /** fraction of shunt / collapsed lung that PEEP can recruit */
  recruitability: number;
  /** PEEP (cmH2O) at which ~63% of recruitable lung is open */
  peepOpt: number;
  /** alveolar dead-space fraction */
  vdAlv: number;
  /** pressure above which compliance falls (upper inflection) */
  overdistP: number;
  /** tidal-volume target range (mL/kg PBW); PALICC-2 default 6–8 */
  vtRange?: [number, number];
  /** plateau-pressure limit (cmH₂O); PALICC-2 default 28, 29–32 with stiff chest wall */
  pplatLimit?: number;
  /** strategy note shown in the lab */
  strategy?: string;
}

export const LUNG_PRESETS: LungPreset[] = [
  {
    id: 'normal',
    label: 'Healthy lungs',
    summary: 'Post-op / airway protection. Normal compliance, minimal shunt.',
    cPerKg: 1.0,
    rawMultiplier: 1,
    shunt: 0.03,
    vq: 0.03,
    recruitability: 0,
    peepOpt: 5,
    vdAlv: 0.05,
    overdistP: 30,
  },
  {
    id: 'pards-recruitable',
    label: 'Severe PARDS – recruitable',
    summary: 'Diffuse alveolar collapse/edema. Big shunt that responds to PEEP; low compliance.',
    cPerKg: 0.4,
    rawMultiplier: 1.3,
    shunt: 0.55,
    vq: 0.05,
    recruitability: 0.7,
    peepOpt: 10,
    vdAlv: 0.15,
    overdistP: 28,
  },
  {
    id: 'pards-poor',
    label: 'PARDS – poorly recruitable',
    summary: 'Consolidated lobar pneumonia. PEEP mainly overdistends healthy lung.',
    cPerKg: 0.5,
    rawMultiplier: 1.3,
    shunt: 0.35,
    vq: 0.05,
    recruitability: 0.15,
    peepOpt: 12,
    vdAlv: 0.12,
    overdistP: 26,
  },
  {
    id: 'asthma',
    label: 'Status asthmaticus',
    summary: 'Very high resistance, long time constant → gas trapping and auto-PEEP.',
    cPerKg: 0.8,
    rawMultiplier: 12,
    shunt: 0.04,
    vq: 0.15,
    recruitability: 0.05,
    peepOpt: 5,
    vdAlv: 0.25,
    overdistP: 30,
  },
  {
    id: 'bronchiolitis',
    label: 'Bronchiolitis',
    summary: 'Small-airway obstruction plus atelectasis: mixed V/Q mismatch and shunt.',
    cPerKg: 0.6,
    rawMultiplier: 3,
    shunt: 0.12,
    vq: 0.15,
    recruitability: 0.45,
    peepOpt: 7,
    vdAlv: 0.15,
    overdistP: 28,
  },
  {
    id: 'chest-wall',
    label: 'Stiff chest wall (obesity / abdominal distension)',
    summary: 'Normal-ish lungs behind a heavy chest wall and high abdominal pressure; dependent atelectasis.',
    cPerKg: 0.55,
    rawMultiplier: 1.2,
    shunt: 0.15,
    vq: 0.05,
    recruitability: 0.6,
    peepOpt: 9,
    vdAlv: 0.08,
    overdistP: 34,
    pplatLimit: 32,
    strategy:
      'Part of each breath distends the chest wall, not the lung, so Pplat 29–32 cmH₂O is acceptable (PALICC-2). Size Vt to predicted – not actual – weight; higher PEEP reopens dependent atelectasis. Treat the cause (abdominal decompression, reverse Trendelenburg).',
  },
  {
    id: 'cardiogenic-edema',
    label: 'Cardiogenic pulmonary edema',
    summary: 'Alveolar flooding from a failing left ventricle (myocarditis, cardiomyopathy).',
    cPerKg: 0.6,
    rawMultiplier: 1.5,
    shunt: 0.3,
    vq: 0.08,
    recruitability: 0.85,
    peepOpt: 7,
    vdAlv: 0.08,
    overdistP: 30,
    strategy: 'Edema-filled alveoli reopen with PEEP, and positive intrathoracic pressure lowers LV afterload. Pair moderate PEEP with diuresis and inotropic support; watch preload in the hypovolemic.',
  },
  {
    id: 'bpd',
    label: 'Established BPD (ex-preterm infant)',
    summary: 'Heterogeneous lung: fibrotic and hyperinflated regions, high resistance and dead space, often tracheobronchomalacia.',
    cPerKg: 0.5,
    rawMultiplier: 7,
    shunt: 0.1,
    vq: 0.25,
    recruitability: 0.2,
    peepOpt: 7,
    vdAlv: 0.35,
    overdistP: 30,
    vtRange: [8, 12],
    strategy:
      'Long time constants and high dead space: severe established BPD is often ventilated with larger tidal volumes (≈10–12 mL/kg), slower rates and longer inspiratory times; PARDS volume limits were not designed for it. PEEP supports malacic airways. Accept higher PaCO₂ with a compensated pH.',
  },
];

export interface VentScenario {
  id: string;
  label: string;
  goal: string;
  ageMonths: number;
  weightKg: number;
  lungId: string;
  ettId?: number;
  deadSpaceMl?: number;
  settings: VentSettings;
}

export const VENT_SCENARIOS: VentScenario[] = [
  {
    id: 'pards-injurious',
    label: 'Influenza PARDS on injurious settings',
    goal: 'Bring Vt to 6–8 mL/kg PBW, PEEP onto the ARDSnet table, Pplat ≤28 and ΔP ≤15, then accept SpO₂ 88–92% and pH ≥7.20.',
    ageMonths: 36,
    weightKg: 14,
    lungId: 'pards-recruitable',
    settings: { mode: 'VC', vtMlPerKg: 10, pInsp: 18, rr: 24, peep: 5, fio2: 0.8, ti: 0.65 },
  },
  {
    id: 'pards-overdistended',
    label: 'Consolidated lung, PEEP too high',
    goal: 'PEEP 16 in a poorly recruitable lung buys almost no oxygen: step down to the ARDSnet minimum (10 at FiO₂ 0.6) and watch plateau pressure, OI and venous return improve.',
    ageMonths: 120,
    weightKg: 31,
    lungId: 'pards-poor',
    settings: { mode: 'VC', vtMlPerKg: 7, pInsp: 18, rr: 22, peep: 16, fio2: 0.6, ti: 0.8 },
  },
  {
    id: 'asthma-fast',
    label: 'Status asthmaticus bagged too fast',
    goal: 'Gas trapping: lower the rate and shorten Ti until expiratory flow reaches zero (Te ≥3–5 τ); accept hypercapnia.',
    ageMonths: 144,
    weightKg: 40,
    lungId: 'asthma',
    settings: { mode: 'VC', vtMlPerKg: 8, pInsp: 20, rr: 30, peep: 5, fio2: 0.5, ti: 0.9 },
  },
  {
    id: 'bronchiolitis-infant',
    label: 'Ventilated bronchiolitis (2 months)',
    goal: 'A fast rate in obstructed small airways traps gas and over-ventilates: slow the rate until Te ≥3 τ and add modest PEEP (6–8) – auto-PEEP falls, compliance improves and the alkalosis resolves.',
    ageMonths: 2,
    weightKg: 5,
    lungId: 'bronchiolitis',
    settings: { mode: 'VC', vtMlPerKg: 8, pInsp: 18, rr: 50, peep: 3, fio2: 0.3, ti: 0.55 },
  },
  {
    id: 'neonate-hme',
    label: 'Neonate with a pediatric HME and extra connectors',
    goal: 'PaCO₂ is high despite a reasonable rate and Vt: cut equipment dead space to ~2 mL (neonatal HME or active humidification, no extra elbows).',
    ageMonths: 0.5,
    weightKg: 3.5,
    lungId: 'normal',
    ettId: 3,
    deadSpaceMl: 12,
    settings: { mode: 'VC', vtMlPerKg: 7, pInsp: 15, rr: 40, peep: 5, fio2: 0.3, ti: 0.4 },
  },
  {
    id: 'obese-teen',
    label: 'Obese adolescent, Vt by actual weight',
    goal: 'Vt was set on 95 kg actual weight: re-size to predicted weight (6–8 mL/kg), raise the rate to hold pH ≥7.20, raise PEEP for atelectasis; Pplat up to 32 is acceptable.',
    ageMonths: 168,
    weightKg: 95,
    lungId: 'chest-wall',
    settings: { mode: 'VC', vtMlPerKg: 13, pInsp: 20, rr: 18, peep: 5, fio2: 0.6, ti: 0.9 },
  },
  {
    id: 'cardiogenic',
    label: 'Myocarditis with pulmonary edema',
    goal: 'Raise PEEP to 8–10: shunt falls fast because edema is recruitable.',
    ageMonths: 48,
    weightKg: 16,
    lungId: 'cardiogenic-edema',
    settings: { mode: 'VC', vtMlPerKg: 7, pInsp: 18, rr: 26, peep: 4, fio2: 0.5, ti: 0.7 },
  },
  {
    id: 'bpd-infant',
    label: 'Severe BPD on "PARDS" settings',
    goal: 'Small fast breaths trap gas and waste dead space: try Vt 10–12 mL/kg, rate ~20, Ti 0.6–0.7 s, PEEP 7–8.',
    ageMonths: 8,
    weightKg: 6,
    lungId: 'bpd',
    settings: { mode: 'VC', vtMlPerKg: 6, pInsp: 20, rr: 40, peep: 5, fio2: 0.5, ti: 0.4 },
  },
];

export interface VentPatient {
  weightKg: number; // actual
  heightCm: number;
  ageMonths: number;
  pbwKg: number; // lesser of predicted and actual
  hb: number;
  hco3: number; // metabolic baseline
  tempC: number;
  ettId: number;
  equipmentDeadSpaceMl: number;
  /** cardiac index multiplier vs normal (from hemodynamics) */
  ciFactor?: number;
}

export interface VentSettings {
  mode: 'VC' | 'PC';
  vtMlPerKg: number; // used in VC (per PBW)
  pInsp: number; // above PEEP, used in PC
  rr: number;
  peep: number;
  fio2: number;
  ti: number; // s
}

export interface VentResult {
  vtMl: number;
  vtPerKg: number;
  ppeak: number;
  pplat: number;
  drivingPressure: number;
  autoPeep: number;
  totalPeep: number;
  mpaw: number;
  complianceMl: number;
  compliancePerKg: number;
  resistance: number;
  tau: number;
  te: number;
  teOverTau: number;
  minuteVentL: number;
  alveolarVentL: number;
  vdvt: number;
  paco2: number;
  etco2: number;
  ph: number;
  pao2Alv: number;
  pao2: number;
  spo2: number;
  pf: number;
  sf: number | null;
  oi: number;
  osi: number | null;
  shuntFraction: number;
  aaGradient: number;
  coFactor: number;
  recruited: number;
  overdistended: boolean;
  overdistP: number;
}

const ODC_UPPER_SLOPE = 0.35;

const totalPeepFor = (peep: number, auto: number) => peep + auto;

function intrinsicResistance(weightKg: number): number {
  return 12 * (Math.max(weightKg, 2) / 3.5) ** -0.6;
}

/** Endotracheal tube resistance (cmH2O/L/s) – rises steeply as the tube narrows (≈ r^-3.5 at clinical flows). */
export function ettResistance(idMm: number): number {
  return 50 * (3 / idMm) ** 3.5;
}

function volumeAtPressure(pEnd: number, peepTot: number, c: number, odP: number): number {
  const below = Math.max(0, Math.min(pEnd, odP) - peepTot);
  const above = Math.max(0, pEnd - Math.max(odP, peepTot));
  return c * below + ODC_UPPER_SLOPE * c * above;
}

function pressureForVolume(v: number, peepTot: number, c: number, odP: number): number {
  const v1 = Math.max(0, c * (odP - peepTot));
  if (v <= v1) return peepTot + v / c;
  return Math.max(odP, peepTot) + (v - v1) / (ODC_UPPER_SLOPE * c);
}

export function simulateVentilator(p: VentPatient, s: VentSettings, lung: LungPreset): VentResult {
  const W = p.pbwKg;
  const recruitedFrac = lung.recruitability * (1 - Math.exp(-Math.max(0, s.peep - 4) / Math.max(1, lung.peepOpt - 4)));
  const C = lung.cPerKg * W * (1 + 1.2 * recruitedFrac); // mL/cmH2O
  const R = intrinsicResistance(p.weightKg) * lung.rawMultiplier + ettResistance(p.ettId); // cmH2O/L/s
  const tau = R * (C / 1000); // s
  const ttot = 60 / s.rr;
  const ti = Math.min(s.ti, ttot * 0.8);
  const te = ttot - ti;
  const x = Math.exp(-te / tau);

  let vt: number;
  let autoPeep = 0;
  let ppeak: number;
  let pplat: number;

  if (s.mode === 'VC') {
    vt = s.vtMlPerKg * W;
    const vtrap = (vt * x) / (1 - x);
    autoPeep = vtrap / C;
    const peepTot = s.peep + autoPeep;
    pplat = pressureForVolume(vt, peepTot, C, lung.overdistP);
    const flowLs = vt / 1000 / ti;
    ppeak = pplat + R * flowLs;
  } else {
    const pip = s.peep + s.pInsp;
    const eq = 1 - Math.exp(-ti / tau);
    vt = 0;
    for (let i = 0; i < 60; i++) {
      const peepTot = s.peep + autoPeep;
      vt = volumeAtPressure(pip, peepTot, C, lung.overdistP) * eq;
      const vtrap = (vt * x) / (1 - x);
      autoPeep = 0.5 * autoPeep + 0.5 * (vtrap / C);
    }
    const peepTotFinal = s.peep + autoPeep;
    vt = volumeAtPressure(pip, peepTotFinal, C, lung.overdistP) * eq;
    ppeak = pip;
    pplat = Math.min(pip, pressureForVolume(vt, peepTotFinal, C, lung.overdistP));
  }

  const totalPeep = s.peep + autoPeep;
  const drivingPressure = pplat - totalPeep;
  // time-weighted airway pressure: VC ramps from (PEEP+resistive) to peak; PC is ~square
  const meanInsp = s.mode === 'PC' ? ppeak : ppeak - 0.5 * (pplat - totalPeepFor(s.peep, autoPeep));
  const mpaw = (meanInsp * ti + s.peep * te) / ttot;
  const overdistended = pplat > lung.overdistP;

  // Dead space
  const vdAnat = 1.5 * p.weightKg; // intubated: upper airway bypassed
  const vdSerial = vdAnat + p.equipmentDeadSpaceMl;
  // overdistension and dynamic hyperinflation both add alveolar dead space
  const vdAlvFrac = clamp(lung.vdAlv + 0.015 * Math.max(0, pplat - lung.overdistP) + 0.02 * autoPeep, 0, 0.8);
  const alvTidal = Math.max(0, vt - vdSerial);
  const vdTotal = vdSerial + vdAlvFrac * alvTidal;
  const vdvt = clamp(vdTotal / Math.max(vt, 1), 0, 1);
  const va = (Math.max(0, vt - vdTotal) * s.rr) / 1000; // L/min
  const ve = (vt * s.rr) / 1000;

  const tempFactor = 1 + 0.1 * (p.tempC - 37);
  const vo2 = vo2PerKg(p.ageMonths) * p.weightKg * tempFactor; // mL/min
  const vco2 = 0.8 * vo2;
  const paco2 = clamp((0.863 * vco2) / Math.max(va, 0.01), 15, 200);
  const etco2 = clamp(paco2 * (1 - vdAlvFrac), 5, 200);
  const hco3 = p.hco3 + 0.1 * (paco2 - 40);
  const ph = phFrom(hco3, paco2);

  // Hemodynamic penalty from intrathoracic pressure
  const transmission = clamp(0.5 * (C / W), 0.2, 0.6);
  const coFactor = clamp(1 - 0.02 * Math.max(0, mpaw * transmission - 3), 0.55, 1);
  const co = 4.0 * bsa(p.weightKg, p.heightCm) * (p.ciFactor ?? 1) * coFactor; // L/min

  // Oxygenation
  const pAO2 = alveolarPO2(s.fio2, paco2);
  const shunt = clamp(lung.shunt * (1 - recruitedFrac) + 0.01 * Math.max(0, pplat - lung.overdistP), 0, 0.9);
  const vqAdmix = lung.vq * Math.exp(-(s.fio2 - 0.21) * 6);
  const qs = clamp(shunt + vqAdmix, 0, 0.92);
  const ccO2 = o2Content(p.hb, satFromPO2(pAO2), pAO2);
  const avDiff = vo2 / (co * 10); // mL/dL
  const caO2 = Math.max(1, ccO2 - (qs / (1 - qs)) * avDiff);
  const pao2 = clamp(po2FromContent(p.hb, caO2), 15, 680);
  const sao2 = satFromPO2(pao2);
  const spo2 = round(sao2 * 100, 0);
  const oi = oxygenationIndex(mpaw, s.fio2, pao2);
  const osi = spo2 <= 97 ? oxygenSaturationIndex(mpaw, s.fio2, spo2) : null;

  return {
    vtMl: vt,
    vtPerKg: vt / W,
    ppeak,
    pplat,
    drivingPressure,
    autoPeep,
    totalPeep,
    mpaw,
    complianceMl: C,
    compliancePerKg: C / W,
    resistance: R,
    tau,
    te,
    teOverTau: te / tau,
    minuteVentL: ve,
    alveolarVentL: va,
    vdvt,
    paco2,
    etco2,
    ph,
    pao2Alv: pAO2,
    pao2,
    spo2,
    pf: pao2 / s.fio2,
    sf: spo2 <= 97 ? spo2 / s.fio2 : null,
    oi,
    osi,
    shuntFraction: qs,
    aaGradient: pAO2 - pao2,
    coFactor,
    recruited: recruitedFrac,
    overdistended,
    overdistP: lung.overdistP,
  };
}

export type AlertLevel = 'ok' | 'info' | 'warn' | 'danger';
export interface VentAlert {
  level: AlertLevel;
  text: string;
}

export function ventAlerts(r: VentResult, s: VentSettings, lung: LungPreset, p: VentPatient): VentAlert[] {
  const a: VentAlert[] = [];
  const pards = lung.id.startsWith('pards');
  const [vtLo, vtHi] = lung.vtRange ?? [6, 8];
  const custom = lung.vtRange !== undefined;
  if (r.vtPerKg > vtHi)
    a.push({ level: 'warn', text: custom ? `Vt ${round(r.vtPerKg, 1)} mL/kg is above the ${vtLo}–${vtHi} mL/kg range used for this lung.` : `Vt ${round(r.vtPerKg, 1)} mL/kg: PALICC-2 suggests 6–8 mL/kg rather than >8.` });
  else if (r.vtPerKg < 4) a.push({ level: 'danger', text: 'Vt <4 mL/kg: use extreme caution (dead space dominates, CO₂ climbs).' });
  else if (r.vtPerKg < vtLo)
    a.push({ level: 'info', text: custom ? `Vt below ${vtLo} mL/kg: small breaths waste dead space in this lung.` : 'Vt <6 mL/kg is reasonable only when needed to respect Pplat/ΔP limits.' });
  const pLim = lung.pplatLimit ?? 28;
  if (r.pplat > pLim + 4) a.push({ level: 'danger', text: `Pplat ${round(r.pplat)} cmH₂O: far above the ${pLim} cmH₂O limit.` });
  else if (r.pplat > pLim)
    a.push({ level: 'warn', text: pLim === 28 ? `Pplat ${round(r.pplat)} cmH₂O >28 (29–32 acceptable only if chest-wall elastance is high).` : `Pplat ${round(r.pplat)} cmH₂O exceeds ${pLim} even allowing for the stiff chest wall.` });
  if (r.drivingPressure > 15)
    a.push(
      custom
        ? { level: 'info', text: `Driving pressure ${round(r.drivingPressure)} cmH₂O – PARDS limits are not validated here; watch for overdistension and air leak.` }
        : { level: 'warn', text: `Driving pressure ${round(r.drivingPressure)} cmH₂O >15.` },
    );
  if (pards && s.peep < ardsnetMinPeep(s.fio2))
    a.push({ level: 'warn', text: `PEEP ${s.peep} is below the ARDSnet low-PEEP/high-FiO₂ table (≥${ardsnetMinPeep(s.fio2)} at FiO₂ ${s.fio2}).` });
  if (r.spo2 > 97 && s.fio2 > 0.21) a.push({ level: 'info', text: 'SpO₂ >97%: wean FiO₂ (avoid prolonged hyperoxia).' });
  if (r.spo2 < 88) a.push({ level: 'danger', text: 'SpO₂ <88%: below the floor for any PARDS strategy.' });
  else if (r.spo2 < 92 && pards) a.push({ level: 'info', text: 'SpO₂ 88–92% is acceptable in severe PARDS once PEEP is optimised; monitor ScvO₂/lactate.' });
  if (r.ph < 7.2) a.push({ level: 'warn', text: `pH ${round(r.ph, 2)} <7.20: beyond permissive hypercapnia limit.` });
  else if (r.paco2 > 50 && r.ph >= 7.2)
    a.push({ level: 'info', text: 'Permissive hypercapnia (pH ≥7.20) – avoid with raised ICP, pulmonary hypertension, or ventricular dysfunction.' });
  if (r.autoPeep > 2) a.push({ level: 'warn', text: `Auto-PEEP ≈${round(r.autoPeep, 1)} cmH₂O: lengthen exhalation (↓RR, ↓Ti).` });
  if (r.teOverTau < 3) a.push({ level: 'info', text: `Expiratory time is ${round(r.teOverTau, 1)} τ (aim ≥3–5 τ for complete exhalation).` });
  if (p.equipmentDeadSpaceMl > 0.3 * r.vtMl) a.push({ level: 'warn', text: 'Equipment dead space >30% of Vt – remove/resize HME, adapters, elbows.' });
  if (r.coFactor < 0.85) a.push({ level: 'warn', text: 'High mean airway pressure is lowering venous return/cardiac output.' });
  if (a.length === 0) a.push({ level: 'ok', text: 'Within PALICC-2 lung-protective targets.' });
  return a;
}

export interface WavePoint {
  t: number;
  p: number;
  flow: number; // L/min
  vol: number; // mL above set-PEEP relaxation volume
}

/** Two breaths of pressure / flow / volume waveforms. */
export function ventWaveforms(r: VentResult, s: VentSettings, breaths = 2, steps = 120): WavePoint[] {
  const ttot = 60 / s.rr;
  const ti = Math.min(s.ti, ttot * 0.8);
  const C = r.complianceMl;
  const tau = r.tau;
  const vtrap = r.autoPeep * C;
  const pts: WavePoint[] = [];
  for (let b = 0; b < breaths; b++) {
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * ttot;
      let p: number;
      let flow: number;
      let vol: number;
      if (t <= ti) {
        if (s.mode === 'VC') {
          const f = r.vtMl / ti; // mL/s
          vol = vtrap + f * t;
          flow = (f / 1000) * 60;
          p = t === 0 ? s.peep : pressureForVolume(f * t, r.totalPeep, C, r.overdistP) + (r.ppeak - r.pplat);
        } else {
          const eq = 1 - Math.exp(-ti / tau);
          const vmax = r.vtMl / Math.max(eq, 1e-6);
          vol = vtrap + vmax * (1 - Math.exp(-t / tau));
          flow = ((vmax / tau) * Math.exp(-t / tau) * 60) / 1000;
          p = r.ppeak;
        }
      } else {
        const te = t - ti;
        const v0 = vtrap + r.vtMl;
        vol = v0 * Math.exp(-te / tau);
        flow = -((vol / tau) * 60) / 1000;
        p = s.peep;
      }
      pts.push({ t: round(b * ttot + t, 3), p: round(p, 1), flow: round(flow, 2), vol: round(vol, 1) });
    }
  }
  return pts;
}
