import { CORE_MODULES } from './modules-core';
import { SYSTEM_MODULES } from './modules-systems';
import type { Module } from './types';

export const MODULES: Module[] = [...CORE_MODULES, ...SYSTEM_MODULES].sort((a, b) => a.number - b.number);

const byId = new Map(MODULES.map((m) => [m.id, m]));
export function getModule(id: string): Module | undefined {
  return byId.get(id);
}
