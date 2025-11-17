import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSimulationStore } from '@/store/useSimulationStore';
import { caseScenarios } from '@/data/case-scenarios';
import { BookOpen, Play, RotateCcw } from 'lucide-react';

export function CaseEngine() {
  const { setPatientState, resetSimulation } = useSimulationStore();
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  const handleLoadCase = (caseId: string) => {
    const scenario = caseScenarios.find((c) => c.id === caseId);
    if (scenario) {
      setPatientState(scenario.initialState);
      setSelectedCase(caseId);
    }
  };

  const handleReset = () => {
    resetSimulation();
    setSelectedCase(null);
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
