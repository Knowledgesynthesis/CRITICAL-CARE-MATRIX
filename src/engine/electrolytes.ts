/**
 * Sodium, water, glucose and calcium arithmetic for children.
 * Adrogué–Madias infusate formula, free-water deficit, glucose-corrected sodium (Katz 1.6 / Hillier 2.4),
 * glucose infusion rate, 3% saline rule of thumb (1 mL/kg ≈ +1 mmol/L Na).
 */
import { round } from '@/lib/utils';

export interface Infusate {
  id: string;
  label: string;
  na: number; // mmol/L
  k: number;
}

export const INFUSATES: Infusate[] = [
  { id: 'hts3', label: '3% NaCl', na: 513, k: 0 },
  { id: 'ns', label: '0.9% NaCl', na: 154, k: 0 },
  { id: 'pl', label: 'Plasma-Lyte 148', na: 140, k: 5 },
  { id: 'lr', label: "Lactated Ringer's", na: 130, k: 4 },
  { id: 'half', label: '0.45% NaCl', na: 77, k: 0 },
  { id: 'quarter', label: '0.2% NaCl', na: 34, k: 0 },
  { id: 'd5w', label: 'D5W (free water)', na: 0, k: 0 },
];

/** Change in serum Na (mmol/L) after 1 L of infusate (Adrogué–Madias). */
export function deltaNaPerLitre(serumNa: number, infusate: Infusate, tbwL: number): number {
  return (infusate.na + infusate.k - serumNa) / (tbwL + 1);
}

/** Predicted change in serum Na after a given volume (mL). */
export function deltaNaForVolume(serumNa: number, infusate: Infusate, tbwL: number, volumeMl: number): number {
  return deltaNaPerLitre(serumNa, infusate, tbwL) * (volumeMl / 1000);
}

/** Free-water deficit (L) = TBW × (Na/140 − 1). */
export function freeWaterDeficit(serumNa: number, tbwL: number): number {
  return tbwL * (serumNa / 140 - 1);
}

export function correctedNaForGlucose(na: number, glucoseMgDl: number, factor: 1.6 | 2.4 = 1.6): number {
  return na + (factor * Math.max(0, glucoseMgDl - 100)) / 100;
}

/** Glucose infusion rate (mg/kg/min) = dextrose% × rate(mL/h) / (6 × weight). */
export function gir(dextrosePercent: number, rateMlH: number, weightKg: number): number {
  return (dextrosePercent * rateMlH) / (6 * weightKg);
}

export function rateForGir(targetGir: number, dextrosePercent: number, weightKg: number): number {
  return (targetGir * 6 * weightKg) / dextrosePercent;
}

/** Albumin-corrected total calcium (mg/dL). Ionized calcium is preferred in critical illness. */
export function correctedCalcium(caMgDl: number, albuminGdl: number): number {
  return caMgDl + 0.8 * (4 - albuminGdl);
}

export interface HypoNaPlan {
  bolusMl: number;
  maxBolusMl: number;
  expectedRise: number;
  limit24h: number;
  notes: string[];
}

/** Symptomatic hyponatremia: 3% NaCl 2 mL/kg (max 100 mL) over 10 min, repeat ×2 if symptoms persist. */
export function hyponatremiaBolus(weightKg: number): HypoNaPlan {
  const bolus = Math.min(2 * weightKg, 100);
  return {
    bolusMl: round(bolus, 0),
    maxBolusMl: 100,
    expectedRise: round(bolus / weightKg, 1),
    limit24h: 10,
    notes: [
      'Give over 10 min; recheck Na after each bolus; stop when symptoms resolve or Na has risen ~5 mmol/L.',
      'For chronic hyponatremia keep the total rise ≤8–10 mmol/L in 24 h (osmotic demyelination risk; higher in hypokalemia, malnutrition, liver disease).',
      'If overcorrecting (e.g., brisk water diuresis once ADH stimulus resolves): replace urine with D5W ± desmopressin.',
    ],
  };
}

export interface HyperNaPlan {
  deficitL: number;
  maxFallPerHour: number;
  hoursToSafeTarget: number;
  notes: string[];
}

export function hypernatremiaPlan(serumNa: number, tbwL: number): HyperNaPlan {
  const deficit = Math.max(0, freeWaterDeficit(serumNa, tbwL));
  const target = Math.max(145, serumNa - 10);
  return {
    deficitL: round(deficit, 2),
    maxFallPerHour: 0.5,
    hoursToSafeTarget: round(Math.max(0, serumNa - target) / 0.5, 0),
    notes: [
      'Lower Na by ≤0.5 mmol/L/h (≤10–12 mmol/L per 24 h) in chronic (>48 h) hypernatremia – faster correction causes cerebral edema.',
      'Restore circulating volume first with isotonic fluid; then replace deficit over ≥48 h plus ongoing losses.',
      'Check for diabetes insipidus (urine osmolality < serum, high output) – especially after neurosurgery, TBI, brain death.',
    ],
  };
}
