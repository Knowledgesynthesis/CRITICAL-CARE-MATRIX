import { Link } from 'react-router-dom';
import { Activity, ArrowRight, BookOpen, Calculator, Droplets, FlaskConical, Gauge, GraduationCap, RotateCcw, Stethoscope } from 'lucide-react';
import { MODULES } from '@/content/modules';
import { QUESTIONS } from '@/content/questions';
import { CASES } from '@/content/cases';
import { isDue, moduleMastery, overallMastery, useProgress } from '@/store/progress';
import { moduleIcon } from '@/components/icons';
import { Card, CardBody, Page, ProgressBar, ProgressRing } from '@/components/ui';

const LABS = [
  { to: '/labs/shock', title: 'Shock Lab', text: 'Guyton/Starling simulator: fluids, 6 vasoactives, intubation, 8 shock states, age 0–17 y.', icon: Activity },
  { to: '/labs/ventilator', title: 'Ventilator Lab', text: 'PALICC-2 targets, auto-PEEP, dead space, OI/OSI, live waveforms.', icon: Gauge },
  { to: '/labs/acid-base', title: 'Acid–Base Lab', text: 'Six-step analyzer with Stewart view and 17 pediatric drills.', icon: FlaskConical },
  { to: '/labs/fluids', title: 'Fluids Lab', text: 'Maintenance, GIR, sodium correction, fluid overload.', icon: Droplets },
];

export default function Home() {
  const answers = useProgress((s) => s.answers);
  const cases = useProgress((s) => s.cases);
  const overall = overallMastery(answers);
  const next = MODULES.find((m) => !moduleMastery(m.id, answers).mastered) ?? MODULES[0];
  const NextIcon = moduleIcon(next.icon);
  const due = QUESTIONS.filter((q) => isDue(answers[q.id])).length;
  const answered = Object.keys(answers).length;
  const casesDone = Object.keys(cases).length;

  return (
    <Page>
      <section className="mb-6 overflow-hidden rounded-2xl border bg-gradient-to-br from-accent via-card to-card p-5 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Pediatric critical care · 2026 evidence</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">Learn the PICU by reasoning through physiology – then prove it.</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          13 modules built on Phoenix 2024, SSC Children 2026, PALICC-2, PALS 2025, ISPAD 2022 and BTF 2019 – each with simulators, worked examples, cases and a mastery quiz.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to={`/learn/${next.id}`} className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            {answered ? 'Continue' : 'Start'}: {next.title} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/tools/resus" className="inline-flex h-11 items-center gap-2 rounded-lg border bg-card px-5 text-sm font-semibold hover:bg-muted">
            <Calculator className="h-4 w-4" /> Resuscitation card
          </Link>
        </div>
      </section>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardBody className="flex items-center gap-4">
            <ProgressRing value={overall.pct} label="Overall mastery" />
            <div>
              <p className="text-sm font-semibold">Overall mastery</p>
              <p className="text-sm text-muted-foreground">
                {overall.mastered}/{overall.modules} modules mastered (≥80%)
              </p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm font-semibold">Practice</p>
            <p className="mt-1 text-sm text-muted-foreground tabular">
              {answered}/{QUESTIONS.length} questions answered · {casesDone}/{CASES.length} cases completed
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/quiz" className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted">
                <GraduationCap className="h-4 w-4" /> Question bank
              </Link>
              <Link to="/cases" className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted">
                <Stethoscope className="h-4 w-4" /> Cases
              </Link>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm font-semibold">Spaced review</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {due > 0 ? `${due} question${due === 1 ? '' : 's'} due – missed items and items whose review interval has passed.` : 'Nothing due. Missed questions return here automatically.'}
            </p>
            <Link
              to="/quiz?mode=due"
              className={`mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${due ? 'bg-primary text-primary-foreground' : 'pointer-events-none border text-muted-foreground'}`}
              aria-disabled={!due}
            >
              <RotateCcw className="h-4 w-4" /> Review now
            </Link>
          </CardBody>
        </Card>
      </div>

      <section className="mb-8">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold">Learning path</h2>
          <Link to="/learn" className="text-sm font-medium text-primary hover:underline">
            All modules
          </Link>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => {
            const mm = moduleMastery(m.id, answers);
            const Icon = moduleIcon(m.icon);
            return (
              <li key={m.id}>
                <Link to={`/learn/${m.id}`} className="group flex h-full gap-3 rounded-xl border bg-card p-4 transition hover:border-primary">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Module {m.number}</span>
                    <span className="block font-semibold leading-snug group-hover:text-primary">{m.title}</span>
                    <ProgressBar value={mm.pct} className="mt-2" tone={mm.mastered ? 'ok' : 'primary'} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Simulators</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {LABS.map((l) => (
            <Link key={l.to} to={l.to} className="group flex gap-3 rounded-xl border bg-card p-4 transition hover:border-primary">
              <l.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <span>
                <span className="block font-semibold group-hover:text-primary">{l.title}</span>
                <span className="block text-sm text-muted-foreground">{l.text}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <Card>
          <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <NextIcon className="h-5 w-5 text-primary" aria-hidden />
              <p className="text-sm">
                <span className="font-semibold">How to use:</span> read a module → reveal the worked example → run its simulator → pass the quiz at ≥80% → play the case.
              </p>
            </div>
            <Link to="/learn" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              <BookOpen className="h-4 w-4" /> Curriculum
            </Link>
          </CardBody>
        </Card>
      </section>
    </Page>
  );
}
