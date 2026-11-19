import type { Module } from './types';

export const CORE_MODULES: Module[] = [
  {
    id: 'foundations',
    number: 1,
    title: 'The Child Is Not a Small Adult',
    tagline: 'Size, age-based normals and the physiology that makes children decompensate differently.',
    icon: 'Baby',
    minutes: 15,
    prereqs: [],
    objectives: [
      'Estimate weight, normal vital signs, hypotension threshold and airway equipment for any age in under a minute.',
      'Explain why infants desaturate fast, depend on heart rate, and become hypotensive late.',
      'Dose every drug per kilogram and cap it at the adult maximum.',
    ],
    concepts: [
      {
        title: 'Weight is the master variable',
        points: [
          'Measured weight > length-based tape > formula. APLS: 0–12 mo = 0.5 × months + 4; 1–5 y = 2 × age + 8; 6–12 y = 3 × age + 7.',
          'Calculate per kg, then cap at the adult maximum dose – large adolescents otherwise receive supratherapeutic doses.',
          'Write and read back both mg and mL. Ten-fold errors (decimal slips) are the signature pediatric medication error.',
        ],
        pearl: 'Tidal volume is sized to predicted (not actual) weight; most resuscitation drugs use actual weight up to the adult dose.',
      },
      {
        title: 'Airway anatomy',
        points: [
          'Large occiput (shoulder roll for infants), large tongue, high anterior larynx, long floppy epiglottis (straight blade helps).',
          'Resistance rises with 1/r⁴: 1 mm of edema in a 4 mm infant airway increases resistance ~16-fold. Small changes = big work of breathing.',
          'Short trachea: neck flexion pushes the tube in (mainstem), extension pulls it out. Re-check depth after every move.',
          'Cuffed tubes are standard beyond the newborn period; keep cuff pressure ≤20–25 cmH₂O.',
        ],
      },
      {
        title: 'Breathing: little reserve',
        points: [
          'O₂ consumption is ~6–8 mL/kg/min in infants vs 3–4 in adults, with a small FRC → desaturation within seconds of apnea.',
          'Compliant chest wall and horizontal ribs make the diaphragm do the work; retractions and see-saw breathing signal failure.',
          'Young infants (<2 months, ex-preterm) develop apnea with RSV and pertussis.',
        ],
        pearl: 'Most pediatric cardiac arrests are respiratory or circulatory failure progressing to bradycardia – not primary arrhythmias.',
      },
      {
        title: 'Circulation: compensated until it is not',
        points: [
          'Cardiac output = HR × SV. The infant ventricle has little stroke-volume reserve, so output depends on heart rate – bradycardia is pre-arrest.',
          'Tachycardia and intense vasoconstriction hold blood pressure normal until ~25–30% of circulating volume is lost. Hypotension is late and ominous.',
          'Perfusion is assessed clinically: capillary refill (≤2 s), central vs peripheral pulses, skin temperature gradient, mental status, urine output (≥1 mL/kg/h).',
        ],
        pearl: 'Compensated shock = normal BP + tachycardia + poor perfusion. Treat it then.',
      },
      {
        title: 'Metabolism, water and temperature',
        points: [
          'Small glycogen stores: check glucose in every sick, seizing, or obtunded infant.',
          'Total body water ≈ 75–80% at birth → 60% by 1 year; higher insensible losses per kg.',
          'High surface-area-to-mass ratio → rapid heat loss; hypothermia worsens coagulopathy and acidosis.',
        ],
      },
    ],
    numbers: [
      { label: 'Weight (APLS)', value: '0.5×mo+4 · 2×age+8 · 3×age+7' },
      { label: 'Hypotension (SBP)', value: '<60 neonate · <70 infant · <70+2×age (1–10 y) · <90 (>10 y)' },
      { label: 'Heart rate, awake', value: '85–205 (0–3 mo) · 100–190 (3 mo–2 y) · 60–140 (2–10 y) · 60–100 (>10 y)' },
      { label: 'Respiratory rate', value: '30–53 infant · 22–37 toddler · 20–28 preschool · 18–25 school · 12–20 teen' },
      { label: 'Cuffed ETT', value: 'Age/4 + 3.5 (≥2 y); 3.0 <8 mo; 3.5 8 mo–2 y; depth ≈ 3 × ID' },
      { label: 'Blood volume', value: '85 neonate · 80 infant · 75 child · 70 mL/kg adolescent' },
      { label: 'Maintenance (4-2-1)', value: '4 mL/kg/h first 10 kg, 2 next 10, 1 thereafter' },
      { label: 'O₂ consumption', value: '6–8 mL/kg/min infant vs 3–4 adult' },
    ],
    pitfalls: [
      'Using adult blood-pressure thresholds – a 2-year-old with SBP 72 is hypotensive (threshold 74).',
      'Waiting for hypotension before diagnosing shock.',
      'Skipping the glucose check in a lethargic or seizing infant.',
      'Not capping weight-based doses in large adolescents.',
      'Hyperextending an infant\'s neck – it kinks the soft trachea; use a neutral position and shoulder roll.',
    ],
    example: {
      title: 'Sixty-second prep',
      scenario: 'A 3-year-old arrives seizing and gray. No weight is available.',
      steps: [
        { q: 'Estimated weight?', a: 'APLS 2 × 3 + 8 = 14 kg (use a length-based tape if available).' },
        { q: 'Hypotension threshold?', a: '70 + 2 × 3 = 76 mmHg systolic.' },
        { q: 'Endotracheal tube?', a: 'Cuffed 3/4 + 3.5 ≈ 4.0–4.5; prepare 4.0 cuffed plus one size up and down; depth ≈ 12–13 cm at the lip.' },
        { q: 'First seizure drug and the bedside test you must not forget?', a: 'Midazolam 0.2 mg/kg IM/IN = 2.8 mg (max 10 mg). Point-of-care glucose – treat <60 mg/dL with D10 2–5 mL/kg.' },
      ],
    },
    tools: [
      { to: '/tools/resus', label: 'Weight-based resuscitation card' },
      { to: '/reference', label: 'Normal values by age' },
    ],
    refs: ['pals-2025', 'pbls-2025'],
  },
  {
    id: 'resuscitation',
    number: 2,
    title: 'Resuscitation & Airway',
    tagline: 'PALS 2025: high-quality CPR, early epinephrine, safe intubation and post-arrest targets.',
    icon: 'HeartPulse',
    minutes: 20,
    prereqs: ['foundations'],
    objectives: [
      'Lead pediatric CPR to AHA/AAP 2025 standards with correct weight-based drugs and energies.',
      'Prevent peri-intubation arrest: resuscitate before you intubate.',
      'Deliver post-ROSC blood pressure, oxygen, CO₂ and temperature targets.',
    ],
    concepts: [
      {
        title: 'Why children arrest',
        points: [
          'Usually hypoxia or shock → bradycardia → PEA/asystole. VF/pVT is less common (higher in adolescents, cardiac disease, sudden witnessed collapse).',
          'HR <60/min with poor perfusion despite oxygenation and ventilation → start chest compressions.',
        ],
      },
      {
        title: 'High-quality CPR',
        points: [
          'Rate 100–120/min; depth ≥⅓ of the AP diameter (≈4 cm infant, ≈5 cm child, 5–6 cm adolescent); full recoil; pauses <10 s.',
          '15:2 with two rescuers (30:2 single rescuer). With an advanced airway: continuous compressions and 1 breath every 2–3 s (20–30/min).',
          'Infants (2025): two-thumb encircling technique, or one hand; the two-finger technique was removed because it cannot achieve depth.',
          'Bag-mask ventilation is adequate for most arrests – do not interrupt CPR or delay drugs to intubate.',
          'If an arterial line is in place, aim diastolic BP ≥25 mmHg (infants) / ≥30 mmHg (children).',
        ],
        pearl: 'Hyperventilation during CPR raises intrathoracic pressure and cuts venous return – count your breaths.',
      },
      {
        title: 'Drugs and electricity',
        points: [
          'Epinephrine 0.01 mg/kg IV/IO (0.1 mL/kg of 0.1 mg/mL, max 1 mg) every 3–5 min. Non-shockable rhythms: give the first dose as early as possible.',
          'VF/pVT: shock 2 J/kg → 4 J/kg → ≥4 J/kg (max 10 J/kg or adult dose). Amiodarone 5 mg/kg or lidocaine 1 mg/kg for shock-refractory rhythm.',
          'Calcium and bicarbonate are not routine – only for hyperkalemia, hypocalcemia, or specific toxins.',
          'Think reversible causes: hypoxia, hypovolemia, H⁺, hypo/hyperkalemia, hypoglycemia, hypothermia, tension pneumothorax, tamponade, toxins, thrombosis.',
        ],
      },
      {
        title: 'Intubating the sick child',
        points: [
          'Pre-oxygenate; use apneic oxygenation; have a smaller tube, suction, and a plan B (supraglottic airway) ready.',
          'Shock: ketamine (reduced dose if catecholamine-depleted) + rocuronium; fluid and epinephrine prepared or running. SSC 2026 suggests against etomidate in septic shock.',
          'Atropine is not routine; use it when bradycardia risk is high (young infants, succinylcholine, vagal stimulation).',
          'Highest risk of peri-intubation arrest: shock, hypoxemia, pulmonary hypertension, myocarditis, anterior mediastinal mass – involve the most experienced operator and consider ECMO standby.',
        ],
        pearl: 'Positive-pressure ventilation removes negative intrathoracic pressure that was driving venous return. A preload-dependent child can arrest at the first breath.',
      },
      {
        title: 'Post-cardiac-arrest care',
        points: [
          'Keep systolic and mean BP above the 10th percentile for age (new in 2025). Hypotension after ROSC is common and harmful.',
          'SpO₂ 94–99%; avoid both hypoxemia and hyperoxemia. PaCO₂ normal for the patient.',
          'Prevent fever: keep ≤37.5 °C in children who remain comatose. THAPCA: 33 °C was no better than 36.8 °C.',
          'Continuous EEG where available; neuroprognosticate with multiple modalities at several time points, never on one early finding.',
        ],
      },
      {
        title: 'Arrhythmias with a pulse',
        points: [
          'SVT (infant HR usually >220, child >180, no visible P waves, fixed RR): vagal maneuvers (ice to face), adenosine 0.1 → 0.2 mg/kg rapid push.',
          'Unstable SVT/VT: synchronized cardioversion 0.5–1 J/kg, then 2 J/kg.',
          'Bradycardia: oxygenate and ventilate first; epinephrine; atropine for vagal tone or primary AV block; pacing for complete heart block.',
        ],
      },
    ],
    numbers: [
      { label: 'Compression rate / depth', value: '100–120/min · ≥⅓ AP diameter' },
      { label: 'Ratio', value: '15:2 (2 rescuers) · 30:2 (1 rescuer)' },
      { label: 'Ventilation with advanced airway', value: '1 breath every 2–3 s (20–30/min)' },
      { label: 'Epinephrine', value: '0.01 mg/kg IV/IO (max 1 mg) q3–5 min · ETT 0.1 mg/kg' },
      { label: 'Defibrillation', value: '2 → 4 → ≥4 J/kg (max 10 J/kg)' },
      { label: 'Cardioversion', value: '0.5–1 → 2 J/kg' },
      { label: 'Adenosine', value: '0.1 mg/kg (max 6) → 0.2 mg/kg (max 12)' },
      { label: 'Post-ROSC', value: 'SBP/MAP >10th centile · SpO₂ 94–99% · T ≤37.5 °C' },
    ],
    pitfalls: [
      'Interrupting compressions or delaying epinephrine to place an advanced airway.',
      'Atropine for hypoxic bradycardia instead of oxygenation and ventilation.',
      'Inducing a shocked child with propofol or full-dose midazolam and no vasoactive ready.',
      'Two-finger compressions in infants (removed in 2025).',
      'Allowing fever or hypotension in the first days after ROSC.',
    ],
    example: {
      title: 'Asystole in an infant',
      scenario: 'An 8-month-old (8 kg) is found pulseless; the monitor shows asystole. IO access is obtained in 60 s.',
      steps: [
        { q: 'CPR technique?', a: 'Two-thumb encircling, depth ≈4 cm, 100–120/min, 15:2 with bag-mask, minimal pauses.' },
        { q: 'First drug and dose?', a: 'Epinephrine 0.08 mg = 0.8 mL of 0.1 mg/mL IO as soon as access is obtained, then every 3–5 min.' },
        { q: 'Rhythm changes to VF. Energy?', a: '2 J/kg = 16 J, then 4 J/kg = 32 J. Amiodarone 40 mg (5 mg/kg) after the third shock.' },
        { q: 'ROSC at 9 minutes. Targets for the next 72 h?', a: 'SBP above the 10th centile (>~75 mmHg), SpO₂ 94–99%, normal PaCO₂, temperature ≤37.5 °C, glucose normal, cEEG.' },
      ],
    },
    tools: [{ to: '/tools/resus', label: 'Weight-based resuscitation card' }],
    refs: ['pals-2025', 'pbls-2025', 'thapca-2015', 'ssc-peds-2026'],
  },
  {
    id: 'shock',
    number: 3,
    title: 'Shock & Sepsis',
    tagline: 'Phoenix 2024 definitions, SSC Children 2026 bundle, and matching drugs to physiology.',
    icon: 'Activity',
    minutes: 25,
    prereqs: ['foundations'],
    objectives: [
      'Apply the Phoenix criteria for sepsis and septic shock.',
      'Deliver the first-hour bundle: lactate, cultures, antimicrobials, titrated fluid, early vasoactives.',
      'Choose epinephrine, norepinephrine, vasopressin or an inodilator from the hemodynamic profile.',
    ],
    concepts: [
      {
        title: 'Definitions: Phoenix 2024',
        points: [
          'Sepsis = suspected infection + Phoenix score ≥2 (respiratory, cardiovascular, coagulation, neurologic).',
          'Septic shock = sepsis + ≥1 cardiovascular point (any vasoactive, lactate ≥5 mmol/L, or age-based hypotension).',
          'SIRS-based 2005 criteria are retired. Phoenix identifies established organ dysfunction – it is not a screening tool.',
          'In-hospital mortality with Phoenix ≥2: ~7% in high-resource vs ~28% in lower-resource settings.',
        ],
      },
      {
        title: 'The first hour (SSC 2026)',
        points: [
          'Measure lactate during initial evaluation (strong recommendation).',
          'Blood cultures before antimicrobials if they do not delay them.',
          'Suspected septic shock: antimicrobials as soon as possible, ideally within 1 h (strong). Probable sepsis without shock: rapid time-limited evaluation, antimicrobials within 3 h if the concern is substantiated.',
          'Emergent source control; remove infected intravascular devices once alternative access exists.',
        ],
      },
      {
        title: 'Fluids: titrate, reassess, stop',
        points: [
          'With intensive care available: up to 40–60 mL/kg in 10–20 mL/kg boluses over the first hour, each followed by reassessment.',
          'No intensive care and no hypotension: no bolus – maintenance fluids only (FEAST; strong). Hypotension without ICU: up to 40 mL/kg.',
          'Crystalloid over albumin; avoid starches. SSC 2026 suggests balanced crystalloids (very-low certainty). PRoMPT BOLUS (NEJM 2026, 9,041 children) found no difference vs 0.9% saline in death or kidney outcomes – either is acceptable.',
          'Stop signs: new hepatomegaly, crackles, rising work of breathing or oxygen need, rising CVP without a stroke-volume response.',
        ],
        pearl: 'Hepatomegaly is the pediatric "stop fluids" sign. Infants and children with myocardial dysfunction reach the flat part of the Starling curve after 20–40 mL/kg.',
      },
      {
        title: 'Vasoactive choice',
        points: [
          'SSC 2026: no recommendation for epinephrine vs norepinephrine as first line – match the physiology.',
          'Cold shock (low output, high SVR, CRT >3 s, narrow pulse pressure): epinephrine 0.02–0.3 mcg/kg/min.',
          'Warm shock (vasoplegia, flash CRT, low diastolic, wide pulse pressure): norepinephrine 0.02–0.3 mcg/kg/min.',
          'Start peripherally or via IO rather than delay for a central line (extravasation ~2.5%).',
          'Rising catecholamine requirement: add vasopressin (0.3–2 milliunits/kg/min) or titrate further.',
          'Dopamine is not a first choice where epinephrine or norepinephrine are available.',
        ],
      },
      {
        title: 'Refractory shock checklist',
        points: [
          'Correct ionized calcium and glucose; look for pneumothorax, pericardial effusion, abdominal compartment syndrome, uncontrolled source.',
          'Hydrocortisone: not routine when fluids and vasoactives restore stability; for suspected adrenal insufficiency use 50 mg/m²/day (1–2 mg/kg/day) after a stress bolus.',
          'Central line: target ScvO₂ ≥70% (conditional). Cardiac and lung ultrasound guide fluids and inotropy.',
          'Oxygen: target SpO₂ 88–92% rather than >94% (new, moderate certainty) – except CO poisoning, severe TBI, acute hemorrhagic anemia, cyanotic heart disease.',
          'Refractory hypoxemia → VV-ECMO; refractory shock → VA-ECMO.',
        ],
      },
      {
        title: 'Other shock states',
        points: [
          'Hypovolemic: 20 mL/kg boluses with brisk, visible response.',
          'Hemorrhagic: blood early, balanced products, tranexamic acid 15 mg/kg within 3 h; limit crystalloid (dilutional coagulopathy).',
          'Cardiogenic (myocarditis, SVT, cardiomyopathy): 5–10 mL/kg only if preload-responsive; inotropy/inodilator; early ECMO consultation.',
          'Obstructive: tamponade, tension pneumothorax, massive PE, duct-dependent lesions in neonates (prostaglandin E1).',
          'Anaphylaxis: IM epinephrine 0.01 mg/kg first, then infusion and large volumes if refractory.',
        ],
      },
      {
        title: 'After stabilization',
        points: [
          'Prevent fluid accumulation; consider active removal once perfusion is stable – fluid overload >10–15% is associated with mortality.',
          'Early individualized rehabilitation and post-discharge evaluation for new sequelae (SSC 2026).',
        ],
      },
    ],
    numbers: [
      { label: 'Fluid bolus', value: '10–20 mL/kg, reassess after each; up to 40–60 mL/kg in hour 1' },
      { label: 'Antimicrobials', value: '≤1 h septic shock · ≤3 h probable sepsis' },
      { label: 'Phoenix shock', value: 'Any vasoactive, lactate ≥5, or MAP below age cut-off' },
      { label: 'Epinephrine / norepinephrine', value: '0.02–0.3 mcg/kg/min (higher if refractory)' },
      { label: 'Vasopressin', value: '0.3–2 milliunits/kg/min' },
      { label: 'ScvO₂ target', value: '≥70%' },
      { label: 'SpO₂ target (SSC 2026)', value: '88–92%' },
      { label: 'Stress hydrocortisone', value: '50 mg/m²/day or 1–2 mg/kg/day divided' },
    ],
    pitfalls: [
      'Waiting for hypotension before treating shock.',
      'Giving 60 mL/kg on autopilot without reassessing each bolus.',
      'Bolusing myocarditis like sepsis.',
      'Delaying vasoactives for central access.',
      'Etomidate for intubation in septic shock.',
      'Reading a rising lactate on epinephrine as worsening perfusion – β2 stimulation raises lactate on its own.',
      'Missing hypoglycemia and hypocalcemia.',
    ],
    example: {
      title: 'Cold shock in an infant',
      scenario: '8-month-old, 8 kg, febrile, lethargic, mottled. HR 192, CRT 5 s, BP 72/48 (MAP 56), lactate 5.6, on HFNC with SpO₂ 93% at FiO₂ 0.4.',
      steps: [
        { q: 'Does she meet Phoenix septic shock?', a: 'Respiratory: S/F 232 on support → 1. Cardiovascular: lactate ≥5 → 1 (MAP 56 ≥39 → 0). Total 2 with suspected infection = sepsis; CV ≥1 = septic shock.' },
        { q: 'First 15 minutes?', a: 'IO/IV ×2, blood culture, lactate, glucose, iCa. Antimicrobials now (e.g., ceftriaxone 100 mg/kg = 800 mg ± vancomycin). 10–20 mL/kg (80–160 mL) bolus over 5–10 min, then reassess.' },
        { q: 'After 40 mL/kg: liver edge 3 cm, fine crackles, CRT 4 s. Next?', a: 'Stop boluses. Start epinephrine 0.05–0.1 mcg/kg/min peripherally/IO. Correct iCa and glucose.' },
        { q: 'She needs intubation. Plan?', a: 'Epinephrine running; ketamine 1 mg/kg (reduced) + rocuronium 1.2 mg/kg; avoid etomidate and propofol; bolus syringe ready; then SpO₂ target 88–92%.' },
      ],
    },
    tools: [
      { to: '/labs/shock', label: 'Shock Lab (Guyton simulator)' },
      { to: '/tools/phoenix', label: 'Phoenix score calculator' },
      { to: '/tools/infusions', label: 'Infusion calculator' },
    ],
    refs: ['ssc-peds-2026', 'phoenix-2024', 'prompt-bolus-2026', 'feast-2011', 'pals-2025'],
  },
  {
    id: 'respiratory',
    number: 4,
    title: 'Respiratory Failure & Non-invasive Support',
    tagline: 'Bronchiolitis, asthma, croup and upper-airway emergencies – HFNC and NIV done right.',
    icon: 'Wind',
    minutes: 20,
    prereqs: ['foundations'],
    objectives: [
      'Recognize impending respiratory failure clinically, before the blood gas.',
      'Prescribe HFNC and NIV with evidence-based flows and failure criteria.',
      'Run the acute severe asthma ladder and avoid the classic intubation disasters.',
    ],
    concepts: [
      {
        title: 'Recognize failure early',
        points: [
          'Work of breathing: retractions, nasal flaring, head bobbing, grunting (an expiratory brake to hold FRC), see-saw breathing.',
          'Inspiratory stridor = extrathoracic obstruction; expiratory wheeze = intrathoracic.',
          'Late signs: falling RR or effort, quiet chest, agitation → drowsiness, apnea in young infants.',
          'SpO₂ on high FiO₂ can hide hypoventilation – watch CO₂ (capnography or blood gas) and mental status.',
        ],
      },
      {
        title: 'High-flow nasal cannula and NIV',
        points: [
          'HFNC washes out nasopharyngeal dead space, gives modest flow-dependent PEEP and reduces work of breathing.',
          'Bronchiolitis: 2 L/kg/min. TRAMONTANE 2: 3 L/kg/min was no better and less comfortable.',
          'PARIS: high flow as escalation on the ward reduced treatment failure (12% vs 23%) compared with standard oxygen.',
          'FIRST-ABC: HFNC was non-inferior to CPAP as first-line (step-up) support but did not meet non-inferiority after extubation (step-down).',
          'PALICC-2: use a time-limited NIV trial when intubation is not clearly indicated; intubate if no improvement within 6 h or if worsening.',
        ],
      },
      {
        title: 'Bronchiolitis (AAP 2014)',
        points: [
          'Supportive care: no salbutamol, epinephrine, or systemic steroids; no routine chest X-ray or viral testing.',
          'Accept SpO₂ ≥90% in otherwise stable infants; gentle nasal suction; NG feeds or isotonic IV fluids if intake is poor.',
          'Highest risk: <2 months, prematurity, chronic lung or heart disease, immunodeficiency.',
          'Prevention: maternal RSVpreF vaccine or infant long-acting RSV monoclonal antibody.',
        ],
        pearl: 'Young infants with RSV can present with apnea before they look "tight" – monitor them.',
      },
      {
        title: 'Acute severe asthma',
        points: [
          'Salbutamol back-to-back ×3, then continuous 0.5 mg/kg/h (max ~20 mg/h); ipratropium ×3 in the first hour.',
          'Systemic steroids early: dexamethasone 0.6 mg/kg (max 16 mg) or methylprednisolone 1–2 mg/kg/day.',
          'IV magnesium 50 mg/kg (max 2 g) over 20 min; then IV terbutaline or aminophylline; ketamine; heliox; NIV in a cooperative child.',
          'Side effects of β-agonists: hypokalemia, tachycardia, lactic acidosis (type B), worsening V/Q.',
          'A normal or rising PaCO₂ in a child still working hard means exhaustion.',
        ],
        pearl: 'Intubation is a last resort: ketamine induction, then low rate, long exhalation, accept hypercapnia. If BP collapses after intubation, disconnect and let the chest empty (auto-PEEP).',
      },
      {
        title: 'Upper airway obstruction',
        points: [
          'Croup: dexamethasone 0.15–0.6 mg/kg; nebulized epinephrine (1 mg/mL L-epinephrine 0.5 mL/kg, max 5 mL) for stridor at rest.',
          'Epiglottitis/bacterial tracheitis: keep the child calm and upright, no IV or exam that causes distress, airway in the OR with ENT.',
          'Foreign body (2025): infants – 5 back blows alternating with 5 chest thrusts; children – 5 back blows alternating with 5 abdominal thrusts.',
          'Post-extubation stridor risk: dexamethasone 0.5 mg/kg q6h started 6–24 h before extubation.',
        ],
      },
    ],
    numbers: [
      { label: 'HFNC flow (bronchiolitis)', value: '2 L/kg/min' },
      { label: '"Possible PARDS" on HFNC', value: '≥1.5 L/kg/min or ≥30 L/min with S/F ≤250 or P/F ≤300' },
      { label: 'NIV trial', value: 'Reassess within 6 h; intubate if no improvement' },
      { label: 'Bronchiolitis SpO₂ floor', value: '≥90%' },
      { label: 'Continuous salbutamol', value: '0.5 mg/kg/h (max ~20 mg/h)' },
      { label: 'IV magnesium', value: '50 mg/kg (max 2 g) over 20 min' },
      { label: 'Croup dexamethasone', value: '0.15–0.6 mg/kg' },
    ],
    pitfalls: [
      'Sedating or examining the throat of a child with impending upper-airway obstruction.',
      'Trusting SpO₂ on high FiO₂ as evidence of adequate ventilation.',
      'Bronchodilators and steroids for bronchiolitis.',
      'Reassurance from a "normal" PaCO₂ in severe asthma.',
      'Bagging an intubated asthmatic fast – breath stacking, tension physiology, arrest.',
    ],
    example: {
      title: 'Bronchiolitis escalation',
      scenario: '6-week-old (4.5 kg) with RSV. RR 72, severe retractions, two apneas, SpO₂ 87% on 2 L/min nasal cannula.',
      steps: [
        { q: 'HFNC settings?', a: '2 L/kg/min ≈ 9 L/min, FiO₂ titrated to SpO₂ ≥90–92%.' },
        { q: 'What do you reassess and when?', a: 'At 60–90 min: RR, work of breathing, HR, S/F ratio, apneas, CO₂. Failure → CPAP/NIV; recurrent apnea or exhaustion → intubation.' },
        { q: 'Nutrition and fluids?', a: 'NG feeds if safe; otherwise isotonic IV fluid with dextrose and KCl – watch for SIADH (RSV raises ADH).' },
        { q: 'Should she get salbutamol or dexamethasone?', a: 'No. Neither improves outcomes in bronchiolitis (AAP strong recommendation).' },
      ],
    },
    tools: [
      { to: '/labs/ventilator', label: 'Ventilator Lab (asthma / bronchiolitis presets)' },
      { to: '/tools/resus', label: 'Drug card: airway & asthma' },
    ],
    refs: ['aap-bronch-2014', 'paris-2018', 'tramontane2-2018', 'firstabc-2022', 'palicc2-2023', 'gina-2025', 'pbls-2025', 'nirsevimab-2023'],
  },
  {
    id: 'ventilation',
    number: 5,
    title: 'Mechanical Ventilation & PARDS',
    tagline: 'PALICC-2 lung protection, PEEP, oxygen targets, time constants and liberation.',
    icon: 'Gauge',
    minutes: 25,
    prereqs: ['respiratory'],
    objectives: [
      'Diagnose and stratify PARDS with OI/OSI.',
      'Set PALICC-2 lung-protective targets: tidal volume, plateau and driving pressure, PEEP, SpO₂, pH.',
      'Diagnose auto-PEEP and dead-space problems from the numbers and waveforms.',
    ],
    concepts: [
      {
        title: 'PARDS definition (PALICC-2)',
        points: [
          'Within 7 days of a known insult; new opacities consistent with parenchymal disease; not fully explained by cardiac failure or fluid overload.',
          'Invasive ventilation: OI ≥4 or OSI ≥5. Severe: OI ≥16 or OSI ≥12 (stratify ≥4 h after diagnosis).',
          'NIV (full-face, CPAP ≥5): P/F ≤300 or S/F ≤250; severe if P/F ≤100 or S/F ≤150.',
          'OI = mean airway pressure × FiO₂ × 100 / PaO₂. OSI uses SpO₂ (valid only ≤97%).',
          'Airway obstruction alone (asthma, viral wheeze) is not PARDS.',
        ],
        pearl: 'Children use OI/OSI because mean airway pressure captures how hard you are working to oxygenate – P/F alone ignores PEEP.',
      },
      {
        title: 'Lung-protective targets',
        points: [
          'Tidal volume 6–8 mL/kg of the LESSER of predicted and actual body weight; go below 6 only to respect pressure limits; caution below 4.',
          'Plateau pressure ≤28 cmH₂O (29–32 acceptable if chest-wall elastance is high – obesity, abdominal distension).',
          'Driving pressure (Pplat − PEEP) ≤15 cmH₂O.',
          'Use cuffed tubes so volumes and pressures are measurable.',
        ],
      },
      {
        title: 'PEEP and oxygen',
        points: [
          'PEEP at or above the ARDSnet lower-PEEP/higher-FiO₂ table (strong recommendation); titrate to oxygenation, hemodynamics and compliance.',
          'No sustained-inflation recruitment maneuvers; slow stepwise PEEP changes are acceptable.',
          'SpO₂ 92–97% in mild/moderate PARDS. In severe PARDS, after optimizing PEEP, accept <92% (monitor ScvO₂ and lactate). Avoid prolonged <88% or >97%.',
          'Oxy-PICU (2024): conservative SpO₂ 88–92% reduced the burden of organ support vs >94% in ventilated children.',
        ],
      },
      {
        title: 'CO₂: permissive hypercapnia and dead space',
        points: [
          'Accept pH ≥7.20 to stay within pressure/volume limits – not with raised ICP, severe pulmonary hypertension, some congenital heart lesions, hemodynamic instability or ventricular dysfunction.',
          'PaCO₂ = 0.863 × VCO₂ / alveolar ventilation. Raising Vt in a dead-space-limited patient helps more than raising RR.',
          'Equipment dead space is huge relative to an infant\'s tidal volume: an adult HME (~30–50 mL) on a 3 kg baby (Vt ~20 mL) prevents CO₂ clearance.',
          'Rising PaCO₂–ETCO₂ gap = rising alveolar dead space (overdistension, low output, PE).',
        ],
      },
      {
        title: 'Time constants and auto-PEEP',
        points: [
          'τ = resistance × compliance. Exhalation needs 3–5 τ. Small ETTs and bronchospasm lengthen τ.',
          'Auto-PEEP: expiratory flow does not return to zero before the next breath. Fix by lowering RR and Ti (longer Te), treating bronchospasm.',
          'Auto-PEEP raises Pplat, lowers venous return and can cause PEA – disconnect the circuit to diagnose and treat.',
        ],
      },
      {
        title: 'Adjuncts (what PALICC-2 says)',
        points: [
          'Neuromuscular blockade only if protective ventilation cannot be achieved with sedation, at the minimum effective depth.',
          'Prone positioning and HFOV: insufficient evidence for or against. Inhaled NO: not routine (selective use, e.g., pulmonary hypertension, bridge to ECMO; reassess within 4 h).',
          'Against routine corticosteroids and surfactant.',
          'Restrict transfusion: do not transfuse at Hb ≥7 g/dL in stable patients without cyanotic disease or severe PARDS.',
          'Conservative fluid balance with a daily team goal; early enteral nutrition (<72 h), protein ≥1.5 g/kg/day.',
          'Refer for ECMO early when lung-protective targets cannot be met despite optimization.',
        ],
      },
      {
        title: 'Liberation',
        points: [
          'Assess extubation readiness daily and perform a spontaneous breathing trial when criteria are met. CPAP ≤5 cmH₂O without pressure support best mimics post-extubation physiology.',
          'Post-extubation stridor is more common in children; high-risk patients benefit from dexamethasone before extubation.',
        ],
      },
    ],
    numbers: [
      { label: 'Tidal volume', value: '6–8 mL/kg PBW (lesser of predicted/actual); <6 only if needed; caution <4' },
      { label: 'Plateau pressure', value: '≤28 cmH₂O (29–32 if stiff chest wall)' },
      { label: 'Driving pressure', value: '≤15 cmH₂O' },
      { label: 'Severe PARDS', value: 'OI ≥16 / OSI ≥12' },
      { label: 'SpO₂', value: '92–97% (mild/mod) · <92% acceptable in severe after PEEP optimized · floor 88%' },
      { label: 'Permissive hypercapnia', value: 'pH ≥7.20' },
      { label: 'ARDSnet low-PEEP table', value: 'FiO₂ 0.6 → PEEP ≥10; 0.8 → ≥14; 1.0 → ≥18' },
      { label: 'Exhalation time', value: '≥3–5 time constants' },
    ],
    pitfalls: [
      'Sizing tidal volume to actual weight in an obese child (overdistension).',
      'Chasing PaCO₂ with rate in obstructive disease (more auto-PEEP).',
      'Leaving PEEP at 5 with FiO₂ 0.8 in recruitable PARDS.',
      'Sustained-inflation recruitment maneuvers.',
      'Permissive hypercapnia in a child with raised ICP or pulmonary hypertension.',
      'Adult-size HME or excess connectors on an infant circuit.',
    ],
    example: {
      title: 'Influenza PARDS',
      scenario: '3-year-old, 14 kg, 95 cm, intubated for influenza pneumonia. VC Vt 140 mL, RR 24, PEEP 5, FiO₂ 0.8. Pplat 31, mPaw 14, PaO₂ 58, SpO₂ 87%.',
      steps: [
        { q: 'Severity?', a: 'OI = 14 × 0.8 × 100 / 58 = 19.3 → severe PARDS (OI ≥16).' },
        { q: 'Tidal volume target?', a: 'PBW (95 cm) ≈ 14 kg; 6–8 mL/kg → 84–112 mL. Current 10 mL/kg is too high; reduce to ~90–100 mL.' },
        { q: 'PEEP?', a: 'ARDSnet table at FiO₂ 0.8 requires PEEP ≥14. Increase stepwise watching SpO₂, compliance, BP; keep Pplat ≤28 and ΔP ≤15.' },
        { q: 'PaCO₂ climbs to 62, pH 7.24. Accept?', a: 'Yes – pH ≥7.20 is acceptable unless raised ICP, pulmonary hypertension or hemodynamic instability. Reduce dead space; raise RR only while watching for auto-PEEP.' },
      ],
    },
    tools: [
      { to: '/labs/ventilator', label: 'Ventilator Lab' },
      { to: '/tools/pards', label: 'OI / OSI / PARDS calculator' },
    ],
    refs: ['palicc2-2023', 'oxypicu-2024', 'firstabc-2022'],
  },
  {
    id: 'acid-base',
    number: 6,
    title: 'Acid–Base',
    tagline: 'A six-step method that never misses a mixed disorder – with pediatric patterns.',
    icon: 'FlaskConical',
    minutes: 20,
    prereqs: ['foundations'],
    objectives: [
      'Interpret any blood gas in six steps, including compensation and mixed disorders.',
      'Correct the anion gap for albumin and use the delta ratio.',
      'Recognize classic pediatric patterns: pyloric stenosis, DKA phases, inborn errors, BPD on diuretics.',
    ],
    concepts: [
      {
        title: 'The six steps',
        points: [
          '1 · Internal consistency: does HCO₃⁻ fit Henderson–Hasselbalch for the pH and PaCO₂?',
          '2 · Acidemia (<7.35) or alkalemia (>7.45)? A normal pH can hide two disorders.',
          '3 · Primary process: which of PaCO₂ or HCO₃⁻ explains the pH direction?',
          '4 · Compensation: Winter\'s PaCO₂ = 1.5 × HCO₃⁻ + 8 ± 2 (metabolic acidosis); 0.7 × HCO₃⁻ + 21 ± 2 (metabolic alkalosis); HCO₃⁻ +1 (acute) / +3.5 (chronic) per 10 mmHg PaCO₂ rise; −2 / −4 to −5 per 10 mmHg fall.',
          '5 · Anion gap = Na − (Cl + HCO₃⁻); add 2.5 for every 1 g/dL albumin below 4.',
          '6 · If the gap is high: delta ratio (ΔAG/ΔHCO₃⁻) <0.4 normal-AG acidosis, 0.4–0.8 mixed, 0.8–2 pure high-AG, >2 additional metabolic alkalosis.',
        ],
      },
      {
        title: 'High anion gap in children',
        points: [
          'Lactate (shock, hypoxia, seizures; type B from epinephrine, salbutamol, propofol infusion syndrome, liver failure, mitochondrial disease).',
          'Ketoacids (DKA, starvation). Ketosis in a neonate is never normal → inborn error.',
          'Organic acidemias (MMA, propionic) – gap far larger than the lactate.',
          'Toxins: salicylate (with respiratory alkalosis), methanol/ethylene glycol (osmolal gap), iron, isoniazid.',
          'Uremia.',
        ],
      },
      {
        title: 'Normal anion gap (hyperchloremic)',
        points: [
          'Diarrhea (urine anion gap negative), large-volume 0.9% saline, DKA recovery phase, renal tubular acidosis (urine anion gap positive), acetazolamide/topiramate.',
          'Na–Cl difference <30 signals a chloride-driven acidosis.',
        ],
        pearl: 'During DKA treatment HCO₃⁻ often stays low after the gap closes – that is hyperchloremia, not ongoing ketosis. Track β-hydroxybutyrate.',
      },
      {
        title: 'Alkalosis and respiratory disorders',
        points: [
          'Pyloric stenosis: hypochloremic hypokalemic metabolic alkalosis; correct with saline + KCl before surgery.',
          'BPD on loop/thiazide diuretics: chronic respiratory acidosis plus contraction alkalosis.',
          'Respiratory alkalosis in an encephalopathic neonate → check ammonia (urea cycle defect).',
          'A normal PaCO₂ in a child with severe asthma or metabolic acidosis is inappropriate – they are tiring.',
        ],
      },
      {
        title: 'Stewart view',
        points: [
          'pH is set by PaCO₂, the strong-ion difference (Na + K + Ca + Mg − Cl − lactate) and weak acids (albumin, phosphate).',
          'Hypoalbuminemia is alkalinizing and hides acidosis – very common in PICU patients.',
          'Strong-ion gap >3 mEq/L reveals unmeasured anions.',
        ],
      },
      {
        title: 'Venous gases',
        points: [
          'A peripheral or central VBG is adequate for pH and HCO₃⁻ trends; PvCO₂ runs ~4–6 mmHg higher than PaCO₂ in stable patients. VBG is useless for oxygenation.',
          'Capillary gases are unreliable in shock.',
        ],
      },
    ],
    numbers: [
      { label: "Winter's", value: 'PaCO₂ = 1.5·HCO₃⁻ + 8 ± 2' },
      { label: 'Metabolic alkalosis', value: 'PaCO₂ = 0.7·HCO₃⁻ + 21 ± 2' },
      { label: 'Respiratory acidosis', value: 'HCO₃⁻ +1 acute / +3.5 chronic per 10 mmHg' },
      { label: 'Respiratory alkalosis', value: 'HCO₃⁻ −2 acute / −4 to −5 chronic per 10 mmHg' },
      { label: 'Anion gap', value: '8–14 mmol/L; +2.5 per 1 g/dL albumin below 4' },
      { label: 'Osmolal gap', value: '>10 mOsm/kg abnormal' },
    ],
    pitfalls: [
      'Calling a normal pH "normal" without checking PaCO₂, HCO₃⁻ and the gap.',
      'Uncorrected anion gap in hypoalbuminemic children.',
      'Normalizing PaCO₂ after intubating a child in severe metabolic acidosis (DKA, salicylate) – match their pre-intubation minute ventilation.',
      'Treating lactic acidosis with bicarbonate instead of the cause.',
    ],
    example: {
      title: 'The tiring septic child',
      scenario: '4-year-old in septic shock: pH 7.18, PaCO₂ 38, HCO₃⁻ 14, Na 135, Cl 100, albumin 2.5, lactate 8.',
      steps: [
        { q: 'Primary disorder?', a: 'Acidemia with low HCO₃⁻ → metabolic acidosis.' },
        { q: 'Is compensation appropriate?', a: "Winter's: 1.5 × 14 + 8 = 29 ± 2. PaCO₂ 38 is too high → concurrent respiratory acidosis (fatigue)." },
        { q: 'Anion gap?', a: '135 − (100 + 14) = 21; corrected for albumin 2.5 → 24.8 – high-AG (lactic) acidosis.' },
        { q: 'Delta ratio and meaning?', a: '(24.8 − 12)/(24 − 14) = 1.3 → pure high-AG acidosis. Management: restore perfusion and support ventilation – this child needs help breathing.' },
      ],
    },
    tools: [{ to: '/labs/acid-base', label: 'Acid–Base Lab (analyzer + 34 drills)' }],
    refs: ['berend-2014', 'ispad-2022'],
  },
  {
    id: 'fluids',
    number: 7,
    title: 'Fluids, Sodium & Electrolytes',
    tagline: 'Isotonic maintenance, safe sodium correction, potassium, calcium and fluid overload.',
    icon: 'Droplets',
    minutes: 25,
    prereqs: ['foundations'],
    objectives: [
      'Prescribe maintenance fluids that do not cause hospital-acquired hyponatremia.',
      'Treat symptomatic hyponatremia urgently and correct chronic dysnatremias safely.',
      'Run the hyperkalemia sequence and recognize when ionized calcium matters.',
    ],
    concepts: [
      {
        title: 'Maintenance fluids',
        points: [
          'AAP 2018 (strong): isotonic fluid with appropriate KCl and dextrose for patients 28 days–18 years (excludes neurosurgical, cardiac, renal, hepatic, cancer, DI, burns, large GI losses).',
          'Critical illness drives non-osmotic ADH (pain, nausea, lung and CNS disease, surgery) – hypotonic fluids cause hyponatremia.',
          'Holliday–Segar 4-2-1 is a ceiling, not a target. Many PICU patients need 50–75% once drugs, flushes and nutrition are counted.',
          'Glucose: tight control (80–110 mg/dL) does not help (CHiP, HALF-PINT) and causes hypoglycemia; HALF-PINT\'s conventional arm targeted 150–180 mg/dL.',
        ],
      },
      {
        title: 'Hyponatremia',
        points: [
          'Children develop hyponatremic encephalopathy at higher Na than adults (large brain-to-skull ratio): headache, vomiting, seizures, apnea.',
          'Symptomatic: 3% NaCl 2 mL/kg (max 100 mL) over 10 min, repeat up to twice; stop when symptoms resolve or Na has risen ~5 mmol/L.',
          'Chronic (>48 h): limit total rise to ≤8–10 mmol/L in 24 h. Rule of thumb: 1 mL/kg of 3% raises Na ≈1 mmol/L.',
          'SIADH (euvolemic, urine Osm >100, urine Na >30) → fluid restriction/isotonic fluids. Cerebral salt wasting (hypovolemic, high urine output and Na) → replace salt and water.',
        ],
      },
      {
        title: 'Hypernatremia and diabetes insipidus',
        points: [
          'Restore volume first; then lower Na by ≤0.5 mmol/L/h (≤10–12 per 24 h) in chronic hypernatremia – faster causes cerebral edema.',
          'Free-water deficit = TBW × (Na/140 − 1).',
          'Central DI after neurosurgery, TBI or brain death: high dilute urine output (>4 mL/kg/h, urine Osm < serum) and rising Na → desmopressin or vasopressin.',
        ],
      },
      {
        title: 'Potassium',
        points: [
          'Hyperkalemia with ECG change: (1) stabilize – calcium gluconate 60–100 mg/kg; (2) shift – insulin 0.1 U/kg + dextrose 0.5 g/kg, salbutamol, bicarbonate if acidotic; (3) remove – furosemide, binders, dialysis.',
          'Heel-prick and hemolyzed samples cause pseudohyperkalemia – repeat free-flowing if the ECG is normal.',
          'Hypokalemia (DKA, β-agonists, insulin, alkalosis, diuretics): replace at ≤0.5 mEq/kg/h with ECG monitoring.',
        ],
      },
      {
        title: 'Calcium, magnesium, phosphate',
        points: [
          'Use ionized calcium (<1.1 mmol/L low). Hypocalcemia is common in sepsis, massive transfusion (citrate), tumor lysis, 22q11 deletion.',
          'The neonatal myocardium relies on extracellular calcium – hypocalcemia depresses contractility and BP.',
          'Correct magnesium before calcium and potassium will stay corrected.',
          'Refeeding syndrome (malnutrition, DKA recovery): falling phosphate, K and Mg – start nutrition gradually and replace.',
        ],
      },
      {
        title: 'Fluid overload',
        points: [
          'FO% = (fluid in − fluid out, L) / ICU admission weight (kg) × 100.',
          'FO >10–20% is associated with more ventilator days and higher mortality; trigger diuresis or CRRT.',
        ],
      },
    ],
    numbers: [
      { label: 'Maintenance fluid', value: 'Isotonic + dextrose + KCl (AAP 2018)' },
      { label: 'Symptomatic hyponatremia', value: '3% NaCl 2 mL/kg (max 100 mL) ×≤3' },
      { label: 'Sodium correction limits', value: 'Rise ≤8–10 mmol/L/24 h · fall ≤0.5 mmol/L/h' },
      { label: 'Hyperkalemia', value: 'Ca gluconate 60–100 mg/kg · insulin 0.1 U/kg + dextrose 0.5 g/kg' },
      { label: 'GIR', value: 'Dextrose % × mL/h ÷ (6 × kg); neonates need 4–8 mg/kg/min' },
      { label: 'Glucose-corrected Na', value: '+1.6 per 100 mg/dL above 100' },
    ],
    pitfalls: [
      'Running hypotonic maintenance at full Holliday–Segar in a post-op or ventilated child.',
      'Slow treatment of hyponatremic seizures because of fear of osmotic demyelination.',
      'Fast correction of chronic hypernatremia.',
      'Treating a hemolyzed heel-prick potassium.',
      'Forgetting magnesium.',
    ],
    example: {
      title: 'Post-op seizure',
      scenario: '20 kg 6-year-old, day 1 after spinal fusion on 0.45% saline at full maintenance, seizes. Na 121.',
      steps: [
        { q: 'Immediate treatment?', a: '3% NaCl 2 mL/kg = 40 mL over 10 min; repeat once or twice if still seizing. Expect ~+2 mmol/L per bolus.' },
        { q: 'Why did this happen?', a: 'Post-operative non-osmotic ADH + hypotonic fluid = free-water retention.' },
        { q: 'How far to correct today?', a: 'Acute (<48 h) hyponatremia with symptoms: raise ~5 mmol/L quickly to stop symptoms; then ≤8–10 mmol/L total in 24 h.' },
        { q: 'Maintenance fluid now?', a: 'Isotonic fluid with dextrose and KCl, restricted (~50–75% maintenance), with Na every 4–6 h.' },
      ],
    },
    tools: [{ to: '/labs/fluids', label: 'Fluids & Electrolytes Lab' }],
    refs: ['aap-fluids-2018', 'moritz-2010', 'halfpint-2017', 'chip-2014'],
  },
];
