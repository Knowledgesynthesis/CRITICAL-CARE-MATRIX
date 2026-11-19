import { Link } from 'react-router-dom';
import { CheckCircle2, Clock } from 'lucide-react';
import { MODULES } from '@/content/modules';
import { moduleMastery, useProgress } from '@/store/progress';
import { moduleIcon } from '@/components/icons';
import { Badge, Page, PageHeader, ProgressBar } from '@/components/ui';

export default function Learn() {
  const answers = useProgress((s) => s.answers);
  return (
    <Page>
      <PageHeader
        eyebrow="Curriculum"
        title="13 modules, in a sensible order"
        subtitle="Each module: objectives → core concepts with PICU-specific pearls → numbers to know → worked example → linked simulator → pitfalls → evidence → mastery quiz."
      />
      <ol className="space-y-3">
        {MODULES.map((m) => {
          const mm = moduleMastery(m.id, answers);
          const Icon = moduleIcon(m.icon);
          return (
            <li key={m.id}>
              <Link to={`/learn/${m.id}`} className="group flex gap-4 rounded-xl border bg-card p-4 transition hover:border-primary sm:p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Module {m.number}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> {m.minutes} min
                    </span>
                    {mm.mastered && (
                      <Badge tone="ok">
                        <CheckCircle2 className="h-3 w-3" /> Mastered
                      </Badge>
                    )}
                  </span>
                  <span className="mt-0.5 block text-lg font-semibold leading-snug group-hover:text-primary">{m.title}</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{m.tagline}</span>
                  <span className="mt-3 flex items-center gap-3">
                    <ProgressBar value={mm.pct} className="max-w-xs" tone={mm.mastered ? 'ok' : 'primary'} />
                    <span className="text-xs tabular text-muted-foreground">
                      {mm.correct}/{mm.total} correct
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </Page>
  );
}
