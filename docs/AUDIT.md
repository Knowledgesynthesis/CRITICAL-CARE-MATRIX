# Audit of the previous version (v1, adult ICU) and what changed

## Errors found in v1

| # | Where | Problem | Resolution in v2 |
| --- | --- | --- | --- |
| 1 | `analyzeAcidBase` | Anion gap computed as `calculateAnionGap(0, 0, hco3)` → always negative → every gas reported "Low AG". | New six-step engine with real AG, albumin correction, delta ratio, osmolal gap, Stewart SIG. 17 drills verified by tests. |
| 2 | `analyzeAcidBase` | "Complete compensation" concept (compensation never normalizes pH except chronic respiratory alkalosis); only acute respiratory rules; mixed disorders overwritten. | Acute/chronic ranges, explicit concurrent-disorder detection, normal-pH mixed disorders. |
| 3 | `assessShockState` | Hypovolemic branch unreachable (cardiogenic condition is a superset – flagged by ESLint `no-dupe-else-if`). | Shock profile emerges from the circulation model (compensated vs hypotensive, warm vs cold). |
| 4 | `simulateVentilatorChange` | PaO₂ = linear function of FiO₂ and PEEP; PaCO₂ inversely proportional to total minute ventilation (ignores dead space). | Alveolar gas + venous-admixture model (shunt FiO₂-refractory, V/Q FiO₂-responsive), alveolar ventilation equation with serial/alveolar dead space, R–C mechanics, auto-PEEP. |
| 5 | `simulateFluidBolus` | +5 mL SV per litre regardless of preload; no overload. | Starling/Guyton intersection; retention depends on capillary leak and venous pressure; liver edge, pulmonary edema, hemodilution. |
| 6 | `simulateVasopressor` | Vasopressin dosed in mcg/kg/min; SBP/DBP fixed at MAP+40/−20; effects additive without limit. | Emax dose–response per receptor class (vasopressin in milliunits/kg/min), saturating combination, baroreflex, pulse pressure from SV and SVR. |
| 7 | `simulateRenalPerfusion` | Urine output = GFR × 0.8 "mL/h"; creatinine = 100/GFR instantaneously. | Urine output (mL/kg/h) from renal perfusion pressure, output and sympathetic antidiuresis; KDIGO tool uses real criteria. |
| 8 | Question 4 | Claimed norepinephrine has "minimal β1 effects". | Removed; norepinephrine described as α1 with modest β1. |
| 9 | Question 6 | Said saline acidosis "narrows the anion gap". | Saline causes a normal-AG (hyperchloremic) acidosis. |
| 10 | Questions/cases | Adult targets (MAP ≥65, 6 mL/kg IBW ARDSnet, 65-year-old patients) applied without pediatric equivalents. | Age-specific thresholds throughout (PALS, Phoenix, PALICC-2, BTF). |
| 11 | DKA case | "Aggressive fluid resuscitation" and CPAP with RR 28 in DKA. | ISPAD 2022 / PECARN FLUID management; intubation guidance preserves compensatory hyperventilation. |
| 12 | Build | Lint failed (6 errors); PWA icons and favicon referenced but missing; no tests; 700 kB single bundle. | Lint clean, icons generated, 98 tests, route-level code splitting. |

## Found during the v2 content expansion

- Correct answers sat in position B for 64% of questions (an "always pick B" learner would pass). Options are now balanced deterministically (`src/content/balance.ts`): numeric sets sorted ascending, others positioned by item id; a test keeps every position between 12% and 40%. Case options are balanced the same way.

## Blind spots filled

- Pediatric definitions: Phoenix 2024 sepsis/septic shock; PALICC-2 PARDS (OI/OSI, NIV, possible PARDS).
- 2025–2026 evidence: SSC Children 2026 (SpO₂ 88–92%, peripheral vasoactives, no epi-vs-norepi preference, against etomidate, ScvO₂ ≥70%, POCUS, rehab); PRoMPT BOLUS 2026; PALS 2025 (post-ROSC BP >10th centile, infant compression technique, FBAO sequence).
- Age-dependent physiology: weight estimation, ETT sizing, HR-dependent output, late hypotension, TBW, O₂ consumption, equipment dead space.
- Whole PICU domains absent before: resuscitation, neurocritical care (TBI, status epilepticus), DKA/metabolic emergencies, cardiac ICU (duct-dependent lesions, Qp:Qs, PH crisis), sedation/delirium/withdrawal, transfusion, nutrition, CRRT.
- Learning design: objectives, retrieval practice with rationales, mastery threshold, spaced review, worked examples, cases with consequences.

## Scope note

Simulators are teaching models calibrated to pediatric norms and checked by behavior and stress tests. They show direction and relative magnitude, not individual-patient predictions.
