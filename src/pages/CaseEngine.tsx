import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSimulationStore } from '@/store/useSimulationStore';
import { caseScenarios } from '@/data/case-scenarios';
import { formatNumber } from '@/lib/utils';
import { BookOpen, Play, RotateCcw, CheckCircle, Circle, Target } from 'lucide-react';

interface CaseGoal {
  id: string;
  description: string;
  completed: boolean;
  checkCriteria: (state: any) => boolean;
}

export function CaseEngine() {
  const { patientState, setPatientState, resetSimulation, interventions } = useSimulationStore();
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [caseGoals, setCaseGoals] = useState<CaseGoal[]>([]);

  const generateGoalsForCase = (caseId: string): CaseGoal[] => {
    switch (caseId) {
      case 'septic-shock':
        return [
          {
            id: 'map-target',
            description: 'Achieve MAP ≥ 65 mmHg',
            completed: false,
            checkCriteria: (state) => state.vitals.meanArterialPressure >= 65,
          },
          {
            id: 'lactate-clear',
            description: 'Reduce lactate to < 2 mmol/L',
            completed: false,
            checkCriteria: (state) => state.abg.lactate < 2,
          },
          {
            id: 'fluid-resus',
            description: 'Administer fluid resuscitation',
            completed: false,
            checkCriteria: () => interventions.some((i) => i.type === 'Fluid'),
          },
          {
            id: 'vasopressor',
            description: 'Start vasopressor if needed',
            completed: false,
            checkCriteria: () =>
              interventions.some((i) => i.type === 'Medication' && i.description.includes('epinephrine')),
          },
        ];
      case 'ards':
        return [
          {
            id: 'low-tv',
            description: 'Implement lung-protective ventilation (TV 6 mL/kg)',
            completed: false,
            checkCriteria: (state) => state.ventilator.tidalVolume <= 400,
          },
          {
            id: 'adequate-peep',
            description: 'Optimize PEEP (8-15 cmH₂O)',
            completed: false,
            checkCriteria: (state) => state.ventilator.peep >= 8 && state.ventilator.peep <= 15,
          },
          {
            id: 'improve-pao2',
            description: 'Improve oxygenation (PaO₂ > 60 mmHg)',
            completed: false,
            checkCriteria: (state) => state.abg.paO2 > 60,
          },
        ];
      case 'metabolic-acidosis':
        return [
          {
            id: 'identify-ag',
            description: 'Calculate anion gap',
            completed: false,
            checkCriteria: () => interventions.length > 0,
          },
          {
            id: 'winters-check',
            description: 'Apply Winter\'s formula to check compensation',
            completed: false,
            checkCriteria: (state) => state.abg.paCO2 < 40,
          },
          {
            id: 'normalize-ph',
            description: 'Address underlying cause and normalize pH',
            completed: false,
            checkCriteria: (state) => state.abg.pH >= 7.35,
          },
        ];
      case 'cardiogenic-shock':
        return [
          {
            id: 'increase-co',
            description: 'Improve cardiac output (CO > 4 L/min)',
            completed: false,
            checkCriteria: (state) => state.vitals.cardiacOutput > 4,
          },
          {
            id: 'inotrope',
            description: 'Start inotropic support',
            completed: false,
            checkCriteria: () =>
              interventions.some((i) => i.type === 'Medication' && i.description.includes('butamine')),
          },
          {
            id: 'manage-volume',
            description: 'Optimize volume status (avoid overload)',
            completed: false,
            checkCriteria: (state) => state.vitals.centralVenousPressure <= 12,
          },
        ];
      default:
        return [
          {
            id: 'assess',
            description: 'Assess patient parameters',
            completed: false,
            checkCriteria: () => true,
          },
          {
            id: 'intervene',
            description: 'Make at least one intervention',
            completed: false,
            checkCriteria: () => interventions.length > 0,
          },
        ];
    }
  };

  // Update goal completion status whenever patient state or interventions change
  useEffect(() => {
    if (selectedCase && caseGoals.length > 0) {
      const updatedGoals = caseGoals.map((goal) => ({
        ...goal,
        completed: goal.checkCriteria(patientState),
      }));
      setCaseGoals(updatedGoals);
    }
  }, [patientState, interventions, selectedCase]);

  const handleLoadCase = (caseId: string) => {
    const scenario = caseScenarios.find((c) => c.id === caseId);
    if (scenario) {
      setPatientState(scenario.initialState);
      setSelectedCase(caseId);
      setCaseGoals(generateGoalsForCase(caseId));
    }
  };

  const handleReset = () => {
    resetSimulation();
    setSelectedCase(null);
    setCaseGoals([]);
  };

  const currentCase = caseScenarios.find((c) => c.id === selectedCase);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-500/20 text-green-700 dark:text-green-300';
      case 'Intermediate':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
      case 'Advanced':
        return 'bg-red-500/20 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Case Engine</h1>
        <p className="text-muted-foreground">
          Practice with realistic ICU scenarios and apply integrated physiology knowledge
        </p>
      </div>

      {currentCase && (
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{currentCase.title}</CardTitle>
                <CardDescription className="mt-2">{currentCase.description}</CardDescription>
              </div>
              <Button onClick={handleReset} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2">Learning Objectives:</p>
                <ul className="text-sm space-y-1">
                  {currentCase.learningObjectives.map((obj, idx) => (
                    <li key={idx} className="text-muted-foreground">
                      • {obj}
                    </li>
                  ))}
                </ul>
              </div>

              {currentCase.hints && currentCase.hints.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Hints:</p>
                  <ul className="text-sm space-y-1">
                    {currentCase.hints.map((hint, idx) => (
                      <li key={idx} className="text-muted-foreground">
                        💡 {hint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm font-semibold mb-2">What to do:</p>
                <p className="text-sm text-muted-foreground">
                  The patient's initial state has been loaded. Navigate to different modules (Hemodynamics
                  Lab, Ventilation Lab, etc.) to assess the patient and make interventions. Return to the ICU
                  Matrix Dashboard to see how all systems interact.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentCase && caseGoals.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Case Goals & Progress
            </CardTitle>
            <CardDescription>
              Complete these objectives to master the case scenario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {caseGoals.map((goal) => (
                <div
                  key={goal.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    goal.completed
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-muted/50 border-border'
                  }`}
                >
                  {goal.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${goal.completed ? 'text-green-700 dark:text-green-300' : ''}`}>
                      {goal.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Summary */}
            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Overall Progress</span>
                <span className="text-sm font-bold">
                  {caseGoals.filter((g) => g.completed).length} / {caseGoals.length} Goals
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${(caseGoals.filter((g) => g.completed).length / caseGoals.length) * 100}%`,
                  }}
                />
              </div>
              {caseGoals.every((g) => g.completed) && (
                <p className="mt-3 text-sm text-green-600 dark:text-green-400 font-semibold">
                  ✓ Congratulations! All case objectives completed!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Patient Status Summary */}
      {currentCase && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Patient Status</CardTitle>
            <CardDescription>Real-time physiological parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">MAP</p>
                <p className="text-lg font-bold">
                  {formatNumber(patientState.vitals.meanArterialPressure, 0)} mmHg
                </p>
                <p className="text-xs text-muted-foreground">(Target: ≥65)</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Cardiac Output</p>
                <p className="text-lg font-bold">{formatNumber(patientState.vitals.cardiacOutput, 1)} L/min</p>
                <p className="text-xs text-muted-foreground">(Normal: 4-8)</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">pH</p>
                <p className="text-lg font-bold">{formatNumber(patientState.abg.pH, 2)}</p>
                <p className="text-xs text-muted-foreground">(Normal: 7.35-7.45)</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Lactate</p>
                <p className="text-lg font-bold">{formatNumber(patientState.abg.lactate, 1)} mmol/L</p>
                <p className="text-xs text-muted-foreground">(Normal: {'<'}2)</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">SpO₂</p>
                <p className="text-lg font-bold">{formatNumber(patientState.abg.sO2, 0)}%</p>
                <p className="text-xs text-muted-foreground">(Target: {'≥'}92)</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Tidal Volume</p>
                <p className="text-lg font-bold">{formatNumber(patientState.ventilator.tidalVolume, 0)} mL</p>
                <p className="text-xs text-muted-foreground">(ARDS: 6 mL/kg)</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">PEEP</p>
                <p className="text-lg font-bold">{formatNumber(patientState.ventilator.peep, 0)} cmH₂O</p>
                <p className="text-xs text-muted-foreground">(ARDS: 8-15)</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Interventions</p>
                <p className="text-lg font-bold">{interventions.length}</p>
                <p className="text-xs text-muted-foreground">Total made</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <h2 className="text-2xl font-semibold mb-4">Available Cases</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {caseScenarios.map((scenario) => (
          <Card
            key={scenario.id}
            className={
              selectedCase === scenario.id ? 'border-primary border-2' : 'hover:shadow-lg transition-shadow'
            }
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <BookOpen className="w-6 h-6 text-primary" />
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${getDifficultyColor(
                    scenario.difficulty
                  )}`}
                >
                  {scenario.difficulty}
                </span>
              </div>
              <CardTitle className="text-lg">{scenario.title}</CardTitle>
              <CardDescription className="line-clamp-2">{scenario.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold mb-1">Learning Objectives:</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {scenario.learningObjectives[0]}
                    {scenario.learningObjectives.length > 1 &&
                      ` and ${scenario.learningObjectives.length - 1} more...`}
                  </p>
                </div>

                <Button
                  onClick={() => handleLoadCase(scenario.id)}
                  className="w-full"
                  variant={selectedCase === scenario.id ? 'secondary' : 'default'}
                  disabled={selectedCase === scenario.id}
                >
                  {selectedCase === scenario.id ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Active Case
                    </>
                  ) : (
                    'Load Case'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!selectedCase && (
        <Card className="mt-6 bg-muted/50">
          <CardContent className="py-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Select a case above to begin practicing. Each case presents a realistic ICU scenario with
              specific learning objectives.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How to Use the Case Engine</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
              1
            </div>
            <div>
              <p className="font-semibold">Select a Case</p>
              <p className="text-muted-foreground">
                Choose a case that matches your learning level and area of interest.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
              2
            </div>
            <div>
              <p className="font-semibold">Assess the Patient</p>
              <p className="text-muted-foreground">
                Review all available data: vitals, ventilator settings, ABG, electrolytes, and renal
                function. Use the Matrix Dashboard for an integrated view.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
              3
            </div>
            <div>
              <p className="font-semibold">Make Interventions</p>
              <p className="text-muted-foreground">
                Navigate to specific modules (Hemodynamics Lab, Ventilation Lab, etc.) to make changes. See
                how your interventions affect the patient's physiology.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
              4
            </div>
            <div>
              <p className="font-semibold">Learn from Outcomes</p>
              <p className="text-muted-foreground">
                Observe how different systems interact. Review the hints and learning objectives to ensure
                you understand the key concepts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
