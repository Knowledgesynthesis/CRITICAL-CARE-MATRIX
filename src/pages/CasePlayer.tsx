import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronRight, Lightbulb, RotateCcw, XCircle } from 'lucide-react';
import { CASES, type CaseVitals } from '@/content/cases';
import { getModule } from '@/content/modules';
import { formatAge, heartRateRange, hypotensionSBP, respRateRange } from '@/engine/peds';
import { useProgress } from '@/store/progress';
import { cn } from '@/lib/utils';
import { Badge, Button, Card, CardBody, CardHeader, Page, Stat, type Tone } from '@/components/ui';
import { RefList } from '@/components/learn';
import NotFound from './NotFound';

function vitalTones(v: CaseVitals, ageMonths: number): Record<keyof CaseVitals, Tone> {
  const hr = heartRateRange(ageMonths);
  const rr = respRateRange(ageMonths);
  const t: Record<string, Tone> = {};
  if (v.hr !== undefined) t.hr = v.hr < hr.lo * 0.8 || v.hr > hr.hi + 20 ? 'danger' : v.hr < hr.lo || v.hr > hr.hi ? 'warn' : 'ok';
  if (v.sbp !== undefined) t.sbp = v.sbp < hypotensionSBP(ageMonths) ? 'danger' : v.sbp < hypotensionSBP(ageMonths) + 10 ? 'warn' : 'ok';
  if (v.rr !== undefined) t.rr = v.rr < rr.lo * 0.7 || v.rr > rr.hi * 1.4 ? 'danger' : v.rr < rr.lo || v.rr > rr.hi ? 'warn' : 'ok';
  if (v.spo2 !== undefined) t.spo2 = v.spo2 < 88 ? 'danger' : v.spo2 < 92 ? 'warn' : 'ok';
  if (v.temp !== undefined) t.temp = v.temp >= 38.5 || v.temp < 36 ? 'warn' : 'ok';
  if (v.crt !== undefined) t.crt = v.crt > 3 ? 'danger' : v.crt > 2 ? 'warn' : 'ok';
  if (v.gcs !== undefined) t.gcs = v.gcs <= 8 ? 'danger' : v.gcs < 14 ? 'warn' : 'ok';
  return t as Record<keyof CaseVitals, Tone>;
}

export default function CasePlayer() {
  const { id = '' } = useParams();
  const c = CASES.find((x) => x.id === id);
  const recordCase = useProgress((s) => s.recordCase);
  const [stageIdx, setStageIdx] = useState(0);
  const [tries, setTries] = useState<Record<string, number[]>>({});
  const [finished, setFinished] = useState(false);

  if (!c) return <NotFound />;
  const stage = c.stages[stageIdx];
  const picks = tries[stage?.id] ?? [];
  const solved = picks.some((i) => stage.options[i].correct);
  const firstTryScore = c.stages.filter((s) => {
    const p = tries[s.id];
    return p && p.length > 0 && s.options[p[0]].correct;
  }).length;

  const restart = () => {
    setTries({});
    setStageIdx(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <Page className="max-w-3xl">
        <Link to="/cases" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Cases
        </Link>
        <Card>
          <CardHeader title={`Debrief · ${c.title}`} subtitle={`First-attempt score ${firstTryScore}/${c.stages.length}`} />
          <CardBody className="space-y-5">
            <ul className="space-y-2 text-sm">
              {c.debrief.map((d) => (
                <li key={d} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-hidden /> {d}
                </li>
              ))}
            </ul>
            <div>
              <h3 className="mb-2 text-sm font-semibold">Evidence</h3>
              <RefList ids={c.refs} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={restart}>
                <RotateCcw className="h-4 w-4" /> Replay
              </Button>
              <Link to={`/learn/${c.module}`} className="inline-flex h-10 items-center rounded-lg border px-4 text-sm font-medium hover:bg-muted">
                Review module: {getModule(c.module)?.title}
              </Link>
              <Link to="/cases" className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium hover:bg-muted">
                More cases
              </Link>
            </div>
          </CardBody>
        </Card>
      </Page>
    );
  }

  const v = stage.vitals;
  const tones = vitalTones(v, c.ageMonths);

  return (
    <Page className="max-w-4xl">
      <Link to="/cases" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Cases
      </Link>
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{getModule(c.module)?.title}</p>
        <h1 className="text-2xl font-bold tracking-tight">{c.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground tabular">
          {formatAge(c.ageMonths)} · {c.weightKg} kg · {c.summary}
        </p>
      </header>

      <ol className="mb-4 flex gap-1.5" aria-label="Case progress">
        {c.stages.map((s, i) => (
          <li key={s.id} className={cn('h-1.5 flex-1 rounded-full', i < stageIdx ? 'bg-primary' : i === stageIdx ? 'bg-primary/50' : 'bg-muted')} aria-current={i === stageIdx ? 'step' : undefined} />
        ))}
      </ol>

      <Card className="mb-4 overflow-hidden">
        <div className="flex items-center justify-between bg-monitor px-4 py-2 text-xs text-slate-300">
          <span className="font-semibold uppercase tracking-wider">Monitor · {stage.time}</span>
          {stage.support && <span>{stage.support}</span>}
        </div>
        <div className="grid grid-cols-3 gap-2 bg-monitor p-3 pt-0 sm:grid-cols-4 lg:grid-cols-7">
          {v.hr !== undefined && <Stat label="HR" value={v.hr} unit="/min" tone={tones.hr} color="text-emerald-400" />}
          {v.sbp !== undefined && <Stat label="BP" value={`${v.sbp}/${v.dbp ?? '–'}`} tone={tones.sbp} color="text-rose-400" sub={v.dbp !== undefined ? `MAP ${Math.round(v.dbp + (v.sbp - v.dbp) / 3)}` : undefined} />}
          {v.rr !== undefined && <Stat label="RR" value={v.rr} unit="/min" tone={tones.rr} color="text-amber-300" />}
          {v.spo2 !== undefined && <Stat label="SpO₂" value={v.spo2} unit="%" tone={tones.spo2} color="text-cyan-300" />}
          {v.temp !== undefined && <Stat label="Temp" value={v.temp} unit="°C" tone={tones.temp} />}
          {v.crt !== undefined && <Stat label="CRT" value={v.crt} unit="s" tone={tones.crt} />}
          {v.gcs !== undefined && <Stat label="GCS" value={v.gcs} tone={tones.gcs} />}
        </div>
        {stage.labs && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 border-t px-4 py-3 text-sm sm:grid-cols-3">
            {Object.entries(stage.labs).map(([k, val]) => (
              <div key={k} className="flex justify-between gap-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-semibold tabular">{val}</dd>
              </div>
            ))}
          </dl>
        )}
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <p className="text-[15px] leading-relaxed">{stage.narrative}</p>
          <p className="font-semibold">{stage.question}</p>
          <ul className="space-y-2">
            {stage.options.map((o, i) => {
              const picked = picks.includes(i);
              return (
                <li key={i}>
                  <button
                    type="button"
                    disabled={solved || picked}
                    onClick={() => setTries({ ...tries, [stage.id]: [...picks, i] })}
                    className={cn(
                      'w-full rounded-lg border p-3 text-left text-sm transition',
                      !picked && !solved && 'hover:border-primary hover:bg-accent/40',
                      picked && o.correct && 'border-ok bg-ok/10',
                      picked && !o.correct && 'border-danger bg-danger/10',
                      solved && !picked && 'opacity-60',
                    )}
                  >
                    <span className="flex items-start gap-2">
                      {picked ? (
                        o.correct ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
                        ) : (
                          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                        )
                      ) : (
                        <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px]">{String.fromCharCode(65 + i)}</span>
                      )}
                      <span>
                        {o.text}
                        {picked && <span className="mt-1 block text-foreground/80">{o.feedback}</span>}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {solved && (
            <div className="flex gap-2 rounded-lg border border-primary/30 bg-accent/50 p-3 text-sm" aria-live="polite">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <p>{stage.teaching}</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Badge>
              Stage {stageIdx + 1}/{c.stages.length}
            </Badge>
            <Button
              disabled={!solved}
              onClick={() => {
                if (stageIdx + 1 < c.stages.length) setStageIdx(stageIdx + 1);
                else {
                  recordCase(c.id, firstTryScore, c.stages.length);
                  setFinished(true);
                }
              }}
            >
              {stageIdx + 1 < c.stages.length ? 'Continue' : 'Debrief'} <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardBody>
      </Card>
    </Page>
  );
}
