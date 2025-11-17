import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSimulationStore } from '@/store/useSimulationStore';
import { formatNumber } from '@/lib/utils';
import { Zap, TrendingDown, Heart, Activity } from 'lucide-react';

export function ShockPathways() {
  const { patientState } = useSimulationStore();
  const { shock, vitals, abg } = patientState;

  const shockTypes = [
    {
      type: 'Hypovolemic',
      description: 'Inadequate circulating volume',
      hemodynamics: 'Low CO, High SVR, Low CVP',
      causes: 'Hemorrhage, dehydration, GI losses',
      treatment: 'Fluid resuscitation, blood products',
      icon: TrendingDown,
    },
    {
      type: 'Cardiogenic',
      description: 'Pump failure',
      hemodynamics: 'Low CO, High SVR, High CVP/PCWP',
      causes: 'MI, cardiomyopathy, valvular disease',
      treatment: 'Inotropes, mechanical support, diuresis if volume overloaded',
      icon: Heart,
    },
    {
      type: 'Distributive (Septic)',
      description: 'Vasodilation',
      hemodynamics: 'High CO, Low SVR, Variable CVP',
      causes: 'Sepsis, anaphylaxis, neurogenic',
      treatment: 'Fluids, vasopressors (norepinephrine), source control',
      icon: Activity,
    },
    {
      type: 'Obstructive',
      description: 'Physical obstruction to flow',
      hemodynamics: 'Low CO, High SVR, High CVP',
      causes: 'PE, tamponade, tension pneumothorax',
      treatment: 'Relieve obstruction (drainage, thrombolysis, needle decompression)',
      icon: Zap,
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Shock Pathways</h1>
        <p className="text-muted-foreground">
          Differentiate shock types and understand pathophysiology-driven management
        </p>
      </div>

      {/* Current Shock Assessment */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Current Patient Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Shock Type</p>
              <p className="text-2xl font-bold">{shock.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Severity</p>
              <p className="text-2xl font-bold">{shock.severity}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lactate</p>
              <p className="text-2xl font-bold">{formatNumber(shock.lactate, 1)} mmol/L</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">MAP</p>
              <p className="text-2xl font-bold">{formatNumber(vitals.meanArterialPressure, 0)} mmHg</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-3 border rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Cardiac Output</p>
              <p className="text-lg font-bold">{formatNumber(vitals.cardiacOutput, 1)} L/min</p>
              <p className="text-xs text-muted-foreground">(Normal: 4-8)</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">SVR</p>
              <p className="text-lg font-bold">
                {formatNumber(vitals.systemicVascularResistance, 0)} dynes·s/cm⁵
              </p>
              <p className="text-xs text-muted-foreground">(Normal: 800-1200)</p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">CVP</p>
              <p className="text-lg font-bold">{formatNumber(vitals.centralVenousPressure, 0)} mmHg</p>
              <p className="text-xs text-muted-foreground">(Normal: 2-8)</p>
            </div>
          </div>

          {shock.markers.length > 0 && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm font-semibold">Shock Markers Present:</p>
              <p className="text-sm">{shock.markers.join(' • ')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shock Type Comparison */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Shock Classification</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shockTypes.map((shockType) => {
            const Icon = shockType.icon;
            const isCurrentType = shock.type.includes(shockType.type.split(' ')[0]);

            return (
              <Card
                key={shockType.type}
                className={isCurrentType ? 'border-primary border-2' : ''}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="w-5 h-5" />
                    {shockType.type}
                    {isCurrentType && (
                      <span className="ml-auto text-sm bg-primary text-primary-foreground px-2 py-1 rounded">
                        Current
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{shockType.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="font-semibold">Hemodynamics:</p>
                    <p className="text-muted-foreground">{shockType.hemodynamics}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Common Causes:</p>
                    <p className="text-muted-foreground">{shockType.causes}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Treatment Approach:</p>
                    <p className="text-muted-foreground">{shockType.treatment}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Lactate and Perfusion */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Lactate & Tissue Perfusion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="font-semibold mb-2">Current Lactate: {formatNumber(abg.lactate, 1)} mmol/L</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      abg.lactate < 2 ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                  <span>{'<'}2 mmol/L: Normal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      abg.lactate >= 2 && abg.lactate < 4 ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}
                  />
                  <span>2-4 mmol/L: Mild elevation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${abg.lactate >= 4 ? 'bg-red-500' : 'bg-gray-300'}`}
                  />
                  <span>{'>'} 4 mmol/L: Severe, suggests shock</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold">Lactate Production:</p>
                <p className="text-muted-foreground">
                  • Type A: Tissue hypoxia (shock, severe hypoxemia)
                  <br />• Type B: Non-hypoxic (liver disease, medications, malignancy)
                </p>
              </div>
              <div>
                <p className="font-semibold">Clinical Significance:</p>
                <p className="text-muted-foreground">
                  Lactate clearance {'>'} 10% in 6 hours associated with improved outcomes. Trending lactate
                  is more useful than a single value.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shock Management Algorithm */}
      <Card>
        <CardHeader>
          <CardTitle>General Shock Management Approach</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                1
              </div>
              <div>
                <p className="font-semibold">Recognize Shock</p>
                <p className="text-sm text-muted-foreground">
                  Hypotension (MAP {'<'} 65), tachycardia, altered mental status, oliguria, elevated lactate
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                2
              </div>
              <div>
                <p className="font-semibold">Assess Hemodynamics</p>
                <p className="text-sm text-muted-foreground">
                  CO, SVR, CVP/PCWP → Classify shock type
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                3
              </div>
              <div>
                <p className="font-semibold">Initial Resuscitation</p>
                <p className="text-sm text-muted-foreground">
                  Fluids (except cardiogenic shock), pressors if needed to maintain MAP ≥ 65 mmHg
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                4
              </div>
              <div>
                <p className="font-semibold">Treat Underlying Cause</p>
                <p className="text-sm text-muted-foreground">
                  Source control (sepsis), revascularization (MI), relieve obstruction, hemorrhage control
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                5
              </div>
              <div>
                <p className="font-semibold">Monitor Response</p>
                <p className="text-sm text-muted-foreground">
                  Lactate clearance, urine output, mental status, MAP, cardiac output
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
