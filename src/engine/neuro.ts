/**
 * Pediatric neurocritical care arithmetic.
 * CPP = MAP − ICP. BTF pediatric TBI guideline (3rd ed., 2019): treat ICP ≥20 mmHg; CPP ≥40 mmHg,
 * 40–50 mmHg with infants at the lower end and adolescents at the upper end.
 */
import { clamp, round } from '@/lib/utils';

export function cpp(map: number, icp: number): number {
  return map - icp;
}

/** Age-scaled CPP floor within the BTF 40–50 mmHg band. */
export function cppTarget(ageMonths: number): number {
  const y = clamp(ageMonths / 12, 0, 17);
  return round(40 + (y / 17) * 10, 0);
}

export interface GcsOption {
  score: number;
  child: string;
  infant: string;
}

export const GCS_EYE: GcsOption[] = [
  { score: 4, child: 'Spontaneous', infant: 'Spontaneous' },
  { score: 3, child: 'To voice', infant: 'To voice' },
  { score: 2, child: 'To pain', infant: 'To pain' },
  { score: 1, child: 'None', infant: 'None' },
];

export const GCS_VERBAL: GcsOption[] = [
  { score: 5, child: 'Oriented', infant: 'Coos, babbles, interacts' },
  { score: 4, child: 'Confused', infant: 'Irritable, consolable cry' },
  { score: 3, child: 'Inappropriate words', infant: 'Cries to pain' },
  { score: 2, child: 'Incomprehensible sounds', infant: 'Moans to pain' },
  { score: 1, child: 'None', infant: 'None' },
];

export const GCS_MOTOR: GcsOption[] = [
  { score: 6, child: 'Obeys commands', infant: 'Normal spontaneous movement' },
  { score: 5, child: 'Localizes pain', infant: 'Withdraws to touch' },
  { score: 4, child: 'Withdraws to pain', infant: 'Withdraws to pain' },
  { score: 3, child: 'Abnormal flexion (decorticate)', infant: 'Abnormal flexion (decorticate)' },
  { score: 2, child: 'Extension (decerebrate)', infant: 'Extension (decerebrate)' },
  { score: 1, child: 'None', infant: 'None' },
];

export function hypertonicSalineBolus(weightKg: number): { lowMl: number; highMl: number } {
  return { lowMl: round(2 * weightKg, 0), highMl: round(Math.min(5 * weightKg, 250), 0) };
}

export interface TbiCheck {
  item: string;
  ok: boolean;
  note: string;
}

/** Bedside check against BTF/consensus targets for severe pediatric TBI. */
export function tbiTargets(args: { ageMonths: number; map: number; icp: number; sbp: number; paco2: number; spo2: number; na: number; tempC: number; glucose: number }): TbiCheck[] {
  const c = cpp(args.map, args.icp);
  const target = cppTarget(args.ageMonths);
  const y = args.ageMonths / 12;
  const sbpFloor = args.ageMonths < 12 ? 70 : y <= 10 ? 70 + 2 * Math.floor(y) : 90;
  return [
    { item: `ICP <20 mmHg`, ok: args.icp < 20, note: `ICP ${args.icp}` },
    { item: `CPP ≥${target} mmHg`, ok: c >= target, note: `CPP ${round(c)} (MAP ${args.map} − ICP ${args.icp})` },
    { item: `No hypotension (SBP ≥${sbpFloor})`, ok: args.sbp >= sbpFloor, note: 'A single hypotensive episode is associated with worse outcome' },
    { item: 'PaCO₂ 35–40 mmHg', ok: args.paco2 >= 35 && args.paco2 <= 40, note: args.paco2 < 30 ? 'Avoid prophylactic hyperventilation (PaCO₂ <30) – causes ischemia' : `PaCO₂ ${args.paco2}` },
    { item: 'SpO₂ ≥94% / no hypoxemia', ok: args.spo2 >= 94, note: `SpO₂ ${args.spo2}` },
    { item: 'Na 140–155 (avoid >160 sustained)', ok: args.na >= 140 && args.na <= 160, note: `Na ${args.na}` },
    { item: 'Normothermia (avoid fever)', ok: args.tempC <= 37.5, note: `T ${args.tempC} °C` },
    { item: 'Glucose 80–180 mg/dL', ok: args.glucose >= 80 && args.glucose <= 180, note: `Glucose ${args.glucose}` },
  ];
}
