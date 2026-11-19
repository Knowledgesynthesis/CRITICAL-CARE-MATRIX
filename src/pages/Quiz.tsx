import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shuffle } from 'lucide-react';
import { MODULES } from '@/content/modules';
import { QUESTIONS } from '@/content/questions';
import type { Question } from '@/content/types';
import { isDue, moduleMastery, useProgress } from '@/store/progress';
import { cn } from '@/lib/utils';
import { Button, Card, CardBody, CardHeader, Page, PageHeader, ProgressBar, Segmented } from '@/components/ui';
import { QuizRunner } from '@/components/learn';

type Mode = 'all' | 'unanswered' | 'missed' | 'due';

function shuffle<T>(xs: T[], seed: number): T[] {
  const a = [...xs];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Quiz() {
  const [params] = useSearchParams();
  const answers = useProgress((s) => s.answers);
  const [mode, setMode] = useState<Mode>((params.get('mode') as Mode) ?? 'all');
  const [modules, setModules] = useState<string[]>([]);
  const [seed, setSeed] = useState(0);
  const [session, setSession] = useState<Question[] | null>(null);

  const pool = useMemo(() => {
    let qs = QUESTIONS;
    if (modules.length) qs = qs.filter((q) => modules.includes(q.module));
    if (mode === 'unanswered') qs = qs.filter((q) => !answers[q.id]);
    if (mode === 'missed') qs = qs.filter((q) => answers[q.id] && !answers[q.id].correct);
    if (mode === 'due') qs = qs.filter((q) => isDue(answers[q.id]));
    return seed ? shuffle(qs, seed) : qs;
  }, [answers, mode, modules, seed]);

  if (session) {
    return (
      <Page className="max-w-3xl">
        <PageHeader eyebrow="Question bank" title={`${session.length} questions`} right={<Button variant="outline" onClick={() => setSession(null)}>End session</Button>} />
        <QuizRunner questions={session} title="Session" onDone={() => setSession(null)} />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Practice"
        title="Question bank"
        subtitle={`${QUESTIONS.length} board-style questions with rationales and sources. Missed questions are scheduled for spaced review (1 → 3 → 7 → 21 days).`}
      />
      <Card className="mb-5">
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              label="Question filter"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'all', label: 'All' },
                { value: 'unanswered', label: 'Unanswered' },
                { value: 'missed', label: 'Missed' },
                { value: 'due', label: 'Due for review' },
              ]}
            />
            <Button variant={seed ? 'secondary' : 'outline'} size="sm" onClick={() => setSeed(seed ? 0 : Date.now() % 100000)}>
              <Shuffle className="h-4 w-4" /> {seed ? 'Shuffled' : 'Shuffle'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Modules">
            {MODULES.map((m) => {
              const on = modules.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setModules(on ? modules.filter((x) => x !== m.id) : [...modules, m.id])}
                  className={cn('rounded-full border px-3 py-1 text-xs font-medium transition', on ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted')}
                >
                  {m.number}. {m.title}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground tabular">{pool.length} questions selected</p>
            <div className="flex gap-2">
              <Button disabled={!pool.length} onClick={() => setSession(pool.slice(0, 10))}>
                Start 10
              </Button>
              <Button variant="outline" disabled={!pool.length} onClick={() => setSession(pool)}>
                Start all {pool.length}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Mastery by module" subtitle="Mastered = ≥80% of the module's questions answered correctly (latest attempt)." />
        <CardBody className="space-y-3">
          {MODULES.map((m) => {
            const mm = moduleMastery(m.id, answers);
            return (
              <div key={m.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 sm:grid-cols-[16rem_1fr_auto]">
                <span className="truncate text-sm font-medium">
                  {m.number}. {m.title}
                </span>
                <ProgressBar value={mm.pct} className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto" tone={mm.mastered ? 'ok' : 'primary'} />
                <span className="text-xs tabular text-muted-foreground">
                  {mm.correct}/{mm.total}
                </span>
              </div>
            );
          })}
        </CardBody>
      </Card>
    </Page>
  );
}
