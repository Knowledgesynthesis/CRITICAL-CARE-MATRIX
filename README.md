# Critical Care Matrix

**An Integrated ICU Physiology Simulator for Medical Education**

Critical Care Matrix is a comprehensive, mobile-first, offline-capable educational application designed to teach ICU trainees how critical care physiology works as an integrated system. The app simulates interactions between fluids, electrolytes, hemodynamics, mechanical ventilation, renal function, and acid-base physiology in realistic ICU scenarios.

## Features

### 🎯 Core Modules

- **Hemodynamics Lab** - Explore cardiac output, SVR, fluid responsiveness, and vasopressor effects
- **Ventilation Lab** - Simulate mechanical ventilation settings and observe gas exchange changes
- **Acid-Base Analyzer** - Interpret ABGs with stepwise guidance and understand compensation
- **Renal Function Module** - Study GFR, urine output, and renal perfusion in critical illness
- **Shock Pathways** - Differentiate shock types and learn pathophysiology-driven management
- **ICU Matrix Dashboard** - Integrated view of all physiologic systems and their interactions
- **Case Engine** - Practice with realistic ICU scenarios (septic shock, ARDS, metabolic acidosis)
- **Assessment Hub** - Test knowledge with practice questions covering all ICU physiology topics

### 🧬 Educational Approach

- **Integrated Systems Thinking** - See how ventilation affects hemodynamics, how hemodynamics affects renal function, and how all systems interact
- **Physiology-First** - Evidence-based physiological models with accurate multi-system interactions
- **Risk-Free Learning** - All data is synthetic - no real patient information
- **Interactive Simulations** - Adjust parameters and see real-time physiological responses
- **All Learner Levels** - Suitable for medical students, residents, fellows, and attending intensivists

### 🎨 Technical Features

- **Mobile-First Design** - Responsive layout optimized for all devices
- **Dark Mode** - Comfortable viewing in low-light ICU environments
- **Offline Capable** - Progressive Web App (PWA) with service worker support
- **Modern Tech Stack** - Built with React, TypeScript, Tailwind CSS, and Zustand

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CRITICAL-CARE-MATRIX
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
CRITICAL-CARE-MATRIX/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Button, Card, Slider)
│   │   └── Navigation.tsx  # Main navigation component
│   ├── pages/              # Page components for each module
│   │   ├── Home.tsx
│   │   ├── HemodynamicsLab.tsx
│   │   ├── VentilationLab.tsx
│   │   ├── AcidBaseAnalyzer.tsx
│   │   ├── RenalFunction.tsx
│   │   ├── ShockPathways.tsx
│   │   ├── MatrixDashboard.tsx
│   │   ├── CaseEngine.tsx
│   │   └── AssessmentHub.tsx
│   ├── lib/                # Core logic and utilities
│   │   ├── simulation-engine.ts  # Physiological calculation engine
│   │   └── utils.ts
│   ├── store/              # State management
│   │   └── useSimulationStore.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── data/               # Static data (cases, questions)
│   │   ├── case-scenarios.ts
│   │   └── assessment-questions.ts
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html             # HTML entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Simulation Engine

The core simulation engine (`src/lib/simulation-engine.ts`) implements accurate ICU physiology:

### Hemodynamics
- Mean Arterial Pressure (MAP) calculation
- Cardiac Output and Stroke Volume
- Systemic Vascular Resistance (SVR)
- Frank-Starling curve simulation
- Fluid responsiveness modeling
- Vasopressor effects (norepinephrine, vasopressin, epinephrine, dobutamine)
- PEEP-hemodynamic interactions

### Respiratory
- Minute ventilation and CO₂ elimination
- Oxygenation (PaO₂) based on FiO₂ and PEEP
- Oxyhemoglobin dissociation curve
- PaO₂/FiO₂ ratio (ARDS severity)
- Ventilator mode effects

### Acid-Base
- Henderson-Hasselbalch equation
- Anion gap calculation
- Compensation assessment (respiratory and metabolic)
- Winter's formula for expected compensation
- Mixed disorder detection

### Renal
- GFR and renal perfusion pressure
- Urine output modeling
- Fractional excretion of sodium (FENa)
- AKI classification (prerenal, intrinsic, postrenal)
- KDIGO staging

### Shock
- Hemodynamic classification (hypovolemic, cardiogenic, distributive, obstructive)
- Lactate production and clearance
- Perfusion markers

## Educational Use Cases

### For Medical Students
- Learn fundamental ICU physiology concepts
- Understand acid-base interpretation
- Practice ABG analysis with guided steps
- Explore basic ventilator settings

### For Residents
- Develop integrated multi-system thinking
- Practice shock management
- Learn hemodynamic optimization
- Prepare for ICU rotations

### For Fellows & Attendings
- Refine advanced critical care concepts
- Practice complex cases (ARDS, mixed shock states)
- Use as a teaching tool for trainees
- Quick reference for physiological relationships

## Safety & Disclaimers

⚠️ **EDUCATIONAL PURPOSES ONLY**

This application is designed exclusively for educational purposes:
- Uses synthetic patient data only
- Simplified physiological models
- Not validated for clinical decision-making
- Should never replace clinical judgment
- Not a substitute for formal medical training

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Offline Support**: Vite PWA Plugin with Workbox
- **Icons**: Lucide React

## Contributing

This is an educational project. Contributions that improve physiological accuracy, add educational content, or enhance usability are welcome.

## License

This project is intended for educational use. All content is for teaching purposes only.

## Acknowledgments

Developed following evidence-based critical care guidelines from:
- Surviving Sepsis Campaign
- ARDS Network (ARDSnet)
- Kidney Disease: Improving Global Outcomes (KDIGO)
- Society of Critical Care Medicine (SCCM)

## Contact & Support

For questions, suggestions, or educational collaborations, please open an issue on GitHub.

---

**Remember**: Critical Care Matrix is a learning tool. Always rely on clinical assessment, validated guidelines, and expert consultation for actual patient care.
