import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowRight, Baby, CheckCircle2, Clock, Target } from 'lucide-react';
import { getModule, MODULES } from '@/content/modules';
import { QUESTIONS } from '@/content/questions';
import { CASES } from '@/content/cases';
import { moduleMastery, useProgress } from '@/store/progress';
import { moduleIcon } from '@/components/icons';
import { Badge, Card, CardBody, CardHeader, Page, ProgressBar } from '@/components/ui';
import { NextLink, QuizRunner, RefList, WorkedExample } from '@/components/learn';
import NotFound from './NotFound';

export default function ModulePage() {
  const { id = '' } = useParams();
  const m = getModule(id);
  const answers = useProgress((s) => s.answers);
  const visit = useProgress((s) => s.visit);
  const questions = useMemo(() => QUESTIONS.filter((q) => q.module === id), [id]);

  useEffect(() => {
    if (m) visit(m.id);
  }, [m, visit]);

  if (!m) return <NotFound />;
  const mm = moduleMastery(m.id, answers);
  const Icon = moduleIcon(m.icon);
  const idx = MODULES.findIndex((x) => x.id === m.id);
  const prev = MODULES[idx - 1];
  const next = MODULES[idx + 1];
  const cases = CASES.filter((c) => c.module === m.id);

  return (
    <Page className="max-w-4xl">
      <Link to="/learn" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Curriculum
      </Link>
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Icon className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Module {m.number}</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{m.title}</h1>
          </div>
        </div>
        <p className="mt-3 text-muted-foreground">{m.tagline}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" /> {m.minutes} min
          </span>
          {m.prereqs.length > 0 && (
            <span className="text-muted-foreground">
              Builds on:{' '}
              {m.prereqs.map((p, i) => (
                <span key={p}>
                  {i > 0 && ', '}
                  <Link to={`/learn/${p}`} className="text-primary hover:underline">
                    {getModule(p)?.title}
                  </Link>
                </span>
              ))}
            </span>
          )}
          <span className="flex items-center gap-2">
            <ProgressBar value={mm.pct} className="w-24" tone={mm.mastered ? 'ok' : 'primary'} />
            <span className="tabular text-xs text-muted-foreground">{mm.pct}% mastery</span>
          </span>
        </div>
      </header>

      <div className="space-y-6">
        <Card>
          <CardHeader title={<span className="inline-flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> By the end you can</span>} />
          <CardBody>
            <ul className="space-y-2 text-sm">
              {m.objectives.map((o) => (
                <li key={o} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden />
                  {o}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <section aria-label="Core concepts" className="space-y-4">
          {m.concepts.map((c, i) => (
            <Card key={c.title} as="article">
              <CardHeader title={`${i + 1}. ${c.title}`} />
              <CardBody className="space-y-3">
                <ul className="list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed marker:text-primary">
                  {c.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                {c.pearl && (
                  <div className="flex gap-2 rounded-lg border border-primary/30 bg-accent/50 p-3 text-sm">
                    <Baby className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <p>
                      <span className="font-semibold">PICU pearl · </span>
                      {c.pearl}
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </section>

        <Card>
          <CardHeader title="Numbers to know" />
          <CardBody className="p-0 sm:p-0">
            <dl className="divide-y">
              {m.numbers.map((n) => (
                <div key={n.label} className="grid gap-1 px-4 py-2.5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4 sm:px-5">
                  <dt className="text-sm font-medium text-muted-foreground">{n.label}</dt>
                  <dd className="text-sm font-semibold tabular">{n.value}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>

        <WorkedExample example={m.example} />

        {(m.tools.length > 0 || cases.length > 0) && (
          <Card>
            <CardHeader title="Practice it" subtitle="Change variables and watch the physiology respond." />
            <CardBody className="grid gap-2 sm:grid-cols-2">
              {m.tools.map((t) => (
                <NextLink key={t.to} to={t.to} label={t.label} />
              ))}
              {cases.map((c) => (
                <NextLink key={c.id} to={`/cases/${c.id}`} label={`Case: ${c.title}`} />
              ))}
            </CardBody>
          </Card>
        )}

        <Card>
          <CardHeader title={<span className="inline-flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warn" /> Pitfalls</span>} />
          <CardBody>
            <ul className="space-y-2 text-sm">
              {m.pitfalls.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warn" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <QuizRunner key={m.id} questions={questions} title={`Check yourself · ${questions.length} questions`} />

        <Card>
          <CardHeader title="Evidence" subtitle={<span className="inline-flex items-center gap-2">Primary sources for this module <Badge>{m.refs.length}</Badge></span>} />
          <CardBody>
            <RefList ids={m.refs} />
          </CardBody>
        </Card>

        <nav className="grid gap-3 sm:grid-cols-2" aria-label="Module navigation">
          {prev ? (
            <Link to={`/learn/${prev.id}`} className="flex items-center gap-2 rounded-xl border p-4 text-sm hover:border-primary">
              <ArrowLeft className="h-4 w-4" />
              <span>
                <span className="block text-xs text-muted-foreground">Previous</span>
                <span className="font-semibold">{prev.title}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/learn/${next.id}`} className="flex items-center justify-end gap-2 rounded-xl border p-4 text-right text-sm hover:border-primary">
              <span>
                <span className="block text-xs text-muted-foreground">Next</span>
                <span className="font-semibold">{next.title}</span>
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </nav>
      </div>
    </Page>
  );
}
