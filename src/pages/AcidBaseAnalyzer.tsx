import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSimulationStore } from '@/store/useSimulationStore';
import { analyzeAcidBase, calculateAnionGap } from '@/lib/simulation-engine';
import { formatNumber } from '@/lib/utils';
import { Activity, AlertCircle } from 'lucide-react';

export function AcidBaseAnalyzer() {
  const { patientState } = useSimulationStore();
  const { abg, electrolytes } = patientState;

  const analysis = analyzeAcidBase(abg);
  const anionGap = calculateAnionGap(electrolytes.sodium, electrolytes.chloride, electrolytes.bicarbonate);

  const getPhStatus = () => {
    if (abg.pH < 7.35) return { status: 'Acidemia', color: 'text-red-500' };
    if (abg.pH > 7.45) return { status: 'Alkalemia', color: 'text-blue-500' };
    return { status: 'Normal', color: 'text-green-500' };
  };

  const phStatus = getPhStatus();

  const getAnionGapStatus = () => {
    if (anionGap > 12) return { status: 'High', color: 'text-red-500' };
    if (anionGap < 8) return { status: 'Low', color: 'text-blue-500' };
    return { status: 'Normal', color: 'text-green-500' };
  };

  const agStatus = getAnionGapStatus();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Acid-Base Analyzer</h1>
        <p className="text-muted-foreground">
          Interpret arterial blood gases and understand acid-base compensation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* ABG Values */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Current ABG
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">pH</span>
                <div className="text-right">
                  <span className="text-xl font-bold">{formatNumber(abg.pH, 2)}</span>
                  <span className={`ml-3 text-sm font-semibold ${phStatus.color}`}>
                    {phStatus.status}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">PaCO₂</span>
                <div className="text-right">
                  <span className="text-xl font-bold">{formatNumber(abg.paCO2, 0)} mmHg</span>
                  <span className="ml-3 text-xs text-muted-foreground">(Normal: 35-45)</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">HCO₃⁻</span>
                <div className="text-right">
                  <span className="text-xl font-bold">{formatNumber(abg.hco3, 0)} mEq/L</span>
                  <span className="ml-3 text-xs text-muted-foreground">(Normal: 22-26)</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">PaO₂</span>
                <div className="text-right">
                  <span className="text-xl font-bold">{formatNumber(abg.paO2, 0)} mmHg</span>
                  <span className="ml-3 text-xs text-muted-foreground">(Normal: {'>'}80)</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Base Excess</span>
                <div className="text-right">
                  <span className="text-xl font-bold">{formatNumber(abg.baseExcess, 0)} mEq/L</span>
                  <span className="ml-3 text-xs text-muted-foreground">(Normal: -2 to +2)</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Lactate</span>
                <div className="text-right">
                  <span className="text-xl font-bold">{formatNumber(abg.lactate, 1)} mmol/L</span>
                  <span className="ml-3 text-xs text-muted-foreground">(Normal: {'<'}2)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interpretation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Interpretation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-1">Primary Disturbance</p>
              <p className="text-2xl font-bold text-primary">{analysis.primary}</p>
            </div>

            <div>
              <p className="text-sm font-semibold mb-1">Compensation</p>
              <p className="text-lg">{analysis.compensation}</p>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Anion Gap</span>
                <div>
                  <span className="text-xl font-bold">{formatNumber(anionGap, 0)}</span>
                  <span className={`ml-3 text-sm font-semibold ${agStatus.color}`}>
                    {agStatus.status}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                AG = Na - (Cl + HCO₃) = {electrolytes.sodium} - ({electrolytes.chloride} +{' '}
                {electrolytes.bicarbonate}) = {formatNumber(anionGap, 0)}
              </p>
            </div>

            {anionGap > 12 && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm font-semibold">High Anion Gap Acidosis</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Differential: MUDPILES - Methanol, Uremia, DKA, Propylene glycol/Paraldehyde, Iron/INH,
                  Lactic acidosis, Ethylene glycol, Salicylates
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stepwise Interpretation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Stepwise ABG Interpretation</CardTitle>
          <CardDescription>Follow this systematic approach to interpret any ABG</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                1
              </div>
              <div>
                <p className="font-semibold">Check pH - Is there acidemia or alkalemia?</p>
                <p className="text-sm text-muted-foreground">
                  pH {'<'} 7.35 = Acidemia | pH {'>'} 7.45 = Alkalemia | pH 7.35-7.45 = Normal or
                  compensated
                </p>
                <p className="text-sm mt-1">
                  Current: pH {formatNumber(abg.pH, 2)} → <strong>{phStatus.status}</strong>
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                2
              </div>
              <div>
                <p className="font-semibold">Determine if primary process is respiratory or metabolic</p>
                <p className="text-sm text-muted-foreground">
                  If PaCO₂ and pH move in opposite directions → Respiratory
                  <br />
                  If HCO₃ and pH move in same direction → Metabolic
                </p>
                <p className="text-sm mt-1">
                  Current: <strong>{analysis.primary}</strong>
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                3
              </div>
              <div>
                <p className="font-semibold">Assess compensation</p>
                <p className="text-sm text-muted-foreground">
                  • Respiratory acidosis: HCO₃ increases 1 mEq/L per 10 mmHg ↑ CO₂ (acute) or 4 mEq/L
                  (chronic)
                  <br />
                  • Metabolic acidosis: PaCO₂ = 1.5(HCO₃) + 8 ± 2 (Winter's formula)
                  <br />• Metabolic alkalosis: PaCO₂ increases 0.7 mmHg per 1 mEq/L ↑ HCO₃
                </p>
                <p className="text-sm mt-1">
                  Current: <strong>{analysis.compensation} compensation</strong>
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                4
              </div>
              <div>
                <p className="font-semibold">Calculate anion gap (if metabolic acidosis)</p>
                <p className="text-sm text-muted-foreground">
                  AG = Na - (Cl + HCO₃). Normal: 8-12 mEq/L
                  <br />
                  High AG → MUDPILES causes | Normal AG → GI/Renal losses, RTA
                </p>
                <p className="text-sm mt-1">
                  Current: AG = {formatNumber(anionGap, 0)} → <strong>{agStatus.status}</strong>
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                5
              </div>
              <div>
                <p className="font-semibold">Check for mixed disorders</p>
                <p className="text-sm text-muted-foreground">
                  If compensation is more or less than expected, consider a mixed acid-base disorder
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinical Pearls */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Clinical Pearls</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>
              • <strong>Lactate {'>'} 4 mmol/L:</strong> Suggests tissue hypoperfusion or shock state
            </li>
            <li>
              • <strong>Base excess:</strong> Negative = metabolic acidosis, Positive = metabolic alkalosis
            </li>
            <li>
              • <strong>Delta-delta:</strong> In high AG acidosis, compare ΔAG to ΔHCO₃ to detect concurrent
              metabolic alkalosis/acidosis
            </li>
            <li>
              • <strong>Respiratory compensation:</strong> Fast (minutes to hours). Renal compensation: Slow
              (days)
            </li>
            <li>
              • <strong>pH 7.20 or PCO₂ {'>'} 60:</strong> Consider intubation in respiratory failure
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
