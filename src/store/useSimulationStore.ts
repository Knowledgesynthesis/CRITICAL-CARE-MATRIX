import { create } from 'zustand';
import type { PatientState, Intervention } from '@/types';
import { createNormalPatientState } from '@/lib/simulation-engine';

interface SimulationStore {
  // State
  patientState: PatientState;
  interventions: Intervention[];
  timeElapsed: number;
  isRunning: boolean;
  currentModule: string;

  // Actions
  setPatientState: (state: PatientState) => void;
  updatePatientState: (updates: Partial<PatientState>) => void;
  addIntervention: (intervention: Intervention) => void;
  resetSimulation: () => void;
  setTimeElapsed: (time: number) => void;
  setIsRunning: (running: boolean) => void;
  setCurrentModule: (module: string) => void;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  // Initial State
  patientState: createNormalPatientState(),
  interventions: [],
  timeElapsed: 0,
  isRunning: false,
  currentModule: 'home',

  // Actions
  setPatientState: (state) => set({ patientState: state }),

  updatePatientState: (updates) =>
    set((state) => ({
      patientState: {
        ...state.patientState,
        ...updates,
        timestamp: new Date(),
      },
    })),

  addIntervention: (intervention) =>
    set((state) => ({
      interventions: [...state.interventions, intervention],
    })),

  resetSimulation: () =>
    set({
      patientState: createNormalPatientState(),
      interventions: [],
      timeElapsed: 0,
      isRunning: false,
    }),

  setTimeElapsed: (time) => set({ timeElapsed: time }),

  setIsRunning: (running) => set({ isRunning: running }),

  setCurrentModule: (module) => set({ currentModule: module }),
}));
