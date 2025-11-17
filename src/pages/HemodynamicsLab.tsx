import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { useSimulationStore } from '@/store/useSimulationStore';
import {
  simulateFluidBolus,
  simulateVasopressor,
  assessShockState,
} from '@/lib/simulation-engine';
import { formatNumber } from '@/lib/utils';
import { Activity, Droplet, TrendingUp } from 'lucide-react';

export function HemodynamicsLab() {
  const { patientState, updatePatientState, addIntervention } = useSimulationStore();
  const { vitals, abg, shock } = patientState;

  const [fluidVolume, setFluidVolume] = useState(500);
  const [fluidType, setFluidType] = useState<'Crystalloid' | 'Colloid'>('Crystalloid');
  const [vasopressorDose, setVasopressorDose] = useState(0.05);
  const [selectedVasopressor, setSelectedVasopressor] = useState('norepinephrine');

  const handleFluidBolus = () => {
    const newVitals = simulateFluidBolus(vitals, fluidVolume, fluidType);
    const newShock = assessShockState(newVitals, abg.lactate);

    updatePatientState({
      vitals: newVitals,
      shock: newShock,
    });

    addIntervention({
      id: `fluid-${Date.now()}`,
      type: 'Fluid',
      description: `${fluidVolume} mL ${fluidType} bolus`,
      timestamp: new Date(),
      parameters: { volume: fluidVolume, type: fluidType },
    });
  };

  const handleVasopressor = () => {
    const newVitals = simulateVasopressor(vitals, selectedVasopressor, vasopressorDose);
    const newShock = assessShockState(newVitals, abg.lactate);

    updatePatientState({
      vitals: newVitals,
      shock: newShock,
    });

    addIntervention({
      id: `vasopressor-${Date.now()}`,
      type: 'Medication',
      description: `${selectedVasopressor} ${vasopressorDose} mcg/kg/min`,
      timestamp: new Date(),
      parameters: { medication: selectedVasopressor, dose: vasopressorDose },
    });
  };

  const handleReset = () => {
    useSimulationStore.getState().resetSimulation();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Hemodynamics Lab</h1>
        <p className="text-muted-foreground">
          Explore cardiac output, systemic vascular resistance, and fluid responsiveness
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Current Vitals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Current Hemodynamics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Heart Rate</p>
                <p className="text-2xl font-bold">{formatNumber(vitals.heartRate, 0)} bpm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blood Pressure</p>
                <p className="text-2xl font-bold">
                  {formatNumber(vitals.systolicBP, 0)}/{formatNumber(vitals.diastolicBP, 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">MAP</p>
                <p className="text-2xl font-bold">{formatNumber(vitals.meanArterialPressure, 0)} mmHg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CVP</p>
                <p className="text-2xl font-bold">{formatNumber(vitals.centralVenousPressure, 0)} mmHg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cardiac Output</p>
                <p className="text-2xl font-bold">{formatNumber(vitals.cardiacOutput)} L/min</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">SVR</p>
                <p className="text-2xl font-bold">
                  {formatNumber(vitals.systemicVascularResistance, 0)} dynes·s/cm⁵
                </p>
              </div>
            </div>

            {/* Shock Assessment */}
            {shock.type !== 'None' && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="font-semibold text-sm">Shock Detected</p>
                <p className="text-sm">
                  Type: {shock.type} - Severity: {shock.severity}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Markers: {shock.markers.join(', ')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Education Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Hemodynamic Concepts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-semibold">Mean Arterial Pressure (MAP)</p>
              <p className="text-muted-foreground">
                MAP = Diastolic + (Systolic - Diastolic)/3. Target ≥65 mmHg for adequate organ perfusion.
              </p>
            </div>
            <div>
              <p className="font-semibold">Cardiac Output (CO)</p>
              <p className="text-muted-foreground">
                CO = Heart Rate × Stroke Volume. Normal: 4-8 L/min. Determines oxygen delivery.
              </p>
            </div>
            <div>
              <p className="font-semibold">Systemic Vascular Resistance (SVR)</p>
              <p className="text-muted-foreground">
                SVR = (MAP - CVP) × 80 / CO. Normal: 800-1200 dynes·s/cm⁵. Reflects afterload.
              </p>
            </div>
            <div>
              <p className="font-semibold">Frank-Starling Curve</p>
              <p className="text-muted-foreground">
                Increased preload (CVP) increases stroke volume up to a point. Fluid responsiveness depends
                on position on the curve.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fluid Administration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="w-5 h-5" />
              Fluid Administration
            </CardTitle>
            <CardDescription>Simulate fluid bolus administration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Fluid Type</label>
              <div className="flex gap-2">
                <Button
                  variant={fluidType === 'Crystalloid' ? 'default' : 'outline'}
                  onClick={() => setFluidType('Crystalloid')}
                  size="sm"
                >
                  Crystalloid
                </Button>
                <Button
                  variant={fluidType === 'Colloid' ? 'default' : 'outline'}
                  onClick={() => setFluidType('Colloid')}
                  size="sm"
                >
                  Colloid
                </Button>
              </div>
            </div>

            <Slider
              label="Volume"
              unit="mL"
              min={250}
              max={1000}
              step={250}
              value={fluidVolume}
              onChange={(e) => setFluidVolume(Number(e.target.value))}
            />

            <Button onClick={handleFluidBolus} className="w-full">
              Give Fluid Bolus
            </Button>

            <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
              <p className="font-semibold mb-1">Expected Effect:</p>
              <p>
                Fluid bolus will increase preload (CVP), potentially increasing stroke volume and cardiac
                output via the Frank-Starling mechanism. MAP should increase if patient is fluid-responsive.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vasopressor Administration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Vasopressor/Inotrope
            </CardTitle>
            <CardDescription>Adjust vasopressor or inotrope therapy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Medication</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={selectedVasopressor === 'norepinephrine' ? 'default' : 'outline'}
                  onClick={() => setSelectedVasopressor('norepinephrine')}
                  size="sm"
                >
                  Norepinephrine
                </Button>
                <Button
                  variant={selectedVasopressor === 'vasopressin' ? 'default' : 'outline'}
                  onClick={() => setSelectedVasopressor('vasopressin')}
                  size="sm"
                >
                  Vasopressin
                </Button>
                <Button
                  variant={selectedVasopressor === 'epinephrine' ? 'default' : 'outline'}
                  onClick={() => setSelectedVasopressor('epinephrine')}
                  size="sm"
                >
                  Epinephrine
                </Button>
                <Button
                  variant={selectedVasopressor === 'dobutamine' ? 'default' : 'outline'}
                  onClick={() => setSelectedVasopressor('dobutamine')}
                  size="sm"
                >
                  Dobutamine
                </Button>
              </div>
            </div>

            <Slider
              label="Dose"
              unit="mcg/kg/min"
              min={0.01}
              max={0.5}
              step={0.01}
              value={vasopressorDose}
              onChange={(e) => setVasopressorDose(Number(e.target.value))}
            />

            <Button onClick={handleVasopressor} className="w-full">
              Apply Vasopressor
            </Button>

            <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
              <p className="font-semibold mb-1">Mechanism:</p>
              <p>
                <strong>Norepinephrine:</strong> α1 agonist - increases SVR and MAP
                <br />
                <strong>Vasopressin:</strong> V1 receptor - pure vasoconstriction
                <br />
                <strong>Epinephrine:</strong> α+β agonist - increases HR, contractility, SVR
                <br />
                <strong>Dobutamine:</strong> β1 agonist - increases contractility, decreases SVR
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button onClick={handleReset} variant="outline">
          Reset to Baseline
        </Button>
      </div>
    </div>
  );
}
