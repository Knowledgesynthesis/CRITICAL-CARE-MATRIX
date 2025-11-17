import { create } from 'zustand';
import type { PatientState, Intervention } from '@/types';
import { createNormalPatientState } from '@/lib/simulation-engine';

interface HistoricalDataPoint {
  timestamp: number;
  vitals: {
    map: number;
    co: number;
    svr: number;
    hr: number;
  };
  abg: {
    pH: number;
    paCO2: number;
    paO2: number;
    lactate: number;
  };
}

interface SimulationStore {
  // State
  patientState: PatientState;
  interventions: Intervention[];
  timeElapsed: number;
  isRunning: boolean;
  currentModule: string;
  historicalData: HistoricalDataPoint[];

  // Actions
  setPatientState: (state: PatientState) => void;
  updatePatientState: (updates: Partial<PatientState>) => void;
  addIntervention: (intervention: Intervention) => void;
  resetSimulation: () => void;
  setTimeElapsed: (time: number) => void;
  setIsRunning: (running: boolean) => void;
  setCurrentModule: (module: string) => void;
  addHistoricalDataPoint: (point: HistoricalDataPoint) => void;
  clearHistory: () => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  // Initial State
  patientState: createNormalPatientState(),
  interventions: [],
  timeElapsed: 0,
  isRunning: false,
  currentModule: 'home',
  historicalData: [],

  // Actions
  setPatientState: (state) => {
    set({ patientState: state });
    // Add to historical data
    get().addHistoricalDataPoint({
      timestamp: Date.now(),
      vitals: {
        map: state.vitals.meanArterialPressure,
        co: state.vitals.cardiacOutput,
        svr: state.vitals.systemicVascularResistance,
        hr: state.vitals.heartRate,
      },
      abg: {
        pH: state.abg.pH,
        paCO2: state.abg.paCO2,
        paO2: state.abg.paO2,
        lactate: state.abg.lactate,
      },
    });
  },

  updatePatientState: (updates) => {
    const newState = {
      ...get().patientState,
      ...updates,
      timestamp: new Date(),
    };
    set({ patientState: newState });
    // Add to historical data
    get().addHistoricalDataPoint({
      timestamp: Date.now(),
      vitals: {
        map: newState.vitals.meanArterialPressure,
        co: newState.vitals.cardiacOutput,
        svr: newState.vitals.systemicVascularResistance,
        hr: newState.vitals.heartRate,
      },
      abg: {
        pH: newState.abg.pH,
        paCO2: newState.abg.paCO2,
        paO2: newState.abg.paO2,
        lactate: newState.abg.lactate,
      },
    });
  },

  addIntervention: (intervention) =>
    set((state) => ({
      interventions: [...state.interventions, intervention],
    })),

  resetSimulation: () => {
    const normalState = createNormalPatientState();
    set({
      patientState: normalState,
      interventions: [],
      timeElapsed: 0,
      isRunning: false,
      historicalData: [{
        timestamp: Date.now(),
        vitals: {
          map: normalState.vitals.meanArterialPressure,
          co: normalState.vitals.cardiacOutput,
          svr: normalState.vitals.systemicVascularResistance,
          hr: normalState.vitals.heartRate,
        },
        abg: {
          pH: normalState.abg.pH,
          paCO2: normalState.abg.paCO2,
          paO2: normalState.abg.paO2,
          lactate: normalState.abg.lactate,
        },
      }],
    });
  },

  setTimeElapsed: (time) => set({ timeElapsed: time }),

  setIsRunning: (running) => set({ isRunning: running }),

  setCurrentModule: (module) => set({ currentModule: module }),

  addHistoricalDataPoint: (point) =>
    set((state) => ({
      historicalData: [...state.historicalData.slice(-50), point], // Keep last 50 points
    })),

  clearHistory: () => set({ historicalData: [] }),
}));
