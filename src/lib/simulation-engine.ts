import type {
  PatientState,
  Vitals,
  VentilatorSettings,
  ABG,
  RenalParameters,
  ShockState,
  AcidBaseAnalysis,
  AcidBaseDisturbance,
} from '@/types';
import { clamp } from './utils';

/**
 * Core Simulation Engine for ICU Physiology
 * Implements integrated multi-system physiology calculations
 */

// Calculate Mean Arterial Pressure
export function calculateMAP(systolic: number, diastolic: number): number {
  return diastolic + (systolic - diastolic) / 3;
}

// Calculate Cardiac Output (simplified)
export function calculateCardiacOutput(
  heartRate: number,
  strokeVolume: number
): number {
  return (heartRate * strokeVolume) / 1000; // L/min
}

// Calculate Systemic Vascular Resistance
export function calculateSVR(
  map: number,
  cvp: number,
  cardiacOutput: number
): number {
  if (cardiacOutput === 0) return 0;
  return ((map - cvp) * 80) / cardiacOutput; // dynes·sec/cm⁵
}

// Calculate Anion Gap
export function calculateAnionGap(
  sodium: number,
  chloride: number,
  bicarbonate: number
): number {
  return sodium - (chloride + bicarbonate);
}

// Calculate PaO2/FiO2 ratio
export function calculatePF_Ratio(paO2: number, fiO2: number): number {
  if (fiO2 === 0) return 0;
  return paO2 / fiO2;
}

// Determine Acid-Base Disturbance
export function analyzeAcidBase(abg: ABG): AcidBaseAnalysis {
  const { pH, paCO2, hco3 } = abg;

  let primary: AcidBaseDisturbance = 'Normal';
  let compensation: 'None' | 'Partial' | 'Complete' = 'None';

  // Determine primary disturbance
  if (pH < 7.35) {
    // Acidosis
    if (paCO2 > 45) {
      primary = 'Respiratory Acidosis';
      // Expected compensation: HCO3 increases by 1 for every 10 mmHg increase in CO2 (acute)
      // or by 4 for every 10 mmHg increase (chronic)
      const expectedHCO3 = 24 + ((paCO2 - 40) / 10) * 1; // Acute compensation
      if (hco3 > 24) {
        compensation = hco3 >= expectedHCO3 ? 'Complete' : 'Partial';
      }
    } else if (hco3 < 22) {
      primary = 'Metabolic Acidosis';
      // Expected compensation: CO2 decreases by 1.2 for every 1 mEq/L decrease in HCO3
      const expectedCO2 = 40 - 1.2 * (24 - hco3);
      if (paCO2 < 40) {
        compensation = paCO2 <= expectedCO2 + 2 ? 'Complete' : 'Partial';
      }
    }
  } else if (pH > 7.45) {
    // Alkalosis
    if (paCO2 < 35) {
      primary = 'Respiratory Alkalosis';
      // Expected compensation: HCO3 decreases by 2 for every 10 mmHg decrease in CO2 (acute)
      const expectedHCO3 = 24 - ((40 - paCO2) / 10) * 2;
      if (hco3 < 24) {
        compensation = hco3 <= expectedHCO3 ? 'Complete' : 'Partial';
      }
    } else if (hco3 > 26) {
      primary = 'Metabolic Alkalosis';
      // Expected compensation: CO2 increases by 0.7 for every 1 mEq/L increase in HCO3
      const expectedCO2 = 40 + 0.7 * (hco3 - 24);
      if (paCO2 > 40) {
        compensation = paCO2 >= expectedCO2 - 2 ? 'Complete' : 'Partial';
      }
    }
  }

  // Check for mixed disorders
  if (
    (pH < 7.35 && paCO2 > 45 && hco3 < 22) ||
    (pH > 7.45 && paCO2 < 35 && hco3 > 26)
  ) {
    primary = 'Mixed Disorder';
  }

  const anionGap = calculateAnionGap(0, 0, hco3); // Simplified
  let anionGapStatus: 'Normal' | 'High' | 'Low' = 'Normal';
  if (anionGap > 12) anionGapStatus = 'High';
  else if (anionGap < 8) anionGapStatus = 'Low';

  return {
    primary,
    compensation,
    anionGap: anionGapStatus,
  };
}

// Simulate Ventilator Changes on Gas Exchange
export function simulateVentilatorChange(
  currentABG: ABG,
  currentVent: VentilatorSettings,
  newVent: VentilatorSettings
): ABG {
  const newABG = { ...currentABG };

  // CO2 changes with minute ventilation (RR × TV)
  const currentMinuteVent = currentVent.respiratoryRate * currentVent.tidalVolume;
  const newMinuteVent = newVent.respiratoryRate * newVent.tidalVolume;

  if (newMinuteVent !== currentMinuteVent) {
    const ventRatio = currentMinuteVent / newMinuteVent;
    newABG.paCO2 = clamp(currentABG.paCO2 * ventRatio, 20, 80);

    // pH changes with CO2 (Henderson-Hasselbalch simplified)
    const deltaCO2 = newABG.paCO2 - currentABG.paCO2;
    newABG.pH = clamp(currentABG.pH - (deltaCO2 * 0.008), 7.0, 7.6);
  }

  // PaO2 changes with FiO2 and PEEP
  const fiO2Change = (newVent.fiO2 - currentVent.fiO2) * 500;
  const peepChange = (newVent.peep - currentVent.peep) * 10;
  newABG.paO2 = clamp(currentABG.paO2 + fiO2Change + peepChange, 40, 600);

  // Update sO2 based on PaO2 (simplified oxyhemoglobin dissociation curve)
  if (newABG.paO2 < 60) {
    newABG.sO2 = 75 + (newABG.paO2 - 40) * 0.75;
  } else {
    newABG.sO2 = Math.min(97 + (newABG.paO2 - 60) * 0.01, 100);
  }

  return newABG;
}

// Simulate Fluid Administration on Hemodynamics
export function simulateFluidBolus(
  currentVitals: Vitals,
  volume: number, // mL
  _fluidType: 'Crystalloid' | 'Colloid'
): Vitals {
  const newVitals = { ...currentVitals };

  // Fluid responsiveness depends on position on Frank-Starling curve
  // Simplified: assume moderate response
  const volumeLiters = volume / 1000;

  // Increase in stroke volume (simplified)
  const currentStrokeVolume = (currentVitals.cardiacOutput * 1000) / currentVitals.heartRate;
  const strokeVolumeIncrease = volumeLiters * 5; // mL per liter of fluid
  const newStrokeVolume = currentStrokeVolume + strokeVolumeIncrease;

  // Update cardiac output
  newVitals.cardiacOutput = (currentVitals.heartRate * newStrokeVolume) / 1000;

  // MAP increases with improved cardiac output
  const mapIncrease = strokeVolumeIncrease * 0.5;
  newVitals.meanArterialPressure = clamp(
    currentVitals.meanArterialPressure + mapIncrease,
    50,
    130
  );

  // Update BP components
  newVitals.systolicBP = clamp(
    newVitals.meanArterialPressure + 40,
    70,
    200
  );
  newVitals.diastolicBP = clamp(
    newVitals.meanArterialPressure - 20,
    40,
    120
  );

  // CVP increases with volume
  newVitals.centralVenousPressure = clamp(
    currentVitals.centralVenousPressure + volumeLiters * 2,
    0,
    20
  );

  // Recalculate SVR
  newVitals.systemicVascularResistance = calculateSVR(
    newVitals.meanArterialPressure,
    newVitals.centralVenousPressure,
    newVitals.cardiacOutput
  );

  return newVitals;
}

// Simulate Vasopressor Effect
export function simulateVasopressor(
  currentVitals: Vitals,
  medication: string,
  dose: number // mcg/kg/min
): Vitals {
  const newVitals = { ...currentVitals };

  switch (medication.toLowerCase()) {
    case 'norepinephrine':
    case 'noradrenaline':
      // Increases SVR and MAP, minimal effect on HR
      newVitals.systemicVascularResistance = clamp(
        currentVitals.systemicVascularResistance + dose * 100,
        800,
        2000
      );
      newVitals.meanArterialPressure = clamp(
        currentVitals.meanArterialPressure + dose * 5,
        50,
        130
      );
      break;

    case 'vasopressin':
      // Pure vasoconstriction
      newVitals.systemicVascularResistance = clamp(
        currentVitals.systemicVascularResistance + dose * 200,
        800,
        2000
      );
      newVitals.meanArterialPressure = clamp(
        currentVitals.meanArterialPressure + dose * 8,
        50,
        130
      );
      break;

    case 'epinephrine':
      // Increases HR, contractility, and SVR
      newVitals.heartRate = clamp(currentVitals.heartRate + dose * 10, 40, 160);
      newVitals.systemicVascularResistance = clamp(
        currentVitals.systemicVascularResistance + dose * 80,
        800,
        2000
      );
      newVitals.cardiacOutput = clamp(
        currentVitals.cardiacOutput + dose * 0.5,
        2,
        12
      );
      break;

    case 'dobutamine':
      // Increases contractility, decreases SVR slightly
      newVitals.cardiacOutput = clamp(
        currentVitals.cardiacOutput + dose * 0.3,
        2,
        12
      );
      newVitals.systemicVascularResistance = clamp(
        currentVitals.systemicVascularResistance - dose * 20,
        800,
        2000
      );
      break;
  }

  // Recalculate dependent values
  newVitals.systolicBP = newVitals.meanArterialPressure + 40;
  newVitals.diastolicBP = newVitals.meanArterialPressure - 20;

  return newVitals;
}

// Simulate PEEP Effect on Hemodynamics
export function simulatePEEPEffect(
  currentVitals: Vitals,
  currentPEEP: number,
  newPEEP: number
): Vitals {
  const newVitals = { ...currentVitals };
  const peepChange = newPEEP - currentPEEP;

  // Increased PEEP increases intrathoracic pressure, reducing venous return
  // This decreases preload and can decrease cardiac output
  if (peepChange > 0) {
    // Decrease in cardiac output due to reduced preload
    newVitals.cardiacOutput = clamp(
      currentVitals.cardiacOutput - peepChange * 0.15,
      2,
      12
    );

    // MAP may decrease
    newVitals.meanArterialPressure = clamp(
      currentVitals.meanArterialPressure - peepChange * 2,
      50,
      130
    );

    // CVP increases (higher intrathoracic pressure)
    newVitals.centralVenousPressure = clamp(
      currentVitals.centralVenousPressure + peepChange * 0.5,
      0,
      20
    );
  } else if (peepChange < 0) {
    // Opposite effects
    newVitals.cardiacOutput = clamp(
      currentVitals.cardiacOutput + Math.abs(peepChange) * 0.15,
      2,
      12
    );
    newVitals.meanArterialPressure = clamp(
      currentVitals.meanArterialPressure + Math.abs(peepChange) * 2,
      50,
      130
    );
    newVitals.centralVenousPressure = clamp(
      currentVitals.centralVenousPressure - Math.abs(peepChange) * 0.5,
      0,
      20
    );
  }

  newVitals.systolicBP = newVitals.meanArterialPressure + 40;
  newVitals.diastolicBP = newVitals.meanArterialPressure - 20;

  return newVitals;
}

// Simulate Renal Perfusion Changes
export function simulateRenalPerfusion(
  currentRenal: RenalParameters,
  map: number,
  cardiacOutput: number
): RenalParameters {
  const newRenal = { ...currentRenal };

  // GFR depends on renal perfusion pressure (MAP - venous pressure)
  // Simplified: optimal MAP 65-100
  let gfrMultiplier = 1;
  if (map < 65) {
    gfrMultiplier = map / 65; // Decreased GFR
  } else if (map > 100) {
    gfrMultiplier = 1; // Autoregulation maintains GFR
  }

  // Cardiac output also affects renal perfusion
  if (cardiacOutput < 4) {
    gfrMultiplier *= cardiacOutput / 4;
  }

  newRenal.gfr = clamp(currentRenal.gfr * gfrMultiplier, 10, 120);

  // Urine output correlates with GFR
  newRenal.urineOutput = clamp(newRenal.gfr * 0.8, 10, 200);

  // Creatinine inversely related to GFR
  newRenal.creatinine = clamp(100 / newRenal.gfr, 0.5, 8);

  return newRenal;
}

// Determine Shock State
export function assessShockState(
  vitals: Vitals,
  lactate: number,
  _clinicalContext?: string
): ShockState {
  const markers: string[] = [];
  let type: ShockState['type'] = 'None';
  let severity: ShockState['severity'] = 'Mild';

  // Check for shock markers
  if (vitals.meanArterialPressure < 65) markers.push('Hypotension');
  if (lactate > 2) markers.push('Elevated lactate');
  if (vitals.cardiacOutput < 4) markers.push('Low cardiac output');

  // Classify shock type based on hemodynamic profile
  if (markers.length > 0) {
    if (vitals.cardiacOutput < 4 && vitals.systemicVascularResistance > 1200) {
      type = 'Cardiogenic';
    } else if (
      vitals.cardiacOutput < 4 &&
      vitals.centralVenousPressure < 8 &&
      vitals.systemicVascularResistance > 1200
    ) {
      type = 'Hypovolemic';
    } else if (
      vitals.cardiacOutput > 6 &&
      vitals.systemicVascularResistance < 800
    ) {
      type = 'Distributive (Septic)';
    } else if (
      vitals.centralVenousPressure > 15 &&
      vitals.cardiacOutput < 4
    ) {
      type = 'Obstructive';
    }

    // Determine severity
    if (lactate > 4 || vitals.meanArterialPressure < 55) {
      severity = 'Severe';
    } else if (lactate > 2.5 || vitals.meanArterialPressure < 60) {
      severity = 'Moderate';
    }
  }

  return {
    type,
    severity,
    lactate,
    markers,
  };
}

// Create Initial Normal Patient State
export function createNormalPatientState(): PatientState {
  return {
    id: 'normal-baseline',
    timestamp: new Date(),
    vitals: {
      heartRate: 75,
      systolicBP: 120,
      diastolicBP: 80,
      meanArterialPressure: 93,
      centralVenousPressure: 8,
      pulmonaryArteryPressure: 25,
      cardiacOutput: 5.0,
      systemicVascularResistance: 1000,
      temperature: 37.0,
      respiratoryRate: 16,
      oxygenSaturation: 98,
    },
    ventilator: {
      mode: 'Volume Control (AC)',
      tidalVolume: 500,
      respiratoryRate: 16,
      fiO2: 0.4,
      peep: 5,
      inspiratoryPressure: 20,
      iERatio: '1:2',
      plateauPressure: 20,
      peakPressure: 25,
    },
    abg: {
      pH: 7.40,
      paCO2: 40,
      paO2: 95,
      hco3: 24,
      baseExcess: 0,
      lactate: 1.2,
      sO2: 98,
    },
    electrolytes: {
      sodium: 140,
      potassium: 4.0,
      chloride: 104,
      bicarbonate: 24,
      calcium: 9.0,
      magnesium: 2.0,
      phosphate: 3.5,
      anionGap: 12,
    },
    renal: {
      creatinine: 1.0,
      bun: 15,
      gfr: 90,
      urineOutput: 60,
      urineSpecificGravity: 1.010,
      urineSodium: 40,
      fractionalExcretionNa: 1.0,
    },
    shock: {
      type: 'None',
      severity: 'Mild',
      lactate: 1.2,
      markers: [],
    },
    fluids: [],
    medications: [],
  };
}
