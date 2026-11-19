import type { Module } from './types';

export const SYSTEM_MODULES: Module[] = [
  {
    id: 'renal',
    number: 8,
    title: 'AKI, Fluid Overload & CRRT',
    tagline: 'Pediatric KDIGO, eGFR in children, renal angina, nephrotoxin stewardship and CRRT prescription.',
    icon: 'Filter',
    minutes: 20,
    prereqs: ['fluids'],
    objectives: [
      'Stage AKI with pediatric (and neonatal) KDIGO criteria using creatinine and urine output.',
      'Estimate GFR correctly in children and know when not to.',
      'Write a starting CRRT prescription and anticipate the small-child pitfalls.',
    ],
    concepts: [
      {
        title: 'Staging AKI',
        points: [
          'Stage 1: SCr ×1.5–1.9 baseline or +0.3 mg/dL in 48 h, or UO <0.5 mL/kg/h for 6–12 h.',
          'Stage 2: SCr ×2.0–2.9, or UO <0.5 mL/kg/h ≥12 h.',
          'Stage 3: SCr ×3, SCr ≥4.0 mg/dL, eGFR <35 mL/min/1.73 m² (<18 y), RRT, or UO <0.3 mL/kg/h ≥24 h / anuria ≥12 h.',
          'Neonatal modified KDIGO: UO thresholds ≤1, ≤0.5, ≤0.3 mL/kg/h over 24 h; SCr ≥2.5 mg/dL = stage 3. Neonatal SCr initially reflects maternal values.',
          'Unknown baseline: back-calculate from height assuming eGFR 120 mL/min/1.73 m².',
        ],
        pearl: 'A creatinine of 0.6 mg/dL is normal for an adult but is double the baseline of a 2-year-old – stage 2 AKI.',
      },
      {
        title: 'Estimating GFR',
        points: [
          'Bedside Schwartz: eGFR = 0.413 × height (cm) / SCr (mg/dL).',
          'CKiD U25 (2021) adds age- and sex-specific constants – more accurate in adolescents and young adults.',
          'All creatinine equations assume steady state: in evolving AKI they overestimate GFR. Use timed urine collections or cystatin C where available.',
        ],
      },
      {
        title: 'Predicting and preventing AKI',
        points: [
          'Renal angina index (day 0–1) = risk (ICU 1, transplant 3, ventilation + vasoactive 5) × injury (SCr change or %FO). RAI ≥8 predicts severe AKI on day 3.',
          'Nephrotoxins: ≥3 nephrotoxic drugs or ≥3 days of IV aminoglycoside/vancomycin should trigger daily creatinine; the NINJA program cut nephrotoxic AKI substantially.',
          'Venous congestion and abdominal hypertension reduce renal perfusion as much as low MAP.',
        ],
      },
      {
        title: 'Starting and running CRRT',
        points: [
          'Indications: refractory fluid overload (often FO >10–20%), hyperkalemia, acidosis, uremia, hyperammonemia, dialyzable toxins, inability to give nutrition/drugs.',
          'Effluent dose ≈2000 mL/1.73 m²/h; blood flow 3–5 mL/kg/min (higher per kg in infants).',
          'Access: right internal jugular preferred; 7 Fr (<6 kg), 8 Fr (6–15 kg), 9–10 Fr (15–30 kg), 11–12.5 Fr (>30 kg).',
          'Circuit volume >10% of blood volume → blood prime; watch for bradykinin release (hypotension) at connection.',
          'Regional citrate anticoagulation is standard; total:ionized calcium ratio >2.5 suggests citrate accumulation.',
          'SSC 2026: in septic shock requiring RRT, high-volume hemofiltration (>35 mL/kg/h) is suggested (low certainty).',
          'Re-dose drugs for CRRT clearance – antibiotics are often under-dosed.',
        ],
      },
      {
        title: 'Hemolytic uremic syndrome (STEC-HUS)',
        points: [
          'Triad: microangiopathic hemolytic anemia, thrombocytopenia, AKI – usually after bloody diarrhea.',
          'Avoid antimotility agents; antibiotics during STEC diarrhea may increase HUS risk.',
          'Transfuse RBCs for symptomatic anemia (often Hb <6–7); avoid platelets unless bleeding or a procedure requires them.',
          'Neurologic involvement, atypical features or complement-mediated disease → eculizumab discussion.',
        ],
      },
    ],
    numbers: [
      { label: 'Bedside Schwartz', value: 'eGFR = 0.413 × height(cm) / SCr' },
      { label: 'Oliguria', value: '<0.5 mL/kg/h (neonates ≤1 mL/kg/h over 24 h)' },
      { label: 'Fluid overload %', value: '(In − Out, L) ÷ admission kg × 100' },
      { label: 'Renal angina', value: 'RAI ≥8 = positive' },
      { label: 'CRRT effluent', value: '≈2000 mL/1.73 m²/h' },
      { label: 'CRRT blood flow', value: '3–5 mL/kg/min' },
    ],
    pitfalls: [
      'Using adult creatinine reference ranges in children.',
      'Calculating eGFR from a rising creatinine in AKI.',
      'Starting CRRT too late, after fluid overload exceeds 20%.',
      'Forgetting to blood-prime in infants, or to adjust antibiotic doses for CRRT.',
      'Transfusing platelets for asymptomatic HUS thrombocytopenia.',
    ],
    example: {
      title: 'Is this AKI?',
      scenario: '4-year-old, 103 cm, 16 kg, septic shock day 2. SCr 0.5 mg/dL (no baseline). UO 0.4 mL/kg/h for 14 h. In 3.6 L, out 1.8 L since admission.',
      steps: [
        { q: 'Estimated baseline creatinine?', a: '0.413 × 103 / 120 ≈ 0.35 mg/dL.' },
        { q: 'KDIGO stage?', a: 'Creatinine criterion not met (×1.4, +0.15 mg/dL), but UO <0.5 mL/kg/h for ≥12 h → stage 2 by urine output.' },
        { q: 'Fluid overload?', a: '(3.6 − 1.8) / 16 × 100 = 11%.' },
        { q: 'Next steps?', a: 'Stop nephrotoxins, consider diuretic trial once perfused, renal dosing, and discuss CRRT if FO keeps rising or oxygenation worsens.' },
      ],
    },
    tools: [{ to: '/tools/renal', label: 'AKI, eGFR, FO% & CRRT calculator' }],
    refs: ['kdigo-2012', 'ckid-2009', 'ckidu25-2021', 'rai-2014', 'ninja-2016', 'ssc-peds-2026'],
  },
  {
    id: 'neuro',
    number: 9,
    title: 'Neurocritical Care',
    tagline: 'Severe TBI to BTF 2019, timed status epilepticus treatment, raised ICP and brain death basics.',
    icon: 'Brain',
    minutes: 25,
    prereqs: ['resuscitation'],
    objectives: [
      'Prevent secondary brain injury: no hypotension, hypoxemia, hyper/hypocarbia, fever or hyponatremia.',
      'Run tiered ICP therapy with age-appropriate CPP targets.',
      'Treat status epilepticus on the clock with correct doses.',
    ],
    concepts: [
      {
        title: 'Secondary injury prevention',
        points: [
          'Avoid hypotension (even one episode worsens outcome), hypoxemia, hypo/hypercarbia (PaCO₂ 35–40), fever, hypo/hyperglycemia and hyponatremia.',
          'Head of bed 30°, neck midline, ETT ties not compressing jugular veins, adequate analgesia and sedation.',
          'GCS ≤8 after TBI → intubate and consider ICP monitoring.',
        ],
      },
      {
        title: 'ICP and CPP targets (BTF 2019)',
        points: [
          'Treat ICP ≥20 mmHg.',
          'CPP = MAP − ICP. Minimum 40 mmHg; 40–50 mmHg with infants at the lower end and adolescents at the upper end.',
          'Infants have open sutures and fontanelles: ICP rises more slowly, but a bulging fontanelle, sunset eyes or rising head circumference matter.',
          'Cushing triad (hypertension, bradycardia, irregular breathing) is late – it means herniation.',
        ],
      },
      {
        title: 'Tiered ICP therapy',
        points: [
          'Tier 1: optimize sedation/analgesia, CSF drainage (EVD), hyperosmolar therapy – 3% saline 2–5 mL/kg over 10–20 min, infusion 0.1–1 mL/kg/h; avoid sustained Na >160 (and >170 entirely).',
          'Hypertonic saline is preferred over mannitol in children (observational ADAPT data favor it for ICP crises).',
          'Avoid bolus midazolam or fentanyl during ICP crises – they drop MAP and CPP.',
          'Tier 2 (refractory): barbiturate coma, decompressive craniectomy, mild hypothermia for ICP control, and mild hyperventilation only with advanced neuromonitoring (brain tissue oxygen, CBF).',
          'Do not: give steroids, hyperventilate prophylactically (PaCO₂ <30 in the first 48 h), or use prophylactic hypothermia for neuroprotection.',
          'Seizure prophylaxis (levetiracetam or phenytoin) reduces early post-traumatic seizures.',
        ],
        pearl: 'Impending herniation: brief hyperventilation and hyperosmolar therapy are bridges – get to definitive treatment (imaging, EVD, surgery).',
      },
      {
        title: 'Status epilepticus on the clock',
        points: [
          '0–5 min: ABC, oxygen, glucose check (treat if low), time the seizure.',
          '5 min: benzodiazepine – IM/IN midazolam 0.2 mg/kg (max 10 mg), buccal 0.3 mg/kg, or IV lorazepam 0.1 mg/kg (max 4 mg). Repeat once at 5–10 min. No more than two doses.',
          '~20 min: second line – levetiracetam 60 mg/kg (max 4500 mg), fosphenytoin 20 mg PE/kg (max 1500), or valproate 40 mg/kg (max 3000). ESETT/ConSEPT/EcLiPSE: equivalent (~45–50% cessation). Phenobarbital 20 mg/kg if none available (first line in neonates).',
          '~40 min: refractory – intubate, continuous midazolam (titrate up to 2 mg/kg/h) or ketamine/pentobarbital with cEEG.',
          'After convulsions stop, non-convulsive seizures are common – get EEG if the child does not wake.',
        ],
      },
      {
        title: 'CNS infection',
        points: [
          'Do not delay antibiotics for imaging or LP. Ceftriaxone 50 mg/kg q12h + vancomycin; aciclovir if encephalitis possible; neonates: ampicillin + cefotaxime ± aciclovir.',
          'Dexamethasone 0.15 mg/kg q6h for 2–4 days, started before or with the first antibiotic dose, in suspected bacterial meningitis beyond the neonatal period.',
          'Defer LP with signs of raised ICP, shock, coagulopathy, or focal deficit.',
        ],
      },
      {
        title: 'Death by neurologic criteria (2023 consensus)',
        points: [
          'Prerequisites: known irreversible cause, normothermia, normotension for age, no confounding drugs or metabolic derangements.',
          'Examination: coma, absent brainstem reflexes, apnea test with PaCO₂ ≥60 mmHg and ≥20 above baseline without respiratory effort.',
          'Applies from term neonates (≥37 weeks); follow your institutional protocol for the number of examinations and observation periods.',
        ],
      },
    ],
    numbers: [
      { label: 'ICP threshold', value: '≥20 mmHg' },
      { label: 'CPP', value: '≥40; 40–50 mmHg (age-scaled)' },
      { label: '3% saline', value: '2–5 mL/kg bolus · 0.1–1 mL/kg/h infusion' },
      { label: 'Sodium ceiling', value: 'Avoid sustained >160 mmol/L' },
      { label: 'PaCO₂', value: '35–40 (no prophylactic <30)' },
      { label: 'SE benzodiazepine', value: 'Midazolam 0.2 mg/kg IM/IN · lorazepam 0.1 mg/kg IV' },
      { label: 'SE second line', value: 'Levetiracetam 60 · fosphenytoin 20 PE · valproate 40 mg/kg' },
    ],
    pitfalls: [
      'Accepting "normal adult" MAP after TBI in a child – use age-based CPP.',
      'Prophylactic hyperventilation.',
      'Third and fourth benzodiazepine doses instead of escalating to second-line therapy.',
      'Valproate in a child under 2 with possible metabolic or mitochondrial disease.',
      'Assuming the child is post-ictal when non-convulsive status persists.',
    ],
    example: {
      title: 'Febrile status',
      scenario: '2-year-old, 12 kg, generalized seizure for 6 minutes, no IV.',
      steps: [
        { q: 'First drug?', a: 'Midazolam 0.2 mg/kg IM/IN = 2.4 mg (or buccal 0.3 mg/kg = 3.6 mg). Check glucose.' },
        { q: 'Still seizing 8 minutes later, IV now placed.', a: 'Second benzodiazepine: lorazepam 0.1 mg/kg = 1.2 mg IV. That is the last benzodiazepine.' },
        { q: 'Seizing at 20 minutes?', a: 'Levetiracetam 60 mg/kg = 720 mg IV over 5–15 min (or fosphenytoin 240 mg PE). Avoid valproate at this age.' },
        { q: 'Still seizing at 40 minutes?', a: 'Refractory SE: secure airway, midazolam infusion titrated with cEEG, search for cause (infection, electrolytes, toxins, structural).' },
      ],
    },
    tools: [
      { to: '/tools/neuro', label: 'CPP, GCS & TBI target checker' },
      { to: '/tools/resus', label: 'Seizure drug doses' },
    ],
    refs: ['btf-2019', 'aes-2016', 'esett-2019', 'bd-2023'],
  },
  {
    id: 'endocrine',
    number: 10,
    title: 'DKA & Metabolic Emergencies',
    tagline: 'ISPAD 2022 DKA, cerebral injury, HHS, adrenal crisis, hypoglycemia and hyperammonemia.',
    icon: 'Syringe',
    minutes: 20,
    prereqs: ['fluids', 'acid-base'],
    objectives: [
      'Manage pediatric DKA to ISPAD 2022 with PECARN FLUID evidence.',
      'Detect DKA-related cerebral injury early and treat it immediately.',
      'Recognize HHS, adrenal crisis, and inborn-error emergencies.',
    ],
    concepts: [
      {
        title: 'DKA diagnosis and severity (ISPAD 2022)',
        points: [
          'Glucose >11 mmol/L (200 mg/dL), venous pH <7.3 or HCO₃⁻ <18 mmol/L, and ketonemia (β-OHB ≥3 mmol/L) or ketonuria.',
          'Mild pH <7.3 or HCO₃⁻ <18; moderate pH <7.2 or HCO₃⁻ <10; severe pH <7.1 or HCO₃⁻ <5.',
        ],
      },
      {
        title: 'Fluids',
        points: [
          'Initial 10–20 mL/kg isotonic bolus over 20–30 min (repeat if poorly perfused).',
          'Then replace the deficit (≈5–10% of body weight) plus maintenance evenly over 24–48 h.',
          'PECARN FLUID (n=1,389): fast vs slow rehydration and 0.9% vs 0.45% saline did not change neurologic outcomes – perfusion matters more than fear of fluid.',
          'Corrected Na should rise as glucose falls; a falling corrected Na is a cerebral-edema warning.',
        ],
      },
      {
        title: 'Insulin, potassium, dextrose',
        points: [
          'Insulin infusion 0.05–0.1 U/kg/h, started ≥1 h after fluids begin. No insulin bolus.',
          'Potassium: add 40 mmol/L once K <5.5 and urine output confirmed; if hypokalemic, give K before insulin.',
          'Add dextrose (5–12.5%) when glucose falls to ~14–17 mmol/L (250–300 mg/dL) or drops >5 mmol/L/h – keep insulin running to clear ketones.',
          'Bicarbonate only for life-threatening hyperkalemia or severe acidosis with cardiac compromise.',
          'Resolution: pH >7.30, HCO₃⁻ >18, β-OHB <1 mmol/L.',
        ],
      },
      {
        title: 'DKA-related cerebral injury',
        points: [
          'Usually 4–12 h into treatment, can occur before it. Risk: young age, new onset, severe acidosis, low PaCO₂, high BUN, bicarbonate use, falling corrected Na.',
          'Warning signs: headache, vomiting, irritability or lethargy, inappropriate bradycardia, rising BP, incontinence, abnormal posturing, cranial nerve palsy.',
          'Treat on clinical suspicion before imaging: mannitol 0.5–1 g/kg over 10–15 min or 3% saline 2.5–5 mL/kg; raise the head; involve PICU.',
          'If intubation is needed, match the pre-intubation hyperventilation – a sudden PaCO₂ rise worsens acidemia and edema.',
        ],
        pearl: 'Bradycardia + hypertension + headache in a child with DKA is cerebral edema until proven otherwise.',
      },
      {
        title: 'Hyperglycemic hyperosmolar state',
        points: [
          'Glucose >33.3 mmol/L (600 mg/dL), effective osmolality >320, pH >7.25 (venous), HCO₃⁻ >15, small ketones. Often adolescents with type 2 diabetes.',
          'Larger deficits: bolus ≥20 mL/kg, replace aggressively; start insulin later and lower (0.025–0.05 U/kg/h) once glucose stops falling with fluid alone.',
          'Watch for rhabdomyolysis, malignant-hyperthermia-like reactions, thrombosis.',
        ],
      },
      {
        title: 'Adrenal crisis, hypoglycemia, hyperammonemia',
        points: [
          'Adrenal crisis (CAH salt-wasting neonates at 1–3 weeks, chronic steroid use, hypopituitarism): hydrocortisone 50–100 mg/m² IV (≈2–4 mg/kg, max 100 mg), dextrose, isotonic fluid.',
          'Hypoglycemia: draw a critical sample first (glucose, insulin, cortisol, GH, β-OHB, free fatty acids, lactate, ammonia) if it does not delay treatment; D10 2–5 mL/kg. GIR >8–10 mg/kg/min suggests hyperinsulinism.',
          'Hyperammonemia: stop protein, D10 at high GIR (8–10 mg/kg/min) ± lipids to stop catabolism, ammonia scavengers + arginine, urgent dialysis if very high or rising.',
        ],
      },
    ],
    numbers: [
      { label: 'DKA bolus', value: '10–20 mL/kg over 20–30 min' },
      { label: 'Rehydration', value: 'Deficit + maintenance over 24–48 h' },
      { label: 'Insulin', value: '0.05–0.1 U/kg/h, ≥1 h after fluids, no bolus' },
      { label: 'Potassium', value: '40 mmol/L once K <5.5 and voiding' },
      { label: 'Add dextrose', value: 'At 14–17 mmol/L (250–300 mg/dL)' },
      { label: 'Cerebral injury', value: 'Mannitol 0.5–1 g/kg or 3% 2.5–5 mL/kg' },
      { label: 'Stress hydrocortisone', value: '50–100 mg/m² (max 100 mg)' },
    ],
    pitfalls: [
      'Insulin bolus or insulin before fluids.',
      'Stopping insulin when glucose falls instead of adding dextrose.',
      'Waiting for CT before treating suspected cerebral edema.',
      'Normalizing PaCO₂ after intubation in severe DKA.',
      'Missing CAH in a shocked neonate with hyponatremia and hyperkalemia.',
    ],
    example: {
      title: 'Severe DKA',
      scenario: '9-year-old, 28 kg, new onset. pH 7.05, HCO₃⁻ 4, glucose 520 mg/dL, Na 131, K 5.6. CRT 3 s.',
      steps: [
        { q: 'Severity and first fluid?', a: 'Severe (pH <7.1, HCO₃⁻ <5). 10–20 mL/kg = 280–560 mL isotonic over 20–30 min.' },
        { q: 'Rehydration plan?', a: 'Assume ~8–10% deficit (2.2–2.8 L) + maintenance, replaced evenly over 24–48 h.' },
        { q: 'Insulin and potassium?', a: 'Insulin 0.05–0.1 U/kg/h (1.4–2.8 U/h) starting ≥1 h after fluids. Add KCl 40 mmol/L once K <5.5 and voiding.' },
        { q: 'Hour 6: headache, HR 58, BP 138/88. Action?', a: 'Presumed cerebral injury: mannitol 14–28 g (0.5–1 g/kg) or 3% saline 70–140 mL now, head up, PICU, then imaging.' },
      ],
    },
    tools: [
      { to: '/tools/dka', label: 'DKA planner' },
      { to: '/labs/acid-base', label: 'DKA blood-gas drills' },
    ],
    refs: ['ispad-2022', 'pecarn-fluid-2018', 'ssc-peds-2026'],
  },
  {
    id: 'cardiac',
    number: 11,
    title: 'Cardiac Critical Care Essentials',
    tagline: 'Duct-dependent neonates, single-ventricle balance, pulmonary hypertensive crisis, low output and myocarditis.',
    icon: 'Heart',
    minutes: 25,
    prereqs: ['shock'],
    objectives: [
      'Recognize and treat duct-dependent lesions in the first weeks of life.',
      'Balance single-ventricle circulation using Qp:Qs.',
      'Manage pulmonary hypertensive crisis, low cardiac output after bypass, and myocarditis.',
    ],
    concepts: [
      {
        title: 'The shocked neonate: think duct',
        points: [
          'Shock in the first 1–3 weeks (as the ductus closes): HLHS, critical coarctation, interrupted arch, critical AS.',
          'Clues: weak/absent femoral pulses, pre- vs post-ductal SpO₂ difference, hepatomegaly, gallop, severe metabolic acidosis, failed newborn screen.',
          'Start prostaglandin E1 (alprostadil) 0.05–0.1 mcg/kg/min when the duct is closing, then the lowest effective dose (0.01–0.05). Expect apnea (prepare airway), fever, hypotension.',
          'Duct-dependent pulmonary flow (pulmonary atresia, critical PS) presents with profound cyanosis – also PGE1.',
          'Hyperoxia test: PaO₂ <100 mmHg in FiO₂ 1.0 suggests cyanotic heart disease.',
          'Treat sepsis in parallel (cultures + antibiotics) – the two look alike.',
        ],
        pearl: 'In HLHS, extra oxygen lowers PVR and steals systemic flow – target SpO₂ 75–85%.',
      },
      {
        title: 'Single-ventricle balance',
        points: [
          'Qp:Qs = (SaO₂ − SvO₂) / (SpvO₂ − SpaO₂); with complete mixing SpaO₂ = SaO₂.',
          'Balanced (~1:1): SaO₂ 75–85%, normal lactate and urine output.',
          'Over-circulated (Qp:Qs >1.5): SaO₂ >90%, low diastolic BP, rising lactate, oliguria → avoid hyperoxia and hypocarbia, reduce SVR, support inotropy.',
          'Under-circulated (Qp:Qs <0.7): SaO₂ <70% → check shunt/duct patency, lower PVR (oxygen, normocarbia, iNO), raise SVR modestly.',
        ],
      },
      {
        title: 'Pulmonary hypertensive crisis',
        points: [
          'Triggers: hypoxia, hypercarbia, acidosis, agitation, suctioning, hypothermia.',
          'Treat: 100% oxygen, inhaled NO 20 ppm, deep sedation ± paralysis, correct acidosis, ventilate at FRC (atelectasis and overinflation both raise PVR).',
          'Support the RV and coronary perfusion: keep systemic BP up (norepinephrine/epinephrine/vasopressin); avoid fluid overload; milrinone if BP tolerates.',
          'Do not stop iNO abruptly – rebound pulmonary hypertension.',
        ],
      },
      {
        title: 'Low cardiac output after bypass',
        points: [
          'Nadir 6–18 h after surgery: tachycardia, cool peripheries, rising lactate, falling ScvO₂ and urine output.',
          'Milrinone 0.25–0.75 mcg/kg/min reduces low-output syndrome (PRIMACORP: 11.7% vs 25.9% with placebo).',
          'Exclude tamponade, residual lesions, arrhythmia (junctional ectopic tachycardia: cool to 34–35 °C, reduce catecholamines, amiodarone, pacing), and pneumothorax.',
          'Mechanical support (ECMO/VAD) early when output fails despite therapy.',
        ],
      },
      {
        title: 'Myocarditis and heart failure',
        points: [
          'Often misdiagnosed as gastroenteritis, asthma or bronchiolitis: tachycardia out of proportion, hepatomegaly, gallop, tachypnea, cardiomegaly.',
          'ECG (low voltages, ectopy), troponin, BNP, echocardiogram.',
          'Small cautious boluses (5–10 mL/kg) only if preload-responsive; diuretics; low-dose epinephrine or milrinone.',
          'Induction and positive-pressure ventilation can precipitate arrest – plan with cardiology/ECMO teams.',
        ],
      },
    ],
    numbers: [
      { label: 'PGE1', value: 'Start 0.05–0.1 → maintain 0.01–0.05 mcg/kg/min' },
      { label: 'Balanced Qp:Qs', value: '≈1 (SaO₂ 75–85%)' },
      { label: 'Inhaled NO', value: '20 ppm' },
      { label: 'Milrinone', value: '0.25–0.75 mcg/kg/min' },
      { label: 'Hyperoxia test', value: 'PaO₂ <100 on FiO₂ 1.0 → cyanotic CHD likely' },
    ],
    pitfalls: [
      'Treating a duct-dependent neonate as sepsis alone and delaying PGE1.',
      'Giving 100% oxygen to an over-circulated single ventricle.',
      'Large fluid boluses in myocarditis.',
      'Abrupt iNO withdrawal.',
      'Missing tamponade in post-op low output.',
    ],
    example: {
      title: 'Gray at day 8',
      scenario: '8-day-old, 3.4 kg, poor feeding, gray, HR 190, weak femoral pulses, liver 4 cm, pre-ductal SpO₂ 95%, post-ductal 82%, lactate 9.',
      steps: [
        { q: 'Leading diagnosis?', a: 'Duct-dependent systemic circulation (critical coarctation/HLHS) with closing duct.' },
        { q: 'First drug and dose?', a: 'Alprostadil 0.05–0.1 mcg/kg/min now; prepare for apnea.' },
        { q: 'What else in parallel?', a: 'Cultures and antibiotics, careful 5–10 mL/kg fluid, low-dose epinephrine for low output, correct glucose and calcium, urgent echo.' },
        { q: 'Oxygen target?', a: 'Avoid hyperoxia; aim SpO₂ ~75–85% if single-ventricle physiology is confirmed.' },
      ],
    },
    tools: [
      { to: '/tools/cardiac', label: 'Qp:Qs & oxygen delivery' },
      { to: '/labs/shock', label: 'Shock Lab (cardiogenic / obstructive)' },
    ],
    refs: ['primacorp-2003', 'pals-2025'],
  },
  {
    id: 'sedation',
    number: 12,
    title: 'Sedation, Analgesia, Delirium & Withdrawal',
    tagline: 'SCCM PANDEM 2022: measure, protocolize, minimize benzodiazepines, screen delirium, wean safely.',
    icon: 'Moon',
    minutes: 15,
    prereqs: ['foundations'],
    objectives: [
      'Use validated pain, sedation, withdrawal and delirium scales.',
      'Build an analgesia-first, benzodiazepine-sparing protocol.',
      'Prevent and treat iatrogenic withdrawal.',
    ],
    concepts: [
      {
        title: 'Measure it',
        points: [
          'Pain: FLACC (non-verbal), numeric or faces scales (verbal), COMFORT-B (ventilated).',
          'Sedation: COMFORT-B or State Behavioral Scale (SBS), with a daily target agreed by the team.',
          'Delirium: CAPD screening at least twice daily; pCAM-ICU / psCAM-ICU alternatives.',
          'Withdrawal: WAT-1 (score ≥3 suggests withdrawal) or SOS-PD after ≥5 days of opioids/benzodiazepines.',
        ],
      },
      {
        title: 'Protocolize and minimize',
        points: [
          'Analgesia first; titrate sedation to the lightest effective level with a nurse-driven protocol.',
          'RESTORE: protocolized sedation did not shorten ventilation but reduced opioid exposure and sedative classes.',
          'Dexmedetomidine as a primary or adjunct agent reduces opioid/benzodiazepine needs (watch bradycardia, hypotension).',
          'Minimize benzodiazepines – they are an independent risk factor for delirium.',
          'Propofol infusions: avoid >4 mg/kg/h or >48 h (propofol infusion syndrome: metabolic acidosis, rhabdomyolysis, arrhythmia).',
        ],
        pearl: 'Pediatric delirium is often hypoactive and missed. A quiet child is not necessarily comfortable.',
      },
      {
        title: 'Delirium',
        points: [
          'Prevent: avoid benzodiazepines, day–night routine, family presence, glasses/hearing aids, early mobilization.',
          'Treat the cause (hypoxia, infection, metabolic, drugs, pain, withdrawal, sleep loss).',
          'Antipsychotics: limited evidence; reserve for distressing delirium, check QTc.',
        ],
      },
      {
        title: 'Iatrogenic withdrawal',
        points: [
          'Risk rises with duration (≥5 days) and cumulative dose of opioids/benzodiazepines.',
          'Wean by ~10–20% per day; slower after long exposures. Convert to enteral methadone/clonidine to facilitate weaning.',
          'Dexmedetomidine also causes withdrawal (tachycardia, hypertension, agitation) – taper or bridge with clonidine.',
        ],
      },
      {
        title: 'Neuromuscular blockade',
        points: [
          'Only with deep sedation; monitor with train-of-four (target 1–2/4) and clinical assessment.',
          'Interrupt daily when possible; protect eyes and skin; watch for ICU-acquired weakness, especially with steroids.',
        ],
      },
    ],
    numbers: [
      { label: 'Withdrawal screen', value: 'WAT-1 ≥3 after ≥5 days exposure' },
      { label: 'Wean rate', value: '~10–20% per day' },
      { label: 'Dexmedetomidine', value: '0.2–1.5 mcg/kg/h' },
      { label: 'Fentanyl', value: '0.5–3 mcg/kg/h' },
      { label: 'Propofol limit', value: '≤4 mg/kg/h and ≤48 h' },
    ],
    pitfalls: [
      'Sedation targets without measurement.',
      'Midazolam as the default sedative.',
      'Abrupt cessation of a 10-day fentanyl infusion.',
      'Assuming quiet = comfortable (hypoactive delirium).',
    ],
    example: {
      title: 'Day 9 wean',
      scenario: '18-month-old (11 kg) extubated after 9 days on fentanyl 2 mcg/kg/h and midazolam 0.1 mg/kg/h. Now sweaty, febrile 38.0 °C, yawning, loose stools, WAT-1 = 5.',
      steps: [
        { q: 'Diagnosis?', a: 'Iatrogenic opioid/benzodiazepine withdrawal (WAT-1 ≥3).' },
        { q: 'Plan?', a: 'Reinstate a dose that controls symptoms, then wean ~10–20%/day; convert to enteral methadone ± clonidine; score WAT-1 every 12 h.' },
        { q: 'What else to screen for?', a: 'Delirium (CAPD) and other causes of fever/agitation (infection).' },
      ],
    },
    tools: [{ to: '/tools/infusions', label: 'Sedation infusion calculator' }],
    refs: ['pandem-2022', 'restore-2015'],
  },
  {
    id: 'supportive',
    number: 13,
    title: 'Transfusion, Nutrition & Recovery',
    tagline: 'Restrictive transfusion (TAXI), platelets and plasma (TAXI-CAB), feeding the critically ill child, and life after PICU.',
    icon: 'Utensils',
    minutes: 15,
    prereqs: ['foundations'],
    objectives: [
      'Apply restrictive red-cell, platelet and plasma thresholds.',
      'Prescribe early enteral nutrition with adequate protein and avoid early PN.',
      'Plan rehabilitation and follow-up for PICU survivors.',
    ],
    concepts: [
      {
        title: 'Red cells',
        points: [
          'TRIPICU (2007): Hb threshold 7 g/dL was non-inferior to 9.5 g/dL in stable PICU patients.',
          'TAXI (2018): transfuse at Hb <5 g/dL; do not transfuse at Hb ≥7 g/dL in hemodynamically stable children.',
          'Exceptions needing individual judgment: active hemorrhage, cyanotic heart disease, severe hypoxemia, ECMO, acute brain injury, sickle cell disease.',
          '10–15 mL/kg PRBC raises Hb by roughly 2–3 g/dL.',
        ],
      },
      {
        title: 'Platelets and plasma (TAXI-CAB 2022)',
        points: [
          'Non-bleeding children with hypoproliferative thrombocytopenia: prophylactic platelets when the count is <10 × 10⁹/L.',
          'Do not give plasma to correct an abnormal INR alone in a non-bleeding child.',
          'Bleeding or procedures: use thresholds and viscoelastic testing per local protocol.',
        ],
      },
      {
        title: 'Nutrition (SCCM/ASPEN 2017, PEPaNIC)',
        points: [
          'Start enteral nutrition within 24–48 h when hemodynamically stable; gastric feeding is fine for most.',
          'Energy: measure with indirect calorimetry if possible; otherwise Schofield equation without stress factors – overfeeding is harmful.',
          'Protein ≥1.5 g/kg/day (higher in infants).',
          'PEPaNIC: withholding parenteral nutrition for the first week (micronutrients allowed) reduced infections and shortened PICU stay.',
          'Refeeding risk in malnourished children: start slowly, monitor phosphate, K, Mg.',
        ],
      },
      {
        title: 'Recovery and PICS-p',
        points: [
          'Survivors have new physical, cognitive, emotional and family problems (post-intensive care syndrome–pediatrics).',
          'Early mobilization and rehabilitation bundles are safe (adverse events ~5% of mobilization events) and suggested after sepsis.',
          'Arrange follow-up and educate families about expected sequelae.',
        ],
      },
    ],
    numbers: [
      { label: 'RBC threshold', value: 'Do not transfuse at Hb ≥7 (stable); always if <5' },
      { label: 'Platelets (prophylactic)', value: '<10 × 10⁹/L (hypoproliferative, not bleeding)' },
      { label: 'Enteral nutrition', value: 'Within 24–48 h' },
      { label: 'Protein', value: '≥1.5 g/kg/day' },
      { label: 'Parenteral nutrition', value: 'Withhold for the first week (PEPaNIC)' },
    ],
    pitfalls: [
      'Transfusing a stable child at Hb 7.5 "to optimize oxygen delivery".',
      'Plasma for an INR of 1.6 before a routine line.',
      'Starting PN on day 1.',
      'Applying stress factors and overfeeding.',
    ],
    example: {
      title: 'To transfuse or not',
      scenario: '6-year-old, day 5 of pneumonia, extubated, hemodynamically stable, Hb 7.2 g/dL, platelets 45, INR 1.5, no bleeding. A PICC is planned.',
      steps: [
        { q: 'Red cells?', a: 'No – stable child with Hb ≥7 (TAXI, TRIPICU).' },
        { q: 'Platelets or plasma for the PICC?', a: 'Generally no prophylactic plasma for INR 1.5; platelets per local procedure threshold (often ≥20–50) – 45 is usually acceptable for a PICC.' },
        { q: 'Nutrition?', a: 'Enteral feeding, protein ≥1.5 g/kg/day, energy by calorimetry or Schofield without stress factors.' },
      ],
    },
    tools: [{ to: '/tools/resus', label: 'Blood product volumes' }],
    refs: ['taxi-2018', 'tripicu-2007', 'taxicab-2022', 'aspen-2017', 'pepanic-2016', 'ssc-peds-2026'],
  },
];
