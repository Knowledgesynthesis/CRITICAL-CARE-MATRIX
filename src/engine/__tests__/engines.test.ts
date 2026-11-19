import { describe, expect, it } from 'vitest';
import * as peds from '../peds';
import { phoenixScore, phoenixMapCutoffs } from '../phoenix';
import {
  satFromPO2,
  po2FromSat,
  alveolarPO2,
  oxygenationIndex,
  pardsSeverity,
  ardsnetMinPeep,
  simulateVentilator,
  LUNG_PRESETS,
  phFrom,
  hco3From,
  ventAlerts,
  ventWaveforms,
  VENT_SCENARIOS,
  type VentPatient,
  type VentSettings,
} from '../respiratory';
import {
  makeBaseline,
  SCENARIOS,
  scenarioState,
  computeHemodynamics,
  giveFluid,
  intubate,
  decompress,
  passTime,
  NO_DRUGS,
  guytonCurves,
  treatRhythm,
  giveHydrocortisone,
  type HemoState,
} from '../hemodynamics';
import { interpretAcidBase, coreDisorders, wintersExpected } from '../acidBase';
import { ABG_CASES } from '@/content/abgCases';
import { kdigoStage, bedsideSchwartz, ckidU25, fluidOverloadPercent, renalAnginaIndex, crrtPlan } from '../renal';
import { deltaNaPerLitre, INFUSATES, freeWaterDeficit, gir, correctedNaForGlucose, hyponatremiaBolus } from '../electrolytes';
import { DRUGS, calcDose, INFUSIONS, infusionRateMlH, infusionDose } from '../drugs';
import { cpp, cppTarget } from '../neuro';
import { qpqsSingleVentricle } from '../cardiac';

// Deterministic PRNG for reproducible stress tests
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}
const finite = (o: Record<string, unknown>) =>
  Object.entries(o).every(([, v]) => typeof v !== 'number' || Number.isFinite(v));

describe('pediatric norms', () => {
  it('APLS weight estimates', () => {
    expect(peds.estimateWeight(6)).toBe(7);
    expect(peds.estimateWeight(36)).toBe(14);
    expect(peds.estimateWeight(96)).toBe(31);
  });
  it('PALS hypotension thresholds', () => {
    expect(peds.hypotensionSBP(0.5)).toBe(60);
    expect(peds.hypotensionSBP(6)).toBe(70);
    expect(peds.hypotensionSBP(60)).toBe(80);
    expect(peds.hypotensionSBP(156)).toBe(90);
  });
  it('ETT sizes follow age/4 + 3.5 for cuffed tubes', () => {
    expect(peds.equipment(48, 16).ettCuffed).toBe(4.5);
    expect(peds.equipment(96, 26).ettCuffed).toBe(5.5);
    expect(peds.equipment(4, 6).ettCuffed).toBe(3.0);
    expect(peds.equipment(48, 16).ettDepthCm).toBe(14);
  });
  it('Holliday–Segar', () => {
    expect(peds.maintenanceRate(8)).toBe(32);
    expect(peds.maintenanceRate(15)).toBe(50);
    expect(peds.maintenanceRate(30)).toBe(70);
    expect(peds.maintenanceRate(90)).toBe(100);
    expect(peds.maintenanceDaily(25)).toBe(1600);
  });
  it('PBW: Traub–Johnson below 152 cm, monotonic', () => {
    expect(peds.predictedBodyWeight(95)).toBeCloseTo(14.1, 0);
    let prev = 0;
    for (let h = 50; h <= 190; h += 5) {
      const w = peds.predictedBodyWeight(h);
      expect(w).toBeGreaterThan(prev);
      prev = w;
    }
    expect(peds.ventilationWeight(6, 60)).toBe(6); // infant: actual < predicted
  });
  it('vital ranges exist for every age', () => {
    for (let m = 0; m < 216; m += 1) {
      const hr = peds.heartRateRange(m);
      expect(hr.hi).toBeGreaterThan(hr.lo);
      const bp = peds.bpNormal(m);
      expect(bp.sbp.hi).toBeGreaterThan(bp.sbp.lo);
      expect(peds.mapPercentiles(m).p50).toBeGreaterThan(peds.mapPercentiles(m).p5);
    }
  });
});

describe('Phoenix sepsis score', () => {
  const base = {
    ageMonths: 24,
    respSupport: 'none' as const,
    vasoactiveCount: 0,
    bilateralFixedPupils: false,
    suspectedInfection: true,
  };
  it('MAP cutoffs by age', () => {
    expect(phoenixMapCutoffs(0.5)).toEqual([17, 31]);
    expect(phoenixMapCutoffs(13)).toEqual([31, 44]);
    expect(phoenixMapCutoffs(150)).toEqual([38, 52]);
  });
  it('septic shock = sepsis + ≥1 CV point', () => {
    const r = phoenixScore({ ...base, vasoactiveCount: 1, lactate: 6 });
    expect(r.cardiovascular).toBe(2);
    expect(r.sepsis).toBe(true);
    expect(r.septicShock).toBe(true);
  });
  it('respiratory capped at 1 without IMV', () => {
    const r = phoenixScore({ ...base, respSupport: 'noninvasive', pf: 80 });
    expect(r.respiratory).toBe(1);
    const r2 = phoenixScore({ ...base, respSupport: 'imv', pf: 80 });
    expect(r2.respiratory).toBe(3);
  });
  it('SF ignored when SpO2 >97%', () => {
    const r = phoenixScore({ ...base, respSupport: 'imv', sf: 140, spo2: 99 });
    expect(r.respiratory).toBe(0);
  });
  it('coagulation max 2, neuro fixed pupils 2', () => {
    const r = phoenixScore({ ...base, platelets: 50, inr: 2, dDimer: 5, fibrinogen: 80, bilateralFixedPupils: true });
    expect(r.coagulation).toBe(2);
    expect(r.neurologic).toBe(2);
    expect(r.total).toBe(4);
  });
  it('no infection → no sepsis', () => {
    expect(phoenixScore({ ...base, suspectedInfection: false, lactate: 12 }).sepsis).toBe(false);
  });
});

describe('gas exchange', () => {
  it('ODC landmarks', () => {
    expect(satFromPO2(27)).toBeCloseTo(0.5, 1);
    expect(satFromPO2(60)).toBeCloseTo(0.9, 1);
    expect(satFromPO2(100)).toBeGreaterThan(0.97);
    expect(po2FromSat(satFromPO2(55))).toBeCloseTo(55, 0);
  });
  it('alveolar gas equation', () => {
    expect(alveolarPO2(0.21, 40)).toBeCloseTo(99.7, 0);
  });
  it('Henderson–Hasselbalch round trip', () => {
    expect(phFrom(24, 40)).toBeCloseTo(7.39, 1);
    expect(hco3From(7.4, 40)).toBeCloseTo(24.5, 0);
  });
  it('OI and PALICC-2 categories', () => {
    expect(oxygenationIndex(15, 0.8, 75)).toBeCloseTo(16);
    expect(pardsSeverity({ support: 'invasive', oi: 16 }).category).toBe('severe');
    expect(pardsSeverity({ support: 'invasive', oi: 8 }).category).toBe('mild-moderate');
    expect(pardsSeverity({ support: 'invasive', osi: 12 }).category).toBe('severe');
    expect(pardsSeverity({ support: 'niv', sf: 200 }).category).toBe('mild-moderate');
    expect(pardsSeverity({ support: 'hfnc-or-nasal', sf: 200 }).category).toBe('possible');
  });
  it('ARDSnet table', () => {
    expect(ardsnetMinPeep(0.4)).toBe(5);
    expect(ardsnetMinPeep(0.6)).toBe(10);
    expect(ardsnetMinPeep(0.8)).toBe(14);
    expect(ardsnetMinPeep(1)).toBe(18);
  });
});

const ventPt = (w = 14, h = 95, age = 36): VentPatient => ({
  weightKg: w,
  heightCm: h,
  ageMonths: age,
  pbwKg: peds.ventilationWeight(w, h),
  hb: 11,
  hco3: 24,
  tempC: 37,
  ettId: peds.equipment(age, w).ettCuffed,
  equipmentDeadSpaceMl: 5,
});
const vs = (o: Partial<VentSettings> = {}): VentSettings => ({ mode: 'VC', vtMlPerKg: 7, pInsp: 15, rr: 24, peep: 5, fio2: 0.4, ti: 0.7, ...o });
const lung = (id: string) => LUNG_PRESETS.find((l) => l.id === id)!;

describe('ventilator model', () => {
  it('healthy toddler on modest settings has normal gases', () => {
    const r = simulateVentilator(ventPt(), vs(), lung('normal'));
    expect(r.paco2).toBeGreaterThan(30);
    expect(r.paco2).toBeLessThan(48);
    expect(r.spo2).toBeGreaterThanOrEqual(97);
    expect(r.pplat).toBeLessThan(20);
  });
  it('bigger Vt → higher Pplat and lower PaCO2', () => {
    const a = simulateVentilator(ventPt(), vs({ vtMlPerKg: 6 }), lung('pards-recruitable'));
    const b = simulateVentilator(ventPt(), vs({ vtMlPerKg: 10 }), lung('pards-recruitable'));
    expect(b.pplat).toBeGreaterThan(a.pplat);
    expect(b.paco2).toBeLessThan(a.paco2);
  });
  it('PEEP recruits a recruitable lung but not a consolidated one', () => {
    const pts = ventPt();
    const lo = simulateVentilator(pts, vs({ peep: 5, fio2: 0.8 }), lung('pards-recruitable'));
    const hi = simulateVentilator(pts, vs({ peep: 14, fio2: 0.8 }), lung('pards-recruitable'));
    expect(hi.spo2 - lo.spo2).toBeGreaterThanOrEqual(5);
    expect(hi.compliancePerKg).toBeGreaterThan(lo.compliancePerKg);
    const plo = simulateVentilator(pts, vs({ peep: 5, fio2: 0.8 }), lung('pards-poor'));
    const phi = simulateVentilator(pts, vs({ peep: 14, fio2: 0.8 }), lung('pards-poor'));
    expect(phi.spo2 - plo.spo2).toBeLessThan(hi.spo2 - lo.spo2);
  });
  it('true shunt is FiO2-refractory, V/Q mismatch is FiO2-responsive', () => {
    const pts = ventPt();
    const shunt = lung('pards-recruitable');
    const vq = lung('asthma');
    const s1 = simulateVentilator(pts, vs({ fio2: 0.4 }), shunt).pao2;
    const s2 = simulateVentilator(pts, vs({ fio2: 1 }), shunt).pao2;
    const v1 = simulateVentilator(pts, vs({ fio2: 0.21, rr: 14 }), vq).pao2;
    const v2 = simulateVentilator(pts, vs({ fio2: 0.4, rr: 14 }), vq).pao2;
    expect(s2 / s1).toBeLessThan(v2 / v1 * 2);
    expect(v2).toBeGreaterThan(v1 * 1.5);
  });
  it('asthma: faster RR creates auto-PEEP and can raise PaCO2', () => {
    const pts = ventPt(40, 150, 144);
    const slow = simulateVentilator(pts, vs({ rr: 12, ti: 0.9 }), lung('asthma'));
    const fast = simulateVentilator(pts, vs({ rr: 30, ti: 0.9 }), lung('asthma'));
    expect(fast.autoPeep).toBeGreaterThan(slow.autoPeep + 2);
    expect(fast.teOverTau).toBeLessThan(slow.teOverTau);
  });
  it('ETT size dominates resistance in infants', () => {
    const small = simulateVentilator({ ...ventPt(4, 55, 1), ettId: 3.0 }, vs({ rr: 35 }), lung('normal'));
    const big = simulateVentilator({ ...ventPt(4, 55, 1), ettId: 3.5 }, vs({ rr: 35 }), lung('normal'));
    expect(small.resistance).toBeGreaterThan(big.resistance * 1.4);
  });
  it('equipment dead space raises PaCO2 in a small infant', () => {
    const a = simulateVentilator({ ...ventPt(4, 55, 1), equipmentDeadSpaceMl: 2 }, vs({ rr: 35 }), lung('normal'));
    const b = simulateVentilator({ ...ventPt(4, 55, 1), equipmentDeadSpaceMl: 15 }, vs({ rr: 35 }), lung('normal'));
    expect(b.paco2).toBeGreaterThan(a.paco2 * 1.4);
  });
  const fromScenario = (id: string) => {
    const sc = VENT_SCENARIOS.find((x) => x.id === id)!;
    const h = peds.estimateHeight(sc.ageMonths);
    const p: VentPatient = {
      ...ventPt(sc.weightKg, h, sc.ageMonths),
      pbwKg: peds.ventilationWeight(sc.weightKg, h),
      ettId: sc.ettId ?? peds.equipment(sc.ageMonths, sc.weightKg).ettCuffed,
      equipmentDeadSpaceMl: sc.deadSpaceMl ?? 5,
    };
    return { sc, p, l: lung(sc.lungId) };
  };
  it('every ventilator scenario is internally valid', () => {
    for (const sc of VENT_SCENARIOS) {
      expect(LUNG_PRESETS.some((l) => l.id === sc.lungId), sc.id).toBe(true);
      expect(sc.settings.vtMlPerKg).toBeLessThanOrEqual(14);
      expect(sc.settings.fio2).toBeGreaterThanOrEqual(0.21);
      expect(sc.settings.fio2).toBeLessThanOrEqual(1);
    }
  });
  it('scenario lessons hold: PALICC-2 fix, gas trapping, dead space, PEEP step-down', () => {
    let x = fromScenario('pards-injurious');
    const inj0 = simulateVentilator(x.p, x.sc.settings, x.l);
    const inj1 = simulateVentilator(x.p, { ...x.sc.settings, vtMlPerKg: 6, peep: 14, rr: 30 }, x.l);
    expect(inj0.drivingPressure).toBeGreaterThan(15);
    expect(inj1.drivingPressure).toBeLessThanOrEqual(15);
    expect(inj1.spo2).toBeGreaterThan(inj0.spo2 + 5);
    x = fromScenario('asthma-fast');
    const a0 = simulateVentilator(x.p, x.sc.settings, x.l);
    const a1 = simulateVentilator(x.p, { ...x.sc.settings, rr: 12, ti: 0.8 }, x.l);
    expect(a0.autoPeep - a1.autoPeep).toBeGreaterThan(4);
    x = fromScenario('neonate-hme');
    const h0 = simulateVentilator(x.p, x.sc.settings, x.l);
    const h1 = simulateVentilator({ ...x.p, equipmentDeadSpaceMl: 2 }, x.sc.settings, x.l);
    expect(h0.paco2 - h1.paco2).toBeGreaterThan(20);
    x = fromScenario('pards-overdistended');
    const o0 = simulateVentilator(x.p, x.sc.settings, x.l);
    const o1 = simulateVentilator(x.p, { ...x.sc.settings, peep: 10 }, x.l);
    expect(o1.oi).toBeLessThan(o0.oi);
    expect(o1.pplat).toBeLessThan(o0.pplat - 5);
    expect(o1.spo2).toBeGreaterThanOrEqual(o0.spo2);
    x = fromScenario('cardiogenic');
    const c0 = simulateVentilator(x.p, x.sc.settings, x.l);
    const c1 = simulateVentilator(x.p, { ...x.sc.settings, peep: 9 }, x.l);
    expect(c1.shuntFraction).toBeLessThan(c0.shuntFraction * 0.7);
  });
  it('per-lung targets: stiff chest wall tolerates Pplat 30, BPD tolerates larger Vt', () => {
    const cw = lung('chest-wall');
    const bpd = lung('bpd');
    const p = ventPt(55, 160, 168);
    const r = { ...simulateVentilator(p, vs(), cw), pplat: 30, vtPerKg: 7, drivingPressure: 12 };
    expect(ventAlerts(r, vs(), cw, p).some((x) => x.text.includes('Pplat'))).toBe(false);
    const rb = { ...simulateVentilator(ventPt(6, 66, 8), vs({ vtMlPerKg: 11 }), bpd), vtPerKg: 11 };
    expect(ventAlerts(rb, vs({ vtMlPerKg: 11 }), bpd, ventPt(6, 66, 8)).some((x) => x.level === 'warn' && x.text.startsWith('Vt'))).toBe(false);
  });
  it('stress: random settings never produce NaN or impossible values', () => {
    const r = rng(42);
    for (let i = 0; i < 3000; i++) {
      const age = Math.floor(r() * 216);
      const w = peds.estimateWeight(age) * (0.7 + r() * 0.6);
      const h = peds.estimateHeight(age);
      const p: VentPatient = { ...ventPt(w, h, age), ettId: 2.5 + Math.round(r() * 10) / 2, equipmentDeadSpaceMl: r() * 60, hb: 6 + r() * 10, hco3: 10 + r() * 25, tempC: 35 + r() * 5 };
      const s: VentSettings = {
        mode: r() > 0.5 ? 'VC' : 'PC',
        vtMlPerKg: 3 + r() * 9,
        pInsp: 5 + r() * 30,
        rr: 6 + Math.floor(r() * 50),
        peep: Math.floor(r() * 21),
        fio2: 0.21 + r() * 0.79,
        ti: 0.3 + r() * 1.2,
      };
      const l = LUNG_PRESETS[Math.floor(r() * LUNG_PRESETS.length)];
      const out = simulateVentilator(p, s, l);
      expect(finite(out as unknown as Record<string, unknown>)).toBe(true);
      expect(out.spo2).toBeGreaterThanOrEqual(0);
      expect(out.spo2).toBeLessThanOrEqual(100);
      expect(out.pplat).toBeGreaterThanOrEqual(s.peep - 1e-6);
      expect(out.ppeak).toBeGreaterThanOrEqual(out.pplat - 1e-6);
      expect(out.vdvt).toBeGreaterThanOrEqual(0);
      expect(out.vdvt).toBeLessThanOrEqual(1);
      expect(out.autoPeep).toBeGreaterThanOrEqual(0);
      expect(ventAlerts(out, s, l, p).length).toBeGreaterThan(0);
      if (i % 100 === 0) expect(ventWaveforms(out, s).every((pt) => Number.isFinite(pt.p) && Number.isFinite(pt.flow))).toBe(true);
    }
  });
});

describe('hemodynamic model', () => {
  it('reproduces age-normal values at baseline for every age', () => {
    for (const m of [0.5, 6, 18, 48, 96, 150, 200]) {
      const b = makeBaseline(m);
      const o = computeHemodynamics(b, scenarioState(SCENARIOS[0], b));
      expect(o.ci).toBeCloseTo(4, 1);
      expect(o.cvp).toBeCloseTo(5, 0);
      expect(Math.abs(o.map - b.map0)).toBeLessThan(1.5);
      expect(Math.abs(o.hr - b.hr0)).toBeLessThan(2);
      expect(o.profile).toBe('normal');
    }
  });
  it('hypovolemia presents as compensated shock and is fluid-responsive', () => {
    const sc = SCENARIOS.find((s) => s.id === 'hypovolemic')!;
    const b = makeBaseline(sc.defaultAgeMonths);
    const s0 = scenarioState(sc, b);
    const o0 = computeHemodynamics(b, s0);
    expect(o0.profile).toBe('compensated');
    expect(o0.sbp).toBeGreaterThanOrEqual(peds.hypotensionSBP(b.ageMonths));
    expect(o0.hr).toBeGreaterThan(peds.heartRateRange(b.ageMonths).hi - 40);
    expect(o0.ci).toBeLessThan(0.85 * b.ci0);
    const o1 = computeHemodynamics(b, giveFluid(b, s0, 20, 'crystalloid'));
    expect(o1.sv / o0.sv).toBeGreaterThan(1.15);
    expect(o1.hr).toBeLessThan(o0.hr);
  });
  it('cardiogenic shock is NOT fluid-responsive but congests', () => {
    const sc = SCENARIOS.find((s) => s.id === 'cardiogenic')!;
    const b = makeBaseline(sc.defaultAgeMonths);
    const s0 = scenarioState(sc, b);
    const o0 = computeHemodynamics(b, s0);
    const o1 = computeHemodynamics(b, giveFluid(b, s0, 20, 'crystalloid'));
    expect(o1.sv / o0.sv).toBeLessThan(1.1);
    expect(o1.cvp).toBeGreaterThan(o0.cvp + 2);
    expect(o1.liverEdgeCm).toBeGreaterThan(o0.liverEdgeCm);
    // inodilator helps, pure vasoconstrictor hurts flow
    const mil = computeHemodynamics(b, { ...s0, drugs: { ...NO_DRUGS, milrinone: 0.5 } });
    const ne = computeHemodynamics(b, { ...s0, drugs: { ...NO_DRUGS, norepinephrine: 0.2 } });
    expect(mil.ci).toBeGreaterThan(o0.ci);
    expect(ne.ci).toBeLessThan(o0.ci);
  });
  it('cold septic shock: epinephrine raises flow; norepinephrine raises pressure more than flow', () => {
    const sc = SCENARIOS.find((s) => s.id === 'septic-cold')!;
    const b = makeBaseline(sc.defaultAgeMonths);
    const s0 = scenarioState(sc, b);
    const o0 = computeHemodynamics(b, s0);
    const epi = computeHemodynamics(b, { ...s0, drugs: { ...NO_DRUGS, epinephrine: 0.1 } });
    const ne = computeHemodynamics(b, { ...s0, drugs: { ...NO_DRUGS, norepinephrine: 0.1 } });
    expect(epi.ci).toBeGreaterThan(o0.ci * 1.15);
    expect(ne.map).toBeGreaterThan(o0.map);
    expect(ne.ci).toBeLessThan(epi.ci);
    expect(epi.lactate).toBeLessThan(o0.lactate);
  });
  it('warm shock: norepinephrine restores diastolic pressure', () => {
    const sc = SCENARIOS.find((s) => s.id === 'septic-warm')!;
    const b = makeBaseline(sc.defaultAgeMonths);
    const s0 = scenarioState(sc, b);
    const o0 = computeHemodynamics(b, s0);
    expect(o0.warmCold).toBe('warm');
    const ne = computeHemodynamics(b, { ...s0, drugs: { ...NO_DRUGS, norepinephrine: 0.15 } });
    expect(ne.dbp).toBeGreaterThan(o0.dbp + 8);
  });
  it('obstructive shock is fixed by decompression', () => {
    const sc = SCENARIOS.find((s) => s.id === 'obstructive')!;
    const b = makeBaseline(sc.defaultAgeMonths);
    const s0 = scenarioState(sc, b);
    const o0 = computeHemodynamics(b, s0);
    const o1 = computeHemodynamics(b, decompress(s0));
    expect(o1.ci).toBeGreaterThan(o0.ci * 1.5);
    expect(o1.cvp).toBeLessThan(o0.cvp);
  });
  it('propofol induction drops MAP more than ketamine in shock', () => {
    const sc = SCENARIOS.find((s) => s.id === 'septic-cold')!;
    const b = makeBaseline(sc.defaultAgeMonths);
    const s0 = scenarioState(sc, b);
    const k = computeHemodynamics(b, intubate(s0, 'ketamine'));
    const p = computeHemodynamics(b, intubate(s0, 'propofol'));
    expect(p.map).toBeLessThan(k.map - 5);
  });
  it('crystalloid dilutes hemoglobin; PRBC raises it', () => {
    const b = makeBaseline(120);
    const s0 = scenarioState(SCENARIOS.find((s) => s.id === 'hemorrhagic')!, b);
    expect(giveFluid(b, s0, 20, 'crystalloid').hb).toBeLessThan(s0.hb);
    expect(giveFluid(b, s0, 15, 'prbc').hb).toBeGreaterThan(s0.hb + 1.5);
  });
  const scen = (id: string) => {
    const sc = SCENARIOS.find((x) => x.id === id)!;
    const b = makeBaseline(sc.defaultAgeMonths);
    return { b, s: scenarioState(sc, b) };
  };
  it('neurogenic shock: hypotension without tachycardia, norepinephrine restores MAP', () => {
    const { b, s } = scen('neurogenic');
    const o = computeHemodynamics(b, s);
    expect(o.hypotensive || o.mapBelowP5).toBe(true);
    expect(o.hr).toBeLessThan(peds.heartRateRange(b.ageMonths).hi);
    const ne = computeHemodynamics(b, { ...s, drugs: { ...NO_DRUGS, norepinephrine: 0.15 } });
    expect(ne.map).toBeGreaterThan(o.map + 15);
  });
  it('adrenal crisis: catecholamine resistance reversed by hydrocortisone', () => {
    const { b, s } = scen('adrenal');
    const base = computeHemodynamics(b, s);
    const neOnly = computeHemodynamics(b, { ...s, drugs: { ...NO_DRUGS, norepinephrine: 0.15 } });
    const neWithSteroid = computeHemodynamics(b, { ...giveHydrocortisone(s), drugs: { ...NO_DRUGS, norepinephrine: 0.15 } });
    expect(neOnly.map - base.map).toBeLessThan(6);
    expect(neWithSteroid.map - base.map).toBeGreaterThan(15);
  });
  it('SVT shock: cardioversion restores output; fluid mainly congests', () => {
    const { b, s } = scen('svt');
    const o = computeHemodynamics(b, s);
    const fluid = computeHemodynamics(b, giveFluid(b, s, 20, 'crystalloid'));
    const conv = computeHemodynamics(b, treatRhythm(b, s));
    expect(conv.ci).toBeGreaterThan(o.ci * 1.3);
    expect(conv.hr).toBeLessThan(200);
    expect(fluid.liverEdgeCm).toBeGreaterThan(o.liverEdgeCm + 1);
  });
  it('complete heart block: pacing restores output', () => {
    const { b, s } = scen('heart-block');
    const o = computeHemodynamics(b, s);
    const paced = computeHemodynamics(b, treatRhythm(b, s));
    expect(o.hr).toBe(38);
    expect(paced.ci).toBeGreaterThan(o.ci * 1.8);
  });
  it('post-bypass low output: milrinone raises CI, norepinephrine lowers it', () => {
    const { b, s } = scen('lcos');
    const o = computeHemodynamics(b, s);
    expect(computeHemodynamics(b, { ...s, drugs: { ...NO_DRUGS, milrinone: 0.5 } }).ci).toBeGreaterThan(o.ci * 1.15);
    expect(computeHemodynamics(b, { ...s, drugs: { ...NO_DRUGS, norepinephrine: 0.15 } }).ci).toBeLessThan(o.ci);
  });
  it('Guyton operating point lies on both curves', () => {
    const b = makeBaseline(24);
    const g = guytonCurves(b, scenarioState(SCENARIOS[0], b));
    expect(g.operating.ci).toBeCloseTo(4, 0);
    expect(g.points.length).toBeGreaterThan(20);
  });
  it('stress: random states and drug combinations stay finite and physiologic', () => {
    const r = rng(7);
    for (let i = 0; i < 2500; i++) {
      const sc = SCENARIOS[Math.floor(r() * SCENARIOS.length)];
      const b = makeBaseline(Math.floor(r() * 216));
      let s: HemoState = scenarioState(sc, b);
      s = {
        ...s,
        drugs: {
          epinephrine: r() > 0.6 ? r() : 0,
          norepinephrine: r() > 0.6 ? r() : 0,
          dopamine: r() > 0.8 ? r() * 20 : 0,
          dobutamine: r() > 0.8 ? r() * 20 : 0,
          milrinone: r() > 0.7 ? r() : 0,
          vasopressin: r() > 0.7 ? r() * 2 : 0,
        },
        ventilated: r() > 0.5,
        peep: Math.floor(r() * 18),
      };
      const n = Math.floor(r() * 5);
      for (let k = 0; k < n; k++) s = giveFluid(b, s, 20, r() > 0.8 ? 'prbc' : 'crystalloid');
      if (r() > 0.7) s = passTime(s, 60);
      const o = computeHemodynamics(b, s);
      expect(finite(o as unknown as Record<string, unknown>)).toBe(true);
      expect(o.hr).toBeGreaterThan(30);
      expect(o.hr).toBeLessThan(s.fixedHr ? 300 : 260);
      expect(o.ci).toBeGreaterThanOrEqual(0);
      expect(o.ci).toBeLessThan(12);
      expect(o.map).toBeLessThan(220); // extreme pressor stacking reaches catecholamine-crisis levels, never runaway
      expect(o.sbp).toBeGreaterThanOrEqual(o.dbp);
      expect(o.scvo2).toBeGreaterThanOrEqual(15);
      expect(o.scvo2).toBeLessThanOrEqual(95);
      expect(o.lactate).toBeGreaterThan(0);
      expect(o.urineOutput).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('acid–base interpreter', () => {
  it.each(ABG_CASES.map((c) => [c.id, c] as const))('practice case %s matches its answer key', (_id, c) => {
    const r = interpretAcidBase(c.input);
    expect(r.internallyConsistent).toBe(true);
    expect(new Set(coreDisorders(r.disorders))).toEqual(new Set(c.answer));
    if (c.anionGap === 'high') expect(r.disorders).toContain('high anion gap metabolic acidosis');
    if (c.anionGap === 'normal') expect(r.disorders).not.toContain('high anion gap metabolic acidosis');
  });
  it("Winter's formula", () => {
    expect(wintersExpected(10)).toEqual([21, 25]);
  });
  it('flags internally inconsistent gases', () => {
    expect(interpretAcidBase({ ph: 7.4, paco2: 40, hco3: 14 }).internallyConsistent).toBe(false);
  });
  it('normal gas → no disorder', () => {
    const r = interpretAcidBase({ ph: 7.4, paco2: 40, hco3: 24, na: 140, cl: 104 });
    expect(r.disorders).toHaveLength(0);
  });
  it('stress: any physiologic combination yields a summary', () => {
    const r = rng(3);
    for (let i = 0; i < 2000; i++) {
      const ph = 6.8 + r() * 0.9;
      const paco2 = 10 + r() * 110;
      const out = interpretAcidBase({ ph, paco2, na: 120 + r() * 40, cl: 80 + r() * 45, albumin: 1 + r() * 4, lactate: r() * 15 });
      expect(out.summary.length).toBeGreaterThan(5);
      expect(Number.isFinite(out.baseExcess)).toBe(true);
    }
  });
});

describe('renal', () => {
  it('bedside Schwartz', () => {
    expect(bedsideSchwartz(100, 0.4)).toBeCloseTo(103.25, 1);
  });
  it('CKiD U25 is continuous with Schwartz at age 12', () => {
    expect(ckidU25(12, 'M', 150, 0.6)).toBeCloseTo((39 * 1.5) / 0.6, 1);
  });
  it('KDIGO staging', () => {
    expect(kdigoStage({ baselineScr: 0.3, currentScr: 0.5 }).stage).toBe(1);
    expect(kdigoStage({ baselineScr: 0.3, currentScr: 0.65 }).stage).toBe(2);
    expect(kdigoStage({ baselineScr: 0.3, currentScr: 0.95 }).stage).toBe(3);
    expect(kdigoStage({ baselineScr: 0.4, currentScr: 0.4, uoMlKgH: 0.4, uoHours: 8 }).stage).toBe(1);
    expect(kdigoStage({ baselineScr: 0.4, currentScr: 0.4, uoMlKgH: 0.2, uoHours: 24 }).stage).toBe(3);
    expect(kdigoStage({ baselineScr: 0.5, currentScr: 0.5, uoMlKgH: 0.8, uoHours: 24, neonate: true }).stage).toBe(1);
  });
  it('fluid overload and renal angina', () => {
    expect(fluidOverloadPercent(3, 1.5, 10)).toBeCloseTo(15);
    expect(renalAnginaIndex({ risk: 'ventilated-vasoactive', injuryBy: 'fo', foPercent: 6 }).positive).toBe(true);
    expect(renalAnginaIndex({ risk: 'icu', injuryBy: 'scr', scrRatio: 1.2 }).positive).toBe(false);
  });
  it('CRRT plan blood-primes small children', () => {
    expect(crrtPlan(5, 60, 3, 90).bloodPrime).toBe(true);
    expect(crrtPlan(40, 150, 144, 90).bloodPrime).toBe(false);
    expect(crrtPlan(70, 175, 200, 150).effluentMlH).toBeGreaterThan(2000);
  });
});

describe('electrolytes', () => {
  it('Adrogué–Madias: 3% saline in a 20 kg child', () => {
    const tbw = 20 * 0.6;
    const d = deltaNaPerLitre(120, INFUSATES[0], tbw);
    expect(d).toBeCloseTo((513 - 120) / 13, 1);
    // 1 mL/kg ≈ +1 mmol/L rule of thumb
    expect(d * 0.02).toBeGreaterThan(0.4);
    expect(d * 0.02).toBeLessThan(1.2);
  });
  it('free-water deficit, GIR, glucose-corrected sodium', () => {
    expect(freeWaterDeficit(160, 6)).toBeCloseTo(0.857, 2);
    expect(gir(10, 12, 4)).toBeCloseTo(5);
    expect(correctedNaForGlucose(130, 600)).toBeCloseTo(138);
    expect(hyponatremiaBolus(70).bolusMl).toBe(100);
  });
});

describe('drug calculator', () => {
  it('known doses', () => {
    const epi = DRUGS.find((d) => d.id === 'epi-iv')!;
    expect(calcDose(epi, 10)).toMatchObject({ dose: 0.1, volumeMl: 1 });
    expect(calcDose(epi, 120).dose).toBe(1);
    const adeno = DRUGS.find((d) => d.id === 'adenosine-1')!;
    expect(calcDose(adeno, 80)).toMatchObject({ dose: 6, capped: true });
    const salb = DRUGS.find((d) => d.id === 'salbutamol')!;
    expect(calcDose(salb, 15).dose).toBe(2.5);
    expect(calcDose(salb, 30).dose).toBe(5);
  });
  it('stress: every drug at every weight respects its maximum and gives finite volumes', () => {
    for (const d of DRUGS) {
      for (let w = 0.5; w <= 150; w += 0.5) {
        const r = calcDose(d, w);
        expect(Number.isFinite(r.dose)).toBe(true);
        expect(r.dose).toBeGreaterThan(0);
        if (d.max !== undefined) expect(r.dose).toBeLessThanOrEqual(d.max + 1e-9);
        if (r.doseHigh !== null) {
          expect(r.doseHigh).toBeGreaterThanOrEqual(r.dose);
          if (d.max !== undefined) expect(r.doseHigh).toBeLessThanOrEqual(d.max + 1e-9);
        }
        if (r.volumeMl !== null) expect(r.volumeMl).toBeGreaterThanOrEqual(0);
      }
    }
  });
  it('unique ids', () => {
    expect(new Set(DRUGS.map((d) => d.id)).size).toBe(DRUGS.length);
    expect(new Set(INFUSIONS.map((d) => d.id)).size).toBe(INFUSIONS.length);
  });
  it('infusion math: epinephrine 0.1 mcg/kg/min, 10 kg, 1 mg/50 mL = 3 mL/h', () => {
    const epi = INFUSIONS.find((i) => i.id === 'epi')!;
    expect(infusionRateMlH(epi, 0.1, 10)).toBeCloseTo(3);
    expect(infusionDose(epi, 3, 10)).toBeCloseTo(0.1);
    const vaso = INFUSIONS.find((i) => i.id === 'vaso')!;
    // 1 milliunit/kg/min × 20 kg = 1.2 units/h; 0.2 units/mL → 6 mL/h
    expect(infusionRateMlH(vaso, 1, 20)).toBeCloseTo(6);
    const ins = INFUSIONS.find((i) => i.id === 'insulin-dka')!;
    expect(infusionRateMlH(ins, 0.1, 30)).toBeCloseTo(3);
    for (const inf of INFUSIONS) {
      const rate = infusionRateMlH(inf, inf.range[1], 20);
      expect(Number.isFinite(rate)).toBe(true);
      expect(infusionDose(inf, rate, 20)).toBeCloseTo(inf.range[1]);
    }
  });
});

describe('neuro & cardiac', () => {
  it('CPP', () => {
    expect(cpp(70, 25)).toBe(45);
    expect(cppTarget(0)).toBe(40);
    expect(cppTarget(204)).toBe(50);
  });
  it('single-ventricle Qp:Qs', () => {
    expect(qpqsSingleVentricle(75, 55, 95)).toBeCloseTo(1);
    expect(qpqsSingleVentricle(90, 50, 98)).toBeCloseTo(5);
  });
});
