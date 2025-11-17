// Core Vitals and Hemodynamic Parameters
export interface Vitals {
  heartRate: number; // bpm
  systolicBP: number; // mmHg
  diastolicBP: number; // mmHg
  meanArterialPressure: number; // MAP, mmHg
  centralVenousPressure: number; // CVP, mmHg
  pulmonaryArteryPressure: number; // PAP, mmHg
  cardiacOutput: number; // L/min
  systemicVascularResistance: number; // SVR, dynes·sec/cm⁵
  temperature: number; // Celsius
  respiratoryRate: number; // breaths per minute
  oxygenSaturation: number; // SpO2, percentage
}

// Ventilator Settings
export interface VentilatorSettings {
  mode: VentilatorMode;
  tidalVolume: number; // mL
  respiratoryRate: number; // breaths per minute
  fiO2: number; // fraction (0.21-1.0)
  peep: number; // cmH2O
  inspiratoryPressure: number; // cmH2O (for pressure control)
  iERatio: string; // e.g., "1:2"
  plateauPressure?: number; // cmH2O
  peakPressure?: number; // cmH2O
}

export type VentilatorMode =
  | 'Volume Control (AC)'
  | 'Pressure Control (AC)'
  | 'SIMV'
  | 'PSV'
  | 'CPAP';

// Arterial Blood Gas
export interface ABG {
  pH: number;
  paCO2: number; // mmHg
  paO2: number; // mmHg
  hco3: number; // mEq/L
  baseExcess: number; // mEq/L
  lactate: number; // mmol/L
  sO2: number; // percentage
}

// Electrolytes
export interface Electrolytes {
  sodium: number; // mEq/L
  potassium: number; // mEq/L
  chloride: number; // mEq/L
  bicarbonate: number; // mEq/L
  calcium: number; // mg/dL
  magnesium: number; // mg/dL
  phosphate: number; // mg/dL
  anionGap: number; // calculated
}

// Renal Parameters
export interface RenalParameters {
  creatinine: number; // mg/dL
  bun: number; // mg/dL
  gfr: number; // mL/min/1.73m²
  urineOutput: number; // mL/hr
  urineSpecificGravity: number;
  urineSodium: number; // mEq/L
  fractionalExcretionNa: number; // percentage
}

// Shock State
export type ShockType =
  | 'Hypovolemic'
  | 'Cardiogenic'
  | 'Distributive (Septic)'
  | 'Obstructive'
  | 'None';

export interface ShockState {
  type: ShockType;
  severity: 'Mild' | 'Moderate' | 'Severe';
  lactate: number;
  scvO2?: number; // central venous oxygen saturation
  markers: string[];
}

// Fluid Administration
export interface FluidAdministration {
  type: 'Crystalloid' | 'Colloid' | 'Blood Product';
  name: string; // e.g., "Normal Saline", "Lactated Ringer's"
  volume: number; // mL
  rate: number; // mL/hr
}

// Medication (Pressors/Inotropes)
export interface Medication {
  name: string;
  dose: number;
  unit: string; // e.g., "mcg/kg/min"
  route: 'IV' | 'PO' | 'Other';
}

// Complete Patient State
export interface PatientState {
  id: string;
  timestamp: Date;
  vitals: Vitals;
  ventilator: VentilatorSettings;
  abg: ABG;
  electrolytes: Electrolytes;
  renal: RenalParameters;
  shock: ShockState;
  fluids: FluidAdministration[];
  medications: Medication[];
}

// Case Scenario
export interface CaseScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  learningObjectives: string[];
  initialState: PatientState;
  targetValues?: Partial<PatientState>;
  hints?: string[];
}

// Assessment Question
export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'scenario';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
}

// Acid-Base Disturbance
export type AcidBaseDisturbance =
  | 'Normal'
  | 'Metabolic Acidosis'
  | 'Metabolic Alkalosis'
  | 'Respiratory Acidosis'
  | 'Respiratory Alkalosis'
  | 'Mixed Disorder';

export interface AcidBaseAnalysis {
  primary: AcidBaseDisturbance;
  compensation: 'None' | 'Partial' | 'Complete';
  anionGap: 'Normal' | 'High' | 'Low';
  expectedCompensation?: {
    parameter: string;
    expectedValue: number;
    actualValue: number;
  };
}

// Intervention
export interface Intervention {
  id: string;
  type: 'Ventilator' | 'Fluid' | 'Medication' | 'Other';
  description: string;
  timestamp: Date;
  parameters?: Record<string, number | string>;
}

// Module/Lab State
export interface LabState {
  currentModule: string;
  patientState: PatientState;
  interventions: Intervention[];
  timeElapsed: number; // seconds
}
