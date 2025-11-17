import type { AssessmentQuestion } from '@/types';

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 'q1',
    question:
      'A patient has the following ABG: pH 7.28, PaCO2 55 mmHg, HCO3 26 mEq/L. What is the primary acid-base disturbance?',
    type: 'multiple-choice',
    options: [
      'Metabolic acidosis',
      'Metabolic alkalosis',
      'Respiratory acidosis',
      'Respiratory alkalosis',
    ],
    correctAnswer: 2,
    explanation:
      'This is respiratory acidosis. The pH is low (acidosis) and the PaCO2 is elevated (>45 mmHg), indicating a respiratory cause. The HCO3 is normal, suggesting acute respiratory acidosis without metabolic compensation.',
    difficulty: 'Beginner',
    tags: ['acid-base', 'ABG', 'respiratory'],
  },
  {
    id: 'q2',
    question:
      'In septic shock, which hemodynamic profile is most characteristic?',
    type: 'multiple-choice',
    options: [
      'High cardiac output, high SVR',
      'Low cardiac output, high SVR',
      'High cardiac output, low SVR',
      'Low cardiac output, low SVR',
    ],
    correctAnswer: 2,
    explanation:
      'Septic shock typically presents with HIGH cardiac output and LOW SVR (systemic vascular resistance). This is due to widespread vasodilation from inflammatory mediators. The body attempts to compensate for low SVR by increasing cardiac output.',
    difficulty: 'Intermediate',
    tags: ['hemodynamics', 'shock', 'sepsis'],
  },
  {
    id: 'q3',
    question:
      'Increasing PEEP from 5 to 12 cmH2O will likely have which effect on cardiac output?',
    type: 'multiple-choice',
    options: [
      'Increase cardiac output',
      'Decrease cardiac output',
      'No effect on cardiac output',
      'Depends on fluid status',
    ],
    correctAnswer: 3,
    explanation:
      'The effect of PEEP on cardiac output DEPENDS ON FLUID STATUS. In hypovolemic patients, increased PEEP will decrease venous return and cardiac output. In euvolemic patients with ARDS, moderate PEEP increases may improve oxygenation without significantly affecting cardiac output. In patients with RV dysfunction, high PEEP can worsen RV afterload.',
    difficulty: 'Advanced',
    tags: ['ventilation', 'hemodynamics', 'PEEP'],
  },
  {
    id: 'q4',
    question:
      'What is the primary mechanism by which norepinephrine increases blood pressure?',
    type: 'multiple-choice',
    options: [
      'Increasing heart rate',
      'Increasing contractility',
      'Vasoconstriction (increased SVR)',
      'Increasing preload',
    ],
    correctAnswer: 2,
    explanation:
      'Norepinephrine primarily works through alpha-1 adrenergic receptor stimulation, causing vasoconstriction and increasing systemic vascular resistance (SVR). This increases blood pressure. It has minimal beta-1 effects, so it does not significantly increase heart rate or contractility compared to its vasoconstrictive effects.',
    difficulty: 'Intermediate',
    tags: ['hemodynamics', 'medications', 'pressors'],
  },
  {
    id: 'q5',
    question: 'Which tidal volume is appropriate for ARDS lung-protective ventilation in a 70 kg patient (ideal body weight)?',
    type: 'multiple-choice',
    options: ['350 mL', '420 mL', '550 mL', '700 mL'],
    correctAnswer: 1,
    explanation:
      'Lung-protective ventilation for ARDS uses 6 mL/kg of IDEAL body weight. For a 70 kg patient: 6 mL/kg × 70 kg = 420 mL. This minimizes ventilator-induced lung injury by reducing alveolar overdistension.',
    difficulty: 'Beginner',
    tags: ['ventilation', 'ARDS', 'lung-protection'],
  },
  {
    id: 'q6',
    question:
      'A patient receiving 1 liter of normal saline will develop which acid-base change?',
    type: 'multiple-choice',
    options: [
      'Metabolic acidosis',
      'Metabolic alkalosis',
      'Respiratory acidosis',
      'No change',
    ],
    correctAnswer: 0,
    explanation:
      'Normal saline (0.9% NaCl) has a high chloride content (154 mEq/L). Large volumes can cause hyperchloremic metabolic acidosis by diluting bicarbonate and increasing serum chloride, which narrows the anion gap. This is also called dilutional acidosis.',
    difficulty: 'Advanced',
    tags: ['acid-base', 'fluids', 'electrolytes'],
  },
  {
    id: 'q7',
    question: 'What is the target MAP for most ICU patients requiring vasopressors?',
    type: 'multiple-choice',
    options: ['≥50 mmHg', '≥65 mmHg', '≥80 mmHg', '≥90 mmHg'],
    correctAnswer: 1,
    explanation:
      'The standard target MAP for most ICU patients requiring vasopressors is ≥65 mmHg. This ensures adequate organ perfusion, particularly to the kidneys and brain. Some patients (e.g., those with chronic hypertension) may require higher targets, but 65 mmHg is the general guideline.',
    difficulty: 'Beginner',
    tags: ['hemodynamics', 'shock', 'management'],
  },
  {
    id: 'q8',
    question:
      'A patient has oliguria (urine output 15 mL/hr) with MAP 58 mmHg. What is the MOST appropriate initial intervention?',
    type: 'multiple-choice',
    options: [
      'Start furosemide',
      'Start dopamine for renal perfusion',
      'Fluid resuscitation and increase MAP',
      'Start continuous renal replacement therapy',
    ],
    correctAnswer: 2,
    explanation:
      'The most appropriate initial intervention is FLUID RESUSCITATION and INCREASING MAP. Oliguria with low MAP suggests prerenal acute kidney injury due to inadequate renal perfusion. The kidneys require adequate perfusion pressure (MAP ≥65 mmHg) to produce urine. Diuretics would worsen the situation, and RRT is premature.',
    difficulty: 'Intermediate',
    tags: ['renal', 'hemodynamics', 'management'],
  },
  {
    id: 'q9',
    question:
      'What is the expected respiratory compensation for metabolic acidosis?',
    type: 'multiple-choice',
    options: [
      'Decrease in respiratory rate',
      'Increase in respiratory rate and decrease in PaCO2',
      'Increase in tidal volume only',
      'No respiratory compensation occurs',
    ],
    correctAnswer: 1,
    explanation:
      'In metabolic acidosis, the body compensates by INCREASING respiratory rate to blow off CO2 (hyperventilation), which DECREASES PaCO2. This shifts the Henderson-Hasselbalch equation to increase pH toward normal. Winter\'s formula predicts expected PaCO2: PaCO2 = 1.5(HCO3) + 8 ± 2.',
    difficulty: 'Intermediate',
    tags: ['acid-base', 'compensation', 'respiratory'],
  },
  {
    id: 'q10',
    question:
      'Which finding best distinguishes cardiogenic shock from hypovolemic shock?',
    type: 'multiple-choice',
    options: [
      'Elevated lactate',
      'Low cardiac output',
      'Elevated CVP/PCWP',
      'Hypotension',
    ],
    correctAnswer: 2,
    explanation:
      'ELEVATED CVP (central venous pressure) and PCWP (pulmonary capillary wedge pressure) best distinguish cardiogenic from hypovolemic shock. Both have low cardiac output and hypotension, but cardiogenic shock has elevated filling pressures due to pump failure, while hypovolemic shock has low filling pressures due to inadequate preload.',
    difficulty: 'Advanced',
    tags: ['shock', 'hemodynamics', 'diagnosis'],
  },
];
