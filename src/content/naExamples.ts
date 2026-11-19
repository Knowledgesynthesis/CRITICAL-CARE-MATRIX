/** Worked sodium scenarios for the Fluids Lab. */
export interface NaExample {
  id: string;
  label: string;
  ageMonths: number;
  weightKg: number;
  na: number;
  glucose: number;
  infusate: string;
  volume: number;
  chronicity: 'acute' | 'chronic';
  note: string;
}

export const NA_EXAMPLES: NaExample[] = [
  {
    id: 'seizure',
    label: 'Post-op hyponatremic seizure (7 y, 22 kg)',
    ageMonths: 84,
    weightKg: 22,
    na: 119,
    glucose: 110,
    infusate: 'hts3',
    volume: 44,
    chronicity: 'acute',
    note: '2 mL/kg of 3% raises Na ≈2 mmol/L per bolus; repeat up to twice until the seizure stops, then slow down.',
  },
  {
    id: 'siadh',
    label: 'Chronic SIADH with bronchiolitis (3 mo, 6 kg)',
    ageMonths: 3,
    weightKg: 6,
    na: 124,
    glucose: 90,
    infusate: 'ns',
    volume: 500,
    chronicity: 'chronic',
    note: 'The formula predicts a rise, but in SIADH with urine osmolality above ~308 mOsm/kg, 0.9% saline can paradoxically LOWER sodium: the kidney excretes the salt and keeps the water. Restrict free water; use 3% only for symptoms.',
  },
  {
    id: 'hypernatremic-newborn',
    label: 'Breastfeeding failure, Na 164 (1 wk, 3.4 kg)',
    ageMonths: 0.25,
    weightKg: 3.4,
    na: 164,
    glucose: 80,
    infusate: 'ns',
    volume: 100,
    chronicity: 'chronic',
    note: 'Restore circulation with isotonic boluses first – even 0.9% saline (Na 154) lowers a sodium of 164. Then correct ≤0.5 mmol/L/h; seizures during correction mean it is too fast.',
  },
  {
    id: 'dka',
    label: 'DKA: glucose-corrected sodium (9 y, 28 kg)',
    ageMonths: 108,
    weightKg: 28,
    na: 131,
    glucose: 520,
    infusate: 'ns',
    volume: 1000,
    chronicity: 'chronic',
    note: 'Measured Na 131 corrects to ≈138 at glucose 520. Corrected Na should rise as glucose falls; a falling corrected Na is a cerebral-injury warning.',
  },
  {
    id: 'di',
    label: 'Central DI after craniopharyngioma (10 y, 30 kg)',
    ageMonths: 120,
    weightKg: 30,
    na: 158,
    glucose: 100,
    infusate: 'half',
    volume: 1000,
    chronicity: 'acute',
    note: 'Acute (<48 h) hypernatremia tolerates faster correction than chronic, but the triphasic response means SIADH can follow DI – check Na every 2–4 h and titrate desmopressin/vasopressin to urine output.',
  },
];
