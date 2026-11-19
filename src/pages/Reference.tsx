import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { GLOSSARY } from '@/content/glossary';
import { bloodVolumePerKg, bpNormal, equipment, estimateWeight, heartRateRange, hypotensionSBP, maintenanceRate, respRateRange } from '@/engine/peds';
import { Card, CardBody, CardHeader, Page, PageHeader } from '@/components/ui';

const AGES: { label: string; m: number }[] = [
  { label: 'Newborn', m: 0.25 },
  { label: '3 mo', m: 3 },
  { label: '6 mo', m: 6 },
  { label: '1 y', m: 12 },
  { label: '2 y', m: 24 },
  { label: '4 y', m: 48 },
  { label: '6 y', m: 72 },
  { label: '8 y', m: 96 },
  { label: '10 y', m: 120 },
  { label: '12 y', m: 144 },
  { label: '15 y', m: 180 },
];

const FORMULAS: [string, string][] = [
  ['MAP', 'DBP + (SBP − DBP)/3'],
  ['CPP', 'MAP − ICP'],
  ['O₂ content', '1.34 × Hb × SaO₂ + 0.003 × PaO₂'],
  ['O₂ delivery', 'CI × CaO₂ × 10 (mL/min/m²)'],
  ['Alveolar gas', 'PAO₂ = FiO₂ × (Patm − 47) − PaCO₂/0.8'],
  ['Alveolar ventilation', 'PaCO₂ = 0.863 × VCO₂ / VA'],
  ['Oxygenation index', 'mPaw × FiO₂ × 100 / PaO₂'],
  ['Time constant', 'τ = R × C; exhalation complete at 3–5 τ'],
  ['Henderson–Hasselbalch', 'pH = 6.1 + log(HCO₃⁻ / (0.03 × PaCO₂))'],
  ['Anion gap', 'Na − (Cl + HCO₃⁻); + 2.5 per g/dL albumin below 4'],
  ["Winter's", 'PaCO₂ = 1.5 × HCO₃⁻ + 8 ± 2'],
  ['Osmolality (calc)', '2Na + glucose/18 + BUN/2.8'],
  ['Free-water deficit', 'TBW × (Na/140 − 1)'],
  ['Adrogué–Madias', 'ΔNa per L = (infusate Na + K − serum Na)/(TBW + 1)'],
  ['GIR', 'Dextrose % × mL/h / (6 × kg)'],
  ['Bedside Schwartz', 'eGFR = 0.413 × height(cm) / SCr'],
  ['Fluid overload', '(In − Out, L)/admission kg × 100'],
  ['Qp:Qs', '(SaO₂ − SvO₂)/(SpvO₂ − SpaO₂)'],
  ['Mosteller BSA', '√(height cm × weight kg / 3600)'],
  ['Corrected Ca', 'Ca + 0.8 × (4 − albumin)'],
];

export default function Reference() {
  const [q, setQ] = useState('');
  const terms = useMemo(() => GLOSSARY.filter((g) => (g.term + g.definition).toLowerCase().includes(q.toLowerCase())), [q]);
  return (
    <Page>
      <PageHeader eyebrow="Reference" title="Normal values, formulas & glossary" />
      <Card className="mb-6">
        <CardHeader title="Age-based values" subtitle="PALS awake heart-rate and respiratory ranges, APLS weight, cuffed ETT, Holliday–Segar maintenance." />
        <CardBody className="overflow-x-auto p-0 sm:p-0">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {['Age', 'Weight', 'HR', 'RR', 'SBP normal', 'Hypotension', 'MAP', 'Cuffed ETT', 'Depth', 'Maint.', 'Blood vol.'].map((h) => (
                  <th key={h} className="px-3 py-2 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y tabular">
              {AGES.map((a) => {
                const w = estimateWeight(a.m);
                const hr = heartRateRange(a.m);
                const rr = respRateRange(a.m);
                const bp = bpNormal(a.m);
                const eq = equipment(a.m, w);
                return (
                  <tr key={a.label}>
                    <td className="px-3 py-2 font-semibold">{a.label}</td>
                    <td className="px-3 py-2">{w} kg</td>
                    <td className="px-3 py-2">
                      {hr.lo}–{hr.hi}
                    </td>
                    <td className="px-3 py-2">
                      {rr.lo}–{rr.hi}
                    </td>
                    <td className="px-3 py-2">
                      {bp.sbp.lo}–{bp.sbp.hi}
                    </td>
                    <td className="px-3 py-2">&lt;{hypotensionSBP(a.m)}</td>
                    <td className="px-3 py-2">
                      {bp.map.lo}–{bp.map.hi}
                    </td>
                    <td className="px-3 py-2">{eq.ettCuffed.toFixed(1)}</td>
                    <td className="px-3 py-2">{eq.ettDepthCm} cm</td>
                    <td className="px-3 py-2">{maintenanceRate(w)} mL/h</td>
                    <td className="px-3 py-2">{bloodVolumePerKg(a.m)} mL/kg</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Formulas" />
          <CardBody className="p-0 sm:p-0">
            <dl className="divide-y">
              {FORMULAS.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[9rem_1fr] gap-3 px-4 py-2 text-sm sm:px-5">
                  <dt className="font-medium text-muted-foreground">{k}</dt>
                  <dd className="font-mono text-[13px]">{v}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Glossary" />
          <CardBody>
            <label className="mb-3 flex h-10 items-center gap-2 rounded-lg border bg-background px-3">
              <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
              <input className="w-full bg-transparent text-sm outline-none" placeholder="Search terms" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search glossary" />
            </label>
            <dl className="space-y-3">
              {terms.map((g) => (
                <div key={g.term}>
                  <dt className="text-sm font-semibold">{g.term}</dt>
                  <dd className="text-sm text-muted-foreground">{g.definition}</dd>
                </div>
              ))}
              {terms.length === 0 && <p className="text-sm text-muted-foreground">No match.</p>}
            </dl>
          </CardBody>
        </Card>
      </div>
    </Page>
  );
}
