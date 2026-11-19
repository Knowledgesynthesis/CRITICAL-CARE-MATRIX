import { Link } from 'react-router-dom';
import { Activity, Droplets, FlaskConical, Gauge } from 'lucide-react';
import { Page, PageHeader } from '@/components/ui';

const LABS = [
  {
    to: '/labs/shock',
    title: 'Shock Lab',
    icon: Activity,
    points: ['Guyton venous-return × Frank–Starling model scaled to age', '8 shock states incl. cold vs warm sepsis, myocarditis, tamponade', 'Bolus, blood, 6 vasoactives, PEEP, induction agents, decompression'],
  },
  {
    to: '/labs/ventilator',
    title: 'Ventilator Lab',
    icon: Gauge,
    points: ['VC/PC with R–C lung, auto-PEEP, recruitment and overdistension', 'Shunt vs V/Q oxygenation, dead space, OI/OSI', 'PALICC-2 alerts and live pressure/flow/volume waveforms'],
  },
  {
    to: '/labs/acid-base',
    title: 'Acid–Base Lab',
    icon: FlaskConical,
    points: ['Six-step interpretation with mixed-disorder detection', 'Albumin-corrected gap, delta ratio, osmolal gap, Stewart', '17 pediatric drills with feedback'],
  },
  {
    to: '/labs/fluids',
    title: 'Fluids & Electrolytes Lab',
    icon: Droplets,
    points: ['Holliday–Segar, isotonic maintenance, GIR', 'Adrogué–Madias sodium prediction with safe-rate checks', 'Fluid overload %, glucose-corrected Na, corrected Ca'],
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
