/**
 * Pediatric age/size physiology.
 * Ranges: AHA PALS (2020 provider manual tables; unchanged in 2025), APLS weight formula,
 * Traub–Johnson IBW, ARDSnet PBW, Holliday–Segar maintenance.
 */
import { clamp, round } from '@/lib/utils';

export type Range = { lo: number; hi: number };

export interface AgeBand {
  id: string;
  label: string;
  /** inclusive lower bound, months */
  fromMonths: number;
  /** exclusive upper bound, months */
  toMonths: number;
}

export const AGE_BANDS: AgeBand[] = [
  { id: 'neonate', label: 'Neonate (0–28 d)', fromMonths: 0, toMonths: 1 },
  { id: 'infant', label: 'Infant (1–12 mo)', fromMonths: 1, toMonths: 12 },
  { id: 'toddler', label: 'Toddler (1–2 y)', fromMonths: 12, toMonths: 36 },
  { id: 'preschool', label: 'Preschool (3–5 y)', fromMonths: 36, toMonths: 72 },
  { id: 'school', label: 'School age (6–11 y)', fromMonths: 72, toMonths: 144 },
  { id: 'adolescent', label: 'Adolescent (12–17 y)', fromMonths: 144, toMonths: 216 },
];

export function ageBand(ageMonths: number): AgeBand {
  return AGE_BANDS.find((b) => ageMonths >= b.fromMonths && ageMonths < b.toMonths) ?? AGE_BANDS[AGE_BANDS.length - 1];
}

export function formatAge(ageMonths: number): string {
  if (ageMonths < 1) {
    const days = Math.max(1, Math.round(ageMonths * 30.4));
    return `${days} d`;
  }
  if (ageMonths < 24) return `${round(ageMonths, 0)} mo`;
  return `${round(ageMonths / 12, 0)} y`;
}

/** Awake heart rate (PALS). */
export function heartRateRange(ageMonths: number): Range {
  if (ageMonths < 3) return { lo: 85, hi: 205 };
  if (ageMonths < 24) return { lo: 100, hi: 190 };
  if (ageMonths < 120) return { lo: 60, hi: 140 };
  return { lo: 60, hi: 100 };
}

/** Respiratory rate (PALS). */
export function respRateRange(ageMonths: number): Range {
  if (ageMonths < 12) return { lo: 30, hi: 53 };
  if (ageMonths < 36) return { lo: 22, hi: 37 };
  if (ageMonths < 72) return { lo: 20, hi: 28 };
  if (ageMonths < 144) return { lo: 18, hi: 25 };
  return { lo: 12, hi: 20 };
}

/** Normal systolic / mean pressure bands (PALS table, rounded). */
export function bpNormal(ageMonths: number): { sbp: Range; dbp: Range; map: Range } {
  if (ageMonths < 1) return { sbp: { lo: 67, hi: 84 }, dbp: { lo: 35, hi: 53 }, map: { lo: 45, hi: 60 } };
  if (ageMonths < 12) return { sbp: { lo: 72, hi: 104 }, dbp: { lo: 37, hi: 56 }, map: { lo: 50, hi: 62 } };
  if (ageMonths < 36) return { sbp: { lo: 86, hi: 106 }, dbp: { lo: 42, hi: 63 }, map: { lo: 49, hi: 62 } };
  if (ageMonths < 72) return { sbp: { lo: 89, hi: 112 }, dbp: { lo: 46, hi: 72 }, map: { lo: 58, hi: 69 } };
  if (ageMonths < 120) return { sbp: { lo: 97, hi: 115 }, dbp: { lo: 57, hi: 76 }, map: { lo: 66, hi: 72 } };
  if (ageMonths < 144) return { sbp: { lo: 102, hi: 120 }, dbp: { lo: 61, hi: 80 }, map: { lo: 71, hi: 79 } };
  return { sbp: { lo: 110, hi: 131 }, dbp: { lo: 64, hi: 83 }, map: { lo: 73, hi: 84 } };
}

/**
 * PALS definition of hypotension (systolic, 5th percentile).
 * Term neonate <60, infant <70, 1–10 y <70 + 2×age(y), >10 y <90.
 */
export function hypotensionSBP(ageMonths: number): number {
  if (ageMonths < 1) return 60;
  if (ageMonths < 12) return 70;
  const y = ageMonths / 12;
  if (y <= 10) return Math.round(70 + 2 * Math.floor(y));
  return 90;
}

/** Approximate MAP percentiles for age ≥1 y: 5th ≈ 40 + 1.5×age, 50th ≈ 55 + 1.5×age. */
export function mapPercentiles(ageMonths: number): { p5: number; p50: number } {
  if (ageMonths < 1) return { p5: 30, p50: 45 };
  if (ageMonths < 12) return { p5: 35 + (ageMonths / 12) * 5, p50: 45 + (ageMonths / 12) * 10 };
  const y = Math.min(ageMonths / 12, 17);
  return { p5: 40 + 1.5 * y, p50: 55 + 1.5 * y };
}

/** APLS weight estimate (kg). Weigh the child or use a length-based tape whenever possible. */
export function estimateWeight(ageMonths: number): number {
  if (ageMonths < 12) return round(0.5 * ageMonths + 4, 1);
  const y = ageMonths / 12;
  if (y < 6) return round(2 * y + 8, 1);
  if (y <= 12) return round(3 * y + 7, 1);
  // 50th-centile approximations for teenagers (sexes averaged)
  const teen: Record<number, number> = { 13: 46, 14: 51, 15: 55, 16: 58, 17: 61 };
  return teen[Math.min(17, Math.floor(y))] ?? 61;
}

/** Typical length/height (cm) from age; Weech approximation 2–12 y. */
export function estimateHeight(ageMonths: number): number {
  if (ageMonths < 12) return round(50 + 2.1 * ageMonths, 0);
  const y = ageMonths / 12;
  if (y < 2) return round(75 + 12 * (y - 1), 0);
  if (y <= 12) return round(6 * y + 77, 0);
  return round(Math.min(172, 149 + (y - 12) * 4.5), 0);
}

/** Mosteller BSA (m²) */
export function bsa(weightKg: number, heightCm: number): number {
  return Math.sqrt((weightKg * heightCm) / 3600);
}

/**
 * Predicted body weight for ventilation.
 * <152.4 cm: Traub–Johnson IBW = 2.396·e^(0.01863·height). ≥152.4 cm: ARDSnet PBW.
 * PALICC-2: size tidal volume to the LESSER of predicted and actual weight.
 */
export function predictedBodyWeight(heightCm: number, sex: 'M' | 'F' = 'M'): number {
  if (heightCm < 152.4) return round(2.396 * Math.exp(0.01863 * heightCm), 1);
  const base = sex === 'M' ? 50 : 45.5;
  return round(base + 0.91 * (heightCm - 152.4), 1);
}

export function ventilationWeight(actualKg: number, heightCm: number, sex: 'M' | 'F' = 'M'): number {
  return Math.min(actualKg, predictedBodyWeight(heightCm, sex));
}

/** Holliday–Segar maintenance (4-2-1). Returns mL/h, capped at 100 mL/h (2.4 L/day). */
export function maintenanceRate(weightKg: number): number {
  let r = 0;
  r += Math.min(weightKg, 10) * 4;
  if (weightKg > 10) r += Math.min(weightKg - 10, 10) * 2;
  if (weightKg > 20) r += (weightKg - 20) * 1;
  return round(Math.min(r, 100), 1);
}

export function maintenanceDaily(weightKg: number): number {
  let d = 0;
  d += Math.min(weightKg, 10) * 100;
  if (weightKg > 10) d += Math.min(weightKg - 10, 10) * 50;
  if (weightKg > 20) d += (weightKg - 20) * 20;
  return Math.round(Math.min(d, 2400));
}

/** Circulating blood volume (mL/kg). */
export function bloodVolumePerKg(ageMonths: number): number {
  if (ageMonths < 1) return 85;
  if (ageMonths < 12) return 80;
  if (ageMonths < 144) return 75;
  return 70;
}

/** Total body water fraction for Adrogué–Madias / free-water calculations. */
export function tbwFraction(ageMonths: number, sex: 'M' | 'F' = 'M'): number {
  if (ageMonths < 1) return 0.8;
  if (ageMonths < 12) return 0.7;
  if (ageMonths >= 144 && sex === 'F') return 0.55;
  return 0.6;
}

/** Resting O2 consumption (mL/kg/min) – infants consume roughly twice the adult rate per kg. */
export function vo2PerKg(ageMonths: number): number {
  if (ageMonths < 12) return 7;
  if (ageMonths < 72) return 6;
  if (ageMonths < 144) return 5;
  return 4;
}

/** Baseline (resting, calm) heart rate used by the simulators. */
export function typicalHR(ageMonths: number): number {
  if (ageMonths < 1) return 140;
  if (ageMonths < 12) return 130;
  if (ageMonths < 36) return 115;
  if (ageMonths < 72) return 100;
  if (ageMonths < 144) return 88;
  return 75;
}

export function typicalRR(ageMonths: number): number {
  const r = respRateRange(ageMonths);
  return Math.round((r.lo + r.hi) / 2);
}

export function normalHb(ageMonths: number): number {
  if (ageMonths < 1) return 16;
  if (ageMonths < 6) return 11;
  if (ageMonths < 72) return 12;
  if (ageMonths < 144) return 12.5;
  return 13.5;
}

/** Normal serum creatinine upper limit (mg/dL) – used to flag values, not to stage AKI. */
export function creatinineULN(ageMonths: number): number {
  if (ageMonths < 1) return 0.8; // reflects maternal creatinine in the first week
  if (ageMonths < 12) return 0.4;
  if (ageMonths < 36) return 0.45;
  if (ageMonths < 72) return 0.55;
  if (ageMonths < 144) return 0.75;
  return 1.0;
}

export interface Equipment {
  ettCuffed: number;
  ettUncuffed: number;
  ettDepthCm: number;
  suctionFr: number;
  ngFr: number;
  lmaSize: string;
  bladeSuggestion: string;
  defibPads: string;
}

const half = (v: number) => Math.round(v * 2) / 2;

/** Airway equipment by age (formula) and weight (LMA, pads). */
export function equipment(ageMonths: number, weightKg: number): Equipment {
  const y = ageMonths / 12;
  let cuffed: number;
  let uncuffed: number;
  if (ageMonths < 8) {
    cuffed = weightKg < 3 ? 2.5 : 3.0;
    uncuffed = weightKg < 3 ? 3.0 : 3.5;
  } else if (ageMonths < 24) {
    cuffed = 3.5;
    uncuffed = 4.0;
  } else {
    cuffed = clamp(half(y / 4 + 3.5), 3.5, 7.5);
    uncuffed = clamp(half(y / 4 + 4), 4.0, 8.0);
  }
  const depth = round(cuffed * 3, 0);
  const lma =
    weightKg < 5 ? '1' : weightKg < 10 ? '1.5' : weightKg < 20 ? '2' : weightKg < 30 ? '2.5' : weightKg < 50 ? '3' : weightKg < 70 ? '4' : '5';
  const blade =
    ageMonths < 1 ? 'Miller 0–1' : ageMonths < 24 ? 'Miller 1' : y < 8 ? 'Miller/Mac 2' : 'Mac 3';
  return {
    ettCuffed: cuffed,
    ettUncuffed: uncuffed,
    ettDepthCm: depth,
    suctionFr: Math.round(cuffed * 2),
    ngFr: Math.round(cuffed * 2),
    lmaSize: lma,
    bladeSuggestion: blade,
    defibPads: weightKg < 10 ? 'Infant/pediatric pads' : 'Adult pads (anterior–posterior if small chest)',
  };
}

export type Flag = 'low' | 'normal' | 'high';

export function flag(value: number, range: Range): Flag {
  if (value < range.lo) return 'low';
  if (value > range.hi) return 'high';
  return 'normal';
}

/** Age-adjusted shock index (SIPA, Acker 2015): HR/SBP thresholds. */
export function sipaThreshold(ageMonths: number): number | null {
  const y = ageMonths / 12;
  if (y >= 4 && y < 7) return 1.22;
  if (y >= 7 && y < 13) return 1.0;
  if (y >= 13 && y <= 17) return 0.9;
  return null;
}
