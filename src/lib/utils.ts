import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Round to a number of decimals without float noise (0.1 + 0.2 → 0.3). */
export function round(v: number, decimals = 0): number {
  if (!Number.isFinite(v)) return v;
  const f = 10 ** decimals;
  return Math.round((v + Number.EPSILON) * f) / f;
}

/** Format for display; drops trailing zeros ("2.50" → "2.5"). */
export function fmt(v: number | null | undefined, decimals = 1): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  return String(round(v, decimals));
}

/** Hill / Emax dose–response, returns 0..1 */
export function emax(dose: number, ec50: number, n = 1): number {
  if (dose <= 0) return 0;
  const d = dose ** n;
  return d / (d + ec50 ** n);
}

export function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}
