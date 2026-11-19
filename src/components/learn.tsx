import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, ExternalLink, Eye, RotateCcw, XCircle } from 'lucide-react';
import { getRef } from '@/content/references';
import type { Question, WorkedExample as WE } from '@/content/types';
import { useProgress } from '@/store/progress';
import { estimateWeight, formatAge } from '@/engine/peds';
import { cn } from '@/lib/utils';
import { Badge, Button, Card, CardBody, CardHeader, NumberField, SelectField } from './ui';

export function RefChips({ ids }: { ids: string[] }) {
  if (!ids.length) return null;
  return (
    <span className="flex flex-wrap gap-1.5">
      {ids.map((id) => {
        const r = getRef(id);
        if (!r) return null;
        return (
          <span key={id} className="rounded border bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground" title={r.citation}>
            {r.short}
          </span>
        );
      })}
    </span>
  );
}

export function RefList({ ids }: { ids: string[] }) {
  return (
    <ol className="space-y-2 text-sm">
      {ids.map((id, i) => {
        const r = getRef(id);
        if (!r) return null;
        return (
          <li key={id} className="flex gap-2">
            <span className="tabular text-muted-foreground">{i + 1}.</span>
            <span className="min-w-0">
              <span className="font-medium">{r.short}</span> <Badge className="ml-1 align-middle">{r.kind}</Badge>
              <span className="block text-muted-foreground">{r.citation}</span>
              {r.url && (
                <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  Source <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function WorkedExample({ example }: { example: WE }) {
  const [shown, setShown] = useState(0);
  return (
    <Card>
      <CardHeader title={`Worked example · ${example.title}`} subtitle="Commit to an answer before you reveal each step." />
      <CardBody className="space-y-3">
        <p className="rounded-lg bg-muted p-3 text-sm">{example.scenario}</p>
        <ol className="space-y-3">
          {example.steps.map((s, i) => (
            <li key={i} className={cn('rounded-lg border p-3', i > shown && 'opacity-50')}>
              <p className="text-sm font-medium">
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">{i + 1}</span>
                {s.q}
              </p>
              {i < shown ? (
                <p className="mt-2 border-l-2 border-primary pl-3 text-sm text-foreground/90">{s.a}</p>
              ) : i === shown ? (
                <Button size="sm" variant="outline" className="mt-2" onClick={() => setShown(shown + 1)}>
                  <Eye className="h-4 w-4" /> Reveal
                </Button>
              ) : null}
            </li>
          ))}
        </ol>
        {shown >= example.steps.length && (
          <Button size="sm" variant="ghost" onClick={() => setShown(0)}>
            <RotateCcw className="h-4 w-4" /> Try again
          </Button>
        )}
      </CardBody>
    </Card>
  );
}

export function QuizRunner({ questions, title = 'Check yourself', onDone }: { questions: Question[]; title?: string; onDone?: () => void }) {
  const record = useProgress((s) => s.recordAnswer);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [subset, setSubset] = useState<Question[] | null>(null);
  const list = subset ?? questions;
  const q = list[idx];
  const done = idx >= list.length;
  const score = list.filter((x) => picked[x.id] === x.answer).length;

  if (list.length === 0) {
    return (
      <Card>
        <CardBody>
          <p className="text-sm text-muted-foreground">No questions match this selection.</p>
        </CardBody>
      </Card>
    );
  }

  if (done) {
    const missed = list.filter((x) => picked[x.id] !== x.answer);
    return (
      <Card>
        <CardHeader title={`${title} · complete`} />
        <CardBody className="space-y-4">
          <p className="text-3xl font-bold tabular">
            {score}/{list.length} <span className="text-base font-medium text-muted-foreground">({Math.round((score / list.length) * 100)}%)</span>
          </p>
          <p className="text-sm text-muted-foreground">{score / list.length >= 0.8 ? 'Mastery threshold reached (≥80%).' : 'Below the 80% mastery threshold – review the missed items and retry.'}</p>
          <div className="flex flex-wrap gap-2">
            {missed.length > 0 && (
              <Button
                onClick={() => {
                  setSubset(missed);
                  setPicked({});
                  setIdx(0);
                }}
              >
                <RotateCcw className="h-4 w-4" /> Retry {missed.length} missed
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setSubset(null);
                setPicked({});
                setIdx(0);
              }}
            >
              Start over
            </Button>
            {onDone && (
              <Button variant="ghost" onClick={onDone}>
                Done
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    );
  }

  const answered = picked[q.id] !== undefined;
  return (
    <Card>
      <CardHeader
        title={title}
        subtitle={`Question ${idx + 1} of ${list.length}`}
        right={<Badge tone={q.level === 3 ? 'warn' : q.level === 2 ? 'info' : 'neutral'}>{['', 'Core', 'Applied', 'Advanced'][q.level]}</Badge>}
      />
      <CardBody className="space-y-4">
        <p className="text-[15px] font-medium leading-relaxed">{q.stem}</p>
        <ul className="space-y-2">
          {q.options.map((o, i) => {
            const isPicked = picked[q.id] === i;
            const isAnswer = q.answer === i;
            return (
              <li key={i}>
                <button
                  type="button"
                  disabled={answered}
                  onClick={() => {
                    setPicked({ ...picked, [q.id]: i });
                    record(q.id, i === q.answer);
                  }}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-lg border p-3 text-left text-sm transition',
                    !answered && 'hover:border-primary hover:bg-accent/40',
                    answered && isAnswer && 'border-ok bg-ok/10',
                    answered && isPicked && !isAnswer && 'border-danger bg-danger/10',
                    answered && !isPicked && !isAnswer && 'opacity-60',
                  )}
                >
                  <span className="mt-px inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold">{String.fromCharCode(65 + i)}</span>
                  <span className="flex-1">{o}</span>
                  {answered && isAnswer && <CheckCircle2 className="h-4 w-4 shrink-0 text-ok" aria-label="correct" />}
                  {answered && isPicked && !isAnswer && <XCircle className="h-4 w-4 shrink-0 text-danger" aria-label="incorrect" />}
                </button>
              </li>
            );
          })}
        </ul>
        {answered && (
          <div className={cn('rounded-lg border p-3 text-sm', picked[q.id] === q.answer ? 'border-ok/40 bg-ok/5' : 'border-danger/40 bg-danger/5')} aria-live="polite">
            <p className="font-semibold">{picked[q.id] === q.answer ? 'Correct.' : `Answer: ${String.fromCharCode(65 + q.answer)}.`}</p>
            <p className="mt-1 text-foreground/90">{q.explanation}</p>
            <div className="mt-2">
              <RefChips ids={q.refs} />
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground tabular">
            Score {score}/{Object.keys(picked).length}
          </span>
          <Button disabled={!answered} onClick={() => setIdx(idx + 1)}>
            {idx + 1 === list.length ? 'Finish' : 'Next'} <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

const AGE_OPTIONS: { value: string; label: string }[] = [
  { value: '0.25', label: 'Newborn (1 week)' },
  { value: '1', label: '1 month' },
  { value: '3', label: '3 months' },
  { value: '6', label: '6 months' },
  { value: '9', label: '9 months' },
  { value: '12', label: '1 year' },
  { value: '18', label: '18 months' },
  ...Array.from({ length: 16 }, (_, i) => ({ value: String((i + 2) * 12), label: `${i + 2} years` })),
];

/** Shared patient (age + weight) used by every bedside tool. */
export function PatientBar({ compact = false }: { compact?: boolean }) {
  const patient = useProgress((s) => s.patient);
  const setPatient = useProgress((s) => s.setPatient);
  const est = useMemo(() => estimateWeight(patient.ageMonths), [patient.ageMonths]);
  const ageValue = AGE_OPTIONS.some((o) => Number(o.value) === patient.ageMonths) ? String(patient.ageMonths) : '24';
  return (
    <Card className={cn(compact ? '' : 'mb-5')}>
      <CardBody className="grid grid-cols-2 items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <SelectField
          label="Patient age"
          value={ageValue}
          onChange={(v) => {
            const m = Number(v);
            setPatient({ ageMonths: m, weightKg: estimateWeight(m) });
          }}
          options={AGE_OPTIONS}
        />
        <NumberField
          label="Weight"
          unit="kg"
          value={patient.weightKg}
          min={0.5}
          max={150}
          step={0.1}
          onChange={(v) => v !== null && v >= 0.5 && setPatient({ ...patient, weightKg: Math.min(150, v) })}
          hint={`APLS estimate for ${formatAge(patient.ageMonths)}: ${est} kg`}
        />
        <Button variant="outline" className="col-span-2 sm:col-span-1" onClick={() => setPatient({ ...patient, weightKg: est })}>
          Use estimate
        </Button>
      </CardBody>
    </Card>
  );
}

export function NextLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="group flex items-center justify-between rounded-lg border p-3 text-sm font-medium hover:border-primary hover:bg-accent/40">
      {label}
      <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}
