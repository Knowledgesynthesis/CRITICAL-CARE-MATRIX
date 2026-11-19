import { describe, expect, it } from 'vitest';
import { MODULES } from '../modules';
import { QUESTIONS } from '../questions';
import { CASES } from '../cases';
import { REFERENCES } from '../references';
import { ABG_CASES } from '../abgCases';
import { GLOSSARY } from '../glossary';
import { DRUGS, INFUSIONS } from '@/engine/drugs';
import { ROUTES } from '@/routes';

const refIds = new Set(REFERENCES.map((r) => r.id));
const moduleIds = new Set(MODULES.map((m) => m.id));
const routePaths = new Set(ROUTES.map((r) => r.path));

describe('references', () => {
  it('unique ids and plausible years', () => {
    expect(refIds.size).toBe(REFERENCES.length);
    for (const r of REFERENCES) {
      expect(r.year).toBeGreaterThanOrEqual(2000);
      expect(r.year).toBeLessThanOrEqual(2026);
    }
  });
});

describe('modules', () => {
  it('numbered 1..n without gaps, unique ids', () => {
    expect(moduleIds.size).toBe(MODULES.length);
    MODULES.forEach((m, i) => expect(m.number).toBe(i + 1));
  });
  it.each(MODULES.map((m) => [m.id, m] as const))('%s is complete and references resolve', (_id, m) => {
    expect(m.objectives.length).toBeGreaterThanOrEqual(2);
    expect(m.concepts.length).toBeGreaterThanOrEqual(3);
    expect(m.numbers.length).toBeGreaterThanOrEqual(4);
    expect(m.pitfalls.length).toBeGreaterThanOrEqual(3);
    expect(m.example.steps.length).toBeGreaterThanOrEqual(3);
    m.refs.forEach((r) => expect(refIds.has(r), `${m.id} → ${r}`).toBe(true));
    m.prereqs.forEach((p) => expect(moduleIds.has(p), `${m.id} prereq ${p}`).toBe(true));
    m.tools.forEach((t) => expect(routePaths.has(t.to), `${m.id} tool ${t.to}`).toBe(true));
    expect(QUESTIONS.filter((q) => q.module === m.id).length, `${m.id} needs ≥6 questions`).toBeGreaterThanOrEqual(6);
  });
  it('prerequisites point backwards (no cycles)', () => {
    for (const m of MODULES) for (const p of m.prereqs) expect(MODULES.find((x) => x.id === p)!.number).toBeLessThan(m.number);
  });
});

describe('question bank', () => {
  it('has unique ids and valid answer keys', () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(100);
    for (const q of QUESTIONS) {
      expect(moduleIds.has(q.module), q.id).toBe(true);
      expect(q.options.length, q.id).toBe(4);
      expect(new Set(q.options).size, `${q.id} duplicate options`).toBe(4);
      expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
      expect(q.answer, q.id).toBeLessThan(q.options.length);
      expect(q.explanation.length, q.id).toBeGreaterThan(30);
      q.refs.forEach((r) => expect(refIds.has(r), `${q.id} → ${r}`).toBe(true));
    }
  });
  it('answer positions are balanced (no "always B" strategy)', () => {
    const counts = [0, 0, 0, 0];
    QUESTIONS.forEach((q) => counts[q.answer]++);
    for (const c of counts) {
      expect(c / QUESTIONS.length).toBeGreaterThan(0.12);
      expect(c / QUESTIONS.length).toBeLessThan(0.4);
    }
  });
  it('numeric option sets are in ascending order', () => {
    const num = (t: string) => /^[<>≥≤~≈]?\s*(-?\d+(?:\.\d+)?)/.exec(t.trim());
    for (const q of QUESTIONS) {
      const ms = q.options.map(num);
      if (ms.every(Boolean)) {
        const vals = ms.map((m) => Number(m![1]));
        expect([...vals].sort((a, b) => a - b), q.id).toEqual(vals);
      }
    }
  });
});

describe('cases', () => {
  it('correct options are spread across positions', () => {
    const counts = [0, 0, 0, 0];
    CASES.forEach((c) => c.stages.forEach((s) => counts[s.options.findIndex((o) => o.correct)]++));
    const total = counts.reduce((a, b) => a + b, 0);
    for (const n of counts) expect(n / total).toBeLessThan(0.45);
  });
  it.each(CASES.map((c) => [c.id, c] as const))('%s: every stage has exactly one correct option and feedback', (_id, c) => {
    expect(moduleIds.has(c.module)).toBe(true);
    expect(c.stages.length).toBeGreaterThanOrEqual(3);
    expect(new Set(c.stages.map((s) => s.id)).size).toBe(c.stages.length);
    for (const s of c.stages) {
      expect(s.options.filter((o) => o.correct).length, `${c.id}/${s.id}`).toBe(1);
      s.options.forEach((o) => expect(o.feedback.length).toBeGreaterThan(10));
    }
    c.refs.forEach((r) => expect(refIds.has(r), `${c.id} → ${r}`).toBe(true));
  });
});

describe('drug and infusion references', () => {
  it('all drug refs resolve', () => {
    for (const d of [...DRUGS, ...INFUSIONS]) d.refs.forEach((r) => expect(refIds.has(r), `${d.id} → ${r}`).toBe(true));
  });
});

describe('abg drills & glossary', () => {
  it('unique ids', () => {
    expect(new Set(ABG_CASES.map((c) => c.id)).size).toBe(ABG_CASES.length);
    expect(new Set(GLOSSARY.map((g) => g.term)).size).toBe(GLOSSARY.length);
  });
});
