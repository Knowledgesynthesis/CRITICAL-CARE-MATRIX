/** Route metadata (no React imports so it can be used in tests and navigation). */
export interface RouteMeta {
  path: string;
  title: string;
}

export const ROUTES: RouteMeta[] = [
  { path: '/', title: 'Home' },
  { path: '/learn', title: 'Curriculum' },
  { path: '/learn/:id', title: 'Module' },
  { path: '/labs', title: 'Labs' },
  { path: '/labs/shock', title: 'Shock Lab' },
  { path: '/labs/ventilator', title: 'Ventilator Lab' },
  { path: '/labs/acid-base', title: 'Acid–Base Lab' },
  { path: '/labs/fluids', title: 'Fluids & Electrolytes Lab' },
  { path: '/tools', title: 'Bedside tools' },
  { path: '/tools/resus', title: 'Resuscitation card' },
  { path: '/tools/phoenix', title: 'Phoenix score' },
  { path: '/tools/pards', title: 'PARDS / OI' },
  { path: '/tools/infusions', title: 'Infusions' },
  { path: '/tools/renal', title: 'AKI & CRRT' },
  { path: '/tools/neuro', title: 'Neuro (CPP & GCS)' },
  { path: '/tools/cardiac', title: 'Qp:Qs & O₂ delivery' },
  { path: '/tools/dka', title: 'DKA planner' },
  { path: '/cases', title: 'Cases' },
  { path: '/cases/:id', title: 'Case' },
  { path: '/quiz', title: 'Question bank' },
  { path: '/reference', title: 'Reference' },
  { path: '/about', title: 'About & sources' },
];
