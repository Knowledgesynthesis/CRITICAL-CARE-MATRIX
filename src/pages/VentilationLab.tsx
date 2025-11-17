import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { useSimulationStore } from '@/store/useSimulationStore';
import { simulateVentilatorChange, simulatePEEPEffect, calculatePF_Ratio } from '@/lib/simulation-engine';
import { formatNumber } from '@/lib/utils';
import { Wind, Activity } from 'lucide-react';
import type { VentilatorMode } from '@/types';
import { ABGChart } from '@/components/visualizations/ABGChart';
import { InterventionHistory } from '@/components/InterventionHistory';

export function VentilationLab() {
  const { patientState, updatePatientState, addIntervention, interventions, historicalData } = useSimulationStore();
  const { ventilator, abg, vitals } = patientState;

  const [tidalVolume, setTidalVolume] = useState(ventilator.tidalVolume);
  const [respiratoryRate, setRespiratoryRate] = useState(ventilator.respiratoryRate);
  const [fiO2, setFiO2] = useState(ventilator.fiO2 * 100);
  const [peep, setPeep] = useState(ventilator.peep);
  const [mode, setMode] = useState<VentilatorMode>(ventilator.mode);

  const minuteVentilation = (tidalVolume * respiratoryRate) / 1000;
  const pfRatio = calculatePF_Ratio(abg.paO2, ventilator.fiO2);

  const handleApplyVentilatorChange = () => {
    const newVentSettings = {
      ...ventilator,
      mode,
      tidalVolume,
      respiratoryRate,
      fiO2: fiO2 / 100,
      peep,
    };

    // Simulate gas exchange changes
    let newABG = simulateVentilatorChange(abg, ventilator, newVentSettings);

    // Simulate hemodynamic effects of PEEP change
    let newVitals = vitals;
    if (peep !== ventilator.peep) {
      newVitals = simulatePEEPEffect(vitals, ventilator.peep, peep);
    }

    updatePatientState({
      ventilator: newVentSettings,
      abg: newABG,
      vitals: newVitals,
    });

    addIntervention({
      id: `vent-${Date.now()}`,
      type: 'Ventilator',
      description: `Vent: TV ${tidalVolume} mL, RR ${respiratoryRate}, FiO2 ${fiO2}%, PEEP ${peep}`,
      timestamp: new Date(),
      parameters: { tidalVolume, respiratoryRate, fiO2, peep },
    });
  };

  const handleReset = () => {
    useSimulationStore.getState().resetSimulation();
    setTidalVolume(500);
    setRespiratoryRate(16);
    setFiO2(40);
    setPeep(5);
  };

  const isARDS = pfRatio < 300;
  const ardsSeverity = pfRatio < 100 ? 'Severe' : pfRatio < 200 ? 'Moderate' : 'Mild';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Ventilation Lab</h1>
        <p className="text-muted-foreground">
          Simulate mechanical ventilation settings and observe gas exchange changes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Current Gas Exchange */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Current Gas Exchange
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">pH</p>
                <p className="text-2xl font-bold">{formatNumber(abg.pH, 2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">PaCO₂</p>
                <p className="text-2xl font-bold">{formatNumber(abg.paCO2, 0)} mmHg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">PaO₂</p>
                <p className="text-2xl font-bold">{formatNumber(abg.paO2, 0)} mmHg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SpO₂</p>
                <p className="text-2xl font-bold">{formatNumber(abg.sO2, 0)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">HCO₃⁻</p>
                <p className="text-2xl font-bold">{formatNumber(abg.hco3, 0)} mEq/L</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lactate</p>
                <p className="text-2xl font-bold">{formatNumber(abg.lactate, 1)} mmol/L</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">PaO₂/FiO₂ Ratio:</span>
                <span className="font-semibold">{formatNumber(pfRatio, 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Minute Ventilation:</span>
                <span className="font-semibold">{formatNumber(minuteVentilation, 1)} L/min</span>
              </div>
            </div>

            {isARDS && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="font-semibold text-sm">ARDS Detected</p>
                <p className="text-sm">Severity: {ardsSeverity} (P/F: {formatNumber(pfRatio, 0)})</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Consider lung-protective ventilation: TV 6 mL/kg IBW, Plateau pressure {'<30'} cmH₂O
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Education Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Ventilation Concepts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-semibold">Minute Ventilation</p>
              <p className="text-muted-foreground">
                MV = Tidal Volume × Respiratory Rate. Controls CO₂ elimination. Increasing MV decreases
                PaCO₂.
              </p>
            </div>
            <div>
              <p className="font-semibold">FiO₂ and PEEP</p>
              <p className="text-muted-foreground">
                FiO₂ increases alveolar oxygen. PEEP recruits collapsed alveoli and improves oxygenation but
                increases intrathoracic pressure.
              </p>
            </div>
            <div>
              <p className="font-semibold">PEEP ↔ Hemodynamics</p>
              <p className="text-muted-foreground">
                High PEEP reduces venous return (preload), potentially decreasing cardiac output, especially
                in hypovolemic patients.
              </p>
            </div>
            <div>
              <p className="font-semibold">ARDS Lung Protection</p>
              <p className="text-muted-foreground">
                Target: TV 6 mL/kg IBW, Plateau pressure {'<30'} cmH₂O. Accept permissive hypercapnia if
                needed to protect lungs.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ventilator Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wind className="w-5 h-5" />
            Ventilator Settings
          </CardTitle>
          <CardDescription>Adjust mechanical ventilation parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Ventilator Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Volume Control (AC)', 'Pressure Control (AC)', 'SIMV', 'PSV'].map((m) => (
                    <Button
                      key={m}
                      variant={mode === m ? 'default' : 'outline'}
                      onClick={() => setMode(m as VentilatorMode)}
                      size="sm"
                    >
                      {m}
                    </Button>
                  ))}
                </div>
              </div>

              <Slider
                label="Tidal Volume"
                unit="mL"
                min={300}
                max={800}
                step={50}
                value={tidalVolume}
                onChange={(e) => setTidalVolume(Number(e.target.value))}
              />

              <Slider
                label="Respiratory Rate"
                unit="breaths/min"
                min={8}
                max={35}
                step={1}
                value={respiratoryRate}
                onChange={(e) => setRespiratoryRate(Number(e.target.value))}
              />
            </div>

            <div className="space-y-4">
              <Slider
                label="FiO₂"
                unit="%"
                min={21}
                max={100}
                step={5}
                value={fiO2}
                onChange={(e) => setFiO2(Number(e.target.value))}
              />

              <Slider
                label="PEEP"
                unit="cmH₂O"
                min={0}
                max={20}
                step={1}
                value={peep}
                onChange={(e) => setPeep(Number(e.target.value))}
              />

              <div className="pt-4">
                <Button onClick={handleApplyVentilatorChange} className="w-full">
                  Apply Ventilator Changes
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-semibold mb-2">Quick Guide:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong>To decrease PaCO₂:</strong> Increase respiratory rate or tidal volume</li>
              <li>• <strong>To increase PaO₂:</strong> Increase FiO₂ or PEEP</li>
              <li>
                • <strong>ARDS ventilation:</strong> TV ~6 mL/kg, higher PEEP (8-15), accept pH 7.25-7.30
              </li>
              <li>• <strong>Caution:</strong> High PEEP can decrease cardiac output (reduce preload)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Visualizations */}
      {historicalData.length > 1 && (
        <div className="mt-6">
          <ABGChart data={historicalData} />
        </div>
      )}

      {/* Intervention History */}
      {interventions.length > 0 && (
        <div className="mt-6">
          <InterventionHistory interventions={interventions} />
        </div>
      )}

      <div className="mt-6">
        <Button onClick={handleReset} variant="outline">
          Reset to Baseline
        </Button>
      </div>
    </div>
  );
}
