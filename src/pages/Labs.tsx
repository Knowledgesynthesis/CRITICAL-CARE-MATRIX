import { Link } from 'react-router-dom';
import { Activity, Droplets, FlaskConical, Gauge } from 'lucide-react';
import { Page, PageHeader } from '@/components/ui';

const LABS = [
  {
    to: '/labs/shock',
    title: 'Shock Lab',
    icon: Activity,
    points: ['Guyton venous-return × Frank–Starling model scaled to age', '14 shock states: cold/warm/late sepsis, hypovolemic, hemorrhagic, anaphylactic, cardiogenic, obstructive, neurogenic, adrenal crisis, SVT, heart block, post-bypass', 'Bolus, blood, 6 vasoactives, PEEP, induction agents, decompression, cardioversion/pacing, hydrocortisone'],
  },
  {
    to: '/labs/ventilator',
    title: 'Ventilator Lab',
    icon: Gauge,
    points: ['8 lung types (incl. stiff chest wall, cardiogenic edema, BPD) and 8 one-click scenarios', 'Shunt vs V/Q oxygenation, dead space, OI/OSI', 'PALICC-2 alerts and live pressure/flow/volume waveforms'],
  },
  {
    to: '/labs/acid-base',
    title: 'Acid–Base Lab',
    icon: FlaskConical,
    points: ['Six-step interpretation with mixed-disorder detection', 'Albumin-corrected gap, delta ratio, osmolal gap, Stewart', '34 pediatric drills with feedback, picker and progress'],
  },
  {
    to: '/labs/fluids',
    title: 'Fluids & Electrolytes Lab',
    icon: Droplets,
    points: ['Holliday–Segar, isotonic maintenance, GIR', 'Adrogué–Madias sodium prediction with safe-rate checks and 5 worked examples', 'Fluid overload %, glucose-corrected Na, corrected Ca'],
  },
];

export default function Labs() {
  return (
    <Page>
      <PageHeader eyebrow="Simulate" title="Physiology labs" subtitle="Manipulate one variable and see every downstream system respond. Models are physiologic teaching models, calibrated to pediatric norms and tested for consistency." />
      <div className="grid gap-4 sm:grid-cols-2">
        {LABS.map((l) => (
          <Link key={l.to} to={l.to} className="group rounded-xl border bg-card p-5 transition hover:border-primary">
            <l.icon className="h-6 w-6 text-primary" aria-hidden />
            <h2 className="mt-3 text-lg font-semibold group-hover:text-primary">{l.title}</h2>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {l.points.map((p) => (
                <li key={p}>• {p}</li>
              ))}
            </ul>
          </Link>
        ))}
      </div>
    </Page>
  );
}
