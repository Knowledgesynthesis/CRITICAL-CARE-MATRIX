/**
 * Oxygen transport and shunt physiology.
 * Qp:Qs (Fick) = (SaO2 − SvO2) / (SpvO2 − SpaO2). In single-ventricle physiology with complete mixing SpaO2 = SaO2.
 */
import { round } from '@/lib/utils';

export function qpqs(sao2: number, svo2: number, spvo2: number, spao2: number): number {
  return (sao2 - svo2) / (spvo2 - spao2);
}

export function qpqsSingleVentricle(sao2: number, svo2: number, spvo2 = 98): number {
  return (sao2 - svo2) / (spvo2 - sao2);
}

export function caO2(hb: number, sao2Pct: number, pao2: number): number {
  return 1.34 * hb * (sao2Pct / 100) + 0.003 * pao2;
}

export function do2(ciLMinM2: number, cao2: number): number {
  return ciLMinM2 * cao2 * 10; // mL/min/m²
}

export function o2Extraction(sao2Pct: number, svo2Pct: number): number {
  return (sao2Pct - svo2Pct) / sao2Pct;
}

export function interpretQpQs(r: number): string {
  if (!Number.isFinite(r) || r <= 0) return 'Check inputs (SpvO₂ must exceed SaO₂).';
  if (r < 0.7) return `Qp:Qs ${round(r, 2)} – pulmonary under-circulation: hypoxemia. Consider: ductal/shunt patency, ↓PVR (O₂, normocarbia/alkalosis, iNO), ↑SVR, treat pulmonary venous desaturation.`;
  if (r <= 1.5) return `Qp:Qs ${round(r, 2)} – roughly balanced circulation (SaO₂ typically 75–85%).`;
  return `Qp:Qs ${round(r, 2)} – pulmonary over-circulation: systemic steal → low output, rising lactate despite "good" saturations. Consider: avoid excess O₂ and hypocarbia, permissive hypercarbia, afterload reduction (↓SVR), inotropy.`;
}
