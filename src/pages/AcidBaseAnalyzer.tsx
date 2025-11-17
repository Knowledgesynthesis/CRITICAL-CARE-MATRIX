import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { useSimulationStore } from '@/store/useSimulationStore';
import { analyzeAcidBase, calculateAnionGap } from '@/lib/simulation-engine';
import { formatNumber } from '@/lib/utils';
import { Activity, AlertCircle, Beaker } from 'lucide-react';
import { ABGChart } from '@/components/visualizations/ABGChart';
import { InterventionHistory } from '@/components/InterventionHistory';

export function AcidBaseAnalyzer() {
  const { patientState, updatePatientState, addIntervention, historicalData, interventions } = useSimulationStore();
  const { abg, electrolytes } = patientState;

  const [pH, setPH] = useState(abg.pH);
  const [paCO2, setPaCO2] = useState(abg.paCO2);
  const [paO2, setPaO2] = useState(abg.paO2);
  const [hco3, setHco3] = useState(abg.hco3);
  const [lactate, setLactate] = useState(abg.lactate);

  // Calculate real-time preview
  const previewABG = { ...abg, pH, paCO2, paO2, hco3, lactate };
  const analysis = analyzeAcidBase(previewABG);
  const anionGap = calculateAnionGap(electrolytes.sodium, electrolytes.chloride, electrolytes.bicarbonate);

  const handleApply = () => {
    const newABG = {
      ...abg,
      pH,
      paCO2,
      paO2,
      hco3,
      lactate,
      baseExcess: hco3 - 24,
      sO2: paO2 < 60 ? 75 + (paO2 - 40) * 0.75 : Math.min(97 + (paO2 - 60) * 0.01, 100),
    };

    updatePatientState({ abg: newABG });

    addIntervention({
      id: `abg-${Date.now()}`,
      type: 'Other',
      description: `ABG adjusted: pH ${formatNumber(pH, 2)}, PaCO2 ${formatNumber(paCO2, 0)}, HCO3 ${formatNumber(hco3, 0)}`,
      timestamp: new Date(),
      parameters: { pH, paCO2, paO2, hco3, lactate },
    });
  };

  const handleReset = () => {
    setPH(abg.pH);
    setPaCO2(abg.paCO2);
    setPaO2(abg.paO2);
    setHco3(abg.hco3);
    setLactate(abg.lactate);
  };

  const loadPresetABG = (preset: string) => {
    switch (preset) {
      case 'normal':
        setPH(7.40);
        setPaCO2(40);
        setPaO2(95);
        setHco3(24);
        setLactate(1.2);
        break;
      case 'metabolic-acidosis':
        setPH(7.25);
        setPaCO2(30);
        setPaO2(90);
        setHco3(14);
        setLactate(5.5);
        break;
      case 'respiratory-acidosis':
        setPH(7.28);
        setPaCO2(55);
        setPaO2(70);
        setHco3(26);
        setLactate(1.5);
        break;
      case 'metabolic-alkalosis':
        setPH(7.52);
        setPaCO2(45);
        setPaO2(95);
        setHco3(35);
        setLactate(1.0);
        break;
      case 'respiratory-alkalosis':
        setPH(7.50);
        setPaCO2(28);
        setPaO2(100);
        setHco3(22);
        setLactate(1.2);
        break;
    }
  };

  const getPhStatus = (phValue: number) => {
    if (phValue < 7.35) return { status: 'Acidemia', color: 'text-red-500' };
    if (phValue > 7.45) return { status: 'Alkalemia', color: 'text-blue-500' };
    return { status: 'Normal', color: 'text-green-500' };
  };

  const phStatus = getPhStatus(pH);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Acid-Base Analyzer</h1>
        <p className="text-muted-foreground">
          Adjust ABG parameters and practice interpretation with real-time feedback
        </p>
      </div>

      {/* Preset ABG Scenarios */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="w-5 h-5" />
            Load Practice ABG
          </CardTitle>
          <CardDescription>
            Load common acid-base disturbances to practice interpretation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => loadPresetABG('normal')} variant="outline" size="sm">
              Normal ABG
            </Button>
            <Button onClick={() => loadPresetABG('metabolic-acidosis')} variant="outline" size="sm">
              Metabolic Acidosis
            </Button>
            <Button onClick={() => loadPresetABG('respiratory-acidosis')} variant="outline" size="sm">
              Respiratory Acidosis
            </Button>
            <Button onClick={() => loadPresetABG('metabolic-alkalosis')} variant="outline" size="sm">
              Metabolic Alkalosis
            </Button>
            <Button onClick={() => loadPresetABG('respiratory-alkalosis')} variant="outline" size="sm">
              Respiratory Alkalosis
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Interactive ABG Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Adjust ABG Parameters
            </CardTitle>
            <CardDescription>
              Move sliders to modify blood gas values
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Slider
              label="pH"
              min={7.0}
              max={7.6}
              step={0.01}
              value={pH}
              onChange={(e) => setPH(Number(e.target.value))}
              showValue
            />

            <Slider
              label="PaCO₂"
              unit="mmHg"
              min={20}
              max={80}
              step={1}
              value={paCO2}
              onChange={(e) => setPaCO2(Number(e.target.value))}
            />

            <Slider
              label="PaO₂"
              unit="mmHg"
              min={40}
              max={150}
              step={1}
              value={paO2}
              onChange={(e) => setPaO2(Number(e.target.value))}
            />

            <Slider
              label="HCO₃⁻"
              unit="mEq/L"
              min={10}
              max={40}
              step={1}
              value={hco3}
              onChange={(e) => setHco3(Number(e.target.value))}
            />

            <Slider
              label="Lactate"
              unit="mmol/L"
              min={0.5}
              max={10}
              step={0.1}
              value={lactate}
              onChange={(e) => setLactate(Number(e.target.value))}
            />

            <div className="flex gap-3 pt-4">
              <Button onClick={handleApply} className="flex-1">
                Apply Changes
              </Button>
              <Button onClick={handleReset} variant="outline">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Interpretation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Interpretation Preview
            </CardTitle>
            <CardDescription>
              Analysis updates as you adjust parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-1">pH Status</p>
              <p className={`text-2xl font-bold ${phStatus.color}`}>{phStatus.status}</p>
              <p className="text-sm text-muted-foreground">pH: {formatNumber(pH, 2)}</p>
            </div>

            <div>
              <p className="text-sm font-semibold mb-1">Primary Disturbance</p>
              <p className="text-xl font-bold text-primary">{analysis.primary}</p>
            </div>

            <div>
              <p className="text-sm font-semibold mb-1">Compensation</p>
              <p className="text-lg">{analysis.compensation}</p>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm font-semibold mb-1">Expected Compensation Check</p>
              {analysis.primary === 'Metabolic Acidosis' && (
                <div className="text-sm">
                  <p className="text-muted-foreground">
                    Winter's Formula: Expected PaCO₂ = 1.5({hco3}) + 8 ± 2 ={' '}
                    {formatNumber(1.5 * hco3 + 8, 0)} ± 2
                  </p>
                  <p className="mt-1">
                    Actual PaCO₂: {formatNumber(paCO2, 0)} mmHg
                    {Math.abs(paCO2 - (1.5 * hco3 + 8)) <= 2 ? ' ✓ Appropriate' : ' ⚠ Check for mixed disorder'}
                  </p>
                </div>
              )}
              {analysis.primary.includes('Respiratory') && (
                <p className="text-sm text-muted-foreground">
                  {analysis.primary === 'Respiratory Acidosis'
                    ? 'Expected HCO₃ ↑ by ~1 mEq/L per 10 mmHg ↑ PaCO₂ (acute) or 4 mEq/L (chronic)'
                    : 'Expected HCO₃ ↓ by ~2 mEq/L per 10 mmHg ↓ PaCO₂ (acute)'}
                </p>
              )}
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Anion Gap</span>
                <span className="text-lg font-bold">{formatNumber(anionGap, 0)} mEq/L</span>
              </div>
              {anionGap > 12 && (
                <p className="text-xs text-destructive mt-1">
                  High AG - Consider MUDPILES causes
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualizations */}
      {historicalData.length > 1 && (
        <div className="mb-6">
          <ABGChart data={historicalData} />
        </div>
      )}

      {/* Stepwise Interpretation Guide */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Stepwise ABG Interpretation</CardTitle>
          <CardDescription>Follow this systematic approach</CardDescription>
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
                  pH {'<'} 7.35 = Acidemia | pH {'>'} 7.45 = Alkalemia
                </p>
                <p className="text-sm mt-1">
                  Current: pH {formatNumber(pH, 2)} → <strong>{phStatus.status}</strong>
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                2
              </div>
              <div>
                <p className="font-semibold">Determine primary process</p>
                <p className="text-sm text-muted-foreground">
                  If PaCO₂ moves opposite to pH → Respiratory
                  <br />
                  If HCO₃ moves same direction as pH → Metabolic
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
                <p className="text-sm mt-1">
                  Current: <strong>{analysis.compensation} compensation</strong>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intervention History */}
      {interventions.length > 0 && (
        <div className="mb-6">
          <InterventionHistory interventions={interventions} />
        </div>
      )}
    </div>
  );
}
