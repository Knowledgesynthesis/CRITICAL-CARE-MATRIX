import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { QUESTIONS } from '@/content/questions';
import { MODULES } from '@/content/modules';

export interface AnswerRecord {
  correct: boolean;
  attempts: number;
  lastAt: number;
  box: number; // Leitner box 1–5
}

export interface CaseRecord {
  score: number;
  total: number;
  completedAt: number;
}

interface ProgressState {
  answers: Record<string, AnswerRecord>;
  cases: Record<string, CaseRecord>;
  drills: Record<string, { correct: boolean; at: number }>;
  visited: Record<string, number>;
  theme: 'dark' | 'light';
  patient: { ageMonths: number; weightKg: number };
  recordAnswer: (id: string, correct: boolean) => void;
  recordCase: (id: string, score: number, total: number) => void;
  recordDrill: (id: string, correct: boolean) => void;
  visit: (moduleId: string) => void;
  setTheme: (t: 'dark' | 'light') => void;
  setPatient: (p: { ageMonths: number; weightKg: number }) => void;
  reset: () => void;
}

const BOX_DAYS = [0, 0, 1, 3, 7, 21];

const memoryStorage = (() => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
})();

function safeStorage() {
  try {
    const k = '__picu_probe__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return window.localStorage;
  } catch {
    return memoryStorage;
  }
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      answers: {},
      cases: {},
      drills: {},
      visited: {},
      theme: 'dark',
      patient: { ageMonths: 24, weightKg: 12 },
      recordAnswer: (id, correct) =>
        set((s) => {
          const prev = s.answers[id];
          const box = correct ? Math.min(5, (prev?.box ?? 1) + (prev ? 1 : 2)) : 1;
          return { answers: { ...s.answers, [id]: { correct, attempts: (prev?.attempts ?? 0) + 1, lastAt: Date.now(), box } } };
        }),
      recordCase: (id, score, total) =>
        set((s) => {
          const prev = s.cases[id];
          const best = prev && prev.score / prev.total > score / total ? prev : { score, total, completedAt: Date.now() };
          return { cases: { ...s.cases, [id]: best } };
        }),
      recordDrill: (id, correct) => set((s) => ({ drills: { ...s.drills, [id]: { correct, at: Date.now() } } })),
      visit: (moduleId) => set((s) => ({ visited: { ...s.visited, [moduleId]: Date.now() } })),
      setTheme: (theme) => set({ theme }),
      setPatient: (patient) => set({ patient }),
      reset: () => set({ answers: {}, cases: {}, drills: {}, visited: {} }),
    }),
    { name: 'picu-matrix-progress', version: 1, storage: createJSONStorage(safeStorage) },
  ),
);

export function isDue(rec: AnswerRecord | undefined, now = Date.now()): boolean {
  if (!rec) return false;
  if (!rec.correct) return true;
  return now - rec.lastAt >= BOX_DAYS[rec.box] * 86_400_000;
}

export interface ModuleMastery {
  total: number;
  answered: number;
  correct: number;
  pct: number;
  mastered: boolean;
}

export function moduleMastery(moduleId: string, answers: Record<string, AnswerRecord>): ModuleMastery {
  const qs = QUESTIONS.filter((q) => q.module === moduleId);
  const answered = qs.filter((q) => answers[q.id]).length;
  const correct = qs.filter((q) => answers[q.id]?.correct).length;
  const pct = qs.length ? Math.round((correct / qs.length) * 100) : 0;
  return { total: qs.length, answered, correct, pct, mastered: qs.length > 0 && pct >= 80 };
}

export function overallMastery(answers: Record<string, AnswerRecord>) {
  const per = MODULES.map((m) => moduleMastery(m.id, answers));
  const correct = per.reduce((a, b) => a + b.correct, 0);
  const total = per.reduce((a, b) => a + b.total, 0);
  return { pct: total ? Math.round((correct / total) * 100) : 0, mastered: per.filter((p) => p.mastered).length, modules: per.length };
}
