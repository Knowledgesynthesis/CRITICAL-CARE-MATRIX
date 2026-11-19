/**
 * Pediatric AKI: KDIGO 2012 (pediatric criteria) and neonatal modified KDIGO,
 * bedside Schwartz (CKiD 2009) and CKiD U25 (2021) eGFR, fluid overload %,
 * renal angina index (Basu 2014), CRRT starting prescription.
 * Note: KDIGO's 2026 AKI/AKD guideline completed public review in May 2026; staging thresholds below are the 2012 criteria still in use.
 */
import { round } from '@/lib/utils';
import { bsa } from './peds';

export function bedsideSchwartz(heightCm: number, scrMgDl: number): number {
  return (0.413 * heightCm) / scrMgDl;
}

/** CKiD U25 (Pierce 2021): eGFR = K × height(m) / SCr(mg/dL). */
export function ckidU25(ageYears: number, sex: 'M' | 'F', heightCm: number, scrMgDl: number): number {
  let k: number;
  if (sex === 'M') {
    if (ageYears < 12) k = 39.0 * 1.008 ** (ageYears - 12);
    else if (ageYears < 18) k = 39.0 * 1.045 ** (ageYears - 12);
    else k = 50.8;
  } else {
    if (ageYears < 12) k = 36.1 * 1.008 ** (ageYears - 12);
    else if (ageYears < 18) k = 36.1 * 1.023 ** (ageYears - 12);
    else k = 41.4;
  }
  return (k * (heightCm / 100)) / scrMgDl;
}

/** Back-calculate a baseline creatinine assuming normal eGFR 120 (when no baseline is known). */
export function estimatedBaselineScr(heightCm: number, assumedGfr = 120): number {
  return round((0.413 * heightCm) / assumedGfr, 2);
}

export function fluidOverloadPercent(fluidInL: number, fluidOutL: number, admissionWeightKg: number): number {
  return ((fluidInL - fluidOutL) / admissionWeightKg) * 100;
}

export interface KdigoInput {
  baselineScr: number;
  currentScr: number;
  riseWithin48h?: number | null; // absolute rise in mg/dL within 48 h
  eGFR?: number | null;
  onRRT?: boolean;
  /** lowest sustained urine output (mL/kg/h) and its duration (h) */
  uoMlKgH?: number | null;
  uoHours?: number | null;
  neonate?: boolean;
}

export interface KdigoResult {
  scrStage: 0 | 1 | 2 | 3;
  uoStage: 0 | 1 | 2 | 3;
  stage: 0 | 1 | 2 | 3;
  ratio: number;
  reasons: string[];
}

export function kdigoStage(i: KdigoInput): KdigoResult {
  const ratio = i.currentScr / i.baselineScr;
  const reasons: string[] = [];
  let scrStage: KdigoResult['scrStage'] = 0;
  const rise = i.riseWithin48h ?? i.currentScr - i.baselineScr;
  if (i.onRRT) {
    scrStage = 3;
    reasons.push('Receiving kidney replacement therapy → stage 3');
  } else if (ratio >= 3 || (!i.neonate && i.currentScr >= 4) || (i.neonate && i.currentScr >= 2.5) || (!i.neonate && typeof i.eGFR === 'number' && i.eGFR < 35)) {
    scrStage = 3;
    reasons.push(
      ratio >= 3
        ? `SCr ${round(ratio, 2)}× baseline (≥3.0) → stage 3`
        : i.neonate && i.currentScr >= 2.5
          ? 'Neonatal SCr ≥2.5 mg/dL → stage 3'
          : !i.neonate && i.currentScr >= 4
            ? 'SCr ≥4.0 mg/dL → stage 3'
            : 'eGFR <35 mL/min/1.73 m² (age <18 y) → stage 3',
    );
  } else if (ratio >= 2) {
    scrStage = 2;
    reasons.push(`SCr ${round(ratio, 2)}× baseline (2.0–2.9) → stage 2`);
  } else if (ratio >= 1.5 || rise >= 0.3) {
    scrStage = 1;
    reasons.push(ratio >= 1.5 ? `SCr ${round(ratio, 2)}× baseline (1.5–1.9) → stage 1` : `Rise ≥0.3 mg/dL within 48 h → stage 1`);
  }

  let uoStage: KdigoResult['uoStage'] = 0;
  const uo = i.uoMlKgH;
  const h = i.uoHours ?? 0;
  if (typeof uo === 'number') {
    if (i.neonate) {
      // neonatal modified KDIGO uses 24-h average urine output
      if (h >= 24) {
        if (uo <= 0.3) uoStage = 3;
        else if (uo <= 0.5) uoStage = 2;
        else if (uo <= 1) uoStage = 1;
      }
      if (uoStage) reasons.push(`Neonatal 24-h urine output ${uo} mL/kg/h → stage ${uoStage}`);
    } else {
      if ((uo < 0.3 && h >= 24) || (uo === 0 && h >= 12)) uoStage = 3;
      else if (uo < 0.5 && h >= 12) uoStage = 2;
      else if (uo < 0.5 && h >= 6) uoStage = 1;
      if (uoStage) reasons.push(`Urine output ${uo} mL/kg/h for ${h} h → stage ${uoStage}`);
    }
  }
  const stage = Math.max(scrStage, uoStage) as KdigoResult['stage'];
  if (stage === 0) reasons.push('Does not meet KDIGO AKI criteria.');
  return { scrStage, uoStage, stage, ratio, reasons };
}

export interface RaiInput {
  risk: 'icu' | 'transplant' | 'ventilated-vasoactive';
  injuryBy: 'scr' | 'fo';
  scrRatio?: number;
  foPercent?: number;
}

/** Renal angina index (day 0–1): risk × injury; ≥8 = renal angina positive (predicts severe AKI on day 3). */
export function renalAnginaIndex(i: RaiInput): { score: number; risk: number; injury: number; positive: boolean } {
  const risk = i.risk === 'ventilated-vasoactive' ? 5 : i.risk === 'transplant' ? 3 : 1;
  let injury = 1;
  if (i.injuryBy === 'scr') {
    const r = i.scrRatio ?? 1;
    injury = r >= 2 ? 8 : r >= 1.5 ? 4 : r > 1 ? 2 : 1;
  } else {
    const f = i.foPercent ?? 0;
    injury = f >= 15 ? 8 : f >= 10 ? 4 : f >= 5 ? 2 : 1;
  }
  const score = risk * injury;
  return { score, risk, injury, positive: score >= 8 };
}

export interface CrrtPlan {
  effluentMlH: number;
  effluentMlKgH: number;
  bloodFlowMlMin: [number, number];
  catheter: string;
  bloodPrime: boolean;
  circuitFractionOfBV: number;
  notes: string[];
}

/** Starting CVVHDF prescription: effluent 2000 mL/1.73 m²/h, blood flow 3–5 mL/kg/min (higher in infants). */
export function crrtPlan(weightKg: number, heightCm: number, ageMonths: number, circuitVolumeMl: number): CrrtPlan {
  const area = bsa(weightKg, heightCm);
  const eff = (2000 * area) / 1.73;
  const bv = weightKg * (ageMonths < 1 ? 85 : ageMonths < 12 ? 80 : ageMonths < 144 ? 75 : 70);
  const frac = circuitVolumeMl / bv;
  const lo = weightKg < 10 ? 5 : 3;
  const hi = weightKg < 10 ? 8 : 5;
  const catheter =
    weightKg < 3 ? '6.5–7 Fr dual-lumen (umbilical/femoral)' : weightKg < 6 ? '7 Fr dual-lumen' : weightKg < 15 ? '8 Fr dual-lumen' : weightKg < 30 ? '9–10 Fr dual-lumen' : '11–12.5 Fr dual-lumen';
  const notes = [
    'Right internal jugular is the preferred site (best flow, lowest dysfunction).',
    frac > 0.1 ? 'Circuit volume >10% of blood volume → blood-prime the circuit and watch for bradykinin release / hypocalcemia at connection.' : 'Circuit volume ≤10% of blood volume → saline/albumin prime is usual.',
    'Regional citrate is the preferred anticoagulant in most centers; monitor total:ionized Ca ratio (>2.5 suggests citrate accumulation).',
    'Dose drugs for CRRT clearance (antibiotics are frequently under-dosed).',
  ];
  return {
    effluentMlH: round(eff, 0),
    effluentMlKgH: round(eff / weightKg, 1),
    bloodFlowMlMin: [round(lo * weightKg, 0), round(hi * weightKg, 0)],
    catheter,
    bloodPrime: frac > 0.1,
    circuitFractionOfBV: frac,
    notes,
  };
}

/** FENa (%) – limited value after diuretics; FEUrea (<35% suggests prerenal) is diuretic-independent. */
export function fena(uNa: number, pNa: number, uCr: number, pCr: number): number {
  return ((uNa * pCr) / (pNa * uCr)) * 100;
}
export function feurea(uUrea: number, pUrea: number, uCr: number, pCr: number): number {
  return ((uUrea * pCr) / (pUrea * uCr)) * 100;
}
