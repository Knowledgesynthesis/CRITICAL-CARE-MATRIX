# **CRITICAL CARE MATRIX — OPTIMIZED MASTER PROMPT FOR EDUCATIONAL APP GENERATION**  
A clinically rigorous, physiology-accurate master prompt for generating a **mobile-first, offline-capable, dark-mode educational app** that teaches ICU trainees *how critical care physiology works as an integrated system* — fluids, electrolytes, hemodynamics, mechanical ventilation, renal function, and acid–base interactions.

---

# **MASTER PROMPT — Critical Care Matrix Educational App Generator (SPECIALIZED VERSION)**

## **Role & Mission**
You are a cross-functional team (PM + Staff Engineer + Senior Instructional Designer + Intensivist SME + Critical Care Pharmacology SME + Respiratory Therapy SME + Nephrology SME + UX Writer + QA).  
Your mission: design an **interactive ICU physiology simulator** that teaches:

**Critical Care Matrix: Integrated ICU Physiology Simulation**  
—A multimodal, systems-based learning environment that simulates how **fluids, ventilation, renal function, and acid–base physiology interact** in real ICU scenarios.

This app must:
- Serve **all learner levels:** MS4 → residents → fellows → attending intensivists → APPs  
- Use **synthetic vitals/labs only**, never real patient data  
- Provide **interactive simulations** of:  
  - Ventilator changes → gas exchange → pH  
  - Fluids/pressors → hemodynamics & renal perfusion  
  - Electrolytes → acid–base interactions  
  - Lactate/AG → shock states  
- Be mobile-first, dark mode, offline-capable  
- Emphasize physiology-first and risk-free learning  
- Maintain *strict clinical accuracy* with consistent physiology rules (no contradictory acid–base or renal logic)

---

## **Inputs (Fill These)**
- **Primary Topic(s):**  
  Always centered on **ICU integrated physiology**, including:  
  - Hemodynamics (preload, afterload, contractility, MAP, perfusion)  
  - Fluid responsiveness & dynamic indices  
  - Shock states (septic, hypovolemic, cardiogenic, obstructive)  
  - Ventilator physiology (V/Q, dead space, ARDS mechanics)  
  - Gas exchange (PaO₂, PaCO₂)  
  - Acid–base systems (Henderson-Hasselbalch, AG, strong ion difference)  
  - Renal function (GFR, urine output, electrolyte handling)  
  - Electrolyte physiology (Na, K, Cl, HCO₃)  
  - Lactate metabolism  
  - Interactions between ventilation ↔ kidneys ↔ fluids ↔ acid–base  
- **Target Learner Levels:** {{LEVELS}}  
- **Learner Context:** {{CONTEXT}}  
- **Learning Outcomes:** {{LEARNING_OBJECTIVES}}  
- **Constraints:**  
  Always include:  
  - *Mobile-first; dark mode; offline-ready; evidence-based physiology; consistent multi-system logic; synthetic ICU cases only*  
- **References/Standards:** {{REFERENCES}}  
- **Brand/Voice:** {{VOICE_TONE}}  
- **Localization:** {{LOCALE}}

---

# **Required Deliverables (Produce All)**

---

## **1. Executive Summary**
- Introduce why critical care requires integrated multi-system reasoning.  
- Present Critical Care Matrix as the **ICU Integrated Physiology Simulator + Case Engine + Parameter Playground**.  
- Provide 2–3 alternate names + value propositions.

---

## **2. Learner Personas & Use Cases**
Examples:
- ICU resident adjusting ventilator settings  
- Anesthesiology trainee learning shock management  
- Medical student understanding acid–base compensation  
- Nephrology fellow evaluating oliguria in the ICU  
Use cases: rounds prep, board review, simulation training, night float reference.

---

## **3. Curriculum Map & Knowledge Graph**
Connect all systems:

**Ventilation ↔ Hemodynamics ↔ Renal Function ↔ Electrolytes ↔ Acid–Base ↔ Metabolism**

### **Prerequisites**
- Basic cardiac function  
- Renal physiology  
- Gas exchange  
- Acid–base fundamentals  

### **Modules**

1. **ICU Hemodynamics**
   - MAP, SVR, cardiac output  
   - Shock types & markers of perfusion  
   - Dynamic vs static preload measures  

2. **Fluids & Volume Physiology**
   - Crystalloids, colloids  
   - Fluid shifts  
   - Impact on acid–base & electrolytes  

3. **Mechanical Ventilation**
   - Volume vs pressure modes  
   - Effects of PEEP on preload/afterload  
   - ARDS mechanics  
   - How CO₂ manipulation affects pH  

4. **Gas Exchange & Respiratory Physiology**
   - PaO₂/FiO₂  
   - Dead space vs shunt  
   - Hypoventilation vs V/Q mismatch  

5. **Renal Function in Critical Illness**
   - GFR determinants  
   - Oliguria pathways  
   - Electrolyte handling (Na/K/Cl/HCO₃)  
   - AKI staging and interpretation  

6. **Acid–Base Systems**
   - Henderson-Hasselbalch  
   - Anion gap and osmolal gap  
   - Metabolic vs respiratory disorders  
   - Mixed disturbances  
   - Strong ion difference approach  

7. **Integrated Shock Pathways**
   - Sepsis, hemorrhage, cardiogenic shock  
   - Lactate physiology  
   - Microcirculation  

8. **ICU Pharmacology Interactions**
   - Pressors (NE, vasopressin, epinephrine)  
   - Bicarbonate therapy  
   - Diuretics  
   - Impact on physiology  

9. **Integrated ICU Case Engine**
   - Dynamic vitals/labs simulation  
   - User modifies: fluids, vasopressors, ventilator, bicarb, diuretics  
   - App updates physiology in real time  

Each module contains micro-concepts + Bloom levels + prerequisite mapping.

---

## **4. Interactives (Critical Care Matrix–Specific)**

### **Examples**

- **Ventilator → Acid–Base Simulator**
  - Adjust RR, TV, PEEP  
  - See changes in PaCO₂, pH, PaO₂, cardiac output  

- **Fluid Responsiveness Engine**
  - Give bolus → view MAP, CVP, CO changes  
  - Show Frank-Starling curve shifts  

- **Shock Type Differentiator**
  - Synthetic vitals/labs → choose shock category  
  - App visualizes underlying physiology  

- **Renal Perfusion & Urine Output Module**
  - Adjust MAP/PEEP → visualize GFR & urine output changes  

- **Electrolyte & Acid–Base Matrix**
  - Change Na, Cl, lactate, albumin → see AG and pH shifts  

- **ABG Interpreter Interactive**
  - Get synthetic ABG → determine disturbances with stepwise logic  

- **Hemodynamic Graph Explorer**
  - Display CVP, SVR, CO, MAP trends with interventions  

- **Integrated ICU System Dashboard**
  - One screen linking ventilation, fluids, renal output, and acid–base  
  - User manipulates one system → all others update  

For each interactive:
- purpose  
- inputs/controls  
- outputs  
- visualization design  
- preset ICU cases  
- safety guardrails (no real clinical decision tools)

---

## **5. Assessment & Mastery**
Include:
- Case-based physiology interpretation  
- Identify shock type from data  
- ABG interpretation exercises  
- “How will increasing PEEP affect renal perfusion?”  
- Multi-step clinical scenarios  
Provide **10–20 items** with rationales.

---

## **6. ICU Reasoning Framework**
Teach integrated steps:

1. Identify the primary physiology derangement  
2. Assess ventilation vs perfusion vs metabolic contributors  
3. Analyze renal response & acid–base compensation  
4. Determine if shock is present  
5. Apply targeted interventions  
6. Predict downstream effects across systems  

Pitfalls:
- Treating systems in isolation  
- Misinterpreting lactate origin  
- Assuming linear response to fluids  
- Ignoring ventilator–hemodynamic interactions  
- Confusing mixed acid–base disorders  

---

## **7. Accessibility & Safety**
- WCAG 2.2 AA  
- No real patient data  
- Evidence-based physiology only  
- Educational-only disclaimers  
- Internal logic checks to prevent impossible physiology outputs  

---

## **8. Tech Architecture (Mobile-First, Offline)**
- React/TypeScript  
- Tailwind + shadcn/ui  
- Recharts/D3 for hemodynamic/ABG graphs  
- Simulation engine in JS/TS  
- Offline data via IndexedDB + Service Worker  
- Zustand/Redux for state  

---

## **9. Data Schemas (JSON)**
Schemas for:
- vitals (MAP, HR, CVP, etc.)  
- ventilator settings  
- ABG  
- electrolytes  
- renal parameters  
- shock states  
- system interactions  
- case templates  
Include examples.

---

## **10. Screen Specs & Text Wireframes**
Screens:
- Home  
- Hemodynamics Lab  
- Ventilation Lab  
- Renal Function Module  
- Acid–Base Analyzer  
- Electrolytes Explorer  
- Shock Pathways Module  
- Full ICU Matrix Dashboard  
- Case Engine  
- Assessment Hub  
- Glossary  
- Settings  

Provide text-based wireframes.

---

## **11. Copy & Content Kit**
Include:
- Microcopy (“Raising PEEP reduces preload by increasing intrathoracic pressure”)  
- Diagrams of V/Q, shock pathways, Starling curves  
- Electrolyte/acid–base summary charts  
- Two full lessons + one integrated ICU case  

---

## **12. Analytics & A/B Plan**
UI-only:
- Ventilator slider arrangement  
- Fluid intervention UI layout  
- Matrix dashboard layout  
No statistical experiments.

---

## **13. QA Checklist**
- Physiology equations cross-checked  
- Acid–base logic validated  
- Ventilator–hemodynamic interactions correct  
- No contradictions across modules  
- Synthetic data only  

---

## **14. Roadmap**
Prototype → Pilot → Advanced Shock Labs → Ventilation–Hemodynamics Deep Dive → Personalized ICU Learning Tracks  
Include milestones & risks.

---

# **Style & Rigor Requirements**
- ICU-level physiological precision  
- Integrated systems thinking  
- No contradictory physiology  
- Visual-first diagrams  
- Pathoma-like clarity for ICU physiology  

---

# **Acceptance Criteria**
- Learners develop integrated ICU reasoning  
- App models physiology accurately and coherently  
- Critical Care Matrix reinforces a unified **ICU Systems Interaction Map**

---

# **Now Generate**
Using the inputs above, produce all deliverables in the required order.  
If any inputs are missing, make ICU-physiology–sound assumptions and label them as defaults.
