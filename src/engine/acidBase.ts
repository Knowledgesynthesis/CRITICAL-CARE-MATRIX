/**
 * Stepwise acid–base interpretation (physiologic/Boston approach + Stewart quantitative add-on).
 * Rules: Winter's formula; metabolic alkalosis PaCO2 = 0.7·HCO3 + 21; respiratory
 * acute ±1 / chronic ±3.5 mmol/L per 10 mmHg (acidosis), acute −2 / chronic −4 to −5 (alkalosis);
 * albumin-corrected anion gap (Figge); delta ratio; osmolal gap; Fencl–Figge SID/SIG.
 * Units: Na/K/Cl/HCO3/lactate mmol/L, albumin g/dL, glucose & BUN mg/dL, iCa & Mg mmol/L, phosphate mg/dL.
 */
import { round } from '@/lib/utils';
import { hco3From } from './respiratory';

export interface AbgInput {
  ph: number;
  paco2: number;
  hco3?: number | null;
  na?: number | null;
  k?: number | null;
  cl?: number | null;
  albumin?: number | null;
  lactate?: number | null;
  glucose?: number | null;
  bun?: number | null;
  measuredOsm?: number | null;
  ionizedCa?: number | null;
  mg?: number | null;
  phosphate?: number | null;
  urineNa?: number | null;
  urineK?: number | null;
  urineCl?: number | null;
  chronicity?: 'acute' | 'chronic' | 'unknown';
}

export type Disorder =
  | 'metabolic acidosis'
  | 'metabolic alkalosis'
  | 'respiratory acidosis'
  | 'respiratory alkalosis'
  | 'high anion gap metabolic acidosis'
  | 'normal anion gap metabolic acidosis';

export type StepStatus = 'normal' | 'abnormal' | 'warning' | 'info';

export interface Step {
  id: string;
  title: string;
  result: string;
  detail?: string;
  status: StepStatus;
}

export interface AcidBaseResult {
  steps: Step[];
  disorders: Disorder[];
  primary: Disorder | 'mixed' | 'none';
  summary: string;
  hco3: number;
  hco3Calculated: number;
  internallyConsistent: boolean;
  anionGap: number | null;
  correctedAnionGap: number | null;
  deltaRatio: number | null;
  osmolalGap: number | null;
  baseExcess: number;
  sidApparent: number | null;
  sidEffective: number | null;
  sig: number | null;
  differentials: string[];
}

const n = (v: number | null | undefined): v is number => typeof v === 'number' && Number.isFinite(v);

export const NORMAL_AG = 12;
export const AG_UPPER = 14;

/** Van Slyke standard base excess (mmol/L). */
export function standardBaseExcess(hco3: number, ph: number): number {
  return 0.93 * (hco3 - 24.4 + 14.83 * (ph - 7.4));
}

export function anionGap(na: number, cl: number, hco3: number): number {
  return na - (cl + hco3);
}

export function albuminCorrectedAG(ag: number, albuminGdl: number): number {
  return ag + 2.5 * (4.0 - albuminGdl);
}

export function wintersExpected(hco3: number): [number, number] {
  const c = 1.5 * hco3 + 8;
  return [c - 2, c + 2];
}

export function metAlkExpected(hco3: number): [number, number] {
  const c = 0.7 * hco3 + 21;
  return [c - 2, c + 2];
}

export function calculatedOsm(na: number, glucoseMgDl: number, bunMgDl: number): number {
  return 2 * na + glucoseMgDl / 18 + bunMgDl / 2.8;
}

const DIFFERENTIALS: Record<string, string[]> = {
  hagma: [
    'Lactic acidosis – shock, hypoxemia, seizures, epinephrine/β-agonists (type B), metformin, inborn errors',
    'Ketoacidosis – DKA, starvation, alcohol',
    'Inborn errors – organic acidemias (MMA, propionic), mitochondrial disease',
    'Toxins – salicylate, methanol, ethylene glycol, iron, isoniazid, toluene',
    'Uremia – advanced AKI/CKD',
    '5-oxoproline (chronic paracetamol), D-lactate (short gut)',
  ],
  nagma: [
    'GI bicarbonate loss – diarrhea, ileostomy, fistula',
    'Chloride load – 0.9% saline resuscitation (dilutional/hyperchloremic)',
    'Renal tubular acidosis (proximal, distal, type 4)',
    'Recovery phase of DKA (ketones lost in urine; chloride retained)',
    'Carbonic anhydrase inhibitors (acetazolamide, topiramate), ureteral diversion',
  ],
  metalk: [
    'Chloride-responsive (urine Cl <20): vomiting/NG suction, pyloric stenosis, prior diuretics, CF sweat losses, post-hypercapnia',
    'Chloride-resistant (urine Cl >20): active diuretics, Bartter/Gitelman, hyperaldosteronism, Cushing',
    'Contraction alkalosis after aggressive diuresis; alkali/citrate load (massive transfusion)',
    'Hypokalemia sustains alkalosis – replace K and Cl',
  ],
  respacid: [
    'Airway/lung – bronchiolitis, asthma (late, ominous), pneumonia, PARDS (permissive), BPD',
    'Pump failure – neuromuscular weakness (SMA, GBS, botulism), fatigue in infants',
    'Central drive – opioids/sedatives, CNS injury, hypothermia',
    'Ventilator – inadequate minute ventilation or excess dead space',
  ],
  respalk: [
    'Pain, anxiety, fever, early sepsis',
    'Hypoxemia, pneumonia, pulmonary embolism',
    'Hyperammonemia (urea cycle defects – check ammonia in an encephalopathic neonate)',
    'Salicylate (early), CNS injury, iatrogenic over-ventilation (avoid in TBI)',
    'Liver failure',
  ],
};

export function interpretAcidBase(i: AbgInput): AcidBaseResult {
  const steps: Step[] = [];
  const disorders: Disorder[] = [];
  const diffs: string[] = [];
  const calc = hco3From(i.ph, i.paco2);
  const hco3 = n(i.hco3) ? i.hco3 : calc;
  const consistent = !n(i.hco3) || Math.abs(i.hco3 - calc) <= Math.max(3, 0.1 * calc);

  steps.push({
    id: 'consistency',
    title: '1 · Is the gas internally consistent?',
    result: n(i.hco3)
      ? consistent
        ? `Yes – Henderson–Hasselbalch predicts HCO₃⁻ ${round(calc, 1)} (reported ${i.hco3}).`
        : `No – H–H predicts HCO₃⁻ ${round(calc, 1)} but ${i.hco3} was reported. Re-check sample, units, transcription (venous vs arterial).`
      : `HCO₃⁻ calculated from pH and PaCO₂: ${round(calc, 1)} mmol/L.`,
    status: consistent ? 'normal' : 'warning',
  });

  // pH
  const acidemia = i.ph < 7.35;
  const alkalemia = i.ph > 7.45;
  steps.push({
    id: 'ph',
    title: '2 · Acidemia or alkalemia?',
    result: acidemia ? `Acidemia (pH ${i.ph})` : alkalemia ? `Alkalemia (pH ${i.ph})` : `pH ${i.ph} is within 7.35–7.45`,
    detail: !acidemia && !alkalemia ? 'A normal pH does not exclude a disorder – look at PaCO₂, HCO₃⁻ and the anion gap.' : undefined,
    status: acidemia || alkalemia ? 'abnormal' : 'normal',
  });

  const lowHco3 = hco3 < 22;
  const highHco3 = hco3 > 26;
  const highCo2 = i.paco2 > 45;
  const lowCo2 = i.paco2 < 35;

  let primary: AcidBaseResult['primary'] = 'none';
  const add = (d: Disorder) => {
    if (!disorders.includes(d)) disorders.push(d);
  };

  // Primary process
  if (acidemia) {
    if (lowHco3 && highCo2) {
      primary = 'mixed';
      add('metabolic acidosis');
      add('respiratory acidosis');
    } else if (lowHco3) {
      primary = 'metabolic acidosis';
      add('metabolic acidosis');
    } else if (highCo2) {
      primary = 'respiratory acidosis';
      add('respiratory acidosis');
    }
  } else if (alkalemia) {
    if (highHco3 && lowCo2) {
      primary = 'mixed';
      add('metabolic alkalosis');
      add('respiratory alkalosis');
    } else if (highHco3) {
      primary = 'metabolic alkalosis';
      add('metabolic alkalosis');
    } else if (lowCo2) {
      primary = 'respiratory alkalosis';
      add('respiratory alkalosis');
    }
  } else {
    if (lowHco3 && lowCo2) {
      // either fully compensated chronic resp alkalosis or met acidosis + resp alkalosis
      primary = 'mixed';
      add('metabolic acidosis');
      add('respiratory alkalosis');
    } else if (highHco3 && highCo2) {
      primary = 'mixed';
      add('metabolic alkalosis');
      add('respiratory acidosis');
    } else if (lowHco3 || highHco3 || highCo2 || lowCo2) {
      primary = 'mixed';
      if (lowHco3) add('metabolic acidosis');
      if (highHco3) add('metabolic alkalosis');
      if (highCo2) add('respiratory acidosis');
      if (lowCo2) add('respiratory alkalosis');
    }
  }

  steps.push({
    id: 'primary',
    title: '3 · Primary process',
    result:
      primary === 'none'
        ? 'PaCO₂ and HCO₃⁻ are normal.'
        : primary === 'mixed'
          ? `PaCO₂ ${i.paco2} and HCO₃⁻ ${round(hco3, 1)} both deviate in directions that cannot be one process plus compensation → mixed disorder.`
          : `${cap(primary)}: ${primary.startsWith('metabolic') ? `HCO₃⁻ ${round(hco3, 1)}` : `PaCO₂ ${i.paco2}`} moves the pH in the observed direction.`,
    status: primary === 'none' ? 'normal' : 'abnormal',
  });

  // Compensation
  let compText = 'Not applicable.';
  let compStatus: StepStatus = 'info';
  const metAcidPresent = disorders.includes('metabolic acidosis');
  if (primary === 'metabolic acidosis' || (primary === 'mixed' && metAcidPresent && !highCo2)) {
    const [lo, hi] = wintersExpected(hco3);
    if (i.paco2 > hi) {
      add('respiratory acidosis');
      compText = `Winter's: expected PaCO₂ ${round(lo)}–${round(hi)}. Measured ${i.paco2} is HIGHER → concurrent respiratory acidosis (fatigue, sedation, inadequate ventilation).`;
      compStatus = 'warning';
    } else if (i.paco2 < lo) {
      add('respiratory alkalosis');
      compText = `Winter's: expected PaCO₂ ${round(lo)}–${round(hi)}. Measured ${i.paco2} is LOWER → concurrent respiratory alkalosis.`;
      compStatus = 'warning';
    } else {
      compText = `Winter's: expected PaCO₂ ${round(lo)}–${round(hi)}. Measured ${i.paco2} → appropriate respiratory compensation.`;
      compStatus = 'normal';
    }
  } else if (primary === 'metabolic alkalosis') {
    const [lo, hi] = metAlkExpected(hco3);
    if (i.paco2 > hi) {
      add('respiratory acidosis');
      compText = `Expected PaCO₂ ${round(lo)}–${round(hi)} (0.7·HCO₃⁻ + 21). Measured ${i.paco2} is higher → concurrent respiratory acidosis.`;
      compStatus = 'warning';
    } else if (i.paco2 < lo) {
      add('respiratory alkalosis');
      compText = `Expected PaCO₂ ${round(lo)}–${round(hi)}. Measured ${i.paco2} is lower → concurrent respiratory alkalosis.`;
      compStatus = 'warning';
    } else {
      compText = `Expected PaCO₂ ${round(lo)}–${round(hi)} (0.7·HCO₃⁻ + 21). Appropriate compensation (rarely exceeds ~55 mmHg).`;
      compStatus = 'normal';
    }
  } else if (primary === 'respiratory acidosis') {
    const d = i.paco2 - 40;
    const acute = 24 + 0.1 * d;
    const chronicLo = 24 + 0.3 * d;
    const chronicHi = 24 + 0.4 * d;
    if (hco3 < acute - 2) {
      add('metabolic acidosis');
      compText = `Acute expected HCO₃⁻ ≈${round(acute, 1)}. Measured ${round(hco3, 1)} is lower → concurrent metabolic acidosis.`;
      compStatus = 'warning';
    } else if (hco3 <= acute + 2) {
      compText = `Acute respiratory acidosis: HCO₃⁻ ${round(hco3, 1)} ≈ expected ${round(acute, 1)} (+1 per 10 mmHg).`;
      compStatus = 'normal';
    } else if (hco3 < chronicLo) {
      compText = `HCO₃⁻ ${round(hco3, 1)} lies between acute (${round(acute, 1)}) and chronic (${round(chronicLo, 1)}–${round(chronicHi, 1)}) expectations → acute-on-chronic or evolving compensation.`;
      compStatus = 'info';
    } else if (hco3 <= chronicHi + 1) {
      compText = `Chronic respiratory acidosis: HCO₃⁻ ${round(hco3, 1)} within expected ${round(chronicLo, 1)}–${round(chronicHi, 1)} (+3–4 per 10 mmHg over 3–5 days).`;
      compStatus = 'normal';
    } else {
      add('metabolic alkalosis');
      compText = `HCO₃⁻ ${round(hco3, 1)} exceeds even chronic compensation (${round(chronicHi, 1)}) → concurrent metabolic alkalosis (diuretics, steroids, vomiting).`;
      compStatus = 'warning';
    }
  } else if (primary === 'respiratory alkalosis') {
    const d = 40 - i.paco2;
    const acute = 24 - 0.2 * d;
    const chronicLo = 24 - 0.5 * d;
    const chronicHi = 24 - 0.4 * d;
    if (hco3 > acute + 2) {
      add('metabolic alkalosis');
      compText = `Acute expected HCO₃⁻ ≈${round(acute, 1)}. Measured ${round(hco3, 1)} is higher → concurrent metabolic alkalosis.`;
      compStatus = 'warning';
    } else if (hco3 >= acute - 2) {
      compText = `Acute respiratory alkalosis: HCO₃⁻ ${round(hco3, 1)} ≈ expected ${round(acute, 1)} (−2 per 10 mmHg).`;
      compStatus = 'normal';
    } else if (hco3 >= chronicLo - 1) {
      compText = `Chronic respiratory alkalosis: HCO₃⁻ ${round(hco3, 1)} within expected ${round(chronicLo, 1)}–${round(chronicHi, 1)} (−4 to −5 per 10 mmHg).`;
      compStatus = 'normal';
    } else {
      add('metabolic acidosis');
      compText = `HCO₃⁻ ${round(hco3, 1)} is below even chronic compensation → concurrent metabolic acidosis.`;
      compStatus = 'warning';
    }
  } else if (primary === 'mixed') {
    compText = 'Two primary processes identified – compensation rules do not apply to the pair.';
    compStatus = 'warning';
  }
  steps.push({ id: 'compensation', title: '4 · Is compensation appropriate?', result: compText, status: compStatus });

  // Anion gap
  let ag: number | null = null;
  let agc: number | null = null;
  let deltaRatio: number | null = null;
  if (n(i.na) && n(i.cl)) {
    ag = anionGap(i.na, i.cl, hco3);
    agc = n(i.albumin) ? albuminCorrectedAG(ag, i.albumin) : ag;
    const high = agc > AG_UPPER;
    const albNote = n(i.albumin) && i.albumin < 3.5 ? ` Albumin ${i.albumin} g/dL hides ${round(2.5 * (4 - i.albumin), 1)} mmol/L of gap → corrected ${round(agc, 1)}.` : '';
    steps.push({
      id: 'ag',
      title: '5 · Anion gap',
      result: `AG = Na − (Cl + HCO₃⁻) = ${round(ag, 1)}.${albNote} ${high ? 'HIGH → unmeasured anions present.' : 'Not elevated.'}`,
      detail: 'Reference 8–14 mmol/L without K⁺ (check your lab). Correct for albumin: +2.5 per 1 g/dL below 4.',
      status: high ? 'abnormal' : 'normal',
    });
    if (high) {
      add('high anion gap metabolic acidosis');
      if (!disorders.includes('metabolic acidosis')) add('metabolic acidosis');
      diffs.push(...DIFFERENTIALS.hagma);
      const dHco3 = 24 - hco3;
      deltaRatio = dHco3 > 0.5 ? (agc - NORMAL_AG) / dHco3 : null;
      let dText: string;
      if (deltaRatio === null) {
        add('metabolic alkalosis');
        dText = `HCO₃⁻ is not reduced despite a high AG → a concurrent metabolic alkalosis is masking the acidosis.`;
      } else if (deltaRatio < 0.4) {
        add('normal anion gap metabolic acidosis');
        dText = `Δ ratio ${round(deltaRatio, 2)} (<0.4) → HCO₃⁻ fell far more than the gap rose: a hyperchloremic (normal-AG) acidosis predominates.`;
      } else if (deltaRatio < 0.8) {
        add('normal anion gap metabolic acidosis');
        dText = `Δ ratio ${round(deltaRatio, 2)} (0.4–0.8) → combined high-AG and normal-AG acidosis (e.g., DKA after saline, AKI).`;
      } else if (deltaRatio <= 2) {
        dText = `Δ ratio ${round(deltaRatio, 2)} (0.8–2) → pure high-AG acidosis.`;
      } else {
        add('metabolic alkalosis');
        dText = `Δ ratio ${round(deltaRatio, 2)} (>2) → HCO₃⁻ is higher than the gap explains: concurrent metabolic alkalosis (or compensated chronic respiratory acidosis).`;
      }
      steps.push({ id: 'delta', title: '6 · Delta ratio (ΔAG/ΔHCO₃⁻)', result: dText, status: deltaRatio !== null && deltaRatio >= 0.8 && deltaRatio <= 2 ? 'normal' : 'warning' });
    } else if (disorders.includes('metabolic acidosis')) {
      add('normal anion gap metabolic acidosis');
      diffs.push(...DIFFERENTIALS.nagma);
      if (n(i.urineNa) && n(i.urineK) && n(i.urineCl)) {
        const uag = i.urineNa + i.urineK - i.urineCl;
        steps.push({
          id: 'uag',
          title: '6 · Urine anion gap',
          result: `UAG = ${round(uag)} → ${uag < 0 ? 'negative: kidney is excreting NH₄⁺ appropriately → GI loss (diarrhea) or saline' : 'positive: impaired NH₄⁺ excretion → distal (type 1) or type 4 RTA'}.`,
          status: 'info',
        });
      }
    }
  } else {
    steps.push({ id: 'ag', title: '5 · Anion gap', result: 'Enter Na and Cl to calculate.', status: 'info' });
  }

  // Osmolal gap
  let osmGap: number | null = null;
  if (n(i.measuredOsm) && n(i.na) && n(i.glucose) && n(i.bun)) {
    osmGap = i.measuredOsm - calculatedOsm(i.na, i.glucose, i.bun);
    steps.push({
      id: 'osm',
      title: 'Osmolal gap',
      result: `Measured ${i.measuredOsm} − calculated ${round(calculatedOsm(i.na, i.glucose, i.bun))} = ${round(osmGap)} mOsm/kg. ${osmGap > 10 ? 'ELEVATED → toxic alcohol (methanol, ethylene glycol), propylene glycol (lorazepam infusion), mannitol.' : 'Not elevated.'}`,
      status: osmGap > 10 ? 'abnormal' : 'normal',
    });
  }

  // Stewart
  let sida: number | null = null;
  let side: number | null = null;
  let sig: number | null = null;
  if (n(i.na) && n(i.cl)) {
    const k = n(i.k) ? i.k : 4;
    const ca = n(i.ionizedCa) ? i.ionizedCa : 1.2;
    const mg = n(i.mg) ? i.mg : 0.85;
    const lac = n(i.lactate) ? i.lactate : 1;
    sida = i.na + k + 2 * ca + 2 * mg - i.cl - lac;
    if (n(i.albumin)) {
      const albGL = i.albumin * 10;
      const phosMmol = n(i.phosphate) ? i.phosphate * 0.3229 : 1.2;
      side = hco3 + albGL * (0.123 * i.ph - 0.631) + phosMmol * (0.309 * i.ph - 0.469);
      sig = sida - side;
    }
    const naCl = i.na - i.cl;
    steps.push({
      id: 'stewart',
      title: 'Stewart view',
      result: `Na–Cl difference ${round(naCl)} (normal ~32–36${naCl < 30 ? ': hyperchloremic, acidifying' : naCl > 40 ? ': hypochloremic, alkalinizing' : ''}). SIDa ${round(sida, 1)}${side !== null ? `, SIDe ${round(side, 1)}, SIG ${round(sig as number, 1)} ${(sig as number) > 3 ? '→ unmeasured anions' : ''}` : ''}.`,
      detail: 'Hypoalbuminemia is alkalinizing (~+2.5–3.7 mEq/L base excess per 1 g/dL fall) and can mask an acidosis.',
      status: 'info',
    });
  }

  if (disorders.includes('metabolic alkalosis')) diffs.push(...DIFFERENTIALS.metalk);
  if (disorders.includes('respiratory acidosis')) diffs.push(...DIFFERENTIALS.respacid);
  if (disorders.includes('respiratory alkalosis')) diffs.push(...DIFFERENTIALS.respalk);
  if (disorders.includes('metabolic acidosis') && !disorders.includes('high anion gap metabolic acidosis') && !disorders.includes('normal anion gap metabolic acidosis') && ag === null)
    diffs.push(...DIFFERENTIALS.hagma.slice(0, 2), ...DIFFERENTIALS.nagma.slice(0, 2));

  const be = standardBaseExcess(hco3, i.ph);
  const summary = buildSummary(disorders);
  return {
    steps,
    disorders,
    primary,
    summary,
    hco3,
    hco3Calculated: calc,
    internallyConsistent: consistent,
    anionGap: ag,
    correctedAnionGap: agc,
    deltaRatio,
    osmolalGap: osmGap,
    baseExcess: be,
    sidApparent: sida,
    sidEffective: side,
    sig,
    differentials: Array.from(new Set(diffs)),
  };
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildSummary(d: Disorder[]): string {
  if (d.length === 0) return 'No acid–base disorder identified.';
  const parts: string[] = [];
  if (d.includes('high anion gap metabolic acidosis')) parts.push('high-anion-gap metabolic acidosis');
  if (d.includes('normal anion gap metabolic acidosis')) parts.push('normal-anion-gap (hyperchloremic) metabolic acidosis');
  if (d.includes('metabolic acidosis') && !parts.some((p) => p.includes('metabolic acidosis'))) parts.push('metabolic acidosis');
  if (d.includes('respiratory acidosis')) parts.push('respiratory acidosis');
  if (d.includes('metabolic alkalosis')) parts.push('metabolic alkalosis');
  if (d.includes('respiratory alkalosis')) parts.push('respiratory alkalosis');
  return cap(parts.join(' + ')) + '.';
}

/** Simplified label set used to grade practice answers. */
export function coreDisorders(d: Disorder[]): Array<'met-acid' | 'met-alk' | 'resp-acid' | 'resp-alk'> {
  const out = new Set<'met-acid' | 'met-alk' | 'resp-acid' | 'resp-alk'>();
  for (const x of d) {
    if (x.includes('metabolic acidosis')) out.add('met-acid');
    if (x === 'metabolic alkalosis') out.add('met-alk');
    if (x === 'respiratory acidosis') out.add('resp-acid');
    if (x === 'respiratory alkalosis') out.add('resp-alk');
  }
  return Array.from(out);
}
