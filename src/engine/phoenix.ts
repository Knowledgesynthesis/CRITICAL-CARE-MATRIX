/**
 * Phoenix Sepsis Score (Schlapbach et al.; Sanchez-Pinto et al., JAMA 2024).
 * Thresholds follow the authors' reference implementation (R package "phoenix").
 * Sepsis = suspected infection + total ≥2. Septic shock = sepsis + ≥1 cardiovascular point.
 * Not validated for birth hospitalisation, <37 wk post-conceptional age, or ≥18 y.
 */

export type RespSupport = 'none' | 'noninvasive' | 'imv';

export interface PhoenixInput {
  ageMonths: number;
  // respiratory
  respSupport: RespSupport;
  pf?: number | null; // PaO2:FiO2
  sf?: number | null; // SpO2:FiO2 (only valid if SpO2 ≤97%)
  spo2?: number | null;
  // cardiovascular
  vasoactiveCount: number; // dopamine, dobutamine, epinephrine, milrinone, norepinephrine, vasopressin
  lactate?: number | null; // mmol/L
  map?: number | null; // mmHg
  // coagulation
  platelets?: number | null; // ×10³/µL
  inr?: number | null;
  dDimer?: number | null; // mg/L FEU
  fibrinogen?: number | null; // mg/dL
  // neurologic
  gcs?: number | null;
  bilateralFixedPupils: boolean;
  suspectedInfection: boolean;
}

export interface PhoenixResult {
  respiratory: number;
  cardiovascular: number;
  coagulation: number;
  neurologic: number;
  total: number;
  sepsis: boolean;
  septicShock: boolean;
  detail: string[];
}

const has = (v: number | null | undefined): v is number => typeof v === 'number' && Number.isFinite(v);

/** MAP thresholds (mmHg): [score-1 lower bound, score-0 lower bound]. MAP < first → 2 pts; first ≤ MAP < second → 1 pt. */
export function phoenixMapCutoffs(ageMonths: number): [number, number] {
  if (ageMonths < 1) return [17, 31];
  if (ageMonths < 12) return [25, 39];
  if (ageMonths < 24) return [31, 44];
  if (ageMonths < 60) return [32, 45];
  if (ageMonths < 144) return [36, 49];
  return [38, 52];
}

export function phoenixRespiratory(i: Pick<PhoenixInput, 'respSupport' | 'pf' | 'sf' | 'spo2'>): number {
  const sfValid = has(i.sf) && (!has(i.spo2) || i.spo2 <= 97);
  const pf = has(i.pf) ? i.pf : null;
  const sf = sfValid ? (i.sf as number) : null;
  if (pf === null && sf === null) return 0;
  const onSupport = i.respSupport !== 'none';
  const imv = i.respSupport === 'imv';
  let pts = 0;
  if (imv && ((pf !== null && pf < 100) || (sf !== null && sf < 148))) pts = 3;
  else if (imv && ((pf !== null && pf < 200) || (sf !== null && sf < 220))) pts = 2;
  else if (onSupport && ((pf !== null && pf < 400) || (sf !== null && sf < 292))) pts = 1;
  return pts;
}

export function phoenixCardiovascular(i: Pick<PhoenixInput, 'ageMonths' | 'vasoactiveCount' | 'lactate' | 'map'>): number {
  let pts = 0;
  pts += i.vasoactiveCount >= 2 ? 2 : i.vasoactiveCount === 1 ? 1 : 0;
  if (has(i.lactate)) pts += i.lactate >= 11 ? 2 : i.lactate >= 5 ? 1 : 0;
  if (has(i.map)) {
    const [two, zero] = phoenixMapCutoffs(i.ageMonths);
    pts += i.map < two ? 2 : i.map < zero ? 1 : 0;
  }
  return pts;
}

export function phoenixCoagulation(i: Pick<PhoenixInput, 'platelets' | 'inr' | 'dDimer' | 'fibrinogen'>): number {
  let pts = 0;
  if (has(i.platelets) && i.platelets < 100) pts++;
  if (has(i.inr) && i.inr > 1.3) pts++;
  if (has(i.dDimer) && i.dDimer > 2) pts++;
  if (has(i.fibrinogen) && i.fibrinogen < 100) pts++;
  return Math.min(pts, 2);
}

export function phoenixNeurologic(i: Pick<PhoenixInput, 'gcs' | 'bilateralFixedPupils'>): number {
  if (i.bilateralFixedPupils) return 2;
  if (has(i.gcs) && i.gcs <= 10) return 1;
  return 0;
}

export function phoenixScore(i: PhoenixInput): PhoenixResult {
  const respiratory = phoenixRespiratory(i);
  const cardiovascular = phoenixCardiovascular(i);
  const coagulation = phoenixCoagulation(i);
  const neurologic = phoenixNeurologic(i);
  const total = respiratory + cardiovascular + coagulation + neurologic;
  const sepsis = i.suspectedInfection && total >= 2;
  const septicShock = sepsis && cardiovascular >= 1;
  const detail: string[] = [];
  if (!i.suspectedInfection) detail.push('Phoenix criteria apply only with suspected or confirmed infection.');
  if (has(i.sf) && has(i.spo2) && i.spo2 > 97) detail.push('SpO₂:FiO₂ ignored because SpO₂ >97% (flat part of the curve).');
  if (i.respSupport !== 'imv' && respiratory === 1) detail.push('Respiratory score is capped at 1 without invasive ventilation.');
  if (i.ageMonths >= 216) detail.push('Phoenix is not validated at ≥18 years.');
  return { respiratory, cardiovascular, coagulation, neurologic, total, sepsis, septicShock, detail };
}
