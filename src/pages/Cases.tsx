import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { CASES } from '@/content/cases';
import { getModule, MODULES } from '@/content/modules';
import { cn } from '@/lib/utils';
import { formatAge } from '@/engine/peds';
import { useProgress } from '@/store/progress';
import { Badge, Page, PageHeader } from '@/components/ui';

export default function Cases() {
  const records = useProgress((s) => s.cases);
  const [filter, setFilter] = useState<string | null>(null);
  const modulesWithCases = MODULES.filter((m) => CASES.some((c) => c.module === m.id));
  const shown = filter ? CASES.filter((c) => c.module === filter) : CASES;
  const done = CASES.filter((c) => records[c.id]).length;
  return (
    <Page>
      <PageHeader
        eyebrow="Practice"
        title="Clinical cases"
        subtitle={`${CASES.length} time-stepped PICU scenarios (${done} completed). Vitals are flagged against age-specific norms. Wrong choices show the consequence; your first-attempt score is recorded.`}
      />
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by module">
        <button
          type="button"
          aria-pressed={filter === null}
          onClick={() => setFilter(null)}
          className={cn('rounded-full border px-3 py-1 text-xs font-medium', filter === null ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted')}
        >
          All ({CASES.length})
        </button>
        {modulesWithCases.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={filter === m.id}
            onClick={() => setFilter(filter === m.id ? null : m.id)}
            className={cn('rounded-full border px-3 py-1 text-xs font-medium', filter === m.id ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted')}
          >
            {m.title} ({CASES.filter((c) => c.module === m.id).length})
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {shown.map((c) => {
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
