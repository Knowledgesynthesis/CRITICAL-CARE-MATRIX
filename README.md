# PICU Matrix

Interactive pediatric critical care curriculum: 13 modules, 4 physiology simulators, 8 bedside calculators, 24 branching PICU cases, 34 blood-gas drills and a 220-question bank with spaced review. Mobile-first, works offline (PWA), progress saved on the device.

Evidence base (newest first): SSC Children 2026 · PRoMPT BOLUS 2026 · AHA/AAP PALS 2025 · Oxy-PICU 2024 · Phoenix Sepsis Criteria 2024 · PALICC-2 2023 · SCCM PANDEM 2022 · TAXI-CAB 2022 · ISPAD DKA 2022 · BTF pediatric TBI 2019 · ESETT/ConSEPT/EcLiPSE 2019 · AAP maintenance fluids 2018 · KDIGO 2012 (2026 update in review). Full list in-app under **Sources & settings** and in `src/content/references.ts`.

## What's inside

| Area | Contents |
| --- | --- |
| **Curriculum** (`/learn`) | Foundations · Resuscitation & airway · Shock & sepsis · Respiratory failure & HFNC/NIV · Ventilation & PARDS · Acid–base · Fluids & electrolytes · AKI & CRRT · Neurocritical care · DKA & metabolic · Cardiac ICU · Sedation/delirium/withdrawal · Transfusion, nutrition & recovery. Each: objectives, concepts with PICU-specific pearls, numbers to know, step-reveal worked example, pitfalls, linked simulator/case, mastery quiz (≥80%), sources. |
| **Shock Lab** | Guyton venous-return × Frank–Starling model scaled to age (neonate → adolescent). 14 shock states (cold/warm/late-mixed sepsis, hypovolemic, hemorrhagic, anaphylactic, cardiogenic, post-bypass low output, obstructive, neurogenic, adrenal crisis, SVT, complete heart block). Fluids, PRBC, 6 vasoactives (dose–response), PEEP, intubation with 4 induction agents, decompression, cardioversion/pacing, hydrocortisone, time. Outputs HR, BP, CVP, CI, SVRI, CRT, urine, lactate, ScvO₂, liver edge, Phoenix CV points, SIPA. |
| **Ventilator Lab** | VC/PC on an R–C lung with recruitment, overdistension, auto-PEEP, serial/alveolar dead space, shunt vs V/Q oxygenation. 8 lung types (healthy, recruitable and non-recruitable PARDS, asthma, bronchiolitis, stiff chest wall, cardiogenic edema, established BPD) with lung-specific targets, 8 one-click scenarios with a stated task, OI/OSI, PALICC-2 alerts, live pressure/flow/volume waveforms. |
| **Acid–Base Lab** | Six-step analyzer (consistency, compensation, albumin-corrected AG, delta ratio, osmolal gap, urine AG, Stewart SID/SIG) + 34 pediatric drills with a picker and progress. |
| **Fluids Lab** | Holliday–Segar, GIR, Adrogué–Madias sodium prediction with safe-rate checks and 5 worked examples (seizure, SIADH, hypernatremic newborn, DKA, DI), hyper/hyponatremia plans, fluid overload %, corrected Ca. |
| **Tools** | Resuscitation card (65 weight-based drugs with caps, equipment, age norms) · 20-drug infusion calculator · Phoenix score · OI/OSI/PARDS · AKI/eGFR/FO%/RAI/CRRT · GCS/CPP/TBI targets · Qp:Qs/DO₂ · DKA planner. |
| **Practice** | 24 time-stepped cases covering every module (septic, hemorrhagic, anaphylactic and cardiogenic shock; VF arrest, infant SVT and hypoxic bradycardia; PARDS, asthma, bronchiolitis, croup; TBI, status epilepticus, meningitis; DKA, hyperammonemia; HUS, tumor lysis; duct-dependent neonate, post-op LCOS/JET; salicylate poisoning; post-op hyponatremia; withdrawal/delirium; refeeding) with age-flagged monitors and debriefs; 220 questions (module filters, missed/due modes, Leitner spaced review, balanced answer positions). |

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 142 engine, stress and content-integrity tests
npm run lint
npm run build      # type-check + production build to dist/
```

Stack: React 18, TypeScript (strict), Vite 5, Tailwind 3, Zustand (persisted progress), Recharts, vite-plugin-pwa, Vitest.

## Layout

```
src/
  engine/      pure, unit-tested physiology & calculators
               peds · hemodynamics · respiratory · acidBase · renal · electrolytes · neuro · cardiac · phoenix · drugs
  content/     modules, questions, cases, ABG drills, glossary, references (+ integrity tests)
  pages/       Home, Learn, ModulePage, labs/*, tools/*, Cases, CasePlayer, Quiz, Reference, About
  components/  AppShell, ui primitives, learning widgets, charts
  store/       progress (answers, spaced review, case scores, theme, shared patient)
```

## Testing

- **Engine tests**: known values (PALS thresholds, APLS weights, ETT sizes, Phoenix cut-offs, ODC landmarks, Winter's, KDIGO, Schwartz/CKiD U25, Adrogué–Madias, GIR, infusion math).
- **Physiology behavior tests**: hypovolemia is fluid-responsive, cardiogenic shock is not; epinephrine raises flow in cold shock while norepinephrine raises pressure; decompression fixes tamponade; propofol drops MAP more than ketamine; PEEP recruits recruitable but not consolidated lung; FiO₂ fails to correct true shunt; rate increases auto-PEEP in asthma.
- **Stress tests**: thousands of random ages/settings/drug combinations through the ventilator, circulation and acid–base engines must stay finite and physiologic; every drug at every weight 0.5–150 kg must respect its maximum dose.
- **Content integrity**: every question has a valid key and rationale, every case stage has exactly one correct option, every citation/route/prerequisite resolves, all 34 drills match the analyzer, and correct-answer positions stay balanced (no position >40%).

## Deploy

Vercel (framework preset: Vite, output `dist`). `vercel.json` adds the SPA rewrite and long-term caching for hashed assets.

---

See `docs/AUDIT.md` for the review of the previous adult-focused version. Educational use – verify doses against local protocols.
