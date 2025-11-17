import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSimulationStore } from '@/store/useSimulationStore';
import { formatNumber } from '@/lib/utils';
import { Activity, Heart, Wind, Droplets, Zap, TrendingUp } from 'lucide-react';

export function MatrixDashboard() {
  const { patientState } = useSimulationStore();
  const { vitals, ventilator, abg, electrolytes, renal, shock } = patientState;

  const systemCards = [
    {
      title: 'Hemodynamics',
      icon: Heart,
      color: 'text-red-500',
      metrics: [
        { label: 'MAP', value: `${formatNumber(vitals.meanArterialPressure, 0)} mmHg` },
        { label: 'CO', value: `${formatNumber(vitals.cardiacOutput, 1)} L/min` },
        { label: 'SVR', value: `${formatNumber(vitals.systemicVascularResistance, 0)} dynes·s/cm⁵` },
        { label: 'CVP', value: `${formatNumber(vitals.centralVenousPressure, 0)} mmHg` },
      ],
    },
    {
      title: 'Ventilation',
      icon: Wind,
      color: 'text-blue-500',
      metrics: [
        { label: 'Mode', value: ventilator.mode.split(' ')[0] },
        { label: 'TV', value: `${ventilator.tidalVolume} mL` },
        { label: 'RR', value: `${ventilator.respiratoryRate}/min` },
        { label: 'FiO₂', value: `${(ventilator.fiO2 * 100).toFixed(0)}%` },
        { label: 'PEEP', value: `${ventilator.peep} cmH₂O` },
      ],
    },
    {
      title: 'Gas Exchange',
      icon: Activity,
      color: 'text-green-500',
      metrics: [
        { label: 'pH', value: formatNumber(abg.pH, 2) },
        { label: 'PaCO₂', value: `${formatNumber(abg.paCO2, 0)} mmHg` },
        { label: 'PaO₂', value: `${formatNumber(abg.paO2, 0)} mmHg` },
        { label: 'HCO₃⁻', value: `${formatNumber(abg.hco3, 0)} mEq/L` },
        { label: 'Lactate', value: `${formatNumber(abg.lactate, 1)} mmol/L` },
      ],
    },
    {
      title: 'Renal Function',
      icon: Droplets,
      color: 'text-cyan-500',
      metrics: [
        { label: 'Cr', value: `${formatNumber(renal.creatinine, 1)} mg/dL` },
        { label: 'eGFR', value: `${formatNumber(renal.gfr, 0)} mL/min` },
        { label: 'UOP', value: `${formatNumber(renal.urineOutput, 0)} mL/hr` },
        { label: 'FENa', value: `${formatNumber(renal.fractionalExcretionNa, 1)}%` },
      ],
    },
    {
      title: 'Electrolytes',
      icon: TrendingUp,
      color: 'text-purple-500',
      metrics: [
        { label: 'Na⁺', value: `${formatNumber(electrolytes.sodium, 0)} mEq/L` },
        { label: 'K⁺', value: `${formatNumber(electrolytes.potassium, 1)} mEq/L` },
        { label: 'Cl⁻', value: `${formatNumber(electrolytes.chloride, 0)} mEq/L` },
        { label: 'HCO₃⁻', value: `${formatNumber(electrolytes.bicarbonate, 0)} mEq/L` },
      ],
    },
    {
      title: 'Shock Assessment',
      icon: Zap,
      color: 'text-yellow-500',
      metrics: [
        { label: 'Type', value: shock.type },
        { label: 'Severity', value: shock.severity },
        { label: 'Markers', value: shock.markers.length > 0 ? shock.markers.join(', ') : 'None' },
      ],
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">ICU Matrix Dashboard</h1>
        <p className="text-muted-foreground">
          Integrated view of all physiologic systems and their interactions
        </p>
      </div>

      {/* System Interaction Overview */}
      <Card className="mb-6 bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>System Interactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-background rounded-lg border">
              <p className="font-semibold mb-1">Ventilation ↔ Hemodynamics</p>
              <p className="text-muted-foreground text-xs">
                PEEP {ventilator.peep} cmH₂O increases intrathoracic pressure → reduces venous return →
                {vitals.cardiacOutput < 5 ? ' may decrease CO' : ' CO maintained'}
              </p>
            </div>

            <div className="p-3 bg-background rounded-lg border">
              <p className="font-semibold mb-1">Hemodynamics ↔ Renal</p>
              <p className="text-muted-foreground text-xs">
                MAP {formatNumber(vitals.meanArterialPressure, 0)} mmHg →
                {vitals.meanArterialPressure < 65
                  ? ' inadequate renal perfusion → oliguria'
                  : ' adequate renal perfusion'}
              </p>
            </div>

            <div className="p-3 bg-background rounded-lg border">
              <p className="font-semibold mb-1">Ventilation ↔ Acid-Base</p>
              <p className="text-muted-foreground text-xs">
                RR {ventilator.respiratoryRate}/min × TV {ventilator.tidalVolume} mL → MV{' '}
                {formatNumber((ventilator.respiratoryRate * ventilator.tidalVolume) / 1000, 1)} L/min controls
                PaCO₂ {formatNumber(abg.paCO2, 0)} mmHg
              </p>
            </div>

            <div className="p-3 bg-background rounded-lg border">
              <p className="font-semibold mb-1">Shock ↔ Lactate</p>
              <p className="text-muted-foreground text-xs">
                {shock.type !== 'None'
                  ? `${shock.type} shock → tissue hypoperfusion → lactate ${formatNumber(abg.lactate, 1)} mmol/L`
                  : `No shock → normal lactate ${formatNumber(abg.lactate, 1)} mmol/L`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Systems at a Glance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systemCards.map((system) => {
          const Icon = system.icon;
          return (
            <Card key={system.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon className={`w-5 h-5 ${system.color}`} />
                  {system.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {system.metrics.map((metric) => (
                    <div key={metric.label} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{metric.label}</span>
                      <span className="font-semibold">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Critical Alerts */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Critical Alerts & Flags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {vitals.meanArterialPressure < 65 && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                <span className="text-destructive font-bold">!</span>
                <div>
                  <p className="font-semibold text-sm">Hypotension</p>
                  <p className="text-xs text-muted-foreground">
                    MAP {'<'} 65 mmHg. Consider fluid resuscitation or vasopressors.
                  </p>
                </div>
              </div>
            )}

            {abg.lactate > 2 && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                <span className="text-destructive font-bold">!</span>
                <div>
                  <p className="font-semibold text-sm">Elevated Lactate</p>
                  <p className="text-xs text-muted-foreground">
                    Lactate {formatNumber(abg.lactate, 1)} mmol/L suggests tissue hypoperfusion. Assess for
                    shock.
                  </p>
                </div>
              </div>
            )}

            {renal.urineOutput < 30 && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                <span className="text-destructive font-bold">!</span>
                <div>
                  <p className="font-semibold text-sm">Oliguria</p>
                  <p className="text-xs text-muted-foreground">
                    UOP {formatNumber(renal.urineOutput, 0)} mL/hr. Check MAP, fluid status, and consider AKI
                    workup.
                  </p>
                </div>
              </div>
            )}

            {abg.paO2 < 60 && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                <span className="text-destructive font-bold">!</span>
                <div>
                  <p className="font-semibold text-sm">Hypoxemia</p>
                  <p className="text-xs text-muted-foreground">
                    PaO₂ {formatNumber(abg.paO2, 0)} mmHg. Consider increasing FiO₂ or PEEP.
                  </p>
                </div>
              </div>
            )}

            {shock.type === 'None' &&
              vitals.meanArterialPressure >= 65 &&
              abg.lactate <= 2 &&
              renal.urineOutput >= 30 &&
              abg.paO2 >= 60 && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <div>
                    <p className="font-semibold text-sm">All Parameters Within Normal Range</p>
                    <p className="text-xs text-muted-foreground">No critical alerts at this time.</p>
                  </div>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Physiologic Reasoning */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Integrated Physiologic Reasoning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Oxygen Delivery (DO₂):</strong> DO₂ = CO × CaO₂. Current CO{' '}
            {formatNumber(vitals.cardiacOutput, 1)} L/min × estimated CaO₂ (based on Hgb and SaO₂{' '}
            {formatNumber(abg.sO2, 0)}%).
            {vitals.cardiacOutput < 4 && ' Low CO reduces oxygen delivery.'}
          </p>

          <p>
            <strong>Acid-Base Integration:</strong> pH {formatNumber(abg.pH, 2)} is influenced by both
            respiratory (PaCO₂ {formatNumber(abg.paCO2, 0)} mmHg) and metabolic (HCO₃⁻{' '}
            {formatNumber(abg.hco3, 0)} mEq/L) components. Ventilator adjustments can rapidly correct
            respiratory acid-base disorders.
          </p>

          <p>
            <strong>Renal-Hemodynamic Coupling:</strong> Kidneys require MAP ≥65 mmHg for adequate perfusion.
            Current MAP {formatNumber(vitals.meanArterialPressure, 0)} mmHg
            {vitals.meanArterialPressure < 65
              ? ' is below this threshold, which may impair GFR and cause oliguria.'
              : ' supports normal renal autoregulation.'}
          </p>

          <p>
            <strong>Shock Pathophysiology:</strong>
            {shock.type !== 'None'
              ? ` ${shock.type} shock presents with characteristic hemodynamic profile: CO ${formatNumber(vitals.cardiacOutput, 1)} L/min, SVR ${formatNumber(vitals.systemicVascularResistance, 0)} dynes·s/cm⁵. Treatment should target the underlying pathophysiology.`
              : ' No shock state detected. Hemodynamics are stable.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
