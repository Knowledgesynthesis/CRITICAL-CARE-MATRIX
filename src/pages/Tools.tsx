import { Link } from 'react-router-dom';
import { Brain, Calculator, Droplet, Filter, Heart, HeartPulse, Syringe, Wind } from 'lucide-react';
import { Page, PageHeader } from '@/components/ui';

const TOOLS = [
  { to: '/tools/resus', title: 'Resuscitation card', text: 'Equipment, vital-sign limits and 65 weight-based drug doses with volumes and caps.', icon: HeartPulse },
  { to: '/tools/infusions', title: 'Infusion calculator', text: 'mcg/kg/min ↔ mL/h for vasoactives, sedation, insulin, PGE1, 3% saline.', icon: Syringe },
  { to: '/tools/phoenix', title: 'Phoenix Sepsis Score', text: '2024 pediatric sepsis and septic shock criteria.', icon: Calculator },
  { to: '/tools/pards', title: 'OI / OSI / PARDS', text: 'PALICC-2 stratification and ARDSnet PEEP table.', icon: Wind },
  { to: '/tools/renal', title: 'AKI, eGFR & CRRT', text: 'KDIGO staging, Schwartz & CKiD U25, FO%, renal angina, CRRT start.', icon: Filter },
  { to: '/tools/neuro', title: 'CPP, GCS & TBI targets', text: 'Pediatric GCS, age-scaled CPP, BTF 2019 checklist.', icon: Brain },
  { to: '/tools/cardiac', title: 'Qp:Qs & O₂ delivery', text: 'Single-ventricle balance, DO₂, extraction.', icon: Heart },
  { to: '/tools/dka', title: 'DKA planner', text: 'ISPAD 2022 severity, fluids over 24–48 h, insulin, K, cerebral-injury doses.', icon: Droplet },
];

export default function Tools() {
  return (
    <Page>
      <PageHeader eyebrow="Bedside" title="Tools & calculators" subtitle="All tools share one patient (age + weight), so you set it once." />
      <div className="grid gap-3 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <Link key={t.to} to={t.to} className="group flex gap-3 rounded-xl border bg-card p-4 transition hover:border-primary">
            <t.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <span>
              <span className="block font-semibold group-hover:text-primary">{t.title}</span>
              <span className="block text-sm text-muted-foreground">{t.text}</span>
            </span>
          </Link>
        ))}
      </div>
    </Page>
  );
}
