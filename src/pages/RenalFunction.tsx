import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { useSimulationStore } from '@/store/useSimulationStore';
import { formatNumber } from '@/lib/utils';
import { simulateVasopressor, simulateFluidBolus, simulateRenalPerfusion } from '@/lib/simulation-engine';
import { Droplets, AlertTriangle, Activity } from 'lucide-react';

export function RenalFunction() {
  const { patientState, updatePatientState, addIntervention } = useSimulationStore();
  const { renal, vitals } = patientState;

  const [targetMAP, setTargetMAP] = useState(vitals.meanArterialPressure);
  const [diureticDose, setDiureticDose] = useState(0);

  const handleOptimizeMAP = () => {
    const mapDelta = targetMAP - vitals.meanArterialPressure;
    let newVitals = { ...vitals };

    if (Math.abs(mapDelta) > 2) {
      if (mapDelta > 0) {
        // Need to increase MAP with vasopressor
        const dose = Math.min(Math.abs(mapDelta) / 20, 0.5); // Max 0.5 mcg/kg/min
        newVitals = simulateVasopressor(vitals, 'norepinephrine', dose);
      } else {
        // Decrease MAP by reducing vasopressor (simulate by adjusting)
        newVitals.meanArterialPressure = targetMAP;
        newVitals.systolicBP = targetMAP + 40;
        newVitals.diastolicBP = targetMAP - 20;
      }

      const newRenal = simulateRenalPerfusion(
        renal,
        newVitals.meanArterialPressure,
        newVitals.cardiacOutput
      );

      updatePatientState({ vitals: newVitals, renal: newRenal });
      addIntervention({
        id: `map-optimization-${Date.now()}`,
        type: 'Medication',
        description: `MAP optimized to ${formatNumber(targetMAP, 0)} mmHg`,
        timestamp: new Date(),
        parameters: { targetMAP, currentMAP: vitals.meanArterialPressure },
      });
    }
  };

  const handleFluidBolus = () => {
    const newVitals = simulateFluidBolus(vitals, 500, 'Crystalloid');
    const newRenal = simulateRenalPerfusion(
      renal,
      newVitals.meanArterialPressure,
      newVitals.cardiacOutput
    );

    updatePatientState({ vitals: newVitals, renal: newRenal });
    addIntervention({
      id: `fluid-bolus-${Date.now()}`,
      type: 'Fluid',
      description: '500 mL NS bolus for prerenal AKI',
      timestamp: new Date(),
      parameters: { volume: 500 },
    });
  };

  const handleDiureticDose = () => {
    if (diureticDose === 0) return;

    // Furosemide increases urine output but can worsen perfusion if overdone
    const urineIncrease = diureticDose * 2; // ~2 mL/hr per mg furosemide
    const newRenal = {
      ...renal,
      urineOutput: Math.min(renal.urineOutput + urineIncrease, 200),
      urineSodium: Math.min(renal.urineSodium + diureticDose / 2, 100),
    };

    // If given in volume overload, may slightly improve GFR; if prerenal, may worsen
    if (vitals.centralVenousPressure > 12) {
      newRenal.gfr = Math.min(renal.gfr + 5, 120);
    }

    updatePatientState({ renal: newRenal });
    addIntervention({
      id: `diuretic-${Date.now()}`,
      type: 'Medication',
      description: `Furosemide ${diureticDose} mg IV for diuresis`,
      timestamp: new Date(),
      parameters: { dose: diureticDose, medication: 'furosemide' },
    });
    setDiureticDose(0);
  };

  const getGFRStage = () => {
    if (renal.gfr >= 90) return { stage: 'Normal', severity: 'G1', color: 'text-green-500' };
    if (renal.gfr >= 60) return { stage: 'Mild CKD', severity: 'G2', color: 'text-yellow-500' };
    if (renal.gfr >= 45) return { stage: 'Moderate CKD', severity: 'G3a', color: 'text-orange-500' };
    if (renal.gfr >= 30) return { stage: 'Moderate CKD', severity: 'G3b', color: 'text-orange-600' };
    if (renal.gfr >= 15) return { stage: 'Severe CKD', severity: 'G4', color: 'text-red-500' };
    return { stage: 'Kidney Failure', severity: 'G5', color: 'text-red-700' };
  };

  const getAKIStage = () => {
    if (renal.creatinine >= 3.0 || renal.urineOutput < 20) {
      return { stage: 'AKI Stage 3', color: 'text-red-500' };
    }
    if (renal.creatinine >= 2.0 || renal.urineOutput < 30) {
      return { stage: 'AKI Stage 2', color: 'text-orange-500' };
    }
    if (renal.creatinine >= 1.5 || renal.urineOutput < 40) {
      return { stage: 'AKI Stage 1', color: 'text-yellow-500' };
    }
    return null;
  };

  const gfrStage = getGFRStage();
  const akiStage = getAKIStage();
  const isOliguric = renal.urineOutput < 30;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Renal Function Module</h1>
        <p className="text-muted-foreground">
          Study GFR, urine output, and renal perfusion in critical illness
        </p>
      </div>

      {/* Interactive Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Renal Perfusion Optimization
          </CardTitle>
          <CardDescription>
            Adjust MAP and manage fluid status to optimize renal function
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MAP Optimization */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2">Target MAP Optimization</p>
                <Slider
                  label="Target MAP"
                  unit="mmHg"
                  min={55}
                  max={100}
                  step={1}
                  value={targetMAP}
                  onChange={(e) => setTargetMAP(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Current: {formatNumber(vitals.meanArterialPressure, 0)} mmHg → Target:{' '}
                  {formatNumber(targetMAP, 0)} mmHg
                </p>
              </div>
              <Button onClick={handleOptimizeMAP} className="w-full">
                Optimize MAP (Vasopressor)
              </Button>
              {vitals.meanArterialPressure < 65 && (
                <p className="text-xs text-destructive">
                  ⚠ MAP {'<'} 65 mmHg impairs renal autoregulation
                </p>
              )}
            </div>

            {/* Fluid/Diuretic Management */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2">Fluid Bolus for Prerenal AKI</p>
                <Button
                  onClick={handleFluidBolus}
                  variant="outline"
                  className="w-full"
                  disabled={vitals.centralVenousPressure > 12}
                >
                  Give 500 mL NS Bolus
                </Button>
                {vitals.centralVenousPressure > 12 && (
                  <p className="text-xs text-destructive mt-1">CVP high - volume overloaded</p>
                )}
                {renal.fractionalExcretionNa < 1 && vitals.centralVenousPressure < 8 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    ✓ FENa {'<'} 1% suggests prerenal - may benefit from fluids
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">Diuretic Therapy</p>
                <Slider
                  label="Furosemide Dose"
                  unit="mg"
                  min={0}
                  max={80}
                  step={10}
                  value={diureticDose}
                  onChange={(e) => setDiureticDose(Number(e.target.value))}
                />
                <Button
                  onClick={handleDiureticDose}
                  variant="outline"
                  className="w-full mt-2"
                  disabled={diureticDose === 0}
                >
                  Administer Furosemide
                </Button>
                {vitals.centralVenousPressure > 12 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    ✓ CVP high - may benefit from diuresis
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Renal Parameters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              Current Renal Function
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Creatinine</span>
                <div className="text-right">
                  <span className="text-xl font-bold">{formatNumber(renal.creatinine, 1)} mg/dL</span>
                  <span className="ml-3 text-xs text-muted-foreground">(Normal: 0.7-1.2)</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">BUN</span>
                <div className="text-right">
                  <span className="text-xl font-bold">{formatNumber(renal.bun, 0)} mg/dL</span>
                  <span className="ml-3 text-xs text-muted-foreground">(Normal: 7-20)</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">eGFR</span>
                <div className="text-right">
                  <span className="text-xl font-bold">{formatNumber(renal.gfr, 0)} mL/min/1.73m²</span>
                  <span className={`ml-3 text-sm font-semibold ${gfrStage.color}`}>
                    {gfrStage.severity}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Urine Output</span>
                <div className="text-right">
                  <span className="text-xl font-bold">{formatNumber(renal.urineOutput, 0)} mL/hr</span>
                  {isOliguric && (
                    <span className="ml-3 text-sm font-semibold text-red-500">Oliguric</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Urine Sodium</span>
                <span className="text-xl font-bold">{formatNumber(renal.urineSodium, 0)} mEq/L</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">FENa</span>
                <span className="text-xl font-bold">{formatNumber(renal.fractionalExcretionNa, 1)}%</span>
              </div>
            </div>

            {akiStage && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="font-semibold text-sm">{akiStage.stage}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Acute Kidney Injury detected. Check MAP, assess fluid status, review nephrotoxic medications.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Perfusion Relationship */}
        <Card>
          <CardHeader>
            <CardTitle>Hemodynamic-Renal Relationship</CardTitle>
            <CardDescription>How perfusion affects kidney function</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-1">Current MAP</p>
                <p className="text-2xl font-bold">{formatNumber(vitals.meanArterialPressure, 0)} mmHg</p>
                {vitals.meanArterialPressure < 65 && (
                  <p className="text-xs text-destructive mt-1">
                    MAP {'<'} 65 mmHg may impair renal perfusion
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold mb-1">Cardiac Output</p>
                <p className="text-2xl font-bold">{formatNumber(vitals.cardiacOutput, 1)} L/min</p>
                {vitals.cardiacOutput < 4 && (
                  <p className="text-xs text-destructive mt-1">
                    Low CO reduces renal blood flow
                  </p>
                )}
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs font-semibold mb-2">Renal Perfusion Pressure</p>
                <p className="text-xs text-muted-foreground">
                  RPP ≈ MAP - CVP = {formatNumber(vitals.meanArterialPressure, 0)} -{' '}
                  {formatNumber(vitals.centralVenousPressure, 0)} ={' '}
                  <strong>{formatNumber(vitals.meanArterialPressure - vitals.centralVenousPressure, 0)} mmHg</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Kidneys autoregulate GFR between MAP 65-100 mmHg. Below this range, GFR decreases linearly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AKI Differential */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>AKI Classification & Workup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Prerenal AKI</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Due to decreased renal perfusion
              </p>
              <ul className="text-xs space-y-1">
                <li>• FENa {'<'} 1%</li>
                <li>• Urine Na {'<'} 20 mEq/L</li>
                <li>• BUN:Cr ratio {'>'} 20:1</li>
                <li>• Responds to fluids/pressors</li>
              </ul>
              {renal.fractionalExcretionNa < 1 && renal.urineSodium < 20 && (
                <p className="text-xs font-semibold text-primary mt-2">
                  ✓ Current pattern suggests prerenal
                </p>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Intrinsic AKI</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Kidney parenchymal damage
              </p>
              <ul className="text-xs space-y-1">
                <li>• FENa {'>'} 2%</li>
                <li>• Urine Na {'>'} 40 mEq/L</li>
                <li>• BUN:Cr ratio ~10-15:1</li>
                <li>• ATN, AIN, glomerular disease</li>
              </ul>
              {renal.fractionalExcretionNa > 2 && renal.urineSodium > 40 && (
                <p className="text-xs font-semibold text-primary mt-2">
                  ✓ Current pattern suggests intrinsic
                </p>
              )}
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Postrenal AKI</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Urinary tract obstruction
              </p>
              <ul className="text-xs space-y-1">
                <li>• Variable FENa</li>
                <li>• Hydronephrosis on imaging</li>
                <li>• Bladder scan if retention</li>
                <li>• Requires decompression</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle>Renal Function Concepts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold">Fractional Excretion of Sodium (FENa)</p>
            <p className="text-muted-foreground">
              FENa = (Urine Na × Plasma Cr) / (Plasma Na × Urine Cr) × 100
              <br />
              {'<'}1% suggests prerenal AKI (kidney conserving sodium due to hypoperfusion)
              <br />
              {'>'}2% suggests intrinsic AKI (tubular dysfunction)
            </p>
          </div>
          <div>
            <p className="font-semibold">Oliguria Definition</p>
            <p className="text-muted-foreground">
              Urine output {'<'}0.5 mL/kg/hr for 6+ hours, or {'<'}30 mL/hr in average adult.
              Sign of inadequate renal perfusion or intrinsic kidney dysfunction.
            </p>
          </div>
          <div>
            <p className="font-semibold">Renal Autoregulation</p>
            <p className="text-muted-foreground">
              Kidneys maintain constant GFR via afferent/efferent arteriole tone when MAP is 65-100 mmHg.
              Below 65 mmHg, GFR falls linearly. ACE inhibitors/ARBs impair autoregulation.
            </p>
          </div>
          <div>
            <p className="font-semibold">KDIGO AKI Staging</p>
            <p className="text-muted-foreground">
              Stage 1: Cr 1.5-1.9× baseline or UOP {'<'}0.5 mL/kg/hr for 6-12h
              <br />
              Stage 2: Cr 2.0-2.9× baseline or UOP {'<'}0.5 mL/kg/hr for ≥12h
              <br />
              Stage 3: Cr ≥3.0× baseline or UOP {'<'}0.3 mL/kg/hr for ≥24h or anuria for ≥12h
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
