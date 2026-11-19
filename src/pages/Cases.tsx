import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { CASES } from '@/content/cases';
import { getModule } from '@/content/modules';
import { formatAge } from '@/engine/peds';
import { useProgress } from '@/store/progress';
import { Badge, Page, PageHeader } from '@/components/ui';

export default function Cases() {
  const records = useProgress((s) => s.cases);
  return (
    <Page>
      <PageHeader
        eyebrow="Practice"
        title="Clinical cases"
        subtitle="Time-stepped PICU scenarios. Vitals are flagged against age-specific norms. Wrong choices show the consequence; your first-attempt score is recorded."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {CASES.map((c) => {
          const r = records[c.id];
          return (
            <Link key={c.id} to={`/cases/${c.id}`} className="group flex flex-col rounded-xl border bg-card p-4 transition hover:border-primary">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{getModule(c.module)?.title}</span>
                <Badge tone={c.difficulty === 3 ? 'warn' : c.difficulty === 2 ? 'info' : 'neutral'}>{['', 'Core', 'Applied', 'Advanced'][c.difficulty]}</Badge>
              </div>
              <h2 className="mt-1 text-lg font-semibold group-hover:text-primary">{c.title}</h2>
              <p className="text-sm text-muted-foreground">{c.summary}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="tabular">
                  {formatAge(c.ageMonths)} · {c.weightKg} kg · {c.stages.length} decisions
                </span>
                {r && (
                  <span className="inline-flex items-center gap-1 font-medium text-ok">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {r.score}/{r.total}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </Page>
  );
}
