import { useState } from 'react';
import { REFERENCES } from '@/content/references';
import { useProgress } from '@/store/progress';
import { Button, Card, CardBody, CardHeader, Page, PageHeader, Segmented } from '@/components/ui';
import { RefList } from '@/components/learn';

export default function About() {
  const theme = useProgress((s) => s.theme);
  const setTheme = useProgress((s) => s.setTheme);
  const reset = useProgress((s) => s.reset);
  const [confirm, setConfirm] = useState(false);
  const sorted = [...REFERENCES].sort((a, b) => b.year - a.year);

  return (
    <Page className="max-w-4xl">
      <PageHeader eyebrow="About" title="Sources & settings" />
      <div className="space-y-6">
        <Card>
          <CardHeader title="What this is" />
          <CardBody className="space-y-2 text-sm">
            <p>
              PICU Matrix teaches pediatric critical care as connected physiology. Content tracks the current pediatric guidelines and trials listed below (latest: SSC Children 2026, PRoMPT BOLUS 2026, PALS 2025, Oxy-PICU 2024, Phoenix 2024, PALICC-2 2023).
            </p>
            <p>
              Simulators are teaching models calibrated to pediatric norms and covered by automated consistency and stress tests; they illustrate direction and relative size of effects, not individual-patient predictions.
            </p>
            <p className="text-muted-foreground">Educational use. Verify doses and concentrations against your local formulary and protocols.</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Settings" />
          <CardBody className="flex flex-wrap items-center gap-4">
            <Segmented
              label="Theme"
              value={theme}
              onChange={setTheme}
              options={[
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' },
              ]}
            />
            {confirm ? (
              <span className="flex items-center gap-2">
                <Button variant="danger" size="sm" onClick={() => { reset(); setConfirm(false); }}>
                  Confirm reset
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>
                  Cancel
                </Button>
              </span>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setConfirm(true)}>
                Reset progress
              </Button>
            )}
            <span className="text-xs text-muted-foreground">Progress is stored on this device only.</span>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={`Evidence base (${REFERENCES.length})`} subtitle="Newest first." />
          <CardBody>
            <RefList ids={sorted.map((r) => r.id)} />
          </CardBody>
        </Card>
      </div>
    </Page>
  );
}
