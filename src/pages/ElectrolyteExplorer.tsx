import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { useSimulationStore } from '@/store/useSimulationStore';
import { calculateAnionGap, analyzeAcidBase } from '@/lib/simulation-engine';
import { formatNumber } from '@/lib/utils';
import { Beaker, TrendingUp } from 'lucide-react';

export function ElectrolyteExplorer() {
  const { patientState, updatePatientState, addIntervention } = useSimulationStore();
  const { electrolytes, abg } = patientState;

  const [sodium, setSodium] = useState(electrolytes.sodium);
  const [potassium, setPotassium] = useState(electrolytes.potassium);
  const [chloride, setChloride] = useState(electrolytes.chloride);
  const [bicarbonate, setBicarbonate] = useState(electrolytes.bicarbonate);

  const currentAG = calculateAnionGap(sodium, chloride, bicarbonate);
  const analysis = analyzeAcidBase(abg);

  const handleApplyChanges = () => {
    const newElectrolytes = {
      ...electrolytes,
      sodium,
      potassium,
      chloride,
      bicarbonate,
      anionGap: currentAG,
    };

    // Update ABG based on electrolyte changes
    const newABG = { ...abg };

    // Bicarbonate changes affect pH
    if (bicarbonate !== electrolytes.bicarbonate) {
      const hco3Delta = bicarbonate - electrolytes.bicarbonate;
      // For every 1 mEq/L change in HCO3, pH changes by ~0.01-0.015
      newABG.pH = Math.max(7.0, Math.min(7.6, abg.pH + (hco3Delta * 0.012)));
      newABG.hco3 = bicarbonate;
      newABG.baseExcess = bicarbonate - 24;
    }

    updatePatientState({
      electrolytes: newElectrolytes,
      abg: newABG,
    });

    addIntervention({
      id: `electrolytes-${Date.now()}`,
      type: 'Other',
      description: `Electrolyte adjustment: Na ${sodium}, K ${potassium}, Cl ${chloride}, HCO3 ${bicarbonate}`,
      timestamp: new Date(),
      parameters: { sodium, potassium, chloride, bicarbonate },
    });
  };

  const handleReset = () => {
    setSodium(electrolytes.sodium);
    setPotassium(electrolytes.potassium);
    setChloride(electrolytes.chloride);
    setBicarbonate(electrolytes.bicarbonate);
  };

  const getAGStatus = () => {
    if (currentAG > 12) return { status: 'High', color: 'text-red-500' };
    if (currentAG < 8) return { status: 'Low', color: 'text-blue-500' };
    return { status: 'Normal', color: 'text-green-500' };
  };

  const agStatus = getAGStatus();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Electrolyte Explorer</h1>
        <p className="text-muted-foreground">
          Adjust electrolytes and observe effects on acid-base balance and anion gap
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Current Electrolytes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="w-5 h-5" />
              Current Electrolytes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Sodium (Na⁺)</p>
                <p className="text-2xl font-bold">{formatNumber(electrolytes.sodium, 0)} mEq/L</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Potassium (K⁺)</p>
                <p className="text-2xl font-bold">{formatNumber(electrolytes.potassium, 1)} mEq/L</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chloride (Cl⁻)</p>
                <p className="text-2xl font-bold">{formatNumber(electrolytes.chloride, 0)} mEq/L</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bicarbonate (HCO₃⁻)</p>
                <p className="text-2xl font-bold">{formatNumber(electrolytes.bicarbonate, 0)} mEq/L</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Anion Gap</span>
                <div>
                  <span className="text-2xl font-bold">{formatNumber(electrolytes.anionGap, 0)}</span>
                  <span className={`ml-3 text-sm font-semibold ${agStatus.color}`}>
                    {agStatus.status}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                AG = Na - (Cl + HCO₃) = {formatNumber(currentAG, 0)}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-semibold mb-1">Current Acid-Base Status</p>
              <p className="text-sm text-muted-foreground">{analysis.primary}</p>
            </div>
          </CardContent>
        </Card>

        {/* Education Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Electrolyte & Acid-Base Concepts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-semibold">Anion Gap</p>
              <p className="text-muted-foreground">
                AG = Na⁺ - (Cl⁻ + HCO₃⁻). Normal: 8-12 mEq/L. Represents unmeasured anions (albumin,
                phosphate, sulfate, organic acids).
              </p>
            </div>
            <div>
              <p className="font-semibold">High Anion Gap Acidosis</p>
              <p className="text-muted-foreground">
                MUDPILES: Methanol, Uremia, DKA, Propylene glycol, Iron/INH, Lactic acidosis, Ethylene
                glycol, Salicylates
              </p>
            </div>
            <div>
              <p className="font-semibold">Normal Anion Gap Acidosis</p>
              <p className="text-muted-foreground">
                Loss of HCO₃⁻ (diarrhea, RTA) or gain of Cl⁻ (normal saline). Hyperchloremic metabolic
                acidosis.
              </p>
            </div>
            <div>
              <p className="font-semibold">Electrolyte Interactions</p>
              <p className="text-muted-foreground">
                • Hypokalemia → metabolic alkalosis (K⁺/H⁺ exchange)
                <br />
                • Hyperchloremia → metabolic acidosis (dilutional or iatrogenic)
                <br />• Low HCO₃⁻ → metabolic acidosis (primary or compensation)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Adjustments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Adjust Electrolytes
          </CardTitle>
          <CardDescription>
            Modify electrolyte values and observe the impact on anion gap and acid-base balance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Slider
                label="Sodium (Na⁺)"
                unit="mEq/L"
                min={125}
                max={155}
                step={1}
                value={sodium}
                onChange={(e) => setSodium(Number(e.target.value))}
              />

              <Slider
                label="Potassium (K⁺)"
                unit="mEq/L"
                min={2.5}
                max={6.5}
                step={0.1}
                value={potassium}
                onChange={(e) => setPotassium(Number(e.target.value))}
              />
            </div>

            <div className="space-y-4">
              <Slider
                label="Chloride (Cl⁻)"
                unit="mEq/L"
                min={85}
                max={115}
                step={1}
                value={chloride}
                onChange={(e) => setChloride(Number(e.target.value))}
              />

              <Slider
                label="Bicarbonate (HCO₃⁻)"
                unit="mEq/L"
                min={10}
                max={35}
                step={1}
                value={bicarbonate}
                onChange={(e) => setBicarbonate(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold">Predicted Anion Gap:</span>
              <span className="text-lg font-bold">{formatNumber(currentAG, 0)} mEq/L</span>
            </div>
            <p className="text-xs text-muted-foreground">
              AG = {sodium} - ({chloride} + {bicarbonate}) = {formatNumber(currentAG, 0)}
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={handleApplyChanges} className="flex-1">
              Apply Changes
            </Button>
            <Button onClick={handleReset} variant="outline">
              Reset
            </Button>
          </div>

          <div className="mt-6 text-xs text-muted-foreground p-3 bg-muted rounded">
            <p className="font-semibold mb-1">Expected Effects:</p>
            <ul className="space-y-1">
              <li>• Increasing HCO₃⁻ will raise pH (metabolic alkalosis)</li>
              <li>• Decreasing HCO₃⁻ will lower pH (metabolic acidosis)</li>
              <li>• High Cl⁻ relative to Na⁺ narrows anion gap (hyperchloremic acidosis)</li>
              <li>• Changes in unmeasured anions (albumin, lactate) affect anion gap</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
